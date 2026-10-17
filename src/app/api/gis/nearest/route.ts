import { NextRequest, NextResponse } from 'next/server';
import { GisService } from '@/server/services/gis.service';
import { prisma } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, orgCode = 'EDS-ZM-SOL-001' } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, message: 'Latitude and longitude coordinates are required' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
      return NextResponse.json(
        { success: false, message: 'Invalid GPS coordinates provided' },
        { status: 400 }
      );
    }

    let result: any = null;

    try {
      const org = await prisma.organisation.findFirst({
        where: { code: orgCode },
      });

      if (org) {
        result = await GisService.findNearestCampus(org.id, { latitude: lat, longitude: lng });
      }
    } catch (e) {
      // Fallback seamlessly
    }

    if (!result || !result.campus) {
      // Solwezi campuses direct computation
      const solweziCampuses = [
        {
          id: 'LSS-MSC',
          name: 'Mushitala Campus (Near Kansanshi)',
          code: 'MSC',
          address: 'Plot 889, 890 Kansanshi Mine Road, Mushitala',
          city: 'Solwezi',
          latitude: -12.1642,
          longitude: 26.3951,
          catchmentRadiusKm: 15.0,
          campusType: 'SECONDARY_BOARDING_WING',
        },
        {
          id: 'LSS-URB',
          name: 'Urban Campus (Solwezi Central)',
          code: 'URB',
          address: 'Solwezi Town Centre, Independence Ave',
          city: 'Solwezi',
          latitude: -12.1812,
          longitude: 26.3884,
          catchmentRadiusKm: 6.0,
          campusType: 'DAY_PRIMARY_ECE',
        },
      ];

      const ranked = solweziCampuses.map((c) => {
        const dist = GisService.calculateDistanceKm(
          { latitude: lat, longitude: lng },
          { latitude: c.latitude, longitude: c.longitude }
        );
        const driveMinutes = GisService.estimateTravelTimeMinutes(dist);
        const inCatchment = dist <= c.catchmentRadiusKm;
        return {
          campus: c,
          distanceKm: dist,
          estimatedDriveMinutes: driveMinutes,
          isWithinCatchment: inCatchment,
        };
      }).sort((a, b) => a.distanceKm - b.distanceKm);

      result = {
        nearestCampus: ranked[0].campus,
        distanceKm: ranked[0].distanceKm,
        estimatedDriveMinutes: ranked[0].estimatedDriveMinutes,
        isWithinCatchment: ranked[0].isWithinCatchment,
        allCampusesRanked: ranked,
      };
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error finding nearest campus:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to determine nearest branch' },
      { status: 500 }
    );
  }
}
