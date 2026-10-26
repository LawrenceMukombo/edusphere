'use client';

import React from 'react';
import { X, Printer, ShieldCheck, Download, Award, FileText } from 'lucide-react';

interface Form12AStatutoryReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainee: any | null;
}

export function Form12AStatutoryReturnModal({
  isOpen,
  onClose,
  trainee,
}: Form12AStatutoryReturnModalProps) {
  if (!isOpen || !trainee) return null;

  const annualRate = trainee.annualCombinedRate ?? 85;
  const isCleared = annualRate >= 85;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 space-y-6 border border-slate-200 max-h-[94vh] overflow-y-auto">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-100 text-cyan-800">
              <FileText className="h-5 w-5 text-cyan-700" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Official Form 12A Statutory Attendance Return
              </h3>
              <p className="text-xs text-slate-500">
                Ministry of Health • General Nursing Council / NMCZ • Health Professions Council (HPCZ)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
            >
              <Printer className="h-4 w-4" /> Print Form
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Certificate / Slip Document */}
        <div className="border-4 border-double border-slate-800 p-8 rounded-xl bg-white space-y-6 shadow-xs font-serif text-slate-900">
          {/* Institutional Letterhead */}
          <div className="text-center space-y-1.5 border-b-2 border-slate-800 pb-5">
            <div className="uppercase tracking-widest text-xs font-bold text-slate-500 font-sans">
              REPUBLIC OF ZAMBIA • MINISTRY OF HEALTH
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase font-sans">
              North Western University College of Health and Applied Sciences
            </h1>
            <p className="text-xs text-slate-600 font-sans">
              Office of the Academic Registrar & Clinical Examinations Directorate
            </p>
            <p className="text-[11px] text-slate-500 font-sans">
              Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia • info@nwuc.edu.zm
            </p>
            <div className="pt-2">
              <span className="inline-block bg-slate-900 text-white px-4 py-1 rounded text-xs font-bold uppercase tracking-wider font-sans">
                STATUTORY FORM 12A: CANDIDATE ATTENDANCE RETURN & EXAMINATION CLEARANCE SLIP
              </span>
            </div>
          </div>

          {/* Candidate Particulars Table */}
          <div className="grid grid-cols-2 gap-4 text-xs font-sans">
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 text-[11px] block">Full Candidate Name:</span>
                <span className="font-extrabold text-sm text-slate-900">{trainee.name}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">College Student Number:</span>
                <span className="font-mono font-bold text-cyan-950">{trainee.studentNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">National Registration Card (NRC):</span>
                <span className="font-mono font-bold text-slate-800">412892/68/1</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 text-[11px] block">Academic Programme:</span>
                <span className="font-bold text-slate-900">{trainee.programme}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Current Cohort / Level:</span>
                <span className="font-bold text-slate-800">{trainee.cohort} (Academic Year 2026)</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Clinical Affiliation Site:</span>
                <span className="font-bold text-slate-800">
                  Solwezi General Hospital & Manyama Urban Clinic
                </span>
              </div>
            </div>
          </div>

          {/* Statutory Hours Audit Table */}
          <div className="font-sans">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Cumulative Instructional & Clinical Hours Audit
            </h4>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead className="bg-slate-100 text-slate-800">
                <tr>
                  <th className="border border-slate-300 py-2 px-3 text-left">Curricular Domain</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">Required Hours</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">Attended Hours</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">Achievement %</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">Threshold (85%)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 py-2 px-3 font-semibold">
                    Theoretical Lecture & Tutorial Hours
                  </td>
                  <td className="border border-slate-300 py-2 px-3 text-center font-mono">
                    {trainee.baseTheoryTotal ?? 160} hrs
                  </td>
                  <td className="border border-slate-300 py-2 px-3 text-center font-mono font-bold text-cyan-900">
                    {trainee.annualTheoryAttended ?? 142} hrs
                  </td>
                  <td className="border border-slate-300 py-2 px-3 text-center font-mono font-bold">
                    {Math.round(
                      ((trainee.annualTheoryAttended ?? 142) / (trainee.baseTheoryTotal ?? 160)) * 100
                    )}%
                  </td>
                  <td className="border border-slate-300 py-2 px-3 text-center text-emerald-700 font-bold">
                    PASSED
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 py-2 px-3 font-semibold">
                    Clinical Hospital Rotations & Skills Lab
                  </td>
                  <td className="border border-slate-300 py-2 px-3 text-center font-mono">
                    {trainee.baseClinicalTotal ?? 240} hrs
                  </td>
                  <td className="border border-slate-300 py-2 px-3 text-center font-mono font-bold text-indigo-900">
                    {trainee.annualClinicalAttended ?? 218} hrs
                  </td>
                  <td className="border border-slate-300 py-2 px-3 text-center font-mono font-bold">
                    {Math.round(
                      ((trainee.annualClinicalAttended ?? 218) /
                        (trainee.baseClinicalTotal ?? 240)) *
                        100
                    )}%
                  </td>
                  <td className="border border-slate-300 py-2 px-3 text-center text-emerald-700 font-bold">
                    PASSED
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="border border-slate-300 py-2.5 px-3">
                    COMBINED CUMULATIVE INSTRUCTIONAL TOTAL
                  </td>
                  <td className="border border-slate-300 py-2.5 px-3 text-center font-mono">
                    {(trainee.baseTheoryTotal ?? 160) + (trainee.baseClinicalTotal ?? 240)} hrs
                  </td>
                  <td className="border border-slate-300 py-2.5 px-3 text-center font-mono text-cyan-950">
                    {(trainee.annualTheoryAttended ?? 142) + (trainee.annualClinicalAttended ?? 218)} hrs
                  </td>
                  <td className="border border-slate-300 py-2.5 px-3 text-center font-mono text-base font-black">
                    {annualRate}%
                  </td>
                  <td className="border border-slate-300 py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-black ${
                        isCleared
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isCleared ? 'CLEARED' : 'DEFICIT'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statutory Determination Block */}
          <div
            className={`p-4 rounded-xl border text-xs font-sans ${
              isCleared
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wide">
              <ShieldCheck className="h-5 w-5" />
              <span>
                STATUTORY EXAMINATIONS BOARD DETERMINATION: {isCleared ? 'CLEARED' : 'CONDITIONAL / DEBARRED'}
              </span>
            </div>
            <p className="mt-1 font-medium">
              {isCleared
                ? 'The candidate has satisfied the statutory minimum of 85% theory and clinical attendance prescribed by the Nursing and Midwifery Council of Zambia (NMCZ) and the Health Professions Council of Zambia (HPCZ) Act No. 7 of 2009. The candidate is hereby authorized to sit for end-of-semester professional examinations.'
                : 'The candidate has failed to achieve the statutory minimum 85% requirement. Impending debarment penalty applies unless clinical catch-up hours are authorized by the Academic Board.'}
            </p>
          </div>

          {/* Official Signatures & Seal Block */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs font-sans">
            <div>
              <div className="border-b border-slate-400 pb-1 w-48 mb-1">
                <span className="font-serif italic text-cyan-950 font-bold text-sm">
                  Dr. George Silwamba
                </span>
              </div>
              <span className="font-bold text-slate-800 block">Academic Registrar</span>
              <span className="text-slate-500 text-[10px]">NWUCHAS Academic Directorate</span>
              <span className="text-slate-400 text-[10px] block mt-0.5">Date: 26 October 2026</span>
            </div>

            <div className="text-right">
              <div className="inline-block text-left">
                <div className="border-b border-slate-400 pb-1 w-48 mb-1">
                  <span className="font-serif italic text-indigo-950 font-bold text-sm">
                    Prof. M. K. Chileshe
                  </span>
                </div>
                <span className="font-bold text-slate-800 block">College Principal & Dean</span>
                <span className="text-slate-500 text-[10px]">Head of Institutional Board</span>
                <span className="text-slate-400 text-[10px] block mt-0.5">Date: 26 October 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition shadow-sm"
          >
            Close Return
          </button>
        </div>
      </div>
    </div>
  );
}
