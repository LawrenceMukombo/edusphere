// EduSphere SMIS — Academic & Curriculum Management Service
import { prisma } from '../db';
import { AssessmentType, ResultStatus, EducationStage } from '@prisma/client';

export class AcademicService {
  /**
   * Save or update marks for a class assessment
   */
  static async recordMarks(
    assessmentId: string,
    scoresData: Array<{
      learnerId: string;
      marksObtained: number | null;
      letterGrade?: string;
      teacherComments?: string;
      isAbsent?: boolean;
    }>
  ) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment) throw new Error('Assessment not found.');

    if (assessment.status === ResultStatus.PUBLISHED) {
      throw new Error('Cannot edit marks directly on a published assessment without formal reopening approval.');
    }

    return prisma.$transaction(
      scoresData.map((s) =>
        prisma.score.upsert({
          where: {
            assessmentId_learnerId: {
              assessmentId,
              learnerId: s.learnerId,
            },
          },
          update: {
            marksObtained: s.marksObtained !== null ? s.marksObtained : undefined,
            letterGrade: s.letterGrade,
            teacherComments: s.teacherComments,
            isAbsent: s.isAbsent || false,
          },
          create: {
            assessmentId,
            learnerId: s.learnerId,
            marksObtained: s.marksObtained !== null ? s.marksObtained : undefined,
            letterGrade: s.letterGrade,
            teacherComments: s.teacherComments,
            isAbsent: s.isAbsent || false,
          },
        })
      )
    );
  }

  /**
   * Record Early Childhood Development (ECE) Qualitative Milestones
   */
  static async recordECECompetency(data: {
    learnerId: string;
    termId: string;
    domain: string;
    competencyName: string;
    rating: 'EMERGING' | 'DEVELOPING' | 'COMPETENT' | 'MASTERED';
    observations?: string;
  }) {
    return prisma.competencyObservation.create({
      data: {
        learnerId: data.learnerId,
        termId: data.termId,
        domain: data.domain,
        competencyName: data.competencyName,
        rating: data.rating,
        observations: data.observations,
      },
    });
  }

  /**
   * Moderate and Publish a Learner Report Card
   */
  static async generateReportCard(data: {
    learnerId: string;
    classId: string;
    termId: string;
    teacherRemarks?: string;
    principalRemarks?: string;
    approvedById?: string;
  }) {
    // 1. Gather all student scores for this term
    const scores = await prisma.score.findMany({
      where: {
        learnerId: data.learnerId,
        assessment: { termId: data.termId },
      },
      include: {
        assessment: {
          include: { subject: true },
        },
      },
    });

    // 2. Gather attendance for this term
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        learnerId: data.learnerId,
        session: { termId: data.termId },
      },
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;

    // 3. Compile report summary
    const summary = {
      termId: data.termId,
      subjects: scores.map((s) => ({
        subjectName: s.assessment.subject.name,
        subjectCode: s.assessment.subject.code,
        score: s.marksObtained ? Number(s.marksObtained) : 0,
        letterGrade: s.letterGrade || (Number(s.marksObtained) >= 75 ? 'Distinction' : Number(s.marksObtained) >= 60 ? 'Merit' : Number(s.marksObtained) >= 50 ? 'Credit' : 'Pass'),
        remarks: s.teacherComments || 'Satisfactory progress.',
      })),
      attendance: { presentDays, totalDays },
      compiledAt: new Date().toISOString(),
    };

    // 4. Create or update report card version
    return prisma.reportCardVersion.upsert({
      where: {
        learnerId_termId_versionNumber: {
          learnerId: data.learnerId,
          termId: data.termId,
          versionNumber: 1,
        },
      },
      update: {
        status: ResultStatus.PUBLISHED,
        summaryJson: JSON.stringify(summary),
        teacherRemarks: data.teacherRemarks || 'Consistent effort throughout the term.',
        principalRemarks: data.principalRemarks || 'Approved. Promising academic trajectory.',
        attendancePresent: presentDays,
        attendanceTotal: totalDays,
        approvedById: data.approvedById,
        publishedAt: new Date(),
      },
      create: {
        learnerId: data.learnerId,
        classId: data.classId,
        termId: data.termId,
        versionNumber: 1,
        status: ResultStatus.PUBLISHED,
        summaryJson: JSON.stringify(summary),
        teacherRemarks: data.teacherRemarks || 'Consistent effort throughout the term.',
        principalRemarks: data.principalRemarks || 'Approved. Promising academic trajectory.',
        attendancePresent: presentDays,
        attendanceTotal: totalDays,
        approvedById: data.approvedById,
        publishedAt: new Date(),
      },
    });
  }

  static async listClassAssessments(classId: string, termId: string) {
    return prisma.assessment.findMany({
      where: {
        termId,
        subject: {
          assignments: { some: { classId } },
        },
      },
      include: {
        subject: true,
        scores: {
          include: { learner: true },
        },
      },
    });
  }
}
