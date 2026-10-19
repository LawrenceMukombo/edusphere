// src/app/page.tsx — Executive Management Dashboard for Legacy School Solwezi
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  CreditCard,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  CalendarCheck,
  AlertCircle,
  Bed,
  Sun,
  Activity,
  Zap,
  DollarSign,
  FileText,
  UserCheck,
  Fuel,
  Droplets,
  Award,
  Layers,
  Sparkles,
  Presentation,
  Smartphone,
  Download,
  BookOpen,
} from 'lucide-react';
import { InteractiveChart } from '@/components/InteractiveChart';
import { useCampus } from '@/components/CampusContext';
import { getFinancialSummary } from '@/server/services/financeReporting.service';
import {
  generateLegacyLearners,
  LEGACY_STAFF_MEMBERS,
  LEGACY_EXPENDITURES,
  LEGACY_BOARDING_EXEATS,
  LEGACY_STAFF_EVALUATIONS,
  LEGACY_JOB_POSTINGS,
  LEGACY_APPLICANTS,
  LegacyLearnerBalance,
  LegacyStaffMember,
} from '@/server/services/legacySchoolData';
import { SEED_SCHOOL_ASSETS, SchoolAssetItem } from '@/server/services/schoolAssetData';

export default function HomePage() {
  const { selectedCampus, setSelectedCampus, campusInfo } = useCampus();

  // 1. Authoritative Granular Datasets
  const allLearners = useMemo(() => generateLegacyLearners(780), []);

  // Filter learners granularly by active campus
  const campusLearners = useMemo(() => {
    if (selectedCampus === 'URBAN') {
      return allLearners.filter((l) => l.campusName.includes('Urban'));
    }
    if (selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') {
      return allLearners.filter(
        (l) => l.campusName.includes('Mushitala') || l.campusName.includes('Kansanshi')
      );
    }
    return allLearners;
  }, [allLearners, selectedCampus]);

  // Filter staff granularly by active campus
  const campusStaff = useMemo(() => {
    return LEGACY_STAFF_MEMBERS.filter((s) => {
      if (selectedCampus === 'ALL') return true;
      if (selectedCampus === 'URBAN') return s.campusId === 'LSS-URB' || s.campusId === 'CENTRAL';
      return (
        s.campusId === 'LSS-MSC' ||
        s.campusId === 'LSS-KBC' ||
        s.campusId === 'LSS-MDC' ||
        s.campusId === 'CENTRAL'
      );
    });
  }, [selectedCampus]);

  // Financial summary from authoritative financial service
  const finSummary = useMemo(() => {
    return getFinancialSummary((selectedCampus as any) || 'ALL');
  }, [selectedCampus]);

  // 2. Granular Demographic & Attendance Metrics
  const enrolled = campusLearners.length;
  const capacity = selectedCampus === 'URBAN' ? 450 : selectedCampus === 'ALL' ? 1100 : 650;

  const presentCount = useMemo(() => {
    return campusLearners.filter(
      (l) => l.todayAttendance === 'PRESENT' || l.todayAttendance === 'LATE'
    ).length;
  }, [campusLearners]);

  const absentCount = useMemo(() => {
    return campusLearners.filter((l) => l.todayAttendance === 'ABSENT').length;
  }, [campusLearners]);

  const todayAttendanceRate =
    enrolled > 0 ? Number(((presentCount / enrolled) * 100).toFixed(1)) : 100;

  // Boarders breakdown
  const boarders = useMemo(() => {
    return campusLearners.filter((l) => l.studentType === 'BOARDER');
  }, [campusLearners]);

  const boardersTotal = boarders.length;
  const boardersPresent = useMemo(() => {
    return boarders.filter(
      (l) => l.todayAttendance === 'PRESENT' || l.todayAttendance === 'LATE'
    ).length;
  }, [boarders]);

  const boysBoardersCount = useMemo(() => {
    return boarders.filter((l) => l.gender === 'MALE').length;
  }, [boarders]);

  const girlsBoardersCount = useMemo(() => {
    return boarders.filter((l) => l.gender === 'FEMALE').length;
  }, [boarders]);

  const dayScholarsCount = useMemo(() => {
    return campusLearners.filter((l) => l.studentType !== 'BOARDER').length;
  }, [campusLearners]);

  const sickbayCount = useMemo(() => {
    return campusLearners.filter((l) => (l.medicalProfile?.sickbayVisitsCount || 0) > 0).length;
  }, [campusLearners]);

  const activeExeats = useMemo(() => {
    return LEGACY_BOARDING_EXEATS.filter((e) => {
      if (selectedCampus === 'URBAN') return false;
      return e.securityGateStatus !== 'RETURNED_ON_TIME';
    }).length;
  }, [selectedCampus]);

  // 3. Granular HR & TCZ Metrics
  const staffTotal = campusStaff.length;
  const staffOnDuty = useMemo(() => {
    return campusStaff.filter((s) => s.leaveBalanceDays > 0).length;
  }, [campusStaff]);

  const staffOnLeave = staffTotal - staffOnDuty;

  const tczCompliantCount = useMemo(() => {
    return campusStaff.filter((s) => s.tczStatus === 'COMPLIANT').length;
  }, [campusStaff]);

  const tczExpiringCount = useMemo(() => {
    return campusStaff.filter((s) => s.tczStatus === 'EXPIRING_SOON').length;
  }, [campusStaff]);

  const tczComplianceRate =
    staffTotal > 0 ? Number(((tczCompliantCount / staffTotal) * 100).toFixed(1)) : 100;

  const activeVacanciesCount = useMemo(() => {
    return LEGACY_JOB_POSTINGS.filter((j) => {
      if (j.status !== 'ACTIVE') return false;
      if (selectedCampus === 'ALL') return true;
      if (selectedCampus === 'URBAN') return j.campusName.includes('Urban');
      return j.campusName.includes('Mushitala') || j.campusName.includes('Kansanshi');
    }).reduce((sum, j) => sum + j.vacancies, 0);
  }, [selectedCampus]);

  const applicantsCount = useMemo(() => {
    return LEGACY_APPLICANTS.length;
  }, []);

  const completedAppraisalsCount = useMemo(() => {
    return LEGACY_STAFF_EVALUATIONS.filter((e) => {
      if (selectedCampus === 'ALL') return true;
      return campusStaff.some((s) => s.id === e.staffId);
    }).length;
  }, [campusStaff, selectedCampus]);

  // 4. Granular Fleet & Infrastructure Assets
  const campusFleet = useMemo(() => {
    return SEED_SCHOOL_ASSETS.filter((a: SchoolAssetItem) => {
      if (a.category !== 'FLEET_TRANSPORT') return false;
      if (selectedCampus === 'URBAN') return a.campus.includes('Urban');
      if (selectedCampus === 'MUSHITALA') return a.campus.includes('Mushitala');
      return true;
    });
  }, [selectedCampus]);

  const campusPowerAsset = useMemo(() => {
    return (
      SEED_SCHOOL_ASSETS.find((a: SchoolAssetItem) => {
        if (a.category !== 'POWER_ENERGY') return false;
        if (selectedCampus === 'URBAN') return a.campus.includes('Urban');
        return a.campus.includes('Mushitala');
      }) || SEED_SCHOOL_ASSETS.find((a: SchoolAssetItem) => a.category === 'POWER_ENERGY')
    );
  }, [selectedCampus]);

  const boysHallCapacity = 180;
  const girlsHallCapacity = 170;

  // 4. Granular Attendance Breakdown Chart (Aggregated per Class Cohort)
  const attendanceChartData = useMemo(() => {
    const classMap = new Map<string, { total: number; present: number; stage: string }>();

    campusLearners.forEach((l) => {
      const entry = classMap.get(l.className) || { total: 0, present: 0, stage: l.stage };
      entry.total += 1;
      if (l.todayAttendance === 'PRESENT' || l.todayAttendance === 'LATE') {
        entry.present += 1;
      }
      classMap.set(l.className, entry);
    });

    return Array.from(classMap.entries()).map(([className, counts]) => ({
      label: className.split('(')[0].trim(),
      value: counts.total,
      secondaryValue: counts.present,
      category: counts.stage.replace(/_/g, ' '),
    }));
  }, [campusLearners]);

  const attendanceSubtitle = useMemo(() => {
    if (selectedCampus === 'URBAN') {
      return `Real-time roll-call across Urban Day School (${enrolled} pupils enrolled across Early Childhood & Primary Wings, Solwezi Central)`;
    } else if (selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') {
      return `Real-time roll-call across Mushitala Campus (${enrolled} pupils enrolled across Boarding & Day Wings, near Kansanshi Mining Corridor)`;
    } else {
      return `Consolidated roll-call across all ${enrolled} learners at Mushitala Boarding Wing and Urban Day Scholar Campus`;
    }
  }, [selectedCampus, enrolled]);

  // 5. Granular Expenditure Allocations from Audited Outflow Vouchers
  const expenseBreakdown = useMemo(() => {
    const disbursed = LEGACY_EXPENDITURES.filter((e) => {
      if (e.status !== 'DISBURSED') return false;
      if (selectedCampus === 'ALL') return true;
      if (selectedCampus === 'URBAN') return e.campusId === 'LSS-URB' || e.campusId === 'CENTRAL';
      return (
        e.campusId === 'LSS-MSC' ||
        e.campusId === 'LSS-KBC' ||
        e.campusId === 'LSS-MDC' ||
        e.campusId === 'CENTRAL'
      );
    });

    const categoryMap = new Map<string, number>();
    let total = 0;
    disbursed.forEach((e) => {
      categoryMap.set(e.categoryLabel, (categoryMap.get(e.categoryLabel) || 0) + e.amountZMW);
      total += e.amountZMW;
    });

    const colors = [
      'bg-amber-500',
      'bg-blue-600',
      'bg-emerald-600',
      'bg-indigo-600',
      'bg-purple-600',
      'bg-slate-500',
      'bg-rose-600',
    ];

    return Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount], idx) => ({
        category,
        amount,
        pct: total > 0 ? Number(((amount / total) * 100).toFixed(1)) : 0,
        color: colors[idx % colors.length],
      }));
  }, [selectedCampus]);

  const expenseSubtitle = useMemo(() => {
    if (selectedCampus === 'URBAN') {
      return 'Audited outflows supporting Urban Day School teachers, solar power, shuttle buses, and classroom consumables.';
    } else if (selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') {
      return 'Audited outflows supporting boarding dining kitchen, mining corridor 250kVA generator backup, and STEM laboratories.';
    } else {
      return 'Audited outflows supporting boarding kitchen provisions, mining corridor power backup, teacher remuneration, and laboratories.';
    }
  }, [selectedCampus]);

  const isUrban = selectedCampus === 'URBAN';

  return (
    <div className="space-y-8">
      {/* Executive Welcome & Institutional Mission Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              Legacy School Solwezi • Stand # S/SOLWE/3177178
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-400/20">
              {campusInfo.badge}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            {campusInfo.name}
          </h1>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed max-w-2xl">
            Centralized operations, real-time morning and boarding attendance registers, transparent multi-channel fees reconciliation, and comprehensive staff management at your fingertips.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/attendance"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md transition"
            >
              <CalendarCheck className="w-4 h-4 text-slate-900" />
              <span>Operations & Attendance Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/finance"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-white text-xs font-bold border border-blue-500/30 backdrop-blur-sm transition"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Fees Ledger & Expenditures</span>
            </Link>

            <Link
              href="/hr"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-white text-xs font-bold border border-blue-500/30 backdrop-blur-sm transition"
            >
              <Briefcase className="w-4 h-4 text-amber-300" />
              <span>Staff & HR Suite</span>
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* KPI Cards Row — Operational Heartbeat (Granularly Computed from System Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Enrollment & Capacity */}
        <Link
          href="/admissions"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md hover:border-blue-300 transition group cursor-pointer"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-700 transition">
              Active Enrollment
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {enrolled} <span className="text-xs font-semibold text-slate-400">/ {capacity}</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              {Math.round((enrolled / capacity) * 100)}% Campus Capacity
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center ring-1 ring-blue-100 group-hover:bg-blue-600 group-hover:text-white transition">
            <Users className="w-6 h-6" />
          </div>
        </Link>

        {/* KPI 2: Today's Attendance Rate */}
        <Link
          href="/attendance"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md hover:border-emerald-300 transition group cursor-pointer"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-700 transition">
              Today&apos;s Attendance
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {todayAttendanceRate}%
            </div>
            <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {absentCount} absentees logged today
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center ring-1 ring-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </Link>

        {/* KPI 3: Fee Collections Rate */}
        <Link
          href="/finance"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md hover:border-amber-300 transition group cursor-pointer"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-amber-700 transition">
              Term 3 Fees Recovery
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {finSummary.collectionRatePct}%
            </div>
            <span className="text-[11px] text-blue-700 font-bold flex items-center gap-1 mt-0.5">
              ZMW {finSummary.formatted.totalCollected} collected
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center ring-1 ring-amber-100 group-hover:bg-amber-500 group-hover:text-white transition">
            <CreditCard className="w-6 h-6" />
          </div>
        </Link>

        {/* KPI 4: Monthly Disbursed Expenses */}
        <Link
          href="/finance?tab=expenditures"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md hover:border-rose-300 transition group cursor-pointer"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-rose-700 transition">
              Operational Outflows
            </span>
            <div className="text-2xl font-black text-rose-700 mt-1">
              ZMW {finSummary.formatted.totalExpenditures}
            </div>
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
              Net Surplus: {finSummary.formatted.cashSurplus}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center ring-1 ring-rose-100 group-hover:bg-rose-600 group-hover:text-white transition">
            <DollarSign className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Boarding Village vs Day-Scholar Operations & Solwezi Corridor Infrastructure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Boarding Village (Mushitala) OR Day-Scholar Services (Urban) */}
        {isUrban ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Sun className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Urban Day-Scholar Services</h3>
                  <span className="text-[10px] text-slate-500">Solwezi Central Day Operations</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                {dayScholarsCount} Day Scholars
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Day Catering Hall</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">{dayScholarsCount} / {dayScholarsCount} Lunches</span>
                <span className="text-[10px] text-emerald-600 font-semibold">100% Accounted • Head: M. Bwalya</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Central Shuttle Fleet</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">{campusFleet.length} Vehicles Active</span>
                <span className="text-[10px] text-emerald-600 font-semibold">100% Monitored • Fleet Supervisor: M. Chilufya</span>
              </div>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Morning Assembly Registration:
                </span>
                <span className="font-bold text-emerald-700">
                  {todayAttendanceRate}% ({presentCount} / {enrolled} Present)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Afternoon Prep & Activities:
                </span>
                <span className="font-bold text-amber-700">100% Supervised</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Sickbay / First Aid Station:
                </span>
                <span className="font-bold text-blue-700">{sickbayCount} Minor Consultations</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/attendance"
                className="block text-center w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl transition"
              >
                Manage Day Attendance & Bus Routes &rarr;
              </Link>
              <button
                type="button"
                onClick={() => setSelectedCampus('MUSHITALA')}
                className="w-full text-center py-1 text-slate-500 hover:text-indigo-700 text-[11px] font-semibold transition"
              >
                Switch to Mushitala Boarding Wing &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Bed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Boarding Village Operations</h3>
                  <span className="text-[10px] text-slate-500">Kansanshi Boarding Wing (Mushitala)</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {boardersTotal} Boarders
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Kansanshi Boys Hall</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">{boysBoardersCount} / {boysHallCapacity} Beds</span>
                <span className="text-[10px] text-emerald-600 font-semibold">{Math.round((boysBoardersCount / boysHallCapacity) * 100)}% Occupied • Warden: K. Phiri</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Kalumbila Girls Hall</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">{girlsBoardersCount} / {girlsHallCapacity} Beds</span>
                <span className="text-[10px] text-emerald-600 font-semibold">{Math.round((girlsBoardersCount / girlsHallCapacity) * 100)}% Occupied • Matron: B. Kalenga</span>
              </div>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Evening Prep Roll-Call Status:
                </span>
                <span className="font-bold text-emerald-700">
                  {boardersTotal > 0 ? Number(((boardersPresent / boardersTotal) * 100).toFixed(1)) : 100}% Accounted
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Active Authorized Exeats:
                </span>
                <span className="font-bold text-amber-700">{activeExeats} Students</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Sickbay In-Patients:
                </span>
                <span className="font-bold text-blue-700">{sickbayCount} In-Patients Monitored</span>
              </div>
            </div>

            <Link
              href="/boarding"
              className="block text-center w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs rounded-xl transition"
            >
              Manage Boarding Roll-Calls & Exeats &rarr;
            </Link>
          </div>
        )}

        {/* Solwezi Mining Corridor Utility & Power Monitor */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Solwezi Utilities & Infrastructure</h3>
                <span className="text-[10px] text-slate-500">
                  {isUrban ? 'Solwezi Central Campus Resiliency' : 'Kansanshi & Mushitala Resiliency'}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              100% Operational
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-amber-600" />
                  {campusPowerAsset?.name || (isUrban ? '50kVA Hybrid Solar Inverter' : '250kVA Standby Diesel Generator')}
                </span>
                <span className="text-emerald-700">Status: {campusPowerAsset?.condition || 'EXCELLENT'}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: isUrban ? '90%' : '82%' }} />
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Asset: {campusPowerAsset?.assetTag || 'LSS-PWR-001'} • Custodian: {campusPowerAsset?.custodianName || 'Patrick Banda'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  Solar Water Boreholes:
                </span>
                <span className="font-bold text-slate-900">
                  {isUrban ? 'Solar Pumping Active' : 'Dual-Tank Storage Full'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  High-Speed Starlink / Liquid Mesh:
                </span>
                <span className="font-bold text-emerald-700">
                  {isUrban ? '184 Mbps Low Latency' : '220 Mbps Dedicated Mining Corridor'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Campus Transit Fleet:
                </span>
                <span className="font-bold text-slate-900">
                  {campusFleet.length} Vehicles Active ({campusFleet.map((f: SchoolAssetItem) => f.name.includes('Reg:') ? f.name.split('Reg:')[1].replace(')', '').trim() : f.name.split(' ')[0]).join(', ')})
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/gis"
            className="block text-center w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
          >
            View Solwezi Campuses GIS & Transit &rarr;
          </Link>
        </div>

        {/* Staff & HR Suite Snapshot */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Staffing & TCZ Compliance</h3>
                <span className="text-[10px] text-slate-500">Zambia Education Standard 2026</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {staffOnDuty} / {staffTotal} on Duty
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/60">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span>TCZ Practising Certificate Audit</span>
                <span>{tczComplianceRate}% Compliant</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {tczCompliantCount} of {staffTotal} staff certified with Teaching Council of Zambia; {tczExpiringCount} renewal pending.
              </p>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span>Staff on Approved Leave:</span>
                <span className="font-bold text-amber-700">
                  {staffOnLeave} Staff Member{staffOnLeave === 1 ? '' : 's'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Active Recruitment Vacancies:</span>
                <span className="font-bold text-blue-700">
                  {activeVacanciesCount} Position{activeVacanciesCount === 1 ? '' : 's'} ({applicantsCount} Applicants)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Completed Term Appraisals:</span>
                <span className="font-bold text-slate-900">
                  {completedAppraisalsCount} / {staffTotal} Staff Evaluated
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/hr"
            className="block text-center w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl transition"
          >
            Open Full HR & Recruitment Suite &rarr;
          </Link>
        </div>
      </div>

      {/* Analytics Row: Attendance Breakdown & Expenditure Inflows vs Outflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analytics Card 1: Attendance Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Classroom Morning Roll-Call Adherence</h3>
              <p className="text-xs text-slate-500 mt-0.5">{attendanceSubtitle}</p>
            </div>
            <Link
              href="/attendance"
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition"
            >
              <span>Full Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <InteractiveChart
            type="bar"
            data={attendanceChartData}
            title="Class Attendance Breakdown (Enrolled vs Present Today)"
            primaryLabel="Enrolled Pupils"
            secondaryLabel="Present Today"
          />
        </div>

        {/* Analytics Card 2: Operational Expenditures Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Disbursed Expenditures</h3>
              <p className="text-xs text-slate-500 mt-0.5">{expenseSubtitle}</p>
            </div>
            <Link
              href="/finance?tab=expenditures"
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition"
            >
              <span>Expense Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Granular Categories Progress Bars */}
          <div className="space-y-3 pt-2">
            {expenseBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{item.category}</span>
                  <span className="font-mono text-slate-900">
                    ZMW {item.amount.toLocaleString()} ({item.pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
