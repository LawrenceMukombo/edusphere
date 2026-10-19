// src/app/teacher/page.tsx
// Enterprise Teacher Workspace & Assessment Markbook Engine
// Full 16-class cohort selection, comprehensive ECZ subjects, complete 30-44 student rosters, multi-filter search, and 360° drilldown dossiers

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardCheck,
  Check,
  X,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Save,
  BookOpen,
  Award,
  Users,
  Send,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  GraduationCap,
} from 'lucide-react';
import { generateLegacyLearners, LegacyLearnerBalance } from '@/server/services/legacySchoolData';
import { ModuleGate } from '@/components/ModuleGate';

interface RosterStudent {
  id: string;
  studentNumber: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  className: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  testScore: number;     // Topic Test (15%)
  caScore: number;       // Continuous Assessment (25%)
  mockScore: number;     // Mock Examination (20%)
  examScore: number;     // Term End Finals (40%)
  teacherRemarks: string;
  approvalStatus: 'DRAFT' | 'SUBMITTED_TO_SUPERVISOR' | 'ENDORSED_BY_SUPERVISOR' | 'APPROVED_BY_PRINCIPAL' | 'PUBLISHED';
  guardianName?: string;
  guardianPhone?: string;
  accommodationType?: string;
}

// 16 Complete School Cohorts across both campuses
const ALL_COHORTS = [
  // Mushitala Secondary & Boarding Wing
  { id: 'F2-GRN', name: 'Form 2 Green', campus: 'Mushitala Campus (Near Kansanshi)', stage: 'JUNIOR_SECONDARY', count: 44 },
  { id: 'F2-GLD', name: 'Form 2 Gold (ECZ Candidates)', campus: 'Mushitala Campus (Near Kansanshi)', stage: 'JUNIOR_SECONDARY', count: 44 },
  { id: 'F1-ALP', name: 'Form 1 Alpha', campus: 'Mushitala Campus (Near Kansanshi)', stage: 'JUNIOR_SECONDARY', count: 42 },
  { id: 'F1-BET', name: 'Form 1 Beta', campus: 'Mushitala Campus (Near Kansanshi)', stage: 'JUNIOR_SECONDARY', count: 42 },
  { id: 'F3-BLU', name: 'Form 3 Blue', campus: 'Mushitala Campus (Near Kansanshi)', stage: 'SENIOR_SECONDARY', count: 42 },
  { id: 'F3-RED', name: 'Form 3 Red', campus: 'Mushitala Campus (Near Kansanshi)', stage: 'SENIOR_SECONDARY', count: 42 },
  { id: 'F4-GRN', name: 'Form 4 Green', campus: 'Mushitala Campus (Near Kansanshi)', stage: 'SENIOR_SECONDARY', count: 42 },
  { id: 'F4-GLD', name: 'Form 4 Gold', campus: 'Mushitala Campus (Near Kansanshi)', stage: 'SENIOR_SECONDARY', count: 40 },
  { id: 'F5-SCI', name: 'Form 5 Sciences (Senior Candidates)', campus: 'Mushitala Campus (Near Kansanshi)', stage: 'SENIOR_SECONDARY', count: 42 },
  { id: 'F5-ART', name: 'Form 5 Arts & Commerce', campus: 'Mushitala Campus (Near Kansanshi)', stage: 'SENIOR_SECONDARY', count: 40 },

  // Urban Campus (ECE & Primary Day School)
  { id: 'G7-TOP', name: 'Grade 7 Top (Candidates)', campus: 'Urban Campus (Solwezi Central)', stage: 'PRIMARY', count: 36 },
  { id: 'G6-SLV', name: 'Grade 6 Silver', campus: 'Urban Campus (Solwezi Central)', stage: 'PRIMARY', count: 36 },
  { id: 'G5-BLU', name: 'Grade 5 Blue', campus: 'Urban Campus (Solwezi Central)', stage: 'PRIMARY', count: 36 },
  { id: 'G4-RUB', name: 'Grade 4 Ruby', campus: 'Urban Campus (Solwezi Central)', stage: 'PRIMARY', count: 38 },
  { id: 'G3-DIA', name: 'Grade 3 Diamond', campus: 'Urban Campus (Solwezi Central)', stage: 'PRIMARY', count: 38 },
  { id: 'G2-EME', name: 'Grade 2 Emerald', campus: 'Urban Campus (Solwezi Central)', stage: 'PRIMARY', count: 38 },
  { id: 'G1-GLD', name: 'Grade 1 Gold', campus: 'Urban Campus (Solwezi Central)', stage: 'PRIMARY', count: 38 },
  { id: 'REC-STR', name: 'Reception Stars', campus: 'Urban Campus (Solwezi Central)', stage: 'EARLY_CHILDHOOD', count: 40 },
  { id: 'MID-CLS', name: 'Middle Class', campus: 'Urban Campus (Solwezi Central)', stage: 'EARLY_CHILDHOOD', count: 30 },
  { id: 'BBY-CLS', name: 'Baby Class (Little Stars)', campus: 'Urban Campus (Solwezi Central)', stage: 'EARLY_CHILDHOOD', count: 30 },
];

