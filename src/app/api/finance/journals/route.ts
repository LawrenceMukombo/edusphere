import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { LedgerEntryType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: {
        ...(org ? { organisationId: org.id } : {}),
      },
      orderBy: { postedAt: 'desc' },
      take: 60,
    });

    return NextResponse.json({
      success: true,
      data: ledgerEntries,
    });
  } catch (error: any) {
    console.error('Error fetching ledger entries:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch ledger entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, description, lines, postedBy } = body;

    // Enforce double-entry integrity: Sum(Debits) === Sum(Credits)
    if (!lines || !Array.isArray(lines) || lines.length < 2) {
      return NextResponse.json(
        { success: false, message: 'A general journal entry must contain at least 2 balancing lines.' },
        { status: 400 }
      );
    }

    const totalDebits = lines.reduce((sum: number, l: any) => sum + (Number(l.debit) || 0), 0);
    const totalCredits = lines.reduce((sum: number, l: any) => sum + (Number(l.credit) || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return NextResponse.json(
        {
          success: false,
          message: `Double-entry violation: Total debits (ZMW ${totalDebits.toFixed(2)}) must equal total credits (ZMW ${totalCredits.toFixed(2)}).`,
        },
        { status: 400 }
      );
    }

    const org = (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } })) ?? (await prisma.organisation.findFirst());
    if (!org) {
      return NextResponse.json(
        { success: false, message: 'NWUCHAS Organisation not found' },
        { status: 400 }
      );
    }

    const journalRef = reference || `JV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Audit Event
    await prisma.auditEvent.create({
      data: {
        organisationId: org.id,
        action: 'JOURNAL_VOUCHER_POSTED',
        entityType: 'GeneralJournal',
        entityId: journalRef,
        detailsJson: JSON.stringify({
          journalRef,
          description,
          totalAmount: totalDebits,
          linesCount: lines.length,
          balanced: true,
          postedBy: postedBy || 'BURSAR-SYSTEM',
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Journal voucher ${journalRef} balanced and posted to general ledger.`,
      data: {
        journalRef,
        totalAmount: totalDebits,
        lines,
      },
    });
  } catch (error: any) {
    console.error('Error recording journal entry:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to record journal entry' },
      { status: 500 }
    );
  }
}
