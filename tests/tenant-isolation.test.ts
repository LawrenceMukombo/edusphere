// Tests: AC-01 Tenant Isolation
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/server/db';
import { StudentService } from '../src/server/services/student.service';
import { FinanceService } from '../src/server/services/finance.service';

describe('AC-01: Multi-Tenant Data Isolation', () => {
  let orgAId: string;
  let orgBId: string;
  let pupilAId: string;

  beforeAll(async () => {
    // Retrieve School A (Kabulonga Academy)
    const orgA = await prisma.organisation.findUnique({ where: { code: 'EDS-ZM-001' } });
    // Retrieve School B (Sunshine ECE Centre)
    const orgB = await prisma.organisation.findUnique({ where: { code: 'EDS-ZM-002' } });

    orgAId = orgA!.id;
    orgBId = orgB!.id;

    // Retrieve a learner from School A
    const pupilA = await prisma.learner.findFirst({ where: { organisationId: orgAId } });
    pupilAId = pupilA!.id;
  });

  it('School B query must never return pupils belonging to School A', async () => {
    const schoolBStudents = await StudentService.listLearners(orgBId);
    const leaked = schoolBStudents.some((s) => s.organisationId === orgAId);
    expect(leaked).toBe(false);
  });

  it('Accessing School A learner profile with School B organisationId must be rejected', async () => {
    await expect(
      StudentService.getLearnerProfile(orgBId, pupilAId)
    ).rejects.toThrow(/Learner not found/i);
  });

  it('School B ledger queries must never return School A financial entries', async () => {
    const schoolBStatements = await FinanceService.getLearnerStatement(orgBId, pupilAId);
    expect(schoolBStatements.entries.length).toBe(0);
    expect(schoolBStatements.invoices.length).toBe(0);
  });
});
