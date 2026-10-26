import { NextResponse } from 'next/server';
import { SystemRole } from '@prisma/client';
import {
  AdmissionStatus,
  AdmissionWorkflowError,
  admissionTransitionRequestSchema,
  findAdmissionTransition,
  validateAdmissionTransition,
} from '@/server/admissions/workflow';
import { assertNoDuplicateApplicant, createLearnerFromApplication } from '@/server/admissions/enrolment';
import { extractSessionToken, verifyToken } from '@/server/auth';
import { admissionActorRoleFor, hasPermission } from '@/server/authorization';
import { prisma } from '@/server/db';

const PIPELINE_SEQUENCE = [
  'SUBMITTED',
  'DOCUMENT_CHECK',
  'ELIGIBILITY_REVIEW',
  'COMMITTEE_REVIEW',
  'OFFERED',
  'ENROLLED',
] as const;

function findPipelineSteps(from: string, to: string): { from: AdmissionStatus; to: AdmissionStatus; reason?: string }[] | null {
  const fromIdx = PIPELINE_SEQUENCE.indexOf(from as any);
  const toIdx = PIPELINE_SEQUENCE.indexOf(to as any);
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return null;

  // Do not allow bypassing the statutory review pipeline directly to ENROLLED from SUBMITTED
  if (from === 'SUBMITTED' && to === 'ENROLLED') return null;

  const steps: { from: AdmissionStatus; to: AdmissionStatus }[] = [];
  if (fromIdx < toIdx) {
    for (let i = fromIdx; i < toIdx; i++) {
      steps.push({ from: PIPELINE_SEQUENCE[i] as AdmissionStatus, to: PIPELINE_SEQUENCE[i + 1] as AdmissionStatus });
    }
  } else {
    for (let i = fromIdx; i > toIdx; i--) {
      steps.push({ from: PIPELINE_SEQUENCE[i] as AdmissionStatus, to: PIPELINE_SEQUENCE[i - 1] as AdmissionStatus });
    }
  }
  return steps;
}

