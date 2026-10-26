import { NextRequest, NextResponse } from 'next/server';
import { extractSessionToken, verifyToken } from '@/server/auth';
import { EntitlementService } from '@/server/services/entitlement.service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const verifyTokenParam = searchParams.get('verifyToken');

  // Barcode / QR-code verification can be checked at turnstiles or gates
  if (verifyTokenParam) {
    const verified = await EntitlementService.verifyBusPass(verifyTokenParam);
    if (!verified || !verified.isValid) {
      return NextResponse.json({ success: false, valid: false, message: verified?.message || 'Invalid or expired entitlement token.' }, { status: 400 });
    }
    return NextResponse.json({ success: true, valid: true, data: verified });
  }

  const token = extractSessionToken(req.headers);
  const session = token ? verifyToken(token) : null;
  if (!session?.organisationId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const learnerId = searchParams.get('learnerId');
  if (!learnerId) {
    return NextResponse.json({ success: false, message: 'learnerId query parameter required.' }, { status: 400 });
  }

  try {
    const entitlements = await EntitlementService.listLearnerEntitlements(learnerId);
    return NextResponse.json({ success: true, data: entitlements });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = extractSessionToken(req.headers);
  const session = token ? verifyToken(token) : null;
  if (!session?.organisationId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  try {
    if (body.action === 'reassess') {
      const results = await EntitlementService.reassessEntitlements(body.learnerId, session.userId);
      return NextResponse.json({ success: true, data: results });
    }

    if (body.action === 'validate_access') {
      const check = await EntitlementService.validateServiceAccess(body.learnerId, body.serviceType);
      return NextResponse.json({ success: true, data: check });
    }

    return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
