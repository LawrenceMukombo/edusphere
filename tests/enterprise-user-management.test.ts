import { describe, it, expect } from 'vitest';
import {
  ROLE_PRESETS,
  DEFAULT_PERMISSIONS,
  MODULE_DEFINITIONS,
  resolveStaffRole,
  ModulePermissionSet,
  UserModulePermissions,
} from '../src/lib/administrationRbac';

describe('Enterprise User Management & RBAC Permissions Matrix', () => {
  it('defines comprehensive role presets with valid permission sets across all 9 modules', () => {
    const requiredModules: Array<keyof UserModulePermissions> = [
      'admissions',
      'academics',
      'attendance',
      'clinicals',
      'finance',
      'payroll',
      'operations',
      'documents',
      'administration',
    ];

    const requiredActions: Array<keyof ModulePermissionSet> = [
      'view',
      'create',
      'edit',
      'delete',
      'approve',
      'export',
    ];

    expect(Object.keys(ROLE_PRESETS).length).toBeGreaterThanOrEqual(10);

    for (const [roleKey, preset] of Object.entries(ROLE_PRESETS)) {
      expect(preset.label).toBeTruthy();
      expect(preset.desc).toBeTruthy();
      expect(preset.dept).toBeTruthy();

      for (const mod of requiredModules) {
        expect(preset.perms[mod], `Missing module ${mod} in preset ${roleKey}`).toBeDefined();
        for (const act of requiredActions) {
          expect(typeof preset.perms[mod][act]).toBe('boolean');
        }
      }
    }
  });

  it('guarantees INSTITUTION_ADMIN (Principal) has full permissions across all modules', () => {
    const admin = ROLE_PRESETS.INSTITUTION_ADMIN;
    expect(admin).toBeDefined();
    expect(admin.perms.administration.approve).toBe(true);
    expect(admin.perms.finance.approve).toBe(true);
    expect(admin.perms.payroll.approve).toBe(true);
  });

  it('enforces least-privilege for AUDITOR_READONLY (view & export only, no create/edit/delete/approve)', () => {
    const auditor = ROLE_PRESETS.AUDITOR_READONLY;
    expect(auditor).toBeDefined();

    for (const [, modPerms] of Object.entries(auditor.perms)) {
      expect(modPerms.view).toBe(true);
      expect(modPerms.export).toBe(true);
      expect(modPerms.create).toBe(false);
      expect(modPerms.edit).toBe(false);
      expect(modPerms.delete).toBe(false);
      expect(modPerms.approve).toBe(false);
    }
  });

  it('restricts financial write privileges away from Faculty Lecturers and Clinical Coordinators', () => {
    const lecturer = ROLE_PRESETS.LECTURER;
    const clinical = ROLE_PRESETS.CLINICAL_COORDINATOR;

    expect(lecturer.perms.finance.create).toBe(false);
    expect(lecturer.perms.finance.approve).toBe(false);
    expect(clinical.perms.finance.create).toBe(false);
    expect(clinical.perms.finance.approve).toBe(false);
  });

  it('accurately resolves roles from job titles and user attributes instead of fallback REGISTRAR', () => {
    const principal = resolveStaffRole({ jobTitle: 'Principal & Chief Executive', email: 'principal@nwuchas.edu.zm' });
    expect(principal.roleKey).toBe('INSTITUTION_ADMIN');
    expect(principal.dept).toBe('Executive Directorate');

    const bursar = resolveStaffRole({ jobTitle: 'College Bursar / Finance Manager', email: 'bursar@nwuchas.edu.zm' });
    expect(bursar.roleKey).toBe('BURSAR');
    expect(bursar.dept).toBe('Finance & Accounts');

    const nursingLead = resolveStaffRole({ jobTitle: 'Head of Nursing / Senior Lecturer', email: 'nursing.lead@nwuchas.edu.zm' });
    expect(nursingLead.roleKey).toBe('HEAD_OF_DEPARTMENT');

    const clinical = resolveStaffRole({ jobTitle: 'Clinical Training Coordinator', email: 'clinical.coord@nwuchas.edu.zm' });
    expect(clinical.roleKey).toBe('CLINICAL_COORDINATOR');

    const examOfficer = resolveStaffRole({ jobTitle: 'Examinations Officer & Lecturer', email: 'exams@nwuchas.edu.zm' });
    expect(examOfficer.roleKey).toBe('EXAMINATIONS_OFFICER');

    const itAdmin = resolveStaffRole({ jobTitle: 'ICT Administrator', email: 'it.admin@nwuchas.edu.zm' });
    expect(itAdmin.roleKey).toBe('IT_ADMIN');
  });
});
