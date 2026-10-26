/**
 * NWUCHAS-CMIS Payroll Processing Service
 * 
 * Implements Zambian statutory payroll: ZRA PAYE 2026 progressive bands,
 * NAPSA 5% employee + 5% employer contributions (capped at K892.20/month each),
 * WCFCB 2.5% employer-only health education class levy.
 * 
 * CRITICAL RULES:
 * - WCFCB deductions NEVER come from employee net pay; they are employer cost only.
 * - Statutory rules are version-controlled and must be in APPROVED state before use.
 * - Payroll runs follow a state machine: DRAFT → PREPARED → REVIEWED → APPROVED/LOCKED.
 * - Locked payroll runs are immutable; corrections require a new run.
 */
import { prisma } from '../db';
const db: any = prisma;
import { Decimal } from '@prisma/client/runtime/library';
import {
  calculateProgressiveLiability,
  assertRuleIsEffectiveAndApproved,
  moneyToNgwee,
  ngweeToMoney,
  StatutoryRuleVersion,
} from './statutoryRules';

// ---------------------------------------------------------------------------
// ZRA PAYE 2026 — Zambia Revenue Authority Income Tax Rate Schedule
// Source: ZRA TaxOnline, effective 01 January 2026
// First K5,100 @ 0%, Next K2,000 (K5,100–K7,100) @ 20%, Next K2,100 (K7,100–K9,200) @ 30%, Excess (>K9,200) @ 37%
// ---------------------------------------------------------------------------
export const ZRA_PAYE_2026: StatutoryRuleVersion = {
  authority: 'Zambia Revenue Authority',
  obligation: 'PAYE',
  jurisdiction: 'Zambia',
  sourceUrl: 'https://www.zra.org.zm/tax-types/personal-income-tax/',
  effectiveFrom: '2026-01-01',
  approvalState: 'APPROVED',
  approvedBy: 'NWUCHAS-CFO',
  approvedAt: '2026-01-05T00:00:00.000Z',
  version: '2026-v1',
  progressiveBands: [
    { upperBound: '5100.00',   rateBasisPoints: 0    },  // First ZMW 5,100 @ 0% (Tax-Free Threshold)
    { upperBound: '7100.00',   rateBasisPoints: 2000 },  // Next ZMW 2,000 (5,100–7,100) @ 20%
    { upperBound: '9200.00',   rateBasisPoints: 3000 },  // Next ZMW 2,100 (7,100–9,200) @ 30%
    { upperBound: null,        rateBasisPoints: 3700 },  // Excess above ZMW 9,200 @ 37%
  ],
};

// ---------------------------------------------------------------------------
// NAPSA 2026 — National Pension Scheme Authority contribution rules
// Employee: 5%, Employer: 5%, each capped at ZMW 1,493.40 / month (K29,868 ceiling)
// ---------------------------------------------------------------------------
const NAPSA_2026_CAP_NGWEE = 149340n; // ZMW 1,493.40

function calculateNapsa(grossZMW: string): { employeeContribution: string; employerContribution: string } {
  const grossNgwee = moneyToNgwee(grossZMW);
  const rawContribution = (grossNgwee * 5n + 99n) / 100n; // 5% with ceiling rounding
  const capped = rawContribution > NAPSA_2026_CAP_NGWEE ? NAPSA_2026_CAP_NGWEE : rawContribution;
  const contribution = ngweeToMoney(capped);
  return { employeeContribution: contribution, employerContribution: contribution };
}

// ---------------------------------------------------------------------------
// WCFCB 2026 — Workers Compensation Fund Control Board
// Class 4: Health/Education Employer-Only levy at 2.5% of gross wages
// CRITICAL: This is NEVER deducted from employee salary
// ---------------------------------------------------------------------------
function calculateWcfcb(grossZMW: string): string {
  const grossNgwee = moneyToNgwee(grossZMW);
  const levy = (grossNgwee * 250n + 5000n) / 10000n; // 2.5% with half-up rounding
  return ngweeToMoney(levy);
}

