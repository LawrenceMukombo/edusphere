export type ResultVersionStatus = 'DRAFT' | 'SUBMITTED' | 'MODERATED' | 'APPROVED' | 'PUBLISHED' | 'SUPERSEDED';

export interface ResultVersion {
  version: number;
  status: ResultVersionStatus;
  mark: string;
  grade: string;
  correctionReason?: string;
  correctedFromVersion?: number;
}

export class ResultCorrectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResultCorrectionError';
  }
}

function assertResultShape(mark: string, grade: string): void {
  if (!/^\d+(?:\.\d{1,2})?$/.test(mark)) throw new ResultCorrectionError('Result mark must be a non-negative value with at most two decimals.');
  if (!grade.trim() || grade.length > 20) throw new ResultCorrectionError('A result grade is required.');
}

/** Corrections are new versions; published records are never overwritten. */
export function createCorrectionVersion(
  current: ResultVersion,
  replacement: { mark: string; grade: string; reason: string },
): ResultVersion {
  if (current.status !== 'PUBLISHED') throw new ResultCorrectionError('Only a published result requires a correction version.');
  if (!replacement.reason.trim()) throw new ResultCorrectionError('A correction reason is required.');
  assertResultShape(replacement.mark, replacement.grade);
  if (replacement.mark === current.mark && replacement.grade === current.grade) {
    throw new ResultCorrectionError('Correction must change the mark or grade.');
  }
  return {
    version: current.version + 1,
    status: 'DRAFT',
    mark: replacement.mark,
    grade: replacement.grade,
    correctionReason: replacement.reason.trim(),
    correctedFromVersion: current.version,
  };
}

export function assertResultTransition(
  from: ResultVersionStatus,
  to: ResultVersionStatus,
  actor: 'LECTURER' | 'MODERATOR' | 'EXAM_BOARD',
): void {
  const permitted =
    (from === 'DRAFT' && to === 'SUBMITTED' && actor === 'LECTURER') ||
    (from === 'SUBMITTED' && to === 'MODERATED' && actor === 'MODERATOR') ||
    (from === 'MODERATED' && to === 'APPROVED' && actor === 'EXAM_BOARD') ||
    (from === 'APPROVED' && to === 'PUBLISHED' && actor === 'EXAM_BOARD') ||
    (from === 'PUBLISHED' && to === 'SUPERSEDED' && actor === 'EXAM_BOARD');
  if (!permitted) throw new ResultCorrectionError(`Result transition ${from} → ${to} is not permitted for ${actor}.`);
}
