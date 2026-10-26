// Tests: AC-03, AC-04 & AC-05 Academic Engine & Assessment Schemes
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../src/server/db';
import { AcademicService } from '../src/server/services/academic.service';
import { ResultStatus } from '@prisma/client';

describe('AC-03, AC-04 & AC-05: Academic Engine, ECE Competencies & Report Moderation', () => {
  let eceOrgId: string;
  let termId: string;
  let classId: string;
  let pupilId: string;

  beforeAll(async () => {
    let org = await prisma.organisation.findFirst();
    if (!org) {
      org = await prisma.organisation.create({
        data: {
          code: 'NWUCHAS',
          name: 'North Western University College of Health and Applied Sciences',
          email: 'info@nwuchas.edu.zm',
          phone: '+260977000001',
        },
      });
    }
    eceOrgId = org.id;

    let year = await prisma.academicYear.findFirst({ where: { organisationId: org.id } });
    if (!year) {
      year = await prisma.academicYear.create({
        data: {
          organisationId: org.id,
          name: '2026 Academic Year',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
        },
      });
    }

    let term = await prisma.term.findFirst();
    if (!term) {
      term = await prisma.term.create({
        data: {
          academicYearId: year.id,
          name: 'Term 1',
          termNumber: 1,
          startDate: new Date('2026-01-10'),
          endDate: new Date('2026-04-30'),
        },
      });
    }
    termId = term.id;

    let cls = await prisma.class.findFirst();
    if (!cls) {
      const campus = await prisma.campus.findFirst({ where: { organisationId: org.id } });
      cls = await prisma.class.create({
        data: {
          campusId: campus!.id,
          academicYearId: year.id,
          name: 'Diploma Nursing Cohort 1',
        },
      });
    }
    classId = cls.id;

    let pupil = await prisma.learner.findFirst();
    pupilId = pupil!.id;
  });

  it('ECE learners can receive qualitative developmental observations rather than numeric marks', async () => {
    const observation = await AcademicService.recordECECompetency({
      learnerId: pupilId,
      termId,
      domain: 'Gross Motor Skills & Coordination',
      competencyName: 'Catches and bounces balls with both hands',
      rating: 'COMPETENT',
      observations: 'Demonstrates balanced posture and hand-eye synchrony during outdoor play.',
    });

    expect(observation.rating).toBe('COMPETENT');
    expect(observation.domain).toBe('Gross Motor Skills & Coordination');
  });

  it('Moderating and publishing report card compiles attendance and scores into immutable version', async () => {
    const reportCard = await AcademicService.generateReportCard({
      learnerId: pupilId,
      classId,
      termId,
      teacherRemarks: 'Excellent analytical aptitude demonstrated.',
      principalRemarks: 'Approved for distinction honours.',
      approvedById: 'principal-user-id',
    });

    expect(reportCard.status).toBe(ResultStatus.PUBLISHED);
    expect(reportCard.versionNumber).toBe(1);

    const summary = JSON.parse(reportCard.summaryJson);
    expect(summary).toHaveProperty('subjects');
    expect(summary).toHaveProperty('attendance');
  });
});
