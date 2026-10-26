import { describe, expect, it } from 'vitest';
import { assertPaymentCapture, FinanceValidationError, moneyInputToFixed } from '../src/server/finance/paymentValidation';

describe('student-finance payment validation', () => {
  it('accepts exact ngwee values only', () => {
    expect(moneyInputToFixed(1250.5)).toBe('1250.50');
    expect(() => moneyInputToFixed(0)).toThrow(FinanceValidationError);
    expect(() => moneyInputToFixed(1.999)).toThrow(/two decimal/i);
  });

  it('rejects overpayments and incomplete receipt references', () => {
    expect(() => assertPaymentCapture({ amount: 101, outstandingBalance: 100, paymentNumber: 'PAY-1', receiptNumber: 'REC-1', referenceNumber: 'REF-1' })).toThrow(/exceeds/i);
    expect(() => assertPaymentCapture({ amount: 100, outstandingBalance: 100, paymentNumber: '', receiptNumber: 'REC-1', referenceNumber: 'REF-1' })).toThrow(/required/i);
  });
});
