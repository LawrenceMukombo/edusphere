import { NextRequest, NextResponse } from 'next/server';
import { extractSessionToken, verifyToken } from '@/server/auth';
import { ClinicalService } from '@/server/clinical/clinical.service';
import { prisma } from '@/server/db';

export async function GET(req: NextRequest) {
  const token = extractSessionToken(req.headers);
  const session = token ? verifyToken(token) : null;
  let orgId = session?.organisationId;
  if (!orgId) {
    const org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
    orgId = org?.id;
  }
  if (!orgId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'sites';
  const learnerId = searchParams.get('learnerId');
  const clinicalSiteId = searchParams.get('clinicalSiteId');
  const status = searchParams.get('status');

  try {
    if (type === 'sites') {
      const sites = await ClinicalService.listSites(orgId);
      return NextResponse.json({ success: true, data: sites });
    }

    if (type === 'supervisors') {
      const supervisors = await ClinicalService.listSupervisors(
        orgId,
        clinicalSiteId || undefined
      );
      return NextResponse.json({ success: true, data: supervisors });
    }

    if (type === 'placements') {
      const placements = await ClinicalService.listPlacements(orgId, {
        learnerId: learnerId || undefined,
        clinicalSiteId: clinicalSiteId || undefined,
        status: (status as any) || undefined,
      });
      return NextResponse.json({ success: true, data: placements });
    }

    if (type === 'logbooks') {
      const entries = await (prisma as any).clinicalLogbookEntry.findMany({
        where: {
          ...(learnerId ? { learnerId } : {}),
        },
        include: {
          learner: { select: { id: true, studentNumber: true, firstName: true, lastName: true } },
          placement: { include: { clinicalSite: true } },
          supervisor: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return NextResponse.json({ success: true, data: entries });
    }

    if (type === 'readiness' && learnerId) {
      const readiness = await ClinicalService.getClinicalReadiness(learnerId);
      return NextResponse.json({ success: true, data: readiness });
    }

    return NextResponse.json({ success: false, message: 'Invalid type parameter.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = extractSessionToken(req.headers);
  const session = token ? verifyToken(token) : null;
  let orgId = session?.organisationId;
  if (!orgId) {
    const org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
    orgId = org?.id;
  }
  if (!orgId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const action = body.action;

  try {
    if (action === 'create_site') {
      const site = await ClinicalService.createSite({
        organisationId: orgId,
        code: body.code,
        name: body.name,
        siteType: body.siteType,
        location: body.location,
        province: body.province,
        contactPerson: body.contactPerson,
        contactPhone: body.contactPhone,
        capacityStudents: body.capacityStudents,
        mouValidUntil: body.mouValidUntil ? new Date(body.mouValidUntil) : undefined,
      });
      return NextResponse.json({ success: true, data: site });
    }

    if (action === 'create_supervisor') {
      const supervisor = await ClinicalService.createSupervisor({
        organisationId: orgId,
        clinicalSiteId: body.clinicalSiteId,
        fullName: body.fullName,
        profession: body.profession,
        councilRegNumber: body.councilRegNumber,
        phone: body.phone,
        email: body.email,
      });
      return NextResponse.json({ success: true, data: supervisor });
    }

    if (action === 'create_placement') {
      const placement = await ClinicalService.createPlacement({
        organisationId: orgId,
        learnerId: body.learnerId,
        clinicalSiteId: body.clinicalSiteId,
        wardOrDept: body.wardOrDept,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        totalHoursTarget: body.totalHoursTarget,
      });
      return NextResponse.json({ success: true, data: placement });
    }

    if (action === 'submit_logbook') {
      const entry = await ClinicalService.submitLogbookEntry({
        learnerId: body.learnerId,
        placementId: body.placementId,
        rotationId: body.rotationId,
        procedureCategory: body.procedureCategory,
        caseCategory: body.caseCategory,
        activityCode: body.activityCode,
        hoursCompleted: body.hoursCompleted,
        caseSummaryDeidentified: body.caseSummaryDeidentified,
        competencySelfRating: body.competencySelfRating,
        reflection: body.reflection,
      });
      return NextResponse.json({ success: true, data: entry });
    }

    if (action === 'sign_logbook') {
      const signed = await ClinicalService.signLogbookEntry({
        logbookEntryId: body.logbookEntryId,
        supervisorId: body.supervisorId,
        supervisorFeedback: body.supervisorFeedback,
      });
      return NextResponse.json({ success: true, data: signed });
    }

    if (action === 'record_competency') {
      const assessment = await ClinicalService.recordCompetencyAssessment({
        learnerId: body.learnerId,
        procedureName: body.procedureName,
        level: body.level,
        evaluatedById: body.evaluatedById,
        isPassed: body.isPassed,
        evaluatorRemarks: body.evaluatorRemarks,
      });
      return NextResponse.json({ success: true, data: assessment });
    }

    return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
