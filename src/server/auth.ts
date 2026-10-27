// NWUCHAS CMIS — Authentication & Security Utilities
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { SystemRole } from '@prisma/client';

const DEV_FALLBACK_JWT_SECRET = 'nwuchas-cmis-enterprise-secure-jwt-key-2026';

/** Name of the httpOnly session cookie set by /api/auth/login. */
export const SESSION_COOKIE_NAME = 'nwuchas_cmis_session';
export const LEGACY_SESSION_COOKIE_NAME = 'edusphere_session';

/** Active token revocation store for session invalidation / logout */
const revokedTokens = new Set<string>();

export function revokeToken(token: string): void {
  if (token) {
    revokedTokens.add(token.trim());
  }
}

export function isTokenRevoked(token: string): boolean {
  if (!token) return true;
  return revokedTokens.has(token.trim());
}

/** Clear all revoked tokens (useful for testing) */
export function clearRevocationStore(): void {
  revokedTokens.clear();
}

/**
 * Resolve the JWT signing secret.
 * In production a missing JWT_SECRET is a fatal misconfiguration: a publicly known
 * fallback secret would let anyone forge sessions for any tenant.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length > 0) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is not configured.');
  }
  return DEV_FALLBACK_JWT_SECRET;
}

export interface AuthSession {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: SystemRole;
  organisationId: string | null;
  organisationCode?: string;
  organisationName?: string;
  campusId?: string | null;
  departmentId?: string | null;
  programmeId?: string | null;
  learnerId?: string | null;
  guardianId?: string | null;
  isMfaVerified?: boolean;
  mfaVerifiedAt?: number;
  isSuperAdmin?: boolean;
  mustChangePassword?: boolean;
  passwordDaysRemaining?: number;
}

export function signToken(session: AuthSession, expiresInSeconds = 28800): string {
  return jwt.sign(session, getJwtSecret(), { expiresIn: expiresInSeconds });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    if (isTokenRevoked(token)) return null;
    return jwt.verify(token, getJwtSecret()) as AuthSession;
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function extractAuthHeader(headerValue: string | null): string | null {
  if (!headerValue || !headerValue.startsWith('Bearer ')) return null;
  return headerValue.substring(7).trim();
}

export function extractSessionToken(headers: Headers): string | null {
  const authHeader = headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const cookieHeader = headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('nwuchas_cmis_session=')) {
        return cookie.substring('nwuchas_cmis_session='.length);
      }
      if (cookie.startsWith('edusphere_session=')) {
        return cookie.substring('edusphere_session='.length);
      }
    }
  }
  return null;
}

/** Authenticate an incoming Next.js Request using either Bearer token or httpOnly cookie */
export async function authenticateRequest(req: Request): Promise<AuthSession | null> {
  const token = extractSessionToken(req.headers);
  if (!token) return null;
  return verifyToken(token);
}

/** Enforces authentication on an incoming Request; throws a typed 401 error if absent or invalid */
export async function requireAuth(req: Request): Promise<AuthSession> {
  const session = await authenticateRequest(req);
  if (!session) {
    const err = new Error('Authentication required.');
    (err as any).statusCode = 401;
    throw err;
  }
  return session;
}

/**
 * Enforces Two-Factor Authentication (2FA) verification on sensitive modules / operations.
 * Throws a typed 403 error (MFA_REQUIRED) if the session has not completed 2FA step-up verification.
 */
export async function requireMfa(req: Request): Promise<AuthSession> {
  const session = await requireAuth(req);
  if (!session.isMfaVerified) {
    const err = new Error('Two-factor authentication (2FA) verification required for this sensitive operation.');
    (err as any).statusCode = 403;
    (err as any).code = 'MFA_REQUIRED';
    throw err;
  }
  return session;
}

/** Check if session has verified 2FA */
export function isMfaVerified(session: AuthSession | null): boolean {
  return Boolean(session?.isMfaVerified);
}



