// src/server/audit.ts
import { prisma } from './db';

export interface AuditLogParams {
  organisationId?: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  req?: Request;
}

export async function logAuditEvent(params: AuditLogParams) {
  try {
    let orgId = params.organisationId;
    if (!orgId) {
      // Find fallback default organisation if not provided
      const defaultOrg = await prisma.organisation.findFirst({ select: { id: true } });
      orgId = defaultOrg?.id;
    }

    if (!orgId) return null;

    let ip = params.ipAddress;
    let ua = params.userAgent;

    if (params.req) {
      const headers = params.req.headers;
      ip =
        ip ||
        headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        headers.get('x-real-ip') ||
        '127.0.0.1';
      ua = ua || headers.get('user-agent') || 'NWUCHAS-Internal-Client';
    }

    let validUserId: string | null = null;
    if (params.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: params.userId },
        select: { id: true },
      });
      if (userExists) validUserId = userExists.id;
    }

    const event = await prisma.auditEvent.create({
      data: {
        organisationId: orgId,
        userId: validUserId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        detailsJson: params.details ? JSON.stringify(params.details) : null,
        ipAddress: ip || '127.0.0.1',
        userAgent: ua || 'Internal-Browser',
      },
    });

    return event;
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR] Failed to record audit event:', error);
    return null;
  }
}
