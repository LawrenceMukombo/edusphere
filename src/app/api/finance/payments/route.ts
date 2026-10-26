import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { FinanceService } from '@/server/services/finance.service';
import { PaymentMethod } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
    const payments = await prisma.payment.findMany({
      where: {
        ...(org ? { organisationId: org.id } : {}),
      },
      include: {
        learner: true,
        receipt: true,
        allocations: {
          include: {
            invoice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { learnerId, invoiceId, amount, paymentMethod, reference } = body;

    const org = (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } })) ?? (await prisma.organisation.findFirst());
    if (!org) {
      return NextResponse.json(
        { success: false, message: 'NWUCHAS Organisation not found' },
        { status: 400 }
      );
    }

    const payMethodEnum =
      paymentMethod === 'AIRTEL_MONEY'
        ? PaymentMethod.AIRTEL_MONEY
        : paymentMethod === 'MTN_MOMO'
        ? PaymentMethod.MTN_MONEY
        : paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'ZANACO_BILLMASTER'
        ? PaymentMethod.BANK_TRANSFER
        : PaymentMethod.CASH;

    const payment = await FinanceService.recordPayment({
      organisationId: org.id,
      learnerId,
      invoiceId,
      paymentNumber: `PAY-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      receiptNumber: `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: Number(amount),
      paymentMethod: payMethodEnum,
      referenceNumber: reference || `LAMTON-${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment recorded and allocated successfully. Receipt issued.',
      data: payment,
    });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to record payment' },
      { status: 500 }
    );
  }
}
