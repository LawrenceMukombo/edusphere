'use client';

import { X, Printer, ShieldCheck, CheckCircle2, Smartphone, Building2 } from 'lucide-react';

interface PaymentReceiptModalProps {
  intent: any;
  onClose: () => void;
}

export function PaymentReceiptModal({ intent, onClose }: PaymentReceiptModalProps) {
  if (!intent) return null;

  const learner = intent.learner || {};
  const invoice = intent.invoice || {};
  const amount = Number(intent.amountZMW || 0);
  const channelLabel =
    intent.channel === 'MTN_MOMO'
      ? 'MTN Mobile Money Zambia'
      : intent.channel === 'AIRTEL_MONEY'
      ? 'Airtel Money Zambia'
      : 'Card / Electronic Bank Transfer';

  const receiptRef = intent.providerReference || `TXN-${intent.businessReference}`;
  const securityHash = `LP-SEC-${(intent.businessReference + amount.toFixed(2)).split('').reduce((a, b) => (a * 31 + b.charCodeAt(0)) >>> 0, 0).toString(16).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:static print:bg-white print:p-0">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border-4 border-double border-slate-300 print:max-h-none print:border-none print:p-0 print:shadow-none">
        
        {/* Anti-Counterfeit Background Watermark */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-[0.035] print:opacity-[0.05]">
          <div className="absolute -inset-10 flex flex-wrap items-center justify-around gap-12 rotate-[-25deg] text-[10px] font-black tracking-widest text-slate-900 uppercase">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className="whitespace-nowrap font-mono">
                LAMTONPAY CONNECT • OFFICIAL DISBURSEMENT RECORD • NWUCHAS REVENUE •
              </span>
            ))}
          </div>
        </div>

        {/* Modal Controls */}
        <div className="relative z-10 mb-4 flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified Gateway Voucher
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
            >
              <Printer className="h-3.5 w-3.5" /> Print Voucher
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Body */}
        <div className="relative z-10 space-y-5 text-slate-900 print:space-y-4">
          
          {/* Institutional Header */}
          <div className="border-b-2 border-slate-800 pb-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-700 text-white font-extrabold text-lg shadow">
                NW
              </div>
              <div className="text-left">
                <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
                  North Western University College of Health and Applied Sciences
                </h1>
                <p className="text-[11px] font-medium text-slate-600">
                  Manyama & Solwezi Campuses, Zambia • Directorate of Finance & Bursary
                </p>
              </div>
            </div>
            <div className="mt-3 inline-block rounded-md bg-slate-100 px-3 py-1 text-xs font-bold tracking-wider text-slate-800 uppercase border border-slate-300">
              LamtonPay Gateway Settlement Voucher
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Business Reference</p>
              <p className="font-mono font-bold text-slate-900 text-sm">{intent.businessReference}</p>
              <p className="text-[11px] text-slate-500 mt-1">Provider Ref: <span className="font-mono font-semibold text-slate-800">{receiptRef}</span></p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-medium">Date & Settlement Time</p>
              <p className="font-semibold text-slate-900">{new Date(intent.settledAt || intent.createdAt).toLocaleString()}</p>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">Channel: {channelLabel}</p>
            </div>
          </div>

          {/* Student & Invoice Allocation Details */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Student Name:</span>
              <span className="font-bold text-slate-900">{learner.firstName || intent.payerName} {learner.lastName || ''}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Student ID / Number:</span>
              <span className="font-mono font-semibold text-cyan-800">{learner.studentNumber || 'PENDING'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Payer Mobile Number:</span>
              <span className="font-mono font-medium text-slate-800">{intent.payerPhone || 'Direct'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Number Allocated:</span>
              <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber || 'Direct Payment'}</span>
            </div>
          </div>

          {/* Amount Settled Banner */}
          <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/80 p-4 text-emerald-950 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Total Confirmed Settlement</p>
              <p className="text-[11px] text-emerald-700">Allocated to student fee ledger</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono tracking-tight text-emerald-800">
                K{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Security & Verification Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>LAMTONPAY CONNECT IDEMPOTENCY KEY: {intent.idempotencyKey?.slice(0, 20)}</span>
            <span className="font-bold text-emerald-700">SETTLED & VERIFIED</span>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1 text-center">
            <div className="h-8 w-8 rounded-full border border-cyan-800 flex items-center justify-center text-[7.5px] font-black uppercase text-cyan-900 bg-cyan-50">
              SEAL
            </div>
            <p className="text-[10px] text-slate-500 font-mono">VALIDATION HASH: {securityHash}</p>
          </div>

        </div>

      </div>
    </div>
  );
}
