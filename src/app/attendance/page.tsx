// src/app/attendance/page.tsx — Operations & Attendance Command Center for Legacy School Solwezi
'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Calendar,
  Eye,
  Maximize2,
  UserCheck,
  Cake,
  PartyPopper,
  Flag,
  Gift,
  BookOpen,
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
import {
  ZAMBIAN_PUBLIC_HOLIDAYS_2026,
  ACADEMIC_TERMS_2026,
  SCHOOL_EVENTS_2026,
  getAllLearnerBirthdays,
  getTodayBirthdays,
  generateSmsBirthdayWish,
  LearnerBirthdayProfile,
} from '@/server/services/schoolCalendarData';

interface StudentRosterItem {
  id: string;
  studentNumber: string;
  learnerName: string;
  dateOfBirth?: string;
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

interface LearnerAttendanceHorizons {
  daily: {
    monday: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; time: string; date: string };
    tuesday: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; time: string; date: string };
    wednesday: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; time: string; date: string };
    thursday: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; time: string; date: string };
    friday: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; time: string; date: string };
    today: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; time: string };
  };
  weekly: {
    currentWeekRate: number;
    currentWeekDaysPresent: number;
    currentWeekTotalDays: number;
    weekTrends: { week: string; rate: number }[];
  };
  monthly: {
    currentMonthRate: number;
    currentMonthDaysPresent: number;
    currentMonthTotalDays: number;
    prevMonthRate: number;
    prevMonthDaysPresent: number;
    prevMonthTotalDays: number;
  };
  termly: {
    termRate: number;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    standing: 'GOLD' | 'SILVER' | 'BRONZE' | 'CRITICAL';
    isChronicAbsentee: boolean;
  };
}

function getLearnerAttendanceHorizons(learner: StudentRosterItem): LearnerAttendanceHorizons {
  const numPart = parseInt(learner.studentNumber.replace(/\D/g, ''), 10) || 101;
  const seed = (numPart * 17 + 23) % 1000;

  // Daily days (Mon 02 Mar to Fri 06 Mar 2026)
  const mondayStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' =
    seed % 23 === 0 ? 'ABSENT' : seed % 13 === 0 ? 'LATE' : 'PRESENT';
  const tuesdayStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' =
    seed % 29 === 0 ? 'LATE' : seed % 37 === 0 ? 'ABSENT' : 'PRESENT';
  const wednesdayStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' =
    seed % 31 === 0 ? 'ABSENT' : 'PRESENT';
  const thursdayStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' =
    seed % 19 === 0 ? 'LATE' : 'PRESENT';
  // Friday is today's live status!
  const fridayStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' = learner.status;

  const weekStatuses = [mondayStatus, tuesdayStatus, wednesdayStatus, thursdayStatus, fridayStatus];
  const daysPresent = weekStatuses.filter((s) => s === 'PRESENT' || s === 'LATE').length;
  const currentWeekRate = Math.round((daysPresent / 5) * 100);

  const weekTrends = [
    { week: 'Wk 5', rate: seed % 19 === 0 ? 80 : 100 },
    { week: 'Wk 6', rate: seed % 23 === 0 ? 80 : 100 },
    { week: 'Wk 7', rate: seed % 29 === 0 ? 80 : 100 },
    { week: 'Wk 8', rate: currentWeekRate },
  ];

  // Monthly: March 2026 (22 school days)
  const marchAbsent = (seed % 17 === 0 ? 2 : seed % 7 === 0 ? 1 : 0) + (learner.status === 'ABSENT' ? 1 : 0);
  const marchTotal = 22;
  const marchPresent = Math.max(0, marchTotal - marchAbsent);
  const marchRate = Math.round((marchPresent / marchTotal) * 1000) / 10;

  // Monthly: February 2026 (20 school days)
  const febAbsent = seed % 11 === 0 ? 1 : 0;
  const febTotal = 20;
  const febPresent = Math.max(0, febTotal - febAbsent);
  const febRate = Math.round((febPresent / febTotal) * 1000) / 10;

  // Termly: Term 1 2026 (42 cumulative school days)
  const termTotal = 42;
  const termAbsent = marchAbsent + febAbsent;
  const termPresent = Math.max(0, termTotal - termAbsent);
  const termLate = (seed % 9 === 0 ? 2 : seed % 4 === 0 ? 1 : 0) + (learner.status === 'LATE' ? 1 : 0);
  const termExcused = seed % 15 === 0 ? 1 : 0;
  const termRate = Math.round((termPresent / termTotal) * 1000) / 10;

  let standing: 'GOLD' | 'SILVER' | 'BRONZE' | 'CRITICAL' = 'GOLD';
  let isChronicAbsentee = false;

  if (termRate >= 98.0) {
    standing = 'GOLD';
  } else if (termRate >= 95.0) {
    standing = 'SILVER';
  } else if (termRate >= 85.0) {
    standing = 'BRONZE';
  } else {
    standing = 'CRITICAL';
    isChronicAbsentee = true;
  }

  return {
    daily: {
      monday: { status: mondayStatus, time: mondayStatus === 'LATE' ? '08:04' : '07:18', date: '02 Mar' },
      tuesday: { status: tuesdayStatus, time: tuesdayStatus === 'LATE' ? '07:56' : '07:22', date: '03 Mar' },
      wednesday: { status: wednesdayStatus, time: wednesdayStatus === 'ABSENT' ? '—' : '07:15', date: '04 Mar' },
      thursday: { status: thursdayStatus, time: thursdayStatus === 'LATE' ? '07:52' : '07:20', date: '05 Mar' },
      friday: { status: fridayStatus, time: fridayStatus === 'LATE' ? '07:55' : fridayStatus === 'ABSENT' ? '—' : '07:19', date: '06 Mar' },
      today: { status: learner.status, time: learner.status === 'LATE' ? '07:55' : learner.status === 'ABSENT' ? '—' : '07:19' },
    },
    weekly: {
      currentWeekRate,
      currentWeekDaysPresent: daysPresent,
      currentWeekTotalDays: 5,
      weekTrends,
    },
    monthly: {
      currentMonthRate: marchRate,
      currentMonthDaysPresent: marchPresent,
      currentMonthTotalDays: marchTotal,
      prevMonthRate: febRate,
      prevMonthDaysPresent: febPresent,
      prevMonthTotalDays: febTotal,
    },
    termly: {
      termRate,
      totalSessions: termTotal,
      presentCount: termPresent,
      absentCount: termAbsent,
      lateCount: termLate,
      excusedCount: termExcused,
      standing,
      isChronicAbsentee,
    },
  };
}

