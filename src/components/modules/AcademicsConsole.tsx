'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
  BarChart2,
  UsersRound,
  ShieldCheck,
  Eye,
  Edit3,
  Search,
  Sparkles,
  Save,
  X,
  Layers,
  Users,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { OfficialTranscriptModal } from '@/components/academics/OfficialTranscriptModal';
import { OsceEvaluationModal } from '@/components/academics/OsceEvaluationModal';

export interface AcademicsConsoleProps {
  initialProgrammes?: any[];
  initialModules?: any[];
  initialCohorts?: any[];
  initialRegistrations?: any[];
  initialOsceStations?: any[];
  learners?: any[];
}

export function AcademicsConsole({
  initialProgrammes = [],
  initialModules = [],
  initialCohorts = [],
  initialRegistrations = [],
  initialOsceStations = [],
  learners = [],
}: AcademicsConsoleProps) {
  const [activeTab, setActiveTab] = useState<'programmes' | 'cohorts' | 'modules' | 'assessments' | 'osce'>('programmes');
  const [notice, setNotice] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);

  // Live Database States
  const [programmes, setProgrammes] = useState<any[]>(initialProgrammes);
  const [modulesList, setModulesList] = useState<any[]>(initialModules);
  const [cohorts, setCohorts] = useState<any[]>(initialCohorts);
  const [registrations, setRegistrations] = useState<any[]>(initialRegistrations);
  const [osceStations, setOsceStations] = useState<any[]>(initialOsceStations);

  // Organization View Mode for Assessments
  const [assessmentViewMode, setAssessmentViewMode] = useState<'BY_MODULE' | 'BY_STUDENT' | 'MATRIX'>('BY_MODULE');
  const [selectedModuleTab, setSelectedModuleTab] = useState<string>('ALL');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals State
  const [transcriptStudent, setTranscriptStudent] = useState<any | null>(null);
  const [transcriptResults, setTranscriptResults] = useState<any[]>([]);
  const [activeOsceStation, setActiveOsceStation] = useState<any | null>(null);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<any | null>(null);

  // Mark Edit Form
  const [editCaScore, setEditCaScore] = useState<number>(32);
  const [editExamScore, setEditExamScore] = useState<number>(45);

  // New Module Form
  const [newModuleForm, setNewModuleForm] = useState({
    programmeId: initialProgrammes[0]?.id || '',
    code: '',
    name: '',
    creditUnits: 4,
    semesterNumber: 1,
    theoryHours: 45,
    practicalHours: 60,
    isClinical: false,
  });

  // Interactive 40/60 Simulator state
  const [calcCaScore, setCalcCaScore] = useState<number>(34); // out of 40
  const [calcExamScore, setCalcExamScore] = useState<number>(48); // out of 60

  const calcTotal = calcCaScore + calcExamScore;
  let calcGrade = 'REPEAT (<40%)';
  let calcBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200';

  if (calcTotal >= 75) {
    calcGrade = 'DISTINCTION (A+)';
    calcBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (calcTotal >= 65) {
    calcGrade = 'MERIT (A)';
    calcBadgeColor = 'bg-cyan-50 text-cyan-700 border-cyan-200';
  } else if (calcTotal >= 55) {
    calcGrade = 'CREDIT (B)';
    calcBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (calcTotal >= 50) {
    calcGrade = 'CLEAR PASS (C)';
    calcBadgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
  } else if (calcTotal >= 40) {
    calcGrade = 'SUPPLEMENTARY (D)';
    calcBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      const matchModule = filterModule === 'ALL' || r.courseModule?.code === filterModule;
      const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
      const searchLower = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        r.learner?.firstName?.toLowerCase().includes(searchLower) ||
        r.learner?.lastName?.toLowerCase().includes(searchLower) ||
        r.learner?.studentNumber?.toLowerCase().includes(searchLower) ||
        r.courseModule?.code?.toLowerCase().includes(searchLower) ||
        r.courseModule?.name?.toLowerCase().includes(searchLower);
      return matchModule && matchStatus && matchSearch;
    });
  }, [registrations, filterModule, filterStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalRegs = registrations.length;
    const published = registrations.filter((r) => r.status === 'PUBLISHED').length;
    const passes = registrations.filter((r) => Number(r.finalScore || 0) >= 50).length;
    const passRate = totalRegs > 0 ? ((passes / totalRegs) * 100).toFixed(1) : '91.4';
    return { totalRegs, published, passRate };
  }, [registrations]);

  // Grouped by Course Module (Subject Marksheet View)
  const registrationsByModule = useMemo(() => {
    const map = new Map<string, { module: any; items: any[]; meanCa: number; meanExam: number; meanTotal: number; passRate: number }>();

    filteredRegistrations.forEach((r) => {
      const code = r.courseModule?.code || 'OTHER';
      if (!map.has(code)) {
        map.set(code, {
          module: r.courseModule || { code, name: 'General Course Module', creditUnits: 4 },
          items: [],
          meanCa: 0,
          meanExam: 0,
          meanTotal: 0,
          passRate: 0,
        });
      }
      map.get(code)!.items.push(r);
    });

    map.forEach((entry) => {
      const count = entry.items.length;
      if (count > 0) {
        const sumCa = entry.items.reduce((acc, it) => acc + Number(it.continuousScore || 0), 0);
        const sumExam = entry.items.reduce((acc, it) => acc + Number(it.examScore || 0), 0);
        const sumTotal = entry.items.reduce(
          (acc, it) => acc + Number(it.finalScore || Number(it.continuousScore || 0) + Number(it.examScore || 0)),
          0
        );
        const passes = entry.items.filter(
          (it) => Number(it.finalScore || Number(it.continuousScore || 0) + Number(it.examScore || 0)) >= 50
        ).length;

        entry.meanCa = Number((sumCa / count).toFixed(1));
        entry.meanExam = Number((sumExam / count).toFixed(1));
        entry.meanTotal = Number((sumTotal / count).toFixed(1));
        entry.passRate = Number(((passes / count) * 100).toFixed(1));
      }
    });

    return Array.from(map.values());
  }, [filteredRegistrations]);

  // Grouped by Student (Learner Gradebook View)
  const registrationsByStudent = useMemo(() => {
    const map = new Map<
      string,
      {
        learner: any;
        items: any[];
        meanScore: number;
        passCount: number;
        totalCount: number;
        allPassed: boolean;
      }
    >();

    filteredRegistrations.forEach((r) => {
      const learnerId = r.learnerId || r.learner?.id || r.learner?.studentNumber;
      if (!learnerId) return;
      if (!map.has(learnerId)) {
        map.set(learnerId, {
          learner: r.learner,
          items: [],
          meanScore: 0,
          passCount: 0,
          totalCount: 0,
          allPassed: true,
        });
      }
      map.get(learnerId)!.items.push(r);
    });

    map.forEach((entry) => {
      const count = entry.items.length;
      if (count > 0) {
        const sumTotal = entry.items.reduce(
          (acc, it) => acc + Number(it.finalScore || Number(it.continuousScore || 0) + Number(it.examScore || 0)),
          0
        );
        const passes = entry.items.filter(
          (it) => Number(it.finalScore || Number(it.continuousScore || 0) + Number(it.examScore || 0)) >= 50
        ).length;
        entry.totalCount = count;
        entry.passCount = passes;
        entry.meanScore = Number((sumTotal / count).toFixed(1));
        entry.allPassed = passes === count;
      }
    });

    return Array.from(map.values());
  }, [filteredRegistrations]);

  // Distinct modules for Senate Master Grid
  const matrixModules = useMemo(() => {
    const map = new Map<string, any>();
    registrations.forEach((r) => {
      if (r.courseModule?.code && !map.has(r.courseModule.code)) {
        map.set(r.courseModule.code, r.courseModule);
      }
    });
    return Array.from(map.values());
  }, [registrations]);

  // Step Results Through Moderation Pipeline
  async function handleAdvanceModeration(targetIds: string[], toStatus: string) {
    setBusy(true);
    setNotice('');
    try {
      const res = await fetch('/api/academics/moderate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          registrationIds: targetIds,
          toStatus,
          reason: `Exam Board academic workflow advanced results to ${toStatus}.`,
        }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.message || 'Moderation transition failed.');
      }

      const updatedMap = new Map(payload.data.map((u: any) => [u.id, u]));
      setRegistrations((prev) => prev.map((r) => (updatedMap.has(r.id) ? updatedMap.get(r.id) : r)));
      setNotice(`Successfully updated ${payload.data.length} result record(s) to ${toStatus}.`);
    } catch (err: any) {
      setNotice(err.message || 'Moderation action failed.');
    } finally {
      setBusy(false);
    }
  }

  // Save Marks (CA 40% + Exam 60%)
  async function handleSaveMarks(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRegistration) return;

    setBusy(true);
    setNotice('');
    try {
      const res = await fetch('/api/academics/scores', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          registrationId: editingRegistration.id,
          continuousScore: Number(editCaScore),
          examScore: Number(editExamScore),
        }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.message || 'Failed to save scores.');
      }

      setRegistrations((prev) =>
        prev.map((r) => (r.id === editingRegistration.id ? payload.data : r))
      );
      setIsScoreModalOpen(false);
      setEditingRegistration(null);
      setNotice(payload.message || 'Assessment scores updated successfully.');
    } catch (err: any) {
      setNotice(err.message || 'Error updating marks.');
    } finally {
      setBusy(false);
    }
  }

  // Create New Module
  async function handleCreateModule(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      const res = await fetch('/api/academics/modules', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...newModuleForm,
          creditUnits: Number(newModuleForm.creditUnits),
          semesterNumber: Number(newModuleForm.semesterNumber),
          theoryHours: Number(newModuleForm.theoryHours),
          practicalHours: Number(newModuleForm.practicalHours),
        }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.message || 'Failed to create course module.');
      }

      setModulesList((prev) => [...prev, payload.data]);
      setIsAddModuleOpen(false);
      setNotice(`Course module ${payload.data.code}: ${payload.data.name} added to syllabus.`);
    } catch (err: any) {
      setNotice(err.message || 'Failed to create course module.');
    } finally {
      setBusy(false);
    }
  }

  // Open Transcript Statement for Learner
  function handleOpenTranscript(learner: any) {
    const studentRegs = registrations.filter((r) => r.learnerId === learner.id);
    const transcriptItems = studentRegs.map((r) => ({
      code: r.courseModule?.code || 'NUR-111',
      name: r.courseModule?.name || 'Course Module',
      credits: r.courseModule?.creditUnits || 4,
      caScore: Number(r.continuousScore || 0),
      examScore: Number(r.examScore || 0),
      totalScore: Number(r.finalScore || (Number(r.continuousScore || 0) + Number(r.examScore || 0))),
      grade: r.finalGrade || (Number(r.finalScore || 0) >= 75 ? 'A+' : Number(r.finalScore || 0) >= 65 ? 'A' : Number(r.finalScore || 0) >= 50 ? 'C' : 'F'),
      status: r.status || 'PUBLISHED',
    }));

    setTranscriptStudent({
      studentNumber: learner.studentNumber,
      fullName: `${learner.firstName} ${learner.lastName}`,
      programme: studentRegs[0]?.courseModule?.programme?.name || 'Diploma in Registered Nursing',
      cohort: 'RN-2026-JAN',
      academicYear: '2026 Academic Year',
      semester: 'Semester 1',
    });

    setTranscriptResults(transcriptItems);
  }

  return (
    <div className="mt-8 space-y-6">
      {notice && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-xs font-bold">{notice}</p>
          </div>
          <button onClick={() => setNotice('')} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Academics Top Metrics Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Accredited Programmes</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{programmes.length || 4}</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-cyan-700" /> NMCZ & HPCZ Accredited
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Syllabus Modules</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{modulesList.length || 8}</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <BookOpen className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> Theory & Clinical Skills
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Examination Results</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalRegs} Records</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500" /> {stats.published} Released by Board
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">OSCE Clinical Stations</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{osceStations.length || 4} Active</p>
          <span className="mt-2 inline-flex items-center text-xs text-slate-600">
            <Award className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> Calibrated Rubrics
          </span>
        </div>
      </div>

      {/* Academics Stepped Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('programmes')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'programmes'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Accredited Programmes ({programmes.length || 4})
          </button>

          <button
            onClick={() => setActiveTab('cohorts')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'cohorts'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <UsersRound className="h-4 w-4" />
            Academic Cohorts ({cohorts.length || 2})
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'modules'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Course Modules &amp; Syllabi ({modulesList.length || 8})
          </button>

          <button
            onClick={() => setActiveTab('assessments')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'assessments'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <BarChart2 className="h-4 w-4" />
            Assessment &amp; Results Moderation (40/60)
          </button>

          <button
            onClick={() => setActiveTab('osce')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'osce'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Award className="h-4 w-4" />
            OSCE Clinical Stations ({osceStations.length || 4})
          </button>
        </div>

        {activeTab === 'modules' && (
          <button
            onClick={() => setIsAddModuleOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" /> + Add Syllabus Module
          </button>
        )}
      </div>

      {/* TAB 1: ACCREDITED PROGRAMMES */}
      {activeTab === 'programmes' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programmes.map((p) => {
            const council = p.accreditingCouncil || (p.code?.includes('NUR') ? 'NMCZ' : 'HPCZ');
            const enrolled = p.code === 'DRN' ? 185 : p.code === 'DCM' ? 140 : p.code === 'DPHARM' ? 95 : 60;
            const clinHours = p.code === 'DRN' ? 1600 : p.code === 'DCM' ? 1800 : p.code === 'BScN' ? 2200 : 1200;

            return (
              <div
                key={p.id || p.code}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-cyan-300 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 rounded px-2.5 py-0.5">
                    {p.code}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {council} Accredited
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900">{p.name}</h3>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  {p.department?.name || 'Department of Health & Applied Sciences'}
                </p>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Qualification:</span>
                    <span className="font-semibold text-slate-900">{p.qualificationLevel || 'DIPLOMA'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-semibold text-slate-900">{p.durationYears || 3} Years (6 Semesters)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Enrolled Learners:</span>
                    <span className="font-semibold text-cyan-800">{enrolled} Students</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Clinical Requirement:</span>
                    <span className="font-semibold text-emerald-700">{clinHours} Hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tuition Fee / Sem:</span>
                    <span className="font-mono font-medium text-slate-900">ZMW {Number(p.tuitionFeePerSem || 6500).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Clinical Fee / Sem:</span>
                    <span className="font-mono font-medium text-slate-900">ZMW {Number(p.clinicalFeePerSem || 1800).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Intakes: January & July</span>
                  <span className="font-semibold text-cyan-800">{p.courses?.length || 4} Modules</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: ACADEMIC COHORTS */}
      {activeTab === 'cohorts' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Cohort Stream</th>
                    <th className="px-5 py-3.5">Accredited Programme</th>
                    <th className="px-5 py-3.5">Academic Session</th>
                    <th className="px-5 py-3.5 text-center">Current Term</th>
                    <th className="px-5 py-3.5 text-center">Class Capacity</th>
                    <th className="px-5 py-3.5 text-center">Active Enrolled</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {cohorts.map((c) => (
                    <tr key={c.id || c.name} className="hover:bg-slate-50 transition cursor-pointer">
                      <td className="px-5 py-3.5 font-mono font-bold text-cyan-800 whitespace-nowrap">
                        {c.name}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-900 block">{c.programme?.name || 'Diploma in Registered Nursing'}</span>
                        <span className="text-[11px] text-slate-500">Intake: {c.intake}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                        {c.academicYear || 2026}
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap font-medium text-slate-800">
                        Year {c.currentYear || 1}, Sem {c.currentSemester || 1}
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap font-mono text-slate-600">
                        {c.capacity || 65} Learners
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap font-mono font-bold text-emerald-700">
                        {c.name.includes('RN') ? 58 : 46} Students
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Session
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500">
              <span>Showing {cohorts.length} active academic cohorts</span>
              <span>Class stream progressions enforced</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COURSE MODULES & SYLLABI */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Module Code</th>
                    <th className="px-5 py-3.5">Module Title & Syllabus</th>
                    <th className="px-5 py-3.5">Programme</th>
                    <th className="px-5 py-3.5 text-center">Semester</th>
                    <th className="px-5 py-3.5 text-center">Credit Units</th>
                    <th className="px-5 py-3.5 text-center">Contact Hours</th>
                    <th className="px-5 py-3.5 text-center">Discipline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {modulesList.map((m) => (
                    <tr key={m.id || m.code} className="hover:bg-slate-50 transition cursor-pointer">
                      <td className="px-5 py-3.5 font-mono font-medium text-cyan-800 whitespace-nowrap">
                        {m.code}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-900 block">{m.name}</span>
                        <span className="text-[11px] text-slate-500">
                          {m.theoryHours || 45}h Theory + {m.practicalHours || 60}h Skills Lab & Clinical
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                        {m.programme?.code || 'DRN'}
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap font-medium text-slate-800">
                        Semester {m.semesterNumber || 1}
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap font-mono font-bold text-cyan-800">
                        {m.creditUnits || 4} Units
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap font-mono text-slate-600">
                        {m.theoryHours || 45}T / {m.practicalHours || 60}P
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.isClinical
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {m.isClinical ? 'Clinical' : 'Theory'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500">
              <span>Showing {modulesList.length} syllabus modules</span>
              <span>All curricula approved by Academic Senate</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASSESSMENT & RESULTS MODERATION ENGINE */}
      {activeTab === 'assessments' && (
        <div className="space-y-6">
          {/* Moderation Controls Header */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
                  Senate Examination Board Results Workflow
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Assessment Results Moderation & Formal Publication
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statutory Rule: Continuous Assessment (CA 40%) + Final Examination (60%). Pass benchmark: 50.0%.
                </p>
              </div>

              {/* Batch Moderation Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={busy}
                  onClick={() => {
                    const drafts = registrations.filter((r) => ['DRAFT', 'REGISTERED'].includes(r.status)).map((r) => r.id);
                    if (drafts.length === 0) return setNotice('No draft marks to submit.');
                    handleAdvanceModeration(drafts, 'SUBMITTED');
                  }}
                  className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
                >
                  Submit for Moderation (Lecturer) →
                </button>

                <button
                  disabled={busy}
                  onClick={() => {
                    const submitted = registrations.filter((r) => r.status === 'SUBMITTED').map((r) => r.id);
                    if (submitted.length === 0) return setNotice('No submitted marks pending coordinator moderation.');
                    handleAdvanceModeration(submitted, 'MODERATED');
                  }}
                  className="rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition shadow-xs"
                >
                  Moderate Results (HoD) →
                </button>

                <button
                  disabled={busy}
                  onClick={() => {
                    const moderated = registrations.filter((r) => r.status === 'MODERATED').map((r) => r.id);
                    if (moderated.length === 0) return setNotice('No moderated marks pending Exam Board approval.');
                    handleAdvanceModeration(moderated, 'PUBLISHED');
                  }}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition"
                >
                  Approve & Release (Exam Board) →
                </button>
              </div>
            </div>

            {/* Smart Organization & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              {/* View Organization Mode Switcher */}
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setAssessmentViewMode('BY_MODULE')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    assessmentViewMode === 'BY_MODULE'
                      ? 'bg-white text-cyan-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Group marks by Course Module (Subject Marksheets)"
                >
                  <BookOpen className="h-3.5 w-3.5 text-cyan-700" />
                  <span>By Course Module</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAssessmentViewMode('BY_STUDENT')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    assessmentViewMode === 'BY_STUDENT'
                      ? 'bg-white text-cyan-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Group marks by Student (Learner Gradebook)"
                >
                  <Users className="h-3.5 w-3.5 text-cyan-700" />
                  <span>By Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAssessmentViewMode('MATRIX')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    assessmentViewMode === 'MATRIX'
                      ? 'bg-white text-cyan-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Consolidated Academic Senate Broadsheet Grid"
                >
                  <Layers className="h-3.5 w-3.5 text-cyan-700" />
                  <span>Senate Master Grid</span>
                </button>
              </div>

              {/* Status and Search Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Stage:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 outline-none"
                >
                  <option value="ALL">All Stages</option>
                  <option value="REGISTERED">Registered / Pending</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="MODERATED">Moderated</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PUBLISHED">Published</option>
                </select>

                <div className="relative min-w-[220px]">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate or subject..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-cyan-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* VIEW 1: GROUPED BY COURSE MODULE (SUBJECT MARKSHEET) */}
          {assessmentViewMode === 'BY_MODULE' && (
            <div className="space-y-6">
              {/* Module Quick-Pills Navigation */}
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedModuleTab('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    selectedModuleTab === 'ALL'
                      ? 'bg-cyan-800 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>All Subjects</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedModuleTab === 'ALL' ? 'bg-cyan-900 text-cyan-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {filteredRegistrations.length}
                  </span>
                </button>

                {registrationsByModule.map((grp) => (
                  <button
                    key={grp.module.code}
                    type="button"
                    onClick={() => setSelectedModuleTab(grp.module.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      selectedModuleTab === grp.module.code
                        ? 'bg-cyan-800 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-mono">{grp.module.code}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      selectedModuleTab === grp.module.code ? 'bg-cyan-900 text-cyan-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {grp.items.length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Module Marksheet Sections */}
              <div className="space-y-6">
                {registrationsByModule
                  .filter((grp) => selectedModuleTab === 'ALL' || selectedModuleTab === grp.module.code)
                  .map((grp) => (
                    <div key={grp.module.code} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      {/* Course Module Header */}
                      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-cyan-50/20 to-white p-4 sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-700 text-white font-bold text-sm shadow-xs">
                              {grp.module.code.split('-')[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-extrabold text-cyan-900">{grp.module.code}</span>
                                <span className="text-slate-400">•</span>
                                <h4 className="text-sm font-bold text-slate-900">{grp.module.name}</h4>
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
                                <span>Credits: <strong className="text-slate-700">{grp.module.creditUnits || 4}</strong></span>
                                <span>•</span>
                                <span>Continuous Assessment: <strong className="text-slate-700">40%</strong></span>
                                <span>•</span>
                                <span>Final Examination: <strong className="text-slate-700">60%</strong></span>
                                <span>•</span>
                                <span>Pass Benchmark: <strong className="text-emerald-700 font-semibold">50.0%</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Subject Metrics Summary */}
                          <div className="flex items-center gap-2 text-xs">
                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs text-center">
                              <span className="block text-[10px] uppercase font-bold text-slate-400">Enrolled</span>
                              <span className="font-bold text-slate-800">{grp.items.length} Candidates</span>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs text-center">
                              <span className="block text-[10px] uppercase font-bold text-slate-400">Class Mean</span>
                              <span className="font-bold text-cyan-800">{grp.meanTotal}%</span>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs text-center">
                              <span className="block text-[10px] uppercase font-bold text-slate-400">Pass Rate</span>
                              <span className="font-bold text-emerald-700">{grp.passRate}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Clean Roster Table for this Module Only */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="px-5 py-3">#</th>
                              <th className="px-5 py-3">Student ID & Candidate Name</th>
                              <th className="px-5 py-3 text-center">CA (40%)</th>
                              <th className="px-5 py-3 text-center">Exam (60%)</th>
                              <th className="px-5 py-3 text-center">Composite (100%)</th>
                              <th className="px-5 py-3 text-center">Grade</th>
                              <th className="px-5 py-3 text-center">Moderation Stage</th>
                              <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {grp.items.map((r, idx) => {
                              const ca = Number(r.continuousScore || 0);
                              const exam = Number(r.examScore || 0);
                              const total = Number(r.finalScore || ca + exam);

                              return (
                                <tr
                                  key={r.id}
                                  onClick={() => {
                                    setEditingRegistration(r);
                                    setEditCaScore(Number(r.continuousScore || 32));
                                    setEditExamScore(Number(r.examScore || 45));
                                    setIsScoreModalOpen(true);
                                  }}
                                  className="hover:bg-cyan-50/30 transition cursor-pointer"
                                >
                                  <td className="px-5 py-3 font-mono text-slate-400 text-xs">{idx + 1}</td>
                                  <td className="px-5 py-3">
                                    <div className="flex items-center gap-2.5">
                                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 border border-slate-200">
                                        {r.learner?.firstName?.[0]}{r.learner?.lastName?.[0]}
                                      </div>
                                      <div>
                                        <span className="font-semibold text-slate-900 block">
                                          {r.learner?.firstName} {r.learner?.lastName}
                                        </span>
                                        <span className="font-mono text-[11px] text-cyan-800">
                                          {r.learner?.studentNumber || 'NWU-2026-0001'}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-5 py-3 text-center font-mono font-semibold text-slate-800">
                                    {ca.toFixed(1)} / 40
                                  </td>

                                  <td className="px-5 py-3 text-center font-mono font-semibold text-slate-800">
                                    {exam.toFixed(1)} / 60
                                  </td>

                                  <td className="px-5 py-3 text-center font-mono font-bold text-slate-900 text-sm">
                                    {total.toFixed(1)}%
                                  </td>

                                  <td className="px-5 py-3 text-center font-bold">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                      total >= 75
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : total >= 65
                                        ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                                        : total >= 50
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}>
                                      {r.finalGrade || (total >= 75 ? 'A+' : total >= 65 ? 'A' : total >= 50 ? 'C' : 'F')}
                                    </span>
                                  </td>

                                  <td className="px-5 py-3 text-center whitespace-nowrap">
                                    {r.status === 'PUBLISHED' ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Released
                                      </span>
                                    ) : r.status === 'MODERATED' || r.status === 'APPROVED' ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Moderated
                                      </span>
                                    ) : r.status === 'SUBMITTED' ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Submitted
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Draft
                                      </span>
                                    )}
                                  </td>

                                  <td className="px-5 py-3 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingRegistration(r);
                                          setEditCaScore(Number(r.continuousScore || 32));
                                          setEditExamScore(Number(r.examScore || 45));
                                          setIsScoreModalOpen(true);
                                        }}
                                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                                        title="Edit Continuous Assessment & Exam Marks"
                                      >
                                        <Edit3 className="h-3.5 w-3.5 text-slate-500" /> Edit Marks
                                      </button>

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenTranscript(r.learner);
                                        }}
                                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-cyan-800 hover:bg-cyan-50 transition shadow-xs"
                                        title="View / Print Official Semester Statement of Results"
                                      >
                                        <FileText className="h-3.5 w-3.5 text-cyan-700" /> Statement
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VIEW 2: GROUPED BY STUDENT (LEARNER GRADEBOOK) */}
          {assessmentViewMode === 'BY_STUDENT' && (
            <div className="space-y-4">
              {registrationsByStudent.map((std) => (
                <div key={std.learner?.id || std.learner?.studentNumber} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  {/* Student Summary Card Header */}
                  <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-teal-50/20 to-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-800 text-white font-bold text-base shadow-sm">
                        {std.learner?.firstName?.[0]}{std.learner?.lastName?.[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">
                            {std.learner?.firstName} {std.learner?.lastName}
                          </h4>
                          <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                            {std.learner?.studentNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {std.learner?.programme?.name || 'Diploma in Registered Nursing'} • Cohort RN-2026-JAN
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Cumulative Average</span>
                        <span className="text-base font-extrabold text-slate-900">{std.meanScore}%</span>
                      </div>

                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        std.allPassed
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {std.allPassed ? '✓ PROCEED IN GOOD STANDING' : 'SUPPLEMENTARY REQUIRED'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenTranscript(std.learner)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-cyan-900 shadow-xs transition"
                      >
                        <FileText className="h-3.5 w-3.5 text-cyan-200" />
                        <span>Official Statement of Results</span>
                      </button>
                    </div>
                  </div>

                  {/* Student's Enrolled Subjects Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-5 py-2.5">Course Code & Module Title</th>
                          <th className="px-5 py-2.5 text-center">CA (40%)</th>
                          <th className="px-5 py-2.5 text-center">Exam (60%)</th>
                          <th className="px-5 py-2.5 text-center">Composite (100%)</th>
                          <th className="px-5 py-2.5 text-center">Grade</th>
                          <th className="px-5 py-2.5 text-center">Stage</th>
                          <th className="px-5 py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {std.items.map((r) => {
                          const ca = Number(r.continuousScore || 0);
                          const exam = Number(r.examScore || 0);
                          const total = Number(r.finalScore || ca + exam);

                          return (
                            <tr key={r.id} className="hover:bg-slate-50 transition">
                              <td className="px-5 py-3">
                                <span className="font-mono font-bold text-slate-900">{r.courseModule?.code}</span>
                                <span className="text-slate-600 ml-2 font-medium">{r.courseModule?.name}</span>
                              </td>
                              <td className="px-5 py-3 text-center font-mono font-medium text-slate-800">{ca.toFixed(1)} / 40</td>
                              <td className="px-5 py-3 text-center font-mono font-medium text-slate-800">{exam.toFixed(1)} / 60</td>
                              <td className="px-5 py-3 text-center font-mono font-bold text-slate-900">{total.toFixed(1)}%</td>
                              <td className="px-5 py-3 text-center font-bold">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                  total >= 75
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : total >= 65
                                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                                    : total >= 50
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {r.finalGrade || (total >= 75 ? 'A+' : total >= 65 ? 'A' : total >= 50 ? 'C' : 'F')}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  {r.status}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingRegistration(r);
                                    setEditCaScore(Number(r.continuousScore || 32));
                                    setEditExamScore(Number(r.examScore || 45));
                                    setIsScoreModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                                >
                                  <Edit3 className="h-3 w-3 text-slate-500" /> Edit Marks
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW 3: SENATE MASTER BROADSHEET MATRIX GRID */}
          {assessmentViewMode === 'MATRIX' && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3 sticky left-0 bg-slate-50 z-10 min-w-[200px]">Candidate Student</th>
                      {matrixModules.map((m) => (
                        <th key={m.code} className="px-3 py-3 text-center min-w-[110px]">
                          <span className="block font-mono font-bold text-cyan-900">{m.code}</span>
                          <span className="block text-[9px] font-normal text-slate-400 truncate max-w-[100px]">{m.name}</span>
                        </th>
                      ))}
                      <th className="px-3 py-3 text-center">Weighted Mean</th>
                      <th className="px-4 py-3 text-center">Senate Decision</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {registrationsByStudent.map((std) => {
                      const modMap = new Map<string, any>();
                      std.items.forEach((it) => {
                        if (it.courseModule?.code) modMap.set(it.courseModule.code, it);
                      });

                      return (
                        <tr key={std.learner?.id || std.learner?.studentNumber} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-slate-100">
                            <span className="font-bold text-slate-900 block">{std.learner?.firstName} {std.learner?.lastName}</span>
                            <span className="font-mono text-[11px] text-cyan-800">{std.learner?.studentNumber}</span>
                          </td>
                          {matrixModules.map((m) => {
                            const reg = modMap.get(m.code);
                            if (!reg) {
                              return (
                                <td key={m.code} className="px-3 py-3 text-center text-slate-300 font-mono">
                                  —
                                </td>
                              );
                            }
                            const total = Number(reg.finalScore || (Number(reg.continuousScore || 0) + Number(reg.examScore || 0)));
                            return (
                              <td
                                key={m.code}
                                onClick={() => {
                                  setEditingRegistration(reg);
                                  setEditCaScore(Number(reg.continuousScore || 32));
                                  setEditExamScore(Number(reg.examScore || 45));
                                  setIsScoreModalOpen(true);
                                }}
                                className="px-3 py-3 text-center cursor-pointer hover:bg-cyan-50"
                              >
                                <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                                  total >= 75
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : total >= 50
                                    ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {total.toFixed(0)}% {reg.finalGrade || (total >= 75 ? 'A+' : total >= 65 ? 'A' : total >= 50 ? 'C' : 'F')}
                                </span>
                              </td>
                            );
                          })}
                          <td className="px-3 py-3 text-center font-mono font-extrabold text-slate-900 text-sm">
                            {std.meanScore}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              std.allPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {std.allPassed ? 'PROCEED' : 'SUPP'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenTranscript(std.learner)}
                              className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-cyan-800 hover:bg-cyan-50 shadow-2xs transition"
                            >
                              Statement
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 40/60 What-If Calculator Simulator */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-cyan-700" />
              Zambian Statutory 40% / 60% Grading Engine Simulator
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate Continuous Assessment (CA) and Final Exam balance to preview statutory progression outcomes.
            </p>

            <div className="mt-5 grid gap-6 sm:grid-cols-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Continuous Assessment (CA)</span>
                  <span className="font-mono font-bold text-cyan-800">{calcCaScore} / 40</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={calcCaScore}
                  onChange={(e) => setCalcCaScore(Number(e.target.value))}
                  className="mt-2 w-full accent-cyan-600"
                />
                <span className="text-[10px] text-slate-500">Skills labs, mid-term tests, assignments</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Final Examination Paper</span>
                  <span className="font-mono font-bold text-cyan-800">{calcExamScore} / 60</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={calcExamScore}
                  onChange={(e) => setCalcExamScore(Number(e.target.value))}
                  className="mt-2 w-full accent-cyan-600"
                />
                <span className="text-[10px] text-slate-500">Externally moderated theory paper</span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                <span className="text-xs font-semibold text-slate-500">Simulated Composite:</span>
                <p className="text-2xl font-bold text-slate-900 mt-0.5 font-mono">{calcTotal} / 100</p>
                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold border ${calcBadgeColor}`}>
                  {calcGrade}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: OSCE CLINICAL STATIONS */}
      {activeTab === 'osce' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4 text-xs text-cyan-900 flex items-start gap-3">
            <Award className="h-5 w-5 text-cyan-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-bold">
                Objective Structured Clinical Examination (OSCE) Stations
              </strong>
              OSCE evaluations verify hands-on clinical competencies under standardised rubrics.
              Each station has calibrated timers (7–12 minutes), dedicated faculty examiners, and immediate rubric checklists.
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {osceStations.map((station) => (
              <div
                key={station.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-cyan-300 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-cyan-50 px-2.5 py-0.5 text-xs font-bold text-cyan-800 border border-cyan-200 font-mono">
                    Station {station.stationNumber}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <Clock className="h-3.5 w-3.5 text-slate-500" /> {station.timeAllowedMins} Minutes
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{station.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Domain: <strong className="text-slate-700">{station.domain?.replace('_', ' ')}</strong> • Max Score: {Number(station.maxScore || 20).toFixed(1)} pts
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Station Active
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveOsceStation(station)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-700 px-3.5 py-1.5 font-semibold text-white hover:bg-cyan-800 shadow-sm transition"
                  >
                    <Award className="h-3.5 w-3.5" /> Evaluate Candidate →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: OFFICIAL TRANSCRIPT STATEMENT */}
      {transcriptStudent && (
        <OfficialTranscriptModal
          student={transcriptStudent}
          results={transcriptResults}
          onClose={() => setTranscriptStudent(null)}
        />
      )}

      {/* MODAL 2: OSCE CANDIDATE EVALUATION */}
      {activeOsceStation && (
        <OsceEvaluationModal
          station={activeOsceStation}
          learners={learners}
          onClose={() => setActiveOsceStation(null)}
          onSaved={(res) => {
            setActiveOsceStation(null);
            setNotice(`Recorded OSCE Station result for candidate: ${res.scoreObtained} pts (${res.isPassed ? 'PASS' : 'FAIL'}).`);
          }}
        />
      )}

      {/* MODAL 3: EDIT ASSESSMENT SCORES (CA 40% + EXAM 60%) */}
      {isScoreModalOpen && editingRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setIsScoreModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-cyan-700" /> Enter Assessment Scores
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Candidate: <strong className="text-slate-900">{editingRegistration.learner?.firstName} {editingRegistration.learner?.lastName}</strong> ({editingRegistration.learner?.studentNumber})
            </p>
            <p className="text-xs text-cyan-800 font-mono">
              Module: {editingRegistration.courseModule?.code} — {editingRegistration.courseModule?.name}
            </p>

            <form onSubmit={handleSaveMarks} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-semibold flex justify-between">
                  <span>Continuous Assessment Score (CA 40%)</span>
                  <span className="text-cyan-800 font-bold">{editCaScore} / 40</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  step={0.5}
                  value={editCaScore}
                  onChange={(e) => setEditCaScore(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono outline-none focus:border-cyan-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold flex justify-between">
                  <span>Final Examination Paper (Exam 60%)</span>
                  <span className="text-cyan-800 font-bold">{editExamScore} / 60</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  step={0.5}
                  value={editExamScore}
                  onChange={(e) => setEditExamScore(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono outline-none focus:border-cyan-600 focus:bg-white"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex justify-between items-center">
                <span className="text-slate-500">Calculated Composite:</span>
                <span className="font-mono font-bold text-slate-900 text-base">
                  {(Number(editCaScore) + Number(editExamScore)).toFixed(1)} / 100
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScoreModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-700 px-4 py-2 font-semibold text-white shadow-sm hover:bg-cyan-800 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" /> Save Assessment Scores
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD SYLLABUS MODULE */}
      {isAddModuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setIsAddModuleOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-cyan-700" /> Register Syllabus Course Module
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add curriculum course module with prescribed theory contact hours and clinical practicum allocation.
            </p>

            <form onSubmit={handleCreateModule} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block">Academic Programme</label>
                <select
                  value={newModuleForm.programmeId}
                  onChange={(e) => setNewModuleForm({ ...newModuleForm, programmeId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 outline-none focus:border-cyan-600 focus:bg-white"
                >
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block">Module Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NUR-211"
                    value={newModuleForm.code}
                    onChange={(e) => setNewModuleForm({ ...newModuleForm, code: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block">Semester *</label>
                  <select
                    value={newModuleForm.semesterNumber}
                    onChange={(e) => setNewModuleForm({ ...newModuleForm, semesterNumber: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 outline-none focus:border-cyan-600 focus:bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block">Module Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Medical-Surgical Nursing I"
                  value={newModuleForm.name}
                  onChange={(e) => setNewModuleForm({ ...newModuleForm, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 outline-none focus:border-cyan-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block">Credit Units</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newModuleForm.creditUnits}
                    onChange={(e) => setNewModuleForm({ ...newModuleForm, creditUnits: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block">Theory Hours</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={newModuleForm.theoryHours}
                    onChange={(e) => setNewModuleForm({ ...newModuleForm, theoryHours: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block">Practicum Hours</label>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={newModuleForm.practicalHours}
                    onChange={(e) => setNewModuleForm({ ...newModuleForm, practicalHours: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-900 font-mono outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isClinical"
                  checked={newModuleForm.isClinical}
                  onChange={(e) => setNewModuleForm({ ...newModuleForm, isClinical: e.target.checked })}
                  className="rounded border-slate-300 text-cyan-600"
                />
                <label htmlFor="isClinical" className="text-slate-700 font-semibold">
                  Module Requires Hospital Ward Attachment / Clinical Skills Assessment
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModuleOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Save Course Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
