// src/app/api/students/[id]/route.ts — Pure Database-Backed Learner Profile API
import { NextResponse } from 'next/server';
import { StudentService } from '@/server/services/student.service';
import { extractAuthHeader, verifyToken } from '@/server/auth';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const learnerId = params.id;
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId) {
      const learner = await prisma.learner.findUnique({
        where: { id: learnerId },
        select: { organisationId: true },
      });
      orgId = learner?.organisationId || null;
    }
    if (!orgId) {
      const nwuchasOrg = await prisma.organisation.findFirst({
        where: { code: 'NWUCHAS' },
      });
      orgId = nwuchasOrg?.id || null;
    }

    if (!orgId) {
      return NextResponse.json(
        { success: false, message: 'Learner record not found.' },
        { status: 404 }
      );
    }

    const profile = await StudentService.getLearnerProfile(orgId, learnerId);
    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'Learner record not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Learner record not found.' },
      { status: 404 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const learnerId = params.id;
    const body = await req.json();
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId) {
      const existing = await prisma.learner.findUnique({
        where: { id: learnerId },
        select: { organisationId: true },
      });
      orgId = existing?.organisationId;
    }

    if (!orgId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorised or unknown organisation.' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (body.firstName) updateData.firstName = body.firstName.trim();
    if (body.middleName !== undefined) updateData.middleName = body.middleName?.trim() || null;
    if (body.lastName) updateData.lastName = body.lastName.trim();
    if (body.dateOfBirth) updateData.dateOfBirth = new Date(body.dateOfBirth);
    if (body.gender) updateData.gender = body.gender;
    if (body.status) updateData.status = body.status;
    if (body.campusId) updateData.campusId = body.campusId;
    if (body.classId) updateData.currentClassId = body.classId;
    if (body.nationality) updateData.nationality = body.nationality;
    if (body.emergencyContact) updateData.emergencyContact = body.emergencyContact;

    const updated = await prisma.learner.update({
      where: { id: learnerId },
      data: updateData,
      include: {
        campus: true,
        currentClass: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Learner record updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update learner record.' },
      { status: 400 }
    );
  }
}
