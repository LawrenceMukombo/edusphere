import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { FinanceService } from '@/server/services/finance.service';
import { authenticateRequest } from '@/server/auth';
import { ReversalStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const FINANCE_STAFF = [
  'CASHIER',
  'BURSAR',
  'INSTITUTION_ADMIN',
  'ACCOUNTANT',
  'FINANCE_RECONCILER',
  'PLATFORM_SUPER_ADMIN',
];

const APPROVER_ROLES = [
  'BURSAR',
  'INSTITUTION_ADMIN',
  'ACCOUNTANT',
  'PLATFORM_SUPER_ADMIN',
];

export async function GET(request: Request) {
  try {
    const session = await authenticateRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (!FINANCE_STAFF.includes(session.role as string)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Insufficient privileges.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ReversalStatus | null;
    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;

    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation not found' }, { status: 400 });
    }

    const requests = await FinanceService.listReversalRequests(orgId, status || undefined);

    return NextResponse.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error: any) {
    console.error('Error fetching reversal requests:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch reversal requests', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await authenticateRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, paymentId, requestId, reason } = body;

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;
    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation not found' }, { status: 400 });
    }

    if (action === 'request') {
      // Step 1: Cashier submits reversal request
      if (!paymentId || !reason) {
        return NextResponse.json(
          { success: false, message: 'paymentId and reason are required.', code: 'BAD_REQUEST' },
          { status: 400 }
        );
      }

      const reversalRequest = await FinanceService.requestPaymentReversal({
        organisationId: orgId,
        paymentId,
        requestedById: session.userId,
        requestedByName: `${session.firstName} ${session.lastName} (${session.role})`,
        reason,
      });

      return NextResponse.json({
        success: true,
        message: 'Reversal request submitted successfully. Pending Bursar four-eyes approval.',
        data: reversalRequest,
      });
    }

    if (action === 'approve') {
      // Step 2: Bursar approves reversal
      if (!requestId) {
        return NextResponse.json(
          { success: false, message: 'requestId is required.', code: 'BAD_REQUEST' },
          { status: 400 }
        );
      }

      if (!APPROVER_ROLES.includes(session.role as string)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Forbidden: Only Bursar or Institution Admin can approve payment reversals.',
            code: 'FORBIDDEN',
          },
          { status: 403 }
        );
      }

      const result = await FinanceService.approvePaymentReversal({
        organisationId: orgId,
        requestId,
        reviewedById: session.userId,
        reviewedByName: `${session.firstName} ${session.lastName} (${session.role})`,
        reviewerRole: session.role as string,
      });

      return NextResponse.json({
        success: true,
        message: 'Payment reversal approved and ledger reversing entry posted.',
        data: result,
      });
    }

    if (action === 'reject') {
      if (!requestId || !reason) {
        return NextResponse.json(
          { success: false, message: 'requestId and reason are required.', code: 'BAD_REQUEST' },
          { status: 400 }
        );
      }

      if (!APPROVER_ROLES.includes(session.role as string)) {
        return NextResponse.json(
          { success: false, message: 'Forbidden: Only Bursary can review reversals.', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }

      const rejected = await FinanceService.rejectPaymentReversal({
        organisationId: orgId,
        requestId,
        reviewedById: session.userId,
        reviewedByName: `${session.firstName} ${session.lastName} (${session.role})`,
        reason,
      });

      return NextResponse.json({
        success: true,
        message: 'Payment reversal request rejected.',
        data: rejected,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action. Supported: request, approve, reject', code: 'BAD_REQUEST' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error handling reversal:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Operation failed', code: 'REVERSAL_ERROR' },
      { status: 400 }
    );
  }
}
