// POST /api/auth/login
import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { verifyPassword, signToken, SESSION_COOKIE_NAME, LEGACY_SESSION_COOKIE_NAME } from '@/server/auth';
import { getPersonaForRole, PERSONA_DEFINITIONS } from '@/server/authorization';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        organisation: true,
        staff: true,
        guardian: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials or inactive account.' }, { status: 401 });
    }

    const userStatus = (user as any).status || (user.isActive ? 'ACTIVE' : 'SUSPENDED');

    if ((user as any).isDeleted || userStatus === 'DELETED') {
      return NextResponse.json(
        { success: false, message: 'This account has been archived. Please contact the Registrar or IT Administrator.' },
        { status: 403 }
      );
    }

    if (userStatus === 'LOCKED') {
      const lockReason = (user as any).lockedReason || 'Account locked due to security policy or excessive failed login attempts.';
      return NextResponse.json(
        { success: false, message: `Access Blocked: ${lockReason} Please contact an administrator to unlock your credentials.` },
        { status: 403 }
      );
    }

    if (userStatus === 'SUSPENDED' || !user.isActive) {
      const suspendReason = (user as any).statusReason || 'Administrative suspension or leave.';
      return NextResponse.json(
        { success: false, message: `Access Suspended: ${suspendReason} Please consult the Executive Principal or Registrar.` },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      const newFailedAttempts = ((user as any).failedLoginAttempts || 0) + 1;
      const shouldLock = newFailedAttempts >= 5;

      // Update failed attempts and auto-lock if exceeded
      try {
        await (prisma as any).user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: newFailedAttempts,
            ...(shouldLock
              ? {
                  status: 'LOCKED',
                  isActive: false,
                  lockedAt: new Date(),
                  lockedReason: 'Account auto-locked after 5 consecutive failed login attempts.',
                }
              : {}),
          },
        });
      } catch {}

      // Record failed login audit event
      if (user.organisationId) {
        try {
          await prisma.auditEvent.create({
            data: {
              organisationId: user.organisationId,
              userId: user.id,
              action: shouldLock ? 'SECURITY_ACCOUNT_AUTOLOCKED' : 'SECURITY_LOGIN_FAILED',
              entityType: 'UserSession',
              entityId: user.id,
              detailsJson: JSON.stringify({
                email: cleanEmail,
                reason: shouldLock ? '5 failed attempts exceeded' : 'Invalid password',
                failedAttempts: newFailedAttempts,
              }),
            },
          });
        } catch {}
      }

      if (shouldLock) {
        return NextResponse.json(
          { success: false, message: 'Too many failed login attempts. Your account has been locked for security. Please contact IT Administrator.' },
          { status: 403 }
        );
      }

      return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
    }

    // Reset failed login attempts and update lastLoginAt
    await (prisma as any).user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
      },
    });

    // Record successful login audit event
    if (user.organisationId) {
      try {
        await prisma.auditEvent.create({
          data: {
            organisationId: user.organisationId,
            userId: user.id,
            action: 'SECURITY_LOGIN_SUCCESS',
            entityType: 'UserSession',
            entityId: user.id,
            detailsJson: JSON.stringify({ email: cleanEmail, role: user.role }),
          },
        });
      } catch {}
    }

    const personaType = getPersonaForRole(user.role);
    const personaMeta = PERSONA_DEFINITIONS[personaType];

    // Enforce 3-Month (90-Day) Password Rotation Policy for College Owner / Super Admin
    const isOwnerAccount =
      user.email === 'owner@nwuchas.edu.zm' ||
      user.email === 'proprietor@nwuchas.edu.zm' ||
      user.role === 'PLATFORM_SUPER_ADMIN';

    const rotationPeriodDays = 90; // Mandatory 3 months (90 days)
    const lastChanged = (user as any).passwordLastChangedAt
      ? new Date((user as any).passwordLastChangedAt).getTime()
      : new Date(user.createdAt).getTime();
    const ageDays = Math.floor((Date.now() - lastChanged) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, rotationPeriodDays - ageDays);
    const mustChangePassword = (user as any).mustChangePassword || ageDays >= rotationPeriodDays;

    const token = signToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organisationId: user.organisationId,
      organisationCode: user.organisation?.code,
      organisationName: user.organisation?.name,
      guardianId: user.guardian?.id,
      campusId: user.staff?.campusId,
      isSuperAdmin: isOwnerAccount,
      mustChangePassword,
      passwordDaysRemaining: daysRemaining,
    });

    const response = NextResponse.json({
      success: true,
      message: mustChangePassword
        ? 'Mandatory 3-month security cycle: Password change required.'
        : 'Login successful.',
      mustChangePassword,
      passwordDaysRemaining: daysRemaining,
      data: {
        token,
        persona: personaMeta,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organisationId: user.organisationId,
          organisationName: user.organisation?.name,
          organisationCode: user.organisation?.code,
          defaultRoute: personaMeta.defaultRoute,
          isSuperAdmin: isOwnerAccount,
          mustChangePassword,
          passwordDaysRemaining: daysRemaining,
          nextRotationDue: new Date(lastChanged + rotationPeriodDays * 86400000).toISOString(),
        },
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 28800,
      secure: process.env.NODE_ENV === 'production',
    });

    response.cookies.set(LEGACY_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 28800,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error: any) {
    console.error('[AUTH_LOGIN_ERROR]', error?.message || error);
    return NextResponse.json(
      {
        success: false,
        message: 'Authentication service is temporarily unavailable. Please verify connection and try again.',
      },
      { status: 500 }
    );
  }
}

