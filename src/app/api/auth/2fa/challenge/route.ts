// POST /api/auth/2fa/challenge
// Initiates an institutional 2FA challenge for a sensitive module
import { NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth';
import { MfaService } from '@/server/mfa.service';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await requireAuth(req);

    // Fetch user details for phone / mfa preference
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, phone: true, mfaEnabled: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User record not found.' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const targetModule = typeof body?.targetModule === 'string' ? body.targetModule : 'finance';

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';

    const challenge = await MfaService.createChallenge({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      targetModule,
      ipAddress: clientIp,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: `Verification code dispatched to ${challenge.maskedPhone} and ${challenge.maskedEmail}`,
      data: challenge,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to initiate 2FA challenge.' },
      { status }
    );
  }
}
