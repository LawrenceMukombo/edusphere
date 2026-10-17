// src/app/hr/page.tsx — Comprehensive Staff & HR Suite for Legacy School Solwezi
'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Award,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  UserCheck,
  Plus,
  Users,
  Search,
  Filter,
  FileText,
  UserPlus,
  HeartHandshake,
  Star,
  Check,
  X,
  ChevronRight,
  Eye,
  Building2,
  Send,
  MessageSquare,
} from 'lucide-react';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';
import { useCampus } from '@/components/CampusContext';
import {
  LEGACY_STAFF_MEMBERS,
  LEGACY_LEAVE_REQUESTS,
  LEGACY_STAFF_EVALUATIONS,
  LEGACY_JOB_POSTINGS,
  LEGACY_APPLICANTS,
  LegacyStaffMember,
  LegacyLeaveRecord,
  LegacyEvaluationRecord,
  LegacyJobPosting,
  LegacyApplicant,
} from '@/server/services/legacySchoolData';

export default function HRPage() {
  const { selectedCampus, campusInfo } = useCampus();
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'LEAVE' | 'EVALUATIONS' | 'RECRUITMENT'>('DIRECTORY');

  // Datasets state
  const [staffList, setStaffList] = useState<LegacyStaffMember[]>(LEGACY_STAFF_MEMBERS);
  const [leaveRequests, setLeaveRequests] = useState<LegacyLeaveRecord[]>(LEGACY_LEAVE_REQUESTS);
  const [evaluations, setEvaluations] = useState<LegacyEvaluationRecord[]>(LEGACY_STAFF_EVALUATIONS);
  const [jobPostings, setJobPostings] = useState<LegacyJobPosting[]>(LEGACY_JOB_POSTINGS);
  const [applicants, setApplicants] = useState<LegacyApplicant[]>(LEGACY_APPLICANTS);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [selectedStaffProfile, setSelectedStaffProfile] = useState<LegacyStaffMember | null>(null);

  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    staffId: 'stf-006',
    staffName: 'Mr. Patrick Lungu',
    jobTitle: 'Head of Sciences',
    campusName: 'Kansanshi Boarding Campus',
    leaveType: 'STUDY' as const,
    leaveTypeLabel: 'Study / Examination Leave',
    startDate: '2026-10-22',
    endDate: '2026-10-26',
    totalDays: 4,
    reason: 'Attending ECZ National Practical Examiners Workshop in Ndola.',
    handoverTo: 'Mrs. Martha Mwanza',
  });

  // Evaluation Form State
  const [evalForm, setEvalForm] = useState({
    staffId: 'stf-007',
    staffName: 'Mrs. Martha Mwanza',
    jobTitle: 'Senior Mathematics & ICT Teacher',
    campusName: 'Kansanshi Boarding Campus',
    evaluationPeriod: '2026 Term 1 Appraisal',
    evaluatorName: 'Mr. Emmanuel Mwansa',
    evaluatorRole: 'School Director',
    pedagogicalScore: 4.8,
    classroomManagementScore: 4.7,
    punctualityScore: 5.0,
    professionalismScore: 4.9,
    studentOutcomesScore: 4.8,
    keyStrengths: 'High student pass rates in Cambridge IGCSE mock examinations; structured lesson plans.',
    developmentAreas: 'Lead cross-campus peer mentorship workshops in STEM robotics.',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const newLeave: LegacyLeaveRecord = {
      id: `lev-${Date.now()}`,
      staffId: leaveForm.staffId,
      staffName: leaveForm.staffName,
      jobTitle: leaveForm.jobTitle,
      campusName: leaveForm.campusName,
      leaveType: leaveForm.leaveType,
      leaveTypeLabel: leaveForm.leaveTypeLabel,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      totalDays: Number(leaveForm.totalDays),
      reason: leaveForm.reason,
      handoverTo: leaveForm.handoverTo,
      status: 'PENDING',
      appliedDate: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests([newLeave, ...leaveRequests]);
    setShowLeaveModal(false);
    showToast(`Leave application submitted for ${newLeave.staffName}. Headteacher notified.`);
  };

  const handleApproveLeave = (leaveId: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status: 'APPROVED', approvedBy: 'Mr. E. Mwansa (Director)' } : l))
    );
    showToast('Leave request officially APPROVED by School Director.');
  };

  const handleRejectLeave = (leaveId: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status: 'REJECTED' } : l))
    );
    showToast('Leave request marked as REJECTED.');
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const avg =
      (evalForm.pedagogicalScore +
        evalForm.classroomManagementScore +
        evalForm.punctualityScore +
        evalForm.professionalismScore +
        evalForm.studentOutcomesScore) /
      5;
    const overallRating =
      avg >= 4.5 ? 'OUTSTANDING' : avg >= 3.8 ? 'COMMENDABLE' : avg >= 3.0 ? 'SATISFACTORY' : 'NEEDS_IMPROVEMENT';

    const newEval: LegacyEvaluationRecord = {
      id: `eval-${Date.now()}`,
      staffId: evalForm.staffId,
      staffName: evalForm.staffName,
      jobTitle: evalForm.jobTitle,
      campusName: evalForm.campusName,
      evaluationPeriod: evalForm.evaluationPeriod,
      evaluatorName: evalForm.evaluatorName,
      evaluatorRole: evalForm.evaluatorRole,
      pedagogicalScore: evalForm.pedagogicalScore,
      classroomManagementScore: evalForm.classroomManagementScore,
      punctualityScore: evalForm.punctualityScore,
      professionalismScore: evalForm.professionalismScore,
      studentOutcomesScore: evalForm.studentOutcomesScore,
      overallRating,
      keyStrengths: evalForm.keyStrengths,
      developmentAreas: evalForm.developmentAreas,
      signedOff: true,
      conductedDate: new Date().toISOString().split('T')[0],
    };
    setEvaluations([newEval, ...evaluations]);
    setShowEvalModal(false);
    showToast(`Performance evaluation for ${newEval.staffName} logged with ${newEval.overallRating} rating.`);
  };

  const updateApplicantStage = (applicantId: string, stage: LegacyApplicant['stage']) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? { ...a, stage } : a))
    );
    showToast(`Candidate stage updated to ${stage.replace(/_/g, ' ')}.`);
  };

  // Filter staff by campus
  const filteredStaff = staffList.filter((s) => {
    if (selectedCampus === 'MUSHITALA' && (s.campusId === 'LSS-URB' || s.campusId === 'LSS-MDC')) return false;
    if (selectedCampus === 'URBAN' && (s.campusId === 'LSS-MSC' || s.campusId === 'LSS-KBC')) return false;
    if (selectedCampus === 'KANSANSHI' && (s.campusId === 'LSS-URB' || s.campusId === 'LSS-MDC')) return false;
    return true;
  });

  // Staff Table Columns
  const staffColumns: ColumnDef<LegacyStaffMember>[] = [
    {
      key: 'staffNumber',
      header: 'Staff ID',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">{r.staffNumber}</span>,
    },
    {
      key: 'name',
      header: 'Staff Member & Role',
      sortable: true,
      accessor: (r) => `${r.firstName} ${r.lastName}`,
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.firstName} {r.lastName}</span>
          <span className="text-[11px] text-slate-500">
            {r.jobTitle} • <strong className="text-blue-700">{r.campusName}</strong>
          </span>
        </div>
      ),
    },
    {
      key: 'qualification',
      header: 'Academic & Professional Credentials',
      render: (r) => <span className="text-slate-700 text-xs font-medium">{r.qualification}</span>,
    },
    {
      key: 'tczNumber',
      header: 'TCZ Registration #',
      sortable: true,
      render: (r) => (
        <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
          {r.tczNumber}
        </span>
      ),
    },
    {
      key: 'tczExpiry',
      header: 'Practising Certificate',
      sortable: true,
      render: (r) => {
        const styles = {
          COMPLIANT: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          EXPIRING_SOON: 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse',
          EXPIRED: 'bg-rose-50 text-rose-800 border-rose-200',
        }[r.tczStatus];
        return (
          <div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles}`}>
              {r.tczStatus === 'EXPIRING_SOON' ? 'Renewing (45d)' : r.tczStatus}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Exp: {r.tczExpiry}</span>
          </div>
        );
      },
    },
    {
      key: 'leaveBalanceDays',
      header: 'Leave Balance',
      sortable: true,
      render: (r) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          {r.leaveBalanceDays} Days
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Direct Contact',
      render: (r) => (
        <div className="text-[11px]">
          <span className="font-mono text-slate-700 block">{r.phone}</span>
          <span className="text-slate-400">{r.email}</span>
        </div>
      ),
    },
  ];

  // Leave Table Columns
  const leaveColumns: ColumnDef<LegacyLeaveRecord>[] = [
    {
      key: 'staffName',
      header: 'Staff Applicant',
      sortable: true,
      render: (l) => (
        <div>
          <span className="font-bold text-slate-900 block">{l.staffName}</span>
          <span className="text-[11px] text-slate-500">{l.jobTitle} • {l.campusName}</span>
        </div>
      ),
    },
    {
      key: 'leaveTypeLabel',
      header: 'Leave Classification',
      sortable: true,
      render: (l) => (
        <span className="font-semibold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {l.leaveTypeLabel}
        </span>
      ),
    },
    {
      key: 'period',
      header: 'Duration & Dates',
      sortable: true,
      render: (l) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800 block">
            {l.startDate} to {l.endDate} ({l.totalDays} Days)
          </span>
          <span className="text-[10px] text-slate-500">Handover to: {l.handoverTo}</span>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason / Purpose',
      render: (l) => <span className="text-xs text-slate-700 max-w-xs block">{l.reason}</span>,
    },
    {
      key: 'status',
      header: 'Approval State',
      sortable: true,
      render: (l) => {
        const styles = {
          APPROVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
          REJECTED: 'bg-rose-50 text-rose-800 border-rose-200',
        }[l.status];
        return (
          <div>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles}`}>
              {l.status}
            </span>
            {l.approvedBy && (
              <span className="block text-[10px] text-slate-400 mt-0.5">{l.approvedBy}</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Director Action',
      render: (l) => (
        <div className="flex items-center gap-1.5">
          {l.status === 'PENDING' ? (
            <>
              <button
                type="button"
                onClick={() => handleApproveLeave(l.id)}
                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleRejectLeave(l.id)}
                className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-xs"
              >
                Reject
              </button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">Logged</span>
          )}
        </div>
      ),
    },
  ];

  // Evaluation Table Columns
  const evalColumns: ColumnDef<LegacyEvaluationRecord>[] = [
    {
      key: 'staffName',
      header: 'Staff Appraised',
      sortable: true,
      render: (e) => (
        <div>
          <span className="font-bold text-slate-900 block">{e.staffName}</span>
          <span className="text-[11px] text-slate-500">{e.jobTitle} • {e.campusName}</span>
        </div>
      ),
    },
    {
      key: 'evaluationPeriod',
      header: 'Review Cycle',
      sortable: true,
      render: (e) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800 block">{e.evaluationPeriod}</span>
          <span className="text-[10px] text-slate-500">Conducted: {e.conductedDate}</span>
        </div>
      ),
    },
    {
      key: 'scores',
      header: 'Competency Breakdown',
      render: (e) => (
        <div className="text-[11px] space-y-0.5">
          <div className="flex gap-2 text-slate-700">
            <span>Pedagogy: <strong>{e.pedagogicalScore}/5</strong></span>
            <span>Discipline: <strong>{e.classroomManagementScore}/5</strong></span>
            <span>Outcomes: <strong>{e.studentOutcomesScore}/5</strong></span>
          </div>
        </div>
      ),
    },
    {
      key: 'overallRating',
      header: 'Institutional Rating',
      sortable: true,
      render: (e) => {
        const styles = {
          OUTSTANDING: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-black',
          COMMENDABLE: 'bg-blue-50 text-blue-800 border-blue-300 font-bold',
          SATISFACTORY: 'bg-slate-50 text-slate-800 border-slate-300',
          NEEDS_IMPROVEMENT: 'bg-rose-50 text-rose-800 border-rose-300',
        }[e.overallRating];
        return (
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider border ${styles}`}>
            {e.overallRating}
          </span>
        );
      },
    },
    {
      key: 'evaluator',
      header: 'Evaluator Remarks',
      render: (e) => (
        <div className="text-xs max-w-xs">
          <span className="text-slate-700 block italic">&ldquo;{e.keyStrengths}&rdquo;</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            By {e.evaluatorName} ({e.evaluatorRole})
          </span>
        </div>
      ),
    },
  ];

  // Applicants Table Columns
  const applicantColumns: ColumnDef<LegacyApplicant>[] = [
    {
      key: 'fullName',
      header: 'Candidate Name',
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-bold text-slate-900 block">{a.fullName}</span>
          <span className="text-[11px] text-slate-500 font-mono">{a.phone} • {a.email}</span>
        </div>
      ),
    },
    {
      key: 'jobTitle',
      header: 'Position Applied',
      sortable: true,
      render: (a) => <span className="text-xs font-bold text-blue-900">{a.jobTitle}</span>,
    },
    {
      key: 'qualification',
      header: 'Qualifications & TCZ',
      render: (a) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800 block">{a.qualification}</span>
          <span className="text-[10px] text-slate-500 font-mono">
            TCZ: {a.tczNumber} • {a.experienceYears} Years Experience
          </span>
        </div>
      ),
    },
    {
      key: 'stage',
      header: 'Recruitment Stage',
      sortable: true,
      render: (a) => {
        const styles = {
          APPLIED: 'bg-slate-100 text-slate-700',
          SHORTLISTED: 'bg-blue-50 text-blue-800 border border-blue-200',
          INTERVIEW_SCHEDULED: 'bg-amber-50 text-amber-800 border border-amber-200 font-bold',
          OFFER_EXTENDED: 'bg-purple-50 text-purple-800 border border-purple-200 font-bold',
          HIRED: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-black',
        }[a.stage];
        return (
          <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider ${styles}`}>
            {a.stage.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      key: 'rating',
      header: 'Panel Score',
      sortable: true,
      render: (a) => (
        <div className="flex items-center gap-1 font-bold text-amber-600 text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{a.rating} / 5.0</span>
        </div>
      ),
    },
    {
      key: 'stageActions',
      header: 'Advance Stage',
      render: (a) => (
        <div className="flex items-center gap-1">
          {a.stage === 'APPLIED' && (
            <button
              type="button"
              onClick={() => updateApplicantStage(a.id, 'SHORTLISTED')}
              className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold"
            >
              Shortlist
            </button>
          )}
          {a.stage === 'SHORTLISTED' && (
            <button
              type="button"
              onClick={() => updateApplicantStage(a.id, 'INTERVIEW_SCHEDULED')}
              className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold"
            >
              Schedule Interview
            </button>
          )}
          {a.stage === 'INTERVIEW_SCHEDULED' && (
            <button
              type="button"
              onClick={() => updateApplicantStage(a.id, 'OFFER_EXTENDED')}
              className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold"
            >
              Extend Offer
            </button>
          )}
          {a.stage === 'OFFER_EXTENDED' && (
            <button
              type="button"
              onClick={() => updateApplicantStage(a.id, 'HIRED')}
              className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black"
            >
              Confirm Hire
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header and Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Human Resources & Staff Management Suite
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              {campusInfo.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete lifecycle management: Teaching Council of Zambia (TCZ) compliance, leave balances, performance appraisals, and recruitment pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'LEAVE' && (
            <button
              type="button"
              onClick={() => setShowLeaveModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Staff Leave</span>
            </button>
          )}

          {activeTab === 'EVALUATIONS' && (
            <button
              type="button"
              onClick={() => setShowEvalModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Conduct Performance Appraisal</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('DIRECTORY')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'DIRECTORY'
              ? 'border-blue-900 text-blue-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Staff Directory & TCZ Registry</span>
          <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[10px]">
            {filteredStaff.length} Staff
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LEAVE')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'LEAVE'
              ? 'border-emerald-700 text-emerald-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Leave Management & Balances</span>
          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px]">
            {leaveRequests.length} Requests
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EVALUATIONS')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'EVALUATIONS'
              ? 'border-indigo-700 text-indigo-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Staff Appraisals & Evaluations</span>
          <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded text-[10px]">
            {evaluations.length} Reviews
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RECRUITMENT')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'RECRUITMENT'
              ? 'border-purple-700 text-purple-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Recruitment & Candidate Pipeline</span>
          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded text-[10px]">
            {applicants.length} Candidates
          </span>
        </button>
      </div>

      {/* TAB 1: STAFF DIRECTORY & TCZ REGISTRY */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-6">
          {/* Compliance KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Headcount</span>
              <div className="text-2xl font-black text-slate-900 mt-1">38 Staff</div>
              <span className="text-[11px] text-blue-700 font-bold block mt-0.5">
                21 Secondary & Boarding • 17 Primary & ECE
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TCZ Compliance Rate</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">97.4%</div>
              <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                37 Valid Certificates • 1 in Renewal
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Staff On Approved Leave</span>
              <div className="text-2xl font-black text-amber-700 mt-1">3 Active</div>
              <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                Relief teachers & matrons designated
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Open Vacancies</span>
              <div className="text-2xl font-black text-purple-700 mt-1">3 Positions</div>
              <span className="text-[11px] text-purple-700 font-bold block mt-0.5">
                19 Applicants in Interview Pipeline
              </span>
            </div>
          </div>

          <EnterpriseTable
            data={filteredStaff}
            columns={staffColumns}
            title="Institutional Staff Register & TCZ Practising Tracker"
            description="Teaching Council of Zambia credentials audit for Republic of Zambia statutory compliance."
            searchPlaceholder="Search by name, staff ID, TCZ #, or job title..."
            exportFilename="legacy-school-staff-directory"
            rowActions={(row) => (
              <button
                type="button"
                onClick={() => setSelectedStaffProfile(row)}
                className="px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition"
              >
                Dossier
              </button>
            )}
          />
        </div>
      )}

      {/* TAB 2: LEAVE MANAGEMENT & BALANCES */}
      {activeTab === 'LEAVE' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <span className="font-bold text-amber-950 block">Staff on Authorized Leave Today (3 Active)</span>
                <span className="text-amber-800">
                  Mr. Patrick Lungu (Study - Ndola), Mrs. Agness Chanda (Annual), Mr. Kelvin Phiri (Compassionate). All classes and dorms covered.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowLeaveModal(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs"
            >
              New Application
            </button>
          </div>

          <EnterpriseTable
            data={leaveRequests}
            columns={leaveColumns}
            title="Staff Leave Applications & Approval Workflow"
            description="Track annual, study, maternity, and compassionate leave with designated relief teachers."
            searchPlaceholder="Search by staff name, leave type..."
            exportFilename="legacy-school-leave-requests"
          />
        </div>
      )}

      {/* TAB 3: APPRAISALS & EVALUATIONS */}
      {activeTab === 'EVALUATIONS' && (
        <div className="space-y-6">
          <EnterpriseTable
            data={evaluations}
            columns={evalColumns}
            title="Teaching & Operational Performance Appraisals"
            description="Termly pedagogical competence reviews, classroom management ratings, and student pass-rate metrics."
            searchPlaceholder="Search by staff name, rating..."
            exportFilename="legacy-school-evaluations"
          />
        </div>
      )}

      {/* TAB 4: RECRUITMENT & VACANCY PIPELINE */}
      {activeTab === 'RECRUITMENT' && (
        <div className="space-y-6">
          {/* Active Vacancies Header Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jobPostings.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    {job.department}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {job.status}
                  </span>
                </div>
                <h4 className="font-black text-sm text-slate-900 mt-1">{job.title}</h4>
                <p className="text-[11px] text-slate-500">{job.description}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                  <span>Campus: {job.campusName}</span>
                  <span className="text-purple-700 font-bold">{job.applicantsCount} Applicants</span>
                </div>
              </div>
            ))}
          </div>

          <EnterpriseTable
            data={applicants}
            columns={applicantColumns}
            title="Active Candidate Applicant Pipeline"
            description="Candidate shortlisting, demonstration lesson evaluations, and employment offer tracking."
            searchPlaceholder="Search candidate by name, qualification..."
            exportFilename="legacy-school-recruitment"
          />
        </div>
      )}

      {/* MODAL: Apply for Leave */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Submit Staff Leave Application</h3>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Staff Member</label>
                <select
                  value={leaveForm.staffId}
                  onChange={(e) => {
                    const sel = staffList.find((s) => s.id === e.target.value);
                    if (sel) {
                      setLeaveForm({
                        ...leaveForm,
                        staffId: sel.id,
                        staffName: `${sel.firstName} ${sel.lastName}`,
                        jobTitle: sel.jobTitle,
                        campusName: sel.campusName,
                      });
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.jobTitle} • Balance: {s.leaveBalanceDays}d)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Leave Classification</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e: any) => {
                      const labels: Record<string, string> = {
                        ANNUAL: 'Annual Leave',
                        SICK: 'Sick Leave (Medical Certificate)',
                        MATERNITY: 'Maternity Leave',
                        STUDY: 'Study / Workshop Leave',
                        COMPASSIONATE: 'Compassionate Leave',
                      };
                      setLeaveForm({
                        ...leaveForm,
                        leaveType: e.target.value,
                        leaveTypeLabel: labels[e.target.value] || e.target.value,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="ANNUAL">Annual Leave</option>
                    <option value="STUDY">Study / Workshop Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="COMPASSIONATE">Compassionate Leave</option>
                    <option value="MATERNITY">Maternity Leave</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Days</label>
                  <input
                    type="number"
                    required
                    value={leaveForm.totalDays}
                    onChange={(e) => setLeaveForm({ ...leaveForm, totalDays: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Designated Handover Teacher / Relief</label>
                <input
                  type="text"
                  required
                  value={leaveForm.handoverTo}
                  onChange={(e) => setLeaveForm({ ...leaveForm, handoverTo: e.target.value })}
                  placeholder="e.g. Mrs. Martha Mwanza (Maths & Sciences)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Purpose</label>
                <textarea
                  rows={2}
                  required
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Conduct Performance Appraisal */}
      {showEvalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Conduct Staff Performance Appraisal</h3>
              <button
                type="button"
                onClick={() => setShowEvalModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Staff Member Being Appraised</label>
                <select
                  value={evalForm.staffId}
                  onChange={(e) => {
                    const sel = staffList.find((s) => s.id === e.target.value);
                    if (sel) {
                      setEvalForm({
                        ...evalForm,
                        staffId: sel.id,
                        staffName: `${sel.firstName} ${sel.lastName}`,
                        jobTitle: sel.jobTitle,
                        campusName: sel.campusName,
                      });
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pedagogical Mastery (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={evalForm.pedagogicalScore}
                    onChange={(e) => setEvalForm({ ...evalForm, pedagogicalScore: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discipline Management (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={evalForm.classroomManagementScore}
                    onChange={(e) => setEvalForm({ ...evalForm, classroomManagementScore: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[10px]">Punctuality</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={evalForm.punctualityScore}
                    onChange={(e) => setEvalForm({ ...evalForm, punctualityScore: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[10px]">Professionalism</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={evalForm.professionalismScore}
                    onChange={(e) => setEvalForm({ ...evalForm, professionalismScore: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[10px]">Student Outcomes</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={evalForm.studentOutcomesScore}
                    onChange={(e) => setEvalForm({ ...evalForm, studentOutcomesScore: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Key Strengths & Commendations</label>
                <textarea
                  rows={2}
                  required
                  value={evalForm.keyStrengths}
                  onChange={(e) => setEvalForm({ ...evalForm, keyStrengths: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Development Goals</label>
                <textarea
                  rows={2}
                  required
                  value={evalForm.developmentAreas}
                  onChange={(e) => setEvalForm({ ...evalForm, developmentAreas: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEvalModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl shadow-xs"
                >
                  Sign Off Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Staff Dossier Drawer */}
      {selectedStaffProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-900 text-amber-300 font-black text-sm flex items-center justify-center">
                  {selectedStaffProfile.firstName[0]}{selectedStaffProfile.lastName[0]}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedStaffProfile.firstName} {selectedStaffProfile.lastName}
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    {selectedStaffProfile.jobTitle} • {selectedStaffProfile.campusName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStaffProfile(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Staff ID Number:</span>
                <span className="font-mono font-bold text-blue-900">{selectedStaffProfile.staffNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">TCZ Registration #:</span>
                <span className="font-mono font-bold text-slate-900">{selectedStaffProfile.tczNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">TCZ Certificate Expiry:</span>
                <span className="font-bold text-emerald-700">{selectedStaffProfile.tczExpiry} (Compliant)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Qualifications:</span>
                <span className="font-semibold text-slate-900 text-right">{selectedStaffProfile.qualification}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Salary Grade:</span>
                <span className="font-mono font-bold text-slate-800">{selectedStaffProfile.salaryGrade}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Leave Entitlement Remaining:</span>
                <span className="font-bold text-blue-900">{selectedStaffProfile.leaveBalanceDays} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact:</span>
                <span className="font-mono text-slate-800">{selectedStaffProfile.phone}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStaffProfile(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
