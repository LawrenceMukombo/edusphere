// src/app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { extractSessionToken, verifyToken } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const token = extractSessionToken(req.headers);
    let userId: string | null = null;
    let userRole: any = null;

    if (token) {
      const session = verifyToken(token);
      if (session) {
        userId = session.userId;
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { role: true, organisationId: true },
        });
        userRole = user?.role;
      }
    }

    // 1. Fetch recent institutional notices
    const notices = await prisma.notice.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 8,
    });

    // 2. Fetch recent critical audit events
    const auditEvents = await prisma.auditEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: {
        user: {
          select: { firstName: true, lastName: true, role: true, email: true },
        },
      },
    });

    // Format into unified notifications
    const notifications = [
      ...notices.map((n) => ({
        id: `notice-${n.id}`,
        title: n.title,
        message: n.content,
        category: 'INSTITUTIONAL_NOTICE',
        type: n.isPinned ? 'warning' : 'info',
        timestamp: n.publishedAt.toISOString(),
        read: false,
      })),
      ...auditEvents.map((a) => {
        let title = 'System Activity Recorded';
        let type: 'info' | 'success' | 'warning' | 'alert' = 'info';

        if (a.action.includes('ADMISSION') || a.action.includes('DOCUMENT')) {
          title = 'Admissions & Credential Processing';
          type = 'success';
        } else if (a.action.includes('PAYROLL') || a.action.includes('PAYMENT')) {
          title = 'Financial & Payroll Operation';
          type = 'info';
        } else if (a.action.includes('SECURITY') || a.action.includes('LOCK') || a.action.includes('PASSWORD')) {
          title = 'Security & Authentication Notice';
          type = 'warning';
        } else if (a.action.includes('HR') || a.action.includes('LEAVE') || a.action.includes('LICENSURE')) {
          title = 'Human Capital & Statutory Registry';
          type = 'info';
        }

        let desc = `${a.action} on ${a.entityType}`;
        if (a.detailsJson) {
          try {
            const parsed = JSON.parse(a.detailsJson);
            if (parsed.reason) desc = parsed.reason;
            else if (parsed.message) desc = parsed.message;
            else if (parsed.summary) desc = parsed.summary;
          } catch {}
        }

        const actor = a.user ? `${a.user.firstName} ${a.user.lastName} (${a.user.role})` : 'System Engine';

        return {
          id: `audit-${a.id}`,
          title,
          message: desc,
          actor,
          actionCode: a.action,
          category: 'ACTION_LOG',
          type,
          timestamp: a.createdAt.toISOString(),
          read: false,
        };
      }),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      unreadCount: notifications.length > 5 ? 5 : notifications.length,
      notifications: notifications.slice(0, 15),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, title, content, targetRole, isPinned } = body;

    if (action === 'create_notice') {
      const defaultOrg = await prisma.organisation.findFirst({ select: { id: true } });
      if (!defaultOrg) throw new Error('No organisation found.');

      const notice = await prisma.notice.create({
        data: {
          organisationId: defaultOrg.id,
          title: title || 'Institutional Advisory',
          content: content || 'Standard administrative announcement.',
          targetRole: targetRole || null,
          isPinned: Boolean(isPinned),
        },
      });

      return NextResponse.json({ success: true, notice });
    }

    return NextResponse.json({ success: true, message: 'Notifications synchronized.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
