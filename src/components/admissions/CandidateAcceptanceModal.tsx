'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Application } from '../modules/AdmissionsConsole';

interface CandidateAcceptanceModalProps {
  application: Application;
  onClose: () => void;
  onAccepted: (updated: Application) => void;
}

export function CandidateAcceptanceModal({
  application,
  onClose,
  onAccepted,
}: CandidateAcceptanceModalProps) {
  const [paymentChannel, setPaymentChannel] = useState<'MTN_MONEY' | 'AIRTEL_MONEY' | 'ZANACO_BANK' | 'CASHIER'>('MTN_MONEY');
  const [amountPaid, setAmountPaid] = useState<number>(4400);
  const [paymentReference, setPaymentReference] = useState<string>('MTN-ZM-TXN-' + Math.floor(100000 + Math.random() * 900000));
  const [payerPhone, setPayerPhone] = useState<string>(application.phone || '+260977000000');
  const [remarks, setRemarks] = useState<string>('Provisional acceptance tuition deposit payment confirmed.');
  const [declaration, setDeclaration] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!declaration) {
      setError('Please certify that the payment details are accurate.');
      return;
    }
    if (!paymentReference.trim()) {
      setError('Please provide the transaction reference or deposit slip number.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const res = await fetch(`/api/admissions/${application.id}/accept`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          paymentChannel,
          amountPaid,
          paymentReference: paymentReference.trim(),
          payerPhone: payerPhone.trim(),
          remarks: remarks.trim(),
        }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.message || 'Failed to submit candidate acceptance.');
      }

      onAccepted(payload.data);
    } catch (err: any) {
      setError(err.message || 'Network submission error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 text-slate-900">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Accept Provisional Admission Offer</h3>
            <p className="text-xs text-slate-500 font-mono">
              {application.applicationNumber} • {application.firstName} {application.lastName}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1">
            <span className="text-slate-500 block font-bold uppercase tracking-wider text-[11px]">Programme Admitted</span>
            <p className="font-bold text-slate-900 text-sm">{application.programmeChoice}</p>
            <p className="text-[11px] font-semibold text-emerald-800">{application.intakeLabel} Intake</p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1.5">
              Select Tuition Deposit Payment Channel *
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { id: 'MTN_MONEY', label: 'MTN MoMo' },
                { id: 'AIRTEL_MONEY', label: 'Airtel Money' },
                { id: 'ZANACO_BANK', label: 'ZANACO Bank' },
                { id: 'CASHIER', label: 'Campus Bursary' },
              ].map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setPaymentChannel(ch.id as any)}
                  className={`rounded-lg border p-2 text-center font-bold text-[11px] transition ${
                    paymentChannel === ch.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-2xs'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">Amount Paid (ZMW) *</label>
              <input
                type="number"
                required
                min={1000}
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 font-mono font-bold text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Minimum commitment: ZMW 4,400.00</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">Payer Mobile Phone</label>
              <input
                type="text"
                value={payerPhone}
                onChange={(e) => setPayerPhone(e.target.value)}
                placeholder="e.g. +260977123456"
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none font-mono transition shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
              Payment Transaction Reference / Deposit Slip Number *
            </label>
            <input
              type="text"
              required
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g. MTN-ZM-TXN-8491029 or ZANACO-DEP-49102"
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none font-mono transition shadow-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">Candidate Remarks (Optional)</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Paid first semester deposit via MTN MoMo. Ready for hostel allocation."
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={declaration}
                onChange={(e) => setDeclaration(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-0"
              />
              <span className="text-slate-700 text-[11px] leading-tight font-medium">
                I formally confirm acceptance of the Provisional Offer of Admission into NWUCHAS for the 2026 Academic Year and certify that the payment details provided above are accurate.
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-5 py-2 font-bold text-white hover:bg-emerald-800 disabled:opacity-50 transition shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              {busy ? 'Submitting Acceptance…' : 'Confirm Acceptance & Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
