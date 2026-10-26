'use client';

import React from 'react';
import { X, Printer, ShieldCheck, HeartPulse, Building, CheckCircle2, Award } from 'lucide-react';

interface OfficialClinicalCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: {
    studentName: string;
    studentNumber: string;
    councilIndexingNo: string;
    programme: string;
    totalHoursLogged: number;
    statutoryHoursRequired: number;
    completionDate: string;
    rotations: Array<{
      hospitalSite: string;
      wardOrDept: string;
      hoursCompleted: number;
      preceptorName: string;
      standing: string;
    }>;
    verifiedProceduresCount: number;
  };
}

export function OfficialClinicalCertificateModal({
  isOpen,
  onClose,
  certificateData,
}: OfficialClinicalCertificateModalProps) {
  if (!isOpen) return null;

  const isCompleted = certificateData.totalHoursLogged >= certificateData.statutoryHoursRequired;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Controls */}
        <div className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
              <Award className="h-4 w-4 text-emerald-600" /> Statutory Clinical Certificate
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Ref: NWUCHAS/CLIN-CERT/{certificateData.studentNumber}
            </span>
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

        {/* Certificate Body */}
        <div className="p-8 sm:p-12 print:p-0">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-700 text-white font-black text-2xl shadow-sm">
              NW
            </div>
            <h1 className="mt-3 text-xl font-black uppercase tracking-wider text-slate-900 sm:text-2xl">
              North Western University College of Health and Applied Sciences
            </h1>
            <p className="mt-1 text-xs font-semibold tracking-widest uppercase text-slate-600">
              Faculty of Clinical Sciences & Nursing Studies • Office of Clinical Coordinations
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Accredited by Higher Education Authority (HEA) • Recognized by NMCZ & HPCZ
            </p>
            <div className="mt-3 inline-block rounded-full bg-emerald-50 border border-emerald-300 px-5 py-1 text-xs font-black uppercase tracking-widest text-emerald-800">
              Certificate of Clinical Rotations & EPA Logbook Completion
            </div>
          </div>

          {/* Student Banner */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-5 text-xs">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <span className="font-bold text-slate-500 uppercase">Candidate Full Name:</span>
                <p className="mt-0.5 text-sm font-extrabold text-slate-900">{certificateData.studentName}</p>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase">Student Registration No:</span>
                <p className="mt-0.5 font-mono text-sm font-extrabold text-slate-900">{certificateData.studentNumber}</p>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase">Council Indexing ID:</span>
                <p className="mt-0.5 font-mono text-sm font-extrabold text-cyan-800">{certificateData.councilIndexingNo}</p>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase">Enrolled Programme:</span>
                <p className="mt-0.5 font-extrabold text-slate-900">{certificateData.programme}</p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-bold text-slate-500 uppercase">Statutory Hours Audit:</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-xl font-black text-emerald-700">
                    {certificateData.totalHoursLogged} Hours Logged
                  </span>
                  <span className="text-slate-500">/ {certificateData.statutoryHoursRequired} Hours Required</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase">Council Clearance Status:</span>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    STATUTORILY COMPLIANT & CLEARED
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hospital Rotations Breakdown */}
          <div className="mt-6">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 mb-2">
              Verified Hospital Attachments & Ward Quotas
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Hospital Training Facility</th>
                    <th className="py-2.5 px-4">Ward / Clinical Department</th>
                    <th className="py-2.5 px-3 text-right">Hours Completed</th>
                    <th className="py-2.5 px-4">Supervising Preceptor</th>
                    <th className="py-2.5 px-3">Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {certificateData.rotations.map((r, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{r.hospitalSite}</td>
                      <td className="py-2 px-4 text-slate-700">{r.wardOrDept}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {r.hoursCompleted} hrs
                      </td>
                      <td className="py-2 px-4 font-medium text-slate-700">{r.preceptorName}</td>
                      <td className="py-2 px-3">
                        <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          {r.standing}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* De-Identified Logbook Summary Notice */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-800 uppercase tracking-wider">
              Entrustable Professional Activities (EPA) Verification:
            </p>
            <p className="mt-1">
              This certifies that the candidate has satisfactorily completed <strong>{certificateData.verifiedProceduresCount} core procedural competencies</strong> under direct preceptor supervision. All procedures were logged in the de-identified institutional medical logbook in strict accordance with the Zambian Health Data Privacy Act and Council guidelines.
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-300 pt-6 text-center text-xs">
            <div>
              <div className="h-8 border-b border-dashed border-slate-400 font-serif italic text-slate-700 flex items-end justify-center pb-1">
                Sr. Patricia Mwewa, RN, BScN
              </div>
              <p className="mt-1 font-bold text-slate-900">Clinical Coordinator</p>
              <p className="text-[10px] text-slate-500">NMCZ Reg: RN/2012/04481</p>
            </div>

            <div>
              <div className="h-8 border-b border-dashed border-slate-400 font-serif italic text-slate-700 flex items-end justify-center pb-1">
                Dr. Kelvin Silwamba
              </div>
              <p className="mt-1 font-bold text-slate-900">Dean of Faculty & Clinical Studies</p>
              <p className="text-[10px] text-slate-500">Date: {certificateData.completionDate}</p>
            </div>

            <div>
              <div className="h-8 border-b border-dashed border-slate-400 font-serif italic text-slate-700 flex items-end justify-center pb-1">
                Dr. George Silwamba
              </div>
              <p className="mt-1 font-bold text-slate-900">Academic Registrar</p>
              <p className="text-[10px] text-slate-500">Official College Audit Seal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
