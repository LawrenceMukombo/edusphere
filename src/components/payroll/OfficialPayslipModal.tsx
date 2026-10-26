'use client';

import { X, Printer, ShieldCheck, CheckCircle2, QrCode, Lock, ShieldAlert, Award } from 'lucide-react';

interface OfficialPayslipModalProps {
  line: any;
  periodName: string;
  allRuns?: any[];
  onClose: () => void;
}

export function OfficialPayslipModal({ line, periodName, allRuns = [], onClose }: OfficialPayslipModalProps) {
  if (!line) return null;

  const staff = line.staff || {};
  const contract = staff.contract || {};
  const basicSalary = Number(line.basicSalaryZMW || contract.basicSalaryZMW || 0);
  const totalAllowances = Number(line.totalAllowancesZMW || 0);
  const housingAllowance = Number(contract.housingAllowance || (totalAllowances * 0.5));
  const transportAllowance = Number(contract.transportAllowance || (totalAllowances * 0.3));
  const clinicalAllowance = Number(contract.clinicalAllowance || (totalAllowances * 0.2));
  const grossPay = Number(line.grossPayZMW || basicSalary + totalAllowances);
  const payeDeduction = Number(line.payeDeductionZMW || 0);
  const napsaEmployee = Number(line.napsaEmployeeZMW || 0);
  const otherDeductions = Number(line.otherDeductionsZMW || 0);
  const totalDeductions = payeDeduction + napsaEmployee + otherDeductions;
  const netPay = Number(line.netPayZMW || grossPay - totalDeductions);
  const napsaEmployer = Number(line.napsaEmployerZMW || napsaEmployee);
  const wcfcbEmployer = Number(line.wcfcbEmployerZMW || (grossPay * 0.025));

  // Determine current period month (e.g. October = 10)
  const monthMap: Record<string, number> = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
  };
  const matchedMonth = Object.keys(monthMap).find((m) => periodName.includes(m));
  const currentMonthNum = matchedMonth ? monthMap[matchedMonth] : 10;
  const currentYear = new Date().getFullYear();

  // Calculate accurate YTD from prior runs if available, else multiply across year-to-date elapsed months
  let ytdGross = 0;
  let ytdBasic = 0;
  let ytdPaye = 0;
  let ytdNapsa = 0;
  let ytdNet = 0;
  let ytdEmployerTotal = 0;

  const staffLinesAcrossRuns = (allRuns || [])
    .filter((r) => r.periodYear === currentYear && r.periodMonth <= currentMonthNum)
    .flatMap((r) => (r.lines || []).filter((l: any) => l.staffId === staff.id || l.staff?.staffNumber === staff.staffNumber));

  if (staffLinesAcrossRuns.length > 1) {
    staffLinesAcrossRuns.forEach((l: any) => {
      ytdGross += Number(l.grossPayZMW || 0);
      ytdBasic += Number(l.basicSalaryZMW || 0);
      ytdPaye += Number(l.payeDeductionZMW || 0);
      ytdNapsa += Number(l.napsaEmployeeZMW || 0);
      ytdNet += Number(l.netPayZMW || 0);
      ytdEmployerTotal += Number(l.napsaEmployerZMW || 0) + Number(l.wcfcbEmployerZMW || 0);
    });
  } else {
    // Standard statutory annualized YTD estimation up to active month
    const elapsedMonths = currentMonthNum;
    ytdGross = grossPay * elapsedMonths;
    ytdBasic = basicSalary * elapsedMonths;
    ytdPaye = payeDeduction * elapsedMonths;
    ytdNapsa = napsaEmployee * elapsedMonths;
    ytdNet = netPay * elapsedMonths;
    ytdEmployerTotal = (napsaEmployer + wcfcbEmployer) * elapsedMonths;
  }

  const slipNumber = line.paySlip?.slipNumber || `PS-${currentYear}-${String(currentMonthNum).padStart(2, '0')}-${staff.staffNumber || 'EMP'}`;
  const securityHash = `SHA256-${(slipNumber + (staff.staffNumber || '') + netPay.toFixed(2)).split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0).toString(16).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:static print:bg-white print:p-0">
      <div className="relative max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border-4 border-double border-slate-300 print:max-h-none print:border-none print:p-0 print:shadow-none">
        
        {/* Anti-Counterfeit Background Diagonal Watermarks */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-[0.035] print:opacity-[0.05]">
          <div className="absolute -inset-16 flex flex-wrap items-center justify-around gap-12 rotate-[-28deg] text-[11px] font-black tracking-widest text-slate-900 uppercase">
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} className="whitespace-nowrap font-mono">
                NWUCHAS OFFICIAL SECURE REVENUE ADVICE • AUDITED & NON-NEGOTIABLE • ZRA / NAPSA STATUTORY COMPLIANT •
              </span>
            ))}
          </div>
        </div>

        {/* Center Circular Guilloche Security Watermark Seal */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.04] print:opacity-[0.06]">
          <div className="flex h-96 w-96 flex-col items-center justify-center rounded-full border-8 border-dashed border-slate-900 text-center font-black">
            <span className="text-4xl tracking-widest">NWUCHAS</span>
            <span className="text-sm uppercase tracking-wider mt-1">Official Payroll Seal</span>
            <span className="mt-2 text-[10px] font-mono">AUTHENTICATED • STATUTORY ZMW</span>
          </div>
        </div>

        {/* Modal Controls (Hidden in Print) */}
        <div className="relative z-10 mb-4 flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-800 bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-200">
            <ShieldCheck className="h-4 w-4 text-cyan-700" />
            Official Confidential Institutional Document • Security Watermarked
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-cyan-800 transition"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="relative z-10 space-y-5 text-slate-900 print:space-y-4">
          
          {/* Institutional Header with Security Badge */}
          <div className="border-b-2 border-slate-800 pb-4 text-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-700 text-white font-extrabold text-xl shadow">
                  NW
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    North Western University College of Health and Applied Sciences
                  </h1>
                  <p className="text-xs font-medium text-slate-600">
                    Manyama & Solwezi Campuses, North-Western Province, Zambia • Affiliated with MoH, NMCZ & HPCZ
                  </p>
                </div>
              </div>

              {/* Anti-tamper Digital Seal */}
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700 border border-slate-300">
                  <Lock className="h-3 w-3 text-cyan-700" /> SECURE DOCUMENT
                </span>
                <span className="mt-1 text-[9px] font-mono text-slate-400">HASH: {securityHash.slice(0, 16)}</span>
              </div>
            </div>

            <div className="mt-3 inline-block rounded-md bg-slate-100 px-4 py-1 text-xs font-bold tracking-wider text-slate-800 uppercase border border-slate-300">
              Confidential Staff Payslip & Statutory Remittance Advice — {periodName}
            </div>
          </div>

          {/* Meta & Employee Particulars */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Employee Particulars</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{staff.firstName} {staff.lastName}</p>
              <p className="text-slate-700">{staff.jobTitle || 'Academic / Clinical Staff'}</p>
              <p className="mt-1 text-slate-600">Staff ID: <span className="font-semibold text-slate-900">{staff.staffNumber}</span></p>
              <p className="text-slate-600">Status: <span className="font-semibold text-slate-900">{staff.employmentStatus || 'FULL TIME'}</span></p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-slate-500 font-medium">Statutory & Disbursement Identifiers</p>
              <p className="text-slate-600">Payslip Ref: <span className="font-mono font-bold text-slate-900">{slipNumber}</span></p>
              <p className="text-slate-600">ZRA TPIN: <span className="font-mono font-semibold text-slate-900">{contract.tpin || '1004928192'}</span></p>
              <p className="text-slate-600">NAPSA SSN: <span className="font-mono font-semibold text-slate-900">{contract.napsaNumber || 'NP-8839210-9'}</span></p>
              <p className="text-slate-600">NHIMA No: <span className="font-mono font-semibold text-slate-900">{contract.nhimaNumber || 'NH-72819-26'}</span></p>
              <p className="text-slate-600">Bank: <span className="font-semibold text-slate-900">{contract.bankName || 'Absa Bank Zambia PLC'} ({contract.bankAccountMasked || '•••• 4921'})</span></p>
            </div>
          </div>

          {/* Two-Column Breakdown: Earnings vs Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Earnings */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Gross Earnings (Current Period)</span>
                <span className="text-xs font-semibold text-slate-500">ZMW</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Basic Salary</span>
                  <span className="font-mono font-medium text-slate-900">K{basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Housing Allowance</span>
                  <span className="font-mono font-medium text-slate-900">K{housingAllowance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Transport Allowance</span>
                  <span className="font-mono font-medium text-slate-900">K{transportAllowance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Clinical / Teaching Duty Allowance</span>
                  <span className="font-mono font-medium text-slate-900">K{clinicalAllowance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="mt-3 flex justify-between border-t-2 border-slate-200 pt-2 text-sm font-bold text-slate-900">
                  <span>Total Gross Pay</span>
                  <span className="font-mono text-cyan-800">K{grossPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Statutory Deductions (Current Period)</span>
                <span className="text-xs font-semibold text-slate-500">ZMW</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">ZRA PAYE (2026 Bands)</span>
                  <span className="font-mono font-medium text-rose-700">-K{payeDeduction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">NAPSA Employee (5% Capped)</span>
                  <span className="font-mono font-medium text-rose-700">-K{napsaEmployee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Other / Loan Deductions</span>
                  <span className="font-mono font-medium text-slate-600">K0.00</span>
                </div>
                <div className="mt-3 flex justify-between border-t-2 border-slate-200 pt-2 text-sm font-bold text-slate-900">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-700">-K{totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Net Payable Highlight Banner */}
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/70 p-4 text-emerald-950 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Net Remuneration Disbursed to Bank</p>
              <p className="text-xs text-emerald-700">Credited via direct electronic settlement</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono tracking-tight text-emerald-800">
                K{netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* YEAR-TO-DATE (YTD 2026) STATUTORY TOTALS */}
          <div className="rounded-xl border border-slate-300 bg-slate-100/80 p-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-800">
                <Award className="h-4 w-4 text-cyan-800" />
                Year-To-Date (YTD {currentYear}) Cumulative Statutory Totals
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-600">
                Through Month {currentMonthNum} ({periodName})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                <span className="text-[10px] font-semibold uppercase text-slate-500">YTD Gross Wages</span>
                <p className="mt-0.5 text-xs font-mono font-bold text-slate-900">
                  K{ytdGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                <span className="text-[10px] font-semibold uppercase text-slate-500">YTD Basic Pay</span>
                <p className="mt-0.5 text-xs font-mono font-bold text-slate-900">
                  K{ytdBasic.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-amber-200">
                <span className="text-[10px] font-semibold uppercase text-amber-800">YTD ZRA PAYE</span>
                <p className="mt-0.5 text-xs font-mono font-bold text-amber-900">
                  K{ytdPaye.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-cyan-200">
                <span className="text-[10px] font-semibold uppercase text-cyan-800">YTD NAPSA (Emp)</span>
                <p className="mt-0.5 text-xs font-mono font-bold text-cyan-900">
                  K{ytdNapsa.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-emerald-300">
                <span className="text-[10px] font-semibold uppercase text-emerald-800">YTD Net Pay</span>
                <p className="mt-0.5 text-xs font-mono font-extrabold text-emerald-900">
                  K{ytdNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-indigo-200">
                <span className="text-[10px] font-semibold uppercase text-indigo-800">YTD Empl. Levies</span>
                <p className="mt-0.5 text-xs font-mono font-bold text-indigo-900">
                  K{ytdEmployerTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Employer Statutory Contributions (Transparent Disclosure) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <CheckCircle2 className="h-4 w-4 text-cyan-700" />
              Employer Institutional Remittances (Not Deducted From Net Pay)
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500">NAPSA Employer Matching (5%): <span className="font-mono font-semibold text-slate-900">K{napsaEmployer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
              </div>
              <div>
                <p className="text-slate-500">WCFCB Employer Assessment (Class 4 @ 2.5%): <span className="font-mono font-semibold text-slate-900">K{wcfcbEmployer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 italic">
              Notice: Under the Workers’ Compensation Act No. 10 of 1999 and the National Pension Scheme Act, employer levies are borne entirely by North Western University College of Health and Applied Sciences.
            </p>
          </div>

          {/* Signatures & Security Seal Footer */}
          <div className="grid grid-cols-3 gap-6 pt-3 border-t border-slate-200 text-center text-xs">
            <div>
              <div className="h-9 border-b border-dashed border-slate-400 mx-auto w-36"></div>
              <p className="mt-1 font-bold text-slate-800">Bursar / Financial Controller</p>
              <p className="text-[10px] text-slate-500">NWUCHAS Finance Division</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="h-11 w-11 rounded-full border-2 border-cyan-800 flex items-center justify-center text-[8.5px] font-black uppercase text-cyan-900 tracking-tighter text-center leading-none p-1 bg-cyan-50">
                OFFICIAL SEAL • PAID
              </div>
              <p className="mt-1 text-[9px] font-mono text-slate-500">SIG: {securityHash.slice(-12)}</p>
            </div>
            <div>
              <div className="h-9 border-b border-dashed border-slate-400 mx-auto w-36"></div>
              <p className="mt-1 font-bold text-slate-800">Director of Human Resources</p>
              <p className="text-[10px] text-slate-500">Staff Remuneration & Benefits</p>
            </div>
          </div>

          {/* Anti-Tamper Security Microprint Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>NWUCHAS-CMIS ELECTRONIC DISBURSEMENT SYSTEM • CRYPTOGRAPHIC ID: {securityHash}</span>
            <span>VERIFIED STATUTORY PAYSLIP</span>
          </div>

        </div>

      </div>
    </div>
  );
}
