import { describe, expect, it } from 'vitest';
import { SystemRole } from '@prisma/client';
import {
  canAdministerInstitution,
  institutionProfileSchema,
  isDedicatedInstitutionCode,
} from '../src/server/institution';

describe('NWUCHAS M1 institution foundation', () => {
  it('permits only designated interim institutional administrators to change profile settings', () => {
    expect(canAdministerInstitution(SystemRole.SCHOOL_PROPRIETOR)).toBe(true);
    expect(canAdministerInstitution(SystemRole.HEADTEACHER)).toBe(true);
    expect(canAdministerInstitution(SystemRole.INSTITUTION_ADMIN)).toBe(true);
    expect(canAdministerInstitution(SystemRole.BURSAR)).toBe(false);
    expect(canAdministerInstitution(SystemRole.PLATFORM_SUPER_ADMIN)).toBe(false);
  });

  it('validates institution profile inputs and rejects unsafe branding URLs', () => {
    expect(institutionProfileSchema.safeParse({
      name: 'NWUCHAS', email: 'office@example.org', phone: '+260 000 000', city: 'Manyama', province: 'North-Western', primaryColor: '#123ABC',
    }).success).toBe(true);
    expect(institutionProfileSchema.safeParse({
      name: 'NWUCHAS', email: 'not-an-email', phone: '1', city: '', province: 'NW', logoUrl: 'javascript:alert(1)',
    }).success).toBe(false);
  });

  it('binds the dedicated endpoint to the NWUCHAS organisation code only', () => {
    expect(isDedicatedInstitutionCode('NWUCHAS')).toBe(true);
    expect(isDedicatedInstitutionCode('EDS-ZM-001')).toBe(false);
  });
});
