// src/app/attendance/page.tsx — Operations & Attendance Command Center for Legacy School Solwezi
'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Bed,
  Sun,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Phone,
  Send,
  Download,
  Check,
  X,
  FileText,
  AlertCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';
import { useCampus } from '@/components/CampusContext';
import {
  LEGACY_BOARDING_ROLLCALLS,
  LEGACY_BOARDING_EXEATS,
  BoardingRollCall,
  BoardingExeatRecord,
  generateLegacyLearners,
} from '@/server/services/legacySchoolData';

interface StudentRosterItem {
  id: string;
  studentNumber: string;
  learnerName: string;
  className: string;
  campusName: string;
  studentType: 'DAY_SCHOLAR' | 'BOARDER';
  hallName?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  arrivalMinutesLate?: number;
  guardianName: string;
  guardianPhone: string;
  alertSent: boolean;
}

const GENERATED_ROSTER: StudentRosterItem[] = generateLegacyLearners(780).map((l) => ({
  id: l.id,
  studentNumber: l.studentNumber,
  learnerName: l.learnerName,
  className: l.className,
  campusName: l.campusName,
  studentType: l.studentType,
  hallName:
    l.currentAccommodation?.boardingHouseLabel ||
    (l.studentType === 'BOARDER'
      ? l.gender === 'MALE'
        ? 'Kansanshi Boys Boarding Hall'
        : 'Kalumbila Girls Boarding Hall'
      : undefined),
  status: l.todayAttendance,
  guardianName: l.guardian.name,
  guardianPhone: l.guardian.phone,
  alertSent: l.todayAttendance === 'ABSENT',
}));

const INITIAL_ROSTER: StudentRosterItem[] = [
  {
    id: 'lrn-001',
    studentNumber: 'LSS-2026-0142',
    learnerName: 'Chileshe Mulenga Jr.',
    className: 'Form 4 Green',
    campusName: 'Kansanshi Boarding Campus',
    studentType: 'BOARDER',
    hallName: 'Kansanshi Boys Boarding Hall',
    status: 'PRESENT',
    guardianName: 'Eng. Chileshe Mulenga',
    guardianPhone: '+260 977 401928',
    alertSent: false,
  },
  {
    id: 'lrn-002',
    studentNumber: 'LSS-2026-0189',
    learnerName: 'Natasha Mwape',
    className: 'Form 3 Blue',
    campusName: 'Kansanshi Boarding Campus',
    studentType: 'BOARDER',
    hallName: 'Kalumbila Girls Boarding Hall',
    status: 'PRESENT',
    guardianName: 'Mrs. Joyce Mwape',
    guardianPhone: '+260 966 883910',
    alertSent: false,
  },
  {
    id: 'lrn-003',
    studentNumber: 'LSS-2026-0091',
    learnerName: 'Tinkhani Banda',
    className: 'Grade 5 Blue',
    campusName: 'Mushitala Day Campus',
    studentType: 'DAY_SCHOLAR',
    status: 'PRESENT',
    guardianName: 'Mr. Davies Banda',
    guardianPhone: '+260 974 119284',
    alertSent: false,
  },
  {
    id: 'lrn-004',
    studentNumber: 'LSS-2026-0205',
    learnerName: 'Blessing Kasonde',
    className: 'Form 2 Gold',
    campusName: 'Kansanshi Boarding Campus',
    studentType: 'BOARDER',
    hallName: 'Kalumbila Girls Boarding Hall',
    status: 'ABSENT',
    guardianName: 'Dr. Frank Kasonde',
    guardianPhone: '+260 971 223940',
    alertSent: true,
  },
  {
    id: 'lrn-005',
    studentNumber: 'LSS-2026-0034',
    learnerName: 'Kondwani Tembo',
    className: 'Grade 1 Gold',
    campusName: 'Mushitala Day Campus',
    studentType: 'DAY_SCHOLAR',
    status: 'PRESENT',
    guardianName: 'Mrs. Abigail Tembo',
    guardianPhone: '+260 967 882194',
    alertSent: false,
  },
  {
    id: 'lrn-006',
    studentNumber: 'LSS-2026-0211',
    learnerName: 'Luyando Chiluba',
    className: 'Form 5 Sciences',
    campusName: 'Kansanshi Boarding Campus',
    studentType: 'BOARDER',
    hallName: 'Kansanshi Boys Boarding Hall',
    status: 'LATE',
    arrivalMinutesLate: 15,
    guardianName: 'Mr. Kennedy Chiluba',
    guardianPhone: '+260 977 881920',
    alertSent: false,
  },
  {
    id: 'lrn-007',
    studentNumber: 'LSS-2026-0056',
    learnerName: 'Taonga Zulu',
    className: 'Reception Stars',
    campusName: 'Mushitala Day Campus',
    studentType: 'DAY_SCHOLAR',
    status: 'PRESENT',
    guardianName: 'Mrs. Veronica Zulu',
    guardianPhone: '+260 979 550192',
    alertSent: false,
  },
  {
    id: 'lrn-008',
    studentNumber: 'LSS-2026-0122',
    learnerName: 'Mwamba Musonda',
    className: 'Form 1 Alpha',
    campusName: 'Kansanshi Boarding Campus',
    studentType: 'BOARDER',
    hallName: 'Kansanshi Boys Boarding Hall',
    status: 'EXCUSED',
    guardianName: 'Mr. Peter Musonda',
    guardianPhone: '+260 968 114920',
    alertSent: false,
  },
];

