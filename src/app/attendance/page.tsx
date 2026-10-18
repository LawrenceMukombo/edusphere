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
  Play,
  Radio,
  BarChart3,
  TrendingUp,
  Award,
  RotateCcw,
  Sparkles,
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

export default function AttendancePage() {
  const { selectedCampus, campusInfo } = useCampus();
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'BOARDING_ROLLCALL' | 'EXEATS' | 'ANALYTICS'>('REGISTER');

  // Roster state
  const [roster, setRoster] = useState<StudentRosterItem[]>(GENERATED_ROSTER);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Roll-Call Mode State
  const [showLiveRollCallModal, setShowLiveRollCallModal] = useState(false);
  const [liveRollCallClass, setLiveRollCallClass] = useState('Form 4 Green');
  const [liveRollCallIndex, setLiveRollCallIndex] = useState(0);
  const [liveRollCallTempStatus, setLiveRollCallTempStatus] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>>({});
  const [liveRollCallDispatchSms, setLiveRollCallDispatchSms] = useState(true);
  const [liveRollCallFinished, setLiveRollCallFinished] = useState(false);

  // Analytics Filter State (Rule 25 compliant)
  const [analyticsCampusFilter, setAnalyticsCampusFilter] = useState<'ALL' | 'MUSHITALA' | 'URBAN'>('ALL');
  const [analyticsWeekFilter, setAnalyticsWeekFilter] = useState<'ALL' | 'WEEKS_1_4' | 'WEEKS_5_8'>('ALL');

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
        if (selectedClass !== 'ALL' && s.className !== selectedClass) return s;
        return { ...s, status: 'PRESENT' };
      })
    );
    showToast(`All learners in active view (${selectedClass === 'ALL' ? 'All Cohorts' : selectedClass}) marked PRESENT.`);
  };

  const handleUpdateExeatStatus = async (id: string, newStatus: 'RETURNED_ON_TIME') => {
    setExeats((prev) =>
      prev.map((e) => (e.id === id ? { ...e, securityGateStatus: newStatus } : e))
    );
    try {
      await fetch('/api/attendance/boarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_EXEAT_STATUS', exeatId: id, status: newStatus }),
      });
    } catch {
      // Local state is already updated
    }
    showToast('Security checkpoint: Student logged as RETURNED_ON_TIME. Gate pass closed.');
  };

  const handleSendAbsenteeAlert = (student: StudentRosterItem) => {
    setRoster((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, alertSent: true } : s))
    );
    showToast(`SMS / WhatsApp alert dispatched to ${student.guardianName} (${student.guardianPhone}).`);
  };

  // Live Roll-Call Handlers & Keyboard Shortcuts
  const liveClassLearners = roster.filter((s) => s.className === liveRollCallClass);
  const currentLiveStudent = liveClassLearners[liveRollCallIndex];

  const handleLiveStatusSelect = (status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    if (!currentLiveStudent) return;
    setLiveRollCallTempStatus((prev) => ({
      ...prev,
      [currentLiveStudent.id]: status,
    }));

    if (liveRollCallIndex + 1 < liveClassLearners.length) {
      setLiveRollCallIndex((i) => i + 1);
    } else {
      setLiveRollCallFinished(true);
    }
  };

  const applyLiveRollCallSession = () => {
    let absentCount = 0;
    setRoster((prev) =>
      prev.map((s) => {
        if (s.className !== liveRollCallClass) return s;
        const newStatus = liveRollCallTempStatus[s.id] || s.status;
        const willSendAlert = liveRollCallDispatchSms && newStatus === 'ABSENT';
        if (willSendAlert) absentCount++;
        return {
          ...s,
          status: newStatus,
          alertSent: willSendAlert ? true : s.alertSent,
        };
      })
    );
    setShowLiveRollCallModal(false);
    showToast(
      `Live roll-call for ${liveRollCallClass} complete! ${
        liveRollCallDispatchSms
          ? `Dispatched ${absentCount} absentee alerts to parent contacts.`
          : 'Attendance register updated.'
      }`
    );
  };

  // Keyboard shortcut listener for live roll-call mode
  useEffect(() => {
    if (!showLiveRollCallModal || liveRollCallFinished) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(activeElement.tagName)) return;

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handleLiveStatusSelect('PRESENT');
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleLiveStatusSelect('ABSENT');
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleLiveStatusSelect('LATE');
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleLiveStatusSelect('EXCUSED');
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        if (liveRollCallIndex + 1 < liveClassLearners.length) {
          setLiveRollCallIndex((i) => i + 1);
        } else {
          setLiveRollCallFinished(true);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (liveRollCallIndex > 0) setLiveRollCallIndex((i) => i - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLiveRollCallModal, liveRollCallFinished, liveRollCallIndex, liveRollCallClass, liveClassLearners.length, currentLiveStudent]);

  // Analytical datasets for Longitudinal Trends
  const LONGITUDINAL_WEEKS = [
    { week: 'Week 1', mushitala: 98.4, urban: 97.1, consolidated: 97.8, note: 'Term 1 Commencement & Orientation', dates: '12 Jan - 16 Jan' },
    { week: 'Week 2', mushitala: 98.8, urban: 96.5, consolidated: 97.7, note: 'Regular Academic Timetable', dates: '19 Jan - 23 Jan' },
    { week: 'Week 3', mushitala: 99.1, urban: 97.4, consolidated: 98.3, note: 'Inter-House Athletics Preliminaries', dates: '26 Jan - 30 Jan' },
    { week: 'Week 4', mushitala: 97.6, urban: 94.8, consolidated: 96.2, note: 'Heavy Monsoon Rains in Solwezi Central', dates: '02 Feb - 06 Feb' },
    { week: 'Week 5', mushitala: 98.9, urban: 96.9, consolidated: 97.9, note: 'Mid-Term Academic Progress Reviews', dates: '09 Feb - 13 Feb' },
    { week: 'Week 6', mushitala: 99.3, urban: 97.5, consolidated: 98.4, note: 'Science Fair & STEM Exhibition', dates: '16 Feb - 20 Feb' },
    { week: 'Week 7', mushitala: 99.0, urban: 96.8, consolidated: 97.9, note: 'Pre-Mock Provincial Practice Tests', dates: '23 Feb - 27 Feb' },
    { week: 'Week 8', mushitala: 99.4, urban: 97.8, consolidated: 98.6, note: 'Current Operational Status', dates: '02 Mar - 06 Mar' },
  ];

  const COHORT_SCORECARD = [
    { className: 'Form 5 Sciences', campus: 'Mushitala Campus', level: 'Senior Secondary', enrolled: 62, attendancePct: 99.4, punctualityPct: 99.1, chronicAbsenteeCount: 0, rank: 1, medal: 'GOLD' },
    { className: 'Form 4 Green', campus: 'Mushitala Campus', level: 'Senior Secondary', enrolled: 64, attendancePct: 99.1, punctualityPct: 98.6, chronicAbsenteeCount: 0, rank: 2, medal: 'GOLD' },
    { className: 'Form 3 Blue', campus: 'Mushitala Campus', level: 'Junior Secondary', enrolled: 68, attendancePct: 98.8, punctualityPct: 98.0, chronicAbsenteeCount: 1, rank: 3, medal: 'GOLD' },
    { className: 'Grade 7 Topaz', campus: 'Urban Campus', level: 'Upper Primary', enrolled: 72, attendancePct: 98.2, punctualityPct: 97.5, chronicAbsenteeCount: 1, rank: 4, medal: 'SILVER' },
    { className: 'Form 2 Gold', campus: 'Mushitala Campus', level: 'Junior Secondary', enrolled: 70, attendancePct: 97.9, punctualityPct: 97.1, chronicAbsenteeCount: 1, rank: 5, medal: 'SILVER' },
    { className: 'Grade 6 Silver', campus: 'Urban Campus', level: 'Upper Primary', enrolled: 74, attendancePct: 97.4, punctualityPct: 96.8, chronicAbsenteeCount: 2, rank: 6, medal: 'SILVER' },
    { className: 'Form 1 Alpha', campus: 'Mushitala Campus', level: 'Junior Secondary', enrolled: 76, attendancePct: 97.2, punctualityPct: 96.5, chronicAbsenteeCount: 2, rank: 7, medal: 'SILVER' },
    { className: 'Grade 5 Blue', campus: 'Urban Campus', level: 'Middle Primary', enrolled: 78, attendancePct: 96.8, punctualityPct: 95.9, chronicAbsenteeCount: 2, rank: 8, medal: 'BRONZE' },
    { className: 'Grade 4 Emerald', campus: 'Urban Campus', level: 'Middle Primary', enrolled: 72, attendancePct: 96.5, punctualityPct: 95.4, chronicAbsenteeCount: 3, rank: 9, medal: 'BRONZE' },
    { className: 'Grade 3 Bronze', campus: 'Urban Campus', level: 'Lower Primary', enrolled: 70, attendancePct: 96.1, punctualityPct: 95.0, chronicAbsenteeCount: 3, rank: 10, medal: 'BRONZE' },
    { className: 'Grade 2 Silver', campus: 'Urban Campus', level: 'Lower Primary', enrolled: 68, attendancePct: 95.8, punctualityPct: 94.7, chronicAbsenteeCount: 3, rank: 11, medal: 'BRONZE' },
    { className: 'Grade 1 Gold', campus: 'Urban Campus', level: 'Lower Primary', enrolled: 66, attendancePct: 95.4, punctualityPct: 94.2, chronicAbsenteeCount: 4, rank: 12, medal: 'BRONZE' },
    { className: 'Reception Stars', campus: 'Urban Campus', level: 'Early Childhood', enrolled: 58, attendancePct: 94.8, punctualityPct: 93.6, chronicAbsenteeCount: 4, rank: 13, medal: 'BRONZE' },
  ];

  const DAY_OF_WEEK_METRICS = [
    { day: 'Monday', rate: 95.8, lateCount: 18, desc: 'Weekend travel from outlying mining and farming zones' },
    { day: 'Tuesday', rate: 97.8, lateCount: 7, desc: 'Core STEM & Humanities block timetable' },
    { day: 'Wednesday', rate: 98.4, lateCount: 4, desc: 'Peak mid-week punctuality & clubs' },
    { day: 'Thursday', rate: 98.1, lateCount: 6, desc: 'Laboratory practicals and sport fixtures' },
    { day: 'Friday', rate: 96.7, lateCount: 12, desc: 'Afternoon exeat departures for boarders' },
  ];

  const exportDebsReport = () => {
    const headers = ['Cohort Name', 'Campus Wing', 'Education Level', 'Total Enrolled', 'Attendance Rate (%)', 'Punctuality Rate (%)', 'Chronic Absenteeism (<85%)', 'Performance Band'];
    const rows = COHORT_SCORECARD.map((c) => [
      `"${c.className}"`,
      `"${c.campus}"`,
      `"${c.level}"`,
      c.enrolled,
      `${c.attendancePct}%`,
      `${c.punctualityPct}%`,
      c.chronicAbsenteeCount,
      c.medal,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DEBS_PEO_Attendance_Summary_LegacySchool_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Statutory DEBS / PEO Attendance Summary downloaded (CSV format).');
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
    {
      key: 'actions',
      header: 'Checkpoint Actions',
      render: (e) => (
        <div>
          {e.securityGateStatus !== 'RETURNED_ON_TIME' ? (
            <button
              type="button"
              onClick={() => handleUpdateExeatStatus(e.id, 'RETURNED_ON_TIME')}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Log Return</span>
            </button>
          ) : (
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pass Closed
            </span>
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLiveRollCallIndex(0);
                  setLiveRollCallTempStatus({});
                  setLiveRollCallFinished(false);
                  setShowLiveRollCallModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Conduct Live Roll-Call</span>
              </button>
              <button
                type="button"
                onClick={markAllPresent}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Mark All Present</span>
              </button>
            </div>
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
                  <optgroup label="Urban Campus (Solwezi Central - opp Kikombe School)">
                    <option value="Reception Stars">Reception Stars (Urban Campus)</option>
                    <option value="Grade 1 Gold">Grade 1 Gold (Urban Campus)</option>
                    <option value="Grade 2 Silver">Grade 2 Silver (Urban Campus)</option>
                    <option value="Grade 3 Bronze">Grade 3 Bronze (Urban Campus)</option>
                    <option value="Grade 4 Emerald">Grade 4 Emerald (Urban Campus)</option>
                    <option value="Grade 5 Blue">Grade 5 Blue (Urban Campus)</option>
                    <option value="Grade 6 Silver">Grade 6 Silver (Urban Campus)</option>
                    <option value="Grade 7 Topaz">Grade 7 Topaz (Urban Campus)</option>
                  </optgroup>
                  <optgroup label="Mushitala Campus (Secondary & Boarding - Near Kansanshi)">
                    <option value="Form 1 Alpha">Form 1 Alpha (Mushitala Campus)</option>
                    <option value="Form 2 Gold">Form 2 Gold (Mushitala Campus)</option>
                    <option value="Form 3 Blue">Form 3 Blue (Mushitala Campus)</option>
                    <option value="Form 4 Green">Form 4 Green (Mushitala Campus)</option>
                    <option value="Form 5 Sciences">Form 5 Sciences (Mushitala Campus)</option>
                  </optgroup>
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
      {activeTab === 'ANALYTICS' && (() => {
        const filteredWeeks = LONGITUDINAL_WEEKS.filter((_, idx) => {
          if (analyticsWeekFilter === 'WEEKS_1_4') return idx < 4;
          if (analyticsWeekFilter === 'WEEKS_5_8') return idx >= 4;
          return true;
        });

        const filteredScorecard = COHORT_SCORECARD.filter((c) => {
          if (analyticsCampusFilter === 'MUSHITALA') return c.campus.includes('Mushitala');
          if (analyticsCampusFilter === 'URBAN') return c.campus.includes('Urban');
          return true;
        });

        const avgAttendance = (
          filteredWeeks.reduce((acc, w) => {
            if (analyticsCampusFilter === 'MUSHITALA') return acc + w.mushitala;
            if (analyticsCampusFilter === 'URBAN') return acc + w.urban;
            return acc + w.consolidated;
          }, 0) / (filteredWeeks.length || 1)
        ).toFixed(1);

        const totalEnrolled = filteredScorecard.reduce((acc, c) => acc + c.enrolled, 0);
        const avgPunctuality = (
          filteredScorecard.reduce((acc, c) => acc + c.punctualityPct * c.enrolled, 0) /
          (totalEnrolled || 1)
        ).toFixed(1);
        const totalChronic = filteredScorecard.reduce((acc, c) => acc + c.chronicAbsenteeCount, 0);

        return (
          <div className="space-y-6">
            {/* Interactive Filters Header & Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-900" />
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Term 1 Longitudinal Attendance & Punctuality Intelligence
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Multi-campus retention monitoring across Week 1 to Week 8 for Solwezi District.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Campus Filter */}
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setAnalyticsCampusFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        analyticsCampusFilter === 'ALL'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Campuses
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalyticsCampusFilter('MUSHITALA')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        analyticsCampusFilter === 'MUSHITALA'
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Mushitala (Sec & Boarding)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalyticsCampusFilter('URBAN')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        analyticsCampusFilter === 'URBAN'
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Urban (ECE & Primary)
                    </button>
                  </div>

                  {/* Week Range Filter */}
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setAnalyticsWeekFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        analyticsWeekFilter === 'ALL'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Weeks 1–8
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalyticsWeekFilter('WEEKS_1_4')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        analyticsWeekFilter === 'WEEKS_1_4'
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Weeks 1–4
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalyticsWeekFilter('WEEKS_5_8')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        analyticsWeekFilter === 'WEEKS_5_8'
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Weeks 5–8
                    </button>
                  </div>

                  {(analyticsCampusFilter !== 'ALL' || analyticsWeekFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => {
                        setAnalyticsCampusFilter('ALL');
                        setAnalyticsWeekFilter('ALL');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Filter Chips */}
              {(analyticsCampusFilter !== 'ALL' || analyticsWeekFilter !== 'ALL') && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Active cross-filters:</span>
                  {analyticsCampusFilter !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 font-bold border border-blue-200">
                      Campus: {analyticsCampusFilter === 'MUSHITALA' ? 'Mushitala Secondary' : 'Urban ECE/Primary'}
                      <button
                        type="button"
                        onClick={() => setAnalyticsCampusFilter('ALL')}
                        className="hover:text-blue-600 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {analyticsWeekFilter !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-900 font-bold border border-indigo-200">
                      Cycle: {analyticsWeekFilter === 'WEEKS_1_4' ? 'Weeks 1 to 4' : 'Weeks 5 to 8'}
                      <button
                        type="button"
                        onClick={() => setAnalyticsWeekFilter('ALL')}
                        className="hover:text-indigo-600 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Dynamic Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    Average Attendance Rate
                  </span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{avgAttendance}%</span>
                  <span className="text-[11px] font-bold text-emerald-600">+1.2% vs baseline</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-2">
                  Measured across {totalEnrolled} active learners in {filteredWeeks.length} evaluated weeks.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    Morning Punctuality Index
                  </span>
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{avgPunctuality}%</span>
                  <span className="text-[11px] font-bold text-blue-600">Before 07:45 Bell</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-2">
                  Synchronized with Kyawama, Kansanshi & Golf Estate morning bus routes.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    Chronic Absenteeism Flag
                  </span>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{totalChronic}</span>
                  <span className="text-[11px] font-bold text-emerald-600">&lt; 1% of cohort</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-2">
                  Learners flagged with &lt; 85% attendance receiving welfare & guidance interventions.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    Boarding Curfew Integrity
                  </span>
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">99.8%</span>
                  <span className="text-[11px] font-bold text-indigo-600">318 Beds</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-2">
                  100% headcount accountability across Kansanshi Boys and Kalumbila Girls Halls.
                </p>
              </div>
            </div>

            {/* Weekly Comparative Trend Visualizer */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Week-by-Week Campus Performance (Weeks 1 to 8)
                  </h4>
                  <span className="text-xs text-slate-500">
                    Direct comparison between Mushitala Campus (Secondary & Boarding) and Urban Campus (Primary & ECE).
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <span className="w-3 h-3 rounded bg-blue-900" /> Mushitala Campus
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <span className="w-3 h-3 rounded bg-amber-500" /> Urban Campus
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {filteredWeeks.map((w) => (
                  <div
                    key={w.week}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-900">{w.week}</span>
                      <span className="text-[10px] font-mono text-slate-400">{w.dates}</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                          <span>Mushitala Campus</span>
                          <span className="font-bold text-blue-900">{w.mushitala}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-900 h-full rounded-full transition-all"
                            style={{ width: `${w.mushitala}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                          <span>Urban Campus</span>
                          <span className="font-bold text-amber-600">{w.urban}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all"
                            style={{ width: `${w.urban}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200/50">
                      {w.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Class-by-Class Attendance Scorecard & Day of Week Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Scorecard Table (2 cols) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Cohort Attendance & Punctuality Leaderboard
                    </h4>
                    <span className="text-xs text-slate-500">
                      Ranked performance across all evaluated classes in Term 1.
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {filteredScorecard.length} Cohorts Active
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Rank</th>
                        <th className="py-2.5 px-3">Class Cohort</th>
                        <th className="py-2.5 px-3">Campus Wing</th>
                        <th className="py-2.5 px-3">Learners</th>
                        <th className="py-2.5 px-3">Attendance</th>
                        <th className="py-2.5 px-3">Punctuality</th>
                        <th className="py-2.5 px-3 text-center">Standing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredScorecard.map((c) => (
                        <tr key={c.className} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-500">
                            #{c.rank}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {c.className}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                            {c.campus}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">
                            {c.enrolled}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{c.attendancePct}%</span>
                              <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                <div
                                  className="bg-emerald-600 h-full rounded-full"
                                  style={{ width: `${c.attendancePct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700">
                            {c.punctualityPct}%
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                                c.medal === 'GOLD'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : c.medal === 'SILVER'
                                  ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                  : 'bg-orange-50 text-orange-800 border border-orange-200'
                              }`}
                            >
                              <Award className="w-3 h-3" />
                              {c.medal}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Day of Week & Statutory Report Box (1 col) */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Day-of-Week Distribution
                    </h4>
                    <span className="text-xs text-slate-500">
                      Average attendance pattern from Monday to Friday.
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {DAY_OF_WEEK_METRICS.map((d) => (
                      <div key={d.day} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800">{d.day}</span>
                          <span className="font-mono font-bold text-blue-900">{d.rate}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-800 h-full rounded-full transition-all"
                            style={{ width: `${d.rate}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 block">{d.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statutory Export Card */}
                <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h4 className="text-sm font-bold">Statutory DEBS / PEO Reporting</h4>
                  </div>
                  <p className="text-xs text-blue-200 leading-relaxed">
                    Official term attendance summaries conforming with North-Western Provincial Education Office and Solwezi District Education Board standards.
                  </p>
                  <button
                    type="button"
                    onClick={exportDebsReport}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download DEBS/PEO Summary (CSV)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* MODAL: Conduct Live Roll-Call Mode */}
      {showLiveRollCallModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-base font-black text-slate-900">Conduct Live Roll-Call Session</h3>
                  <span className="text-xs text-slate-500">
                    High-speed attendance logging with instant guardian notification dispatch
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLiveRollCallModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!liveRollCallFinished ? (
              <div className="space-y-4">
                {/* Cohort Selector & Progress */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-slate-700">Class Cohort:</label>
                    <select
                      value={liveRollCallClass}
                      onChange={(e) => {
                        setLiveRollCallClass(e.target.value);
                        setLiveRollCallIndex(0);
                        setLiveRollCallTempStatus({});
                      }}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-800"
                    >
                      <optgroup label="Urban Campus (Solwezi Central - opp Kikombe School)">
                        <option value="Reception Stars">Reception Stars (Urban Campus)</option>
                        <option value="Grade 1 Gold">Grade 1 Gold (Urban Campus)</option>
                        <option value="Grade 2 Silver">Grade 2 Silver (Urban Campus)</option>
                        <option value="Grade 3 Bronze">Grade 3 Bronze (Urban Campus)</option>
                        <option value="Grade 4 Emerald">Grade 4 Emerald (Urban Campus)</option>
                        <option value="Grade 5 Blue">Grade 5 Blue (Urban Campus)</option>
                        <option value="Grade 6 Silver">Grade 6 Silver (Urban Campus)</option>
                        <option value="Grade 7 Topaz">Grade 7 Topaz (Urban Campus)</option>
                      </optgroup>
                      <optgroup label="Mushitala Campus (Secondary & Boarding - Near Kansanshi)">
                        <option value="Form 1 Alpha">Form 1 Alpha (Mushitala Campus)</option>
                        <option value="Form 2 Gold">Form 2 Gold (Mushitala Campus)</option>
                        <option value="Form 3 Blue">Form 3 Blue (Mushitala Campus)</option>
                        <option value="Form 4 Green">Form 4 Green (Mushitala Campus)</option>
                        <option value="Form 5 Sciences">Form 5 Sciences (Mushitala Campus)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-900">
                      {liveRollCallIndex + 1} of {liveClassLearners.length}
                    </span>
                    <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-700 h-full transition-all"
                        style={{
                          width: `${Math.round(((liveRollCallIndex + 1) / (liveClassLearners.length || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Current Student Profile Card */}
                {currentLiveStudent ? (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-100 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="font-mono text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                          {currentLiveStudent.studentNumber}
                        </span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                          {currentLiveStudent.learnerName}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span>{currentLiveStudent.className}</span>
                          <span>•</span>
                          <span className="font-semibold text-blue-700">{currentLiveStudent.campusName}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-[10px]">
                            {currentLiveStudent.studentType === 'BOARDER'
                              ? `Boarder (${currentLiveStudent.hallName || 'Hall'})`
                              : 'Day Scholar'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Guardian Contact</span>
                        <span className="font-bold text-slate-800">{currentLiveStudent.guardianName}</span>
                        <span className="font-mono text-slate-600 block text-[11px]">{currentLiveStudent.guardianPhone}</span>
                      </div>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Mark Punctuality Status:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleLiveStatusSelect('PRESENT')}
                          className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex flex-col items-center gap-1"
                        >
                          <Check className="w-5 h-5" />
                          <span>Present [P]</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLiveStatusSelect('ABSENT')}
                          className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex flex-col items-center gap-1"
                        >
                          <X className="w-5 h-5" />
                          <span>Absent [A]</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLiveStatusSelect('LATE')}
                          className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition flex flex-col items-center gap-1"
                        >
                          <Clock className="w-5 h-5" />
                          <span>Late [L]</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLiveStatusSelect('EXCUSED')}
                          className="py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex flex-col items-center gap-1"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Excused [E]</span>
                        </button>
                      </div>
                    </div>

                    {/* Keyboard Helper */}
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span>Keyboard Shortcuts: <strong>P</strong> (Present), <strong>A</strong> (Absent), <strong>L</strong> (Late), <strong>E</strong> (Excused)</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={liveRollCallIndex === 0}
                          onClick={() => setLiveRollCallIndex((i) => Math.max(0, i - 1))}
                          className="px-2 py-1 rounded bg-white border border-slate-200 disabled:opacity-40 font-bold hover:bg-slate-100"
                        >
                          ← Prev
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (liveRollCallIndex + 1 < liveClassLearners.length) {
                              setLiveRollCallIndex((i) => i + 1);
                            } else {
                              setLiveRollCallFinished(true);
                            }
                          }}
                          className="px-2 py-1 rounded bg-white border border-slate-200 font-bold hover:bg-slate-100"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No learners found in this cohort for the active campus view.
                  </div>
                )}
              </div>
            ) : (
              /* Session Summary Screen */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">Roll-Call Completed for {liveRollCallClass}</h4>
                    <span className="text-xs text-emerald-800">
                      All {liveClassLearners.length} learners have been registered. Review session summary before saving.
                    </span>
                  </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-800 text-[10px] block font-bold uppercase">Present</span>
                    <span className="text-xl font-black text-emerald-950">
                      {liveClassLearners.filter((s) => (liveRollCallTempStatus[s.id] || s.status) === 'PRESENT').length}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="text-rose-800 text-[10px] block font-bold uppercase">Absent</span>
                    <span className="text-xl font-black text-rose-950">
                      {liveClassLearners.filter((s) => (liveRollCallTempStatus[s.id] || s.status) === 'ABSENT').length}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-amber-800 text-[10px] block font-bold uppercase">Late</span>
                    <span className="text-xl font-black text-amber-950">
                      {liveClassLearners.filter((s) => (liveRollCallTempStatus[s.id] || s.status) === 'LATE').length}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                    <span className="text-slate-700 text-[10px] block font-bold uppercase">Excused</span>
                    <span className="text-xl font-black text-slate-900">
                      {liveClassLearners.filter((s) => (liveRollCallTempStatus[s.id] || s.status) === 'EXCUSED').length}
                    </span>
                  </div>
                </div>

                {/* Absentee Alerts Checkbox */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs">
                  <input
                    type="checkbox"
                    id="dispatchSmsCheck"
                    checked={liveRollCallDispatchSms}
                    onChange={(e) => setLiveRollCallDispatchSms(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="dispatchSmsCheck" className="text-slate-700 font-semibold cursor-pointer">
                    Automatically dispatch instant absentee SMS / WhatsApp notification to guardians of absent learners
                  </label>
                </div>

                {/* Final Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setLiveRollCallIndex(0);
                      setLiveRollCallFinished(false);
                    }}
                    className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                  >
                    Review Again
                  </button>
                  <button
                    type="button"
                    onClick={applyLiveRollCallSession}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply & Save Register</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
