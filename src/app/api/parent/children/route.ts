// GET /api/parent/children
import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let guardianId: string | null = null;

    if (session?.userId) {
      const guardian = await prisma.guardian.findUnique({
        where: { userId: session.userId },
      });
      guardianId = guardian?.id || null;
    }

    // Fallback for demo/testing: get the first verified guardian
    if (!guardianId) {
      const defaultGuardian = await prisma.guardian.findFirst({
        where: { isVerified: true },
      });
      guardianId = defaultGuardian?.id || null;
    }

    if (!guardianId) {
      return NextResponse.json({ success: false, message: 'Guardian profile not found.' }, { status: 404 });
    }

    // Retrieve active (non-revoked) relationships
    const relationships = await prisma.learnerGuardianRelationship.findMany({
      where: {
        guardianId,
        isAccessRevoked: false, // Strict AC-02 compliance: revoked access blocked immediately
      },
      include: {
        learner: {
          include: {
            currentClass: true,
            campus: { include: { organisation: true } },
            reportCards: {
              where: { status: 'PUBLISHED' },
              orderBy: { versionNumber: 'desc' },
              take: 1,
            },
            invoices: {
              where: { status: { in: ['ISSUED', 'PARTIALLY_PAID'] } },
              orderBy: { issuedDate: 'desc' },
            },
            attendanceRecords: {
              take: 10,
              include: { session: true },
              orderBy: { session: { date: 'desc' } },
            },
          },
        },
      },
    });

    const children = relationships.map((r) => ({
      relationshipId: r.id,
      relationshipType: r.relationship,
      hasFinancialAuthority: r.hasFinancialAuthority,
      learner: r.learner,
    }));

    return NextResponse.json({ success: true, data: children });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
