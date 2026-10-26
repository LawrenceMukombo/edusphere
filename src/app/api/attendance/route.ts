import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { AttendanceService } from '@/server/services/attendance.service';
import { AttendanceStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const date = searchParams.get('date');

    const sessions = await prisma.attendanceSession.findMany({
      where: {
        ...(classId ? { classId } : {}),
      },
      include: {
        class: true,
        records: {
          include: {
            learner: {
              select: {
                id: true,
                studentNumber: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 20,
    });

    const learners = await prisma.learner.findMany({
      select: {
        id: true,
        studentNumber: true,
        firstName: true,
        lastName: true,
        currentClassId: true,
      },
      orderBy: { studentNumber: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        sessions,
        learners,
      },
    });
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch attendance data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { classId, termId, date, takenById, records, sessionType, venue, topic } = body;

    if (!records || !Array.isArray(records)) {
      return NextResponse.json(
        { success: false, message: 'Invalid attendance records payload' },
        { status: 400 }
      );
    }

    // Enforce future date blocking
    const targetDate = new Date(date || new Date().toISOString());
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    if (targetDate > endOfToday) {
      return NextResponse.json(
        {
          success: false,
          message: 'Future dates are blocked. Attendance registers cannot be recorded for upcoming dates.',
        },
        { status: 400 }
      );
    }

    // Default classId or termId if not provided
    let targetClassId = classId;
    if (!targetClassId) {
      const cls = await prisma.class.findFirst();
      targetClassId = cls?.id;
    }

    let targetTermId = termId;
    if (!targetTermId) {
      const term = await prisma.term.findFirst();
      targetTermId = term?.id;
    }

    if (!targetClassId || !targetTermId) {
      return NextResponse.json(
        { success: false, message: 'No active academic class or term configured.' },
        { status: 400 }
      );
    }

    const session = await AttendanceService.submitRegister({
      classId: targetClassId,
      termId: targetTermId,
      date: date || new Date().toISOString(),
      takenById: takenById || 'REGISTRAR-SYSTEM',
      records: records.map((r: any) => ({
        learnerId: r.learnerId,
        status: (r.status as AttendanceStatus) || AttendanceStatus.PRESENT,
        arrivalMinutesLate: r.arrivalMinutesLate ? Number(r.arrivalMinutesLate) : undefined,
        remarks: r.remarks || (sessionType ? `[${sessionType}] ${topic || ''}` : undefined),
      })),
    });

    const org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
    if (org) {
      await prisma.auditEvent.create({
        data: {
          organisationId: org.id,
          action: 'ATTENDANCE_REGISTER_SUBMITTED',
          entityType: 'AttendanceSession',
          entityId: session.id,
          detailsJson: JSON.stringify({
            sessionType: sessionType || 'LECTURE',
            venue: venue || 'Main Campus',
            totalLearners: records.length,
            presentCount: records.filter((r: any) => r.status === 'PRESENT').length,
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance register submitted and synced successfully.',
      data: session,
    });
  } catch (error: any) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to submit attendance register' },
      { status: 500 }
    );
  }
}
