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

    // Strictly evaluate Solwezi campuses for Legacy School Solwezi
    const solweziCampuses = [
      {
        id: 'LSS-MSC',
        name: 'Mushitala Campus (Near Kansanshi)',
        code: 'MSC',
        address: 'Stand # S/SOLWE/3177178, Plot 889, 890 Kansanshi Mine Road (opp. SGC Filling Station), Mushitala',
        landmark: 'Opposite SGC Filling Station, Kansanshi Mine Road',
        city: 'Solwezi',
        latitude: -12.1642,
        longitude: 26.3951,
        catchmentRadiusKm: 15.0,
        campusType: 'SECONDARY_BOARDING_WING',
        capacity: 650,
        enrolledCount: 420,
      },
      {
        id: 'LSS-URB',
        name: 'Urban Campus (Solwezi Central)',
        code: 'URB',
        address: 'Opposite Kikombe School, next to Zambia Army Mess, Solwezi Central',
        landmark: 'Opposite Kikombe School, next to Zambia Army Mess',
        city: 'Solwezi',
        latitude: -12.1812,
        longitude: 26.3884,
        catchmentRadiusKm: 6.0,
        campusType: 'DAY_PRIMARY_ECE',
        capacity: 450,
        enrolledCount: 360,
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
        hasAvailableCapacity: true,
        spareCapacity: c.code === 'MSC' ? 65 : 45,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    result = {
      nearest: ranked[0],
      allRecommendations: ranked,
      targetCoordinates: { latitude: lat, longitude: lng },
      // Backwards compatibility aliases
      nearestCampus: ranked[0].campus,
      distanceKm: ranked[0].distanceKm,
      estimatedDriveMinutes: ranked[0].estimatedDriveMinutes,
      isWithinCatchment: ranked[0].isWithinCatchment,
      allCampusesRanked: ranked,
    };

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
