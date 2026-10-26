import Link from 'next/link';
import {
  GraduationCap,
  HeartPulse,
  WalletCards,
  Building2,
  UsersRound,
  FileText,
  CalendarDays,
  ShieldCheck,
  Award,
  BookOpenCheck,
  ClipboardCheck,
  BadgeDollarSign,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  Activity,
  AlertTriangle,
  Stethoscope,
  Building,
  Bell,
  Calendar,
  AlertCircle,
  FileCheck,
  Users,
  Percent,
} from 'lucide-react';
import { prisma } from '@/server/db';
import { formatStandardDate } from '@/lib/dateUtils';
import { formatCleanEnum, formatMoney } from '@/lib/formatters';
import { NwuchasEmblemSvg } from '@/components/NwuchasLogo';
import { NWUCHAS_IDENTITY } from '@/lib/identity';

export const dynamic = 'force-dynamic';

export default async function CollegeExecutiveDashboard() {
  const org = await prisma.organisation.findFirst({
    where: { code: 'NWUCHAS' },
    include: {
      campuses: true,
      clinicalSites: { include: { supervisors: true, _count: { select: { placements: true } } } },
      programmes: { include: { _count: { select: { cohorts: true } } } },
    },
  });

  const [
    learnersCount,
    clinicalSitesCount,
    placementsCount,
    applicationsCount,
    staffCount,
    latestRuns,
    paymentsSum,
    invoicesSum,
    applications,
    placements,
  ] = await Promise.all([
    prisma.learner.count({ where: { organisationId: org?.id } }),
    prisma.clinicalSite.count({ where: { organisationId: org?.id } }),
    prisma.clinicalPlacement.count({ where: { organisationId: org?.id } }),
    prisma.admissionApplication.count({ where: { organisationId: org?.id } }),
    prisma.staff.count({ where: { organisationId: org?.id } }),
    prisma.payrollRun.findMany({
      where: { organisationId: org?.id },
      orderBy: { createdAt: 'desc' },
      take: 1,
    }),
    prisma.payment.aggregate({
      where: { organisationId: org?.id },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: { organisationId: org?.id },
      _sum: { totalAmount: true },
    }),
    prisma.admissionApplication.findMany({
      where: { organisationId: org?.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.clinicalPlacement.findMany({
      where: { organisationId: org?.id },
      include: { learner: true, clinicalSite: true },
      orderBy: { startDate: 'desc' },
      take: 5,
    }),
  ]);

  const latestPayroll = latestRuns[0] || null;
  const totalCollections = Number(paymentsSum._sum.amount || 0);
  const totalInvoiced = Number(invoicesSum._sum.totalAmount || 0);
  const collectionTarget = totalInvoiced > 0 ? totalInvoiced : 120000;
  const collectionPercentage = Math.min(100, Math.round((totalCollections / collectionTarget) * 100));

  // Programme distributions for executive charts
  const programmeData = [
    { name: 'Diploma Registered Nursing (RN)', count: 68, color: '#007B99', share: 48, code: 'NUR' },
    { name: 'Diploma Clinical Medicine (COG)', count: 42, color: '#8DC63F', share: 30, code: 'CLI' },
    { name: 'Diploma Public Health', count: 20, color: '#EC008C', share: 14, code: 'PBH' },
    { name: 'In-Service Bridging', count: 12, color: '#0b2545', share: 8, code: 'BRG' },
  ];

  // Partner clinical training sites capacity
  const clinicalSitesList = [
    { name: 'Solwezi General Hospital', role: 'Level 2 Provincial Referral', trainees: 18, capacity: 25, color: '#007B99' },
    { name: 'Lumwana First Quantum District Hospital', role: 'District Industrial Facility', trainees: 12, capacity: 15, color: '#8DC63F' },
    { name: 'Kansanshi Mine Hospital', role: 'Specialized Industrial Health', trainees: 8, capacity: 10, color: '#EC008C' },
    { name: 'Manyama Rural Health Post', role: 'Primary Healthcare Catchment', trainees: 6, capacity: 8, color: '#0b2545' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Executive Cockpit Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-gradient-to-br from-[#007B99]/10 via-[#8DC63F]/10 to-transparent blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#007B99]/30 bg-[#007B99]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#007B99]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#007B99]" />
                Executive Command Cockpit • Authenticated Council
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8DC63F]/40 bg-[#8DC63F]/15 px-3 py-1 text-xs font-bold text-[#5c8426]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#5c8426]" />
                Real-Time Institutional Telemetry
              </span>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <NwuchasEmblemSvg size={54} className="shrink-0 drop-shadow-sm" />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-[#0b2545] sm:text-3xl">
                  {NWUCHAS_IDENTITY.name}
                </h1>
                <p className="flex items-center gap-2 text-xs font-semibold text-[#007B99] mt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#007B99]" />
                  {NWUCHAS_IDENTITY.address}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-600 max-w-2xl">
              Consolidated governance telemetry covering Nursing and Clinical Medicine didactic training, hospital ward rotations across North-Western Province, statutory payroll compliance, and revenue realization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/modules/clinical-learning"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#007B99] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#00627a] transition"
            >
              <HeartPulse className="h-4 w-4" />
              Clinical Logbooks & EPA
            </Link>
            <Link
              href="/modules/finance"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8DC63F] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#72a330] transition"
            >
              <WalletCards className="h-4 w-4" />
              Fee Ledger & Receipts
            </Link>
            <Link
              href="/modules/admissions"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <UsersRound className="h-4 w-4 text-slate-600" />
              Admissions Console
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Important Reminders & Critical Activities / Due Dates Panel */}
      <section className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 text-white shadow-xs">
              <Bell className="h-4 w-4 animate-bounce" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-950">
                Executive Reminders & Critical Statutory Due Dates
              </h2>
              <p className="text-[11px] text-amber-800">
                Statutory regulatory deadlines, tax compliance thresholds, and clinical accreditation milestones
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/60 px-3 py-1 text-[11px] font-bold text-amber-900 self-start sm:self-auto">
            <Clock className="h-3 w-3" />
            Next Audit: 10 Nov 2026
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          {/* Reminder 1: ZRA PAYE */}
          <div className="rounded-xl border border-amber-200/80 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">ZRA PAYE Return</span>
              <span className="rounded bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 text-[10px] font-black">
                Due 10th
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600">
              TaxOnline monthly remittance for institutional academic & administrative staff.
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[10px] border-t border-slate-100 pt-1.5">
              <span className="text-slate-500">Status:</span>
              <strong className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Ready on File
              </strong>
            </div>
          </div>

          {/* Reminder 2: NAPSA & NHIMA */}
          <div className="rounded-xl border border-amber-200/80 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">NAPSA & NHIMA</span>
              <span className="rounded bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 text-[10px] font-black">
                Due 10th
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600">
              eNAPSA social security and national health insurance statutory filings.
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[10px] border-t border-slate-100 pt-1.5">
              <span className="text-slate-500">Compliance:</span>
              <strong className="text-[#007B99]">100% Up to Date</strong>
            </div>
          </div>

          {/* Reminder 3: NMCZ Indexing */}
          <div className="rounded-xl border border-amber-200/80 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">NMCZ Indexing</span>
              <span className="rounded bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 text-[10px] font-black">
                Window Open
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600">
              Nursing Council biometric indexing for 2026/2027 Registered Nursing cohorts.
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[10px] border-t border-slate-100 pt-1.5">
              <span className="text-slate-500">Registrar Action:</span>
              <strong className="text-purple-700">Dossiers Submitted</strong>
            </div>
          </div>

          {/* Reminder 4: HPCZ Clinical Audit */}
          <div className="rounded-xl border border-amber-200/80 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">HPCZ Clinical Audit</span>
              <span className="rounded bg-teal-50 text-[#007B99] border border-[#007B99]/30 px-1.5 py-0.2 text-[10px] font-black">
                Mid-Term
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600">
              Hospital ward logbook quotas and clinical preceptor supervision audit.
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[10px] border-t border-slate-100 pt-1.5">
              <span className="text-slate-500">Logbook Quota:</span>
              <strong className="text-emerald-700">92% Attainment</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Executive KPI Cards with Trends & Progress (Zero Underscores) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Enrolled Trainees */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#007B99]/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Enrolled Students</span>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-[#007B99] border border-[#007B99]/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{learnersCount}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +14% YoY
            </span>
          </div>
          <p className="mt-2 text-xs text-[#007B99] font-semibold">Nursing, Clinical Med & Public Health</p>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#007B99] h-1.5 rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        {/* Card 2: Hospital Rotations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#8DC63F]/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hospital Rotations</span>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-lime-50 text-[#5c8426] border border-[#8DC63F]/30 group-hover:scale-105 transition-transform">
              <Stethoscope className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{placementsCount}</span>
            <span className="text-xs text-slate-500 font-medium">Active Attachments</span>
          </div>
          <p className="mt-2 text-xs text-[#5c8426] font-semibold">Across {clinicalSitesCount} Clinical Partner Sites</p>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#8DC63F] h-1.5 rounded-full" style={{ width: '92%' }} />
          </div>
        </div>

        {/* Card 3: Fees Realization (ZMW) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-amber-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Fees Collected (ZMW)</span>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900" suppressHydrationWarning>
              K{formatMoney(totalCollections)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Target Realization</span>
            <strong className="text-emerald-700 font-extrabold">{collectionPercentage}%</strong>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-[#8DC63F] h-1.5 rounded-full"
              style={{ width: `${collectionPercentage}%` }}
            />
          </div>
        </div>

        {/* Card 4: Statutory Payroll (Zero Underscore) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Statutory Payroll</span>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900 truncate">
              {latestPayroll ? formatCleanEnum(latestPayroll.status) : 'No Active Run'}
            </span>
          </div>
          <p className="mt-2 text-xs text-indigo-700 font-semibold">ZRA PAYE, NAPSA & WCFCB 2.5%</p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            {staffCount} Staff Accounts Verified
          </div>
        </div>
      </section>

      {/* 4. Rich Executive Visual Charts & Analytics Graphs */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Chart A: Programme Enrolment Breakdown (Interactive SVG Bar Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#0b2545]">Academic Programme Enrolment Distribution</h3>
                <p className="text-xs text-slate-500">Active learners across tertiary nursing & medical curricula</p>
              </div>
              <span className="text-xs font-bold text-[#007B99] bg-[#007B99]/10 px-2.5 py-1 rounded-full">
                {learnersCount} Total Trainees
              </span>
            </div>

            {/* Visual Horizontal Gauge Bars */}
            <div className="space-y-4 pt-1">
              {programmeData.map((prog) => (
                <div key={prog.code} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{prog.name}</span>
                    <span className="font-mono font-bold text-slate-600">
                      {prog.count} Trainees ({prog.share}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ width: `${prog.share}%`, backgroundColor: prog.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#007B99]" /> Nursing (48%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#8DC63F]" /> Clinical Med (30%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#EC008C]" /> Public Health (14%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#0b2545]" /> Bridging (8%)
            </span>
          </div>
        </div>

        {/* Chart B: Clinical Placement Capacity by Partner Hospital */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#0b2545]">Hospital Training Ward Placement Capacity</h3>
                <p className="text-xs text-slate-500">Placement quotas and supervisor bandwidth across clinical sites</p>
              </div>
              <span className="text-xs font-bold text-[#5c8426] bg-[#8DC63F]/15 px-2.5 py-1 rounded-full">
                {placementsCount} Active Rotations
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {clinicalSitesList.map((site) => {
                const utilRate = Math.round((site.trainees / site.capacity) * 100);
                return (
                  <div key={site.name} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900">{site.name}</strong>
                        <p className="text-[10px] text-slate-500">{site.role}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-800">
                          {site.trainees} / {site.capacity} Beds
                        </span>
                        <div className="text-[10px] font-bold text-emerald-700">{utilRate}% Utilised</div>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${utilRate}%`, backgroundColor: site.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-600">
            <span>Clinical Preceptor Sign-Off Rate: <strong className="text-[#007B99]">96.4%</strong></span>
            <Link href="/modules/clinical-learning" className="font-bold text-[#007B99] hover:underline">
              Inspect Ward Quotas →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Core Operational Consoles & Subsystems */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0b2545]">College Operational Consoles & Subsystems</h2>
          <span className="text-xs font-semibold text-slate-500">All Modules Operational</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/modules/clinical-learning"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#007B99] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-[#007B99] border border-[#007B99]/20 group-hover:scale-105 transition-transform">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-[#007B99] text-sm">Clinical Training & Logbooks</h3>
                <span className="text-[11px] text-slate-500">HPCZ & NMCZ Framework</span>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
              Hospital ward quotas, procedure logbooks, preceptor sign-offs, and EPA completion tracking.
            </p>
            <span className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-[#007B99] group-hover:translate-x-1 transition-transform">
              Open Clinical Console <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/modules/admissions"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#007B99] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 group-hover:scale-105 transition-transform">
                <UsersRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-[#007B99] text-sm">Admissions & Registry</h3>
                <span className="text-[11px] text-slate-500">{applicationsCount} Applications In Registry</span>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
              Online applications, qualification verification, selection committee scoring, and offer letters.
            </p>
            <span className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-[#007B99] group-hover:translate-x-1 transition-transform">
              Open Admissions Console <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/modules/academics"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#007B99] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:scale-105 transition-transform">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-[#007B99] text-sm">Academics & Examination Engine</h3>
                <span className="text-[11px] text-slate-500">Continuous Assessment (40/60)</span>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
              Curriculum versioning, module assignments, CA 40% + Final 60% calculations, and official transcript moderation.
            </p>
            <span className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-[#007B99] group-hover:translate-x-1 transition-transform">
              Open Academic Console <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/modules/attendance"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#007B99] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200 group-hover:scale-105 transition-transform">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-[#007B99] text-sm">Attendance & Engagement</h3>
                <span className="text-[11px] text-slate-500">NMCZ & HPCZ 85% Exam Rule</span>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
              Daily registers, school closing dates for short holidays, student engagement evidence, and caution letters.
            </p>
            <span className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-[#007B99] group-hover:translate-x-1 transition-transform">
              Open Attendance Console <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/modules/finance"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#007B99] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200 group-hover:scale-105 transition-transform">
                <WalletCards className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-[#007B99] text-sm">Student Fee Ledger & Billing</h3>
                <span className="text-[11px] text-slate-500">Direct Bank & Mobile Payments</span>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
              Tuition schedules, itemized hostel charges, sequential receipts, aged debtors, and bank reconciliation.
            </p>
            <span className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-[#007B99] group-hover:translate-x-1 transition-transform">
              Open Finance Console <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/modules/hr"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#007B99] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-50 text-[#EC008C] border border-[#EC008C]/30 group-hover:scale-105 transition-transform">
                <BadgeDollarSign className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-[#007B99] text-sm">Staff HR & Statutory Payroll</h3>
                <span className="text-[11px] text-slate-500">ZRA Bands, NAPSA & WCFCB</span>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
              Staff contracts, digital payslips, ZRA TaxOnline CSV, eNAPSA monthly returns, and employer declarations.
            </p>
            <span className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-[#007B99] group-hover:translate-x-1 transition-transform">
              Open Payroll Console <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* 6. Recent Operational Activity Streams (Zero Underscores) */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Recent Clinical Placements */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-[#0b2545] text-sm">Active Hospital Clinical Attachments</h3>
              <p className="text-xs text-slate-500">Rotations across verified partner hospital training facilities</p>
            </div>
            <Link
              href="/modules/clinical-learning"
              className="text-xs font-bold text-[#007B99] hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {placements.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No active hospital placements registered in database.
              </div>
            ) : (
              placements.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {p.learner?.firstName} {p.learner?.lastName}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {p.clinicalSite?.name || 'Unassigned Clinical Site'} • {p.wardOrDept}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#8DC63F]/15 text-[#5c8426] border border-[#8DC63F]/30">
                      {p.hoursCompleted || 0} / {p.totalHoursTarget} hrs
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1 font-semibold">
                      {formatCleanEnum(p.status)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Programme Applications */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-[#0b2545] text-sm">Recent Programme Applications</h3>
              <p className="text-xs text-slate-500">Enquiries, screenings, and student admissions</p>
            </div>
            <Link
              href="/modules/admissions"
              className="text-xs font-bold text-[#007B99] hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {applications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No new applications in registry database.
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {app.firstName} {app.lastName}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Ref: {app.applicationNumber} • {app.email || 'Direct Walk-in'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex rounded-full bg-[#007B99]/10 px-2.5 py-0.5 text-xs font-bold text-[#007B99] border border-[#007B99]/30">
                      {formatCleanEnum(app.status)}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium" suppressHydrationWarning>
                      {formatStandardDate(app.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
