'use client';

import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { Application } from '../modules/AdmissionsConsole';
import { NwuchasEmblemSvg, NWUCHAS_IDENTITY } from '@/components/NwuchasLogo';

interface FinalAcceptanceLetterModalProps {
  application: Application;
  onClose: () => void;
}

export function FinalAcceptanceLetterModal({
  application,
  onClose,
}: FinalAcceptanceLetterModalProps) {
  const meta = application.statusHistory?.find((h) => h.metadataJson)?.metadataJson
    ? JSON.parse(application.statusHistory.find((h) => h.metadataJson)!.metadataJson!)
    : {};

  // Only a real, server-issued student number may appear on an official letter.
  const studentNumber = application.enrolledLearner?.studentNumber || null;
  const isEnrolled = Boolean(studentNumber);
  const paymentReference: string | null = meta.paymentConfirmation?.reference || null;
  const refNumber = `NWU/REG/ACCEPT/2026/${application.applicationNumber.replace('NWU-APP-', '')}`;
  const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

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
            <CheckCircle2 className="h-4 w-4 text-emerald-700" /> Official Final Acceptance &amp; Matriculation Letter
          </span>
          <div className="flex items-center gap-2">
            <button
              id="print-acceptance-letter"
              onClick={() => window.print()}
              disabled={!isEnrolled}
              title={isEnrolled ? 'Print the official letter' : 'Available once the learner has been enrolled and issued a student number'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Printer className="h-3.5 w-3.5" /> Print Acceptance Certificate
            </button>
          </div>
        </div>

        {!isEnrolled && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 print:hidden"
          >
            <strong>Draft preview — not yet valid.</strong> This applicant has not been enrolled, so no student
            number has been issued. Complete enrolment in the Admissions workflow before printing this letter.
          </div>
        )}

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
              Office of the Academic Registrar • {NWUCHAS_IDENTITY.address}
            </p>
            <p className="text-[10px] text-slate-500 font-sans">
              Tel: {NWUCHAS_IDENTITY.primaryPhone} • Email: {NWUCHAS_IDENTITY.email} • Web: {NWUCHAS_IDENTITY.website}
            </p>
          </div>

          {/* Letter Meta with Student Registration Number */}
          <div className="mt-5 flex flex-wrap justify-between items-center text-xs font-sans text-slate-500 border-b border-slate-200 pb-3 gap-2">
            <div>
              <span>Official Reference: </span>
              <strong className="text-slate-900 font-mono">{refNumber}</strong>
            </div>
            <div className="flex items-center gap-3">
              <span>Matriculation Student Number: </span>
              <span className="font-mono text-sm font-extrabold text-emerald-800 border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                {studentNumber || 'Pending enrolment'}
              </span>
            </div>
          </div>

          {/* Recipient Box */}
          <div className="mt-4 text-xs font-sans">
            <p className="font-bold text-sm text-slate-900">
              {application.firstName} {application.middleName || ''} {application.lastName}
            </p>
            <p className="text-slate-700">NRC: {meta.nrc || 'Not recorded'}</p>
            {meta.residentialAddress && <p className="text-slate-700">{meta.residentialAddress}</p>}
          </div>

          {/* Subject */}
          <div className="mt-5">
            <p className="text-xs text-slate-800">Dear Student,</p>
            <h3 className="mt-2 text-sm font-bold uppercase tracking-wide text-emerald-800 underline underline-offset-4">
              RE: FINAL CONFIRMATION OF ADMISSION AND MATRICULATION — {application.programmeChoice?.toUpperCase()}
            </h3>
          </div>

          {/* Letter Content */}
          <div className="mt-4 space-y-3 text-xs leading-relaxed font-sans text-slate-700">
            <p>
              Following your acceptance of our Provisional Offer and the successful verification of your tuition deposit through the College Bursary (Ref: <span className="font-mono font-bold text-emerald-800">{paymentReference || 'Pending verification'}</span>), the Senate and Management of North Western University College of Health and Applied Sciences are pleased to confer upon you <strong>Full Formal Admission</strong> as a matriculated student.
            </p>

            <p>
              You have been formally indexed and assigned Student Identification Number: <strong className="font-mono text-emerald-800">{studentNumber || 'Pending enrolment'}</strong>.
            </p>

            {/* Reporting and Induction Grid */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 font-sans text-xs">
              <span className="font-bold text-slate-900 block mb-2 uppercase tracking-wider text-[11px]">Orientation, Reporting &amp; Accommodation Details:</span>
              <div className="grid gap-2 sm:grid-cols-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Reporting &amp; Registration Date:</span>
                  <strong className="text-slate-900">Monday, 5th January 2026 (08:30 hrs)</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Campus Venue:</span>
                  <strong className="text-slate-900">Main Campus, Plot 511/518 Shilenda Road, Manyama, Lumwana</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Allocated Residence Hall:</span>
                  <strong className="text-emerald-800">Florence Nightingale Residence (Room 101)</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Statutory Council Indexing:</span>
                  <strong className="text-emerald-800">Confirmed Eligible (NMCZ / HPCZ)</strong>
                </div>
              </div>
            </div>

            <p>
              Please present this original Final Acceptance Letter along with your National Registration Card (NRC) and certified ECZ statement of results upon arrival for your matriculation badge and student SmartPass card.
            </p>

            <p>
              On behalf of the College Council, Senate, and Faculty, we congratulate you on your admission and welcome you to the NWUCHAS community of health sciences scholars.
            </p>
          </div>

          {/* DUAL OFFICIAL SIGNATURES: Registrar & Principal */}
          <div className="mt-8 grid grid-cols-2 gap-6 border-t border-slate-200 pt-6 font-sans text-xs">
            {/* Signature 1: Registrar */}
            <div>
              <div className="h-12 border-b border-dashed border-slate-300 w-44 flex items-center justify-center text-emerald-800 font-serif italic text-sm font-bold">
                Dr. G. Silwamba
              </div>
              <p className="font-bold text-slate-900 mt-1">Dr. George Silwamba</p>
              <p className="text-[11px] text-slate-500">BSc, MSc, PhD</p>
              <p className="text-[10px] text-slate-600 font-semibold">Academic Registrar</p>
              <span className="inline-block mt-1 rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[9px] font-mono text-slate-700">
                Seal ID: REG-NWU-2026-SEAL
              </span>
            </div>

            {/* Signature 2: Principal */}
            <div className="text-right">
              <div className="h-12 border-b border-dashed border-slate-300 w-44 ml-auto flex items-center justify-center text-emerald-800 font-serif italic text-sm font-bold">
                Prof. H. Chileshe
              </div>
              <p className="font-bold text-slate-900 mt-1">Prof. Hastings Chileshe</p>
              <p className="text-[11px] text-slate-500">MBChB, MMed, FRCS</p>
              <p className="text-[10px] text-slate-600 font-semibold">College Principal &amp; Chief Executive Officer</p>
              <span className="inline-block mt-1 rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[9px] font-mono text-slate-700">
                Executive Seal: CEO-NWU-2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
