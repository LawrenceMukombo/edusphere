export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'LOCKED' | 'PASSWORD_RESET_REQUIRED';
export type MfaStatus = 'ENFORCED' | 'PENDING' | 'EXEMPT';

export interface ModulePermissionSet {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
}

export interface UserModulePermissions {
  admissions: ModulePermissionSet;
  academics: ModulePermissionSet;
  attendance: ModulePermissionSet;
  clinicals: ModulePermissionSet;
  finance: ModulePermissionSet;
  payroll: ModulePermissionSet;
  operations: ModulePermissionSet;
  documents: ModulePermissionSet;
  administration: ModulePermissionSet;
}

export interface AdminUserRecord {
  id: string;
  staffNumber?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: string;
  roleTitle?: string;
  jobTitle?: string;
  department: string;
  campus: string;
  mfaStatus: MfaStatus;
  mfaMethod?: string;
  lastLogin: string;
  lastLoginIp?: string;
  status: UserStatus;
  sessionExpiry?: string;
  notes?: string;
  permissions?: UserModulePermissions;
}

export const DEFAULT_PERMISSIONS: UserModulePermissions = {
  admissions: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
  academics: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
  attendance: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
  clinicals: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
  finance: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
  payroll: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
  operations: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
  documents: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
  administration: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
};

export const ROLE_PRESETS: Record<
  string,
  { label: string; desc: string; dept: string; perms: UserModulePermissions }
