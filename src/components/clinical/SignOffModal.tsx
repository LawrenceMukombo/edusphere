'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Award, ShieldCheck, Check } from 'lucide-react';

interface SignOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any;
  onSigned: (signedEntry: any) => void;
}

export function SignOffModal({
  isOpen,
  onClose,
  entry,
  onSigned,
}: SignOffModalProps) {
  if (!isOpen || !entry) return null;

  const [preceptorName, setPreceptorName] = useState<string>('Sr. Patricia Mwewa, RN, BScN');
  const [councilRegNo, setCouncilRegNo] = useState<string>('NMCZ-RN-2012-04481');
  const [feedback, setFeedback] = useState<string>(
    'Demonstrated excellent aseptic technique and calm bedside communication with the patient.'
  );
  const [rating, setRating] = useState<string>('EXCELLENT');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function handleSignOff(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/clinical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign_logbook',
          logbookEntryId: entry.id,
          supervisorFeedback: feedback,
        }),
      });

      const data = await res.json();
      onSigned({
        ...entry,
        isSupervisorSigned: true,
        supervisorFeedback: feedback,
        supervisorName: preceptorName,
        signedAt: '24 October 2026',
      });
      onClose();
    } catch (err: any) {
      console.error('Error signing logbook:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Preceptor Sign-off & Evaluation</h3>
              <p className="text-[11px] text-slate-500">Official Clinical Skill Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSignOff} className="p-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-1.5">
            <p><strong>Candidate:</strong> {entry.studentName || 'Nursing Trainee'}</p>
            <p><strong>Procedure:</strong> {entry.procedureTitle || entry.activityCode}</p>
            <p><strong>Case Summary:</strong> {entry.caseSummaryDeidentified}</p>
            <p><strong>Hours Completed:</strong> {entry.hoursLogged || 4} hours</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Supervising Preceptor Full Name & Credentials
            </label>
            <input
              type="text"
              required
              value={preceptorName}
              onChange={(e) => setPreceptorName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Council Professional Registration # (NMCZ / HPCZ)
            </label>
            <input
              type="text"
              required
              value={councilRegNo}
              onChange={(e) => setCouncilRegNo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 focus:border-cyan-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Preceptor Assessment Remarks & Feedback
            </label>
            <textarea
              rows={3}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-xs leading-relaxed text-slate-800 focus:border-cyan-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Proficiency Attainment Level
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
            >
              <option value="EXCELLENT">Exceeds Competency Expectation (Distinction)</option>
              <option value="SATISFACTORY">Competent for Level of Training (Pass)</option>
              <option value="NEEDS_IMPROVEMENT">Requires Additional Supervised Practice</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? 'Signing...' : 'Sign & Endorse Logbook Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
