'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, WalletCards, ShieldCheck, Check } from 'lucide-react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  learners: Array<{
    id: string;
    studentNumber: string;
    firstName: string;
    lastName: string;
  }>;
  onInvoiceCreated: (newInv: any) => void;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  learners,
  onInvoiceCreated,
}: CreateInvoiceModalProps) {
  if (!isOpen) return null;

  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(learners[0]?.id || '');
  const [semester, setSemester] = useState<string>('Year 1, Semester 1 (2026)');
  const [dueDate, setDueDate] = useState<string>('2026-11-30');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [lines, setLines] = useState([
    { category: 'TUITION', description: 'Semester 1 Tuition Fee', amountZMW: 6500 },
    { category: 'CLINICAL', description: 'Clinical Placement & Hospital Facility Fee', amountZMW: 1800 },
    { category: 'REGISTRATION', description: 'NMCZ / HPCZ Statutory Council Indexing', amountZMW: 1200 },
  ]);

  const totalAmount = lines.reduce((sum, l) => sum + (Number(l.amountZMW) || 0), 0);

  function addPreset(category: string, description: string, amount: number) {
    setLines([...lines, { category, description, amountZMW: amount }]);
  }

  function removeLine(idx: number) {
    setLines(lines.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLearnerId) {
      setErrorMessage('Please select a learner.');
      return;
    }
    if (lines.length === 0) {
      setErrorMessage('Please add at least one line item to the invoice.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/finance/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerId: selectedLearnerId,
          dueDate,
          lines,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onInvoiceCreated(data.data);
        onClose();
      } else {
        setErrorMessage(data.message || 'Failed to create invoice.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with finance server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-600 text-white">
              <WalletCards className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Generate Student Fee Invoice</h3>
              <p className="text-[11px] text-slate-500">Post debit charge to student ledger & billing schedule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-800">
              {errorMessage}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Select Candidate
              </label>
              <select
                value={selectedLearnerId}
                onChange={(e) => setSelectedLearnerId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              >
                {learners.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.firstName} {l.lastName} ({l.studentNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Academic Semester
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Preset Fee Items
              </label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => addPreset('HOSTEL', 'Campus Hostel Accommodation', 2000)}
                  className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                >
                  + Hostel (K2,000)
                </button>
                <button
                  type="button"
                  onClick={() => addPreset('EXAM', 'Semester Examination Fee', 800)}
                  className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                >
                  + Exam Fee (K800)
                </button>
              </div>
            </div>
          </div>

          {/* Line Items List */}
          <div className="mt-4 border-t border-slate-200 pt-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Invoice Fee Item Lines
            </label>
            <div className="mt-2 space-y-2">
              {lines.map((l, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
                  <span className="w-24 rounded bg-slate-200 px-2 py-1 font-bold text-[10px] text-slate-700 text-center uppercase">
                    {l.category}
                  </span>
                  <input
                    type="text"
                    value={l.description}
                    onChange={(e) => {
                      const updated = [...lines];
                      updated[idx].description = e.target.value;
                      setLines(updated);
                    }}
                    className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none"
                  />
                  <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                    <span>K</span>
                    <input
                      type="number"
                      value={l.amountZMW}
                      onChange={(e) => {
                        const updated = [...lines];
                        updated[idx].amountZMW = Number(e.target.value);
                        setLines(updated);
                      }}
                      className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-right focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-cyan-50 p-3 text-cyan-950">
              <span className="text-xs font-black uppercase tracking-wider">Total Invoice Sum (ZMW):</span>
              <span className="font-mono text-lg font-black">K{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? 'Generating Invoice...' : 'Generate & Post Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
