export interface JournalLineInput {
  accountCode: string;
  debit: string;
  credit: string;
  description: string;
}

export interface JournalEntryInput {
  reference: string;
  description: string;
  postedBy: string;
  lines: readonly JournalLineInput[];
  reversalOfReference?: string;
}

export interface ValidatedJournalEntry extends JournalEntryInput {
  totalDebit: string;
  totalCredit: string;
}

export class JournalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JournalValidationError';
  }
}

function amountToNgwee(value: string): bigint {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) throw new JournalValidationError('Journal amounts must be non-negative values with at most two decimals.');
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 100n + BigInt((fraction + '00').slice(0, 2));
}

function formatNgwee(value: bigint): string {
  return `${value / 100n}.${(value % 100n).toString().padStart(2, '0')}`;
}

/** Validates immutable journal content before it is persisted in one transaction. */
export function validateJournalEntry(entry: JournalEntryInput): ValidatedJournalEntry {
  if (!/^[A-Z0-9._-]{4,80}$/.test(entry.reference)) throw new JournalValidationError('Journal reference is invalid.');
  if (!entry.description.trim() || !entry.postedBy.trim()) throw new JournalValidationError('Journal description and posting actor are required.');
  if (entry.lines.length < 2) throw new JournalValidationError('A journal requires at least two lines.');

  let totalDebit = 0n;
  let totalCredit = 0n;
  for (const line of entry.lines) {
    if (!/^[A-Z0-9._-]{2,80}$/.test(line.accountCode)) throw new JournalValidationError('Journal account code is invalid.');
    if (!line.description.trim()) throw new JournalValidationError('Each journal line needs a description.');
    const debit = amountToNgwee(line.debit);
    const credit = amountToNgwee(line.credit);
    if ((debit === 0n && credit === 0n) || (debit > 0n && credit > 0n)) {
      throw new JournalValidationError('A journal line must contain either a debit or a credit, not both.');
    }
    totalDebit += debit;
    totalCredit += credit;
  }
  if (totalDebit !== totalCredit) throw new JournalValidationError('Journal debits and credits must balance exactly.');
  return { ...entry, totalDebit: formatNgwee(totalDebit), totalCredit: formatNgwee(totalCredit) };
}

/** Builds a compensating entry; callers must persist it rather than editing/deleting the original. */
export function buildReversalEntry(original: ValidatedJournalEntry, reversalReference: string, actor: string): ValidatedJournalEntry {
  if (!/^[A-Z0-9._-]{4,80}$/.test(reversalReference)) throw new JournalValidationError('Reversal reference is invalid.');
  if (!actor.trim()) throw new JournalValidationError('Reversal actor is required.');
  return validateJournalEntry({
    reference: reversalReference,
    description: `Reversal of ${original.reference}: ${original.description}`,
    postedBy: actor,
    reversalOfReference: original.reference,
    lines: original.lines.map((line) => ({
      accountCode: line.accountCode,
      debit: line.credit,
      credit: line.debit,
      description: `Reversal: ${line.description}`,
    })),
  });
}
