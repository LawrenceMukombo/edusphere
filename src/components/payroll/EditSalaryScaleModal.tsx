'use client';

import React, { useState, useEffect } from 'react';
import { X, Layers, Check, Calculator, ShieldCheck, AlertCircle } from 'lucide-react';

export interface SalaryScale {
  id: string;
  code: string;
  title: string;
  category: 'ACADEMIC' | 'CLINICAL' | 'ADMINISTRATIVE' | 'OPERATIONS';
  gradeBand: string;
  basicSalaryZMW: number;
  housingAllowanceZMW: number;
  transportAllowanceZMW: number;
  clinicalAllowanceZMW: number;
  otherAllowancesZMW: number;
  statutoryDeductions: {
    payeApplicable: boolean;
    napsaApplicable: boolean;
    nhimaApplicable: boolean;
    wcfcbEmployerLevy: boolean;
  };
  notes?: string;
}

interface EditSalaryScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  scale: SalaryScale | null;
  onSave: (updated: SalaryScale) => void;
}

export function EditSalaryScaleModal({
  isOpen,
  onClose,
  scale,
  onSave,
}: EditSalaryScaleModalProps) {
  if (!isOpen || !scale) return null;

  const [formData, setFormData] = useState<SalaryScale>({ ...scale });
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (scale) {
      setFormData({ ...scale });
      setErrorMessage('');
    }
  }, [scale]);

  const grossPay =
    Number(formData.basicSalaryZMW || 0) +
    Number(formData.housingAllowanceZMW || 0) +
    Number(formData.transportAllowanceZMW || 0) +
    Number(formData.clinicalAllowanceZMW || 0) +
    Number(formData.otherAllowancesZMW || 0);

  // Compute estimated statutory deductions
  function computeEstimatedDeductions(gross: number) {
    // ZRA PAYE 2026: 0% up to 5100, 20% 5100-7100, 30% 7100-9200, 37% > 9200
    let paye = 0;
    if (gross > 9200) {
      paye += (gross - 9200) * 0.37;
      paye += 2100 * 0.30;
      paye += 2000 * 0.20;
    } else if (gross > 7100) {
      paye += (gross - 7100) * 0.30;
      paye += 2000 * 0.20;
    } else if (gross > 5100) {
      paye += (gross - 5100) * 0.20;
    }

    // NAPSA 5% capped at 1,493.40
    const napsa = Math.min(gross * 0.05, 1493.40);

    // NHIMA 1%
    const nhima = gross * 0.01;

    const totalDeductions = paye + napsa + nhima;
    const netPay = Math.max(0, gross - totalDeductions);
    const wcfcb = gross * 0.025; // Employer cost

    return { paye, napsa, nhima, totalDeductions, netPay, wcfcb };
  }

  const estimated = computeEstimatedDeductions(grossPay);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.code.trim()) {
      setErrorMessage('Scale Code is required (e.g. NWU-ACAD-01).');
      return;
    }
    if (!formData.title.trim()) {
      setErrorMessage('Scale Title is required.');
      return;
    }
    if (formData.basicSalaryZMW <= 0) {
      setErrorMessage('Basic Salary must be greater than zero.');
      return;
    }

    onSave(formData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-700 text-white">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                {formData.id.startsWith('new-') ? 'Create Salary Scale & Statutory Pay Band' : 'Configure Salary Scale'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">{formData.code || 'NWU-SCALE'}</p>
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
            <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Scale Code / Grade Ref
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. NWU-ACAD-01"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-bold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Staff Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-600 focus:outline-none"
              >
                <option value="ACADEMIC">Academic Faculty</option>
                <option value="CLINICAL">Clinical & Hospital Instructors</option>
                <option value="ADMINISTRATIVE">Administrative & Registry</option>
                <option value="OPERATIONS">Campus Operations & Support</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Scale Title / Designation
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Lecturer / Head of Nursing"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Grade Band
              </label>
              <input
                type="text"
                value={formData.gradeBand}
                onChange={(e) => setFormData({ ...formData, gradeBand: e.target.value })}
                placeholder="e.g. Band A1 / Band B2"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Salary & Allowances Fields */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Calculator className="h-3.5 w-3.5 text-cyan-700" />
              Remuneration Structure (ZMW Monthly)
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600">Basic Salary (ZMW):</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">K</span>
                  <input
                    type="number"
                    value={formData.basicSalaryZMW}
                    onChange={(e) => setFormData({ ...formData, basicSalaryZMW: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 font-mono text-xs font-extrabold text-slate-900 focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600">Housing Allowance (ZMW):</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">K</span>
                  <input
                    type="number"
                    value={formData.housingAllowanceZMW}
                    onChange={(e) => setFormData({ ...formData, housingAllowanceZMW: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 font-mono text-xs font-bold text-slate-900 focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600">Transport Allowance (ZMW):</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">K</span>
                  <input
                    type="number"
                    value={formData.transportAllowanceZMW}
                    onChange={(e) => setFormData({ ...formData, transportAllowanceZMW: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 font-mono text-xs font-bold text-slate-900 focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600">Clinical / Responsibility Allowance (ZMW):</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">K</span>
                  <input
                    type="number"
                    value={formData.clinicalAllowanceZMW}
                    onChange={(e) => setFormData({ ...formData, clinicalAllowanceZMW: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 font-mono text-xs font-bold text-slate-900 focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-700 uppercase">Computed Gross Pay:</span>
              <span className="font-mono font-black text-slate-900 text-sm">K{grossPay.toLocaleString()}</span>
            </div>
          </div>

          {/* Statutory Deductions Breakdown Box */}
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-cyan-950 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-cyan-700" />
                Statutory Deductions & Net Take-Home (Zambian 2026 Standards)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="rounded-lg bg-white p-2 border border-slate-200">
                <span className="text-slate-500 block text-[10px]">ZRA PAYE (Progressive):</span>
                <span className="font-bold text-rose-700">- K{estimated.paye.toFixed(2)}</span>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-200">
                <span className="text-slate-500 block text-[10px]">NAPSA (5% Capped K1,493.40):</span>
                <span className="font-bold text-cyan-800">- K{estimated.napsa.toFixed(2)}</span>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-200">
                <span className="text-slate-500 block text-[10px]">NHIMA (1% National Health):</span>
                <span className="font-bold text-slate-700">- K{estimated.nhima.toFixed(2)}</span>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-200">
                <span className="text-emerald-700 block text-[10px] font-bold">Estimated Net Pay:</span>
                <span className="font-black text-emerald-900">K{estimated.netPay.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              • Employer-only WCFCB Class 4 Health Education levy: K{estimated.wcfcb.toFixed(2)} (never deducted from employee).
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Remarks & Council / Accreditation References
            </label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Registered with NMCZ / HPCZ guidelines"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-cyan-600 focus:outline-none"
            />
          </div>

          {/* Actions */}
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
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-800"
            >
              <Check className="h-4 w-4" /> Save Salary Scale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
