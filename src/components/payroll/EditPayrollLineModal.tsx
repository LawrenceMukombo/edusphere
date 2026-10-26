'use client';

import React, { useState, useEffect } from 'react';
import { X, Calculator, ShieldCheck, Check, DollarSign, Award, AlertCircle } from 'lucide-react';
import { formatMoney } from '@/lib/dateUtils';

interface EditPayrollLineModalProps {
  isOpen: boolean;
  onClose: () => void;
  line: any | null;
  periodName: string;
  onSave: (updatedLine: any) => void;
}

export function EditPayrollLineModal({
  isOpen,
  onClose,
  line,
  periodName,
  onSave,
}: EditPayrollLineModalProps) {
  if (!isOpen || !line) return null;

  const staff = line.staff || {};

  const [basicSalary, setBasicSalary] = useState<number>(Number(line.basicSalaryZMW || 0));
  const [housingAllowance, setHousingAllowance] = useState<number>(
    Number(line.housingAllowanceZMW || staff.contract?.housingAllowance || 0)
  );
  const [transportAllowance, setTransportAllowance] = useState<number>(
    Number(line.transportAllowanceZMW || staff.contract?.transportAllowance || 0)
  );
  const [clinicalAllowance, setClinicalAllowance] = useState<number>(
    Number(line.clinicalAllowanceZMW || staff.contract?.clinicalAllowance || 0)
  );
  const [otherAllowances, setOtherAllowances] = useState<number>(
    Number(line.otherAllowancesZMW || 0)
  );
  const [customDeductions, setCustomDeductions] = useState<number>(
    Number(line.otherDeductionsZMW || 0)
  );

  useEffect(() => {
    if (line) {
      setBasicSalary(Number(line.basicSalaryZMW || 0));
      setHousingAllowance(Number(line.housingAllowanceZMW || staff.contract?.housingAllowance || 0));
      setTransportAllowance(Number(line.transportAllowanceZMW || staff.contract?.transportAllowance || 0));
      setClinicalAllowance(Number(line.clinicalAllowanceZMW || staff.contract?.clinicalAllowance || 0));
      setOtherAllowances(Number(line.otherAllowancesZMW || 0));
      setCustomDeductions(Number(line.otherDeductionsZMW || 0));
    }
  }, [line]);

  // Derived calculations
  const totalAllowances =
    Number(housingAllowance || 0) +
    Number(transportAllowance || 0) +
    Number(clinicalAllowance || 0) +
    Number(otherAllowances || 0);

  const grossPay = Number(basicSalary || 0) + totalAllowances;

  // Progressive ZRA PAYE 2026:
  // Band 1: First K5,100 @ 0%
  // Band 2: Next K2,000 (5,100 - 7,100) @ 20%
  // Band 3: Next K2,100 (7,100 - 9,200) @ 30%
  // Band 4: Above K9,200 @ 37%
  let paye = 0;
  if (grossPay > 5100) {
    const b2 = Math.min(grossPay - 5100, 2000);
    paye += b2 * 0.20;
  }
  if (grossPay > 7100) {
    const b3 = Math.min(grossPay - 7100, 2100);
    paye += b3 * 0.30;
  }
  if (grossPay > 9200) {
    const b4 = grossPay - 9200;
    paye += b4 * 0.37;
  }

  // NAPSA: 5% employee + 5% employer, capped at K1,493.40/month
  const napsaEmp = Math.min(grossPay * 0.05, 1493.40);
  const napsaEmployer = napsaEmp;

  // NHIMA: 1% employee + 1% employer
  const nhimaEmp = grossPay * 0.01;
  const nhimaEmployer = nhimaEmp;

  // WCFCB Class 4: 2.5% employer-only levy
  const wcfcbEmployer = grossPay * 0.025;

  // Total deductions from employee
  const totalEmployeeDeductions = paye + napsaEmp + nhimaEmp + Number(customDeductions || 0);

  // Net payable
  const netPay = grossPay - totalEmployeeDeductions;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const updated = {
      ...line,
      basicSalaryZMW: basicSalary,
      totalAllowancesZMW: totalAllowances,
      housingAllowanceZMW: housingAllowance,
      transportAllowanceZMW: transportAllowance,
      clinicalAllowanceZMW: clinicalAllowance,
      otherAllowancesZMW: otherAllowances,
      grossPayZMW: grossPay,
      payeDeductionZMW: paye,
      napsaEmployeeZMW: napsaEmp,
      napsaEmployerZMW: napsaEmployer,
      nhimaEmployeeZMW: nhimaEmp,
      nhimaEmployerZMW: nhimaEmployer,
      wcfcbEmployerZMW: wcfcbEmployer,
      otherDeductionsZMW: customDeductions,
      netPayZMW: netPay,
    };

    onSave(updated);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Edit Paysheet Remuneration — {periodName}
              </h3>
              <p className="text-xs text-slate-500">
                {staff.firstName} {staff.lastName} • {staff.staffNumber} ({staff.jobTitle || 'Faculty'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Remuneration Terms */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Monthly Earnings & Allowance Breakdown (ZMW)
            </h4>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Basic Salary (ZMW)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Housing Allowance (ZMW)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={housingAllowance}
                  onChange={(e) => setHousingAllowance(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Transport Allowance (ZMW)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={transportAllowance}
                  onChange={(e) => setTransportAllowance(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Clinical Preceptor Premium (ZMW)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={clinicalAllowance}
                  onChange={(e) => setClinicalAllowance(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Overtime / Bonus / Other Allowances (ZMW)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={otherAllowances}
                  onChange={(e) => setOtherAllowances(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-rose-700 block mb-1">
                  Custom Deductions / Unpaid Absence (ZMW)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customDeductions}
                  onChange={(e) => setCustomDeductions(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono font-semibold text-rose-800 focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Statutory Recalculation Preview */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Statutory Payroll Computations (Zambian 2026 Standards)
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                Gross Remuneration: K{formatMoney(grossPay)}
              </span>
            </div>

            <div className="grid gap-2 text-xs sm:grid-cols-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">• ZRA PAYE 2026 Progressive:</span>
                <span className="font-mono font-bold text-rose-700">-K{formatMoney(paye)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">• NAPSA Employee 5% (capped):</span>
                <span className="font-mono font-bold text-slate-800">-K{formatMoney(napsaEmp)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">• NHIMA Employee 1%:</span>
                <span className="font-mono font-bold text-slate-800">-K{formatMoney(nhimaEmp)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">• Other Voluntary Deductions:</span>
                <span className="font-mono font-bold text-rose-700">-K{formatMoney(customDeductions)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 text-xs">
              <span className="text-slate-500">• Employer Contributions (NAPSA + NHIMA + WCFCB 2.5%):</span>
              <span className="font-mono text-cyan-800 font-semibold">
                K{formatMoney(napsaEmployer + nhimaEmployer + wcfcbEmployer)}
              </span>
            </div>

            {/* Net Pay Result Banner */}
            <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-3.5 py-2.5 border border-emerald-200 text-emerald-900">
              <span className="text-xs font-bold">Computed Net Disbursable Pay:</span>
              <span className="font-mono text-base font-black">
                K{formatMoney(netPay)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
            >
              <Check className="h-4 w-4" /> Save Line Adjustments
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
