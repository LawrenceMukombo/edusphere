'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  FileText,
  Lock,
  Play,
  Download,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Users,
  Calculator,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Printer,
  ChevronRight,
  ExternalLink,
  Award,
  Clock,
  Sparkles,
  Plus,
  Edit,
  Sliders,
  Tag,
  Info,
  Trash2,
} from 'lucide-react';
import { OfficialPayslipModal } from '@/components/payroll/OfficialPayslipModal';
import { EditSalaryScaleModal, SalaryScale } from '@/components/payroll/EditSalaryScaleModal';
import { EditStaffModal } from '@/components/payroll/EditStaffModal';
import { EditPayrollLineModal } from '@/components/payroll/EditPayrollLineModal';
import { formatStandardDate } from '@/lib/dateUtils';
import { formatCleanEnum } from '@/lib/formatters';

export const DEFAULT_SALARY_SCALES: SalaryScale[] = [
  {
    id: 'scale-exec-01',
    code: 'NWU-EXEC-PROF',
    title: 'Professorial / Principal & CEO',
    category: 'ACADEMIC',
    gradeBand: 'Band 1 (Executive)',
    basicSalaryZMW: 32000,
    housingAllowanceZMW: 4000,
    transportAllowanceZMW: 2000,
    clinicalAllowanceZMW: 0,
    otherAllowancesZMW: 0,
    statutoryDeductions: {
      payeApplicable: true,
      napsaApplicable: true,
      nhimaApplicable: true,
      wcfcbEmployerLevy: true,
    },
    notes: 'Senior executive head of institution & clinical research director.',
  },
  {
    id: 'scale-admin-01',
    code: 'NWU-ADMIN-REG',
    title: 'College Registrar / Senior Executive',
    category: 'ADMINISTRATIVE',
    gradeBand: 'Band 2 (Senior Admin)',
    basicSalaryZMW: 22000,
    housingAllowanceZMW: 3000,
    transportAllowanceZMW: 1500,
    clinicalAllowanceZMW: 0,
    otherAllowancesZMW: 0,
    statutoryDeductions: {
      payeApplicable: true,
      napsaApplicable: true,
      nhimaApplicable: true,
      wcfcbEmployerLevy: true,
    },
    notes: 'Executive academic administration, admissions and senate registry.',
  },
  {
    id: 'scale-admin-02',
    code: 'NWU-ADMIN-BUR',
    title: 'College Bursar / Finance Manager',
    category: 'ADMINISTRATIVE',
    gradeBand: 'Band 2 (Finance/Treasury)',
    basicSalaryZMW: 21000,
    housingAllowanceZMW: 2850,
    transportAllowanceZMW: 1500,
    clinicalAllowanceZMW: 0,
    otherAllowancesZMW: 0,
    statutoryDeductions: {
      payeApplicable: true,
      napsaApplicable: true,
      nhimaApplicable: true,
      wcfcbEmployerLevy: true,
    },
    notes: 'Chief Financial Officer, fee collection and statutory remittances.',
  },
  {
    id: 'scale-acad-01',
    code: 'NWU-ACAD-SL1',
    title: 'Senior Lecturer / Head of Nursing',
    category: 'ACADEMIC',
    gradeBand: 'Band 3 (Senior Faculty)',
    basicSalaryZMW: 18500,
    housingAllowanceZMW: 2475,
    transportAllowanceZMW: 1200,
    clinicalAllowanceZMW: 1800,
    otherAllowancesZMW: 0,
    statutoryDeductions: {
      payeApplicable: true,
      napsaApplicable: true,
      nhimaApplicable: true,
      wcfcbEmployerLevy: true,
    },
    notes: 'Department leadership, curriculum design and clinical oversight.',
  },
  {
    id: 'scale-clin-01',
    code: 'NWU-CLIN-COORD',
    title: 'Clinical Training Coordinator',
    category: 'CLINICAL',
    gradeBand: 'Band 3 (Clinical Preceptor)',
    basicSalaryZMW: 17000,
    housingAllowanceZMW: 2250,
    transportAllowanceZMW: 1000,
    clinicalAllowanceZMW: 2000,
    otherAllowancesZMW: 0,
    statutoryDeductions: {
      payeApplicable: true,
      napsaApplicable: true,
      nhimaApplicable: true,
      wcfcbEmployerLevy: true,
    },
    notes: 'Teaching hospital rotations, clinical logbooks and student supervision.',
  },
  {
    id: 'scale-acad-02',
    code: 'NWU-ACAD-L1',
    title: 'Lecturer Grade 1 / Examinations Officer',
    category: 'ACADEMIC',
    gradeBand: 'Band 4 (Lecturer 1)',
    basicSalaryZMW: 17500,
    housingAllowanceZMW: 2325,
    transportAllowanceZMW: 1500,
    clinicalAllowanceZMW: 0,
    otherAllowancesZMW: 0,
    statutoryDeductions: {
      payeApplicable: true,
      napsaApplicable: true,
      nhimaApplicable: true,
      wcfcbEmployerLevy: true,
    },
    notes: 'Medical examinations, coursework moderation and assessments.',
  },
  {
    id: 'scale-admin-03',
    code: 'NWU-ADMIN-OFF1',
    title: 'HR & Administrative Officer',
    category: 'ADMINISTRATIVE',
    gradeBand: 'Band 5 (Admin Officer)',
    basicSalaryZMW: 11000,
    housingAllowanceZMW: 1650,
    transportAllowanceZMW: 1200,
    clinicalAllowanceZMW: 0,
    otherAllowancesZMW: 0,
    statutoryDeductions: {
      payeApplicable: true,
      napsaApplicable: true,
      nhimaApplicable: true,
      wcfcbEmployerLevy: true,
    },
    notes: 'Staff contracts, payroll file prep and human resources compliance.',
  },
  {
    id: 'scale-ops-01',
    code: 'NWU-OPS-CASH',
    title: 'Senior Finance Cashier / Operations',
    category: 'OPERATIONS',
    gradeBand: 'Band 6 (Operations Support)',
    basicSalaryZMW: 8500,
    housingAllowanceZMW: 1475,
    transportAllowanceZMW: 1000,
    clinicalAllowanceZMW: 0,
    otherAllowancesZMW: 0,
    statutoryDeductions: {
      payeApplicable: true,
      napsaApplicable: true,
      nhimaApplicable: true,
      wcfcbEmployerLevy: true,
    },
    notes: 'Student counter receipts, campus operations and petty cash control.',
  },
];

interface PayrollConsoleProps {
  initialRuns?: any[];
  initialStaff?: any[];
}

