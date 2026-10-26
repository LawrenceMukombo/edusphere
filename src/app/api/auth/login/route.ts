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
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
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
    return NextResponse.json({ success: false, message: error.message || 'Authentication error.' }, { status: 500 });
  }
}

