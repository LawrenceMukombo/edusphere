import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { FinanceService } from '@/server/services/finance.service';
import { FeeCategory, ResidencyType } from '@prisma/client';
import { authenticateRequest } from '@/server/auth';

export const dynamic = 'force-dynamic';

const AUTHORIZED_ROLES = [
  'BURSAR',
  'INSTITUTION_ADMIN',
  'ACCOUNTANT',
  'PLATFORM_SUPER_ADMIN',
  'HEADTEACHER',
];

export async function POST(request: Request) {
  try {
    const session = await authenticateRequest(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required. Missing or invalid bearer/cookie session token.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    if (!AUTHORIZED_ROLES.includes(session.role as string)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden: 1-Click Cohort Batch Invoicing requires Bursar or Institution Admin privilege.',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;
    if (!orgId) {
      return NextResponse.json(
        { success: false, message: 'Organisation not found', code: 'NOT_FOUND' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { cohortId, termId, dueDate, semesterNumber, residencyType, lines } = body;

    if (!cohortId) {
      return NextResponse.json(
        { success: false, message: 'cohortId is required for batch cohort invoicing.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    let targetTermId = termId;
    if (!targetTermId) {
      const term = await prisma.term.findFirst();
      targetTermId = term?.id;
    }

    if (!targetTermId) {
      return NextResponse.json(
        { success: false, message: 'No active academic term found.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const batchResult = await FinanceService.batchInvoiceCohort({
      organisationId: orgId,
      cohortId,
      termId: targetTermId,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      semesterNumber: semesterNumber ? parseInt(semesterNumber, 10) : undefined,
      residencyType: residencyType as ResidencyType,
      lines: lines?.map((l: any) => ({
        category: (l.category as FeeCategory) || FeeCategory.TUITION,
        description: l.description,
        unitPrice: Number(l.amountZMW || l.unitPrice || 0),
        quantity: l.quantity || 1,
      })),
      actorId: session.userId,
    });

    return NextResponse.json({
      success: true,
      message: `Batch cohort invoicing completed for ${batchResult.cohortName}. Issued ${batchResult.invoicesCreated} invoices (K${batchResult.totalAmountBilled.toLocaleString()}).`,
      data: batchResult,
    });
  } catch (error: any) {
    console.error('Error in batch cohort invoicing:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Batch invoicing failed', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await authenticateRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;

    // Return all cohorts with programmes and enrolled student counts
    const cohorts = await prisma.cohort.findMany({
      where: { ...(orgId ? { organisationId: orgId } : {}) },
      include: {
        programme: true,
      },
      orderBy: { name: 'asc' },
    });

    const cohortsWithCounts = await Promise.all(
      cohorts.map(async (cohort) => {
        const studentCount = await prisma.learner.count({
          where: {
            organisationId: cohort.organisationId,
            status: 'ENROLLED',
            OR: [
              { currentClass: { name: { contains: cohort.name, mode: 'insensitive' } } },
              { currentClass: { stream: { contains: cohort.intake, mode: 'insensitive' } } },
              { courseRegistrations: { some: { courseModule: { programmeId: cohort.programmeId } } } },
            ],
          },
        });

        return {
          id: cohort.id,
          name: cohort.name,
          intake: cohort.intake,
          academicYear: cohort.academicYear,
          currentYear: cohort.currentYear,
          currentSemester: cohort.currentSemester,
          capacity: cohort.capacity,
          programmeId: cohort.programmeId,
          programmeName: cohort.programme.name,
          programmeCode: cohort.programme.code,
          enrolledCount: studentCount > 0 ? studentCount : cohort.capacity || 60,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: cohortsWithCounts,
    });
  } catch (error: any) {
    console.error('Error fetching cohorts for batch invoicing:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch cohorts', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
