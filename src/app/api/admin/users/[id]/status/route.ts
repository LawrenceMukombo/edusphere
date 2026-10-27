// src/app/api/admin/users/[id]/status/route.ts — Enterprise User Lifecycle Status Transitions
import { NextRequest, NextResponse } from 'next/server';
import { extractSessionToken, verifyToken } from '@/server/auth';
import { UserManagementService, UserLifecycleStatus } from '@/server/services/userManagement.service';

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { status, reason, suspendedUntil } = body;

    if (!status || !['ACTIVE', 'SUSPENDED', 'LOCKED', 'DELETED'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Permitted: ACTIVE, SUSPENDED, LOCKED, DELETED.' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: 'A descriptive reason (min 3 chars) is strictly required for status modifications.' },
        { status: 400 }
      );
    }

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const result = await UserManagementService.changeUserStatus(session, {
      targetUserId: params.id,
      newStatus: status as UserLifecycleStatus,
      reason: reason.trim(),
      suspendedUntil: suspendedUntil || null,
      ipAddress,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    const isForbidden =
      error.message?.includes('Unauthorized') ||
      error.message?.includes('Access Denied') ||
      error.message?.includes('Administrative violation');

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update user status.' },
      { status: isForbidden ? 403 : 500 }
    );
  }
}
