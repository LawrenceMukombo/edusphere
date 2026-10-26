'use client';

import React from 'react';
import { X, Printer, AlertTriangle, ShieldAlert } from 'lucide-react';

interface AttendanceCautionModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    studentNumber: string;
    name: string;
    programme: string;
    attendanceRate: number;
    totalSessions: number;
    sessionsAttended: number;
    sessionsMissed: number;
  };
}

export function AttendanceCautionModal({
  isOpen,
  onClose,
  student,
}: AttendanceCautionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Modal Controls */}
        <div className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
              <ShieldAlert className="h-4 w-4 text-amber-600" /> Official Caution Notice
            </span>
            <span className="text-xs text-slate-500">Statutory Attendance Deficit Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700"
            >
              <Printer className="h-4 w-4" /> Print Notice
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Letter Body */}
        <div className="p-8 sm:p-12 print:p-0">
          <div className="border-b-2 border-slate-900 pb-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-700 text-white font-black text-xl shadow-sm">
              NW
            </div>
            <h1 className="mt-2 text-lg font-black uppercase tracking-wider text-slate-900">
              North Western University College of Health and Applied Sciences
            </h1>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
              Office of the Academic Registrar • Board of Examiners
            </p>
            <p className="text-[10px] text-slate-500 font-sans">
              Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia • info@nwuc.edu.zm
            </p>
          </div>

          <div className="mt-6 flex justify-between text-xs text-slate-600">
            <div>
              <p><strong>Ref:</strong> NWUCHAS/REG/ATT-WARN/2026/044</p>
              <p className="mt-1"><strong>To:</strong> {student.name} ({student.studentNumber})</p>
              <p><strong>Programme:</strong> {student.programme}</p>
            </div>
            <div className="text-right">
              <p><strong>Date:</strong> 24 October 2026</p>
              <p className="mt-1"><span className="rounded bg-rose-100 px-2 py-0.5 font-bold text-rose-800">URGENT & CONFIDENTIAL</span></p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-sm font-extrabold uppercase underline text-rose-900">
              RE: STATUTORY WARNING NOTICE — ATTENDANCE DEFICIT & IMPENDING EXAMINATION DEBARMENT
            </h2>
          </div>

          <div className="mt-5 space-y-3 text-xs leading-relaxed text-slate-700">
            <p>
              The Academic Registry and the Faculty Attendance Monitoring Committee have reviewed your attendance record for the current semester and noted with grave concern that your cumulative attendance has fallen to{' '}
              <strong className="text-rose-700 font-bold">{student.attendanceRate}%</strong> ({student.sessionsAttended} of {student.totalSessions} sessions attended; {student.sessionsMissed} sessions missed).
            </p>
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 font-medium text-amber-950">
              <p className="font-bold uppercase tracking-wider text-xs">Statutory Council Requirement:</p>
              <p className="mt-1 text-[11px]">
                Under the regulations of the Nursing and Midwifery Council of Zambia (NMCZ) and the Health Professions Council of Zambia (HPCZ), a trainee health professional must attain a minimum attendance threshold of <strong>85%</strong> in both classroom lectures and clinical rotations to be cleared to sit college semester examinations and professional council licensing tests.
              </p>
            </div>
            <p>
              You are hereby given official notice that unless your attendance is rectified immediately and valid medical or approved official documentation is presented to substantiate your absences, you will be <strong>DEBARRED</strong> from sitting the upcoming semester examinations, requiring you to repeat the affected module(s).
            </p>
            <p>
              You are required to report in person to the Head of Department and the Academic Registrar within forty-eight (48) hours of receipt of this notice.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-8 border-t border-slate-300 pt-6 text-center text-xs">
            <div>
              <div className="h-8 border-b border-dashed border-slate-400 font-serif italic text-slate-700 flex items-end justify-center pb-1">
                Dr. Kelvin Silwamba
              </div>
              <p className="mt-1 font-bold text-slate-900">Dean of Faculty & Clinical Studies</p>
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
