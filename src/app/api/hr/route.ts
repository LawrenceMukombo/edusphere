// src/app/api/hr/route.ts — Database-Backed Health Sciences Human Resources & Faculty Registry API
import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgCode = searchParams.get('orgCode');
    const campusId = searchParams.get('campusId');
    const search = searchParams.get('search')?.toLowerCase();

    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId && orgCode) {
      const org = await prisma.organisation.findUnique({ where: { code: orgCode } });
      orgId = org?.id || null;
    }
    if (!orgId) {
      const nwuchasOrg = await prisma.organisation.findFirst({
        where: { code: 'NWUCHAS' },
      });
      orgId = nwuchasOrg?.id || null;
    }

    if (!orgId) {
      return NextResponse.json({
        success: true,
        data: {
          staff: [],
          tczAlerts: { totalStaffAudited: 0, compliant: [], expiringSoon: [], expired: [] },
          leaveRequests: [],
          evaluations: [],
          jobPostings: [],
          applicants: [],
          summary: {
            totalStaff: 0,
            tczComplianceRate: 100,
            activeLeaveCount: 0,
            pendingLeaveCount: 0,
            activeVacanciesCount: 0,
            applicantsInPipeline: 0,
          },
        },
      });
    }

    // 1. Fetch real staff from database
    const dbStaff = await prisma.staff.findMany({
      where: {
        organisationId: orgId,
        ...(campusId && campusId !== 'ALL' ? { campusId } : {}),
      },
      include: {
        campus: { select: { id: true, name: true, code: true } },
        contract: true,
      },
      orderBy: { staffNumber: 'asc' },
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const formattedStaff = dbStaff.map((s) => {
      let tczStatus: 'COMPLIANT' | 'EXPIRING_SOON' | 'EXPIRED' = 'COMPLIANT';
      if (s.tczCertificateExpiry) {
        const expiry = new Date(s.tczCertificateExpiry);
        if (expiry < now) {
          tczStatus = 'EXPIRED';
        } else if (expiry <= thirtyDaysFromNow) {
          tczStatus = 'EXPIRING_SOON';
        }
      }

      return {
        id: s.id,
        staffNumber: s.staffNumber,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phone: s.phone,
        jobTitle: s.jobTitle,
        campusId: s.campusId,
        campusName: s.campus?.name || 'Manyama Main Campus',
        tczNumber: s.tczNumber || 'N/A',
        tczStatus,
        tczCertificateExpiry: s.tczCertificateExpiry?.toISOString().split('T')[0] || null,
        employmentStatus: s.employmentStatus,
        dateJoined: s.dateJoined.toISOString().split('T')[0],
      };
    });

    let filteredStaff = formattedStaff;
    if (search) {
      filteredStaff = filteredStaff.filter(
        (s) =>
          s.firstName.toLowerCase().includes(search) ||
          s.lastName.toLowerCase().includes(search) ||
          s.staffNumber.toLowerCase().includes(search) ||
          s.tczNumber.toLowerCase().includes(search) ||
          s.jobTitle.toLowerCase().includes(search)
      );
    }

    const tczAlerts = {
      totalStaffAudited: filteredStaff.length,
      compliant: filteredStaff.filter((s) => s.tczStatus === 'COMPLIANT'),
      expiringSoon: filteredStaff.filter((s) => s.tczStatus === 'EXPIRING_SOON'),
      expired: filteredStaff.filter((s) => s.tczStatus === 'EXPIRED'),
    };

    // 2. Fetch ModuleWorkspaceRecords for leave, evaluations, job postings, and applicants
    const workspaceRecords = await prisma.moduleWorkspaceRecord.findMany({
      where: {
        organisationId: orgId,
        moduleSlug: { in: ['hr_leave', 'hr_eval', 'hr_jobs', 'hr_applicants'] },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const leaveRequests = workspaceRecords
      .filter((r) => r.moduleSlug === 'hr_leave')
      .map((r) => {
        try {
          return { id: r.id, status: r.status, title: r.title, summary: r.summary, ...JSON.parse(r.metadataJson || '{}') };
        } catch {
          return { id: r.id, status: r.status, title: r.title, summary: r.summary };
        }
      });

    const evaluations = workspaceRecords
      .filter((r) => r.moduleSlug === 'hr_eval')
      .map((r) => {
        try {
          return { id: r.id, status: r.status, title: r.title, summary: r.summary, ...JSON.parse(r.metadataJson || '{}') };
        } catch {
          return { id: r.id, status: r.status, title: r.title, summary: r.summary };
        }
      });

    const jobPostings = workspaceRecords
      .filter((r) => r.moduleSlug === 'hr_jobs')
      .map((r) => {
        try {
          return { id: r.id, status: r.status, title: r.title, summary: r.summary, ...JSON.parse(r.metadataJson || '{}') };
        } catch {
          return { id: r.id, status: r.status, title: r.title, summary: r.summary };
        }
      });

    const applicants = workspaceRecords
      .filter((r) => r.moduleSlug === 'hr_applicants')
      .map((r) => {
        try {
          return { id: r.id, status: r.status, title: r.title, summary: r.summary, ...JSON.parse(r.metadataJson || '{}') };
        } catch {
          return { id: r.id, status: r.status, title: r.title, summary: r.summary };
        }
      });

    const complianceRate =
      filteredStaff.length > 0
        ? Math.round(((filteredStaff.length - tczAlerts.expired.length) / filteredStaff.length) * 100)
        : 100;

    return NextResponse.json({
      success: true,
      data: {
        staff: filteredStaff,
        tczAlerts,
        leaveRequests,
        evaluations,
        jobPostings,
        applicants,
        summary: {
          totalStaff: filteredStaff.length,
          tczComplianceRate: complianceRate,
          activeLeaveCount: leaveRequests.filter((l: any) => l.status === 'APPROVED').length,
          pendingLeaveCount: leaveRequests.filter((l: any) => l.status === 'PENDING').length,
          activeVacanciesCount: jobPostings.filter((j: any) => j.status === 'ACTIVE').length,
          applicantsInPipeline: applicants.length,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId) {
      const nwuchasOrg = await prisma.organisation.findFirst({
        where: { code: 'NWUCHAS' },
      });
      orgId = nwuchasOrg?.id || null;
    }

    if (!orgId) {
      return NextResponse.json({ success: false, message: 'NWUCHAS Organisation not initialized.' }, { status: 400 });
    }

    if (body.action === 'SUBMIT_LEAVE') {
      const recordTitle = `Leave: ${body.staffName || 'Staff'} (${body.startDate} - ${body.endDate})`;
      const leaveMetadata = {
        staffId: body.staffId,
        staffName: body.staffName,
        jobTitle: body.jobTitle || 'Faculty Lecturer',
        campusName: body.campusName || 'NWUCHAS Main Campus (Manyama)',
        leaveType: body.leaveType || 'ANNUAL',
        leaveTypeLabel: body.leaveTypeLabel || 'Annual Leave',
        startDate: body.startDate,
        endDate: body.endDate,
        totalDays: Number(body.totalDays) || 1,
        reason: body.reason,
        handoverTo: body.handoverTo || 'Department Colleague',
        appliedDate: new Date().toISOString().split('T')[0],
      };

      const record = await prisma.moduleWorkspaceRecord.create({
        data: {
          organisationId: orgId,
          moduleSlug: 'hr_leave',
          title: `${recordTitle} [${Date.now()}]`,
          status: 'PENDING',
          summary: `${body.leaveType || 'Annual'} leave request for ${body.staffName || 'Staff Member'}`,
          metadataJson: JSON.stringify(leaveMetadata),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Leave application submitted for Dean of Academic Affairs & HR review.',
        data: { id: record.id, ...leaveMetadata, status: 'PENDING' },
      });
    }

    if (body.action === 'UPDATE_LEAVE_STATUS') {
      const { leaveId, status, approvedBy } = body;
      const record = await prisma.moduleWorkspaceRecord.findUnique({ where: { id: leaveId } });
      if (!record) {
        return NextResponse.json({ success: false, message: 'Leave record not found.' }, { status: 404 });
      }

      let meta = {};
      try {
        meta = JSON.parse(record.metadataJson || '{}');
      } catch {}

      const updated = await prisma.moduleWorkspaceRecord.update({
        where: { id: leaveId },
        data: {
          status,
          metadataJson: JSON.stringify({ ...meta, approvedBy: approvedBy || 'Dean / Registrar' }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Leave status updated to ${status}.`,
        data: updated,
      });
    }

    if (body.action === 'SUBMIT_EVALUATION') {
      const evalMetadata = {
        staffId: body.staffId,
        staffName: body.staffName,
        jobTitle: body.jobTitle,
        campusName: body.campusName || 'NWUCHAS Main Campus (Manyama)',
        evaluationPeriod: body.evaluationPeriod || '2026 Academic Year Appraisal',
        evaluatorName: body.evaluatorName || 'Academic Dean / Head of Department',
        evaluatorRole: body.evaluatorRole || 'Head of Department',
        pedagogicalScore: Number(body.pedagogicalScore) || 4.5,
        classroomManagementScore: Number(body.classroomManagementScore) || 4.5,
        punctualityScore: Number(body.punctualityScore) || 4.8,
        professionalismScore: Number(body.professionalismScore) || 4.7,
        studentOutcomesScore: Number(body.studentOutcomesScore) || 4.6,
        overallRating: body.overallRating || 'OUTSTANDING',
        keyStrengths: body.keyStrengths || '',
        developmentAreas: body.developmentAreas || '',
        signedOff: true,
        conductedDate: new Date().toISOString().split('T')[0],
      };

      const record = await prisma.moduleWorkspaceRecord.create({
        data: {
          organisationId: orgId,
          moduleSlug: 'hr_eval',
          title: `Appraisal: ${body.staffName} (${evalMetadata.evaluationPeriod}) [${Date.now()}]`,
          status: 'COMPLETED',
          summary: `Performance appraisal for ${body.staffName}`,
          metadataJson: JSON.stringify(evalMetadata),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Faculty performance appraisal officially logged and signed off.',
        data: { id: record.id, ...evalMetadata },
      });
    }

    if (body.action === 'UPDATE_APPLICANT_STAGE') {
      const { applicantId, stage } = body;
      const record = await prisma.moduleWorkspaceRecord.findUnique({ where: { id: applicantId } });
      if (record) {
        await prisma.moduleWorkspaceRecord.update({
          where: { id: applicantId },
          data: { status: stage },
        });
      }
      return NextResponse.json({ success: true, message: `Candidate stage updated to ${stage}.` });
    }

    return NextResponse.json({ success: false, message: 'Unrecognized action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
