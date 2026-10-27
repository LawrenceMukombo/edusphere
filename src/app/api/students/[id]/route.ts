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

    // Handle sponsor / guardian linking
    if (body.sponsorName || body.guardianPhone) {
      const guardian = await prisma.guardian.findFirst({
        where: {
          organisationId: orgId,
          phone: body.guardianPhone || '0960000000',
        },
      });

      const guardianRecord = guardian || await prisma.guardian.create({
        data: {
          organisationId: orgId,
          firstName: body.sponsorName?.split(' ')[0] || 'Sponsor',
          lastName: body.sponsorName?.split(' ').slice(1).join(' ') || 'Guardian',
          phone: body.guardianPhone || '+260 97 000 0000',
          email: body.guardianEmail || null,
        },
      });

      // Upsert relationship
      await prisma.learnerGuardianRelationship.upsert({
        where: {
          learnerId_guardianId: {
            learnerId,
            guardianId: guardianRecord.id,
          },
        },
        create: {
          learnerId,
          guardianId: guardianRecord.id,
          relationship: 'LEGAL_GUARDIAN',
          isPrimary: true,
          hasFinancialAuthority: true,
        },
        update: {
          relationship: 'LEGAL_GUARDIAN',
          isAccessRevoked: false,
        },
      });
    }

    const updated = await prisma.learner.update({
      where: { id: learnerId },
      data: updateData,
      include: {
        campus: true,
        currentClass: true,
        guardians: { include: { guardian: true } },
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const learnerId = params.id;
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const userRole = session.role?.toUpperCase();
    if (!['INSTITUTION_ADMIN', 'REGISTRAR', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only Registrar or Institution Admin can withdraw or archive learner records.' },
        { status: 403 }
      );
    }

    // Check learner exists
    const learner = await prisma.learner.findUnique({
      where: { id: learnerId },
      include: {
        invoices: true,
        payments: true,
        scores: true,
      },
    });

    if (!learner) {
      return NextResponse.json(
        { success: false, message: 'Learner record not found.' },
        { status: 404 }
      );
    }

    // Per Rule 3 (Data Safety: NO WIPE, PRESERVE FINANCIAL AUDIT TRAIL):
    // If learner has ledger or academic history, transition to WITHDRAWN / ARCHIVED status.
    const hasHistory = learner.invoices.length > 0 || learner.payments.length > 0 || learner.scores.length > 0;
    
    if (hasHistory) {
      const archived = await prisma.learner.update({
        where: { id: learnerId },
        data: {
          status: 'WITHDRAWN',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Learner record [${learner.studentNumber}] has historical transactions and was safely transitioned to WITHDRAWN status.`,
        data: archived,
      });
    }

    // Zero-history draft record: safe deletion
    await prisma.learner.delete({
      where: { id: learnerId },
    });

    return NextResponse.json({
      success: true,
      message: `Learner draft record [${learner.studentNumber}] permanently removed.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete learner record.' },
      { status: 400 }
    );
  }
}
