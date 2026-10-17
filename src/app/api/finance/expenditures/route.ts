// src/app/api/finance/expenditures/route.ts
import { NextResponse } from 'next/server';
import { LEGACY_EXPENDITURES, ExpenditureRecord } from '@/server/services/legacySchoolData';

// In-memory store initialized with rich Legacy School Solwezi fixtures
let expendituresStore: ExpenditureRecord[] = [...LEGACY_EXPENDITURES];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get('campusId');
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();

    let list = expendituresStore;

    if (campusId && campusId !== 'ALL') {
      list = list.filter((e) => e.campusId === campusId || e.campusId === 'CENTRAL');
    }

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

    // Grouping by category
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
    const body = await req.json();

    if (!body.title || !body.amountZMW || !body.vendorName) {
      return NextResponse.json(
        { success: false, message: 'Title, vendorName, and amountZMW are required.' },
        { status: 400 }
      );
    }

    const newExpense: ExpenditureRecord = {
      id: `exp-${Date.now()}`,
      expenseNumber: `EXP-SOL-2026-${String(expendituresStore.length + 1).padStart(3, '0')}`,
      expenseDate: body.expenseDate || new Date().toISOString().split('T')[0],
      fiscalPeriod: '2026 Term 1',
      campusId: body.campusId || 'LSS-KBC',
      campusName: body.campusName || 'Kansanshi Boarding Campus',
      category: body.category || 'FOOD_BOARDING_RATIONS',
      categoryLabel: body.categoryLabel || 'Food & Boarding Dining Provisions',
      title: body.title,
      description: body.description || '',
      vendorName: body.vendorName,
      vendorTpin: body.vendorTpin || '100' + Math.floor(1000000 + Math.random() * 9000000),
      amountZMW: Number(body.amountZMW),
      paymentMethod: body.paymentMethod || 'BANK_EFT',
      referenceNumber: body.referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
      voucherNumber: `PV-2026-${String(expendituresStore.length + 190)}`,
      initiatedBy: body.initiatedBy || 'Staff Member',
      verifiedBy: 'Mr. C. Mulenga (Bursar)',
      approvedBy: 'Mr. E. Mwansa (Director)',
      status: body.status || 'DISBURSED',
    };

    expendituresStore.unshift(newExpense);

    return NextResponse.json({
      success: true,
      message: 'Expenditure voucher successfully recorded and authorized.',
      data: newExpense,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