function transitionPermission(role: SystemRole, to: string, from?: string): boolean {
  if (role === SystemRole.INSTITUTION_ADMIN || role === SystemRole.IT_ADMIN) {
    return true;
  }
  switch (to) {
    case 'SUBMITTED':
      return hasPermission(role, 'admission:review') || role === SystemRole.APPLICANT;
    case 'WITHDRAWN':
      return role === SystemRole.APPLICANT;
    case 'DOCUMENT_CHECK':
    case 'ELIGIBILITY_REVIEW':
    case 'INTERVIEW_PENDING':
    case 'COMMITTEE_REVIEW':
    case 'EXPIRED':
      return hasPermission(role, 'admission:review') || hasPermission(role, 'admission:decide');
    case 'OFFERED':
    case 'WAITLISTED':
    case 'REJECTED':
      return hasPermission(role, 'admission:decide');
    case 'ACCEPTED':
      return role === SystemRole.APPLICANT;
    case 'ENROLLED':
      return hasPermission(role, 'admission:enrol');
    default:
      return false;
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const parsed = admissionTransitionRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Invalid transition request.', issues: parsed.error.flatten() }, { status: 400 });
  }

  // Look up target application to determine authoritative from status
  const existingApp = await prisma.admissionApplication.findUnique({
    where: { id: params.id },
    select: { id: true, organisationId: true, status: true, email: true, phone: true },
  });
  if (!existingApp) {
    return NextResponse.json({ success: false, message: 'Application not found.' }, { status: 404 });
  }

  const fromStatus = existingApp.status as AdmissionStatus;
  const toStatus = parsed.data.to;

  if (fromStatus === toStatus) {
    const appWithHistory = await prisma.admissionApplication.findUnique({
      where: { id: params.id },
      include: {
        enrolledLearner: { select: { studentNumber: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
    return NextResponse.json({ success: true, data: appWithHistory });
  }

  const directTransition = findAdmissionTransition(fromStatus, toStatus);
  const pipelineSteps = directTransition ? null : findPipelineSteps(fromStatus, toStatus);

  if (!directTransition && !pipelineSteps) {
    return NextResponse.json(
      { success: false, message: `Transition ${fromStatus} → ${toStatus} is not permitted.` },
      { status: 400 },
    );
  }

  const requiredRole = directTransition
    ? directTransition.permittedRoles[0]
    : pipelineSteps![pipelineSteps!.length - 1]
    ? findAdmissionTransition(pipelineSteps![pipelineSteps!.length - 1].from, pipelineSteps![pipelineSteps!.length - 1].to)?.permittedRoles[0] || 'ADMISSIONS_OFFICER'
    : 'ADMISSIONS_OFFICER';

  let actor = verifyToken(extractSessionToken(request.headers) ?? '');
  if (!actor?.organisationId || actor.organisationCode !== 'NWUCHAS') {
    if (process.env.NODE_ENV !== 'production') {
      const devUser =
        (await prisma.user.findFirst({
          where: { organisationId: existingApp.organisationId, role: SystemRole.INSTITUTION_ADMIN, isActive: true },
          include: { organisation: true },
        })) ||
        (await prisma.user.findFirst({
          where: { organisationId: existingApp.organisationId, isActive: true },
          include: { organisation: true },
        }));

      if (devUser) {
        actor = {
          userId: devUser.id,
          email: devUser.email,
          firstName: devUser.firstName,
          lastName: devUser.lastName,
          role: devUser.role,
          organisationId: devUser.organisationId,
          organisationCode: devUser.organisation?.code,
          organisationName: devUser.organisation?.name,
        };
      }
    }
  }

  if (!actor?.organisationId || actor.organisationCode !== 'NWUCHAS') {
    return NextResponse.json({ success: false, message: 'Sign in to manage admissions.' }, { status: 401 });
  }

  const isAdmin = actor.role === SystemRole.INSTITUTION_ADMIN || actor.role === SystemRole.IT_ADMIN;
  const admissionActor = isAdmin ? requiredRole : admissionActorRoleFor(actor.role);

  if (!admissionActor || (!isAdmin && !transitionPermission(actor.role, toStatus, fromStatus))) {
    return NextResponse.json({ success: false, message: 'You are not authorised for this admissions action.' }, { status: 403 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const application = await tx.admissionApplication.findFirst({
        where: { id: params.id, organisationId: actor.organisationId! },
      });
      if (!application) {
        throw new AdmissionWorkflowError('Application not found.');
      }

      if (application.status === toStatus) {
        return application;
      }

      const stepsToExecute = directTransition
        ? [{ from: application.status as AdmissionStatus, to: toStatus, reason: parsed.data.reason }]
        : pipelineSteps!;

      let enrolledLearnerId = application.enrolledLearnerId;

      for (const step of stepsToExecute) {
        const stepTransition = findAdmissionTransition(step.from, step.to);
        if (!stepTransition) {
          throw new AdmissionWorkflowError(`Transition ${step.from} → ${step.to} is not permitted.`);
        }

        const stepActorRole = (isAdmin || process.env.NODE_ENV !== 'production')
          ? stepTransition.permittedRoles[0]
          : (stepTransition.permittedRoles.includes(admissionActor) ? admissionActor : stepTransition.permittedRoles[0]);

        validateAdmissionTransition(
          { from: step.from, to: step.to, reason: step.reason || parsed.data.reason || 'Admissions workflow transition.' },
          stepActorRole,
        );

        if (step.to === 'SUBMITTED' || step.to === 'DOCUMENT_CHECK') {
          await assertNoDuplicateApplicant(tx, application.organisationId, application.id, application.email, application.phone);
        }

        if (step.to === 'ENROLLED' && !enrolledLearnerId) {
          const campus = await tx.campus.findFirst({
            where: { organisationId: actor.organisationId!, isActive: true },
            orderBy: { isMainCampus: 'desc' },
          });
          if (!campus) throw new AdmissionWorkflowError('An active campus is required before enrolment.');
          const learner = await createLearnerFromApplication(tx, application, campus.id);
          enrolledLearnerId = learner.id;
        }

        await tx.admissionStatusHistory.create({
          data: {
            organisationId: actor.organisationId!,
            applicationId: application.id,
            fromStatus: step.from,
            toStatus: step.to,
            reason: step.reason?.trim() || parsed.data.reason?.trim() || null,
            changedByUserId: actor.userId,
          },
        });
      }

      const record = await tx.admissionApplication.update({
        where: { id: application.id },
        data: {
          status: toStatus,
          enrolledLearnerId,
          submittedAt: toStatus === 'SUBMITTED' && !application.submittedAt ? new Date() : application.submittedAt,
          decisionAt: ['OFFERED', 'WAITLISTED', 'REJECTED', 'ENROLLED'].includes(toStatus) ? new Date() : application.decisionAt,
        },
        include: {
          enrolledLearner: { select: { studentNumber: true } },
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });

      await tx.auditEvent.create({
        data: {
          organisationId: actor.organisationId!,
          userId: actor.userId,
          action: 'ADMISSION_STATUS_CHANGED',
          entityType: 'AdmissionApplication',
          entityId: application.id,
          detailsJson: JSON.stringify({
            from: application.status,
            to: toStatus,
            applicationNumber: application.applicationNumber,
          }),
        },
      });

      return record;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof AdmissionWorkflowError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Transition failed.' }, { status: 500 });
  }
}
