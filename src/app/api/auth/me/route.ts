// GET /api/auth/me
import { NextResponse } from 'next/server';
import { extractAuthHeader, verifyToken } from '@/server/auth';
import { prisma } from '@/server/db';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = extractAuthHeader(authHeader);

    if (!token) {
      return NextResponse.json({ success: false, message: 'Authorization token missing.' }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Invalid or expired session token.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        organisation: {
          include: {
            campuses: true,
            subscriptions: { where: { status: 'ACTIVE' }, take: 1 },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ success: false, message: 'User not found or disabled.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organisation: user.organisation,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
