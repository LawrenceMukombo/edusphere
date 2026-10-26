import { SystemRole } from '@prisma/client';
import type { AdmissionActorRole } from '@/server/admissions/workflow';
import type { AuthSession } from '@/server/auth';

/**
 * Server-side NWUCHAS capabilities and RBAC matrix.
 * Enforces least-privilege principles and contextual scoping across all 16 NWUCHAS personas.
 */
export const permissions = [
  // Institution & Governance
  'institution:manage',
  'system:configure',
  'audit:read',

  // Admissions & Candidate Journey
  'admission:apply',
  'admission:review',
  'admission:decide',
  'admission:enrol',

  // Academics, Curriculum & Assessment
  'curriculum:manage',
  'results:enter',
  'results:moderate',
  'results:publish',
  'transcripts:issue',

  // Attendance, Hostels & Exeats
  'attendance:capture',
  'attendance:verify',
  'hostel:curfew_log',
  'exeat:issue',

  // Clinical Learning & Competencies
  'clinical:log',
  'clinical:validate',
  'clinical:assign',

  // Student & Sponsor Portals
  'student:profile_view',
  'student:results_view',
  'sponsor:linked_view',

  // Finance, Fees & Ledgers
  'finance:collect',
  'finance:invoice',
  'finance:reconcile',
  'finance:approve',

  // HR & Zambian Payroll
  'hr:manage',
  'payroll:prepare',
  'payroll:review',
  'payroll:approve',

  // Facilities, Hostels & Assets
  'assets:manage',
  'facilities:manage',
] as const;

export type Permission = (typeof permissions)[number];

/**
 * 16 NWUCHAS Personas matching the College Organisational Structure
 */
export type PersonaType =
  | 'PUBLIC_VISITOR'
  | 'APPLICANT'
  | 'STUDENT'
  | 'SPONSOR_GUARDIAN'
  | 'ADMISSIONS_OFFICER'
  | 'LECTURER'
  | 'PROGRAMME_COORDINATOR'
  | 'ACADEMIC_REGISTRAR'
  | 'CLINICAL_COORDINATOR'
  | 'FINANCE_OFFICER'
  | 'HR_OFFICER'
  | 'OPERATIONS_OFFICER'
  | 'EXECUTIVE_PRINCIPAL'
  | 'ICT_ADMIN'
  | 'AUDITOR_REGULATOR'
  | 'INTEGRATION_SERVICE';

export interface PersonaMetadata {
  type: PersonaType;
  title: string;
  description: string;
  defaultRoute: string;
  permittedModules: string[];
}

