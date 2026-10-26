import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { extractSessionToken, verifyToken } from '@/server/auth';

const moduleSchema = z.object({
  programmeId: z.string().uuid(),
  code: z.string().trim().min(2).max(20),
  name: z.string().trim().min(3).max(120),
  creditUnits: z.number().int().min(1).max(30).default(4),
  semesterNumber: z.number().int().min(1).max(8).default(1),
  theoryHours: z.number().int().min(0).default(45),
  practicalHours: z.number().int().min(0).default(60),
  isClinical: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const actor = verifyToken(extractSessionToken(req.headers) ?? '');
    const p = prisma as any;

    const parsed = moduleSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid module syllabus details.',
        issues: parsed.error.flatten(),
      }, { status: 400 });
    }

    const { programmeId, code, name, creditUnits, semesterNumber, theoryHours, practicalHours, isClinical } = parsed.data;

    const created = await p.courseModule.upsert({
      where: {
        programmeId_code: {
          programmeId,
          code,
        },
      },
      update: {
        name,
        creditUnits,
        semesterNumber,
        theoryHours,
        practicalHours,
        isClinical,
      },
      create: {
        programmeId,
        code,
        name,
        creditUnits,
        semesterNumber,
        theoryHours,
        practicalHours,
        isClinical,
      },
      include: {
        programme: true,
      },
    });

    if (actor?.organisationId) {
      await p.auditEvent.create({
        data: {
          organisationId: actor.organisationId,
          userId: actor.userId,
          action: 'COURSE_MODULE_SAVED',
          entityType: 'CourseModule',
          entityId: created.id,
          detailsJson: JSON.stringify({ code, name, programme: created.programme?.name }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Course module ${code}: ${name} saved successfully.`,
      data: created,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Unable to save course module.',
    }, { status: 500 });
  }
}
