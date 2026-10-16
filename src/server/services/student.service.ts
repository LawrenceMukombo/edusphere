// EduSphere SMIS — Learner & Admissions Service
import { prisma } from '../db';
import { Gender, LearnerStatus, GuardianRelationship } from '@prisma/client';

export class StudentService {
  /**
   * Admitting a new learner and optionally linking to an existing or new guardian
   */
  static async admitLearner(
    organisationId: string,
    data: {
      campusId: string;
      studentNumber: string;
      firstName: string;
      middleName?: string;
      lastName: string;
      gender: Gender;
      dateOfBirth: string | Date;
      classId?: string;
      nationality?: string;
      emergencyContact?: string;
      guardian?: {
        firstName: string;
        lastName: string;
        phone: string;
        email?: string;
        nrcNumber?: string;
        relationship: GuardianRelationship;
      };
    }
  ) {
    // Check for student number duplicate within the organisation
    const existing = await prisma.learner.findUnique({
      where: {
        organisationId_studentNumber: {
          organisationId,
          studentNumber: data.studentNumber,
        },
      },
    });
    if (existing) {
      throw new Error(`Student Number '${data.studentNumber}' is already registered in this school.`);
    }

    return prisma.$transaction(async (tx) => {
      const learner = await tx.learner.create({
        data: {
          organisationId,
          campusId: data.campusId,
          studentNumber: data.studentNumber,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          gender: data.gender,
          dateOfBirth: new Date(data.dateOfBirth),
          currentClassId: data.classId,
          nationality: data.nationality || 'Zambian',
          emergencyContact: data.emergencyContact,
          status: LearnerStatus.ENROLLED,
        },
      });

      // Handle Guardian if supplied
      if (data.guardian) {
        // Find existing guardian by phone or create new
        let guardian = await tx.guardian.findFirst({
          where: {
            organisationId,
            phone: data.guardian.phone,
          },
        });

        if (!guardian) {
          guardian = await tx.guardian.create({
            data: {
              organisationId,
              firstName: data.guardian.firstName,
              lastName: data.guardian.lastName,
              phone: data.guardian.phone,
              email: data.guardian.email,
              nrcNumber: data.guardian.nrcNumber,
              isVerified: true,
            },
          });
        }

        // Link learner to guardian
        await tx.learnerGuardianRelationship.create({
          data: {
            learnerId: learner.id,
            guardianId: guardian.id,
            relationship: data.guardian.relationship,
            isPrimary: true,
            hasFinancialAuthority: true,
          },
        });
      }

      // Record Audit Event
      await tx.auditEvent.create({
        data: {
          organisationId,
          action: 'LEARNER_ADMITTED',
          entityType: 'Learner',
          entityId: learner.id,
          detailsJson: JSON.stringify({
            studentNumber: learner.studentNumber,
            name: `${learner.firstName} ${learner.lastName}`,
          }),
        },
      });

      return learner;
    });
  }

  static async listLearners(
    organisationId: string,
    filters?: {
      campusId?: string;
      classId?: string;
      status?: LearnerStatus;
      search?: string;
    }
  ) {
    const where: any = { organisationId };

    if (filters?.campusId) where.campusId = filters.campusId;
    if (filters?.classId) where.currentClassId = filters.classId;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { studentNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.learner.findMany({
      where,
      include: {
        campus: true,
        currentClass: true,
        guardians: {
          include: { guardian: true },
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  static async getLearnerProfile(organisationId: string, learnerId: string) {
    const learner = await prisma.learner.findFirst({
      where: { id: learnerId, organisationId },
      include: {
        campus: true,
        currentClass: true,
        guardians: {
          include: { guardian: true },
        },
        scores: {
          include: {
            assessment: {
              include: { subject: true, term: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        reportCards: {
          include: { term: true, class: true },
          orderBy: { versionNumber: 'desc' },
        },
        invoices: {
          include: { lines: true },
          orderBy: { issuedDate: 'desc' },
        },
        payments: {
          include: { receipt: true },
          orderBy: { receivedDate: 'desc' },
        },
        attendanceRecords: {
          take: 30,
          include: { session: true },
          orderBy: { session: { date: 'desc' } },
        },
      },
    });

    if (!learner) throw new Error('Learner not found.');
    return learner;
  }
}
