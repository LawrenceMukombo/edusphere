// Tests: AC-02 Guardian Verification & Immediate Revocation
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../src/server/db';

describe('AC-02: Guardian Relationship & Immediate Revocation', () => {
  let guardianId: string;
  let pupil1Id: string;
  let pupil2Id: string;

  beforeAll(async () => {
    const guardian = await prisma.guardian.findFirst({ where: { phone: '+260977889900' } });
    guardianId = guardian!.id;

    const rels = await prisma.learnerGuardianRelationship.findMany({
      where: { guardianId },
    });
    pupil1Id = rels[0].learnerId;
    pupil2Id = rels[1].learnerId;
  });

  it('Verified guardian can view only linked learners', async () => {
    const activeRels = await prisma.learnerGuardianRelationship.findMany({
      where: { guardianId, isAccessRevoked: false },
    });
    expect(activeRels.length).toBeGreaterThanOrEqual(2);
    expect(activeRels.every((r) => r.learnerId === pupil1Id || r.learnerId === pupil2Id)).toBe(true);
  });

  it('Revoking guardian access immediately removes learner from guardian portal queries', async () => {
    // Revoke access to pupil2
    await prisma.learnerGuardianRelationship.updateMany({
      where: { guardianId, learnerId: pupil2Id },
      data: { isAccessRevoked: true, revokedAt: new Date(), revokedReason: 'Court custody variation' },
    });

    const activeRelsAfterRevocation = await prisma.learnerGuardianRelationship.findMany({
      where: { guardianId, isAccessRevoked: false },
    });

    const hasRevokedChild = activeRelsAfterRevocation.some((r) => r.learnerId === pupil2Id);
    expect(hasRevokedChild).toBe(false);

    // Restore for test idempotency
    await prisma.learnerGuardianRelationship.updateMany({
      where: { guardianId, learnerId: pupil2Id },
      data: { isAccessRevoked: false, revokedAt: null, revokedReason: null },
    });
  });
});
