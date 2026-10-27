// src/app/api/admin/users/route.ts — Enterprise Admin Users API
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

export async function GET(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') || undefined;
    const campusId = searchParams.get('campusId') || undefined;
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const users = await UserManagementService.listUsers(session, {
      search,
      role,
      status,
      campusId,
      includeDeleted,
    });

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error: any) {
    const isAuth = error.message?.includes('Unauthorized') || error.message?.includes('Access Denied');
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to list users.' },
      { status: isAuth ? 403 : 500 }
    );
  }
}
