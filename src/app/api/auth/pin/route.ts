// src/app/api/auth/pin/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/server/db';
import { extractSessionToken, verifyToken, verifyPassword, signToken, SESSION_COOKIE_NAME, LEGACY_SESSION_COOKIE_NAME } from '@/server/auth';
import { getPersonaForRole, PERSONA_DEFINITIONS } from '@/server/authorization';
import { logAuditEvent } from '@/server/audit';

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin + '_NWU_INSTITUTIONAL_PIN_SALT_2026').digest('hex');
}

export async function GET(req: Request) {
  try {
    const token = extractSessionToken(req.headers);
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
    }

    const user = await (prisma.user as any).findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const u = user as any;
    const hasPin = Boolean(u.pinHash || (u.statusReason && u.statusReason.includes('PIN_HASH:')));

    return NextResponse.json({
      success: true,
      hasPin,
      timeoutSec: u.inactivityTimeoutSec || 900,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = 'verify', email, pin, currentPassword, timeoutSec } = body;

    // 1. SETUP ACTION: Set up or change quick PIN for current user
    if (action === 'setup') {
      const token = extractSessionToken(req.headers);
      if (!token) {
        return NextResponse.json({ success: false, message: 'Authentication required to configure quick PIN.' }, { status: 401 });
      }

      const session = verifyToken(token);
      if (!session) {
        return NextResponse.json({ success: false, message: 'Session expired. Please log in again.' }, { status: 401 });
      }

      if (!pin || !/^\d{4,6}$/.test(pin)) {
        return NextResponse.json(
          { success: false, message: 'PIN must consist of 4 to 6 numeric digits (0-9).' },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: session.userId },
      });

      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
      }

      // If current password provided, verify it
      if (currentPassword) {
        const isPwdValid = await verifyPassword(currentPassword, user.passwordHash);
        if (!isPwdValid) {
          return NextResponse.json({ success: false, message: 'Current password verification failed.' }, { status: 403 });
        }
      }

      const pinDigest = hashPin(pin);
      const updateData: any = {};

      // If user model supports pinHash column
      try {
        updateData.pinHash = pinDigest;
        if (timeoutSec && Number(timeoutSec) > 0) {
          updateData.inactivityTimeoutSec = Number(timeoutSec);
        }
        await (prisma.user as any).update({
          where: { id: user.id },
          data: updateData,
        });
      } catch {
        const currentReason = (user as any).statusReason || '';
        const cleanReason = currentReason.replace(/PIN_HASH:[a-f0-9]+;?/g, '').trim();
        await (prisma.user as any).update({
          where: { id: user.id },
          data: {
            statusReason: `${cleanReason} PIN_HASH:${pinDigest};`.trim(),
          },
        });
      }

      await logAuditEvent({
        organisationId: user.organisationId || undefined,
        userId: user.id,
        action: 'SECURITY_PIN_SETUP',
        entityType: 'UserSecurity',
        entityId: user.id,
        details: { email: user.email, timeoutSec: timeoutSec || 900 },
        req,
      });

      return NextResponse.json({
        success: true,
        message: 'Quick PIN configured successfully. You may now sign in or unlock using this PIN.',
      });
    }

    // 2. VERIFY ACTION: Fast login or session unlock via Email + PIN
    if (action === 'verify') {
      if (!email || !pin) {
        return NextResponse.json({ success: false, message: 'Email address and PIN are required.' }, { status: 400 });
      }

      if (!/^\d{4,6}$/.test(pin)) {
        return NextResponse.json({ success: false, message: 'PIN must be 4 to 6 numeric digits.' }, { status: 400 });
      }

      const cleanEmail = email.toLowerCase().trim();
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: { organisation: true, staff: true, guardian: true },
      });

      if (!user) {
        return NextResponse.json({ success: false, message: 'Account not found or inactive.' }, { status: 401 });
      }

      const u = user as any;
      if (u.isDeleted || u.status === 'DELETED') {
        return NextResponse.json({ success: false, message: 'Account has been archived.' }, { status: 403 });
      }

      if (u.status === 'LOCKED') {
        return NextResponse.json({ success: false, message: 'Account locked due to security policy.' }, { status: 403 });
      }

      // Extract stored hash
      let storedHash = u.pinHash;
      if (!storedHash && u.statusReason && u.statusReason.includes('PIN_HASH:')) {
        const match = u.statusReason.match(/PIN_HASH:([a-f0-9]+)/);
        if (match) storedHash = match[1];
      }

      if (!storedHash) {
        return NextResponse.json(
          {
            success: false,
            message: 'No Quick PIN configured for this account. Please sign in with your password first to set up a PIN.',
          },
          { status: 400 }
        );
      }

      const enteredHash = hashPin(pin);
      if (enteredHash !== storedHash) {
        const newFailed = (u.failedLoginAttempts || 0) + 1;
        try {
          await (prisma.user as any).update({
            where: { id: user.id },
            data: { failedLoginAttempts: newFailed },
          });
        } catch {}

        await logAuditEvent({
          organisationId: user.organisationId || undefined,
          userId: user.id,
          action: 'SECURITY_PIN_FAILED',
          entityType: 'UserSecurity',
          entityId: user.id,
          details: { email: user.email, failedAttempts: newFailed },
          req,
        });

        return NextResponse.json(
          { success: false, message: 'Incorrect Quick PIN. Please check your digits or use your standard password.' },
          { status: 401 }
        );
      }

      // Success: Sign token
      const token = signToken({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organisationId: user.organisationId,
      });

      try {
        await (prisma.user as any).update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lastLoginAt: new Date(),
          },
        });
      } catch {}

      await logAuditEvent({
        organisationId: user.organisationId || undefined,
        userId: user.id,
        action: 'SECURITY_PIN_LOGIN',
        entityType: 'UserSession',
        entityId: user.id,
        details: { email: user.email, method: 'QUICK_PIN' },
        req,
      });

      const personaType = getPersonaForRole(user.role);
      const personaMeta = PERSONA_DEFINITIONS[personaType];

      const res = NextResponse.json({
        success: true,
        message: 'Authenticated via Quick PIN.',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          persona: personaMeta,
          campusId: user.staff?.campusId,
          timeoutSec: u.inactivityTimeoutSec || 900,
        },
      });

      // Set cookies
      const isHttps = process.env.NODE_ENV === 'production';
      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      res.cookies.set(LEGACY_SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
