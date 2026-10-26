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
} from 'lucide-react';
import { prisma } from '@/server/db';
import { formatStandardDate, formatMoney } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

export default async function CollegeExecutiveDashboard() {
  const org = await prisma.organisation.findFirst({
    where: { code: 'NWUCHAS' },
    include: {
      campuses: true,
      clinicalSites: { include: { supervisors: true } },
    },
  });

  const learnersCount = await prisma.learner.count({
    where: { organisationId: org?.id },
  });

  const clinicalSitesCount = await prisma.clinicalSite.count({
    where: { organisationId: org?.id },
  });

  const placementsCount = await prisma.clinicalPlacement.count({
    where: { organisationId: org?.id },
  });

  const applicationsCount = await prisma.admissionApplication.count({
    where: { organisationId: org?.id },
  });

  const latestRuns = await prisma.payrollRun.findMany({
    where: { organisationId: org?.id },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });
  const latestPayroll = latestRuns[0] || null;

  const paymentsSum = await prisma.payment.aggregate({
    where: { organisationId: org?.id },
    _sum: { amount: true },
  });
  const totalCollections = Number(paymentsSum._sum.amount || 0);

  const applications = await prisma.admissionApplication.findMany({
    where: { organisationId: org?.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const placements = await prisma.clinicalPlacement.findMany({
    where: { organisationId: org?.id },
    include: { learner: true, clinicalSite: true },
    orderBy: { startDate: 'desc' },
    take: 5,
  });

  return (
    <div className="space-y-8">
      {/* Executive Command Center Banner */}
      <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
                Executive Command Center • Authenticated Portal
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                Live Database Telemetry
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              North Western University College of Health and Applied Sciences
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-[#007B99] font-medium">
              <MapPin className="h-4 w-4 shrink-0 text-[#007B99]" />
              Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Dedicated College Management Information System (NWUCHAS-CMIS) executive overview providing unified clinical rotations,
              OSCE and examinations, student fee ledgers, mobile collections, and Zambian statutory payroll compliance.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/modules/clinical-learning"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-900"
            >
              <HeartPulse className="h-4 w-4" />
              Clinical Logbook & EPA
            </Link>
            <Link
              href="/modules/finance"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <WalletCards className="h-4 w-4 text-slate-600" />
              Fee Ledger & Receipts
            </Link>
            <Link
              href="/modules/admissions"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <UsersRound className="h-4 w-4 text-slate-600" />
              Admissions Console
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Cards — Pure Database-Backed (No Synthetic Fallback Numbers) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled Students</span>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{learnersCount}</span>
            <span className="text-xs text-slate-500">Active Trainees</span>
          </div>
          <p className="mt-2 text-xs text-cyan-700 font-medium">Nursing, Clinical Med & Public Health</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hospital Rotations</span>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Stethoscope className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{placementsCount}</span>
            <span className="text-xs text-slate-500">Active Rotations</span>
          </div>
          <p className="mt-2 text-xs text-emerald-700 font-medium">Across {clinicalSitesCount} Clinical Partner Sites</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fees Collected (ZMW)</span>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900" suppressHydrationWarning>
              K{formatMoney(totalCollections)}
            </span>
          </div>
          <p className="mt-2 text-xs text-amber-700 font-medium">Direct Bank & Mobile Payments</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Statutory Payroll</span>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {latestPayroll ? latestPayroll.status : 'NO ACTIVE RUN'}
            </span>
          </div>
          <p className="mt-2 text-xs text-indigo-700 font-medium">ZRA PAYE, NAPSA & WCFCB 2.5%</p>
        </div>
      </section>

      {/* Core Operational Hubs Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">College Operational Consoles & Subsystems</h2>
          <span className="text-xs font-semibold text-slate-500">All Functional Modules Operational</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/modules/clinical-learning"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-cyan-600 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-cyan-700">Clinical Training & Logbooks</h3>
                <span className="text-xs text-slate-500">HPCZ & NMCZ Competency Framework</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Hospital ward quotas, procedure logbooks, preceptor sign-offs, and EPA completion tracking.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-700 group-hover:translate-x-1 transition-transform">
              Open Clinical Console <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/modules/admissions"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-cyan-600 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                <UsersRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-cyan-700">Admissions & Registry</h3>
                <span className="text-xs text-slate-500">{applicationsCount} Applications In Registry</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Online applications, qualification verification, selection committee scoring, offers, and student indexing.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-700 group-hover:translate-x-1 transition-transform">
              Open Admissions Console <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/modules/academics"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-cyan-600 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-cyan-700">Academics & Examination Engine</h3>
                <span className="text-xs text-slate-500">Continuous Assessment (40/60) & OSCE</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Curriculum versioning, module assignments, CA 40% + Final 60% calculations, and official transcript moderation.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-700 group-hover:translate-x-1 transition-transform">
              Open Academic Console <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/modules/attendance"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-cyan-600 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-cyan-700">Attendance & Engagement</h3>
                <span className="text-xs text-slate-500">NMCZ & HPCZ 85% Exam Rule</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Daily lecture and ward attendance registers, student engagement evidence, medical excuses, and caution letters.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-700 group-hover:translate-x-1 transition-transform">
              Open Attendance Console <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/modules/finance"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-cyan-600 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                <WalletCards className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-cyan-700">Student Fee Ledger & Billing</h3>
                <span className="text-xs text-slate-500">Double-Entry Account Postings</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Tuition schedules, itemized hostel charges, sequential receipts, aged debtors, and bank reconciliation.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-700 group-hover:translate-x-1 transition-transform">
              Open Finance Console <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/modules/hr"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-cyan-600 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-violet-700 border border-violet-200">
                <BadgeDollarSign className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-cyan-700">Staff HR & Statutory Payroll</h3>
                <span className="text-xs text-slate-500">ZRA Bands, NAPSA & WCFCB</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Staff contracts, digital payslips, ZRA TaxOnline CSV, eNAPSA monthly returns, and WCFCB employer declarations.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-700 group-hover:translate-x-1 transition-transform">
              Open Payroll Console <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/modules/operations"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-cyan-600 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-cyan-700">Campus Operations & Hostels</h3>
                <span className="text-xs text-slate-500">Student Hostels & Resources</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Hostel allocations, campus security, student transportation, and facilities maintenance.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-700 group-hover:translate-x-1 transition-transform">
              Open Operations Console <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* Two-Column Operational Activity View */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Recent Clinical Placements */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900">Active Hospital Clinical Attachments</h3>
              <p className="text-xs text-slate-500">Rotations across verified partner hospital training facilities</p>
            </div>
            <Link
              href="/modules/clinical-learning"
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800"
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
                    <div className="text-xs text-slate-500">
                      {p.clinicalSite?.name || 'Unassigned Clinical Site'} • {p.wardOrDept}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {p.hoursCompleted || 0} / {p.totalHoursTarget} hrs
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">{p.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Admissions Stream */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900">Recent Programme Applications</h3>
              <p className="text-xs text-slate-500">Enquiries, screenings, and student admissions</p>
            </div>
            <Link
              href="/modules/admissions"
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800"
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
                    <div className="text-xs text-slate-500">
                      Ref: {app.applicationNumber} • {app.email || 'Direct Walk-in'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-bold text-cyan-800 border border-cyan-200">
                      {app.status}
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
