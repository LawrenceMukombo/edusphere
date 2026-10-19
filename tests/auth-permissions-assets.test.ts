// tests/auth-permissions-assets.test.ts
import { describe, it, expect } from 'vitest';
import {
  evaluatePasswordStrength,
  getDaysUntilPasswordExpiry,
  hasPermission,
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_PASSWORD_POLICY,
} from '../src/lib/authPermissions';
import {
  SEED_SCHOOL_ASSETS,
  calculateStraightLineDepreciation,
} from '../src/server/services/schoolAssetData';

describe('Granular Permissions & Password Security Engine', () => {
  it('evaluates password strength across all criteria accurately', () => {
    // Very weak password
    const weak = evaluatePasswordStrength('abc');
    expect(weak.score).toBeLessThanOrEqual(1);
    expect(weak.meetsPolicy).toBe(false);

    // Meets enterprise policy
    const strong = evaluatePasswordStrength('SolweziLegacy#2026!');
    expect(strong.score).toBeGreaterThanOrEqual(3);
    expect(strong.meetsPolicy).toBe(true);
    expect(strong.hasLength).toBe(true);
    expect(strong.hasUpper).toBe(true);
    expect(strong.hasLower).toBe(true);
    expect(strong.hasNumber).toBe(true);
    expect(strong.hasSpecial).toBe(true);
  });

  it('calculates 30-day staff password expiry correctly', () => {
    const today = new Date().toISOString();
    const expiry = getDaysUntilPasswordExpiry(today, 30);
    expect(expiry.daysRemaining).toBe(30);
    expect(expiry.isExpired).toBe(false);

    // Password changed 35 days ago (expired)
    const oldDate = new Date(Date.now() - 35 * 86400000).toISOString();
    const expired = getDaysUntilPasswordExpiry(oldDate, 30);
    expect(expired.daysRemaining).toBeLessThanOrEqual(0);
    expect(expired.isExpired).toBe(true);
  });

  it('enforces RBAC matrix and financial role 2FA requirements', () => {
    // Bursar is a financial role requiring 2FA
    const bursar = DEFAULT_ROLE_PERMISSIONS.BURSAR;
    expect(bursar.isFinanceRole).toBe(true);
    expect(bursar.requires2FA).toBe(true);
    expect(hasPermission('BURSAR', 'fees', 'create')).toBe(true);
    expect(hasPermission('BURSAR', 'fees', 'approve')).toBe(false); // Segregation of duties: Bursar posts, Director approves
    expect(hasPermission('FINANCE_DIRECTOR', 'fees', 'approve')).toBe(true);
    expect(hasPermission('BURSAR', 'assets', 'edit')).toBe(true);

    // Teacher cannot approve fees or delete assets
    expect(hasPermission('TEACHER', 'fees', 'approve')).toBe(false);
    expect(hasPermission('TEACHER', 'assets', 'delete')).toBe(false);
    expect(hasPermission('TEACHER', 'academics', 'create')).toBe(true);
  });
});

describe('School Asset Management Data Integrity', () => {
  it('contains seeded Solwezi school assets with positive valuations', () => {
    expect(SEED_SCHOOL_ASSETS.length).toBeGreaterThanOrEqual(15);
    for (const asset of SEED_SCHOOL_ASSETS) {
      expect(asset.purchaseCostZMW).toBeGreaterThan(0);
      expect(asset.currentNetBookValueZMW).toBeGreaterThan(0);
      expect(asset.currentNetBookValueZMW).toBeLessThanOrEqual(asset.purchaseCostZMW);
    }
  });

  it('calculates straight-line depreciation correctly', () => {
    const dep = calculateStraightLineDepreciation(100000, 5000, 5, '2024-01-01');
    expect(dep.accumulated).toBeGreaterThan(0);
    expect(dep.netBookValue).toBeLessThanOrEqual(100000);
    expect(dep.netBookValue).toBeGreaterThanOrEqual(5000);
  });
});
