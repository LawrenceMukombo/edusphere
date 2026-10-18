// src/app/academics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  FileCheck,
  Search,
  BookOpen,
  Award,
  AlertCircle,
  Share2,
  Mail,
  Send,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Download,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';
import { useCampus } from '@/components/CampusContext';

import { generateLegacyLearners } from '@/server/services/legacySchoolData';

type ApprovalStage = 'DRAFT' | 'SUBMITTED' | 'ENDORSED' | 'APPROVED' | 'PUBLISHED';

interface AcademicReport {
  id: string;
  learnerId: string;
  learnerName: string;
  studentNumber: string;
  className: string;
  termName: string;
  academicYear: string;
  status: ApprovalStage;
  aggregateScore: number;
  rank: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  teacherRemarks: string;
  supervisorRemarks: string;
  principalRemarks: string;
  dispatchedViaWhatsApp: boolean;
  dispatchedViaEmail: boolean;
  subjects: {
    name: string;
    code: string;
    homeworkScore: number; // /10
    weeklyTestsScore: number; // /15
    midTermCaScore: number; // /15
    mockExamScore: number; // /20
    finalExamScore: number; // /40
    total: number; // /100
    grade: string;
    gp: number;
  }[];
}

const SAMPLE_SUBJECTS = [
  { name: 'Mathematics', code: 'MATH', homeworkScore: 9, weeklyTestsScore: 14, midTermCaScore: 13.5, mockExamScore: 18, finalExamScore: 36, total: 90.5, grade: 'Distinction (1)', gp: 1 },
  { name: 'English Language', code: 'ENG', homeworkScore: 8, weeklyTestsScore: 12, midTermCaScore: 12, mockExamScore: 16, finalExamScore: 33, total: 81.0, grade: 'Distinction (1)', gp: 1 },
  { name: 'Integrated Science', code: 'SCI', homeworkScore: 8.5, weeklyTestsScore: 13, midTermCaScore: 14, mockExamScore: 17.5, finalExamScore: 35, total: 88.0, grade: 'Distinction (1)', gp: 1 },
  { name: 'Social Studies', code: 'SOC', homeworkScore: 7, weeklyTestsScore: 11, midTermCaScore: 11, mockExamScore: 14, finalExamScore: 30, total: 73.0, grade: 'Merit (2)', gp: 2 },
  { name: 'Business Studies', code: 'BUS', homeworkScore: 8, weeklyTestsScore: 13, midTermCaScore: 12.5, mockExamScore: 15, finalExamScore: 32, total: 80.5, grade: 'Distinction (1)', gp: 1 },
  { name: 'Computer Studies (ICT)', code: 'ICT', homeworkScore: 9.5, weeklyTestsScore: 14.5, midTermCaScore: 14, mockExamScore: 19, finalExamScore: 38, total: 95.0, grade: 'Distinction (1)', gp: 1 },
];

