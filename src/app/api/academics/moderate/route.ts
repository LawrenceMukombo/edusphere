import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { extractSessionToken, verifyToken } from '@/server/auth';

const moderateSchema = z.object({
  registrationIds: z.array(z.string().uuid()).min(1),
  toStatus: z.enum(['SUBMITTED', 'MODERATED', 'APPROVED', 'PUBLISHED', 'SUPERSEDED']),
  reason: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const actor = verifyToken(extractSessionToken(req.headers) ?? '');
    const p = prisma as any;

    const parsed = moderateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid moderation payload.',
        issues: parsed.error.flatten(),
      }, { status: 400 });
    }

    const { registrationIds, toStatus, reason } = parsed.data;

    const isModerated = ['MODERATED', 'APPROVED', 'PUBLISHED'].includes(toStatus);
    const isApproved = ['APPROVED', 'PUBLISHED'].includes(toStatus);

    const updated = await p.$transaction(async (tx: any) => {
      const records = await tx.courseRegistration.updateMany({
        where: { id: { in: registrationIds } },
        data: {
          status: toStatus,
          isModerated,
          isApproved,
        },
      });

      const sample = await tx.courseRegistration.findFirst({
        where: { id: registrationIds[0] },
        include: { courseModule: true },
      });

      if (sample) {
        await tx.auditEvent.create({
          data: {
            organisationId: sample.courseModule.programmeId
              ? (await tx.programme.findUnique({ where: { id: sample.courseModule.programmeId } }))?.organisationId
              : undefined,
            userId: actor?.userId || null,
            action: `EXAM_RESULTS_${toStatus}`,
            entityType: 'CourseRegistration',
            entityId: sample.id,
            detailsJson: JSON.stringify({
              count: records.count,
              toStatus,
              moduleCode: sample.courseModule.code,
              reason: reason || `Examination Board moderation to ${toStatus}.`,
              timestamp: new Date().toISOString(),
            }),
          },
        });
      }

      return tx.courseRegistration.findMany({
        where: { id: { in: registrationIds } },
        include: {
          learner: { select: { id: true, studentNumber: true, firstName: true, lastName: true } },
          courseModule: { include: { programme: true } },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Successfully advanced ${updated.length} result records to ${toStatus}.`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Moderation transition failed.',
    }, { status: 500 });
  }
}
