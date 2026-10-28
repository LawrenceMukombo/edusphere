// NWUCHAS CMIS — Institutional Two-Factor Authentication (2FA/MFA) Service
// Manages cryptographically random step-up verification for sensitive modules
// (Finance, Assets, Student Details & Admissions, Staff & HR / Payroll, Administration)

import crypto from 'crypto';
import { prisma } from './db';
import { signToken, AuthSession } from './auth';
import { isSensitiveModule, getSensitiveModulePolicy } from '../lib/sensitiveModules';

import { EmailService } from './email.service';

export const DEMO_MFA_CODE = '742051'; // Derived from NWUCHAS Lumwana hotline: 0974240051
const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL
const MAX_VERIFICATION_ATTEMPTS = 5;

export interface MfaChallenge {
  id: string;
  userId: string;
  code: string;
  targetModule: string;
  attempts: number;
  createdAt: number;
  expiresAt: number;
  destinationPhone?: string;
  destinationEmail: string;
  isUsed: boolean;
}

// In-memory active challenge store with TTL eviction
const activeChallenges = new Map<string, MfaChallenge>();

/** Clean up expired challenges */
function purgeExpiredChallenges(): void {
  const now = Date.now();
  for (const [id, challenge] of activeChallenges.entries()) {
    if (challenge.expiresAt < now || challenge.isUsed) {
      activeChallenges.delete(id);
    }
  }
}

/** Utility to mask a phone number for user privacy (e.g. +260 964 240051 -> +260 96***0051) */
export function maskPhone(phone?: string | null): string {
  if (!phone || phone.length < 6) return '+260 97***0051';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length <= 6) return clean;
  const start = clean.slice(0, 6);
  const end = clean.slice(-4);
  return `${start}***${end}`;
}

/** Utility to mask an email address (e.g. principal@nwuchas.edu.zm -> p****l@nwuchas.edu.zm) */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'u****r@nwuchas.edu.zm';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const start = local[0];
  const end = local[local.length - 1];
  return `${start}****${end}@${domain}`;
}

export interface CreateChallengeOptions {
  userId: string;
  email: string;
  phone?: string | null;
  targetModule?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ChallengeResult {
  challengeId: string;
  targetModule: string;
  moduleName: string;
  maskedPhone: string;
  maskedEmail: string;
  expiresInSeconds: number;
  expiresAt: number;
  demoCodeHint?: string;
}

export class MfaService {
  /**
   * Generates a new 6-digit OTP challenge for an authenticated user accessing a sensitive module.
   */
  static async createChallenge(options: CreateChallengeOptions): Promise<ChallengeResult> {
    purgeExpiredChallenges();

    const targetModule = options.targetModule || 'finance';
    const policy = getSensitiveModulePolicy(targetModule);
    const moduleName = policy ? policy.name : 'Sensitive Institutional Module';

    // Generate cryptographically secure 6-digit number
    const randomBuffer = crypto.randomBytes(4);
    const randomNumber = (randomBuffer.readUInt32BE(0) % 900000) + 100000;
    const code = randomNumber.toString();

    const challengeId = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + CHALLENGE_TTL_MS;

    const fallbackPhone = options.phone || '+260974240051';

    const challenge: MfaChallenge = {
      id: challengeId,
      userId: options.userId,
      code,
      targetModule,
      attempts: 0,
      createdAt: now,
      expiresAt,
      destinationPhone: fallbackPhone,
      destinationEmail: options.email,
      isUsed: false,
    };

    activeChallenges.set(challengeId, challenge);

    // 1. Dispatch OTP via SMTP email if email configured
    const isSmtpConfigured = EmailService.isConfigured();
    if (isSmtpConfigured && options.email) {
      // Dispatch email asynchronously so UI response is snappy
      EmailService.sendMfaOtp(options.email, code, targetModule).catch((err) => {
        console.error('[MfaService] Error dispatching 2FA email:', err);
      });
    }

    // 2. Audit/log for security and diagnostics
    if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_MFA_DISPATCH_LOG === 'true') {
      console.log(`[NWUCHAS 2FA] OTP for user ${options.email} (${targetModule}): ${code}${!isSmtpConfigured ? ` (Fallback bypass: ${DEMO_MFA_CODE})` : ''}`);
    }

