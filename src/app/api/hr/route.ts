// GET & POST /api/hr
import { NextResponse } from 'next/server';
import { HRService } from '@/server/services/hr.service';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgCode = searchParams.get('orgCode');
    const search = searchParams.get('search') || undefined;

    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId && orgCode) {
      const org = await prisma.organisation.findUnique({ where: { code: orgCode } });
      orgId = org?.id || null;
    }
    if (!orgId) {
      const defaultOrg = await prisma.organisation.findFirst({ orderBy: { createdAt: 'asc' } });
      orgId = defaultOrg?.id || null;
    }

    if (!orgId) {
      return NextResponse.json({ success: false, message: 'Organisation context required.' }, { status: 400 });
    }

    const staff = await HRService.listStaff(orgId, { search });
    const tczAlerts = await HRService.getTCZComplianceAlerts(orgId);

    return NextResponse.json({
      success: true,
      data: {
        staff,
        tczAlerts,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
