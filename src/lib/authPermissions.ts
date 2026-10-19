// src/lib/authPermissions.ts
// Enterprise Role-Based Access Control (RBAC), Granular Permission Matrix, Password Policies & 2FA Engine
'use client';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'PRINCIPAL'
  | 'FINANCE_DIRECTOR'
  | 'BURSAR'
  | 'ACADEMIC_HEAD'
  | 'TEACHER'
  | 'HR_OFFICER'
  | 'BOARDING_MASTER'
  | 'ESTATE_MANAGER'
  | 'PARENT';

export type ModulePermissionKey =
  | 'attendance'
  | 'fees'
  | 'boarding'
  | 'academics'
  | 'hr'
  | 'gis'
  | 'admissions'
  | 'assets'
  | 'teacher'
  | 'parentPortal'
  | 'calendar'
  | 'settings'
  | 'admin';

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'audit'
  | 'export';

export interface RolePermissions {
  role: UserRole;
  roleName: string;
  description: string;
  isFinanceRole: boolean;
  requires2FA: boolean;
  color: string;
  permissions: Record<ModulePermissionKey, Record<PermissionAction, boolean>>;
}

export interface UserSecurityProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  campusId: 'ALL' | 'MUSHITALA' | 'URBAN';
  tczNumber?: string;
  staffId: string;
  is2FAEnabled: boolean;
  is2FAVerified: boolean;
  passwordLastChanged: string; // ISO date string
  mustChangePassword: boolean;
  failedLoginAttempts: number;
  accountLocked: boolean;
}

export interface PasswordPolicyConfig {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  rotationPeriodDays: number; // e.g. 30 days mandatory reset for staff
  preventReuseCount: number;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  enforce2FAForFinance: boolean;
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicyConfig = {
  minLength: 10,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  rotationPeriodDays: 30, // Strict monthly password rotation for staff
  preventReuseCount: 5,
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 30,
  enforce2FAForFinance: true,
};

// All available permission actions
export const ALL_PERMISSION_ACTIONS: PermissionAction[] = [
  'view',
  'create',
  'edit',
  'delete',
  'approve',
  'audit',
  'export',
];

// All available system modules
export const ALL_PERMISSION_MODULES: { key: ModulePermissionKey; label: string; isFinance?: boolean }[] = [
  { key: 'attendance', label: 'Operations & Attendance' },
  { key: 'fees', label: 'Fees & Expenditures (Finance)', isFinance: true },
  { key: 'boarding', label: 'Boarding Houses & Village' },
  { key: 'academics', label: 'Academics & ECZ Gradebook' },
  { key: 'hr', label: 'Staff & HR Suite' },
  { key: 'gis', label: 'Solwezi GIS & Fleet' },
  { key: 'admissions', label: 'Admissions & SIS' },
  { key: 'assets', label: 'School Asset Management (Finance)', isFinance: true },
  { key: 'teacher', label: 'Teacher Workspace' },
  { key: 'parentPortal', label: 'Parent Portal' },
  { key: 'calendar', label: 'School Calendar & Events' },
  { key: 'settings', label: 'System Configuration' },
  { key: 'admin', label: 'Platform Administration' },
];

function createPermissionsRecord(
  config: Partial<Record<ModulePermissionKey, Partial<Record<PermissionAction, boolean>>>>
): Record<ModulePermissionKey, Record<PermissionAction, boolean>> {
  const result: any = {};
  for (const mod of ALL_PERMISSION_MODULES) {
    result[mod.key] = {
      view: false,
      create: false,
      edit: false,
      delete: false,
      approve: false,
      audit: false,
      export: false,
      ...(config[mod.key] || {}),
    };
  }
  return result;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    roleName: 'Super Administrator',
    description: 'Unrestricted enterprise control across multi-campus operations, database governance, and tenant config.',
    isFinanceRole: true,
    requires2FA: true,
    color: 'bg-rose-100 text-rose-900 border-rose-300',
    permissions: createPermissionsRecord({
      attendance: { view: true, create: true, edit: true, delete: true, approve: true, audit: true, export: true },
      fees: { view: true, create: true, edit: true, delete: true, approve: true, audit: true, export: true },
      boarding: { view: true, create: true, edit: true, delete: true, approve: true, audit: true, export: true },
      academics: { view: true, create: true, edit: true, delete: true, approve: true, audit: true, export: true },
      hr: { view: true, create: true, edit: true, delete: true, approve: true, audit: true, export: true },
      gis: { view: true, create: true, edit: true, delete: true, approve: true, audit: true, export: true },
      admissions: { view: true, create: true, edit: true, delete: true, approve: true, audit: true, export: true },
      assets: { view: true, create: true, edit: true, delete: true, approve: true, audit: true, export: true },
      teacher: { view: true, create: true, edit: true, delete: true, approve: true, audit: true, export: true },
      parentPortal: { view: true, create: true, edit: true, delete: true, approve: true, audit: true, export: true },
      settings: { view: true, create: true, edit: true, delete: true, approve: true, audit: true, export: true },
      admin: { view: true, create: true, edit: true, delete: true, approve: true, audit: true, export: true },
    }),
  },

