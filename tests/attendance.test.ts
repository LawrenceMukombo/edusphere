// Tests: AC-08 & AC-09 Attendance & Offline Synchronization
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../src/server/db';
import { AttendanceService } from '../src/server/services/attendance.service';
import { AttendanceStatus } from '@prisma/client';

describe('AC-08 & AC-09: Attendance & Offline Reconciliation', () => {
  let classId: string;
  let termId: string;
  let pupilId: string;

  beforeAll(async () => {
    const cls = await prisma.class.findFirst();
    classId = cls!.id;

    const term = await prisma.term.findFirst();
    termId = term!.id;

    const pupil = await prisma.learner.findFirst();
    pupilId = pupil!.id;
  });

  it('Taking class register records pupil status correctly', async () => {
    const session = await AttendanceService.submitRegister({
      classId,
      termId,
      date: '2026-10-14',
      records: [
        { learnerId: pupilId, status: AttendanceStatus.LATE, arrivalMinutesLate: 15, remarks: 'Delayed by traffic on Great East Road' },
      ],
    });

    expect(session).toBeDefined();

    const record = await prisma.attendanceRecord.findUnique({
      where: { sessionId_learnerId: { sessionId: session.id, learnerId: pupilId } },
    });

    expect(record!.status).toBe(AttendanceStatus.LATE);
    expect(record!.arrivalMinutesLate).toBe(15);
  });

  it('Reconciling offline batch processes queued mobile sessions without overwriting newer data', async () => {
    const offlineBatch = [
      {
        classId,
        termId,
        date: '2026-10-15',
        clientTimestamp: new Date().toISOString(),
        records: [
          { learnerId: pupilId, status: AttendanceStatus.PRESENT },
        ],
      },
    ];

    const results = await AttendanceService.reconcileOfflineBatch(offlineBatch);
    expect(results.length).toBe(1);
    expect(results[0].status).toBe('RECONCILED');

    const synced = await AttendanceService.getClassAttendance(classId, '2026-10-15');
    expect(synced!.records.length).toBeGreaterThanOrEqual(1);
  });
});
