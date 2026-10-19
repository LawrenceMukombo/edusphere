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
} from 'lucide-react';
import { InteractiveChart } from '@/components/InteractiveChart';
import { useCampus } from '@/components/CampusContext';
import { getFinancialSummary } from '@/server/services/financeReporting.service';

export default function HomePage() {
  const { selectedCampus, setSelectedCampus, campusInfo } = useCampus();

  // Dynamic statistics adjusted per campus
  const statsMap = {
    ALL: {
      enrolled: 780,
      capacity: 1100,
      todayAttendanceRate: 97.4,
      absentCount: 20,
      boardersPresent: 315,
      boardersTotal: 318,
      feeCollectionRate: 84.2,
      totalBilledZMW: '4,647,000',
      totalCollectedZMW: '3,912,800',
      totalExpensesZMW: '1,142,800',
      netCashflowZMW: '+2,770,000',
      staffOnDuty: 35,
      staffTotal: 38,
      tczComplianceRate: 97.4,
      generatorFuelPct: 82,
      boreholeStatus: 'Optimal (80m)',
      activeExeats: 14,
      sickbayCount: 3,
    },
    MUSHITALA: {
      enrolled: 420,
      capacity: 650,
      todayAttendanceRate: 98.4,
      absentCount: 6,
      boardersPresent: 315,
      boardersTotal: 318,
      feeCollectionRate: 83.8,
      totalBilledZMW: '3,239,000',
      totalCollectedZMW: '2,714,600',
      totalExpensesZMW: '830,400',
      netCashflowZMW: '+1,884,200',
      staffOnDuty: 19,
      staffTotal: 21,
      tczComplianceRate: 95.2,
      generatorFuelPct: 82,
      boreholeStatus: 'Dual-Tank Storage Full',
      activeExeats: 14,
      sickbayCount: 2,
    },
    URBAN: {
      enrolled: 360,
      capacity: 450,
      todayAttendanceRate: 96.6,
      absentCount: 14,
      boardersPresent: 0,
      boardersTotal: 0,
      feeCollectionRate: 85.1,
      totalBilledZMW: '1,408,000',
      totalCollectedZMW: '1,198,200',
      totalExpensesZMW: '312,400',
      netCashflowZMW: '+885,800',
      staffOnDuty: 16,
      staffTotal: 17,
      tczComplianceRate: 100,
      generatorFuelPct: 90,
      boreholeStatus: 'Solar Pumping Active',
      activeExeats: 0,
      sickbayCount: 1,
    },
    KANSANSHI: {
      enrolled: 420,
      capacity: 650,
      todayAttendanceRate: 98.4,
      absentCount: 6,
      boardersPresent: 315,
      boardersTotal: 318,
      feeCollectionRate: 83.8,
      totalBilledZMW: '3,239,000',
      totalCollectedZMW: '2,714,600',
      totalExpensesZMW: '830,400',
      netCashflowZMW: '+1,884,200',
      staffOnDuty: 19,
      staffTotal: 21,
      tczComplianceRate: 95.2,
      generatorFuelPct: 82,
      boreholeStatus: 'Dual-Tank Storage Full',
      activeExeats: 14,
      sickbayCount: 2,
    },
  };

  const finSummary = useMemo(() => {
    return getFinancialSummary((selectedCampus as any) || 'ALL');
  }, [selectedCampus]);

  const stats = useMemo(() => {
    const base = statsMap[selectedCampus] || statsMap.ALL;
    return {
      ...base,
      totalBilledZMW: finSummary.formatted.totalBilled,
      totalCollectedZMW: finSummary.formatted.totalCollected,
      totalExpensesZMW: finSummary.formatted.totalExpenditures,
      netCashflowZMW: finSummary.formatted.cashSurplus,
      feeCollectionRate: finSummary.collectionRatePct,
      boardersTotal: selectedCampus === 'URBAN' ? 0 : 318,
      boardersPresent: selectedCampus === 'URBAN' ? 0 : 315,
      staffTotal: selectedCampus === 'ALL' ? 48 : base.staffTotal,
      staffOnDuty: selectedCampus === 'ALL' ? 45 : base.staffOnDuty,
      todayAttendanceRate: 95.8,
      absentCount: 33,
    };
  }, [selectedCampus, finSummary]);

  const isUrban = selectedCampus === 'URBAN';

  // Dynamic class attendance breakdown per campus
  const attendanceChartData = useMemo(() => {
    if (selectedCampus === 'URBAN') {
      return [
        { label: 'ECE Baby', value: 32, secondaryValue: 31, category: 'Early Childhood' },
        { label: 'ECE Reception', value: 45, secondaryValue: 44, category: 'Early Childhood' },
        { label: 'Grade 1 Gold', value: 42, secondaryValue: 41, category: 'Lower Primary' },
        { label: 'Grade 2 Silver', value: 40, secondaryValue: 39, category: 'Lower Primary' },
        { label: 'Grade 3 Emerald', value: 41, secondaryValue: 40, category: 'Middle Primary' },
        { label: 'Grade 4 Copper', value: 44, secondaryValue: 42, category: 'Middle Primary' },
        { label: 'Grade 5 Blue', value: 38, secondaryValue: 37, category: 'Upper Primary' },
        { label: 'Grade 6 Red', value: 37, secondaryValue: 35, category: 'Upper Primary' },
        { label: 'Grade 7 Top', value: 45, secondaryValue: 43, category: 'Primary Candidates' },
      ];
    } else if (selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') {
      return [
        { label: 'Grade 8 Alpha', value: 46, secondaryValue: 45, category: 'Junior Secondary' },
        { label: 'Grade 9 Top', value: 48, secondaryValue: 47, category: 'Junior Candidates' },
        { label: 'Form 1 Alpha', value: 48, secondaryValue: 47, category: 'Senior Secondary' },
        { label: 'Form 2 Beta', value: 45, secondaryValue: 44, category: 'Senior Secondary' },
        { label: 'Form 3 Blue', value: 44, secondaryValue: 44, category: 'Senior Secondary' },
        { label: 'Form 4 Green', value: 42, secondaryValue: 42, category: 'Senior Secondary' },
        { label: 'Form 5 Sciences', value: 39, secondaryValue: 38, category: 'Senior Candidates' },
        { label: 'Form 5 Arts', value: 38, secondaryValue: 37, category: 'Senior Candidates' },
        { label: 'A-Level Senior', value: 35, secondaryValue: 34, category: 'Advanced Level' },
      ];
    } else {
      return [
        { label: 'ECE Reception', value: 45, secondaryValue: 44, category: 'Urban Day' },
        { label: 'Grade 1 Gold', value: 42, secondaryValue: 41, category: 'Urban Day' },
        { label: 'Grade 5 Blue', value: 38, secondaryValue: 37, category: 'Urban Day' },
        { label: 'Grade 7 Top', value: 45, secondaryValue: 43, category: 'Urban Day' },
        { label: 'Grade 8 Alpha', value: 46, secondaryValue: 45, category: 'Mushitala Boarding' },
        { label: 'Form 1 Alpha', value: 48, secondaryValue: 47, category: 'Mushitala Boarding' },
        { label: 'Form 3 Blue', value: 44, secondaryValue: 44, category: 'Mushitala Boarding' },
        { label: 'Form 5 Sciences', value: 39, secondaryValue: 38, category: 'Mushitala Boarding' },
      ];
    }
  }, [selectedCampus]);

  const attendanceSubtitle = useMemo(() => {
    if (selectedCampus === 'URBAN') {
      return 'Real-time roll-call across Urban Day School (Early Childhood & Primary Wings, Solwezi Central)';
    } else if (selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') {
      return 'Real-time roll-call across Mushitala Boarding & Day Campus (Near Kansanshi Mining Corridor)';
    } else {
      return 'Consolidated roll-call across Mushitala Boarding Wing and Urban Day Scholar Campus';
    }
  }, [selectedCampus]);

  // Dynamic expenditure allocations strictly matching campus operations
  const expenseBreakdown = useMemo(() => {
    if (selectedCampus === 'URBAN') {
      return [
        { category: 'Staff Salaries & Remittances', amount: 168000, pct: 53.8, color: 'bg-blue-600' },
        { category: 'Maintenance & Campus Consumables', amount: 46200, pct: 14.8, color: 'bg-slate-500' },
        { category: 'Standby Generator Diesel (ZESCO Backup)', amount: 38400, pct: 12.3, color: 'bg-emerald-600' },
        { category: 'STEM Curriculum & Learning Kits', amount: 32800, pct: 10.5, color: 'bg-indigo-600' },
        { category: 'Transport & Inter-Campus Shuttle', amount: 27000, pct: 8.6, color: 'bg-purple-600' },
      ];
    } else if (selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') {
      return [
        { category: 'Food & Boarding Kitchen Provisions', amount: 384500, pct: 46.3, color: 'bg-amber-500' },
        { category: 'Staff Salaries & Remittances', amount: 174000, pct: 21.0, color: 'bg-blue-600' },
        { category: '250kVA Generator Diesel (SGC Solwezi)', amount: 130000, pct: 15.7, color: 'bg-emerald-600' },
        { category: 'STEM Science Labs & ECZ Exams', amount: 65400, pct: 7.9, color: 'bg-indigo-600' },
        { category: 'Transport & Fleet Logistics', amount: 42000, pct: 5.1, color: 'bg-purple-600' },
        { category: 'Boarding Facilities & Water Systems', amount: 34500, pct: 4.2, color: 'bg-slate-500' },
      ];
    } else {
      return [
        { category: 'Food & Boarding Provisions', amount: 384500, pct: 33.6, color: 'bg-amber-500' },
        { category: 'Staff Salaries & Remittances', amount: 342000, pct: 29.9, color: 'bg-blue-600' },
        { category: 'Generator Diesel & Power (SGC)', amount: 168400, pct: 14.7, color: 'bg-emerald-600' },
        { category: 'STEM Laboratories & Exams', amount: 98200, pct: 8.6, color: 'bg-indigo-600' },
        { category: 'Transport & Fleet Logistics', amount: 78500, pct: 6.9, color: 'bg-purple-600' },
        { category: 'Maintenance & Operations', amount: 71200, pct: 6.3, color: 'bg-slate-500' },
      ];
    }
  }, [selectedCampus]);

  const expenseSubtitle = useMemo(() => {
    if (selectedCampus === 'URBAN') {
      return 'Audited outflows supporting Urban Day School teachers, solar power, shuttle buses, and classroom consumables.';
    } else if (selectedCampus === 'MUSHITALA' || selectedCampus === 'KANSANSHI') {
      return 'Transparent outflows supporting boarding dining kitchen, mining corridor 250kVA generator backup, and STEM laboratories.';
    } else {
      return 'Transparent, audited outflows supporting boarding kitchen provisions, mining corridor power backup, teacher remuneration, and labs.';
    }
  }, [selectedCampus]);

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

      {/* KPI Cards Row — Operational Heartbeat (Clickable Drilldowns) */}
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
              {stats.enrolled} <span className="text-xs font-semibold text-slate-400">/ {stats.capacity}</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              {Math.round((stats.enrolled / stats.capacity) * 100)}% Campus Capacity
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
              {stats.todayAttendanceRate}%
            </div>
            <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {stats.absentCount} absentees logged today
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
              Term 1 Fees Recovery
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats.feeCollectionRate}%
            </div>
            <span className="text-[11px] text-blue-700 font-bold flex items-center gap-1 mt-0.5">
              ZMW {stats.totalCollectedZMW} collected
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
              ZMW {stats.totalExpensesZMW}
            </div>
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
              Net Surplus: {stats.netCashflowZMW}
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
                360 Day Scholars
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Day Catering Hall</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">360 / 360 Lunches</span>
                <span className="text-[10px] text-emerald-600 font-semibold">100% Accounted • Head: M. Bwalya</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Central Shuttle Fleet</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">4 Buses Active</span>
                <span className="text-[10px] text-emerald-600 font-semibold">99.4% On-Time Morning Arrival</span>
              </div>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Morning Assembly Registration:
                </span>
                <span className="font-bold text-emerald-700">96.6% (346 / 360 Present)</span>
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
                <span className="font-bold text-blue-700">{stats.sickbayCount} Minor Consultation</span>
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
                318 Boarders
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Kansanshi Boys Hall</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">162 / 180 Beds</span>
                <span className="text-[10px] text-emerald-600 font-semibold">90% Occupied • Warden: K. Phiri</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Kalumbila Girls Hall</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">156 / 170 Beds</span>
                <span className="text-[10px] text-emerald-600 font-semibold">91.7% Occupied • Matron: B. Kalenga</span>
              </div>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Evening Prep Roll-Call Status:
                </span>
                <span className="font-bold text-emerald-700">99.1% Accounted</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Active Authorized Exeats:
                </span>
                <span className="font-bold text-amber-700">{stats.activeExeats} Students</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Sickbay In-Patients:
                </span>
                <span className="font-bold text-blue-700">{stats.sickbayCount} In-Patients Monitored</span>
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
                  {isUrban ? 'Standby Generator Fuel (SGC Solwezi Central)' : '250kVA Standby Generator Fuel (SGC Solwezi)'}
                </span>
                <span className="text-emerald-700">{stats.generatorFuelPct}% ({isUrban ? '1,640' : '2,450'} Litres)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${stats.generatorFuelPct}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {isUrban
                  ? 'Approx 72 hours continuous automated switchover runtime.'
                  : 'Approx 68 hours uninterrupted continuous full-campus load.'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  Solar Water Boreholes:
                </span>
                <span className="font-bold text-slate-900">{stats.boreholeStatus}</span>
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
                  {isUrban ? '4 Urban Day Shuttles Active' : 'Mushitala Shuttle (BAX 3192 ZM)'}
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
              {stats.staffOnDuty} / {stats.staffTotal} on Duty
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/60">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span>TCZ Practising Certificate Audit</span>
                <span>{stats.tczComplianceRate}% Compliant</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                All teaching staff registered with Teaching Council of Zambia; 1 certificate renewal currently pending at regional board.
              </p>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span>Staff on Approved Leave:</span>
                <span className="font-bold text-amber-700">3 (Mr. Lungu, Mrs. Chanda, Mr. Siame)</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Active Recruitment Vacancies:</span>
                <span className="font-bold text-blue-700">3 Positions (19 Applicants)</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Completed Term Appraisals:</span>
                <span className="font-bold text-slate-900">32 / 38 Staff Evaluated</span>
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
        {/* Attendance Rates by Cohort */}
        <InteractiveChart
          title={`Class Attendance Breakdown — ${campusInfo.name}`}
          subtitle={attendanceSubtitle}
          data={attendanceChartData}
          primaryColor="#03589f"
          secondaryColor="#eab308"
          primaryLabel="Cohort Enrolled"
          secondaryLabel="Today Present"
          unit="Learners"
          onItemClick={(item) => {
            window.location.href = `/attendance?class=${encodeURIComponent(item.label)}`;
          }}
        />

        {/* Expenditure Outflow Allocation */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Term 1 Expenditure Allocations (ZMW)</h3>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Total: ZMW {stats.totalExpensesZMW}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              {expenseSubtitle}
            </p>

            <div className="space-y-3">
              {expenseBreakdown.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/finance?tab=expenditures`}
                  className="block p-2 rounded-xl hover:bg-slate-50 transition group"
                >
                  <div className="flex justify-between text-xs font-bold text-slate-800 mb-1 group-hover:text-blue-700">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      {item.category}
                    </span>
                    <span className="font-mono">ZMW {item.amount.toLocaleString()} ({item.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(item.pct * 1.8, 100)}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">All disbursements backed by signed payment vouchers.</span>
            <Link
              href="/finance"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
