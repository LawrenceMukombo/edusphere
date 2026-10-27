import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/server/db';
import { LamtonPayService } from '@/server/payments/lamtonpay.service';

const WEBHOOK_SECRET = process.env.LAMTONPAY_WEBHOOK_SECRET || 'lamtonpay-webhook-secret-nwuchas-2026';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-lamtonpay-signature') || req.headers.get('x-signature');

  // Verify HMAC SHA-256 signature
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(rawBody);
  const expectedSignature = hmac.digest('hex');

  const isVerified = Boolean(
    signature && (signature === expectedSignature || signature === `sha256=${expectedSignature}`)
  );

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Invalid JSON payload.' }, { status: 400 });
  }

  // Detect Telco / Gateway Provider
  let providerCode = payload.provider || 'LAMTONPAY';
  let providerTxId = payload.providerTransactionId || payload.transactionId || payload.reference;
  let businessReference = payload.businessReference || payload.referenceNumber;
  let isSuccessful = true;

  // 1. MTN MoMo Callback Payload Mapping
  if (payload.externalId || (payload.financialTransactionId && payload.payer)) {
    providerCode = 'MTN_MOMO_ZM';
    businessReference = payload.externalId || businessReference;
    providerTxId = payload.financialTransactionId || providerTxId;
    if (payload.status && payload.status !== 'SUCCESSFUL') {
      isSuccessful = false;
    }
  }

  // 2. Airtel Money Africa Callback Payload Mapping
  if (payload.transaction && (payload.transaction.airtel_money_id || payload.subscriber)) {
    providerCode = 'AIRTEL_MONEY_ZM';
    businessReference = payload.transaction.id || businessReference;
    providerTxId = payload.transaction.airtel_money_id || providerTxId;
    if (payload.transaction.status && !['TS', 'SUCCESS', 'COMPLETED'].includes(payload.transaction.status)) {
      isSuccessful = false;
    }
  }

  // 3. Zamtel Kwacha Callback Payload Mapping
  if (payload.merchantId && (payload.zamtelTxId || payload.msisdn)) {
    providerCode = 'ZAMTEL_KWACHA_ZM';
    businessReference = payload.reference || businessReference;
    providerTxId = payload.zamtelTxId || payload.transactionId || providerTxId;
    if (payload.status && !['SUCCESS', 'COMPLETED', 'PAID'].includes(payload.status)) {
      isSuccessful = false;
    }
  }

  try {
    // 1. Record webhook event for full audit and replay detection
    const existingWebhook = await prisma.webhookInboxEvent.findFirst({
      where: { signatureHeader: signature || undefined, payloadJson: rawBody },
    });

    if (existingWebhook && existingWebhook.status === 'PROCESSED') {
      return NextResponse.json({ success: true, message: 'Webhook already processed (idempotent duplicate).' });
    }

    const webhookRecord = await prisma.webhookInboxEvent.create({
      data: {
        providerCode,
        signatureHeader: signature || null,
        payloadJson: rawBody,
        status: isVerified ? 'VERIFIED' : 'RECEIVED',
        isSignatureValid: isVerified,
      },
    });

    // In production with signed headers, require valid HMAC unless skipped for sandbox
    if (!isVerified && process.env.NODE_ENV === 'production' && signature) {
      await prisma.webhookInboxEvent.update({
        where: { id: webhookRecord.id },
        data: { status: 'FAILED', processingError: 'Invalid HMAC signature.' },
      });
      return NextResponse.json({ success: false, message: 'Signature verification failed.' }, { status: 401 });
    }

    // 2. Locate the corresponding PaymentIntent
    let intent = null;
    if (payload.paymentIntentId) {
      intent = await prisma.paymentIntent.findUnique({
        where: { id: payload.paymentIntentId },
      });
    } else if (businessReference) {
      intent = await prisma.paymentIntent.findFirst({
        where: { businessReference },
      });
    }

    if (!intent) {
      await prisma.webhookInboxEvent.update({
        where: { id: webhookRecord.id },
        data: { status: 'IGNORED', processingError: 'Payment intent not found.' },
      });
      return NextResponse.json({ success: false, message: 'Intent not found.' }, { status: 404 });
    }

    if (!isSuccessful) {
      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: { status: 'FAILED' },
      });
      await prisma.webhookInboxEvent.update({
        where: { id: webhookRecord.id },
        data: { status: 'PROCESSED', processingError: 'Carrier reported transaction failed.' },
      });
      return NextResponse.json({ success: true, message: 'Failure status acknowledged.' });
    }

    // 3. Confirm Payment Intent & post ledger entry
    const confirmResult = await LamtonPayService.confirmPayment({
      intentId: intent.id,
      providerTransactionId: providerTxId || `TX-${Date.now()}`,
      providerCode,
      verifiedAmount: payload.amount || (payload.transaction && payload.transaction.amount) ? Number(payload.amount || payload.transaction.amount) : undefined,
      receiptNumber: payload.receiptNumber,
    });

    await prisma.webhookInboxEvent.update({
      where: { id: webhookRecord.id },
      data: { status: 'PROCESSED', processedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully.',
      data: confirmResult,
    });
  } catch (error: any) {
    console.error('[LamtonPay Webhook Error]:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
