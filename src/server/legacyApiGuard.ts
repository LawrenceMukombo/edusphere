import { NextResponse } from 'next/server';

/** NWUCHAS-CMIS does not serve inherited EduSphere demo fixtures through APIs. */
export function legacySchoolApiDisabled(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message:
        'Legacy EduSphere demo data is disabled in NWUCHAS-CMIS. Use authenticated module workspaces and database-backed records.',
      moduleBase: '/modules',
    },
    { status: 410 },
  );
}

export function requireNwuchasOrganisationCode(code: string | undefined | null): boolean {
  return code === 'NWUCHAS';
}
