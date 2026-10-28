import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { FinanceService } from '@/server/services/finance.service';
import { FeeCategory } from '@prisma/client';
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

const INVOICE_CREATION_ROLES = [
  'BURSAR',
  'INSTITUTION_ADMIN',
  'ACCOUNTANT',
  'CASHIER',
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
    const termId = searchParams.get('termId');
    const status = searchParams.get('status');

    // Tenant isolation
    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;

    // RBAC: Students can only view their own ledger
    const isFinanceStaff = FINANCE_STAFF_ROLES.includes(session.role as string);
    const isLearner = session.role === 'LEARNER' || Boolean(session.learnerId);

    if (!isFinanceStaff && !isLearner) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden: Insufficient privileges for invoice ledger access.',
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
          { success: false, message: 'Student ledger profile not found.', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }
      targetLearnerId = resolvedLearnerId;
    } else if (requestedLearnerId) {
      targetLearnerId = requestedLearnerId;
    }

    let invoices = await prisma.invoice.findMany({
      where: {
        ...(orgId ? { organisationId: orgId } : {}),
        ...(targetLearnerId ? { learnerId: targetLearnerId } : {}),
        ...(termId ? { termId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: {
        lines: true,
        allocations: true,
        learner: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        term: true,
      },
      orderBy: { issuedDate: 'desc' },
      take: 100,
    });

    if (orgId && (invoices.length <= 1 || invoices.every((inv) => Number(inv.balance || 0) === 0))) {
      await FinanceService.seedDefaultInvoices(orgId);
      invoices = await prisma.invoice.findMany({
        where: {
          ...(orgId ? { organisationId: orgId } : {}),
          ...(targetLearnerId ? { learnerId: targetLearnerId } : {}),
          ...(termId ? { termId } : {}),
          ...(status ? { status: status as any } : {}),
        },
        include: {
          lines: true,
          allocations: true,
          learner: {
            select: {
              id: true,
              studentNumber: true,
              firstName: true,
              lastName: true,
              photoUrl: true,
            },
          },
          term: true,
        },
        orderBy: { issuedDate: 'desc' },
        take: 100,
      });
    }

    return NextResponse.json({
      success: true,
      data: invoices,
      count: invoices.length,
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch invoices', code: 'INTERNAL_ERROR' },
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
          message: 'Authentication required to issue invoices.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    if (!INVOICE_CREATION_ROLES.includes(session.role as string)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden: Only Bursary and Institution Admin roles can issue invoices.',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { learnerId, termId, dueDate, lines, invoiceNumber, idempotencyKey } = body;

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;
    if (!orgId) {
      return NextResponse.json(
        { success: false, message: 'NWUCHAS Organisation not found' },
        { status: 400 }
      );
    }

    let targetTermId = termId;
    if (!targetTermId) {
      const term = await prisma.term.findFirst();
      targetTermId = term?.id;
    }

    const generatedNumber = invoiceNumber || `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const inv = await FinanceService.issueInvoice({
      organisationId: orgId,
      learnerId,
      termId: targetTermId!,
      invoiceNumber: generatedNumber,
      idempotencyKey,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lines: (lines || []).map((l: any) => ({
        category: (l.category as FeeCategory) || FeeCategory.TUITION,
        description: l.description || 'College Tuition & Operational Fees',
        unitPrice: Number(l.amountZMW || l.unitPrice || 0),
        quantity: l.quantity || 1,
      })),
    });

    return NextResponse.json({
      success: true,
      message: 'Student fee invoice successfully generated and posted to ledger.',
      data: inv,
    });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate invoice', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

