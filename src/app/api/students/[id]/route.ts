// GET /api/students/[id]
import { NextResponse } from 'next/server';
import { StudentService } from '@/server/services/student.service';
import { extractAuthHeader, verifyToken } from '@/server/auth';
import { prisma } from '@/server/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const learnerId = params.id;
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId) {
      // Lookup the learner's organisation directly for permissive demo/testing
      const learner = await prisma.learner.findUnique({
        where: { id: learnerId },
        select: { organisationId: true },
      });
      orgId = learner?.organisationId || null;
    }

    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Learner not found.' }, { status: 404 });
    }

    const profile = await StudentService.getLearnerProfile(orgId, learnerId);
    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 404 });
  }
}
