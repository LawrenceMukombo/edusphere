// src/app/api/attendance/boarding/route.ts — Database-Backed Hostel Roll Calls & Exeats API
import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';

    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId) {
      const nwuchasOrg = await prisma.organisation.findFirst({
        where: { code: 'NWUCHAS' },
      });
      orgId = nwuchasOrg?.id || null;
    }

    if (!orgId) {
      return NextResponse.json({
        success: true,
        data: {
          rollCalls: [],
          exeats: [],
          summary: {
            totalBoarders: 0,
            activeExeatsCount: 0,
            sickbayHeadcount: 0,
          },
        },
      });
    }

    const records = await prisma.moduleWorkspaceRecord.findMany({
      where: {
        organisationId: orgId,
        moduleSlug: { in: ['hostel_rollcall', 'hostel_exeat'] },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    const rollCalls = records
      .filter((r) => r.moduleSlug === 'hostel_rollcall')
      .map((r) => {
        try {
          return { id: r.id, status: r.status, title: r.title, summary: r.summary, ...JSON.parse(r.metadataJson || '{}') };
        } catch {
          return { id: r.id, status: r.status, title: r.title, summary: r.summary };
        }
      });

    const exeats = records
      .filter((r) => r.moduleSlug === 'hostel_exeat')
      .map((r) => {
        try {
          return { id: r.id, status: r.status, title: r.title, summary: r.summary, ...JSON.parse(r.metadataJson || '{}') };
        } catch {
          return { id: r.id, status: r.status, title: r.title, summary: r.summary };
        }
      });

    const occupiedBedsCount = await prisma.hostelAllocation.count({
      where: { isApproved: true },
    });

    const activeExeats = exeats.filter((e: any) => e.securityGateStatus === 'DEPARTED');

    return NextResponse.json({
      success: true,
      data: {
        rollCalls,
        exeats,
        summary: {
          totalBoarders: occupiedBedsCount,
          activeExeatsCount: activeExeats.length,
          sickbayHeadcount: 0,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId) {
      const nwuchasOrg = await prisma.organisation.findFirst({
        where: { code: 'NWUCHAS' },
      });
      orgId = nwuchasOrg?.id || null;
    }

    if (!orgId) {
      return NextResponse.json({ success: false, message: 'NWUCHAS Organisation not initialized.' }, { status: 400 });
    }

    if (body.action === 'CREATE_EXEAT') {
      const passNumber = `EXT-NWU-${Date.now().toString().slice(-6)}`;
      const exeatMetadata = {
        passNumber,
        studentNumber: body.studentNumber || 'NWU-STU-0000',
        studentName: body.studentName,
        hallName: body.hallName || 'Florence Nightingale Hall',
        programme: body.programme || body.grade || 'Diploma in Registered Nursing',
        reason: body.reason || 'Medical / Family visit',
        destination: body.destination || 'Solwezi / Manyama',
        guardianName: body.guardianName,
        guardianPhone: body.guardianPhone,
        departTime: body.departTime || new Date().toISOString().replace('T', ' ').slice(0, 16),
        returnDeadline: body.returnDeadline,
        securityGateStatus: 'DEPARTED',
        approvedBy: body.approvedBy || 'Dean of Students / Hostel Warden',
      };

      const record = await prisma.moduleWorkspaceRecord.create({
        data: {
          organisationId: orgId,
          moduleSlug: 'hostel_exeat',
          title: `Gate Pass: ${body.studentName} (${passNumber})`,
          status: 'DEPARTED',
          summary: `Hostel exeat pass for ${body.studentName}`,
          metadataJson: JSON.stringify(exeatMetadata),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Hostel security gate pass issued successfully.',
        data: { id: record.id, ...exeatMetadata },
      });
    }

    if (body.action === 'UPDATE_EXEAT_STATUS') {
      const { id, passNumber, status } = body;
      const record = id
        ? await prisma.moduleWorkspaceRecord.findUnique({ where: { id } })
        : await prisma.moduleWorkspaceRecord.findFirst({
            where: {
              organisationId: orgId,
              moduleSlug: 'hostel_exeat',
              title: { contains: passNumber },
            },
          });

      if (record) {
        let meta = {};
        try {
          meta = JSON.parse(record.metadataJson || '{}');
        } catch {}

        const updated = await prisma.moduleWorkspaceRecord.update({
          where: { id: record.id },
          data: {
            status: status || 'RETURNED_ON_TIME',
            metadataJson: JSON.stringify({ ...meta, securityGateStatus: status || 'RETURNED_ON_TIME' }),
          },
        });

        return NextResponse.json({
          success: true,
          message: `Gate status updated to ${status || 'RETURNED_ON_TIME'}.`,
          data: updated,
        });
      }
      return NextResponse.json({ success: false, message: 'Exeat record not found.' }, { status: 404 });
    }

    if (body.action === 'RECORD_ROLLCALL') {
      const rollCallMetadata = {
        hallName: body.hallName || 'Florence Nightingale Hall',
        callType: body.callType || 'EVENING_CHECK',
        callTypeLabel: body.callTypeLabel || 'Evening Hostel Roll-Call Check',
        scheduledTime: body.scheduledTime || '21:00',
        date: body.date || new Date().toISOString().split('T')[0],
        totalBoarders: Number(body.totalBoarders) || 0,
        present: Number(body.present) || 0,
        sickbay: Number(body.sickbay) || 0,
        authorizedExeat: Number(body.authorizedExeat) || 0,
        unaccounted: Number(body.unaccounted) || 0,
        wardenInCharge: body.wardenInCharge || 'Hostel Warden On-Duty',
      };

      const record = await prisma.moduleWorkspaceRecord.create({
        data: {
          organisationId: orgId,
          moduleSlug: 'hostel_rollcall',
          title: `Roll-Call: ${rollCallMetadata.hallName} (${rollCallMetadata.date}) [${Date.now()}]`,
          status: rollCallMetadata.unaccounted > 0 ? 'DISCREPANCY_FLAGGED' : 'ALL_ACCOUNTED',
          summary: `Hostel roll-call check for ${rollCallMetadata.hallName}`,
          metadataJson: JSON.stringify(rollCallMetadata),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Hostel roll-call check logged successfully.',
        data: { id: record.id, ...rollCallMetadata },
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action provided.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
