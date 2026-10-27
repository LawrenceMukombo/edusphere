// src/app/api/boarding/route.ts — Database-Backed NWUCHAS Hostel Accommodation & Residential Halls API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';
import { BoardingService } from '@/server/services/boarding.service';
import { HostelGenderPolicy } from '@prisma/client';

export const dynamic = 'force-dynamic';

const BOARDING_ADMIN_ROLES = [
  'INSTITUTION_ADMIN',
  'ESTATES_OFFICER',
  'WARDEN',
  'SUPER_ADMIN',
  'BURSAR',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hallName = searchParams.get('house');
    const programme = searchParams.get('grade');
    const search = searchParams.get('search')?.toLowerCase();
    const campusId = searchParams.get('campusId') || undefined;

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
    const buildings = await BoardingService.listHostels(campusId);

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
        rooms: b.rooms,
      };
    });

    // 2. Fetch all resident learners allocated to beds
    const allocations = await prisma.hostelAllocation.findMany({
      where: { isApproved: true, checkOutDate: null },
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
      hostels: buildings,
    });
  } catch (error: any) {
    console.error('Error fetching boarding data:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    if (!BOARDING_ADMIN_ROLES.includes(userRole)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Insufficient privileges for hostel operations.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const action = body.action || 'create_hostel';

    // 1. Create Hostel Building
    if (action === 'create_hostel') {
      let campusId = body.campusId;
      if (!campusId) {
        const defaultCampus = session.organisationId
          ? await prisma.campus.findFirst({ where: { organisationId: session.organisationId } })
          : await prisma.campus.findFirst();
        campusId = defaultCampus?.id;
      }

      if (!campusId || !body.name || !body.genderPolicy) {
        return NextResponse.json(
          { success: false, message: 'Missing required hostel fields: name, campusId, genderPolicy' },
          { status: 400 }
        );
      }

      const hostel = await BoardingService.createHostel({
        name: body.name,
        campusId,
        genderPolicy: body.genderPolicy as HostelGenderPolicy,
        totalRooms: body.totalRooms ? Number(body.totalRooms) : 20,
        totalBeds: body.totalBeds ? Number(body.totalBeds) : 80,
        wardenName: body.wardenName,
        wardenPhone: body.wardenPhone,
        feePerSemesterZMW: body.feePerSemesterZMW ? Number(body.feePerSemesterZMW) : 2200,
      });

      return NextResponse.json({
        success: true,
        message: `Hostel building "${hostel.name}" created successfully.`,
        data: hostel,
      }, { status: 201 });
    }

    // 2. Create Room
    if (action === 'create_room') {
      if (!body.buildingId || !body.roomNumber) {
        return NextResponse.json(
          { success: false, message: 'buildingId and roomNumber are required.' },
          { status: 400 }
        );
      }

      const room = await BoardingService.createRoom(body.buildingId, {
        roomNumber: body.roomNumber,
        floor: body.floor ? Number(body.floor) : 1,
        capacityBeds: body.capacityBeds ? Number(body.capacityBeds) : 4,
      });

      // Optionally auto-create beds for room capacity
      if (body.autoCreateBeds && room.capacityBeds > 0) {
        for (let i = 1; i <= room.capacityBeds; i++) {
          await BoardingService.createBed(room.id, `Bed ${i}`);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Room "${room.roomNumber}" created successfully.`,
        data: room,
      }, { status: 201 });
    }

    // 3. Create Bed
    if (action === 'create_bed') {
      if (!body.roomId || !body.bedNumber) {
        return NextResponse.json(
          { success: false, message: 'roomId and bedNumber are required.' },
          { status: 400 }
        );
      }

      const bed = await BoardingService.createBed(body.roomId, body.bedNumber);
      return NextResponse.json({
        success: true,
        message: `Bed "${bed.bedNumber}" created successfully.`,
        data: bed,
      }, { status: 201 });
    }

    // 4. Allocate Bed to Student
    if (action === 'allocate_bed') {
      if (!body.bedId || !body.learnerId) {
        return NextResponse.json(
          { success: false, message: 'bedId and learnerId are required for allocation.' },
          { status: 400 }
        );
      }

      const alloc = await BoardingService.allocateBed(
        body.bedId,
        body.learnerId,
        body.academicYear,
        body.semesterNumber
      );

      return NextResponse.json({
        success: true,
        message: `Bed allocated to student [${alloc.learner.studentNumber}] successfully.`,
        data: alloc,
      }, { status: 201 });
    }

    // 5. Checkout Bed
    if (action === 'checkout_bed') {
      if (!body.bedId) {
        return NextResponse.json(
          { success: false, message: 'bedId is required for checkout.' },
          { status: 400 }
        );
      }

      const res = await BoardingService.checkoutBed(body.bedId);
      return NextResponse.json(res);
    }

    return NextResponse.json({ success: false, message: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Error in POST /api/boarding:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error processing boarding request' },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const userRole = session.role?.toUpperCase();
    if (!BOARDING_ADMIN_ROLES.includes(userRole)) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const body = await req.json();
    const type = body.type || 'hostel';

    if (type === 'hostel') {
      if (!body.id) {
        return NextResponse.json({ success: false, message: 'Hostel ID is required.' }, { status: 400 });
      }

      const updated = await BoardingService.updateHostel(body.id, body);
      return NextResponse.json({
        success: true,
        message: `Hostel building "${updated.name}" updated successfully.`,
        data: updated,
      });
    }

    if (type === 'room') {
      if (!body.id) {
        return NextResponse.json({ success: false, message: 'Room ID is required.' }, { status: 400 });
      }

      const updated = await BoardingService.updateRoom(body.id, body);
      return NextResponse.json({
        success: true,
        message: `Room updated successfully.`,
        data: updated,
      });
    }

    return NextResponse.json({ success: false, message: `Unknown type: ${type}` }, { status: 400 });
  } catch (error: any) {
    console.error('Error in PUT /api/boarding:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating record' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const userRole = session.role?.toUpperCase();
    if (!['INSTITUTION_ADMIN', 'SUPER_ADMIN', 'ESTATES_OFFICER'].includes(userRole)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only Estates Officer or Institution Admin can delete boarding assets.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'hostel';
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Target record ID is required.' }, { status: 400 });
    }

    if (type === 'hostel') {
      await BoardingService.deleteHostel(id);
      return NextResponse.json({
        success: true,
        message: 'Hostel building deleted successfully.',
      });
    }

    if (type === 'room') {
      await BoardingService.deleteRoom(id);
      return NextResponse.json({
        success: true,
        message: 'Room deleted successfully.',
      });
    }

    if (type === 'bed') {
      await BoardingService.deleteBed(id);
      return NextResponse.json({
        success: true,
        message: 'Bed deleted successfully.',
      });
    }

    return NextResponse.json({ success: false, message: `Unknown deletion type: ${type}` }, { status: 400 });
  } catch (error: any) {
    console.error('Error in DELETE /api/boarding:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error deleting record' },
      { status: 400 }
    );
  }
}
