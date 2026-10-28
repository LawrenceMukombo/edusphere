// src/app/api/admin/settings/smtp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth';
import { hasPermission } from '@/server/authorization';
import { EmailService } from '@/server/email.service';
import { MfaService } from '@/server/mfa.service';
import { prisma } from '@/server/db';
import { logAuditEvent } from '@/server/audit';
import { SystemRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/settings/smtp
 * Reads current SMTP configuration status (with password masked).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    // Only administrators can view SMTP configuration
    if (
      session.role !== SystemRole.PLATFORM_SUPER_ADMIN &&
      session.role !== SystemRole.INSTITUTION_ADMIN
    ) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Administrative role required.' },
        { status: 403 }
      );
    }

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;
    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation not identified' }, { status: 400 });
    }

    const activeConfig = await EmailService.getActiveConfig(orgId);
    const mfaEnforced = await MfaService.isMfaEnforced(orgId);

    // Check if configured in DB
    const dbRecord = await prisma.moduleWorkspaceRecord.findUnique({
      where: {
        organisationId_moduleSlug_title: {
          organisationId: orgId,
          moduleSlug: 'system_settings_smtp',
          title: 'INSTITUTIONAL_SMTP_GATEWAY',
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        isConfigured: Boolean(activeConfig && activeConfig.pass),
        source: dbRecord ? 'DATABASE' : process.env.SMTP_PASS ? 'ENV' : 'NONE',
        host: activeConfig?.host || 'smtp.hostinger.com',
        port: activeConfig?.port || 465,
        user: activeConfig?.user || 'noreply@nwuc.edu.zm',
        fromName: activeConfig?.fromName || 'North Western University College',
        hasPasswordSet: Boolean(activeConfig?.pass),
        mfaEnforced,
        lastUpdated: dbRecord?.updatedAt || null,
      },
    });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ success: false, message: err.message || 'Error fetching SMTP settings' }, { status });
  }
}