const GENERATED_ROSTER: StudentRosterItem[] = generateLegacyLearners(780).map((l) => ({
  id: l.id,
  studentNumber: l.studentNumber,
  learnerName: l.learnerName,
  dateOfBirth: l.dateOfBirth,
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
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'MATRIX' | 'CALENDAR' | 'BOARDING_ROLLCALL' | 'EXEATS' | 'ANALYTICS'>('REGISTER');

  // Roster state
  const [roster, setRoster] = useState<StudentRosterItem[]>(GENERATED_ROSTER);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calendar & Birthdays tab state
  const [calendarHolidaysSearch, setCalendarHolidaysSearch] = useState('');
  const [calendarBirthdayMonth, setCalendarBirthdayMonth] = useState(10);
  const [calendarBirthdayClass, setCalendarBirthdayClass] = useState('ALL');
  const [calendarBirthdaySearch, setCalendarBirthdaySearch] = useState('');

  // Multi-Horizon Matrix State (Daily, Weekly, Monthly, Termly)
  const [matrixClass, setMatrixClass] = useState('Form 4 Green');
  const [matrixSearch, setMatrixSearch] = useState('');
  const [matrixStatusFilter, setMatrixStatusFilter] = useState<'ALL' | 'ABSENT_TODAY' | 'LATE_TODAY' | 'CHRONIC' | 'BOARDERS' | 'DAY_SCHOLARS'>('ALL');
  const [selectedLearnerForCard, setSelectedLearnerForCard] = useState<StudentRosterItem | null>(null);

  // Check if selectedDate is a statutory Zambian public holiday
  const selectedDateHoliday = useMemo(() => {
    return ZAMBIAN_PUBLIC_HOLIDAYS_2026.find((h) => h.date === selectedDate || h.observedDate === selectedDate);
  }, [selectedDate]);

  // Today's birthdays in active cohort
  const classBirthdaysToday = useMemo(() => {
    const todayBirthdays = getTodayBirthdays(selectedDate).birthdays;
    if (selectedClass === 'ALL') return todayBirthdays;
    return todayBirthdays.filter((b) => b.className === selectedClass);
  }, [selectedDate, selectedClass]);

  // All birthdays for attendance calendar tab
  const allBirthdaysList = useMemo(() => {
    return getAllLearnerBirthdays();
  }, []);

  const filteredCalendarBirthdays = useMemo(() => {
    return allBirthdaysList.filter((b: LearnerBirthdayProfile) => {
      if (calendarBirthdayMonth !== 0 && b.birthMonth !== calendarBirthdayMonth) return false;
      if (calendarBirthdayClass !== 'ALL' && b.className !== calendarBirthdayClass) return false;
      if (calendarBirthdaySearch) {
        const q = calendarBirthdaySearch.toLowerCase();
        return (
          b.learnerName.toLowerCase().includes(q) ||
          b.studentNumber.toLowerCase().includes(q) ||
          b.guardianName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allBirthdaysList, calendarBirthdayMonth, calendarBirthdayClass, calendarBirthdaySearch]);

  // Distinct classes for calendar birthday filter
  const distinctBirthdayClasses = useMemo(() => {
    return Array.from(new Set(allBirthdaysList.map((b: LearnerBirthdayProfile) => b.className))).sort();
  }, [allBirthdaysList]);

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

  // Multi-Horizon Matrix: Filtered Learners for the active classroom
  const matrixLearners = roster.filter((r) => {
    // Campus scope
    if ((selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') && !r.campusName.includes('Mushitala') && !r.campusName.includes('Kansanshi')) return false;
    if (selectedCampus === 'URBAN' && !r.campusName.includes('Urban')) return false;

    // Classroom scope
    if (matrixClass !== 'ALL' && r.className !== matrixClass) return false;

    // Search query
    if (matrixSearch.trim()) {
      const q = matrixSearch.toLowerCase();
      if (!r.learnerName.toLowerCase().includes(q) && !r.studentNumber.toLowerCase().includes(q)) return false;
    }

    // Status filter
    if (matrixStatusFilter === 'ABSENT_TODAY' && r.status !== 'ABSENT') return false;
    if (matrixStatusFilter === 'LATE_TODAY' && r.status !== 'LATE') return false;
    if (matrixStatusFilter === 'BOARDERS' && r.studentType !== 'BOARDER') return false;
    if (matrixStatusFilter === 'DAY_SCHOLARS' && r.studentType !== 'DAY_SCHOLAR') return false;
    if (matrixStatusFilter === 'CHRONIC') {
      const h = getLearnerAttendanceHorizons(r);
      if (!h.termly.isChronicAbsentee) return false;
    }

    return true;
  });

  // Classroom aggregate metrics across all 4 time horizons
  const currentClassroomLearners = roster.filter((r) => matrixClass === 'ALL' || r.className === matrixClass);
  const classTotal = currentClassroomLearners.length || 1;
  const classPresentToday = currentClassroomLearners.filter((r) => r.status === 'PRESENT').length;
  const classAbsentToday = currentClassroomLearners.filter((r) => r.status === 'ABSENT').length;
  const classLateToday = currentClassroomLearners.filter((r) => r.status === 'LATE').length;
  const classDailyPct = Math.round((classPresentToday / classTotal) * 1000) / 10;

  const classWeeklyAvg = Math.round(
    currentClassroomLearners.reduce((acc, l) => acc + getLearnerAttendanceHorizons(l).weekly.currentWeekRate, 0) /
      classTotal
  );

  const classMonthlyAvg = (
    currentClassroomLearners.reduce((acc, l) => acc + getLearnerAttendanceHorizons(l).monthly.currentMonthRate, 0) /
    classTotal
  ).toFixed(1);

  const classTermlyAvg = (
    currentClassroomLearners.reduce((acc, l) => acc + getLearnerAttendanceHorizons(l).termly.termRate, 0) /
    classTotal
  ).toFixed(1);

  const classChronicCount = currentClassroomLearners.filter(
    (l) => getLearnerAttendanceHorizons(l).termly.isChronicAbsentee
  ).length;

  const cycleTodayPunctuality = (studentId: string, current: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    const nextMap: Record<'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED', 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'> = {
      PRESENT: 'ABSENT',
      ABSENT: 'LATE',
      LATE: 'EXCUSED',
      EXCUSED: 'PRESENT',
    };
    const nextStatus = nextMap[current];
    updateStudentStatus(studentId, nextStatus);
    const targetStudent = roster.find((s) => s.id === studentId);
    showToast(`Punctuality for ${targetStudent?.learnerName || 'Student'} updated to ${nextStatus}.`);
  };

  const exportClassroomMatrixCsv = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Class Cohort',
      'Campus',
      'Format',
      'Mon 02 Mar',
      'Tue 03 Mar',
      'Wed 04 Mar',
      'Thu 05 Mar',
      'Fri 06 Mar (Today)',
      'Current Week Rate (%)',
      'March MTD Rate (%)',
      'March Present Days',
      'Feb Rate (%)',
      'Term 1 Rate (%)',
      'Term Days Present',
      'Term Days Absent',
      'Term Days Late',
      'Official Standing',
    ];
    const rows = matrixLearners.map((learner) => {
      const h = getLearnerAttendanceHorizons(learner);
      return [
        `"${learner.studentNumber}"`,
        `"${learner.learnerName}"`,
        `"${learner.className}"`,
        `"${learner.campusName}"`,
        `"${learner.studentType}"`,
        h.daily.monday.status,
        h.daily.tuesday.status,
        h.daily.wednesday.status,
        h.daily.thursday.status,
        h.daily.today.status,
        `${h.weekly.currentWeekRate}%`,
        `${h.monthly.currentMonthRate}%`,
        `${h.monthly.currentMonthDaysPresent}/${h.monthly.currentMonthTotalDays}`,
        `${h.monthly.prevMonthRate}%`,
        `${h.termly.termRate}%`,
        h.termly.presentCount,
        h.termly.absentCount,
        h.termly.lateCount,
        h.termly.standing,
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Matrix_${matrixClass.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Multi-horizon attendance matrix for ${matrixClass} exported successfully.`);
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

          {activeTab === 'MATRIX' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportClassroomMatrixCsv}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Matrix (CSV)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLiveRollCallClass(matrixClass === 'ALL' ? 'Form 4 Green' : matrixClass);
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
      <div className="flex items-center border-b border-slate-200 gap-6 text-xs font-bold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('REGISTER')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
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
          onClick={() => setActiveTab('MATRIX')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'MATRIX'
              ? 'border-emerald-700 text-emerald-800 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Multi-Horizon Matrix (Daily • Weekly • Monthly • Termly)</span>
          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
            All Horizons
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CALENDAR')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'CALENDAR'
              ? 'border-amber-600 text-amber-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cake className="w-4 h-4 text-amber-600" />
          <span>School Calendar, Zambia Holidays & Birthdays</span>
          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-bold flex items-center gap-1">
            <Flag className="w-2.5 h-2.5 text-emerald-700" /> 15 Holidays
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BOARDING_ROLLCALL')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
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
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
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
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
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
          {/* Zambian Public Holiday Notification Banner if selected date is holiday */}
          {selectedDateHoliday && (
            <div className="bg-emerald-800 text-white p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border border-emerald-700">
              <div className="flex items-center gap-2.5">
                <Flag className="w-5 h-5 text-emerald-300 shrink-0" />
                <div>
                  <span className="font-bold text-xs block">
                    🇿🇲 Gazetted Zambian Public Holiday: {selectedDateHoliday.name} ({selectedDateHoliday.dayOfWeek})
                  </span>
                  <span className="text-[11px] text-emerald-100">
                    {selectedDateHoliday.significance} Official mandatory closure under Zambian statutory law — no learners marked absent.
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-white text-emerald-950 rounded-lg text-[10px] font-black uppercase shrink-0">
                Mandatory Closure
              </span>
            </div>
          )}

          {/* Today's Birthday Banner for Active Classroom */}
          {classBirthdaysToday.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <Cake className="w-5 h-5 text-yellow-200 shrink-0" />
                <div>
                  <span className="font-bold text-xs block">
                    🎉 Learner Birthday Alert ({classBirthdaysToday.length} Celebrant{classBirthdaysToday.length > 1 ? 's' : ''})
                  </span>
                  <span className="text-[11px] text-amber-100">
                    {classBirthdaysToday.map((b: LearnerBirthdayProfile) => `${b.learnerName} (${b.className}, turning ${b.turningAge})`).join(' • ')} — Commend their milestone during morning roll-call!
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const b = classBirthdaysToday[0];
                  setToastMessage(`SMS Birthday Greeting queued to ${b.guardianName} (${b.guardianPhone}) for ${b.learnerName}! 🎂`);
                }}
                className="px-3 py-1.5 bg-white text-amber-900 hover:bg-amber-50 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5"
              >
                <Send className="w-3 h-3 text-amber-700" />
                <span>Send Birthday SMS</span>
              </button>
            </div>
          )}

          {/* Multi-Horizon Switch Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-xs block">Comprehensive Multi-Horizon Attendance Matrix</span>
                <span className="text-[11px] text-emerald-200">
                  Inspect Daily, Weekly, Monthly, and Termly horizons for all learners in each classroom with frozen headers and pinned student columns.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setMatrixClass(selectedClass === 'ALL' ? 'Form 4 Green' : selectedClass);
                setActiveTab('MATRIX');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shrink-0 transition flex items-center gap-1.5 shadow-xs"
            >
              <span>Open Matrix Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

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

      {/* TAB: MULTI-HORIZON ATTENDANCE MATRIX (Daily, Weekly, Monthly, Termly) */}
      {activeTab === 'MATRIX' && (
        <div className="space-y-5">
          {/* Zambian Public Holiday Notification Banner if selected date is holiday */}
          {selectedDateHoliday && (
            <div className="bg-emerald-800 text-white p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border border-emerald-700">
              <div className="flex items-center gap-2.5">
                <Flag className="w-5 h-5 text-emerald-300 shrink-0" />
                <div>
                  <span className="font-bold text-xs block">
                    🇿🇲 Gazetted Zambian Public Holiday: {selectedDateHoliday.name} ({selectedDateHoliday.dayOfWeek})
                  </span>
                  <span className="text-[11px] text-emerald-100">
                    {selectedDateHoliday.significance} Official mandatory closure under Zambian statutory law — no learners marked absent.
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-white text-emerald-950 rounded-lg text-[10px] font-black uppercase shrink-0">
                Mandatory Closure
              </span>
            </div>
          )}

          {/* Today's Birthday Banner for Active Classroom in Matrix */}
          {classBirthdaysToday.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <Cake className="w-5 h-5 text-yellow-200 shrink-0" />
                <div>
                  <span className="font-bold text-xs block">
                    🎉 Learner Birthday Alert ({classBirthdaysToday.length} Celebrant{classBirthdaysToday.length > 1 ? 's' : ''})
                  </span>
                  <span className="text-[11px] text-amber-100">
                    {classBirthdaysToday.map((b: LearnerBirthdayProfile) => `${b.learnerName} (${b.className}, turning ${b.turningAge})`).join(' • ')} — Commend their milestone during morning roll-call!
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const b = classBirthdaysToday[0];
                  setToastMessage(`SMS Birthday Greeting queued to ${b.guardianName} (${b.guardianPhone}) for ${b.learnerName}! 🎂`);
                }}
                className="px-3 py-1.5 bg-white text-amber-900 hover:bg-amber-50 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5"
              >
                <Send className="w-3 h-3 text-amber-700" />
                <span>Send Birthday SMS</span>
              </button>
            </div>
          )}

          {/* Controls Bar: Classroom, Status Filter, Search, and Action */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Classroom Selector */}
              <div>
                <label className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Classroom Cohort</label>
                <select
                  value={matrixClass}
                  onChange={(e) => setMatrixClass(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="ALL">All Cohorts (Consolidated View)</option>
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

              {/* Status Filter */}
              <div>
                <label className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Status Filter</label>
                <select
                  value={matrixStatusFilter}
                  onChange={(e: any) => setMatrixStatusFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="ALL">All Enrolled Learners</option>
                  <option value="ABSENT_TODAY">Absent Today Only</option>
                  <option value="LATE_TODAY">Late Arrivals Today</option>
                  <option value="CHRONIC">Chronic Attendance Concern (&lt; 85%)</option>
                  <option value="BOARDERS">Boarders Only</option>
                  <option value="DAY_SCHOLARS">Day Scholars Only</option>
                </select>
              </div>

              {/* Text Search Input */}
              <div>
                <label className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Search Learner</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={matrixSearch}
                    onChange={(e) => setMatrixSearch(e.target.value)}
                    placeholder="Search name or ID..."
                    className="bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs w-44"
                  />
                  {matrixSearch && (
                    <button
                      type="button"
                      onClick={() => setMatrixSearch('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Live Count */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportClassroomMatrixCsv}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMatrixSearch('');
                  setMatrixStatusFilter('ALL');
                }}
                className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 font-bold text-xs transition"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Classroom Multi-Horizon Aggregate KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Daily Horizon KPI */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <span>Daily (Today)</span>
                <Clock className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900">{classDailyPct}%</span>
                <span className="text-[10px] font-bold text-emerald-600">({classPresentToday}/{classTotal})</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-0.5">
                <span className="text-emerald-700 font-semibold">{classPresentToday} Present</span>
                <span>•</span>
                <span className={classAbsentToday > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                  {classAbsentToday} Absent
                </span>
                <span>•</span>
                <span className="text-amber-600">{classLateToday} Late</span>
              </div>
            </div>

            {/* Weekly Horizon KPI */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <span>Weekly (Week 8)</span>
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900">{classWeeklyAvg}%</span>
                <span className="text-[10px] font-bold text-indigo-600">5-Day Rate</span>
              </div>
              <span className="text-[10px] text-slate-500 block pt-0.5">
                Rolling weekly average across all instructional sessions
              </span>
            </div>

            {/* Monthly Horizon KPI */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <span>Monthly (March MTD)</span>
                <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900">{classMonthlyAvg}%</span>
                <span className="text-[10px] font-bold text-emerald-600">22 Days</span>
              </div>
              <span className="text-[10px] text-slate-500 block pt-0.5">
                Solwezi district curriculum calendar adherence
              </span>
            </div>

            {/* Termly Horizon KPI */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <span>Termly (Term 1)</span>
                <Award className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900">{classTermlyAvg}%</span>
                <span className={`text-[10px] font-bold ${classChronicCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {classChronicCount} Flagged
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block pt-0.5">
                Official DEBS / Ministry of Education statutory return
              </span>
            </div>
          </div>

          {/* Table Container with Sticky Headers and Sticky Left Column */}
          <div className="relative max-h-[580px] overflow-auto border border-slate-200 rounded-2xl shadow-xs bg-white">
            <table className="w-full text-left border-collapse text-xs">
              {/* Sticky Top Grouped Header */}
              <thead className="sticky top-0 z-20 bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                <tr>
                  {/* Sticky Top-Left Corner Cell: z-30 pinned vertically and horizontally */}
                  <th
                    rowSpan={2}
                    className="sticky top-0 left-0 z-30 bg-slate-900 px-3.5 py-2.5 border-r border-slate-800 min-w-[210px] max-w-[230px] shadow-[2px_0_5px_rgba(0,0,0,0.18)]"
                  >
                    <div className="flex items-center justify-between">
                      <span>Learner Identity</span>
                      <span className="text-[10px] font-mono text-slate-400">({matrixLearners.length})</span>
                    </div>
                  </th>
                  <th
                    colSpan={6}
                    className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-800 text-sky-200 uppercase tracking-wider text-[10px]"
                  >
                    Daily Horizon (This Week: Mon 02 - Fri 06 Mar)
                  </th>
                  <th
                    colSpan={2}
                    className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-850 text-indigo-200 uppercase tracking-wider text-[10px]"
                  >
                    Weekly Horizon
                  </th>
                  <th
                    colSpan={2}
                    className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-800 text-emerald-200 uppercase tracking-wider text-[10px]"
                  >
                    Monthly Horizon
                  </th>
                  <th
                    colSpan={3}
                    className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-850 text-amber-200 uppercase tracking-wider text-[10px]"
                  >
                    Term 1 Cumulative
                  </th>
                  <th
                    rowSpan={2}
                    className="sticky top-0 right-0 z-20 bg-slate-900 px-2 py-2 text-center min-w-[80px] border-l border-slate-800 shadow-[-2px_0_5px_rgba(0,0,0,0.15)]"
                  >
                    Card
                  </th>
                </tr>
                {/* Second Row of Column Subheaders */}
                <tr className="bg-slate-800 text-[10px] uppercase font-bold text-slate-300">
                  <th className="px-1 py-1 text-center min-w-[34px] border-r border-slate-700/60" title="Monday 02 Mar">M</th>
                  <th className="px-1 py-1 text-center min-w-[34px] border-r border-slate-700/60" title="Tuesday 03 Mar">T</th>
                  <th className="px-1 py-1 text-center min-w-[34px] border-r border-slate-700/60" title="Wednesday 04 Mar">W</th>
                  <th className="px-1 py-1 text-center min-w-[34px] border-r border-slate-700/60" title="Thursday 05 Mar">T</th>
                  <th className="px-1 py-1 text-center min-w-[34px] border-r border-slate-700/60" title="Friday 06 Mar">F</th>
                  <th className="px-2 py-1 text-center border-r border-slate-700 min-w-[75px]" title="Today Live Status">Today</th>
                  <th className="px-2 py-1 text-center min-w-[65px]" title="Week 8 Attendance Rate">Wk 8 %</th>
                  <th className="px-2 py-1 text-center border-r border-slate-700 min-w-[65px]" title="Past 4 Weeks Trend">Trend</th>
                  <th className="px-2 py-1 text-center min-w-[70px]" title="March Month-to-Date">Mar %</th>
                  <th className="px-2 py-1 text-center border-r border-slate-700 min-w-[65px]" title="February Total">Feb %</th>
                  <th className="px-2 py-1 text-center min-w-[65px]" title="Term 1 Cumulative Rate">Term %</th>
                  <th className="px-2 py-1 text-center min-w-[80px]" title="Present / Absent / Late Days">P • A • L</th>
                  <th className="px-2 py-1 text-center border-r border-slate-700 min-w-[65px]" title="Official MOE Standing">Standing</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                {matrixLearners.length > 0 ? (
                  matrixLearners.map((learner) => {
                    const h = getLearnerAttendanceHorizons(learner);
                    return (
                      <tr key={learner.id} className="hover:bg-blue-50/50 transition group">
                        {/* Sticky Left Column: pinned on horizontal scroll */}
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-blue-50/90 px-3.5 py-2 border-r border-slate-200 min-w-[210px] max-w-[230px] shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${
                                learner.studentType === 'BOARDER'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-sky-50 text-sky-700 border-sky-200'
                              }`}
                            >
                              {learner.learnerName.charAt(0)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-900 block truncate leading-tight">
                                {learner.learnerName}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {learner.studentNumber} • <span className="font-semibold">{learner.studentType === 'BOARDER' ? 'Boarder' : 'Day'}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Daily: Mon */}
                        <td className="px-1 py-1.5 text-center border-r border-slate-100">
                          <span
                            title={`Monday 02 Mar: ${h.daily.monday.status} (${h.daily.monday.time})`}
                            className={`inline-block w-5 h-5 rounded-full text-[9px] font-black leading-5 text-center cursor-help ${
                              h.daily.monday.status === 'PRESENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : h.daily.monday.status === 'LATE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {h.daily.monday.status.charAt(0)}
                          </span>
                        </td>

                        {/* Daily: Tue */}
                        <td className="px-1 py-1.5 text-center border-r border-slate-100">
                          <span
                            title={`Tuesday 03 Mar: ${h.daily.tuesday.status} (${h.daily.tuesday.time})`}
                            className={`inline-block w-5 h-5 rounded-full text-[9px] font-black leading-5 text-center cursor-help ${
                              h.daily.tuesday.status === 'PRESENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : h.daily.tuesday.status === 'LATE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {h.daily.tuesday.status.charAt(0)}
                          </span>
                        </td>

                        {/* Daily: Wed */}
                        <td className="px-1 py-1.5 text-center border-r border-slate-100">
                          <span
                            title={`Wednesday 04 Mar: ${h.daily.wednesday.status} (${h.daily.wednesday.time})`}
                            className={`inline-block w-5 h-5 rounded-full text-[9px] font-black leading-5 text-center cursor-help ${
                              h.daily.wednesday.status === 'PRESENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : h.daily.wednesday.status === 'LATE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {h.daily.wednesday.status.charAt(0)}
                          </span>
                        </td>

                        {/* Daily: Thu */}
                        <td className="px-1 py-1.5 text-center border-r border-slate-100">
                          <span
                            title={`Thursday 05 Mar: ${h.daily.thursday.status} (${h.daily.thursday.time})`}
                            className={`inline-block w-5 h-5 rounded-full text-[9px] font-black leading-5 text-center cursor-help ${
                              h.daily.thursday.status === 'PRESENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : h.daily.thursday.status === 'LATE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {h.daily.thursday.status.charAt(0)}
                          </span>
                        </td>

                        {/* Daily: Fri */}
                        <td className="px-1 py-1.5 text-center border-r border-slate-100">
                          <span
                            title={`Friday 06 Mar: ${h.daily.friday.status} (${h.daily.friday.time})`}
                            className={`inline-block w-5 h-5 rounded-full text-[9px] font-black leading-5 text-center cursor-help ${
                              h.daily.friday.status === 'PRESENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : h.daily.friday.status === 'LATE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {h.daily.friday.status.charAt(0)}
                          </span>
                        </td>

                        {/* Daily: Today Interactive Pill */}
                        <td className="px-2 py-1.5 text-center border-r border-slate-200">
                          <button
                            type="button"
                            onClick={() => cycleTodayPunctuality(learner.id, learner.status)}
                            title="Click to toggle status: Present → Absent → Late → Excused"
                            className={`px-2 py-0.5 rounded text-[10px] font-black border transition hover:scale-105 active:scale-95 ${
                              learner.status === 'PRESENT'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : learner.status === 'LATE'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : learner.status === 'EXCUSED'
                                ? 'bg-slate-100 text-slate-700 border-slate-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                            }`}
                          >
                            {learner.status}
                          </button>
                        </td>

                        {/* Weekly: Week 8 % */}
                        <td className="px-2 py-1.5 text-center font-bold text-slate-800">
                          <div className="flex flex-col items-center">
                            <span>{h.weekly.currentWeekRate}%</span>
                            <span className="text-[9px] font-mono text-slate-400">({h.weekly.currentWeekDaysPresent}/5d)</span>
                          </div>
                        </td>

                        {/* Weekly: 4-Wk Trend */}
                        <td className="px-2 py-1.5 text-center border-r border-slate-200">
                          <div className="flex items-center justify-center gap-1" title="Weeks 5, 6, 7, 8 attendance trend">
                            {h.weekly.weekTrends.map((wt) => (
                              <span
                                key={wt.week}
                                className={`w-2 h-3.5 rounded-xs ${
                                  wt.rate >= 95 ? 'bg-emerald-500' : wt.rate >= 80 ? 'bg-amber-400' : 'bg-rose-500'
                                }`}
                                title={`${wt.week}: ${wt.rate}%`}
                              />
                            ))}
                          </div>
                        </td>

                        {/* Monthly: March MTD % */}
                        <td className="px-2 py-1.5 text-center font-bold text-slate-800">
                          <div className="flex flex-col items-center">
                            <span>{h.monthly.currentMonthRate}%</span>
                            <span className="text-[9px] font-mono text-slate-400">
                              ({h.monthly.currentMonthDaysPresent}/{h.monthly.currentMonthTotalDays}d)
                            </span>
                          </div>
                        </td>

                        {/* Monthly: Feb Total % */}
                        <td className="px-2 py-1.5 text-center font-semibold text-slate-600 border-r border-slate-200">
                          <span>{h.monthly.prevMonthRate}%</span>
                        </td>

                        {/* Termly: Cumulative % */}
                        <td className="px-2 py-1.5 text-center font-black">
                          <span
                            className={
                              h.termly.termRate >= 98
                                ? 'text-emerald-700'
                                : h.termly.termRate >= 95
                                ? 'text-blue-700'
                                : h.termly.termRate >= 85
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }
                          >
                            {h.termly.termRate}%
                          </span>
                        </td>

                        {/* Termly: P • A • L Days */}
                        <td className="px-2 py-1.5 text-center font-mono text-[10px] text-slate-600">
                          <span>
                            {h.termly.presentCount}P • <strong className="text-rose-600">{h.termly.absentCount}A</strong> • {h.termly.lateCount}L
                          </span>
                        </td>

                        {/* Termly: Standing Badge */}
                        <td className="px-2 py-1.5 text-center border-r border-slate-200">
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black ${
                              h.termly.standing === 'GOLD'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : h.termly.standing === 'SILVER'
                                ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                : h.termly.standing === 'BRONZE'
                                ? 'bg-orange-50 text-orange-800 border border-orange-200'
                                : 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                            }`}
                          >
                            {h.termly.standing}
                          </span>
                        </td>

                        {/* Sticky Right Action Column */}
                        <td className="sticky right-0 z-10 bg-white group-hover:bg-blue-50/90 px-2 py-1.5 text-center border-l border-slate-200 shadow-[-2px_0_5px_rgba(0,0,0,0.03)]">
                          <button
                            type="button"
                            onClick={() => setSelectedLearnerForCard(learner)}
                            className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200 flex items-center justify-center gap-1 transition w-full"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Card</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={15} className="py-8 text-center text-slate-500 text-xs">
                      No learners match the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SCHOOL CALENDAR, ZAMBIA PUBLIC HOLIDAYS & LEARNER BIRTHDAYS */}
      {activeTab === 'CALENDAR' && (
        <div className="space-y-6">
          {/* Banner with Link to Full Screen Calendar */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
                <Cake className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">
                    Official School Calendar, Zambian Public Holidays & Learner Birthdays
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-700 text-white rounded-full text-[10px] font-bold">
                    MoE Zambia Tri-Term
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Automated synchronization with Zambia statutory public holidays, MoE term instruction days, and 780 learner birthday milestones.
                </p>
              </div>
            </div>

            <a
              href="/calendar"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Calendar className="w-4 h-4" />
              <span>Open Interactive Month Grid</span>
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Statutory Holidays</span>
                <Flag className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">15 Days</div>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Gazetted School Closures</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Academic Structure</span>
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">3 Terms</div>
              <p className="text-[10px] text-blue-700 font-semibold mt-0.5">187 Teaching Days (39 Wks)</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">ECZ National Exams</span>
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-900">26 Oct - 27 Nov</div>
              <p className="text-[10px] text-purple-700 font-semibold mt-0.5">Grades 7, 9 & 12</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-amber-800 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Today's Birthdays</span>
                <Cake className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-950">
                {getTodayBirthdays().count} Celebrants
              </div>
              <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Active across all grades</p>
            </div>
          </div>

          {/* Section 1: Zambian Statutory Public Holidays Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-3 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-emerald-600" />
                  <span>Republic of Zambia Gazetted Public Holidays (2026)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Statutory non-instructional days. The attendance register automatically accounts for these dates.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter public holidays..."
                  value={calendarHolidaysSearch}
                  onChange={(e) => setCalendarHolidaysSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden w-52 font-semibold"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Gazetted Holiday</th>
                    <th className="py-2.5 px-3">Date (2026)</th>
                    <th className="py-2.5 px-3">Day</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Attendance Impact</th>
                    <th className="py-2.5 px-3">National Significance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {ZAMBIAN_PUBLIC_HOLIDAYS_2026.filter((h) =>
                    calendarHolidaysSearch
                      ? h.name.toLowerCase().includes(calendarHolidaysSearch.toLowerCase()) ||
                        h.date.includes(calendarHolidaysSearch)
                      : true
                  ).map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{h.name}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{h.date}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{h.dayOfWeek}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800">
                          {h.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Mandatory School Closure
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-600 max-w-sm truncate" title={h.significance}>
                        {h.significance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: MoE 2026 Academic Terms Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4">
            <div>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Ministry of Education (MoE) 2026 Tri-Term Academic Framework</span>
              </h4>
              <p className="text-xs text-slate-500">
                Statutory term boundaries, mid-term breaks, and vacation schedules for North-Western Province.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ACADEMIC_TERMS_2026.map((term) => (
                <div key={term.termNumber} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-black text-slate-900">{term.termLabel}</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                      {term.teachingWeeks} Wks ({term.totalTeachingDays} Days)
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Term Dates:</span>
                      <strong className="text-slate-900">{term.startDate} to {term.endDate}</strong>
                    </div>
                    <div className="flex justify-between text-purple-700">
                      <span>Mid-Term Exeat:</span>
                      <strong>{term.midTermBreak.startDate} - {term.midTermBreak.endDate}</strong>
                    </div>
                    {term.eczExamWindow && (
                      <div className="flex justify-between text-amber-800 font-bold pt-1 border-t border-slate-200">
                        <span>ECZ Exam Window:</span>
                        <span>{term.eczExamWindow.startDate} to {term.eczExamWindow.endDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Learner Birthdays Showcase */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Cake className="w-4 h-4 text-amber-600" />
                  <span>Learner Birthdays Registry (780 Enrolled Students)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Track and celebrate student milestones during morning roll-call with automated SMS birthday greetings.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={calendarBirthdayMonth}
                  onChange={(e) => setCalendarBirthdayMonth(parseInt(e.target.value, 10))}
                  className="font-bold bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800"
                >
                  <option value={0}>All Months</option>
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>

                <select
                  value={calendarBirthdayClass}
                  onChange={(e) => setCalendarBirthdayClass(e.target.value)}
                  className="font-bold bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 max-w-[140px]"
                >
                  <option value="ALL">All Classes</option>
                  {distinctBirthdayClasses.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Search name, ID..."
                  value={calendarBirthdaySearch}
                  onChange={(e) => setCalendarBirthdaySearch(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden w-36 font-semibold"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[360px] overflow-y-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-900 text-white font-bold text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Learner Name</th>
                    <th className="py-2.5 px-3">Class & Campus</th>
                    <th className="py-2.5 px-3">Date of Birth</th>
                    <th className="py-2.5 px-3">Age</th>
                    <th className="py-2.5 px-3">Guardian</th>
                    <th className="py-2.5 px-3 text-center">SMS Greeting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredCalendarBirthdays.slice(0, 50).map((b: LearnerBirthdayProfile) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <Cake className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{b.learnerName}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <strong className="text-slate-800 block">{b.className}</strong>
                        <span className="text-[10px] text-slate-400">{b.campusName}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{b.dateOfBirth}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900">
                          {b.turningAge} Yrs
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px]">
                        <strong className="text-slate-800 block">{b.guardianName}</strong>
                        <span className="text-blue-700 font-mono text-[10px]">{b.guardianPhone}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setToastMessage(`SMS Birthday Blessing dispatched to ${b.guardianName} (${b.guardianPhone}) for ${b.learnerName}! 🎂`);
                          }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg transition inline-flex items-center gap-1"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>Wish</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[11px] text-slate-400 text-right">
              Showing {Math.min(50, filteredCalendarBirthdays.length)} of {filteredCalendarBirthdays.length} matching learner birthdays.
            </div>
          </div>
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

      {/* MODAL: Individual Learner Attendance Passport / Card */}
      {selectedLearnerForCard && (() => {
        const h = getLearnerAttendanceHorizons(selectedLearnerForCard);
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {selectedLearnerForCard.learnerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{selectedLearnerForCard.learnerName}</h3>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                        {selectedLearnerForCard.studentNumber}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {selectedLearnerForCard.className} • {selectedLearnerForCard.campusName} •{' '}
                      <strong>{selectedLearnerForCard.studentType === 'BOARDER' ? 'Boarder' : 'Day Scholar'}</strong>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLearnerForCard(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4 Time Horizons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">1. Daily (Today)</span>
                  <span className="text-base font-black text-slate-900 mt-1 block">
                    {selectedLearnerForCard.status}
                  </span>
                  <span className="text-[10px] text-slate-500">Arrival: {h.daily.today.time}</span>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                  <span className="text-indigo-800 text-[10px] uppercase font-bold block">2. Weekly (Wk 8)</span>
                  <span className="text-base font-black text-indigo-950 mt-1 block">
                    {h.weekly.currentWeekRate}%
                  </span>
                  <span className="text-[10px] text-indigo-700">{h.weekly.currentWeekDaysPresent} of 5 days present</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-800 text-[10px] uppercase font-bold block">3. Monthly (March)</span>
                  <span className="text-base font-black text-emerald-950 mt-1 block">
                    {h.monthly.currentMonthRate}%
                  </span>
                  <span className="text-[10px] text-emerald-700">{h.monthly.currentMonthDaysPresent} / {h.monthly.currentMonthTotalDays} days</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-amber-800 text-[10px] uppercase font-bold block">4. Term 1 Total</span>
                  <span className="text-base font-black text-amber-950 mt-1 block">
                    {h.termly.termRate}%
                  </span>
                  <span className="text-[10px] font-bold text-amber-700">{h.termly.standing} Standing</span>
                </div>
              </div>

              {/* Horizon 1: Detailed Daily Week Session Log */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Current Week Daily Punctuality Log (Mon - Fri)
                </h4>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  {[
                    { label: 'Monday', day: h.daily.monday },
                    { label: 'Tuesday', day: h.daily.tuesday },
                    { label: 'Wednesday', day: h.daily.wednesday },
                    { label: 'Thursday', day: h.daily.thursday },
                    { label: 'Friday (Today)', day: h.daily.friday },
                  ].map((d) => (
                    <div
                      key={d.label}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-center space-y-1"
                    >
                      <span className="text-[10px] text-slate-500 font-bold block">{d.label}</span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black border ${
                          d.day.status === 'PRESENT'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : d.day.status === 'LATE'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {d.day.status}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">{d.day.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Horizon 2: Weekly Progression (Weeks 1 to 8) */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Weekly Attendance Progression (Term 1)
                </h4>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {h.weekly.weekTrends.map((wt) => (
                    <div key={wt.week} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 font-bold block">{wt.week}</span>
                      <span className="font-black text-slate-900">{wt.rate}%</span>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            wt.rate >= 95 ? 'bg-emerald-600' : wt.rate >= 80 ? 'bg-amber-500' : 'bg-rose-600'
                          }`}
                          style={{ width: `${wt.rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guardian & Actions Footer */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Guardian Contact Details</span>
                  <span className="font-bold text-slate-900 block">{selectedLearnerForCard.guardianName}</span>
                  <span className="font-mono text-slate-600 text-[11px]">{selectedLearnerForCard.guardianPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleSendAbsenteeAlert(selectedLearnerForCard);
                      setSelectedLearnerForCard(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send SMS Notice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLearnerForCard(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
