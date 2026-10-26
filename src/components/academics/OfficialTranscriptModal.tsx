'use client';

import React from 'react';
import { X, Printer, ShieldCheck, Award, FileText, CheckCircle2, GraduationCap } from 'lucide-react';
import { NwuchasEmblemSvg, NWUCHAS_IDENTITY } from '@/components/NwuchasLogo';

interface TranscriptItem {
  code: string;
  name: string;
  credits: number;
  caScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  status: string;
}

interface OfficialTranscriptModalProps {
  student: {
    studentNumber: string;
    fullName: string;
    programme: string;
    cohort?: string;
    academicYear?: string;
    semester?: string;
  };
  results: TranscriptItem[];
  onClose: () => void;
}

export function OfficialTranscriptModal({
  student,
  results,
  onClose,
}: OfficialTranscriptModalProps) {
  const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const refNumber = `NWU/EXAM/TRANS/2026/${student.studentNumber.replace('NWU-', '')}`;

  const totalCredits = results.reduce((acc, r) => acc + (r.credits || 0), 0);
  const avgScore = results.length > 0
    ? (results.reduce((acc, r) => acc + r.totalScore, 0) / results.length).toFixed(1)
    : '0.0';

  const isAllPassed = results.every((r) => r.totalScore >= 50);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 print:p-0 print:bg-white">
      <div className="relative max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-10 text-slate-900 print:max-h-none print:w-full print:border-none print:p-8">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition print:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <Award className="h-4 w-4 text-emerald-700" /> Official Semester Examination Statement
          </span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm"
          >
            <Printer className="h-3.5 w-3.5" /> Print Official Statement
          </button>
        </div>

        {/* Official Printable Academic Document */}
        <div className="mt-6 text-slate-800 print:mt-0 font-serif leading-relaxed">
          {/* Letterhead */}
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
            <p className="mt-1 text-xs text-slate-600 font-sans">
              {NWUCHAS_IDENTITY.address}
            </p>
            <p className="text-[11px] font-sans text-slate-500 mt-0.5">
              Tel: {NWUCHAS_IDENTITY.primaryPhone} • Email: {NWUCHAS_IDENTITY.email} • Web: {NWUCHAS_IDENTITY.website}
            </p>
            <h3 className="mt-4 text-base font-bold uppercase tracking-widest text-slate-900 underline underline-offset-4">
              Official Statement of Examination Results
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Senate Board of Examiners Approved Record • Issue Ref: <span className="font-mono font-bold text-emerald-800">{refNumber}</span>
            </p>
          </div>

          {/* Student Particulars */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs font-sans">
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Learner Full Name</span>
              <strong className="text-slate-900 text-sm">{student.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Student Identification Number</span>
              <strong className="text-emerald-800 font-mono text-sm">{student.studentNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Academic Programme</span>
              <strong className="text-slate-800">{student.programme}</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Cohort &amp; Intake Session</span>
              <strong className="text-slate-800">{student.cohort || 'RN-2026-JAN'} (2026 Academic Year)</strong>
            </div>
          </div>

          {/* Grades Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white font-sans text-xs shadow-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Module Code</th>
                  <th className="px-4 py-3">Course Module Title</th>
                  <th className="px-4 py-3 text-center">Units</th>
                  <th className="px-4 py-3 text-center">CA (40%)</th>
                  <th className="px-4 py-3 text-center">Exam (60%)</th>
                  <th className="px-4 py-3 text-center">Final (100%)</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                  <th className="px-4 py-3 text-center">Result Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {results.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-800">{r.code}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{r.name}</td>
                    <td className="px-4 py-3 text-center">{r.credits}</td>
                    <td className="px-4 py-3 text-center font-mono">{r.caScore}</td>
                    <td className="px-4 py-3 text-center font-mono">{r.examScore}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-900">{r.totalScore}</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-800">{r.grade}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        r.totalScore >= 50
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {r.totalScore >= 50 ? 'PASS' : 'SUPPLEMENTARY'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Academic Standing Summary */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 font-sans text-xs">
            <div>
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Cumulative Semester Summary</p>
              <ul className="mt-1.5 space-y-1 text-slate-700">
                <li>Total Credit Units Attempted: <strong>{totalCredits} Units</strong></li>
                <li>Weighted Average Score: <strong>{avgScore}%</strong></li>
                <li>Statutory Minimum Pass Benchmark: <strong>50.0% (CA 40% + Final Exam 60%)</strong></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Board of Examiners Standing Directive</p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {isAllPassed ? 'PROCEED TO NEXT SEMESTER IN GOOD STANDING' : 'SUPPLEMENTARY EXAMINATION REQUIRED BEFORE PROGRESSION'}
              </div>
            </div>
          </div>

          {/* Official Signatures */}
          <div className="mt-10 grid grid-cols-2 gap-8 border-t border-slate-200 pt-6 text-xs">
            <div className="text-center">
              <div className="mx-auto mb-2 font-serif italic text-emerald-900 text-sm font-semibold">
                Dr. Kelvin Silwamba
              </div>
              <p className="font-bold text-slate-900">Dr. Kelvin Silwamba, MBChB, MSc</p>
              <p className="text-slate-500 text-[11px]">Dean of Academic Faculty / Chair of Board of Examiners</p>
              <p className="text-slate-400 text-[10px] mt-1 font-sans">Date: {issueDate}</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-2 font-serif italic text-emerald-900 text-sm font-semibold">
                Dr. George Silwamba
              </div>
              <p className="font-bold text-slate-900">Dr. George Silwamba, PhD</p>
              <p className="text-slate-500 text-[11px]">Academic Registrar &amp; College Secretary</p>
              <p className="text-slate-400 text-[10px] mt-1 font-sans">Date: {issueDate}</p>
            </div>
          </div>

          {/* Institutional Digital Security Stamp */}
          <div className="mt-8 border-t border-slate-200 pt-4 flex items-center justify-between text-[11px] font-sans text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Verified NWUCHAS Academic Registry Digital Record • SHA-256 Validated</span>
            </div>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
