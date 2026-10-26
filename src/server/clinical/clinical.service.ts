import { prisma } from '../db';
import { PlacementStatus, CompetencyLevel, ClinicalSiteType } from '@prisma/client';
import {
  validateDeidentifiedLogbookEntry,
  assertClinicalLogbookTransition,
  assertNoPatientIdentifiers,
  ClinicalLogbookStatus,
} from './logbookPrivacy';

export interface CreatePlacementInput {
  organisationId: string;
  learnerId: string;
  clinicalSiteId: string;
  wardOrDept: string;
  startDate: Date;
  endDate: Date;
  totalHoursTarget?: number;
}

export interface SubmitLogbookInput {
  learnerId: string;
  placementId: string;
  rotationId?: string;
  procedureCategory: string;
  caseCategory: string;
  activityCode: string;
  hoursCompleted: number;
  caseSummaryDeidentified: string;
  competencySelfRating?: string;
  reflection?: string;
}

export class ClinicalService {
  /**
   * List all accredited clinical sites for the institution
   */
  static async listSites(organisationId: string) {
    return prisma.clinicalSite.findMany({
      where: { organisationId, isActive: true },
      include: {
        _count: {
          select: { placements: true, supervisors: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Register a new clinical training hospital or health centre
   */
  static async createSite(data: {
    organisationId: string;
    code: string;
    name: string;
    siteType?: ClinicalSiteType;
    location: string;
    province?: string;
    contactPerson?: string;
    contactPhone?: string;
    capacityStudents?: number;
    mouValidUntil?: Date;
  }) {
    return prisma.clinicalSite.create({
      data: {
        organisationId: data.organisationId,
        code: data.code,
        name: data.name,
        siteType: data.siteType || 'GENERAL_HOSPITAL',
        location: data.location,
        province: data.province || 'North-Western',
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        capacityStudents: data.capacityStudents ?? 30,
        mouValidUntil: data.mouValidUntil,
      },
    });
  }

  /**
   * List registered clinical preceptors / supervisors
   */
  static async listSupervisors(organisationId: string, clinicalSiteId?: string) {
    return prisma.clinicalSupervisor.findMany({
      where: {
        organisationId,
        isActive: true,
        ...(clinicalSiteId ? { clinicalSiteId } : {}),
      },
      include: {
        clinicalSite: {
          select: { name: true, code: true, location: true },
        },
      },
      orderBy: { fullName: 'asc' },
    });
  }

  /**
   * Create or assign a clinical supervisor (e.g. Registered Nurse In-Charge, Medical Officer)
   */
  static async createSupervisor(data: {
    organisationId: string;
    clinicalSiteId: string;
    fullName: string;
    profession: string;
    councilRegNumber: string;
    phone: string;
    email?: string;
  }) {
    return prisma.clinicalSupervisor.create({
      data: {
        organisationId: data.organisationId,
        clinicalSiteId: data.clinicalSiteId,
        fullName: data.fullName,
        profession: data.profession,
        councilRegNumber: data.councilRegNumber,
        phone: data.phone,
        email: data.email,
      },
    });
  }

  /**
   * List active or past clinical placements
   */
  static async listPlacements(
    organisationId: string,
    filter?: { learnerId?: string; clinicalSiteId?: string; status?: PlacementStatus }
  ) {
    return prisma.clinicalPlacement.findMany({
      where: {
        organisationId,
        ...(filter?.learnerId ? { learnerId: filter.learnerId } : {}),
        ...(filter?.clinicalSiteId ? { clinicalSiteId: filter.clinicalSiteId } : {}),
        ...(filter?.status ? { status: filter.status } : {}),
      },
      include: {
        learner: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        clinicalSite: {
          select: { id: true, code: true, name: true, location: true },
        },
        rotations: true,
        _count: {
          select: { logbookEntries: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Allocate a student to a clinical facility and ward
   */
  static async createPlacement(data: CreatePlacementInput) {
    return prisma.clinicalPlacement.create({
      data: {
        organisationId: data.organisationId,
        learnerId: data.learnerId,
        clinicalSiteId: data.clinicalSiteId,
        wardOrDept: data.wardOrDept,
        startDate: data.startDate,
        endDate: data.endDate,
        totalHoursTarget: data.totalHoursTarget ?? 120,
        status: 'SCHEDULED',
      },
    });
  }

  /**
   * Submit a de-identified clinical logbook entry.
   * Strictly verifies no patient identifiers (EHR, names, phone numbers) are leaked.
   */
  static async submitLogbookEntry(data: SubmitLogbookInput) {
    // Assert privacy in reflections and case summary
    assertNoPatientIdentifiers(data.reflection);
    assertNoPatientIdentifiers(data.caseSummaryDeidentified);

    // Verify placement belongs to student
    const placement = await prisma.clinicalPlacement.findUnique({
      where: { id: data.placementId },
    });
    if (!placement) throw new Error('Clinical placement record not found.');
    if (placement.learnerId !== data.learnerId) {
      throw new Error('Unauthorised: Clinical placement does not match the active student.');
    }

    const logbook = await prisma.clinicalLogbookEntry.create({
      data: {
        learnerId: data.learnerId,
        placementId: data.placementId,
        rotationId: data.rotationId,
        procedureCategory: data.procedureCategory,
        caseSummaryDeidentified: data.caseSummaryDeidentified,
        hoursLogged: data.hoursCompleted,
        competencySelfRating: data.competencySelfRating || 'PERFORMED_UNDER_SUPERVISION',
        isSupervisorSigned: false,
      },
    });

    return logbook;
  }

  /**
   * Clinical supervisor verifies and signs a student's logbook entry
   */
  static async signLogbookEntry(data: {
    logbookEntryId: string;
    supervisorId: string;
    supervisorFeedback?: string;
  }) {
    const entry = await prisma.clinicalLogbookEntry.findUnique({
      where: { id: data.logbookEntryId },
      include: { placement: true },
    });
    if (!entry) throw new Error('Clinical logbook entry not found.');
    if (entry.isSupervisorSigned) throw new Error('This logbook entry has already been validated and signed.');

    return prisma.$transaction(async (tx) => {
      // 1. Sign entry
      const updatedEntry = await tx.clinicalLogbookEntry.update({
        where: { id: data.logbookEntryId },
        data: {
          isSupervisorSigned: true,
          supervisorId: data.supervisorId,
          supervisorSignedAt: new Date(),
          supervisorFeedback: data.supervisorFeedback,
        },
      });

      // 2. Increment hours on placement
      const currentHours = entry.placement.hoursCompleted + Number(entry.hoursLogged);
      const isCompleted = currentHours >= entry.placement.totalHoursTarget;

      await tx.clinicalPlacement.update({
        where: { id: entry.placementId },
        data: {
          hoursCompleted: currentHours,
          isCompleted,
          status: isCompleted ? 'COMPLETED' : 'ACTIVE',
          completedAt: isCompleted ? new Date() : undefined,
        },
      });

      return updatedEntry;
    });
  }

  /**
   * Record a competency evaluation assessed by an examiner or clinical instructor
   */
  static async recordCompetencyAssessment(data: {
    learnerId: string;
    procedureName: string;
    level: CompetencyLevel;
    evaluatedById: string;
    isPassed: boolean;
    evaluatorRemarks?: string;
  }) {
    return prisma.competencyAssessment.create({
      data: {
        learnerId: data.learnerId,
        procedureName: data.procedureName,
        level: data.level,
        evaluatedById: data.evaluatedById,
        isPassed: data.isPassed,
        evaluatorRemarks: data.evaluatorRemarks,
      },
    });
  }

  /**
   * Determine student's clinical readiness for NMCZ / HPCZ professional examinations
   */
  static async getClinicalReadiness(learnerId: string) {
    const placements = await prisma.clinicalPlacement.findMany({
      where: { learnerId },
      include: {
        clinicalSite: true,
        logbookEntries: {
          where: { isSupervisorSigned: true },
        },
      },
    });

    const competencies = await prisma.competencyAssessment.findMany({
      where: { learnerId },
    });

    const totalHoursRequired = placements.reduce((sum, p) => sum + p.totalHoursTarget, 0);
    const totalHoursCompleted = placements.reduce((sum, p) => sum + p.hoursCompleted, 0);
    const signedLogbookCount = placements.reduce((sum, p) => sum + p.logbookEntries.length, 0);
    const passedCompetenciesCount = competencies.filter((c) => c.isPassed).length;

    const isReady =
      totalHoursCompleted >= totalHoursRequired &&
      placements.length > 0 &&
      passedCompetenciesCount >= 5;

    return {
      learnerId,
      totalHoursRequired,
      totalHoursCompleted,
      isHoursFulfilled: totalHoursCompleted >= totalHoursRequired,
      signedLogbookCount,
      passedCompetenciesCount,
      isProfessionalExamReady: isReady,
      placementsCount: placements.length,
    };
  }
}
