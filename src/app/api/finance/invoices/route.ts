// GET & POST /api/finance/invoices
import { NextResponse } from 'next/server';
import { FinanceService } from '@/server/services/finance.service';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';

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
      const defaultOrg = await prisma.organisation.findFirst({ orderBy: { createdAt: 'asc' } });
      orgId = defaultOrg?.id || null;
    }

    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation context required.' }, { status: 400 });
    }

    const where: any = { organisationId: orgId };
    if (learnerId) where.learnerId = learnerId;

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        learner: true,
        lines: true,
        term: true,
      },
      orderBy: { issuedDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId || body.organisationId;
    if (!orgId && body.orgCode) {
      const org = await prisma.organisation.findUnique({ where: { code: body.orgCode } });
      orgId = org?.id;
    }
    if (!orgId) {
      const defaultOrg = await prisma.organisation.findFirst({ orderBy: { createdAt: 'asc' } });
      orgId = defaultOrg?.id;
    }

    const invoice = await FinanceService.issueInvoice({
      organisationId: orgId,
      learnerId: body.learnerId,
      termId: body.termId,
      invoiceNumber: body.invoiceNumber,
      dueDate: body.dueDate,
      idempotencyKey: body.idempotencyKey,
      lines: body.lines,
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice issued successfully and posted to ledger.',
      data: invoice,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
