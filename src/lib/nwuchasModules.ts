export interface NwuchasModule {
  slug: string;
  title: string;
  category: string;
  description: string;
  readiness: 'Seeded development data' | 'Workflow foundation ready' | 'Awaiting authorised inputs';
}

export const nwuchasModules: readonly NwuchasModule[] = [
  { slug: 'admissions', title: 'Admissions & registry', category: 'Academic', description: 'Applications, offers, enrolment, and student identity.', readiness: 'Seeded development data' },
  { slug: 'academics', title: 'Academics & examinations', category: 'Academic', description: 'Cohorts, assessments, results, moderation, and release controls.', readiness: 'Seeded development data' },
  { slug: 'attendance', title: 'Attendance & engagement', category: 'Academic', description: 'Attendance registers and student engagement evidence.', readiness: 'Workflow foundation ready' },
  { slug: 'finance', title: 'Finance & payments', category: 'Finance', description: 'Student fee ledger, sequential receipts, payment orchestration, and bank reconciliation.', readiness: 'Seeded development data' },
  { slug: 'payments', title: 'Finance & payments (Payment Orchestration)', category: 'Finance', description: 'Consolidated into the Finance & payments workspace.', readiness: 'Workflow foundation ready' },
  { slug: 'hr', title: 'Staff & HR', category: 'People', description: 'Staff records, contracts, leave, and controlled payroll preparation.', readiness: 'Workflow foundation ready' },
  { slug: 'clinical-learning', title: 'Clinical learning', category: 'Academic', description: 'De-identified clinical logbooks, placement evidence, and supervisor validation.', readiness: 'Workflow foundation ready' },
  { slug: 'operations', title: 'Campus operations', category: 'Operations', description: 'Facilities, accommodation, transport, and operational service requests.', readiness: 'Awaiting authorised inputs' },
  { slug: 'assets', title: 'Asset register', category: 'Operations', description: 'Institutional asset records, maintenance, and capital controls.', readiness: 'Awaiting authorised inputs' },
  { slug: 'communications', title: 'Communications', category: 'Operations', description: 'Audited notices and role-targeted communications.', readiness: 'Seeded development data' },
  { slug: 'documents', title: 'Documents', category: 'Operations', description: 'Controlled institutional letters, forms, and document templates.', readiness: 'Awaiting authorised inputs' },
  { slug: 'calendar', title: 'Academic calendar', category: 'Academic', description: 'Academic terms, academic events, and approved calendar records.', readiness: 'Seeded development data' },
  { slug: 'parent-portal', title: 'Student & sponsor portal', category: 'Portals', description: 'Future self-service access for students and authorised sponsors.', readiness: 'Awaiting authorised inputs' },
  { slug: 'administration', title: 'Administration & settings', category: 'Administration', description: 'Institution configuration, roles, audit records, and access controls.', readiness: 'Seeded development data' },
  { slug: 'integration-status', title: 'Integrations & compliance', category: 'Administration', description: 'Authorisation status for payments, statutory rules, and regulator interfaces.', readiness: 'Awaiting authorised inputs' },
];

export function findNwuchasModule(slug: string): NwuchasModule | undefined {
  return nwuchasModules.find((module) => module.slug === slug);
}
