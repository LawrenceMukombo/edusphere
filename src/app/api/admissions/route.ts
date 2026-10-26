import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AdmissionWorkflowError } from '@/server/admissions/workflow';
import { assertNoDuplicateApplicant } from '@/server/admissions/enrolment';
import { extractSessionToken, verifyToken, hashPassword } from '@/server/auth';
import { prisma } from '@/server/db';
import { generateApplicationNumber, generateInvoiceNumber, generateReceiptNumber } from '@/server/services/sequence.service';

const applicationSchema = z.object({
  firstName: z.string().trim().min(2),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().trim().max(32).optional(),
  programmeChoice: z.string().trim().min(2),
  intakeLabel: z.string().trim().min(2),
  dateOfBirth: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  nrc: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  school: z.string().trim().optional(),
  examNumber: z.string().trim().optional(),
  sponsor: z.string().trim().optional(),
  residentialAddress: z.string().trim().optional(),
  passportPhotoUrl: z.string().optional(),
  nextOfKin: z.object({
    fullName: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  payment: z.object({
    method: z.string().optional(),
    mobileNumber: z.string().optional(),
    reference: z.string().optional(),
    amount: z.number().optional(),
    status: z.string().optional(),
  }).optional(),
  subjects: z.array(z.object({
    name: z.string(),
    grade: z.string().or(z.number()),
  })).optional(),
  documents: z.array(z.object({
    name: z.string(),
    category: z.string(),
    size: z.string().or(z.number()),
    type: z.string(),
    dataUrl: z.string().optional(),
  })).optional(),
});

function session(request: Request) {
  const token = extractSessionToken(request.headers);
  return token ? verifyToken(token) : null;
}

export async function GET(request: Request) {
  const actor = session(request);
  if (!actor?.organisationId || actor.organisationCode !== 'NWUCHAS') {
    return NextResponse.json({ success: false, message: 'Sign in to access admissions records.' }, { status: 401 });
  }
  const data = await (prisma as any).admissionApplication.findMany({
    where: { organisationId: actor.organisationId },
    orderBy: { createdAt: 'desc' },
    include: {
      enrolledLearner: { select: { studentNumber: true } },
      statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const actor = session(request);
  const p = prisma as any;

  // Resolve NWUCHAS organisation
  let organisationId = actor?.organisationId;
  if (!organisationId) {
    const org = await p.organisation.findFirst({ where: { code: 'NWUCHAS' } });
    organisationId = org?.id;
  }

  if (!organisationId) {
    return NextResponse.json({ success: false, message: 'NWUCHAS admissions service unavailable.' }, { status: 503 });
  }

  // Cross-tenant protection
  if (actor && actor.organisationCode !== 'NWUCHAS') {
    return NextResponse.json({ success: false, message: 'Unauthorised cross-institutional action.' }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON request payload.' }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({
      success: false,
      message: 'Please complete all required applicant details.',
      issues: parsed.error.flatten(),
    }, { status: 400 });
  }

  const isStaffSubmission = actor && ['INSTITUTION_ADMIN', 'ADMISSIONS_OFFICER', 'REGISTRAR'].includes(actor.role);

  try {
    const application = await p.$transaction(async (tx: any) => {
      const year = new Date().getFullYear();
      const number = generateApplicationNumber(year);
      const draftId = `pending-${Date.now()}`;

      await assertNoDuplicateApplicant(
        tx,
        organisationId,
        draftId,
        parsed.data.email || null,
        parsed.data.phone || null,
      );

      const dateOfBirth = parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : undefined;
      const created = await tx.admissionApplication.create({
        data: {
          organisationId,
          applicationNumber: number,
          firstName: parsed.data.firstName,
          middleName: parsed.data.middleName || null,
          lastName: parsed.data.lastName,
          email: parsed.data.email || null,
          phone: parsed.data.phone || null,
          programmeChoice: parsed.data.programmeChoice,
          intakeLabel: parsed.data.intakeLabel,
          dateOfBirth,
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      });

      // Automatically provision or link an APPLICANT user account in the system
      let applicantUserId: string | null = null;
      let accountProvisioned = false;
      const candidateEmail = parsed.data.email ? parsed.data.email.toLowerCase().trim() : null;

      if (candidateEmail) {
        const existingUser = await tx.user.findUnique({
          where: { email: candidateEmail },
        });

        if (existingUser) {
          applicantUserId = existingUser.id;
        } else {
          const defaultPassword = 'NWUCHAS-DEV-ONLY-CHANGE-ME';
          const passwordHash = await hashPassword(defaultPassword);
          const newUser = await tx.user.create({
            data: {
              organisationId,
              email: candidateEmail,
              firstName: parsed.data.firstName,
              lastName: parsed.data.lastName,
              phone: parsed.data.phone || null,
              role: 'APPLICANT',
              passwordHash,
              isActive: true,
            },
          });
          applicantUserId = newUser.id;
          accountProvisioned = true;
        }
      }

      // Metadata with next-of-kin, payment, documents, and O-levels
      const metadataJson = JSON.stringify({
        nrc: parsed.data.nrc,
        gender: parsed.data.gender,
        school: parsed.data.school,
        examNumber: parsed.data.examNumber,
        sponsor: parsed.data.sponsor,
        residentialAddress: parsed.data.residentialAddress,
        passportPhotoUrl: parsed.data.passportPhotoUrl,
        nextOfKin: parsed.data.nextOfKin || null,
        payment: parsed.data.payment || null,
        subjects: parsed.data.subjects || [],
        documents: parsed.data.documents || [],
        applicantUserId,
        accountProvisioned,
        source: isStaffSubmission ? 'STAFF_REGISTRATION' : 'ONLINE_CANDIDATE_PORTAL',
        submittedAtIso: new Date().toISOString(),
        notificationTriggered: true,
      });

      const adminUser = await tx.user.findFirst({
        where: { organisationId, role: 'ADMISSIONS_OFFICER' },
        select: { id: true },
      });

      await tx.admissionStatusHistory.create({
        data: {
          organisationId,
          applicationId: created.id,
          toStatus: 'SUBMITTED',
          changedByUserId: actor?.userId || adminUser?.id || applicantUserId || null,
          reason: isStaffSubmission
            ? `Assisted registration by ${actor?.role}. NRC: ${parsed.data.nrc || 'N/A'}. School: ${parsed.data.school || 'N/A'}.`
            : `Online prospective student application received via NWUCHAS portal. NRC: ${parsed.data.nrc || 'N/A'}. Intake: ${parsed.data.intakeLabel}. Notification queued for screening committee.`,
          metadataJson,
        },
      });

      await tx.auditEvent.create({
        data: {
          organisationId,
          userId: actor?.userId || adminUser?.id || applicantUserId || null,
          action: isStaffSubmission ? 'STAFF_REGISTERED_APPLICANT' : 'ONLINE_CANDIDATE_APPLIED',
          entityType: 'AdmissionApplication',
          entityId: created.id,
          detailsJson: JSON.stringify({
            applicationNumber: number,
            candidate: `${parsed.data.firstName} ${parsed.data.lastName}`,
            programme: parsed.data.programmeChoice,
            intake: parsed.data.intakeLabel,
            accountCreated: accountProvisioned,
            source: isStaffSubmission ? 'STAFF_REGISTRATION' : 'ONLINE_CANDIDATE_PORTAL',
            paymentMethod: parsed.data.payment?.method || 'PENDING',
          }),
        },
      });

      return {
        ...created,
        accountProvisioned,
        paymentStatus: parsed.data.payment?.status || 'PENDING',
      };
    }, {
      maxWait: 15000,
      timeout: 25000,
    });

    return NextResponse.json({
      success: true,
      data: application,
      message: `Application ${application.applicationNumber} received. Notification dispatched to Admissions screening team.`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Admissions Submission Error]', error);
    if (error instanceof AdmissionWorkflowError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }
    return NextResponse.json({
      success: false,
      message: error?.message || 'Application processing failed. Please try again.',
    }, { status: 500 });
  }
}

export async function PATCH() {
  return NextResponse.json({ success: false, message: 'Use POST /api/admissions/{id}/transition for workflow changes.' }, { status: 405 });
}