  PRINCIPAL: {
    role: 'PRINCIPAL',
    roleName: 'School Director & Principal',
    description: 'Full institutional authority over school operations, academic moderation approvals, expenditures, and DEBS audits.',
    isFinanceRole: true,
    requires2FA: true,
    color: 'bg-blue-100 text-blue-900 border-blue-300',
    permissions: createPermissionsRecord({
      attendance: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      fees: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      boarding: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      academics: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      hr: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      gis: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      admissions: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      assets: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      teacher: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      parentPortal: { view: true, create: true, edit: false, delete: false, approve: true, audit: true, export: true },
      settings: { view: true, create: false, edit: true, delete: false, approve: true, audit: true, export: true },
      admin: { view: true, create: false, edit: false, delete: false, approve: true, audit: true, export: true },
    }),
  },

  FINANCE_DIRECTOR: {
    role: 'FINANCE_DIRECTOR',
    roleName: 'Finance Director & Auditor',
    description: 'Financial controllership, ledger sign-off, expenditure authorization, tax compliance, and multi-channel bank reconciliation.',
    isFinanceRole: true,
    requires2FA: true,
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    permissions: createPermissionsRecord({
      attendance: { view: true, create: false, edit: false, delete: false, approve: false, audit: true, export: true },
      fees: { view: true, create: true, edit: true, delete: true, approve: true, audit: true, export: true },
      assets: { view: true, create: true, edit: true, delete: true, approve: true, audit: true, export: true },
      boarding: { view: true, create: false, edit: false, delete: false, approve: false, audit: true, export: true },
      academics: { view: true, create: false, edit: false, delete: false, approve: false, audit: false, export: true },
      hr: { view: true, create: false, edit: false, delete: false, approve: false, audit: true, export: true },
      admissions: { view: true, create: false, edit: false, delete: false, approve: false, audit: false, export: true },
      settings: { view: true, create: false, edit: true, delete: false, approve: false, audit: true, export: false },
    }),
  },

  BURSAR: {
    role: 'BURSAR',
    roleName: 'School Bursar & Cashier',
    description: 'Daily cashbook operations, fee invoice generation, mobile money reconciliation, and student clearance validation.',
    isFinanceRole: true,
    requires2FA: true,
    color: 'bg-amber-100 text-amber-900 border-amber-300',
    permissions: createPermissionsRecord({
      fees: { view: true, create: true, edit: true, delete: false, approve: false, audit: true, export: true },
      assets: { view: true, create: true, edit: true, delete: false, approve: false, audit: false, export: true },
      attendance: { view: true, create: false, edit: false, delete: false, approve: false, audit: false, export: false },
      admissions: { view: true, create: false, edit: false, delete: false, approve: false, audit: false, export: true },
      parentPortal: { view: true, create: true, edit: false, delete: false, approve: false, audit: false, export: false },
    }),
  },

  ACADEMIC_HEAD: {
    role: 'ACADEMIC_HEAD',
    roleName: 'Head of Academics & Studies',
    description: 'Curriculum oversight, senior teacher continuous assessment endorsement, exam score moderation, and ECZ compliance.',
    isFinanceRole: false,
    requires2FA: false,
    color: 'bg-purple-100 text-purple-900 border-purple-300',
    permissions: createPermissionsRecord({
      academics: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      teacher: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      attendance: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      admissions: { view: true, create: true, edit: true, delete: false, approve: false, audit: false, export: true },
      calendar: { view: true, create: true, edit: true, delete: false, approve: false, audit: false, export: true },
    }),
  },

  TEACHER: {
    role: 'TEACHER',
    roleName: 'Subject & Class Teacher',
    description: 'Classroom roll-call submission, topic test & exam markbook entry, and preliminary learner report remarks.',
    isFinanceRole: false,
    requires2FA: false,
    color: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    permissions: createPermissionsRecord({
      attendance: { view: true, create: true, edit: true, delete: false, approve: false, audit: false, export: true },
      teacher: { view: true, create: true, edit: true, delete: false, approve: false, audit: false, export: true },
      academics: { view: true, create: true, edit: true, delete: false, approve: false, audit: false, export: false },
      calendar: { view: true, create: false, edit: false, delete: false, approve: false, audit: false, export: false },
    }),
  },

