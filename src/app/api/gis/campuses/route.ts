// src/app/api/gis/campuses/route.ts — Pure Database-Backed NWUCHAS Campuses GIS API
import { NextRequest, NextResponse } from 'next/server';
import { GisService } from '@/server/services/gis.service';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgCode = searchParams.get('orgCode');

    let org = null;
    if (orgCode) {
      org = await prisma.organisation.findUnique({ where: { code: orgCode } });
    }
    if (!org) {
      org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
    }
    if (!org) {
      org = await prisma.organisation.findFirst();
    }

    if (!org) {
      return NextResponse.json({
        success: true,
        data: {
          summary: {
            campusCount: 0,
            totalCapacity: 0,
            totalEnrolled: 0,
            overallUtilization: 0,
            mainCampus: 'NWUCHAS Main Campus (Manyama)',
          },
          campuses: [],
          distanceMatrix: [],
        },
      });
    }

    const [campuses, distanceMatrix] = await Promise.all([
      GisService.getCampusesGis(org.id),
      GisService.getCampusDistanceMatrix(org.id),
    ]);

    const totalCapacity = campuses.reduce((sum, c) => sum + (c.capacity || 0), 0);
    const totalEnrolled = campuses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
    const overallUtilization = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 1000) / 10 : 0;
    const mainCampusName = campuses.find((c) => c.isMainCampus)?.name || campuses[0]?.name || 'NWUCHAS Main Campus (Manyama)';

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          campusCount: campuses.length,
          totalCapacity,
          totalEnrolled,
          overallUtilization,
          mainCampus: mainCampusName,
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { campusId, ...fields } = body;

    if (!campusId) {
      return NextResponse.json({ success: false, message: 'campusId is required' }, { status: 400 });
    }

    const updated = await prisma.campus.update({
      where: { id: campusId },
      data: {
        ...(fields.name && { name: fields.name }),
        ...(fields.code && { code: fields.code.toUpperCase() }),
        ...(fields.address !== undefined && { address: fields.address }),
        ...(fields.city && { city: fields.city }),
        ...(fields.phone !== undefined && { phone: fields.phone }),
        ...(fields.latitude !== undefined && { latitude: parseFloat(fields.latitude) }),
        ...(fields.longitude !== undefined && { longitude: parseFloat(fields.longitude) }),
        ...(fields.catchmentRadiusKm !== undefined && { catchmentRadiusKm: parseFloat(fields.catchmentRadiusKm) }),
        ...(fields.capacity !== undefined && { capacity: parseInt(fields.capacity, 10) }),
        ...(fields.campusType && { campusType: fields.campusType }),
        ...(fields.landAreaHectares !== undefined && { landAreaHectares: parseFloat(fields.landAreaHectares) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Campus ${updated.name} GIS metadata updated successfully.`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating campus GIS:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update campus' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let org = null;
    if (body.orgCode) {
      org = await prisma.organisation.findUnique({ where: { code: body.orgCode } });
    }
    if (!org) {
      org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
    }
    if (!org) {
      org = await prisma.organisation.findFirst();
    }

    if (!org) {
      return NextResponse.json({ success: false, message: 'Organisation not found' }, { status: 400 });
    }

    const newCampus = await prisma.campus.create({
      data: {
        organisationId: org.id,
        name: body.name || 'NWUCHAS Satellite Campus',
        code: (body.code || 'NWU-SAT').toUpperCase(),
        address: body.address || 'North-Western Province',
        city: body.city || 'Manyama, Lumwana',
        phone: body.phone || '+260 218 821 400',
        latitude: body.latitude ? parseFloat(body.latitude) : -12.2450,
        longitude: body.longitude ? parseFloat(body.longitude) : 25.8450,
        elevationMeters: body.elevationMeters ? parseInt(body.elevationMeters, 10) : 1350,
        capacity: body.capacity ? parseInt(body.capacity, 10) : 400,
        catchmentRadiusKm: body.catchmentRadiusKm ? parseFloat(body.catchmentRadiusKm) : 15.0,
        campusType: body.campusType || 'BRANCH',
        landAreaHectares: body.landAreaHectares ? parseFloat(body.landAreaHectares) : 3.0,
        isMainCampus: Boolean(body.isMainCampus),
        facilitiesJson: JSON.stringify(body.facilities || ['Lecture Halls', 'Clinical Skills Lab']),
      },
    });

    return NextResponse.json({
      success: true,
      message: `New campus "${newCampus.name}" provisioned successfully.`,
      data: newCampus,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating campus:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create campus' }, { status: 500 });
  }
}
