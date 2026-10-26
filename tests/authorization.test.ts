import { describe, expect, it } from 'vitest';
import { SystemRole } from '@prisma/client';
import { admissionActorRoleFor, hasPermission, requireDistinctActors } from '../src/server/authorization';

describe('NWUCHAS role capabilities', () => {
  it('grants admissions decisions only to their dedicated roles', () => {
    expect(admissionActorRoleFor(SystemRole.ADMISSIONS_OFFICER)).toBe('ADMISSIONS_OFFICER');
    expect(admissionActorRoleFor(SystemRole.ADMISSIONS_COMMITTEE)).toBe('ADMISSIONS_COMMITTEE');
    expect(admissionActorRoleFor(SystemRole.REGISTRAR)).toBe('REGISTRAR');
    expect(admissionActorRoleFor(SystemRole.HEADTEACHER)).toBeNull();
  });

  it('does not allow a legacy school role to inherit NWUCHAS finance access', () => {
    expect(hasPermission(SystemRole.CASHIER, 'finance:collect')).toBe(true);
    expect(hasPermission(SystemRole.BURSAR, 'finance:collect')).toBe(false);
    expect(hasPermission(SystemRole.CASHIER, 'finance:reconcile')).toBe(false);
  });

  it('enforces maker/checker separation', () => {
    expect(() => requireDistinctActors('maker-1', 'reviewer-2', 'approver-3')).not.toThrow();
    expect(() => requireDistinctActors('maker-1', 'maker-1')).toThrow(/same user/i);
    expect(() => requireDistinctActors('maker-1', '')).toThrow(/complete actor trail/i);
  });
});
