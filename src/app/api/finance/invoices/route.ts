import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { FinanceService } from '@/server/services/finance.service';
import { FeeCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
    const invoices = await prisma.invoice.findMany({
      where: {
        ...(org ? { organisationId: org.id } : {}),
      },
      include: {
        lines: true,
        allocations: true,
        learner: true,
        term: true,
      },
      orderBy: { issuedDate: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: invoices,
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { learnerId, termId, dueDate, lines, invoiceNumber } = body;

    const org = (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } })) ?? (await prisma.organisation.findFirst());
    if (!org) {
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
      organisationId: org.id,
      learnerId,
      termId: targetTermId!,
      invoiceNumber: generatedNumber,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lines: (lines || []).map((l: any) => ({
        category: (l.category as FeeCategory) || FeeCategory.TUITION,
        description: l.description || 'College Tuition & Operational Fees',
        unitPrice: Number(l.amountZMW || l.unitPrice || 0),
        quantity: 1,
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
      { success: false, message: error.message || 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
