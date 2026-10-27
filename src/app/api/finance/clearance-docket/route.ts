import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { EntitlementService } from '@/server/services/entitlement.service';
import { authenticateRequest } from '@/server/auth';
import { DocketType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const verifyCode = searchParams.get('verify') || searchParams.get('code');

    // 1. Public or Invigilator Cryptographic Verification Scan
    if (verifyCode) {
      const verificationResult = await EntitlementService.verifyClearanceDocket(verifyCode);
      return NextResponse.json({
        success: verificationResult.isValid,
        data: verificationResult,
      });
    }

    // 2. Authenticated retrieval of dockets for a learner
    const session = await authenticateRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;
    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation not found' }, { status: 400 });
    }

    const targetLearnerId = searchParams.get('learnerId') || (session.role === 'LEARNER' ? session.learnerId : null);

    const dockets = await EntitlementService.listClearanceDockets(orgId, targetLearnerId || undefined);

    return NextResponse.json({
      success: true,
      data: dockets,
      count: dockets.length,
    });
  } catch (error: any) {
    console.error('Error in clearance docket API:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Operation failed', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await authenticateRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { learnerId, docketType, termOrSemester } = body;

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;
    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation not found' }, { status: 400 });
    }

    const targetLearnerId = learnerId || (session.role === 'LEARNER' ? session.learnerId : null);
    if (!targetLearnerId) {
      return NextResponse.json(
        { success: false, message: 'learnerId is required to generate clearance docket.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const docketResult = await EntitlementService.generateClearanceDocket({
      organisationId: orgId,
      learnerId: targetLearnerId,
      docketType: docketType === 'CLINICAL_ROTATION_CLEARANCE' ? DocketType.CLINICAL_ROTATION_CLEARANCE : DocketType.EXAMINATION_CLEARANCE,
      termOrSemester,
      issuedById: session.userId,
    });

    return NextResponse.json({
      success: true,
      message: docketResult.docket.isCleared
        ? 'Official cryptographic clearance docket successfully generated.'
        : 'Docket generated: Notice — fee balance threshold not yet met for full clearance.',
      data: docketResult,
    });
  } catch (error: any) {
    console.error('Error generating clearance docket:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Docket generation failed', code: 'DOCKET_ERROR' },
      { status: 500 }
    );
  }
}
