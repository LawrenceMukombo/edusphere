import { describe, expect, it } from 'vitest';
import {
  calculateProgressiveLiability,
  moneyToNgwee,
  StatutoryRuleError,
  type StatutoryRuleVersion,
} from '../src/server/payroll/statutoryRules';
import { ZRA_PAYE_2026, computePayrollLine } from '../src/server/payroll/payroll.service';

const approvedRule: StatutoryRuleVersion = {
  authority: 'Test authority',
  obligation: 'Test progressive liability',
  jurisdiction: 'ZM',
  sourceUrl: 'https://example.org/approved-notice',
  effectiveFrom: '2026-01-01',
  approvalState: 'APPROVED',
  approvedBy: 'accountant@example.org',
  approvedAt: '2026-01-02T10:00:00Z',
  version: 'TEST-2026-01',
  progressiveBands: [
    { upperBound: '1000.00', rateBasisPoints: 0 },
    { upperBound: '2000.00', rateBasisPoints: 1_000 },
    { upperBound: null, rateBasisPoints: 2_000 },
  ],
};

describe('approval-gated statutory rules', () => {
  it('uses exact ngwee conversion without floating point drift', () => {
    expect(moneyToNgwee('1234.56')).toBe(123456n);
    expect(() => moneyToNgwee('1.999')).toThrow(StatutoryRuleError);
  });

  it('calculates bracket boundaries and snapshots the applied version', () => {
    expect(calculateProgressiveLiability('1000.00', approvedRule, '2026-01-31')).toEqual({ liability: '0.00', appliedRuleVersion: 'TEST-2026-01' });
    expect(calculateProgressiveLiability('1500.00', approvedRule, '2026-01-31').liability).toBe('50.00');
    expect(calculateProgressiveLiability('2500.00', approvedRule, '2026-01-31').liability).toBe('200.00');
  });

  it('rejects unapproved, unsourced or ineffective rules', () => {
    expect(() => calculateProgressiveLiability('1500.00', { ...approvedRule, approvalState: 'DRAFT' }, '2026-01-31')).toThrow(/approved/i);
    expect(() => calculateProgressiveLiability('1500.00', { ...approvedRule, sourceUrl: 'http://example.org/rules' }, '2026-01-31')).toThrow(/HTTPS/i);
    expect(() => calculateProgressiveLiability('1500.00', approvedRule, '2025-12-31')).toThrow(/effective/i);
  });

  it('computes exact official Zambian 2026 ZRA PAYE tax bracket boundaries', () => {
    // 1. Below K5,100 tax-free threshold
    expect(calculateProgressiveLiability('5000.00', ZRA_PAYE_2026, '2026-01-31').liability).toBe('0.00');
    expect(calculateProgressiveLiability('5100.00', ZRA_PAYE_2026, '2026-01-31').liability).toBe('0.00');

    // 2. In 20% bracket (5,100 to 7,100)
    expect(calculateProgressiveLiability('6100.00', ZRA_PAYE_2026, '2026-01-31').liability).toBe('200.00');
    expect(calculateProgressiveLiability('7100.00', ZRA_PAYE_2026, '2026-01-31').liability).toBe('400.00');

    // 3. In 30% bracket (7,100 to 9,200)
    expect(calculateProgressiveLiability('8100.00', ZRA_PAYE_2026, '2026-01-31').liability).toBe('700.00');
    expect(calculateProgressiveLiability('9200.00', ZRA_PAYE_2026, '2026-01-31').liability).toBe('1030.00');

    // 4. In 37% top bracket (>9,200)
    expect(calculateProgressiveLiability('10200.00', ZRA_PAYE_2026, '2026-01-31').liability).toBe('1400.00');
  });

  it('enforces that WCFCB 2.5% is employer cost only and does not reduce employee net pay', () => {
    const calc = computePayrollLine('staff-test-01', '8200.00', '2000.00', '2026-01-31');
    expect(calc.grossPayZMW).toBe('10200.00');
    expect(calc.payeDeductionZMW).toBe('1400.00');
    expect(calc.napsaEmployeeZMW).toBe('510.00');
    expect(calc.netPayZMW).toBe('8290.00');
    expect(calc.wcfcbEmployerZMW).toBe('255.00');
    // Net Pay equals Gross minus PAYE minus NAPSA employee only
    expect(Number(calc.grossPayZMW) - Number(calc.payeDeductionZMW) - Number(calc.napsaEmployeeZMW)).toBe(8290);
  });
});
