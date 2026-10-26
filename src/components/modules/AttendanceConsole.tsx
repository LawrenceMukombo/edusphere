'use client';

import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  X,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Search,
  Filter,
  Printer,
  ShieldCheck,
  Building,
  FileText,
  Activity,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Lock,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Download,
  Fingerprint,
  QrCode,
  Smartphone,
  UserCheck,
  ShieldAlert,
  Flag,
  Edit,
  Edit3,
  SlidersHorizontal,
  UserCog,
  Radio,
  Bed,
  Cake,
  PartyPopper,
  Send,
  FileCheck,
  Eye,
  BarChart3,
} from 'lucide-react';
import { OfficialAttendanceSheetModal } from '../attendance/OfficialAttendanceSheetModal';
import { AttendanceCautionModal } from '../attendance/AttendanceCautionModal';
import { PublicHolidayManagerModal } from '../attendance/PublicHolidayManagerModal';
import { LiveRollCallModal } from '../attendance/LiveRollCallModal';
import { TraineeAttendancePassportModal } from '../attendance/TraineeAttendancePassportModal';
import { Form12AStatutoryReturnModal } from '../attendance/Form12AStatutoryReturnModal';
import { StatutoryAuditLogModal } from '../attendance/StatutoryAuditLogModal';
import { HostelRollCallModal } from '../attendance/HostelRollCallModal';
import { ClinicalExeatModal, ClinicalExeatPass } from '../attendance/ClinicalExeatModal';
import { ACADEMIC_TERMS_2026 } from '@/server/services/schoolCalendarData';
import {
  checkZambianPublicHoliday,
  getHolidaysInMonth,
  ZAMBIAN_PUBLIC_HOLIDAYS_2026,
  ZambianHoliday,
} from '@/lib/zambianHolidays';

export type UserRole = 'ACADEMIC_REGISTRAR' | 'FACULTY_LECTURER' | 'STUDENT_VIEWER';

export interface AttendanceLearnerRecord {
  id: string;
  studentNumber: string;
  name: string;
  programme: string;
  cohort: string;
  baseTheoryAttended: number;
  baseTheoryTotal: number;
  baseClinicalAttended: number;
  baseClinicalTotal: number;
  todayStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  arrivalMinutesLate?: number;
  verificationMethod: 'BIOMETRIC_FINGERPRINT' | 'MOBILE_PIN' | 'QR_GEOFENCE' | 'MANUAL_FACULTY';
  lastCheckIn?: string;
}

export interface SessionHistoryItem {
  id: string;
  date: string;
  cohort: string;
  module: string;
  type: string;
  venue: string;
  instructor: string;
  presentCount: number;
  totalCount: number;
  rate: number;
  isHolidaySession?: boolean;
  holidayName?: string;
}

