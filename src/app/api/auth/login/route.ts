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

    if (!user || !user.isActive) {
      return NextResponse.json({ success: false, message: 'Invalid credentials or inactive account.' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      // Record failed login audit event
      if (user.organisationId) {
        try {
          await prisma.auditEvent.create({
            data: {
              organisationId: user.organisationId,
              userId: user.id,
              action: 'SECURITY_LOGIN_FAILED',
              entityType: 'UserSession',
              entityId: user.id,
              detailsJson: JSON.stringify({ email: cleanEmail, reason: 'Invalid password' }),
            },
          });
        } catch {}
      }
      return NextResponse.json({ success: false, message: 'Invalid credentials or inactive account.' }, { status: 401 });
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
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

