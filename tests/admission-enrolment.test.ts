import { describe, expect, it } from 'vitest';
import { buildStudentNumber } from '../src/server/admissions/enrolment';

describe('admission enrolment helpers', () => {
  it('derives a stable NWUCHAS student number from the application reference', () => {
    expect(buildStudentNumber('NWU-APP-2026-004281', 2026)).toBe('NWU-2026-004281');
  });
});
