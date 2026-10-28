// src/server/email.service.ts
import nodemailer, { Transporter } from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: Transporter | null = null;

  private static getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = process.env.SMTP_USER || 'noreply@nwuc.edu.zm';
    const pass = process.env.SMTP_PASS;

    if (!pass) {
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587/other
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    return this.transporter;
  }

  static isConfigured(): boolean {
    return Boolean(process.env.SMTP_PASS);
  }

  static async sendMfaOtp(email: string, otpCode: string, targetModule: string): Promise<boolean> {
    const transporter = this.getTransporter();
    const fromAddress = process.env.SMTP_FROM || `"North Western University College" <${process.env.SMTP_USER || 'noreply@nwuc.edu.zm'}>`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #007B99; margin: 0; text-transform: uppercase;">North Western University College</h2>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">College Management Information System (NWU-CMIS)</p>
        </div>
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #475569; margin: 0 0 12px 0;">Your Two-Factor Authentication (2FA) verification code for <strong>${targetModule.toUpperCase()}</strong> is:</p>
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0f172a; font-family: monospace; background: #e2e8f0; padding: 8px 16px; border-radius: 6px; display: inline-block;">${otpCode}</span>
          <p style="font-size: 12px; color: #94a3b8; margin: 12px 0 0 0;">This code will expire in 5 minutes. Do not share this code with anyone.</p>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
          If you did not initiate this authentication request from an institutional terminal, please immediately inform the IT Directorate and change your portal password.
        </p>
        <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 12px; text-align: center; font-size: 11px; color: #94a3b8;">
          North Western University College of Health and Applied Sciences &bull; Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia
        </div>
      </div>
    `;

    if (!transporter) {
      console.warn(`[EmailService] SMTP credentials not configured (SMTP_PASS missing). OTP ${otpCode} was NOT sent via email.`);
      return false;
    }

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
}
