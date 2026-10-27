// POST /api/auth/2fa/revoke
// Allows the user to manually lock sensitive module access (revokes isMfaVerified elevation)
import { NextResponse } from 'next/server';
import { requireAuth, signToken, SESSION_COOKIE_NAME, LEGACY_SESSION_COOKIE_NAME } from '@/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await requireAuth(req);

    const downgradedSession = {
      ...session,
      isMfaVerified: false,
      mfaVerifiedAt: undefined,
    };

    const token = signToken(downgradedSession);

    const response = NextResponse.json({
      success: true,
      message: 'High security elevation revoked. Sensitive modules will require 2FA verification.',
      data: { isMfaVerified: false },
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
    const status = error.statusCode || 500;
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to revoke 2FA elevation.' },
      { status }
    );
  }
}
