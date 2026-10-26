'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Check, ShieldCheck, Calculator, Building, AlertCircle } from 'lucide-react';
import { SalaryScale } from './EditSalaryScaleModal';

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: any | null;
  salaryScales: SalaryScale[];
  onSave: (updatedStaff: any) => void;
}

export function EditStaffModal({
  isOpen,
  onClose,
  staff,
  salaryScales,
  onSave,
}: EditStaffModalProps) {
  if (!isOpen || !staff) return null;

  const isNew = staff.id?.startsWith('new-');

  const [firstName, setFirstName] = useState(staff.firstName || '');
  const [lastName, setLastName] = useState(staff.lastName || '');
  const [staffNumber, setStaffNumber] = useState(staff.staffNumber || '');
  const [email, setEmail] = useState(staff.email || '');
  const [phone, setPhone] = useState(staff.phone || '+260 977 123456');
  const [department, setDepartment] = useState(staff.department || 'Nursing Sciences');
  const [jobTitle, setJobTitle] = useState(staff.jobTitle || 'Lecturer');
  const [qualification, setQualification] = useState(staff.qualification || 'MSc, BScN');
  const [employmentStatus, setEmploymentStatus] = useState(staff.employmentStatus || 'FULL TIME');

  // Salary Scale Selection
  const [selectedScaleCode, setSelectedScaleCode] = useState(
    staff.contract?.salaryScaleCode || salaryScales[0]?.code || 'NWU-ACAD-01'
  );

  const [basicSalary, setBasicSalary] = useState<number>(
    Number(staff.contract?.basicSalaryZMW || salaryScales[0]?.basicSalaryZMW || 18500)
  );
  const [housingAllowance, setHousingAllowance] = useState<number>(
    Number(staff.contract?.housingAllowance || salaryScales[0]?.housingAllowanceZMW || 2475)
  );
  const [transportAllowance, setTransportAllowance] = useState<number>(
    Number(staff.contract?.transportAllowance || salaryScales[0]?.transportAllowanceZMW || 1200)
  );
  const [clinicalAllowance, setClinicalAllowance] = useState<number>(
    Number(staff.contract?.clinicalAllowance || salaryScales[0]?.clinicalAllowanceZMW || 1800)
  );

  // Statutory numbers
  const [tpin, setTpin] = useState(staff.contract?.tpin || '1004928192');
  const [napsaNumber, setNapsaNumber] = useState(staff.contract?.napsaNumber || 'NP-8839210-9');
  const [nhimaNumber, setNhimaNumber] = useState(staff.contract?.nhimaNumber || 'NH-72819-26');

  // Bank details
  const [bankName, setBankName] = useState(staff.contract?.bankName || 'Absa Bank Zambia');
  const [bankAccount, setBankAccount] = useState(staff.contract?.bankAccountMasked || '•••• 4921');

  const [errorMessage, setErrorMessage] = useState('');

  // When a salary scale is selected from dropdown, auto-populate basic pay and allowances
  function handleScaleChange(scaleCode: string) {
    setSelectedScaleCode(scaleCode);
    const scale = salaryScales.find((s) => s.code === scaleCode);
    if (scale) {
      setBasicSalary(scale.basicSalaryZMW);
      setHousingAllowance(scale.housingAllowanceZMW);
      setTransportAllowance(scale.transportAllowanceZMW);
      setClinicalAllowance(scale.clinicalAllowanceZMW);
    }
  }

  const grossPay = basicSalary + housingAllowance + transportAllowance + clinicalAllowance;

  // Real-time Zambian Statutory Deductions 2026
  let paye = 0;
  if (grossPay > 9200) {
    paye += (grossPay - 9200) * 0.37;
    paye += 2100 * 0.30;
    paye += 2000 * 0.20;
  } else if (grossPay > 7100) {
    paye += (grossPay - 7100) * 0.30;
    paye += 2000 * 0.20;
  } else if (grossPay > 5100) {
    paye += (grossPay - 5100) * 0.20;
  }

  const napsa = Math.min(grossPay * 0.05, 1493.40);
  const nhima = grossPay * 0.01;
  const netPay = Math.max(0, grossPay - paye - napsa - nhima);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('First and last name are required.');
      return;
    }
    if (!staffNumber.trim()) {
      setErrorMessage('Staff Number is required.');
      return;
    }

    const updatedStaff = {
      ...staff,
      firstName,
      lastName,
      staffNumber,
      email,
      phone,
      department,
      jobTitle,
      qualification,
      employmentStatus,
      contract: {
        ...(staff.contract || {}),
        salaryScaleCode: selectedScaleCode,
        basicSalaryZMW: basicSalary,
        housingAllowance,
        transportAllowance,
        clinicalAllowance,
        grossSalaryZMW: grossPay,
        tpin,
        napsaNumber,
        nhimaNumber,
        bankName,
        bankAccountMasked: bankAccount,
      },
    };

    onSave(updatedStaff);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white text-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-700 text-white">
              <User className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                {isNew ? 'Enroll New Faculty / Staff Member' : 'Edit Staff & Remuneration Profile'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">{staffNumber || 'NWU-STF-NEW'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 font-bold text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Personal & Employment Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-600">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-600">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-600">Staff Number</label>
              <input
                type="text"
                value={staffNumber}
                onChange={(e) => setStaffNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono font-bold text-cyan-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-600">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-600">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              >
                <option value="Department of Nursing Sciences">Nursing Sciences</option>
                <option value="Department of Clinical Medicine">Clinical Medicine</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Academic Registry">Academic Registry</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Campus Operations & Security">Campus Operations</option>
              </select>
            </div>
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-600">Job Title / Role</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-600">Academic Qualifications</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-600">Employment Contract</label>
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              >
                <option value="FULL TIME">Permanent & Pensionable (Full Time)</option>
                <option value="CONTRACT">Fixed-Term 3-Year Contract</option>
                <option value="ADJUNCT">Adjunct / Hospital Clinical Preceptor</option>
                <option value="PART TIME">Visiting Faculty (Part Time)</option>
              </select>
            </div>
          </div>

          {/* SALARY SCALE & REMUNERATION BINDING */}
          <div className="rounded-xl border border-cyan-300 bg-cyan-50/60 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-black text-cyan-950 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-cyan-700" />
                Assigned Salary Scale & Remuneration Structure
              </span>
              <span className="text-[11px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-full">
                Scale Drives Gross Pay & Statutory Deductions
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700">Select Official Salary Scale / Grade:</label>
              <select
                value={selectedScaleCode}
                onChange={(e) => handleScaleChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-cyan-600 focus:outline-none"
              >
                {salaryScales.map((scale) => (
                  <option key={scale.code} value={scale.code}>
                    [{scale.code}] {scale.title} — Basic K{scale.basicSalaryZMW.toLocaleString()} ({scale.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Basic Salary (ZMW)</label>
                <input
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-mono font-bold text-slate-900 focus:border-cyan-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Housing Allowance</label>
                <input
                  type="number"
                  value={housingAllowance}
                  onChange={(e) => setHousingAllowance(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-mono text-slate-900 focus:border-cyan-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Transport Allowance</label>
                <input
                  type="number"
                  value={transportAllowance}
                  onChange={(e) => setTransportAllowance(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-mono text-slate-900 focus:border-cyan-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Clinical / Resp</label>
                <input
                  type="number"
                  value={clinicalAllowance}
                  onChange={(e) => setClinicalAllowance(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-mono text-slate-900 focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Computed Breakdown */}
            <div className="rounded-lg bg-white p-3 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Gross Remuneration</span>
                <span className="font-black text-slate-900">K{grossPay.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">ZRA PAYE (2026)</span>
                <span className="font-bold text-rose-700">- K{paye.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">NAPSA (5% Capped)</span>
                <span className="font-bold text-cyan-800">- K{napsa.toFixed(2)}</span>
              </div>
              <div className="bg-emerald-50 p-1 rounded border border-emerald-200">
                <span className="text-emerald-700 block text-[9px] uppercase font-bold">Net Take-Home</span>
                <span className="font-black text-emerald-900">K{netPay.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Statutory Registration & Bank Accounts */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-600">ZRA TPIN</label>
              <input
                type="text"
                value={tpin}
                onChange={(e) => setTpin(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-600">NAPSA Social Security #</label>
              <input
                type="text"
                value={napsaNumber}
                onChange={(e) => setNapsaNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-600">NHIMA Health No</label>
              <input
                type="text"
                value={nhimaNumber}
                onChange={(e) => setNhimaNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-slate-800 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-600">Bank Name</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800 focus:border-cyan-600 focus:outline-none"
              >
                <option value="Absa Bank Zambia">Absa Bank Zambia</option>
                <option value="Zambia National Commercial Bank (ZANACO)">ZANACO (Billmaster / Direct)</option>
                <option value="Stanbic Bank Zambia">Stanbic Bank Zambia</option>
                <option value="Standard Chartered Bank Zambia">Standard Chartered Bank Zambia</option>
                <option value="Indo Zambia Bank">Indo Zambia Bank</option>
                <option value="First National Bank (FNB Zambia)">FNB Zambia</option>
              </select>
            </div>
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-600">Bank Account / Remittance Ref</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono font-bold text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-5 py-2 font-bold text-white shadow-sm hover:bg-cyan-800"
            >
              <Check className="h-4 w-4" /> {isNew ? 'Enroll Staff Member' : 'Save Staff Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
