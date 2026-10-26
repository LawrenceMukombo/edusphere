import { describe, expect, it } from 'vitest';
import {
  assertClinicalLogbookTransition,
  ClinicalPrivacyError,
  validateDeidentifiedLogbookEntry,
} from '../src/server/clinical/logbookPrivacy';

const entry = {
  placementId: 'f12fa669-dc7c-4b5d-832e-c2e159a9081e',
  caseCategory: 'MATERNAL_NEWBORN',
  competencyCode: 'MW.COMPETENCY.01',
  activityCode: 'OBSERVATION',
  hoursCompleted: 6,
  reflection: 'Observed the approved competency under supervisor guidance.',
};

describe('clinical logbook de-identification', () => {
  it('accepts category-based entries without patient data', () => {
    expect(validateDeidentifiedLogbookEntry(entry).caseCategory).toBe('MATERNAL_NEWBORN');
  });

  it('rejects patient identity and direct-contact indicators', () => {
    expect(() => validateDeidentifiedLogbookEntry({ ...entry, reflection: 'Patient name was Mary Banda.' })).toThrow(ClinicalPrivacyError);
    expect(() => validateDeidentifiedLogbookEntry({ ...entry, reflection: 'Contact: +260971234567.' })).toThrow(ClinicalPrivacyError);
    expect(validateDeidentifiedLogbookEntry({ ...entry, patientName: 'Not permitted' } as typeof entry & { patientName: string })).not.toHaveProperty('patientName');
  });

  it('requires supervisor validation before an entry is complete', () => {
    expect(() => assertClinicalLogbookTransition('SUBMITTED', 'SUPERVISOR_VALIDATED', 'STUDENT')).toThrow(/not permitted/i);
    expect(() => assertClinicalLogbookTransition('SUBMITTED', 'SUPERVISOR_VALIDATED', 'SUPERVISOR')).not.toThrow();
  });
});