> = {
  INSTITUTION_ADMIN: {
    label: 'Principal & Executive (CEO)',
    desc: 'Institution-wide executive governance, full read/write, budget & policy sign-off.',
    dept: 'Executive Directorate',
    perms: {
      admissions: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      academics: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      attendance: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      clinicals: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      finance: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      payroll: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      operations: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      documents: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      administration: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
    },
  },
  REGISTRAR: {
    label: 'Academic Registrar & Board',
    desc: 'Admissions, candidate offers, examination council submissions, and student identity.',
    dept: 'Academic Affairs & Registry',
    perms: {
      admissions: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      academics: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      attendance: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      clinicals: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      finance: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      payroll: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      operations: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      documents: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      administration: { view: true, create: false, edit: true, delete: false, approve: false, export: true },
    },
  },
  BURSAR: {
    label: 'College Bursar & Chief Financial Officer',
    desc: 'Student fee ledger, cash collection, double-entry ledgers, and bank reconciliations.',
    dept: 'Finance & Accounts',
    perms: {
      admissions: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      academics: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      attendance: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      clinicals: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      finance: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      payroll: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      operations: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      documents: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
      administration: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    },
  },
  HEAD_OF_DEPARTMENT: {
    label: 'Head of Department / Coordinator',
    desc: 'Curriculum delivery, faculty teaching loads, continuous assessments, and moderation.',
    dept: 'Department of Nursing and Midwifery',
    perms: {
      admissions: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      academics: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      attendance: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      clinicals: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      finance: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      payroll: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      operations: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      documents: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
      administration: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    },
  },
  CLINICAL_COORDINATOR: {
    label: 'Clinical Training Coordinator / Supervisor',
    desc: 'Hospital ward placements, clinical logbook competencies, and preceptor sign-offs.',
    dept: 'Clinical Training & Wards',
    perms: {
      admissions: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      academics: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      attendance: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      clinicals: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      finance: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      payroll: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      operations: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      documents: { view: true, create: true, edit: false, delete: false, approve: false, export: true },
      administration: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    },
  },
  EXAMINATIONS_OFFICER: {
    label: 'Examinations Officer',
    desc: 'OSCE circuits, computer-based tests, grading moderation, and exam transcripts.',
    dept: 'Academic Affairs & Registry',
    perms: {
      admissions: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      academics: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      attendance: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      clinicals: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      finance: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      payroll: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      operations: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      documents: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
      administration: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    },
  },
  ADMISSIONS_OFFICER: {
    label: 'Admissions & Enrollment Officer',
    desc: 'Application reviews, candidate offers, matriculation vetting, and candidate communication.',
    dept: 'Academic Affairs & Registry',
    perms: {
      admissions: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
      academics: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      attendance: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      clinicals: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      finance: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      payroll: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      operations: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      documents: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
      administration: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    },
  },
  LECTURER: {
    label: 'Faculty Lecturer & Assessor',
    desc: 'Teaching curriculum modules, attendance roll-calls, continuous assessment entry.',
    dept: 'School of Nursing & Midwifery',
    perms: {
      admissions: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      academics: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
      attendance: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
      clinicals: { view: true, create: true, edit: false, delete: false, approve: false, export: false },
      finance: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      payroll: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      operations: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      documents: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      administration: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    },
  },
  CASHIER: {
    label: 'Senior Finance Cashier',
    desc: 'Counter cash/mobile collections, receipts generation, and daily banking schedule.',
    dept: 'Finance & Accounts',
    perms: {
      admissions: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      academics: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      attendance: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      clinicals: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      finance: { view: true, create: true, edit: false, delete: false, approve: false, export: true },
      payroll: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      operations: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      documents: { view: true, create: true, edit: false, delete: false, approve: false, export: true },
      administration: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    },
  },
  PAYROLL_PREPARER: {
    label: 'Human Resources & Payroll Preparer',
    desc: 'Staff dossiers, leave rosters, statutory allowances, and draft payroll preparation.',
    dept: 'Human Resources & Administration',
    perms: {
      admissions: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      academics: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      attendance: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      clinicals: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      finance: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      payroll: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
      operations: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      documents: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
      administration: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    },
  },
  PAYROLL_APPROVER: {
    label: 'Finance Director / Payroll Approver',
    desc: 'Separation of powers executive approver for bank settlement and statutory filings.',
    dept: 'Executive Directorate',
    perms: {
      admissions: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      academics: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      attendance: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
      clinicals: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      finance: { view: true, create: false, edit: false, delete: false, approve: true, export: true },
      payroll: { view: true, create: false, edit: false, delete: false, approve: true, export: true },
      operations: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      documents: { view: true, create: false, edit: false, delete: false, approve: true, export: true },
      administration: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    },
  },
  IT_ADMIN: {
    label: 'ICT & Infrastructure Administrator',
    desc: 'System authentication, TOTP enforcement, role assignment, backups, and security locks.',
    dept: 'ICT & Systems Engineering',
    perms: {
      admissions: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      academics: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      attendance: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      clinicals: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      finance: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      payroll: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      operations: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      documents: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
      administration: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
    },
  },
  AUDITOR_READONLY: {
    label: 'Regulatory Inspector (HEA / NMCZ / HPCZ)',
    desc: 'Statutory compliance inspection, accreditation registers, and tamper-proof audit trails.',
    dept: 'Statutory Inspection & Audit',
    perms: {
      admissions: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      academics: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      attendance: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      clinicals: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      finance: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      payroll: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      operations: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      documents: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
      administration: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
    },
  },
};

export const MODULE_DEFINITIONS: Array<{ key: keyof UserModulePermissions; label: string; desc: string }> = [
  { key: 'admissions', label: 'Admissions & Candidates', desc: 'Candidate applications, offers, and enrolment.' },
  { key: 'academics', label: 'Academics & Examinations', desc: 'Syllabi, cohorts, grading, and examination boards.' },
  { key: 'attendance', label: 'Attendance & Engagement', desc: 'Live biometric & classroom register verification.' },
  { key: 'clinicals', label: 'Clinical Placements & Wards', desc: 'Hospital ward rotations, skills logbooks, and preceptors.' },
  { key: 'finance', label: 'Finance, Billing & Ledgers', desc: 'Invoices, cashbook receipts, and double-entry ledgers.' },
  { key: 'payroll', label: 'Staff & Zambian Payroll', desc: 'PAYE, NAPSA, NHIMA, WCFCB statutory schedules.' },
  { key: 'operations', label: 'Campus Operations & Assets', desc: 'Student hostels, bus routes, books, and inventory.' },
  { key: 'documents', label: 'Documents & Certificates', desc: 'Official transcripts, letters, and regulatory forms.' },
  { key: 'administration', label: 'Administration & Security', desc: 'RBAC controls, security audit logs, and settings.' },
];

