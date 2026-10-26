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

  const eventId = payload.eventId || payload.id || `evt-${Date.now()}`;
  const eventType = payload.eventType || payload.type || 'PAYMENT_CONFIRMED';
  const providerTxId = payload.providerTransactionId || payload.transactionId || payload.reference;
  const businessReference = payload.businessReference || payload.referenceNumber;

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
        providerCode: payload.provider || 'LAMTONPAY',
        signatureHeader: signature || null,
        payloadJson: rawBody,
        status: isVerified ? 'VERIFIED' : 'RECEIVED',
        isSignatureValid: isVerified,
      },
    });

    if (!isVerified && process.env.NODE_ENV === 'production') {
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

    // 3. Confirm Payment Intent & post ledger entry
    const confirmResult = await LamtonPayService.confirmPayment({
      intentId: intent.id,
      providerTransactionId: providerTxId || `TX-${Date.now()}`,
      providerCode: payload.provider || 'LAMTONPAY',
      verifiedAmount: payload.amount ? Number(payload.amount) : undefined,
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
