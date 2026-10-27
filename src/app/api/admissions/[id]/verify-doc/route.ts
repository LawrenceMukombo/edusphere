// src/app/api/admissions/[id]/verify-doc/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { extractSessionToken, verifyToken } from '@/server/auth';
import { logAuditEvent } from '@/server/audit';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = extractSessionToken(req.headers);
    let userId: string | null = null;
    if (token) {
      const session = verifyToken(token);
      if (session) userId = session.userId;
    }

    const { docName, isVerified = true, notes } = await req.json();

    const application = await prisma.admissionApplication.findUnique({
      where: { id: params.id },
      select: { id: true, applicationNumber: true, organisationId: true, firstName: true, lastName: true },
    });

    if (!application) {
      return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 });
    }

    await logAuditEvent({
      organisationId: application.organisationId,
      userId,
      action: isVerified ? 'ADMISSION_DOC_VERIFIED' : 'ADMISSION_DOC_FLAGGED',
      entityType: 'AdmissionDocument',
      entityId: application.id,
      details: {
        applicationNumber: application.applicationNumber,
        candidateName: `${application.firstName} ${application.lastName}`,
        documentName: docName,
        isVerified,
        notes: notes || (isVerified ? 'Official statutory copy verified by Admissions Registry.' : 'Document flagged for re-upload.'),
      },
      req,
    });

    return NextResponse.json({
      success: true,
      message: isVerified
        ? `Document "${docName}" certified and verified by Admissions Registry.`
        : `Document "${docName}" flagged for candidate review.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
