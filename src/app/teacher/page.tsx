// src/app/teacher/page.tsx
'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface RosterStudent {
  id: string;
  studentNumber: string;
  name: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  testScore: number;     // Topic Test (15%)
  caScore: number;       // Continuous Assessment (25%)
  mockScore: number;     // Mock Examination (20%)
  examScore: number;     // Term End Finals (40%)
  teacherRemarks: string;
  approvalStatus: 'DRAFT' | 'SUBMITTED_TO_SUPERVISOR' | 'ENDORSED_BY_SUPERVISOR' | 'APPROVED_BY_PRINCIPAL' | 'PUBLISHED';
}

export default function TeacherWorkspacePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('Form 2 Green');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeAssessmentMode, setActiveAssessmentMode] = useState<'ATTENDANCE' | 'TOPIC_TESTS' | 'CAS' | 'MOCKS' | 'EXAMS' | 'FULL_MARKBOOK'>('FULL_MARKBOOK');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [roster, setRoster] = useState<RosterStudent[]>([
    {
      id: 'lrn-001',
      studentNumber: 'LSS-2026-0042',
      name: 'Bupe Mwewa',
      status: 'PRESENT',
      testScore: 14,
      caScore: 23,
      mockScore: 18,
      examScore: 36,
      teacherRemarks: 'Bupe is a focused, diligent learner with remarkable academic consistency.',
      approvalStatus: 'APPROVED_BY_PRINCIPAL',
    },
    {
      id: 'lrn-002',
      studentNumber: 'LSS-2026-0043',
      name: 'Mulenga Chanda',
      status: 'PRESENT',
      testScore: 12,
      caScore: 20,
      mockScore: 15,
      examScore: 31,
      teacherRemarks: 'Good conceptual grasp. Recommended for extra STEM problem sessions.',
      approvalStatus: 'ENDORSED_BY_SUPERVISOR',
    },
    {
      id: 'lrn-003',
      studentNumber: 'LSS-2026-0044',
      name: 'Zondani Phiri',
      status: 'LATE',
      testScore: 10,
      caScore: 17,
      mockScore: 13,
      examScore: 28,
      teacherRemarks: 'Consistent progress observed in homework and practical work.',
      approvalStatus: 'SUBMITTED_TO_SUPERVISOR',
    },
    {
      id: 'lrn-004',
      studentNumber: 'LSS-2026-0045',
      name: 'Chilufya Tembo',
      status: 'PRESENT',
      testScore: 15,
      caScore: 24,
      mockScore: 19,
      examScore: 38,
      teacherRemarks: 'Outstanding analytical skills and laboratory discipline.',
      approvalStatus: 'APPROVED_BY_PRINCIPAL',
    },
    {
      id: 'lrn-005',
      studentNumber: 'LSS-2026-0046',
      name: 'Njavwa Banda',
      status: 'ABSENT',
      testScore: 9,
      caScore: 15,
      mockScore: 12,
      examScore: 25,
      teacherRemarks: 'Encouraged to attend remedial study clinic on Saturday morning.',
      approvalStatus: 'DRAFT',
    },
  ]);

  const updateStatus = (id: string, newStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  const updateScoreField = (id: string, field: 'testScore' | 'caScore' | 'mockScore' | 'examScore', val: number) => {
    const caps: Record<string, number> = { testScore: 15, caScore: 25, mockScore: 20, examScore: 40 };
    const maxVal = caps[field] || 100;
    const clamped = Math.max(0, Math.min(maxVal, val));
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

  // 3-Tier Workflow: Step 1 - Class Teacher Submission
  const handleSubmitToSupervisor = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setRoster((prev) =>
        prev.map((s) => ({ ...s, approvalStatus: 'SUBMITTED_TO_SUPERVISOR' }))
      );
      setIsSubmitting(false);
      setSuccessMessage(
        'Step 1 Complete: All Test, CA, and Exam results submitted to Senior Teacher / Academic Supervisor for departmental endorsement.'
      );
    }, 600);
  };

  const handleSaveRegister = async () => {
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
        setSuccessMessage('Offline: Register & Assessment Markbook stored securely on device. Will auto-sync once connected.');
      }, 400);
      return;
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage('Attendance register and continuous assessment marks saved to authoritative server.');
    }, 500);
  };

  const handleSyncOffline = () => {
    if (offlineQueue.length === 0) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setOfflineQueue([]);
      setIsSubmitting(false);
      setSuccessMessage('Successfully reconciled offline register with authoritative server records.');
    }, 600);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header & Connectivity Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Teacher Markbook & Governance Engine
            </span>
            <span className="text-xs text-slate-400">• ECZ Secondary & Primary Curriculum</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Teacher Workspace & Assessment Entry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture attendance, topic tests (15%), continuous assessments (25%), mock exams (20%), and term finals (40%). Advance through 3-tier supervisory sign-off.
          </p>
        </div>

        {/* Offline Simulator Switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-amber-50 text-amber-700 border-amber-300'
            }`}
            title="Toggle simulated connection to test offline sync"
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online (Connected)' : 'Offline Mode (Local Queue)'}</span>
          </button>

          {offlineQueue.length > 0 && isOnline && (
            <button
              onClick={handleSyncOffline}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync {offlineQueue.length} Queued</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Cohort, Subject & Date Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Class Cohort
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Form 2 Green">Form 2 Green (Junior Secondary • Mushitala)</option>
              <option value="Form 4 Gold">Form 4 Gold (Senior Secondary • Mushitala)</option>
              <option value="Grade 1A">Grade 1A (Primary • Urban)</option>
              <option value="Reception Stars">Reception Stars (ECE • Urban)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Curriculum Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="English Language">English Language</option>
              <option value="Integrated Science">Integrated Science</option>
              <option value="Biology">Biology</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
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
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllPresent}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Mark All Present
          </button>
          <button
            onClick={handleSaveRegister}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : 'Save Markbook Draft'}</span>
          </button>
          <button
            onClick={handleSubmitToSupervisor}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl shadow-xs transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Supervisory Approval</span>
          </button>
        </div>
      </div>

      {/* ASSESSMENT MODE TOGGLE BUTTONS */}
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveAssessmentMode('FULL_MARKBOOK')}
          className={`px-3 py-1.5 rounded-xl border transition ${
            activeAssessmentMode === 'FULL_MARKBOOK'
              ? 'bg-blue-900 text-white border-blue-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Full Assessment Suite (All 4 Components)
        </button>
        <button
          onClick={() => setActiveAssessmentMode('ATTENDANCE')}
          className={`px-3 py-1.5 rounded-xl border transition ${
            activeAssessmentMode === 'ATTENDANCE'
              ? 'bg-blue-900 text-white border-blue-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Daily Attendance Register
        </button>
        <button
          onClick={() => setActiveAssessmentMode('TOPIC_TESTS')}
          className={`px-3 py-1.5 rounded-xl border transition ${
            activeAssessmentMode === 'TOPIC_TESTS'
              ? 'bg-blue-900 text-white border-blue-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Weekly Topic Tests (15%)
        </button>
        <button
          onClick={() => setActiveAssessmentMode('CAS')}
          className={`px-3 py-1.5 rounded-xl border transition ${
            activeAssessmentMode === 'CAS'
              ? 'bg-blue-900 text-white border-blue-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Continuous Assessment (CA 1 & 2 - 25%)
        </button>
        <button
          onClick={() => setActiveAssessmentMode('MOCKS')}
          className={`px-3 py-1.5 rounded-xl border transition ${
            activeAssessmentMode === 'MOCKS'
              ? 'bg-blue-900 text-white border-blue-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Mock Examinations (20%)
        </button>
        <button
          onClick={() => setActiveAssessmentMode('EXAMS')}
          className={`px-3 py-1.5 rounded-xl border transition ${
            activeAssessmentMode === 'EXAMS'
              ? 'bg-blue-900 text-white border-blue-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Term End Finals (40%)
        </button>
      </div>

      {/* Interactive Class Register & Markbook Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800">
            {selectedClass} • {selectedSubject} Comprehensive Markbook ({roster.length} Learners)
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Present: <strong className="text-emerald-600">{roster.filter((r) => r.status === 'PRESENT').length}</strong> • 
            Late: <strong className="text-amber-600">{roster.filter((r) => r.status === 'LATE').length}</strong> • 
            Absent: <strong className="text-rose-600">{roster.filter((r) => r.status === 'ABSENT').length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase font-semibold">
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Learner Name</th>
                <th className="px-4 py-3 text-center">Attendance</th>
                {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'TOPIC_TESTS') && (
                  <th className="px-4 py-3 text-center">Tests (15%)</th>
                )}
                {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'CAS') && (
                  <th className="px-4 py-3 text-center">CAs (25%)</th>
                )}
                {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'MOCKS') && (
                  <th className="px-4 py-3 text-center">Mocks (20%)</th>
                )}
                {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'EXAMS') && (
                  <th className="px-4 py-3 text-center">Finals (40%)</th>
                )}
                <th className="px-4 py-3 text-center font-black text-slate-900">Total (100%)</th>
                <th className="px-4 py-3">Teacher Remarks</th>
                <th className="px-4 py-3 text-center">Workflow Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roster.map((student) => {
                const total = student.testScore + student.caScore + student.mockScore + student.examScore;
                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{student.studentNumber}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{student.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateStatus(student.id, 'PRESENT')}
                          className={`px-2 py-0.5 rounded font-bold text-[10px] transition ${
                            student.status === 'PRESENT'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                          }`}
                        >
                          P
                        </button>
                        <button
                          onClick={() => updateStatus(student.id, 'LATE')}
                          className={`px-2 py-0.5 rounded font-bold text-[10px] transition ${
                            student.status === 'LATE'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
                          }`}
                        >
                          L
                        </button>
                        <button
                          onClick={() => updateStatus(student.id, 'ABSENT')}
                          className={`px-2 py-0.5 rounded font-bold text-[10px] transition ${
                            student.status === 'ABSENT'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                          }`}
                        >
                          A
                        </button>
                      </div>
                    </td>

                    {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'TOPIC_TESTS') && (
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={15}
                          value={student.testScore}
                          onChange={(e) => updateScoreField(student.id, 'testScore', Number(e.target.value))}
                          className="w-14 px-2 py-1 text-center font-bold text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    )}

                    {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'CAS') && (
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={25}
                          value={student.caScore}
                          onChange={(e) => updateScoreField(student.id, 'caScore', Number(e.target.value))}
                          className="w-14 px-2 py-1 text-center font-bold text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    )}

                    {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'MOCKS') && (
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={student.mockScore}
                          onChange={(e) => updateScoreField(student.id, 'mockScore', Number(e.target.value))}
                          className="w-14 px-2 py-1 text-center font-bold text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    )}

                    {(activeAssessmentMode === 'FULL_MARKBOOK' || activeAssessmentMode === 'EXAMS') && (
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={40}
                          value={student.examScore}
                          onChange={(e) => updateScoreField(student.id, 'examScore', Number(e.target.value))}
                          className="w-14 px-2 py-1 text-center font-bold text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    )}

                    <td className="px-4 py-3 text-center">
                      <span className="font-mono font-black text-sm text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {total}%
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={student.teacherRemarks}
                        onChange={(e) => updateRemarks(student.id, e.target.value)}
                        placeholder="Teacher remark..."
                        className="w-full min-w-[200px] px-2.5 py-1 text-xs border border-slate-300 rounded-lg"
                      />
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          student.approvalStatus === 'APPROVED_BY_PRINCIPAL'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : student.approvalStatus === 'ENDORSED_BY_SUPERVISOR'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : student.approvalStatus === 'SUBMITTED_TO_SUPERVISOR'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {student.approvalStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