// ---------------------------------------------------------------------------
// Core Calculation
// ---------------------------------------------------------------------------
export interface PayrollLineCalculation {
  staffId: string;
  basicSalaryZMW: string;
  totalAllowancesZMW: string;
  grossPayZMW: string;
  payeDeductionZMW: string;
  napsaEmployeeZMW: string;
  otherDeductionsZMW: string;
  netPayZMW: string;
  napsaEmployerZMW: string;
  wcfcbEmployerZMW: string;
}

export function computePayrollLine(
  staffId: string,
  basicSalaryZMW: string,
  allowancesZMW: string,
  calculationDate: string,
): PayrollLineCalculation {
  assertRuleIsEffectiveAndApproved(ZRA_PAYE_2026, calculationDate);

  const basicNgwee = moneyToNgwee(basicSalaryZMW);
  const allowNgwee = moneyToNgwee(allowancesZMW);
  const grossNgwee = basicNgwee + allowNgwee;
  const grossZMW = ngweeToMoney(grossNgwee);

  // 1. PAYE (progressive on gross)
  const { liability: payeZMW } = calculateProgressiveLiability(grossZMW, ZRA_PAYE_2026, calculationDate);

  // 2. NAPSA Employee deduction (5%, capped)
  const { employeeContribution: napsaEmpZMW, employerContribution: napsaEmplorZMW } = calculateNapsa(grossZMW);

  // 3. WCFCB Employer levy (NOT deducted from employee)
  const wcfcbZMW = calculateWcfcb(grossZMW);

  // 4. Net Pay = Gross - PAYE - NAPSA Employee
  const payeNgwee = moneyToNgwee(payeZMW);
  const napsaEmpNgwee = moneyToNgwee(napsaEmpZMW);
  const netNgwee = grossNgwee - payeNgwee - napsaEmpNgwee;
  const netZMW = ngweeToMoney(netNgwee);

  return {
    staffId,
    basicSalaryZMW,
    totalAllowancesZMW: allowancesZMW,
    grossPayZMW: grossZMW,
    payeDeductionZMW: payeZMW,
    napsaEmployeeZMW: napsaEmpZMW,
    otherDeductionsZMW: '0.00',
    netPayZMW: netZMW,
    napsaEmployerZMW: napsaEmplorZMW,
    wcfcbEmployerZMW: wcfcbZMW,
  };
}

// ---------------------------------------------------------------------------
// Payroll Run State Machine
// ---------------------------------------------------------------------------
export class PayrollService {
  /**
   * Create a new DRAFT payroll run for a given month/year
   */
  static async createRun(data: {
    organisationId: string;
    periodMonth: number;
    periodYear: number;
    preparedById?: string;
  }) {
    const existing = await db.payrollRun.findUnique({
      where: {
        organisationId_periodMonth_periodYear: {
          organisationId: data.organisationId,
          periodMonth: data.periodMonth,
          periodYear: data.periodYear,
        },
      },
    });
    if (existing) {
      if (existing.isLocked) throw new Error('A locked payroll run already exists for this period.');
      return existing;
    }

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const periodName = `${monthNames[data.periodMonth - 1]} ${data.periodYear}`;

    return db.payrollRun.create({
      data: {
        organisationId: data.organisationId,
        periodName,
        periodMonth: data.periodMonth,
        periodYear: data.periodYear,
        status: 'DRAFT',
        preparedById: data.preparedById,
      },
    });
  }

