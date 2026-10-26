// POST /api/auth/logout
import { NextResponse } from 'next/server';
import { extractSessionToken, revokeToken, verifyToken, SESSION_COOKIE_NAME, LEGACY_SESSION_COOKIE_NAME } from '@/server/auth';
import { prisma } from '@/server/db';

export async function POST(req: Request) {
  try {
    const token = extractSessionToken(req.headers);
    if (token) {
      const session = verifyToken(token);
      revokeToken(token);

      if (session && session.organisationId) {
        try {
          await prisma.auditEvent.create({
            data: {
              organisationId: session.organisationId,
              userId: session.userId,
              action: 'SECURITY_LOGOUT',
              entityType: 'UserSession',
              entityId: session.userId,
              detailsJson: JSON.stringify({
                email: session.email,
                role: session.role,
                timestamp: new Date().toISOString(),
              }),
            },
          });
        } catch (auditErr) {
          console.warn('Could not record logout audit event:', auditErr);
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully. Session revoked.',
    });

    // Clear session cookies
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      secure: process.env.NODE_ENV === 'production',
    });

    response.cookies.set(LEGACY_SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Logout failed.' },
      { status: 500 }
    );
  }
}
