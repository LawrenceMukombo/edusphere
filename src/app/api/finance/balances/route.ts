// src/app/api/finance/balances/route.ts — Pure Database-Backed Fee Ledger Balances API
import { NextResponse } from 'next/server';
import { FinanceService } from '@/server/services/finance.service';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgCode = searchParams.get('orgCode');
    const classId = searchParams.get('classId') || undefined;
    const search = searchParams.get('search') || undefined;
    const campus = searchParams.get('campus') || undefined;
    const status = searchParams.get('status') || undefined;

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
      return NextResponse.json({ success: true, data: [], totalCount: 0 });
    }

    const balances = await FinanceService.getAllLearnersFeeBalances(orgId, { classId, status, search });

    let filteredBalances = balances;
    if (campus && campus !== 'ALL') {
      filteredBalances = filteredBalances.filter(
        (b: any) => b.campusId === campus || b.campusName?.toLowerCase().includes(campus.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredBalances,
      totalCount: filteredBalances.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error retrieving fee balances' },
      { status: 500 }
    );
  }
}
