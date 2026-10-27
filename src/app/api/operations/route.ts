import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { extractSessionToken, verifyToken } from '@/server/auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const p = prisma as any;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  try {
    if (type === 'hostels') {
      const hostels = await p.hostelBuilding.findMany({
        include: {
          rooms: {
            include: {
              beds: {
                include: {
                  allocations: {
                    include: {
                      learner: { select: { id: true, studentNumber: true, firstName: true, lastName: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });
      return NextResponse.json({ success: true, data: hostels });
    }

    if (type === 'routes') {
      const routes = await p.transportRoute.findMany({
        include: {
          TransportSubscription: {
            include: {
              learner: { select: { id: true, studentNumber: true, firstName: true, lastName: true } },
            },
          },
        },
      });
      return NextResponse.json({ success: true, data: routes });
    }

    if (type === 'books') {
      const books = await p.libraryBook.findMany({
        include: {
          loans: {
            include: {
              learner: { select: { id: true, studentNumber: true, firstName: true, lastName: true } },
            },
          },
        },
      });
      return NextResponse.json({ success: true, data: books });
    }

    if (type === 'access_events') {
      const events = await p.campusAccessEvent.findMany({
        orderBy: { timestamp: 'desc' },
        take: 30,
      });
      return NextResponse.json({ success: true, data: events });
    }

    return NextResponse.json({ success: false, message: 'Invalid query type.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const p = prisma as any;
  const token = extractSessionToken(req.headers);
  const session = token ? verifyToken(token) : null;
  const fallbackOrg = await prisma.organisation.findFirst();
  const organisationId = session?.organisationId || fallbackOrg?.id;

  try {
    const body = await req.json();
    const action = body.action;

    // 1. ALLOCATE BED
    if (action === 'allocate_bed') {
      const { bedId, learnerId } = body;
      const bed = await p.hostelBed.findUnique({ where: { id: bedId } });
      if (!bed) return NextResponse.json({ success: false, message: 'Bed not found' }, { status: 404 });
      if (bed.isOccupied) return NextResponse.json({ success: false, message: 'Bed is already occupied' }, { status: 400 });

      const allocation = await p.$transaction(async (tx: any) => {
        const alloc = await tx.hostelAllocation.create({
          data: {
            bedId,
            learnerId,
            academicYear: '2026',
            semesterNumber: 1,
            isApproved: true,
            checkInDate: new Date(),
          },
          include: { learner: true },
        });

        await tx.hostelBed.update({
          where: { id: bedId },
          data: { isOccupied: true, currentLearnerId: learnerId },
        });

        return alloc;
      });

      return NextResponse.json({ success: true, data: allocation });
    }

    // 2. CHECK OUT BED
    if (action === 'checkout_bed') {
      const { bedId } = body;
      await p.$transaction(async (tx: any) => {
        await tx.hostelBed.update({
          where: { id: bedId },
          data: { isOccupied: false, currentLearnerId: null },
        });

        const latestAlloc = await tx.hostelAllocation.findFirst({
          where: { bedId, checkOutDate: null },
          orderBy: { checkInDate: 'desc' },
        });
        if (latestAlloc) {
          await tx.hostelAllocation.update({
            where: { id: latestAlloc.id },
            data: { checkOutDate: new Date() },
          });
        }
      });

      return NextResponse.json({ success: true, message: 'Bed checked out successfully.' });
    }

    // 3. RETURN BOOK LOAN
    if (action === 'return_book') {
      const { loanId } = body;
      const loan = await p.libraryLoan.findUnique({ where: { id: loanId } });
      if (!loan) return NextResponse.json({ success: false, message: 'Loan not found' }, { status: 404 });

      await p.$transaction(async (tx: any) => {
        await tx.libraryLoan.update({
          where: { id: loanId },
          data: { isReturned: true, returnedDate: new Date() },
        });

        await tx.libraryBook.update({
          where: { id: loan.bookId },
          data: { availableCopies: { increment: 1 } },
        });
      });

      return NextResponse.json({ success: true, message: 'Book returned to catalogue.' });
    }

    // 4. RECORD ACCESS EVENT / SCANNER
    if (action === 'record_access') {
      const { gateName, direction, credentialMethod, learnerId, qrToken } = body;

      // Emergency Exit is ALWAYS permitted under non-negotiable safety rules
      const isExit = direction === 'EXIT';
      let isAllowed = true;
      let denialReason = null;

      if (!isExit && learnerId) {
        // Check if student has valid gate entitlement
        const ent = await p.studentEntitlement.findUnique({
          where: { learnerId_serviceType: { learnerId, serviceType: 'CAMPUS_GATE' } },
        });
        if (ent && ent.status !== 'ACTIVE') {
          isAllowed = false;
          denialReason = 'Campus Gate Access Suspended — Financial Clearance Pending';
        }
      }

      const event = await p.campusAccessEvent.create({
        data: {
          gateName: gateName || 'Manyama Main Gate — Lumwana Turnstile',
          direction: direction || 'ENTRY',
          credentialMethod: credentialMethod || 'QR_PASS',
          learnerId: learnerId || null,
          isAllowed: isExit ? true : isAllowed,
          denialReason: isExit ? null : denialReason,
        },
      });

      return NextResponse.json({
        success: true,
        isAllowed: isExit ? true : isAllowed,
        message: isExit
          ? 'Emergency / General Exit Granted (Safety Egress Guaranteed)'
          : isAllowed
          ? 'Access Granted • Credential Verified'
          : denialReason,
        data: event,
      });
    }

    // 5. CREATE HOSTEL BUILDING
    if (action === 'create_hostel') {
      let campusId = body.campusId;
      if (!campusId) {
        const campus = await p.campus.findFirst();
        campusId = campus?.id;
      }
      const hostel = await p.hostelBuilding.create({
        data: {
          name: body.name,
          campusId,
          genderPolicy: body.genderPolicy || 'FEMALE_ONLY',
          totalRooms: Number(body.totalRooms || 20),
          totalBeds: Number(body.totalBeds || 80),
          wardenName: body.wardenName || null,
          wardenPhone: body.wardenPhone || null,
          feePerSemesterZMW: body.feePerSemesterZMW ? Number(body.feePerSemesterZMW) : 2200,
        },
        include: { campus: true },
      });
      return NextResponse.json({ success: true, message: 'Hostel building created successfully.', data: hostel }, { status: 201 });
    }

    // 6. UPDATE HOSTEL BUILDING
    if (action === 'update_hostel') {
      const { hostelId, ...rest } = body;
      const updated = await p.hostelBuilding.update({
        where: { id: hostelId },
        data: {
          ...(rest.name && { name: rest.name.trim() }),
          ...(rest.genderPolicy && { genderPolicy: rest.genderPolicy }),
          ...(rest.wardenName !== undefined && { wardenName: rest.wardenName?.trim() || null }),
          ...(rest.wardenPhone !== undefined && { wardenPhone: rest.wardenPhone?.trim() || null }),
          ...(rest.feePerSemesterZMW !== undefined && { feePerSemesterZMW: Number(rest.feePerSemesterZMW) }),
        },
      });
      return NextResponse.json({ success: true, message: 'Hostel updated.', data: updated });
    }

    // 7. DELETE HOSTEL BUILDING
    if (action === 'delete_hostel') {
      const { hostelId } = body;
      const occupied = await p.hostelBed.count({
        where: { room: { buildingId: hostelId }, isOccupied: true },
      });
      if (occupied > 0) {
        return NextResponse.json({ success: false, message: `Cannot delete: ${occupied} bed(s) are currently occupied.` }, { status: 400 });
      }
      await p.hostelBuilding.delete({ where: { id: hostelId } });
      return NextResponse.json({ success: true, message: 'Hostel building deleted.' });
    }

    // 8. CREATE ROOM
    if (action === 'create_room') {
      const { buildingId, roomNumber, floor, capacityBeds, autoCreateBeds } = body;
      const room = await p.hostelRoom.create({
        data: {
          buildingId,
          roomNumber,
          floor: Number(floor || 1),
          capacityBeds: Number(capacityBeds || 4),
        },
      });
      if (autoCreateBeds && room.capacityBeds > 0) {
        for (let i = 1; i <= room.capacityBeds; i++) {
          await p.hostelBed.create({
            data: { roomId: room.id, bedNumber: `Bed ${i}`, isOccupied: false },
          });
        }
      }
      return NextResponse.json({ success: true, message: 'Room created.', data: room }, { status: 201 });
    }

    // 9. DELETE ROOM
    if (action === 'delete_room') {
      const { roomId } = body;
      const occupied = await p.hostelBed.count({ where: { roomId, isOccupied: true } });
      if (occupied > 0) {
        return NextResponse.json({ success: false, message: 'Cannot delete: Room has occupied beds.' }, { status: 400 });
      }
      await p.hostelRoom.delete({ where: { id: roomId } });
      return NextResponse.json({ success: true, message: 'Room deleted.' });
    }

    // 10. CREATE BED
    if (action === 'create_bed') {
      const { roomId, bedNumber } = body;
      const bed = await p.hostelBed.create({
        data: { roomId, bedNumber, isOccupied: false },
      });
      return NextResponse.json({ success: true, message: 'Bed created.', data: bed }, { status: 201 });
    }

    // 11. DELETE BED
    if (action === 'delete_bed') {
      const { bedId } = body;
      const bed = await p.hostelBed.findUnique({ where: { id: bedId } });
      if (bed?.isOccupied) {
        return NextResponse.json({ success: false, message: 'Cannot delete occupied bed.' }, { status: 400 });
      }
      await p.hostelBed.delete({ where: { id: bedId } });
      return NextResponse.json({ success: true, message: 'Bed deleted.' });
    }

    // 12. CREATE TRANSPORT ROUTE
    if (action === 'create_route') {
      let campusId = body.campusId;
      if (!campusId) {
        const campus = await p.campus.findFirst();
        campusId = campus?.id;
      }
      const route = await p.transportRoute.create({
        data: {
          campusId,
          name: body.name,
          busCapacity: Number(body.busCapacity || 32),
          driverName: body.driverName || 'Campus Logistics Driver',
          driverPhone: body.driverPhone || '+260 97 700 0000',
          vehicleRegNo: body.vehicleRegNo || 'ALB 4421 ZM',
          farePerTermZMW: body.farePerTermZMW ? Number(body.farePerTermZMW) : 1500,
          stopsJson: body.stopsJson ? JSON.stringify(body.stopsJson) : JSON.stringify(['Main Campus', 'Solwezi CBD', 'Lumwana Junction']),
        },
      });
      return NextResponse.json({ success: true, message: 'Transport route created.', data: route }, { status: 201 });
    }

    // 13. DELETE TRANSPORT ROUTE
    if (action === 'delete_route') {
      const { routeId } = body;
      await p.transportRoute.delete({ where: { id: routeId } });
      return NextResponse.json({ success: true, message: 'Route deleted.' });
    }

    return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