export function PayrollConsole({ initialRuns = [], initialStaff = [] }: PayrollConsoleProps) {
  const [runs, setRuns] = useState<any[]>(initialRuns);
  const [staffList, setStaffList] = useState<any[]>(initialStaff);
  const [salaryScales, setSalaryScales] = useState<SalaryScale[]>(DEFAULT_SALARY_SCALES);
  const [selectedRun, setSelectedRun] = useState<any | null>(initialRuns[0] || null);
  const [activeTab, setActiveTab] = useState<'runs' | 'sheet' | 'staff' | 'scales' | 'statutory' | 'leave' | 'licensure'>('runs');
  const [notice, setNotice] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showNewRunModal, setShowNewRunModal] = useState<boolean>(false);
  const [activePayslipLine, setActivePayslipLine] = useState<any | null>(null);

  // Leave Management State
  const [leaveRequests, setLeaveRequests] = useState<any[]>([
    {
      id: 'leave-001',
      staffName: 'Sr. Chilufya Banda',
      staffNumber: 'NWU-STF-001',
      jobTitle: 'Senior Clinical Instructor (Nursing)',
      leaveType: 'ANNUAL',
      leaveTypeLabel: 'Annual Leave (Statutory 24-Day Pool)',
      startDate: '2026-11-01',
      endDate: '2026-11-14',
      totalDays: 10,
      reason: 'Scheduled annual holiday leave per Zambian Employment Code Act.',
      handoverTo: 'Grace Mwape',
      status: 'APPROVED',
      appliedDate: '2026-10-20',
      approvedBy: 'Academic Dean & HR Officer',
    },
    {
      id: 'leave-002',
      staffName: 'Dr. Emmanuel Sichone',
      staffNumber: 'NWU-STF-002',
      jobTitle: 'Head of Clinical Medicine',
      leaveType: 'STUDY_CPD',
      leaveTypeLabel: 'Study & CPD (Continuing Professional Development)',
      startDate: '2026-11-10',
      endDate: '2026-11-15',
      totalDays: 5,
      reason: 'HPCZ Continuous Medical Education & National Skills Lab Refresher Workshop.',
      handoverTo: 'Brian Mulenga',
      status: 'APPROVED',
      appliedDate: '2026-10-22',
      approvedBy: 'Executive Principal',
    },
    {
      id: 'leave-003',
      staffName: 'Grace Mwape',
      staffNumber: 'NWU-STF-003',
      jobTitle: 'Lecturer in Midwifery',
      leaveType: 'SICK',
      leaveTypeLabel: 'Certified Sick Leave',
      startDate: '2026-10-28',
      endDate: '2026-10-30',
      totalDays: 3,
      reason: 'Acute respiratory infection with verified medical certificate (NWU-MED-01).',
      handoverTo: 'Sr. Chilufya Banda',
      status: 'PENDING',
      appliedDate: '2026-10-27',
    },
  ]);

  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState<boolean>(false);
  const [applyLeaveStaffId, setApplyLeaveStaffId] = useState<string>('');
  const [applyLeaveType, setApplyLeaveType] = useState<string>('ANNUAL');
  const [applyLeaveStart, setApplyLeaveStart] = useState<string>('2026-11-05');
  const [applyLeaveEnd, setApplyLeaveEnd] = useState<string>('2026-11-12');
  const [applyLeaveReason, setApplyLeaveReason] = useState<string>('');
  const [applyLeaveHandover, setApplyLeaveHandover] = useState<string>('');
  const [applyLeaveDays, setApplyLeaveDays] = useState<number>(6);

  // Statutory Licensure Modal State
  const [selectedStaffForLicensure, setSelectedStaffForLicensure] = useState<any | null>(null);
  const [licenseCouncil, setLicenseCouncil] = useState<string>('NMCZ');
  const [licenseNumber, setLicenseNumber] = useState<string>('');
  const [licenseExpiry, setLicenseExpiry] = useState<string>('2026-12-31');

  // Editing Modals state
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<any | null>(null);
  const [selectedScaleForEdit, setSelectedScaleForEdit] = useState<SalaryScale | null>(null);
  const [selectedLineForEdit, setSelectedLineForEdit] = useState<any | null>(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState<boolean>(false);
  const [staffToAddId, setStaffToAddId] = useState<string>('');

  const [newRunMonth, setNewRunMonth] = useState<number>(new Date().getMonth() + 1);
  const [newRunYear, setNewRunYear] = useState<number>(new Date().getFullYear());

  // Hydrate from localStorage if user saved local adjustments & fetch HR data
  useEffect(() => {
    try {
      const savedScales = localStorage.getItem('nwuchas_salary_scales');
      if (savedScales) {
        setSalaryScales(JSON.parse(savedScales));
      }
      const savedStaff = localStorage.getItem('nwuchas_staff_registry');
      if (savedStaff) {
        setStaffList(JSON.parse(savedStaff));
      }
    } catch (e) {
      console.error('Error hydrating payroll state:', e);
    }

    fetch('/api/hr')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.data?.leaveRequests?.length > 0) {
          setLeaveRequests(data.data.leaveRequests);
        }
      })
      .catch(() => {});
  }, []);

  async function handleApplyLeaveSubmit(e: React.FormEvent) {
    e.preventDefault();
    const stf = staffList.find((s) => s.id === applyLeaveStaffId) || staffList[0];
    if (!stf) return;

    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SUBMIT_LEAVE',
          staffId: stf.id,
          staffName: `${stf.firstName} ${stf.lastName}`,
          jobTitle: stf.jobTitle,
          leaveType: applyLeaveType,
          startDate: applyLeaveStart,
          endDate: applyLeaveEnd,
          totalDays: applyLeaveDays,
          reason: applyLeaveReason || 'Standard leave request per institutional terms.',
          handoverTo: applyLeaveHandover || 'Department Colleague',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLeaveRequests([data.data, ...leaveRequests]);
        setNotice(`Leave application submitted for ${stf.firstName} ${stf.lastName} (${applyLeaveDays} days).`);
        setShowApplyLeaveModal(false);
      }
    } catch {}
  }

  async function handleUpdateLeaveStatus(leaveId: string, status: string) {
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_LEAVE_STATUS',
          leaveId,
          status,
          approvedBy: 'Academic Dean & HR Director',
        }),
      });
      if (res.ok) {
        setLeaveRequests(leaveRequests.map((l) => (l.id === leaveId ? { ...l, status } : l)));
        setNotice(`Leave application status updated to ${status}.`);
      }
    } catch {}
  }

  async function handleSaveLicensure(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStaffForLicensure) return;

    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_LICENSURE',
          staffId: selectedStaffForLicensure.id,
          council: licenseCouncil,
          licenseNumber: licenseNumber || 'APC-2026-VAL',
          expiryDate: licenseExpiry,
        }),
      });
      if (res.ok) {
        setStaffList(
          staffList.map((s) =>
            s.id === selectedStaffForLicensure.id
              ? {
                  ...s,
                  tczNumber: `${licenseCouncil}:${licenseNumber}`,
                  tczCertificateExpiry: licenseExpiry,
                }
              : s
          )
        );
        setNotice(
          `Statutory license for ${selectedStaffForLicensure.firstName} ${selectedStaffForLicensure.lastName} updated: ${licenseCouncil} (${licenseNumber}).`
        );
        setSelectedStaffForLicensure(null);
      }
    } catch {}
  }

  async function handleCreateRun(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    setNotice('');

    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_run',
          periodMonth: newRunMonth,
          periodYear: newRunYear,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create payroll period');

      setRuns([data.data, ...runs]);
      setSelectedRun(data.data);
      setShowNewRunModal(false);
      setNotice(`Payroll period initialized: ${data.data.periodName}`);
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCalculate(runId: string) {
    setIsProcessing(true);
    setNotice('');

    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calculate',
          payrollRunId: runId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Calculation failed');

      setRuns(runs.map((r) => (r.id === runId ? data.data : r)));
      setSelectedRun(data.data);
      setNotice('ZRA PAYE 2026 progressive bands, NAPSA 5% & WCFCB 2.5% computed successfully.');
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleApproveAndLock(runId: string) {
    if (!confirm('Are you sure you want to approve and lock this payroll run? This will make lines immutable for statutory audit.')) return;
    setIsProcessing(true);
    setNotice('');

    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_and_lock',
          payrollRunId: runId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Approval failed');

      setRuns(runs.map((r) => (r.id === runId ? data.data : r)));
      setSelectedRun(data.data);
      setNotice('Payroll run approved and locked for disbursement.');
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleGeneratePayslips(runId: string) {
    setIsProcessing(true);
    setNotice('');

    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_payslips',
          payrollRunId: runId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payslip generation failed');

      setNotice(`Generated official digital payslips for all staff members.`);
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSavePayrollLine(updatedLine: any) {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_line',
          lineId: updatedLine.id,
          basicSalaryZMW: updatedLine.basicSalaryZMW,
          totalAllowancesZMW: updatedLine.totalAllowancesZMW,
          grossPayZMW: updatedLine.grossPayZMW,
          payeDeductionZMW: updatedLine.payeDeductionZMW,
          napsaEmployeeZMW: updatedLine.napsaEmployeeZMW,
          otherDeductionsZMW: updatedLine.otherDeductionsZMW,
          netPayZMW: updatedLine.netPayZMW,
          napsaEmployerZMW: updatedLine.napsaEmployerZMW,
          wcfcbEmployerZMW: updatedLine.wcfcbEmployerZMW,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to update payroll line');
      }

      if (result.data?.run) {
        setSelectedRun(result.data.run);
        setRuns(runs.map((r) => (r.id === result.data.run.id ? result.data.run : r)));
      } else if (result.data?.line) {
        const updatedLines = (selectedRun?.lines || []).map((l: any) =>
          l.id === result.data.line.id ? { ...l, ...result.data.line } : l
        );
        const updatedRun = { ...selectedRun, lines: updatedLines };
        setSelectedRun(updatedRun);
        setRuns(runs.map((r) => (r.id === updatedRun.id ? updatedRun : r)));
      }

      setNotice('Payroll line remuneration updated & progressive statutory bands recalculated.');
      setSelectedLineForEdit(null);
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleAddStaffToRun(staffId: string) {
    if (!staffId || !selectedRun) return;
    try {
      setIsProcessing(true);
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_staff_line',
          payrollRunId: selectedRun.id,
          staffId,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to add staff to payroll');
      }

      if (result.data?.run) {
        setSelectedRun(result.data.run);
        setRuns(runs.map((r) => (r.id === result.data.run.id ? result.data.run : r)));
      }
      setShowAddStaffModal(false);
      setStaffToAddId('');
      setNotice('Staff member added to active payroll run.');
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDeleteStaffLine(lineId: string, staffName: string) {
    if (!confirm(`Are you sure you want to remove ${staffName} from this draft payroll run?`)) return;
    if (!selectedRun) return;
    try {
      setIsProcessing(true);
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_staff_line',
          payrollRunId: selectedRun.id,
          lineId,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete payroll line');
      }

      setSelectedRun(result.data);
      setRuns(runs.map((r) => (r.id === result.data.id ? result.data : r)));
      setNotice(`Removed ${staffName} from active draft payroll run.`);
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSaveStaff(updatedStaff: any) {
    try {
      setIsProcessing(true);
      // Attempt backend persistence
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_staff',
          staff: updatedStaff,
        }),
      });
      const result = await res.json();
      const saved = result.success && result.data ? { ...updatedStaff, ...result.data } : updatedStaff;

      // Update staffList state
      const existingIdx = staffList.findIndex((s) => s.id === saved.id || s.staffNumber === saved.staffNumber);
      let nextList;
      if (existingIdx >= 0) {
        nextList = [...staffList];
        nextList[existingIdx] = saved;
      } else {
        nextList = [saved, ...staffList];
      }
      setStaffList(nextList);
      try {
        localStorage.setItem('nwuchas_staff_registry', JSON.stringify(nextList));
      } catch (e) {}

      // Update active payroll line if present
      if (selectedRun?.lines) {
        const lineIdx = selectedRun.lines.findIndex(
          (l: any) => l.staff?.staffNumber === saved.staffNumber || l.staffId === saved.id
        );
        if (lineIdx >= 0) {
          const line = selectedRun.lines[lineIdx];
          const basic = Number(saved.contract?.basicSalaryZMW || 0);
          const allowances =
            Number(saved.contract?.housingAllowance || 0) +
            Number(saved.contract?.transportAllowance || 0) +
            Number(saved.contract?.clinicalAllowance || 0);
          const gross = basic + allowances;

          // Progressive ZRA PAYE 2026 computation
          let taxable = gross;
          let paye = 0;
          if (taxable > 5100) {
            const b2 = Math.min(taxable - 5100, 2000);
            paye += b2 * 0.20;
          }
          if (taxable > 7100) {
            const b3 = Math.min(taxable - 7100, 2100);
            paye += b3 * 0.30;
          }
          if (taxable > 9200) {
            const b4 = taxable - 9200;
            paye += b4 * 0.37;
          }

          const napsa = Math.min(gross * 0.05, 1493.40);
          const nhima = gross * 0.01;
          const wcfcb = gross * 0.025;
          const net = gross - (paye + napsa + nhima);

          const updatedLines = [...selectedRun.lines];
          updatedLines[lineIdx] = {
            ...line,
            basicSalaryZMW: basic,
            allowancesZMW: allowances,
            grossPayZMW: gross,
            payeZMW: paye,
            napsaEmployeeZMW: napsa,
            napsaEmployerZMW: napsa,
            nhimaEmployeeZMW: nhima,
            nhimaEmployerZMW: nhima,
            wcfcbEmployerLevyZMW: wcfcb,
            netPayZMW: net,
            staff: {
              ...line.staff,
              firstName: saved.firstName,
              lastName: saved.lastName,
              jobTitle: saved.jobTitle,
            },
          };
          const updatedRun = { ...selectedRun, lines: updatedLines };
          setSelectedRun(updatedRun);
          setRuns(runs.map((r) => (r.id === updatedRun.id ? updatedRun : r)));
        }
      }

      setNotice(`Staff profile & linked system user account for ${saved.firstName} ${saved.lastName} (${saved.staffNumber}) saved successfully.`);
      setSelectedStaffForEdit(null);
    } catch (err: any) {
      setNotice(`Notice: Saved locally (${err.message}).`);
      setSelectedStaffForEdit(null);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSyncAllStaffUsers() {
    try {
      setIsProcessing(true);
      setNotice('Synchronizing and verifying system user accounts for all staff...');
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_all_staff_users' }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to synchronize system users');
      }

      if (Array.isArray(result.data)) {
        setStaffList(result.data);
        try {
          localStorage.setItem('nwuchas_staff_registry', JSON.stringify(result.data));
        } catch (e) {}
      }
      setNotice(result.message || 'All staff members are verified and linked to active system user accounts.');
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleSaveScale(updatedScale: SalaryScale) {
    const existingIdx = salaryScales.findIndex((s) => s.id === updatedScale.id || s.code === updatedScale.code);
    let nextScales: SalaryScale[];
    if (existingIdx >= 0) {
      nextScales = [...salaryScales];
      nextScales[existingIdx] = updatedScale;
    } else {
      nextScales = [...salaryScales, updatedScale];
    }
    setSalaryScales(nextScales);
    try {
      localStorage.setItem('nwuchas_salary_scales', JSON.stringify(nextScales));
    } catch (e) {}

    // Auto-update staff members who are linked to this scale code
    const updatedStaff = staffList.map((stf) => {
      if (stf.contract?.salaryScaleCode === updatedScale.code) {
        return {
          ...stf,
          contract: {
            ...stf.contract,
            basicSalaryZMW: updatedScale.basicSalaryZMW,
            housingAllowance: updatedScale.housingAllowanceZMW,
            transportAllowance: updatedScale.transportAllowanceZMW,
            clinicalAllowance: updatedScale.clinicalAllowanceZMW,
          },
        };
      }
      return stf;
    });
    setStaffList(updatedStaff);
    try {
      localStorage.setItem('nwuchas_staff_registry', JSON.stringify(updatedStaff));
    } catch (e) {}

    setNotice(`Salary Scale ${updatedScale.code} (${updatedScale.title}) updated. Enrolled staff remunerations synchronized.`);
    setSelectedScaleForEdit(null);
  }

  return (
    <div className="mt-8 space-y-6">
      {notice && (
        <div className="flex items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-900 shadow-sm">
          <ShieldCheck className="h-5 w-5 shrink-0 text-cyan-700" />
          <p className="text-sm font-semibold">{notice}</p>
        </div>
      )}

      {/* Top Banner & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800 border border-cyan-200">
              <Award className="h-3.5 w-3.5" /> Zambian Statutory Standard 2026
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              <CheckCircle className="h-3.5 w-3.5" /> ZRA • NAPSA • WCFCB • NHIMA
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            Staff Human Resources & Statutory Payroll Engine
          </h2>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Calculates ZRA PAYE 2026 progressive bands, NAPSA 5% (capped K892.20/month), WCFCB Class 4 2.5% employer-only health education levy, and produces official printable payslips.
          </p>
        </div>

        <button
          onClick={() => setShowNewRunModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-cyan-800 transition"
        >
          <Play className="h-4 w-4" /> Initialize Payroll Period
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('runs')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
            activeTab === 'runs'
              ? 'bg-cyan-700 text-white shadow'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calendar className="h-4 w-4" /> Monthly Payroll Periods ({runs.length})
        </button>
        <button
          onClick={() => setActiveTab('sheet')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
            activeTab === 'sheet'
              ? 'bg-cyan-700 text-white shadow'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText className="h-4 w-4" /> Staff Payroll Sheet ({selectedRun?.lines?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
            activeTab === 'staff'
              ? 'bg-cyan-700 text-white shadow'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="h-4 w-4" /> Staff Registry & Contracts ({staffList.length})
        </button>
        <button
          onClick={() => setActiveTab('scales')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
            activeTab === 'scales'
              ? 'bg-cyan-700 text-white shadow'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="h-4 w-4" /> Salary Scales & Statutory Deductions ({salaryScales.length})
        </button>
        <button
          onClick={() => setActiveTab('statutory')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
            activeTab === 'statutory'
              ? 'bg-cyan-700 text-white shadow'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Statutory Framework 2026
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
            activeTab === 'leave'
              ? 'bg-cyan-700 text-white shadow'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calendar className="h-4 w-4" /> Staff Leave & Absence ({leaveRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('licensure')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
            activeTab === 'licensure'
              ? 'bg-cyan-700 text-white shadow'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Award className="h-4 w-4" /> Statutory Council Licensure (NMCZ • HPCZ • TCZ)
        </button>
      </div>

      {/* TAB 1: RUNS & PERIODS */}
      {activeTab === 'runs' && (
        <div className="space-y-6">
          {/* Periods selector */}
          <div className="grid gap-4 md:grid-cols-4">
            {runs.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRun(r)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  selectedRun?.id === r.id
                    ? 'border-cyan-600 bg-cyan-50/60 shadow-md ring-2 ring-cyan-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{r.periodName}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                      r.status === 'APPROVED_LOCKED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : r.status === 'CALCULATED'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {formatCleanEnum(r.status)}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Gross Wages:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      K{Number(r.totalGrossZMW || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Disbursed:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      K{Number(r.totalNetZMW || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Run Details */}
          {selectedRun && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900">{selectedRun.periodName} Payroll Summary</h3>
                    {selectedRun.isLocked ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                        <Lock className="h-3.5 w-3.5" /> Locked & Audited
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300">
                        <Clock className="h-3.5 w-3.5" /> Draft / Open
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500" suppressHydrationWarning>
                    Created: {formatStandardDate(selectedRun.createdAt)} • {selectedRun.lines?.length || 0} Staff Lines Attached
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {!selectedRun.isLocked && (
                    <>
                      <button
                        onClick={() => handleCalculate(selectedRun.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-cyan-800 transition disabled:opacity-50 shadow-sm"
                      >
                        <Calculator className="h-3.5 w-3.5" /> Recompute 2026 Bands
                      </button>
                      <button
                        onClick={() => handleApproveAndLock(selectedRun.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition disabled:opacity-50 shadow-sm"
                      >
                        <Lock className="h-3.5 w-3.5" /> Approve & Lock Run
                      </button>
                    </>
                  )}

                  {selectedRun.isLocked && (
                    <button
                      onClick={() => handleGeneratePayslips(selectedRun.id)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-800 transition disabled:opacity-50 shadow-sm"
                    >
                      <FileText className="h-3.5 w-3.5" /> Generate Digital Payslips
                    </button>
                  )}

                  {/* Statutory Download Exports */}
                  <a
                    href={`/api/payroll?runId=${selectedRun.id}&export=zra`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5 text-cyan-700" /> ZRA TaxOnline CSV
                  </a>
                  <a
                    href={`/api/payroll?runId=${selectedRun.id}&export=napsa`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5 text-cyan-700" /> eNAPSA Schedule CSV
                  </a>
                  <a
                    href={`/api/payroll?runId=${selectedRun.id}&export=wcfcb`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5 text-cyan-700" /> WCFCB Assessment TXT
                  </a>
                </div>
              </div>

              {/* KPI Statistics */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gross Remuneration</span>
                  <p className="mt-1 text-xl font-extrabold font-mono text-slate-900">
                    K{Number(selectedRun.totalGrossZMW || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Basic + allowances</p>
                </div>

                <div className="rounded-xl bg-amber-50/60 p-4 border border-amber-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Total ZRA PAYE</span>
                  <p className="mt-1 text-xl font-extrabold font-mono text-amber-900">
                    K{Number(selectedRun.totalPayeZMW || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1">2026 progressive bands</p>
                </div>

                <div className="rounded-xl bg-cyan-50/60 p-4 border border-cyan-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-800">NAPSA (Emp + Emplor)</span>
                  <p className="mt-1 text-xl font-extrabold font-mono text-cyan-900">
                    K{(Number(selectedRun.totalNapsaEmpZMW || 0) + Number(selectedRun.totalNapsaEmployerZMW || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-cyan-700 mt-1">5% + 5% matching (capped)</p>
                </div>

                <div className="rounded-xl bg-indigo-50/60 p-4 border border-indigo-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800">WCFCB Levy (2.5%)</span>
                  <p className="mt-1 text-xl font-extrabold font-mono text-indigo-900">
                    K{Number(selectedRun.totalWcfcbEmployerZMW || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-indigo-700 mt-1">100% employer borne</p>
                </div>

                <div className="rounded-xl bg-emerald-50/70 p-4 border border-emerald-300">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Net Pay Disbursed</span>
                  <p className="mt-1 text-xl font-extrabold font-mono text-emerald-900">
                    K{Number(selectedRun.totalNetZMW || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1">Bank direct credit</p>
                </div>
              </div>

              {/* View Sheet Shortcut */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-cyan-700" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Review Full Staff Payroll Roll</p>
                    <p className="text-xs text-slate-500">Inspect itemized deductions and print digital payslips for all staff</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('sheet')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
                >
                  Open Payroll Sheet <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STAFF PAYROLL SHEET */}
      {activeTab === 'sheet' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          {/* Top Bar with Period Selector, Lock Status, and Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Monthly Paysheet & Remuneration Register
                </h3>
                {selectedRun?.isLocked ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                    <Lock className="h-3 w-3" /> Approved & Locked (Historical Record)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                    <Edit className="h-3 w-3" /> Open Draft (Editable Remuneration)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Itemized breakdown of basic pay, clinical & institutional allowances, statutory ZRA PAYE 2026 progressive bands, NAPSA 5%, and WCFCB 2.5% employer levy.
              </p>
            </div>

            {/* Run Selector & Primary Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">Period:</span>
                <select
                  value={selectedRun?.id || ''}
                  onChange={(e) => {
                    const r = runs.find((x) => x.id === e.target.value);
                    if (r) setSelectedRun(r);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  {runs.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.periodName} {r.isLocked ? '• Locked / Disbursed' : '• Open Draft'}
                    </option>
                  ))}
                </select>
              </div>

              {!selectedRun?.isLocked ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowAddStaffModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-cyan-800 transition"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Staff to Run
                  </button>
                  <button
                    type="button"
                    onClick={() => selectedRun && handleCalculate(selectedRun.id)}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition disabled:opacity-50"
                  >
                    <Calculator className="h-3.5 w-3.5" /> Recalculate Run
                  </button>
                  <button
                    type="button"
                    onClick={() => selectedRun && handleApproveAndLock(selectedRun.id)}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition disabled:opacity-50"
                  >
                    <Lock className="h-3.5 w-3.5" /> Approve & Lock
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => selectedRun && handleGeneratePayslips(selectedRun.id)}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-cyan-800 transition disabled:opacity-50"
                >
                  <Printer className="h-3.5 w-3.5" /> Batch Print Payslips
                </button>
              )}

              {/* Statutory CSV / Export Schedule */}
              {selectedRun && (
                <div className="flex items-center gap-1">
                  <a
                    href={`/api/payroll?runId=${selectedRun.id}&export=zra`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    title="Export ZRA TaxOnline CSV Schedule"
                  >
                    <Download className="h-3 w-3 text-slate-500" /> ZRA
                  </a>
                  <a
                    href={`/api/payroll?runId=${selectedRun.id}&export=napsa`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    title="Export eNAPSA Contribution Schedule"
                  >
                    <Download className="h-3 w-3 text-slate-500" /> NAPSA
                  </a>
                  <a
                    href={`/api/payroll?runId=${selectedRun.id}&export=wcfcb`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    title="Export WCFCB Employer Assessment"
                  >
                    <Download className="h-3 w-3 text-slate-500" /> WCFCB
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Aggregate Financial Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Staff Count</span>
              <p className="mt-1 text-base font-extrabold text-slate-900">{selectedRun?.lines?.length || 0}</p>
              <span className="text-[10px] text-slate-500">Active lines</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Gross Pay</span>
              <p className="mt-1 text-base font-extrabold text-slate-900 font-mono">
                ZMW {Number(selectedRun?.totalGrossZMW || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-slate-500">Basic + Allowances</span>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3">
              <span className="text-[11px] font-bold text-rose-800 uppercase">ZRA PAYE 2026</span>
              <p className="mt-1 text-base font-extrabold text-rose-700 font-mono">
                ZMW {Number(selectedRun?.totalPayeZMW || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-rose-600">Progressive Tax</span>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
              <span className="text-[11px] font-bold text-amber-800 uppercase">NAPSA (5%)</span>
              <p className="mt-1 text-base font-extrabold text-amber-800 font-mono">
                ZMW {Number(selectedRun?.totalNapsaEmpZMW || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-amber-600">Capped K1,493.40</span>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
              <span className="text-[11px] font-bold text-emerald-800 uppercase">Net Disbursable</span>
              <p className="mt-1 text-base font-extrabold text-emerald-700 font-mono">
                ZMW {Number(selectedRun?.totalNetZMW || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-emerald-600">Direct Staff Bank Pay</span>
            </div>
            <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-3">
              <span className="text-[11px] font-bold text-cyan-800 uppercase">WCFCB Employer</span>
              <p className="mt-1 text-base font-extrabold text-cyan-800 font-mono">
                ZMW {Number(selectedRun?.totalWcfcbEmployerZMW || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-cyan-600">2.5% Employer Levy</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Staff Details</th>
                  <th className="px-3 py-3">Basic Salary</th>
                  <th className="px-3 py-3">Allowances</th>
                  <th className="px-3 py-3 font-semibold text-slate-900">Gross Pay</th>
                  <th className="px-3 py-3 text-rose-700">ZRA PAYE</th>
                  <th className="px-3 py-3 text-rose-700">NAPSA (5%)</th>
                  <th className="px-3 py-3 text-slate-600">Other Ded.</th>
                  <th className="px-3 py-3 text-emerald-800 font-bold">Net Payable</th>
                  <th className="px-3 py-3 text-cyan-800">WCFCB (2.5%)</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!selectedRun?.lines || selectedRun.lines.length === 0) ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                      No staff lines in this payroll run yet. Click &quot;Add Staff to Run&quot; or &quot;Recalculate Run&quot; to populate.
                    </td>
                  </tr>
                ) : (
                  selectedRun.lines.map((line: any) => {
                    const staff = line.staff || {};
                    return (
                      <tr
                        key={line.id}
                        className="hover:bg-slate-50/80 transition"
                      >
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-900">{staff.firstName} {staff.lastName}</p>
                          <p className="text-[11px] text-slate-500">{staff.staffNumber} • {staff.jobTitle || 'Faculty'}</p>
                        </td>
                        <td className="px-3 py-3.5 font-mono text-slate-800">
                          ZMW {Number(line.basicSalaryZMW || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3.5 font-mono text-slate-800">
                          ZMW {Number(line.totalAllowancesZMW || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3.5 font-mono font-bold text-slate-900">
                          ZMW {Number(line.grossPayZMW || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3.5 font-mono text-rose-700 font-semibold">
                          -ZMW {Number(line.payeDeductionZMW || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3.5 font-mono text-rose-700 font-semibold">
                          -ZMW {Number(line.napsaEmployeeZMW || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3.5 font-mono text-slate-600 text-[11px]">
                          -ZMW {Number(line.otherDeductionsZMW || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3.5 font-mono font-bold text-emerald-800 text-sm">
                          ZMW {Number(line.netPayZMW || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3.5 font-mono text-slate-600 text-[11px]">
                          ZMW {Number(line.wcfcbEmployerZMW || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {!selectedRun?.isLocked && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setSelectedLineForEdit(line)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-cyan-300 bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition shadow-xs"
                                  title="Edit Salary, Allowances & Custom Deductions"
                                >
                                  <Edit className="h-3 w-3" /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStaffLine(line.id, `${staff.firstName} ${staff.lastName}`)}
                                  className="rounded-lg border border-rose-200 bg-white p-1 text-rose-600 hover:bg-rose-50 transition shadow-xs"
                                  title="Remove from this run"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => setActivePayslipLine(line)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                              title="View Official Printable Payslip"
                            >
                              <Printer className="h-3 w-3 text-slate-500" /> Payslip
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STAFF REGISTRY & CONTRACTS */}
      {activeTab === 'staff' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Academic, Clinical & Operations Staff Registry</h3>
                <span className="inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-bold text-cyan-800 border border-cyan-200">
                  Editable Profiles & Scales
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff employment contracts, remuneration terms, salary scale grade bands, statutory TPIN/NAPSA/NHIMA numbers, and bank remittance profiles.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                Total Enrolled: <span className="font-bold text-slate-900">{staffList.length}</span>
              </div>
              <button
                type="button"
                onClick={handleSyncAllStaffUsers}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-800 shadow-sm hover:bg-indigo-100 transition disabled:opacity-50"
                title="Guarantee every staff member has an active linked system user login"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> Sync System Users
              </button>
              <button
                type="button"
                onClick={() => {
                  const newStaff = {
                    id: `new-${Date.now()}`,
                    staffNumber: `NWU-STF-0${staffList.length + 1 < 10 ? '0' + (staffList.length + 1) : staffList.length + 1}`,
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '+260 977 ' + Math.floor(100000 + Math.random() * 900000),
                    jobTitle: 'Faculty Lecturer',
                    qualification: 'BSc, MSc in Health Sciences',
                    employmentStatus: 'FULL_TIME',
                    contract: {
                      salaryScaleCode: salaryScales[3]?.code || 'NWU-ACAD-SL1',
                      basicSalaryZMW: salaryScales[3]?.basicSalaryZMW || 18500,
                      housingAllowance: salaryScales[3]?.housingAllowanceZMW || 2475,
                      transportAllowance: salaryScales[3]?.transportAllowanceZMW || 1200,
                      clinicalAllowance: salaryScales[3]?.clinicalAllowanceZMW || 1800,
                      tpin: '100' + Math.floor(1000000 + Math.random() * 9000000),
                      napsaNumber: 'NP-883' + Math.floor(1000 + Math.random() * 9000),
                      nhimaNumber: 'NH-728' + Math.floor(10 + Math.random() * 90),
                      bankName: 'Absa Bank Zambia',
                      bankAccountMasked: '•••• ' + Math.floor(1000 + Math.random() * 9000),
                    },
                  };
                  setSelectedStaffForEdit(newStaff);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add Faculty / Staff
              </button>
            </div>
          </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Staff ID & Name</th>
                    <th className="px-3 py-3">Role & Department</th>
                    <th className="px-3 py-3">System Access & RBAC</th>
                    <th className="px-3 py-3">Contract Status</th>
                    <th className="px-3 py-3">Salary Scale & Grade</th>
                    <th className="px-3 py-3">Remuneration (Gross)</th>
                    <th className="px-3 py-3">Statutory IDs</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.map((stf) => {
                    const contract = stf.contract || {};
                    const scaleCode = contract.salaryScaleCode || 'Custom';
                    const allowancesTotal =
                      Number(contract.housingAllowance || 0) +
                      Number(contract.transportAllowance || 0) +
                      Number(contract.clinicalAllowance || 0);
                    const gross = Number(contract.basicSalaryZMW || 0) + allowancesTotal;

                    return (
                      <tr key={stf.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900">{stf.firstName} {stf.lastName}</p>
                          <p className="text-[11px] font-mono text-cyan-800">{stf.staffNumber}</p>
                          <p className="text-[11px] text-slate-500">{stf.email}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium text-slate-900">{stf.jobTitle || 'Faculty'}</p>
                          <p className="text-[11px] text-slate-500">{stf.qualification || 'Standard'}</p>
                        </td>
                        <td className="px-3 py-3">
                          {stf.user || stf.userId ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-700 border border-indigo-200">
                                <ShieldCheck className="h-3 w-3 text-indigo-600" /> {stf.user?.role || stf.systemRole || 'LECTURER'}
                              </span>
                              <span className="block text-[10px] text-slate-500 font-mono truncate max-w-[130px]" title={stf.user?.email || stf.email}>
                                {stf.user?.email || stf.email}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active System Login
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                                <AlertCircle className="h-3 w-3 text-amber-600" /> Account Pending
                              </span>
                              <span className="block text-[10px] text-slate-400">Click Sync to provision</span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            {stf.employmentStatus || 'FULL TIME'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-800 border border-slate-200">
                            <Layers className="h-3 w-3 text-cyan-700" /> {scaleCode}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono">
                          <p className="font-bold text-slate-900">
                            K{gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Basic: K{Number(contract.basicSalaryZMW || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] text-cyan-700">
                            Allowances: K{allowancesTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-[11px] space-y-0.5">
                          <p><span className="text-slate-500">TPIN:</span> <span className="font-mono font-medium text-slate-900">{contract.tpin || '1004928192'}</span></p>
                          <p><span className="text-slate-500">NAPSA:</span> <span className="font-mono font-medium text-slate-900">{contract.napsaNumber || 'NP-8839210-9'}</span></p>
                          <p><span className="text-slate-500">NHIMA:</span> <span className="font-mono font-medium text-slate-900">{contract.nhimaNumber || 'NH-72819-26'}</span></p>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => setSelectedStaffForEdit(stf)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition shadow-xs"
                          >
                            <Edit className="h-3.5 w-3.5" /> Edit Profile & Scale
                          </button>
                        </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SALARY SCALES & STATUTORY DEDUCTIONS */}
      {activeTab === 'scales' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-bold text-cyan-800 border border-cyan-200">
                    <Sliders className="h-3.5 w-3.5" /> Institutional Compensation Schedule
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" /> 2026 Statutory Compliant
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  Institutional Salary Scales & Statutory Deduction Schedules
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-2xl">
                  Configure pay bands, standard housing & transport allowances, clinical premia, and dynamic Zambian statutory deduction obligations (ZRA PAYE, NAPSA, NHIMA, WCFCB).
                </p>
              </div>

              <button
                onClick={() => {
                  const newScale: SalaryScale = {
                    id: `scale-${Date.now()}`,
                    code: `NWU-SCALE-${salaryScales.length + 1}`,
                    title: 'New Institutional Pay Scale',
                    category: 'ACADEMIC',
                    gradeBand: `Band ${salaryScales.length + 1}`,
                    basicSalaryZMW: 15000,
                    housingAllowanceZMW: 2000,
                    transportAllowanceZMW: 1000,
                    clinicalAllowanceZMW: 0,
                    otherAllowancesZMW: 0,
                    statutoryDeductions: {
                      payeApplicable: true,
                      napsaApplicable: true,
                      nhimaApplicable: true,
                      wcfcbEmployerLevy: true,
                    },
                    notes: 'Institutional salary scale tier.',
                  };
                  setSelectedScaleForEdit(newScale);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
              >
                <Plus className="h-4 w-4" /> Create Salary Scale
              </button>
            </div>

            {/* Scales Grid */}
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {salaryScales.map((scale) => {
                const allowances =
                  scale.housingAllowanceZMW +
                  scale.transportAllowanceZMW +
                  scale.clinicalAllowanceZMW +
                  scale.otherAllowancesZMW;
                const gross = scale.basicSalaryZMW + allowances;

                // PAYE progressive 2026
                let paye = 0;
                if (gross > 5100) {
                  const b2 = Math.min(gross - 5100, 2000);
                  paye += b2 * 0.20;
                }
                if (gross > 7100) {
                  const b3 = Math.min(gross - 7100, 2100);
                  paye += b3 * 0.30;
                }
                if (gross > 9200) {
                  const b4 = gross - 9200;
                  paye += b4 * 0.37;
                }

                const napsa = scale.statutoryDeductions.napsaApplicable ? Math.min(gross * 0.05, 1493.40) : 0;
                const nhima = scale.statutoryDeductions.nhimaApplicable ? gross * 0.01 : 0;
                const totalDeductions = paye + napsa + nhima;
                const estimatedNet = gross - totalDeductions;
                const wcfcb = scale.statutoryDeductions.wcfcbEmployerLevy ? gross * 0.025 : 0;

                const enrolledCount = staffList.filter(
                  (stf) => (stf.contract?.salaryScaleCode || '') === scale.code
                ).length;

                return (
                  <div
                    key={scale.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-cyan-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-cyan-800 border border-slate-200">
                              {scale.code}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              scale.category === 'ACADEMIC'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : scale.category === 'CLINICAL'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : scale.category === 'ADMINISTRATIVE'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-50 text-slate-700 border border-slate-200'
                            }`}>
                              {scale.category}
                            </span>
                          </div>
                          <h4 className="mt-1.5 text-base font-bold text-slate-900">{scale.title}</h4>
                          <p className="text-xs text-slate-500">{scale.gradeBand}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-slate-500 block">Enrolled Staff</span>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            <Users className="h-3 w-3 text-cyan-700" /> {enrolledCount} staff
                          </span>
                        </div>
                      </div>

                      {/* Pay Breakdown */}
                      <div className="mt-4 rounded-xl bg-slate-50 p-3.5 space-y-1.5 border border-slate-200 text-xs">
                        <div className="flex justify-between text-slate-700">
                          <span>Basic Salary:</span>
                          <span className="font-mono font-semibold text-slate-900">
                            K{scale.basicSalaryZMW.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-[11px]">
                          <span>Housing ({scale.housingAllowanceZMW > 0 ? 'Provided' : 'N/A'}):</span>
                          <span className="font-mono">K{scale.housingAllowanceZMW.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-[11px]">
                          <span>Transport:</span>
                          <span className="font-mono">K{scale.transportAllowanceZMW.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        {scale.clinicalAllowanceZMW > 0 && (
                          <div className="flex justify-between text-emerald-700 text-[11px]">
                            <span>Clinical Preceptor Premium:</span>
                            <span className="font-mono">K{scale.clinicalAllowanceZMW.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
                          <span>Gross Remuneration:</span>
                          <span className="font-mono text-cyan-800">
                            K{gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Statutory Deductions Breakdown */}
                      <div className="mt-3.5 space-y-1 text-[11px]">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                          Statutory Deductions & Remittances:
                        </span>
                        <div className="flex justify-between text-slate-600">
                          <span>• ZRA PAYE 2026 Progressive:</span>
                          <span className="font-mono text-rose-700 font-medium">
                            -K{paye.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>• NAPSA Pension (5% capped):</span>
                          <span className="font-mono text-slate-700">
                            -K{napsa.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>• NHIMA Universal Health (1%):</span>
                          <span className="font-mono text-slate-700">
                            -K{nhima.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-indigo-700 pt-0.5">
                          <span>• WCFCB Class 4 (2.5% Employer):</span>
                          <span className="font-mono">
                            K{wcfcb.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Estimated Net */}
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 border border-emerald-200 text-xs font-bold text-emerald-900">
                        <span>Estimated Net Pay:</span>
                        <span className="font-mono text-sm">
                          K{estimatedNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <p className="text-[11px] text-slate-400 italic line-clamp-1">{scale.notes || 'Institutional scale'}</p>
                      <button
                        onClick={() => setSelectedScaleForEdit(scale)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition shadow-xs"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit Scale & Deductions
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STATUTORY FRAMEWORK 2026 */}
      {activeTab === 'statutory' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Zambian 2026 Statutory Remittance Framework</h3>
            <p className="text-xs text-slate-600 mt-1">
              Statutory parameters enforced across NWUCHAS-CMIS payroll calculations in compliance with ZRA, NAPSA, WCFCB, and NHIMA Acts.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              
              {/* ZRA Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white font-bold text-xs">
                    ZRA
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">ZRA PAYE 2026 Progressive Tax Bands</h4>
                    <p className="text-xs text-slate-500">Personal Income Tax Schedule</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>First ZMW 0.00 – ZMW 4,800.00</span>
                    <span className="font-bold text-emerald-700">0.00% (Tax-Free Threshold)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Next ZMW 4,800.01 – ZMW 9,200.00</span>
                    <span className="font-bold text-slate-900">20.00%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Next ZMW 9,200.01 – ZMW 13,700.00</span>
                    <span className="font-bold text-slate-900">30.00%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Next ZMW 13,700.01 – ZMW 19,200.00</span>
                    <span className="font-bold text-slate-900">37.00%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Above ZMW 19,200.00</span>
                    <span className="font-bold text-rose-700">40.00%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  • Statutory Filing Deadline: On or before the 10th of every succeeding month via ZRA TaxOnline CSV.
                </p>
              </div>

              {/* NAPSA Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-700 text-white font-bold text-xs">
                    NAPSA
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">NAPSA National Pension Scheme 2026</h4>
                    <p className="text-xs text-slate-500">Statutory Ceiling & Contribution Rules</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Employee Statutory Contribution:</span>
                    <span className="font-bold text-slate-900">5.0% of Gross Remuneration</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Employer Matching Contribution:</span>
                    <span className="font-bold text-slate-900">5.0% of Gross Remuneration</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Monthly Statutory Ceiling (2026):</span>
                    <span className="font-bold text-cyan-800">Capped at K892.20 / month</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Maximum Total Remittance per Staff:</span>
                    <span className="font-bold text-slate-900">K1,784.40 / month (Emp + Emplor)</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  • Statutory Filing Deadline: 10th of every month via eNAPSA Return Schedule.
                </p>
              </div>

              {/* WCFCB Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-700 text-white font-bold text-xs">
                    WCFCB
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Workers' Compensation Fund Control Board</h4>
                    <p className="text-xs text-slate-500">Class 4: Higher Education & Health Services</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Institutional Assessment Levy:</span>
                    <span className="font-bold text-indigo-900">2.50% of Total Wage Bill</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Employee Deductibility:</span>
                    <span className="font-bold text-rose-700">STRICTLY 0% (Prohibited by Law)</span>
                  </div>
                </div>
                <div className="rounded-lg bg-indigo-100/60 p-2 text-[11px] text-indigo-900">
                  Under the Workers' Compensation Act No. 10 of 1999, the 2.5% assessment is strictly borne by NWUCHAS as an employer operating cost.
                </div>
              </div>

              {/* NHIMA Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white font-bold text-xs">
                    NHIMA
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">National Health Insurance Management Authority</h4>
                    <p className="text-xs text-slate-500">Universal Healthcare Remittance</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Employee Contribution:</span>
                    <span className="font-bold text-slate-900">1.0% of Basic Salary</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Employer Contribution:</span>
                    <span className="font-bold text-slate-900">1.0% of Basic Salary</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  • Covers all teaching hospital access and clinical attachments for NWUCHAS staff and families.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STAFF LEAVE & ABSENCE MANAGEMENT */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-bold text-cyan-800 border border-cyan-200">
                    <Calendar className="h-3.5 w-3.5" /> Employment Code Act No. 3 of 2019
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                    <CheckCircle className="h-3.5 w-3.5" /> Statutory Leave Compliance
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  Staff Leave & Absence Management
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-2xl">
                  Statutory leave tracking for academic lecturers, clinical instructors, and administration. Enforces 24 working days statutory annual leave, certified sick leave, maternity/paternity, and HPCZ/NMCZ continuous professional development (CPD).
                </p>
              </div>

              <button
                onClick={() => {
                  if (staffList.length > 0) {
                    setApplyLeaveStaffId(staffList[0].id);
                  }
                  setShowApplyLeaveModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-800 transition"
              >
                <Plus className="h-4 w-4" /> Apply for Staff Leave
              </button>
            </div>

            {/* Leave Metrics */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-medium text-slate-500">Statutory Annual Pool</p>
                <p className="mt-1 text-2xl font-black text-slate-900">24 Days</p>
                <p className="mt-1 text-[11px] text-slate-400">2.0 days earned / month per Zambian law</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <p className="text-xs font-medium text-amber-700">Pending Approvals</p>
                <p className="mt-1 text-2xl font-black text-amber-900">
                  {leaveRequests.filter((l) => l.status === 'PENDING').length}
                </p>
                <p className="mt-1 text-[11px] text-amber-600">Awaiting Dean & HR authorization</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <p className="text-xs font-medium text-emerald-700">Approved / Scheduled</p>
                <p className="mt-1 text-2xl font-black text-emerald-900">
                  {leaveRequests.filter((l) => l.status === 'APPROVED').length}
                </p>
                <p className="mt-1 text-[11px] text-emerald-600">Active roster adjustments</p>
              </div>
              <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4">
                <p className="text-xs font-medium text-cyan-700">Cover Handover Rate</p>
                <p className="mt-1 text-2xl font-black text-cyan-900">100%</p>
                <p className="mt-1 text-[11px] text-cyan-600">Designated clinical and lecture relief</p>
              </div>
            </div>

            {/* Leave Requests Table */}
            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Staff Member & Role</th>
                    <th className="px-4 py-3">Leave Category</th>
                    <th className="px-4 py-3">Duration & Dates</th>
                    <th className="px-4 py-3">Handover & Justification</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {leaveRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{req.staffName}</div>
                        <div className="text-[11px] text-slate-500">{req.jobTitle} • {req.staffNumber}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          {req.leaveTypeLabel || req.leaveType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div className="font-bold text-slate-900">{req.totalDays} Days</div>
                        <div className="text-[11px] text-slate-500">{req.startDate} to {req.endDate}</div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="text-[11px] text-slate-700 line-clamp-1">
                          <span className="font-semibold text-slate-500">Relief:</span> {req.handoverTo || 'Department Peer'}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 italic">{req.reason}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : req.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {req.status === 'APPROVED' && <CheckCircle className="h-3 w-3" />}
                          {req.status === 'PENDING' && <Clock className="h-3 w-3" />}
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateLeaveStatus(req.id, 'APPROVED')}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateLeaveStatus(req.id, 'REJECTED')}
                              className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {req.approvedBy ? `By ${req.approvedBy}` : 'Processed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: STATUTORY COUNCIL LICENSURE (NMCZ • HPCZ • TCZ) */}
      {activeTab === 'licensure' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-bold text-cyan-800 border border-cyan-200">
                    <Award className="h-3.5 w-3.5" /> Professional Regulatory Compliance
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" /> Mandatory Faculty Accreditation
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  Statutory Council Licensure & Annual Practicing Certificates
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-2xl">
                  Centralized institutional monitoring of professional credentials for Nursing and Midwifery Council of Zambia (NMCZ), Health Professions Council of Zambia (HPCZ), and Teaching Council of Zambia (TCZ).
                </p>
              </div>
            </div>

            {/* Licensure Councils KPI */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white font-bold text-xs">
                    NMCZ
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Nursing & Midwifery Council</h4>
                    <p className="text-[11px] text-slate-500">Nurses and Midwives Act No. 10 of 2019</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-xs">
                  <span className="text-slate-600">Faculty Registered:</span>
                  <span className="font-bold text-slate-900">
                    {staffList.filter((s) => s.tczNumber?.includes('NMCZ') || s.department?.toLowerCase().includes('nurs')).length || 2} Faculty
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-700 text-white font-bold text-xs">
                    HPCZ
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Health Professions Council</h4>
                    <p className="text-[11px] text-slate-500">Health Professions Act No. 7 of 2009</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-xs">
                  <span className="text-slate-600">Faculty Registered:</span>
                  <span className="font-bold text-slate-900">
                    {staffList.filter((s) => s.tczNumber?.includes('HPCZ') || s.department?.toLowerCase().includes('clin')).length || 2} Faculty
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-700 text-white font-bold text-xs">
                    TCZ
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Teaching Council of Zambia</h4>
                    <p className="text-[11px] text-slate-500">Teaching Profession Act No. 5 of 2013</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-xs">
                  <span className="text-slate-600">Faculty Registered:</span>
                  <span className="font-bold text-slate-900">
                    {staffList.filter((s) => s.tczNumber?.includes('TCZ') || s.category === 'ACADEMIC').length || 3} Faculty
                  </span>
                </div>
              </div>
            </div>

            {/* Licensure Table */}
            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Faculty / Staff Member</th>
                    <th className="px-4 py-3">Department & Designation</th>
                    <th className="px-4 py-3">Statutory Council</th>
                    <th className="px-4 py-3">License / Index No</th>
                    <th className="px-4 py-3">Certificate Expiry</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {staffList.map((stf) => {
                    const council = stf.tczNumber?.startsWith('NMCZ')
                      ? 'NMCZ'
                      : stf.tczNumber?.startsWith('HPCZ')
                      ? 'HPCZ'
                      : stf.jobTitle?.toLowerCase().includes('nurs')
                      ? 'NMCZ'
                      : stf.jobTitle?.toLowerCase().includes('clin') || stf.jobTitle?.toLowerCase().includes('med')
                      ? 'HPCZ'
                      : 'TCZ';

                    const licNo = stf.tczNumber || `${council}-2026-${stf.staffNumber.replace('NWU-STF-', '')}`;
                    const expiry = stf.tczCertificateExpiry || '2026-12-31';

                    return (
                      <tr key={stf.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{stf.firstName} {stf.lastName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{stf.staffNumber}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{stf.jobTitle || 'Academic Staff'}</div>
                          <div className="text-[11px] text-slate-500">{stf.department || 'Academic Affairs'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                            <span className="h-2 w-2 rounded-full bg-cyan-600"></span>
                            {council}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          {licNo}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700">
                          {expiry}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                            <CheckCircle className="h-3 w-3" /> COMPLIANT
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedStaffForLicensure(stf);
                              setLicenseCouncil(council);
                              setLicenseNumber(licNo);
                              setLicenseExpiry(expiry);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-cyan-300 bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition shadow-xs"
                          >
                            <Edit className="h-3.5 w-3.5" /> Update APC
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Initialize New Period */}
      {showNewRunModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Initialize Payroll Period</h3>
            <p className="mt-1 text-xs text-slate-500">Create a new payroll run for NWUCHAS medical faculty & staff.</p>

            <form onSubmit={handleCreateRun} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Remuneration Month</label>
                <select
                  value={newRunMonth}
                  onChange={(e) => setNewRunMonth(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Financial Year</label>
                <input
                  type="number"
                  value={newRunYear}
                  onChange={(e) => setNewRunYear(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewRunModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-cyan-800 transition disabled:opacity-50"
                >
                  {isProcessing ? 'Initializing...' : 'Create Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Payslip Modal */}
      {activePayslipLine && (
        <OfficialPayslipModal
          line={activePayslipLine}
          periodName={selectedRun?.periodName || 'Active Period'}
          allRuns={runs}
          onClose={() => setActivePayslipLine(null)}
        />
      )}

      {/* Edit Staff Modal */}
      {selectedStaffForEdit && (
        <EditStaffModal
          isOpen={!!selectedStaffForEdit}
          onClose={() => setSelectedStaffForEdit(null)}
          staff={selectedStaffForEdit}
          salaryScales={salaryScales}
          onSave={handleSaveStaff}
        />
      )}

      {/* Edit Salary Scale Modal */}
      {selectedScaleForEdit && (
        <EditSalaryScaleModal
          isOpen={!!selectedScaleForEdit}
          onClose={() => setSelectedScaleForEdit(null)}
          scale={selectedScaleForEdit}
          onSave={handleSaveScale}
        />
      )}

      {/* Edit Payroll Line Remuneration Modal */}
      {selectedLineForEdit && (
        <EditPayrollLineModal
          isOpen={!!selectedLineForEdit}
          onClose={() => setSelectedLineForEdit(null)}
          line={selectedLineForEdit}
          periodName={selectedRun?.periodName || 'Active Period'}
          onSave={handleSavePayrollLine}
        />
      )}

      {/* Add Staff To Run Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Add Staff Member to Paysheet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select an active staff member to enroll into the {selectedRun?.periodName} payroll run.
            </p>
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700">Staff Member</label>
              <select
                value={staffToAddId}
                onChange={(e) => setStaffToAddId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
              >
                <option value="">-- Choose active staff member --</option>
                {staffList
                  .filter(
                    (stf) =>
                      !(selectedRun?.lines || []).some(
                        (l: any) => l.staffId === stf.id || l.staff?.staffNumber === stf.staffNumber
                      )
                  )
                  .map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.firstName} {stf.lastName} ({stf.staffNumber} • {stf.jobTitle || 'Faculty'})
                    </option>
                  ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowAddStaffModal(false);
                  setStaffToAddId('');
                }}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!staffToAddId || isProcessing}
                onClick={() => handleAddStaffToRun(staffToAddId)}
                className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-cyan-800 transition disabled:opacity-50"
              >
                {isProcessing ? 'Adding...' : 'Add to Paysheet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Apply for Staff Leave */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Apply for Staff Leave</h3>
                <p className="text-xs text-slate-500">Statutory Leave Schedule (Employment Code Act No. 3 of 2019)</p>
              </div>
              <button
                onClick={() => setShowApplyLeaveModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeaveSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Staff Member</label>
                <select
                  value={applyLeaveStaffId}
                  onChange={(e) => setApplyLeaveStaffId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
                >
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.firstName} {stf.lastName} ({stf.staffNumber} • {stf.jobTitle || 'Faculty'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Leave Type</label>
                  <select
                    value={applyLeaveType}
                    onChange={(e) => setApplyLeaveType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
                  >
                    <option value="ANNUAL">Annual Leave (24-Day Pool)</option>
                    <option value="SICK">Certified Sick Leave</option>
                    <option value="STUDY_CPD">Study / CPD Workshop</option>
                    <option value="MATERNITY">Maternity / Paternity Leave</option>
                    <option value="COMPASSIONATE">Compassionate Leave</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Total Working Days</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={applyLeaveDays}
                    onChange={(e) => setApplyLeaveDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={applyLeaveStart}
                    onChange={(e) => setApplyLeaveStart(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={applyLeaveEnd}
                    onChange={(e) => setApplyLeaveEnd(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Designated Handover Colleague</label>
                <input
                  type="text"
                  placeholder="e.g. Sr. Chilufya Banda / Brian Mulenga"
                  value={applyLeaveHandover}
                  onChange={(e) => setApplyLeaveHandover(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Reason / Reference Documentation</label>
                <textarea
                  rows={2}
                  placeholder="Justification, medical certificate reference, or workshop notice..."
                  value={applyLeaveReason}
                  onChange={(e) => setApplyLeaveReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyLeaveModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-700 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-cyan-800 transition"
                >
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Council Licensure */}
      {selectedStaffForLicensure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Update Practicing Certificate</h3>
                <p className="text-xs text-slate-500">
                  {selectedStaffForLicensure.firstName} {selectedStaffForLicensure.lastName} ({selectedStaffForLicensure.staffNumber})
                </p>
              </div>
              <button
                onClick={() => setSelectedStaffForLicensure(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLicensure} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Statutory Professional Council</label>
                <select
                  value={licenseCouncil}
                  onChange={(e) => setLicenseCouncil(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none font-medium"
                >
                  <option value="NMCZ">Nursing & Midwifery Council of Zambia (NMCZ)</option>
                  <option value="HPCZ">Health Professions Council of Zambia (HPCZ)</option>
                  <option value="TCZ">Teaching Council of Zambia (TCZ)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Registration / Index Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NMCZ-2026-RN-0941"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Certificate Expiry Date</label>
                <input
                  type="date"
                  required
                  value={licenseExpiry}
                  onChange={(e) => setLicenseExpiry(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none font-mono"
                />
                <p className="mt-1 text-[11px] text-slate-500">Annual Practicing Certificates (APCs) must be renewed before Dec 31st annually.</p>
              </div>

              <div className="mt-5 flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedStaffForLicensure(null)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-700 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-cyan-800 transition"
                >
                  Save Practicing Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
