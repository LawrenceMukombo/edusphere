// src/app/api/admin/users/[id]/reset-password/route.ts — Enterprise Admin Password Reset API
import { NextRequest, NextResponse } from 'next/server';
import { extractSessionToken, verifyToken } from '@/server/auth';
import { UserManagementService } from '@/server/services/userManagement.service';

export const dynamic = 'force-dynamic';

function getSession(req: NextRequest) {
  const token =
    extractSessionToken(req.headers) ||
    req.cookies.get('nwuchas_cmis_session')?.value ||
    req.cookies.get('edusphere_session')?.value ||
    req.cookies.get('token')?.value;

  if (!token) return null;
  return verifyToken(token);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const mode = body.mode === 'MANUAL' ? 'MANUAL' : 'AUTO_OTP';
    const newPassword = body.newPassword || undefined;

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const result = await UserManagementService.resetUserPassword(session, {
      targetUserId: params.id,
      mode,
      newPassword,
      ipAddress,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    const isForbidden = error.message?.includes('Unauthorized') || error.message?.includes('Access Denied');
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to reset password.' },
      { status: isForbidden ? 403 : 500 }
    );
  }
}