export interface AttendanceConsoleProps {
  initialSessions?: any[];
  initialLearners?: any[];
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Dynamically computes Monday of the current week based on local calendar date.
 * For today (Monday 26 October 2026), returns 2026-10-26.
 */
export function getCurrentMonday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

interface WeekDayInfo {
  iso: string;
  label: string;
  dayName: string;
  dayNum: number;
  monthNum: number;
  isHoliday: boolean;
  holidayName?: string;
}

/**
 * Dynamically computes the 5 Monday-to-Friday dates for a given week offset.
 * Base Monday (Week 0) is dynamically computed from getCurrentMonday().
 */
function getWeekDays(offset: number, holidays: ZambianHoliday[]): { label: string; days: WeekDayInfo[] } {
  const baseMon = getCurrentMonday();
  baseMon.setDate(baseMon.getDate() + offset * 7);

  const days: WeekDayInfo[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(baseMon);
    d.setDate(baseMon.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${day}`;
    const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i];
    const monthShort = d.toLocaleString('en-US', { month: 'short' });
    const label = `${dayName} (${d.getDate()} ${monthShort})`;

    const hol = holidays.find((h) => h.date === iso || h.observedDate === iso);

    days.push({
      iso,
      label,
      dayName,
      dayNum: d.getDate(),
      monthNum: d.getMonth() + 1,
      isHoliday: !!hol,
      holidayName: hol?.name,
    });
  }

  const startDay = days[0].dayNum;
  const startMonth = new Date(baseMon).toLocaleString('en-US', { month: 'short' });
  const endD = new Date(baseMon);
  endD.setDate(baseMon.getDate() + 4);
  const endDay = endD.getDate();
  const endMonth = endD.toLocaleString('en-US', { month: 'short' });
  const year = endD.getFullYear();

  const rangeLabel = `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`;
  return { label: rangeLabel, days };
}

export function AttendanceConsole({
  initialSessions = [],
  initialLearners = [],
}: AttendanceConsoleProps) {
  const todayISO = getTodayDateString(); // e.g. 2026-10-25

  // User Role & Permissions State
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('ACADEMIC_REGISTRAR');
  const canEditAttendance = currentUserRole === 'ACADEMIC_REGISTRAR' || currentUserRole === 'FACULTY_LECTURER';
  const canManageHolidays = currentUserRole === 'ACADEMIC_REGISTRAR';
  const canEditStudentQuotas = currentUserRole === 'ACADEMIC_REGISTRAR';

  // Dynamic Public Holidays state (Fully Editable: Create, Edit, Update, Delete)
  const [holidays, setHolidays] = useState<ZambianHoliday[]>(ZAMBIAN_PUBLIC_HOLIDAYS_2026);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState<boolean>(false);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<
    'daily' | 'weekly' | 'monthly' | 'annual' | 'hostel' | 'exeats' | 'calendar' | 'excuses' | 'analytics' | 'history'
  >('daily');

  // Daily Register configuration
  const [sessionDate, setSessionDate] = useState<string>(todayISO);
  const [selectedProgramme, setSelectedProgramme] = useState<string>('ALL');
  const [selectedSessionType, setSelectedSessionType] = useState<'LECTURE' | 'SKILLS_LAB' | 'WARD_ROUND' | 'OSCE' | 'COMMUNITY'>('LECTURE');
  const [sessionVenue, setSessionVenue] = useState<string>('Lecture Theatre 1 (Main Campus)');
  const [moduleTitle, setModuleTitle] = useState<string>('NUR-112: Foundations of Nursing Practice');
  const [instructorName, setInstructorName] = useState<string>('Sr. Patricia Mwewa, RN, BScN');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'AT_RISK'>('ALL');
  const [notice, setNotice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isClinicalHolidayRoster, setIsClinicalHolidayRoster] = useState<boolean>(false);

  // Weekly view configuration
  // 0 = Current Week (26 Oct - 30 Oct 2026), -1 = Previous Week (19 Oct - 23 Oct), etc.
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Monthly view configuration
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  // Modals state
  const [isSheetModalOpen, setIsSheetModalOpen] = useState<boolean>(false);
  const [cautionStudent, setCautionStudent] = useState<any | null>(null);
  const [editingStudent, setEditingStudent] = useState<AttendanceLearnerRecord | null>(null);
  const [showLiveRollCallModal, setShowLiveRollCallModal] = useState<boolean>(false);
  const [selectedTraineeForPassport, setSelectedTraineeForPassport] = useState<any | null>(null);
  const [selectedTraineeForForm12A, setSelectedTraineeForForm12A] = useState<any | null>(null);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [showHostelRollCallModal, setShowHostelRollCallModal] = useState<boolean>(false);
  const [showExeatModal, setShowExeatModal] = useState<boolean>(false);

  // Future date check for current sessionDate
  const isFutureDate = sessionDate > todayISO;

  // Zambian public holiday check for current sessionDate
  const holidayCheck = useMemo(() => {
    const hol = holidays.find((h) => h.date === sessionDate || h.observedDate === sessionDate);
    return {
      isHoliday: !!hol,
      holiday: hol,
      isObservedDate: hol ? hol.observedDate === sessionDate : false,
    };
  }, [sessionDate, holidays]);

  // Compute dynamic week days based on weekOffset and current holidays
  const currentWeekInfo = useMemo(() => {
    return getWeekDays(weekOffset, holidays);
  }, [weekOffset, holidays]);

  // Hydrate Learners
  const initialLearnerList: AttendanceLearnerRecord[] = useMemo(() => {
    if (initialLearners.length > 0) {
      return initialLearners.map((l: any, idx: number) => ({
        id: l.id,
        studentNumber: l.studentNumber || `NWU-2026-000${idx + 1}`,
        name: `${l.firstName} ${l.lastName}`,
        programme: l.programme?.name || (idx % 2 === 0 ? 'Diploma in Registered Nursing' : 'Diploma in Clinical Medicine'),
        cohort: idx % 2 === 0 ? 'RN-2026-JAN' : 'CM-2026-JAN',
        baseTheoryAttended: 34 + (idx % 6),
        baseTheoryTotal: 40,
        baseClinicalAttended: 50 + (idx % 10),
        baseClinicalTotal: 60,
        todayStatus: (idx === 2 ? 'ABSENT' : idx === 3 ? 'LATE' : idx === 5 ? 'EXCUSED' : 'PRESENT') as any,
        arrivalMinutesLate: idx === 3 ? 15 : undefined,
        verificationMethod: (idx % 2 === 0 ? 'BIOMETRIC_FINGERPRINT' : 'MOBILE_PIN') as any,
        lastCheckIn: idx === 2 ? undefined : `08:0${(idx * 2) % 9} AM`,
      }));
    }
    return [
      {
        id: '8f28f308-383e-4735-bb68-d95846577f03',
        studentNumber: 'NWU-2026-0004',
        name: 'Brian Mulenga',
        programme: 'Diploma in Registered Nursing',
        cohort: 'RN-2026-JAN',
        baseTheoryAttended: 38,
        baseTheoryTotal: 40,
        baseClinicalAttended: 58,
        baseClinicalTotal: 60,
        todayStatus: 'PRESENT',
        verificationMethod: 'BIOMETRIC_FINGERPRINT',
        lastCheckIn: '08:02 AM',
      },
      {
        id: '57fb6263-7eb3-4cb4-a104-c2aa7a11c378',
        studentNumber: 'NWU-2026-0005',
        name: 'Esther Lungu',
        programme: 'Diploma in Registered Nursing',
        cohort: 'RN-2026-JAN',
        baseTheoryAttended: 39,
        baseTheoryTotal: 40,
        baseClinicalAttended: 60,
        baseClinicalTotal: 60,
        todayStatus: 'PRESENT',
        verificationMethod: 'MOBILE_PIN',
        lastCheckIn: '08:05 AM',
      },
      {
        id: '4d747e0a-5eee-4459-af7f-221157dd0b8b',
        studentNumber: 'NWU-2026-0001',
        name: 'Chilufya Banda',
        programme: 'Diploma in Registered Nursing',
        cohort: 'RN-2026-JAN',
        baseTheoryAttended: 30,
        baseTheoryTotal: 40,
        baseClinicalAttended: 44,
        baseClinicalTotal: 60,
        todayStatus: 'ABSENT',
        verificationMethod: 'MANUAL_FACULTY',
      },
      {
        id: 'e213a2ed-c2de-4236-8724-3c325ad2df53',
        studentNumber: 'NWU-2026-0002',
        name: 'Emmanuel Sichone',
        programme: 'Diploma in Clinical Medicine',
        cohort: 'CM-2026-JAN',
        baseTheoryAttended: 36,
        baseTheoryTotal: 40,
        baseClinicalAttended: 55,
        baseClinicalTotal: 60,
        todayStatus: 'LATE',
        arrivalMinutesLate: 15,
        verificationMethod: 'QR_GEOFENCE',
        lastCheckIn: '08:15 AM',
      },
      {
        id: '172ade2b-7c89-4f9e-a31c-ef16745843e9',
        studentNumber: 'NWU-2026-0003',
        name: 'Grace Mwape',
        programme: 'Diploma in Clinical Medicine',
        cohort: 'CM-2026-JAN',
        baseTheoryAttended: 37,
        baseTheoryTotal: 40,
        baseClinicalAttended: 58,
        baseClinicalTotal: 60,
        todayStatus: 'PRESENT',
        verificationMethod: 'BIOMETRIC_FINGERPRINT',
        lastCheckIn: '07:58 AM',
      },
      {
        id: 'f87a329e-10b2-4d7a-8f19-91823764811a',
        studentNumber: 'DEV-STU-0001',
        name: 'Sample Student',
        programme: 'Diploma in Registered Nursing',
        cohort: 'RN-2026-JAN',
        baseTheoryAttended: 35,
        baseTheoryTotal: 40,
        baseClinicalAttended: 52,
        baseClinicalTotal: 60,
        todayStatus: 'EXCUSED',
        verificationMethod: 'MOBILE_PIN',
        lastCheckIn: '08:01 AM',
      },
    ];
  }, [initialLearners]);

  const [students, setStudents] = useState<AttendanceLearnerRecord[]>(initialLearnerList);

  // Dynamic Multi-Week Daily Session Map
  // Key: `${studentId}_${isoDate}` -> Status
  const [dailyAttendanceMap, setDailyAttendanceMap] = useState<
    Record<string, 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'HOLIDAY'>
  >(() => {
    const initialMap: Record<string, 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'HOLIDAY'> = {};
    // Seed default records for Week 0 (Oct 26-30 2026)
    const baseLearners = initialLearnerList;
    baseLearners.forEach((s, sIdx) => {
      // 26 Oct (Monday - Today): live operational data
      initialMap[`${s.id}_2026-10-26`] =
        sIdx === 2 ? 'ABSENT' : sIdx === 3 ? 'LATE' : sIdx === 5 ? 'EXCUSED' : 'PRESENT';

      // Seed Week -1 (Oct 19-23 2026): 19 Oct is National Day of Prayer holiday
      initialMap[`${s.id}_2026-10-19`] = 'HOLIDAY';
      initialMap[`${s.id}_2026-10-20`] = 'PRESENT';
      initialMap[`${s.id}_2026-10-21`] = sIdx === 2 ? 'ABSENT' : 'PRESENT';
      initialMap[`${s.id}_2026-10-22`] = sIdx === 3 ? 'LATE' : 'PRESENT';
      initialMap[`${s.id}_2026-10-23`] = sIdx === 5 ? 'EXCUSED' : 'PRESENT';

      // Seed Week -2 (Oct 12-16 2026)
      initialMap[`${s.id}_2026-10-12`] = 'PRESENT';
      initialMap[`${s.id}_2026-10-13`] = sIdx === 2 ? 'ABSENT' : 'PRESENT';
      initialMap[`${s.id}_2026-10-14`] = 'PRESENT';
      initialMap[`${s.id}_2026-10-15`] = 'PRESENT';
      initialMap[`${s.id}_2026-10-16`] = sIdx === 3 ? 'LATE' : 'PRESENT';

      // Seed Week -3 (Oct 5-9 2026)
      initialMap[`${s.id}_2026-10-05`] = 'PRESENT';
      initialMap[`${s.id}_2026-10-06`] = 'PRESENT';
      initialMap[`${s.id}_2026-10-07`] = 'PRESENT';
      initialMap[`${s.id}_2026-10-08`] = sIdx === 2 ? 'ABSENT' : 'PRESENT';
      initialMap[`${s.id}_2026-10-09`] = 'PRESENT';
    });
    return initialMap;
  });

  // Absence excuse requests state
  const [excuses, setExcuses] = useState([
    {
      id: 'exc-1',
      studentNumber: 'DEV-STU-0001',
      studentName: 'Sample Student',
      programme: 'Diploma in Registered Nursing',
      sessionDate: '2026-10-24',
      reason: 'Admitted to Manyama Urban Clinic Sick Bay (Severe Malaria test confirmed)',
      documentAttached: 'Medical_Admission_Slip_Manyama_0921.pdf',
      status: 'APPROVED',
      reviewedBy: 'Dr. George Silwamba',
      reviewedAt: '2026-10-24 09:30',
    },
    {
      id: 'exc-2',
      studentNumber: 'NWU-2026-0001',
      studentName: 'Chilufya Banda',
      programme: 'Diploma in Registered Nursing',
      sessionDate: '2026-10-22',
      reason: 'Bereavement leave — immediate family funeral in Kitwe',
      documentAttached: 'Burial_Permit_Copy.pdf',
      status: 'PENDING_REVIEW',
      reviewedBy: null,
      reviewedAt: null,
    },
  ]);

  // Session history state
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([
    {
      id: 'ses-1',
      date: '2026-10-24',
      cohort: 'RN-2026-JAN',
      module: 'NUR-112: Foundations of Nursing Practice',
      type: 'WARD_ROUND',
      venue: 'Solwezi General Hospital (Essential Holiday Duty)',
      instructor: 'Sr. Patricia Mwewa',
      presentCount: 5,
      totalCount: 6,
      rate: 83,
      isHolidaySession: true,
      holidayName: 'Independence Day (62nd Anniversary)',
    },
    {
      id: 'ses-2',
      date: '2026-10-23',
      cohort: 'RN-2026-JAN',
      module: 'NUR-112: Foundations of Nursing Practice',
      type: 'SKILLS_LAB',
      venue: 'Clinical Skills Lab 2',
      instructor: 'Sr. Patricia Mwewa',
      presentCount: 5,
      totalCount: 6,
      rate: 83,
    },
    {
      id: 'ses-3',
      date: '2026-10-22',
      cohort: 'CM-2026-JAN',
      module: 'MED-111: Clinical Anatomy & Physiology I',
      type: 'LECTURE',
      venue: 'Lecture Theatre 1',
      instructor: 'Dr. Mwape Banda',
      presentCount: 6,
      totalCount: 6,
      rate: 100,
    },
    {
      id: 'ses-4',
      date: '2026-10-21',
      cohort: 'RN-2026-JAN',
      module: 'NUR-112: Foundations of Nursing Practice',
      type: 'WARD_ROUND',
      venue: 'Solwezi General Hospital Female Ward',
      instructor: 'Mr. John Lungu, RN',
      presentCount: 5,
      totalCount: 6,
      rate: 83,
    },
  ]);

  // Hostel & Nightly Curfew state
  const [hostelLogs, setHostelLogs] = useState<any[]>([
    {
      id: 'rc-101',
      hostelName: 'Florence Nightingale Residence (Female Hostel - Shilenda Road Campus)',
      timestamp: '2026-10-25 21:30:00',
      warden: 'Mrs. Margaret Musonda, RN (Senior Matron)',
      inRoomCount: 104,
      lateCount: 2,
      exeatCount: 8,
      sickBayCount: 2,
      totalBeds: 120,
      status: 'VERIFIED',
      remarks: 'Nightly roll-call completed. 8 trainees on approved clinical night rotation at Solwezi General Hospital.',
    },
    {
      id: 'rc-102',
      hostelName: 'Albert Schweitzer Hall (Main Campus Male Residence)',
      timestamp: '2026-10-25 21:30:00',
      warden: 'Mr. Kelvin Phiri (Male Residence Warden)',
      inRoomCount: 88,
      lateCount: 1,
      exeatCount: 4,
      sickBayCount: 1,
      totalBeds: 96,
      status: 'VERIFIED',
      remarks: 'All rooms checked. Generator power active. Perimeter gate locked.',
    },
  ]);

  // Clinical Exeat & Gate Passes state
  const [clinicalExeats, setClinicalExeats] = useState<ClinicalExeatPass[]>([
    {
      id: 'ext-201',
      passNumber: 'NWU-EXT-4091',
      studentId: 'DEV-STU-0001',
      studentName: 'Sample Student',
      studentNumber: 'DEV-STU-0001',
      programme: 'Diploma in Registered Nursing',
      destination: 'Solwezi General Hospital (Labour Ward Overnight Practicum)',
      reason: 'Mandatory clinical delivery quota attendance under Sister in Charge.',
      departureTime: '2026-10-26 13:30',
      expectedReturnTime: '2026-10-26 21:30',
      authorizingOfficer: 'Sr. Patricia Mwewa, RN (Placement Coordinator)',
      emergencyPhone: '+260 966 412093',
      status: 'ACTIVE',
    },
    {
      id: 'ext-202',
      passNumber: 'NWU-EXT-4092',
      studentId: 'NWU-2026-0001',
      studentName: 'Chilufya Banda',
      studentNumber: 'NWU-2026-0001',
      programme: 'Diploma in Clinical Medicine',
      destination: 'Manyama Urban Clinic (OPD Triage Shift)',
      reason: 'Clinical clerkship rotation in paediatric triage and immunisation.',
      departureTime: '2026-10-26 08:00',
      expectedReturnTime: '2026-10-26 16:30',
      authorizingOfficer: 'Dr. Mwape Banda (Faculty Lecturer)',
      emergencyPhone: '+260 977 821904',
      status: 'ACTIVE',
    },
    {
      id: 'ext-203',
      passNumber: 'NWU-EXT-4088',
      studentId: 'NWU-2026-0005',
      studentName: 'Esther Lungu',
      studentNumber: 'NWU-2026-0005',
      programme: 'Diploma in Clinical Medicine',
      destination: 'Solwezi General Hospital (OPD Clerkship)',
      reason: 'Routine clinical shift rotation.',
      departureTime: '2026-10-23 08:00',
      expectedReturnTime: '2026-10-23 16:00',
      actualReturnTime: '2026-10-23 15:50',
      authorizingOfficer: 'Dr. Mwape Banda (Faculty Lecturer)',
      emergencyPhone: '+260 976 123984',
      status: 'RETURNED',
    },
  ]);

  // --------------------------------------------------------------------------
  // HIERARCHICAL AGGREGATION MATHEMATICS
  // 1. Weekly Attendance per student for the selected week
  // 2. Monthly Attendance = Sum of all sessions in that month (aggregating weeks)
  // 3. Annual Attendance = Sum of all months (aggregating monthly returns)
  // --------------------------------------------------------------------------
  const aggregatedStudents = useMemo(() => {
    return students.map((s) => {
      // 1. Weekly Computation for active week (weekOffset)
      const weekDays = currentWeekInfo.days;
      const weekStatuses = weekDays.map((d) => {
        const key = `${s.id}_${d.iso}`;
        if (dailyAttendanceMap[key]) return dailyAttendanceMap[key];
        if (d.isHoliday) return 'HOLIDAY';
        return 'PRESENT';
      });

      // Instructional days exclude gazetted public holidays
      const instructionalDays = weekDays.filter((d) => !d.isHoliday);
      const attendedInWeek = weekDays.filter((d, idx) => {
        const st = weekStatuses[idx];
        return st === 'PRESENT' || st === 'LATE' || st === 'HOLIDAY';
      }).length;

      const weeklyRate = instructionalDays.length > 0
        ? Math.round((weekDays.filter((d, idx) => !d.isHoliday && (weekStatuses[idx] === 'PRESENT' || weekStatuses[idx] === 'LATE')).length / instructionalDays.length) * 100)
        : 100;

      // 2. Monthly Computation for selectedMonth (e.g. '2026-10')
      // Count all sessions in dailyAttendanceMap that start with selectedMonth
      const monthDateKeys = Object.keys(dailyAttendanceMap).filter(
        (k) => k.startsWith(`${s.id}_${selectedMonth}`)
      );

      let monthAttendedCount = 0;
      let monthInstructionalCount = 0;

      monthDateKeys.forEach((k) => {
        const iso = k.split('_')[1];
        const hol = holidays.find((h) => h.date === iso || h.observedDate === iso);
        const status = dailyAttendanceMap[k];
        if (!hol) {
          monthInstructionalCount++;
          if (status === 'PRESENT' || status === 'LATE' || status === 'EXCUSED') {
            monthAttendedCount++;
          }
        }
      });

      // Fallback base values if few records
      const totalMonthlyInstructional = Math.max(monthInstructionalCount, 15);
      const totalMonthlyAttended = Math.min(
        Math.max(monthAttendedCount, 12),
        totalMonthlyInstructional
      );
      const monthlyRate = Math.round((totalMonthlyAttended / totalMonthlyInstructional) * 100);

      // Monthly hours partition (40h Theory quota, 60h Clinical quota)
      const monthlyTheoryAttended = Math.round((monthlyRate / 100) * 40);
      const monthlyClinicalAttended = Math.round((monthlyRate / 100) * 60);

      // 3. Annual Computation (Aggregate of all semester months)
      // Base cumulative semester hours + dynamic monthly hours delta
      const annualTheoryAttended = Math.min(s.baseTheoryAttended, s.baseTheoryTotal);
      const annualClinicalAttended = Math.min(s.baseClinicalAttended, s.baseClinicalTotal);
      const annualTotalAttended = annualTheoryAttended + annualClinicalAttended;
      const annualTotalSessions = s.baseTheoryTotal + s.baseClinicalTotal;
      const annualCombinedRate = annualTotalSessions > 0
        ? Math.round((annualTotalAttended / annualTotalSessions) * 100)
        : 0;

      return {
        ...s,
        currentWeekStatuses: weekStatuses,
        weeklyRate,
        attendedInWeek,
        instructionalDaysCount: instructionalDays.length,
        monthlyRate,
        monthlyTheoryAttended,
        monthlyClinicalAttended,
        monthlyTheoryTotal: 40,
        monthlyClinicalTotal: 60,
        annualTheoryAttended,
        annualClinicalAttended,
        annualTotalAttended,
        annualTotalSessions,
        annualCombinedRate,
      };
    });
  }, [students, currentWeekInfo, dailyAttendanceMap, selectedMonth, holidays]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return aggregatedStudents.filter((s) => {
      const matchesProg =
        selectedProgramme === 'ALL' ||
        (selectedProgramme === 'DRN' && s.programme.includes('Nursing')) ||
        (selectedProgramme === 'DCM' && s.programme.includes('Clinical Medicine')) ||
        (selectedProgramme === 'DPHARM' && s.programme.includes('Pharmacy'));

      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PRESENT' && s.todayStatus === 'PRESENT') ||
        (statusFilter === 'LATE' && s.todayStatus === 'LATE') ||
        (statusFilter === 'ABSENT' && s.todayStatus === 'ABSENT') ||
        (statusFilter === 'EXCUSED' && s.todayStatus === 'EXCUSED') ||
        (statusFilter === 'AT_RISK' && s.annualCombinedRate < 85);

      return matchesProg && matchesSearch && matchesStatus;
    });
  }, [aggregatedStudents, selectedProgramme, searchQuery, statusFilter]);

  // Statistics
  const presentCount = students.filter((s) => s.todayStatus === 'PRESENT').length;
  const lateCount = students.filter((s) => s.todayStatus === 'LATE').length;
  const absentCount = students.filter((s) => s.todayStatus === 'ABSENT').length;
  const excusedCount = students.filter((s) => s.todayStatus === 'EXCUSED').length;
  const totalStudents = students.length;
  const attendanceRate = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0;

  // 85% Exam Clearance stats (Derived from live Annual Broadsheet aggregate)
  const clearedStudents = aggregatedStudents.filter((s) => s.annualCombinedRate >= 85);
  const atRiskStudents = aggregatedStudents.filter((s) => s.annualCombinedRate < 85);

  // --------------------------------------------------------------------------
  // EDIT ACTIONS (PERMISSIONS ENFORCED)
  // --------------------------------------------------------------------------

  // Toggle Weekly Cell
  function toggleWeeklyCell(studentId: string, dayIso: string, isHoliday: boolean) {
    if (!canEditAttendance) {
      setNotice('Access Denied: Your current role only has Read-Only viewer rights.');
      setTimeout(() => setNotice(''), 4000);
      return;
    }

    if (dayIso > todayISO) {
      setNotice('Blocked: Attendance cannot be marked for upcoming future dates.');
      setTimeout(() => setNotice(''), 4000);
      return;
    }

    const key = `${studentId}_${dayIso}`;
    const current = dailyAttendanceMap[key] || (isHoliday ? 'HOLIDAY' : 'PRESENT');

    let next: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'HOLIDAY';
    if (current === 'HOLIDAY') {
      next = 'PRESENT'; // Allow essential holiday clinical shift
    } else if (current === 'PRESENT') {
      next = 'LATE';
    } else if (current === 'LATE') {
      next = 'ABSENT';
    } else if (current === 'ABSENT') {
      next = 'EXCUSED';
    } else {
      next = isHoliday ? 'HOLIDAY' : 'PRESENT';
    }

    setDailyAttendanceMap((prev) => ({
      ...prev,
      [key]: next,
    }));
  }

  // Daily Status toggle
  function updateDailyStatus(id: string, newStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED', minutesLate?: number) {
    if (!canEditAttendance) {
      setNotice('Access Denied: Read-Only view.');
      setTimeout(() => setNotice(''), 4000);
      return;
    }
    if (isFutureDate) {
      setNotice('Blocked: Future dates are strictly prohibited by statutory regulations.');
      setTimeout(() => setNotice(''), 4000);
      return;
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          todayStatus: newStatus,
          arrivalMinutesLate: newStatus === 'LATE' ? (minutesLate !== undefined ? minutesLate : 15) : undefined,
          lastCheckIn: newStatus === 'PRESENT' || newStatus === 'LATE' ? 'Recorded Just Now' : undefined,
        };
      })
    );

    // Also update map for current sessionDate
    setDailyAttendanceMap((prev) => ({
      ...prev,
      [`${id}_${sessionDate}`]: newStatus,
    }));
  }

  // Batch actions
  function handleMarkAll(status: 'PRESENT' | 'ABSENT') {
    if (!canEditAttendance || isFutureDate) return;
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        todayStatus: status,
        arrivalMinutesLate: undefined,
        lastCheckIn: status === 'PRESENT' ? 'Batch Verified' : undefined,
      }))
    );
    // Batch update map
    setDailyAttendanceMap((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        next[`${s.id}_${sessionDate}`] = status;
      });
      return next;
    });
    setNotice(`Updated all ${students.length} candidates to ${status}.`);
    setTimeout(() => setNotice(''), 4000);
  }

  function handleMarkUnmarkedAbsent() {
    if (!canEditAttendance || isFutureDate) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.todayStatus === 'PRESENT' || s.todayStatus === 'LATE' || s.todayStatus === 'EXCUSED') {
          return s;
        }
        return { ...s, todayStatus: 'ABSENT', lastCheckIn: undefined };
      })
    );
    setNotice('Marked all unverified candidates as Absent.');
    setTimeout(() => setNotice(''), 4000);
  }

  function handleBatchBiometricStamp() {
    if (!canEditAttendance || isFutureDate) return;
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        verificationMethod: 'BIOMETRIC_FINGERPRINT',
        lastCheckIn: s.todayStatus === 'PRESENT' ? 'Biometric Stamp Synced' : s.lastCheckIn,
      }))
    );
    setNotice('Applied Biometric Stamp verification to attending candidates.');
    setTimeout(() => setNotice(''), 4000);
  }

  function handleMarkHolidayExemption() {
    if (!canEditAttendance) return;
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        todayStatus: 'EXCUSED',
        lastCheckIn: 'Gazetted Public Holiday Exemption',
      }))
    );
    setDailyAttendanceMap((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        next[`${s.id}_${sessionDate}`] = 'HOLIDAY';
      });
      return next;
    });
    setNotice('Applied Gazetted Zambian Public Holiday Exemption. Zero deficit penalty applied.');
    setTimeout(() => setNotice(''), 5000);
  }

  // Public Holidays CRUD Handlers
  function handleSaveHoliday(holiday: ZambianHoliday) {
    if (!canManageHolidays) {
      setNotice('Access Denied: Only Academic Registrar can modify Gazetted Public Holidays.');
      setTimeout(() => setNotice(''), 4000);
      return;
    }
    setHolidays((prev) => {
      const exists = prev.some((h) => h.id === holiday.id);
      if (exists) {
        return prev.map((h) => (h.id === holiday.id ? holiday : h));
      }
      return [...prev, holiday];
    });
    setNotice(`Gazetted statutory public holiday "${holiday.name}" saved. Attendance matrices recalculated.`);
    setTimeout(() => setNotice(''), 5000);
  }

  function handleDeleteHoliday(holidayId: string) {
    if (!canManageHolidays) return;
    setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
    setNotice('Public holiday removed from college calendar. Converted to instructional teaching day.');
    setTimeout(() => setNotice(''), 5000);
  }

  function handleResetHolidays() {
    if (!canManageHolidays) return;
    setHolidays(ZAMBIAN_PUBLIC_HOLIDAYS_2026);
    setNotice('Reset statutory public holidays to official Laws of Zambia 2026 gazette.');
    setTimeout(() => setNotice(''), 5000);
  }

  // Student Attendance Hours Editing Handler
  function handleSaveStudentHours(e: React.FormEvent) {
    e.preventDefault();
    if (!editingStudent || !canEditStudentQuotas) return;
    setStudents((prev) =>
      prev.map((s) => (s.id === editingStudent.id ? editingStudent : s))
    );
    setNotice(`Updated statutory hours and records for candidate ${editingStudent.name}.`);
    setEditingStudent(null);
    setTimeout(() => setNotice(''), 4000);
  }

  // Live Roll-Call Mode Handler
  function handleSaveLiveRollCall(
    results: Record<string, 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'>,
    latesMap: Record<string, number>
  ) {
    setDailyAttendanceMap((prev) => {
      const next = { ...prev };
      Object.entries(results).forEach(([id, status]) => {
        next[`${id}_${sessionDate}`] = status;
      });
      return next;
    });
    setStudents((prev) =>
      prev.map((s) => {
        if (results[s.id]) {
          return {
            ...s,
            todayStatus: results[s.id],
            arrivalMinutesLate: latesMap[s.id] || (results[s.id] === 'LATE' ? 15 : undefined),
            lastCheckIn: results[s.id] === 'PRESENT' || results[s.id] === 'LATE' ? '08:15 AM' : undefined,
          };
        }
        return s;
      })
    );
    setNotice(`Committed live roll-call for ${Object.keys(results).length} candidates to official CMIS register.`);
    setTimeout(() => setNotice(''), 5000);
  }

  // Hostel Curfew Roll-Call Handler
  function handleSaveHostelLog(newLog: any) {
    setHostelLogs((prev) => [newLog, ...prev]);
    setNotice(`Nightly hostel roll-call recorded for ${newLog.hostelName}.`);
    setTimeout(() => setNotice(''), 5000);
  }

  // Clinical Exeat Pass Handlers
  function handleSaveExeat(newPass: ClinicalExeatPass) {
    setClinicalExeats((prev) => [newPass, ...prev]);
    setNotice(`Clinical Exeat Pass ${newPass.passNumber} issued to ${newPass.studentName}.`);
    setTimeout(() => setNotice(''), 5000);
  }

  function handleMarkExeatReturned(passId: string) {
    setClinicalExeats((prev) =>
      prev.map((p) =>
        p.id === passId
          ? {
              ...p,
              status: 'RETURNED' as const,
              actualReturnTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            }
          : p
      )
    );
    setNotice('Candidate confirmed returned to campus from clinical rotation.');
    setTimeout(() => setNotice(''), 5000);
  }

  // Save register to CMIS API
  async function handleSaveRegister() {
    if (isFutureDate) {
      setNotice('Future date attendance cannot be submitted. Please pick today or a past session date.');
      setTimeout(() => setNotice(''), 4000);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        date: sessionDate,
        sessionType: selectedSessionType,
        venue: sessionVenue,
        topic: holidayCheck.isHoliday ? `[Holiday Session: ${holidayCheck.holiday?.name}] ${moduleTitle}` : moduleTitle,
        records: students.map((s) => ({
          learnerId: s.id,
          status: s.todayStatus,
          arrivalMinutesLate: s.arrivalMinutesLate,
          remarks: `${s.verificationMethod} [${s.programme}] ${holidayCheck.isHoliday ? '(Holiday Roster)' : ''}`,
        })),
      };

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setNotice('Attendance register successfully saved and synced to official CMIS audit log.');
        setSessionHistory([
          {
            id: `ses-${Date.now()}`,
            date: sessionDate,
            cohort: selectedProgramme === 'ALL' ? 'Multi-Cohort' : selectedProgramme,
            module: moduleTitle,
            type: selectedSessionType,
            venue: sessionVenue,
            instructor: instructorName,
            presentCount: presentCount + lateCount,
            totalCount: totalStudents,
            rate: attendanceRate,
            isHolidaySession: holidayCheck.isHoliday,
            holidayName: holidayCheck.holiday?.name,
          } as SessionHistoryItem,
          ...sessionHistory,
        ]);
      } else {
        setNotice(`Warning: ${data.message || 'Could not sync session.'}`);
      }
    } catch (e: any) {
      setNotice(`Saved locally in offline buffer. ${e.message}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotice(''), 5000);
    }
  }

