// GET & POST /api/students
import { NextResponse } from 'next/server';
import { StudentService } from '@/server/services/student.service';
import { extractAuthHeader, verifyToken } from '@/server/auth';
import { prisma } from '@/server/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgCode = searchParams.get('orgCode');
    const campusId = searchParams.get('campusId') || undefined;
    const classId = searchParams.get('classId') || undefined;
    const search = searchParams.get('search') || undefined;

    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId && orgCode) {
      const org = await prisma.organisation.findUnique({ where: { code: orgCode } });
      orgId = org?.id || null;
    }
    if (!orgId) {
      const defaultOrg = await prisma.organisation.findFirst({ orderBy: { createdAt: 'asc' } });
      orgId = defaultOrg?.id || null;
    }

    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation context required.' }, { status: 400 });
    }

    const students = await StudentService.listLearners(orgId, { campusId, classId, search });
    return NextResponse.json({ success: true, data: students });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;
    const body = await req.json();

    let orgId = session?.organisationId || body.organisationId;
    if (!orgId && body.orgCode) {
      const org = await prisma.organisation.findUnique({ where: { code: body.orgCode } });
      orgId = org?.id;
    }

    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation context required.' }, { status: 400 });
    }

    const learner = await StudentService.admitLearner(orgId, body);
    return NextResponse.json({
      success: true,
      message: 'Learner admitted and enrolled successfully.',
      data: learner,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