export function resolveStaffRole(staff: any): { roleKey: string; roleTitle: string; dept: string } {
  const userRole = staff.user?.role;
  if (userRole && ROLE_PRESETS[userRole]) {
    return {
      roleKey: userRole,
      roleTitle: ROLE_PRESETS[userRole].label,
      dept: ROLE_PRESETS[userRole].dept,
    };
  }

  if (staff.role && ROLE_PRESETS[staff.role]) {
    return {
      roleKey: staff.role,
      roleTitle: ROLE_PRESETS[staff.role].label,
      dept: ROLE_PRESETS[staff.role].dept,
    };
  }

  const title = (staff.jobTitle || '').toLowerCase();
  const email = (staff.email || '').toLowerCase();

  if (title.includes('principal') || email.includes('principal')) {
    return { roleKey: 'INSTITUTION_ADMIN', roleTitle: 'Principal & Executive (CEO)', dept: 'Executive Directorate' };
  }
  if (title.includes('registrar') || email.includes('registrar')) {
    return { roleKey: 'REGISTRAR', roleTitle: 'Academic Registrar & Board', dept: 'Academic Affairs & Registry' };
  }
  if (title.includes('bursar') || email.includes('bursar')) {
    return { roleKey: 'BURSAR', roleTitle: 'College Bursar & Chief Financial Officer', dept: 'Finance & Accounts' };
  }
  if (title.includes('nursing') || email.includes('nursing')) {
    return { roleKey: 'HEAD_OF_DEPARTMENT', roleTitle: 'Head of Nursing & Midwifery', dept: 'Department of Nursing and Midwifery' };
  }
  if (title.includes('clinical') || email.includes('clinical')) {
    return { roleKey: 'CLINICAL_COORDINATOR', roleTitle: 'Clinical Training Coordinator', dept: 'Clinical Training & Wards' };
  }
  if (title.includes('exam') || email.includes('exam')) {
    return { roleKey: 'EXAMINATIONS_OFFICER', roleTitle: 'Examinations Officer', dept: 'Academic Affairs & Registry' };
  }
  if (title.includes('cashier') || email.includes('cashier')) {
    return { roleKey: 'CASHIER', roleTitle: 'Senior Finance Cashier', dept: 'Finance & Accounts' };
  }
  if (title.includes('payroll') || email.includes('payroll')) {
    return { roleKey: 'PAYROLL_PREPARER', roleTitle: 'Human Resources & Payroll Preparer', dept: 'Human Resources & Administration' };
  }
  if (title.includes('admission') || email.includes('admission')) {
    return { roleKey: 'ADMISSIONS_OFFICER', roleTitle: 'Admissions & Enrollment Officer', dept: 'Academic Affairs & Registry' };
  }
  if (title.includes('lecturer') || title.includes('facilitator') || email.includes('lecturer')) {
    return { roleKey: 'LECTURER', roleTitle: 'Faculty Lecturer & Assessor', dept: 'School of Nursing & Midwifery' };
  }
  if (title.includes('it') || email.includes('it.admin') || email.includes('mukombo')) {
    return { roleKey: 'IT_ADMIN', roleTitle: 'ICT & Infrastructure Administrator', dept: 'ICT & Systems Engineering' };
  }
  if (title.includes('audit')) {
    return { roleKey: 'AUDITOR_READONLY', roleTitle: 'Regulatory Inspector', dept: 'Statutory Inspection & Audit' };
  }

  return { roleKey: 'LECTURER', roleTitle: 'Faculty Lecturer & Assessor', dept: 'Academic Affairs & Registry' };
}
