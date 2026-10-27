'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  WalletCards,
  ShieldCheck,
  Check,
  Users,
  Layers,
  Sparkles,
  AlertCircle,
  Building2,
} from 'lucide-react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  learners: Array<{
    id: string;
    studentNumber: string;
    firstName: string;
    lastName: string;
  }>;
  onInvoiceCreated: (newInv: any) => void;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  learners,
  onInvoiceCreated,
}: CreateInvoiceModalProps) {
  if (!isOpen) return null;

  // Mode: 'single' (individual student) or 'batch' (1-click cohort batch)
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  // Single mode state
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(learners[0]?.id || '');
  const [semester, setSemester] = useState<string>('Year 1, Semester 1 (2026)');
  const [dueDate, setDueDate] = useState<string>('2026-11-30');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Cohort Batch Mode state (GAP-04)
  const [cohorts, setCohorts] = useState<Array<any>>([
    {
      id: 'cohort-rn-2026-jan',
      name: 'RN-2026-JAN',
      programmeName: 'Diploma in Registered Nursing',
      intake: 'January 2026 Intake',
      currentSemester: 1,
      enrolledCount: 120,
      tuition: 6500,
      clinical: 1800,
      council: 'NMCZ_INDEXING',
    },
    {
      id: 'cohort-cm-2026-jan',
      name: 'CM-2026-JAN',
      programmeName: 'Diploma in Clinical Medicine',
      intake: 'January 2026 Intake',
      currentSemester: 1,
      enrolledCount: 80,
      tuition: 6800,
      clinical: 1900,
      council: 'HPCZ_INDEXING',
    },
    {
      id: 'cohort-dpharm-2026-jan',
      name: 'DPHARM-2026-JAN',
      programmeName: 'Diploma in Pharmacy',
      intake: 'January 2026 Intake',
      currentSemester: 1,
      enrolledCount: 60,
      tuition: 6200,
      clinical: 1400,
      council: 'HPCZ_INDEXING',
    },
  ]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>('cohort-rn-2026-jan');
  const [residencyType, setResidencyType] = useState<string>('DAY_SCHOLAR');

  // Fetch real cohorts from API if available
  useEffect(() => {
    async function loadCohorts() {
      try {
        const res = await fetch('/api/finance/invoices/batch');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCohorts(data.data);
          setSelectedCohortId(data.data[0].id);
        }
      } catch {
        // Fall back to tertiary health sciences preset cohorts
      }
    }
    loadCohorts();
  }, []);

  const selectedCohort = cohorts.find((c) => c.id === selectedCohortId) || cohorts[0];

  // Invoice Lines
  const [lines, setLines] = useState([
    { category: 'TUITION', description: 'Semester 1 Tuition Fee', amountZMW: 6500 },
    { category: 'CLINICAL_PRACTICUM', description: 'Clinical Placement & Hospital Facility Fee', amountZMW: 1800 },
    { category: 'NMCZ_INDEXING', description: 'NMCZ Statutory Council Indexing & Logbook', amountZMW: 1200 },
    { category: 'SKILLS_LAB', description: 'Clinical Simulation Skills Lab Consumables', amountZMW: 850 },
  ]);

  const totalAmount = lines.reduce((sum, l) => sum + (Number(l.amountZMW) || 0), 0);
  const targetCohortCount = selectedCohort?.enrolledCount || 120;
  const projectedCohortTotal = totalAmount * targetCohortCount;

  function addPreset(category: string, description: string, amount: number) {
    setLines([...lines, { category, description, amountZMW: amount }]);
  }

  function removeLine(idx: number) {
    setLines(lines.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (lines.length === 0) {
      setErrorMessage('Please add at least one line item to the invoice.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'single') {
        // Single candidate invoice creation
        if (!selectedLearnerId) {
          setErrorMessage('Please select a learner.');
          setIsSubmitting(false);
          return;
        }

        const res = await fetch('/api/finance/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            learnerId: selectedLearnerId,
            dueDate,
            lines,
          }),
        });

        const data = await res.json();
        if (data.success) {
          onInvoiceCreated(data.data);
          onClose();
        } else {
          setErrorMessage(data.message || 'Failed to create invoice.');
        }
      } else {
        // GAP-04: 1-Click Cohort Batch Invoicing
        const res = await fetch('/api/finance/invoices/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cohortId: selectedCohortId,
            dueDate,
            semesterNumber: selectedCohort?.currentSemester || 1,
            residencyType,
            lines,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setSuccessMessage(
            `Successfully invoiced ${data.data.invoicesCreated} students in ${data.data.cohortName}! (Total: K${data.data.totalAmountBilled.toLocaleString()})`
          );
          if (data.data.invoices && data.data.invoices[0]) {
            onInvoiceCreated(data.data.invoices[0]);
          }
          setTimeout(() => {
            onClose();
          }, 1800);
        } else {
          setErrorMessage(data.message || 'Failed to execute cohort batch invoicing.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with finance server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-700 text-white shadow-sm">
              <WalletCards className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Tertiary Fee Invoicing Engine</h3>
              <p className="text-[11px] text-slate-500">Post debit charges to student ledger with automated advance drawdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Individual vs 1-Click Cohort Batch) */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex-1 rounded-lg py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
              mode === 'single'
                ? 'bg-white text-cyan-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Individual Candidate Invoice
          </button>
          <button
            type="button"
            onClick={() => setMode('batch')}
            className={`flex-1 rounded-lg py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
              mode === 'batch'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            1-Click Cohort Batch Invoicing (Bursar)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
              <Check className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SINGLE MODE SELECTION */}
          {mode === 'single' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Select Candidate
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
                  Academic Semester
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* BATCH COHORT MODE SELECTION (GAP-04) */}
          {mode === 'batch' && (
            <div className="rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50/70 to-blue-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-700" />
                <span className="text-xs font-extrabold text-cyan-900 uppercase tracking-wide">
                  1-Click Cohort Invoicing Setup (Zambian Health Sciences)
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Select Target Cohort
                  </label>
                  <select
                    value={selectedCohortId}
                    onChange={(e) => setSelectedCohortId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-cyan-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-700 focus:outline-none"
                  >
                    {cohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.programmeName} ({c.enrolledCount} Students)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Student Enrolment Type (Residency)
                  </label>
                  <select
                    value={residencyType}
                    onChange={(e) => setResidencyType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-cyan-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-700 focus:outline-none"
                  >
                    <option value="DAY_SCHOLAR">Day Scholar (Solwezi / Manyama Area)</option>
                    <option value="HOSTEL_RESIDENT">Hostel Resident (Florence Nightingale Hall)</option>
                    <option value="IN_SERVICE">In-Service Registered Nurse / Clinical Officer Upgrade</option>
                    <option value="INTERNATIONAL">International / SADC Regional Student</option>
                  </select>
                </div>
              </div>

              {/* Cohort Metrics Summary */}
              <div className="flex flex-wrap items-center justify-between rounded-lg bg-white p-3 border border-cyan-200 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold">Cohort Roster: </span>
                  <span className="font-extrabold text-cyan-900">{targetCohortCount} Active Candidates</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Per Student: </span>
                  <span className="font-extrabold text-slate-800">K{totalAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Total Projected Debit: </span>
                  <span className="font-mono font-black text-cyan-700">K{projectedCohortTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Mandatory Health Fee Presets (GAP-03)
              </label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => addPreset('CLINICAL_PRACTICUM', 'Hospital Affiliation & Clinical Practicum Fee', 1800)}
                  className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                >
                  + Clinical (K1,800)
                </button>
                <button
                  type="button"
                  onClick={() => addPreset('NMCZ_INDEXING', 'NMCZ Nursing Statutory Council Indexing', 1200)}
                  className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                >
                  + NMCZ (K1,200)
                </button>
                <button
                  type="button"
                  onClick={() => addPreset('SKILLS_LAB', 'Clinical Simulation Skills Lab Consumables', 850)}
                  className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                >
                  + Skills Lab (K850)
                </button>
                <button
                  type="button"
                  onClick={() => addPreset('OSCE_EXAMINATION', 'OSCE Practical Clinical Examination Levy', 950)}
                  className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                >
                  + OSCE Exam (K950)
                </button>
                <button
                  type="button"
                  onClick={() => addPreset('HOSTEL_ACCOMMODATION', 'Florence Nightingale Hostel Accommodation', 2500)}
                  className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                >
                  + Hostel (K2,500)
                </button>
              </div>
            </div>
          </div>

          {/* Line Items List */}
          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Invoice Breakdown Lines ({lines.length} items)
              </label>
              <button
                type="button"
                onClick={() => addPreset('TUITION', 'Additional Health Sciences Course Module Fee', 1500)}
                className="text-[11px] font-bold text-cyan-700 hover:underline"
              >
                + Add Custom Item
              </button>
            </div>

            <div className="mt-2 space-y-2">
              {lines.map((l, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
                  <span className="w-28 shrink-0 truncate rounded bg-slate-200 px-2 py-1 font-bold text-[10px] text-slate-700 text-center uppercase">
                    {l.category.replace('_', ' ')}
                  </span>
                  <input
                    type="text"
                    value={l.description}
                    onChange={(e) => {
                      const updated = [...lines];
                      updated[idx].description = e.target.value;
                      setLines(updated);
                    }}
                    className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none"
                  />
                  <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                    <span>K</span>
                    <input
                      type="number"
                      value={l.amountZMW}
                      onChange={(e) => {
                        const updated = [...lines];
                        updated[idx].amountZMW = Number(e.target.value);
                        setLines(updated);
                      }}
                      className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-right focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-cyan-50 p-3 text-cyan-950">
              <span className="text-xs font-black uppercase tracking-wider">
                {mode === 'batch' ? 'Unit Total Per Candidate (ZMW):' : 'Total Invoice Amount (ZMW):'}
              </span>
              <span className="font-mono text-lg font-black">K{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Footer Controls */}
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
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 ${
                mode === 'batch'
                  ? 'bg-cyan-700 hover:bg-cyan-800'
                  : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              <Check className="h-4 w-4" />
              {isSubmitting
                ? mode === 'batch'
                  ? 'Batch Invoicing Cohort...'
                  : 'Generating Invoice...'
                : mode === 'batch'
                ? `1-Click Invoice All ${targetCohortCount} Students`
                : 'Generate & Post Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
