// src/app/api/boarding/route.ts — Database-Backed NWUCHAS Hostel Accommodation & Residential Halls API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hallName = searchParams.get('house');
    const programme = searchParams.get('grade');
    const search = searchParams.get('search')?.toLowerCase();

    const token = extractAuthHeader(request.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId) {
      const nwuchasOrg = await prisma.organisation.findFirst({
        where: { code: 'NWUCHAS' },
      });
      orgId = nwuchasOrg?.id || null;
    }

    // 1. Fetch hostel buildings and bed capacities
    const buildings = await prisma.hostelBuilding.findMany({
      include: {
        campus: { select: { id: true, name: true } },
        rooms: {
          include: {
            beds: {
              include: {
                allocations: {
                  where: { isApproved: true },
                  include: {
                    learner: {
                      select: {
                        id: true,
                        studentNumber: true,
                        firstName: true,
                        lastName: true,
                        gender: true,
                        status: true,
                        residentialArea: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    let totalBeds = 0;
    let totalOccupied = 0;
    const buildingStats: Record<string, any> = {};

    buildings.forEach((b) => {
      let bBeds = 0;
      let bOccupied = 0;
      b.rooms.forEach((r) => {
        bBeds += r.capacityBeds || r.beds.length;
        r.beds.forEach((bed) => {
          if (bed.isOccupied || bed.allocations.length > 0) {
            bOccupied++;
          }
        });
      });

      totalBeds += bBeds;
      totalOccupied += bOccupied;

      buildingStats[b.name] = {
        id: b.id,
        name: b.name,
        campusName: b.campus?.name || 'NWUCHAS Main Campus',
        genderPolicy: b.genderPolicy,
        capacity: bBeds,
        occupied: bOccupied,
        occupancyRate: bBeds > 0 ? Number(((bOccupied / bBeds) * 100).toFixed(1)) : 0,
        warden: b.wardenName || 'Dean of Students Office',
        wardenPhone: b.wardenPhone || '+260 218 821 400',
        feePerSemesterZMW: b.feePerSemesterZMW ? Number(b.feePerSemesterZMW) : 2200,
      };
    });

    // 2. Fetch all resident learners allocated to beds
    const allocations = await prisma.hostelAllocation.findMany({
      where: { isApproved: true },
      include: {
        learner: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
            gender: true,
            currentClass: { select: { name: true } },
          },
        },
        bed: {
          include: {
            room: {
              include: {
                building: true,
              },
            },
          },
        },
      },
      orderBy: { checkInDate: 'desc' },
    });

    let residentStudents = allocations.map((a) => ({
      allocationId: a.id,
      studentId: a.learner.id,
      studentNumber: a.learner.studentNumber,
      learnerName: `${a.learner.firstName} ${a.learner.lastName}`,
      gender: a.learner.gender,
      className: a.learner.currentClass?.name || 'Tertiary Health Programme',
      studentType: 'BOARDER',
      academicYear: a.academicYear,
      semesterNumber: a.semesterNumber,
      checkInDate: a.checkInDate.toISOString().split('T')[0],
      currentAccommodation: {
        boardingHouse: a.bed.room.building.name,
        dormRoom: a.bed.room.roomNumber,
        bedNumber: a.bed.bedNumber,
        genderPolicy: a.bed.room.building.genderPolicy,
      },
    }));

    if (hallName) {
      residentStudents = residentStudents.filter(
        (s) => s.currentAccommodation.boardingHouse.toLowerCase() === hallName.toLowerCase()
      );
    }
    if (programme) {
      residentStudents = residentStudents.filter(
        (s) => s.className.toLowerCase().includes(programme.toLowerCase())
      );
    }
    if (search) {
      residentStudents = residentStudents.filter(
        (s) =>
          s.learnerName.toLowerCase().includes(search) ||
          s.studentNumber.toLowerCase().includes(search) ||
          s.className.toLowerCase().includes(search) ||
          s.currentAccommodation.dormRoom.toLowerCase().includes(search) ||
          s.currentAccommodation.bedNumber.toLowerCase().includes(search)
      );
    }

    const stats = {
      totalBedCapacity: totalBeds,
      activeBoarders: totalOccupied,
      overallOccupancyRate: totalBeds > 0 ? Number(((totalOccupied / totalBeds) * 100).toFixed(1)) : 0,
      buildings: buildingStats,
      standbyPower: 'Solar Hybrid & Automatic Generator Support Active',
      campusClinic: 'NWUCHAS Student Health Centre (Nurse & Clinical Officer On-Call)',
    };

    return NextResponse.json({
      success: true,
      stats,
      count: residentStudents.length,
      learners: residentStudents,
    });
  } catch (error: any) {
    console.error('Error fetching boarding data:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
