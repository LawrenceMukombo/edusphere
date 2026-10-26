import { describe, expect, it } from 'vitest';
import {
  buildReversalEntry,
  JournalValidationError,
  validateJournalEntry,
} from '../src/server/finance/doubleEntry';

const entry = {
  reference: 'JRN-0001',
  description: 'Student fee invoice posting',
  postedBy: 'user-finance-1',
  lines: [
    { accountCode: 'AR.STUDENT', debit: '1250.00', credit: '0.00', description: 'Student receivable' },
    { accountCode: 'REV.TUITION', debit: '0.00', credit: '1250.00', description: 'Tuition revenue' },
  ],
} as const;

describe('immutable double-entry journal contract', () => {
  it('accepts balanced journals with exact totals', () => {
    expect(validateJournalEntry(entry)).toMatchObject({ totalDebit: '1250.00', totalCredit: '1250.00' });
  });

  it('rejects unbalanced or ambiguous journal lines', () => {
    expect(() => validateJournalEntry({ ...entry, lines: [{ ...entry.lines[0], credit: '1.00' }, entry.lines[1]] })).toThrow(JournalValidationError);
    expect(() => validateJournalEntry({ ...entry, lines: [entry.lines[0], { ...entry.lines[1], credit: '1249.99' }] })).toThrow(/balance/i);
  });

  it('creates a balanced compensating reversal without mutating history', () => {
    const original = validateJournalEntry(entry);
    const reversal = buildReversalEntry(original, 'JRN-0002', 'user-finance-2');
    expect(reversal.reversalOfReference).toBe('JRN-0001');
    expect(reversal.lines[0]).toMatchObject({ debit: '0.00', credit: '1250.00' });
    expect(reversal.totalDebit).toBe('1250.00');
  });
});
