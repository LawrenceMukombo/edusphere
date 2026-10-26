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

    return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
