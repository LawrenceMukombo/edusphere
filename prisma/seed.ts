// EduSphere SMIS — Seed Script
// Fictitious representative Zambian schools and role-based test fixtures
// Adheres strictly to UPSERT ONLY principles.

import { PrismaClient, OrgType, SubscriptionTier, SubscriptionStatus, SystemRole, Gender, LearnerStatus, GuardianRelationship, EducationStage, AssessmentType, ResultStatus, AttendanceStatus, FeeCategory, InvoiceStatus, PaymentMethod, LedgerEntryType, EmploymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/edusphere_db',
    },
  },
});

async function main() {
  console.log('--- Seeding EduSphere SMIS Development Fixtures ---');
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. PLATFORM SUPER ADMIN
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@edusphere.zm' },
    update: { passwordHash: defaultPasswordHash, role: SystemRole.PLATFORM_SUPER_ADMIN },
    create: {
      email: 'admin@edusphere.zm',
      passwordHash: defaultPasswordHash,
      firstName: 'Mutale',
      lastName: 'Chanda',
      phone: '+260977112233',
      role: SystemRole.PLATFORM_SUPER_ADMIN,
    },
  });
  console.log(`✓ Super Admin seeded: ${superAdmin.email}`);

  // 2. SCHOOL 1: KABULONGA COMBINED ACADEMY (Combined Primary & Secondary)
  const kabulongaOrg = await prisma.organisation.upsert({
    where: { code: 'EDS-ZM-001' },
    update: { name: 'Kabulonga Combined Academy' },
    create: {
      code: 'EDS-ZM-001',
      name: 'Kabulonga Combined Academy',
      officialName: 'Kabulonga Combined Academy Trust',
      type: OrgType.COMBINED_PRIMARY_SECONDARY,
      registrationNo: 'MOE/LUS/SEC/2026/089',
      taxNumber: '1004928192',
      email: 'info@kabulonga.edu.zm',
      phone: '+260211261000',
      address: 'Plot 4192, Bishops Road, Kabulonga',
      city: 'Lusaka',
      province: 'Lusaka',
      primaryColor: '#03589f',
    },
  });

  // Kabulonga Subscription
  await prisma.subscription.upsert({
    where: { id: 'sub-kabulonga-001' },
    update: { tier: SubscriptionTier.PROFESSIONAL },
    create: {
      id: 'sub-kabulonga-001',
      organisationId: kabulongaOrg.id,
      tier: SubscriptionTier.PROFESSIONAL,
      status: SubscriptionStatus.ACTIVE,
      activeLearnerCap: 600,
      currentActiveLearners: 420,
      billingCycle: 'TERMLY',
      priceZMW: 799.00,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
    },
  });

  // Kabulonga Campuses
  const mainCampus = await prisma.campus.upsert({
    where: { organisationId_code: { organisationId: kabulongaOrg.id, code: 'MC' } },
    update: { name: 'Senior Campus - Kabulonga' },
    create: {
      organisationId: kabulongaOrg.id,
      name: 'Senior Campus - Kabulonga',
      code: 'MC',
      address: 'Plot 4192, Bishops Road',
      city: 'Lusaka',
      isMainCampus: true,
    },
  });

  const juniorCampus = await prisma.campus.upsert({
    where: { organisationId_code: { organisationId: kabulongaOrg.id, code: 'JC' } },
    update: { name: 'Junior Campus - Woodlands' },
    create: {
      organisationId: kabulongaOrg.id,
      name: 'Junior Campus - Woodlands',
      code: 'JC',
      address: 'Plot 288, Lukasu Road, Woodlands',
      city: 'Lusaka',
      isMainCampus: false,
    },
  });

  // Staff & Users for Kabulonga
  const usersToSeed = [
    { email: 'proprietor@kabulonga.edu.zm', first: 'Dr. Joseph', last: 'Tembo', role: SystemRole.SCHOOL_PROPRIETOR, phone: '+260977445566' },
    { email: 'principal@kabulonga.edu.zm', first: 'Agnes', last: 'Mwanza', role: SystemRole.HEADTEACHER, phone: '+260966123456' },
    { email: 'deputy@kabulonga.edu.zm', first: 'Emmanuel', last: 'Banda', role: SystemRole.DEPUTY_HEADTEACHER, phone: '+260978987654' },
    { email: 'registrar@kabulonga.edu.zm', first: 'Mwaka', last: 'Phiri', role: SystemRole.REGISTRAR, phone: '+260955223344' },
    { email: 'bursar@kabulonga.edu.zm', first: 'Chanda', last: 'Mulenga', role: SystemRole.BURSAR, phone: '+260977665544' },
    { email: 'hr@kabulonga.edu.zm', first: 'Patricia', last: 'Lungu', role: SystemRole.HR_OFFICER, phone: '+260976112244' },
    { email: 'teacher@kabulonga.edu.zm', first: 'Davies', last: 'Mwape', role: SystemRole.TEACHER, phone: '+260979887766' },
  ];

  for (const u of usersToSeed) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash: defaultPasswordHash, role: u.role },
      create: {
        organisationId: kabulongaOrg.id,
        email: u.email,
        passwordHash: defaultPasswordHash,
        firstName: u.first,
        lastName: u.last,
        phone: u.phone,
        role: u.role,
      },
    });

    if (u.role === SystemRole.TEACHER || u.role === SystemRole.HEADTEACHER) {
      await prisma.staff.upsert({
        where: { organisationId_staffNumber: { organisationId: kabulongaOrg.id, staffNumber: `STF-${user.firstName.toUpperCase().slice(0, 3)}` } },
        update: { jobTitle: u.role === SystemRole.HEADTEACHER ? 'Headteacher & CEO' : 'Senior Mathematics Teacher' },
        create: {
          organisationId: kabulongaOrg.id,
          campusId: mainCampus.id,
          userId: user.id,
          staffNumber: `STF-${user.firstName.toUpperCase().slice(0, 3)}`,
          firstName: u.first,
          lastName: u.last,
          email: u.email,
          phone: u.phone,
          jobTitle: u.role === SystemRole.HEADTEACHER ? 'Headteacher & CEO' : 'Senior Mathematics Teacher',
          qualification: 'BSc Ed Mathematics & Science (UNZA)',
          tczNumber: 'TCZ/2021/LUS/09482',
          tczCertificateExpiry: new Date('2028-12-31'),
          employmentStatus: EmploymentStatus.FULL_TIME,
        },
      });
    }
  }

  // Academic Calendar for Kabulonga
  const year2026 = await prisma.academicYear.upsert({
    where: { organisationId_name: { organisationId: kabulongaOrg.id, name: '2026 Academic Year' } },
    update: { isCurrent: true },
    create: {
      organisationId: kabulongaOrg.id,
      name: '2026 Academic Year',
      startDate: new Date('2026-01-12'),
      endDate: new Date('2026-12-04'),
      isCurrent: true,
    },
  });

  const term1 = await prisma.term.upsert({
    where: { id: 'term-kabulonga-2026-t1' },
    update: { isCurrent: true },
    create: {
      id: 'term-kabulonga-2026-t1',
      academicYearId: year2026.id,
      name: 'Term 1',
      termNumber: 1,
      startDate: new Date('2026-01-12'),
      endDate: new Date('2026-04-10'),
      isCurrent: true,
    },
  });

  // Classes
  const grade1A = await prisma.class.upsert({
    where: { id: 'class-kabulonga-g1a' },
    update: { name: 'Grade 1A', stage: EducationStage.PRIMARY },
    create: {
      id: 'class-kabulonga-g1a',
      campusId: juniorCampus.id,
      academicYearId: year2026.id,
      name: 'Grade 1A',
      stage: EducationStage.PRIMARY,
      stream: 'A',
      capacity: 35,
    },
  });

  const form2Green = await prisma.class.upsert({
    where: { id: 'class-kabulonga-f2g' },
    update: { name: 'Form 2 Green', stage: EducationStage.JUNIOR_SECONDARY },
    create: {
      id: 'class-kabulonga-f2g',
      campusId: mainCampus.id,
      academicYearId: year2026.id,
      name: 'Form 2 Green',
      stage: EducationStage.JUNIOR_SECONDARY,
      stream: 'Green',
      capacity: 40,
    },
  });

  // Subjects
  const mathSubject = await prisma.subject.upsert({
    where: { organisationId_code: { organisationId: kabulongaOrg.id, code: 'MATH' } },
    update: { name: 'Mathematics' },
    create: {
      organisationId: kabulongaOrg.id,
      code: 'MATH',
      name: 'Mathematics',
      stage: EducationStage.JUNIOR_SECONDARY,
      isCore: true,
    },
  });

  const engSubject = await prisma.subject.upsert({
    where: { organisationId_code: { organisationId: kabulongaOrg.id, code: 'ENG' } },
    update: { name: 'English Language' },
    create: {
      organisationId: kabulongaOrg.id,
      code: 'ENG',
      name: 'English Language',
      stage: EducationStage.JUNIOR_SECONDARY,
      isCore: true,
    },
  });

  // Assign subjects to Form 2 Green
  await prisma.subjectAssignment.upsert({
    where: { classId_subjectId: { classId: form2Green.id, subjectId: mathSubject.id } },
    update: {},
    create: { classId: form2Green.id, subjectId: mathSubject.id },
  });

  // 3. GUARDIAN & LEARNERS (Family with multiple children across primary & secondary)
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@gmail.com' },
    update: { passwordHash: defaultPasswordHash, role: SystemRole.PARENT_GUARDIAN },
    create: {
      organisationId: kabulongaOrg.id,
      email: 'parent@gmail.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Kabaso',
      lastName: 'Mwewa',
      phone: '+260977889900',
      role: SystemRole.PARENT_GUARDIAN,
    },
  });

  const guardianRecord = await prisma.guardian.upsert({
    where: { userId: parentUser.id },
    update: { phone: '+260977889900', isVerified: true },
    create: {
      organisationId: kabulongaOrg.id,
      userId: parentUser.id,
      firstName: 'Kabaso',
      lastName: 'Mwewa',
      phone: '+260977889900',
      email: 'parent@gmail.com',
      nrcNumber: '298192/11/1',
      address: 'Plot 102, Ibex Hill, Lusaka',
      occupation: 'Civil Engineer',
      employer: 'Road Development Agency',
      isVerified: true,
    },
  });

  // Child 1: Bupe Mwewa (Secondary - Form 2)
  const pupil1 = await prisma.learner.upsert({
    where: { organisationId_studentNumber: { organisationId: kabulongaOrg.id, studentNumber: 'EDS-2026-0042' } },
    update: { currentClassId: form2Green.id, status: LearnerStatus.ENROLLED },
    create: {
      organisationId: kabulongaOrg.id,
      campusId: mainCampus.id,
      studentNumber: 'EDS-2026-0042',
      firstName: 'Bupe',
      lastName: 'Mwewa',
      gender: Gender.FEMALE,
      dateOfBirth: new Date('2012-05-18'),
      status: LearnerStatus.ENROLLED,
      currentClassId: form2Green.id,
      admissionDate: new Date('2024-01-15'),
      emergencyContact: '+260977889900',
    },
  });

  // Child 2: Kondwani Mwewa (Primary - Grade 1)
  const pupil2 = await prisma.learner.upsert({
    where: { organisationId_studentNumber: { organisationId: kabulongaOrg.id, studentNumber: 'EDS-2026-0098' } },
    update: { currentClassId: grade1A.id, status: LearnerStatus.ENROLLED },
    create: {
      organisationId: kabulongaOrg.id,
      campusId: juniorCampus.id,
      studentNumber: 'EDS-2026-0098',
      firstName: 'Kondwani',
      lastName: 'Mwewa',
      gender: Gender.MALE,
      dateOfBirth: new Date('2019-09-04'),
      status: LearnerStatus.ENROLLED,
      currentClassId: grade1A.id,
      admissionDate: new Date('2026-01-12'),
      emergencyContact: '+260977889900',
    },
  });

  // Link Guardian to both learners
  await prisma.learnerGuardianRelationship.upsert({
    where: { learnerId_guardianId: { learnerId: pupil1.id, guardianId: guardianRecord.id } },
    update: { isPrimary: true, hasFinancialAuthority: true },
    create: {
      learnerId: pupil1.id,
      guardianId: guardianRecord.id,
      relationship: GuardianRelationship.FATHER,
      isPrimary: true,
      hasFinancialAuthority: true,
      canPickUp: true,
    },
  });

  await prisma.learnerGuardianRelationship.upsert({
    where: { learnerId_guardianId: { learnerId: pupil2.id, guardianId: guardianRecord.id } },
    update: { isPrimary: true, hasFinancialAuthority: true },
    create: {
      learnerId: pupil2.id,
      guardianId: guardianRecord.id,
      relationship: GuardianRelationship.FATHER,
      isPrimary: true,
      hasFinancialAuthority: true,
      canPickUp: true,
    },
  });

  // 4. ACADEMICS & ASSESSMENTS
  const exam = await prisma.assessment.upsert({
    where: { id: 'exam-kabulonga-math-t1' },
    update: { status: ResultStatus.PUBLISHED },
    create: {
      id: 'exam-kabulonga-math-t1',
      termId: term1.id,
      subjectId: mathSubject.id,
      name: 'Mid-Term 1 Assessment',
      type: AssessmentType.MID_TERM_TEST,
      maxMarks: 100,
      weightPercentage: 40,
      status: ResultStatus.PUBLISHED,
    },
  });

  await prisma.score.upsert({
    where: { assessmentId_learnerId: { assessmentId: exam.id, learnerId: pupil1.id } },
    update: { marksObtained: 84.50, letterGrade: 'Distinction' },
    create: {
      assessmentId: exam.id,
      learnerId: pupil1.id,
      marksObtained: 84.50,
      letterGrade: 'Distinction',
      teacherComments: 'Excellent comprehension of algebraic factorization and geometric proofs.',
    },
  });

  // Published Report Card for Bupe Mwewa
  await prisma.reportCardVersion.upsert({
    where: { learnerId_termId_versionNumber: { learnerId: pupil1.id, termId: term1.id, versionNumber: 1 } },
    update: { status: ResultStatus.PUBLISHED },
    create: {
      learnerId: pupil1.id,
      classId: form2Green.id,
      termId: term1.id,
      versionNumber: 1,
      status: ResultStatus.PUBLISHED,
      summaryJson: JSON.stringify({
        learner: { name: 'Bupe Mwewa', id: 'EDS-2026-0042', class: 'Form 2 Green' },
        grades: [
          { subject: 'Mathematics', score: 84.5, grade: 'Distinction (1)', remarks: 'Very strong aptitude.' },
          { subject: 'English Language', score: 79.0, grade: 'Merit (2)', remarks: 'Commendable creative writing.' },
          { subject: 'Integrated Science', score: 88.0, grade: 'Distinction (1)', remarks: 'Outstanding laboratory work.' },
        ],
        aggregateScore: 83.8,
        positionInClass: '4 out of 38',
      }),
      teacherRemarks: 'Bupe is a focused, diligent learner with remarkable academic consistency.',
      principalRemarks: 'Approved for progression. An exemplary term result.',
      attendancePresent: 58,
      attendanceTotal: 60,
    },
  });

  // 5. ATTENDANCE REGISTERS
  const sessionToday = await prisma.attendanceSession.upsert({
    where: { classId_date: { classId: form2Green.id, date: new Date('2026-10-16') } },
    update: {},
    create: {
      classId: form2Green.id,
      termId: term1.id,
      date: new Date('2026-10-16'),
    },
  });

  await prisma.attendanceRecord.upsert({
    where: { sessionId_learnerId: { sessionId: sessionToday.id, learnerId: pupil1.id } },
    update: { status: AttendanceStatus.PRESENT },
    create: {
      sessionId: sessionToday.id,
      learnerId: pupil1.id,
      status: AttendanceStatus.PRESENT,
    },
  });

  // 6. FINANCIAL LEDGER, INVOICE & PAYMENTS
  const tuitionSchedule = await prisma.feeSchedule.upsert({
    where: { id: 'fee-kabulonga-sec-tuition' },
    update: { amount: 3500.00 },
    create: {
      id: 'fee-kabulonga-sec-tuition',
      organisationId: kabulongaOrg.id,
      academicYearId: year2026.id,
      category: FeeCategory.TUITION,
      name: 'Secondary Tuition Term 1',
      amount: 3500.00,
      applicableStage: EducationStage.JUNIOR_SECONDARY,
    },
  });

  const invoice1 = await prisma.invoice.upsert({
    where: { organisationId_invoiceNumber: { organisationId: kabulongaOrg.id, invoiceNumber: 'INV-2026-0042' } },
    update: { paidAmount: 2000.00, balance: 1500.00, status: InvoiceStatus.PARTIALLY_PAID },
    create: {
      organisationId: kabulongaOrg.id,
      learnerId: pupil1.id,
      termId: term1.id,
      invoiceNumber: 'INV-2026-0042',
      idempotencyKey: 'inv-key-2026-0042',
      totalAmount: 3500.00,
      paidAmount: 2000.00,
      balance: 1500.00,
      status: InvoiceStatus.PARTIALLY_PAID,
      dueDate: new Date('2026-02-15'),
      lines: {
        create: [
          { category: FeeCategory.TUITION, description: 'Tuition Term 1 2026', unitPrice: 3200.00, quantity: 1, lineTotal: 3200.00 },
          { category: FeeCategory.DEVELOPMENT_LEVY, description: 'ICT & Science Lab Levy', unitPrice: 300.00, quantity: 1, lineTotal: 300.00 },
        ],
      },
    },
  });

  const payment1 = await prisma.payment.upsert({
    where: { organisationId_paymentNumber: { organisationId: kabulongaOrg.id, paymentNumber: 'PAY-2026-0089' } },
    update: { amount: 2000.00 },
    create: {
      organisationId: kabulongaOrg.id,
      learnerId: pupil1.id,
      paymentNumber: 'PAY-2026-0089',
      amount: 2000.00,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      referenceNumber: 'FT2602819284ZANACO',
      receivedDate: new Date('2026-01-20'),
      notes: 'Initial Term 1 payment via Zanaco BillPay',
      allocations: {
        create: {
          invoiceId: invoice1.id,
          allocatedAmount: 2000.00,
        },
      },
      receipt: {
        create: {
          organisationId: kabulongaOrg.id,
          receiptNumber: 'REC-2026-00412',
          amount: 2000.00,
        },
      },
    },
  });

  // Immutable Ledger Entries
  await prisma.ledgerEntry.createMany({
    data: [
      {
        organisationId: kabulongaOrg.id,
        learnerId: pupil1.id,
        invoiceId: invoice1.id,
        entryType: LedgerEntryType.DEBIT_CHARGE,
        amount: 3500.00,
        balanceAfter: 3500.00,
        description: 'Billed: Term 1 2026 Tuition and Lab Levy',
        postedAt: new Date('2026-01-12'),
      },
      {
        organisationId: kabulongaOrg.id,
        learnerId: pupil1.id,
        paymentId: payment1.id,
        entryType: LedgerEntryType.CREDIT_PAYMENT,
        amount: 2000.00,
        balanceAfter: 1500.00,
        description: 'Payment Received: Ref FT2602819284ZANACO',
        postedAt: new Date('2026-01-20'),
      },
    ],
    skipDuplicates: true,
  });

  // 7. SCHOOL 2: SUNSHINE ECE & KINDERGARTEN CENTRE (ECE-First)
  const eceOrg = await prisma.organisation.upsert({
    where: { code: 'EDS-ZM-002' },
    update: { name: 'Sunshine Early Childhood Centre' },
    create: {
      code: 'EDS-ZM-002',
      name: 'Sunshine Early Childhood Centre',
      type: OrgType.ECE_CENTRE,
      email: 'hello@sunshine-ece.zm',
      phone: '+260977223344',
      city: 'Lusaka',
      primaryColor: '#eab308',
    },
  });

  await prisma.subscription.upsert({
    where: { id: 'sub-sunshine-001' },
    update: { tier: SubscriptionTier.COMMUNITY_STARTER },
    create: {
      id: 'sub-sunshine-001',
      organisationId: eceOrg.id,
      tier: SubscriptionTier.COMMUNITY_STARTER,
      status: SubscriptionStatus.ACTIVE,
      activeLearnerCap: 80,
      currentActiveLearners: 52,
      billingCycle: 'MONTHLY',
      priceZMW: 149.00,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
    },
  });

  const ecePractitionerUser = await prisma.user.upsert({
    where: { email: 'ece@sunshine.edu.zm' },
    update: { passwordHash: defaultPasswordHash, role: SystemRole.ECE_PRACTITIONER },
    create: {
      organisationId: eceOrg.id,
      email: 'ece@sunshine.edu.zm',
      passwordHash: defaultPasswordHash,
      firstName: 'Thandiwe',
      lastName: 'Zulu',
      role: SystemRole.ECE_PRACTITIONER,
    },
  });

  // Notice for Kabulonga Academy
  await prisma.notice.create({
    data: {
      organisationId: kabulongaOrg.id,
      title: 'Term 1 Mid-Term Break & Parent-Teacher Consultations',
      content: 'Please be advised that Mid-Term consultations will be conducted on Friday 20th February. All parents are invited to review student portfolios.',
      isPinned: true,
    },
  });

  console.log('✓ Successfully seeded Kabulonga Academy and Sunshine ECE Centre fixtures!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
