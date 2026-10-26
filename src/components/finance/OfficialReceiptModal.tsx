'use client';

import React from 'react';
import { X, Printer, ShieldCheck, Receipt, CheckCircle2 } from 'lucide-react';
import { NwuchasEmblemSvg, NWUCHAS_IDENTITY } from '@/components/NwuchasLogo';

interface OfficialReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: {
    receiptNumber: string;
    studentName: string;
    studentNumber: string;
    programme: string;
    date: string;
    amountZMW: number;
    amountInWords?: string;
    paymentMethod: string;
    reference: string;
    allocations: Array<{
      item: string;
      amountZMW: number;
    }>;
    invoiceNumber: string;
    remainingBalanceZMW: number;
    cashierName: string;
  };
}

export function OfficialReceiptModal({
  isOpen,
  onClose,
  receipt,
}: OfficialReceiptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
              <Receipt className="h-4 w-4 text-emerald-600" /> Official Fee Receipt
            </span>
            <span className="text-xs font-mono text-slate-500">{receipt.receiptNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
            >
              <Printer className="h-4 w-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Body */}
        <div className="p-8 sm:p-10 print:p-0">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 text-center">
            <div className="mx-auto flex justify-center mb-2">
              <NwuchasEmblemSvg size={52} />
            </div>
            <h1 className="mt-2 text-lg font-black uppercase tracking-wider text-[#8DC63F] font-sans">
              North Western University College
            </h1>
            <h2 className="text-xs font-black tracking-wider text-[#007B99] font-sans mt-0.5">
              OF HEALTH AND APPLIED SCIENCES
            </h2>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
              Bursar's Office • Official Financial Receipt
            </p>
            <p className="text-[10px] text-slate-500 font-sans">
              {NWUCHAS_IDENTITY.address} • Tel: {NWUCHAS_IDENTITY.primaryPhone}
            </p>
            <div className="mt-3 inline-block rounded-full bg-emerald-50 border border-emerald-300 px-4 py-1 text-xs font-black uppercase tracking-widest text-emerald-800">
              Official Student Fee Payment Receipt
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase">Receipt Number:</span>
              <p className="mt-0.5 font-mono font-extrabold text-emerald-800">{receipt.receiptNumber}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Payment Date:</span>
              <p className="mt-0.5 font-extrabold text-slate-900">{receipt.date}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Received From:</span>
              <p className="mt-0.5 font-extrabold text-slate-900">{receipt.studentName}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Student Number:</span>
              <p className="mt-0.5 font-mono font-extrabold text-slate-900">{receipt.studentNumber}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Programme:</span>
              <p className="mt-0.5 font-extrabold text-slate-900">{receipt.programme}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Payment Rail & Ref:</span>
              <p className="mt-0.5 font-mono font-extrabold text-cyan-800">
                {receipt.paymentMethod} • {receipt.reference}
              </p>
            </div>
          </div>

          {/* Amount Box */}
          <div className="mt-5 rounded-xl border border-emerald-300 bg-emerald-50/60 p-4 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Amount Received in Words & Figures
            </span>
            <div className="mt-1 font-mono text-3xl font-black text-emerald-900">
              ZMW {receipt.amountZMW.toLocaleString()}.00
            </div>
            <p className="mt-1 text-xs font-serif italic text-emerald-800">
              {receipt.amountInWords || 'Kwacha — Official College Cashier Acknowledged'}
            </p>
          </div>

          {/* Allocations Breakdown */}
          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="py-2 px-3">Item / Category Allocated</th>
                  <th className="py-2 px-3 text-right">Amount Allocated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {receipt.allocations.map((alloc, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-semibold text-slate-800">{alloc.item}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      K{alloc.amountZMW.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-xs divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3 text-slate-600 uppercase">Target Invoice:</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-800">{receipt.invoiceNumber}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-cyan-900 uppercase font-black">Remaining Balance Due:</td>
                  <td className="py-2 px-3 text-right font-mono font-black text-cyan-900">
                    K{receipt.remainingBalanceZMW.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer & Cashier Endorsement */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-300 pt-5 text-xs text-slate-600">
            <div>
              <p>Issued by Cashier: <strong>{receipt.cashierName}</strong></p>
              <p className="mt-0.5 text-[10px] text-slate-500">LamtonPay Auto-Reconciliation Hash: {receipt.reference}</p>
            </div>
            <div className="text-right">
              <div className="inline-block rounded border border-emerald-400 bg-emerald-50 px-3 py-1 font-mono text-[10px] font-bold text-emerald-800">
                AUTHENTICATED RECEIPT • CMIS-VERIFIED
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
