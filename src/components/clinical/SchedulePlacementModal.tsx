'use client';

import React, { useState } from 'react';
import { X, Calendar, Building, Check, Plus } from 'lucide-react';

interface SchedulePlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: any[];
  learners: any[];
  onPlacementCreated: (newPlacement: any) => void;
}

export function SchedulePlacementModal({
  isOpen,
  onClose,
  sites,
  learners,
  onPlacementCreated,
}: SchedulePlacementModalProps) {
  if (!isOpen) return null;

  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(learners[0]?.id || '');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [wardOrDept, setWardOrDept] = useState<string>('Female Medical & Surgical Ward');
  const [startDate, setStartDate] = useState<string>('2026-11-02');
  const [endDate, setEndDate] = useState<string>('2026-12-18');
  const [targetHours, setTargetHours] = useState<number>(240);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/clinical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_placement',
          learnerId: selectedLearnerId,
          clinicalSiteId: selectedSiteId,
          wardOrDept,
          startDate,
          endDate,
          totalHoursTarget: Number(targetHours),
        }),
      });

      const data = await res.json();
      if (data.success) {
        onPlacementCreated(data.data);
        onClose();
      } else {
        setErrorMessage(data.message || 'Failed to create placement.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error scheduling placement.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-600 text-white">
              <Calendar className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Assign Hospital Clinical Rotation</h3>
              <p className="text-[11px] text-slate-500">Schedule student attachment to accredited training hospital</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-800">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Select Trainee Candidate
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
              Accredited Hospital Training Facility
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.location}) • Cap: {s.capacityStudents || 30}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Ward / Department Block
            </label>
            <select
              value={wardOrDept}
              onChange={(e) => setWardOrDept(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
            >
              <option value="Female Medical & Surgical Ward">Female Medical & Surgical Ward</option>
              <option value="Male Medical & Surgical Ward">Male Medical & Surgical Ward</option>
              <option value="Pediatric & Neonatal Ward">Pediatric & Neonatal Ward</option>
              <option value="Maternity, Labor Ward & Antenatal">Maternity, Labor Ward & Antenatal</option>
              <option value="Main Operating Theatre & Recovery">Main Operating Theatre & Recovery</option>
              <option value="Emergency & Casualty Unit">Emergency & Casualty Unit</option>
              <option value="Outpatient Consultation (OPD)">Outpatient Consultation (OPD)</option>
              <option value="Pharmacy Practice & Dispensing">Pharmacy Practice & Dispensing</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Rotation Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Rotation End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Target Clinical Quota Hours
            </label>
            <input
              type="number"
              min={20}
              max={600}
              value={targetHours}
              onChange={(e) => setTargetHours(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Minimum 160h required for standard 4-week clinical block rotation.
            </p>
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
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? 'Scheduling...' : 'Confirm Placement Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
