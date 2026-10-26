'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  X,
  Check,
  Clock,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  Smartphone,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { AttendanceLearnerRecord } from '../modules/AttendanceConsole';

interface LiveRollCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: AttendanceLearnerRecord[];
  sessionDate: string;
  moduleTitle: string;
  sessionVenue: string;
  instructorName: string;
  onCompleteRollCall: (
    updatedStatusMap: Record<string, 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'>,
    latesMap: Record<string, number>
  ) => void;
}

export function LiveRollCallModal({
  isOpen,
  onClose,
  students,
  sessionDate,
  moduleTitle,
  sessionVenue,
  instructorName,
  onCompleteRollCall,
}: LiveRollCallModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tempStatusMap, setTempStatusMap] = useState<
    Record<string, 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'>
  >({});
  const [tempLatesMap, setTempLatesMap] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifyGuardian, setNotifyGuardian] = useState(false);
  const [lateMinutes, setLateMinutes] = useState(15);

  // Initialize with current statuses when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialMap: Record<string, 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'> = {};
      const initialLates: Record<string, number> = {};
      students.forEach((s) => {
        initialMap[s.id] = s.todayStatus;
        if (s.arrivalMinutesLate) initialLates[s.id] = s.arrivalMinutesLate;
      });
      setTempStatusMap(initialMap);
      setTempLatesMap(initialLates);
      setCurrentIndex(0);
      setIsFinished(false);
    }
  }, [isOpen, students]);

  // Audio chime feedback using Web Audio API
  const playTone = useCallback(
    (type: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const freqs = {
          PRESENT: 587.33, // D5 pleasant high
          LATE: 440.0, // A4 warm amber
          ABSENT: 261.63, // C4 low tone
          EXCUSED: 493.88, // B4 soft
        };
        osc.frequency.setValueAtTime(freqs[type] || 440, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } catch {
        // AudioContext not allowed before user interaction
      }
    },
    [soundEnabled]
  );

  const currentStudent = students[currentIndex];

  const handleMark = useCallback(
    (status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED', minutes?: number) => {
      if (!currentStudent) return;
      playTone(status);

      setTempStatusMap((prev) => ({ ...prev, [currentStudent.id]: status }));
      if (status === 'LATE') {
        setTempLatesMap((prev) => ({ ...prev, [currentStudent.id]: minutes || lateMinutes }));
      }

      if (currentIndex < students.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    },
    [currentStudent, currentIndex, students.length, playTone, lateMinutes]
  );

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen || isFinished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is in an input or select
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toLowerCase();
      if (key === 'p') {
        e.preventDefault();
        handleMark('PRESENT');
      } else if (key === 'l') {
        e.preventDefault();
        handleMark('LATE', lateMinutes);
      } else if (key === 'a') {
        e.preventDefault();
        handleMark('ABSENT');
      } else if (key === 'e') {
        e.preventDefault();
        handleMark('EXCUSED');
      } else if (e.key === 'ArrowRight' && currentIndex < students.length - 1) {
        e.preventDefault();
        setCurrentIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFinished, currentIndex, students.length, handleMark, lateMinutes]);

  const handleSaveAndCommit = () => {
    onCompleteRollCall(tempStatusMap, tempLatesMap);
    onClose();
  };

  if (!isOpen) return null;

  const presentCount = Object.values(tempStatusMap).filter((s) => s === 'PRESENT').length;
  const lateCount = Object.values(tempStatusMap).filter((s) => s === 'LATE').length;
  const absentCount = Object.values(tempStatusMap).filter((s) => s === 'ABSENT').length;
  const excusedCount = Object.values(tempStatusMap).filter((s) => s === 'EXCUSED').length;
  const progressPercent = Math.round(((currentIndex + 1) / (students.length || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
              <Radio className="h-5 w-5 animate-pulse text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Conduct Live Roll-Call Session</h3>
              <p className="text-xs text-slate-500">
                Rapid card-by-card marking with hotkeys: <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono">P</kbd> Present • <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono">L</kbd> Late • <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono">A</kbd> Absent • <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono">E</kbd> Excused
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

        {/* Session Metadata Context Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="font-bold text-slate-800">{moduleTitle}</span>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>📅 {sessionDate}</span>
              <span>•</span>
              <span>📍 {sessionVenue}</span>
              <span>•</span>
              <span>👨‍🏫 {instructorName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                soundEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title="Toggle audio chime cues"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setNotifyGuardian(!notifyGuardian)}
              className={`p-1.5 px-2.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${
                notifyGuardian
                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title="SMS guardian alerts for absent/late trainees"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>SMS Alert: {notifyGuardian ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {!isFinished && currentStudent ? (
          <div className="space-y-5">
            {/* Progress Bar & Stepper Controls */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="font-mono bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded-md">
                  Candidate {currentIndex + 1} of {students.length}
                </span>
                <span className="text-slate-400">({progressPercent}% complete)</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={currentIndex === students.length - 1}
                  onClick={() => setCurrentIndex((prev) => Math.min(students.length - 1, prev + 1))}
                  className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-600 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Current Trainee Profile Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/50 border border-cyan-200/80 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Avatar with Initials */}
                  <div className="h-16 w-16 rounded-2xl bg-cyan-800 text-white font-extrabold text-xl grid place-items-center shadow-md">
                    {currentStudent.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>

                  <div>
                    <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-100 px-2.5 py-0.5 rounded-md">
                      {currentStudent.studentNumber}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-1">{currentStudent.name}</h2>
                    <p className="text-xs font-semibold text-slate-600">{currentStudent.programme}</p>
                    <p className="text-[11px] text-slate-500 font-medium">Cohort: {currentStudent.cohort}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Current Status
                  </span>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                      tempStatusMap[currentStudent.id] === 'PRESENT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tempStatusMap[currentStudent.id] === 'LATE'
                        ? 'bg-amber-100 text-amber-800'
                        : tempStatusMap[currentStudent.id] === 'ABSENT'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {tempStatusMap[currentStudent.id] || 'UNRECORDED'}
                  </span>
                </div>
              </div>

              {/* Action Buttons with Keyboard Triggers */}
              <div className="pt-3 border-t border-cyan-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Select Status for Roll-Call:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleMark('PRESENT')}
                    className="p-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 transition shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95"
                  >
                    <div className="flex items-center gap-1.5">
                      <Check className="h-4 w-4" />
                      <span>[P] Present</span>
                    </div>
                    <span className="text-[10px] opacity-80 font-normal">On Time in Session</span>
                  </button>

                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleMark('LATE', lateMinutes)}
                      className="p-3.5 rounded-xl bg-amber-500 text-white font-extrabold text-sm hover:bg-amber-600 transition shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95"
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>[L] Late ({lateMinutes}m)</span>
                      </div>
                      <span className="text-[10px] opacity-80 font-normal">Arrived Delayed</span>
                    </button>
                    <select
                      value={lateMinutes}
                      onChange={(e) => setLateMinutes(Number(e.target.value))}
                      className="text-[10px] font-bold text-slate-700 bg-white border border-slate-300 rounded px-1.5 py-0.5"
                    >
                      <option value={10}>10 min delay</option>
                      <option value={15}>15 min delay</option>
                      <option value={30}>30 min delay</option>
                      <option value={45}>45 min delay</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMark('ABSENT')}
                    className="p-3.5 rounded-xl bg-rose-600 text-white font-extrabold text-sm hover:bg-rose-700 transition shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95"
                  >
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      <span>[A] Absent</span>
                    </div>
                    <span className="text-[10px] opacity-80 font-normal">Unexcused Deficit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMark('EXCUSED')}
                    className="p-3.5 rounded-xl bg-blue-600 text-white font-extrabold text-sm hover:bg-blue-700 transition shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95"
                  >
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      <span>[E] Excused</span>
                    </div>
                    <span className="text-[10px] opacity-80 font-normal">Sick Bay / Permit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Finished Screen */
          <div className="p-8 text-center space-y-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 text-emerald-800 grid place-items-center shadow-md">
              <Check className="h-8 w-8 text-emerald-700" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">Roll-Call Completed!</h2>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                All {students.length} trainees marked for {moduleTitle} ({sessionDate}). Review cohort totals below before committing return to official CMIS register.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto text-center">
              <div className="p-3 rounded-xl bg-emerald-100/80 border border-emerald-300">
                <span className="block text-2xl font-black text-emerald-800">{presentCount}</span>
                <span className="text-[11px] font-bold text-emerald-700">Present</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-100/80 border border-amber-300">
                <span className="block text-2xl font-black text-amber-800">{lateCount}</span>
                <span className="text-[11px] font-bold text-amber-700">Late</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-100/80 border border-rose-300">
                <span className="block text-2xl font-black text-rose-800">{absentCount}</span>
                <span className="text-[11px] font-bold text-rose-700">Absent</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-100/80 border border-blue-300">
                <span className="block text-2xl font-black text-blue-800">{excusedCount}</span>
                <span className="text-[11px] font-bold text-blue-700">Excused</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentIndex(0);
                  setIsFinished(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <RotateCcw className="h-4 w-4" /> Review from Candidate 1
              </button>

              <button
                type="button"
                onClick={handleSaveAndCommit}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-cyan-800 transition active:scale-95"
              >
                <Check className="h-4 w-4" /> Save & Commit to Register
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>NWUCHAS Attendance & Engagement Command</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
