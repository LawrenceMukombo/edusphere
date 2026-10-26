import { NextResponse } from 'next/server';
import { SystemRole } from '@prisma/client';
import { extractAuthHeader, verifyToken } from '@/server/auth';
import { prisma } from '@/server/db';
import {
  canAdministerInstitution,
  institutionProfileSchema,
  isDedicatedInstitutionCode,
} from '@/server/institution';

function sessionFromRequest(request: Request) {
  const token = extractAuthHeader(request.headers.get('authorization'));
  return token ? verifyToken(token) : null;
}

function forbidden(message: string) {
  return NextResponse.json({ success: false, message }, { status: 403 });
}

/** Read the caller's sole NWUCHAS institution; no caller may choose an organisation ID. */
export async function GET(request: Request) {
  const session = sessionFromRequest(request);
  if (!session?.organisationId) return forbidden('An authenticated NWUCHAS session is required.');

  const institution = await prisma.organisation.findFirst({
    where: { id: session.organisationId, code: 'NWUCHAS', isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      officialName: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      province: true,
      country: true,
      timezone: true,
      currency: true,
      logoUrl: true,
      primaryColor: true,
      campuses: { select: { id: true, code: true, name: true, isMainCampus: true, isActive: true } },
    },
  });

  if (!institution) return forbidden('This session is not attached to the dedicated NWUCHAS institution.');
  return NextResponse.json({ success: true, data: institution });
}

/** Update the one institution profile with a server-side audit event. */
export async function PATCH(request: Request) {
  const session = sessionFromRequest(request);
  if (!session?.organisationId || !canAdministerInstitution(session.role as SystemRole)) {
    return forbidden('Only authorised NWUCHAS institution administrators may update this profile.');
  }

  const parsed = institutionProfileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid institution profile.', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.organisation.findFirst({
    where: { id: session.organisationId, code: 'NWUCHAS', isActive: true },
    select: { id: true, code: true },
  });
  if (!existing || !isDedicatedInstitutionCode(existing.code)) {
    return forbidden('This session is not attached to the dedicated NWUCHAS institution.');
  }

  const institution = await prisma.$transaction(async (tx) => {
    const updated = await tx.organisation.update({ where: { id: existing.id }, data: parsed.data });
    await tx.auditEvent.create({
      data: {
        organisationId: existing.id,
        userId: session.userId,
        action: 'INSTITUTION_PROFILE_UPDATED',
        entityType: 'Organisation',
        entityId: existing.id,
        detailsJson: JSON.stringify({ changedFields: Object.keys(parsed.data), source: 'NWUCHAS_M1' }),
      },
    });
    return updated;
  });

  return NextResponse.json({ success: true, data: institution });
}