export default function AcademicsPage() {
  const { selectedCampus, campusInfo } = useCampus();
  const [reportCards, setReportCards] = useState<AcademicReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AcademicReport | null>(null);
  const [selectedTerm, setSelectedTerm] = useState('2026 Term 1');
  const [activeTab, setActiveTab] = useState<'moderation' | 'archives'>('moderation');
  const [isLoading, setIsLoading] = useState(true);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  // Load sample report cards from database or state with full offline baseline fallback
  useEffect(() => {
    setIsLoading(true);

    const generateMockReportsFromLearners = (learners: any[]) => {
      const stages: ApprovalStage[] = ['PUBLISHED', 'APPROVED', 'ENDORSED', 'SUBMITTED', 'DRAFT'];
      return learners.map((learner: any, idx: number) => {
        const assignedStage = stages[idx % stages.length];
        const baseAvg = 92 - (idx % 22) * 1.6;
        const avg = Number(Math.max(48, Math.min(98, baseAvg)).toFixed(1));

        const learnerName = learner.learnerName || `${learner.firstName || ''} ${learner.lastName || ''}`.trim() || 'Learner';
        const guardian = learner.guardian || {};
        const guardianName = guardian.name || learner.guardianName || (learner.guardians?.[0]?.guardian ? `${learner.guardians[0].guardian.firstName} ${learner.guardians[0].guardian.lastName}` : 'Mr. & Mrs. Mulenga');
        const guardianPhone = guardian.phone || learner.guardianPhone || learner.guardians?.[0]?.guardian?.phone || '+260 977 123456';
        const guardianEmail = guardian.email || learner.guardianEmail || learner.guardians?.[0]?.guardian?.email || 'guardian@solwezinet.zm';
        const className = learner.className || learner.currentClass?.name || 'Form 2 Green';

        return {
          id: `rc-${learner.id}-${selectedTerm.replace(/\s+/g, '')}`,
          learnerId: learner.id,
          learnerName,
          studentNumber: learner.studentNumber,
          className,
          termName: selectedTerm,
          academicYear: '2026',
          status: assignedStage,
          aggregateScore: avg,
          rank: `${(idx % 35) + 1} of 35`,
          guardianName,
          guardianPhone,
          guardianEmail,
          teacherRemarks: avg >= 75 ? 'Exceptional mastery and active classroom contribution.' : avg >= 60 ? 'Satisfactory progress. Continued focus on mathematical problem solving recommended.' : 'Requires closer tutorial support in sciences.',
          supervisorRemarks: 'Academic standards met. Continuous assessments verified against scheme of work.',
          principalRemarks: 'Approved for progression with honours. Well done!',
          dispatchedViaWhatsApp: assignedStage === 'PUBLISHED',
          dispatchedViaEmail: assignedStage === 'PUBLISHED',
          subjects: SAMPLE_SUBJECTS,
        };
      });
    };

    const loadFallback = () => {
      const all = generateLegacyLearners(780);
      const filtered = all.filter((l) => {
        if (selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') {
          return l.campusName.includes('Mushitala') || l.campusName.includes('Kansanshi') || l.stage === 'SECONDARY' || l.studentType === 'BOARDER';
        }
        if (selectedCampus === 'URBAN') {
          return l.campusName.includes('Urban') || l.stage === 'PRIMARY' || l.stage === 'ECE';
        }
        return true;
      });
      const chosen = filtered.length > 0 ? filtered : all;
      setReportCards(generateMockReportsFromLearners(chosen));
    };

    fetch(`/api/students?campusId=${selectedCampus}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setReportCards(generateMockReportsFromLearners(json.data));
        } else {
          loadFallback();
        }
      })
      .catch((err) => {
        console.warn('[Academics] Falling back to local offline learner assessment database:', err);
        loadFallback();
      })
      .finally(() => setIsLoading(false));
  }, [selectedCampus, selectedTerm]);

  // Stage transition workflow handlers
  const handleSupervisorEndorse = (id: string) => {
    setReportCards((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'ENDORSED', supervisorRemarks: 'Verified and endorsed by Senior Teacher / Supervisor.' } : r
      )
    );
    setDispatchStatus('Endorsed by Supervisor. Ready for Principal sign-off.');
    setTimeout(() => setDispatchStatus(null), 3000);
  };

  const handlePrincipalApprove = (id: string) => {
    setReportCards((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'APPROVED', principalRemarks: 'Approved for official release by Principal Mwansa.' } : r
      )
    );
    setDispatchStatus('Sanctioned by Principal. Report is now approved for publishing & dispatch.');
    setTimeout(() => setDispatchStatus(null), 3000);
  };

  const handlePublishAndDispatch = (id: string, channels: ('whatsapp' | 'email')[]) => {
    setReportCards((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: 'PUBLISHED',
            dispatchedViaWhatsApp: channels.includes('whatsapp') || r.dispatchedViaWhatsApp,
            dispatchedViaEmail: channels.includes('email') || r.dispatchedViaEmail,
          };
        }
        return r;
      })
    );
    const channelNames = channels.map((c) => (c === 'whatsapp' ? 'WhatsApp' : 'Email')).join(' and ');
    setDispatchStatus(`Published! Official report card sent to guardian via ${channelNames}.`);
    setTimeout(() => setDispatchStatus(null), 4000);
  };

  const columns: ColumnDef<AcademicReport>[] = [
    {
      key: 'studentNumber',
      header: 'Student ID',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-blue-700">{r.studentNumber}</span>,
    },
    {
      key: 'learnerName',
      header: 'Learner Name',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.learnerName}</span>
          <span className="text-[10px] text-slate-500">{r.guardianName} ({r.guardianPhone})</span>
        </div>
      ),
    },
    {
      key: 'className',
      header: 'Class Cohort',
      sortable: true,
      filterable: true,
      filterOptions: ['Grade 1A', 'Form 2 Green'],
    },
    {
      key: 'termName',
      header: 'Academic Term',
    },
    {
      key: 'aggregateScore',
      header: 'Term Average',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-black text-slate-900 text-sm">{r.aggregateScore}%</span>
          <span className="text-[10px] text-slate-400 block font-medium">Rank {r.rank}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Workflow Stage',
      sortable: true,
      filterable: true,
      filterOptions: ['DRAFT', 'SUBMITTED', 'ENDORSED', 'APPROVED', 'PUBLISHED'],
      render: (r) => {
        const badgeColors: Record<ApprovalStage, string> = {
          DRAFT: 'bg-slate-100 text-slate-700 border-slate-300',
          SUBMITTED: 'bg-amber-50 text-amber-700 border-amber-300',
          ENDORSED: 'bg-blue-50 text-blue-700 border-blue-300',
          APPROVED: 'bg-purple-50 text-purple-700 border-purple-300',
          PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-300',
        };
        const stageLabels: Record<ApprovalStage, string> = {
          DRAFT: '1. Teacher Draft',
          SUBMITTED: '2. Submitted',
          ENDORSED: '3. Supervisor Endorsed',
          APPROVED: '4. Principal Approved',
          PUBLISHED: '5. Published & Live',
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border inline-flex items-center gap-1 ${badgeColors[r.status]}`}
          >
            {r.status === 'PUBLISHED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
            {stageLabels[r.status]}
          </span>
        );
      },
    },
    {
      key: 'dispatched',
      header: 'Guardian Dispatch',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <span
            title={r.dispatchedViaWhatsApp ? 'Dispatched via WhatsApp' : 'Not yet dispatched to WhatsApp'}
            className={`p-1 rounded-md text-xs inline-flex items-center gap-1 font-semibold ${
              r.dispatchedViaWhatsApp
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span className="text-[10px]">WA</span>
          </span>
          <span
            title={r.dispatchedViaEmail ? 'Dispatched via Email' : 'Not yet dispatched to Email'}
            className={`p-1 rounded-md text-xs inline-flex items-center gap-1 font-semibold ${
              r.dispatchedViaEmail
                ? 'bg-blue-100 text-blue-800'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            <Mail className="w-3 h-3" />
            <span className="text-[10px]">Email</span>
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Toast Alert */}
      {dispatchStatus && (
        <div className="p-3.5 bg-emerald-900 text-emerald-100 rounded-xl shadow-lg border border-emerald-700 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{dispatchStatus}</span>
          </div>
          <button onClick={() => setDispatchStatus(null)} className="text-emerald-300 hover:text-white">✕</button>
        </div>
      )}

      {/* Header with Term and Campus Context */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-700" />
            Academic Governance & Results Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Zambia Education Curriculum 3-Tier Multi-Role Moderation: Subject Teacher → Senior Teacher/Supervisor → Principal/Headteacher → Guardian Dispatch.
          </p>
        </div>

        {/* Academic Term Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-600">Active Term:</span>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent border-none focus:outline-hidden cursor-pointer"
            >
              <option value="2026 Term 1">2026 Term 1 (Active)</option>
              <option value="2025 Term 3">2025 Term 3 (Archive)</option>
              <option value="2025 Term 2">2025 Term 2 (Archive)</option>
              <option value="2025 Term 1">2025 Term 1 (Archive)</option>
              <option value="2024 Term 3">2024 Term 3 (Archive)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4-Step Visual Workflow Progress Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tier 1</span>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <p className="text-xs font-bold text-slate-900 mt-1">Teacher Mark Entry</p>
          <span className="text-[11px] text-slate-500">Continuous Assessment (40%) + Exam (60%)</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-blue-200 bg-blue-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Tier 2</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <p className="text-xs font-bold text-slate-900 mt-1">Supervisor Endorsement</p>
          <span className="text-[11px] text-slate-500">Senior Teacher curriculum & mark review</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-purple-200 bg-purple-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Tier 3</span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <p className="text-xs font-bold text-slate-900 mt-1">Principal Sanction</p>
          <span className="text-[11px] text-slate-500">Executive headteacher sign-off & lock</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-emerald-200 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-xs font-bold text-slate-900 mt-1">Publish & Dispatch</p>
          <span className="text-[11px] text-emerald-700">Parent Portal + WhatsApp + Email</span>
        </div>
      </div>

      {/* Report Cards Table with Row Actions */}
      <EnterpriseTable
        title={`${selectedTerm} Learner Assessment & Moderation Register`}
        description={`Displaying academic performance records for ${campusInfo?.name || 'Selected Campus'}. Complete the 3-tier moderation workflow before publishing to guardians.`}
        data={reportCards}
        columns={columns}
        isLoading={isLoading}
        exportFilename={`edusphere-academic-${selectedTerm.replace(/\s+/g, '-').toLowerCase()}`}
        rowActions={(row) => (
          <div className="flex items-center gap-1.5 justify-end">
            <button
              onClick={() => setSelectedReport(row)}
              className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Dossier</span>
            </button>

            {/* Supervisor Endorse Action */}
            {row.status === 'SUBMITTED' && (
              <button
                onClick={() => handleSupervisorEndorse(row.id)}
                className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
              >
                Endorse
              </button>
            )}

            {/* Principal Approve Action */}
            {row.status === 'ENDORSED' && (
              <button
                onClick={() => handlePrincipalApprove(row.id)}
                className="px-2.5 py-1 text-[11px] font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-2xs"
              >
                Principal Sign-Off
              </button>
            )}

            {/* Publish & Multi-Channel Dispatch */}
            {row.status === 'APPROVED' && (
              <button
                onClick={() => handlePublishAndDispatch(row.id, ['whatsapp', 'email'])}
                className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs inline-flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                Publish & Dispatch
              </button>
            )}

            {row.status === 'PUBLISHED' && (
              <button
                onClick={() => handlePublishAndDispatch(row.id, ['whatsapp'])}
                className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                title="Resend to Guardian via WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Resend</span>
              </button>
            )}
          </div>
        )}
      />

      {/* Printable / Inspectable Report Card Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-8 shadow-2xl border border-slate-200 print:p-0 print:shadow-none print:border-none">
            {/* Action Bar (Top) */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 no-print">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    selectedReport.status === 'PUBLISHED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedReport.status === 'APPROVED'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  Status: {selectedReport.status}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Rank: <strong className="text-slate-900">{selectedReport.rank}</strong> • Term Average:{' '}
                  <strong className="text-slate-900">{selectedReport.aggregateScore}%</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePublishAndDispatch(selectedReport.id, ['whatsapp'])}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </button>
                <button
                  onClick={() => handlePublishAndDispatch(selectedReport.id, ['email'])}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send via Email</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Report Card Body */}
            <div className="p-4 border border-slate-300 rounded-xl bg-white shadow-2xs">
              {/* Report Header */}
              <div className="text-center pb-6 border-b-2 border-slate-900">
                <div className="w-14 h-14 rounded-2xl bg-blue-900 text-amber-300 mx-auto flex items-center justify-center font-black text-2xl mb-2 shadow-sm">
                  LSS
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  Legacy School Solwezi
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  We Strive for Your Academic and Moral Excellence • Plot 889/890 Kansanshi Mine Road, Solwezi
                </p>
                <div className="mt-3 inline-block px-5 py-1.5 rounded-full bg-slate-900 text-amber-300 font-black text-xs uppercase tracking-widest shadow-2xs">
                  Official Learner Progress Report Card • {selectedReport.termName}
                </div>
              </div>

              {/* Learner & Guardian Info Card */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Learner</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedReport.learnerName}</p>
                  <p className="font-mono text-blue-700 text-[11px]">{selectedReport.studentNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Class & Campus</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedReport.className}</p>
                  <p className="text-slate-600 text-[11px]">{campusInfo?.name || 'Mushitala Campus'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Attendance & Days</span>
                  <p className="font-bold text-slate-900 mt-0.5">58 / 60 Days</p>
                  <p className="text-emerald-700 font-semibold text-[11px]">96.7% Regularity</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Parent / Guardian</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedReport.guardianName}</p>
                  <p className="text-slate-600 font-mono text-[11px]">{selectedReport.guardianPhone}</p>
                </div>
              </div>

              {/* Comprehensive Subject Marks & Multi-Assessment Breakdown */}
              <div className="py-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Continuous Assessment & Summative Examination Portfolio</span>
                  <span className="text-[10px] font-normal text-slate-500 lowercase">
                    (hw: 10% | tests: 15% | mid-ca: 15% | mock: 20% | final: 40%)
                  </span>
                </h4>
                <table className="w-full text-xs text-left border-collapse border border-slate-200">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-100 text-slate-800">
                      <th className="py-2 px-3 font-bold">Subject Area</th>
                      <th className="py-2 px-2 font-bold text-center">HW (10%)</th>
                      <th className="py-2 px-2 font-bold text-center">Tests (15%)</th>
                      <th className="py-2 px-2 font-bold text-center">CA (15%)</th>
                      <th className="py-2 px-2 font-bold text-center">Mock (20%)</th>
                      <th className="py-2 px-2 font-bold text-center">Final (40%)</th>
                      <th className="py-2 px-3 font-bold text-center bg-slate-200">Total (100%)</th>
                      <th className="py-2 px-3 font-bold">Letter Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedReport.subjects.map((sub, sIdx) => (
                      <tr key={sIdx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-900">{sub.name}</td>
                        <td className="py-2 px-2 text-center text-slate-600">{sub.homeworkScore}</td>
                        <td className="py-2 px-2 text-center text-slate-600">{sub.weeklyTestsScore}</td>
                        <td className="py-2 px-2 text-center text-slate-600">{sub.midTermCaScore}</td>
                        <td className="py-2 px-2 text-center text-slate-600">{sub.mockExamScore}</td>
                        <td className="py-2 px-2 text-center text-slate-600">{sub.finalExamScore}</td>
                        <td className="py-2 px-3 text-center font-black bg-slate-50 text-slate-900">
                          {sub.total}%
                        </td>
                        <td className="py-2 px-3 font-bold text-emerald-700">{sub.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 3-Tier Multi-Role Signatures & Remarks */}
              <div className="py-4 border-t border-slate-200 text-xs grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Class Teacher Remarks</span>
                  </div>
                  <p className="text-slate-700 italic text-[11px] leading-relaxed">
                    &ldquo;{selectedReport.teacherRemarks}&rdquo;
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 font-semibold">Mrs. Grace Mumba • Form Teacher</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Senior Supervisor Review</span>
                  </div>
                  <p className="text-slate-700 italic text-[11px] leading-relaxed">
                    &ldquo;{selectedReport.supervisorRemarks}&rdquo;
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 font-semibold">Mr. Patrick Banda • HoD Sciences</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Principal / Head Sign-Off</span>
                  </div>
                  <p className="text-slate-700 italic text-[11px] leading-relaxed">
                    &ldquo;{selectedReport.principalRemarks}&rdquo;
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 font-semibold">Mr. Emmanuel Mwansa • Principal</p>
                </div>
              </div>

              {/* Security Seal & QR Verification */}
              <div className="pt-6 border-t-2 border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                <div>
                  <p className="font-mono text-slate-700 font-bold">Verification: EDS-2026-T1-HEX-9821A</p>
                  <p className="text-[10px]">Ministry of Education Republic of Zambia • Sovereign SMIS Standard</p>
                </div>
                <div className="text-right">
                  <div className="inline-block border-2 border-dashed border-blue-900 px-4 py-2 font-black text-blue-900 uppercase tracking-widest text-[11px] rounded-lg">
                    Official School Seal & Sanction
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
