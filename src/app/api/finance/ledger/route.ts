// src/app/api/finance/ledger/route.ts — Pure Database-Backed General Ledger API
import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgCode = searchParams.get('orgCode');
    const learnerId = searchParams.get('learnerId') || undefined;

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

    const where: any = { organisationId: orgId };
    if (learnerId) where.learnerId = learnerId;

    const entries = await prisma.ledgerEntry.findMany({
      where,
      include: {
        invoice: true,
        payment: { include: { receipt: true } },
      },
      orderBy: { postedAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ success: true, data: entries, totalCount: entries.length });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error retrieving ledger entries' },
      { status: 500 }
    );
  }
}
