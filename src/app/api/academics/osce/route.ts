import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { extractSessionToken, verifyToken } from '@/server/auth';

const osceSchema = z.object({
  stationId: z.string().uuid(),
  learnerId: z.string().uuid(),
  examinerName: z.string().trim().min(2),
  scoreObtained: z.number().min(0).max(100),
  isPassed: z.boolean(),
  feedback: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const actor = verifyToken(extractSessionToken(req.headers) ?? '');
    const p = prisma as any;

    const parsed = osceSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid OSCE scoring payload.',
        issues: parsed.error.flatten(),
      }, { status: 400 });
    }

    const { stationId, learnerId, examinerName, scoreObtained, isPassed, feedback } = parsed.data;

    const result = await p.$transaction(async (tx: any) => {
      const record = await tx.osceResult.upsert({
        where: {
          stationId_learnerId: {
            stationId,
            learnerId,
          },
        },
        update: {
          examinerId: examinerName,
          scoreObtained,
          isPassed,
          feedback: feedback || null,
          evaluatedAt: new Date(),
        },
        create: {
          stationId,
          learnerId,
          examinerId: examinerName,
          scoreObtained,
          isPassed,
          feedback: feedback || null,
          evaluatedAt: new Date(),
        },
        include: {
          station: true,
          learner: { select: { id: true, studentNumber: true, firstName: true, lastName: true } },
        },
      });

      const station = await tx.osceStation.findUnique({
        where: { id: stationId },
        include: { courseModule: { include: { programme: true } } },
      });

      if (station?.courseModule?.programme?.organisationId) {
        await tx.auditEvent.create({
          data: {
            organisationId: station.courseModule.programme.organisationId,
            userId: actor?.userId || null,
            action: 'OSCE_CANDIDATE_SCORED',
            entityType: 'OsceResult',
            entityId: record.id,
            detailsJson: JSON.stringify({
              stationNumber: station.stationNumber,
              stationTitle: station.title,
              learnerId,
              score: scoreObtained,
              isPassed,
              examiner: examinerName,
            }),
          },
        });
      }

      return record;
    });

    return NextResponse.json({
      success: true,
      message: 'OSCE station result recorded and signed successfully.',
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Unable to record OSCE score.',
    }, { status: 500 });
  }
}
