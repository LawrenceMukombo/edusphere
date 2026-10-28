import { NextRequest, NextResponse } from 'next/server';
import { extractSessionToken, verifyToken, hashPassword } from '@/server/auth';
import { PayrollService } from '@/server/payroll/payroll.service';
import { prisma } from '@/server/db';
import { SystemRole } from '@prisma/client';

function mapJobTitleToRole(jobTitle?: string | null): SystemRole {
  const t = (jobTitle || '').toLowerCase();
  if (t.includes('principal') || t.includes('chief executive')) return SystemRole.INSTITUTION_ADMIN;
  if (t.includes('owner') || t.includes('proprietor')) return SystemRole.PLATFORM_SUPER_ADMIN;
  if (t.includes('registrar')) return SystemRole.REGISTRAR;
  if (t.includes('bursar') || t.includes('finance manager')) return SystemRole.BURSAR;
  if (t.includes('cashier')) return SystemRole.CASHIER;
  if (t.includes('payroll') || t.includes('human resource') || t.includes('hr')) return SystemRole.PAYROLL_PREPARER;
  if (t.includes('exam') || t.includes('assessment')) return SystemRole.EXAMINATIONS_OFFICER;
  if (t.includes('clinical') || t.includes('preceptor') || t.includes('hospital')) return SystemRole.CLINICAL_SUPERVISOR;
  if (t.includes('coordinator')) return SystemRole.MODULE_COORDINATOR;
  if (t.includes('admission')) return SystemRole.ADMISSIONS_OFFICER;
  if (t.includes('lecturer') || t.includes('faculty') || t.includes('tutor') || t.includes('instructor') || t.includes('teacher')) return SystemRole.LECTURER;
  return SystemRole.LECTURER;
}

async function ensureStaffSystemUser(staffId: string, organisationId: string, preferredRole?: string | null) {
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: { user: true },
  });
  if (!staff) return null;

  const validRoles = Object.values(SystemRole);
  const roleToSet: SystemRole = (preferredRole && validRoles.includes(preferredRole as SystemRole))
    ? (preferredRole as SystemRole)
    : staff.user?.role || mapJobTitleToRole(staff.jobTitle);

  // 1. If staff already has linked user, sync details
  if (staff.userId && staff.user) {
    const updatedUser = await prisma.user.update({
      where: { id: staff.userId },
      data: {
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        phone: staff.phone,
        role: roleToSet,
        status: 'ACTIVE',
        isActive: true,
      },
    });
    return updatedUser;
  }

  // 2. Check if a User already exists with the staff email
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: staff.email },
  });

  if (existingUserByEmail) {
    const updatedUser = await prisma.user.update({
      where: { id: existingUserByEmail.id },
      data: {
        organisationId,
        firstName: staff.firstName,
        lastName: staff.lastName,
        phone: staff.phone,
        role: roleToSet,
        status: 'ACTIVE',
        isActive: true,
      },
    });

    await prisma.staff.update({
      where: { id: staff.id },
      data: { userId: updatedUser.id },
    });

    return updatedUser;
  }

  // 3. Provision new user account with default password & forced first-time change
  const defaultPassword = 'NWUCHAS-STAFF-2026!';
  const passwordHash = await hashPassword(defaultPassword);

  const newUser = await prisma.user.create({
    data: {
      organisationId,
      email: staff.email,
      passwordHash,
      firstName: staff.firstName,
      lastName: staff.lastName,
      phone: staff.phone,
      role: roleToSet,
      isActive: true,
      status: 'ACTIVE',
      mustChangePassword: true,
    },
  });

  await prisma.staff.update({
    where: { id: staff.id },
    data: { userId: newUser.id },
  });

  return newUser;
}

