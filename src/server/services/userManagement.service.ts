// src/server/services/userManagement.service.ts — Enterprise User Lifecycle, Status & Audit Service
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { AuthSession } from '../auth';
import { hasPermission } from '../authorization';
import { SystemRole } from '@prisma/client';

export type UserLifecycleStatus = 'ACTIVE' | 'SUSPENDED' | 'LOCKED' | 'DELETED';

export interface ChangeStatusInput {
  targetUserId: string;
  newStatus: UserLifecycleStatus;
  reason: string;
  suspendedUntil?: string | null;
  ipAddress?: string;
}

export interface ResetPasswordInput {
  targetUserId: string;
  mode: 'AUTO_OTP' | 'MANUAL';
  newPassword?: string;
  ipAddress?: string;
}

export class UserManagementService {
  /**
   * Check if current session has admin rights to manage users
   */
  static assertCanManageUsers(session: AuthSession): void {
    if (session.isSuperAdmin || session.role === SystemRole.PLATFORM_SUPER_ADMIN || session.role === SystemRole.SCHOOL_PROPRIETOR) {
      return;
    }
    const hasAdminPerm =
      hasPermission(session.role, 'institution:manage') ||
      hasPermission(session.role, 'system:configure') ||
      session.role === SystemRole.INSTITUTION_ADMIN ||
      session.role === SystemRole.IT_ADMIN;

    if (!hasAdminPerm) {
      throw new Error('Unauthorized: You do not have administrative authority to manage user accounts.');
    }
  }

