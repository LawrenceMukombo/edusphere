'use client';

import React, { useState } from 'react';
import { X, BookOpen, ShieldCheck, AlertCircle, Check } from 'lucide-react';

interface LogProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  placements: any[];
  learners: any[];
  onLogbookSubmitted: (entry: any) => void;
}

export function LogProcedureModal({
  isOpen,
  onClose,
  placements,
  learners,
  onLogbookSubmitted,
}: LogProcedureModalProps) {
  if (!isOpen) return null;

  const [selectedPlacementId, setSelectedPlacementId] = useState<string>(placements[0]?.id || '');
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(learners[0]?.id || '');
  const [procedureCategory, setProcedureCategory] = useState<string>('CORE_NURSING');
  const [activityCode, setActivityCode] = useState<string>('NUR-IV-CANNULATION');
  const [procedureTitle, setProcedureTitle] = useState<string>('Intravenous Cannulation & Infusion Setup');
  const [hoursCompleted, setHoursCompleted] = useState<number>(4);
  const [caseSummary, setCaseSummary] = useState<string>(
    'Adult patient presented with moderate dehydration secondary to acute gastroenteritis. 20G IV cannula inserted under aseptic technique on first attempt. Normal saline 1000ml initiated.'
  );
  const [competencyRating, setCompetencyRating] = useState<string>('PERFORMED_WITH_SUPERVISION');
  const [reflection, setReflection] = useState<string>(
    'Maintained strict sterility. Observed importance of vein palpation over visual inspection alone.'
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [privacyWarning, setPrivacyWarning] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Check for privacy violations (e.g. phone numbers, common names)
  function handleCaseSummaryChange(val: string) {
    setCaseSummary(val);
    const phoneRegex = /(\+?260|09[567]|07[67])\d{7,8}/;
    if (phoneRegex.test(val)) {
      setPrivacyWarning('Warning: Phone number detected! Patient contact details are strictly prohibited.');
    } else {
      setPrivacyWarning('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (privacyWarning) {
      setErrorMessage('Please remove confidential patient identifiers before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/clinical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_logbook',
          learnerId: selectedLearnerId,
          placementId: selectedPlacementId,
          procedureCategory,
          activityCode,
          hoursCompleted: Number(hoursCompleted),
          caseSummaryDeidentified: caseSummary,
          competencySelfRating: competencyRating,
          reflection,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onLogbookSubmitted(data.data);
        onClose();
      } else {
        setErrorMessage(data.message || 'Failed to submit logbook entry.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error submitting logbook entry.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white">
              <BookOpen className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Log Clinical Procedure (EPA Logbook)</h3>
              <p className="text-[11px] text-slate-500">De-identified case entry strictly preserving patient anonymity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-800">
              {errorMessage}
            </div>
          )}

          {privacyWarning && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs font-bold text-amber-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{privacyWarning}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Trainee Candidate
              </label>
              <select
                value={selectedLearnerId}
                onChange={(e) => setSelectedLearnerId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              >
                {learners.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.firstName} {l.lastName} ({l.studentNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Hospital Ward / Rotation Placement
              </label>
              <select
                value={selectedPlacementId}
                onChange={(e) => setSelectedPlacementId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              >
                {placements.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.clinicalSite?.name || 'Hospital'} • {p.wardOrDept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Procedure Category
              </label>
              <select
                value={procedureCategory}
                onChange={(e) => setProcedureCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
              >
                <option value="CORE_NURSING">Core Nursing Procedures</option>
                <option value="MIDWIFERY_MCH">Midwifery, Labor & MCH</option>
                <option value="CLINICAL_MEDICINE">Clinical Medicine & Minor Surgery</option>
                <option value="PHARMACY_DISPENSING">Pharmacy Practice & Cold Chain</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Hours Completed on Shift
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={hoursCompleted}
                onChange={(e) => setHoursCompleted(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Activity / Procedure Code & Title
            </label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <input
                type="text"
                value={activityCode}
                onChange={(e) => setActivityCode(e.target.value)}
                placeholder="e.g. NUR-IV-CANNULATION"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-bold text-slate-800 focus:outline-none"
              />
              <input
                type="text"
                value={procedureTitle}
                onChange={(e) => setProcedureTitle(e.target.value)}
                placeholder="Description of clinical procedure"
                className="col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                De-Identified Case Summary
              </label>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Anonymous Case Data Only
              </span>
            </div>
            <textarea
              rows={3}
              value={caseSummary}
              onChange={(e) => handleCaseSummaryChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-xs leading-relaxed text-slate-800 focus:border-cyan-600 focus:outline-none"
            />
            <p className="mt-0.5 text-[10px] text-slate-400">
              Do not include patient names, NRC numbers, or phone numbers. Use "Adult female", "Pediatric male 4yo", etc.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Supervision Level (EPA Milestone)
              </label>
              <select
                value={competencyRating}
                onChange={(e) => setCompetencyRating(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              >
                <option value="OBSERVED">Level 1: Observed Preceptor</option>
                <option value="PERFORMED_WITH_SUPERVISION">Level 2: Performed under Direct Preceptor Supervision</option>
                <option value="PERFORMED_INDEPENDENTLY">Level 3: Performed with Indirect Supervision</option>
                <option value="AUTONOMOUS_PRACTICE">Level 4: Competent for Autonomous Practice</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Candidate Reflection & Learning Points
              </label>
              <input
                type="text"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>
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
              {isSubmitting ? 'Recording Entry...' : 'Submit Logbook Entry for Sign-off'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
