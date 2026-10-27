import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { LamtonPayService } from '@/server/payments/lamtonpay.service';
import { authenticateRequest } from '@/server/auth';
import { SuspenseStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const FINANCE_STAFF = [
  'BURSAR',
  'FINANCE_RECONCILER',
  'CASHIER',
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
        { success: false, message: 'Forbidden: Insufficient privileges for bank reconciliation.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'suspense'; // 'suspense' or 'batches'
    const status = searchParams.get('status') as SuspenseStatus | null;

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;
    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation not found' }, { status: 400 });
    }

    if (view === 'batches') {
      const batches = await LamtonPayService.listBankStatementImports(orgId);
      return NextResponse.json({ success: true, data: batches });
    }

    // Default: Return Suspense Queue entries
    const suspenseQueue = await LamtonPayService.listSuspenseQueue(orgId, status || undefined);
    return NextResponse.json({
      success: true,
      data: suspenseQueue,
      count: suspenseQueue.length,
    });
  } catch (error: any) {
    console.error('Error fetching bank reconciliation data:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch reconciliation records', code: 'INTERNAL_ERROR' },
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

    if (!FINANCE_STAFF.includes(session.role as string)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Insufficient privileges for bank reconciliation.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;
    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation not found' }, { status: 400 });
    }

    const body = await request.json();
    const { action, rawContent, bankName, filename, entryId, learnerId, notes } = body;

    // Action 1: Manual Cashier Allocation from Suspense Queue
    if (action === 'allocate') {
      if (!entryId || !learnerId) {
        return NextResponse.json(
          { success: false, message: 'entryId and learnerId are required for suspense allocation.', code: 'BAD_REQUEST' },
          { status: 400 }
        );
      }

      const allocated = await LamtonPayService.allocateSuspenseEntry({
        organisationId: orgId,
        entryId,
        learnerId,
        allocatedById: session.userId,
        notes,
      });

      return NextResponse.json({
        success: true,
        message: 'Suspense entry successfully allocated to student and receipt posted to ledger.',
        data: allocated,
      });
    }

    // Action 2: Bank Statement File Ingestion & Auto-Match
    if (!rawContent || typeof rawContent !== 'string') {
      return NextResponse.json(
        { success: false, message: 'rawContent (CSV or MT940 string) is required.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const result = await LamtonPayService.ingestBankStatement({
      organisationId: orgId,
      bankName: bankName || 'Zanaco BillMaster',
      rawContent,
      filename: filename || 'bank_statement.csv',
      importedById: session.userId,
    });

    return NextResponse.json({
      success: true,
      message: `Bank statement processed. Matched & posted: ${result.matchedCount} payments. Routed to Suspense Queue: ${result.suspenseCount} unmatched entries.`,
      data: result,
    });
  } catch (error: any) {
    console.error('Error processing bank statement reconciliation:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Statement reconciliation failed', code: 'PROCESSING_ERROR' },
      { status: 400 }
    );
  }
}
