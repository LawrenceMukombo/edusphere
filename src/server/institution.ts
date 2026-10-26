import { SystemRole } from '@prisma/client';
import { z } from 'zod';

/**
 * Transitional M1 policy while legacy roles are replaced by NWUCHAS roles.
 * The institution is selected solely from the authenticated server session.
 */
export const institutionAdministrators = new Set<SystemRole>([
  SystemRole.INSTITUTION_ADMIN,
  // Transitional assignments only; remove after authorised role migration.
  SystemRole.SCHOOL_PROPRIETOR,
  SystemRole.HEADTEACHER,
]);

export const institutionProfileSchema = z.object({
  name: z.string().trim().min(2).max(160),
  officialName: z.string().trim().min(2).max(240).optional(),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(40),
  address: z.string().trim().max(500).optional(),
  city: z.string().trim().min(2).max(120),
  province: z.string().trim().min(2).max(120),
  logoUrl: z.string().trim().url().max(2048).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a six-digit hex colour.').optional(),
});

export type InstitutionProfileInput = z.infer<typeof institutionProfileSchema>;

export function canAdministerInstitution(role: SystemRole): boolean {
  return institutionAdministrators.has(role);
}

export function isDedicatedInstitutionCode(code: string): boolean {
  return code === 'NWUCHAS';
}
