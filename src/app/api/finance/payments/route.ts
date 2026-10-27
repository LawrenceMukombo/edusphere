import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { FinanceService } from '@/server/services/finance.service';
import { PaymentMethod } from '@prisma/client';
import { authenticateRequest } from '@/server/auth';

export const dynamic = 'force-dynamic';

const FINANCE_STAFF_ROLES = [
  'BURSAR',
  'CASHIER',
  'INSTITUTION_ADMIN',
  'ACCOUNTANT',
  'FINANCE_RECONCILER',
  'PAYROLL_APPROVER',
  'PLATFORM_SUPER_ADMIN',
  'HEADTEACHER',
  'DEPUTY_HEADTEACHER',
  'IT_ADMIN',
];

const PAYMENT_RECORDING_ROLES = [
  'CASHIER',
  'BURSAR',
  'INSTITUTION_ADMIN',
  'ACCOUNTANT',
  'FINANCE_RECONCILER',
  'PLATFORM_SUPER_ADMIN',
];

export async function GET(request: Request) {
  try {
    const session = await authenticateRequest(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required. Missing or invalid bearer/cookie session token.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedLearnerId = searchParams.get('learnerId');
    const paymentMethod = searchParams.get('paymentMethod');

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;

    const isFinanceStaff = FINANCE_STAFF_ROLES.includes(session.role as string);
    const isLearner = session.role === 'LEARNER' || Boolean(session.learnerId);

    if (!isFinanceStaff && !isLearner) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden: Insufficient privileges for payment ledger access.',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    let targetLearnerId: string | undefined = undefined;
    if (isLearner && !isFinanceStaff) {
      let resolvedLearnerId = session.learnerId;
      if (!resolvedLearnerId) {
        const student = await prisma.learner.findFirst({
          where: {
            organisationId: orgId,
            OR: [
              { studentNumber: session.email?.split('@')[0] },
              { emergencyContact: session.email },
            ],
          },
        });
        resolvedLearnerId = student?.id;
      }
      if (!resolvedLearnerId) {
        return NextResponse.json(
          { success: false, message: 'Student payment profile not found.', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }
      targetLearnerId = resolvedLearnerId;
    } else if (requestedLearnerId) {
      targetLearnerId = requestedLearnerId;
    }

    const payments = await prisma.payment.findMany({
      where: {
        ...(orgId ? { organisationId: orgId } : {}),
        ...(targetLearnerId ? { learnerId: targetLearnerId } : {}),
        ...(paymentMethod ? { paymentMethod: paymentMethod as PaymentMethod } : {}),
      },
      include: {
        learner: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        receipt: true,
        allocations: {
          include: {
            invoice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: payments,
      count: payments.length,
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch payments', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await authenticateRequest(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required to post payments.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    if (!PAYMENT_RECORDING_ROLES.includes(session.role as string)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden: Only Cashier and Bursary roles can record student payments.',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { learnerId, invoiceId, amount, paymentMethod, reference } = body;

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;
    if (!orgId) {
      return NextResponse.json(
        { success: false, message: 'NWUCHAS Organisation not found' },
        { status: 400 }
      );
    }

    const payMethodEnum =
      paymentMethod === 'AIRTEL_MONEY'
        ? PaymentMethod.AIRTEL_MONEY
        : paymentMethod === 'MTN_MOMO' || paymentMethod === 'MTN_MONEY'
        ? PaymentMethod.MTN_MONEY
        : paymentMethod === 'ZAMTEL_MONEY'
        ? PaymentMethod.ZAMTEL_MONEY
        : paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'ZANACO_BILLMASTER'
        ? PaymentMethod.BANK_TRANSFER
        : paymentMethod === 'BANK_DEPOSIT'
        ? PaymentMethod.BANK_DEPOSIT
        : paymentMethod === 'CHEQUE'
        ? PaymentMethod.CHEQUE
        : PaymentMethod.CASH;

    const payment = await FinanceService.recordPayment({
      organisationId: orgId,
      learnerId,
      invoiceId,
      paymentNumber: `PAY-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      receiptNumber: `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: Number(amount),
      paymentMethod: payMethodEnum,
      referenceNumber: reference || `REF-${Date.now()}`,
      recordedById: session.userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment recorded and allocated successfully. Receipt issued.',
      data: payment,
    });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to record payment', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

