// src/app/api/content/cards/route.ts — Pure Database-Backed Institutional Cards & CMS REST API
import { NextRequest, NextResponse } from 'next/server';
import { extractSessionToken, verifyToken } from '@/server/auth';
import { hasPermission } from '@/server/authorization';
import { ContentCardService } from '@/server/services/content.service';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';

function getSessionFromRequest(req: NextRequest) {
  const token =
    extractSessionToken(req.headers) ||
    req.cookies.get('nwuchas_cmis_session')?.value ||
    req.cookies.get('edusphere_session')?.value ||
    req.cookies.get('token')?.value;

  if (!token) return null;
  return verifyToken(token);
}

function userHasEditPermission(session: any): boolean {
  if (!session) return false;
  if (session.isSuperAdmin) return true;
  if (
    session.role === 'PLATFORM_SUPER_ADMIN' ||
    session.role === 'SCHOOL_PROPRIETOR' ||
    session.role === 'INSTITUTION_ADMIN' ||
    session.role === 'IT_ADMIN' ||
    session.role === 'REGISTRAR' ||
    session.role === 'HEADTEACHER' ||
    session.role === 'DEPUTY_HEADTEACHER'
  ) {
    return true;
  }
  return hasPermission(session.role, 'content:manage');
}

/**
 * GET: Retrieve cards for a specific page with live edit permissions check
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || 'landing';

    const session = getSessionFromRequest(req);
    const canEdit = userHasEditPermission(session);

    let orgId: string | null = session?.organisationId || null;
    if (!orgId) {
      const defaultOrg = await prisma.organisation.findFirst({ select: { id: true } });
      orgId = defaultOrg ? defaultOrg.id : null;
    }

    const { cards, cardDict } = await ContentCardService.getCardsForPage(orgId || undefined, page);

    return NextResponse.json({
      success: true,
      page,
      userCanEdit: canEdit,
      user: session
        ? {
            email: session.email,
            name: `${session.firstName} ${session.lastName}`,
            role: session.role,
            isSuperAdmin: !!session.isSuperAdmin,
          }
        : null,
      cards,
      cardDict,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve institutional cards.', error: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Save or update an institutional content card (Authorized Staff Only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to edit cards.' },
        { status: 401 }
      );
    }

    if (!userHasEditPermission(session)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: content:manage permission required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.pageKey || !body.sectionKey || !body.cardKey || !body.title || !body.body) {
      return NextResponse.json(
        { success: false, message: 'Missing required card fields (pageKey, sectionKey, cardKey, title, body).' },
        { status: 400 }
      );
    }

    let orgId: string | null = session.organisationId || null;
    if (!orgId) {
      const defaultOrg = await prisma.organisation.findFirst({ select: { id: true } });
      orgId = defaultOrg ? defaultOrg.id : null;
    }

    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Institutional scope not found.' }, { status: 400 });
    }

    const updatedCard = await ContentCardService.upsertCard(
      orgId,
      {
        pageKey: body.pageKey,
        sectionKey: body.sectionKey,
        cardKey: body.cardKey,
        title: body.title,
        subtitle: body.subtitle || null,
        badge: body.badge || null,
        body: body.body,
        iconName: body.iconName || null,
        ctaLabel: body.ctaLabel || null,
        ctaUrl: body.ctaUrl || null,
        metadata: body.metadata,
        displayOrder: body.displayOrder,
        isPublished: body.isPublished,
      },
      session
    );

    return NextResponse.json({
      success: true,
      message: `Card "${updatedCard.title}" successfully updated and published.`,
      data: updatedCard,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to update content card.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Revert a card back to default statutory college content
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !userHasEditPermission(session)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: content:manage permission required.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);

    const pageKey = body.pageKey || searchParams.get('pageKey') || 'landing';
    const sectionKey = body.sectionKey || searchParams.get('sectionKey');
    const cardKey = body.cardKey || searchParams.get('cardKey');

    if (!sectionKey || !cardKey) {
      return NextResponse.json(
        { success: false, message: 'Missing sectionKey or cardKey to reset.' },
        { status: 400 }
      );
    }

    let orgId: string | null = session.organisationId || null;
    if (!orgId) {
      const defaultOrg = await prisma.organisation.findFirst({ select: { id: true } });
      orgId = defaultOrg ? defaultOrg.id : null;
    }

    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Institutional scope not found.' }, { status: 400 });
    }

    const reverted = await ContentCardService.resetCard(orgId, pageKey, sectionKey, cardKey, session);

    return NextResponse.json({
      success: true,
      message: `Card "${cardKey}" reverted to statutory default.`,
      data: reverted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to reset content card.' },
      { status: 500 }
    );
  }
}