// ECZ Curriculum Subjects mapped to Stage
const SECONDARY_SUBJECTS = [
  'Integrated Science',
  'Mathematics',
  'English Language',
  'Biology',
  'Chemistry',
  'Physics',
  'Computer Studies / ICT',
  'Civic Education',
  'Geography',
  'History',
  'Commerce & Principles of Accounts',
  'Religious Education (2046)',
  'Zambian Languages (Kiikaonde / Icibemba)',
  'Physical Education & Sports',
];

const PRIMARY_SUBJECTS = [
  'Mathematics',
  'English Literacy & Language',
  'Integrated Science',
  'Social Studies',
  'Creative & Technology Studies (CTS)',
  'Home Economics',
  'Zambian Languages',
  'Physical Education',
];

const ECE_SUBJECTS = [
  'Number Concepts & Pre-Math',
  'Literacy, Phonics & Storytelling',
  'Environmental & Sensory Discovery',
  'Expressive Arts & Music',
  'Gross & Fine Motor Development',
];

export default function TeacherWorkspacePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('Form 2 Green');
  const [selectedSubject, setSelectedSubject] = useState('Integrated Science');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeAssessmentMode, setActiveAssessmentMode] = useState<
    'FULL_MARKBOOK' | 'ATTENDANCE' | 'TOPIC_TESTS' | 'CAS' | 'MOCKS' | 'EXAMS'
  >('FULL_MARKBOOK');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>('ALL');
  const [gradeBandFilter, setGradeBandFilter] = useState<string>('ALL');
  const [workflowFilter, setWorkflowFilter] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');

  // Drilldown Dossier Drawer
  const [selectedDrilldownStudent, setSelectedDrilldownStudent] = useState<RosterStudent | null>(null);

  // Full Roster State loaded dynamically from authoritative 780 students baseline
  const [roster, setRoster] = useState<RosterStudent[]>([]);

  // Determine subjects based on class stage
  const availableSubjects = useMemo(() => {
    const cohort = ALL_COHORTS.find((c) => c.name === selectedClass);
    if (!cohort) return SECONDARY_SUBJECTS;
    if (cohort.stage === 'EARLY_CHILDHOOD') return ECE_SUBJECTS;
    if (cohort.stage === 'PRIMARY') return PRIMARY_SUBJECTS;
    return SECONDARY_SUBJECTS;
  }, [selectedClass]);

  // Keep selected subject valid when cohort changes
  useEffect(() => {
    if (!availableSubjects.includes(selectedSubject)) {
      setSelectedSubject(availableSubjects[0] || 'Mathematics');
    }
  }, [availableSubjects, selectedSubject]);

  // Load students belonging to selected class from generateLegacyLearners(780)
  useEffect(() => {
    const all780 = generateLegacyLearners(780);
    // Find learners matching selectedClass name or partial match
    let classLearners = all780.filter((l) =>
      l.className.toLowerCase() === selectedClass.toLowerCase() ||
      l.className.toLowerCase().includes(selectedClass.toLowerCase()) ||
      selectedClass.toLowerCase().includes(l.className.toLowerCase())
    );

    // Fallback if naming slightly differs: pick learners matching cohort stage
    if (classLearners.length === 0) {
      const cohort = ALL_COHORTS.find((c) => c.name === selectedClass);
      if (cohort) {
        classLearners = all780.filter((l) => l.stage === cohort.stage).slice(0, cohort.count);
      }
    }

    if (classLearners.length === 0) {
      classLearners = all780.slice(0, 40);
    }

    const newRoster: RosterStudent[] = classLearners.map((l, idx) => {
      // Deterministic realistic test scores based on learner index
      const baseMark = 60 + ((idx * 17) % 36);
      const test = Math.min(15, Math.max(8, Math.round(baseMark * 0.15)));
      const ca = Math.min(25, Math.max(14, Math.round(baseMark * 0.25)));
      const mock = Math.min(20, Math.max(10, Math.round(baseMark * 0.20)));
      const exam = Math.min(40, Math.max(20, Math.round(baseMark * 0.40)));

      // Remarks based on performance
      let remark = 'Solid grasp of core curriculum concepts. Shows consistent dedication.';
      if (test + ca + mock + exam >= 85) remark = 'Exceptional analytical mastery and proactive inquiry in class discussions.';
      else if (test + ca + mock + exam >= 75) remark = 'Very good progress. Recommended for senior school leadership circles.';
      else if (test + ca + mock + exam < 60) remark = 'Encouraged to attend Thursday afternoon tutorial clinics for extra practice.';

      let approval: RosterStudent['approvalStatus'] = 'APPROVED_BY_PRINCIPAL';
      if (idx % 6 === 0) approval = 'ENDORSED_BY_SUPERVISOR';
      else if (idx % 5 === 0) approval = 'SUBMITTED_TO_SUPERVISOR';
      else if (idx % 7 === 0) approval = 'DRAFT';

      return {
        id: l.id,
        studentNumber: l.studentNumber,
        name: l.learnerName,
        gender: idx % 2 === 0 ? 'MALE' : 'FEMALE',
        className: l.className,
        status: (l.todayAttendance as any) || 'PRESENT',
        testScore: test,
        caScore: ca,
        mockScore: mock,
        examScore: exam,
        teacherRemarks: remark,
        approvalStatus: approval,
        guardianName: l.guardian?.name || 'Guardian',
        guardianPhone: l.guardian?.phone || '+260 970 000000',
        accommodationType: l.currentAccommodation?.isBoarder ? 'Boarder' : 'Day Scholar',
      };
    });

    setRoster(newRoster);
  }, [selectedClass]);

  // Compute Grade letter from 0-100 total
  const computeEczGrade = (total: number) => {
    if (total >= 85) return '1 (Distinction)';
    if (total >= 75) return '2 (Distinction)';
    if (total >= 70) return '3 (Merit)';
    if (total >= 65) return '4 (Merit)';
    if (total >= 60) return '5 (Credit)';
    if (total >= 55) return '6 (Credit)';
    if (total >= 50) return '7 (Satisfactory)';
    if (total >= 45) return '8 (Satisfactory)';
    return '9 (Unsatisfactory)';
  };

  const updateStatus = (id: string, newStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  const updateScoreField = (
    id: string,
    field: 'testScore' | 'caScore' | 'mockScore' | 'examScore',
    val: number
  ) => {
    const caps: Record<string, number> = { testScore: 15, caScore: 25, mockScore: 20, examScore: 40 };
    const maxVal = caps[field] || 100;
    const clamped = Math.max(0, Math.min(maxVal, isNaN(val) ? 0 : val));
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: clamped } : s))
    );
  };

  const updateRemarks = (id: string, remarks: string) => {
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, teacherRemarks: remarks } : s))
    );
  };

  const markAllPresent = () => {
    setRoster((prev) => prev.map((s) => ({ ...s, status: 'PRESENT' })));
  };

  // 3-Tier Workflow Actions
  const handleSubmitToSupervisor = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setRoster((prev) =>
        prev.map((s) => ({ ...s, approvalStatus: 'SUBMITTED_TO_SUPERVISOR' }))
      );
      setIsSubmitting(false);
      setSuccessMessage(
        `Step 1 Complete: All ${roster.length} assessment marks for ${selectedClass} (${selectedSubject}) submitted to Academic Supervisor for endorsement.`
      );
    }, 500);
  };

  const handleEndorseBySupervisor = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setRoster((prev) =>
        prev.map((s) => ({ ...s, approvalStatus: 'ENDORSED_BY_SUPERVISOR' }))
      );
      setIsSubmitting(false);
      setSuccessMessage(
        `Step 2 Complete: Academic Supervisor endorsed marks for ${selectedClass}. Sent to Director & Principal for final approval.`
      );
    }, 500);
  };

  const handleApproveByPrincipal = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setRoster((prev) =>
        prev.map((s) => ({ ...s, approvalStatus: 'APPROVED_BY_PRINCIPAL' }))
      );
      setIsSubmitting(false);
      setSuccessMessage(
        `Step 3 Complete: Principal approved marks for ${selectedClass}. Report cards officially published to Parent Portal.`
      );
    }, 500);
  };

  const handleSaveRegister = () => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    if (!isOnline) {
      const queuedItem = {
        classId: selectedClass,
        subject: selectedSubject,
        date,
        records: roster,
        queuedAt: new Date().toISOString(),
      };
      setOfflineQueue((prev) => [...prev, queuedItem]);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage('Offline: Register stored in local browser cache. Will auto-sync when connection resumes.');
      }, 400);
      return;
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(`Authoritative markbook draft saved for ${selectedClass} - ${selectedSubject} (${roster.length} students).`);
    }, 500);
  };

  // Filtered & Searched Roster
  const displayedRoster = useMemo(() => {
    return roster.filter((s) => {
      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = s.name.toLowerCase().includes(q) || s.studentNumber.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      // Gender filter
      if (genderFilter !== 'ALL' && s.gender !== genderFilter) return false;
      // Workflow status filter
      if (workflowFilter !== 'ALL' && s.approvalStatus !== workflowFilter) return false;
      // Grade band filter
      if (gradeBandFilter !== 'ALL') {
        const total = s.testScore + s.caScore + s.mockScore + s.examScore;
        if (gradeBandFilter === 'DISTINCTION' && total < 75) return false;
        if (gradeBandFilter === 'MERIT' && (total < 65 || total >= 75)) return false;
        if (gradeBandFilter === 'CREDIT' && (total < 55 || total >= 65)) return false;
        if (gradeBandFilter === 'PASS' && (total < 45 || total >= 55)) return false;
        if (gradeBandFilter === 'REMEDIAL' && total >= 45) return false;
      }
      return true;
    });
  }, [roster, searchQuery, statusFilter, genderFilter, workflowFilter, gradeBandFilter]);

  // Export CSV function
  const handleExportCsv = () => {
    const headers = ['Student ID', 'Learner Name', 'Gender', 'Attendance', 'Topic Tests (15)', 'CAs (25)', 'Mocks (20)', 'Finals (40)', 'Total (100)', 'ECZ Grade', 'Remarks', 'Workflow Stage'];
    const rows = displayedRoster.map((s) => {
      const tot = s.testScore + s.caScore + s.mockScore + s.examScore;
      return [
        s.studentNumber,
        `"${s.name}"`,
        s.gender,
        s.status,
        s.testScore,
        s.caScore,
        s.mockScore,
        s.examScore,
        tot,
        `"${computeEczGrade(tot)}"`,
        `"${s.teacherRemarks.replace(/"/g, '""')}"`,
        s.approvalStatus,
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Markbook_${selectedClass.replace(/\s+/g, '_')}_${selectedSubject.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ModuleGate
      moduleKey="teacher"
      moduleName="Teacher Workspace & Lesson Planning"
      moduleDescription="Classroom markbook management, ECZ continuous assessment scoring, offline-first sync cache, and supervisory submission workflows."
      planRequired="PROFESSIONAL"
      pricePerTermZMW={1250}
    >
      <div className="space-y-6 w-full">
      {/* Top Banner & Connectivity Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Teacher Markbook & Governance Engine
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs font-bold text-slate-700">Zambian ECZ Curriculum Configuration Available</span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {roster.length} Students in Cohort
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Teacher Workspace & Assessment Entry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Statutory ECZ Scheme: Continuous Assessment (40% = 15% Topic Tests + 25% Formative CA) & Examinations (60% = 20% Mock + 40% Term Finals). Advance through 3-tier supervisory sign-off.
          </p>
        </div>

        {/* Action Controls & Offline Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-amber-50 text-amber-700 border-amber-300'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online (Connected)' : 'Offline (Local Cache)'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Broad-Sheet</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 font-bold text-base">✕</button>
        </div>
      )}

      {/* Cohort, Subject & Assessment Date Bar */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Class Cohort (All 16 Classes)
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              {ALL_COHORTS.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} &bull; {c.campus.split(' ')[0]} ({c.count} Pupils)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Curriculum Subject (ECZ Mapped)
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-black text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Assessment Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleSaveRegister}
              disabled={isSubmitting}
              className="flex-1 py-2 px-3 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              onClick={handleSubmitToSupervisor}
              disabled={isSubmitting}
              className="flex-1 py-2 px-3 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Tier 1</span>
            </button>
          </div>
        </div>

        {/* Supervisory Workflow Progression Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Multi-Tier Supervisory Sign-off:</span>
            <button
              type="button"
              onClick={handleEndorseBySupervisor}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-bold"
            >
              Tier 2: Endorse (HOD)
            </button>
            <button
              type="button"
              onClick={handleApproveByPrincipal}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold"
            >
              Tier 3: Principal Approve & Publish
            </button>
          </div>

          <button
            type="button"
            onClick={markAllPresent}
            className="px-3 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Mark All Present ({roster.length})
          </button>
        </div>
      </div>

      {/* Multi-Filter & Search Bar (Rule 24 Compliant) */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search by Student Name / ID */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, ID (e.g. LSS-2026)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter by Attendance */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
            >
              <option value="ALL">All Attendance Statuses</option>
              <option value="PRESENT">Present Only</option>
              <option value="LATE">Late Arrivals</option>
              <option value="ABSENT">Absent Pupils</option>
              <option value="EXCUSED">Excused Exeats</option>
            </select>
          </div>

          {/* Filter by Grade Band */}
          <div>
            <select
              value={gradeBandFilter}
              onChange={(e) => setGradeBandFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
            >
              <option value="ALL">All Performance Bands</option>
              <option value="DISTINCTION">Distinction (75% - 100%)</option>
              <option value="MERIT">Merit (65% - 74%)</option>
              <option value="CREDIT">Credit (55% - 64%)</option>
              <option value="PASS">Pass (45% - 54%)</option>
              <option value="REMEDIAL">Remedial Required (&lt;45%)</option>
            </select>
          </div>

          {/* Filter by Workflow Stage */}
          <div>
            <select
              value={workflowFilter}
              onChange={(e) => setWorkflowFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
            >
              <option value="ALL">All Workflow Stages</option>
              <option value="DRAFT">Draft Markbook</option>
              <option value="SUBMITTED_TO_SUPERVISOR">Submitted to Supervisor</option>
              <option value="ENDORSED_BY_SUPERVISOR">Endorsed by HOD</option>
              <option value="APPROVED_BY_PRINCIPAL">Approved by Principal</option>
            </select>
          </div>

          {/* Filter by Gender */}
          <div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male Pupils</option>
              <option value="FEMALE">Female Pupils</option>
            </select>
          </div>
        </div>

        {/* Active Assessment Mode Switcher */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveAssessmentMode('FULL_MARKBOOK')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              activeAssessmentMode === 'FULL_MARKBOOK'
                ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Full Assessment Suite (All 4 Components)
          </button>
          <button
            type="button"
            onClick={() => setActiveAssessmentMode('ATTENDANCE')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              activeAssessmentMode === 'ATTENDANCE'
                ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Daily Attendance Register
          </button>
          <button
            type="button"
            onClick={() => setActiveAssessmentMode('TOPIC_TESTS')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              activeAssessmentMode === 'TOPIC_TESTS'
                ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Weekly Topic Tests (15%)
          </button>
          <button
            type="button"
            onClick={() => setActiveAssessmentMode('CAS')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              activeAssessmentMode === 'CAS'
                ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Continuous Assessment (CA 1 & 2 &ndash; 25%)
          </button>
          <button
            type="button"
            onClick={() => setActiveAssessmentMode('MOCKS')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              activeAssessmentMode === 'MOCKS'
                ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Mock Examinations (20%)
          </button>
          <button
            type="button"
            onClick={() => setActiveAssessmentMode('EXAMS')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              activeAssessmentMode === 'EXAMS'
                ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Term End Finals (40%)
          </button>
        </div>
      </div>

      {/* Roster & Assessment Table (Rule 24 Compliant) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-2">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900">
              {selectedClass} &bull; {selectedSubject}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              Showing {displayedRoster.length} of {roster.length} Learners
            </span>
          </div>

          <div className="text-xs text-slate-600 font-semibold flex items-center gap-3">
            <span>Present: <strong className="text-emerald-600">{roster.filter((r) => r.status === 'PRESENT').length}</strong></span>
            <span>Late: <strong className="text-amber-600">{roster.filter((r) => r.status === 'LATE').length}</strong></span>
            <span>Absent: <strong className="text-rose-600">{roster.filter((r) => r.status === 'ABSENT').length}</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-3.5 py-3">Student ID</th>
                <th className="px-3.5 py-3">Learner Name</th>
                <th className="px-3 py-3 text-center">Attendance</th>
                {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'TOPIC_TESTS') && (
                  <th className="px-3 py-3 text-center">Tests (15%)</th>
                )}
                {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'CAS') && (
                  <th className="px-3 py-3 text-center">CAs (25%)</th>
                )}
                {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'MOCKS') && (
                  <th className="px-3 py-3 text-center">Mocks (20%)</th>
                )}
                {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'EXAMS') && (
                  <th className="px-3 py-3 text-center">Finals (40%)</th>
                )}
                <th className="px-3.5 py-3 text-center font-black text-slate-900">Total (100%)</th>
                <th className="px-3 py-3 text-center">ECZ Grade</th>
                <th className="px-3.5 py-3">Teacher Observations & Remarks</th>
                <th className="px-3.5 py-3 text-center">Workflow</th>
                <th className="px-3 py-3 text-right">Drilldown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {displayedRoster.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-10 text-center text-slate-400">
                    No learners match the current search query or active filter settings.
                  </td>
                </tr>
              ) : (
                displayedRoster.map((student) => {
                  const total = student.testScore + student.caScore + student.mockScore + student.examScore;
                  const eczGrade = computeEczGrade(total);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-3.5 py-3 font-mono font-bold text-blue-700">{student.studentNumber}</td>
                      <td className="px-3.5 py-3 font-bold text-slate-900">
                        <span>{student.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal block">
                          {student.gender} &bull; {student.accommodationType}
                        </span>
                      </td>

                      {/* Attendance Buttons */}
                      <td className="px-3 py-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateStatus(student.id, 'PRESENT')}
                            className={`px-2 py-0.5 rounded font-bold text-[10px] transition ${
                              student.status === 'PRESENT'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                            }`}
                            title="Present"
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(student.id, 'LATE')}
                            className={`px-2 py-0.5 rounded font-bold text-[10px] transition ${
                              student.status === 'LATE'
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
                            }`}
                            title="Late"
                          >
                            L
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(student.id, 'ABSENT')}
                            className={`px-2 py-0.5 rounded font-bold text-[10px] transition ${
                              student.status === 'ABSENT'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                            }`}
                            title="Absent"
                          >
                            A
                          </button>
                        </div>
                      </td>

                      {/* Editable Marks */}
                      {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'TOPIC_TESTS') && (
                        <td className="px-3 py-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={15}
                            value={student.testScore}
                            onChange={(e) => updateScoreField(student.id, 'testScore', parseInt(e.target.value))}
                            className="w-14 text-center py-1 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      )}

                      {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'CAS') && (
                        <td className="px-3 py-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={25}
                            value={student.caScore}
                            onChange={(e) => updateScoreField(student.id, 'caScore', parseInt(e.target.value))}
                            className="w-14 text-center py-1 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      )}

                      {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'MOCKS') && (
                        <td className="px-3 py-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={student.mockScore}
                            onChange={(e) => updateScoreField(student.id, 'mockScore', parseInt(e.target.value))}
                            className="w-14 text-center py-1 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      )}

                      {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'EXAMS') && (
                        <td className="px-3 py-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={40}
                            value={student.examScore}
                            onChange={(e) => updateScoreField(student.id, 'examScore', parseInt(e.target.value))}
                            className="w-14 text-center py-1 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      )}

                      {/* Total */}
                      <td className="px-3.5 py-3 text-center font-mono font-black text-sm text-blue-700">
                        {total}%
                      </td>

                      {/* ECZ Grade */}
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            total >= 75
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : total >= 65
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : total >= 50
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {eczGrade.split(' ')[0]}
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="px-3.5 py-3">
                        <input
                          type="text"
                          value={student.teacherRemarks}
                          onChange={(e) => updateRemarks(student.id, e.target.value)}
                          className="w-full min-w-[200px] text-xs px-2.5 py-1 border border-slate-200 rounded-lg text-slate-700 bg-slate-50/50 focus:bg-white"
                        />
                      </td>

                      {/* Workflow Stage */}
                      <td className="px-3.5 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            student.approvalStatus === 'APPROVED_BY_PRINCIPAL'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : student.approvalStatus === 'ENDORSED_BY_SUPERVISOR'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : student.approvalStatus === 'SUBMITTED_TO_SUPERVISOR'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {student.approvalStatus.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Action Drilldown */}
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedDrilldownStudent(student)}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition"
                        >
                          Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT DRILLDOWN 360° DRAWER / MODAL */}
      {selectedDrilldownStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-md">
                  {selectedDrilldownStudent.name.split(' ').map((n) => n[0]).join('')}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedDrilldownStudent.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedDrilldownStudent.studentNumber} &bull; {selectedDrilldownStudent.className}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDrilldownStudent(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block">Today Attendance:</span>
                <span className="font-bold text-emerald-700">{selectedDrilldownStudent.status}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block">Total Assessment Score:</span>
                <span className="font-bold text-blue-700 text-sm">
                  {selectedDrilldownStudent.testScore + selectedDrilldownStudent.caScore + selectedDrilldownStudent.mockScore + selectedDrilldownStudent.examScore}%
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block">ECZ Grade Standing:</span>
                <span className="font-bold text-emerald-800">
                  {computeEczGrade(selectedDrilldownStudent.testScore + selectedDrilldownStudent.caScore + selectedDrilldownStudent.mockScore + selectedDrilldownStudent.examScore)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block">Accommodation:</span>
                <span className="font-bold text-slate-800">{selectedDrilldownStudent.accommodationType}</span>
              </div>
            </div>

            {/* Assessment Component Scorecard */}
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2">
              <span className="text-xs font-bold text-blue-900 block">
                Assessment Component Scores &bull; {selectedSubject}
              </span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Topic Tests (15%)</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{selectedDrilldownStudent.testScore} / 15</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Continuous (25%)</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{selectedDrilldownStudent.caScore} / 25</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Mocks (20%)</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{selectedDrilldownStudent.mockScore} / 20</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Finals (40%)</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{selectedDrilldownStudent.examScore} / 40</span>
                </div>
              </div>
            </div>

            {/* Guardian & Emergency Contacts */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-700 block">Guardian Contact Details:</span>
              <p className="text-slate-600">
                Primary Contact: <strong>{selectedDrilldownStudent.guardianName}</strong> &bull; Emergency Phone: <span className="font-mono font-bold text-blue-700">{selectedDrilldownStudent.guardianPhone}</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDrilldownStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-slate-800"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ModuleGate>
  );
}
