// src/server/email.service.ts
import nodemailer, { Transporter } from 'nodemailer';
import crypto from 'crypto';
import { prisma } from './db';

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName?: string;
  secure?: boolean;
}

export class EmailService {
  private static transporter: Transporter | null = null;
  private static cachedConfig: SmtpConfig | null = null;
  private static lastCacheTime: number = 0;
  private static readonly CACHE_TTL_MS = 60 * 1000; // 1 minute cache

  /**
   * Simple AES-256-GCM encryption for storing mailbox password in DB.
   * Derives a stable key from JWT_SECRET or default fallback.
   */
  private static getEncryptionKey(): Buffer {
    const rawSecret = process.env.JWT_SECRET || 'nwuchas-cmis-enterprise-secure-jwt-key-2026';
    return crypto.createHash('sha256').update(rawSecret).digest();
  }

  static encryptPassword(password: string): string {
    const iv = crypto.randomBytes(12);
    const key = this.getEncryptionKey();
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  }

  static decryptPassword(cipherPayload: string): string | null {
    try {
      const parts = cipherPayload.split(':');
      if (parts.length !== 3) return null;
      const [ivHex, tagHex, encryptedHex] = parts;
      const key = this.getEncryptionKey();
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
      decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves active SMTP configuration:
   * 1. Check database ModuleWorkspaceRecord (configured via Admin UI)
   * 2. Fallback to process.env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
   */
  static async getActiveConfig(organisationId?: string): Promise<SmtpConfig | null> {
    const now = Date.now();
    if (this.cachedConfig && now - this.lastCacheTime < this.CACHE_TTL_MS) {
      return this.cachedConfig;
    }

    try {
      const targetOrg = organisationId
        ? organisationId
        : ((await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } })) || (await prisma.organisation.findFirst()))?.id;

      if (targetOrg) {
        const record = await prisma.moduleWorkspaceRecord.findUnique({
          where: {
            organisationId_moduleSlug_title: {
              organisationId: targetOrg,
              moduleSlug: 'system_settings_smtp',
              title: 'INSTITUTIONAL_SMTP_GATEWAY',
            },
          },
        });

        if (record?.metadataJson) {
          const parsed = JSON.parse(record.metadataJson);
          if (parsed.host && parsed.user && parsed.encryptedPass) {
            const decrypted = this.decryptPassword(parsed.encryptedPass);
            if (decrypted) {
              this.cachedConfig = {
                host: parsed.host,
                port: parsed.port || 465,
                user: parsed.user,
                pass: decrypted,
                fromName: parsed.fromName || 'North Western University College',
                secure: parsed.port ? parsed.port === 465 : true,
              };
              this.lastCacheTime = now;
              return this.cachedConfig;
            }
          }
        }
      }
    } catch (e) {
      console.warn('[EmailService] Could not read SMTP config from database:', e);
    }

    // Fallback to process.env
    const pass = process.env.SMTP_PASS;
    if (pass) {
      const port = parseInt(process.env.SMTP_PORT || '465', 10);
      this.cachedConfig = {
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port,
        user: process.env.SMTP_USER || 'noreply@nwuc.edu.zm',
        pass,
        fromName: process.env.SMTP_FROM_NAME || 'North Western University College',
        secure: port === 465,
      };
      this.lastCacheTime = now;
      return this.cachedConfig;
    }