  /**
   * Calculate and populate payroll lines for all active staff.
   * Advances run from DRAFT → PREPARED.
   */
  static async calculateRun(payrollRunId: string, calculationDate: string) {
    const run = await db.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: { lines: true },
    });
    if (!run) throw new Error('Payroll run not found.');
    if (run.isLocked) throw new Error('Cannot recalculate a locked payroll run.');
    if (run.status === 'APPROVED_LOCKED') throw new Error('Cannot recalculate an approved payroll run.');

    // Fetch all active staff with their contract
    const staffList = await db.staff.findMany({
      where: {
        organisationId: run.organisationId,
        employmentStatus: { in: ['FULL_TIME', 'PART_TIME', 'CONTRACT'] },
      },
      include: {
        contract: true,
      },
    });

    const calculations: PayrollLineCalculation[] = [];
    let totalGross = 0n;
    let totalNet = 0n;
    let totalPaye = 0n;
    let totalNapsaEmp = 0n;
    let totalNapsaEmplor = 0n;
    let totalWcfcb = 0n;

    return db.$transaction(async (tx: any) => {
      // Delete existing draft lines (not yet locked)
      await tx.payrollRunLine.deleteMany({ where: { payrollRunId } });

      for (const staff of staffList) {
        const contract = staff.contract;
        if (!contract) continue;

        const basicSalary = contract.basicSalaryZMW.toString();
        const totalAllowances = Number(contract.housingAllowance || 0) + Number(contract.transportAllowance || 0) + Number(contract.clinicalAllowance || 0);
        const allowances = totalAllowances.toFixed(2);

        const calc = computePayrollLine(staff.id, basicSalary, allowances, calculationDate);
        calculations.push(calc);

        // Accumulate run-level totals using ngwee precision
        totalGross += moneyToNgwee(calc.grossPayZMW);
        totalNet += moneyToNgwee(calc.netPayZMW);
        totalPaye += moneyToNgwee(calc.payeDeductionZMW);
        totalNapsaEmp += moneyToNgwee(calc.napsaEmployeeZMW);
        totalNapsaEmplor += moneyToNgwee(calc.napsaEmployerZMW);
        totalWcfcb += moneyToNgwee(calc.wcfcbEmployerZMW);

        // Upsert payroll line
        await tx.payrollRunLine.create({
          data: {
            payrollRunId,
            staffId: staff.id,
            basicSalaryZMW: new Decimal(calc.basicSalaryZMW),
            totalAllowancesZMW: new Decimal(calc.totalAllowancesZMW),
            grossPayZMW: new Decimal(calc.grossPayZMW),
            payeDeductionZMW: new Decimal(calc.payeDeductionZMW),
            napsaEmployeeZMW: new Decimal(calc.napsaEmployeeZMW),
            otherDeductionsZMW: new Decimal('0.00'),
            netPayZMW: new Decimal(calc.netPayZMW),
            napsaEmployerZMW: new Decimal(calc.napsaEmployerZMW),
            wcfcbEmployerZMW: new Decimal(calc.wcfcbEmployerZMW),
          },
        });
      }

      // Update run totals and advance state
      const updatedRun = await tx.payrollRun.update({
        where: { id: payrollRunId },
        data: {
          status: 'CALCULATED',
          totalGrossZMW: new Decimal(ngweeToMoney(totalGross)),
          totalNetZMW: new Decimal(ngweeToMoney(totalNet)),
          totalPayeZMW: new Decimal(ngweeToMoney(totalPaye)),
          totalNapsaEmpZMW: new Decimal(ngweeToMoney(totalNapsaEmp)),
          totalNapsaEmployerZMW: new Decimal(ngweeToMoney(totalNapsaEmplor)),
          totalWcfcbEmployerZMW: new Decimal(ngweeToMoney(totalWcfcb)),
        },
        include: { lines: { include: { staff: true } } },
      });

      return updatedRun;
    });
  }

  /**
   * Approve and lock the payroll run.
   * Once locked, lines are immutable — corrections require a new run.
   */
  static async approveAndLock(payrollRunId: string, approvedById: string) {
    const run = await db.payrollRun.findUnique({
      where: { id: payrollRunId },
    });
    if (!run) throw new Error('Payroll run not found.');
    if (run.isLocked) throw new Error('Payroll run is already locked.');
    if (run.status !== 'CALCULATED' && run.status !== 'REVIEWED') {
      throw new Error(`Cannot approve a run in ${run.status} status. Must be CALCULATED or REVIEWED.`);
    }

    return db.payrollRun.update({
      where: { id: payrollRunId },
      data: {
        status: 'APPROVED_LOCKED',
        isLocked: true,
        lockedAt: new Date(),
        approvedById,
      },
    });
  }

  /**
   * Export ZRA TaxOnline CSV for PAYE filing.
   * Returns CSV string: EmployeeTPIN,FullName,GrossPay,ChargeableIncome,PAYEDeducted
   */
  static async exportZraTaxOnlineCsv(payrollRunId: string): Promise<string> {
    const run = await db.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        lines: {
          include: {
            staff: {
              include: {
                contract: true,
              },
            },
          },
        },
      },
    });
    if (!run) throw new Error('Payroll run not found.');

    const header = 'EmployeeTPIN,FirstName,LastName,NRCNumber,GrossPayZMW,ChargeableIncomeZMW,PAYEDeductedZMW,NAPSAEmployeeZMW\n';
    const rows = (run.lines || []).map((line: any) => {
      const contract = line.staff?.contract;
      return [
        contract?.tpin || 'PENDING',
        line.staff?.firstName || '',
        line.staff?.lastName || '',
        line.staff?.staffNumber || '',
        Number(line.grossPayZMW).toFixed(2),
        Number(line.grossPayZMW).toFixed(2), // Chargeable = Gross for simplicity
        Number(line.payeDeductionZMW).toFixed(2),
        Number(line.napsaEmployeeZMW).toFixed(2),
      ].join(',');
    });

    return header + rows.join('\n');
  }

  /**
   * Export eNAPSA schedule for National Pension contributions filing.
   */
  static async exportNapsaSchedule(payrollRunId: string): Promise<string> {
    const run = await db.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        lines: {
          include: {
            staff: {
              include: {
                contract: true,
              },
            },
          },
        },
      },
    });
    if (!run) throw new Error('Payroll run not found.');

    const header = 'NAPSANumber,FirstName,LastName,NRC,GrossPayZMW,EmployeeContributionZMW,EmployerContributionZMW,TotalRemittanceZMW\n';
    const rows = (run.lines || []).map((line: any) => {
      const contract = line.staff?.contract;
      const empContrib = Number(line.napsaEmployeeZMW).toFixed(2);
      const emplorContrib = Number(line.napsaEmployerZMW).toFixed(2);
      const total = (Number(empContrib) + Number(emplorContrib)).toFixed(2);
      return [
        contract?.napsaNumber || 'PENDING',
        line.staff?.firstName || '',
        line.staff?.lastName || '',
        line.staff?.staffNumber || '',
        Number(line.grossPayZMW).toFixed(2),
        empContrib,
        emplorContrib,
        total,
      ].join(',');
    });

    return header + rows.join('\n');
  }

  /**
   * Export WCFCB employer-only employer assessment declaration.
   * WCFCB levy is an employer cost; never touches employee net pay.
   */
  static async exportWcfcbDeclaration(payrollRunId: string): Promise<string> {
    const run = await db.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        lines: {
          include: { staff: true },
        },
      },
    });
    if (!run) throw new Error('Payroll run not found.');

    const header = `WCFCB Employer Assessment Declaration\nPeriod: ${run.periodName}\nInstitution: NWUCHAS\nClass: 4 (Health/Education)\n\n`;
    const tableHeader = 'StaffNumber,FullName,GrossPayZMW,WCFCBLevyZMW\n';
    const rows = (run.lines || []).map((line: any) => [
      line.staff?.staffNumber || '',
      `${line.staff?.firstName || ''} ${line.staff?.lastName || ''}`,
      Number(line.grossPayZMW).toFixed(2),
      Number(line.wcfcbEmployerZMW).toFixed(2),
    ].join(','));

    const totalWcfcb = (run.lines || []).reduce((sum: number, l: any) => sum + Number(l.wcfcbEmployerZMW), 0);
    const footer = `\nTotal WCFCB Employer Levy,,,${totalWcfcb.toFixed(2)}\nNote: WCFCB levy is an employer cost only and is NOT deducted from any employee salary.\n`;

    return header + tableHeader + rows.join('\n') + footer;
  }

  /**
   * Generate individual payslips for all staff in a payroll run
   */
  static async generatePayslips(payrollRunId: string) {
    const run = await db.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        lines: {
          include: {
            staff: true,
            paySlip: true,
          },
        },
      },
    });
    if (!run) throw new Error('Payroll run not found.');
    if (!run.isLocked) throw new Error('Payslips can only be generated for locked/approved payroll runs.');

    const results = [];
    for (const line of run.lines) {
      if (line.paySlip) {
        results.push(line.paySlip);
        continue;
      }

      const slipNumber = `PS-${run.periodYear}-${String(run.periodMonth).padStart(2,'0')}-${line.staff.staffNumber}`;

      const breakdownJson = JSON.stringify({
        staffName: `${line.staff.firstName} ${line.staff.lastName}`,
        staffNumber: line.staff.staffNumber,
        period: run.periodName,
        basicSalary: Number(line.basicSalaryZMW).toFixed(2),
        allowances: Number(line.totalAllowancesZMW).toFixed(2),
        grossPay: Number(line.grossPayZMW).toFixed(2),
        deductions: {
          paye: Number(line.payeDeductionZMW).toFixed(2),
          napsaEmployee: Number(line.napsaEmployeeZMW).toFixed(2),
          other: Number(line.otherDeductionsZMW).toFixed(2),
        },
        netPay: Number(line.netPayZMW).toFixed(2),
        employerContributions: {
          napsaEmployer: Number(line.napsaEmployerZMW).toFixed(2),
          wcfcbEmployer: Number(line.wcfcbEmployerZMW).toFixed(2),
          note: 'Employer contributions are NOT deducted from employee net pay.',
        },
      });

      const slip = await db.paySlip.create({
        data: {
          payrollRunLineId: line.id,
          slipNumber,
          issuedDate: new Date(),
          breakdownJson,
        },
      });
      results.push(slip);
    }

    return results;
  }

  /**
   * List all payroll runs for the institution, most recent first
   */
  static async listRuns(organisationId: string) {
    return db.payrollRun.findMany({
      where: { organisationId },
      include: {
        _count: { select: { lines: true } },
      },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    });
  }

  /**
   * Get a payroll run with full detail for review
   */
  static async getRun(payrollRunId: string) {
    return db.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        lines: {
          include: {
            staff: {
              include: {
                contract: true,
              },
            },
            paySlip: true,
          },
        },
        filings: true,
      },
    });
  }

  /**
   * Update an itemized payroll line in an editable (unlocked) run and re-accumulate totals.
   */
  static async updateRunLine(data: {
    lineId: string;
    basicSalaryZMW: number | string;
    totalAllowancesZMW: number | string;
    grossPayZMW: number | string;
    payeDeductionZMW: number | string;
    napsaEmployeeZMW: number | string;
    otherDeductionsZMW: number | string;
    netPayZMW: number | string;
    napsaEmployerZMW?: number | string;
    wcfcbEmployerZMW?: number | string;
  }) {
    const line = await db.payrollRunLine.findUnique({
      where: { id: data.lineId },
      include: { payrollRun: true },
    });
    if (!line) throw new Error('Payroll run line not found.');
    if (line.payrollRun.isLocked) throw new Error('Cannot edit lines of an approved/locked payroll run.');

    const updatedLine = await db.payrollRunLine.update({
      where: { id: data.lineId },
      data: {
        basicSalaryZMW: new Decimal(Number(data.basicSalaryZMW).toFixed(2)),
        totalAllowancesZMW: new Decimal(Number(data.totalAllowancesZMW).toFixed(2)),
        grossPayZMW: new Decimal(Number(data.grossPayZMW).toFixed(2)),
        payeDeductionZMW: new Decimal(Number(data.payeDeductionZMW).toFixed(2)),
        napsaEmployeeZMW: new Decimal(Number(data.napsaEmployeeZMW).toFixed(2)),
        otherDeductionsZMW: new Decimal(Number(data.otherDeductionsZMW || 0).toFixed(2)),
        netPayZMW: new Decimal(Number(data.netPayZMW).toFixed(2)),
        napsaEmployerZMW: new Decimal(Number(data.napsaEmployerZMW ?? data.napsaEmployeeZMW).toFixed(2)),
        wcfcbEmployerZMW: new Decimal(Number(data.wcfcbEmployerZMW || 0).toFixed(2)),
      },
      include: {
        staff: {
          include: { contract: true },
        },
        paySlip: true,
      },
    });

    // Re-accumulate totals for the parent run
    const allLines = await db.payrollRunLine.findMany({
      where: { payrollRunId: line.payrollRunId },
    });

    let totalGross = 0n;
    let totalNet = 0n;
    let totalPaye = 0n;
    let totalNapsaEmp = 0n;
    let totalNapsaEmplor = 0n;
    let totalWcfcb = 0n;

    for (const l of allLines) {
      totalGross += moneyToNgwee(l.grossPayZMW.toString());
      totalNet += moneyToNgwee(l.netPayZMW.toString());
      totalPaye += moneyToNgwee(l.payeDeductionZMW.toString());
      totalNapsaEmp += moneyToNgwee(l.napsaEmployeeZMW.toString());
      totalNapsaEmplor += moneyToNgwee(l.napsaEmployerZMW.toString());
      totalWcfcb += moneyToNgwee(l.wcfcbEmployerZMW.toString());
    }

    const updatedRun = await db.payrollRun.update({
      where: { id: line.payrollRunId },
      data: {
        totalGrossZMW: new Decimal(ngweeToMoney(totalGross)),
        totalNetZMW: new Decimal(ngweeToMoney(totalNet)),
        totalPayeZMW: new Decimal(ngweeToMoney(totalPaye)),
        totalNapsaEmpZMW: new Decimal(ngweeToMoney(totalNapsaEmp)),
        totalNapsaEmployerZMW: new Decimal(ngweeToMoney(totalNapsaEmplor)),
        totalWcfcbEmployerZMW: new Decimal(ngweeToMoney(totalWcfcb)),
      },
      include: {
        lines: {
          include: {
            staff: {
              include: { contract: true },
            },
            paySlip: true,
          },
        },
        filings: true,
      },
    });

    return { line: updatedLine, run: updatedRun };
  }

  /**
   * Add a staff member to an editable draft payroll run and recalculate totals.
   */
  static async addStaffToRun(payrollRunId: string, staffId: string) {
    const run = await db.payrollRun.findUnique({
      where: { id: payrollRunId },
    });
    if (!run) throw new Error('Payroll run not found.');
    if (run.isLocked) throw new Error('Cannot add staff to an approved/locked payroll run.');

    const existingLine = await db.payrollRunLine.findUnique({
      where: {
        payrollRunId_staffId: {
          payrollRunId,
          staffId,
        },
      },
      include: {
        staff: { include: { contract: true } },
        paySlip: true,
      },
    });
    if (existingLine) {
      return { line: existingLine, run: await PayrollService.getRun(payrollRunId) };
    }

    const staff = await db.staff.findUnique({
      where: { id: staffId },
      include: { contract: true },
    });
    if (!staff) throw new Error('Staff member not found.');

    const basicSalary = staff.contract ? staff.contract.basicSalaryZMW.toString() : '12000.00';
    const totalAllowances = staff.contract
      ? Number(staff.contract.housingAllowance || 0) +
        Number(staff.contract.transportAllowance || 0) +
        Number(staff.contract.clinicalAllowance || 0)
      : 1500;
    const allowances = totalAllowances.toFixed(2);

    const calc = computePayrollLine(staff.id, basicSalary, allowances, new Date().toISOString().split('T')[0]);

    const newLine = await db.payrollRunLine.create({
      data: {
        payrollRunId,
        staffId,
        basicSalaryZMW: new Decimal(calc.basicSalaryZMW),
        totalAllowancesZMW: new Decimal(calc.totalAllowancesZMW),
        grossPayZMW: new Decimal(calc.grossPayZMW),
        payeDeductionZMW: new Decimal(calc.payeDeductionZMW),
        napsaEmployeeZMW: new Decimal(calc.napsaEmployeeZMW),
        otherDeductionsZMW: new Decimal('0.00'),
        netPayZMW: new Decimal(calc.netPayZMW),
        napsaEmployerZMW: new Decimal(calc.napsaEmployerZMW),
        wcfcbEmployerZMW: new Decimal(calc.wcfcbEmployerZMW),
      },
      include: {
        staff: { include: { contract: true } },
        paySlip: true,
      },
    });

    // Re-accumulate totals
    const allLines = await db.payrollRunLine.findMany({
      where: { payrollRunId },
    });

    let totalGross = 0n;
    let totalNet = 0n;
    let totalPaye = 0n;
    let totalNapsaEmp = 0n;
    let totalNapsaEmplor = 0n;
    let totalWcfcb = 0n;

    for (const l of allLines) {
      totalGross += moneyToNgwee(l.grossPayZMW.toString());
      totalNet += moneyToNgwee(l.netPayZMW.toString());
      totalPaye += moneyToNgwee(l.payeDeductionZMW.toString());
      totalNapsaEmp += moneyToNgwee(l.napsaEmployeeZMW.toString());
      totalNapsaEmplor += moneyToNgwee(l.napsaEmployerZMW.toString());
      totalWcfcb += moneyToNgwee(l.wcfcbEmployerZMW.toString());
    }

    const updatedRun = await db.payrollRun.update({
      where: { id: payrollRunId },
      data: {
        totalGrossZMW: new Decimal(ngweeToMoney(totalGross)),
        totalNetZMW: new Decimal(ngweeToMoney(totalNet)),
        totalPayeZMW: new Decimal(ngweeToMoney(totalPaye)),
        totalNapsaEmpZMW: new Decimal(ngweeToMoney(totalNapsaEmp)),
        totalNapsaEmployerZMW: new Decimal(ngweeToMoney(totalNapsaEmplor)),
        totalWcfcbEmployerZMW: new Decimal(ngweeToMoney(totalWcfcb)),
      },
      include: {
        lines: {
          include: {
            staff: { include: { contract: true } },
            paySlip: true,
          },
        },
        filings: true,
      },
    });

    return { line: newLine, run: updatedRun };
  }

  /**
   * Delete a staff line from an editable draft payroll run and recalculate totals.
   */
  static async deleteRunLine(payrollRunId: string, lineId: string) {
    const run = await db.payrollRun.findUnique({
      where: { id: payrollRunId },
    });
    if (!run) throw new Error('Payroll run not found.');
    if (run.isLocked) throw new Error('Cannot delete lines from an approved/locked payroll run.');

    await db.payrollRunLine.delete({
      where: { id: lineId },
    });

    // Re-accumulate totals
    const allLines = await db.payrollRunLine.findMany({
      where: { payrollRunId },
    });

    let totalGross = 0n;
    let totalNet = 0n;
    let totalPaye = 0n;
    let totalNapsaEmp = 0n;
    let totalNapsaEmplor = 0n;
    let totalWcfcb = 0n;

    for (const l of allLines) {
      totalGross += moneyToNgwee(l.grossPayZMW.toString());
      totalNet += moneyToNgwee(l.netPayZMW.toString());
      totalPaye += moneyToNgwee(l.payeDeductionZMW.toString());
      totalNapsaEmp += moneyToNgwee(l.napsaEmployeeZMW.toString());
      totalNapsaEmplor += moneyToNgwee(l.napsaEmployerZMW.toString());
      totalWcfcb += moneyToNgwee(l.wcfcbEmployerZMW.toString());
    }

    return db.payrollRun.update({
      where: { id: payrollRunId },
      data: {
        totalGrossZMW: new Decimal(ngweeToMoney(totalGross)),
        totalNetZMW: new Decimal(ngweeToMoney(totalNet)),
        totalPayeZMW: new Decimal(ngweeToMoney(totalPaye)),
        totalNapsaEmpZMW: new Decimal(ngweeToMoney(totalNapsaEmp)),
        totalNapsaEmployerZMW: new Decimal(ngweeToMoney(totalNapsaEmplor)),
        totalWcfcbEmployerZMW: new Decimal(ngweeToMoney(totalWcfcb)),
      },
      include: {
        lines: {
          include: {
            staff: { include: { contract: true } },
            paySlip: true,
          },
        },
        filings: true,
      },
    });
  }
}
