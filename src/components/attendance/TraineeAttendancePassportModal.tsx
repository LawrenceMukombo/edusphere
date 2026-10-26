'use client';

import React from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Phone,
  Activity,
  Award,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { AttendanceLearnerRecord } from '../modules/AttendanceConsole';

interface TraineeAttendancePassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainee: any | null;
  dailyAttendanceMap: Record<string, string>;
  onOpenForm12A?: (trainee: any) => void;
}

export function TraineeAttendancePassportModal({
  isOpen,
  onClose,
  trainee,
  dailyAttendanceMap,
  onOpenForm12A,
}: TraineeAttendancePassportModalProps) {
  if (!isOpen || !trainee) return null;

  const annualRate = trainee.annualCombinedRate ?? 85;
  const isCleared = annualRate >= 85;

  // Generate 31 days for October 2026
  const octoberDays = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    const dayStr = String(dayNum).padStart(2, '0');
    const iso = `2026-10-${dayStr}`;
    const dateObj = new Date(2026, 9, dayNum);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isToday = iso === '2026-10-26';
    const isFuture = iso > '2026-10-26';

    const recordedStatus = dailyAttendanceMap[`${trainee.id}_${iso}`];
    let status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'HOLIDAY' | 'WEEKEND' | 'FUTURE' = 'PRESENT';

    if (isWeekend) {
      status = 'WEEKEND';
    } else if (iso === '2026-10-19' || iso === '2026-10-24') {
      status = 'HOLIDAY';
    } else if (recordedStatus) {
      status = recordedStatus as any;
    } else if (isFuture) {
      status = 'FUTURE';
    }

    return {
      dayNum,
      iso,
      isWeekend,
      isToday,
      isFuture,
      status,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-cyan-800 text-white font-black text-xl grid place-items-center shadow-md">
              {trainee.name
                .split(' ')
                .map((n: string) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
                  {trainee.studentNumber}
                </span>
                <span
                  className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                    isCleared ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isCleared ? '✓ 85% RULE CLEARED' : '⚠ AT-RISK DEFICIT'}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">{trainee.name}</h2>
              <p className="text-xs text-slate-500 font-medium">
                {trainee.programme} • Cohort: {trainee.cohort}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 85% Statutory Rule Compliance Card */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isCleared ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-11 w-11 rounded-xl grid place-items-center shrink-0 ${
                isCleared ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
              }`}
            >
              {isCleared ? <ShieldCheck className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>
            <div>
              <h4 className="font-extrabold text-sm">
                NMCZ & HPCZ Statutory Exam Clearance Status
              </h4>
              <p className="text-xs opacity-90">
                {isCleared
                  ? 'Candidate meets mandatory 85% minimum cumulative theory and clinical practice threshold.'
                  : `Deficit Alert: Trainee is currently at ${annualRate}% (below mandatory 85% threshold). Risk of debarment from statutory professional exams.`}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-3xl font-black">{annualRate}%</span>
            <span className="block text-[10px] uppercase font-bold tracking-wider opacity-80">
              Cumulative Standing
            </span>
          </div>
        </div>

        {/* Clinical vs Theory Hours Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-cyan-700" /> Theory Instructional Hours
              </span>
              <span className="font-mono text-cyan-800">
                {trainee.annualTheoryAttended ?? 142} / {trainee.baseTheoryTotal ?? 160} hrs
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-600 h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      ((trainee.annualTheoryAttended ?? 142) / (trainee.baseTheoryTotal ?? 160)) * 100
                    )
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Foundations of Nursing, Pharmacology, Anatomy & Physiology
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-indigo-700" /> Clinical Rotations & Labs
              </span>
              <span className="font-mono text-indigo-800">
                {trainee.annualClinicalAttended ?? 218} / {trainee.baseClinicalTotal ?? 240} hrs
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      ((trainee.annualClinicalAttended ?? 218) / (trainee.baseClinicalTotal ?? 240)) * 100
                    )
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Solwezi General Hospital, Manyama Clinic, Skills Lab OSCEs
            </p>
          </div>
        </div>

        {/* 31-Day Visual Dot Matrix Calendar (October 2026) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-700" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                October 2026 — 31-Day Attendance Horizon Dot Matrix
              </h4>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Present
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Late
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Absent
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Excused
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-purple-500" /> Holiday
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 p-4 rounded-xl border border-slate-200 bg-slate-50">
            {octoberDays.map((d) => {
              const bgClass =
                d.status === 'HOLIDAY'
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : d.status === 'PRESENT'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : d.status === 'LATE'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : d.status === 'ABSENT'
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : d.status === 'EXCUSED'
                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                  : d.status === 'WEEKEND'
                  ? 'bg-slate-200/50 text-slate-400 border-slate-200'
                  : 'bg-white text-slate-400 border-slate-200';

              return (
                <div
                  key={d.iso}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${bgClass} ${
                    d.isToday ? 'ring-2 ring-cyan-600 font-black' : ''
                  }`}
                  title={`${d.iso} — ${d.status}`}
                >
                  <span className="text-[10px] font-bold">{d.dayNum}</span>
                  <span className="text-[9px] font-extrabold mt-0.5">
                    {d.status === 'HOLIDAY'
                      ? 'H'
                      : d.status === 'PRESENT'
                      ? 'P'
                      : d.status === 'LATE'
                      ? 'L'
                      : d.status === 'ABSENT'
                      ? 'A'
                      : d.status === 'EXCUSED'
                      ? 'E'
                      : d.status === 'WEEKEND'
                      ? '—'
                      : '·'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency & Guardian Contact */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-bold block">
              Emergency Contact & Sponsor
            </span>
            <span className="font-bold text-slate-800">
              Guardian: Mr. Charles Mwape (Solwezi Urban)
            </span>
          </div>

          <a
            href="tel:+260966412093"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-cyan-800 font-bold hover:bg-slate-100 transition shadow-xs"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>+260 966 412093</span>
          </a>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            {onOpenForm12A && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenForm12A(trainee);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 font-extrabold text-xs hover:bg-cyan-100 transition shadow-xs"
              >
                <FileText className="h-4 w-4 text-cyan-700" />
                <span>View Form 12A Clearance Slip</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition shadow-xs"
            >
              <Printer className="h-4 w-4" />
              <span>Print Dossier</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition shadow-sm"
          >
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
}
