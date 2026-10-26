// src/app/api/students/route.ts — Pure Database-Backed Students & Learners API
import { NextResponse } from 'next/server';
import { StudentService } from '@/server/services/student.service';
import { extractAuthHeader, verifyToken } from '@/server/auth';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';

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
      try {
        const org = await prisma.organisation.findUnique({ where: { code: orgCode } });
        orgId = org?.id || null;
      } catch {
        orgId = null;
      }
    }
    if (!orgId) {
      try {
        const nwuchasOrg = await prisma.organisation.findFirst({
          where: { code: 'NWUCHAS' },
        });
        orgId = nwuchasOrg?.id || null;
      } catch {
        orgId = null;
      }
    }

    if (!orgId) {
      return NextResponse.json({ success: true, data: [], totalCount: 0 });
    }

    const students = await StudentService.listLearners(orgId, { campusId, classId, search });
    return NextResponse.json({ success: true, data: students, totalCount: students.length });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error retrieving learner records' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;
    const body = await req.json();

    let orgId = session?.organisationId || body.organisationId;
    if (!orgId && body.orgCode) {
      try {
        const org = await prisma.organisation.findUnique({ where: { code: body.orgCode } });
        orgId = org?.id;
      } catch {}
    }
    if (!orgId) {
      const nwuchasOrg = await prisma.organisation.findFirst({
        where: { code: 'NWUCHAS' },
      });
      orgId = nwuchasOrg?.id;
    }

    if (!orgId) {
      return NextResponse.json(
        { success: false, message: 'Organisation identifier is required to register a learner.' },
        { status: 400 }
      );
    }

    const newLearner = await StudentService.admitLearner(orgId, body);
    return NextResponse.json({ success: true, data: newLearner }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error admitting learner' },
      { status: 400 }
    );
  }
}
