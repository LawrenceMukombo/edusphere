// src/app/api/finance/reports/route.ts — Pure Database-Backed Financial Reports API
import { NextResponse } from 'next/server';
import { FinanceService } from '@/server/services/finance.service';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgCode = searchParams.get('orgCode');

    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId && orgCode) {
      const org = await prisma.organisation.findUnique({ where: { code: orgCode } });
      orgId = org?.id || null;
    }
    if (!orgId) {
      const nwuchasOrg = await prisma.organisation.findFirst({
        where: { code: 'NWUCHAS' },
      });
      orgId = nwuchasOrg?.id || null;
    }

    if (!orgId) {
      return NextResponse.json({
        success: true,
        data: {
          totals: { totalBilled: 0, totalCollected: 0, totalOutstanding: 0, overallCollectionRate: 0 },
          cashbook: [],
          categoryRevenue: [],
          classComparison: [],
          ageingSummary: { current: 0, days31to60: 0, days61to90: 0, over90days: 0, totalOutstanding: 0 },
        },
      });
    }

    const reports = await FinanceService.getFinancialReports(orgId);
    return NextResponse.json({ success: true, data: reports });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error generating financial reports' },
      { status: 500 }
    );
  }
}
