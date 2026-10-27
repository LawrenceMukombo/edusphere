// src/app/api/admin/users/[id]/audit/route.ts — User Audit History API
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const history = await UserManagementService.getUserAuditHistory(session, params.id, limit);

    return NextResponse.json(history);
  } catch (error: any) {
    const isAuth = error.message?.includes('Unauthorized') || error.message?.includes('Access Denied');
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch user audit history.' },
      { status: isAuth ? 403 : 500 }
    );
  }
}
