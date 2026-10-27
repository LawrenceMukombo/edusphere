// src/app/api/documents/route.ts — Enterprise Official Documents REST API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';
import { OfficialDocumentService } from '@/server/services/officialDocument.service';
import { OfficialDocStatus, OfficialDocType } from '@prisma/client';

export const dynamic = 'force-dynamic';

const DOC_ADMIN_ROLES = [
  'INSTITUTION_ADMIN',
  'REGISTRAR',
  'ACADEMIC_ADMIN',
  'DEAN',
  'BURSAR',
  'SUPER_ADMIN',
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentType = searchParams.get('documentType') as OfficialDocType | null;
    const status = searchParams.get('status') as OfficialDocStatus | null;
    const learnerId = searchParams.get('learnerId') || undefined;
    const search = searchParams.get('search') || undefined;
    const documentId = searchParams.get('id');

    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId) {
      const nwuchasOrg = await prisma.organisation.findFirst({
        where: { code: 'NWUCHAS' },
      });
      orgId = nwuchasOrg?.id || null;
    }

    if (!orgId) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Single document fetch
    if (documentId) {
      const doc = await OfficialDocumentService.getDocumentById(orgId, documentId);
      if (!doc) {
        return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: doc });
    }

    const docs = await OfficialDocumentService.listDocuments(orgId, {
      documentType: documentType || undefined,
      status: status || undefined,
      learnerId,
      search,
    });

    return NextResponse.json({
      success: true,
      data: docs,
      totalCount: docs.length,
    });
  } catch (error: any) {
    console.error('[API Documents GET] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching documents' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to issue official documents.' },
        { status: 401 }
      );
    }

    const userRole = session.role?.toUpperCase();
    if (!DOC_ADMIN_ROLES.includes(userRole)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Insufficient privileges to issue official documents.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.documentType) {
      return NextResponse.json(
        { success: false, message: 'documentType is required.' },
        { status: 400 }
      );
    }

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;
    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation required.' }, { status: 400 });
    }

    const doc = await OfficialDocumentService.createDocument(
      orgId,
      {
        learnerId: body.learnerId,
        documentType: body.documentType as OfficialDocType,
        title: body.title,
        recipientName: body.recipientName,
        recipientOrganization: body.recipientOrganization,
        purpose: body.purpose,
        signatoryName: body.signatoryName,
        signatoryTitle: body.signatoryTitle,
        customRemarks: body.customRemarks,
        academicYear: body.academicYear,
        semesterNumber: body.semesterNumber,
      },
      session.userId
    );

    return NextResponse.json({
      success: true,
      message: `Official document [${doc.referenceNumber}] submitted to registry archive.`,
      data: doc,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API Documents POST] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating official document' },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const userRole = session.role?.toUpperCase();
    if (!DOC_ADMIN_ROLES.includes(userRole)) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.id || !body.action) {
      return NextResponse.json(
        { success: false, message: 'Document ID and workflow action (APPROVE/ISSUE/REJECT/REVOKE) are required.' },
        { status: 400 }
      );
    }

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;
    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation required.' }, { status: 400 });
    }

    const updated = await OfficialDocumentService.updateStatus(
      orgId,
      body.id,
      body.action,
      session.userId,
      body.notes
    );

    return NextResponse.json({
      success: true,
      message: `Document [${updated.referenceNumber}] transitioned to ${updated.status}.`,
      data: updated,
    });
  } catch (error: any) {
    console.error('[API Documents PUT] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating document workflow' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const userRole = session.role?.toUpperCase();
    if (!['INSTITUTION_ADMIN', 'SUPER_ADMIN', 'REGISTRAR'].includes(userRole)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only Registrar or Institution Admin can archive documents.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ success: false, message: 'Document ID is required.' }, { status: 400 });
    }

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;
    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation required.' }, { status: 400 });
    }

    await OfficialDocumentService.archiveDocument(orgId, documentId);

    return NextResponse.json({
      success: true,
      message: 'Document successfully archived and revoked.',
    });
  } catch (error: any) {
    console.error('[API Documents DELETE] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error archiving document' },
      { status: 400 }
    );
  }
}
