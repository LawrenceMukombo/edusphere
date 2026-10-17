// GET /api/finance/learners/[id]/payments
import { NextResponse } from 'next/server';
import { FinanceService } from '@/server/services/finance.service';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const learnerId = params.id;
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId) {
      const learner = await prisma.learner.findUnique({
        where: { id: learnerId },
        select: { organisationId: true },
      });
      orgId = learner?.organisationId || null;
    }

    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Learner not found.' }, { status: 404 });
    }

    const history = await FinanceService.getLearnerPaymentHistory(orgId, learnerId);
    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
