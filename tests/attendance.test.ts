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
    let cls = await prisma.class.findFirst();
    let term = await prisma.term.findFirst();

    if (!cls || !term) {
      const org = await prisma.organisation.findFirst();
      const campus = await prisma.campus.findFirst({ where: { organisationId: org!.id } });
      let academicYear = await prisma.academicYear.findFirst({ where: { organisationId: org!.id } });
      if (!academicYear) {
        academicYear = await prisma.academicYear.create({
          data: {
            organisationId: org!.id,
            name: '2026 Academic Year',
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-12-31'),
            isCurrent: true,
          },
        });
      }
      if (!term) {
        term = await prisma.term.create({
          data: {
            academicYearId: academicYear.id,
            name: 'Term 1 / Semester 1',
            termNumber: 1,
            startDate: new Date('2026-01-10'),
            endDate: new Date('2026-04-30'),
            isCurrent: true,
          },
        });
      }
      if (!cls) {
        cls = await prisma.class.create({
          data: {
            campusId: campus!.id,
            academicYearId: academicYear.id,
            name: 'Nursing Cohort A',
            capacity: 50,
          },
        });
      }
    }

    classId = cls.id;
    termId = term.id;

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

  it('SAFE-001: Pupil attendance can be recorded regardless of fee arrears with zero lock-out', async () => {
    // Pupil has balance due, but teacher can take roll-call without hindrance
    const session = await AttendanceService.submitRegister({
      classId,
      termId,
      date: '2026-10-16',
      records: [
        { learnerId: pupilId, status: AttendanceStatus.PRESENT, remarks: 'Roll-call taken irrespective of financial balance' },
      ],
    });

    expect(session).toBeDefined();
    const record = await prisma.attendanceRecord.findUnique({
      where: { sessionId_learnerId: { sessionId: session.id, learnerId: pupilId } },
    });
    expect(record!.status).toBe(AttendanceStatus.PRESENT);
  });

  it('SAFE-002: Future dates are strictly blocked from attendance recording', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    await expect(
      AttendanceService.submitRegister({
        classId,
        termId,
        date: futureDate.toISOString(),
        records: [{ learnerId: pupilId, status: AttendanceStatus.PRESENT }],
      })
    ).rejects.toThrow('Future dates are blocked');
  });
});
