// POST /api/auth/change-password
// Enforces 90-Day (3-Month) Mandatory Password Rotation for College Owner / Super Admin
import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import {
  extractSessionToken,
  verifyToken,
  verifyPassword,
  hashPassword,
} from '@/server/auth';

export async function POST(req: Request) {
  try {
    const token = extractSessionToken(req.headers);
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, message: 'Invalid or expired session.' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'New password and confirmation do not match.' },
        { status: 400 }
      );
    }

    // Enterprise Password Policy Enforcement (Mandatory for Super Admin / Owner)
    if (newPassword.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 10 characters long.' },
        { status: 400 }
      );
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Password must include uppercase, lowercase, numerical, and special characters (#$@!%&*).',
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User account not found.' }, { status: 404 });
    }

    // Verify current password
    const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, message: 'Current password verification failed.' },
        { status: 400 }
      );
    }

    // Prevent immediate password reuse
    const isSamePassword = await verifyPassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      return NextResponse.json(
        { success: false, message: 'New password cannot be identical to your current password.' },
        { status: 400 }
      );
    }

    const newPasswordHash = await hashPassword(newPassword);
    const now = new Date();

    // Update user record with refreshed password and 3-month rotation clock
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        passwordLastChangedAt: now,
        mustChangePassword: false,
      },
    });

    // Audit trail logging
    if (user.organisationId) {
      try {
        await prisma.auditEvent.create({
          data: {
            organisationId: user.organisationId,
            userId: user.id,
            action: 'SECURITY_PASSWORD_ROTATED',
            entityType: 'UserSecurityProfile',
            entityId: user.id,
            detailsJson: JSON.stringify({
              email: user.email,
              role: user.role,
              policy: 'MANDATORY_90_DAY_ROTATION',
              rotatedAt: now.toISOString(),
              nextRotationDue: new Date(now.getTime() + 90 * 86400000).toISOString(),
            }),
          },
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: 'Password successfully updated. Your new 3-month security cycle is now active.',
      data: {
        lastChangedAt: now.toISOString(),
        nextRotationDue: new Date(now.getTime() + 90 * 86400000).toISOString(),
        daysRemaining: 90,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error while rotating password.' },
      { status: 500 }
    );
  }
}
