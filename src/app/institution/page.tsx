import Link from 'next/link';
import { ArrowLeft, Building2, Database, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function InstitutionPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-700">
              <Building2 size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Fully Accredited
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">College Record</span>
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
                North Western University College of Health and Applied Sciences (NWUCHAS)
              </h1>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Official institutional profile and regulatory registry. Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia.
              </p>
            </div>
          </div>

          <dl className="mt-8 divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden text-xs">
            <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-3 bg-slate-50/50">
              <dt className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Institution Code</dt>
              <dd className="sm:col-span-2 font-mono font-semibold text-slate-800">NWUCHAS-ZM</dd>
            </div>
            <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-3">
              <dt className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Campus Location</dt>
              <dd className="sm:col-span-2 text-slate-800">Main Campus, Manyama, Lumwana, North-Western Province</dd>
            </div>
            <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-3 bg-slate-50/50">
              <dt className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Regulatory Bodies</dt>
              <dd className="sm:col-span-2 text-slate-800">
                Nursing and Midwifery Council of Zambia (NMCZ) & Health Professions Council of Zambia (HPCZ)
              </dd>
            </div>
            <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-3">
              <dt className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">System Status</dt>
              <dd className="sm:col-span-2 font-semibold text-emerald-700">Operational — Integrated CMIS Platform</dd>
            </div>
          </dl>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <Database className="text-emerald-700" size={20} />
              <h2 className="mt-2 text-xs font-bold text-slate-900">Dedicated College Database</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Independent PostgreSQL PostGIS database ensuring zero data contamination and tenant isolation.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <ShieldCheck className="text-emerald-700" size={20} />
              <h2 className="mt-2 text-xs font-bold text-slate-900">HEA & Statutory Regulatory Standard Compliant</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Standardized enterprise layout, accessible O-Level verification, and secure payment reconciliation.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/api/docs"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition"
            >
              <FileText size={15} /> View System API Endpoints
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              Back to Overview
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
