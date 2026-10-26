import { describe, expect, it } from 'vitest';
import {
  assertResultTransition,
  createCorrectionVersion,
  ResultCorrectionError,
  type ResultVersion,
} from '../src/server/academics/resultCorrections';

const published: ResultVersion = { version: 1, status: 'PUBLISHED', mark: '49.00', grade: 'FAIL' };

describe('versioned result correction workflow', () => {
  it('creates a new draft version rather than mutating the published result', () => {
    const correction = createCorrectionVersion(published, { mark: '50.00', grade: 'PASS', reason: 'Moderation arithmetic correction.' });
    expect(correction).toMatchObject({ version: 2, status: 'DRAFT', correctedFromVersion: 1, grade: 'PASS' });
    expect(published.grade).toBe('FAIL');
  });

  it('rejects no-op and unaudited corrections', () => {
    expect(() => createCorrectionVersion(published, { mark: '49.00', grade: 'FAIL', reason: 'No change' })).toThrow(/change/i);
    expect(() => createCorrectionVersion(published, { mark: '50.00', grade: 'PASS', reason: '' })).toThrow(/reason/i);
  });

  it('requires moderation and exam-board approval before publication', () => {
    expect(() => assertResultTransition('SUBMITTED', 'PUBLISHED', 'LECTURER')).toThrow(ResultCorrectionError);
    expect(() => assertResultTransition('SUBMITTED', 'MODERATED', 'MODERATOR')).not.toThrow();
    expect(() => assertResultTransition('MODERATED', 'APPROVED', 'EXAM_BOARD')).not.toThrow();
  });
});
