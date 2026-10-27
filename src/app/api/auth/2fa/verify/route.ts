// POST /api/auth/2fa/verify
// Validates 2FA code and elevates session with isMfaVerified: true
import { NextResponse } from 'next/server';
import { requireAuth, SESSION_COOKIE_NAME, LEGACY_SESSION_COOKIE_NAME } from '@/server/auth';
import { MfaService } from '@/server/mfa.service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await requireAuth(req);

    const body = await req.json().catch(() => ({}));
    const { challengeId, code } = body;

    if (!challengeId || typeof challengeId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Challenge ID is required.' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Verification code is required.' },
        { status: 400 }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';

    const result = await MfaService.verifyChallenge({
      challengeId,
      code,
      session,
      ipAddress: clientIp,
      userAgent,
    });

    if (!result.verified || !result.sessionToken) {
      return NextResponse.json(
        { success: false, message: result.error || 'Invalid verification code.' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Two-factor authentication verified successfully. High security access granted.',
      data: {
        isMfaVerified: true,
        verifiedAt: Date.now(),
        token: result.sessionToken,
      },
    });

    // Set updated session cookies with isMfaVerified: true
    response.cookies.set(SESSION_COOKIE_NAME, result.sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 28800,
      secure: process.env.NODE_ENV === 'production',
    });

    response.cookies.set(LEGACY_SESSION_COOKIE_NAME, result.sessionToken, {
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
      { success: false, message: error.message || 'Verification failed.' },
      { status }
    );
  }
}
