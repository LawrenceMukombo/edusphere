// EduSphere SMIS — Seed Script
// Fictitious representative Zambian schools and role-based test fixtures
// Adheres strictly to UPSERT ONLY principles.

import { PrismaClient, OrgType, SubscriptionTier, SubscriptionStatus, SystemRole, Gender, LearnerStatus, GuardianRelationship, EducationStage, AssessmentType, ResultStatus, AttendanceStatus, FeeCategory, InvoiceStatus, PaymentMethod, LedgerEntryType, EmploymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { LEGACY_STAFF_MEMBERS, generateLegacyLearners } from '../src/server/services/legacySchoolData';

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

  // 8. SCHOOL 3: LEGACY SCHOOL SOLWEZI (Multi-Campus with Dedicated Boarding Wing)
  const legacyOrg = await prisma.organisation.upsert({
    where: { code: 'EDS-ZM-SOL-001' },
    update: {
      name: 'Legacy School Solwezi',
      officialName: 'Legacy School Solwezi Limited',
      phone: '+260974371271',
      city: 'Solwezi',
      province: 'North-Western',
    },
    create: {
      code: 'EDS-ZM-SOL-001',
      name: 'Legacy School Solwezi',
      officialName: 'Legacy School Solwezi Limited',
      type: OrgType.MULTI_CAMPUS_GROUP,
      registrationNo: 'MOE/NWP/SOL/SEC/2026/044',
      taxNumber: '1008492019',
      email: 'legacyschool208@gmail.com',
      phone: '+260974371271',
      address: 'Stand # S/SOLWE/3177178, Kansanshi Mine Road (opp. SGC Filling Station), Mushitala',
      city: 'Solwezi',
      province: 'North-Western',
      primaryColor: '#1e3a8a',
    },
  });

  await prisma.subscription.upsert({
    where: { id: 'sub-legacy-solwezi-001' },
    update: { tier: SubscriptionTier.ENTERPRISE_GROUP },
    create: {
      id: 'sub-legacy-solwezi-001',
      organisationId: legacyOrg.id,
      tier: SubscriptionTier.ENTERPRISE_GROUP,
      status: SubscriptionStatus.ACTIVE,
      activeLearnerCap: 1100,
      currentActiveLearners: 780,
      billingCycle: 'TERMLY',
      priceZMW: 1299.0,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
    },
  });

  // Campuses for Legacy School Solwezi
  const mushitalaCampus = await prisma.campus.upsert({
    where: { organisationId_code: { organisationId: legacyOrg.id, code: 'LSS-MDC' } },
    update: { name: 'Mushitala Day Campus' },
    create: {
      organisationId: legacyOrg.id,
      name: 'Mushitala Day Campus',
      code: 'LSS-MDC',
      address: 'Stand # S/SOLWE/3177178, Kansanshi Mine Road (opp. SGC Filling Station)',
      city: 'Mushitala, Solwezi',
      phone: '+260974371271',
      isMainCampus: true,
      latitude: -12.1642,
      longitude: 26.3951,
      elevationMeters: 1365,
      capacity: 450,
      campusType: 'DAY_PRIMARY_ECE',
      landAreaHectares: 1.8,
      contactEmail: 'mushitala@legacyschool.edu.zm',
      headTeacherName: 'Mrs. Grace Tembo (MEd)',
    },
  });

  const kansanshiCampus = await prisma.campus.upsert({
    where: { organisationId_code: { organisationId: legacyOrg.id, code: 'LSS-KBC' } },
    update: { name: 'Kansanshi Boarding Campus' },
    create: {
      organisationId: legacyOrg.id,
      name: 'Kansanshi Boarding Campus',
      code: 'LSS-KBC',
      address: 'Kansanshi Mine Road Educational Corridor',
      city: 'Solwezi',
      phone: '+260967288578',
      isMainCampus: false,
      latitude: -12.1528,
      longitude: 26.4085,
      elevationMeters: 1378,
      capacity: 650,
      campusType: 'SECONDARY_BOARDING_WING',
      landAreaHectares: 5.4,
      contactEmail: 'boarding@legacyschool.edu.zm',
      headTeacherName: 'Mr. Emmanuel Mwansa (Principal)',
    },
  });

  // Academic Year & Terms for Legacy School Solwezi
  const yearLegacy2026 = await prisma.academicYear.upsert({
    where: { organisationId_name: { organisationId: legacyOrg.id, name: '2026 Academic Year' } },
    update: { isCurrent: true },
    create: {
      organisationId: legacyOrg.id,
      name: '2026 Academic Year',
      startDate: new Date('2026-01-12'),
      endDate: new Date('2026-12-04'),
      isCurrent: true,
    },
  });

  const legacyTerm1 = await prisma.term.upsert({
    where: { id: 'term-legacy-2026-t1' },
    update: { isCurrent: true },
    create: {
      id: 'term-legacy-2026-t1',
      academicYearId: yearLegacy2026.id,
      name: 'Term 1',
      termNumber: 1,
      startDate: new Date('2026-01-12'),
      endDate: new Date('2026-04-10'),
      isCurrent: true,
    },
  });

  // Classes for both campuses across all grades
  const classesDef = [
    // ECE
    { id: 'lss-cls-baby', campusId: mushitalaCampus.id, name: 'Baby Class (Little Stars)', stage: EducationStage.ECE_NURSERY, stream: 'Stars' },
    { id: 'lss-cls-middle', campusId: mushitalaCampus.id, name: 'Middle Class', stage: EducationStage.ECE_NURSERY, stream: 'Middle' },
    { id: 'lss-cls-reception', campusId: mushitalaCampus.id, name: 'Reception Stars', stage: EducationStage.ECE_RECEPTION, stream: 'Stars' },
    // Primary
    { id: 'lss-cls-g1-gold', campusId: mushitalaCampus.id, name: 'Grade 1 Gold', stage: EducationStage.PRIMARY, stream: 'Gold' },
    { id: 'lss-cls-g1-blue', campusId: mushitalaCampus.id, name: 'Grade 1 Blue', stage: EducationStage.PRIMARY, stream: 'Blue' },
    { id: 'lss-cls-g2-emerald', campusId: mushitalaCampus.id, name: 'Grade 2 Emerald', stage: EducationStage.PRIMARY, stream: 'Emerald' },
    { id: 'lss-cls-g3-diamond', campusId: mushitalaCampus.id, name: 'Grade 3 Diamond', stage: EducationStage.PRIMARY, stream: 'Diamond' },
    { id: 'lss-cls-g4-ruby', campusId: mushitalaCampus.id, name: 'Grade 4 Ruby', stage: EducationStage.PRIMARY, stream: 'Ruby' },
    { id: 'lss-cls-g5-blue', campusId: mushitalaCampus.id, name: 'Grade 5 Blue', stage: EducationStage.PRIMARY, stream: 'Blue' },
    { id: 'lss-cls-g6-silver', campusId: mushitalaCampus.id, name: 'Grade 6 Silver', stage: EducationStage.PRIMARY, stream: 'Silver' },
    { id: 'lss-cls-g7-top', campusId: mushitalaCampus.id, name: 'Grade 7 Top (Candidates)', stage: EducationStage.PRIMARY, stream: 'Top' },
    // Junior Secondary
    { id: 'lss-cls-f1-alpha', campusId: kansanshiCampus.id, name: 'Form 1 Alpha', stage: EducationStage.JUNIOR_SECONDARY, stream: 'Alpha' },
    { id: 'lss-cls-f1-beta', campusId: kansanshiCampus.id, name: 'Form 1 Beta', stage: EducationStage.JUNIOR_SECONDARY, stream: 'Beta' },
    { id: 'lss-cls-f2-gold', campusId: kansanshiCampus.id, name: 'Form 2 Gold (ECZ Candidates)', stage: EducationStage.JUNIOR_SECONDARY, stream: 'Gold' },
    { id: 'lss-cls-f2-green', campusId: kansanshiCampus.id, name: 'Form 2 Green', stage: EducationStage.JUNIOR_SECONDARY, stream: 'Green' },
    // Senior Secondary
    { id: 'lss-cls-f3-blue', campusId: kansanshiCampus.id, name: 'Form 3 Blue', stage: EducationStage.SENIOR_SECONDARY, stream: 'Blue' },
    { id: 'lss-cls-f3-red', campusId: kansanshiCampus.id, name: 'Form 3 Red', stage: EducationStage.SENIOR_SECONDARY, stream: 'Red' },
    { id: 'lss-cls-f4-green', campusId: kansanshiCampus.id, name: 'Form 4 Green', stage: EducationStage.SENIOR_SECONDARY, stream: 'Green' },
    { id: 'lss-cls-f4-gold', campusId: kansanshiCampus.id, name: 'Form 4 Gold', stage: EducationStage.SENIOR_SECONDARY, stream: 'Gold' },
    { id: 'lss-cls-f5-sciences', campusId: kansanshiCampus.id, name: 'Form 5 Sciences (Senior Candidates)', stage: EducationStage.SENIOR_SECONDARY, stream: 'Sciences' },
    { id: 'lss-cls-f5-arts', campusId: kansanshiCampus.id, name: 'Form 5 Arts & Commerce', stage: EducationStage.SENIOR_SECONDARY, stream: 'Arts' },
  ];

  const classLookup: Record<string, string> = {};
  for (const c of classesDef) {
    const cls = await prisma.class.upsert({
      where: { id: c.id },
      update: { name: c.name, stage: c.stage, stream: c.stream },
      create: {
        id: c.id,
        campusId: c.campusId,
        academicYearId: yearLegacy2026.id,
        name: c.name,
        stage: c.stage,
        stream: c.stream,
        capacity: 45,
      },
    });
    classLookup[c.name] = cls.id;
  }

  // 48 Staff members across all cadres
  for (const sm of LEGACY_STAFF_MEMBERS) {
    const campusId = sm.campusId === 'LSS-KBC' ? kansanshiCampus.id : mushitalaCampus.id;

    let role: SystemRole = SystemRole.TEACHER;
    if (sm.jobTitle.includes('Director') || sm.jobTitle.includes('Principal') || sm.jobTitle.includes('Headteacher')) {
      role = SystemRole.HEADTEACHER;
    } else if (sm.jobTitle.includes('Deputy')) {
      role = SystemRole.DEPUTY_HEADTEACHER;
    } else if (sm.jobTitle.includes('Bursar') || sm.jobTitle.includes('Cashier') || (sm.department === 'FINANCE_OPERATIONS' && sm.jobTitle.includes('Accounts'))) {
      role = SystemRole.BURSAR;
    } else if (sm.jobTitle.includes('Registrar') || sm.jobTitle.includes('Admissions')) {
      role = SystemRole.REGISTRAR;
    } else if (sm.jobTitle.includes('HR')) {
      role = SystemRole.HR_OFFICER;
    } else if (sm.department === 'ACADEMIC_PRIMARY' && (sm.jobTitle.includes('ECE') || sm.jobTitle.includes('Reception') || sm.jobTitle.includes('Practitioner'))) {
      role = SystemRole.ECE_PRACTITIONER;
    }

    const user = await prisma.user.upsert({
      where: { email: sm.email },
      update: {
        firstName: sm.firstName,
        lastName: sm.lastName,
        phone: sm.phone,
        role: role,
      },
      create: {
        organisationId: legacyOrg.id,
        email: sm.email,
        passwordHash: defaultPasswordHash,
        firstName: sm.firstName,
        lastName: sm.lastName,
        phone: sm.phone,
        role: role,
      },
    });

    const empStatus = sm.employmentStatus === 'CONTRACT'
      ? EmploymentStatus.CONTRACT
      : sm.employmentStatus === 'PROBATION'
      ? EmploymentStatus.PROBATION
      : EmploymentStatus.FULL_TIME;

    await prisma.staff.upsert({
      where: {
        organisationId_staffNumber: {
          organisationId: legacyOrg.id,
          staffNumber: sm.staffNumber,
        },
      },
      update: {
        jobTitle: sm.jobTitle,
        qualification: sm.qualification,
        tczNumber: sm.tczNumber,
        tczCertificateExpiry: new Date(sm.tczExpiry),
        employmentStatus: empStatus,
        phone: sm.phone,
        email: sm.email,
      },
      create: {
        organisationId: legacyOrg.id,
        campusId,
        userId: user.id,
        staffNumber: sm.staffNumber,
        firstName: sm.firstName,
        lastName: sm.lastName,
        email: sm.email,
        phone: sm.phone,
        jobTitle: sm.jobTitle,
        qualification: sm.qualification,
        tczNumber: sm.tczNumber,
        tczCertificateExpiry: new Date(sm.tczExpiry),
        employmentStatus: empStatus,
        dateJoined: new Date(sm.dateJoined),
      },
    });
  }
  console.log(`✓ Seeded ${LEGACY_STAFF_MEMBERS.length} staff members across all cadres for Legacy School Solwezi`);

  // All Grades Spectrum: 478 Learners (Boarders & Day Scholars)
  const learnersData = generateLegacyLearners(478);
  for (const l of learnersData) {
    const campusId = l.campusName.includes('Mushitala') ? mushitalaCampus.id : kansanshiCampus.id;
    const classId = classLookup[l.className] || classLookup['Grade 1 Gold'];

    const names = l.learnerName.split(' ');
    const firstName = names[0] || 'Learner';
    const lastName = names.slice(1).join(' ') || 'Legacy';

    // 1. Learner record
    const learner = await prisma.learner.upsert({
      where: {
        organisationId_studentNumber: {
          organisationId: legacyOrg.id,
          studentNumber: l.studentNumber,
        },
      },
      update: {
        currentClassId: classId,
        campusId,
        status: LearnerStatus.ENROLLED,
      },
      create: {
        organisationId: legacyOrg.id,
        campusId,
        studentNumber: l.studentNumber,
        firstName,
        lastName,
        gender: l.gender === 'MALE' ? Gender.MALE : Gender.FEMALE,
        dateOfBirth: new Date(l.studentType === 'BOARDER' ? '2010-06-15' : '2017-03-22'),
        nationality: 'Zambian',
        status: LearnerStatus.ENROLLED,
        currentClassId: classId,
        residentialArea: l.studentType === 'BOARDER' ? 'Kansanshi Mine Boarding Wing' : 'Mushitala, Solwezi',
        emergencyContact: l.guardian.phone,
      },
    });

    // 2. Invoice
    const invStatus = l.balance === 0
      ? InvoiceStatus.PAID
      : l.totalPaid > 0
      ? InvoiceStatus.PARTIALLY_PAID
      : InvoiceStatus.ISSUED;

    await prisma.invoice.upsert({
      where: {
        organisationId_invoiceNumber: {
          organisationId: legacyOrg.id,
          invoiceNumber: `INV-${l.studentNumber}`,
        },
      },
      update: {
        totalAmount: l.totalBilled,
        paidAmount: l.totalPaid,
        balance: l.balance,
        status: invStatus,
      },
      create: {
        organisationId: legacyOrg.id,
        learnerId: learner.id,
        termId: legacyTerm1.id,
        invoiceNumber: `INV-${l.studentNumber}`,
        idempotencyKey: `inv-key-${l.studentNumber}`,
        totalAmount: l.totalBilled,
        paidAmount: l.totalPaid,
        balance: l.balance,
        status: invStatus,
        dueDate: new Date('2026-02-28'),
      },
    });

    // 3. Payment & Receipt (if paid > 0)
    if (l.totalPaid > 0) {
      const payment = await prisma.payment.upsert({
        where: {
          organisationId_paymentNumber: {
            organisationId: legacyOrg.id,
            paymentNumber: `PAY-${l.studentNumber}-01`,
          },
        },
        update: {
          amount: l.totalPaid,
        },
        create: {
          organisationId: legacyOrg.id,
          learnerId: learner.id,
          paymentNumber: `PAY-${l.studentNumber}-01`,
          amount: l.totalPaid,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          referenceNumber: `ZANACO-SOL-${l.studentNumber}`,
          receivedDate: new Date('2026-01-20'),
        },
      });

      await prisma.receipt.upsert({
        where: {
          organisationId_receiptNumber: {
            organisationId: legacyOrg.id,
            receiptNumber: `REC-${l.studentNumber}-01`,
          },
        },
        update: {
          amount: l.totalPaid,
        },
        create: {
          organisationId: legacyOrg.id,
          paymentId: payment.id,
          receiptNumber: `REC-${l.studentNumber}-01`,
          amount: l.totalPaid,
          issuedAt: new Date('2026-01-20'),
        },
      });
    }
  }
  console.log(`✓ Seeded ${learnersData.length} learners with invoices, payments & receipts for Legacy School Solwezi`);

  // Notice for Legacy School Solwezi (Idempotent)
  const existingNotice = await prisma.notice.findFirst({
    where: {
      organisationId: legacyOrg.id,
      title: 'Legacy School Solwezi: 250kVA Standby Power & Boarding Exeat Policy',
    },
  });

  if (!existingNotice) {
    await prisma.notice.create({
      data: {
        organisationId: legacyOrg.id,
        title: 'Legacy School Solwezi: 250kVA Standby Power & Boarding Exeat Policy',
        content:
          'All parents and guardians are assured that Kansanshi Boarding Campus maintains 24/7 power via our 250kVA standby diesel generator. Weekend exeats must be authorized by 15:00 on Friday.',
        isPinned: true,
      },
    });
  }

  console.log('✓ Successfully seeded Kabulonga Academy, Sunshine ECE, and Legacy School Solwezi (2 Campuses & Boarding)!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
