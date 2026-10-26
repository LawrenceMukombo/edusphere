'use client';

import { useState } from 'react';
import { CheckCircle2, CirclePlus, LoaderCircle, Save, TriangleAlert } from 'lucide-react';

type RecordItem = { id: string; title: string; status: string; summary: string; updatedAt: Date };

export function ModuleConsole({ slug, title, initialRecords }: { slug: string; title: string; initialRecords: RecordItem[] }) {
  const [records, setRecords] = useState(initialRecords);
  const [form, setForm] = useState({ title: '', status: 'OPEN', summary: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const response = await fetch(`/api/modules/${slug}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form)
    });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(payload.message ?? 'Could not save the record. Sign in as an institution administrator to make changes.');
      return;
    }
    setRecords((current) => [{ ...payload.data, updatedAt: new Date(payload.data.updatedAt) }, ...current]);
    setForm({ title: '', status: 'OPEN', summary: '' });
    setMessage('Record saved.');
  }

  async function markComplete(record: RecordItem) {
    setBusy(true);
    setMessage(null);
    const response = await fetch(`/api/modules/${slug}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: record.id, status: 'COMPLETED' })
    });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(payload.message ?? 'Could not update the record.');
      return;
    }
    setRecords((current) => current.map((item) => (item.id === record.id ? { ...payload.data, updatedAt: new Date(payload.data.updatedAt) } : item)));
    setMessage('Record marked completed.');
  }

  return (
    <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
      {/* Records Listing */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-800">{title}</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Records & Operational Logs</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {records.length} records
          </span>
        </div>
        <div className="mt-5 space-y-3">
          {records.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No records found. Submit a new operational record using the panel alongside.
            </p>
          ) : (
            records.map((record) => (
              <article key={record.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition hover:border-slate-300">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{record.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{record.summary}</p>
                  </div>
                  <span
                    className={`rounded px-2.5 py-1 text-xs font-bold ${
                      record.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500" suppressHydrationWarning>Updated {new Date(record.updatedAt).toLocaleDateString('en-GB')}</span>
                  {record.status !== 'COMPLETED' && (
                    <button
                      disabled={busy}
                      onClick={() => markComplete(record)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} /> Mark completed
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {/* Add Record Form */}
      <form onSubmit={createRecord} className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-center gap-2 text-teal-800">
          <CirclePlus size={19} />
          <h2 className="font-bold text-slate-900">Add Operational Record</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">Create an institutional record for {title.toLowerCase()}.</p>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Title
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            placeholder="Record title"
          />
        </label>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Status
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          >
            <option>OPEN</option>
            <option>IN_PROGRESS</option>
            <option>AWAITING_REVIEW</option>
            <option>COMPLETED</option>
          </select>
        </label>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Summary / Narrative
          <textarea
            required
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="mt-1 min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            placeholder="What needs to be recorded?"
          />
        </label>

        {message && (
          <p
            className={`mt-4 flex gap-2 text-sm ${
              message === 'Record saved.' || message === 'Record marked completed.' ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            <TriangleAlert size={16} className="mt-0.5 shrink-0" />
            {message}
          </p>
        )}

        <button
          disabled={busy}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-50"
        >
          {busy ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}
          {busy ? 'Saving…' : 'Save Record'}
        </button>
      </form>
    </section>
  );
}
