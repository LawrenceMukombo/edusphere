// GET & POST /api/finance/payments
import { NextResponse } from 'next/server';
import { FinanceService } from '@/server/services/finance.service';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';

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
      const defaultOrg = await prisma.organisation.findFirst({ orderBy: { createdAt: 'asc' } });
      orgId = defaultOrg?.id || null;
    }

    const payments = await prisma.payment.findMany({
      where: { organisationId: orgId || undefined },
      include: {
        learner: true,
        receipt: true,
        allocations: { include: { invoice: true } },
      },
      orderBy: { receivedDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: payments });
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
    if (!orgId) {
      const defaultOrg = await prisma.organisation.findFirst({ orderBy: { createdAt: 'asc' } });
      orgId = defaultOrg?.id;
    }

    const payment = await FinanceService.recordPayment({
      organisationId: orgId,
      learnerId: body.learnerId,
      invoiceId: body.invoiceId,
      paymentNumber: body.paymentNumber || `PAY-${Date.now().toString().slice(-6)}`,
      receiptNumber: body.receiptNumber || `REC-${Date.now().toString().slice(-6)}`,
      amount: Number(body.amount),
      paymentMethod: body.paymentMethod,
      referenceNumber: body.referenceNumber,
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment recorded, receipt generated, and ledger updated.',
      data: payment,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
