'use client';

import React, { useState, useEffect } from 'react';
import { X, Award, Clock, CheckCircle2, AlertCircle, Save } from 'lucide-react';

interface OsceEvaluationModalProps {
  station: any;
  learners: any[];
  onClose: () => void;
  onSaved: (result: any) => void;
}

export function OsceEvaluationModal({
  station,
  learners,
  onClose,
  onSaved,
}: OsceEvaluationModalProps) {
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(learners[0]?.id || '');
  const [examinerName, setExaminerName] = useState<string>('Dr. Kelvin Silwamba');
  const [checkedRubrics, setCheckedRubrics] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<string>('Candidate demonstrated excellent patient rapport and correct aseptic technique.');
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Station Timer
  const totalSeconds = (station.timeAllowedMins || 10) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsRemaining]);

  function formatTimer(secs: number) {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  }

  // Parse Rubrics
  const rubrics: { item: string; marks: number }[] = Array.isArray(station.rubricChecklist)
    ? station.rubricChecklist
    : [
        { item: 'Proper introduction, consent & hand hygiene', marks: 3 },
        { item: 'Identification of anatomic landmarks & equipment prep', marks: 4 },
        { item: 'Execution of aseptic procedure & patient comfort', marks: 8 },
        { item: 'Disposal of sharps, documentation & closure', marks: 5 },
      ];

  const maxScore = Number(station.maxScore || 20);
  const passThreshold = Number(station.passMark || 12);

  // Compute live score
  const totalObtainedScore = rubrics.reduce((acc, r, idx) => {
    return checkedRubrics[idx] ? acc + r.marks : acc;
  }, 0);

  const isPassed = totalObtainedScore >= passThreshold;

  // Initialize all rubrics as checked by default for swift demo entry
  useEffect(() => {
    const init: Record<number, boolean> = {};
    rubrics.forEach((_, idx) => {
      init[idx] = true;
    });
    setCheckedRubrics(init);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLearnerId) {
      setError('Please select a candidate learner.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/academics/osce', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          stationId: station.id,
          learnerId: selectedLearnerId,
          examinerName,
          scoreObtained: totalObtainedScore,
          maxScore,
          isPassed,
          examinerNotes: feedback,
        }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.message || 'Failed to save OSCE evaluation.');
      }

      onSaved(payload.data);
    } catch (err: any) {
      setError(err.message || 'Unable to save OSCE record.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 text-slate-900">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="rounded bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200 uppercase tracking-wider">
              Station {station.stationNumber} • {station.domain?.replace('_', ' ')}
            </span>
            <h3 className="mt-1 text-lg font-bold text-slate-900">{station.title}</h3>
          </div>

          {/* Interactive Countdown Timer */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs shadow-2xs">
            <Clock className="h-4 w-4 text-emerald-700" />
            <span className="font-mono font-bold text-base text-slate-900">{formatTimer(secondsRemaining)}</span>
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`rounded px-2.5 py-1 text-[11px] font-bold shadow-2xs transition ${
                isTimerRunning ? 'bg-amber-600 text-white' : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
            >
              {isTimerRunning ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTimerRunning(false);
                setSecondsRemaining(totalSeconds);
              }}
              className="text-[10px] font-semibold text-slate-500 hover:text-slate-800"
            >
              Reset
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2 shadow-2xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Candidate Selection */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Candidate under Examination</label>
              <select
                value={selectedLearnerId}
                onChange={(e) => setSelectedLearnerId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
              >
                {learners.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.studentNumber} — {l.firstName} {l.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Examiner / Assessor</label>
              <input
                type="text"
                value={examinerName}
                onChange={(e) => setExaminerName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
              />
            </div>
          </div>

          {/* Rubric Criteria Checklist */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Standardised Clinical Rubrics ({rubrics.length} Criteria)
              </span>
              <span className="text-xs font-semibold text-slate-500">Total Marks: {maxScore}</span>
            </div>

            <div className="space-y-2 pt-1">
              {rubrics.map((r, idx) => (
                <label
                  key={idx}
                  className={`flex items-start justify-between gap-3 rounded-lg border p-2.5 text-xs cursor-pointer transition ${
                    checkedRubrics[idx]
                      ? 'border-emerald-300 bg-white text-slate-900 shadow-2xs'
                      : 'border-slate-200 bg-slate-100/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={checkedRubrics[idx] || false}
                      onChange={(e) => setCheckedRubrics({ ...checkedRubrics, [idx]: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-0"
                    />
                    <span className="leading-snug font-medium">{r.item}</span>
                  </div>
                  <span className="shrink-0 font-mono font-bold text-emerald-800">
                    {checkedRubrics[idx] ? `+${r.marks}` : '0'}/{r.marks} pts
                  </span>
                </label>
              ))}
            </div>

            {/* Score Totalizer */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Calculated Score:</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-mono font-black text-slate-900">
                  {totalObtainedScore.toFixed(1)} / {maxScore.toFixed(1)}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                  isPassed ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {isPassed ? 'COMPETENT (PASS)' : 'NOT YET COMPETENT'}
                </span>
              </div>
            </div>
          </div>

          {/* Examiner Notes & Feedback */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Examiner Clinical Observations &amp; Feedback</label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Record specific feedback regarding candidate's clinical competency, errors, or commended technique..."
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {busy ? 'Saving Assessment...' : 'Record & Sign Station Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
