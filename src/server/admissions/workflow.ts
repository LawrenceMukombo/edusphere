import { z } from 'zod';

/** Server-authoritative admission workflow; persistence is added only after the dedicated DB is ready. */
export const admissionStatuses = [
  'DRAFT',
  'SUBMITTED',
  'DOCUMENT_CHECK',
  'ELIGIBILITY_REVIEW',
  'INTERVIEW_PENDING',
  'COMMITTEE_REVIEW',
  'OFFERED',
  'WAITLISTED',
  'REJECTED',
  'ACCEPTED',
  'ENROLLED',
  'EXPIRED',
  'WITHDRAWN',
] as const;

export type AdmissionStatus = (typeof admissionStatuses)[number];
export type AdmissionActorRole =
  | 'APPLICANT'
  | 'ADMISSIONS_OFFICER'
  | 'ADMISSIONS_COMMITTEE'
  | 'REGISTRAR';

export interface AdmissionTransition {
  from: AdmissionStatus;
  to: AdmissionStatus;
  permittedRoles: readonly AdmissionActorRole[];
  reasonRequired?: boolean;
}

const transitions: readonly AdmissionTransition[] = [
  { from: 'DRAFT', to: 'SUBMITTED', permittedRoles: ['APPLICANT'] },
  { from: 'DRAFT', to: 'WITHDRAWN', permittedRoles: ['APPLICANT'], reasonRequired: true },
  { from: 'SUBMITTED', to: 'DOCUMENT_CHECK', permittedRoles: ['ADMISSIONS_OFFICER'] },
  { from: 'DOCUMENT_CHECK', to: 'SUBMITTED', permittedRoles: ['ADMISSIONS_OFFICER'] },
  { from: 'DOCUMENT_CHECK', to: 'ELIGIBILITY_REVIEW', permittedRoles: ['ADMISSIONS_OFFICER'] },
  { from: 'ELIGIBILITY_REVIEW', to: 'DOCUMENT_CHECK', permittedRoles: ['ADMISSIONS_OFFICER'] },
  { from: 'ELIGIBILITY_REVIEW', to: 'INTERVIEW_PENDING', permittedRoles: ['ADMISSIONS_OFFICER'] },
  { from: 'ELIGIBILITY_REVIEW', to: 'COMMITTEE_REVIEW', permittedRoles: ['ADMISSIONS_OFFICER'] },
  { from: 'INTERVIEW_PENDING', to: 'COMMITTEE_REVIEW', permittedRoles: ['ADMISSIONS_OFFICER'] },
  { from: 'COMMITTEE_REVIEW', to: 'ELIGIBILITY_REVIEW', permittedRoles: ['ADMISSIONS_OFFICER', 'ADMISSIONS_COMMITTEE'] },
  { from: 'COMMITTEE_REVIEW', to: 'OFFERED', permittedRoles: ['ADMISSIONS_COMMITTEE'] },
  { from: 'COMMITTEE_REVIEW', to: 'WAITLISTED', permittedRoles: ['ADMISSIONS_COMMITTEE'], reasonRequired: true },
  { from: 'COMMITTEE_REVIEW', to: 'REJECTED', permittedRoles: ['ADMISSIONS_COMMITTEE'], reasonRequired: true },
  { from: 'OFFERED', to: 'ACCEPTED', permittedRoles: ['APPLICANT'] },
  { from: 'OFFERED', to: 'ENROLLED', permittedRoles: ['REGISTRAR'] },
  { from: 'OFFERED', to: 'EXPIRED', permittedRoles: ['ADMISSIONS_OFFICER'], reasonRequired: true },
  { from: 'OFFERED', to: 'COMMITTEE_REVIEW', permittedRoles: ['ADMISSIONS_COMMITTEE'], reasonRequired: true },
  { from: 'ENROLLED', to: 'OFFERED', permittedRoles: ['REGISTRAR'], reasonRequired: true },
  { from: 'WAITLISTED', to: 'OFFERED', permittedRoles: ['ADMISSIONS_COMMITTEE'], reasonRequired: true },
  { from: 'WAITLISTED', to: 'COMMITTEE_REVIEW', permittedRoles: ['ADMISSIONS_COMMITTEE'], reasonRequired: true },
  { from: 'WAITLISTED', to: 'WITHDRAWN', permittedRoles: ['APPLICANT'], reasonRequired: true },
  { from: 'REJECTED', to: 'COMMITTEE_REVIEW', permittedRoles: ['ADMISSIONS_COMMITTEE'], reasonRequired: true },
  { from: 'ACCEPTED', to: 'ENROLLED', permittedRoles: ['REGISTRAR'] },
  { from: 'ACCEPTED', to: 'WITHDRAWN', permittedRoles: ['APPLICANT'], reasonRequired: true },
];

export const admissionTransitionRequestSchema = z.object({
  from: z.enum(admissionStatuses),
  to: z.enum(admissionStatuses),
  reason: z.string().trim().max(2000).optional(),
});

export class AdmissionWorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdmissionWorkflowError';
  }
}

export function findAdmissionTransition(
  from: AdmissionStatus,
  to: AdmissionStatus,
): AdmissionTransition | undefined {
  return transitions.find((item) => item.from === from && item.to === to);
}

export function validateAdmissionTransition(
  input: z.infer<typeof admissionTransitionRequestSchema>,
  actorRole: AdmissionActorRole,
): AdmissionTransition {
  const transition = transitions.find((item) => item.from === input.from && item.to === input.to);
  if (!transition) {
    throw new AdmissionWorkflowError(`Transition ${input.from} → ${input.to} is not permitted.`);
  }
  if (!transition.permittedRoles.includes(actorRole)) {
    throw new AdmissionWorkflowError(`${actorRole} cannot perform ${input.from} → ${input.to}.`);
  }
  if (transition.reasonRequired && !input.reason?.trim()) {
    throw new AdmissionWorkflowError(`A reason is required for ${input.from} → ${input.to}.`);
  }
  return transition;
}

export function transitionsFrom(status: AdmissionStatus): readonly AdmissionTransition[] {
  return transitions.filter((transition) => transition.from === status);
}
