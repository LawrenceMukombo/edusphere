import { NextRequest, NextResponse } from 'next/server';
import { extractSessionToken, verifyToken } from '@/server/auth';
import { PayrollService } from '@/server/payroll/payroll.service';
import { prisma } from '@/server/db';

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

        const fullStaff = await prisma.staff.findUnique({
          where: { id: targetStaff.id },
          include: { contract: true },
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
          include: { contract: true },
        });

        return NextResponse.json({ success: true, data: newStaff });
      }
    }

    return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