  /**
   * Generate an enterprise cryptographic 12-char OTP password (e.g., NWU-aB3!kL9#)
   */
  static generateSecureOtp(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let otp = 'NWU-';
    const randomBytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
      otp += chars[randomBytes[i] % chars.length];
    }
    return otp;
  }

  /**
   * Validate password complexity (Min 10 chars, uppercase, lowercase, number, symbol)
   */
  static validatePasswordComplexity(password: string): { valid: boolean; error?: string } {
    if (!password || password.length < 10) {
      return { valid: false, error: 'Password must be at least 10 characters in length.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one number (0-9).' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one special character (!@#$%^&*).' };
    }
    return { valid: true };
  }

  /**
   * List all user accounts in organisation with rich staff, department, and lifecycle metadata
   */
  static async listUsers(
    session: AuthSession,
    filters?: {
      search?: string;
      role?: string;
      status?: string;
      campusId?: string;
      departmentId?: string;
      includeDeleted?: boolean;
    }
  ) {
    this.assertCanManageUsers(session);

    const orgId = session.organisationId;
    const search = filters?.search?.toLowerCase().trim();
    const roleFilter = filters?.role && filters.role !== 'ALL' ? filters.role : undefined;
    const statusFilter = filters?.status && filters.status !== 'ALL' ? filters.status : undefined;
    const includeDeleted = !!filters?.includeDeleted;

    const whereClause: any = {
      ...(orgId ? { organisationId: orgId } : {}),
      ...(roleFilter ? { role: roleFilter as SystemRole } : {}),
      ...(statusFilter ? { status: statusFilter } : includeDeleted ? {} : { isDeleted: false }),
    };

    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { staff: { staffNumber: { contains: search, mode: 'insensitive' } } },
        { staff: { jobTitle: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const p = prisma as any;
    const users = await p.user.findMany({
      where: whereClause,
      include: {
        staff: {
          include: {
            campus: { select: { id: true, name: true, code: true } },
          },
        },
        organisation: { select: { id: true, code: true, name: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return users.map((u: any) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      fullName: `${u.firstName} ${u.lastName}`,
      phone: u.phone || u.staff?.phone || '',
      role: u.role,
      status: (u.status || (u.isActive ? 'ACTIVE' : 'SUSPENDED')) as UserLifecycleStatus,
      statusReason: u.statusReason || null,
      statusChangedAt: u.statusChangedAt || null,
      statusChangedBy: u.statusChangedBy || null,
      isActive: u.isActive,
      isDeleted: !!u.isDeleted,
      deletedAt: u.deletedAt || null,
      deletedReason: u.deletedReason || null,
      lockedAt: u.lockedAt || null,
      lockedReason: u.lockedReason || null,
      suspendedUntil: u.suspendedUntil || null,
      mfaEnabled: !!u.mfaEnabled,
      mustChangePassword: !!u.mustChangePassword,
      lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
      lastPasswordResetAt: u.lastPasswordResetAt ? new Date(u.lastPasswordResetAt).toISOString() : null,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
      staffNumber: u.staff?.staffNumber || null,
      jobTitle: u.staff?.jobTitle || null,
      departmentName: u.staff?.jobTitle ? `${u.staff.jobTitle} Division` : 'Institutional Operations',
      campusName: u.staff?.campus?.name || 'Manyama Main Campus',
      isProtectedAccount:
        u.email === 'owner@nwuchas.edu.zm' ||
        u.role === 'PLATFORM_SUPER_ADMIN' ||
        u.role === 'SCHOOL_PROPRIETOR',
    }));
  }

  /**
   * Change user lifecycle status (Suspend, Lock, Reactivate, Soft-Delete)
   */
  static async changeUserStatus(session: AuthSession, input: ChangeStatusInput) {
    this.assertCanManageUsers(session);

    if (!input.reason || input.reason.trim().length < 3) {
      throw new Error('A valid explanatory reason is strictly required for institutional status changes.');
    }

    const p = prisma as any;
    const targetUser = await p.user.findUnique({
      where: { id: input.targetUserId },
      include: { staff: true },
    });

    if (!targetUser) {
      throw new Error('Target user account not found.');
    }

    // Separation of Powers: Cannot modify own account status
    if (targetUser.id === session.userId) {
      throw new Error('Administrative violation: You cannot suspend, lock, or delete your own account.');
    }

    // Hierarchy Protection: Regular admins cannot modify Super Admin / College Owner
    const isTargetOwner =
      targetUser.email === 'owner@nwuchas.edu.zm' ||
      targetUser.role === 'PLATFORM_SUPER_ADMIN' ||
      targetUser.role === 'SCHOOL_PROPRIETOR';

    if (isTargetOwner && !session.isSuperAdmin && session.role !== 'PLATFORM_SUPER_ADMIN') {
      throw new Error('Access Denied: The College Owner Super Admin account can only be managed by authorized ownership credentials.');
    }

    const actorEmail = session.email;
    const previousStatus = targetUser.status || (targetUser.isActive ? 'ACTIVE' : 'SUSPENDED');
    const now = new Date();
    const updateData: any = {
      status: input.newStatus,
      statusReason: input.reason.trim(),
      statusChangedAt: now,
      statusChangedBy: actorEmail,
      updatedAt: now,
    };

    let actionLabel = 'USER_STATUS_UPDATED';

    switch (input.newStatus) {
      case 'ACTIVE':
        updateData.isActive = true;
        updateData.isDeleted = false;
        updateData.lockedAt = null;
        updateData.lockedReason = null;
        updateData.suspendedUntil = null;
        updateData.failedLoginAttempts = 0;
        actionLabel = 'USER_REACTIVATED';
        break;

      case 'SUSPENDED':
        updateData.isActive = false;
        updateData.suspendedUntil = input.suspendedUntil ? new Date(input.suspendedUntil) : null;
        actionLabel = 'USER_SUSPENDED';
        break;

      case 'LOCKED':
        updateData.isActive = false;
        updateData.lockedAt = now;
        updateData.lockedReason = input.reason.trim();
        actionLabel = 'USER_LOCKED';
        break;

      case 'DELETED':
        // Soft delete: never purge database records
        updateData.isActive = false;
        updateData.isDeleted = true;
        updateData.deletedAt = now;
        updateData.deletedBy = actorEmail;
        updateData.deletedReason = input.reason.trim();
        actionLabel = 'USER_SOFT_DELETED';
        break;

      default:
        throw new Error(`Invalid status: ${input.newStatus}`);
    }

    // Persist update
    const updated = await p.user.update({
      where: { id: targetUser.id },
      data: updateData,
    });



    // Log comprehensive audit record
    try {
      await p.auditEvent.create({
        data: {
          organisationId: targetUser.organisationId || session.organisationId,
          userId: session.userId,
          action: actionLabel,
          entityType: 'User',
          entityId: targetUser.id,
          detailsJson: JSON.stringify({
            previousStatus,
            newStatus: input.newStatus,
            reason: input.reason.trim(),
            suspendedUntil: input.suspendedUntil || null,
            targetEmail: targetUser.email,
            targetName: `${targetUser.firstName} ${targetUser.lastName}`,
            actorEmail,
            actorRole: session.role,
            ipAddress: input.ipAddress || null,
            isSoftDelete: input.newStatus === 'DELETED',
          }),
          ipAddress: input.ipAddress || null,
        },
      });
    } catch (auditErr) {
      console.warn('[AUDIT_LOG_ERROR]', auditErr);
    }

    return {
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        status: updated.status,
        isActive: updated.isActive,
        isDeleted: updated.isDeleted,
        statusReason: updated.statusReason,
        statusChangedAt: updated.statusChangedAt,
        statusChangedBy: updated.statusChangedBy,
      },
      message: `Account status for "${targetUser.firstName} ${targetUser.lastName}" (${targetUser.email}) successfully updated to ${input.newStatus}.`,
    };
  }

  /**
   * Reset user password with auto-generated secure OTP or manual compliant password
   */
  static async resetUserPassword(session: AuthSession, input: ResetPasswordInput) {
    this.assertCanManageUsers(session);

    const p = prisma as any;
    const targetUser = await p.user.findUnique({
      where: { id: input.targetUserId },
    });

    if (!targetUser) {
      throw new Error('Target user account not found.');
    }

    // Hierarchy Guard
    const isTargetOwner =
      targetUser.email === 'owner@nwuchas.edu.zm' ||
      targetUser.role === 'PLATFORM_SUPER_ADMIN' ||
      targetUser.role === 'SCHOOL_PROPRIETOR';

    if (isTargetOwner && !session.isSuperAdmin && session.role !== 'PLATFORM_SUPER_ADMIN') {
      throw new Error('Access Denied: Only the College Owner Super Admin can reset owner credentials.');
    }

    let rawPassword = '';
    if (input.mode === 'AUTO_OTP') {
      rawPassword = this.generateSecureOtp();
    } else {
      if (!input.newPassword) {
        throw new Error('A replacement password must be provided for manual reset.');
      }
      const complexity = this.validatePasswordComplexity(input.newPassword);
      if (!complexity.valid) {
        throw new Error(complexity.error || 'Password does not meet institutional complexity standards.');
      }
      rawPassword = input.newPassword;
    }

    const passwordHash = await bcrypt.hash(rawPassword, 12);
    const now = new Date();

    const updated = await p.user.update({
      where: { id: targetUser.id },
      data: {
        passwordHash,
        mustChangePassword: true, // Forces immediate password change upon first sign-in
        passwordLastChangedAt: now,
        lastPasswordResetAt: now,
        lastPasswordResetBy: session.email,
        failedLoginAttempts: 0,
        // If account was locked due to password attempts, restore to active
        ...(targetUser.status === 'LOCKED' ? { status: 'ACTIVE', isActive: true, lockedAt: null, lockedReason: null } : {}),
      },
    });

    // Record audit event
    try {
      await p.auditEvent.create({
        data: {
          organisationId: targetUser.organisationId || session.organisationId,
          userId: session.userId,
          action: 'USER_PASSWORD_RESET',
          entityType: 'User',
          entityId: targetUser.id,
          detailsJson: JSON.stringify({
            resetMode: input.mode,
            targetEmail: targetUser.email,
            targetName: `${targetUser.firstName} ${targetUser.lastName}`,
            actorEmail: session.email,
            actorRole: session.role,
            mustChangeOnNextLogin: true,
            accountUnlocked: targetUser.status === 'LOCKED',
            ipAddress: input.ipAddress || null,
          }),
          ipAddress: input.ipAddress || null,
        },
      });
    } catch (auditErr) {
      console.warn('[AUDIT_LOG_ERROR]', auditErr);
    }

    return {
      success: true,
      temporaryPassword: rawPassword,
      mustChangePassword: true,
      message: `Password for "${targetUser.firstName} ${targetUser.lastName}" has been reset. Mandatory rotation on next login is enforced.`,
    };
  }

  /**
   * Retrieve complete chronological history / audit log for a specific user
   */
  static async getUserAuditHistory(session: AuthSession, targetUserId: string, limit = 50) {
    this.assertCanManageUsers(session);

    const p = prisma as any;
    const targetUser = await p.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!targetUser) {
      throw new Error('Target user not found.');
    }

    // Retrieve events where:
    // 1. entityId == targetUserId (Actions performed ON the user, like status change, password reset, role update)
    // 2. userId == targetUserId (Actions performed BY the user, like logins, data modifications)
    const events = await p.auditEvent.findMany({
      where: {
        OR: [
          { entityId: targetUserId },
          { userId: targetUserId },
        ],
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const formattedEvents = events.map((ev: any) => {
      let parsedDetails: any = {};
      if (ev.detailsJson) {
        try {
          parsedDetails = JSON.parse(ev.detailsJson);
        } catch {
          parsedDetails = { raw: ev.detailsJson };
        }
      }

      const isSelfAction = ev.userId === targetUserId;
      const actorLabel = isSelfAction
        ? 'User Self Action'
        : ev.user
        ? `${ev.user.firstName} ${ev.user.lastName} (${ev.user.role})`
        : 'System / Automated Engine';

      return {
        id: ev.id,
        timestamp: ev.createdAt.toISOString(),
        formattedDate: new Date(ev.createdAt).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        }),
        action: ev.action,
        entityType: ev.entityType,
        entityId: ev.entityId,
        actor: actorLabel,
        actorEmail: ev.user?.email || parsedDetails.actorEmail || 'system',
        ipAddress: ev.ipAddress || parsedDetails.ipAddress || '127.0.0.1',
        details: parsedDetails,
        isLifecycleEvent: [
          'USER_STATUS_UPDATED',
          'USER_SUSPENDED',
          'USER_LOCKED',
          'USER_REACTIVATED',
          'USER_SOFT_DELETED',
          'USER_PASSWORD_RESET',
          'SECURITY_LOGIN_SUCCESS',
          'SECURITY_LOGIN_FAILED',
        ].includes(ev.action),
      };
    });

    return {
      success: true,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: `${targetUser.firstName} ${targetUser.lastName}`,
        role: targetUser.role,
        status: targetUser.status || (targetUser.isActive ? 'ACTIVE' : 'SUSPENDED'),
        registeredAt: targetUser.createdAt,
        lastLoginAt: targetUser.lastLoginAt,
      },
      totalEvents: formattedEvents.length,
      auditTrail: formattedEvents,
    };
  }
}
