'use client';

import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, Building, Calendar, Users, Clock } from 'lucide-react';

interface OfficialAttendanceSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: {
    date: string;
    sessionType: string;
    venue: string;
    courseModule: string;
    instructor: string;
    cohortName: string;
    records: Array<{
      studentNumber: string;
      name: string;
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
      arrivalMinutesLate?: number;
      verificationType: string;
      remarks?: string;
    }>;
  };
}

export function OfficialAttendanceSheetModal({
  isOpen,
  onClose,
  sessionData,
}: OfficialAttendanceSheetModalProps) {
  if (!isOpen) return null;

  const presentCount = sessionData.records.filter((r) => r.status === 'PRESENT').length;
  const lateCount = sessionData.records.filter((r) => r.status === 'LATE').length;
  const absentCount = sessionData.records.filter((r) => r.status === 'ABSENT').length;
  const excusedCount = sessionData.records.filter((r) => r.status === 'EXCUSED').length;
  const total = sessionData.records.length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-cyan-100 px-2.5 py-1 text-xs font-bold text-cyan-800">
              <ShieldCheck className="h-4 w-4 text-cyan-600" /> Statutory Council Register
            </span>
            <span className="text-xs text-slate-500">NMCZ & HPCZ Mandatory Evidence Record</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
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

        {/* Official Printable Register Document */}
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
              Office of the Academic Registrar • Department of Clinical & Academic Records
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia • info@nwuc.edu.zm
            </p>
            <div className="mt-3 inline-block rounded-full bg-slate-100 px-4 py-1 text-xs font-black uppercase tracking-widest text-slate-800">
              Official Session Attendance Register & Statutory Evidence
            </div>
          </div>

          {/* Session Metadata Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs sm:grid-cols-4">
            <div>
              <span className="font-bold text-slate-500 uppercase">Programme & Cohort:</span>
              <p className="mt-0.5 font-extrabold text-slate-900">{sessionData.cohortName}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Module / Unit:</span>
              <p className="mt-0.5 font-extrabold text-slate-900">{sessionData.courseModule}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Session Type:</span>
              <p className="mt-0.5 font-extrabold text-cyan-800 uppercase">{sessionData.sessionType}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Date of Session:</span>
              <p className="mt-0.5 font-extrabold text-slate-900">{sessionData.date}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Venue / Facility:</span>
              <p className="mt-0.5 font-extrabold text-slate-900">{sessionData.venue}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Faculty / Instructor:</span>
              <p className="mt-0.5 font-extrabold text-slate-900">{sessionData.instructor}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Attendance Rate:</span>
              <p className="mt-0.5 font-extrabold text-emerald-700">{attendanceRate}% ({presentCount + lateCount}/{total})</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase">Council Compliance:</span>
              <p className="mt-0.5 font-extrabold text-slate-900">
                {attendanceRate >= 85 ? 'CLEARED (>=85%)' : 'WARNING (<85%)'}
              </p>
            </div>
          </div>

          {/* Roster Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Student Number</th>
                  <th className="py-2.5 px-4">Candidate Full Name</th>
                  <th className="py-2.5 px-3">Roll Call Status</th>
                  <th className="py-2.5 px-3">Verification Evidence</th>
                  <th className="py-2.5 px-3">Candidate Signature / Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {sessionData.records.map((r, idx) => (
                  <tr key={idx} className={r.status === 'ABSENT' ? 'bg-rose-50/40' : undefined}>
                    <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{r.studentNumber}</td>
                    <td className="py-2 px-4 font-semibold text-slate-800">{r.name}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          r.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'LATE'
                            ? 'bg-amber-100 text-amber-800'
                            : r.status === 'EXCUSED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status} {r.arrivalMinutesLate ? `(${r.arrivalMinutesLate}m late)` : ''}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                      {r.verificationType || 'Biometric / PIN Auth'}
                    </td>
                    <td className="py-2 px-3 font-mono text-[10px] text-slate-400">
                      {r.status !== 'ABSENT' ? 'SHA256:VERIFIED_STAMP' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statutory Summary */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600">
            <div className="flex gap-4">
              <span>Present: <strong className="text-emerald-700">{presentCount}</strong></span>
              <span>Late: <strong className="text-amber-700">{lateCount}</strong></span>
              <span>Absent: <strong className="text-rose-700">{absentCount}</strong></span>
              <span>Excused: <strong className="text-blue-700">{excusedCount}</strong></span>
              <span>Total Enrolled: <strong>{total}</strong></span>
            </div>
            <div className="text-[11px] text-slate-500 italic">
              Minimum 85% attendance required for NMCZ & HPCZ professional registration examinations.
            </div>
          </div>

          {/* Verification & Sign-off Blocks */}
          <div className="mt-12 grid grid-cols-3 gap-8 border-t border-slate-300 pt-6 text-center text-xs">
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 font-serif italic text-slate-700 flex items-end justify-center pb-1">
                {sessionData.instructor}
              </div>
              <p className="mt-1 font-bold text-slate-900">Course Lecturer / Clinical Preceptor</p>
              <p className="text-[10px] text-slate-500">Date: {sessionData.date}</p>
            </div>

            <div>
              <div className="h-10 border-b border-dashed border-slate-400 font-serif italic text-slate-700 flex items-end justify-center pb-1">
                Class Representative
              </div>
              <p className="mt-1 font-bold text-slate-900">Class Representative Verification</p>
              <p className="text-[10px] text-slate-500">Date: {sessionData.date}</p>
            </div>

            <div>
              <div className="h-10 border-b border-dashed border-slate-400 font-serif italic text-slate-700 flex items-end justify-center pb-1">
                Dr. George Silwamba
              </div>
              <p className="mt-1 font-bold text-slate-900">Academic Registrar / HoD Sign-off</p>
              <p className="text-[10px] text-slate-500">Official College Audit Stamp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
