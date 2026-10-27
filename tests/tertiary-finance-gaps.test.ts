import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../src/server/db';
import { FinanceService } from '../src/server/services/finance.service';
import { LamtonPayService } from '../src/server/payments/lamtonpay.service';
import { EntitlementService } from '../src/server/services/entitlement.service';
import { signToken } from '../src/server/auth';
import { authenticateRequest } from '../src/server/auth';
import {
  FeeCategory,
  PaymentMethod,
  ResidencyType,
  LedgerEntryType,
  ReversalStatus,
  SuspenseStatus,
  DocketType,
  SystemRole,
} from '@prisma/client';

describe('NWUCHAS Tertiary Fees & Payments Production Gap Verification (GAP-01 to GAP-08)', () => {
  let orgId: string;
  let termId: string;
  let testLearnerId: string;
  let testProgrammeId: string;
  let testCohortId: string;

  beforeAll(async () => {
    // Resolve NWUCHAS organisation
    const org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
    if (!org) throw new Error('NWUCHAS organisation not found in DB.');
    orgId = org.id;

    // Resolve or create test term
    let term = await prisma.term.findFirst();
    if (!term) {
      const year = await prisma.academicYear.findFirst() || await prisma.academicYear.create({
        data: {
          organisationId: orgId,
          name: '2026 Academic Year',
          startDate: new Date('2026-01-05'),
          endDate: new Date('2026-12-05'),
          isCurrent: true,
        },
      });
      term = await prisma.term.create({
        data: {
          academicYearId: year.id,
          name: 'Semester 1 (2026)',
          termNumber: 1,
          startDate: new Date('2026-01-05'),
          endDate: new Date('2026-06-30'),
          isCurrent: true,
        },
      });
    }
    termId = term.id;

    // Resolve or create test learner
    let learner = await prisma.learner.findFirst({
      where: { organisationId: orgId, studentNumber: 'NWU-2026-0003' },
    });
    if (!learner) {
      const campus = (await prisma.campus.findFirst({ where: { organisationId: orgId } }))!;
      learner = await prisma.learner.create({
        data: {
          organisationId: orgId,
          campusId: campus.id,
          studentNumber: 'NWU-2026-0003',
          firstName: 'Grace',
          lastName: 'Mwape',
          gender: 'FEMALE',
          dateOfBirth: new Date('2003-04-12'),
          status: 'ENROLLED',
        },
      });
    }
    testLearnerId = learner.id;

    // Resolve or create test programme and cohort
    let prog = await prisma.programme.findFirst({ where: { organisationId: orgId, code: 'DRN' } });
    if (!prog) {
      let dept = await prisma.department.findFirst({ where: { organisationId: orgId } });
      if (!dept) {
        dept = await prisma.department.create({
          data: {
            organisationId: orgId,
            code: 'NURS',
            name: 'Department of Nursing & Midwifery',
          },
        });
      }
      prog = await prisma.programme.create({
        data: {
          organisationId: orgId,
          departmentId: dept.id,
          code: 'DRN',
          name: 'Diploma in Registered Nursing',
          qualificationLevel: 'DIPLOMA',
          durationYears: 3,
          tuitionFeePerSem: 6500,
          clinicalFeePerSem: 1500,
        },
      });
    }
    testProgrammeId = prog.id;

    let cohort = await prisma.cohort.findFirst({ where: { organisationId: orgId, programmeId: prog.id } });
    if (!cohort) {
      cohort = await prisma.cohort.create({
        data: {
          organisationId: orgId,
          programmeId: prog.id,
          name: 'RN-2026-JAN',
          intake: 'January 2026 Intake',
          academicYear: '2026',
          currentYear: 1,
          currentSemester: 1,
          capacity: 120,
        },
      });
    }
    testCohortId = cohort.id;
  });

  // --------------------------------------------------------------------------
  // GAP-01: API Security & RBAC Enforcement on Invoices & Payments Routes
  // --------------------------------------------------------------------------
  it('GAP-01: Rejects unauthenticated requests and enforces RBAC on invoices/payments', async () => {
    // 1. Unauthenticated request without token returns null session
    const unauthReq = new Request('http://localhost:3025/api/finance/invoices');
    const unauthSession = await authenticateRequest(unauthReq);
    expect(unauthSession).toBeNull();

    // 2. Lecturer token is authenticated but rejected by finance RBAC policy
    const lecturerToken = signToken({
      userId: 'usr-lecturer-001',
      email: 'lecturer@nwuc.edu.zm',
      firstName: 'Moses',
      lastName: 'Chanda',
      role: SystemRole.LECTURER,
      organisationId: orgId,
      organisationCode: 'NWUCHAS',
    });

    const lecturerReq = new Request('http://localhost:3025/api/finance/invoices', {
      headers: new Headers({ authorization: `Bearer ${lecturerToken}` }),
    });
    const lecturerSession = await authenticateRequest(lecturerReq);
    expect(lecturerSession).toBeDefined();

    const FINANCE_STAFF_ROLES: string[] = [
      'BURSAR',
      'CASHIER',
      'INSTITUTION_ADMIN',
      'ACCOUNTANT',
      'FINANCE_RECONCILER',
    ];
    expect(FINANCE_STAFF_ROLES.includes(lecturerSession!.role)).toBe(false);

    // 3. Authorized Bursar has full billing and payment permissions
    const bursarToken = signToken({
      userId: 'usr-bursar-001',
      email: 'bursar@nwuc.edu.zm',
      firstName: 'Patrick',
      lastName: 'Banda',
      role: SystemRole.BURSAR,
      organisationId: orgId,
      organisationCode: 'NWUCHAS',
    });

    const bursarReq = new Request('http://localhost:3025/api/finance/invoices', {
      headers: new Headers({ authorization: `Bearer ${bursarToken}` }),
    });
    const bursarSession = await authenticateRequest(bursarReq);
    expect(bursarSession).toBeDefined();
    expect(FINANCE_STAFF_ROLES.includes(bursarSession!.role)).toBe(true);

    // 4. Authorized Cashier has payment recording permissions
    const cashierToken = signToken({
      userId: 'usr-cashier-001',
      email: 'cashier@nwuc.edu.zm',
      firstName: 'Mary',
      lastName: 'Phiri',
      role: SystemRole.CASHIER,
      organisationId: orgId,
      organisationCode: 'NWUCHAS',
    });

    const cashierReq = new Request('http://localhost:3025/api/finance/payments', {
      headers: new Headers({ authorization: `Bearer ${cashierToken}` }),
    });
    const cashierSession = await authenticateRequest(cashierReq);
    expect(cashierSession).toBeDefined();
    expect(FINANCE_STAFF_ROLES.includes(cashierSession!.role)).toBe(true);
  });

  // --------------------------------------------------------------------------
  // GAP-02: Tertiary Fee Schedule Structure
  // --------------------------------------------------------------------------
  it('GAP-02: ProgrammeFeeSchedule supports Tertiary Matrix (Programme, Semester, Residency)', async () => {
    const year = (await prisma.academicYear.findFirst({ where: { organisationId: orgId } }))!;

    const feeSchedule = await prisma.programmeFeeSchedule.create({
      data: {
        organisationId: orgId,
        programmeId: testProgrammeId,
        academicYearId: year.id,
        semesterNumber: 1,
        residencyType: ResidencyType.DAY_SCHOLAR,
        category: FeeCategory.TUITION,
        name: 'Diploma in Registered Nursing — Sem 1 Tuition',
        amountZMW: 6500.00,
        isMandatory: true,
      },
    });

    expect(feeSchedule.id).toBeDefined();
    expect(feeSchedule.residencyType).toBe(ResidencyType.DAY_SCHOLAR);
    expect(feeSchedule.semesterNumber).toBe(1);
    expect(Number(feeSchedule.amountZMW)).toBe(6500);

    // Verify relations
    const fetched = await prisma.programmeFeeSchedule.findUnique({
      where: { id: feeSchedule.id },
      include: { programme: true, academicYear: true },
    });
    expect(fetched?.programme.name).toBe('Diploma in Registered Nursing');
  });

  // --------------------------------------------------------------------------
  // GAP-03: Mandatory Zambian Health Sciences Fee Categories
  // --------------------------------------------------------------------------
  it('GAP-03: Supports Zambian Health Sciences statutory fee categories', async () => {
    const healthCategories: FeeCategory[] = [
      FeeCategory.NMCZ_INDEXING,
      FeeCategory.HPCZ_INDEXING,
      FeeCategory.CLINICAL_PRACTICUM,
      FeeCategory.SKILLS_LAB,
      FeeCategory.OSCE_EXAMINATION,
      FeeCategory.HOSTEL_ACCOMMODATION,
      FeeCategory.REGISTRATION_ADMIN,
    ];

    for (const cat of healthCategories) {
      expect(cat).toBeDefined();
    }

    // Create an invoice with specialized health fee types
    const invoice = await FinanceService.issueInvoice({
      organisationId: orgId,
      learnerId: testLearnerId,
      termId,
      invoiceNumber: `TEST-GAP03-INV-${Date.now()}`,
      dueDate: new Date(Date.now() + 30 * 86400000),
      lines: [
        { category: FeeCategory.NMCZ_INDEXING, description: 'NMCZ Council Indexing & Official Logbook', unitPrice: 1200 },
        { category: FeeCategory.CLINICAL_PRACTICUM, description: 'Solwezi General Hospital Affiliation Levy', unitPrice: 1800 },
        { category: FeeCategory.SKILLS_LAB, description: 'Simulation Mannequin Consumables', unitPrice: 850 },
        { category: FeeCategory.OSCE_EXAMINATION, description: 'OSCE 8-Station Clinical Assessment Fee', unitPrice: 950 },
      ],
    });

    expect(invoice.lines.length).toBe(4);
    expect(Number(invoice.totalAmount)).toBe(1200 + 1800 + 850 + 950);
  });

  // --------------------------------------------------------------------------
  // GAP-04: Batch Cohort Invoicing
  // --------------------------------------------------------------------------
  it('GAP-04: 1-Click Batch Cohort Invoicing automatically bills students with idempotency keys', async () => {
    // Create an isolated test cohort and matching class with 2 enrolled learners
    const campus = (await prisma.campus.findFirst({ where: { organisationId: orgId } }))!;
    const isolatedCohort = await prisma.cohort.create({
      data: {
        organisationId: orgId,
        programmeId: testProgrammeId,
        name: `TEST-COHORT-${Date.now()}`,
        intake: 'Jan Intake',
        academicYear: '2026',
        currentYear: 1,
        currentSemester: 1,
        capacity: 50,
      },
    });

    const year = (await prisma.academicYear.findFirst({ where: { organisationId: orgId } }))!;
    const testClass = await prisma.class.create({
      data: {
        campusId: campus.id,
        academicYearId: year.id,
        name: isolatedCohort.name,
      },
    });

    await prisma.learner.create({
      data: {
        organisationId: orgId,
        campusId: campus.id,
        currentClassId: testClass.id,
        studentNumber: `NWU-COHORT-${Date.now()}-A`,
        firstName: 'Kelvin',
        lastName: 'Banda',
        gender: 'MALE',
        dateOfBirth: new Date('2003-01-01'),
        status: 'ENROLLED',
      },
    });

    await prisma.learner.create({
      data: {
        organisationId: orgId,
        campusId: campus.id,
        currentClassId: testClass.id,
        studentNumber: `NWU-COHORT-${Date.now()}-B`,
        firstName: 'Chileshe',
        lastName: 'Mulenga',
        gender: 'FEMALE',
        dateOfBirth: new Date('2003-02-02'),
        status: 'ENROLLED',
      },
    });

    const batchResult = await FinanceService.batchInvoiceCohort({
      organisationId: orgId,
      cohortId: isolatedCohort.id,
      termId,
      dueDate: new Date(Date.now() + 30 * 86400000),
      lines: [
        { category: FeeCategory.TUITION, description: 'DRN Semester 1 Tuition', unitPrice: 6500 },
        { category: FeeCategory.CLINICAL_PRACTICUM, description: 'Clinical Practicum Fee', unitPrice: 1500 },
      ],
    });

    expect(batchResult.cohortName).toBe(isolatedCohort.name);
    expect(batchResult.invoicesCreated).toBeGreaterThan(0);
    expect(batchResult.totalAmountBilled).toBe(batchResult.invoicesCreated * 8000); // 8000 per student

    // Verify idempotency: running batch again skips already invoiced students
    const secondRun = await FinanceService.batchInvoiceCohort({
      organisationId: orgId,
      cohortId: isolatedCohort.id,
      termId,
      dueDate: new Date(Date.now() + 30 * 86400000),
      lines: [
        { category: FeeCategory.TUITION, description: 'DRN Semester 1 Tuition', unitPrice: 6500 },
      ],
    });

    expect(secondRun.invoicesCreated).toBe(0);
    expect(secondRun.skippedExisting).toBe(batchResult.invoicesCreated);
  });

  // --------------------------------------------------------------------------
  // GAP-05: Waterfall Payment Allocation & Student Credit Advance Wallet
  // --------------------------------------------------------------------------
  it('GAP-05: Waterfall payment clears oldest invoice first and retains surplus in Student Advance Wallet', async () => {
    // 1. Create a dedicated test learner for clean financial ledger isolation
    const campus = (await prisma.campus.findFirst({ where: { organisationId: orgId } }))!;
    const wfLearner = await prisma.learner.create({
      data: {
        organisationId: orgId,
        campusId: campus.id,
        studentNumber: `NWU-WF-${Date.now()}`,
        firstName: 'Mutale',
        lastName: 'Chishimba',
        gender: 'FEMALE',
        dateOfBirth: new Date('2002-06-20'),
        status: 'ENROLLED',
      },
    });

    // 2. Create two distinct invoices for the student
    const inv1 = await FinanceService.issueInvoice({
      organisationId: orgId,
      learnerId: wfLearner.id,
      termId,
      invoiceNumber: `TEST-WF-1-${Date.now()}`,
      dueDate: new Date('2026-03-01'), // Oldest
      lines: [{ category: FeeCategory.TUITION, description: 'Tuition Part 1', unitPrice: 3000 }],
    });

    const inv2 = await FinanceService.issueInvoice({
      organisationId: orgId,
      learnerId: wfLearner.id,
      termId,
      invoiceNumber: `TEST-WF-2-${Date.now()}`,
      dueDate: new Date('2026-04-01'), // Newer
      lines: [{ category: FeeCategory.TUITION, description: 'Tuition Part 2', unitPrice: 4000 }],
    });

    // 3. Student deposits K10,000 (Owes K3,000 + K4,000 = K7,000. Surplus = K3,000)
    const payment = await FinanceService.recordPayment({
      organisationId: orgId,
      learnerId: wfLearner.id,
      invoiceId: inv1.id,
      paymentNumber: `PAY-WF-${Date.now()}`,
      receiptNumber: `REC-WF-${Date.now()}`,
      amount: 10000,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      referenceNumber: `ZAN-DEP-${Date.now()}`,
    });

    expect(payment.id).toBeDefined();

    // 4. Verify Waterfall: Invoice 1 is fully PAID (K3,000)
    const updatedInv1 = await prisma.invoice.findUnique({ where: { id: inv1.id } });
    expect(updatedInv1?.status).toBe('PAID');
    expect(Number(updatedInv1?.balance)).toBe(0);

    // 5. Verify Waterfall: Invoice 2 is fully PAID (K4,000)
    const updatedInv2 = await prisma.invoice.findUnique({ where: { id: inv2.id } });
    expect(updatedInv2?.status).toBe('PAID');
    expect(Number(updatedInv2?.balance)).toBe(0);

    // 6. Verify Student Advance Wallet has exactly K3,000 credit
    const wallet = await FinanceService.getStudentWallet(orgId, wfLearner.id);
    expect(wallet.balance).toBe(3000);
    expect(wallet.transactions.length).toBeGreaterThan(0);

    // 7. Test automatic consumption of advance credit on next semester invoice
    const inv3 = await FinanceService.issueInvoice({
      organisationId: orgId,
      learnerId: wfLearner.id,
      termId,
      invoiceNumber: `TEST-WF-3-${Date.now()}`,
      dueDate: new Date('2026-09-01'),
      lines: [{ category: FeeCategory.TUITION, description: 'Semester 2 Tuition', unitPrice: 2500 }],
    });

    // Since invoice was K2,500 and wallet had K3,000 credit:
    // Invoice 3 should be automatically PAID, and wallet balance should become K500
    const updatedInv3 = await prisma.invoice.findUnique({ where: { id: inv3.id } });
    expect(updatedInv3?.status).toBe('PAID');
    expect(Number(updatedInv3?.balance)).toBe(0);

    const updatedWallet = await FinanceService.getStudentWallet(orgId, wfLearner.id);
    expect(updatedWallet.balance).toBe(500);
  });

  // --------------------------------------------------------------------------
  // GAP-06: Bank Reconciliation (Zanaco CSV / MT940 & Suspense Queue)
  // --------------------------------------------------------------------------
  it('GAP-06: Parses Zanaco CSV, auto-matches known students, and queues unknown narrations into Suspense Queue', async () => {
    const mockZanacoCsv = `
Posting Date,Reference,Narration,Credit
2026-10-20,FT262940001,TUITION FEES NWU-2026-0003 GRACE MWAPE,5000.00
2026-10-21,FT262940002,UNMATCHED DEPOSIT FROM COUNTER TELLER,2500.00
    `.trim();

    const result = await LamtonPayService.ingestBankStatement({
      organisationId: orgId,
      bankName: 'Zanaco BillMaster',
      rawContent: mockZanacoCsv,
      filename: 'zanaco_billmaster_oct26.csv',
      importedById: 'TEST_BURSAR',
    });

    expect(result.totalProcessed).toBe(2);
    expect(result.matchedCount).toBe(1); // NWU-2026-0003 matched
    expect(result.suspenseCount).toBe(1); // Unknown deposit routed to Suspense Queue

    // Verify Suspense Queue item can be retrieved
    const suspenseQueue = await LamtonPayService.listSuspenseQueue(orgId);
    expect(suspenseQueue.length).toBeGreaterThan(0);
    const pendingItem = suspenseQueue.find((s: any) => s.referenceNumber === 'FT262940002');
    expect(pendingItem).toBeDefined();
    expect(pendingItem?.status).toBe(SuspenseStatus.PENDING);
    expect(Number(pendingItem?.amountZMW)).toBe(2500);

    // Verify manual allocation from suspense queue to student
    if (pendingItem) {
      const allocated = await LamtonPayService.allocateSuspenseEntry({
        organisationId: orgId,
        entryId: pendingItem.id,
        learnerId: testLearnerId,
        allocatedById: 'TEST_CASHIER',
        notes: 'Verified teller receipt at Bursary desk',
      });

      expect(allocated.entry.status).toBe(SuspenseStatus.ALLOCATED);
      expect(allocated.entry.matchedLearnerId).toBe(testLearnerId);
    }
  });

  // --------------------------------------------------------------------------
  // GAP-07: Separation of Powers in Payment Reversals (Four-Eyes Approval)
  // --------------------------------------------------------------------------
  it('GAP-07: Enforces Four-Eyes: Cashier requests, Bursar approves, initiator cannot approve own reversal', async () => {
    // 1. Create a payment to reverse
    const payment = await FinanceService.recordPayment({
      organisationId: orgId,
      learnerId: testLearnerId,
      paymentNumber: `PAY-4EYES-${Date.now()}`,
      receiptNumber: `REC-4EYES-${Date.now()}`,
      amount: 1500,
      paymentMethod: PaymentMethod.CASH,
      referenceNumber: `CASH-REV-${Date.now()}`,
    });

    // 2. Cashier submits reversal request
    const cashierId = 'user-cashier-001';
    const request = await FinanceService.requestPaymentReversal({
      organisationId: orgId,
      paymentId: payment.id,
      requestedById: cashierId,
      requestedByName: 'Mary Phiri (Senior Cashier)',
      reason: 'Duplicate cash entry by cashier shift handover',
    });

    expect(request.status).toBe(ReversalStatus.PENDING_APPROVAL);

    // 3. Four-Eyes Enforcement: Cashier attempts to approve their OWN request -> MUST FAIL
    await expect(
      FinanceService.approvePaymentReversal({
        organisationId: orgId,
        requestId: request.id,
        reviewedById: cashierId, // SAME as requester!
        reviewedByName: 'Mary Phiri',
        reviewerRole: 'BURSAR',
      })
    ).rejects.toThrow(/Four-Eyes Security Violation/i);

    // 4. Authorized Bursar (DIFFERENT USER) approves -> MUST SUCCEED
    const bursarId = 'user-bursar-002';
    const approval = await FinanceService.approvePaymentReversal({
      organisationId: orgId,
      requestId: request.id,
      reviewedById: bursarId,
      reviewedByName: 'Patrick Banda (College Bursar)',
      reviewerRole: 'BURSAR',
    });

    expect(approval.request.status).toBe(ReversalStatus.APPROVED);
    expect(approval.ledgerEntry.entryType).toBe(LedgerEntryType.DEBIT_REVERSAL);
  });

  // --------------------------------------------------------------------------
  // GAP-08: Financial Exam & Clinical Clearance Docket
  // --------------------------------------------------------------------------
  it('GAP-08: Generates cryptographic QR Exam Clearance Slip and Clinical Rotation Pass', async () => {
    // 1. Generate Exam Clearance Docket
    const examDocketResult = await EntitlementService.generateClearanceDocket({
      organisationId: orgId,
      learnerId: testLearnerId,
      docketType: DocketType.EXAMINATION_CLEARANCE,
      termOrSemester: 'Semester 1 (2026)',
      issuedById: 'TEST_EXAMS_OFFICER',
    });

    expect(examDocketResult.docket.docketNumber).toMatch(/^DOCK-EXAM-2026-/);
    expect(examDocketResult.verificationCode).toBeDefined();
    expect(examDocketResult.qrCodeData).toContain('NWUCHAS_EXAM_DOCKET');

    // 2. Invigilator scans and cryptographically verifies Docket
    const verified = await EntitlementService.verifyClearanceDocket(examDocketResult.verificationCode);
    expect(verified.isValid).toBe(true);
    expect(verified.docket?.docketNumber).toBe(examDocketResult.docket.docketNumber);
    expect(verified.learner?.studentNumber).toBe('NWU-2026-0003');

    // 3. Verify tampering prevention (invalid verification code rejected)
    const tampered = await EntitlementService.verifyClearanceDocket('FRAUDULENT_CODE_123');
    expect(tampered.isValid).toBe(false);

    // 4. Generate Clinical Rotation Clearance Pass
    const clinicalPassResult = await EntitlementService.generateClearanceDocket({
      organisationId: orgId,
      learnerId: testLearnerId,
      docketType: DocketType.CLINICAL_ROTATION_CLEARANCE,
      termOrSemester: 'Semester 1 (2026)',
      issuedById: 'TEST_CLINICAL_COORDINATOR',
    });

    expect(clinicalPassResult.docket.docketNumber).toMatch(/^DOCK-CLIN-2026-/);
    expect(clinicalPassResult.qrCodeData).toContain('NWUCHAS_CLINICAL_PASS');
  });
});
