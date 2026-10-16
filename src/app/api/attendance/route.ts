// GET & POST /api/attendance
import { NextResponse } from 'next/server';
import { AttendanceService } from '@/server/services/attendance.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!classId) {
      return NextResponse.json({ success: false, message: 'classId is required.' }, { status: 400 });
    }

    const session = await AttendanceService.getClassAttendance(classId, date);
    return NextResponse.json({ success: true, data: session });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if this is an offline batch reconciliation
    if (body.isOfflineBatch && Array.isArray(body.batch)) {
      const results = await AttendanceService.reconcileOfflineBatch(body.batch);
      return NextResponse.json({
        success: true,
        message: `Offline batch reconciled successfully (${results.length} sessions).`,
        data: results,
      });
    }

    // Normal single-session register submission
    const session = await AttendanceService.submitRegister({
      classId: body.classId,
      termId: body.termId,
      date: body.date,
      takenById: body.takenById,
      records: body.records,
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance register submitted successfully.',
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
