/**
 * Approval-gated statutory calculation primitives. Values are supplied only by
 * a reviewed rule version; this module intentionally contains no tax rates.
 */
export type ApprovalState = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'RETIRED';

export interface ProgressiveBand {
  /** Inclusive upper bound in ZMW. Null represents the final unbounded band. */
  upperBound: string | null;
  /** Basis points, e.g. 1250 means 12.50%. */
  rateBasisPoints: number;
}

export interface StatutoryRuleVersion {
  authority: string;
  obligation: string;
  jurisdiction: string;
  sourceUrl: string;
  effectiveFrom: string;
  effectiveTo?: string;
  approvalState: ApprovalState;
  approvedBy?: string;
  approvedAt?: string;
  version: string;
  progressiveBands: ProgressiveBand[];
}

export class StatutoryRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StatutoryRuleError';
  }
}

const MONEY_PATTERN = /^\d+(?:\.\d{1,2})?$/;

/** Converts non-negative ZMW strings to exact ngwee values. */
export function moneyToNgwee(value: string): bigint {
  if (!MONEY_PATTERN.test(value)) throw new StatutoryRuleError('Money values must be non-negative values with at most two decimals.');
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 100n + BigInt((fraction + '00').slice(0, 2));
}

export function ngweeToMoney(value: bigint): string {
  if (value < 0n) throw new StatutoryRuleError('Money values cannot be negative.');
  return `${value / 100n}.${(value % 100n).toString().padStart(2, '0')}`;
}

function roundedPercentage(amount: bigint, basisPoints: number): bigint {
  if (!Number.isInteger(basisPoints) || basisPoints < 0 || basisPoints > 10_000) {
    throw new StatutoryRuleError('Rate basis points must be an integer from 0 to 10000.');
  }
  // Half-up rounding to ngwee; divisor is 100% expressed as basis points.
  return (amount * BigInt(basisPoints) + 5_000n) / 10_000n;
}

export function validateRuleVersion(rule: StatutoryRuleVersion): void {
  if (!rule.authority || !rule.obligation || !rule.jurisdiction || !rule.version) {
    throw new StatutoryRuleError('Authority, obligation, jurisdiction and version are required.');
  }
  try {
    const source = new URL(rule.sourceUrl);
    if (source.protocol !== 'https:') throw new Error('not https');
  } catch {
    throw new StatutoryRuleError('A valid HTTPS source URL is required.');
  }
  if (Number.isNaN(Date.parse(rule.effectiveFrom))) throw new StatutoryRuleError('effectiveFrom must be a valid ISO date.');
  if (rule.effectiveTo && Date.parse(rule.effectiveTo) < Date.parse(rule.effectiveFrom)) {
    throw new StatutoryRuleError('effectiveTo cannot precede effectiveFrom.');
  }
  if (rule.approvalState === 'APPROVED' && (!rule.approvedBy || !rule.approvedAt)) {
    throw new StatutoryRuleError('Approved rules require approver identity and timestamp.');
  }
  let previousBound = 0n;
  rule.progressiveBands.forEach((band, index) => {
    if (band.upperBound === null && index !== rule.progressiveBands.length - 1) {
      throw new StatutoryRuleError('Only the final progressive band may be unbounded.');
    }
    if (band.upperBound !== null) {
      const upper = moneyToNgwee(band.upperBound);
      if (upper <= previousBound) throw new StatutoryRuleError('Progressive band limits must increase.');
      previousBound = upper;
    }
    roundedPercentage(0n, band.rateBasisPoints);
  });
}

export function assertRuleIsEffectiveAndApproved(rule: StatutoryRuleVersion, onDate: string): void {
  validateRuleVersion(rule);
  if (rule.approvalState !== 'APPROVED') throw new StatutoryRuleError('Only approved rule versions can be used for payroll.');
  const target = Date.parse(onDate);
  if (Number.isNaN(target)) throw new StatutoryRuleError('Calculation date must be valid.');
  if (target < Date.parse(rule.effectiveFrom) || (rule.effectiveTo && target > Date.parse(rule.effectiveTo))) {
    throw new StatutoryRuleError('Rule version is not effective on the calculation date.');
  }
}

/** Calculates progressive liability using exact ngwee arithmetic and explicit half-up rounding. */
export function calculateProgressiveLiability(
  chargeableEarnings: string,
  rule: StatutoryRuleVersion,
  calculationDate: string,
): { liability: string; appliedRuleVersion: string } {
  assertRuleIsEffectiveAndApproved(rule, calculationDate);
  let remaining = moneyToNgwee(chargeableEarnings);
  let lower = 0n;
  let liability = 0n;

  for (const band of rule.progressiveBands) {
    const upper = band.upperBound === null ? null : moneyToNgwee(band.upperBound);
    const width = upper === null ? remaining : upper - lower;
    const taxableInBand = remaining < width ? remaining : width;
    liability += roundedPercentage(taxableInBand, band.rateBasisPoints);
    remaining -= taxableInBand;
    if (remaining === 0n) break;
    if (upper !== null) lower = upper;
  }
  if (remaining > 0n) throw new StatutoryRuleError('Approved progressive rule has no terminal band.');
  return { liability: ngweeToMoney(liability), appliedRuleVersion: rule.version };
}
