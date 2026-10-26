import { NextResponse } from 'next/server';
import { z } from 'zod';
import { extractSessionToken, verifyToken } from '@/server/auth';
import { findNwuchasModule } from '@/lib/nwuchasModules';
import { prisma } from '@/server/db';

const createRecordSchema = z.object({
  title: z.string().trim().min(3).max(200),
  status: z.string().trim().min(2).max(64),
  summary: z.string().trim().min(2).max(4000),
  metadataJson: z.string().optional(),
});

const updateRecordSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(3).max(200).optional(),
  status: z.string().trim().min(2).max(64).optional(),
  summary: z.string().trim().min(2).max(4000).optional(),
  metadataJson: z.string().optional(),
});

async function resolveOrganisationId(headers: Headers): Promise<{ orgId: string; userId: string; role: string } | null> {
  const token = extractSessionToken(headers);
  const session = token ? verifyToken(token) : null;
  if (session?.organisationId) {
    return { orgId: session.organisationId, userId: session.userId, role: session.role };
  }
  const fallbackOrg =
    (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } })) ||
    (await prisma.organisation.findFirst());
  if (fallbackOrg) {
    return { orgId: fallbackOrg.id, userId: 'system-dev-officer', role: 'INSTITUTION_ADMIN' };
  }
  return null;
}

/** Authenticated institutional module records feed */
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const auth = await resolveOrganisationId(request.headers);
  const module = findNwuchasModule(params.slug);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Institutional organization context required.' }, { status: 403 });
  }
  if (!module) {
    return NextResponse.json({ success: false, message: 'Unknown module.' }, { status: 404 });
  }

  const records = await prisma.moduleWorkspaceRecord.findMany({
    where: { organisationId: auth.orgId, moduleSlug: module.slug },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      summary: true,
      metadataJson: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ success: true, data: records });
}

/** Create new module record */
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const auth = await resolveOrganisationId(request.headers);
  const module = findNwuchasModule(params.slug);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Institutional administrator authorization required.' }, { status: 403 });
  }
  if (!module) {
    return NextResponse.json({ success: false, message: 'Unknown module.' }, { status: 404 });
  }

  const parsed = createRecordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Invalid record data.', issues: parsed.error.flatten() }, { status: 400 });
  }

  const record = await prisma.$transaction(async (tx) => {
    const created = await tx.moduleWorkspaceRecord.create({
      data: {
        id: crypto.randomUUID(),
        organisationId: auth.orgId,
        moduleSlug: module.slug,
        title: parsed.data.title,
        status: parsed.data.status,
        summary: parsed.data.summary,
        metadataJson: parsed.data.metadataJson || JSON.stringify({ createdAt: new Date().toISOString() }),
        updatedAt: new Date(),
      },
    });

    await tx.auditEvent.create({
      data: {
        organisationId: auth.orgId,
        userId: auth.userId,
        action: 'MODULE_RECORD_CREATED',
        entityType: 'ModuleWorkspaceRecord',
        entityId: created.id,
        detailsJson: JSON.stringify({ moduleSlug: module.slug, title: created.title, status: created.status }),
      },
    });

    return created;
  });

  return NextResponse.json({ success: true, data: record }, { status: 201 });
}

/** Update module record */
export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  const auth = await resolveOrganisationId(request.headers);
  const module = findNwuchasModule(params.slug);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Institutional administrator authorization required.' }, { status: 403 });
  }
  if (!module) {
    return NextResponse.json({ success: false, message: 'Unknown module.' }, { status: 404 });
  }

  const parsed = updateRecordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Invalid update payload.', issues: parsed.error.flatten() }, { status: 400 });
  }

  const record = await prisma.$transaction(async (tx) => {
    const existing = await tx.moduleWorkspaceRecord.findFirst({
      where: { id: parsed.data.id, organisationId: auth.orgId, moduleSlug: module.slug },
    });
    if (!existing) {
      throw new Error('Record not found.');
    }

    const updated = await tx.moduleWorkspaceRecord.update({
      where: { id: existing.id },
      data: {
        ...(parsed.data.title ? { title: parsed.data.title } : {}),
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.summary ? { summary: parsed.data.summary } : {}),
        ...(parsed.data.metadataJson ? { metadataJson: parsed.data.metadataJson } : {}),
      },
    });

    await tx.auditEvent.create({
      data: {
        organisationId: auth.orgId,
        userId: auth.userId,
        action: 'MODULE_RECORD_UPDATED',
        entityType: 'ModuleWorkspaceRecord',
        entityId: updated.id,
        detailsJson: JSON.stringify({ moduleSlug: module.slug, status: updated.status }),
      },
    });

    return updated;
  });

  return NextResponse.json({ success: true, data: record });
}

/** Delete / Archive module record */
export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  const auth = await resolveOrganisationId(request.headers);
  const module = findNwuchasModule(params.slug);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Institutional administrator authorization required.' }, { status: 403 });
  }
  if (!module) {
    return NextResponse.json({ success: false, message: 'Unknown module.' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, message: 'Record ID is required for deletion.' }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.moduleWorkspaceRecord.findFirst({
      where: { id, organisationId: auth.orgId, moduleSlug: module.slug },
    });
    if (!existing) {
      throw new Error('Record not found.');
    }

    await tx.moduleWorkspaceRecord.delete({ where: { id: existing.id } });

    await tx.auditEvent.create({
      data: {
        organisationId: auth.orgId,
        userId: auth.userId,
        action: 'MODULE_RECORD_DELETED',
        entityType: 'ModuleWorkspaceRecord',
        entityId: id,
        detailsJson: JSON.stringify({ moduleSlug: module.slug, title: existing.title }),
      },
    });
  });

  return NextResponse.json({ success: true, message: 'Record removed successfully.' });
}
