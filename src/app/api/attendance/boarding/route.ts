// src/app/api/attendance/boarding/route.ts
import { NextResponse } from 'next/server';
import {
  LEGACY_BOARDING_ROLLCALLS,
  LEGACY_BOARDING_EXEATS,
  BoardingRollCall,
  BoardingExeatRecord,
} from '@/server/services/legacySchoolData';

let rollCallsStore: BoardingRollCall[] = [...LEGACY_BOARDING_ROLLCALLS];
let exeatsStore: BoardingExeatRecord[] = [...LEGACY_BOARDING_EXEATS];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all'; // 'rollcalls' | 'exeats' | 'all'

    return NextResponse.json({
      success: true,
      data: {
        rollCalls: rollCallsStore,
        exeats: exeatsStore,
        summary: {
          totalBoarders: 318,
          mopaniBoysCount: 162,
          mukwaGirlsCount: 156,
          activeExeatsCount: exeatsStore.filter((e) => e.securityGateStatus === 'DEPARTED').length,
          sickbayHeadcount: 3,
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

    if (body.action === 'CREATE_EXEAT') {
      const newExeat: BoardingExeatRecord = {
        id: `ext-${Date.now()}`,
        passNumber: `EXT-2026-${String(exeatsStore.length + 84).padStart(3, '0')}`,
        studentNumber: body.studentNumber || 'LSS-2026-0000',
        studentName: body.studentName,
        hallName: body.hallName || 'Kansanshi Boys Boarding Hall',
        grade: body.grade || 'Form 3',
        reason: body.reason || 'Medical / Family visit',
        destination: body.destination || 'Solwezi Town',
        guardianName: body.guardianName,
        guardianPhone: body.guardianPhone,
        departTime: body.departTime || new Date().toISOString().replace('T', ' ').slice(0, 16),
        returnDeadline: body.returnDeadline,
        securityGateStatus: 'DEPARTED',
        approvedBy: body.approvedBy || 'Mr. K. Phiri (Senior Housemaster)',
      };
      exeatsStore.unshift(newExeat);
      return NextResponse.json({ success: true, message: 'Boarding gate pass issued.', data: newExeat });
    }

    if (body.action === 'RECORD_ROLLCALL') {
      const newRollCall: BoardingRollCall = {
        id: `rc-${Date.now()}`,
        hallName: body.hallName || 'Kansanshi Boys Boarding Hall',
        callType: body.callType || 'EVENING_PREP',
        callTypeLabel: body.callTypeLabel || 'Evening Prep Study Check',
        scheduledTime: body.scheduledTime || '18:30',
        date: body.date || new Date().toISOString().split('T')[0],
        totalBoarders: Number(body.totalBoarders) || 160,
        present: Number(body.present) || 155,
        sickbay: Number(body.sickbay) || 1,
        authorizedExeat: Number(body.authorizedExeat) || 4,
        unaccounted: Number(body.unaccounted) || 0,
        wardenInCharge: body.wardenInCharge || 'Boarding Staff',
        status: body.unaccounted > 0 ? 'DISCREPANCY_FLAGGED' : 'ALL_ACCOUNTED',
      };
      rollCallsStore.unshift(newRollCall);
      return NextResponse.json({ success: true, message: 'Boarding roll-call logged.', data: newRollCall });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
