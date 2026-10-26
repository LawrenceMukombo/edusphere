'use client';

import React from 'react';
import { X, Printer, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Application } from '../modules/AdmissionsConsole';
import { NwuchasEmblemSvg, NWUCHAS_IDENTITY } from '@/components/NwuchasLogo';

interface ProvisionalOfferLetterModalProps {
  application: Application;
  onClose: () => void;
  onAccept?: () => void;
}

export function ProvisionalOfferLetterModal({
  application,
  onClose,
  onAccept,
}: ProvisionalOfferLetterModalProps) {
  const meta = application.statusHistory?.find((h) => h.metadataJson)?.metadataJson
    ? JSON.parse(application.statusHistory.find((h) => h.metadataJson)!.metadataJson!)
    : {};

  const refNumber = `NWU/ADM/OFFER/2026/${application.applicationNumber.replace('NWU-APP-', '')}`;
  const issueDate = application.decisionAt
    ? new Date(application.decisionAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 print:p-0 print:bg-white">
      <div className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-10 text-slate-900 print:max-h-none print:w-full print:border-none print:p-8">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition print:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Action Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <Award className="h-4 w-4 text-emerald-700" /> Official Provisional Admission Offer
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" /> Print Offer Letter
            </button>
            {onAccept && application.status === 'OFFERED' && (
              <button
                onClick={onAccept}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Accept Offer &amp; Pay Deposit →
              </button>
            )}
          </div>
        </div>

        {/* Printable Official Letterhead */}
        <div className="mt-6 text-slate-800 print:mt-0 font-serif leading-relaxed">
          {/* Institutional Crest & Header */}
          <div className="text-center border-b-2 border-[#007B99] pb-5">
            <div className="mx-auto flex justify-center mb-2">
              <NwuchasEmblemSvg size={60} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#8DC63F] font-sans">
              North Western University College
            </h1>
            <h2 className="text-xs sm:text-sm font-black tracking-wider text-[#007B99] font-sans mt-0.5">
              OF HEALTH AND APPLIED SCIENCES
            </h2>
            <p className="text-[11px] text-slate-600 font-sans mt-1">
              {NWUCHAS_IDENTITY.address}
            </p>
            <p className="text-[10px] text-slate-500 font-sans">
              Tel: {NWUCHAS_IDENTITY.primaryPhone} • Email: {NWUCHAS_IDENTITY.email} • Web: {NWUCHAS_IDENTITY.website}
            </p>
          </div>

          {/* Letter Meta */}
          <div className="mt-5 flex justify-between text-xs font-sans text-slate-500 border-b border-slate-200 pb-3">
            <div>
              <span>Our Ref: </span>
              <strong className="text-slate-900 font-mono">{refNumber}</strong>
            </div>
            <div>
              <span>Date of Issue: </span>
              <strong className="text-slate-900">{issueDate}</strong>
            </div>
          </div>

          {/* Recipient Box */}
          <div className="mt-4 text-xs font-sans">
            <p className="font-bold text-sm text-slate-900">
              {application.firstName} {application.middleName || ''} {application.lastName}
            </p>
            <p className="text-slate-700">NRC: {meta.nrc || 'Zambian National'}</p>
            <p className="text-slate-700">{meta.residentialAddress || 'Manyama Corridor, Kalumbila'}</p>
            <p className="text-slate-500">{application.phone} • {application.email}</p>
          </div>

          {/* Salutation & Subject */}
          <div className="mt-5">
            <p className="text-xs text-slate-800">Dear {application.firstName},</p>
            <h3 className="mt-2 text-sm font-bold uppercase tracking-wide text-emerald-800 underline underline-offset-4">
              RE: PROVISIONAL OFFER OF ADMISSION FOR 2026 ACADEMIC YEAR — {application.programmeChoice?.toUpperCase()}
            </h3>
          </div>

          {/* Letter Body */}
          <div className="mt-4 space-y-3 text-xs leading-relaxed font-sans text-slate-700">
            <p>
              The Admissions Committee of the North Western University College of Health and Applied Sciences is pleased to inform you that you have been offered <strong>Provisional Admission</strong> into the <strong>{application.programmeChoice}</strong> for the <strong>{application.intakeLabel}</strong>.
            </p>

            <p>
              This offer is made in accordance with the regulatory accreditation standards of the Higher Education Authority (HEA) and the statutory indexing requirements of the <strong>{application.programmeChoice?.includes('Nursing') ? 'Nursing and Midwifery Council of Zambia (NMCZ)' : 'Health Professions Council of Zambia (HPCZ)'}</strong>.
            </p>

            {/* Fees Schedule */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 font-sans text-xs">
              <span className="font-bold text-slate-900 block mb-2 uppercase tracking-wider text-[11px]">Schedule of Approved Fees (Semester 1):</span>
              <div className="space-y-1.5 divide-y divide-slate-200">
                <div className="flex justify-between pt-1">
                  <span>Tuition &amp; Instructional Delivery</span>
                  <strong className="text-slate-900 font-mono">ZMW 6,500.00</strong>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Clinical Hospital Ward &amp; Preceptorship Fee</span>
                  <strong className="text-slate-900 font-mono">ZMW 1,800.00</strong>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Medical Examination &amp; College Registration</span>
                  <strong className="text-slate-900 font-mono">ZMW 500.00</strong>
                </div>
                <div className="flex justify-between pt-1 text-emerald-800 font-bold">
                  <span>Total Semester Fees Payable</span>
                  <span className="font-mono">ZMW 8,800.00</span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                * Note: A minimum commitment deposit of 50% (ZMW 4,400.00) is required to secure your place and trigger the issuance of your <strong>Final Acceptance &amp; Matriculation Letter</strong>.
              </p>
            </div>

            {/* Approved Banking & Mobile Money Details */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 font-sans text-xs">
              <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider text-[11px]">Approved Institutional Payment Channels:</span>
              <p className="text-[11px] text-slate-600 leading-5">
                1. <strong>LamtonPay Mobile Money:</strong> MTN MoMo &amp; Airtel Money (Use your Application # <span className="font-mono font-bold text-emerald-800">{application.applicationNumber}</span> as reference).<br />
                2. <strong>ZANACO Bank:</strong> Account Name: NWUCHAS Operations • Account: 58291048201 • Branch: Solwezi Central.
              </p>
            </div>

            <p>
              Please confirm your acceptance of this offer by submitting your payment confirmation through the online candidate portal or at the College Bursary. Upon verification, your official <strong>Final Acceptance Letter</strong> signed by the Academic Registrar and Principal will be issued.
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-8 flex justify-between items-end border-t border-slate-200 pt-6 font-sans text-xs">
            <div>
              <div className="h-10 border-b border-dashed border-slate-300 w-44 flex items-center justify-center text-emerald-800 font-serif italic font-bold">
                Dr. G. Silwamba
              </div>
              <p className="font-bold text-slate-900 mt-1">Dr. George Silwamba</p>
              <p className="text-[11px] text-slate-500">Academic Registrar &amp; Secretary to Senate</p>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Digitally Certified by Admissions Board
              </div>
              <p className="text-[10px] text-slate-500 mt-1">NWUCHAS Official Document</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
