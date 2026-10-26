'use client';

import React from 'react';
import { X, Printer, ShieldCheck, WalletCards, Building, CheckCircle2 } from 'lucide-react';
import { NwuchasEmblemSvg, NWUCHAS_IDENTITY } from '@/components/NwuchasLogo';

interface OfficialInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
}

export function OfficialInvoiceModal({
  isOpen,
  onClose,
  invoice,
}: OfficialInvoiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Modal Controls (Hidden on Print) */}
        <div className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-cyan-100 px-2.5 py-1 text-xs font-bold text-cyan-800">
              <WalletCards className="h-4 w-4 text-cyan-600" /> Student Fee Invoice
            </span>
            <span className="text-xs text-slate-500 font-mono">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-700"
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

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 print:p-0">
          {/* Institution Header */}
          <div className="border-b-2 border-slate-900 pb-6 text-center">
            <div className="mx-auto flex justify-center mb-2">
              <NwuchasEmblemSvg size={58} />
            </div>
            <h1 className="mt-2 text-xl font-black uppercase tracking-wider text-[#8DC63F] sm:text-2xl font-sans">
              North Western University College
            </h1>
            <h2 className="text-xs sm:text-sm font-black tracking-wider text-[#007B99] font-sans mt-0.5">
              OF HEALTH AND APPLIED SCIENCES
            </h2>
            <p className="mt-1 text-xs font-semibold tracking-widest uppercase text-slate-600">
              Department of Finance &amp; Accounts • Student Fee Ledger Office
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 font-sans">
              {NWUCHAS_IDENTITY.address} • Tel: {NWUCHAS_IDENTITY.primaryPhone}
            </p>
            <div className="mt-3 inline-block rounded-full bg-slate-100 px-4 py-1 text-xs font-black uppercase tracking-widest text-slate-800">
              Official Student Fee Invoice & Payment Schedule
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs sm:grid-cols-4">
            <div>
              <span className="font-bold text-slate-500 uppercase">Student Name:</span>
              <p className="mt-0.5 font-extrabold text-slate-900">{invoice.studentName}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Student Number:</span>
              <p className="mt-0.5 font-mono font-extrabold text-slate-900">{invoice.studentNumber}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Programme:</span>
              <p className="mt-0.5 font-extrabold text-slate-900">{invoice.programme}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Semester / Term:</span>
              <p className="mt-0.5 font-extrabold text-slate-900">{invoice.semester}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Invoice Number:</span>
              <p className="mt-0.5 font-mono font-extrabold text-cyan-800">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Date Issued:</span>
              <p className="mt-0.5 font-extrabold text-slate-900">{invoice.issuedDate}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Due Date:</span>
              <p className="mt-0.5 font-extrabold text-rose-700">{invoice.dueDate}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Status:</span>
              <p className="mt-0.5">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    invoice.status === 'FULLY_PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : invoice.status === 'PARTIALLY_PAID'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {invoice.status}
                </span>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-4">Description of Fee Item</th>
                  <th className="py-2.5 px-4 text-right">Amount (ZMW)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {(invoice.lines || []).map((line: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                        {line.category || 'FEES'}
                      </span>
                    </td>
                    <td className="py-2 px-4 font-semibold text-slate-800">{line.description}</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                      K{Number(line.amountZMW ?? line.lineTotal ?? line.unitPrice ?? line.amount ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-xs divide-y divide-slate-200">
                <tr>
                  <td colSpan={3} className="py-2.5 px-4 text-right text-slate-600 uppercase">
                    Total Amount Invoiced:
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-extrabold text-slate-900">
                    K{Number(invoice.totalZMW ?? invoice.totalAmount ?? 0).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-2 px-4 text-right text-emerald-700 uppercase">
                    Amount Paid to Date:
                  </td>
                  <td className="py-2 px-4 text-right font-mono font-bold text-emerald-700">
                    - K{Number(invoice.paidZMW ?? invoice.paidAmount ?? 0).toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-cyan-50/70 text-sm">
                  <td colSpan={3} className="py-3 px-4 text-right font-black text-cyan-950 uppercase">
                    Outstanding Balance Due:
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-cyan-950">
                    K{Number(invoice.balanceZMW ?? invoice.balance ?? 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Instructions & Banking Rails */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
            <h4 className="font-extrabold uppercase tracking-wider text-slate-800">
              Official Banking & Mobile Payment Channels
            </h4>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="font-bold text-slate-900">ZANACO Billmaster</p>
                <p className="mt-1 text-[11px] text-slate-500">Account: <strong>5819382019482</strong></p>
                <p className="text-[11px] text-slate-500">Branch: <strong>Solwezi Commercial</strong></p>
                <p className="text-[11px] text-slate-500">Ref: <strong>{invoice.studentNumber}</strong></p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="font-bold text-slate-900">Airtel Money Paybill</p>
                <p className="mt-1 text-[11px] text-slate-500">Business No: <strong>891244</strong></p>
                <p className="text-[11px] text-slate-500">Account Name: <strong>NWUCHAS CMIS</strong></p>
                <p className="text-[11px] text-slate-500">Ref: <strong>{invoice.studentNumber}</strong></p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="font-bold text-slate-900">MTN MoMo Merchant</p>
                <p className="mt-1 text-[11px] text-slate-500">Merchant Code: <strong>039182</strong></p>
                <p className="text-[11px] text-slate-500">Account Name: <strong>NWUCHAS CMIS</strong></p>
                <p className="text-[11px] text-slate-500">Ref: <strong>{invoice.studentNumber}</strong></p>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-slate-500 italic">
              Always quote the candidate student number ({invoice.studentNumber}) as reference. Payments reflect in the ledger within 15 minutes via LamtonPay integration.
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-10 grid grid-cols-2 gap-8 border-t border-slate-300 pt-6 text-center text-xs">
            <div>
              <div className="h-8 border-b border-dashed border-slate-400 font-serif italic text-slate-700 flex items-end justify-center pb-1">
                Mr. Clement Banda, CA(Z)
              </div>
              <p className="mt-1 font-bold text-slate-900">College Bursar & Chief Financial Officer</p>
            </div>
            <div>
              <div className="h-8 border-b border-dashed border-slate-400 font-serif italic text-slate-700 flex items-end justify-center pb-1">
                Dr. George Silwamba
              </div>
              <p className="mt-1 font-bold text-slate-900">Academic Registrar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