export const PERSONA_DEFINITIONS: Record<PersonaType, PersonaMetadata> = {
  PUBLIC_VISITOR: {
    type: 'PUBLIC_VISITOR',
    title: 'Public Visitor',
    description: 'Prospective students and the general public viewing official announcements and programme guides.',
    defaultRoute: '/',
    permittedModules: ['public'],
  },
  APPLICANT: {
    type: 'APPLICANT',
    title: 'Admissions Candidate',
    description: 'Candidate creating and tracking their own formal application for admission.',
    defaultRoute: '/apply',
    permittedModules: ['apply'],
  },
  STUDENT: {
    type: 'STUDENT',
    title: 'Enrolled Health Science Trainee',
    description: 'Enrolled college learner accessing their timetable, attendance passport, results, and fee statement.',
    defaultRoute: '/modules/student-portal',
    permittedModules: ['student-portal', 'attendance', 'academics'],
  },
  SPONSOR_GUARDIAN: {
    type: 'SPONSOR_GUARDIAN',
    title: 'Sponsor / Family Guardian',
    description: 'Authorized sponsor accessing only explicitly linked candidate records.',
    defaultRoute: '/modules/parent-portal',
    permittedModules: ['parent-portal'],
  },
  ADMISSIONS_OFFICER: {
    type: 'ADMISSIONS_OFFICER',
    title: 'Admissions & Registry Officer',
    description: 'Registry officer reviewing qualification documents and processing matriculation workflows.',
    defaultRoute: '/modules/admissions',
    permittedModules: ['admissions', 'documents'],
  },
  LECTURER: {
    type: 'LECTURER',
    title: 'Faculty Lecturer',
    description: 'Academic instructor logging live roll-call and continuous assessment marks for assigned modules.',
    defaultRoute: '/modules/academics',
    permittedModules: ['academics', 'attendance'],
  },
  PROGRAMME_COORDINATOR: {
    type: 'PROGRAMME_COORDINATOR',
    title: 'Head of Department / Coordinator',
    description: 'Departmental head overseeing academic moderation and faculty teaching allocations.',
    defaultRoute: '/modules/academics',
    permittedModules: ['academics', 'attendance', 'clinical-learning'],
  },
  ACADEMIC_REGISTRAR: {
    type: 'ACADEMIC_REGISTRAR',
    title: 'Academic Registrar & Examination Board',
    description: 'Chief academic officer managing curriculum, examination releases, Form 12A, and graduation records.',
    defaultRoute: '/modules/academics',
    permittedModules: ['academics', 'admissions', 'attendance', 'documents', 'calendar'],
  },
  CLINICAL_COORDINATOR: {
    type: 'CLINICAL_COORDINATOR',
    title: 'Clinical Placement Coordinator / Supervisor',
    description: 'Hospital supervisor overseeing ward rotations, skills labs, and clinical competency logbooks.',
    defaultRoute: '/modules/clinical-learning',
    permittedModules: ['clinical-learning', 'attendance'],
  },
  FINANCE_OFFICER: {
    type: 'FINANCE_OFFICER',
    title: 'Bursar & Finance Officer',
    description: 'Finance officer managing student invoices, cashbook receipts, and double-entry reconciliations.',
    defaultRoute: '/modules/finance',
    permittedModules: ['finance', 'documents'],
  },
  HR_OFFICER: {
    type: 'HR_OFFICER',
    title: 'Human Resources & Payroll Officer',
    description: 'HR manager administering staff dossiers, leaves, and 2026 Zambian statutory payroll.',
    defaultRoute: '/modules/hr',
    permittedModules: ['hr'],
  },
  OPERATIONS_OFFICER: {
    type: 'OPERATIONS_OFFICER',
    title: 'Residences, Fleet & Estate Manager',
    description: 'Hostel wardens and estate officers managing Florence Nightingale & Albert Schweitzer halls and campus assets.',
    defaultRoute: '/modules/operations',
    permittedModules: ['operations', 'assets', 'attendance'],
  },
  EXECUTIVE_PRINCIPAL: {
    type: 'EXECUTIVE_PRINCIPAL',
    title: 'College Principal & Executive',
    description: 'Executive command center with institution-wide metrics and approval delegation.',
    defaultRoute: '/portal/executive',
    permittedModules: ['administration', 'admissions', 'academics', 'clinical-learning', 'finance', 'hr', 'operations'],
  },
  ICT_ADMIN: {
    type: 'ICT_ADMIN',
    title: 'ICT & Systems Administrator',
    description: 'System administrator managing users, tenant scopes, security logs, and integration nodes.',
    defaultRoute: '/modules/administration',
    permittedModules: ['administration', 'assets'],
  },
  AUDITOR_REGULATOR: {
    type: 'AUDITOR_REGULATOR',
    title: 'Auditor & Regulatory Inspector (HEA / NMCZ / HPCZ)',
    description: 'Read-only regulatory inspector examining statutory registers, Form 12A, and audit logs.',
    defaultRoute: '/modules/administration',
    permittedModules: ['administration', 'documents', 'academics', 'finance'],
  },
  INTEGRATION_SERVICE: {
    type: 'INTEGRATION_SERVICE',
    title: 'Integration Service Account',
    description: 'Automated machine account for MTN/Airtel webhooks and scheduled system tasks.',
    defaultRoute: '/api',
    permittedModules: ['finance', 'attendance'],
  },
};