export async function GET(req: NextRequest) {
  const token = extractSessionToken(req.headers);
  const session = token ? verifyToken(token) : null;
  const fallbackOrg = await prisma.organisation.findFirst();
  const organisationId = session?.organisationId || fallbackOrg?.id;
  if (!organisationId) {
    return NextResponse.json({ success: false, message: 'No organisation found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const runId = searchParams.get('runId');
  const exportType = searchParams.get('export'); // 'zra', 'napsa', 'wcfcb'

  try {
    if (runId && exportType) {
      if (exportType === 'zra') {
        const csv = await PayrollService.exportZraTaxOnlineCsv(runId);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="zra_taxonline_${runId}.csv"`,
          },
        });
      }
      if (exportType === 'napsa') {
        const csv = await PayrollService.exportNapsaSchedule(runId);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="enapsa_schedule_${runId}.csv"`,
          },
        });
      }
      if (exportType === 'wcfcb') {
        const text = await PayrollService.exportWcfcbDeclaration(runId);
        return new NextResponse(text, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="wcfcb_declaration_${runId}.txt"`,
          },
        });
      }
    }

    if (runId) {
      const run = await PayrollService.getRun(runId);
      if (!run) return NextResponse.json({ success: false, message: 'Payroll run not found.' }, { status: 404 });
      return NextResponse.json({ success: true, data: run });
    }

    const runs = await PayrollService.listRuns(organisationId);
    return NextResponse.json({ success: true, data: runs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = extractSessionToken(req.headers);
  const session = token ? verifyToken(token) : null;
  const fallbackOrg = await prisma.organisation.findFirst();
  const organisationId = session?.organisationId || fallbackOrg?.id;
  const userId = session?.userId || 'nwuchas-hr-admin';
  if (!organisationId) {
    return NextResponse.json({ success: false, message: 'No organisation found' }, { status: 404 });
  }

  const body = await req.json();
  const action = body.action;

  try {
    if (action === 'create_run') {
      const run = await PayrollService.createRun({
        organisationId,
        periodMonth: Number(body.periodMonth),
        periodYear: Number(body.periodYear),
        preparedById: userId,
      });
      return NextResponse.json({ success: true, data: run });
    }

    if (action === 'calculate') {
      const run = await PayrollService.calculateRun(
        body.payrollRunId,
        body.calculationDate || new Date().toISOString().split('T')[0]
      );
      return NextResponse.json({ success: true, data: run });
    }

    if (action === 'update_line') {
      const { lineId, basicSalaryZMW, totalAllowancesZMW, grossPayZMW, payeDeductionZMW, napsaEmployeeZMW, otherDeductionsZMW, netPayZMW, napsaEmployerZMW, wcfcbEmployerZMW } = body;
      if (!lineId) {
        return NextResponse.json({ success: false, message: 'lineId is required' }, { status: 400 });
      }
      const result = await PayrollService.updateRunLine({
        lineId,
        basicSalaryZMW,
        totalAllowancesZMW,
        grossPayZMW,
        payeDeductionZMW,
        napsaEmployeeZMW,
        otherDeductionsZMW,
        netPayZMW,
        napsaEmployerZMW,
        wcfcbEmployerZMW,
      });
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'add_staff_line') {
      const { payrollRunId, staffId } = body;
      if (!payrollRunId || !staffId) {
        return NextResponse.json({ success: false, message: 'payrollRunId and staffId are required' }, { status: 400 });
      }
      const result = await PayrollService.addStaffToRun(payrollRunId, staffId);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'delete_staff_line') {
      const { payrollRunId, lineId } = body;
      if (!payrollRunId || !lineId) {
        return NextResponse.json({ success: false, message: 'payrollRunId and lineId are required' }, { status: 400 });
      }
      const updatedRun = await PayrollService.deleteRunLine(payrollRunId, lineId);
      return NextResponse.json({ success: true, data: updatedRun });
    }

    if (action === 'approve_and_lock') {
      const run = await PayrollService.approveAndLock(body.payrollRunId, userId);
      return NextResponse.json({ success: true, data: run });
    }

    if (action === 'generate_payslips') {
      const payslips = await PayrollService.generatePayslips(body.payrollRunId);
      return NextResponse.json({ success: true, data: payslips });
    }

    if (action === 'save_staff') {
      const { staff } = body;
      if (!staff) {
        return NextResponse.json({ success: false, message: 'Staff payload missing' }, { status: 400 });
      }

      let targetStaff = null;
      if (staff.id && !staff.id.startsWith('new-')) {
        targetStaff = await prisma.staff.findUnique({ where: { id: staff.id } });
      }

      if (targetStaff) {
        await prisma.staff.update({
          where: { id: targetStaff.id },
          data: {
            firstName: staff.firstName,
            lastName: staff.lastName,
            email: staff.email,
            phone: staff.phone,
            jobTitle: staff.jobTitle,
            qualification: staff.qualification,
            employmentStatus: staff.employmentStatus || 'FULL_TIME',
          },
        });

        if (staff.contract) {
          await prisma.staffContract.upsert({
            where: { staffId: targetStaff.id },
            create: {
              staffId: targetStaff.id,
              basicSalaryZMW: Number(staff.contract.basicSalaryZMW || 0),
              housingAllowance: Number(staff.contract.housingAllowance || 0),
              transportAllowance: Number(staff.contract.transportAllowance || 0),
              clinicalAllowance: Number(staff.contract.clinicalAllowance || 0),
              tpin: staff.contract.tpin,
              napsaNumber: staff.contract.napsaNumber,
              nhimaNumber: staff.contract.nhimaNumber,
              bankName: staff.contract.bankName,
              bankAccountMasked: staff.contract.bankAccountMasked,
            },
            update: {
              basicSalaryZMW: Number(staff.contract.basicSalaryZMW || 0),
              housingAllowance: Number(staff.contract.housingAllowance || 0),
              transportAllowance: Number(staff.contract.transportAllowance || 0),
              clinicalAllowance: Number(staff.contract.clinicalAllowance || 0),
              tpin: staff.contract.tpin,
              napsaNumber: staff.contract.napsaNumber,
              nhimaNumber: staff.contract.nhimaNumber,
              bankName: staff.contract.bankName,
              bankAccountMasked: staff.contract.bankAccountMasked,
            },
          });
        }

        // Ensure Every Staff Member is also a System User
        await ensureStaffSystemUser(targetStaff.id, organisationId, staff.systemRole || staff.role);

        const fullStaff = await prisma.staff.findUnique({
          where: { id: targetStaff.id },
          include: {
            contract: true,
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                status: true,
                isActive: true,
                lastLoginAt: true,
              },
            },
          },
        });

        return NextResponse.json({ success: true, data: fullStaff });
      } else {
        const campus = await prisma.campus.findFirst({ where: { organisationId } });
        if (!campus) throw new Error('No campus configured.');

        const newStaff = await prisma.staff.create({
          data: {
            organisationId,
            campusId: campus.id,
            staffNumber: staff.staffNumber || `NWU-STF-00${Math.floor(10 + Math.random() * 90)}`,
            firstName: staff.firstName,
            lastName: staff.lastName,
            email: staff.email,
            phone: staff.phone || '+260 977 000000',
            jobTitle: staff.jobTitle || 'Faculty Lecturer',
            qualification: staff.qualification || 'BSc, MSc',
            employmentStatus: staff.employmentStatus || 'FULL_TIME',
            contract: {
              create: {
                basicSalaryZMW: Number(staff.contract?.basicSalaryZMW || 15000),
                housingAllowance: Number(staff.contract?.housingAllowance || 2000),
                transportAllowance: Number(staff.contract?.transportAllowance || 1000),
                clinicalAllowance: Number(staff.contract?.clinicalAllowance || 0),
                tpin: staff.contract?.tpin || '1000000000',
                napsaNumber: staff.contract?.napsaNumber || 'NP-0000000-0',
                nhimaNumber: staff.contract?.nhimaNumber || 'NH-00000-00',
                bankName: staff.contract?.bankName || 'Absa Bank Zambia',
                bankAccountMasked: staff.contract?.bankAccountMasked || '•••• 0000',
              },
            },
          },
        });

        // Ensure newly enrolled staff member receives an active System User login
        await ensureStaffSystemUser(newStaff.id, organisationId, staff.systemRole || staff.role);

        const fullStaff = await prisma.staff.findUnique({
          where: { id: newStaff.id },
          include: {
            contract: true,
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                status: true,
                isActive: true,
                lastLoginAt: true,
              },
            },
          },
        });

        return NextResponse.json({ success: true, data: fullStaff });
      }
    }

    if (action === 'sync_all_staff_users') {
      const allStaff = await prisma.staff.findMany({
        where: { organisationId },
        include: { user: true },
      });

      let provisionedCount = 0;
      let syncedCount = 0;

      for (const stf of allStaff) {
        const wasUnlinked = !stf.userId || !stf.user;
        await ensureStaffSystemUser(stf.id, organisationId);
        if (wasUnlinked) provisionedCount++;
        else syncedCount++;
      }

      const refreshedStaff = await prisma.staff.findMany({
        where: { organisationId },
        include: {
          contract: true,
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
              isActive: true,
              lastLoginAt: true,
            },
          },
        },
        orderBy: { staffNumber: 'asc' },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully synchronized system users for all ${allStaff.length} staff members (${provisionedCount} provisioned, ${syncedCount} profile synced).`,
        data: refreshedStaff,
        summary: {
          totalStaff: allStaff.length,
          provisionedCount,
          syncedCount,
        },
      });
    }

    return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
