// GET /api/auth/2fa/status
// Returns the current 2FA verification status and security profile of the session
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { prisma } from '@/server/db';
import { SENSITIVE_MODULE_POLICIES } from '@/lib/sensitiveModules';
import { MfaService } from '@/server/mfa.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await authenticateRequest(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        mfaEnabled: true,
      },
    });

    const mfaEnforced = await MfaService.isMfaEnforced(session.organisationId || undefined);

    return NextResponse.json({
      success: true,
      data: {
        userId: session.userId,
        email: session.email,
        role: session.role,
        isMfaVerified: Boolean(session.isMfaVerified),
        mfaVerifiedAt: session.mfaVerifiedAt || null,
        mfaConfigured: Boolean(user?.mfaEnabled),
        mfaEnforced,
        hasPhoneConfigured: Boolean(user?.phone),
        sensitiveModules: Object.keys(SENSITIVE_MODULE_POLICIES),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get 2FA status.' },
      { status: 500 }
    );
  }
}
