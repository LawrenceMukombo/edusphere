'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';

interface CreateJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJournalCreated: (journal: any) => void;
}

export function CreateJournalModal({
  isOpen,
  onClose,
  onJournalCreated,
}: CreateJournalModalProps) {
  if (!isOpen) return null;

  const [reference, setReference] = useState<string>(
    `JV-2026-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [description, setDescription] = useState<string>(
    'End-of-Month Fee Recognition & Clinical Facility Amortization'
  );
  const [lines, setLines] = useState([
    { account: '1200 - Accounts Receivable: Student Fee Ledger', debit: 18500, credit: 0 },
    { account: '4010 - Revenue: Tuition Fees', debit: 0, credit: 12000 },
    { account: '4020 - Revenue: Clinical Rotations & Skills Lab', debit: 0, credit: 6500 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const totalDebits = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredits = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const variance = Math.abs(totalDebits - totalCredits);
  const isBalanced = variance < 0.01 && totalDebits > 0;

  function addLine() {
    setLines([...lines, { account: '1010 - Cash & Bank: ZANACO Operational', debit: 0, credit: 0 }]);
  }

  function removeLine(idx: number) {
    setLines(lines.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isBalanced) {
      setErrorMessage(`Journal entry is out of balance by ZMW ${variance.toFixed(2)}. Debits must equal credits.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/finance/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          description,
          lines,
          postedBy: 'Clement Banda, Bursar',
        }),
      });

      const data = await res.json();
      if (data.success) {
        onJournalCreated(data.data);
        onClose();
      } else {
        setErrorMessage(data.message || 'Failed to post journal entry.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error posting journal.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
              <BookOpen className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Post General Journal Voucher (Double-Entry)</h3>
              <p className="text-[11px] text-slate-500">Enforces Total Debits == Total Credits balancing rule</p>
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
                Journal Voucher #
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-bold text-slate-800 focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Posting Date
              </label>
              <input
                type="date"
                defaultValue="2026-10-24"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Transaction Narration / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {/* Line items table */}
          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Double-Entry Ledger Lines
              </label>
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                <Plus className="h-3 w-3" /> Add Account Line
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {lines.map((l, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
                  <select
                    value={l.account}
                    onChange={(e) => {
                      const updated = [...lines];
                      updated[idx].account = e.target.value;
                      setLines(updated);
                    }}
                    className="flex-1 rounded border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="1010 - Cash & Bank: ZANACO Operational">1010 - Cash & Bank: ZANACO Operational</option>
                    <option value="1020 - Mobile Money: Airtel Paybill">1020 - Mobile Money: Airtel Paybill</option>
                    <option value="1030 - Mobile Money: MTN Merchant">1030 - Mobile Money: MTN Merchant</option>
                    <option value="1200 - Accounts Receivable: Student Fee Ledger">1200 - Accounts Receivable: Student Fee Ledger</option>
                    <option value="2010 - Accounts Payable: Vendors">2010 - Accounts Payable: Vendors</option>
                    <option value="4010 - Revenue: Tuition Fees">4010 - Revenue: Tuition Fees</option>
                    <option value="4020 - Revenue: Clinical Rotations & Skills Lab">4020 - Revenue: Clinical Rotations & Skills Lab</option>
                    <option value="4030 - Revenue: Statutory Indexing & Examination">4030 - Revenue: Statutory Indexing & Examination</option>
                    <option value="5010 - Clinical Teaching & Hospital Quota Expense">5010 - Clinical Teaching & Hospital Quota Expense</option>
                  </select>

                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-[10px] text-slate-500 font-bold">DR:</span>
                    <input
                      type="number"
                      value={l.debit}
                      onChange={(e) => {
                        const updated = [...lines];
                        updated[idx].debit = Number(e.target.value);
                        if (Number(e.target.value) > 0) updated[idx].credit = 0;
                        setLines(updated);
                      }}
                      className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-right focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-[10px] text-slate-500 font-bold">CR:</span>
                    <input
                      type="number"
                      value={l.credit}
                      onChange={(e) => {
                        const updated = [...lines];
                        updated[idx].credit = Number(e.target.value);
                        if (Number(e.target.value) > 0) updated[idx].debit = 0;
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

            {/* Balancing Verification Banner */}
            <div
              className={`mt-4 flex items-center justify-between rounded-xl p-3 text-xs font-bold ${
                isBalanced
                  ? 'border border-emerald-300 bg-emerald-50 text-emerald-900'
                  : 'border border-rose-300 bg-rose-50 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                )}
                <span>
                  {isBalanced
                    ? 'Journal is Perfectly Balanced (Double-Entry Validated)'
                    : `Imbalanced: Out by ZMW ${variance.toFixed(2)}`}
                </span>
              </div>
              <div className="flex gap-4 font-mono">
                <span>Total Debits: K{totalDebits.toLocaleString()}</span>
                <span>Total Credits: K{totalCredits.toLocaleString()}</span>
              </div>
            </div>
          </div>

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
              disabled={!isBalanced || isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-40"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSubmitting ? 'Posting Voucher...' : 'Post Balanced Journal Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
