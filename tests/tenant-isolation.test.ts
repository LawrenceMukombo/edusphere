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
    // Retrieve NWUCHAS primary organisation
    let orgA = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
    if (!orgA) {
      orgA = await prisma.organisation.create({
        data: {
          code: 'NWUCHAS',
          name: 'North Western University College of Health and Applied Sciences',
          email: 'info@nwuchas.edu.zm',
          phone: '+260977000001',
        },
      });
    }

    // Retrieve or create an isolated comparison organisation for multi-tenant isolation testing
    let orgB = await prisma.organisation.findUnique({ where: { code: 'TEST-ISOLATION-ORG' } });
    if (!orgB) {
      orgB = await prisma.organisation.create({
        data: {
          code: 'TEST-ISOLATION-ORG',
          name: 'External Test Entity',
          email: 'test@isolation.org',
          phone: '+260977000002',
        },
      });
    }

    orgAId = orgA.id;
    orgBId = orgB.id;

    // Ensure campus exists for orgA
    let campus = await prisma.campus.findFirst({ where: { organisationId: orgAId } });
    if (!campus) {
      campus = await prisma.campus.create({
        data: {
          organisationId: orgAId,
          code: 'MAIN',
          name: 'Main Campus',
        },
      });
    }

    // Retrieve a learner from primary organisation
    let pupilA = await prisma.learner.findFirst({ where: { organisationId: orgAId } });
    if (!pupilA) {
      pupilA = await prisma.learner.create({
        data: {
          organisationId: orgAId,
          campusId: campus.id,
          studentNumber: 'TEST-STU-001',
          firstName: 'Isolation',
          lastName: 'Tester',
          gender: 'MALE',
          dateOfBirth: new Date('2000-01-01'),
          status: 'ENROLLED',
        },
      });
    }
    pupilAId = pupilA.id;
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