  HR_OFFICER: {
    role: 'HR_OFFICER',
    roleName: 'Human Resources & Compliance Officer',
    description: 'Staff directory management, Teaching Council of Zambia (TCZ) certifications, biometric clock-in, and leave balances.',
    isFinanceRole: false,
    requires2FA: false,
    color: 'bg-sky-100 text-sky-900 border-sky-300',
    permissions: createPermissionsRecord({
      hr: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      attendance: { view: true, create: false, edit: false, delete: false, approve: false, audit: true, export: true },
      calendar: { view: true, create: true, edit: true, delete: false, approve: false, audit: false, export: true },
    }),
  },

  BOARDING_MASTER: {
    role: 'BOARDING_MASTER',
    roleName: 'Boarding Master & Matron',
    description: 'Dormitory bed allocation, 21:30 night curfew verification, sickbay clinic tracking, and weekend exeat gate passes.',
    isFinanceRole: false,
    requires2FA: false,
    color: 'bg-teal-100 text-teal-900 border-teal-300',
    permissions: createPermissionsRecord({
      boarding: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      attendance: { view: true, create: true, edit: true, delete: false, approve: false, audit: false, export: true },
      calendar: { view: true, create: false, edit: false, delete: false, approve: false, audit: false, export: false },
    }),
  },

  ESTATE_MANAGER: {
    role: 'ESTATE_MANAGER',
    roleName: 'Estate & Asset Manager',
    description: 'Physical campus assets, generator standby, laboratory equipment maintenance, bus fleet tracking, and infrastructure maintenance.',
    isFinanceRole: true,
    requires2FA: true,
    color: 'bg-orange-100 text-orange-900 border-orange-300',
    permissions: createPermissionsRecord({
      assets: { view: true, create: true, edit: true, delete: false, approve: true, audit: true, export: true },
      gis: { view: true, create: true, edit: true, delete: false, approve: false, audit: true, export: true },
      boarding: { view: true, create: false, edit: true, delete: false, approve: false, audit: false, export: true },
    }),
  },

  PARENT: {
    role: 'PARENT',
    roleName: 'Verified Parent / Guardian',
    description: 'Direct access to ward academic gradebooks, real-time fee balance settlement, absence excuse submissions, and teacher notices.',
    isFinanceRole: false,
    requires2FA: false,
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    permissions: createPermissionsRecord({
      parentPortal: { view: true, create: true, edit: false, delete: false, approve: false, audit: false, export: true },
      calendar: { view: true, create: false, edit: false, delete: false, approve: false, audit: false, export: false },
    }),
  },
};

// Initial Seed Users with Security Metadata
export const INITIAL_SECURITY_USERS: UserSecurityProfile[] = [
  {
    id: 'usr-001',
    username: 'director.mwansa',
    fullName: 'Mr. Emmanuel Mwansa',
    email: 'e.mwansa@legacyschool.edu.zm',
    phone: '+260 974 371271',
    role: 'PRINCIPAL',
    campusId: 'ALL',
    staffId: 'LSS-DIR-001',
    tczNumber: 'TCZ-DIR-2026-991',
    is2FAEnabled: true,
    is2FAVerified: true,
    passwordLastChanged: new Date(Date.now() - 14 * 86400000).toISOString(), // 14 days ago (Healthy)
    mustChangePassword: false,
    failedLoginAttempts: 0,
    accountLocked: false,
  },
  {
    id: 'usr-002',
    username: 'bursar.phiri',
    fullName: 'Mrs. Chileshe Phiri',
    email: 'c.phiri@legacyschool.edu.zm',
    phone: '+260 977 445566',
    role: 'BURSAR',
    campusId: 'ALL',
    staffId: 'LSS-FIN-002',
    is2FAEnabled: true,
    is2FAVerified: false, // Must verify 2FA to access finance
    passwordLastChanged: new Date(Date.now() - 28 * 86400000).toISOString(), // 28 days ago (due soon)
    mustChangePassword: false,
    failedLoginAttempts: 0,
    accountLocked: false,
  },
  {
    id: 'usr-003',
    username: 'academics.tembo',
    fullName: 'Dr. Frank Tembo',
    email: 'f.tembo@legacyschool.edu.zm',
    phone: '+260 979 112233',
    role: 'ACADEMIC_HEAD',
    campusId: 'MUSHITALA',
    staffId: 'LSS-ACA-003',
    tczNumber: 'TCZ-PR-2018-449',
    is2FAEnabled: false,
    is2FAVerified: false,
    passwordLastChanged: new Date(Date.now() - 32 * 86400000).toISOString(), // 32 days ago (Expired!)
    mustChangePassword: true, // Needs mandatory monthly reset
    failedLoginAttempts: 0,
    accountLocked: false,
  },
  {
    id: 'usr-004',
    username: 'estate.banda',
    fullName: 'Eng. Patrick Banda',
    email: 'p.banda@legacyschool.edu.zm',
    phone: '+260 971 889900',
    role: 'ESTATE_MANAGER',
    campusId: 'ALL',
    staffId: 'LSS-OPS-004',
    is2FAEnabled: true,
    is2FAVerified: false,
    passwordLastChanged: new Date(Date.now() - 10 * 86400000).toISOString(),
    mustChangePassword: false,
    failedLoginAttempts: 0,
    accountLocked: false,
  },
  {
    id: 'usr-005',
    username: 'teacher.kalenga',
    fullName: 'Ms. Joyce Kalenga',
    email: 'j.kalenga@legacyschool.edu.zm',
    phone: '+260 975 667788',
    role: 'TEACHER',
    campusId: 'MUSHITALA',
    staffId: 'LSS-TCH-005',
    tczNumber: 'TCZ-SEC-2021-312',
    is2FAEnabled: false,
    is2FAVerified: false,
    passwordLastChanged: new Date(Date.now() - 5 * 86400000).toISOString(),
    mustChangePassword: false,
    failedLoginAttempts: 0,
    accountLocked: false,
  },
];

