// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { InteractiveChart } from '@/components/InteractiveChart';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalEnrolled: 472,
    activeClasses: 18,
    todayAttendanceRate: 94.6,
    feeCollectionRate: 78.4,
    unreconciledPayments: 0,
    tczCompliantRate: 96.0,
  });

  const chartData = [
    { label: 'ECE Reception', value: 52, secondaryValue: 50, category: 'ECE' },
    { label: 'Grade 1A', value: 35, secondaryValue: 33, category: 'Primary' },
    { label: 'Grade 3 Blue', value: 38, secondaryValue: 36, category: 'Primary' },
    { label: 'Grade 7 Gold', value: 42, secondaryValue: 40, category: 'Primary' },
    { label: 'Form 2 Green', value: 40, secondaryValue: 38, category: 'Secondary' },
    { label: 'Form 4 Sciences', value: 36, secondaryValue: 34, category: 'Secondary' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur-sm border border-blue-400/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
            Zambia Education Management Standard 2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Kabulonga Combined Academy
          </h1>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed">
            Welcome to the centralized academic, operational, and financial control centre. Operating on Zambia-resident infrastructure conforming to the Data Protection Act 2021.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-blue-900 text-xs font-bold hover:bg-blue-50 shadow-sm transition"
            >
              <span>Admit Learner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/teacher"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white text-xs font-bold border border-blue-500/30 backdrop-blur-sm transition"
            >
              <span>Take Today’s Register</span>
            </Link>
            <Link
              href="/finance"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white text-xs font-bold border border-blue-500/30 backdrop-blur-sm transition"
            >
              <span>Record Fee Payment</span>
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Enrollment</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalEnrolled}</div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +8.4% this academic year
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today’s Attendance</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.todayAttendanceRate}%</div>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5">18 of 18 registers submitted</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee Collection</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.feeCollectionRate}%</div>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5">K384,200 collected of K490,000</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TCZ Compliance</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.tczCompliantRate}%</div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5">Teaching Council registered</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Interactive Charts & Analytics Section (Rule 25) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          title="Class Enrollment & Present Learners"
          subtitle="Real-time attendance comparison by active cohort"
          data={chartData}
          primaryLabel="Enrolled"
          secondaryLabel="Present Today"
          primaryColor="#03589f"
          secondaryColor="#10b981"
        />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Term 1 Assessment Moderation Pipeline</h4>
              <span className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">
                Active Cycle
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Multi-tier results approval ensuring academic integrity before guardian publication.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-800">Draft Markbooks</span>
                    <p className="text-[11px] text-slate-400">Class teachers entering Continuous Assessments</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700">4 Subjects</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/60 border border-amber-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <div>
                    <span className="text-xs font-bold text-slate-800">Submitted for Moderation</span>
                    <p className="text-[11px] text-slate-500">Awaiting Head of Department review</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700">6 Subjects</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/60">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800">Approved & Published to Portal</span>
                    <p className="text-[11px] text-slate-500">Accessible by verified parents and report card download</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700">14 Subjects</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Approved by Principal Agnes Mwanza</span>
            <Link
              href="/academics"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>Open Moderation Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Role Workspaces Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4 tracking-tight">Enterprise Role Workspaces</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admissions"
            className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition">
                Admissions & Student Registry
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Admissions pipeline, unique student number generation, verified guardian relationships, and longitudinal profiles.
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 mt-4 inline-flex items-center gap-1">
              Access Registry <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/teacher"
            className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition">
                Teacher Workspace & Registers
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Fast daily class attendance, offline sync reconciliation, continuous assessment entry, and ECE milestone rubrics.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 mt-4 inline-flex items-center gap-1">
              Open Teacher Desk <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/finance"
            className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition">
                Fees & School Finance
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Automated term invoicing, manual & mobile payment recording, immutable double-entry journal, and receipt generation.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-600 mt-4 inline-flex items-center gap-1">
              Open Bursar Office <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/parent"
            className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition">
                Parent & Guardian Portal
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Mobile-first experience for parents: switch between children, view published report cards, attendance, and fee accounts.
              </p>
            </div>
            <span className="text-xs font-semibold text-rose-600 mt-4 inline-flex items-center gap-1">
              Launch Parent View <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/hr"
            className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition">
                Staff & TCZ Compliance
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Teacher profiles, qualifications, and Teaching Council of Zambia registration & practising certificate expiry alerts.
              </p>
            </div>
            <span className="text-xs font-semibold text-purple-600 mt-4 inline-flex items-center gap-1">
              View Staff Directory <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/admin"
            className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition">
                Platform SaaS Administration
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Tenant provisioning, subscription management, active learner band enforcement, and platform infrastructure health.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-700 mt-4 inline-flex items-center gap-1">
              Platform Controls <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