/**
 * POST /api/admin/settings/smtp
 * Saves or tests SMTP configuration.
 * Body actions:
 *  - "SAVE": Saves and verifies credentials, stores encrypted in database.
 *  - "TEST_CONNECTION": Tests handshake with mail server.
 *  - "SEND_TEST_EMAIL": Sends actual email to test recipient.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    if (
      session.role !== SystemRole.PLATFORM_SUPER_ADMIN &&
      session.role !== SystemRole.INSTITUTION_ADMIN
    ) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Administrative role required.' },
        { status: 403 }
      );
    }

    const orgId = session.organisationId || (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }))?.id;
    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation not identified' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'SAVE';

    // 1. ACTION: TEST_CONNECTION
    if (action === 'TEST_CONNECTION') {
      const { host, port, user, pass } = body;
      const testResult = await EmailService.testConnection(
        host && user && pass
          ? {
              host: host.trim(),
              port: parseInt(port || '465', 10),
              user: user.trim(),
              pass: pass.trim(),
            }
          : undefined
      );

      return NextResponse.json({
        success: testResult.success,
        message: testResult.message,
      });
    }

    // 2. ACTION: SEND_TEST_EMAIL
    if (action === 'SEND_TEST_EMAIL') {
      const { recipientEmail, host, port, user, pass, fromName } = body;
      if (!recipientEmail || typeof recipientEmail !== 'string') {
        return NextResponse.json({ success: false, message: 'Recipient email is required.' }, { status: 400 });
      }

      const customConfig =
        host && user && pass
          ? {
              host: host.trim(),
              port: parseInt(port || '465', 10),
              user: user.trim(),
              pass: pass.trim(),
              fromName: fromName || 'North Western University College',
            }
          : undefined;

      const sendResult = await EmailService.sendTestEmail(recipientEmail.trim(), customConfig);
      return NextResponse.json({
        success: sendResult.success,
        message: sendResult.message,
      });
    }

    // 3. ACTION: SAVE
    if (action === 'SAVE') {
      const { host, port, user, pass, fromName } = body;

      if (!host || !user) {
        return NextResponse.json(
          { success: false, message: 'SMTP host and mailbox username are required.' },
          { status: 400 }
        );
      }

      // Check existing config if pass is omitted (user did not change password)
      let finalPassword = pass;
      if (!finalPassword) {
        const existing = await EmailService.getActiveConfig(orgId);
        if (existing?.pass) {
          finalPassword = existing.pass;
        } else {
          return NextResponse.json(
            { success: false, message: 'Mailbox password is required to configure email.' },
            { status: 400 }
          );
        }
      }

      // Verify connection before saving to avoid bad configs locking out the system
      const verifyResult = await EmailService.testConnection({
        host: host.trim(),
        port: parseInt(port || '465', 10),
        user: user.trim(),
        pass: finalPassword.trim(),
      });

      if (!verifyResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: `SMTP Connection test failed: ${verifyResult.message}. Please verify the host, port and mailbox password.`,
          },
          { status: 400 }
        );
      }

      // Encrypt password with AES-256-GCM before saving
      const encryptedPass = EmailService.encryptPassword(finalPassword.trim());

      const payload = {
        host: host.trim(),
        port: parseInt(port || '465', 10),
        user: user.trim(),
        encryptedPass,
        fromName: (fromName || 'North Western University College').trim(),
        updatedAt: new Date().toISOString(),
        updatedBy: `${session.firstName} ${session.lastName} (${session.email})`,
      };

      await prisma.moduleWorkspaceRecord.upsert({
        where: {
          organisationId_moduleSlug_title: {
            organisationId: orgId,
            moduleSlug: 'system_settings_smtp',
            title: 'INSTITUTIONAL_SMTP_GATEWAY',
          },
        },
        create: {
          organisationId: orgId,
          moduleSlug: 'system_settings_smtp',
          title: 'INSTITUTIONAL_SMTP_GATEWAY',
          status: 'ACTIVE',
          summary: `Configured SMTP Gateway: ${user.trim()} via ${host.trim()}`,
          metadataJson: JSON.stringify(payload),
        },
        update: {
          status: 'ACTIVE',
          summary: `Updated SMTP Gateway: ${user.trim()} via ${host.trim()}`,
          metadataJson: JSON.stringify(payload),
          updatedAt: new Date(),
        },
      });

      // Invalidate service cache
      EmailService.invalidateCache();

      // Log compliance audit event
      await logAuditEvent({
        organisationId: orgId,
        userId: session.userId,
        action: 'SMTP_CONFIG_SAVED',
        entityType: 'SystemSettings',
        entityId: 'INSTITUTIONAL_SMTP_GATEWAY',
        details: {
          host: host.trim(),
          port: parseInt(port || '465', 10),
          user: user.trim(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `SMTP Gateway successfully authenticated and saved. Automated emails and 2FA OTP codes are now live from ${user.trim()}!`,
      });
    }

    // 4. ACTION: TOGGLE_MFA
    if (action === 'TOGGLE_MFA') {
      const enabled = Boolean(body.enabled);
      await MfaService.setMfaEnforced(
        orgId,
        enabled,
        `${session.firstName} ${session.lastName} (${session.email})`
      );

      await logAuditEvent({
        organisationId: orgId,
        userId: session.userId,
        action: enabled ? 'MFA_ENFORCEMENT_ENABLED' : 'MFA_ENFORCEMENT_DISABLED',
        entityType: 'SystemSettings',
        entityId: 'INSTITUTIONAL_MFA_POLICY',
        details: { mfaEnforced: enabled },
      });

      return NextResponse.json({
        success: true,
        message: enabled
          ? 'Two-Factor Authentication step-up security is now ENFORCED across all sensitive modules.'
          : 'Two-Factor Authentication step-up security is now OPTIONAL/PAUSED. Users can access modules directly.',
        data: { mfaEnforced: enabled },
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ success: false, message: err.message || 'Failed to update SMTP settings.' }, { status });
  }
}