// LocalStorage Keys
const STORAGE_ROLES_PERMISSIONS = 'edusphere_roles_permissions_v1';
const STORAGE_ACTIVE_USER = 'edusphere_active_user_v1';
const STORAGE_PASSWORD_POLICY = 'edusphere_password_policy_v1';
const STORAGE_USER_PROFILES = 'edusphere_user_security_profiles_v1';
const STORAGE_2FA_SESSION = 'edusphere_2fa_session_v1';

// Password Strength Evaluation Interface
export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Moderate' | 'Strong' | 'Military-Grade';
  color: string;
  barColor: string;
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  meetsPolicy: boolean;
  feedback: string[];
}

export function evaluatePasswordStrength(password: string, policy = DEFAULT_PASSWORD_POLICY): PasswordStrengthResult {
  const hasLength = password.length >= policy.minLength;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let criteriaCount = 0;
  if (hasLength) criteriaCount++;
  if (hasUpper) criteriaCount++;
  if (hasLower) criteriaCount++;
  if (hasNumber) criteriaCount++;
  if (hasSpecial) criteriaCount++;

  const feedback: string[] = [];
  if (!hasLength) feedback.push(`Must be at least ${policy.minLength} characters`);
  if (!hasUpper) feedback.push('Add an uppercase letter (A-Z)');
  if (!hasLower) feedback.push('Add a lowercase letter (a-z)');
  if (!hasNumber) feedback.push('Include a numeric digit (0-9)');
  if (!hasSpecial) feedback.push('Include a special symbol (!@#$%^&*)');

  const meetsPolicy =
    (!policy.requireUppercase || hasUpper) &&
    (!policy.requireLowercase || hasLower) &&
    (!policy.requireNumbers || hasNumber) &&
    (!policy.requireSpecialChars || hasSpecial) &&
    hasLength;

  if (criteriaCount <= 1 || password.length < 6) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'text-rose-600',
      barColor: 'bg-rose-500',
      hasLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      meetsPolicy,
      feedback,
    };
  } else if (criteriaCount === 2 || password.length < policy.minLength) {
    return {
      score: 1,
      label: 'Weak',
      color: 'text-orange-600',
      barColor: 'bg-orange-500',
      hasLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      meetsPolicy,
      feedback,
    };
  } else if (criteriaCount === 3 || criteriaCount === 4) {
    return {
      score: 2,
      label: 'Moderate',
      color: 'text-amber-600',
      barColor: 'bg-amber-500',
      hasLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      meetsPolicy,
      feedback,
    };
  } else if (criteriaCount === 5 && password.length < 14) {
    return {
      score: 3,
      label: 'Strong',
      color: 'text-blue-600',
      barColor: 'bg-blue-600',
      hasLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      meetsPolicy,
      feedback: feedback.length === 0 ? ['Complies with enterprise security standard'] : feedback,
    };
  } else {
    return {
      score: 4,
      label: 'Military-Grade',
      color: 'text-emerald-600',
      barColor: 'bg-emerald-600',
      hasLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      meetsPolicy,
      feedback: ['Exceptional cryptographic entropy & complexity'],
    };
  }
}

