// src/app/api/finance/expenditures/route.ts — Pure Database-Backed Expenditures & Payment Vouchers API
import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();

    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId) {
      const org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
      orgId = org?.id || null;
    }

    if (!orgId) {
      return NextResponse.json({
        success: true,
        data: {
          expenditures: [],
          summary: { totalCount: 0, totalDisbursedZMW: 0, pendingApprovalZMW: 0, categoryTotals: {} },
        },
      });
    }

    const records = await prisma.moduleWorkspaceRecord.findMany({
      where: {
        organisationId: orgId,
        moduleSlug: 'finance-expenditures',
      },
      orderBy: { createdAt: 'desc' },
    });

    let list = records.map((r) => {
      let meta: any = {};
      try {
        meta = r.metadataJson ? JSON.parse(r.metadataJson) : {};
      } catch {}
      return {
        id: r.id,
        title: r.title,
        status: r.status,
        description: r.summary,
        amountZMW: meta.amountZMW || 0,
        expenseNumber: meta.expenseNumber || r.id,
        voucherNumber: meta.voucherNumber || '',
        category: meta.category || 'GENERAL_OPERATING',
        categoryLabel: meta.categoryLabel || 'General Operating Provisions',
        vendorName: meta.vendorName || '',
        vendorTpin: meta.vendorTpin || '',
        paymentMethod: meta.paymentMethod || 'BANK_EFT',
        referenceNumber: meta.referenceNumber || '',
        expenseDate: meta.expenseDate || r.createdAt.toISOString().split('T')[0],
        initiatedBy: meta.initiatedBy || '',
        verifiedBy: meta.verifiedBy || '',
        approvedBy: meta.approvedBy || '',
      };
    });

    if (category && category !== 'ALL') {
      list = list.filter((e) => e.category === category);
    }

    if (search) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(search) ||
          e.vendorName.toLowerCase().includes(search) ||
          e.expenseNumber.toLowerCase().includes(search) ||
          e.voucherNumber.toLowerCase().includes(search) ||
          e.referenceNumber.toLowerCase().includes(search)
      );
    }

    const totalDisbursed = list
      .filter((e) => e.status === 'DISBURSED')
      .reduce((sum, e) => sum + e.amountZMW, 0);

    const pendingApprovalTotal = list
      .filter((e) => e.status === 'PENDING_APPROVAL')
      .reduce((sum, e) => sum + e.amountZMW, 0);

    const categoryTotals: Record<string, number> = {};
    for (const item of list) {
      categoryTotals[item.categoryLabel] = (categoryTotals[item.categoryLabel] || 0) + item.amountZMW;
    }

    return NextResponse.json({
      success: true,
      data: {
        expenditures: list,
        summary: {
          totalCount: list.length,
          totalDisbursedZMW: totalDisbursed,
          pendingApprovalZMW: pendingApprovalTotal,
          categoryTotals,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;
    const body = await req.json();

    if (!body.title || !body.amountZMW || !body.vendorName) {
      return NextResponse.json(
        { success: false, message: 'Title, vendorName, and amountZMW are required.' },
        { status: 400 }
      );
    }

    let orgId = session?.organisationId;
    if (!orgId) {
      const org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
      orgId = org?.id || null;
    }

    if (!orgId) {
      return NextResponse.json(
        { success: false, message: 'NWUCHAS institution scope required.' },
        { status: 400 }
      );
    }

    const voucherSeq = Date.now().toString().slice(-4);
    const voucherNumber = `PV-2026-${voucherSeq}`;
    const expenseNumber = `EXP-2026-${voucherSeq}`;

    const metadata = {
      expenseNumber,
      voucherNumber,
      amountZMW: Number(body.amountZMW),
      vendorName: body.vendorName.trim(),
      vendorTpin: body.vendorTpin?.trim() || '',
      category: body.category || 'CLINICAL_SUPPLIES',
      categoryLabel: body.categoryLabel || 'Clinical Lab & Training Supplies',
      paymentMethod: body.paymentMethod || 'BANK_EFT',
      referenceNumber: body.referenceNumber || `REF-${voucherSeq}`,
      expenseDate: body.expenseDate || new Date().toISOString().split('T')[0],
      initiatedBy: session?.userId || 'Authorized Staff',
      verifiedBy: 'Finance Officer',
      approvedBy: 'Bursar',
    };

    const created = await prisma.moduleWorkspaceRecord.create({
      data: {
        organisationId: orgId,
        moduleSlug: 'finance-expenditures',
        title: body.title.trim(),
        status: body.status || 'PENDING_APPROVAL',
        summary: body.description || `Expenditure voucher for ${body.vendorName}`,
        metadataJson: JSON.stringify(metadata),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Expenditure voucher successfully persisted to NWUCHAS database.',
      data: {
        id: created.id,
        title: created.title,
        status: created.status,
        ...metadata,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