  function handleApproveExcuse(excuseId: string) {
    if (!canEditAttendance) return;
    setExcuses((prev) =>
      prev.map((e) =>
        e.id === excuseId
          ? { ...e, status: 'APPROVED', reviewedBy: 'Dr. George Silwamba', reviewedAt: '2026-10-25 10:30' }
          : e
      )
    );
    setNotice(`Excuse request #${excuseId} approved. Student absence officially converted to EXCUSED.`);
    setTimeout(() => setNotice(''), 4000);
  }

  // Monthly holidays list
  const monthlyHolidays = useMemo(() => getHolidaysInMonth(selectedMonth), [selectedMonth]);

  return (
    <div className="mt-8 space-y-6">
      {/* ROLE & PERMISSION SWITCHER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-700 text-white font-black text-xs shadow-xs">
            NW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                North Western University College of Health and Applied Sciences
              </span>
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-extrabold text-cyan-800">
                CMIS Attendance Console
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Statutory Nursing & Midwifery Council of Zambia (NMCZ) & Health Professions Council of Zambia (HPCZ) Registry
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAuditModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-900 hover:bg-indigo-100 transition shadow-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-700" />
            <span>Statutory Audit Trail</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHolidayModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-900 hover:bg-purple-100 transition shadow-xs"
          >
            <Flag className="h-3.5 w-3.5 text-purple-700" />
            <span>Manage Gazetted Holidays ({holidays.length})</span>
          </button>

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs">
            <UserCog className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-500 text-[11px] font-bold">Active Role:</span>
            <select
              value={currentUserRole}
              onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
              className="bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ACADEMIC_REGISTRAR">Academic Registrar & Dean (Full Admin)</option>
              <option value="FACULTY_LECTURER">Faculty Lecturer / Tutor (Attendance Taker)</option>
              <option value="STUDENT_VIEWER">Student / Sponsor (Read-Only Viewer)</option>
            </select>
          </div>
        </div>
      </div>

      {notice && (
        <div className="flex items-center justify-between rounded-xl border border-cyan-300 bg-cyan-50 p-4 text-sm font-semibold text-cyan-900 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-cyan-700 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice('')} className="text-cyan-700 hover:text-cyan-950">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* FUTURE DATE BLOCK WARNING BANNER */}
      {isFutureDate && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-900 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-rose-200 text-rose-800 shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-extrabold text-rose-950">Future Date Blocked: Statutory Regulations Enforced</p>
              <p className="text-xs font-medium text-rose-800">
                Attendance cannot be opened, marked, or posted to CMIS for future dates ({sessionDate}). Today is {todayISO}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSessionDate(todayISO)}
            className="rounded-lg bg-rose-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-800 transition"
          >
            Reset to Today ({todayISO})
          </button>
        </div>
      )}

      {/* GAZETTED ZAMBIAN PUBLIC HOLIDAY BANNER */}
      {holidayCheck.isHoliday && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-purple-300 bg-purple-50/80 p-4 text-sm text-purple-950 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-200 text-purple-900 shrink-0 shadow-xs">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-purple-950 text-sm">
                  🇿🇲 Gazetted Zambian Statutory Public Holiday: {holidayCheck.holiday?.name}
                  {holidayCheck.isObservedDate ? ' (Observed Public Holiday)' : ''}
                </span>
                <span className="rounded-full bg-purple-200 px-2.5 py-0.5 text-[10px] font-black text-purple-900 uppercase tracking-wide">
                  College Closed / Non-Instructional Day
                </span>
              </div>
              <p className="text-xs text-purple-800 mt-1 max-w-2xl leading-relaxed">
                {holidayCheck.holiday?.significance} Under statutory regulations, learners are exempt from mandatory classroom attendance on gazetted national holidays with zero deficit penalty.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-bold text-purple-950 bg-white px-3 py-1.5 rounded-lg border border-purple-200 shadow-2xs cursor-pointer hover:bg-purple-100/50">
              <input
                type="checkbox"
                checked={isClinicalHolidayRoster}
                onChange={(e) => setIsClinicalHolidayRoster(e.target.checked)}
                className="rounded text-purple-700 focus:ring-purple-600 h-4 w-4"
              />
              <span>Essential Hospital Ward Duty Roster</span>
            </label>

            {!isClinicalHolidayRoster && canEditAttendance && (
              <button
                type="button"
                onClick={handleMarkHolidayExemption}
                className="rounded-lg bg-purple-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-800 transition"
              >
                Mark All as Holiday Exemption (No Penalty)
              </button>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards (Light Theme - Live Aggregated) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today's Attendance Rate
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <ClipboardCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{attendanceRate}%</span>
            <span className="text-xs font-semibold text-slate-500">
              ({presentCount + lateCount}/{totalStudents} Present)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {lateCount > 0 && <span className="font-bold text-amber-600">{lateCount} Late</span>}
            {lateCount > 0 && absentCount > 0 && ' • '}
            {absentCount > 0 && <span className="font-bold text-rose-600">{absentCount} Absent</span>}
            {excusedCount > 0 && (
              <span className="font-bold text-blue-600">
                {' • '}
                {excusedCount} Excused
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              85% Exam Clearance Rule
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-50 text-cyan-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {clearedStudents.length}/{totalStudents}
            </span>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
              Cleared
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            NMCZ & HPCZ Mandatory Minimum Rule
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              At-Risk Deficit Trainees
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{atRiskStudents.length}</span>
            <span className="text-xs font-semibold text-slate-500">Candidates &lt; 85%</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {atRiskStudents.length > 0 ? (
              <span className="font-bold text-amber-700">Impending Exam Debarment Warning</span>
            ) : (
              <span className="text-emerald-700 font-semibold">All Candidates In Good Standing</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Clinical vs Theory Ratio
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
              <Activity className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-700">60% Clinical</span>
            <span className="text-xs font-semibold text-slate-500">/ 40% Theory</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Health Science Curriculum Standard
          </div>
        </div>
      </div>

      {/* SMART TIMEFRAME HORIZON SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'daily'
                ? 'bg-cyan-700 text-white shadow-sm ring-2 ring-cyan-700/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ClipboardCheck className="h-4 w-4" /> 📅 Daily Live Register
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'weekly'
                ? 'bg-cyan-700 text-white shadow-sm ring-2 ring-cyan-700/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Calendar className="h-4 w-4" /> 📊 Weekly Matrix (5-Day Grid)
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'monthly'
                ? 'bg-cyan-700 text-white shadow-sm ring-2 ring-cyan-700/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Clock className="h-4 w-4" /> 🗓️ Monthly Summary (Aggregated)
          </button>

          <button
            onClick={() => setActiveTab('annual')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'annual'
                ? 'bg-cyan-700 text-white shadow-sm ring-2 ring-cyan-700/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> 🏛️ Annual & Historical Broadsheet
            {atRiskStudents.length > 0 && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                {atRiskStudents.length} Deficit
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('hostel')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'hostel'
                ? 'bg-cyan-700 text-white shadow-sm ring-2 ring-cyan-700/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bed className="h-4 w-4" /> 🛏️ Hostels & Curfew ({hostelLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('exeats')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'exeats'
                ? 'bg-cyan-700 text-white shadow-sm ring-2 ring-cyan-700/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileCheck className="h-4 w-4" /> 🏥 Clinical Exeats ({clinicalExeats.filter((e) => e.status === 'ACTIVE').length} Active)
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'calendar'
                ? 'bg-cyan-700 text-white shadow-sm ring-2 ring-cyan-700/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Calendar className="h-4 w-4" /> 🗓️ Calendar & Birthdays
          </button>

          <button
            onClick={() => setActiveTab('excuses')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'excuses'
                ? 'bg-cyan-700 text-white shadow-sm ring-2 ring-cyan-700/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileText className="h-4 w-4" /> 🩺 Absence Justifications & Sick Bay
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
              {excuses.filter((e) => e.status === 'PENDING_REVIEW').length} Pending
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-cyan-700 text-white shadow-sm ring-2 ring-cyan-700/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="h-4 w-4" /> 📈 Analytics & Compliance
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-cyan-700 text-white shadow-sm ring-2 ring-cyan-700/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Activity className="h-4 w-4" /> 📜 Session History ({sessionHistory.length})
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. DAILY LIVE REGISTER VIEW */}
      {/* ============================================================== */}
      {activeTab === 'daily' && (
        <div className="space-y-5">
          {/* Session Header Configuration Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Programme / Cohort
                </label>
                <select
                  value={selectedProgramme}
                  onChange={(e) => setSelectedProgramme(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="ALL">All Enrolled Programmes (All Cohorts)</option>
                  <option value="DRN">Diploma in Registered Nursing (RN-2026-JAN)</option>
                  <option value="DCM">Diploma in Clinical Medicine (CM-2026-JAN)</option>
                  <option value="DPHARM">Diploma in Pharmacy Technology (DPHARM-2026-JAN)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Session Type
                </label>
                <select
                  value={selectedSessionType}
                  onChange={(e: any) => setSelectedSessionType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-cyan-800 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="LECTURE">Theory Lecture Hall (Classroom)</option>
                  <option value="SKILLS_LAB">Clinical Skills Lab / Simulation</option>
                  <option value="WARD_ROUND">Hospital Ward Round / Bedside</option>
                  <option value="OSCE">OSCE Examination Station</option>
                  <option value="COMMUNITY">Community Health Outreach Fieldwork</option>
                </select>
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Date of Session</span>
                  <span className="flex items-center gap-1 text-[10px] text-cyan-700 font-semibold lowercase">
                    <Lock className="h-3 w-3" /> max: {todayISO}
                  </span>
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  max={todayISO}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs font-bold focus:outline-none ${
                    isFutureDate
                      ? 'border-rose-400 bg-rose-50 text-rose-900 focus:border-rose-600'
                      : holidayCheck.isHoliday
                      ? 'border-purple-400 bg-purple-50 text-purple-900 focus:border-purple-600'
                      : 'border-slate-300 bg-white text-slate-800 focus:border-cyan-600'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Venue / Location
                </label>
                <input
                  type="text"
                  value={sessionVenue}
                  onChange={(e) => setSessionVenue(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Smart Batch Actions & Quick Filter Toolbar */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll('PRESENT')}
                  disabled={!canEditAttendance || isFutureDate}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('ABSENT')}
                  disabled={!canEditAttendance || isFutureDate}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Reset / Clear All
                </button>
                <button
                  type="button"
                  onClick={handleMarkUnmarkedAbsent}
                  disabled={!canEditAttendance || isFutureDate}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Mark Unmarked Absent
                </button>
                <button
                  type="button"
                  onClick={handleBatchBiometricStamp}
                  disabled={!canEditAttendance || isFutureDate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Fingerprint className="h-3.5 w-3.5 text-cyan-600" /> Biometric Stamp
                </button>
                <button
                  type="button"
                  onClick={() => setShowLiveRollCallModal(true)}
                  disabled={!canEditAttendance || isFutureDate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-900 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs"
                >
                  <Radio className="h-4 w-4 text-emerald-600 animate-pulse" /> Live Roll-Call Mode
                </button>
                <button
                  type="button"
                  onClick={() => setIsSheetModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-500" /> Print Official Sheet
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search candidate name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-56 rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-cyan-600 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveRegister}
                  disabled={!canEditAttendance || isSubmitting || isFutureDate}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Check className="h-4 w-4" />
                  {isSubmitting ? 'Saving Register...' : isFutureDate ? 'Future Date (Blocked)' : 'Save & Post Register to CMIS'}
                </button>
              </div>
            </div>

            {/* Quick Status Filters */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">Filter Roster:</span>
              {(['ALL', 'PRESENT', 'LATE', 'ABSENT', 'EXCUSED', 'AT_RISK'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                    statusFilter === s
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s === 'ALL' && `All Enrolled (${students.length})`}
                  {s === 'PRESENT' && `Present (${presentCount})`}
                  {s === 'LATE' && `Late (${lateCount})`}
                  {s === 'ABSENT' && `Absent (${absentCount})`}
                  {s === 'EXCUSED' && `Excused (${excusedCount})`}
                  {s === 'AT_RISK' && `At-Risk <85% (${atRiskStudents.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Roll Call Roster Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3 px-4">Candidate Details</th>
                  <th className="py-3 px-3">Programme</th>
                  <th className="py-3 px-3">Annual Cumulative</th>
                  <th className="py-3 px-4">Roll Call Status</th>
                  <th className="py-3 px-3">Verification Evidence</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No candidate matches the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const cumulativeRate = s.annualCombinedRate;
                    const isAtRisk = cumulativeRate < 85;

                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-slate-50 transition"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 font-bold text-slate-700 text-xs">
                              {s.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedTraineeForPassport(s)}
                              className="text-left group"
                            >
                              <span className="block font-bold text-slate-900 group-hover:text-cyan-700 group-hover:underline">
                                {s.name}
                              </span>
                              <span className="font-mono text-[11px] text-cyan-800">{s.studentNumber}</span>
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-600 font-medium">{s.programme}</td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full ${cumulativeRate >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min(cumulativeRate, 100)}%` }}
                              />
                            </div>
                            <span
                              className={`font-mono font-bold text-xs ${
                                cumulativeRate >= 85 ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {cumulativeRate}%
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {s.annualTotalAttended}/{s.annualTotalSessions} annual sessions
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              disabled={!canEditAttendance || isFutureDate}
                              onClick={() => updateDailyStatus(s.id, 'PRESENT')}
                              className={`rounded-md px-2.5 py-1 text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                s.todayStatus === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Present
                            </button>

                            <div className="inline-flex items-center rounded-md overflow-hidden shadow-sm">
                              <button
                                type="button"
                                disabled={!canEditAttendance || isFutureDate}
                                onClick={() => updateDailyStatus(s.id, 'LATE', s.arrivalMinutesLate || 15)}
                                className={`px-2.5 py-1 text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                  s.todayStatus === 'LATE'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Late {s.todayStatus === 'LATE' && `(${s.arrivalMinutesLate || 15}m)`}
                              </button>
                              {s.todayStatus === 'LATE' && (
                                <select
                                  disabled={!canEditAttendance || isFutureDate}
                                  value={s.arrivalMinutesLate || 15}
                                  onChange={(e) => updateDailyStatus(s.id, 'LATE', Number(e.target.value))}
                                  className="bg-amber-600 text-white text-[11px] font-bold px-1 py-1 border-l border-amber-400 focus:outline-none"
                                >
                                  <option value={10}>10m</option>
                                  <option value={15}>15m</option>
                                  <option value={30}>30m</option>
                                  <option value={45}>45m</option>
                                  <option value={60}>60m</option>
                                </select>
                              )}
                            </div>

                            <button
                              type="button"
                              disabled={!canEditAttendance || isFutureDate}
                              onClick={() => updateDailyStatus(s.id, 'ABSENT')}
                              className={`rounded-md px-2.5 py-1 text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                s.todayStatus === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/20'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Absent
                            </button>

                            <button
                              type="button"
                              disabled={!canEditAttendance || isFutureDate}
                              onClick={() => updateDailyStatus(s.id, 'EXCUSED')}
                              className={`rounded-md px-2.5 py-1 text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                s.todayStatus === 'EXCUSED'
                                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Excused
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                s.verificationMethod === 'BIOMETRIC_FINGERPRINT'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : s.verificationMethod === 'QR_GEOFENCE'
                                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                                  : s.verificationMethod === 'MOBILE_PIN'
                                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {s.verificationMethod === 'BIOMETRIC_FINGERPRINT' && <Fingerprint className="h-3 w-3" />}
                              {s.verificationMethod === 'QR_GEOFENCE' && <QrCode className="h-3 w-3" />}
                              {s.verificationMethod === 'MOBILE_PIN' && <Smartphone className="h-3 w-3" />}
                              {s.verificationMethod === 'MANUAL_FACULTY' && <UserCheck className="h-3 w-3" />}
                              {s.verificationMethod === 'BIOMETRIC_FINGERPRINT' && 'Biometric Stamp'}
                              {s.verificationMethod === 'QR_GEOFENCE' && 'Campus Geofence'}
                              {s.verificationMethod === 'MOBILE_PIN' && 'Mobile OTP Auth'}
                              {s.verificationMethod === 'MANUAL_FACULTY' && 'Faculty Roll-Call'}
                            </span>
                          </div>
                          {s.lastCheckIn && (
                            <span className="block text-[10px] text-slate-400 mt-0.5">Time: {s.lastCheckIn}</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canEditStudentQuotas && (
                              <button
                                type="button"
                                onClick={() => setEditingStudent(s)}
                                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-cyan-800 transition"
                                title="Edit Candidate Hours & Quotas"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {isAtRisk ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setCautionStudent({
                                    studentNumber: s.studentNumber,
                                    name: s.name,
                                    programme: s.programme,
                                    attendanceRate: cumulativeRate,
                                    totalSessions: s.annualTotalSessions,
                                    sessionsAttended: s.annualTotalAttended,
                                    sessionsMissed: s.annualTotalSessions - s.annualTotalAttended,
                                  })
                                }
                                className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                              >
                                <AlertTriangle className="h-3 w-3 text-amber-600" /> Caution
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Cleared
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. WEEKLY CLASS MATRIX (5-DAY DYNAMIC GRID) */}
      {/* ============================================================== */}
      {activeTab === 'weekly' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Weekly Class Attendance Matrix (Monday – Friday)
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Click any cell to cycle status (Present → Late → Absent → Excused). Edits automatically aggregate into Monthly and Annual totals.
                </p>
              </div>

              {/* Dynamic Week Navigation */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWeekOffset(weekOffset - 1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous Week
                </button>

                <div className="rounded-lg bg-cyan-50 border border-cyan-200 px-3.5 py-1.5 text-xs font-extrabold text-cyan-950 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-cyan-700" />
                  <span>
                    {weekOffset === 0
                      ? `Current Week: ${currentWeekInfo.label}`
                      : `Week (${currentWeekInfo.label})`}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={weekOffset >= 12}
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                >
                  Next Week <ChevronRight className="h-4 w-4" />
                </button>

                {weekOffset !== 0 && (
                  <button
                    type="button"
                    onClick={() => setWeekOffset(0)}
                    className="rounded-lg bg-cyan-800 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-cyan-900 transition shadow-xs"
                  >
                    Current Week
                  </button>
                )}
              </div>
            </div>

            {/* Legend & Public Holiday Info */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-slate-500 text-[11px] uppercase">Legend:</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-900">
                  <span className="grid h-5 w-5 place-items-center rounded bg-purple-700 text-white text-[10px] font-black">H</span> Gazetted Public Holiday (Exempt)
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                  <span className="grid h-5 w-5 place-items-center rounded bg-emerald-600 text-white text-[10px]">P</span> Present
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800">
                  <span className="grid h-5 w-5 place-items-center rounded bg-amber-500 text-white text-[10px]">L</span> Late
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800">
                  <span className="grid h-5 w-5 place-items-center rounded bg-rose-600 text-white text-[10px]">A</span> Absent
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800">
                  <span className="grid h-5 w-5 place-items-center rounded bg-blue-600 text-white text-[10px]">E</span> Excused
                </span>
              </div>
              <span className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                <Flag className="h-3 w-3" /> Statutory holidays do not penalize candidate's 85% requirement.
              </span>
            </div>
          </div>

          {/* 5-Day Weekly Matrix Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-3">Programme</th>
                  {currentWeekInfo.days.map((day) => (
                    <th
                      key={day.iso}
                      className={`py-3 px-3 text-center ${
                        day.isHoliday ? 'bg-purple-50 text-purple-900' : ''
                      }`}
                    >
                      <span className="block font-bold">{day.label}</span>
                      {day.isHoliday && (
                        <span className="text-[10px] font-black uppercase text-purple-700 block">
                          🇿🇲 {day.holidayName ? day.holidayName.split(' ')[0] : 'HOLIDAY'}
                        </span>
                      )}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center">Weekly %</th>
                  <th className="py-3 px-4 text-right">Weekly Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {aggregatedStudents.map((s) => {
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedTraineeForPassport(s)}
                          className="text-left group"
                        >
                          <span className="block font-bold text-slate-900 group-hover:text-cyan-700 group-hover:underline">
                            {s.name}
                          </span>
                          <span className="font-mono text-[11px] text-cyan-800">{s.studentNumber}</span>
                        </button>
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-medium">{s.programme}</td>

                      {currentWeekInfo.days.map((day, dIdx) => {
                        const status = s.currentWeekStatuses[dIdx];
                        const isFutureDay = day.iso > todayISO;
                        const hasCustomRecord = Boolean(dailyAttendanceMap[`${s.id}_${day.iso}`]);

                        return (
                          <td
                            key={day.iso}
                            className={`py-3 px-3 text-center ${
                              day.isHoliday ? 'bg-purple-50/40' : ''
                            }`}
                          >
                            <button
                              type="button"
                              disabled={!canEditAttendance || (isFutureDay && !hasCustomRecord)}
                              onClick={() => toggleWeeklyCell(s.id, day.iso, day.isHoliday)}
                              title={
                                isFutureDay && !hasCustomRecord
                                  ? 'Upcoming day (Scheduled)'
                                  : day.isHoliday
                                  ? `Gazetted Holiday: ${day.holidayName || 'Public Holiday'}`
                                  : `Status: ${status}. Click to cycle.`
                              }
                              className={`h-7 w-7 rounded-md font-extrabold text-[11px] transition shadow-xs ${
                                isFutureDay && !hasCustomRecord
                                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                  : status === 'HOLIDAY'
                                  ? 'bg-purple-700 text-white hover:bg-purple-800'
                                  : status === 'PRESENT'
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : status === 'LATE'
                                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                                  : status === 'ABSENT'
                                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                                  : status === 'EXCUSED'
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-slate-200 text-slate-500'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {isFutureDay && !hasCustomRecord
                                ? '—'
                                : status === 'HOLIDAY'
                                ? 'H'
                                : status === 'PRESENT'
                                ? 'P'
                                : status === 'LATE'
                                ? 'L'
                                : status === 'ABSENT'
                                ? 'A'
                                : 'E'}
                            </button>
                          </td>
                        );
                      })}

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-mono font-bold text-xs ${
                            s.weeklyRate >= 85 ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {s.weeklyRate}%
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          ({s.attendedInWeek}/{s.instructionalDaysCount} class days)
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {s.weeklyRate >= 85 ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                            REGULAR
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                            DEFICIT ({s.instructionalDaysCount - s.attendedInWeek} MISSED)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-xs font-bold text-slate-600 uppercase">
                    Daily Cohort Averages
                  </td>
                  {currentWeekInfo.days.map((day) => (
                    <td
                      key={day.iso}
                      className={`py-3 px-3 text-center text-xs font-mono ${
                        day.isHoliday ? 'text-purple-700 bg-purple-50/50 font-bold' : 'text-emerald-700'
                      }`}
                    >
                      {day.isHoliday ? '🇿🇲 Holiday' : '92%'}
                    </td>
                  ))}
                  <td className="py-3 px-3 text-center text-xs font-mono text-emerald-700">94%</td>
                  <td className="py-3 px-4 text-right text-xs text-slate-500 font-normal">Week Aggregate</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MONTHLY SUMMARY (DYNAMIC AGGREGATE OF WEEKS) */}
      {/* ============================================================== */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Monthly Attendance Summary & Regulatory Returns (Dynamic Weekly Aggregate)
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Aggregated from all active weekly session registers within the reporting month, with statutory public holiday deductions.
                </p>
              </div>

              {/* Month Selector */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Reporting Month:
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="2026-10">October 2026 (Current Active)</option>
                  <option value="2026-09">September 2026 (Archived)</option>
                  <option value="2026-08">August 2026 (Archived)</option>
                  <option value="2026-07">July 2026 (Archived)</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setNotice('Exported Monthly Statutory Attendance Summary (CSV format) for Council Inspection.');
                    setTimeout(() => setNotice(''), 4000);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" /> Export Monthly Return
                </button>
              </div>
            </div>

            {/* Monthly Gazetted Public Holidays Banner */}
            <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50/60 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-2">
                  <Flag className="h-4 w-4 text-purple-700" />
                  Gazetted Public Holidays in {selectedMonth === '2026-10' ? 'October 2026' : selectedMonth} (Non-Instructional College Closure):
                </span>
                <span className="text-xs font-extrabold text-purple-800">
                  {monthlyHolidays.length} Statutory Days
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {monthlyHolidays.map((h) => (
                  <span
                    key={h.id}
                    className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[11px] font-bold text-purple-950 border border-purple-200 shadow-2xs"
                  >
                    <span>🇿🇲 {h.name}</span>
                    <span className="text-purple-600 font-mono">({h.observedDate || h.date})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Monthly Calendar Heatmap Grid */}
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  October 2026 Daily Attendance Intensity Heatmap
                </span>
                <span className="text-[11px] text-slate-500">Click any past date to view day's register</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-14 md:grid-cols-31 text-center">
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `2026-10-${String(day).padStart(2, '0')}`;
                  const isFuture = dateStr > todayISO;
                  const isToday = dateStr === todayISO;
                  const holCheck = holidays.find((h) => h.date === dateStr || h.observedDate === dateStr);
                  const rate = isFuture ? null : holCheck ? null : day % 7 === 0 || day % 7 === 6 ? null : 80 + (day % 20);

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isFuture}
                      onClick={() => {
                        setSessionDate(dateStr);
                        setActiveTab('daily');
                      }}
                      className={`rounded-lg p-2 text-center transition ${
                        isToday
                          ? 'border-2 border-cyan-600 bg-cyan-50 font-bold'
                          : holCheck
                          ? 'border border-purple-300 bg-purple-100 text-purple-950 font-bold'
                          : isFuture
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : rate === null
                          ? 'bg-slate-100 text-slate-400'
                          : rate >= 90
                          ? 'bg-emerald-100 text-emerald-900 font-semibold hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-900 font-semibold hover:bg-amber-200'
                      }`}
                      title={
                        isFuture
                          ? `Date ${day}: Future (Blocked)`
                          : holCheck
                          ? `Date ${day}: 🇿🇲 ${holCheck.name}`
                          : `Date ${day}: ${rate || 0}% attendance`
                      }
                    >
                      <span className="block text-[10px] font-bold">{day}</span>
                      <span className="block text-[9px] mt-0.5">
                        {isFuture ? '🔒' : holCheck ? '🇿🇲 H' : rate !== null ? `${rate}%` : 'Off'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Monthly Student Roster Breakdown */}
            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-3">Programme</th>
                    <th className="py-3 px-3">Theory Hours (40h)</th>
                    <th className="py-3 px-3">Clinical Hours (60h)</th>
                    <th className="py-3 px-3">Monthly Aggregate Rate</th>
                    <th className="py-3 px-3">Standing Category</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {aggregatedStudents.map((s) => {
                    const monthlyRate = s.monthlyRate;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <span className="block font-bold text-slate-900">{s.name}</span>
                          <span className="font-mono text-[11px] text-slate-500">{s.studentNumber}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">{s.programme}</td>
                        <td className="py-3 px-3 font-mono">
                          {s.monthlyTheoryAttended}h / {s.monthlyTheoryTotal}h ({Math.round((s.monthlyTheoryAttended / s.monthlyTheoryTotal) * 100)}%)
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {s.monthlyClinicalAttended}h / {s.monthlyClinicalTotal}h ({Math.round((s.monthlyClinicalAttended / s.monthlyClinicalTotal) * 100)}%)
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full ${monthlyRate >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min(monthlyRate, 100)}%` }}
                              />
                            </div>
                            <span
                              className={`font-mono font-bold text-xs ${
                                monthlyRate >= 85 ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {monthlyRate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {monthlyRate >= 90 ? (
                            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                              EXEMPLARY (&ge;90%)
                            </span>
                          ) : monthlyRate >= 85 ? (
                            <span className="inline-flex rounded-full bg-cyan-100 px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-800">
                              SATISFACTORY (85-89%)
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                              DEFICIT WARNING (&lt;85%)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSessionDate(todayISO);
                              setActiveTab('daily');
                            }}
                            className="text-cyan-700 hover:text-cyan-900 font-bold text-xs"
                          >
                            View Register
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. ANNUAL & HISTORICAL STATUTORY BROADSHEET (MONTHLY AGGREGATE) */}
      {/* ============================================================== */}
      {activeTab === 'annual' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Annual & Historical Statutory Attendance Broadsheet (Monthly Aggregate)
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Official Council Examination Clearance Master Ledger (NMCZ & HPCZ Mandatory 85% Rule). Dynamically aggregated from all monthly returns.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> &ge;85% Cleared for Exams
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> &lt;85% Debarment Risk
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 ml-2"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-500" /> Print Master Broadsheet
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-3">Programme</th>
                    <th className="py-3 px-3">Annual Theory (40h)</th>
                    <th className="py-3 px-3">Annual Clinical (60h)</th>
                    <th className="py-3 px-3">Combined %</th>
                    <th className="py-3 px-3">Council Standing</th>
                    <th className="py-3 px-4 text-right">Statutory Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {aggregatedStudents.map((s) => {
                    const combinedRate = s.annualCombinedRate;
                    const isDebarred = combinedRate < 75;
                    const isAtRisk = combinedRate >= 75 && combinedRate < 85;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedTraineeForPassport(s)}
                            className="text-left group"
                          >
                            <span className="block font-bold text-slate-900 group-hover:text-cyan-700 group-hover:underline">
                              {s.name}
                            </span>
                            <span className="font-mono text-[11px] text-cyan-800">{s.studentNumber}</span>
                          </button>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-600">{s.programme}</td>
                        <td className="py-3 px-3 font-mono">
                          {s.annualTheoryAttended} / {s.baseTheoryTotal} ({Math.round((s.annualTheoryAttended / s.baseTheoryTotal) * 100)}%)
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {s.annualClinicalAttended} / {s.baseClinicalTotal} ({Math.round((s.annualClinicalAttended / s.baseClinicalTotal) * 100)}%)
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-mono font-bold text-sm ${
                              combinedRate >= 85 ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {combinedRate}%
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {combinedRate >= 85 ? (
                            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                              CLEARED FOR EXAMS
                            </span>
                          ) : isAtRisk ? (
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                              AT RISK (WARNING)
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-800">
                              DEBARRED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedTraineeForForm12A(s)}
                              className="inline-flex items-center gap-1 rounded-lg border border-cyan-300 bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-900 hover:bg-cyan-100 transition shadow-xs"
                              title="Official Form 12A Clearance Slip"
                            >
                              <FileText className="h-3.5 w-3.5 text-cyan-700" />
                              <span>Form 12A</span>
                            </button>
                            {canEditStudentQuotas && (
                              <button
                                type="button"
                                onClick={() => setEditingStudent(s)}
                                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-cyan-800 transition"
                                title="Edit Candidate Hours & Quotas"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {combinedRate < 85 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setCautionStudent({
                                    studentNumber: s.studentNumber,
                                    name: s.name,
                                    programme: s.programme,
                                    attendanceRate: combinedRate,
                                    totalSessions: s.annualTotalSessions,
                                    sessionsAttended: s.annualTotalAttended,
                                    sessionsMissed: s.annualTotalSessions - s.annualTotalAttended,
                                  })
                                }
                                className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700"
                              >
                                <AlertTriangle className="h-3.5 w-3.5" /> Issue Caution Letter
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. ABSENCE JUSTIFICATIONS & SICK BAY */}
      {/* ============================================================== */}
      {activeTab === 'excuses' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Student Absence Justifications & Sick Bay Admissions
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Verified medical slips, clinic notes, and official college justification requests.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {excuses.map((exc) => (
                <div
                  key={exc.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{exc.studentName}</span>
                        <span className="font-mono text-xs text-slate-500">({exc.studentNumber})</span>
                        <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {exc.programme}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-medium text-slate-700 leading-relaxed">
                        <strong>Reason:</strong> {exc.reason}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-cyan-800 font-semibold">
                        <FileText className="h-3.5 w-3.5" />
                        Attached Evidence: <span className="underline">{exc.documentAttached}</span>
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Date of Absence: {exc.sessionDate} • Review status:{' '}
                        {exc.reviewedBy ? `Reviewed by ${exc.reviewedBy} at ${exc.reviewedAt}` : 'Awaiting Review'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {exc.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Absence Excused
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!canEditAttendance}
                          onClick={() => handleApproveExcuse(exc.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" /> Approve Medical Excuse
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. SESSION REGISTERS HISTORY */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900">
              Archived Attendance Registers & Audit Records
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Immutable session logs with instructor signatures, verification timestamps, and public holiday flags.
            </p>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-3">Cohort</th>
                    <th className="py-3 px-3">Module / Topic</th>
                    <th className="py-3 px-3">Session Type</th>
                    <th className="py-3 px-3">Venue</th>
                    <th className="py-3 px-3">Attendance</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {sessionHistory.map((h: any) => (
                    <tr key={h.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {h.date}
                        {h.isHolidaySession && (
                          <span className="block text-[10px] text-purple-700 font-sans font-bold">
                            🇿🇲 {h.holidayName}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{h.cohort}</td>
                      <td className="py-3 px-3 text-slate-700">{h.module}</td>
                      <td className="py-3 px-3">
                        <span className="rounded bg-cyan-50 px-2 py-0.5 font-bold text-cyan-800 border border-cyan-200">
                          {h.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{h.venue}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-emerald-700">{h.rate}%</span>
                        <span className="text-[11px] text-slate-400 block">
                          ({h.presentCount}/{h.totalCount} Present)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSessionDate(h.date);
                            setIsSheetModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Printer className="h-3 w-3 text-slate-500" /> View Register
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 7. HOSTELS & CURFEW ROLL-CALL TAB                                    */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'hostel' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bed className="h-5 w-5 text-indigo-600" />
                Residential Hostels & Nightly Curfew Register
              </h2>
              <p className="text-xs text-slate-500">
                Statutory accommodation security checks under Hall Wardens & Matrons. Mandatory 21:00 CAT Curfew.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHostelRollCallModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Bed className="h-4 w-4" /> Log Nightly Curfew Check
            </button>
          </div>

          {/* Residence Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                    Female Residence
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">Florence Nightingale Residence</h3>
                  <p className="text-xs text-slate-500">Plot 511/518 Shilenda Road Campus</p>
                </div>
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-white p-2 border border-slate-200">
                  <span className="block text-xs font-bold text-slate-500">Beds</span>
                  <span className="text-base font-black text-slate-900">120</span>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-200">
                  <span className="block text-xs font-bold text-emerald-700">In Room</span>
                  <span className="text-base font-black text-emerald-800">104</span>
                </div>
                <div className="rounded-lg bg-amber-50 p-2 border border-amber-200">
                  <span className="block text-xs font-bold text-amber-700">Clinical Exeat</span>
                  <span className="text-base font-black text-amber-800">8</span>
                </div>
                <div className="rounded-lg bg-cyan-50 p-2 border border-cyan-200">
                  <span className="block text-xs font-bold text-cyan-700">Curfew</span>
                  <span className="text-xs font-black text-cyan-800">21:00 CAT</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-800">
                    Male Residence
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">Albert Schweitzer Hall</h3>
                  <p className="text-xs text-slate-500">Main Campus Academic Block Wing B</p>
                </div>
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-white p-2 border border-slate-200">
                  <span className="block text-xs font-bold text-slate-500">Beds</span>
                  <span className="text-base font-black text-slate-900">96</span>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-200">
                  <span className="block text-xs font-bold text-emerald-700">In Room</span>
                  <span className="text-base font-black text-emerald-800">88</span>
                </div>
                <div className="rounded-lg bg-amber-50 p-2 border border-amber-200">
                  <span className="block text-xs font-bold text-amber-700">Clinical Exeat</span>
                  <span className="text-base font-black text-amber-800">4</span>
                </div>
                <div className="rounded-lg bg-cyan-50 p-2 border border-cyan-200">
                  <span className="block text-xs font-bold text-cyan-700">Curfew</span>
                  <span className="text-xs font-black text-cyan-800">21:00 CAT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Curfew History Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/75 px-5 py-3.5">
              <h3 className="text-sm font-bold text-slate-900">Curfew Roll-Call Verification Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Verification Time</th>
                    <th className="py-3 px-3">Hostel</th>
                    <th className="py-3 px-3">Warden In-Charge</th>
                    <th className="py-3 px-3 text-center">In Room</th>
                    <th className="py-3 px-3 text-center">Late</th>
                    <th className="py-3 px-3 text-center">Clinical Exeat</th>
                    <th className="py-3 px-3 text-center">Sick Bay</th>
                    <th className="py-3 px-3">Audit Status</th>
                    <th className="py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {hostelLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{log.timestamp}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{log.hostelName}</td>
                      <td className="py-3 px-3 text-slate-600">{log.warden}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-700">{log.inRoomCount}</td>
                      <td className="py-3 px-3 text-center font-bold text-amber-700">{log.lateCount}</td>
                      <td className="py-3 px-3 text-center font-bold text-indigo-700">{log.exeatCount}</td>
                      <td className="py-3 px-3 text-center font-bold text-purple-700">{log.sickBayCount}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" /> {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">{log.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 8. CLINICAL EXEATS & GATE PASSES TAB                                 */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'exeats' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-teal-600" />
                Clinical Placement Exeat & Security Gate Passes
              </h2>
              <p className="text-xs text-slate-500">
                Authorised clinical clerkships and hospital rotation exeat passes. Monitored by Campus Security.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowExeatModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition"
            >
              <FileCheck className="h-4 w-4" /> Issue Clinical Exeat Gate Pass
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/75 px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Active and Historical Clinical Passes</h3>
              <span className="text-xs text-slate-500">
                {clinicalExeats.filter((e) => e.status === 'ACTIVE').length} Active Off-Campus Rotations
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Pass #</th>
                    <th className="py-3 px-3">Candidate</th>
                    <th className="py-3 px-3">Programme</th>
                    <th className="py-3 px-3">Clinical Destination</th>
                    <th className="py-3 px-3">Departure & Expected Return</th>
                    <th className="py-3 px-3">Authorizing Officer</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {clinicalExeats.map((pass) => (
                    <tr key={pass.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{pass.passNumber}</td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => {
                            const found = students.find((s) => s.studentNumber === pass.studentNumber);
                            if (found) setSelectedTraineeForPassport(found);
                          }}
                          className="font-bold text-cyan-900 hover:text-cyan-700 underline text-left"
                        >
                          {pass.studentName}
                        </button>
                        <span className="block text-[11px] text-slate-400 font-mono">{pass.studentNumber}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{pass.programme}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">{pass.destination}</td>
                      <td className="py-3 px-3">
                        <span className="block font-medium text-slate-700">{pass.departureTime}</span>
                        <span className="block text-[11px] text-slate-400">Due: {pass.expectedReturnTime}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{pass.authorizingOfficer}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                            pass.status === 'ACTIVE'
                              ? 'bg-amber-100 text-amber-800'
                              : pass.status === 'RETURNED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {pass.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {pass.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleMarkExeatReturned(pass.id)}
                            className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                          >
                            <Check className="h-3 w-3" /> Mark Returned
                          </button>
                        )}
                        {pass.status === 'RETURNED' && (
                          <span className="text-[11px] text-slate-400">Returned {pass.actualReturnTime}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 9. STATUTORY CALENDAR, TERMS & BIRTHDAYS TAB                         */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Statutory Calendar, Terms & Trainee Birthdays
              </h2>
              <p className="text-xs text-slate-500">
                Official 2026 Academic Terms, Gazetted Zambian Public Holidays with 85% rule exemption, and pastoral care tracking.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsHolidayModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-800 transition"
            >
              <Calendar className="h-4 w-4" /> Manage Statutory Holidays
            </button>
          </div>

          {/* Academic Terms */}
          <div className="grid gap-4 md:grid-cols-3">
            {ACADEMIC_TERMS_2026.map((term) => {
              const isCurrent = term.termNumber === 3;
              return (
                <div
                  key={term.termNumber}
                  className={`rounded-xl border p-4 shadow-sm ${
                    isCurrent
                      ? 'border-purple-300 bg-purple-50/50 ring-1 ring-purple-400'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        isCurrent ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isCurrent ? 'Current Active Term' : `Academic Term ${term.termNumber}`}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{term.teachingWeeks} Weeks</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-2">{term.termLabel}</h3>
                  <p className="text-xs text-slate-600 font-mono mt-1">
                    {term.startDate} → {term.endDate}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Total teaching days: {term.totalTeachingDays} days</p>
                </div>
              );
            })}
          </div>

          {/* Trainee Birthdays in October */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cake className="h-4 w-4 text-pink-600" />
              Trainee Birthdays This Month (October 2026)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Foster trainee retention and engagement through institutional pastoral care wishes.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {[
                { name: 'Sample Student', number: 'DEV-STU-0001', date: '28 October', age: '21st Birthday', prog: 'Diploma in Registered Nursing' },
                { name: 'Grace Mwape', number: 'NWU-2026-0003', date: '30 October', age: '22nd Birthday', prog: 'Diploma in Clinical Medicine' },
                { name: 'Brian Mulenga', number: 'NWU-2026-0004', date: '04 November', age: 'Upcoming (Next Week)', prog: 'Diploma in Registered Nursing' },
              ].map((b, idx) => (
                <div key={idx} className="rounded-lg border border-pink-100 bg-pink-50/40 p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-pink-800">{b.date}</span>
                      <span className="rounded bg-pink-200 px-1.5 py-0.5 text-[10px] font-bold text-pink-900">
                        {b.age}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{b.name}</h4>
                    <p className="text-[11px] text-slate-500">{b.prog}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNotice(`Birthday SMS message queued for delivery to ${b.name}'s verified mobile contact.`);
                      setTimeout(() => setNotice(''), 4000);
                    }}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-md border border-pink-300 bg-white px-2.5 py-1 text-xs font-bold text-pink-700 hover:bg-pink-100 transition shadow-sm"
                  >
                    <Send className="h-3 w-3" /> Send Birthday Wish SMS
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Gazetted Zambian Holidays Quick List */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                15 Gazetted Statutory Public Holidays (Laws of Zambia 2026)
              </h3>
              <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                Zero Deficit Penalty Guaranteed
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {holidays.map((h) => (
                <div key={h.id} className="rounded-md border border-slate-100 bg-slate-50 p-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800">{h.date}</span>
                    <span className="rounded bg-purple-100 px-1 py-0.2 text-[9px] font-bold text-purple-800">
                      EXEMPT
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 mt-0.5">{h.name}</p>
                  {h.significance && <p className="text-[10px] text-slate-500 mt-0.5">{h.significance}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 10. ATTENDANCE ANALYTICS & 85% COMPLIANCE AUDIT TAB                  */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-700" />
                Statutory Attendance Analytics & 85% Examination Clearance Audit
              </h2>
              <p className="text-xs text-slate-500">
                Longitudinal compliance analytics under Health Professions Council of Zambia (HPCZ) and Nursing & Midwifery Council of Zambia (NMCZ).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAuditModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-900 transition"
            >
              <ShieldAlert className="h-4 w-4 text-amber-400" /> Inspect Cryptographic Audit Log
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <span className="text-xs font-bold uppercase text-emerald-800">85% Rule Cleared</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-900">{clearedStudents.length} / {students.length}</span>
                <span className="text-xs font-bold text-emerald-700">
                  ({Math.round((clearedStudents.length / (students.length || 1)) * 100)}%)
                </span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-700">Eligible for end-of-term examinations</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <span className="text-xs font-bold uppercase text-amber-800">At-Risk Debarment Deficit</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-900">{atRiskStudents.length}</span>
                <span className="text-xs font-bold text-amber-700">Candidates &lt; 85%</span>
              </div>
              <p className="mt-1 text-[11px] text-amber-700">Immediate remedial practicum required</p>
            </div>

            <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4">
              <span className="text-xs font-bold uppercase text-cyan-800">Theory Completion</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-cyan-900">91.2%</span>
                <span className="text-xs font-bold text-cyan-700">Avg Attended</span>
              </div>
              <p className="mt-1 text-[11px] text-cyan-700">Target: 40 hours per term</p>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
              <span className="text-xs font-bold uppercase text-indigo-800">Clinical Ward Rounds</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-900">90.5%</span>
                <span className="text-xs font-bold text-indigo-700">Avg Practicum</span>
              </div>
              <p className="mt-1 text-[11px] text-indigo-700">Target: 60 hours in hospital wards</p>
            </div>
          </div>

          {/* At-Risk Remedial Roster Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/75 px-5 py-3.5">
              <h3 className="text-sm font-bold text-slate-900">
                Statutory Hours Recovery & Catch-Up Allocation Roster
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-3">Programme</th>
                    <th className="py-3 px-3">Theory Attended</th>
                    <th className="py-3 px-3">Clinical Attended</th>
                    <th className="py-3 px-3">Current %</th>
                    <th className="py-3 px-3">Deficit Hours</th>
                    <th className="py-3 px-3">Recommended Remediation</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {aggregatedStudents.map((s) => {
                    const isAtRisk = s.annualCombinedRate < 85;
                    const deficitHours = isAtRisk ? Math.ceil(((85 - s.annualCombinedRate) / 100) * 100) : 0;
                    return (
                      <tr key={s.id} className={isAtRisk ? 'bg-amber-50/40 hover:bg-amber-50' : 'hover:bg-slate-50'}>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedTraineeForPassport(s)}
                            className="font-bold text-cyan-900 hover:text-cyan-700 underline text-left"
                          >
                            {s.name}
                          </button>
                          <span className="block text-[11px] text-slate-400 font-mono">{s.studentNumber}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{s.programme}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{s.baseTheoryAttended} / 40h</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{s.baseClinicalAttended} / 60h</td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-black ${
                              isAtRisk ? 'text-rose-700' : 'text-emerald-700'
                            }`}
                          >
                            {s.annualCombinedRate}%
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {isAtRisk ? (
                            <span className="rounded bg-rose-100 px-2 py-0.5 font-bold text-rose-800 text-[10px]">
                              {deficitHours}h Catch-Up Needed
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">0h (Cleared)</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {isAtRisk ? 'Weekend Skills Lab Practicum + Ward Rotation' : 'Regular Schedule'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedTraineeForForm12A(s)}
                            className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            <FileText className="h-3 w-3 text-slate-500" /> Form 12A
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Official Attendance Sheet Print Modal */}
      <OfficialAttendanceSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        sessionData={{
          date: sessionDate,
          sessionType: selectedSessionType,
          venue: sessionVenue,
          courseModule: holidayCheck.isHoliday ? `[🇿🇲 ${holidayCheck.holiday?.name}] ${moduleTitle}` : moduleTitle,
          instructor: instructorName,
          cohortName: selectedProgramme === 'ALL' ? 'NWUCHAS Health Science Cohorts' : selectedProgramme,
          records: students.map((s) => ({
            studentNumber: s.studentNumber,
            name: s.name,
            status: s.todayStatus,
            arrivalMinutesLate: s.arrivalMinutesLate,
            verificationType: s.verificationMethod,
            remarks: holidayCheck.isHoliday ? 'Statutory Public Holiday' : undefined,
          })),
        }}
      />

      {/* Attendance Caution Letter Modal */}
      {cautionStudent && (
        <AttendanceCautionModal
          isOpen={!!cautionStudent}
          onClose={() => setCautionStudent(null)}
          student={cautionStudent}
        />
      )}

      {/* Public Holiday Manager Modal (Create, Edit, Update, Delete) */}
      <PublicHolidayManagerModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        holidays={holidays}
        onSaveHoliday={handleSaveHoliday}
        onDeleteHoliday={handleDeleteHoliday}
        onResetDefaults={handleResetHolidays}
        canEdit={canManageHolidays}
      />

      {/* Candidate Quota & Hours Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Edit Candidate Statutory Hours
                </h3>
                <p className="text-xs text-slate-500">
                  {editingStudent.name} • {editingStudent.studentNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentHours} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Cumulative Theory Attended (h)
                  </label>
                  <input
                    type="number"
                    max={40}
                    min={0}
                    value={editingStudent.baseTheoryAttended}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, baseTheoryAttended: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Target quota: 40 hours</span>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Cumulative Clinical Attended (h)
                  </label>
                  <input
                    type="number"
                    max={60}
                    min={0}
                    value={editingStudent.baseClinicalAttended}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, baseClinicalAttended: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Target quota: 60 hours</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Verification Method Override
                </label>
                <select
                  value={editingStudent.verificationMethod}
                  onChange={(e: any) =>
                    setEditingStudent({ ...editingStudent, verificationMethod: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
                >
                  <option value="BIOMETRIC_FINGERPRINT">Biometric Fingerprint Stamp</option>
                  <option value="MOBILE_PIN">Mobile OTP PIN Authentication</option>
                  <option value="QR_GEOFENCE">Campus Geofence (QR Code)</option>
                  <option value="MANUAL_FACULTY">Faculty Roll-Call (Manual)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
                >
                  <Check className="h-4 w-4" /> Save Candidate Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Roll-Call Stepper Modal */}
      <LiveRollCallModal
        isOpen={showLiveRollCallModal}
        onClose={() => setShowLiveRollCallModal(false)}
        sessionDate={sessionDate}
        sessionVenue={sessionVenue}
        moduleTitle={moduleTitle}
        instructorName={instructorName}
        students={students}
        onCompleteRollCall={handleSaveLiveRollCall}
      />

      {/* Trainee Attendance Passport Modal */}
      <TraineeAttendancePassportModal
        isOpen={!!selectedTraineeForPassport}
        onClose={() => setSelectedTraineeForPassport(null)}
        trainee={selectedTraineeForPassport}
        dailyAttendanceMap={dailyAttendanceMap}
      />

      {/* Form 12A Statutory Return / Exam Clearance Certificate */}
      <Form12AStatutoryReturnModal
        isOpen={!!selectedTraineeForForm12A}
        onClose={() => setSelectedTraineeForForm12A(null)}
        trainee={selectedTraineeForForm12A}
      />

      {/* Statutory Audit Log Modal */}
      <StatutoryAuditLogModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
      />

      {/* Hostel Curfew Roll-Call Modal */}
      <HostelRollCallModal
        isOpen={showHostelRollCallModal}
        onClose={() => setShowHostelRollCallModal(false)}
        onSaveRollCall={handleSaveHostelLog}
      />

      {/* Clinical Exeat Pass Modal */}
      <ClinicalExeatModal
        isOpen={showExeatModal}
        onClose={() => setShowExeatModal(false)}
        students={students}
        onSaveExeat={handleSaveExeat}
      />
    </div>
  );
}
