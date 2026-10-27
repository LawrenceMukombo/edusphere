import { NextRequest, NextResponse } from 'next/server';
import { extractSessionToken, verifyToken } from '@/server/auth';
import { LamtonPayService } from '@/server/payments/lamtonpay.service';
import { MobileMoneyService } from '@/server/payments/mobileMoney.service';
import { prisma } from '@/server/db';
import { PaymentChannel } from '@prisma/client';

export async function GET(req: NextRequest) {
  const token = extractSessionToken(req.headers);
  const session = token ? verifyToken(token) : null;
  const fallbackOrg =
    (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } })) ||
    (await prisma.organisation.findFirst());
  const organisationId = session?.organisationId || fallbackOrg?.id;
  if (!organisationId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const learnerId = searchParams.get('learnerId') || undefined;
  const status = (searchParams.get('status') as any) || undefined;
  const p = prisma as any;

  try {
    const intents = await LamtonPayService.listIntents(organisationId, {
      learnerId,
      status,
    });

    const learners = await p.learner.findMany({
      select: { id: true, studentNumber: true, firstName: true, lastName: true },
      orderBy: { studentNumber: 'asc' },
      take: 60,
    });

    const invoices = await p.invoice.findMany({
      where: { balance: { gt: 0 } },
      select: { id: true, invoiceNumber: true, totalAmount: true, balance: true, learnerId: true },
      orderBy: { issuedDate: 'desc' },
      take: 60,
    });

    const batches = await p.settlementBatch.findMany({
      include: { settlementLines: true },
      orderBy: { settlementDate: 'desc' },
      take: 20,
    });

    const webhooks = await p.webhookInboxEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return NextResponse.json({
      success: true,
      data: intents,
      learners,
      invoices,
      batches,
      webhooks,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = extractSessionToken(req.headers);
  const session = token ? verifyToken(token) : null;
  const fallbackOrg =
    (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } })) ||
    (await prisma.organisation.findFirst());
  const organisationId = session?.organisationId || fallbackOrg?.id;
  if (!organisationId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const p = prisma as any;

  try {
    // 1. Mobile Money Real-Time Status Query across Airtel, MTN, or Zamtel networks
    if (body.action === 'query-status' || body.action === 'check-status') {
      if (!body.intentId) {
        return NextResponse.json({ success: false, message: 'intentId is required.' }, { status: 400 });
      }
      const statusResult = await MobileMoneyService.queryPaymentStatus(body.intentId);
      return NextResponse.json({ success: true, data: statusResult });
    }

    // 2. Production Mobile Money Direct Collection Dispatch (USSD Push)
    if (body.action === 'initiate-mobile-money') {
      const cleanLearnerId =
        body.learnerId && typeof body.learnerId === 'string' && body.learnerId.trim() !== ''
          ? body.learnerId.trim()
          : undefined;

      const cleanInvoiceId =
        body.invoiceId && typeof body.invoiceId === 'string' && body.invoiceId.trim() !== ''
          ? body.invoiceId.trim()
          : undefined;

      const result = await MobileMoneyService.initiateCollection({
        organisationId,
        learnerId: cleanLearnerId,
        invoiceId: cleanInvoiceId,
        payerPhone: body.payerPhone,
        amountZMW: Number(body.amountZMW || body.amount),
        channel: body.channel as PaymentChannel,
        payerName: body.payerName,
        metadata: body.metadata,
      });

      return NextResponse.json({ success: true, data: result });
    }

    // 3. Confirm payment (admin / bursar override or verified settlement)
    if (body.action === 'confirm') {
      const result = await LamtonPayService.confirmPayment({
        intentId: body.intentId,
        providerTransactionId: body.providerTransactionId || `TX-${Date.now()}`,
        providerCode: body.providerCode || 'MTN_MOMO_ZM',
        verifiedAmount: body.verifiedAmount ? Number(body.verifiedAmount) : undefined,
        receiptNumber: body.receiptNumber,
      });
      return NextResponse.json({ success: true, data: result });
    }

    // 4. Reconcile settlement batch
    if (body.action === 'reconcile-batch') {
      const batch = await p.settlementBatch.update({
        where: { id: body.batchId },
        data: {
          isReconciled: true,
          reconciledAt: new Date(),
          reconciledById: session?.userId || 'BURSAR-FIN-01',
        },
        include: { settlementLines: true },
      });
      return NextResponse.json({ success: true, data: batch });
    }

    // 5. Webhook inbox event logging
    if (body.action === 'simulate-webhook' || body.action === 'post-webhook') {
      const webhook = await p.webhookInboxEvent.create({
        data: {
          providerCode: body.providerCode || 'MTN_MOMO_ZM',
          signatureHeader: `sha256=${Buffer.from(Date.now().toString()).toString('hex')}`,
          payloadJson: JSON.stringify(
            body.payload || {
              event: 'payment.success',
              reference: body.businessReference || `LP-NWU-2026-${Date.now()}`,
              amount: body.amount || 2500,
              currency: 'ZMW',
              payerPhone: body.payerPhone || '0967812903',
              timestamp: new Date().toISOString(),
            }
          ),
          status: 'PROCESSED',
          isSignatureValid: true,
          processedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, data: webhook });
    }

    // 6. Default: Create Payment Intent (auto-detects mobile money channels and dispatches USSD prompt)
    const cleanLearnerId =
      body.learnerId && typeof body.learnerId === 'string' && body.learnerId.trim() !== ''
        ? body.learnerId.trim()
        : undefined;

    const cleanInvoiceId =
      body.invoiceId && typeof body.invoiceId === 'string' && body.invoiceId.trim() !== ''
        ? body.invoiceId.trim()
        : undefined;

    const targetChannel = (body.channel || PaymentChannel.MTN_MOMO) as PaymentChannel;

    // If phone number is provided and channel is a mobile money rail, dispatch via MobileMoneyService
    if (
      body.payerPhone &&
      (targetChannel === PaymentChannel.MTN_MOMO ||
        targetChannel === PaymentChannel.AIRTEL_MONEY ||
        targetChannel === PaymentChannel.ZAMTEL_MONEY)
    ) {
      const momoResult = await MobileMoneyService.initiateCollection({
        organisationId,
        learnerId: cleanLearnerId,
        invoiceId: cleanInvoiceId,
        payerPhone: body.payerPhone,
        amountZMW: Number(body.amountZMW || body.amount),
        channel: targetChannel,
        payerName: body.payerName,
        metadata: body.metadata,
      });

      return NextResponse.json({ success: true, data: momoResult });
    }

    const intent = await LamtonPayService.createIntent({
      organisationId,
      learnerId: cleanLearnerId,
      invoiceId: cleanInvoiceId,
      channel: targetChannel,
      amountZMW: Number(body.amountZMW || body.amount),
      payerPhone: body.payerPhone,
      payerName: body.payerName,
      idempotencyKey:
        body.idempotencyKey || `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      metadata: body.metadata,
    });

    return NextResponse.json({ success: true, data: intent });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

