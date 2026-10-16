// POST /api/academics/scores
import { NextResponse } from 'next/server';
import { AcademicService } from '@/server/services/academic.service';

export async function POST(req: Request) {
  try {
    const { assessmentId, scores } = await req.json();

    if (!assessmentId || !scores || !Array.isArray(scores)) {
      return NextResponse.json({ success: false, message: 'assessmentId and scores array are required.' }, { status: 400 });
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
