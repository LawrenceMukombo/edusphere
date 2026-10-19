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
  Lock,
  Unlock,
  Smartphone,
  ShieldAlert,
  DollarSign,
  History,
  QrCode,
  FileCheck,
} from 'lucide-react';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';
import { useCampus } from '@/components/CampusContext';
import { ModuleGate } from '@/components/ModuleGate';
import {
  cacheOfflineRecord,
  getOfflineRecord,
  enqueueOfflineMutation,
} from '@/lib/offlineSync';
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
  // Financial & Access Security Fields:
  totalBilled: number;
  totalPaid: number;
  balanceDue: number;
  financialStatus: 'CLEARED' | 'PARTIAL' | 'ARREARS' | 'CHRONIC_ARREARS';
  busAccessStatus: 'ACTIVE' | 'SUSPENDED';
  campusAccessStatus: 'ACTIVE' | 'DENIED';
  accessLockReason?: string;
  lastPaymentDate?: string;
  lastPaymentRef?: string;
}

interface MonthAttendanceRecord {
  monthIndex: number; // 1 to 12
  monthName: string; // 'January', 'February', ...
  shortMonth: string; // 'Jan', 'Feb', ...
  termNumber: 1 | 2 | 3;
  teachingDays: number;
  daysPresent: number;
  daysAbsent: number;
  daysLate: number;
  daysExcused: number;
  rate: number; // percentage
  status: 'EXEMPLARY' | 'GOOD' | 'BORDERLINE' | 'CRITICAL';
  isFuture: boolean;
  isPast: boolean;
  isCurrent: boolean;
}

interface DayAttendanceRecord {
  dayNumber: number; // 1 to 31
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: string; // 'M' | 'T' | 'W' | 'T' | 'F' | 'S' | 'S'
  isWeekend: boolean;
  isHoliday: boolean;
  isFuture: boolean;
  isToday: boolean;
  isLocked: boolean;
  holidayName?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'WEEKEND' | 'HOLIDAY' | 'FUTURE_SCHEDULED' | 'FEE_LOCKED';
  time?: string;
}

interface AttendanceAuditEntry {
  id: string;
  timestamp: string;
  eventType: 'ROLL_CALL_LOG' | 'MOBILE_MONEY_PAYMENT' | 'FEE_LOCK_ENFORCED' | 'ACCESS_RESTORED' | 'STATUTORY_RETURN_FILED';
  learnerName: string;
  studentNumber: string;
  className: string;
  campusName: string;
  details: string;
  officer: string;
  status: 'VERIFIED' | 'FLAGGED';
  channel?: string;
  amount?: number;
  reference?: string;
}

interface TermAttendanceRecord {
  termNumber: 1 | 2 | 3;
  termLabel: string;
  teachingDays: number;
  sessionsAttended: number;
  sessionsAbsent: number;
  sessionsLate: number;
  sessionsExcused: number;
  rate: number;
  standing: 'GOLD' | 'SILVER' | 'BRONZE' | 'CRITICAL';
  isCurrentTerm: boolean;
}

interface AnnualAttendanceRecord {
  totalTeachingDays: number; // 187
  totalAttended: number;
  annualRate: number;
  totalAbsences: number;
  totalLates: number;
  standing: 'GOLD' | 'SILVER' | 'BRONZE' | 'CRITICAL';
  eczExamClearance: 'CLEARED' | 'CONDITIONAL' | 'BARRED';
  eczClearanceNote: string;
}

interface WeekAttendanceRecord {
  weekNumber: number; // 1 to 13
  weekLabel: string; // 'Wk 1', 'Wk 2', ...
  teachingDays: number;
  daysAttended: number;
  rate: number;
  standing: 'EXCELLENT' | 'SATISFACTORY' | 'CONCERN';
}

const CURRENT_ACADEMIC_YEAR = 2026;
const CURRENT_ACADEMIC_TERM = 3;
const CURRENT_MONTH_INDEX = 10; // October 2026 (Live Current Month • Term 3)
const CURRENT_DAY = 19; // Monday, 19 October 2026 (Active Instructional Session)
const ELAPSED_TEACHING_DAYS_MARCH = 13; // Term 3 Week 8

const MONTH_CONFIGS = [
  { index: 1, name: 'January', short: 'Jan', days: 31, teachingDays: 15, term: 1 as const, termLabel: 'Term 1', isPast: true, isCurrent: false, isFuture: false },
  { index: 2, name: 'February', short: 'Feb', days: 28, teachingDays: 20, term: 1 as const, termLabel: 'Term 1', isPast: true, isCurrent: false, isFuture: false },
  { index: 3, name: 'March', short: 'Mar', days: 31, teachingDays: 22, term: 1 as const, termLabel: 'Term 1', isPast: true, isCurrent: false, isFuture: false },
  { index: 4, name: 'April', short: 'Apr', days: 30, teachingDays: 6, term: 1 as const, termLabel: 'Term 1', isPast: true, isCurrent: false, isFuture: false },
  { index: 5, name: 'May', short: 'May', days: 31, teachingDays: 15, term: 2 as const, termLabel: 'Term 2', isPast: true, isCurrent: false, isFuture: false },
  { index: 6, name: 'June', short: 'Jun', days: 30, teachingDays: 21, term: 2 as const, termLabel: 'Term 2', isPast: true, isCurrent: false, isFuture: false },
  { index: 7, name: 'July', short: 'Jul', days: 31, teachingDays: 22, term: 2 as const, termLabel: 'Term 2', isPast: true, isCurrent: false, isFuture: false },
  { index: 8, name: 'August', short: 'Aug', days: 31, teachingDays: 4, term: 2 as const, termLabel: 'Term 2', isPast: true, isCurrent: false, isFuture: false },
  { index: 9, name: 'September', short: 'Sep', days: 30, teachingDays: 18, term: 3 as const, termLabel: 'Term 3', isPast: true, isCurrent: false, isFuture: false },
  { index: 10, name: 'October', short: 'Oct', days: 31, teachingDays: 21, term: 3 as const, termLabel: 'Term 3 (Active)', isPast: false, isCurrent: true, isFuture: false },
  { index: 11, name: 'November', short: 'Nov', days: 30, teachingDays: 20, term: 3 as const, termLabel: 'Term 3 (ECZ Exams)', isPast: false, isCurrent: false, isFuture: true },
  { index: 12, name: 'December', short: 'Dec', days: 31, teachingDays: 3, term: 3 as const, termLabel: 'Term 3 (Close 04 Dec)', isPast: false, isCurrent: false, isFuture: true },
];

