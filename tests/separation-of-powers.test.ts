// tests/separation-of-powers.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkSeparationOfPowers,
  executeBreakGlassEmergencyOverride,
  hasActiveOverrideSession,
  OPERATIONAL_TASK_DEFINITIONS,
  EXECUTIVE_DISPATCH_RECIPIENTS,
  OperationalSchoolTask,
} from '../src/lib/separationOfPowers';
import { UserSecurityProfile } from '../src/lib/authPermissions';

describe('Institutional Separation of Powers & Executive Governance Guardrails', () => {
  const superAdminUser: UserSecurityProfile = {
    id: 'usr-admin-001',
    username: 'admin.ict',
    fullName: 'System Administrator (IT Dept)',
    role: 'SUPER_ADMIN',
    campusId: 'ALL',
    email: 'ict.admin@legacyschool.edu.zm',
    phone: '+260 977 000001',
    staffId: 'STAFF-IT-001',
    is2FAEnabled: true,
    is2FAVerified: true,
    passwordLastChanged: new Date().toISOString(),
    mustChangePassword: false,
    failedLoginAttempts: 0,
    accountLocked: false,
  };

  const bursarUser: UserSecurityProfile = {
    id: 'usr-bursar-001',
    username: 'bursar.office',
    fullName: 'Mrs. Mary Chisenga',
    role: 'BURSAR',
    campusId: 'ALL',
    email: 'bursar@legacyschool.edu.zm',
    phone: '+260 977 000002',
    staffId: 'STAFF-FIN-001',
    is2FAEnabled: true,
    is2FAVerified: true,
    passwordLastChanged: new Date().toISOString(),
    mustChangePassword: false,
    failedLoginAttempts: 0,
    accountLocked: false,
  };

  const principalUser: UserSecurityProfile = {
    id: 'usr-prin-001',
    username: 'principal.office',
    fullName: 'Mr. Emmanuel Mwansa',
    role: 'PRINCIPAL',
    campusId: 'ALL',
    email: 'principal@legacyschool.edu.zm',
    phone: '+260 977 000003',
    staffId: 'STAFF-EXEC-001',
    is2FAEnabled: true,
    is2FAVerified: true,
    passwordLastChanged: new Date().toISOString(),
    mustChangePassword: false,
    failedLoginAttempts: 0,
    accountLocked: false,
  };

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('strictly blocks System Administrators (SUPER_ADMIN) from school operational tasks without break-glass', () => {
    const tasks: OperationalSchoolTask[] = [
      'RECORD_PAYMENT',
      'GRANT_LEARNER_ACCESS',
      'GRANT_STAFF_ACCESS',
      'GENERATE_OFFICIAL_DOCUMENT',
      'EDIT_ATTENDANCE_REGISTER',
      'APPROVE_BOARDING_EXEAT',
      'ENDORSE_ACADEMIC_GRADES',
    ];

    for (const task of tasks) {
      const check = checkSeparationOfPowers(superAdminUser, task);
      expect(check.allowed).toBe(false);
      expect(check.requiresOverride).toBe(true);
      expect(check.message).toContain('Administrative Access Restricted');
      expect(EXECUTIVE_DISPATCH_RECIPIENTS).toHaveLength(2);
    }
  });

  it('allows operational school roles to perform their standard operational tasks without break-glass', () => {
    // Bursar can record payments
    const bursarCheck = checkSeparationOfPowers(bursarUser, 'RECORD_PAYMENT');
    expect(bursarCheck.allowed).toBe(true);
    expect(bursarCheck.requiresOverride).toBe(false);

    // Principal can grant learner access and admissions
    const principalCheck = checkSeparationOfPowers(principalUser, 'GRANT_LEARNER_ACCESS');
    expect(principalCheck.allowed).toBe(true);
    expect(principalCheck.requiresOverride).toBe(false);
  });

  it('rejects break-glass override if emergency reason is insufficient (<15 characters)', () => {
    const result = executeBreakGlassEmergencyOverride({
      adminUser: superAdminUser,
      taskType: 'RECORD_PAYMENT',
      taskDescription: 'Attempting to collect fee',
      justification: 'Need to pay',
      targetEntityId: 'LSS-2026-0042',
      verificationPinOrPass: 'LegacyAdmin2026',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('minimum 15 characters');
  });

  it('rejects break-glass override if admin authentication is omitted or invalid (< 4 chars)', () => {
    const result = executeBreakGlassEmergencyOverride({
      adminUser: superAdminUser,
      taskType: 'GRANT_LEARNER_ACCESS',
      taskDescription: 'Emergency student admission',
      justification: 'Emergency enrollment ordered by national ministry inspection',
      targetEntityId: 'LSS-2026-0089',
      verificationPinOrPass: '',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('PIN or Password');
  });

  it('executes break-glass override with valid justification and dispatches instant alerts to School Manager & CEO', () => {
    const validReason = 'Emergency manual reconciliation required: Bursar hospitalized during term opening rush';
    const result = executeBreakGlassEmergencyOverride({
      adminUser: superAdminUser,
      taskType: 'RECORD_PAYMENT',
      taskDescription: 'Receipting Term 1 Fees for Chileshe Mulenga',
      justification: validReason,
      targetEntityId: 'LSS-2026-0142',
      verificationPinOrPass: 'LegacyAdmin2026',
    });

    expect(result.success).toBe(true);
    expect(result.incident).toBeDefined();

    const incident = result.incident!;
    expect(incident.adminId).toBe(superAdminUser.id);
    expect(incident.taskType).toBe('RECORD_PAYMENT');
    expect(incident.justification).toBe(validReason);

    // Verify instant dispatch to both Executive Leadership members
    expect(incident.recipients).toHaveLength(2);

    const schoolManagerDispatch = incident.recipients.find(
      (d) => d.role === 'SCHOOL_MANAGER'
    );
    expect(schoolManagerDispatch).toBeDefined();
    expect(schoolManagerDispatch?.name).toBe('Dr. Kennedy Musonda');
    expect(schoolManagerDispatch?.title).toBe('School Manager & Principal');

    const ceoDispatch = incident.recipients.find(
      (d) => d.role === 'CEO'
    );
    expect(ceoDispatch).toBeDefined();
    expect(ceoDispatch?.name).toBe('Mr. Emmanuel Mwansa');
    expect(ceoDispatch?.title).toBe('Chief Executive Officer & Board Chair');

    // Verify session token is now active
    expect(hasActiveOverrideSession('RECORD_PAYMENT')).toBe(true);

    // Now checkSeparationOfPowers should allow the operation under the break-glass session
    const postCheck = checkSeparationOfPowers(superAdminUser, 'RECORD_PAYMENT');
    expect(postCheck.allowed).toBe(true);
    expect(postCheck.requiresOverride).toBe(false);
  });

  it('contains correct metadata and executive recipients in definitions', () => {
    expect(EXECUTIVE_DISPATCH_RECIPIENTS).toHaveLength(2);
    expect(EXECUTIVE_DISPATCH_RECIPIENTS[0].name).toBe('Dr. Kennedy Musonda');
    expect(EXECUTIVE_DISPATCH_RECIPIENTS[0].title).toBe('School Manager & Principal');
    expect(EXECUTIVE_DISPATCH_RECIPIENTS[1].name).toBe('Mr. Emmanuel Mwansa');
    expect(EXECUTIVE_DISPATCH_RECIPIENTS[1].title).toBe('Chief Executive Officer & Board Chair');

    expect(OPERATIONAL_TASK_DEFINITIONS.RECORD_PAYMENT.intendedRole).toContain('Bursar');
    expect(OPERATIONAL_TASK_DEFINITIONS.GRANT_LEARNER_ACCESS.intendedRole).toContain('Registrar');
    expect(OPERATIONAL_TASK_DEFINITIONS.GENERATE_OFFICIAL_DOCUMENT.intendedRole).toContain('Principal');
  });
});
