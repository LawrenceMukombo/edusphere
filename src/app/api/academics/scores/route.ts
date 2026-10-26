// POST /api/academics/scores
import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { AcademicService } from '@/server/services/academic.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const p = prisma as any;

    // Handle single CourseRegistration mark entry (CA 40% + Final Exam 60%)
    if (body.registrationId) {
      const { registrationId, continuousScore, examScore } = body;
      const ca = Number(continuousScore || 0);
      const exam = Number(examScore || 0);
      const total = ca + exam;

      let grade = 'F';
      if (total >= 75) grade = 'A+';
      else if (total >= 65) grade = 'A';
      else if (total >= 55) grade = 'B';
      else if (total >= 50) grade = 'C';
      else if (total >= 40) grade = 'D';

      const updated = await p.courseRegistration.update({
        where: { id: registrationId },
        data: {
          continuousScore: ca,
          examScore: exam,
          finalScore: total,
          finalGrade: grade,
          status: 'DRAFT', // Moved to DRAFT pending lecturer submission
          isModerated: false,
          isApproved: false,
        },
        include: {
          learner: { select: { id: true, studentNumber: true, firstName: true, lastName: true } },
          courseModule: { include: { programme: true } },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Updated scores for ${updated.learner.studentNumber} in ${updated.courseModule.code}: CA ${ca}/40, Exam ${exam}/60 -> Total ${total}% (${grade}).`,
        data: updated,
      });
    }

    // Legacy / class assessment batch
    const { assessmentId, scores } = body;
    if (!assessmentId || !scores || !Array.isArray(scores)) {
      return NextResponse.json({ success: false, message: 'registrationId OR (assessmentId and scores array) required.' }, { status: 400 });
    }

    const updated = await AcademicService.recordMarks(assessmentId, scores);
    return NextResponse.json({
      success: true,
      message: `Successfully recorded ${updated.length} student assessment marks.`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
