// GET /api/finance/balances
import { NextResponse } from 'next/server';
import { FinanceService } from '@/server/services/finance.service';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgCode = searchParams.get('orgCode');
    const classId = searchParams.get('classId') || undefined;
    const search = searchParams.get('search') || undefined;

    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId && orgCode) {
      const org = await prisma.organisation.findUnique({ where: { code: orgCode } });
      orgId = org?.id || null;
    }
    if (!orgId) {
      const defaultOrg = await prisma.organisation.findFirst({ orderBy: { createdAt: 'asc' } });
      orgId = defaultOrg?.id || null;
    }

    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation context required.' }, { status: 400 });
    }

    const balances = await FinanceService.getAllLearnersFeeBalances(orgId, { classId, search });
    return NextResponse.json({ success: true, data: balances });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
