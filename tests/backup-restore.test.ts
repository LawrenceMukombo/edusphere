// tests/backup-restore.test.ts
import { describe, it, expect } from 'vitest';
import {
  generateFullSystemBackup,
  exportBackupToJsonString,
  exportBackupToSqlDump,
  validateBackupArchive,
  executeBackupRestoration,
  convertToCsv,
  computeSha256Checksum,
  BACKUP_SCHEMA_VERSION,
} from '../src/server/services/backupRestore.service';

describe('No-Vendor-Lock-In Local Backup & Disaster Recovery Engine (PORT-001)', () => {
  it('generates a full system backup package with complete manifest and record counts', async () => {
    const backup = await generateFullSystemBackup();

    expect(backup.manifest).toBeDefined();
    expect(backup.manifest.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(backup.manifest.format).toBe('EDUSPHERE_SOVEREIGN_ARCHIVE');
    expect(backup.manifest.schoolCode).toBe('EDS-ZM-SOL-001');
    expect(backup.manifest.totalRecordsCount).toBeGreaterThan(100);
    expect(backup.manifest.checksumSha256).toBeDefined();
    expect(backup.manifest.checksumSha256.length).toBeGreaterThan(10);

    // Entity checks
    expect(backup.students.length).toBeGreaterThanOrEqual(100);
    expect(backup.staff.length).toBe(48);
    expect(backup.assets.length).toBeGreaterThanOrEqual(15);
    expect(backup.expenditures.length).toBeGreaterThanOrEqual(5);
    expect(backup.schoolProfile.name).toBe('Legacy School Solwezi');
  });

  it('exports formatted JSON string and computes valid SHA-256 hash', async () => {
    const jsonStr = await exportBackupToJsonString();
    expect(typeof jsonStr).toBe('string');
    expect(jsonStr.length).toBeGreaterThan(5000);

    const hash = await computeSha256Checksum(jsonStr);
    expect(hash).toBeDefined();
    expect(hash.length).toBeGreaterThan(10);
  });

  it('exports portable ANSI SQL / SQLite dump with DDL and INSERT statements', async () => {
    const sqlDump = await exportBackupToSqlDump();
    expect(typeof sqlDump).toBe('string');

    // Contains table creations
    expect(sqlDump).toContain('CREATE TABLE IF NOT EXISTS school_profile');
    expect(sqlDump).toContain('CREATE TABLE IF NOT EXISTS staff_members');
    expect(sqlDump).toContain('CREATE TABLE IF NOT EXISTS students');
    expect(sqlDump).toContain('CREATE TABLE IF NOT EXISTS school_assets');
    expect(sqlDump).toContain('CREATE TABLE IF NOT EXISTS expenditures');

    // Contains INSERT statements
    expect(sqlDump).toContain("INSERT INTO school_profile");
    expect(sqlDump).toContain("INSERT INTO staff_members");
    expect(sqlDump).toContain("INSERT INTO school_assets");
  });

  it('converts dataset arrays into standard CSV table format', () => {
    const sampleData = [
      { id: '1', name: 'Patrick Banda', role: 'ESTATE_MANAGER', campus: 'Mushitala' },
      { id: '2', name: 'Grace Tembo', role: 'TEACHER', campus: 'Urban' },
    ];
    const csv = convertToCsv(sampleData);
    expect(csv).toContain('id,name,role,campus');
    expect(csv).toContain('"1","Patrick Banda","ESTATE_MANAGER","Mushitala"');
    expect(csv).toContain('"2","Grace Tembo","TEACHER","Urban"');
  });

  it('validates authentic backup archive and rejects corrupted or incompatible payloads', async () => {
    const validJson = await exportBackupToJsonString();
    const validation = await validateBackupArchive(validJson);

    expect(validation.isValid).toBe(true);
    expect(validation.manifest?.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(validation.recordSummary?.Students).toBeGreaterThan(100);
    expect(validation.recordSummary?.Staff).toBe(48);

    // Corrupted payload
    const corruptedVal = await validateBackupArchive('{ "invalid": true }');
    expect(corruptedVal.isValid).toBe(false);
    expect(corruptedVal.error).toContain('missing manifest');

    // Incompatible version
    const incompatible = await validateBackupArchive(
      JSON.stringify({
        manifest: { format: 'EDUSPHERE_SOVEREIGN_ARCHIVE', schemaVersion: '9.0.0' },
      })
    );
    expect(incompatible.isValid).toBe(false);
    expect(incompatible.error).toContain('Incompatible schema version');
  });

  it('executes safe non-destructive restoration and returns restored entity summary', async () => {
    const validJson = await exportBackupToJsonString();
    const result = await executeBackupRestoration(validJson);

    expect(result.success).toBe(true);
    expect(result.message).toContain('Legacy School Solwezi');
    expect(result.restoredEntities.Students).toBeGreaterThan(100);
    expect(result.restoredEntities.Staff).toBe(48);
  });
});
