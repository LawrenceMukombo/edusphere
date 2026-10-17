// src/app/api/hr/route.ts
import { NextResponse } from 'next/server';
import {
  LEGACY_STAFF_MEMBERS,
  LEGACY_LEAVE_REQUESTS,
  LEGACY_STAFF_EVALUATIONS,
  LEGACY_JOB_POSTINGS,
  LEGACY_APPLICANTS,
  LegacyStaffMember,
  LegacyLeaveRecord,
  LegacyEvaluationRecord,
  LegacyApplicant,
} from '@/server/services/legacySchoolData';

let staffStore: LegacyStaffMember[] = [...LEGACY_STAFF_MEMBERS];
let leaveStore: LegacyLeaveRecord[] = [...LEGACY_LEAVE_REQUESTS];
let evalStore: LegacyEvaluationRecord[] = [...LEGACY_STAFF_EVALUATIONS];
let jobStore = [...LEGACY_JOB_POSTINGS];
let applicantsStore: LegacyApplicant[] = [...LEGACY_APPLICANTS];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'all';
    const campusId = searchParams.get('campusId');
    const search = searchParams.get('search')?.toLowerCase();

    let staff = staffStore;
    if (campusId && campusId !== 'ALL') {
      staff = staff.filter((s) => s.campusId === campusId || s.campusId === 'CENTRAL');
    }
    if (search) {
      staff = staff.filter(
        (s) =>
          s.firstName.toLowerCase().includes(search) ||
          s.lastName.toLowerCase().includes(search) ||
          s.staffNumber.toLowerCase().includes(search) ||
          s.tczNumber.toLowerCase().includes(search) ||
          s.jobTitle.toLowerCase().includes(search)
      );
    }

    const tczAlerts = {
      totalStaffAudited: staffStore.length,
      compliant: staffStore.filter((s) => s.tczStatus === 'COMPLIANT'),
      expiringSoon: staffStore.filter((s) => s.tczStatus === 'EXPIRING_SOON'),
      expired: staffStore.filter((s) => s.tczStatus === 'EXPIRED'),
    };

    return NextResponse.json({
      success: true,
      data: {
        staff,
        tczAlerts,
        leaveRequests: leaveStore,
        evaluations: evalStore,
        jobPostings: jobStore,
        applicants: applicantsStore,
        summary: {
          totalStaff: staffStore.length,
          tczComplianceRate: Math.round(((staffStore.length - tczAlerts.expired.length) / staffStore.length) * 100),
          activeLeaveCount: leaveStore.filter((l) => l.status === 'APPROVED').length,
          pendingLeaveCount: leaveStore.filter((l) => l.status === 'PENDING').length,
          activeVacanciesCount: jobStore.filter((j) => j.status === 'ACTIVE').length,
          applicantsInPipeline: applicantsStore.length,
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

    if (body.action === 'SUBMIT_LEAVE') {
      const newLeave: LegacyLeaveRecord = {
        id: `lev-${Date.now()}`,
        staffId: body.staffId,
        staffName: body.staffName,
        jobTitle: body.jobTitle || 'Teacher',
        campusName: body.campusName || 'Mushitala Day Campus',
        leaveType: body.leaveType || 'ANNUAL',
        leaveTypeLabel: body.leaveTypeLabel || 'Annual Leave',
        startDate: body.startDate,
        endDate: body.endDate,
        totalDays: Number(body.totalDays) || 1,
        reason: body.reason,
        handoverTo: body.handoverTo || 'Department Colleague',
        status: 'PENDING',
        appliedDate: new Date().toISOString().split('T')[0],
      };
      leaveStore.unshift(newLeave);
      return NextResponse.json({
        success: true,
        message: 'Leave application submitted for Headteacher & Director review.',
        data: newLeave,
      });
    }

    if (body.action === 'UPDATE_LEAVE_STATUS') {
      const { leaveId, status, approvedBy } = body;
      leaveStore = leaveStore.map((l) =>
        l.id === leaveId ? { ...l, status, approvedBy: approvedBy || 'Mr. E. Mwansa (Director)' } : l
      );
      return NextResponse.json({ success: true, message: `Leave status updated to ${status}.` });
    }

    if (body.action === 'SUBMIT_EVALUATION') {
      const newEval: LegacyEvaluationRecord = {
        id: `eval-${Date.now()}`,
        staffId: body.staffId,
        staffName: body.staffName,
        jobTitle: body.jobTitle,
        campusName: body.campusName || 'Kansanshi Boarding Campus',
        evaluationPeriod: body.evaluationPeriod || '2026 Term 1 Appraisal',
        evaluatorName: body.evaluatorName || 'Mr. Emmanuel Mwansa',
        evaluatorRole: body.evaluatorRole || 'School Director',
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
      evalStore.unshift(newEval);
      return NextResponse.json({
        success: true,
        message: 'Staff performance appraisal officially logged and signed off.',
        data: newEval,
      });
    }

    if (body.action === 'UPDATE_APPLICANT_STAGE') {
      const { applicantId, stage } = body;
      applicantsStore = applicantsStore.map((a) =>
        a.id === applicantId ? { ...a, stage } : a
      );
      return NextResponse.json({ success: true, message: `Candidate stage updated to ${stage}.` });
    }

    return NextResponse.json({ success: false, message: 'Unrecognized action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
