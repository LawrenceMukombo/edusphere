import { Gender, LearnerStatus, type AdmissionApplication, type Prisma } from '@prisma/client';
import { AdmissionWorkflowError } from './workflow';

export class AdmissionEnrolmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdmissionEnrolmentError';
  }
}

export function buildStudentNumber(applicationNumber: string, year: number): string {
  const suffix = applicationNumber.replace(/\D/g, '').slice(-6) || String(Date.now()).slice(-6);
  return `NWU-${year}-${suffix.padStart(6, '0')}`;
}

export async function createLearnerFromApplication(
  tx: Prisma.TransactionClient,
  application: AdmissionApplication,
  campusId: string,
): Promise<{ id: string; studentNumber: string }> {
  if (application.enrolledLearnerId) {
    throw new AdmissionEnrolmentError('This application is already linked to a student record.');
  }
  if (!application.dateOfBirth) {
    throw new AdmissionEnrolmentError('Date of birth is required before enrolment.');
  }

  const year = new Date().getFullYear();
  const studentNumber = buildStudentNumber(application.applicationNumber, year);

  const duplicate = await tx.learner.findUnique({
    where: {
      organisationId_studentNumber: {
        organisationId: application.organisationId,
        studentNumber,
      },
    },
  });
  if (duplicate) {
    throw new AdmissionEnrolmentError(`Student number ${studentNumber} is already registered.`);
  }

  const learner = await tx.learner.create({
    data: {
      organisationId: application.organisationId,
      campusId,
      studentNumber,
      firstName: application.firstName,
      middleName: application.middleName,
      lastName: application.lastName,
      gender: Gender.OTHER,
      dateOfBirth: application.dateOfBirth,
      status: LearnerStatus.ENROLLED,
      emergencyContact: application.phone ?? application.email ?? undefined,
    },
    select: { id: true, studentNumber: true },
  });

  return learner;
}

export async function assertNoDuplicateApplicant(
  tx: Prisma.TransactionClient,
  organisationId: string,
  applicationId: string,
  email?: string | null,
  phone?: string | null,
): Promise<void> {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedPhone = phone?.trim();
  if (!normalizedEmail && !normalizedPhone) return;

  const conflict = await tx.admissionApplication.findFirst({
    where: {
      organisationId,
      id: { not: applicationId },
      status: { notIn: ['WITHDRAWN', 'REJECTED', 'EXPIRED'] },
      OR: [
        ...(normalizedEmail ? [{ email: { equals: normalizedEmail, mode: 'insensitive' as const } }] : []),
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
      ],
    },
    select: { applicationNumber: true },
  });

  if (conflict) {
    throw new AdmissionWorkflowError(
      `Duplicate applicant contact details match application ${conflict.applicationNumber}. Manual review is required.`,
    );
  }
}
