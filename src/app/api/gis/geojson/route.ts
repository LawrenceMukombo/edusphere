import { NextRequest, NextResponse } from 'next/server';
import { GisService } from '@/server/services/gis.service';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgCode = searchParams.get('orgCode') || 'EDS-ZM-SOL-001';

    let geoJson: any = null;

    try {
      const org = await prisma.organisation.findFirst({
        where: { code: orgCode },
      });

      if (org) {
        geoJson = await GisService.getSchoolNetworkGeoJson(org.id);
      }
    } catch (e) {
      // Fallback
    }

    if (!geoJson) {
      // Generate Solwezi GeoJSON
      geoJson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [26.3951, -12.1642] },
            properties: {
              id: 'LSS-MSC',
              name: 'Mushitala Campus (Near Kansanshi)',
              code: 'MSC',
              type: 'MAIN_SENIOR_BOARDING',
              capacity: 650,
              enrolled: 420,
            },
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [26.3884, -12.1812] },
            properties: {
              id: 'LSS-URB',
              name: 'Urban Campus (Solwezi Central)',
              code: 'URB',
              type: 'DAY_PRIMARY_ECE',
              capacity: 450,
              enrolled: 360,
            },
          },
        ],
      };
    }

    return NextResponse.json(geoJson);
  } catch (error: any) {
    console.error('Error generating school GIS GeoJSON:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate GeoJSON' },
      { status: 500 }
    );
  }
}