function getMonthDaysForLearner(learner: StudentRosterItem, monthIndex: number): DayAttendanceRecord[] {
  const mInfo = MONTH_CONFIGS.find((m) => m.index === monthIndex) || MONTH_CONFIGS[2];
  const numPart = parseInt(learner.studentNumber.replace(/\D/g, ''), 10) || 101;
  const seed = (numPart * 17 + 23) % 1000;
  const days: DayAttendanceRecord[] = [];
  const daysInMonth = mInfo.days;
  const isFeeLocked = learner.balanceDue > 0 && (learner.financialStatus === 'ARREARS' || learner.financialStatus === 'CHRONIC_ARREARS');

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `2026-${String(monthIndex).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dt = new Date(2026, monthIndex - 1, d);
    const dayNum = dt.getDay(); // 0 = Sun, 6 = Sat
    const dayOfWeekLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][dayNum];
    const isWeekend = dayNum === 0 || dayNum === 6;
    const holiday = ZAMBIAN_PUBLIC_HOLIDAYS_2026.find((h) => h.date === dateStr || h.observedDate === dateStr);
    const isFuture = monthIndex > CURRENT_MONTH_INDEX || (monthIndex === CURRENT_MONTH_INDEX && d > CURRENT_DAY);
    const isToday = monthIndex === CURRENT_MONTH_INDEX && d === CURRENT_DAY;

    if (isWeekend) {
      days.push({
        dayNumber: d,
        dateStr,
        dayOfWeek: dayOfWeekLetter,
        isWeekend: true,
        isHoliday: false,
        isFuture,
        isToday,
        isLocked: false,
        status: 'WEEKEND',
      });
    } else if (holiday) {
      days.push({
        dayNumber: d,
        dateStr,
        dayOfWeek: dayOfWeekLetter,
        isWeekend: false,
        isHoliday: true,
        isFuture,
        isToday,
        isLocked: false,
        holidayName: holiday.name,
        status: 'HOLIDAY',
      });
    } else if (isFuture) {
      // STRICT DATA VALIDATION: Future dates CANNOT have roll-call pre-recorded!
      days.push({
        dayNumber: d,
        dateStr,
        dayOfWeek: dayOfWeekLetter,
        isWeekend: false,
        isHoliday: false,
        isFuture: true,
        isToday: false,
        isLocked: false,
        status: 'FUTURE_SCHEDULED',
        time: '—',
      });
    } else {
      const dayHash = (seed * 19 + d * 37 + monthIndex * 53) % 100;
      let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' = 'PRESENT';
      let time = '07:18';

      // If month is March (3) and day is 6 (Today), reflect live today status!
      if (isToday) {
        status = learner.status;
        time = learner.status === 'LATE' ? '07:56' : learner.status === 'ABSENT' ? '—' : '07:19';
      } else if (seed % 47 === 0) {
        // Chronic absentee
        if (dayHash < 20) {
          status = 'ABSENT';
          time = '—';
        } else if (dayHash < 32) {
          status = 'LATE';
          time = '08:05';
        } else if (dayHash < 36) {
          status = 'EXCUSED';
          time = '—';
        } else {
          status = 'PRESENT';
          time = '07:22';
        }
      } else if (seed % 9 === 0) {
        // Occasionally late
        if (dayHash < 6) {
          status = 'ABSENT';
          time = '—';
        } else if (dayHash < 18) {
          status = 'LATE';
          time = '07:52';
        } else {
          status = 'PRESENT';
          time = '07:20';
        }
      } else {
        // Regular learner
        if (dayHash < 3) {
          status = 'ABSENT';
          time = '—';
        } else if (dayHash < 6) {
          status = 'LATE';
          time = '07:49';
        } else {
          status = 'PRESENT';
          time = '07:16';
        }
      }

      days.push({
        dayNumber: d,
        dateStr,
        dayOfWeek: dayOfWeekLetter,
        isWeekend: false,
        isHoliday: false,
        isFuture: false,
        isToday,
        isLocked: false,
        status,
        time,
      });
    }
  }

  return days;
}

interface LearnerAttendanceHorizons {
  daily: {
    monday: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; time: string; date: string };
    tuesday: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; time: string; date: string };
    wednesday: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; time: string; date: string };
    thursday: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; time: string; date: string };
    friday: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; time: string; date: string };
    today: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; time: string };
    rollCallMethod: string;
    arrivalTime: string;
    arrivalMinutesLate: number;
  };
  weekly: {
    currentWeekRate: number;
    currentWeekDaysPresent: number;
    currentWeekTotalDays: number;
    weekTrends: { week: string; rate: number }[];
    termWeeks: WeekAttendanceRecord[];
  };
  monthly: {
    currentMonthRate: number;
    currentMonthDaysPresent: number;
    currentMonthTotalDays: number;
    prevMonthRate: number;
    prevMonthDaysPresent: number;
    prevMonthTotalDays: number;
    allMonths: MonthAttendanceRecord[];
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
    terms: TermAttendanceRecord[];
    annual: AnnualAttendanceRecord;
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

  // Generate all 13 instructional weeks of Term 1
  const termWeeks: WeekAttendanceRecord[] = Array.from({ length: 13 }, (_, i) => {
    const wNum = i + 1;
    const wHash = (seed * 23 + wNum * 41) % 100;
    let daysAtt = 5;
    if (wNum === 8) {
      daysAtt = daysPresent;
    } else if (seed % 47 === 0) {
      daysAtt = wHash < 35 ? 4 : wHash < 60 ? 3 : 5;
    } else if (seed % 9 === 0) {
      daysAtt = wHash < 20 ? 4 : 5;
    } else {
      daysAtt = wHash < 8 ? 4 : 5;
    }
    const rate = Math.round((daysAtt / 5) * 100);
    const standing: 'EXCELLENT' | 'SATISFACTORY' | 'CONCERN' =
      rate >= 95 ? 'EXCELLENT' : rate >= 80 ? 'SATISFACTORY' : 'CONCERN';
    return {
      weekNumber: wNum,
      weekLabel: `Wk ${wNum}`,
      teachingDays: 5,
      daysAttended: daysAtt,
      rate,
      standing,
    };
  });

  // Monthly: 12-Month Academic Year Matrix (Jan through Dec)
  const allMonths: MonthAttendanceRecord[] = MONTH_CONFIGS.map((mc) => {
    const isFeeLocked = learner.balanceDue > 0 && (learner.financialStatus === 'ARREARS' || learner.financialStatus === 'CHRONIC_ARREARS');
    const mHash = (seed * 31 + mc.index * 67) % 100;
    const tDays = mc.teachingDays;

    // Strict Data Validation: Future months have zero roll-calls recorded under MoE rules
    if (mc.isFuture) {
      return {
        monthIndex: mc.index,
        monthName: mc.name,
        shortMonth: mc.short,
        termNumber: mc.term,
        teachingDays: tDays,
        daysPresent: 0,
        daysAbsent: 0,
        daysLate: 0,
        daysExcused: 0,
        rate: 0,
        status: 'EXEMPLARY' as const,
        isFuture: true,
        isPast: false,
        isCurrent: false,
      };
    }

    let mAbsent = 0;
    let mLate = 0;
    let mExcused = 0;
    let mPresent = 0;
    let mRate = 100;

    if (mc.isCurrent) {
      // March live Month-to-date (5 elapsed days)
      mAbsent = (seed % 17 === 0 ? 1 : 0) + (learner.status === 'ABSENT' ? 1 : 0);
      mLate = seed % 9 === 0 ? 1 : learner.status === 'LATE' ? 1 : 0;
      mExcused = seed % 25 === 0 ? 1 : 0;
      mPresent = Math.max(0, ELAPSED_TEACHING_DAYS_MARCH - mAbsent);
      mRate = Math.min(100, Math.round((mPresent / ELAPSED_TEACHING_DAYS_MARCH) * 1000) / 10);
    } else {
      // Historical elapsed months: Jan (15d) & Feb (20d)
      if (mc.index === 2) {
        mAbsent = seed % 11 === 0 ? 1 : 0;
        mLate = seed % 6 === 0 ? 1 : 0;
      } else {
        mAbsent = seed % 13 === 0 ? 1 : 0;
        mLate = seed % 7 === 0 ? 1 : 0;
      }
      mPresent = Math.max(0, tDays - mAbsent);
      mRate = Math.min(100, Math.round((mPresent / tDays) * 1000) / 10);
    }

    let status: 'EXEMPLARY' | 'GOOD' | 'BORDERLINE' | 'CRITICAL' = 'EXEMPLARY';
    if (mRate >= 98) status = 'EXEMPLARY';
    else if (mRate >= 95) status = 'GOOD';
    else if (mRate >= 85) status = 'BORDERLINE';
    else status = 'CRITICAL';

    return {
      monthIndex: mc.index,
      monthName: mc.name,
      shortMonth: mc.short,
      termNumber: mc.term,
      teachingDays: tDays,
      daysPresent: mPresent,
      daysAbsent: mAbsent,
      daysLate: mLate,
      daysExcused: mExcused,
      rate: mRate,
      status,
      isFuture: false,
      isPast: mc.isPast,
      isCurrent: mc.isCurrent,
    };
  });

  const marchRecord = allMonths[2];
  const febRecord = allMonths[1];

  // Tri-Term Breakdown (Term 1, Term 2, Term 3)
  const term1Months = allMonths.filter((m) => m.termNumber === 1);
  const term1TeachingDaysTotal = term1Months.reduce((acc, m) => acc + m.teachingDays, 0); // 63
  const term1ElapsedDays = 15 + 20 + ELAPSED_TEACHING_DAYS_MARCH; // 40 days elapsed so far
  const term1Present = term1Months.reduce((acc, m) => acc + m.daysPresent, 0);
  const term1Absent = term1Months.reduce((acc, m) => acc + m.daysAbsent, 0);
  const term1Late = term1Months.reduce((acc, m) => acc + m.daysLate, 0);
  const term1Excused = term1Months.reduce((acc, m) => acc + m.daysExcused, 0);
  const term1Rate = Math.min(100, Math.round((term1Present / term1ElapsedDays) * 1000) / 10);

  const getStanding = (rate: number): 'GOLD' | 'SILVER' | 'BRONZE' | 'CRITICAL' => {
    if (rate >= 98.0) return 'GOLD';
    if (rate >= 95.0) return 'SILVER';
    if (rate >= 85.0) return 'BRONZE';
    return 'CRITICAL';
  };

  const terms: TermAttendanceRecord[] = [
    {
      termNumber: 1,
      termLabel: 'Term 1 (Autumn)',
      teachingDays: 63,
      sessionsAttended: Math.round(term1TeachingDaysTotal * 0.96),
      sessionsAbsent: Math.round(term1TeachingDaysTotal * 0.04),
      sessionsLate: 1,
      sessionsExcused: 1,
      rate: 96.0,
      standing: 'SILVER',
      isCurrentTerm: false,
    },
    {
      termNumber: 2,
      termLabel: 'Term 2 (Winter)',
      teachingDays: 62,
      sessionsAttended: Math.round(62 * 0.97),
      sessionsAbsent: Math.round(62 * 0.03),
      sessionsLate: 0,
      sessionsExcused: 1,
      rate: 97.0,
      standing: 'GOLD',
      isCurrentTerm: false,
    },
    {
      termNumber: 3,
      termLabel: 'Term 3 (Promotional & ECZ • Active)',
      teachingDays: term1TeachingDaysTotal,
      sessionsAttended: term1Present,
      sessionsAbsent: term1Absent,
      sessionsLate: term1Late,
      sessionsExcused: term1Excused,
      rate: term1Rate,
      standing: getStanding(term1Rate),
      isCurrentTerm: true,
    },
  ];

  // Annual Year-to-Date (40 Days Elapsed out of 187 Annual Target)
  const annualTotalDays = 187;
  const annualAttended = term1Present;
  const annualAbsent = term1Absent;
  const annualLate = term1Late;
  const annualRate = term1Rate; // YTD rate based on elapsed 40 days
  const annualStanding = getStanding(annualRate);

  let eczExamClearance: 'CLEARED' | 'CONDITIONAL' | 'BARRED' = 'CLEARED';
  let eczClearanceNote = 'Fully cleared for ECZ National Examination candidate entry based on statutory curriculum attendance.';
  if (annualRate < 80.0) {
    eczExamClearance = 'BARRED';
    eczClearanceNote = 'Disqualified under MoE statutory minimum 80% attendance rule; alert sent to Head.';
  } else if (annualRate < 90.0) {
    eczExamClearance = 'CONDITIONAL';
    eczClearanceNote = 'Requires DEBS attendance dispensation waiver for ECZ examination registration.';
  }

  const annual: AnnualAttendanceRecord = {
    totalTeachingDays: annualTotalDays,
    totalAttended: annualAttended,
    annualRate,
    totalAbsences: annualAbsent,
    totalLates: annualLate,
    standing: annualStanding,
    eczExamClearance,
    eczClearanceNote,
  };

  const isChronicAbsentee = term1Rate < 85.0;

  return {
    daily: {
      monday: { status: mondayStatus, time: mondayStatus === 'LATE' ? '08:04' : '07:18', date: '02 Mar' },
      tuesday: { status: tuesdayStatus, time: tuesdayStatus === 'LATE' ? '07:56' : '07:22', date: '03 Mar' },
      wednesday: { status: wednesdayStatus, time: wednesdayStatus === 'ABSENT' ? '—' : '07:15', date: '04 Mar' },
      thursday: { status: thursdayStatus, time: thursdayStatus === 'LATE' ? '07:52' : '07:20', date: '05 Mar' },
      friday: { status: fridayStatus, time: fridayStatus === 'LATE' ? '07:55' : fridayStatus === 'ABSENT' ? '—' : '07:19', date: '06 Mar' },
      today: { status: learner.status, time: learner.status === 'LATE' ? '07:55' : learner.status === 'ABSENT' ? '—' : '07:19' },
      rollCallMethod: learner.studentType === 'BOARDER' ? 'Boarding Master Roll-Call' : 'Classroom Teacher App',
      arrivalTime: learner.status === 'LATE' ? '07:55 AM' : learner.status === 'ABSENT' ? '—' : '07:19 AM',
      arrivalMinutesLate: learner.status === 'LATE' ? (learner.arrivalMinutesLate || 25) : 0,
    },
    weekly: {
      currentWeekRate,
      currentWeekDaysPresent: daysPresent,
      currentWeekTotalDays: 5,
      weekTrends,
      termWeeks,
    },
    monthly: {
      currentMonthRate: marchRecord.rate,
      currentMonthDaysPresent: marchRecord.daysPresent,
      currentMonthTotalDays: marchRecord.teachingDays,
      prevMonthRate: febRecord.rate,
      prevMonthDaysPresent: febRecord.daysPresent,
      prevMonthTotalDays: febRecord.teachingDays,
      allMonths,
    },
    termly: {
      termRate: term1Rate,
      totalSessions: term1TeachingDaysTotal,
      presentCount: term1Present,
      absentCount: term1Absent,
      lateCount: term1Late,
      excusedCount: term1Excused,
      standing: getStanding(term1Rate),
      isChronicAbsentee,
      terms,
      annual,
    },
  };
}

const GENERATED_ROSTER: StudentRosterItem[] = generateLegacyLearners(780).map((l) => {
  return {
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
    arrivalMinutesLate: l.todayAttendance === 'LATE' ? 38 : 0,
    guardianName: l.guardian.name,
    guardianPhone: l.guardian.phone,
    alertSent: l.todayAttendance === 'ABSENT',
    totalBilled: l.totalBilled,
    totalPaid: l.totalPaid,
    balanceDue: l.balance,
    financialStatus: l.financialStatus,
    busAccessStatus: 'ACTIVE',
    campusAccessStatus: 'ACTIVE',
    accessLockReason: undefined,
  };
});

const INITIAL_AUDIT_LOGS: AttendanceAuditEntry[] = [
  {
    id: 'AUD-2026-001',
    timestamp: '2026-03-06 07:15:22 CAT',
    eventType: 'STATUTORY_RETURN_FILED',
    learnerName: 'All 780 Enrolled Learners',
    studentNumber: 'CONSOLIDATED-780',
    className: 'All Primary & Secondary Cohorts',
    campusName: 'Urban & Mushitala Campuses',
    details: 'February 2026 Monthly Statutory Attendance Return (MoE Form 12A) certified and filed to Solwezi DEBS Inspectorate (98.1% Adherence).',
    officer: 'Mr. Emmanuel Mwansa (Director & Principal)',
    status: 'VERIFIED',
  },
  {
    id: 'AUD-2026-002',
    timestamp: '2026-03-06 07:20:05 CAT',
    eventType: 'FEE_LOCK_ENFORCED',
    learnerName: 'Grade 1 Gold & Form 4 Arrears Cohort',
    studentNumber: 'BATCH-BURSAR-LOCK',
    className: 'Multiple Classes',
    campusName: 'Urban Campus (Solwezi Central)',
    details: 'Automated Bursar Lock: Suspended biometric turnstile campus gate access & bus transport passes for learners with outstanding Term 1 fee balances.',
    officer: 'Mrs. Chileshe Mulenga (Chief Bursar & Finance Head)',
    status: 'FLAGGED',
  },
  {
    id: 'AUD-2026-003',
    timestamp: '2026-03-06 07:28:44 CAT',
    eventType: 'ROLL_CALL_LOG',
    learnerName: 'Classroom Roll-Call Morning Session',
    studentNumber: 'SESSION-06MAR',
    className: 'Grade 1 Gold',
    campusName: 'Urban Campus (Solwezi Central)',
    details: 'Grade 1 Gold Morning roll-call synchronized: 34 Present, 2 Absent, 2 Fee-Locked. Punctuality variance logged.',
    officer: 'Mrs. Grace Tembo (MEd Early Childhood & Primary Head)',
    status: 'VERIFIED',
  },
  {
    id: 'AUD-2026-004',
    timestamp: '2026-03-05 16:30:10 CAT',
    eventType: 'STATUTORY_RETURN_FILED',
    learnerName: 'All 780 Enrolled Learners',
    studentNumber: 'CONSOLIDATED-780',
    className: 'All Primary & Secondary Cohorts',
    campusName: 'Urban & Mushitala Campuses',
    details: 'January 2026 Monthly Statutory Return (MoE Form 12A) archived with digital cryptographic seal (98.4% Adherence).',
    officer: 'Mr. Emmanuel Mwansa (Director & Principal)',
    status: 'VERIFIED',
  },
];

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
  const [matrixHorizonView, setMatrixHorizonView] = useState<'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'TERMLY'>('ALL');
  const [monthlyViewMode, setMonthlyViewMode] = useState<'ALL_MONTHS' | 'DAILY_SHEET'>('ALL_MONTHS');
  const [monthlySelectedMonth, setMonthlySelectedMonth] = useState<number>(3); // 1-12, defaults to March 2026
  const [termlyStatusFilter, setTermlyStatusFilter] = useState<'ALL' | 'CLEARED' | 'CONDITIONAL' | 'BARRED'>('ALL');
  const [selectedLearnerForForm12A, setSelectedLearnerForForm12A] = useState<StudentRosterItem | null>(null);

  const [matrixClass, setMatrixClass] = useState('Grade 1 Gold');
  const [matrixSearch, setMatrixSearch] = useState('');
  const [matrixStatusFilter, setMatrixStatusFilter] = useState<'ALL' | 'ABSENT_TODAY' | 'LATE_TODAY' | 'CHRONIC' | 'BOARDERS' | 'DAY_SCHOLARS'>('ALL');
  const [selectedLearnerForCard, setSelectedLearnerForCard] = useState<StudentRosterItem | null>(null);

  // Statutory Audit & Inspection Trail State
  const [auditLogs, setAuditLogs] = useState<AttendanceAuditEntry[]>(INITIAL_AUDIT_LOGS);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditFilter, setAuditFilter] = useState<string>('ALL');
  const [auditSearch, setAuditSearch] = useState<string>('');

  // Direct Mobile Money Clearance State
  const [mobileMoneyModalStudent, setMobileMoneyModalStudent] = useState<StudentRosterItem | null>(null);
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<'MTN' | 'AIRTEL' | 'ZAMTEL'>('MTN');
  const [mobileMoneyPayerName, setMobileMoneyPayerName] = useState('');
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState('');
  const [mobileMoneyAmount, setMobileMoneyAmount] = useState<number>(0);
  const [mobileMoneyProcessing, setMobileMoneyProcessing] = useState(false);

  const openMobileMoneyModal = (learner: StudentRosterItem) => {
    setMobileMoneyModalStudent(learner);
    setMobileMoneyPayerName(learner.guardianName);
    setMobileMoneyPhone(learner.guardianPhone);
    setMobileMoneyAmount(learner.balanceDue);
    setMobileMoneyProvider('MTN');
  };

  const handleProcessMobileMoneyPayment = () => {
    if (!mobileMoneyModalStudent) return;
    setMobileMoneyProcessing(true);
    setTimeout(() => {
      const studentId = mobileMoneyModalStudent.id;
      const amountPaid = mobileMoneyAmount;
      const refCode = `ZM-MM-202603-${Math.floor(100000 + Math.random() * 900000)}`;

      setRoster((prev) =>
        prev.map((s) => {
          if (s.id !== studentId) return s;
          const newBal = Math.max(0, s.balanceDue - amountPaid);
          const isCleared = newBal === 0;
          return {
            ...s,
            balanceDue: newBal,
            totalPaid: s.totalPaid + amountPaid,
            financialStatus: isCleared ? 'CLEARED' : s.financialStatus,
            busAccessStatus: isCleared ? 'ACTIVE' : s.busAccessStatus,
            campusAccessStatus: isCleared ? 'ACTIVE' : s.campusAccessStatus,
            status: isCleared ? 'PRESENT' : s.status,
            accessLockReason: isCleared ? undefined : s.accessLockReason,
            lastPaymentDate: '2026-03-06',
            lastPaymentRef: refCode,
          };
        })
      );

      // Add to Statutory Financial & Attendance Audit Log
      const auditEntry: AttendanceAuditEntry = {
        id: `AUD-${Date.now()}`,
        timestamp: '2026-03-06 07:44:18 CAT',
        eventType: 'MOBILE_MONEY_PAYMENT',
        learnerName: mobileMoneyModalStudent.learnerName,
        studentNumber: mobileMoneyModalStudent.studentNumber,
        className: mobileMoneyModalStudent.className,
        campusName: mobileMoneyModalStudent.campusName,
        details: `Direct ${mobileMoneyProvider} Mobile Money payment of K ${amountPaid.toLocaleString()} processed. Arrears cleared to K ${Math.max(0, mobileMoneyModalStudent.balanceDue - amountPaid).toLocaleString()}. Automated clearance unlocked attendance register roll-call, morning shuttle bus boarding, and biometric turnstile campus gate access.`,
        officer: 'Bursar Mobile Gateway (Direct Settlement)',
        status: 'VERIFIED',
        channel: mobileMoneyProvider,
        amount: amountPaid,
        reference: refCode,
      };

      setAuditLogs((prev) => [auditEntry, ...prev]);

      // Enqueue offline mutation if disconnected
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        enqueueOfflineMutation('MOBILE_MONEY_PAYMENT', 'FINANCE', {
          studentId,
          amountPaid,
          channel: mobileMoneyProvider,
          reference: refCode,
          learnerName: mobileMoneyModalStudent.learnerName,
        });
      }

      setMobileMoneyProcessing(false);
      setMobileMoneyModalStudent(null);
      showToast(`✅ Payment of K ${amountPaid.toLocaleString()} confirmed via ${mobileMoneyProvider}! ${mobileMoneyModalStudent.learnerName} unlocked: Bus & Campus Access Restored.`);
    }, 600);
  };

  // Synchronize active roster with persistent offline cache
  useEffect(() => {
    if (typeof window !== 'undefined' && roster.length > 0) {
      cacheOfflineRecord('rosters', `class_${selectedClass}_campus_${selectedCampus}`, roster);
    }
  }, [roster, selectedClass, selectedCampus]);

  // Restore roster from offline cache if loaded without internet
  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      getOfflineRecord<StudentRosterItem[]>('rosters', `class_${selectedClass}_campus_${selectedCampus}`).then((cached) => {
        if (cached && cached.length > 0) {
          setRoster(cached);
          showToast('Loaded attendance roster from offline cache 📱');
        }
      });
    }
  }, [selectedClass, selectedCampus]);

  // Synchronize default classroom cohort when user switches campus in the header
  useEffect(() => {
    if (selectedCampus === 'URBAN') {
      if (matrixClass.startsWith('Form')) {
        setMatrixClass('Grade 1 Gold');
      }
      if (selectedClass.startsWith('Form')) {
        setSelectedClass('Grade 1 Gold');
      }
    } else if (selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') {
      if (matrixClass.startsWith('Grade') || matrixClass.includes('Class') || matrixClass.includes('Stars')) {
        setMatrixClass('Form 4 Green');
      }
      if (selectedClass.startsWith('Grade') || selectedClass.includes('Class') || selectedClass.includes('Stars')) {
        setSelectedClass('Form 4 Green');
      }
    }
  }, [selectedCampus]);

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

  // Filter roster by selected campus or specific class
  const filteredRoster = roster.filter((r) => {
    if (selectedClass !== 'ALL') {
      const matches =
        r.className === selectedClass ||
        r.className.toLowerCase().includes(selectedClass.toLowerCase()) ||
        selectedClass.toLowerCase().includes(r.className.toLowerCase());
      if (!matches) return false;
    } else {
      if ((selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') && !r.campusName.includes('Mushitala') && !r.campusName.includes('Kansanshi')) return false;
      if (selectedCampus === 'URBAN' && !r.campusName.includes('Urban')) return false;
    }
    return true;
  });

  const updateStudentStatus = (id: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    const target = roster.find((s) => s.id === id);
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );

    // If offline, queue mutation locally
    if (typeof navigator !== 'undefined' && !navigator.onLine && target) {
      enqueueOfflineMutation('UPDATE_ATTENDANCE', 'ATTENDANCE', {
        studentId: id,
        status,
        date: selectedDate,
        learnerName: target.learnerName,
      });
      showToast(`Saved locally: ${target.learnerName} marked ${status} 💾`);
    }
  };

  const markAllPresent = () => {
    let updatedCount = 0;
    setRoster((prev) =>
      prev.map((s) => {
        if ((selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') && !s.campusName.includes('Mushitala') && !s.campusName.includes('Kansanshi')) return s;
        if (selectedCampus === 'URBAN' && !s.campusName.includes('Urban')) return s;
        if (selectedClass !== 'ALL' && s.className !== selectedClass) return s;
        updatedCount++;
        return { ...s, status: 'PRESENT' };
      })
    );

    if (typeof navigator !== 'undefined' && !navigator.onLine && updatedCount > 0) {
      enqueueOfflineMutation('UPDATE_ATTENDANCE', 'ATTENDANCE', {
        action: 'MARK_ALL_PRESENT',
        date: selectedDate,
        cohort: selectedClass,
        campus: selectedCampus,
      });
    }
    showToast(`All learners in active view (${selectedClass === 'ALL' ? 'All Cohorts' : selectedClass}) marked PRESENT.`);
  };

  // Multi-Horizon Matrix: Filtered Learners for the active classroom
  const matrixLearners = roster.filter((r) => {
    // If a specific classroom is selected, prioritize showing that classroom's learners!
    // (Never let a conflicting global campus filter hide the selected classroom's learners)
    if (matrixClass !== 'ALL') {
      const matchesClass =
        r.className === matrixClass ||
        r.className.toLowerCase().includes(matrixClass.toLowerCase()) ||
        matrixClass.toLowerCase().includes(r.className.toLowerCase());
      if (!matchesClass) return false;
    } else {
      // If ALL cohorts is selected, then respect campus scope
      if ((selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') && !r.campusName.includes('Mushitala') && !r.campusName.includes('Kansanshi')) return false;
      if (selectedCampus === 'URBAN' && !r.campusName.includes('Urban')) return false;
    }

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
  const currentClassroomLearners = roster.filter((r) => {
    if (matrixClass === 'ALL') {
      if ((selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') && !r.campusName.includes('Mushitala') && !r.campusName.includes('Kansanshi')) return false;
      if (selectedCampus === 'URBAN' && !r.campusName.includes('Urban')) return false;
      return true;
    }
    return (
      r.className === matrixClass ||
      r.className.toLowerCase().includes(matrixClass.toLowerCase()) ||
      matrixClass.toLowerCase().includes(r.className.toLowerCase())
    );
  });
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
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let fileSuffix = 'Consolidated_Matrix';

    if (matrixHorizonView === 'MONTHLY') {
      if (monthlyViewMode === 'ALL_MONTHS') {
        fileSuffix = '12_Month_Academic_Year';
        headers = [
          'Student ID',
          'Student Name',
          'Class Cohort',
          'Campus',
          'Format',
          'Jan (15d)',
          'Feb (20d)',
          'Mar (22d)',
          'Apr (6d)',
          'May (15d)',
          'Jun (21d)',
          'Jul (22d)',
          'Aug (4d)',
          'Sep (18d)',
          'Oct (21d)',
          'Nov (20d)',
          'Dec (3d)',
          'YTD Rate (%)',
          'YTD Days Present',
          'Annual Standing',
        ];
        rows = matrixLearners.map((learner) => {
          const h = getLearnerAttendanceHorizons(learner);
          return [
            `"${learner.studentNumber}"`,
            `"${learner.learnerName}"`,
            `"${learner.className}"`,
            `"${learner.campusName}"`,
            `"${learner.studentType}"`,
            ...h.monthly.allMonths.map((m) => `${m.rate}% (${m.daysPresent}/${m.teachingDays}d)`),
            `${h.termly.annual.annualRate}%`,
            `${h.termly.annual.totalAttended}/${h.termly.annual.totalTeachingDays}`,
            h.termly.annual.standing,
          ];
        });
      } else {
        const mInfo = MONTH_CONFIGS.find((m) => m.index === monthlySelectedMonth) || MONTH_CONFIGS[2];
        fileSuffix = `${mInfo.name}_Daily_Register`;
        const dayHeaders = Array.from({ length: mInfo.days }, (_, i) => `Day ${i + 1}`);
        headers = [
          'Student ID',
          'Student Name',
          'Class Cohort',
          'Campus',
          'Format',
          ...dayHeaders,
          'Present Days',
          'Absent Days',
          'Late Days',
          'Excused Days',
          `${mInfo.name} Rate (%)`,
        ];
        rows = matrixLearners.map((learner) => {
          const dayRecords = getMonthDaysForLearner(learner, monthlySelectedMonth);
          const pCount = dayRecords.filter((d) => d.status === 'PRESENT').length;
          const aCount = dayRecords.filter((d) => d.status === 'ABSENT').length;
          const lCount = dayRecords.filter((d) => d.status === 'LATE').length;
          const eCount = dayRecords.filter((d) => d.status === 'EXCUSED').length;
          const rate = mInfo.teachingDays > 0 ? Math.round(((pCount + lCount) / mInfo.teachingDays) * 1000) / 10 : 100;
          return [
            `"${learner.studentNumber}"`,
            `"${learner.learnerName}"`,
            `"${learner.className}"`,
            `"${learner.campusName}"`,
            `"${learner.studentType}"`,
            ...dayRecords.map((d) => d.status),
            pCount,
            aCount,
            lCount,
            eCount,
            `${rate}%`,
          ];
        });
      }
    } else if (matrixHorizonView === 'TERMLY') {
      fileSuffix = 'Termly_Statutory_ECZ';
      headers = [
        'Student ID',
        'Student Name',
        'Class Cohort',
        'Campus',
        'Format',
        'Term 1 Days (63d)',
        'Term 1 Rate (%)',
        'Term 1 Standing',
        'Term 2 Days (62d)',
        'Term 2 Rate (%)',
        'Term 2 Standing',
        'Term 3 Days (62d)',
        'Term 3 Rate (%)',
        'Term 3 Standing',
        'Annual Total (187d)',
        'Annual Rate (%)',
        'ECZ Clearance Status',
        'Official Note',
      ];
      rows = matrixLearners.map((learner) => {
        const h = getLearnerAttendanceHorizons(learner);
        return [
          `"${learner.studentNumber}"`,
          `"${learner.learnerName}"`,
          `"${learner.className}"`,
          `"${learner.campusName}"`,
          `"${learner.studentType}"`,
          `${h.termly.terms[0].sessionsAttended}/63`,
          `${h.termly.terms[0].rate}%`,
          h.termly.terms[0].standing,
          `${h.termly.terms[1].sessionsAttended}/62`,
          `${h.termly.terms[1].rate}%`,
          h.termly.terms[1].standing,
          `${h.termly.terms[2].sessionsAttended}/62`,
          `${h.termly.terms[2].rate}%`,
          h.termly.terms[2].standing,
          `${h.termly.annual.totalAttended}/187`,
          `${h.termly.annual.annualRate}%`,
          h.termly.annual.eczExamClearance,
          `"${h.termly.annual.eczClearanceNote}"`,
        ];
      });
    } else if (matrixHorizonView === 'DAILY') {
      fileSuffix = 'Daily_RollCall';
      headers = [
        'Student ID',
        'Student Name',
        'Class Cohort',
        'Campus',
        'Format',
        'Today Status',
        'Arrival Time',
        'Minutes Late',
        'Roll-Call Method',
        'Guardian Name',
        'Guardian Phone',
      ];
      rows = matrixLearners.map((learner) => {
        const h = getLearnerAttendanceHorizons(learner);
        return [
          `"${learner.studentNumber}"`,
          `"${learner.learnerName}"`,
          `"${learner.className}"`,
          `"${learner.campusName}"`,
          `"${learner.studentType}"`,
          learner.status,
          h.daily.today.time,
          h.daily.arrivalMinutesLate,
          `"${h.daily.rollCallMethod}"`,
          `"${learner.guardianName}"`,
          `"${learner.guardianPhone}"`,
        ];
      });
    } else if (matrixHorizonView === 'WEEKLY') {
      fileSuffix = 'Weekly_Term1_Register';
      headers = [
        'Student ID',
        'Student Name',
        'Class Cohort',
        'Campus',
        'Format',
        ...Array.from({ length: 13 }, (_, i) => `Wk ${i + 1} (%)`),
        'Current Week (Wk 8)',
        'Weekly Trend',
      ];
      rows = matrixLearners.map((learner) => {
        const h = getLearnerAttendanceHorizons(learner);
        return [
          `"${learner.studentNumber}"`,
          `"${learner.learnerName}"`,
          `"${learner.className}"`,
          `"${learner.campusName}"`,
          `"${learner.studentType}"`,
          ...h.weekly.termWeeks.map((w) => `${w.rate}%`),
          `${h.weekly.currentWeekRate}% (${h.weekly.currentWeekDaysPresent}/5d)`,
          h.weekly.currentWeekRate >= 95 ? 'CONSISTENT' : 'VARIABLE',
        ];
      });
    } else {
      headers = [
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
      rows = matrixLearners.map((learner) => {
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
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${fileSuffix}_${matrixClass.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Attendance registry (${fileSuffix}) for ${matrixClass} exported successfully.`);
  };

  const exportAuditTrailCsv = () => {
    const headers = [
      'Audit ID',
      'Timestamp (CAT)',
      'Event Type',
      'Learner Name',
      'Student #',
      'Cohort',
      'Campus',
      'Details',
      'Officer',
      'Status',
      'Channel',
      'Amount (ZMW)',
      'Reference',
    ];
    const rows = auditLogs.map((log) => [
      log.id,
      `"${log.timestamp}"`,
      log.eventType,
      `"${log.learnerName}"`,
      log.studentNumber,
      `"${log.className}"`,
      `"${log.campusName}"`,
      `"${log.details.replace(/"/g, '""')}"`,
      `"${log.officer}"`,
      log.status,
      log.channel || 'N/A',
      log.amount ? log.amount.toString() : '0',
      log.reference || 'N/A',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `DEBS_Statutory_Attendance_Financial_Audit_2026_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Official MoE & DEBS Statutory Audit Log exported to CSV! 📑');
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
        }[r.status] || 'bg-slate-50 text-slate-700 border-slate-200';
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-black border ${styles}`}>
            {r.status} {r.arrivalMinutesLate ? `(+${r.arrivalMinutesLate}m)` : ''}
          </span>
        );
      },
    },
    {
      key: 'accessClearance',
      header: 'Bus & Campus Gate Clearance',
      sortable: true,
      render: (r) => {
        return (
          <div className="space-y-1 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
                <span>🚌</span>
                <span>Transit Active</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border bg-teal-50 text-teal-800 border-teal-200">
                <span>🏫</span>
                <span>Gate Cleared</span>
              </span>
            </div>
          </div>
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
      header: 'Roll-Call & Attendance Actions',
      render: (r) => {
        return (
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
        );
      },
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
    <ModuleGate
      moduleKey="attendance"
      moduleName="Operations & Attendance Registry"
      moduleDescription="Real-time classroom morning roll-calls, boarding night curfews, multi-horizon attendance matrices, and weekend exeat gate passes for Solwezi."
      planRequired="STARTER"
      pricePerTermZMW={1450}
    >
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
          onClick={() => {
            setActiveTab('MATRIX');
            setMatrixHorizonView('ALL');
          }}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'MATRIX' && matrixHorizonView === 'ALL'
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
          onClick={() => {
            setActiveTab('MATRIX');
            setMatrixHorizonView('MONTHLY');
          }}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'MATRIX' && matrixHorizonView === 'MONTHLY'
              ? 'border-teal-700 text-teal-800 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-teal-600" />
          <span>Monthly View</span>
          <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded text-[10px] font-bold">
            12-Month & 31d
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('MATRIX');
            setMatrixHorizonView('TERMLY');
          }}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'MATRIX' && matrixHorizonView === 'TERMLY'
              ? 'border-amber-600 text-amber-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Termly View</span>
          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
            Terms 1-3 & ECZ
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
                    <option value="Baby Class (Little Stars)">Baby Class (Little Stars)</option>
                    <option value="Middle Class">Middle Class</option>
                    <option value="Reception Stars">Reception Stars</option>
                    <option value="Grade 1 Gold">Grade 1 Gold</option>
                    <option value="Grade 2 Emerald">Grade 2 Emerald</option>
                    <option value="Grade 3 Diamond">Grade 3 Diamond</option>
                    <option value="Grade 4 Ruby">Grade 4 Ruby</option>
                    <option value="Grade 5 Blue">Grade 5 Blue</option>
                    <option value="Grade 6 Silver">Grade 6 Silver</option>
                    <option value="Grade 7 Top (Candidates)">Grade 7 Top (Candidates)</option>
                  </optgroup>
                  <optgroup label="Mushitala Campus (Secondary & Boarding - Near Kansanshi)">
                    <option value="Form 1 Alpha">Form 1 Alpha</option>
                    <option value="Form 1 Beta">Form 1 Beta</option>
                    <option value="Form 2 Gold (ECZ Candidates)">Form 2 Gold (ECZ Candidates)</option>
                    <option value="Form 2 Green">Form 2 Green</option>
                    <option value="Form 3 Blue">Form 3 Blue</option>
                    <option value="Form 3 Red">Form 3 Red</option>
                    <option value="Form 4 Green">Form 4 Green</option>
                    <option value="Form 4 Gold">Form 4 Gold</option>
                    <option value="Form 5 Sciences (Senior Candidates)">Form 5 Sciences (Senior Candidates)</option>
                    <option value="Form 5 Arts & Commerce">Form 5 Arts & Commerce</option>
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

          {/* Horizon Switcher Navigation Pill Bar */}
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMatrixHorizonView('ALL')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  matrixHorizonView === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>All Horizons (Matrix)</span>
              </button>

              <button
                type="button"
                onClick={() => setMatrixHorizonView('DAILY')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  matrixHorizonView === 'DAILY'
                    ? 'bg-white text-sky-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>Daily View (Roll-Call)</span>
              </button>

              <button
                type="button"
                onClick={() => setMatrixHorizonView('WEEKLY')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  matrixHorizonView === 'WEEKLY'
                    ? 'bg-white text-indigo-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Weekly View (Weeks 1–13)</span>
              </button>

              <button
                type="button"
                onClick={() => setMatrixHorizonView('MONTHLY')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  matrixHorizonView === 'MONTHLY'
                    ? 'bg-white text-teal-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
                <span>Monthly View (Jan–Dec & 31d)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-teal-100 text-teal-800 font-black">
                  Full View
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMatrixHorizonView('TERMLY')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  matrixHorizonView === 'TERMLY'
                    ? 'bg-white text-amber-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Termly View (Terms 1–3 & ECZ)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-100 text-amber-800 font-black">
                  Statutory
                </span>
              </button>
            </div>

            {/* Active Perspective Badge */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] text-slate-500 font-medium">Perspective:</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                {matrixHorizonView === 'ALL' && 'Consolidated Multi-Horizon Matrix'}
                {matrixHorizonView === 'DAILY' && 'Morning Roll-Call & Punctuality'}
                {matrixHorizonView === 'WEEKLY' && 'Term 3 Instructional Weeks (W1-W13)'}
                {matrixHorizonView === 'MONTHLY' && '12-Month Academic Register & 31-Day Sheet'}
                {matrixHorizonView === 'TERMLY' && 'Ministry of Education Terms 1-3 & ECZ Clearance'}
              </span>
            </div>
          </div>

          {/* Controls Bar: Classroom, Sub-views, Status Filter, Search, and Export */}
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
                    <option value="Baby Class (Little Stars)">Baby Class (Little Stars)</option>
                    <option value="Middle Class">Middle Class</option>
                    <option value="Reception Stars">Reception Stars</option>
                    <option value="Grade 1 Gold">Grade 1 Gold</option>
                    <option value="Grade 2 Emerald">Grade 2 Emerald</option>
                    <option value="Grade 3 Diamond">Grade 3 Diamond</option>
                    <option value="Grade 4 Ruby">Grade 4 Ruby</option>
                    <option value="Grade 5 Blue">Grade 5 Blue</option>
                    <option value="Grade 6 Silver">Grade 6 Silver</option>
                    <option value="Grade 7 Top (Candidates)">Grade 7 Top (Candidates)</option>
                  </optgroup>
                  <optgroup label="Mushitala Campus (Secondary & Boarding - Near Kansanshi)">
                    <option value="Form 1 Alpha">Form 1 Alpha</option>
                    <option value="Form 1 Beta">Form 1 Beta</option>
                    <option value="Form 2 Gold (ECZ Candidates)">Form 2 Gold (ECZ Candidates)</option>
                    <option value="Form 2 Green">Form 2 Green</option>
                    <option value="Form 3 Blue">Form 3 Blue</option>
                    <option value="Form 3 Red">Form 3 Red</option>
                    <option value="Form 4 Green">Form 4 Green</option>
                    <option value="Form 4 Gold">Form 4 Gold</option>
                    <option value="Form 5 Sciences (Senior Candidates)">Form 5 Sciences (Senior Candidates)</option>
                    <option value="Form 5 Arts & Commerce">Form 5 Arts & Commerce</option>
                  </optgroup>
                </select>
              </div>

              {/* Sub-mode Controls for Monthly View */}
              {matrixHorizonView === 'MONTHLY' && (
                <>
                  <div>
                    <label className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Monthly Sub-Mode</label>
                    <div className="flex items-center gap-1 p-0.5 bg-white border border-slate-300 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setMonthlyViewMode('ALL_MONTHS')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                          monthlyViewMode === 'ALL_MONTHS'
                            ? 'bg-teal-700 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        12-Month Year (Jan–Dec)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMonthlyViewMode('DAILY_SHEET')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                          monthlyViewMode === 'DAILY_SHEET'
                            ? 'bg-teal-700 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        31-Day Active Sheet
                      </button>
                    </div>
                  </div>

                  {monthlyViewMode === 'DAILY_SHEET' && (
                    <div>
                      <label className="text-slate-500 block text-[10px] uppercase font-bold mb-1">
                        Select Month (Strict Validation)
                      </label>
                      <select
                        value={monthlySelectedMonth}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (val > CURRENT_MONTH_INDEX) {
                            showToast(`🔒 Action Blocked: Future months cannot be selected for active roll-call. Advance pre-recording is barred under MoE guidelines.`);
                            return;
                          }
                          setMonthlySelectedMonth(val);
                        }}
                        className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-600"
                      >
                        {MONTH_CONFIGS.map((m) => (
                          <option
                            key={m.index}
                            value={m.index}
                            disabled={m.index > CURRENT_MONTH_INDEX}
                            className={m.index > CURRENT_MONTH_INDEX ? 'text-slate-400 bg-slate-50' : 'text-slate-900 font-bold'}
                          >
                            {m.index > CURRENT_MONTH_INDEX
                              ? `🔒 ${m.name} 2026 (Future Month • Locked for Roll-Call)`
                              : m.index === CURRENT_MONTH_INDEX
                              ? `🟢 ${m.name} 2026 (Active Month • ${ELAPSED_TEACHING_DAYS_MARCH} Elapsed Days)`
                              : `📁 ${m.name} 2026 (${m.teachingDays} School Days • Archived Statutory Audit)`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* ECZ Filter for Termly View */}
              {matrixHorizonView === 'TERMLY' && (
                <div>
                  <label className="text-slate-500 block text-[10px] uppercase font-bold mb-1">ECZ Clearance Filter</label>
                  <select
                    value={termlyStatusFilter}
                    onChange={(e: any) => setTermlyStatusFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-amber-600"
                  >
                    <option value="ALL">All Enrolled Learners</option>
                    <option value="CLEARED">ECZ Exam Cleared (≥90%)</option>
                    <option value="CONDITIONAL">Conditional DEBS Waiver (80-89%)</option>
                    <option value="BARRED">At Risk / Barred (&lt;80%)</option>
                  </select>
                </div>
              )}

              {/* General Status Filter */}
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

            {/* Quick Actions & Live Export */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAuditModal(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                title="View Ministry of Education (MoE) & Solwezi DEBS Statutory Compliance & Inspection Audit Trail"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>MoE / DEBS Audit Log</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500 text-slate-950 font-black">
                  {auditLogs.length}
                </span>
              </button>
              <button
                type="button"
                onClick={exportClassroomMatrixCsv}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>
                  Export {matrixHorizonView === 'MONTHLY' ? 'Monthly CSV' : matrixHorizonView === 'TERMLY' ? 'Termly CSV' : 'CSV'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMatrixSearch('');
                  setMatrixStatusFilter('ALL');
                  setTermlyStatusFilter('ALL');
                }}
                className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 font-bold text-xs transition"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Dynamic Horizon KPI Strip */}
          {(() => {
            const displayLearners = matrixLearners.filter((l) => {
              if (matrixHorizonView === 'TERMLY' && termlyStatusFilter !== 'ALL') {
                const h = getLearnerAttendanceHorizons(l);
                if (h.termly.annual.eczExamClearance !== termlyStatusFilter) return false;
              }
              return true;
            });

            if (matrixHorizonView === 'MONTHLY') {
              const selectedM = MONTH_CONFIGS.find((m) => m.index === monthlySelectedMonth) || MONTH_CONFIGS[2];
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>{selectedM.name} 2026 Rate</span>
                      <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">{classMonthlyAvg}%</span>
                      <span className="text-[10px] font-bold text-teal-600">{selectedM.teachingDays} School Days</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">
                      Solwezi district curriculum calendar adherence
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>12-Month Progression</span>
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">12 Months</span>
                      <span className="text-[10px] font-bold text-emerald-600">Jan – Dec 2026</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">
                      Full academic year longitudinal record
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>MoE Target Adherence</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">98.4%</span>
                      <span className="text-[10px] font-bold text-emerald-600">Target ≥95%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">
                      Cohorts exceeding national statutory minimum
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>Active Class Cohort</span>
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">{displayLearners.length}</span>
                      <span className="text-[10px] font-bold text-blue-600">Learners</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">
                      {matrixClass === 'ALL' ? 'Consolidated School Roster' : matrixClass}
                    </span>
                  </div>
                </div>
              );
            }

            if (matrixHorizonView === 'TERMLY') {
              const clearedCount = displayLearners.filter(
                (l) => getLearnerAttendanceHorizons(l).termly.annual.eczExamClearance === 'CLEARED'
              ).length;
              const clearedPct = displayLearners.length > 0 ? Math.round((clearedCount / displayLearners.length) * 100) : 100;
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>Term 1 (Autumn)</span>
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">{classTermlyAvg}%</span>
                      <span className="text-[10px] font-bold text-emerald-600">63 Days</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">
                      Official 13 teaching weeks instruction total
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>Term 2 (Winter)</span>
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">98.8%</span>
                      <span className="text-[10px] font-bold text-indigo-600">62 Days</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">
                      Mid-year term including Solwezi inter-house sports
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>Term 3 (ECZ Exams)</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">98.5%</span>
                      <span className="text-[10px] font-bold text-purple-600">62 Days</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">
                      Promotional & ECZ national exam window
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>ECZ Clearance Rate</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">{clearedPct}%</span>
                      <span className="text-[10px] font-bold text-emerald-600">({clearedCount}/{displayLearners.length} Cleared)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">
                      Examination Council of Zambia 80% statutory rule
                    </span>
                  </div>
                </div>
              );
            }

            if (matrixHorizonView === 'DAILY') {
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>Present Today</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">{classPresentToday}</span>
                      <span className="text-[10px] font-bold text-emerald-600">({classDailyPct}%)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">Checked-in on morning roll-call</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>Absent Today</span>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-xl font-black ${classAbsentToday > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {classAbsentToday}
                      </span>
                      <span className="text-[10px] font-bold text-rose-600">Unexcused</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">Automated SMS notifications queued</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>Late Arrivals</span>
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">{classLateToday}</span>
                      <span className="text-[10px] font-bold text-amber-600">After 07:45 AM</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">Security gate entry pass recorded</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>Class Size</span>
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">{classTotal}</span>
                      <span className="text-[10px] font-bold text-blue-600">Enrolled</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">{matrixClass}</span>
                  </div>
                </div>
              );
            }

            if (matrixHorizonView === 'WEEKLY') {
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>Week 8 (Current)</span>
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">{classWeeklyAvg}%</span>
                      <span className="text-[10px] font-bold text-indigo-600">5-Day Rate</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">Instruction week ending 06 March</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>Week 7</span>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">97.8%</span>
                      <span className="text-[10px] font-bold text-emerald-600">5-Day Rate</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">Preceding week instruction return</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>Week 6</span>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">98.2%</span>
                      <span className="text-[10px] font-bold text-emerald-600">5-Day Rate</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">Mid-term revision week</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <span>Weeks 1–13 Framework</span>
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-slate-900">13 Weeks</span>
                      <span className="text-[10px] font-bold text-amber-600">MoE Zambia</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-0.5">63 teaching days tri-term standard</span>
                  </div>
                </div>
              );
            }

            // Default: ALL Horizons
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
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

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <span>Termly (Term 3)</span>
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
            );
          })()}

          {/* TABLE CONTAINER: Renders perspective-specific enterprise table with sticky headers & sticky left column */}
          {(() => {
            const displayLearners = matrixLearners.filter((l) => {
              if (matrixHorizonView === 'TERMLY' && termlyStatusFilter !== 'ALL') {
                const h = getLearnerAttendanceHorizons(l);
                if (h.termly.annual.eczExamClearance !== termlyStatusFilter) return false;
              }
              return true;
            });

            // 1. MONTHLY VIEW: 12-Month Academic Year Matrix (Jan–Dec)
            if (matrixHorizonView === 'MONTHLY' && monthlyViewMode === 'ALL_MONTHS') {
              return (
                <div className="relative max-h-[580px] overflow-auto border border-slate-200 rounded-2xl shadow-xs bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                      <tr>
                        <th
                          rowSpan={2}
                          className="sticky top-0 left-0 z-30 bg-slate-900 px-3.5 py-2.5 border-r border-slate-800 min-w-[210px] max-w-[230px] shadow-[2px_0_5px_rgba(0,0,0,0.18)]"
                        >
                          <div className="flex items-center justify-between">
                            <span>Learner Identity</span>
                            <span className="text-[10px] font-mono text-slate-400">({displayLearners.length})</span>
                          </div>
                        </th>
                        <th colSpan={4} className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-800 text-sky-200 uppercase tracking-wider text-[10px]">
                          Term 1 (63 Days)
                        </th>
                        <th colSpan={4} className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-850 text-indigo-200 uppercase tracking-wider text-[10px]">
                          Term 2 (62 Days)
                        </th>
                        <th colSpan={4} className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-800 text-purple-200 uppercase tracking-wider text-[10px]">
                          Term 3 (62 Days)
                        </th>
                        <th colSpan={3} className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-850 text-amber-200 uppercase tracking-wider text-[10px]">
                          Annual Academic Year Cumulative (187 Days)
                        </th>
                        <th rowSpan={2} className="sticky top-0 right-0 z-20 bg-slate-900 px-2 py-2 text-center min-w-[80px] border-l border-slate-800 shadow-[-2px_0_5px_rgba(0,0,0,0.15)]">
                          Card
                        </th>
                      </tr>
                      <tr className="bg-slate-800 text-[10px] uppercase font-bold text-slate-300">
                        {/* Term 1 Months */}
                        <th className="px-1 py-1 text-center min-w-[50px] border-r border-slate-700/60" title="January (15 School Days - Archived)">Jan</th>
                        <th className="px-1 py-1 text-center min-w-[50px] border-r border-slate-700/60" title="February (20 School Days - Archived)">Feb</th>
                        <th className="px-1 py-1 text-center min-w-[50px] border-r border-slate-700/60" title="March (22 School Days - Archived)">Mar</th>
                        <th className="px-1 py-1 text-center min-w-[50px] border-r border-slate-700" title="April (6 School Days - Archived)">Apr</th>
                        {/* Term 2 Months */}
                        <th className="px-1 py-1 text-center min-w-[50px] border-r border-slate-700/60" title="May (15 School Days - Archived)">May</th>
                        <th className="px-1 py-1 text-center min-w-[50px] border-r border-slate-700/60" title="June (21 School Days - Archived)">Jun</th>
                        <th className="px-1 py-1 text-center min-w-[50px] border-r border-slate-700/60" title="July (22 School Days - Archived)">Jul</th>
                        <th className="px-1 py-1 text-center min-w-[50px] border-r border-slate-700" title="August (4 School Days - Archived)">Aug</th>
                        {/* Term 3 Months */}
                        <th className="px-1 py-1 text-center min-w-[50px] border-r border-slate-700/60" title="September (18 School Days - Archived)">Sep</th>
                        <th className="px-1 py-1 text-center min-w-[50px] border-r border-slate-700/60 bg-teal-900/40 text-teal-200" title="October (Active Month-to-Date • Term 3 Week 8)">Oct</th>
                        <th className="px-1 py-1 text-center min-w-[50px] border-r border-slate-700/60 text-slate-400" title="November (Term 3 ECZ Exams • Locked)">🔒 Nov</th>
                        <th className="px-1 py-1 text-center min-w-[50px] border-r border-slate-700 text-slate-400" title="December (Term 3 Close 04 Dec • Locked)">🔒 Dec</th>
                        {/* Annual Cumulative */}
                        <th className="px-2 py-1 text-center min-w-[70px]" title="Year-to-Date Attended Days (40 Elapsed Days)">Attended</th>
                        <th className="px-2 py-1 text-center min-w-[65px]" title="Annual YTD Attendance Rate %">YTD %</th>
                        <th className="px-2 py-1 text-center border-r border-slate-700 min-w-[75px]" title="MoE Annual Standing">Standing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                      {displayLearners.length > 0 ? (
                        displayLearners.map((learner) => {
                          const h = getLearnerAttendanceHorizons(learner);
                          const isFeeLocked = learner.balanceDue > 0 && (learner.financialStatus === 'ARREARS' || learner.financialStatus === 'CHRONIC_ARREARS');
                          return (
                            <tr key={learner.id} className="hover:bg-teal-50/40 transition group">
                              {/* Pinned Left Column */}
                              <td className="sticky left-0 z-10 bg-white group-hover:bg-teal-50/90 px-3.5 py-2 border-r border-slate-200 min-w-[210px] max-w-[230px] shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${
                                      isFeeLocked
                                        ? 'bg-rose-100 text-rose-700 border-rose-300'
                                        : learner.studentType === 'BOARDER'
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
                                    {isFeeLocked && (
                                      <div className="mt-1">
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-[9px] font-black">
                                          <Lock className="w-2.5 h-2.5" />
                                          <span>Fees Due: K{learner.balanceDue.toLocaleString()}</span>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* 12 Months Columns */}
                              {h.monthly.allMonths.map((m) => {
                                if (m.isFuture) {
                                  return (
                                    <td key={m.monthIndex} className="px-1.5 py-1.5 text-center border-r border-slate-100 bg-slate-50/40">
                                      <span className="text-[10px] text-slate-400 font-mono block" title={`${m.monthName} 2026: Future Curriculum Period (Term ${m.termNumber}) • Advance roll-call prohibited by statutory guidelines`}>
                                        🔒 —
                                      </span>
                                    </td>
                                  );
                                }
                                return (
                                  <td
                                    key={m.monthIndex}
                                    className={`px-1.5 py-1.5 text-center border-r border-slate-100 ${
                                      m.monthIndex === 3 ? 'bg-teal-50/30' : ''
                                    }`}
                                  >
                                    <div className="flex flex-col items-center">
                                      <span
                                        className={`font-black ${
                                          m.rate >= 98
                                            ? 'text-emerald-700'
                                            : m.rate >= 95
                                            ? 'text-teal-700'
                                            : m.rate >= 85
                                            ? 'text-amber-700'
                                            : 'text-rose-700'
                                        }`}
                                      >
                                        {m.rate}%
                                      </span>
                                      <span className="text-[9px] font-mono text-slate-400">
                                        {m.daysPresent}/{m.monthIndex === 3 ? ELAPSED_TEACHING_DAYS_MARCH : m.teachingDays}d
                                      </span>
                                    </div>
                                  </td>
                                );
                              })}

                              {/* Annual Cumulative */}
                              <td className="px-2 py-1.5 text-center font-mono text-slate-700">
                                {h.termly.annual.totalAttended}/40d <span className="text-[9px] text-slate-400 block font-normal">(187d Target)</span>
                              </td>
                              <td className="px-2 py-1.5 text-center font-black">
                                <span
                                  className={
                                    h.termly.annual.annualRate >= 98
                                      ? 'text-emerald-700'
                                      : h.termly.annual.annualRate >= 95
                                      ? 'text-blue-700'
                                      : h.termly.annual.annualRate >= 85
                                      ? 'text-amber-700'
                                      : 'text-rose-700'
                                  }
                                >
                                  {h.termly.annual.annualRate}%
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-center border-r border-slate-200">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black ${
                                    h.termly.annual.standing === 'GOLD'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : h.termly.annual.standing === 'SILVER'
                                      ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                      : h.termly.annual.standing === 'BRONZE'
                                      ? 'bg-orange-50 text-orange-800 border border-orange-200'
                                      : 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                                  }`}
                                >
                                  {h.termly.annual.standing}
                                </span>
                              </td>

                              {/* Sticky Right Action */}
                              <td className="sticky right-0 z-10 bg-white group-hover:bg-teal-50/90 px-2 py-1.5 text-center border-l border-slate-200 shadow-[-2px_0_5px_rgba(0,0,0,0.03)]">
                                <div className="flex flex-col gap-1">
                                  {isFeeLocked && (
                                    <button
                                      type="button"
                                      onClick={() => openMobileMoneyModal(learner)}
                                      className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] shadow-xs flex items-center justify-center gap-1 transition animate-pulse"
                                      title="Process Direct Mobile Money Payment & Unlock Access"
                                    >
                                      <Smartphone className="w-2.5 h-2.5 text-emerald-200" />
                                      <span>Pay MoMo</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedLearnerForCard(learner)}
                                    className="px-2 py-0.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[10px] border border-teal-200 flex items-center justify-center gap-1 transition w-full"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Card</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={18} className="py-8 text-center text-slate-500 text-xs">
                            No learners match the selected filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            }

            // 2. MONTHLY VIEW: Detailed 31-Day Active Month Register
            if (matrixHorizonView === 'MONTHLY' && monthlyViewMode === 'DAILY_SHEET') {
              const selectedM = MONTH_CONFIGS.find((m) => m.index === monthlySelectedMonth) || MONTH_CONFIGS[2];
              const sampleDays = getMonthDaysForLearner(displayLearners[0] || matrixLearners[0] || roster[0], monthlySelectedMonth);
              return (
                <div className="space-y-3">
                  {/* Future Month Statutory Guard Banner */}
                  {selectedM.isFuture && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0" />
                        <div className="text-xs">
                          <span className="font-black block text-sm text-amber-900">
                            🔒 Statutory Curriculum Guard: {selectedM.name} 2026 is an Upcoming Future Month
                          </span>
                          <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                            {selectedM.termLabel} has not commenced yet. Under Ministry of Education (MoE) Statutory Guidelines & Teaching Council of Zambia (TCZ) regulations, advance roll-calls cannot be pre-recorded for future dates. Register opens on the official term start date.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMonthlySelectedMonth(3)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shrink-0 transition shadow-xs"
                      >
                        Switch to March 2026 (Active)
                      </button>
                    </div>
                  )}

                  <div className="relative max-h-[580px] overflow-auto border border-slate-200 rounded-2xl shadow-xs bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 z-20 bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                        <tr>
                          <th
                            rowSpan={2}
                            className="sticky top-0 left-0 z-30 bg-slate-900 px-3.5 py-2.5 border-r border-slate-800 min-w-[210px] max-w-[230px] shadow-[2px_0_5px_rgba(0,0,0,0.18)]"
                          >
                            <div className="flex items-center justify-between">
                              <span>Learner Identity</span>
                              <span className="text-[10px] font-mono text-slate-400">({displayLearners.length})</span>
                            </div>
                          </th>
                          <th
                            colSpan={sampleDays.length}
                            className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-850 text-teal-200 uppercase tracking-wider text-[10px]"
                          >
                            {selectedM.name} 2026 Daily Roll-Call Register ({sampleDays.length} Calendar Days • {selectedM.isPast ? `${selectedM.teachingDays} Historical Days` : selectedM.isCurrent ? `${ELAPSED_TEACHING_DAYS_MARCH} Elapsed Days (Target: 22d)` : 'Curriculum Scheduled (0 Days Elapsed)'})
                          </th>
                          <th colSpan={5} className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-800 text-amber-200 uppercase tracking-wider text-[10px]">
                            Month Adherence Summary
                          </th>
                          <th rowSpan={2} className="sticky top-0 right-0 z-20 bg-slate-900 px-2 py-2 text-center min-w-[75px] border-l border-slate-800 shadow-[-2px_0_5px_rgba(0,0,0,0.15)]">
                            Actions
                          </th>
                        </tr>
                        <tr className="bg-slate-800 text-[10px] uppercase font-bold text-slate-300">
                          {sampleDays.map((d) => (
                            <th
                              key={d.dayNumber}
                              className={`px-1 py-1 text-center min-w-[28px] border-r border-slate-700/60 ${
                                d.isWeekend
                                  ? 'bg-slate-850/80 text-slate-500'
                                  : d.isHoliday
                                  ? 'bg-emerald-900/60 text-emerald-300'
                                  : d.isFuture
                                  ? 'text-slate-500'
                                  : d.isToday
                                  ? 'bg-teal-900/50 text-teal-200 font-black'
                                  : 'text-slate-200'
                              }`}
                              title={`Day ${d.dayNumber} (${d.dayOfWeek})${d.isHoliday ? `: ${d.holidayName}` : d.isWeekend ? ': Weekend' : d.isFuture ? ': Upcoming Session' : d.isToday ? ': Today Live Roll-Call' : ''}`}
                            >
                              <span className="block text-[9px] font-mono leading-none">{d.dayNumber}</span>
                              <span className="block text-[8px] opacity-70 mt-0.5">{d.dayOfWeek}</span>
                            </th>
                          ))}
                          <th className="px-1.5 py-1 text-center min-w-[34px] text-emerald-300" title="Present Days">P</th>
                          <th className="px-1.5 py-1 text-center min-w-[34px] text-rose-300" title="Absent Days">A</th>
                          <th className="px-1.5 py-1 text-center min-w-[34px] text-amber-300" title="Late Days">L</th>
                          <th className="px-1.5 py-1 text-center min-w-[34px] text-slate-300" title="Excused Days">E</th>
                          <th className="px-2 py-1 text-center border-r border-slate-700 min-w-[55px]" title="Month Rate % (Capped at 100%)">Rate %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                        {displayLearners.length > 0 ? (
                          displayLearners.map((learner) => {
                            const dayRecords = getMonthDaysForLearner(learner, monthlySelectedMonth);
                            const pCount = dayRecords.filter((d) => d.status === 'PRESENT').length;
                            const aCount = dayRecords.filter((d) => d.status === 'ABSENT').length;
                            const lCount = dayRecords.filter((d) => d.status === 'LATE').length;
                            const eCount = dayRecords.filter((d) => d.status === 'EXCUSED').length;
                            const isFeeLocked = learner.balanceDue > 0 && (learner.financialStatus === 'ARREARS' || learner.financialStatus === 'CHRONIC_ARREARS');

                            const elapsedInstructionalDays =
                              selectedM.isPast
                                ? selectedM.teachingDays
                                : selectedM.isCurrent
                                ? ELAPSED_TEACHING_DAYS_MARCH
                                : 0;
                            const rate =
                              elapsedInstructionalDays > 0
                                ? Math.min(100, Math.round(((pCount + lCount) / elapsedInstructionalDays) * 1000) / 10)
                                : 0;

                            return (
                              <tr key={learner.id} className="hover:bg-teal-50/40 transition group">
                                {/* Pinned Left Column */}
                                <td className="sticky left-0 z-10 bg-white group-hover:bg-teal-50/90 px-3.5 py-2 border-r border-slate-200 min-w-[210px] max-w-[230px] shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${
                                        isFeeLocked
                                          ? 'bg-rose-100 text-rose-700 border-rose-300'
                                          : learner.studentType === 'BOARDER'
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
                                      {isFeeLocked && (
                                        <div className="mt-1 flex flex-col gap-0.5">
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-[9px] font-black w-fit">
                                            <Lock className="w-2.5 h-2.5 text-rose-700" />
                                            <span>Fees Due: K{learner.balanceDue.toLocaleString()}</span>
                                          </span>
                                          <span className="text-[9px] text-rose-700 font-bold block">
                                            🚌 Bus: Suspended • 🏫 Gate: Denied
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Day by Day Cells */}
                                {dayRecords.map((d) => {
                                  if (d.isWeekend) {
                                    return (
                                      <td key={d.dayNumber} className="px-1 py-1.5 text-center bg-slate-50/70 text-slate-300 font-mono text-[9px] border-r border-slate-100">
                                        —
                                      </td>
                                    );
                                  }
                                  if (d.isHoliday) {
                                    return (
                                      <td key={d.dayNumber} className="px-1 py-1.5 text-center bg-emerald-50 text-[10px] border-r border-slate-100" title={`🇿🇲 Public Holiday: ${d.holidayName}`}>
                                        🇿🇲
                                      </td>
                                    );
                                  }
                                  if (d.status === 'FUTURE_SCHEDULED') {
                                    return (
                                      <td key={d.dayNumber} className="px-1 py-1.5 text-center text-slate-300 font-mono text-[9px] border-r border-slate-100" title={`Upcoming Instructional Session (${selectedM.name} ${d.dayNumber}) • Advance roll-call prohibited under statutory rules`}>
                                        —
                                      </td>
                                    );
                                  }
                                  if (d.status === 'FEE_LOCKED') {
                                    return (
                                      <td key={d.dayNumber} className="px-1 py-1.5 text-center bg-rose-50 border-r border-rose-100">
                                        <button
                                          type="button"
                                          onClick={() => openMobileMoneyModal(learner)}
                                          title={`Bursary Lockout: ${learner.learnerName} has unpaid fee arrears of K ${learner.balanceDue.toLocaleString()}. Attendance roll-call, bus pass & campus access suspended. Click to Pay MoMo.`}
                                          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[8px] font-bold cursor-pointer"
                                        >
                                          🔒
                                        </button>
                                      </td>
                                    );
                                  }
                                  return (
                                    <td key={d.dayNumber} className="px-1 py-1.5 text-center border-r border-slate-100">
                                      <span
                                        title={`${selectedM.name} ${d.dayNumber}: ${d.status} (${d.time || '07:18'})`}
                                        className={`inline-block w-4 h-4 rounded-full text-[8px] font-black leading-4 text-center cursor-help ${
                                          d.status === 'PRESENT'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : d.status === 'LATE'
                                            ? 'bg-amber-100 text-amber-800'
                                            : d.status === 'EXCUSED'
                                            ? 'bg-slate-200 text-slate-700'
                                            : 'bg-rose-100 text-rose-800'
                                        }`}
                                      >
                                        {d.status.charAt(0)}
                                      </span>
                                    </td>
                                  );
                                })}

                                {/* Summary Columns */}
                                <td className="px-1.5 py-1.5 text-center font-bold text-emerald-700">{pCount}</td>
                                <td className="px-1.5 py-1.5 text-center font-bold text-rose-600">{aCount}</td>
                                <td className="px-1.5 py-1.5 text-center font-bold text-amber-600">{lCount}</td>
                                <td className="px-1.5 py-1.5 text-center font-mono text-slate-500">{eCount}</td>
                                <td className="px-2 py-1.5 text-center font-black border-r border-slate-200">
                                  <span className={rate >= 95 ? 'text-emerald-700' : rate >= 85 ? 'text-amber-700' : rate > 0 ? 'text-rose-700' : 'text-slate-400'}>
                                    {selectedM.isFuture ? '—' : `${rate}%`}
                                  </span>
                                </td>

                                {/* Sticky Right Action */}
                                <td className="sticky right-0 z-10 bg-white group-hover:bg-teal-50/90 px-2 py-1.5 text-center border-l border-slate-200 shadow-[-2px_0_5px_rgba(0,0,0,0.03)]">
                                  <div className="flex flex-col gap-1">
                                    {isFeeLocked && (
                                      <button
                                        type="button"
                                        onClick={() => openMobileMoneyModal(learner)}
                                        className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] shadow-xs flex items-center justify-center gap-1 transition animate-pulse"
                                        title="Direct Mobile Money Clearance: Pay fees via MTN, Airtel, or Zamtel"
                                      >
                                        <Smartphone className="w-2.5 h-2.5 text-emerald-200" />
                                        <span>Pay MoMo</span>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setSelectedLearnerForCard(learner)}
                                      className="px-2 py-0.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[10px] border border-teal-200 flex items-center justify-center gap-1 transition w-full"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Card</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={sampleDays.length + 7} className="py-8 text-center text-slate-500 text-xs">
                              No learners match the selected filter criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            // 3. TERMLY VIEW: Terms 1, 2, 3 and Official ECZ Examination Clearance
            if (matrixHorizonView === 'TERMLY') {
              return (
                <div className="relative max-h-[580px] overflow-auto border border-slate-200 rounded-2xl shadow-xs bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                      <tr>
                        <th
                          rowSpan={2}
                          className="sticky top-0 left-0 z-30 bg-slate-900 px-3.5 py-2.5 border-r border-slate-800 min-w-[210px] max-w-[230px] shadow-[2px_0_5px_rgba(0,0,0,0.18)]"
                        >
                          <div className="flex items-center justify-between">
                            <span>Learner Identity</span>
                            <span className="text-[10px] font-mono text-slate-400">({displayLearners.length})</span>
                          </div>
                        </th>
                        <th colSpan={4} className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-800 text-amber-200 uppercase tracking-wider text-[10px]">
                          Term 1 (Autumn • 63 Instructional Days)
                        </th>
                        <th colSpan={4} className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-850 text-indigo-200 uppercase tracking-wider text-[10px]">
                          Term 2 (Winter • 62 Instructional Days)
                        </th>
                        <th colSpan={4} className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-800 text-purple-200 uppercase tracking-wider text-[10px]">
                          Term 3 (Promotional • 62 Instructional Days)
                        </th>
                        <th colSpan={3} className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-850 text-emerald-200 uppercase tracking-wider text-[10px]">
                          Annual Statutory (187 Days)
                        </th>
                        <th colSpan={2} className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-900 text-sky-200 uppercase tracking-wider text-[10px]">
                          ECZ Examination Clearance
                        </th>
                        <th rowSpan={2} className="sticky top-0 right-0 z-20 bg-slate-900 px-2 py-2 text-center min-w-[130px] border-l border-slate-800 shadow-[-2px_0_5px_rgba(0,0,0,0.15)]">
                          Actions
                        </th>
                      </tr>
                      <tr className="bg-slate-800 text-[10px] uppercase font-bold text-slate-300">
                        {/* Term 1 */}
                        <th className="px-2 py-1 text-center min-w-[65px]" title="Sessions Attended">Sessions</th>
                        <th className="px-2 py-1 text-center min-w-[55px]" title="Term 1 Rate %">Rate %</th>
                        <th className="px-2 py-1 text-center min-w-[80px]" title="Present • Absent • Late">P • A • L</th>
                        <th className="px-2 py-1 text-center border-r border-slate-700 min-w-[65px]" title="Term 1 Standing">Standing</th>
                        {/* Term 2 */}
                        <th className="px-2 py-1 text-center min-w-[65px]" title="Sessions Attended">Sessions</th>
                        <th className="px-2 py-1 text-center min-w-[55px]" title="Term 2 Rate %">Rate %</th>
                        <th className="px-2 py-1 text-center min-w-[80px]" title="Present • Absent • Late">P • A • L</th>
                        <th className="px-2 py-1 text-center border-r border-slate-700 min-w-[65px]" title="Term 2 Standing">Standing</th>
                        {/* Term 3 */}
                        <th className="px-2 py-1 text-center min-w-[65px]" title="Sessions Attended">Sessions</th>
                        <th className="px-2 py-1 text-center min-w-[55px]" title="Term 3 Rate %">Rate %</th>
                        <th className="px-2 py-1 text-center min-w-[80px]" title="Present • Absent • Late">P • A • L</th>
                        <th className="px-2 py-1 text-center border-r border-slate-700 min-w-[65px]" title="Term 3 Standing">Standing</th>
                        {/* Annual Cumulative */}
                        <th className="px-2 py-1 text-center min-w-[70px]" title="Total Attended / 187d">Total Att.</th>
                        <th className="px-2 py-1 text-center min-w-[65px]" title="Annual Cumulative %">Annual %</th>
                        <th className="px-2 py-1 text-center border-r border-slate-700 min-w-[65px]" title="Annual Standing">Standing</th>
                        {/* ECZ Clearance */}
                        <th className="px-2 py-1 text-center min-w-[90px]" title="ECZ Candidate Clearance">Clearance</th>
                        <th className="px-2 py-1 text-center border-r border-slate-700 min-w-[120px]" title="Statutory Regulation Note">Regulatory Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                      {displayLearners.length > 0 ? (
                        displayLearners.map((learner) => {
                          const h = getLearnerAttendanceHorizons(learner);
                          const t1 = h.termly.terms[0];
                          const t2 = h.termly.terms[1];
                          const t3 = h.termly.terms[2];
                          return (
                            <tr key={learner.id} className="hover:bg-amber-50/40 transition group">
                              {/* Pinned Left Column */}
                              <td className="sticky left-0 z-10 bg-white group-hover:bg-amber-50/90 px-3.5 py-2 border-r border-slate-200 min-w-[210px] max-w-[230px] shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
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

                              {/* Term 1 */}
                              <td className="px-2 py-1.5 text-center font-mono text-slate-700">{t1.sessionsAttended}/63</td>
                              <td className="px-2 py-1.5 text-center font-black text-slate-900">{t1.rate}%</td>
                              <td className="px-2 py-1.5 text-center font-mono text-[10px] text-slate-500">
                                {t1.sessionsAttended}P • <span className="text-rose-600 font-bold">{t1.sessionsAbsent}A</span> • {t1.sessionsLate}L
                              </td>
                              <td className="px-2 py-1.5 text-center border-r border-slate-100">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                  {t1.standing}
                                </span>
                              </td>

                              {/* Term 2 */}
                              <td className="px-2 py-1.5 text-center font-mono text-slate-700">{t2.sessionsAttended}/62</td>
                              <td className="px-2 py-1.5 text-center font-black text-slate-900">{t2.rate}%</td>
                              <td className="px-2 py-1.5 text-center font-mono text-[10px] text-slate-500">
                                {t2.sessionsAttended}P • <span className="text-rose-600 font-bold">{t2.sessionsAbsent}A</span> • {t2.sessionsLate}L
                              </td>
                              <td className="px-2 py-1.5 text-center border-r border-slate-100">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-100 text-slate-800 border border-slate-300">
                                  {t2.standing}
                                </span>
                              </td>

                              {/* Term 3 */}
                              <td className="px-2 py-1.5 text-center font-mono text-slate-700">{t3.sessionsAttended}/62</td>
                              <td className="px-2 py-1.5 text-center font-black text-slate-900">{t3.rate}%</td>
                              <td className="px-2 py-1.5 text-center font-mono text-[10px] text-slate-500">
                                {t3.sessionsAttended}P • <span className="text-rose-600 font-bold">{t3.sessionsAbsent}A</span> • {t3.sessionsLate}L
                              </td>
                              <td className="px-2 py-1.5 text-center border-r border-slate-100">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-900 border border-purple-300">
                                  {t3.standing}
                                </span>
                              </td>

                              {/* Annual Cumulative */}
                              <td className="px-2 py-1.5 text-center font-mono font-bold text-slate-800">
                                {h.termly.annual.totalAttended}/187
                              </td>
                              <td className="px-2 py-1.5 text-center font-black">
                                <span
                                  className={
                                    h.termly.annual.annualRate >= 95
                                      ? 'text-emerald-700'
                                      : h.termly.annual.annualRate >= 85
                                      ? 'text-amber-700'
                                      : 'text-rose-700'
                                  }
                                >
                                  {h.termly.annual.annualRate}%
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-center border-r border-slate-100">
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                  {h.termly.annual.standing}
                                </span>
                              </td>

                              {/* ECZ Clearance */}
                              <td className="px-2 py-1.5 text-center">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black ${
                                    h.termly.annual.eczExamClearance === 'CLEARED'
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : h.termly.annual.eczExamClearance === 'CONDITIONAL'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                                  }`}
                                >
                                  <ShieldCheck className="w-3 h-3 shrink-0" />
                                  <span>{h.termly.annual.eczExamClearance}</span>
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-[10px] text-slate-600 border-r border-slate-200 max-w-[130px] truncate" title={h.termly.annual.eczClearanceNote}>
                                {h.termly.annual.eczClearanceNote}
                              </td>

                              {/* Actions */}
                              <td className="sticky right-0 z-10 bg-white group-hover:bg-amber-50/90 px-2 py-1.5 text-center border-l border-slate-200 shadow-[-2px_0_5px_rgba(0,0,0,0.03)]">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedLearnerForForm12A(learner)}
                                    title="View official Ministry of Education Form 12A Attendance Clearance Return"
                                    className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[9px] border border-amber-200 flex items-center gap-0.5 transition"
                                  >
                                    <FileText className="w-2.5 h-2.5 text-amber-700" />
                                    <span>Form 12A</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedLearnerForCard(learner)}
                                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[9px] border border-slate-300 flex items-center gap-0.5 transition"
                                  >
                                    <Eye className="w-2.5 h-2.5" />
                                    <span>Card</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={18} className="py-8 text-center text-slate-500 text-xs">
                            No learners match the selected filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            }

            // 4. DAILY VIEW: Morning Roll-Call & Punctuality
            if (matrixHorizonView === 'DAILY') {
              return (
                <div className="relative max-h-[580px] overflow-auto border border-slate-200 rounded-2xl shadow-xs bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                      <tr>
                        <th className="sticky top-0 left-0 z-30 bg-slate-900 px-3.5 py-2.5 border-r border-slate-800 min-w-[210px] max-w-[230px] shadow-[2px_0_5px_rgba(0,0,0,0.18)]">
                          <div className="flex items-center justify-between">
                            <span>Learner Identity</span>
                            <span className="text-[10px] font-mono text-slate-400">({displayLearners.length})</span>
                          </div>
                        </th>
                        <th className="px-3 py-2 text-center min-w-[100px] border-r border-slate-800">Today Roll-Call</th>
                        <th className="px-3 py-2 text-center min-w-[85px] border-r border-slate-800">Arrival Time</th>
                        <th className="px-3 py-2 text-center min-w-[100px] border-r border-slate-800">Punctuality Variance</th>
                        <th className="px-3 py-2 min-w-[140px] border-r border-slate-800">Verification Source</th>
                        <th className="px-3 py-2 min-w-[160px] border-r border-slate-800">Guardian Contact</th>
                        <th className="sticky top-0 right-0 z-20 bg-slate-900 px-2 py-2 text-center min-w-[90px] border-l border-slate-800 shadow-[-2px_0_5px_rgba(0,0,0,0.15)]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                      {displayLearners.length > 0 ? (
                        displayLearners.map((learner) => {
                          const h = getLearnerAttendanceHorizons(learner);
                          return (
                            <tr key={learner.id} className="hover:bg-sky-50/40 transition group">
                              <td className="sticky left-0 z-10 bg-white group-hover:bg-sky-50/90 px-3.5 py-2 border-r border-slate-200 min-w-[210px] max-w-[230px] shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
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

                              <td className="px-3 py-2 text-center border-r border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => cycleTodayPunctuality(learner.id, learner.status)}
                                  title="Click to toggle status: Present → Absent → Late → Excused"
                                  className={`px-2.5 py-1 rounded text-[10px] font-black border transition hover:scale-105 active:scale-95 ${
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

                              <td className="px-3 py-2 text-center font-mono text-slate-700 border-r border-slate-100">
                                {h.daily.today.time}
                              </td>

                              <td className="px-3 py-2 text-center border-r border-slate-100">
                                {learner.status === 'LATE' ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                                    +{h.daily.arrivalMinutesLate} mins late
                                  </span>
                                ) : learner.status === 'ABSENT' ? (
                                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                                    No Check-in
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 font-semibold text-[10px]">On-Time</span>
                                )}
                              </td>

                              <td className="px-3 py-2 text-slate-600 border-r border-slate-100">
                                {h.daily.rollCallMethod}
                              </td>

                              <td className="px-3 py-2 border-r border-slate-100">
                                <span className="font-bold text-slate-800 block truncate">{learner.guardianName}</span>
                                <span className="font-mono text-[10px] text-slate-500">{learner.guardianPhone}</span>
                              </td>

                              <td className="sticky right-0 z-10 bg-white group-hover:bg-sky-50/90 px-2 py-1.5 text-center border-l border-slate-200 shadow-[-2px_0_5px_rgba(0,0,0,0.03)]">
                                <button
                                  type="button"
                                  onClick={() => setSelectedLearnerForCard(learner)}
                                  className="px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-[10px] border border-sky-200 flex items-center justify-center gap-1 transition w-full"
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
                          <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                            No learners match the selected filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            }

            // 5. WEEKLY VIEW: Weeks 1 through 13 of Term 1
            if (matrixHorizonView === 'WEEKLY') {
              return (
                <div className="relative max-h-[580px] overflow-auto border border-slate-200 rounded-2xl shadow-xs bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                      <tr>
                        <th
                          rowSpan={2}
                          className="sticky top-0 left-0 z-30 bg-slate-900 px-3.5 py-2.5 border-r border-slate-800 min-w-[210px] max-w-[230px] shadow-[2px_0_5px_rgba(0,0,0,0.18)]"
                        >
                          <div className="flex items-center justify-between">
                            <span>Learner Identity</span>
                            <span className="text-[10px] font-mono text-slate-400">({displayLearners.length})</span>
                          </div>
                        </th>
                        <th colSpan={13} className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-850 text-indigo-200 uppercase tracking-wider text-[10px]">
                          Term 1 Instructional Weeks (Weeks 1 to 13 • 63 School Days)
                        </th>
                        <th colSpan={2} className="px-2 py-1.5 text-center border-r border-slate-800 bg-slate-800 text-emerald-200 uppercase tracking-wider text-[10px]">
                          Consistency
                        </th>
                        <th rowSpan={2} className="sticky top-0 right-0 z-20 bg-slate-900 px-2 py-2 text-center min-w-[70px] border-l border-slate-800 shadow-[-2px_0_5px_rgba(0,0,0,0.15)]">
                          Card
                        </th>
                      </tr>
                      <tr className="bg-slate-800 text-[10px] uppercase font-bold text-slate-300">
                        {Array.from({ length: 13 }, (_, i) => (
                          <th
                            key={i}
                            className={`px-1 py-1 text-center min-w-[36px] border-r border-slate-700/60 ${
                              i === 7 ? 'bg-indigo-900/60 text-indigo-200 font-black' : ''
                            }`}
                            title={`Week ${i + 1}${i === 7 ? ' (Current Active Week)' : ''}`}
                          >
                            Wk {i + 1}
                          </th>
                        ))}
                        <th className="px-2 py-1 text-center min-w-[65px]" title="Term 1 Average Weekly Rate">Avg %</th>
                        <th className="px-2 py-1 text-center border-r border-slate-700 min-w-[70px]" title="Attendance Trend Indicator">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                      {displayLearners.length > 0 ? (
                        displayLearners.map((learner) => {
                          const h = getLearnerAttendanceHorizons(learner);
                          return (
                            <tr key={learner.id} className="hover:bg-indigo-50/40 transition group">
                              <td className="sticky left-0 z-10 bg-white group-hover:bg-indigo-50/90 px-3.5 py-2 border-r border-slate-200 min-w-[210px] max-w-[230px] shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
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

                              {h.weekly.termWeeks.map((w) => (
                                <td
                                  key={w.weekNumber}
                                  className={`px-1 py-1.5 text-center border-r border-slate-100 ${
                                    w.weekNumber === 8 ? 'bg-indigo-50/40 font-bold' : ''
                                  }`}
                                >
                                  <span
                                    title={`Week ${w.weekNumber}: ${w.rate}% (${w.daysAttended}/5 days)`}
                                    className={`inline-block px-1 py-0.5 rounded text-[9px] font-mono ${
                                      w.rate >= 95
                                        ? 'text-emerald-700 font-bold'
                                        : w.rate >= 80
                                        ? 'text-amber-700'
                                        : 'text-rose-600 font-bold'
                                    }`}
                                  >
                                    {w.rate}%
                                  </span>
                                </td>
                              ))}

                              <td className="px-2 py-1.5 text-center font-black text-slate-900">
                                {h.termly.termRate}%
                              </td>

                              <td className="px-2 py-1.5 text-center border-r border-slate-200">
                                <div className="flex items-center justify-center gap-1" title="Attendance trend">
                                  {h.weekly.weekTrends.map((wt) => (
                                    <span
                                      key={wt.week}
                                      className={`w-1.5 h-3.5 rounded-xs ${
                                        wt.rate >= 95 ? 'bg-emerald-500' : wt.rate >= 80 ? 'bg-amber-400' : 'bg-rose-500'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </td>

                              <td className="sticky right-0 z-10 bg-white group-hover:bg-indigo-50/90 px-2 py-1.5 text-center border-l border-slate-200 shadow-[-2px_0_5px_rgba(0,0,0,0.03)]">
                                <button
                                  type="button"
                                  onClick={() => setSelectedLearnerForCard(learner)}
                                  className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-[10px] border border-indigo-200 flex items-center justify-center gap-1 transition w-full"
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
                          <td colSpan={17} className="py-8 text-center text-slate-500 text-xs">
                            No learners match the selected filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            }

            // 6. DEFAULT CONSOLIDATED MULTI-HORIZON MATRIX
            return (
              <div className="relative max-h-[580px] overflow-auto border border-slate-200 rounded-2xl shadow-xs bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-20 bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                    <tr>
                      <th
                        rowSpan={2}
                        className="sticky top-0 left-0 z-30 bg-slate-900 px-3.5 py-2.5 border-r border-slate-800 min-w-[210px] max-w-[230px] shadow-[2px_0_5px_rgba(0,0,0,0.18)]"
                      >
                        <div className="flex items-center justify-between">
                          <span>Learner Identity</span>
                          <span className="text-[10px] font-mono text-slate-400">({displayLearners.length})</span>
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

                  <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                    {displayLearners.length > 0 ? (
                      displayLearners.map((learner) => {
                        const h = getLearnerAttendanceHorizons(learner);
                        return (
                          <tr key={learner.id} className="hover:bg-blue-50/50 transition group">
                            {/* Sticky Left Column */}
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
            );
          })()}
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
                      Term 3 Longitudinal Attendance & Punctuality Intelligence
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
                      Ranked performance across all evaluated classes in Term 3.
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
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
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
                  Weekly Attendance Progression (Term 3)
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

      {/* MODAL: Ministry of Education Form 12A Statutory Attendance Return & ECZ Clearance Slip */}
      {selectedLearnerForForm12A && (() => {
        const h = getLearnerAttendanceHorizons(selectedLearnerForForm12A);
        const t1 = h.termly.terms[0];
        const t2 = h.termly.terms[1];
        const t3 = h.termly.terms[2];
        const ann = h.termly.annual;
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-black text-xl border border-amber-300">
                    🇿🇲
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Republic of Zambia • Ministry of Education (MoE)
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      Official Form 12A: Statutory Attendance & ECZ Clearance Return
                    </h3>
                    <span className="text-xs text-slate-500">
                      Solwezi District Education Board Secretary (DEBS) • North-Western Province
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLearnerForForm12A(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Learner Identification Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Learner Full Name</span>
                  <span className="font-bold text-slate-900">{selectedLearnerForForm12A.learnerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Student Number</span>
                  <span className="font-mono font-bold text-slate-900">{selectedLearnerForForm12A.studentNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Classroom Cohort</span>
                  <span className="font-bold text-slate-900">{selectedLearnerForForm12A.className}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Campus & Format</span>
                  <span className="font-bold text-slate-900">
                    {selectedLearnerForForm12A.studentType === 'BOARDER' ? 'Boarder' : 'Day Scholar'}
                  </span>
                </div>
              </div>

              {/* Termly Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2 border-r border-slate-200">Term / Horizon</th>
                      <th className="px-3 py-2 text-center border-r border-slate-200">Statutory Days</th>
                      <th className="px-3 py-2 text-center border-r border-slate-200">Sessions Attended</th>
                      <th className="px-3 py-2 text-center border-r border-slate-200">Absences (P•A•L)</th>
                      <th className="px-3 py-2 text-center border-r border-slate-200">Rate (%)</th>
                      <th className="px-3 py-2 text-center">Standing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr>
                      <td className="px-3 py-2 font-bold text-slate-900 border-r border-slate-100">{t1.termLabel}</td>
                      <td className="px-3 py-2 text-center font-mono border-r border-slate-100">{t1.teachingDays}</td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-100">{t1.sessionsAttended}</td>
                      <td className="px-3 py-2 text-center font-mono text-[10px] text-slate-500 border-r border-slate-100">
                        {t1.sessionsAttended}P • {t1.sessionsAbsent}A • {t1.sessionsLate}L
                      </td>
                      <td className="px-3 py-2 text-center font-black text-slate-900 border-r border-slate-100">{t1.rate}%</td>
                      <td className="px-3 py-2 text-center font-bold text-amber-700">{t1.standing}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-bold text-slate-900 border-r border-slate-100">{t2.termLabel}</td>
                      <td className="px-3 py-2 text-center font-mono border-r border-slate-100">{t2.teachingDays}</td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-100">{t2.sessionsAttended}</td>
                      <td className="px-3 py-2 text-center font-mono text-[10px] text-slate-500 border-r border-slate-100">
                        {t2.sessionsAttended}P • {t2.sessionsAbsent}A • {t2.sessionsLate}L
                      </td>
                      <td className="px-3 py-2 text-center font-black text-slate-900 border-r border-slate-100">{t2.rate}%</td>
                      <td className="px-3 py-2 text-center font-bold text-slate-700">{t2.standing}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-bold text-slate-900 border-r border-slate-100">{t3.termLabel}</td>
                      <td className="px-3 py-2 text-center font-mono border-r border-slate-100">{t3.teachingDays}</td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-100">{t3.sessionsAttended}</td>
                      <td className="px-3 py-2 text-center font-mono text-[10px] text-slate-500 border-r border-slate-100">
                        {t3.sessionsAttended}P • {t3.sessionsAbsent}A • {t3.sessionsLate}L
                      </td>
                      <td className="px-3 py-2 text-center font-black text-slate-900 border-r border-slate-100">{t3.rate}%</td>
                      <td className="px-3 py-2 text-center font-bold text-purple-700">{t3.standing}</td>
                    </tr>
                    <tr className="bg-amber-50/50 font-black">
                      <td className="px-3 py-2 text-slate-900 border-r border-slate-200">Annual Academic Year Total</td>
                      <td className="px-3 py-2 text-center font-mono border-r border-slate-200">{ann.totalTeachingDays} Days</td>
                      <td className="px-3 py-2 text-center font-mono text-emerald-800 border-r border-slate-200">{ann.totalAttended} Days</td>
                      <td className="px-3 py-2 text-center font-mono text-[10px] text-slate-600 border-r border-slate-200">
                        {ann.totalAbsences} Absences • {ann.totalLates} Lates
                      </td>
                      <td className="px-3 py-2 text-center text-slate-900 border-r border-slate-200">{ann.annualRate}%</td>
                      <td className="px-3 py-2 text-center text-amber-900">{ann.standing}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ECZ Official Determination Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                  ann.eczExamClearance === 'CLEARED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : ann.eczExamClearance === 'CONDITIONAL'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-700 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Examinations Council of Zambia (ECZ) Clearance:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        ann.eczExamClearance === 'CLEARED'
                          ? 'bg-emerald-200 text-emerald-900'
                          : ann.eczExamClearance === 'CONDITIONAL'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-rose-200 text-rose-900'
                      }`}
                    >
                      {ann.eczExamClearance}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {ann.eczClearanceNote} Under Chapter 134 of the Laws of Zambia and official MoE circulars, learners must maintain a cumulative attendance record of no less than 80% to be certified for national ECZ examination sitting.
                  </p>
                </div>
              </div>

              {/* Endorsement and Actions */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-[11px] text-slate-500">
                  <span className="font-bold text-slate-800 block">Endorsed by Legacy School Solwezi</span>
                  <span>Stand # S/SOLWE/31/7178, Kansanshi Rd • Authenticated Digital Return</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setToastMessage(`Official MoE Form 12A Attendance Slip printed for ${selectedLearnerForForm12A.learnerName}! 🖨️`);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Print Form 12A Slip</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLearnerForForm12A(null)}
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

      {/* MODAL: Direct Mobile Money Clearance & Access Restoration (MTN / Airtel / Zamtel) */}
      {mobileMoneyModalStudent && (
        <div className="fixed inset-0 z-[80] bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Smartphone className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    Direct Mobile Money Settlement Gateway • Instant Clearance
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    Settle School Fees & Restore Access
                  </h3>
                  <span className="text-xs text-slate-500">
                    Legacy School Solwezi • Direct Bursar Merchant Collection
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMoneyModalStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Learner Identification Strip */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Learner Full Name</span>
                  <span className="font-bold text-slate-900 text-sm">{mobileMoneyModalStudent.learnerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Student ID</span>
                  <span className="font-mono font-bold text-slate-800">{mobileMoneyModalStudent.studentNumber}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Class & Campus</span>
                  <span className="font-medium text-slate-700">{mobileMoneyModalStudent.className} • {mobileMoneyModalStudent.campusName}</span>
                </div>
                <div className="text-right">
                  <span className="text-rose-600 text-[10px] uppercase font-bold block">Outstanding Tuition Arrears</span>
                  <span className="font-black text-rose-700 text-sm">K {mobileMoneyModalStudent.balanceDue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Active Lockout Penalties Notice */}
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5 text-xs text-rose-950">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Active School Access Restrictions (Until Fees Cleared):</span>
              </div>
              <ul className="grid grid-cols-1 gap-1 text-[11px] pl-5 list-disc text-rose-800">
                <li><strong className="font-semibold">Daily Register Roll-Call:</strong> Entry disabled; student cannot be recorded as present.</li>
                <li><strong className="font-semibold">Morning Shuttle Bus:</strong> Access suspended; boarding denied at route checkpoint.</li>
                <li><strong className="font-semibold">Campus Gate & Turnstile:</strong> Biometric / Barcode ID scan denied at security gate.</li>
              </ul>
              <div className="text-[10px] text-rose-700 font-medium italic pt-1">
                ⚡ Confirmation of payment will instantly unlock all access controls and update the daily register.
              </div>
            </div>

            {/* Mobile Money Provider Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                Select Mobile Money Network
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMobileMoneyProvider('MTN')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    mobileMoneyProvider === 'MTN'
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                    M
                  </span>
                  <span className="font-bold text-slate-900 text-xs">MTN MoMo</span>
                  <span className="text-[9px] text-slate-500 font-mono">*303# USSD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMobileMoneyProvider('AIRTEL')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    mobileMoneyProvider === 'AIRTEL'
                      ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                    A
                  </span>
                  <span className="font-bold text-slate-900 text-xs">Airtel Money</span>
                  <span className="text-[9px] text-slate-500 font-mono">*115# USSD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMobileMoneyProvider('ZAMTEL')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    mobileMoneyProvider === 'ZAMTEL'
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    Z
                  </span>
                  <span className="font-bold text-slate-900 text-xs">Zamtel Kwacha</span>
                  <span className="text-[9px] text-slate-500 font-mono">*344# USSD</span>
                </button>
              </div>
            </div>

            {/* Payment Input Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Payer / Guardian Full Name
                </label>
                <input
                  type="text"
                  value={mobileMoneyPayerName}
                  onChange={(e) => setMobileMoneyPayerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="e.g., Mrs. Astridah Chanda"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Mobile Money Registered Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={mobileMoneyPhone}
                    onChange={(e) => setMobileMoneyPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                    placeholder="+260 97X XXX XXX"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Settlement Amount (Zambian Kwacha - ZMW)
                  </label>
                  <button
                    type="button"
                    onClick={() => setMobileMoneyAmount(mobileMoneyModalStudent.balanceDue)}
                    className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold underline"
                  >
                    Pay Full Balance (K {mobileMoneyModalStudent.balanceDue.toLocaleString()})
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">K</span>
                  <input
                    type="number"
                    min="1"
                    value={mobileMoneyAmount || ''}
                    onChange={(e) => setMobileMoneyAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-black text-slate-900"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* USSD Prompt Live Handset Notice */}
            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-slate-500 shrink-0" />
              <span>A direct push prompt will be dispatched to <strong className="font-semibold text-slate-800">{mobileMoneyPhone || 'the handset'}</strong>. Enter your Mobile Money PIN on the phone to complete transaction.</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setMobileMoneyModalStudent(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={mobileMoneyProcessing || mobileMoneyAmount <= 0}
                onClick={handleProcessMobileMoneyPayment}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold flex items-center gap-2 shadow-xs transition"
              >
                {mobileMoneyProcessing ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Processing {mobileMoneyProvider} MoMo...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Authorize & Settle K {mobileMoneyAmount.toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Ministry of Education (MoE) & Solwezi DEBS Statutory Inspection & Compliance Audit Trail */}
      {showAuditModal && (() => {
        const filteredLogs = auditLogs.filter((log) => {
          const matchesFilter =
            auditFilter === 'ALL' ||
            (auditFilter === 'MOBILE_MONEY' && log.eventType === 'MOBILE_MONEY_PAYMENT') ||
            (auditFilter === 'FEE_LOCK' && log.eventType === 'FEE_LOCK_ENFORCED') ||
            (auditFilter === 'ROLL_CALL' && log.eventType === 'ROLL_CALL_LOG') ||
            (auditFilter === 'STATUTORY' && log.eventType === 'STATUTORY_RETURN_FILED');

          const matchesSearch =
            !auditSearch ||
            log.learnerName.toLowerCase().includes(auditSearch.toLowerCase()) ||
            log.studentNumber.toLowerCase().includes(auditSearch.toLowerCase()) ||
            log.officer.toLowerCase().includes(auditSearch.toLowerCase()) ||
            log.details.toLowerCase().includes(auditSearch.toLowerCase());

          return matchesFilter && matchesSearch;
        });

        const totalPayments = auditLogs.filter((l) => l.eventType === 'MOBILE_MONEY_PAYMENT').length;
        const totalFeeLocks = auditLogs.filter((l) => l.eventType === 'FEE_LOCK_ENFORCED').length;

        return (
          <div className="fixed inset-0 z-[80] bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 space-y-5 border border-slate-200 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-black text-xl border border-emerald-300">
                    🇿🇲
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Republic of Zambia • Ministry of Education (MoE)
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      Solwezi DEBS Statutory Inspection & Attendance Audit Trail
                    </h3>
                    <span className="text-xs text-slate-500">
                      Immutable Log: Roll-Calls, Fee Restrictions, Mobile Money Clearances, and Form 12A Returns
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Statutory Framework Banner */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
                <FileCheck className="w-5 h-5 shrink-0 text-emerald-700 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">
                    Statutory Compliance Retention (Education Act Cap 134 & National Roll-Call Standards)
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    All attendance entries, future-date locking protocols, fee-related access suspensions, and mobile money clearance unlocks are recorded in this immutable audit ledger. This data is maintained for statutory inspection by the Solwezi District Education Board Secretary (DEBS) and Provincial Education Officer (PEO).
                  </p>
                </div>
              </div>

              {/* KPI Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Total Logged Events</span>
                  <span className="font-black text-slate-900 text-lg">{auditLogs.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 text-[10px] uppercase font-bold block">MoMo Clearances</span>
                  <span className="font-black text-emerald-800 text-lg">{totalPayments}</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-rose-700 text-[10px] uppercase font-bold block">Fee Lock Enforcement</span>
                  <span className="font-black text-rose-800 text-lg">{totalFeeLocks}</span>
                </div>
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                  <span className="text-teal-700 text-[10px] uppercase font-bold block">Audit Verification</span>
                  <span className="font-black text-teal-800 text-lg">100% Certified</span>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setAuditFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                      auditFilter === 'ALL'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Events ({auditLogs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditFilter('MOBILE_MONEY')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                      auditFilter === 'MOBILE_MONEY'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    MoMo Clearances ({totalPayments})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditFilter('FEE_LOCK')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                      auditFilter === 'FEE_LOCK'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Fee Locks ({totalFeeLocks})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditFilter('STATUTORY')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                      auditFilter === 'STATUTORY'
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Form 12A Filings
                  </button>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search learner, ID, or officer..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Audit Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 border-r border-slate-200">Timestamp (CAT)</th>
                      <th className="px-3 py-2 border-r border-slate-200">Event Classification</th>
                      <th className="px-3 py-2 border-r border-slate-200">Learner & Cohort</th>
                      <th className="px-3 py-2 border-r border-slate-200">Audit Narrative & Action</th>
                      <th className="px-3 py-2 border-r border-slate-200">Channel / Ref</th>
                      <th className="px-3 py-2">Authorizing Officer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => {
                        let badgeColor = 'bg-slate-100 text-slate-800 border-slate-300';
                        if (log.eventType === 'MOBILE_MONEY_PAYMENT') {
                          badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                        } else if (log.eventType === 'FEE_LOCK_ENFORCED') {
                          badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
                        } else if (log.eventType === 'ACCESS_RESTORED') {
                          badgeColor = 'bg-teal-100 text-teal-900 border-teal-300';
                        } else if (log.eventType === 'STATUTORY_RETURN_FILED') {
                          badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
                        }
                        return (
                          <tr key={log.id} className="hover:bg-slate-50 transition">
                            <td className="px-3 py-2.5 font-mono text-[10px] text-slate-600 border-r border-slate-100 whitespace-nowrap">
                              {log.timestamp}
                            </td>
                            <td className="px-3 py-2.5 border-r border-slate-100 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${badgeColor}`}>
                                {log.eventType.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 border-r border-slate-100 whitespace-nowrap">
                              <span className="font-bold text-slate-900 block">{log.learnerName}</span>
                              <span className="font-mono text-slate-500 text-[10px]">
                                {log.studentNumber} • {log.className}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 border-r border-slate-100 text-slate-700 max-w-xs leading-relaxed">
                              {log.details}
                            </td>
                            <td className="px-3 py-2.5 border-r border-slate-100 whitespace-nowrap">
                              <span className="font-bold text-slate-800 block">{log.channel || 'System Auto'}</span>
                              {log.reference && (
                                <span className="font-mono text-slate-500 text-[10px] block">{log.reference}</span>
                              )}
                              {log.amount && (
                                <span className="font-bold text-emerald-700 text-[10px] block">
                                  K {log.amount.toLocaleString()}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="font-medium text-slate-800 block">{log.officer}</span>
                              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                          No audit entries match the selected filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer Actions & Export */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-[11px] text-slate-500">
                  <span className="font-bold text-slate-800 block">Solwezi DEBS Certified Digital Log</span>
                  <span>Solwezi Central & Kansanshi Campuses • Retention Period: 7 Years Statutory</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportAuditTrailCsv}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export DEBS Audit CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Statutory DEBS Inspection Certificate generated and sent to print spooler! 🖨️');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    <span>Print DEBS Summary</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAuditModal(false)}
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
    </ModuleGate>
  );
}
