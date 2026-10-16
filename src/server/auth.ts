// EduSphere SMIS — Authentication & Security Utilities
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { SystemRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'edusphere-enterprise-secure-jwt-secret-key-2026';

export interface AuthSession {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: SystemRole;
  organisationId: string | null;
  organisationCode?: string;
  organisationName?: string;
}

export function signToken(session: AuthSession, expiresInSeconds = 28800): string {
  return jwt.sign(session, JWT_SECRET, { expiresIn: expiresInSeconds });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
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
