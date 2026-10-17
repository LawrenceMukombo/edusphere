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

    const geoJson = await GisService.getSchoolNetworkGeoJson(org.id);

    return NextResponse.json(geoJson);
  } catch (error: any) {
    console.error('Error generating school GIS GeoJSON:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate GeoJSON' },
      { status: 500 }
    );
  }
}
