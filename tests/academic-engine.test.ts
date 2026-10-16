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
    const eceOrg = await prisma.organisation.findUnique({ where: { code: 'EDS-ZM-002' } });
    eceOrgId = eceOrg!.id;

    const term = await prisma.term.findFirst();
    termId = term!.id;

    const cls = await prisma.class.findFirst();
    classId = cls!.id;

    const pupil = await prisma.learner.findFirst();
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
