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

    const [campuses, distanceMatrix] = await Promise.all([
      GisService.getCampusesGis(org.id),
      GisService.getCampusDistanceMatrix(org.id),
    ]);

    const totalCapacity = campuses.reduce((sum, c) => sum + c.capacity, 0);
    const totalEnrolled = campuses.reduce((sum, c) => sum + c.enrolledCount, 0);
    const overallUtilization = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 1000) / 10 : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          campusCount: campuses.length,
          totalCapacity,
          totalEnrolled,
          overallUtilization,
          mainCampus: campuses.find((c) => c.isMainCampus)?.name || 'Main Campus',
        },
        campuses,
        distanceMatrix,
      },
    });
  } catch (error: any) {
    console.error('Error fetching campuses GIS:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch GIS data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orgCode = body.orgCode || 'EDS-ZM-001';

    const org = await prisma.organisation.findFirst({
      where: { code: orgCode },
    });

    if (!org) {
      return NextResponse.json({ success: false, message: 'Organisation not found' }, { status: 404 });
    }

    if (!body.name || !body.code) {
      return NextResponse.json({ success: false, message: 'Campus name and branch code are required' }, { status: 400 });
    }

    const newBranch = await GisService.createBranchCampus(org.id, {
      name: body.name,
      code: body.code.toUpperCase(),
      address: body.address,
      city: body.city || 'Lusaka',
      phone: body.phone,
      isMainCampus: body.isMainCampus || false,
      latitude: body.latitude ? parseFloat(body.latitude) : undefined,
      longitude: body.longitude ? parseFloat(body.longitude) : undefined,
      catchmentRadiusKm: body.catchmentRadiusKm ? parseFloat(body.catchmentRadiusKm) : 5.0,
      capacity: body.capacity ? parseInt(body.capacity, 10) : 500,
      campusType: body.campusType || 'BRANCH',
      landAreaHectares: body.landAreaHectares ? parseFloat(body.landAreaHectares) : undefined,
      facilities: body.facilities || [],
      contactEmail: body.contactEmail,
      headTeacherName: body.headTeacherName,
    });

    return NextResponse.json({
      success: true,
      message: 'New campus branch successfully registered with GIS attributes',
      data: newBranch,
    });
  } catch (error: any) {
    console.error('Error creating branch:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create branch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { campusId, orgCode = 'EDS-ZM-001', ...data } = body;

    if (!campusId) {
      return NextResponse.json({ success: false, message: 'campusId is required' }, { status: 400 });
    }

    const org = await prisma.organisation.findFirst({
      where: { code: orgCode },
    });

    if (!org) {
      return NextResponse.json({ success: false, message: 'Organisation not found' }, { status: 404 });
    }

    const updated = await GisService.updateCampusGis(org.id, campusId, {
      latitude: data.latitude !== undefined ? parseFloat(data.latitude) : undefined,
      longitude: data.longitude !== undefined ? parseFloat(data.longitude) : undefined,
      elevationMeters: data.elevationMeters !== undefined ? parseFloat(data.elevationMeters) : undefined,
      catchmentRadiusKm: data.catchmentRadiusKm !== undefined ? parseFloat(data.catchmentRadiusKm) : undefined,
      capacity: data.capacity !== undefined ? parseInt(data.capacity, 10) : undefined,
      campusType: data.campusType,
      landAreaHectares: data.landAreaHectares !== undefined ? parseFloat(data.landAreaHectares) : undefined,
      facilities: data.facilities,
      contactEmail: data.contactEmail,
      headTeacherName: data.headTeacherName,
    });

    return NextResponse.json({
      success: true,
      message: 'Campus GIS parameters updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating campus GIS:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update campus GIS' }, { status: 500 });
  }
}
