// src/app/api/assets/route.ts — Pure Database-Backed Asset Register & Equipment REST API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';
import { AssetService } from '@/server/services/asset.service';
import { AssetCategory, AssetCondition, AssetStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const WRITE_ROLES = [
  'INSTITUTION_ADMIN',
  'ESTATES_OFFICER',
  'BURSAR',
  'DEPUTY_BURSAR',
  'ACCOUNTANT',
  'SUPER_ADMIN',
  'DIRECTOR',
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as AssetCategory | null;
    const condition = searchParams.get('condition') as AssetCondition | null;
    const status = searchParams.get('status') as AssetStatus | null;
    const campusId = searchParams.get('campusId') || undefined;
    const search = searchParams.get('search') || undefined;
    const summaryOnly = searchParams.get('summary') === 'true';

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
      return NextResponse.json({ success: true, data: [], metrics: null });
    }

    if (summaryOnly) {
      const metrics = await AssetService.getPortfolioMetrics(orgId);
      return NextResponse.json({ success: true, metrics });
    }

    const assets = await AssetService.listAssets(orgId, {
      category: category || undefined,
      condition: condition || undefined,
      status: status || undefined,
      campusId,
      search,
    });

    const metrics = await AssetService.getPortfolioMetrics(orgId);

    return NextResponse.json({
      success: true,
      data: assets,
      metrics,
      totalCount: assets.length,
    });
  } catch (error: any) {
    console.error('[API Assets GET] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching asset register' },
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
        { success: false, message: 'Authentication required to register assets.' },
        { status: 401 }
      );
    }

    // Role check
    const userRole = session.role?.toUpperCase();
    if (!WRITE_ROLES.includes(userRole)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Insufficient privileges to register institutional assets.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.name || !body.category || body.purchaseCostZMW === undefined || !body.location) {
      return NextResponse.json(
        { success: false, message: 'Missing required asset fields: name, category, location, purchaseCostZMW' },
        { status: 400 }
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

    const asset = await AssetService.createAsset(
      orgId,
      {
        name: body.name,
        category: body.category,
        location: body.location,
        assetTag: body.assetTag,
        serialNumber: body.serialNumber,
        purchaseDate: body.purchaseDate,
        purchaseCostZMW: Number(body.purchaseCostZMW),
        currentValueZMW: body.currentValueZMW ? Number(body.currentValueZMW) : undefined,
        depreciationRatePct: body.depreciationRatePct ? Number(body.depreciationRatePct) : undefined,
        condition: body.condition,
        status: body.status,
        assignedToStaffId: body.assignedToStaffId,
        custodianName: body.custodianName,
        notes: body.notes,
        campusId: body.campusId,
      },
      session.userId
    );

    return NextResponse.json({
      success: true,
      message: `Asset [${asset.assetTag}] registered successfully.`,
      data: asset,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API Assets POST] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error registering asset' },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const userRole = session.role?.toUpperCase();
    if (!WRITE_ROLES.includes(userRole)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Insufficient privileges.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json(
        { success: false, message: 'Target asset ID is required.' },
        { status: 400 }
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

    const updated = await AssetService.updateAsset(
      orgId,
      body.id,
      body,
      session.userId
    );

    return NextResponse.json({
      success: true,
      message: `Asset [${updated.assetTag}] updated successfully.`,
      data: updated,
    });
  } catch (error: any) {
    console.error('[API Assets PUT] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating asset' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const userRole = session.role?.toUpperCase();
    if (!['INSTITUTION_ADMIN', 'BURSAR', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only BURSAR or INSTITUTION_ADMIN can decommission assets.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('id');

    if (!assetId) {
      return NextResponse.json(
        { success: false, message: 'Asset ID parameter is required.' },
        { status: 400 }
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

    const result = await AssetService.deleteAsset(
      orgId,
      assetId,
      session.userId
    );

    return NextResponse.json({
      success: true,
      message: `Asset [${result.assetTag}] decommissioned successfully.`,
      data: result,
    });
  } catch (error: any) {
    console.error('[API Assets DELETE] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error decommissioning asset' },
      { status: 400 }
    );
  }
}
