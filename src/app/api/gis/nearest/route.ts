import { NextRequest, NextResponse } from 'next/server';
import { GisService } from '@/server/services/gis.service';
import { prisma } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, orgCode = 'EDS-ZM-001' } = body;

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

    const org = await prisma.organisation.findFirst({
      where: { code: orgCode },
    });

    if (!org) {
      return NextResponse.json({ success: false, message: 'Organisation not found' }, { status: 404 });
    }

    const result = await GisService.findNearestCampus(org.id, { latitude: lat, longitude: lng });

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
