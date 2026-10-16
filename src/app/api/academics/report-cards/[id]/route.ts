// GET & POST /api/academics/report-cards/[id]
import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { AcademicService } from '@/server/services/academic.service';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const reportCard = await prisma.reportCardVersion.findUnique({
      where: { id: params.id },
      include: {
        learner: {
          include: { currentClass: true, campus: { include: { organisation: true } } },
        },
        term: { include: { academicYear: true } },
        class: true,
      },
    });

    if (!reportCard) {
      return NextResponse.json({ success: false, message: 'Report card not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: reportCard });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const result = await AcademicService.generateReportCard({
      learnerId: params.id,
      classId: body.classId,
      termId: body.termId,
      teacherRemarks: body.teacherRemarks,
      principalRemarks: body.principalRemarks,
      approvedById: body.approvedById,
    });

    return NextResponse.json({
      success: true,
      message: 'Report card compiled, approved and published successfully.',
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
