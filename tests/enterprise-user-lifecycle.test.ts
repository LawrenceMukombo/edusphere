import { describe, it, expect, beforeAll } from 'vitest';
import { UserManagementService } from '../src/server/services/userManagement.service';
import { prisma } from '../src/server/db';
import { SystemRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

describe('NWUCHAS Enterprise User Lifecycle, Audit & Password Reset Engine', () => {
  let orgId: string;
  let adminSession: any;
  let targetUser: any;
  let ownerUser: any;

  beforeAll(async () => {
    const org = await prisma.organisation.findFirst();
    if (!org) throw new Error('No organisation found in database.');
    orgId = org.id;

    // Find or create test target user
    targetUser = await prisma.user.findFirst({
      where: { email: 'registrar@nwuchas.edu.zm' },
    });

    ownerUser = await prisma.user.findFirst({
      where: { email: 'owner@nwuchas.edu.zm' },
    });

    const adminUser = await prisma.user.findFirst({
      where: { email: 'principal@nwuchas.edu.zm' },
    });

    adminSession = {
      userId: adminUser?.id || 'admin-uuid',
      email: 'principal@nwuchas.edu.zm',
      firstName: 'Dr. Mwila',
      lastName: 'Chileshe',
      role: SystemRole.INSTITUTION_ADMIN,
      organisationId: orgId,
      isSuperAdmin: false,
    };
  });

  it('lists institutional users with rich lifecycle status and roles', async () => {
    const users = await UserManagementService.listUsers(adminSession, {
      role: 'ALL',
      status: 'ALL',
    });

    expect(users.length).toBeGreaterThan(0);
    const registrar = users.find((u: any) => u.email === 'registrar@nwuchas.edu.zm');
    expect(registrar).toBeDefined();
    expect(registrar?.status).toBeDefined();
    expect(registrar?.role).toBe(SystemRole.REGISTRAR);
  });

  it('suspends an active user with mandatory reason and logs audit event', async () => {
    if (!targetUser) return;

    const res = await UserManagementService.changeUserStatus(adminSession, {
      targetUserId: targetUser.id,
      newStatus: 'SUSPENDED',
      reason: 'Administrative leave pending clinical audit review.',
      ipAddress: '192.168.10.1',
    });

    expect(res.success).toBe(true);
    expect(res.user.status).toBe('SUSPENDED');
    expect(res.user.isActive).toBe(false);

    // Verify in database
    const dbUser = await prisma.user.findUnique({ where: { id: targetUser.id } });
    expect(dbUser?.isActive).toBe(false);
    expect((dbUser as any).status).toBe('SUSPENDED');
    expect((dbUser as any).statusReason).toBe('Administrative leave pending clinical audit review.');

    // Verify audit event
    const audit = await prisma.auditEvent.findFirst({
      where: {
        entityId: targetUser.id,
        action: 'USER_SUSPENDED',
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toBeDefined();
    expect(audit?.detailsJson).toContain('Administrative leave pending clinical audit review.');
  });

  it('locks a user for security policy violation and logs audit event', async () => {
    if (!targetUser) return;

    const res = await UserManagementService.changeUserStatus(adminSession, {
      targetUserId: targetUser.id,
      newStatus: 'LOCKED',
      reason: 'Security lock imposed after abnormal session activity.',
      ipAddress: '192.168.10.1',
    });

    expect(res.success).toBe(true);
    expect(res.user.status).toBe('LOCKED');
    expect(res.user.isActive).toBe(false);

    const dbUser = await prisma.user.findUnique({ where: { id: targetUser.id } });
    expect((dbUser as any).status).toBe('LOCKED');
    expect((dbUser as any).lockedAt).toBeDefined();
  });

  it('reactivates a user back to active status', async () => {
    if (!targetUser) return;

    const res = await UserManagementService.changeUserStatus(adminSession, {
      targetUserId: targetUser.id,
      newStatus: 'ACTIVE',
      reason: 'Investigation resolved satisfactorily. Credentials reinstated.',
      ipAddress: '192.168.10.1',
    });

    expect(res.success).toBe(true);
    expect(res.user.status).toBe('ACTIVE');
    expect(res.user.isActive).toBe(true);

    const dbUser = await prisma.user.findUnique({ where: { id: targetUser.id } });
    expect(dbUser?.isActive).toBe(true);
    expect((dbUser as any).status).toBe('ACTIVE');
    expect((dbUser as any).lockedAt).toBeNull();
  });

  it('enforces separation of powers: prevents admin from suspending or deleting own account', async () => {
    await expect(
      UserManagementService.changeUserStatus(adminSession, {
        targetUserId: adminSession.userId,
        newStatus: 'SUSPENDED',
        reason: 'Attempted self-suspension.',
      })
    ).rejects.toThrow('Administrative violation: You cannot suspend, lock, or delete your own account.');
  });

  it('enforces hierarchy protection: non-super admin cannot suspend or delete College Owner account', async () => {
    if (!ownerUser) return;

    await expect(
      UserManagementService.changeUserStatus(adminSession, {
        targetUserId: ownerUser.id,
        newStatus: 'SUSPENDED',
        reason: 'Attempted owner suspension by standard admin.',
      })
    ).rejects.toThrow('The College Owner Super Admin account can only be managed by authorized ownership credentials.');
  });

  it('resets a user password with auto-generated secure OTP and forces rotation on next login', async () => {
    if (!targetUser) return;

    const res = await UserManagementService.resetUserPassword(adminSession, {
      targetUserId: targetUser.id,
      mode: 'AUTO_OTP',
      ipAddress: '192.168.10.1',
    });

    expect(res.success).toBe(true);
    expect(res.temporaryPassword).toMatch(/^NWU-[A-Za-z0-9!@#$%&*]{8}$/);
    expect(res.mustChangePassword).toBe(true);

    // Verify database password hash matches generated OTP
    const dbUser = await prisma.user.findUnique({ where: { id: targetUser.id } });
    expect((dbUser as any)?.mustChangePassword).toBe(true);
    const matches = await bcrypt.compare(res.temporaryPassword, dbUser!.passwordHash);
    expect(matches).toBe(true);

    // Restore default password for test cleanliness
    const defaultHash = await bcrypt.hash('NWUCHAS-DEV-ONLY-CHANGE-ME', 12);
    await (prisma.user as any).update({
      where: { id: targetUser.id },
      data: { passwordHash: defaultHash, mustChangePassword: false },
    });
  });

  it('retrieves chronological user audit history containing lifecycle and security events', async () => {
    if (!targetUser) return;

    const history = await UserManagementService.getUserAuditHistory(adminSession, targetUser.id);
    expect(history.success).toBe(true);
    expect(history.user.email).toBe(targetUser.email);
    expect(history.auditTrail.length).toBeGreaterThan(0);

    const statusEvent = history.auditTrail.find((ev: any) => ev.action.includes('USER_'));
    expect(statusEvent).toBeDefined();
    expect(statusEvent?.actor).toBeDefined();
  });
});
