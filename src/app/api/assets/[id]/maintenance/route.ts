// src/app/api/assets/[id]/maintenance/route.ts — Asset Maintenance Logs API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';
import { AssetService } from '@/server/services/asset.service';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const orgId =
      session.organisationId ||
      (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;

    if (!orgId) {
      return NextResponse.json(
        { success: false, message: 'Organisation context required.' },
        { status: 400 }
      );
    }

    const assetId = params.id;
    const body = await req.json();

    if (!body.description || !body.technicianName) {
      return NextResponse.json(
        { success: false, message: 'Description and technician name are required.' },
        { status: 400 }
      );
    }

    const log = await AssetService.logMaintenance(
      orgId,
      assetId,
      {
        description: body.description,
        costZMW: body.costZMW ? Number(body.costZMW) : 0,
        technicianName: body.technicianName,
        serviceDate: body.serviceDate,
        nextScheduledService: body.nextScheduledService,
        conditionAfterService: body.conditionAfterService,
      },
      session.userId
    );

    return NextResponse.json({
      success: true,
      message: 'Maintenance service log recorded successfully.',
      data: log,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error recording maintenance log' },
      { status: 400 }
    );
  }
}