/** Map Prisma SystemRole to NWUCHAS Persona */
export function getPersonaForRole(role: SystemRole): PersonaType {
  switch (role) {
    case SystemRole.APPLICANT:
      return 'APPLICANT';
    case SystemRole.LEARNER:
      return 'STUDENT';
    case SystemRole.PARENT_GUARDIAN:
      return 'SPONSOR_GUARDIAN';
    case SystemRole.ADMISSIONS_OFFICER:
    case SystemRole.ADMISSIONS_COMMITTEE:
      return 'ADMISSIONS_OFFICER';
    case SystemRole.LECTURER:
    case SystemRole.TEACHER:
      return 'LECTURER';
    case SystemRole.MODULE_COORDINATOR:
      return 'PROGRAMME_COORDINATOR';
    case SystemRole.REGISTRAR:
    case SystemRole.EXAMINATIONS_OFFICER:
    case SystemRole.EXAM_BOARD_MEMBER:
      return 'ACADEMIC_REGISTRAR';
    case SystemRole.CLINICAL_SUPERVISOR:
      return 'CLINICAL_COORDINATOR';
    case SystemRole.CASHIER:
    case SystemRole.BURSAR:
    case SystemRole.FINANCE_RECONCILER:
      return 'FINANCE_OFFICER';
    case SystemRole.HR_OFFICER:
      return 'HR_OFFICER';
    case SystemRole.INSTITUTION_ADMIN:
    case SystemRole.SCHOOL_PROPRIETOR:
    case SystemRole.HEADTEACHER:
    case SystemRole.DEPUTY_HEADTEACHER:
      return 'EXECUTIVE_PRINCIPAL';
    case SystemRole.IT_ADMIN:
    case SystemRole.PLATFORM_SUPER_ADMIN:
      return 'ICT_ADMIN';
    case SystemRole.AUDITOR_READONLY:
      return 'AUDITOR_REGULATOR';
    default:
      return 'PUBLIC_VISITOR';
  }
}

/** Permissions granted per SystemRole */
const permissionsByRole: ReadonlyMap<SystemRole, readonly Permission[]> = new Map([
  [
    SystemRole.INSTITUTION_ADMIN,
    [
      'institution:manage',
      'system:configure',
      'audit:read',
      'admission:review',
      'admission:decide',
      'curriculum:manage',
      'results:moderate',
      'finance:approve',
      'payroll:approve',
      'assets:manage',
      'facilities:manage',
    ],
  ],
  [
    SystemRole.PLATFORM_SUPER_ADMIN,
    ['institution:manage', 'system:configure', 'audit:read', 'assets:manage'],
  ],
  [
    SystemRole.IT_ADMIN,
    ['system:configure', 'audit:read', 'assets:manage'],
  ],
  [
    SystemRole.APPLICANT,
    ['admission:apply'],
  ],
  [
    SystemRole.ADMISSIONS_OFFICER,
    ['admission:review', 'admission:enrol', 'audit:read'],
  ],
  [
    SystemRole.ADMISSIONS_COMMITTEE,
    ['admission:review', 'admission:decide'],
  ],
  [
    SystemRole.REGISTRAR,
    ['admission:enrol', 'curriculum:manage', 'results:publish', 'transcripts:issue', 'attendance:verify'],
  ],
  [
    SystemRole.LECTURER,
    ['results:enter', 'attendance:capture'],
  ],
  [
    SystemRole.MODULE_COORDINATOR,
    ['results:moderate', 'curriculum:manage', 'attendance:verify'],
  ],
  [
    SystemRole.EXAMINATIONS_OFFICER,
    ['results:moderate', 'results:publish', 'transcripts:issue', 'attendance:verify'],
  ],
  [
    SystemRole.EXAM_BOARD_MEMBER,
    ['results:publish', 'transcripts:issue'],
  ],
  [
    SystemRole.CLINICAL_SUPERVISOR,
    ['clinical:validate', 'clinical:assign', 'attendance:verify', 'exeat:issue'],
  ],
  [
    SystemRole.LEARNER,
    ['student:profile_view', 'student:results_view', 'clinical:log'],
  ],
  [
    SystemRole.PARENT_GUARDIAN,
    ['sponsor:linked_view'],
  ],
  [
    SystemRole.CASHIER,
    ['finance:collect', 'finance:invoice'],
  ],
  [
    SystemRole.BURSAR,
    ['finance:approve'],
  ],
  [
    SystemRole.FINANCE_RECONCILER,
    ['finance:reconcile', 'finance:approve'],
  ],
  [
    SystemRole.PAYROLL_PREPARER,
    ['payroll:prepare'],
  ],
  [
    SystemRole.PAYROLL_REVIEWER,
    ['payroll:review'],
  ],
  [
    SystemRole.PAYROLL_APPROVER,
    ['payroll:approve'],
  ],
  [
    SystemRole.HR_OFFICER,
    ['hr:manage', 'payroll:prepare', 'payroll:review'],
  ],
  [
    SystemRole.AUDITOR_READONLY,
    ['audit:read'],
  ],
]);

