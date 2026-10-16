// GET & POST /api/tenants
import { NextResponse } from 'next/server';
import { TenantService } from '@/server/services/tenant.service';
import { extractAuthHeader, verifyToken } from '@/server/auth';
import { SystemRole } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    // Platform Super Admin or School Proprietor can list organizations
    const orgs = await TenantService.listOrganisations();
    return NextResponse.json({ success: true, data: orgs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    if (!session || session.role !== SystemRole.PLATFORM_SUPER_ADMIN) {
      return NextResponse.json({ success: false, message: 'Super Administrator privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const result = await TenantService.provisionSchool(body);

    return NextResponse.json({
      success: true,
      message: 'School tenant provisioned successfully.',
      data: result,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
