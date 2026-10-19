// tests/audit-remediation.test.ts
// Automated regression tests for EduSphere SMIS Comprehensive Technical Audit (Phases 0 - 6)
import { describe, it, expect } from 'vitest';
import {
  LEGACY_SOLWEZI_BALANCES,
  LEGACY_STAFF_MEMBERS,
  LEGACY_SCHOOL_PROFILE,
} from '../src/server/services/legacySchoolData';
import { getSchoolCurrentDateStr, getTodayBirthdays } from '../src/server/services/schoolCalendarData';
import { getFinancialSummary } from '../src/server/services/financeReporting.service';
import { generateFullSystemBackup, validateBackupArchive, executeBackupRestoration } from '../src/server/services/backupRestore.service';

describe('Audit Remediation Verification (SEC, SAFE, FIN, BRD, HR, GIS, CAL, PORT)', () => {
  it('BRD-001: Boarding hall bed occupancy strictly respects physical capacity limits', () => {
    const boarders = LEGACY_SOLWEZI_BALANCES.filter((l) => l.studentType === 'BOARDER');
    const boysBoarders = boarders.filter((l) => l.gender === 'MALE');
    const girlsBoarders = boarders.filter((l) => l.gender === 'FEMALE');

    // Boys Hall capacity: 180 beds. Allocated must be <= 180 (target 162).
    expect(boysBoarders.length).toBeLessThanOrEqual(180);
    expect(boysBoarders.length).toBe(162);

    // Girls Hall capacity: 170 beds. Allocated must be <= 170 (target 156).
    expect(girlsBoarders.length).toBeLessThanOrEqual(170);
    expect(girlsBoarders.length).toBe(156);

    // Total Boarders: 318
    expect(boarders.length).toBe(318);
  });

  it('HR-001: Staff headcount reconciles across directory and operational roles', () => {
    expect(LEGACY_STAFF_MEMBERS.length).toBe(48);

    const teachingStaff = LEGACY_STAFF_MEMBERS.filter(
      (s) => s.department === 'ACADEMIC_PRIMARY' || s.department === 'ACADEMIC_SECONDARY' || s.department === 'BOARDING_ADMIN'
    );
    const supportStaff = LEGACY_STAFF_MEMBERS.filter(
      (s) => s.department === 'SUPPORT_OPERATIONS' || s.department === 'FINANCE_OPERATIONS' || s.department === 'HEALTHCARE_WELFARE'
    );

    expect(teachingStaff.length + supportStaff.length).toBe(48);
    // All 48 staff members have active contracts
    expect(LEGACY_STAFF_MEMBERS.every((s) => s.employmentStatus === 'FULL_TIME')).toBe(true);
  });

  it('CAL-001: Calendar correctly computes local date using configured Africa/Lusaka timezone', () => {
    const dateStr = getSchoolCurrentDateStr();
    expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const parts = dateStr.split('-');
    expect(Number(parts[0])).toBeGreaterThanOrEqual(2026);
    expect(Number(parts[1])).toBeGreaterThanOrEqual(1);
    expect(Number(parts[1])).toBeLessThanOrEqual(12);

    // Verify getTodayBirthdays uses the timezone date
    const todayBirthdays = getTodayBirthdays();
    expect(todayBirthdays.date).toBe(dateStr);
    expect(Array.isArray(todayBirthdays.birthdays)).toBe(true);
  });

  it('GIS-001: Authoritative campus registry provides consistent geocoded coordinates and capacity', () => {
    expect(LEGACY_SCHOOL_PROFILE.campuses.length).toBe(2);

    const mushitala = LEGACY_SCHOOL_PROFILE.campuses.find((c) => c.code === 'MSC');
    const urban = LEGACY_SCHOOL_PROFILE.campuses.find((c) => c.code === 'URB');

    expect(mushitala).toBeDefined();
    expect(urban).toBeDefined();

    expect(mushitala!.capacity).toBe(650);
    expect(mushitala!.enrolled).toBe(420);
    expect(mushitala!.hasBoarding).toBe(true);
    expect(mushitala!.coordinates.lat).toBeCloseTo(-12.151775, 4);

    expect(urban!.capacity).toBe(450);
    expect(urban!.enrolled).toBe(360);
    expect(urban!.hasBoarding).toBe(false);
    expect(urban!.coordinates.lat).toBeCloseTo(-12.187002, 4);

    expect(mushitala!.enrolled + urban!.enrolled).toBe(780);
    expect(mushitala!.capacity + urban!.capacity).toBe(1100);
  });

  it('FIN-001 & SAAS-001: Authoritative finance and SaaS reporting reconcile without variance', () => {
    const finSummary = getFinancialSummary('ALL');
    expect(finSummary.reconciliationStatus.isReconciled).toBe(true);
    expect(finSummary.reconciliationStatus.varianceZMW).toBe(0);
    expect(finSummary.totalBilledZMW).toBeGreaterThan(0);
    expect(finSummary.totalCollectedZMW).toBeGreaterThan(0);
    expect(finSummary.totalExpendituresZMW).toBeGreaterThan(0);
    expect(finSummary.cashSurplusZMW).toBe(finSummary.totalCollectedZMW - finSummary.totalExpendituresZMW);
  });

  it('PORT-001: Backup archive validates manifest integrity and supports non-destructive recovery', async () => {
    const backup = await generateFullSystemBackup();
    const jsonStr = JSON.stringify(backup);
    const validation = await validateBackupArchive(jsonStr);

    expect(validation.isValid).toBe(true);
    expect(validation.manifest?.schemaVersion).toBe('1.0.0');
    expect(validation.recordSummary?.Students).toBe(780);
    expect(validation.recordSummary?.Staff).toBe(48);

    const restoreResult = await executeBackupRestoration(jsonStr);
    expect(restoreResult.success).toBe(true);
  });
});