    return null;
  }

  static invalidateCache(): void {
    this.cachedConfig = null;
    this.transporter = null;
    this.lastCacheTime = 0;
  }

  private static async getTransporter(): Promise<Transporter | null> {
    const config = await this.getActiveConfig();
    if (!config) return null;

    if (this.transporter) return this.transporter;

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    return this.transporter;
  }

  static async isConfigured(): Promise<boolean> {
    const config = await this.getActiveConfig();
    return Boolean(config && config.pass);
  }

  /**
   * Tests SMTP connection by verifying credentials against the server
   */
  static async testConnection(customConfig?: SmtpConfig): Promise<{ success: boolean; message: string }> {
    try {
      const config = customConfig || (await this.getActiveConfig());
      if (!config || !config.pass) {
        return { success: false, message: 'No SMTP credentials provided or configured.' };
      }

      const tempTransporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: {
          user: config.user,
          pass: config.pass,
        },
        tls: {
          rejectUnauthorized: true,
        },
      });

      await tempTransporter.verify();
      return { success: true, message: `Successfully authenticated with ${config.host} as ${config.user}.` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'SMTP authentication failed.' };
    }
  }

  /**
   * Dispatches institutional Two-Factor Authentication OTP code to user's registered email
   */
  static async sendMfaOtp(email: string, otpCode: string, targetModule: string): Promise<boolean> {
    const transporter = await this.getTransporter();
    const config = await this.getActiveConfig();

    if (!transporter || !config) {
      console.warn(`[EmailService] SMTP not configured. OTP ${otpCode} was NOT sent via email.`);
      return false;
    }

    const fromAddress = `"${config.fromName || 'North Western University College'}" <${config.user}>`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #007B99; margin: 0; text-transform: uppercase; font-size: 20px; font-weight: 900;">North Western University College</h2>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">College Management Information System (NWU-CMIS)</p>
        </div>
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #475569; margin: 0 0 14px 0;">Your Two-Factor Authentication (2FA) verification code for <strong>${targetModule.toUpperCase()}</strong> is:</p>
          <span style="font-size: 34px; font-weight: 900; letter-spacing: 6px; color: #007B99; font-family: monospace; background: #e0f2fe; padding: 10px 22px; border-radius: 8px; display: inline-block; border: 1px solid #bae6fd;">${otpCode}</span>
          <p style="font-size: 12px; color: #94a3b8; margin: 14px 0 0 0;">This code will expire in 5 minutes. Do not share this code with anyone.</p>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin: 0;">
          If you did not initiate this authentication request from an institutional terminal, please immediately inform the IT Directorate at NWUCHAS and change your portal password.
        </p>
        <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 14px; text-align: center; font-size: 11px; color: #94a3b8;">
          North Western University College of Health and Applied Sciences &bull; Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: `[NWUCHAS] 2FA Verification Code: ${otpCode}`,
        html: htmlContent,
        text: `Your NWUCHAS 2FA verification code for ${targetModule} is: ${otpCode}. It expires in 5 minutes.`,
      });
      return true;
    } catch (error) {
      console.error('[EmailService] Failed to send MFA OTP email:', error);
      return false;
    }
  }

  /**
   * Sends a test verification email to any specified recipient
   */
  static async sendTestEmail(recipientEmail: string, customConfig?: SmtpConfig): Promise<{ success: boolean; message: string }> {
    try {
      const config = customConfig || (await this.getActiveConfig());
      if (!config || !config.pass) {
        return { success: false, message: 'SMTP is not configured yet.' };
      }

      const tempTransporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: {
          user: config.user,
          pass: config.pass,
        },
        tls: {
          rejectUnauthorized: true,
        },
      });

      const fromAddress = `"${config.fromName || 'North Western University College'}" <${config.user}>`;

      await tempTransporter.sendMail({
        from: fromAddress,
        to: recipientEmail,
        subject: `[NWUCHAS] SMTP Gateway Test Verification`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #007B99; margin: 0;">NWUCHAS Email Gateway Test</h2>
            <p style="color: #334155; font-size: 14px; margin-top: 10px;">
              Congratulations! Your SMTP communication gateway has been successfully verified on North Western University College (NWU-CMIS).
            </p>
            <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 12px; color: #475569; font-family: monospace;">
              Host: ${config.host}<br/>
              Port: ${config.port}<br/>
              Sender: ${config.user}<br/>
              Timestamp: ${new Date().toISOString()}
            </div>
            <p style="font-size: 11px; color: #94a3b8; margin-top: 16px;">
              This test confirms automated 2FA verification codes, admission letters, and financial receipts will be dispatched cleanly to staff and students.
            </p>
          </div>
        `,
        text: `NWUCHAS Email Gateway Test: your SMTP communication gateway is successfully active! Host: ${config.host}, Port: ${config.port}, Sender: ${config.user}`,
      });

      return { success: true, message: `Test email successfully delivered to ${recipientEmail}!` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to dispatch test email.' };
    }
  }
}
