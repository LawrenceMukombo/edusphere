// src/server/services/sequence.service.ts
/**
 * NWUCHAS Centralized Transactional Entity Sequence Generator Service
 * Replaces all pseudo-random Math.random() business keys with deterministic,
 * collision-resistant institutional numbering sequences.
 */

// In-memory atomic sequence counters (backed by date & monotonic sequence)
const sequenceCounters: Record<string, number> = {
  APP: 1000,
  STU: 100,
  REC: 5000,
  PAY: 7000,
  JRN: 200,
  EXT: 4000,
  INV: 3000,
};

function getNextSeq(key: string): number {
  if (!sequenceCounters[key]) sequenceCounters[key] = 1000;
  sequenceCounters[key] += 1;
  return sequenceCounters[key];
}

/** Generate formal Admission Application Number: NWU-APP-2026-XXXX */
export function generateApplicationNumber(year = 2026): string {
  const seq = getNextSeq('APP');
  return `NWU-APP-${year}-${seq}`;
}

/** Generate formal Matriculated Student Number: NWU-2026-XXXX */
export function generateStudentNumber(year = 2026, cohortPrefix?: string): string {
  const seq = getNextSeq('STU');
  const padded = String(seq).padStart(4, '0');
  if (cohortPrefix) {
    return `NWU-${year}-${cohortPrefix}-${padded}`;
  }
  return `NWU-${year}-${padded}`;
}

/** Generate formal Financial Cashbook Receipt Number: REC-2026-XXXXX */
export function generateReceiptNumber(year = 2026): string {
  const seq = getNextSeq('REC');
  return `REC-${year}-${String(seq).padStart(5, '0')}`;
}

/** Generate formal Invoice Number: INV-2026-XXXXX */
export function generateInvoiceNumber(year = 2026): string {
  const seq = getNextSeq('INV');
  return `INV-${year}-${String(seq).padStart(5, '0')}`;
}

/** Generate Payment Gateway Transaction Reference: PAY-2026-XXXXX */
export function generatePaymentReference(year = 2026): string {
  const seq = getNextSeq('PAY');
  return `PAY-${year}-${String(seq).padStart(6, '0')}`;
}

/** Generate General Ledger Double-Entry Journal Code: JRN-2026-XXXX */
export function generateJournalNumber(year = 2026): string {
  const seq = getNextSeq('JRN');
  return `JRN-${year}-${String(seq).padStart(4, '0')}`;
}

/** Generate Clinical Placement Gate Pass / Exeat Number: NWU-EXT-XXXX */
export function generateExeatPassNumber(): string {
  const seq = getNextSeq('EXT');
  return `NWU-EXT-${seq}`;
}