    // 3. Demo code hint policy (Step 3):
    // In local development or when SMTP is not yet configured, provide demoCodeHint so staff are not locked out.
    // As soon as SMTP credentials are set on production, demoCodeHint is undefined (hidden).
    const showDemoHint = process.env.NODE_ENV !== 'production' || !isSmtpConfigured;

    return {
      challengeId,
      targetModule,
      moduleName,
      maskedPhone: maskPhone(fallbackPhone),
      maskedEmail: maskEmail(options.email),
      expiresInSeconds: Math.floor(CHALLENGE_TTL_MS / 1000),
      expiresAt,
      demoCodeHint: showDemoHint ? DEMO_MFA_CODE : undefined,
    };
  }

  /**
   * Verifies an OTP code against an active challenge.
   */
  static async verifyChallenge(params: {
    challengeId: string;
    code: string;
    session: AuthSession;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ verified: boolean; error?: string; sessionToken?: string }> {
    purgeExpiredChallenges();

    const { challengeId, code, session, ipAddress, userAgent } = params;

    const challenge = activeChallenges.get(challengeId);
    if (!challenge) {
      return {
        verified: false,
        error: 'Verification challenge has expired or does not exist. Please request a new code.',
      };
    }

    if (challenge.userId !== session.userId) {
      return {
        verified: false,
        error: 'Security mismatch: challenge was not issued to the currently signed-in user.',
      };
    }

    if (challenge.isUsed) {
      return {
        verified: false,
        error: 'This verification code has already been used.',
      };
    }

    if (challenge.expiresAt < Date.now()) {
      activeChallenges.delete(challengeId);
      return {
        verified: false,
        error: 'Verification code has expired. Codes are valid for 5 minutes.',
      };
    }

    challenge.attempts += 1;

    if (challenge.attempts > MAX_VERIFICATION_ATTEMPTS) {
      activeChallenges.delete(challengeId);
      return {
        verified: false,
        error: 'Too many incorrect attempts. For security, this challenge has been invalidated.',
      };
    }

    const cleanInputCode = code.trim();
    const isSmtpConfigured = EmailService.isConfigured();
    // Allow DEMO_MFA_CODE only if in development OR if SMTP is not configured yet (Step 3)
    const isBypassPermitted = process.env.NODE_ENV !== 'production' || !isSmtpConfigured;
    const isCodeValid = cleanInputCode === challenge.code || (isBypassPermitted && cleanInputCode === DEMO_MFA_CODE);

    if (!isCodeValid) {
      const remaining = MAX_VERIFICATION_ATTEMPTS - challenge.attempts;
      return {
        verified: false,
        error: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      };
    }

    // Mark challenge as used and evict
    challenge.isUsed = true;
    activeChallenges.delete(challengeId);

    // Record audit event for compliance
    if (session.organisationId) {
      try {
        await prisma.auditEvent.create({
          data: {
            organisationId: session.organisationId,
            userId: session.userId,
            action: 'SECURITY_2FA_VERIFIED',
            entityType: 'UserSession',
            entityId: session.userId,
            ipAddress,
            userAgent,
            detailsJson: JSON.stringify({
              targetModule: challenge.targetModule,
              verifiedAt: new Date().toISOString(),
              method: 'SMS_EMAIL_OTP',
            }),
          },
        });
      } catch (err) {
        console.warn('[MfaService] Audit log write warning:', err);
      }
    }

    // Upgrade session with 2FA verification flag
    const upgradedSession: AuthSession = {
      ...session,
      isMfaVerified: true,
      mfaVerifiedAt: Date.now(),
    };

    const updatedToken = signToken(upgradedSession);

    return {
      verified: true,
      sessionToken: updatedToken,
    };
  }

  /**
   * Resets or clears challenges for testing purposes
   */
  static clearAllChallenges(): void {
    activeChallenges.clear();
  }

  /**
   * Check if a module slug is considered high security
   */
  static isSensitive(slug: string): boolean {
    return isSensitiveModule(slug);
  }
}
