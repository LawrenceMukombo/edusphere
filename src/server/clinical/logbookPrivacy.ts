import { z } from 'zod';

export const clinicalCaseCategories = [
  'GENERAL_MEDICAL',
  'MATERNAL_NEWBORN',
  'PAEDIATRIC',
  'SURGICAL',
  'MENTAL_HEALTH',
  'COMMUNITY_HEALTH',
  'EMERGENCY_CARE',
  'DIAGNOSTIC_SUPPORT',
] as const;

export type ClinicalLogbookStatus = 'DRAFT' | 'SUBMITTED' | 'SUPERVISOR_VALIDATED' | 'RETURNED';

/** Deliberately excludes patient identity, record number, dates of birth and case narrative fields. */
export const deidentifiedLogbookEntrySchema = z.object({
  placementId: z.string().uuid(),
  caseCategory: z.enum(clinicalCaseCategories),
  competencyCode: z.string().trim().min(2).max(80).regex(/^[A-Z0-9._-]+$/),
  activityCode: z.string().trim().min(2).max(80).regex(/^[A-Z0-9._-]+$/),
  hoursCompleted: z.number().positive().max(24),
  reflection: z.string().trim().max(500).optional(),
});

export class ClinicalPrivacyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClinicalPrivacyError';
  }
}

const identifierIndicators = [
  /\b(patient|client)\s*(name|id|number|no\.?|record)\b/i,
  /\b(mrn|medical\s*record|hospital\s*number|nrc|passport)\b/i,
  /\b(date\s*of\s*birth|dob)\b/i,
  /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i,
  /\b(?:\+?260|0)\d{9}\b/,
];

export function assertNoPatientIdentifiers(reflection?: string): void {
  if (!reflection) return;
  if (identifierIndicators.some((pattern) => pattern.test(reflection))) {
    throw new ClinicalPrivacyError('Clinical logbook entries must be de-identified and cannot contain patient identifiers.');
  }
}

export function validateDeidentifiedLogbookEntry(input: unknown) {
  const parsed = deidentifiedLogbookEntrySchema.safeParse(input);
  if (!parsed.success) throw new ClinicalPrivacyError('Invalid de-identified clinical logbook entry.');
  assertNoPatientIdentifiers(parsed.data.reflection);
  return parsed.data;
}

export function assertClinicalLogbookTransition(
  from: ClinicalLogbookStatus,
  to: ClinicalLogbookStatus,
  actor: 'STUDENT' | 'SUPERVISOR',
): void {
  const permitted =
    (from === 'DRAFT' && to === 'SUBMITTED' && actor === 'STUDENT') ||
    (from === 'SUBMITTED' && to === 'SUPERVISOR_VALIDATED' && actor === 'SUPERVISOR') ||
    (from === 'SUBMITTED' && to === 'RETURNED' && actor === 'SUPERVISOR') ||
    (from === 'RETURNED' && to === 'SUBMITTED' && actor === 'STUDENT');
  if (!permitted) throw new ClinicalPrivacyError(`Clinical logbook transition ${from} → ${to} is not permitted for ${actor}.`);
}
