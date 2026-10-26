// EduSphere SMIS — Attendance & Offline Sync Service
import { prisma } from '../db';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceService {
  /**
   * Take or update class attendance register for a specific date
   */
  static async submitRegister(data: {
    classId: string;
    termId: string;
    date: string | Date;
    takenById?: string;
    records: Array<{
      learnerId: string;
      status: AttendanceStatus;
      arrivalMinutesLate?: number;
      remarks?: string;
    }>;
  }) {
    const registerDate = new Date(data.date);
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    if (registerDate > endOfToday) {
      throw new Error('Future dates are blocked. Attendance registers cannot be recorded for upcoming dates.');
    }

    return prisma.$transaction(async (tx) => {
      // Find or create session
      let session = await tx.attendanceSession.findFirst({
        where: {
          classId: data.classId,
          date: registerDate,
        },
      });

      if (!session) {
        session = await tx.attendanceSession.create({
          data: {
            classId: data.classId,
            termId: data.termId,
            date: registerDate,
            takenById: data.takenById,
          },
        });
      }

      // Upsert individual records
      for (const r of data.records) {
        await tx.attendanceRecord.upsert({
          where: {
            sessionId_learnerId: {
              sessionId: session.id,
              learnerId: r.learnerId,
            },
          },
          update: {
            status: r.status,
            arrivalMinutesLate: r.arrivalMinutesLate,
            remarks: r.remarks,
          },
          create: {
            sessionId: session.id,
            learnerId: r.learnerId,
            status: r.status,
            arrivalMinutesLate: r.arrivalMinutesLate,
            remarks: r.remarks,
          },
        });
      }

      return session;
    });
  }

  /**
   * Offline Sync reconciliation handler
   * Processes batched attendance submissions captured on mobile/tablet during connectivity dropouts.
   */
  static async reconcileOfflineBatch(
    submissions: Array<{
      classId: string;
      termId: string;
      date: string;
      clientTimestamp: string;
      records: Array<{
        learnerId: string;
        status: AttendanceStatus;
        arrivalMinutesLate?: number;
      }>;
    }>
  ) {
    const results = [];
    for (const sub of submissions) {
      const res = await this.submitRegister({
        classId: sub.classId,
        termId: sub.termId,
        date: sub.date,
        records: sub.records,
      });
      results.push({ date: sub.date, classId: sub.classId, status: 'RECONCILED', sessionId: res.id });
    }
    return results;
  }

  static async getClassAttendance(classId: string, date: string | Date) {
    const registerDate = new Date(date);
    return prisma.attendanceSession.findFirst({
      where: {
        classId,
        date: registerDate,
      },
      include: {
        records: {
          include: { learner: true },
        },
      },
    });
  }
}
