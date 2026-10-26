import { describe, expect, it } from 'vitest';
import {
  AdmissionWorkflowError,
  admissionTransitionRequestSchema,
  transitionsFrom,
  validateAdmissionTransition,
} from '../src/server/admissions/workflow';

describe('NWUCHAS admissions workflow', () => {
  it('permits an applicant to submit only from draft', () => {
    const request = admissionTransitionRequestSchema.parse({ from: 'DRAFT', to: 'SUBMITTED' });
    expect(validateAdmissionTransition(request, 'APPLICANT').to).toBe('SUBMITTED');
  });

  it('requires an admissions committee decision before an offer', () => {
    const request = admissionTransitionRequestSchema.parse({ from: 'COMMITTEE_REVIEW', to: 'OFFERED' });
    expect(() => validateAdmissionTransition(request, 'ADMISSIONS_OFFICER')).toThrow(AdmissionWorkflowError);
    expect(validateAdmissionTransition(request, 'ADMISSIONS_COMMITTEE').to).toBe('OFFERED');
  });

  it('requires an auditable reason for rejection, waitlisting and offer expiry', () => {
    const rejected = admissionTransitionRequestSchema.parse({ from: 'COMMITTEE_REVIEW', to: 'REJECTED' });
    expect(() => validateAdmissionTransition(rejected, 'ADMISSIONS_COMMITTEE')).toThrow(/reason/i);
    expect(validateAdmissionTransition({ ...rejected, reason: 'Entry requirements not evidenced.' }, 'ADMISSIONS_COMMITTEE').to).toBe('REJECTED');
  });

  it('does not allow direct enrolment from an unreviewed application', () => {
    expect(() => validateAdmissionTransition({ from: 'SUBMITTED', to: 'ENROLLED' }, 'REGISTRAR')).toThrow(/not permitted/i);
  });

  it('reserves enrolment for the registrar after acceptance', () => {
    expect(transitionsFrom('ACCEPTED')).toHaveLength(2);
    expect(validateAdmissionTransition({ from: 'ACCEPTED', to: 'ENROLLED' }, 'REGISTRAR').to).toBe('ENROLLED');
  });
});