export default function AttendancePage() {
  const { selectedCampus, campusInfo } = useCampus();
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'BOARDING_ROLLCALL' | 'EXEATS' | 'ANALYTICS'>('REGISTER');

  // Roster state
  const [roster, setRoster] = useState<StudentRosterItem[]>(GENERATED_ROSTER);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Boarding roll-calls and exeats state
  const [rollCalls, setRollCalls] = useState<BoardingRollCall[]>(LEGACY_BOARDING_ROLLCALLS);
  const [exeats, setExeats] = useState<BoardingExeatRecord[]>(LEGACY_BOARDING_EXEATS);

  // Exeat modal state
  const [showExeatModal, setShowExeatModal] = useState(false);
  const [exeatForm, setExeatForm] = useState({
    studentName: '',
    studentNumber: '',
    hallName: 'Kansanshi Boys Boarding Hall',
    grade: 'Form 3 Blue',
    reason: 'Family weekend in Solwezi Mess area',
    destination: 'Solwezi Town',
    guardianName: '',
    guardianPhone: '',
    returnDeadline: '2026-10-18 17:00',
  });

  // Roll-Call modal state
  const [showRollCallModal, setShowRollCallModal] = useState(false);
  const [rollCallForm, setRollCallForm] = useState({
    hallName: 'Kansanshi Boys Boarding Hall',
    callType: 'EVENING_PREP' as const,
    scheduledTime: '18:30',
    totalBoarders: 162,
    present: 156,
    sickbay: 1,
    authorizedExeat: 5,
    unaccounted: 0,
    wardenInCharge: 'Mr. Kelvin Phiri',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter roster by selected campus
  const filteredRoster = roster.filter((r) => {
    if ((selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') && !r.campusName.includes('Mushitala') && !r.campusName.includes('Kansanshi')) return false;
    if (selectedCampus === 'URBAN' && !r.campusName.includes('Urban')) return false;
    if (selectedClass !== 'ALL' && r.className !== selectedClass) return false;
    return true;
  });

  const updateStudentStatus = (id: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const markAllPresent = () => {
    setRoster((prev) =>
      prev.map((s) => {
        if ((selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') && !s.campusName.includes('Mushitala') && !s.campusName.includes('Kansanshi')) return s;
        if (selectedCampus === 'URBAN' && !s.campusName.includes('Urban')) return s;
        return { ...s, status: 'PRESENT' };
      })
    );
    showToast('All learners in active view marked PRESENT.');
  };

  const handleSendAbsenteeAlert = (student: StudentRosterItem) => {
    setRoster((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, alertSent: true } : s))
    );
    showToast(`SMS / WhatsApp alert dispatched to ${student.guardianName} (${student.guardianPhone}).`);
  };

  const handleCreateExeat = (e: React.FormEvent) => {
    e.preventDefault();
    const newExeat: BoardingExeatRecord = {
      id: `ext-${Date.now()}`,
      passNumber: `EXT-2026-${String(exeats.length + 84).padStart(3, '0')}`,
      studentNumber: exeatForm.studentNumber || 'LSS-2026-0000',
      studentName: exeatForm.studentName,
      hallName: exeatForm.hallName,
      grade: exeatForm.grade,
      reason: exeatForm.reason,
      destination: exeatForm.destination,
      guardianName: exeatForm.guardianName,
      guardianPhone: exeatForm.guardianPhone,
      departTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      returnDeadline: exeatForm.returnDeadline,
      securityGateStatus: 'DEPARTED',
      approvedBy: 'Mr. K. Phiri (Senior Housemaster)',
    };
    setExeats([newExeat, ...exeats]);
    setShowExeatModal(false);
    showToast(`Boarding gate pass issued for ${newExeat.studentName}. Security checkpoint notified.`);
  };

  const handleLogRollCall = (e: React.FormEvent) => {
    e.preventDefault();
    const newRollCall: BoardingRollCall = {
      id: `rc-${Date.now()}`,
      hallName: rollCallForm.hallName,
      callType: rollCallForm.callType,
      callTypeLabel:
        rollCallForm.callType === 'EVENING_PREP'
          ? 'Evening Prep Roll-Call (18:30 - 20:30)'
          : rollCallForm.callType === 'NIGHT_CURFEW'
          ? 'Night Bed-Check & Curfew (21:30)'
          : 'Boarding Meal Roll-Call',
      scheduledTime: rollCallForm.scheduledTime,
      date: selectedDate,
      totalBoarders: Number(rollCallForm.totalBoarders),
      present: Number(rollCallForm.present),
      sickbay: Number(rollCallForm.sickbay),
      authorizedExeat: Number(rollCallForm.authorizedExeat),
      unaccounted: Number(rollCallForm.unaccounted),
      wardenInCharge: rollCallForm.wardenInCharge,
      status: Number(rollCallForm.unaccounted) > 0 ? 'DISCREPANCY_FLAGGED' : 'ALL_ACCOUNTED',
    };
    setRollCalls([newRollCall, ...rollCalls]);
    setShowRollCallModal(false);
    showToast(`Roll-call for ${newRollCall.hallName} logged successfully.`);
  };

  // Enterprise table column definitions
  const rosterColumns: ColumnDef<StudentRosterItem>[] = [
    {
      key: 'studentNumber',
      header: 'Student ID',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-blue-900">{r.studentNumber}</span>,
    },
    {
      key: 'learnerName',
      header: 'Student Member',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.learnerName}</span>
          <span className="text-[11px] text-slate-500">
            {r.className} • <span className="font-semibold text-blue-700">{r.campusName}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'studentType',
      header: 'Format & Dorm',
      sortable: true,
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            r.studentType === 'BOARDER'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : 'bg-sky-50 text-sky-700 border-sky-200'
          }`}
        >
          {r.studentType === 'BOARDER' ? <Bed className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
          <span>{r.studentType === 'BOARDER' ? (r.hallName || 'Boarder') : 'Day Scholar'}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Register Status',
      sortable: true,
      render: (r) => {
        const styles = {
          PRESENT: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          ABSENT: 'bg-rose-50 text-rose-800 border-rose-200',
          LATE: 'bg-amber-50 text-amber-800 border-amber-200',
          EXCUSED: 'bg-slate-100 text-slate-700 border-slate-200',
        }[r.status];
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-black border ${styles}`}>
            {r.status} {r.arrivalMinutesLate ? `(+${r.arrivalMinutesLate}m)` : ''}
          </span>
        );
      },
    },
    {
      key: 'guardian',
      header: 'Parent / Guardian Contact',
      render: (r) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800 block">{r.guardianName}</span>
          <span className="font-mono text-slate-500 text-[11px]">{r.guardianPhone}</span>
        </div>
      ),
    },
    {
      key: 'quickActions',
      header: 'Update Punctuality',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => updateStudentStatus(r.id, 'PRESENT')}
            title="Mark Present"
            className={`p-1.5 rounded-lg border transition ${
              r.status === 'PRESENT'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-slate-200'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateStudentStatus(r.id, 'ABSENT')}
            title="Mark Absent"
            className={`p-1.5 rounded-lg border transition ${
              r.status === 'ABSENT'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-slate-200'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateStudentStatus(r.id, 'LATE')}
            title="Mark Late"
            className={`p-1.5 rounded-lg border transition ${
              r.status === 'LATE'
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
          {r.status === 'ABSENT' && (
            <button
              type="button"
              onClick={() => handleSendAbsenteeAlert(r)}
              disabled={r.alertSent}
              className={`ml-1 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition ${
                r.alertSent
                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              }`}
            >
              <Send className="w-3 h-3" />
              <span>{r.alertSent ? 'Alert Sent' : 'Send SMS'}</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  // Exeats table columns
  const exeatColumns: ColumnDef<BoardingExeatRecord>[] = [
    {
      key: 'passNumber',
      header: 'Pass #',
      sortable: true,
      render: (e) => <span className="font-mono font-bold text-indigo-900">{e.passNumber}</span>,
    },
    {
      key: 'student',
      header: 'Boarder Member',
      sortable: true,
      render: (e) => (
        <div>
          <span className="font-bold text-slate-900 block">{e.studentName}</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {e.studentNumber} • {e.grade}
          </span>
        </div>
      ),
    },
    {
      key: 'hallName',
      header: 'Boarding Hall',
      sortable: true,
      render: (e) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {e.hallName}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Exeat Reason & Destination',
      render: (e) => (
        <div className="text-xs max-w-xs">
          <span className="font-medium text-slate-800 block">{e.reason}</span>
          <span className="text-[11px] text-slate-500">Destination: {e.destination}</span>
        </div>
      ),
    },
    {
      key: 'returnDeadline',
      header: 'Return Deadline',
      sortable: true,
      render: (e) => (
        <div className="text-xs">
          <span className="font-bold text-slate-900 block">{e.returnDeadline}</span>
          <span className="text-[10px] text-slate-500">Departed: {e.departTime}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Gate Checkpoint',
      sortable: true,
      render: (e) => {
        const styles = {
          DEPARTED: 'bg-amber-50 text-amber-800 border-amber-200',
          RETURNED_ON_TIME: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          OVERDUE: 'bg-rose-50 text-rose-800 border-rose-200 font-bold animate-pulse',
          AUTHORIZED_PENDING: 'bg-blue-50 text-blue-800 border-blue-200',
        }[e.securityGateStatus];
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles}`}>
            {e.securityGateStatus.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      key: 'guardian',
      header: 'Authorized Guardian',
      render: (e) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800 block">{e.guardianName}</span>
          <span className="text-[11px] text-slate-500 font-mono">{e.guardianPhone}</span>
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
              Operations & Attendance Registry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              {campusInfo.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time classroom morning roll-calls, boarding night curfews, and weekend exeat gate passes for Solwezi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'REGISTER' && (
            <button
              type="button"
              onClick={markAllPresent}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Mark All Present</span>
            </button>
          )}

          {activeTab === 'BOARDING_ROLLCALL' && (
            <button
              type="button"
              onClick={() => setShowRollCallModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Boarding Roll-Call</span>
            </button>
          )}

          {activeTab === 'EXEATS' && (
            <button
              type="button"
              onClick={() => setShowExeatModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Gate Pass (Exeat)</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('REGISTER')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'REGISTER'
              ? 'border-blue-900 text-blue-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Classroom Register</span>
          <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[10px]">
            {filteredRoster.length} Learners
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BOARDING_ROLLCALL')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'BOARDING_ROLLCALL'
              ? 'border-indigo-700 text-indigo-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span>Boarding Wing Roll-Calls</span>
          <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded text-[10px]">
            318 Beds
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EXEATS')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'EXEATS'
              ? 'border-amber-600 text-amber-600 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Boarding Exeat Gate Passes</span>
          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px]">
            {exeats.length} Active
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ANALYTICS')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'ANALYTICS'
              ? 'border-slate-900 text-slate-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Longitudinal Trends</span>
        </button>
      </div>

      {/* TAB 1: CLASSROOM REGISTER */}
      {activeTab === 'REGISTER' && (
        <div className="space-y-4">
          {/* Quick Filters Row */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Class Cohort</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="ALL">All Cohorts (Consolidated)</option>
                  <option value="Reception Stars">Reception Stars (Mushitala)</option>
                  <option value="Grade 1 Gold">Grade 1 Gold (Mushitala)</option>
                  <option value="Grade 5 Blue">Grade 5 Blue (Mushitala)</option>
                  <option value="Form 1 Alpha">Form 1 Alpha (Kansanshi)</option>
                  <option value="Form 2 Gold">Form 2 Gold (Kansanshi)</option>
                  <option value="Form 3 Blue">Form 3 Blue (Kansanshi)</option>
                  <option value="Form 4 Green">Form 4 Green (Kansanshi)</option>
                  <option value="Form 5 Sciences">Form 5 Sciences (Kansanshi)</option>
                </select>
              </div>
            </div>

            {/* Live Count Pill */}
            <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Present: {filteredRoster.filter((r) => r.status === 'PRESENT').length}
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                <X className="w-3.5 h-3.5" />
                Absent: {filteredRoster.filter((r) => r.status === 'ABSENT').length}
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                Late: {filteredRoster.filter((r) => r.status === 'LATE').length}
              </span>
            </div>
          </div>

          {/* Roster Enterprise Table */}
          <EnterpriseTable
            data={filteredRoster}
            columns={rosterColumns}
            title="Classroom Roll-Call Register"
            description="Official morning attendance session conforming to Ministry of Education guidelines."
            searchPlaceholder="Search by student name, ID, or guardian..."
            exportFilename="legacy-school-attendance"
          />
        </div>
      )}

      {/* TAB 2: BOARDING WING ROLL-CALLS */}
      {activeTab === 'BOARDING_ROLLCALL' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-md border border-indigo-800">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Boys Dormitory Wing</span>
                  <h3 className="text-xl font-black mt-1">Kansanshi Boys Boarding Hall</h3>
                  <span className="text-xs text-indigo-300">Warden: Mr. Kelvin Phiri (+260 967 288578)</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-700 text-amber-300 font-bold text-xs">
                  162 / 180 Beds
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-indigo-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-indigo-300 block text-[10px]">In Dormitory</span>
                  <span className="text-lg font-black">156</span>
                </div>
                <div>
                  <span className="text-indigo-300 block text-[10px]">In Sickbay</span>
                  <span className="text-lg font-black text-amber-300">1</span>
                </div>
                <div>
                  <span className="text-indigo-300 block text-[10px]">On Exeat</span>
                  <span className="text-lg font-black text-sky-300">5</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-900">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Girls Dormitory Wing</span>
                  <h3 className="text-xl font-black mt-1">Kalumbila Girls Boarding Hall</h3>
                  <span className="text-xs text-indigo-300">Senior Matron: Mrs. Beatrice Kalenga (+260 978 440192)</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-800 text-amber-300 font-bold text-xs">
                  156 / 170 Beds
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-indigo-900/80 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-indigo-300 block text-[10px]">In Dormitory</span>
                  <span className="text-lg font-black">150</span>
                </div>
                <div>
                  <span className="text-indigo-300 block text-[10px]">In Sickbay</span>
                  <span className="text-lg font-black text-amber-300">2</span>
                </div>
                <div>
                  <span className="text-indigo-300 block text-[10px]">On Exeat</span>
                  <span className="text-lg font-black text-sky-300">4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Roll-Calls Log List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Boarding Verification Logs</h3>
            <div className="space-y-3">
              {rollCalls.map((rc) => (
                <div
                  key={rc.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{rc.hallName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                        {rc.callTypeLabel}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block">
                      Logged at {rc.scheduledTime} on {rc.date} by <strong>{rc.wardenInCharge}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      Present: <strong>{rc.present}</strong>
                    </span>
                    <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      Sickbay: <strong>{rc.sickbay}</strong>
                    </span>
                    <span className="text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-200">
                      Exeat: <strong>{rc.authorizedExeat}</strong>
                    </span>
                    <span className="text-emerald-800 font-bold bg-emerald-100 px-2.5 py-1 rounded-full text-[10px]">
                      {rc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOARDING EXEATS (GATE PASSES) */}
      {activeTab === 'EXEATS' && (
        <div className="space-y-4">
          <EnterpriseTable
            data={exeats}
            columns={exeatColumns}
            title="Boarding Exeat Gate Pass Registry"
            description="Security-controlled student departures and authorized guardian handovers."
            searchPlaceholder="Search by student name, pass number, or guardian..."
            exportFilename="legacy-school-exeats"
          />
        </div>
      )}

      {/* TAB 4: LONGITUDINAL ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Term 1 Longitudinal Attendance Patterns</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative analysis between Day Scholars (Mushitala) and Boarders (Kansanshi) across Week 1 to Week 8.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800 font-bold block text-[11px] uppercase">Boarding Wing Retention</span>
              <span className="text-2xl font-black text-emerald-950 mt-1 block">99.2%</span>
              <span className="text-emerald-700 mt-1 block">Consistent study prep attendance throughout mining grid fluctuations.</span>
            </div>
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
              <span className="text-sky-800 font-bold block text-[11px] uppercase">Day Scholar Punctuality</span>
              <span className="text-2xl font-black text-sky-950 mt-1 block">96.8%</span>
              <span className="text-sky-700 mt-1 block">Supported by the Kyawama & Golf Estate shuttle minibus fleet.</span>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-blue-800 font-bold block text-[11px] uppercase">Automated Parent Alerts</span>
              <span className="text-2xl font-black text-blue-950 mt-1 block">100% Dispatched</span>
              <span className="text-blue-700 mt-1 block">Guardians notified within 15 minutes of unauthorized register absence.</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Issue Exeat Gate Pass */}
      {showExeatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Issue Boarding Gate Pass (Exeat)</h3>
              <button
                type="button"
                onClick={() => setShowExeatModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExeat} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={exeatForm.studentName}
                  onChange={(e) => setExeatForm({ ...exeatForm, studentName: e.target.value })}
                  placeholder="e.g. Mwelwa Mwila"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student ID #</label>
                  <input
                    type="text"
                    required
                    value={exeatForm.studentNumber}
                    onChange={(e) => setExeatForm({ ...exeatForm, studentNumber: e.target.value })}
                    placeholder="e.g. LSS-2026-0312"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Boarding Hall</label>
                  <select
                    value={exeatForm.hallName}
                    onChange={(e) => setExeatForm({ ...exeatForm, hallName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="Kansanshi Boys Boarding Hall">Kansanshi Boys Boarding Hall</option>
                    <option value="Kalumbila Girls Boarding Hall">Kalumbila Girls Boarding Hall</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Exeat Purpose & Reason</label>
                <input
                  type="text"
                  required
                  value={exeatForm.reason}
                  onChange={(e) => setExeatForm({ ...exeatForm, reason: e.target.value })}
                  placeholder="Medical appointment, family funeral, weekend exeats"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Authorized Guardian Name</label>
                  <input
                    type="text"
                    required
                    value={exeatForm.guardianName}
                    onChange={(e) => setExeatForm({ ...exeatForm, guardianName: e.target.value })}
                    placeholder="Guardian Name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Guardian Phone Contact</label>
                  <input
                    type="text"
                    required
                    value={exeatForm.guardianPhone}
                    onChange={(e) => setExeatForm({ ...exeatForm, guardianPhone: e.target.value })}
                    placeholder="+260 97X XXXXXX"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expected Return Deadline</label>
                <input
                  type="datetime-local"
                  required
                  value={exeatForm.returnDeadline}
                  onChange={(e) => setExeatForm({ ...exeatForm, returnDeadline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExeatModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-xs"
                >
                  Issue Gate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Log Boarding Roll-Call */}
      {showRollCallModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Log Boarding Verification Roll-Call</h3>
              <button
                type="button"
                onClick={() => setShowRollCallModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogRollCall} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hall Name</label>
                  <select
                    value={rollCallForm.hallName}
                    onChange={(e) => setRollCallForm({ ...rollCallForm, hallName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="Kansanshi Boys Boarding Hall">Kansanshi Boys Boarding Hall</option>
                    <option value="Kalumbila Girls Boarding Hall">Kalumbila Girls Boarding Hall</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Roll-Call Type</label>
                  <select
                    value={rollCallForm.callType}
                    onChange={(e: any) => setRollCallForm({ ...rollCallForm, callType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="EVENING_PREP">Evening Prep (18:30)</option>
                    <option value="NIGHT_CURFEW">Night Curfew (21:30)</option>
                    <option value="MORNING_RISING">Morning Rising (06:00)</option>
                    <option value="AFTERNOON_DINING">Dining Hall Check</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[10px]">Total Beds</label>
                  <input
                    type="number"
                    value={rollCallForm.totalBoarders}
                    onChange={(e) => setRollCallForm({ ...rollCallForm, totalBoarders: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-emerald-700 block mb-1 text-[10px]">Present</label>
                  <input
                    type="number"
                    value={rollCallForm.present}
                    onChange={(e) => setRollCallForm({ ...rollCallForm, present: Number(e.target.value) })}
                    className="w-full bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-center font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-700 block mb-1 text-[10px]">Sickbay</label>
                  <input
                    type="number"
                    value={rollCallForm.sickbay}
                    onChange={(e) => setRollCallForm({ ...rollCallForm, sickbay: Number(e.target.value) })}
                    className="w-full bg-amber-50 border border-amber-300 rounded-lg p-2 text-center font-bold text-amber-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-sky-700 block mb-1 text-[10px]">On Exeat</label>
                  <input
                    type="number"
                    value={rollCallForm.authorizedExeat}
                    onChange={(e) => setRollCallForm({ ...rollCallForm, authorizedExeat: Number(e.target.value) })}
                    className="w-full bg-sky-50 border border-sky-300 rounded-lg p-2 text-center font-bold text-sky-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Warden / Matron In-Charge</label>
                <input
                  type="text"
                  required
                  value={rollCallForm.wardenInCharge}
                  onChange={(e) => setRollCallForm({ ...rollCallForm, wardenInCharge: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRollCallModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold shadow-xs"
                >
                  Save Roll-Call Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