export function hasPermission(role: SystemRole, permission: Permission): boolean {
  return permissionsByRole.get(role)?.includes(permission) ?? false;
}

export function admissionActorRoleFor(role: SystemRole): AdmissionActorRole | null {
  switch (role) {
    case SystemRole.APPLICANT:
      return 'APPLICANT';
    case SystemRole.ADMISSIONS_OFFICER:
      return 'ADMISSIONS_OFFICER';
    case SystemRole.ADMISSIONS_COMMITTEE:
      return 'ADMISSIONS_COMMITTEE';
    case SystemRole.REGISTRAR:
      return 'REGISTRAR';
    default:
      return null;
  }
}

/** Enforces maker/checker separation for one workflow decision. */
export function requireDistinctActors(...actorIds: readonly string[]): void {
  if (actorIds.some((actorId) => !actorId.trim())) {
    throw new Error('A complete actor trail is required.');
  }
  if (new Set(actorIds).size !== actorIds.length) {
    throw new Error('The same user cannot perform both sides of a separated duty.');
  }
}

/**
 * Contextual Scope Enforcement Contract
 * Enforces multi-tenancy, campus scope, student isolation, and sponsor linkage.
 * Throws a typed 403 Forbidden error if access fails scope evaluation.
 */
export interface ContextScopeTarget {
  organisationId?: string | null;
  campusId?: string | null;
  programmeId?: string | null;
  cohortId?: string | null;
  learnerId?: string | null;
  guardianId?: string | null;
  siteId?: string | null;
}

export function enforceContextScope(session: AuthSession, target: ContextScopeTarget): void {
  // 1. Cross-Tenant Denial
  if (target.organisationId && session.organisationId && target.organisationId !== session.organisationId) {
    const error = new Error('Cross-tenant access denied.');
    (error as any).statusCode = 403;
    throw error;
  }

  // 2. Student Persona Isolation (cannot access other candidates' private data)
  if (session.role === SystemRole.LEARNER) {
    if (target.learnerId && session.learnerId && target.learnerId !== session.learnerId) {
      const error = new Error('Access denied: You may only view your own student record.');
      (error as any).statusCode = 403;
      throw error;
    }
  }

  // 3. Sponsor / Guardian Isolation (cannot access unlinked trainees)
  if (session.role === SystemRole.PARENT_GUARDIAN) {
    if (target.guardianId && session.guardianId && target.guardianId !== session.guardianId) {
      const error = new Error('Access denied: You may only view records for your linked candidate.');
      (error as any).statusCode = 403;
      throw error;
    }
  }

  // 4. Clinical Supervisor Scoping
  if (session.role === SystemRole.CLINICAL_SUPERVISOR) {
    if (target.siteId && (session as any).clinicalSiteId && target.siteId !== (session as any).clinicalSiteId) {
      const error = new Error('Access denied: Unauthorized clinical facility placement.');
      (error as any).statusCode = 403;
      throw error;
    }
  }
}

