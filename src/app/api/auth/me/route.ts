// GET /api/auth/me
import { NextResponse } from 'next/server';
import { extractSessionToken, verifyToken } from '@/server/auth';
import { getPersonaForRole, PERSONA_DEFINITIONS } from '@/server/authorization';
import { prisma } from '@/server/db';

export async function GET(req: Request) {
  try {
    const token = extractSessionToken(req.headers);

    if (!token) {
      return NextResponse.json({ success: false, message: 'Authorization token or session cookie missing.' }, { status: 401 });
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
          },
        },
        staff: true,
        guardian: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ success: false, message: 'User account not found, deactivated, or locked.' }, { status: 401 });
    }

    const personaType = getPersonaForRole(user.role);
    const personaMeta = PERSONA_DEFINITIONS[personaType];

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        persona: personaMeta,
        organisation: user.organisation,
        campusId: user.staff?.campusId,
        guardianId: user.guardian?.id,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