// Check Days until password rotation is required
export function getDaysUntilPasswordExpiry(lastChangedDateStr: string, rotationDays = 30): {
  daysRemaining: number;
  isExpired: boolean;
  statusBadge: string;
} {
  const lastChanged = new Date(lastChangedDateStr).getTime();
  const now = Date.now();
  const ageMs = now - lastChanged;
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
  const daysRemaining = rotationDays - ageDays;
  const isExpired = daysRemaining <= 0;

  let statusBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (isExpired) {
    statusBadge = 'bg-rose-100 text-rose-900 border-rose-300 font-black animate-pulse';
  } else if (daysRemaining <= 5) {
    statusBadge = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
  }

  return { daysRemaining: Math.max(0, daysRemaining), isExpired, statusBadge };
}

// Persistence: Role Permissions
export function loadRolePermissions(): Record<UserRole, RolePermissions> {
  if (typeof window === 'undefined') return DEFAULT_ROLE_PERMISSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_ROLES_PERMISSIONS);
    if (!raw) return DEFAULT_ROLE_PERMISSIONS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ROLE_PERMISSIONS, ...parsed };
  } catch {
    return DEFAULT_ROLE_PERMISSIONS;
  }
}

export function saveRolePermissions(permissions: Record<UserRole, RolePermissions>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_ROLES_PERMISSIONS, JSON.stringify(permissions));
    window.dispatchEvent(new Event('edusphere:permissions-updated'));
  } catch (e) {
    console.error('Failed to save role permissions', e);
  }
}

// Persistence: Active User
export function loadActiveUser(): UserSecurityProfile {
  if (typeof window === 'undefined') return INITIAL_SECURITY_USERS[0];
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_USER);
    if (!raw) return INITIAL_SECURITY_USERS[0];
    const parsed = JSON.parse(raw);
    return { ...INITIAL_SECURITY_USERS[0], ...parsed };
  } catch {
    return INITIAL_SECURITY_USERS[0];
  }
}

export function saveActiveUser(user: UserSecurityProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_ACTIVE_USER, JSON.stringify(user));
    window.dispatchEvent(new Event('edusphere:user-updated'));
  } catch (e) {
    console.error('Failed to save active user', e);
  }
}

// Persistence: Password Policy
export function loadPasswordPolicy(): PasswordPolicyConfig {
  if (typeof window === 'undefined') return DEFAULT_PASSWORD_POLICY;
  try {
    const raw = localStorage.getItem(STORAGE_PASSWORD_POLICY);
    if (!raw) return DEFAULT_PASSWORD_POLICY;
    return { ...DEFAULT_PASSWORD_POLICY, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PASSWORD_POLICY;
  }
}

export function savePasswordPolicy(policy: PasswordPolicyConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PASSWORD_POLICY, JSON.stringify(policy));
    window.dispatchEvent(new Event('edusphere:policy-updated'));
  } catch (e) {
    console.error('Failed to save password policy', e);
  }
}

// Check if user has specific permission on module
export function hasPermission(
  role: UserRole,
  moduleKey: ModulePermissionKey,
  action: PermissionAction,
  matrix = loadRolePermissions()
): boolean {
  if (role === 'SUPER_ADMIN') return true;
  const roleConfig = matrix[role];
  if (!roleConfig) return false;
  const modPerms = roleConfig.permissions[moduleKey];
  if (!modPerms) return false;
  return !!modPerms[action];
}

// 2FA Verification State Management
export function is2FAVerifiedForSession(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = sessionStorage.getItem(STORAGE_2FA_SESSION);
    if (!raw) return false;
    const session = JSON.parse(raw);
    const isValid = session.expiresAt && Date.now() < session.expiresAt;
    return isValid;
  } catch {
    return false;
  }
}

export function verify2FASession(durationMinutes = 30): void {
  if (typeof window === 'undefined') return;
  try {
    const session = {
      verifiedAt: Date.now(),
      expiresAt: Date.now() + durationMinutes * 60 * 1000,
    };
    sessionStorage.setItem(STORAGE_2FA_SESSION, JSON.stringify(session));
    window.dispatchEvent(new Event('edusphere:2fa-verified'));
  } catch (e) {
    console.error('Failed to set 2FA session', e);
  }
}

export function clear2FASession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_2FA_SESSION);
    window.dispatchEvent(new Event('edusphere:2fa-cleared'));
  } catch (e) {
    console.error('Failed to clear 2FA session', e);
  }
}
