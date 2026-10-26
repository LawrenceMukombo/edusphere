import { NextResponse } from 'next/server';
import { z } from 'zod';
import { extractSessionToken, verifyToken } from '@/server/auth';
import { prisma } from '@/server/db';

const updateSchema = z.object({
  firstName: z.string().trim().min(2).optional(),
  middleName: z.string().trim().optional().nullable(),
  lastName: z.string().trim().min(2).optional(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  phone: z.string().trim().max(32).optional().nullable(),
  programmeChoice: z.string().trim().min(2).optional(),
  intakeLabel: z.string().trim().min(2).optional(),
  dateOfBirth: z.string().optional(),
  nrc: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  school: z.string().trim().optional(),
  examNumber: z.string().trim().optional(),
  sponsor: z.string().trim().optional(),
  residentialAddress: z.string().trim().optional(),
  passportPhotoUrl: z.string().optional(),
  subjects: z.array(z.object({
    name: z.string(),
    grade: z.string().or(z.number()),
  })).optional(),
  documents: z.array(z.object({
    name: z.string(),
    category: z.string(),
    size: z.string().or(z.number()),
    type: z.string(),
    dataUrl: z.string().optional(),
  })).optional(),
  notes: z.string().optional(),
});

function session(request: Request) {
  const token = extractSessionToken(request.headers);
  return token ? verifyToken(token) : null;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const actor = session(request);
  if (!actor?.organisationId || actor.organisationCode !== 'NWUCHAS') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const p = prisma as any;
  const app = await p.admissionApplication.findFirst({
    where: { id: params.id, organisationId: actor.organisationId },
    include: {
      enrolledLearner: { select: { studentNumber: true } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!app) {
    return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: app });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const actor = session(request);
  if (!actor?.organisationId || actor.organisationCode !== 'NWUCHAS') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const allowedRoles = ['INSTITUTION_ADMIN', 'ADMISSIONS_OFFICER', 'REGISTRAR'];
  if (!allowedRoles.includes(actor.role)) {
    return NextResponse.json({ success: false, message: 'Permission denied: Cannot edit application' }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 });
  }

  const p = prisma as any;
  const existing = await p.admissionApplication.findFirst({
    where: { id: params.id, organisationId: actor.organisationId },
    include: { statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  if (!existing) {
    return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 });
  }

  const prevMeta = existing.statusHistory[0]?.metadataJson
    ? JSON.parse(existing.statusHistory[0].metadataJson)
    : {};

  const updatedMeta = {
    ...prevMeta,
    nrc: parsed.data.nrc ?? prevMeta.nrc,
    gender: parsed.data.gender ?? prevMeta.gender,
    school: parsed.data.school ?? prevMeta.school,
    examNumber: parsed.data.examNumber ?? prevMeta.examNumber,
    sponsor: parsed.data.sponsor ?? prevMeta.sponsor,
    residentialAddress: parsed.data.residentialAddress ?? prevMeta.residentialAddress,
    passportPhotoUrl: parsed.data.passportPhotoUrl ?? prevMeta.passportPhotoUrl,
    subjects: parsed.data.subjects ?? prevMeta.subjects,
    documents: parsed.data.documents ?? prevMeta.documents,
  };

  const updated = await p.$transaction(async (tx: any) => {
    const app = await tx.admissionApplication.update({
      where: { id: params.id },
      data: {
        firstName: parsed.data.firstName ?? existing.firstName,
        middleName: parsed.data.middleName !== undefined ? parsed.data.middleName : existing.middleName,
        lastName: parsed.data.lastName ?? existing.lastName,
        email: parsed.data.email !== undefined ? parsed.data.email : existing.email,
        phone: parsed.data.phone !== undefined ? parsed.data.phone : existing.phone,
        programmeChoice: parsed.data.programmeChoice ?? existing.programmeChoice,
        intakeLabel: parsed.data.intakeLabel ?? existing.intakeLabel,
        dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : existing.dateOfBirth,
      },
      include: {
        enrolledLearner: { select: { studentNumber: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    await tx.admissionStatusHistory.create({
      data: {
        organisationId: actor.organisationId!,
        applicationId: app.id,
        toStatus: existing.status,
        changedByUserId: actor.userId,
        reason: parsed.data.notes || `Application details updated by ${actor.role}.`,
        metadataJson: JSON.stringify(updatedMeta),
      },
    });

    await tx.auditEvent.create({
      data: {
        organisationId: actor.organisationId!,
        userId: actor.userId,
        action: 'ADMISSION_APPLICATION_UPDATED',
        entityType: 'AdmissionApplication',
        entityId: app.id,
        detailsJson: JSON.stringify({ applicationNumber: app.applicationNumber, updatedBy: actor.userId }),
      },
    });

    return app;
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const actor = session(request);
  if (!actor?.organisationId || actor.organisationCode !== 'NWUCHAS') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Only Principal / INSTITUTION_ADMIN can delete an application record
  if (actor.role !== 'INSTITUTION_ADMIN') {
    return NextResponse.json({ success: false, message: 'Only Institution Administrator may delete application records' }, { status: 403 });
  }

  const p = prisma as any;
  const existing = await p.admissionApplication.findFirst({
    where: { id: params.id, organisationId: actor.organisationId },
  });

  if (!existing) {
    return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 });
  }

  await p.$transaction(async (tx: any) => {
    // Delete status history first
    await tx.admissionStatusHistory.deleteMany({ where: { applicationId: params.id } });
    await tx.admissionApplication.delete({ where: { id: params.id } });
    await tx.auditEvent.create({
      data: {
        organisationId: actor.organisationId!,
        userId: actor.userId,
        action: 'ADMISSION_APPLICATION_DELETED',
        entityType: 'AdmissionApplication',
        entityId: params.id,
        detailsJson: JSON.stringify({ applicationNumber: existing.applicationNumber, deletedBy: actor.userId }),
      },
    });
  });

  return NextResponse.json({ success: true, message: `Application ${existing.applicationNumber} deleted successfully.` });
}
