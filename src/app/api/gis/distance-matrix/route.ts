import { NextRequest, NextResponse } from 'next/server';
import { GisService } from '@/server/services/gis.service';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgCode = searchParams.get('orgCode') || 'EDS-ZM-001';

    const org = await prisma.organisation.findFirst({
      where: { code: orgCode },
    });

    if (!org) {
      return NextResponse.json({ success: false, message: 'Organisation not found' }, { status: 404 });
    }

    const matrix = await GisService.getCampusDistanceMatrix(org.id);

    return NextResponse.json({
      success: true,
      data: matrix,
    });
  } catch (error: any) {
    console.error('Error fetching distance matrix:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to compute distance matrix' }, { status: 500 });
  }
}
