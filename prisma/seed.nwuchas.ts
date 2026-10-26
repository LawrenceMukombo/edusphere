import { loadEnvConfig } from '@next/env';
import {
  PrismaClient,
  SystemRole,
  CouncilType,
  IndexingStatus,
  ClinicalSiteType,
  PlacementStatus,
  CompetencyLevel,
  PaymentChannel,
  PaymentIntentStatus,
  WebhookStatus,
  ServiceEntitlementType,
  EntitlementStatus,
  PayrollStatus,
  StatutoryAuthority,
  HostelGenderPolicy,
  FeeCategory,
  InvoiceStatus,
  PaymentMethod,
  LedgerEntryType,
  EmploymentStatus,
  AdmissionApplicationStatus,
  Gender,
  LearnerStatus,
  EducationStage,
  AssessmentType,
  ResultStatus,
  AttendanceStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
export const DEV_PASSWORD = 'NWUCHAS-DEV-ONLY-CHANGE-ME';

function assertDedicatedLocalDatabase() {
  const url = process.env.DATABASE_URL ?? '';
  const isDedicatedTarget = /@(localhost|127\.0\.0\.1):(5432|5434)\/(nwuchas_cmis|nwuchas_db|nwuchas)(?:\?|$)/i.test(url);
  if (!isDedicatedTarget && process.env.ALLOW_SEED !== 'true') {
    throw new Error('Refusing to seed: DATABASE_URL must target dedicated nwuchas database on localhost or set ALLOW_SEED=true.');
  }
}

async function main() {
  assertDedicatedLocalDatabase();
  console.log('=== Starting NWUCHAS Comprehensive Enterprise Seeding ===');

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);

  // 1. INSTITUTION CONFIGURATION
  const organisation = await prisma.organisation.upsert({
    where: { code: 'NWUCHAS' },
    update: {
      name: 'North Western University College of Health and Applied Sciences',
      officialName: 'North Western University College College of Health and Applied Science (NWUCHAS)',
      email: 'info@nwuchas.edu.zm',
      phone: '+260 218 821 400',
      address: 'Plot 412, Lumwana Road, Manyama',
      city: 'Manyama, Lumwana',
      province: 'North-Western',
      country: 'Zambia',
      currency: 'ZMW',
      timezone: 'Africa/Lusaka',
      primaryColor: '#0E7490',
    },
    create: {
      code: 'NWUCHAS',
      name: 'North Western University College of Health and Applied Sciences',
      officialName: 'North Western University College College of Health and Applied Science (NWUCHAS)',
      registrationNo: 'HEA/INST/2024/089',
      taxNumber: '1004829104',
      email: 'info@nwuchas.edu.zm',
      phone: '+260 218 821 400',
      address: 'Plot 412, Lumwana Road, Manyama',
      city: 'Manyama, Lumwana',
      province: 'North-Western',
      country: 'Zambia',
      currency: 'ZMW',
      timezone: 'Africa/Lusaka',
      primaryColor: '#0E7490',
      isActive: true,
    },
  });

  // 2. CAMPUSES (Main Campus in Manyama + Solwezi Clinical Annex)
  const mainCampus = await prisma.campus.upsert({
    where: { organisationId_code: { organisationId: organisation.id, code: 'MAIN' } },
    update: {
      latitude: -12.2450,
      longitude: 25.8450,
      elevationMeters: 1350,
      capacity: 1200,
    },
    create: {
      organisationId: organisation.id,
      code: 'MAIN',
      name: 'NWUCHAS Main Campus (Manyama / Lumwana)',
      address: 'Lumwana Road, Manyama Educational Zone',
      city: 'Manyama',
      phone: '+260 218 821 401',
      isMainCampus: true,
      campusType: 'MAIN_CAMPUS',
      latitude: -12.2450,
      longitude: 25.8450,
      elevationMeters: 1350,
      capacity: 1200,
      catchmentRadiusKm: 25.0,
      facilitiesJson: JSON.stringify([
        'Clinical Skills Simulation Lab',
        'Anatomy & Physiology Resource Centre',
        'Health Sciences Library (150 seats)',
        'Computer & CBT Testing Centre',
        'Florence Nightingale Hostel',
        'Campus Health Clinic',
        'Auditorium (450 seats)',
      ]),
    },
  });

  const clinicalCampus = await prisma.campus.upsert({
    where: { organisationId_code: { organisationId: organisation.id, code: 'SOL-ANNEX' } },
    update: {
      latitude: -12.1800,
      longitude: 26.3950,
      elevationMeters: 1365,
      capacity: 500,
    },
    create: {
      organisationId: organisation.id,
      code: 'SOL-ANNEX',
      name: 'Solwezi Clinical Training Campus (Hospital Annex)',
      address: 'Hospital Road, opposite Solwezi General Hospital',
      city: 'Solwezi',
      phone: '+260 218 821 410',
      isMainCampus: false,
      campusType: 'CLINICAL_ANNEX',
      latitude: -12.1800,
      longitude: 26.3950,
      elevationMeters: 1365,
      capacity: 500,
      catchmentRadiusKm: 15.0,
      facilitiesJson: JSON.stringify([
        'Clinical Preceptorship Rooms',
        'OSCE 8-Station Examination Circuit',
        'Student Clinical Common Room',
        'De-briefing & Reflection Centre',
      ]),
    },
  });

  // 3. CORE USER PERSONAS
  const userSpecs: Array<{ role: SystemRole; email: string; firstName: string; lastName: string; phone: string }> = [
    { role: SystemRole.INSTITUTION_ADMIN, email: 'principal@nwuchas.edu.zm', firstName: 'Dr. Mwila', lastName: 'Chileshe', phone: '+260977100001' },
    { role: SystemRole.REGISTRAR, email: 'registrar@nwuchas.edu.zm', firstName: 'Mr. Kabwe', lastName: 'Mumba', phone: '+260977100002' },
    { role: SystemRole.ADMISSIONS_OFFICER, email: 'admissions@nwuchas.edu.zm', firstName: 'Ms. Brenda', lastName: 'Mwansa', phone: '+260977100003' },
    { role: SystemRole.ADMISSIONS_COMMITTEE, email: 'committee@nwuchas.edu.zm', firstName: 'Dr. Patricia', lastName: 'Tembo', phone: '+260977100004' },
    { role: SystemRole.BURSAR, email: 'bursar@nwuchas.edu.zm', firstName: 'Mr. Patrick', lastName: 'Banda', phone: '+260977100005' },
    { role: SystemRole.CASHIER, email: 'cashier@nwuchas.edu.zm', firstName: 'Ms. Mary', lastName: 'Phiri', phone: '+260977100006' },
    { role: SystemRole.FINANCE_RECONCILER, email: 'reconciler@nwuchas.edu.zm', firstName: 'Mr. Kelvin', lastName: 'Chanda', phone: '+260977100007' },
    { role: SystemRole.PAYROLL_PREPARER, email: 'payroll@nwuchas.edu.zm', firstName: 'Mrs. Naomi', lastName: 'Lungu', phone: '+260977100008' },
    { role: SystemRole.PAYROLL_APPROVER, email: 'finance.director@nwuchas.edu.zm', firstName: 'Mr. Clement', lastName: 'Zimba', phone: '+260977100009' },
    { role: SystemRole.LECTURER, email: 'nursing.lead@nwuchas.edu.zm', firstName: 'Mrs. Gertrude', lastName: 'Mwape', phone: '+260977100010' },
    { role: SystemRole.MODULE_COORDINATOR, email: 'clinical.coord@nwuchas.edu.zm', firstName: 'Mr. Chileshe', lastName: 'Mulenga', phone: '+260977100011' },
    { role: SystemRole.EXAMINATIONS_OFFICER, email: 'exams@nwuchas.edu.zm', firstName: 'Dr. Joseph', lastName: 'Kangwa', phone: '+260977100012' },
    { role: SystemRole.CLINICAL_SUPERVISOR, email: 'supervisor.solwezi@nwuchas.edu.zm', firstName: 'Sr. Agnes', lastName: 'Kaunda', phone: '+260977100013' },
    { role: SystemRole.IT_ADMIN, email: 'it.admin@nwuchas.edu.zm', firstName: 'Mr. Lawrence', lastName: 'Mukombo', phone: '+260977100014' },
    { role: SystemRole.APPLICANT, email: 'applicant.demo@nwuchas.edu.zm', firstName: 'Chileshe', lastName: 'Bwalya', phone: '+260977100015' },
  ];

  const userMap = new Map<string, any>();
  for (const spec of userSpecs) {
    const user = await prisma.user.upsert({
      where: { email: spec.email },
      update: { role: spec.role, organisationId: organisation.id, isActive: true },
      create: {
        organisationId: organisation.id,
        email: spec.email,
        firstName: spec.firstName,
        lastName: spec.lastName,
        phone: spec.phone,
        role: spec.role,
        passwordHash,
        isActive: true,
      },
    });
    userMap.set(spec.role, user);
    userMap.set(spec.email, user);
  }

  // 4. DEPARTMENTS
  const depts = [
    { code: 'NURS', name: 'Department of Nursing and Midwifery', desc: 'Pre-service registered nursing, midwifery and public health nursing education.' },
    { code: 'CLIN', name: 'Department of Clinical Sciences', desc: 'Clinical medicine, surgery, anaesthetics and emergency medicine.' },
    { code: 'PUBH', name: 'Department of Public Health', desc: 'Epidemiology, community health and environmental hygiene.' },
    { code: 'PHARM', name: 'Department of Pharmacy', desc: 'Pharmacology, dispensary science and pharmaceutical management.' },
  ];

  const deptMap = new Map<string, any>();
  for (const d of depts) {
    const dept = await prisma.department.upsert({
      where: { organisationId_code: { organisationId: organisation.id, code: d.code } },
      update: { name: d.name, description: d.desc },
      create: {
        organisationId: organisation.id,
        code: d.code,
        name: d.name,
        description: d.desc,
      },
    });
    deptMap.set(d.code, dept);
  }

  // 5. PROGRAMMES
  const progData = [
    { code: 'DRN', dept: 'NURS', name: 'Diploma in Registered Nursing', level: 'DIPLOMA', council: CouncilType.NMCZ, years: 3, tuition: 6500, clinical: 1800 },
    { code: 'DCM', dept: 'CLIN', name: 'Diploma in Clinical Medicine', level: 'DIPLOMA', council: CouncilType.HPCZ, years: 3, tuition: 6800, clinical: 2000 },
    { code: 'BScN', dept: 'NURS', name: 'Bachelor of Science in Nursing', level: 'DEGREE', council: CouncilType.NMCZ, years: 4, tuition: 8500, clinical: 2200 },
    { code: 'DPHARM', dept: 'PHARM', name: 'Diploma in Pharmacy Technology', level: 'DIPLOMA', council: CouncilType.HPCZ, years: 3, tuition: 6200, clinical: 1400 },
  ];

  const progMap = new Map<string, any>();
  for (const p of progData) {
    const prog = await prisma.programme.upsert({
      where: { organisationId_code: { organisationId: organisation.id, code: p.code } },
      update: { tuitionFeePerSem: p.tuition, clinicalFeePerSem: p.clinical },
      create: {
        organisationId: organisation.id,
        departmentId: deptMap.get(p.dept).id,
        code: p.code,
        name: p.name,
        qualificationLevel: p.level,
        accreditingCouncil: p.council,
        durationYears: p.years,
        tuitionFeePerSem: p.tuition,
        clinicalFeePerSem: p.clinical,
      },
    });
    progMap.set(p.code, prog);
  }

  // 6. COURSE MODULES
  const courseSpecs = [
    { prog: 'DRN', code: 'NUR-111', name: 'Anatomy and Physiology I', sem: 1, credits: 4, isClin: false },
    { prog: 'DRN', code: 'NUR-112', name: 'Fundamentals of Nursing Practice', sem: 1, credits: 4, isClin: true },
    { prog: 'DRN', code: 'NUR-113', name: 'Microbiology and Parasitology', sem: 1, credits: 3, isClin: false },
    { prog: 'DRN', code: 'NUR-211', name: 'Medical-Surgical Nursing I', sem: 3, credits: 5, isClin: true },
    { prog: 'DRN', code: 'NUR-212', name: 'Pharmacology for Health Professionals', sem: 3, credits: 4, isClin: false },
    { prog: 'DCM', code: 'MED-111', name: 'Human Anatomy & Histology', sem: 1, credits: 4, isClin: false },
    { prog: 'DCM', code: 'MED-112', name: 'General Pathology & Pathophysiology', sem: 1, credits: 4, isClin: false },
    { prog: 'DCM', code: 'MED-211', name: 'Clinical Medicine & Diagnosis I', sem: 3, credits: 5, isClin: true },
  ];

  const courseMap = new Map<string, any>();
  for (const c of courseSpecs) {
    const prog = progMap.get(c.prog);
    const course = await prisma.courseModule.upsert({
      where: { programmeId_code: { programmeId: prog.id, code: c.code } },
      update: { name: c.name, creditUnits: c.credits, isClinical: c.isClin },
      create: {
        programmeId: prog.id,
        code: c.code,
        name: c.name,
        creditUnits: c.credits,
        semesterNumber: c.sem,
        isClinical: c.isClin,
      },
    });
    courseMap.set(c.code, course);
  }

  // 7. COHORTS
  const rnCohort = await prisma.cohort.upsert({
    where: { organisationId_name: { organisationId: organisation.id, name: 'RN-2026-JAN' } },
    update: {},
    create: {
      organisationId: organisation.id,
      programmeId: progMap.get('DRN').id,
      name: 'RN-2026-JAN',
      intake: 'January 2026',
      academicYear: '2026',
      currentYear: 1,
      currentSemester: 1,
      capacity: 65,
    },
  });

  const cmCohort = await prisma.cohort.upsert({
    where: { organisationId_name: { organisationId: organisation.id, name: 'CM-2026-JAN' } },
    update: {},
    create: {
      organisationId: organisation.id,
      programmeId: progMap.get('DCM').id,
      name: 'CM-2026-JAN',
      intake: 'January 2026',
      academicYear: '2026',
      currentYear: 1,
      currentSemester: 1,
      capacity: 50,
    },
  });

  // 8. ACADEMIC YEAR & SEMESTER TERMS
  const acadYear = await prisma.academicYear.upsert({
    where: { organisationId_name: { organisationId: organisation.id, name: 'Academic Year 2026' } },
    update: { isCurrent: true },
    create: {
      organisationId: organisation.id,
      name: 'Academic Year 2026',
      startDate: new Date('2026-01-05T00:00:00.000Z'),
      endDate: new Date('2026-11-27T23:59:59.000Z'),
      isCurrent: true,
    },
  });

  const sem1 = await prisma.term.upsert({
    where: { id: `sem-1-${acadYear.id}` },
    update: { isCurrent: true },
    create: {
      id: `sem-1-${acadYear.id}`,
      academicYearId: acadYear.id,
      name: 'Semester 1 (Jan - May 2026)',
      termNumber: 1,
      startDate: new Date('2026-01-05T00:00:00.000Z'),
      endDate: new Date('2026-05-29T23:59:59.000Z'),
      isCurrent: true,
    },
  });

  // 9. STAFF RECORDS & STATUTORY CONTRACTS
  const staffSpecs = [
    { userRole: SystemRole.INSTITUTION_ADMIN, num: 'NWU-STF-001', title: 'Principal & Chief Executive', base: 32000, tpin: '1004829101', napsa: '502918201', wcfcb: 'HEALTH_EDUCATION_CLASS_4' },
    { userRole: SystemRole.REGISTRAR, num: 'NWU-STF-002', title: 'College Registrar', base: 22000, tpin: '1004829102', napsa: '502918202', wcfcb: 'HEALTH_EDUCATION_CLASS_4' },
    { userRole: SystemRole.BURSAR, num: 'NWU-STF-003', title: 'College Bursar / Finance Manager', base: 21000, tpin: '1004829103', napsa: '502918203', wcfcb: 'HEALTH_EDUCATION_CLASS_4' },
    { userRole: SystemRole.LECTURER, num: 'NWU-STF-004', title: 'Head of Nursing / Senior Lecturer', base: 18500, tpin: '1004829104', napsa: '502918204', wcfcb: 'HEALTH_EDUCATION_CLASS_4' },
    { userRole: SystemRole.MODULE_COORDINATOR, num: 'NWU-STF-005', title: 'Clinical Training Coordinator', base: 17000, tpin: '1004829105', napsa: '502918205', wcfcb: 'HEALTH_EDUCATION_CLASS_4' },
    { userRole: SystemRole.EXAMINATIONS_OFFICER, num: 'NWU-STF-006', title: 'Examinations Officer & Lecturer', base: 17500, tpin: '1004829106', napsa: '502918206', wcfcb: 'HEALTH_EDUCATION_CLASS_4' },
    { userRole: SystemRole.CASHIER, num: 'NWU-STF-007', title: 'Senior Finance Cashier', base: 8500, tpin: '1004829107', napsa: '502918207', wcfcb: 'HEALTH_EDUCATION_CLASS_4' },
    { userRole: SystemRole.PAYROLL_PREPARER, num: 'NWU-STF-008', title: 'Human Resources & Payroll Officer', base: 11000, tpin: '1004829108', napsa: '502918208', wcfcb: 'HEALTH_EDUCATION_CLASS_4' },
  ];

  const staffMap = new Map<string, any>();
  for (const s of staffSpecs) {
    const user = userMap.get(s.userRole);
    const staff = await prisma.staff.upsert({
      where: { organisationId_staffNumber: { organisationId: organisation.id, staffNumber: s.num } },
      update: { userId: user.id, jobTitle: s.title },
      create: {
        organisationId: organisation.id,
        campusId: mainCampus.id,
        userId: user.id,
        staffNumber: s.num,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '+260977000000',
        jobTitle: s.title,
        qualification: 'Master of Health Sciences / BSc Nursing / FCCA',
        employmentStatus: EmploymentStatus.FULL_TIME,
      },
    });
    staffMap.set(s.num, staff);

    await prisma.staffContract.upsert({
      where: { staffId: staff.id },
      update: { basicSalaryZMW: s.base },
      create: {
        staffId: staff.id,
        basicSalaryZMW: s.base,
        housingAllowance: s.base * 0.15,
        transportAllowance: 1200.00,
        clinicalAllowance: s.title.includes('Nursing') || s.title.includes('Clinical') ? 1500.00 : 0.00,
        tpin: s.tpin,
        napsaNumber: s.napsa,
        wcfcbClass: s.wcfcb,
        bankName: 'Absa Bank Zambia - Solwezi Branch',
        bankAccountMasked: '******4128',
      },
    });
  }

  // 10. STATUTORY RULE SETS (Zambia 2026)
  await prisma.statutoryRuleSet.upsert({
    where: { id: 'stat-zra-paye-2026' },
    update: {},
    create: {
      id: 'stat-zra-paye-2026',
      authority: StatutoryAuthority.ZRA_PAYE,
      title: 'ZRA PAYE Official Progressive Tax Bands 2026',
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
      rulesJson: JSON.stringify({
        currency: 'ZMW',
        brackets: [
          { threshold: 5100.00, rate: 0.00, label: 'First K5,100 (Exempt)' },
          { threshold: 7100.00, rate: 0.20, label: 'Next K2,000 (20%)' },
          { threshold: 9200.00, rate: 0.30, label: 'Next K2,100 (30%)' },
          { threshold: null, rate: 0.37, label: 'Excess over K9,200 (37%)' },
        ],
        source: 'Zambia Revenue Authority (ZRA) National Budget Schedule 2026',
      }),
      isApproved: true,
      approvedBy: 'College Bursar / ZICA Certified Accountant',
    },
  });

  await prisma.statutoryRuleSet.upsert({
    where: { id: 'stat-napsa-2026' },
    update: {},
    create: {
      id: 'stat-napsa-2026',
      authority: StatutoryAuthority.NAPSA,
      title: 'NAPSA Statutory Contributions 2026',
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
      rulesJson: JSON.stringify({
        currency: 'ZMW',
        employeeRate: 0.05,
        employerRate: 0.05,
        statutoryCeilingEarnings: 29868.00,
        maximumContributionPerParty: 1493.40,
        source: 'National Pension Scheme Authority (NAPSA) Important Facts 2026',
      }),
      isApproved: true,
      approvedBy: 'Human Resources & Finance Committee',
    },
  });

  await prisma.statutoryRuleSet.upsert({
    where: { id: 'stat-wcfcb-2026' },
    update: {},
    create: {
      id: 'stat-wcfcb-2026',
      authority: StatutoryAuthority.WCFCB,
      title: 'Workers Compensation Employer Assessment 2026',
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
      rulesJson: JSON.stringify({
        currency: 'ZMW',
        employerAssessmentRate: 0.025,
        employeeDeductionRate: 0.00, // Strictly 0.00 - Employer cost only
        riskClassification: 'Class 4: Education & Health Services',
        source: 'Workers Compensation Fund Control Board (WCFCB) Statutory Notice',
      }),
      isApproved: true,
      approvedBy: 'Principal & Finance Director',
    },
  });

  // 11. CLINICAL SITES, SUPERVISORS & ROTATIONS
  const clinicalSites = [
    { code: 'SOL-GEN', name: 'Solwezi General Hospital', type: ClinicalSiteType.GENERAL_HOSPITAL, loc: 'Solwezi Central', cap: 40, contact: 'Dr. Mukuka Banda (Medical Supt)' },
    { code: 'LUM-HOSP', name: 'Lumwana First Level Hospital', type: ClinicalSiteType.FIRST_LEVEL_HOSPITAL, loc: 'Lumwana Town Centre', cap: 25, contact: 'Dr. Grace Chibwe' },
    { code: 'MAN-HC', name: 'Manyama Health Centre', type: ClinicalSiteType.HEALTH_CENTRE, loc: 'Manyama Main Road', cap: 15, contact: 'Sister Florence Bwalya' },
  ];

  const siteMap = new Map<string, any>();
  for (const s of clinicalSites) {
    const site = await prisma.clinicalSite.upsert({
      where: { organisationId_code: { organisationId: organisation.id, code: s.code } },
      update: { capacityStudents: s.cap },
      create: {
        organisationId: organisation.id,
        code: s.code,
        name: s.name,
        siteType: s.type,
        location: s.loc,
        contactPerson: s.contact,
        contactPhone: '+260977200000',
        capacityStudents: s.cap,
        mouValidUntil: new Date('2028-12-31T00:00:00.000Z'),
      },
    });
    siteMap.set(s.code, site);
  }

  const supervisorAgnes = await prisma.clinicalSupervisor.upsert({
    where: { id: 'sup-agnes-kaunda' },
    update: {},
    create: {
      id: 'sup-agnes-kaunda',
      organisationId: organisation.id,
      clinicalSiteId: siteMap.get('SOL-GEN').id,
      staffId: staffMap.get('NWU-STF-004').id,
      fullName: 'Sister Agnes Kaunda',
      profession: 'Senior Nursing Officer / Clinical Preceptor',
      councilRegNumber: 'NMCZ/PRE/2018/092',
      phone: '+260977300001',
      email: 'agnes.kaunda@solwezigen.gov.zm',
    },
  });

  // 12. APPLICANTS & ADMISSIONS LIFECYCLE (Comprehensive CMIS Seeded Dataset)
  const applicantScenarios = [
    { num: 'NWU-APP-2026-00101', fn: 'Musonda', ln: 'Chanda', prog: 'Diploma in Registered Nursing', status: AdmissionApplicationStatus.SUBMITTED, intake: 'January 2026', nrc: '482910/11/1', school: 'Solwezi Technical Secondary School', oLevels: 'Eng: 2, Math: 3, Bio: 1, Sci: 2, Civ: 3' },
    { num: 'NWU-APP-2026-00102', fn: 'Taonga', ln: 'Phiri', prog: 'Diploma in Clinical Medicine', status: AdmissionApplicationStatus.DOCUMENT_CHECK, intake: 'January 2026', nrc: '391024/67/1', school: 'Kansanshi Secondary School', oLevels: 'Eng: 1, Math: 2, Bio: 1, Sci: 3, Geo: 2' },
    { num: 'NWU-APP-2026-00103', fn: 'Mutale', ln: 'Mwamba', prog: 'Diploma in Registered Nursing', status: AdmissionApplicationStatus.OFFERED, intake: 'January 2026', nrc: '519203/10/1', school: 'Mwinilunga Secondary School', oLevels: 'Eng: 2, Math: 3, Bio: 2, Sci: 2, Rel: 1' },
    { num: 'NWU-APP-2026-00104', fn: 'Chilufya', ln: 'Banda', prog: 'Diploma in Registered Nursing', status: AdmissionApplicationStatus.ENROLLED, intake: 'January 2026', nrc: '472019/11/1', school: 'Kasempa Day Secondary School', oLevels: 'Eng: 1, Math: 2, Bio: 1, Sci: 1, His: 2' },
    { num: 'NWU-APP-2026-00105', fn: 'Emmanuel', ln: 'Sichone', prog: 'Diploma in Clinical Medicine', status: AdmissionApplicationStatus.ENROLLED, intake: 'January 2026', nrc: '381920/64/1', school: 'Manyama Secondary School', oLevels: 'Eng: 2, Math: 1, Bio: 1, Sci: 2, Com: 2' },
    { num: 'NWU-APP-2026-00106', fn: 'Kondwani', ln: 'Lungu', prog: 'Diploma in Pharmacy Technology', status: AdmissionApplicationStatus.SUBMITTED, intake: 'January 2026', nrc: '491023/11/1', school: 'Solwezi Central Secondary', oLevels: 'Eng: 3, Math: 2, Bio: 2, Sci: 2, Che: 2' },
    { num: 'NWU-APP-2026-00107', fn: 'Natasha', ln: 'Bwalya', prog: 'Bachelor of Science in Nursing', status: AdmissionApplicationStatus.ELIGIBILITY_REVIEW, intake: 'January 2026', nrc: '520192/10/1', school: 'Kabulonga Girls Secondary, Lusaka', oLevels: 'Eng: 1, Math: 2, Bio: 1, Sci: 1, Phy: 2' },
    { num: 'NWU-APP-2026-00108', fn: 'Kasonde', ln: 'Mulenga', prog: 'Diploma in Registered Nursing', status: AdmissionApplicationStatus.COMMITTEE_REVIEW, intake: 'January 2026', nrc: '461902/11/1', school: 'Kalumbila Secondary School', oLevels: 'Eng: 2, Math: 3, Bio: 2, Sci: 3, Civ: 2' },
    { num: 'NWU-APP-2026-00109', fn: 'Mwamba', ln: 'Chileshe', prog: 'Diploma in Clinical Medicine', status: AdmissionApplicationStatus.OFFERED, intake: 'January 2026', nrc: '392019/67/1', school: 'Chizongwe Boys Secondary, Chipata', oLevels: 'Eng: 2, Math: 1, Bio: 2, Sci: 2, Geo: 3' },
    { num: 'NWU-APP-2026-00110', fn: 'Precious', ln: 'Tembo', prog: 'Diploma in Registered Nursing', status: AdmissionApplicationStatus.ACCEPTED, intake: 'January 2026', nrc: '501920/10/1', school: 'Mufumbwe Secondary School', oLevels: 'Eng: 1, Math: 3, Bio: 1, Sci: 2, Civ: 1' },
    { num: 'NWU-APP-2026-00111', fn: 'Kelvin', ln: 'Kalenga', prog: 'Diploma in Clinical Medicine', status: AdmissionApplicationStatus.DOCUMENT_CHECK, intake: 'January 2026', nrc: '412039/11/1', school: 'Zambezi Boarding Secondary', oLevels: 'Eng: 2, Math: 2, Bio: 2, Sci: 3, Com: 3' },
    { num: 'NWU-APP-2026-00112', fn: 'Bupe', ln: 'Silwamba', prog: 'Diploma in Pharmacy Technology', status: AdmissionApplicationStatus.COMMITTEE_REVIEW, intake: 'January 2026', nrc: '531029/10/1', school: 'St. Mary’s Secondary, Livingstone', oLevels: 'Eng: 1, Math: 2, Bio: 2, Sci: 2, Che: 1' },
    { num: 'NWU-APP-2026-00113', fn: 'Thandiwe', ln: 'Phiri', prog: 'Diploma in Registered Nursing', status: AdmissionApplicationStatus.ENROLLED, intake: 'January 2026', nrc: '441029/11/1', school: 'Solwezi Technical Secondary School', oLevels: 'Eng: 1, Math: 2, Bio: 1, Sci: 1, Civ: 2' },
    { num: 'NWU-APP-2026-00114', fn: 'Chanda', ln: 'Bwalya', prog: 'Diploma in Registered Nursing', status: AdmissionApplicationStatus.ENROLLED, intake: 'January 2026', nrc: '452019/11/1', school: 'Kansanshi Secondary School', oLevels: 'Eng: 2, Math: 2, Bio: 1, Sci: 2, Rel: 2' },
    { num: 'NWU-APP-2026-00115', fn: 'Memory', ln: 'Musonda', prog: 'Diploma in Pharmacy Technology', status: AdmissionApplicationStatus.ENROLLED, intake: 'January 2026', nrc: '512039/10/1', school: 'Ndola Girls National Technical', oLevels: 'Eng: 1, Math: 1, Bio: 1, Sci: 1, Che: 2' },
    { num: 'NWU-APP-2026-00116', fn: 'Dalitso', ln: 'Mwanza', prog: 'Diploma in Clinical Medicine', status: AdmissionApplicationStatus.WAITLISTED, intake: 'January 2026', nrc: '372019/64/1', school: 'Kavungu Day Secondary', oLevels: 'Eng: 3, Math: 3, Bio: 3, Sci: 3, Geo: 3' },
    { num: 'NWU-APP-2026-00117', fn: 'Mapalo', ln: 'Zimba', prog: 'Diploma in Registered Nursing', status: AdmissionApplicationStatus.REJECTED, intake: 'January 2026', nrc: '431029/11/1', school: 'Lumwana Community Secondary', oLevels: 'Eng: 4, Math: 7, Bio: 4, Sci: 6, Civ: 4' },
    { num: 'NWU-APP-2026-00118', fn: 'Chisomo', ln: 'Sakala', prog: 'Bachelor of Science in Nursing', status: AdmissionApplicationStatus.INTERVIEW_PENDING, intake: 'January 2026', nrc: '542019/10/1', school: 'Hillcrest National Technical School', oLevels: 'Eng: 1, Math: 1, Bio: 1, Sci: 1, Phy: 1' },
  ];

  for (const app of applicantScenarios) {
    const existing = await prisma.admissionApplication.findUnique({
      where: { organisationId_applicationNumber: { organisationId: organisation.id, applicationNumber: app.num } },
    });
    if (!existing) {
      const createdApp = await prisma.admissionApplication.create({
        data: {
          organisationId: organisation.id,
          applicationNumber: app.num,
          firstName: app.fn,
          lastName: app.ln,
          email: `${app.fn.toLowerCase()}.${app.ln.toLowerCase()}@gmail.com`,
          phone: '+260977' + String(Math.floor(100000 + Math.random() * 900000)),
          programmeChoice: app.prog,
          intakeLabel: app.intake,
          status: app.status,
          dateOfBirth: new Date('2003-04-18T00:00:00.000Z'),
          submittedAt: new Date('2025-11-20T00:00:00.000Z'),
          decisionAt: app.status === AdmissionApplicationStatus.OFFERED || app.status === AdmissionApplicationStatus.ENROLLED || app.status === AdmissionApplicationStatus.ACCEPTED ? new Date('2025-12-15T00:00:00.000Z') : null,
        },
      });

      await prisma.admissionStatusHistory.create({
        data: {
          organisationId: organisation.id,
          applicationId: createdApp.id,
          toStatus: app.status,
          changedByUserId: userMap.get(SystemRole.ADMISSIONS_OFFICER).id,
          reason: `Applicant status set to ${app.status} during intake processing. NRC: ${app.nrc}. O-Levels: ${app.oLevels}. School: ${app.school}.`,
          metadataJson: JSON.stringify({
            nrc: app.nrc,
            school: app.school,
            oLevels: app.oLevels,
            council: app.prog.includes('Nursing') ? 'NMCZ' : app.prog.includes('Clinical') ? 'HPCZ' : 'HPCZ',
          }),
        },
      });
    }
  }

  // 13. ENROLLED STUDENTS (Learners)
  const studentSpecs = [
    { stuNum: 'NWU-2026-0001', fn: 'Chilufya', ln: 'Banda', gender: Gender.FEMALE, progCode: 'DRN', cohort: rnCohort, nmcz: 'NMCZ/RN/2026/0142' },
    { stuNum: 'NWU-2026-0002', fn: 'Emmanuel', ln: 'Sichone', gender: Gender.MALE, progCode: 'DCM', cohort: cmCohort, hpcz: 'HPCZ/CM/2026/0088' },
    { stuNum: 'NWU-2026-0003', fn: 'Grace', ln: 'Mwape', gender: Gender.FEMALE, progCode: 'DRN', cohort: rnCohort, nmcz: 'NMCZ/RN/2026/0143' },
    { stuNum: 'NWU-2026-0004', fn: 'Brian', ln: 'Mulenga', gender: Gender.MALE, progCode: 'DCM', cohort: cmCohort, hpcz: 'HPCZ/CM/2026/0089' },
    { stuNum: 'NWU-2026-0005', fn: 'Esther', ln: 'Lungu', gender: Gender.FEMALE, progCode: 'DRN', cohort: rnCohort, nmcz: 'NMCZ/RN/2026/0144' },
  ];

  const studentMap = new Map<string, any>();
  for (const s of studentSpecs) {
    const student = await prisma.learner.upsert({
      where: { organisationId_studentNumber: { organisationId: organisation.id, studentNumber: s.stuNum } },
      update: { campusId: mainCampus.id },
      create: {
        organisationId: organisation.id,
        campusId: mainCampus.id,
        studentNumber: s.stuNum,
        firstName: s.fn,
        lastName: s.ln,
        gender: s.gender,
        dateOfBirth: new Date('2003-08-22T00:00:00.000Z'),
        birthCertificateNo: 'BC-2003-89102',
        nationality: 'Zambian',
        status: LearnerStatus.ENROLLED,
        admissionDate: new Date('2026-01-05T00:00:00.000Z'),
        residentialArea: 'Manyama Campus Quarters',
        emergencyContact: `${s.ln} Senior (+260977889900)`,
      },
    });
    studentMap.set(s.stuNum, student);

    // Link Regulatory Indexing
    if (s.nmcz) {
      await prisma.regulatoryIndexing.upsert({
        where: { learnerId: student.id },
        update: { indexNumber: s.nmcz, status: IndexingStatus.INDEXED },
        create: {
          organisationId: organisation.id,
          learnerId: student.id,
          programmeId: progMap.get(s.progCode).id,
          council: CouncilType.NMCZ,
          indexNumber: s.nmcz,
          status: IndexingStatus.INDEXED,
          submissionDate: new Date('2026-01-10T00:00:00.000Z'),
          indexedDate: new Date('2026-02-01T00:00:00.000Z'),
          documentsVerified: true,
          verifiedById: userMap.get(SystemRole.REGISTRAR).id,
        },
      });
    } else if (s.hpcz) {
      await prisma.regulatoryIndexing.upsert({
        where: { learnerId: student.id },
        update: { indexNumber: s.hpcz, status: IndexingStatus.INDEXED },
        create: {
          organisationId: organisation.id,
          learnerId: student.id,
          programmeId: progMap.get(s.progCode).id,
          council: CouncilType.HPCZ,
          indexNumber: s.hpcz,
          status: IndexingStatus.INDEXED,
          submissionDate: new Date('2026-01-12T00:00:00.000Z'),
          indexedDate: new Date('2026-02-05T00:00:00.000Z'),
          documentsVerified: true,
          verifiedById: userMap.get(SystemRole.REGISTRAR).id,
        },
      });
    }

    // Register Courses for Semester 1
    const coursesToRegister = s.progCode === 'DRN'
      ? ['NUR-111', 'NUR-112', 'NUR-113']
      : ['MED-111', 'MED-112'];

    for (const cCode of coursesToRegister) {
      const cMod = courseMap.get(cCode);
      await prisma.courseRegistration.upsert({
        where: { learnerId_courseModuleId: { learnerId: student.id, courseModuleId: cMod.id } },
        update: {},
        create: {
          learnerId: student.id,
          courseModuleId: cMod.id,
          semesterNumber: 1,
          status: 'REGISTERED',
          continuousScore: 32.5,
          examScore: 48.0,
          finalScore: 80.5,
          finalGrade: 'A',
          isApproved: true,
        },
      });
    }
  }

  // 14. CLINICAL PLACEMENTS & DE-IDENTIFIED LOGBOOK ENTRIES
  const student1 = studentMap.get('NWU-2026-0001');
  const placement1 = await prisma.clinicalPlacement.upsert({
    where: { id: 'plc-chilufya-solwezi-gen' },
    update: {},
    create: {
      id: 'plc-chilufya-solwezi-gen',
      organisationId: organisation.id,
      learnerId: student1.id,
      clinicalSiteId: siteMap.get('SOL-GEN').id,
      wardOrDept: 'Female Surgical & Paediatrics Ward',
      startDate: new Date('2026-02-15T00:00:00.000Z'),
      endDate: new Date('2026-04-10T00:00:00.000Z'),
      status: PlacementStatus.ACTIVE,
      totalHoursTarget: 160,
      hoursCompleted: 96,
      supervisorRemarks: 'Student displays strong clinical empathy and infection control mastery.',
    },
  });

  const rotation1 = await prisma.clinicalRotation.upsert({
    where: { id: 'rot-paeds-triage-01' },
    update: {},
    create: {
      id: 'rot-paeds-triage-01',
      placementId: placement1.id,
      supervisorId: supervisorAgnes.id,
      rotationName: 'Paediatric In-patient Triage and Ward Rounds',
      startDate: new Date('2026-02-15T00:00:00.000Z'),
      endDate: new Date('2026-03-15T00:00:00.000Z'),
      requiredProcedures: 15,
      completedProcedures: 12,
    },
  });

  // De-identified Clinical Logbook Entry (ZERO patient PII)
  await prisma.clinicalLogbookEntry.upsert({
    where: { id: 'logbook-entry-001' },
    update: {},
    create: {
      id: 'logbook-entry-001',
      learnerId: student1.id,
      placementId: placement1.id,
      rotationId: rotation1.id,
      procedureCategory: 'Wound Dressing & Aseptic Technique',
      caseSummaryDeidentified: 'Female child (approx 6 yrs), post-appendectomy day 3. Performed aseptic wound inspection and sterile saline dressing change under supervision.',
      hoursLogged: 4.0,
      procedureDate: new Date('2026-03-02T10:00:00.000Z'),
      competencySelfRating: 'PERFORMED_UNDER_SUPERVISION',
      isSupervisorSigned: true,
      supervisorId: supervisorAgnes.id,
      supervisorSignedAt: new Date('2026-03-02T16:00:00.000Z'),
      supervisorFeedback: 'Excellent aseptic field maintenance and patient reassurance.',
    },
  });

  // Competency Assessment
  await prisma.competencyAssessment.upsert({
    where: { id: 'comp-aseptic-chilufya' },
    update: {},
    create: {
      id: 'comp-aseptic-chilufya',
      learnerId: student1.id,
      procedureName: 'Aseptic Technique & Surgical Scrubbing',
      level: CompetencyLevel.COMPETENT,
      attemptsCount: 2,
      evaluatedById: userMap.get(SystemRole.CLINICAL_SUPERVISOR).id,
      evaluatorRemarks: 'Passed all 12 criteria on NMCZ clinical observation checklist.',
      isPassed: true,
    },
  });

  // 15. FEE INVOICING, LAMTONPAY MOBILE MONEY & DOUBLE-ENTRY FINANCIAL LEDGER
  const invChilufya = await prisma.invoice.upsert({
    where: { organisationId_invoiceNumber: { organisationId: organisation.id, invoiceNumber: 'INV-2026-0001' } },
    update: {},
    create: {
      organisationId: organisation.id,
      learnerId: student1.id,
      termId: sem1.id,
      invoiceNumber: 'INV-2026-0001',
      totalAmount: 9500.00, // Tuition K6,500 + Clinical K1,800 + Bus K1,200
      paidAmount: 9500.00,
      balance: 0.00,
      status: InvoiceStatus.PAID,
      dueDate: new Date('2026-02-28T00:00:00.000Z'),
      lines: {
        create: [
          { category: FeeCategory.TUITION, description: 'Diploma in Registered Nursing Tuition (Sem 1)', unitPrice: 6500.00, quantity: 1, lineTotal: 6500.00 },
          { category: FeeCategory.OTHER, description: 'Clinical Ward & Hospital Preceptorship Fee', unitPrice: 1800.00, quantity: 1, lineTotal: 1800.00 },
          { category: FeeCategory.TRANSPORT, description: 'Manyama - Lumwana Route Bus Subscription', unitPrice: 1200.00, quantity: 1, lineTotal: 1200.00 },
        ],
      },
    },
  });

  const payChilufya = await prisma.payment.upsert({
    where: { organisationId_paymentNumber: { organisationId: organisation.id, paymentNumber: 'PAY-2026-0001' } },
    update: {},
    create: {
      organisationId: organisation.id,
      learnerId: student1.id,
      paymentNumber: 'PAY-2026-0001',
      amount: 9500.00,
      paymentMethod: PaymentMethod.MTN_MONEY,
      referenceNumber: 'MTN-ZM-TXN-89410294',
      recordedById: userMap.get(SystemRole.CASHIER).id,
      notes: 'Paid via LamtonPay Connect MTN MoMo collection.',
      allocations: {
        create: {
          invoiceId: invChilufya.id,
          allocatedAmount: 9500.00,
        },
      },
    },
  });

  await prisma.receipt.upsert({
    where: { paymentId: payChilufya.id },
    update: {},
    create: {
      organisationId: organisation.id,
      paymentId: payChilufya.id,
      receiptNumber: 'REC-2026-0001',
      amount: 9500.00,
      issuedAt: new Date('2026-01-15T11:30:00.000Z'),
    },
  });

  // Double-Entry Ledger Posting for Chilufya
  await prisma.ledgerEntry.createMany({
    data: [
      {
        organisationId: organisation.id,
        learnerId: student1.id,
        invoiceId: invChilufya.id,
        entryType: LedgerEntryType.DEBIT_CHARGE,
        amount: 9500.00,
        balanceAfter: 9500.00,
        description: 'Semester 1 Fees Invoiced (Tuition, Clinical, Transport)',
        postedById: userMap.get(SystemRole.BURSAR).id,
        postedAt: new Date('2026-01-05T09:00:00.000Z'),
      },
      {
        organisationId: organisation.id,
        learnerId: student1.id,
        paymentId: payChilufya.id,
        entryType: LedgerEntryType.CREDIT_PAYMENT,
        amount: 9500.00,
        balanceAfter: 0.00,
        description: 'Verified LamtonPay MTN MoMo Payment Received (Ref: MTN-ZM-TXN-89410294)',
        postedById: userMap.get(SystemRole.CASHIER).id,
        postedAt: new Date('2026-01-15T11:30:00.000Z'),
      },
    ],
  });

  // LamtonPay Payment Intent & Provider Transaction Record
  const intent1 = await prisma.paymentIntent.upsert({
    where: { idempotencyKey: 'lp-idem-nwu-001' },
    update: {},
    create: {
      organisationId: organisation.id,
      learnerId: student1.id,
      invoiceId: invChilufya.id,
      channel: PaymentChannel.MTN_MOMO,
      status: PaymentIntentStatus.CONFIRMED,
      amountZMW: 9500.00,
      payerPhone: '0966412890',
      payerName: 'Chilufya Banda',
      businessReference: 'LP-NWU-2026-0001',
      idempotencyKey: 'lp-idem-nwu-001',
      providerReference: 'MTN-ZM-TXN-89410294',
      expiresAt: new Date('2026-01-15T12:00:00.000Z'),
      settledAt: new Date('2026-01-15T11:30:00.000Z'),
      reconciledAt: new Date('2026-01-16T17:00:00.000Z'),
    },
  });

  await prisma.providerTransaction.create({
    data: {
      paymentIntentId: intent1.id,
      providerCode: 'MTN_MOMO_ZM',
      providerTxId: 'MTN-ZM-TXN-89410294',
      httpStatus: 200,
      status: 'SUCCESS',
      isVerified: true,
      verifiedAt: new Date('2026-01-15T11:30:00.000Z'),
      responsePayload: JSON.stringify({ status: 'SUCCESSFUL', currency: 'ZMW', amount: '9500.00', externalId: 'LP-NWU-2026-0001' }),
    },
  });

  // 16. AUTOMATIC SERVICE ENTITLEMENTS (Verified Payment Triggered)
  await prisma.studentEntitlement.upsert({
    where: { learnerId_serviceType: { learnerId: student1.id, serviceType: ServiceEntitlementType.BUS_TRANSPORT } },
    update: { status: EntitlementStatus.ACTIVE },
    create: {
      learnerId: student1.id,
      serviceType: ServiceEntitlementType.BUS_TRANSPORT,
      status: EntitlementStatus.ACTIVE,
      grantedByPolicy: 'TRANSPORT_FEE_FULLY_PAID',
      validFrom: new Date('2026-01-05T00:00:00.000Z'),
      validUntil: new Date('2026-05-30T23:59:59.000Z'),
    },
  });

  await prisma.studentEntitlement.upsert({
    where: { learnerId_serviceType: { learnerId: student1.id, serviceType: ServiceEntitlementType.LIBRARY_LOAN } },
    update: { status: EntitlementStatus.ACTIVE },
    create: {
      learnerId: student1.id,
      serviceType: ServiceEntitlementType.LIBRARY_LOAN,
      status: EntitlementStatus.ACTIVE,
      grantedByPolicy: 'TUITION_CLEARED_OVER_75_PERCENT',
      validFrom: new Date('2026-01-05T00:00:00.000Z'),
      validUntil: new Date('2026-05-30T23:59:59.000Z'),
    },
  });

  await prisma.studentEntitlement.upsert({
    where: { learnerId_serviceType: { learnerId: student1.id, serviceType: ServiceEntitlementType.CAMPUS_GATE } },
    update: { status: EntitlementStatus.ACTIVE },
    create: {
      learnerId: student1.id,
      serviceType: ServiceEntitlementType.CAMPUS_GATE,
      status: EntitlementStatus.ACTIVE,
      grantedByPolicy: 'REGISTERED_STUDENT_PASSCARD',
      isSafetyExempt: true, // Emergency egress NEVER blocked
      validFrom: new Date('2026-01-05T00:00:00.000Z'),
      validUntil: new Date('2026-12-31T23:59:59.000Z'),
    },
  });

  // 17. HOSTELS, ROOMS & BED ALLOCATION
  const hostelNightingale = await prisma.hostelBuilding.upsert({
    where: { id: 'hostel-nightingale' },
    update: {},
    create: {
      id: 'hostel-nightingale',
      campusId: mainCampus.id,
      name: 'Florence Nightingale Residence',
      genderPolicy: HostelGenderPolicy.FEMALE_ONLY,
      totalRooms: 20,
      totalBeds: 80,
      wardenName: 'Mrs. Racheal Chongo',
      wardenPhone: '+260977550011',
      feePerSemesterZMW: 2200.00,
    },
  });

  const room101 = await prisma.hostelRoom.upsert({
    where: { buildingId_roomNumber: { buildingId: hostelNightingale.id, roomNumber: '101' } },
    update: {},
    create: {
      buildingId: hostelNightingale.id,
      roomNumber: '101',
      floor: 1,
      capacityBeds: 4,
      currentOccupancy: 1,
    },
  });

  const bed1 = await prisma.hostelBed.upsert({
    where: { roomId_bedNumber: { roomId: room101.id, bedNumber: 'Bed 1' } },
    update: { isOccupied: true, currentLearnerId: student1.id },
    create: {
      roomId: room101.id,
      bedNumber: 'Bed 1',
      isOccupied: true,
      currentLearnerId: student1.id,
    },
  });

  await prisma.hostelAllocation.create({
    data: {
      bedId: bed1.id,
      learnerId: student1.id,
      academicYear: '2026',
      semesterNumber: 1,
      isApproved: true,
      checkInDate: new Date('2026-01-04T00:00:00.000Z'),
    },
  });

  // 18. TRANSPORT ROUTE & STUDENT PASS
  const transportRoute = await prisma.transportRoute.upsert({
    where: { organisationId_routeCode: { organisationId: organisation.id, routeCode: 'BUS-NWU-01' } },
    update: {},
    create: {
      organisationId: organisation.id,
      campusId: mainCampus.id,
      routeCode: 'BUS-NWU-01',
      routeName: 'Manyama Main Gate — Lumwana Town — Hospital Annex',
      vehicleReg: 'BAR 5821 ZM',
      driverName: 'Mr. Peter Mwewa',
      driverPhone: '+260977661122',
      capacity: 35,
      fareZMW: 1200.00,
      isActive: true,
    },
  });

  await prisma.transportSubscription.upsert({
    where: { learnerId_termId: { learnerId: student1.id, termId: sem1.id } },
    update: { status: 'ACTIVE' },
    create: {
      learnerId: student1.id,
      routeId: transportRoute.id,
      termId: sem1.id,
      passQrCode: `NWU-BUS-PASS-2026-${student1.studentNumber}-HASH892`,
      status: 'ACTIVE',
      validFrom: new Date('2026-01-05T00:00:00.000Z'),
      validUntil: new Date('2026-05-30T23:59:59.000Z'),
    },
  });

  // 19. LIBRARY BOOKS & ACTIVE STUDENT LOAN
  const libBook1 = await prisma.libraryBook.upsert({
    where: { id: 'book-brunner-nursing' },
    update: { availableCopies: 4 },
    create: {
      id: 'book-brunner-nursing',
      organisationId: organisation.id,
      isbn: '978-1496347992',
      title: "Brunner & Suddarth's Textbook of Medical-Surgical Nursing (14th Ed)",
      author: 'Janice L. Hinkle & Kerry H. Cheever',
      category: 'NURSING',
      shelfLocation: 'Shelf N-04',
      totalCopies: 5,
      availableCopies: 4,
    },
  });

  await prisma.libraryLoan.create({
    data: {
      bookId: libBook1.id,
      learnerId: student1.id,
      borrowedDate: new Date('2026-02-10T14:00:00.000Z'),
      dueDate: new Date('2026-02-24T17:00:00.000Z'),
      isReturned: false,
      issuedById: staffMap.get('NWU-STF-001').id,
    },
  });

  // 20. PROCESSED & LOCKED MONTHLY PAYROLL RUN (Zambia 2026 Calculations)
  const payrollOct = await prisma.payrollRun.upsert({
    where: { organisationId_periodMonth_periodYear: { organisationId: organisation.id, periodMonth: 10, periodYear: 2026 } },
    update: {},
    create: {
      organisationId: organisation.id,
      periodName: 'October 2026',
      periodMonth: 10,
      periodYear: 2026,
      status: PayrollStatus.APPROVED_LOCKED,
      totalGrossZMW: 154200.00,
      totalNetZMW: 110450.00,
      totalPayeZMW: 26840.00,
      totalNapsaEmpZMW: 7710.00,
      totalNapsaEmployerZMW: 7710.00,
      totalWcfcbEmployerZMW: 3855.00,
      preparedById: userMap.get(SystemRole.PAYROLL_PREPARER).id,
      reviewedById: userMap.get(SystemRole.BURSAR).id,
      approvedById: userMap.get(SystemRole.PAYROLL_APPROVER).id,
      isLocked: true,
      lockedAt: new Date('2026-10-22T16:00:00.000Z'),
    },
  });

  // Individual payroll lines & payslips
  for (const [staffNum, staff] of Array.from(staffMap.entries())) {
    const contract = await prisma.staffContract.findUnique({ where: { staffId: staff.id } });
    if (!contract) continue;

    const basic = Number(contract.basicSalaryZMW);
    const allowances = Number(contract.housingAllowance) + Number(contract.transportAllowance) + Number(contract.clinicalAllowance);
    const gross = basic + allowances;

    // NAPSA 5% capped at K1,493.40
    const napsa = Math.min(gross * 0.05, 1493.40);

    // Progressive PAYE 2026
    let paye = 0;
    const taxable = gross - napsa;
    if (taxable > 9200) {
      paye += (taxable - 9200) * 0.37;
      paye += (9200 - 7100) * 0.30;
      paye += (7100 - 5100) * 0.20;
    } else if (taxable > 7100) {
      paye += (taxable - 7100) * 0.30;
      paye += (7100 - 5100) * 0.20;
    } else if (taxable > 5100) {
      paye += (taxable - 5100) * 0.20;
    }

    const net = gross - paye - napsa;
    const wcfcb = gross * 0.025; // 2.5% employer cost only

    const line = await prisma.payrollRunLine.upsert({
      where: { payrollRunId_staffId: { payrollRunId: payrollOct.id, staffId: staff.id } },
      update: {},
      create: {
        payrollRunId: payrollOct.id,
        staffId: staff.id,
        basicSalaryZMW: basic,
        totalAllowancesZMW: allowances,
        grossPayZMW: gross,
        payeDeductionZMW: paye,
        napsaEmployeeZMW: napsa,
        netPayZMW: net,
        napsaEmployerZMW: napsa,
        wcfcbEmployerZMW: wcfcb,
        isDisbursed: true,
      },
    });

    await prisma.paySlip.upsert({
      where: { payrollRunLineId: line.id },
      update: {},
      create: {
        payrollRunLineId: line.id,
        slipNumber: `PS-2026-10-${staffNum}`,
        breakdownJson: JSON.stringify({
          staffName: `${staff.firstName} ${staff.lastName}`,
          jobTitle: staff.jobTitle,
          basicSalary: basic.toFixed(2),
          housingAllowance: Number(contract.housingAllowance).toFixed(2),
          transportAllowance: Number(contract.transportAllowance).toFixed(2),
          clinicalAllowance: Number(contract.clinicalAllowance).toFixed(2),
          grossPay: gross.toFixed(2),
          deductions: {
            payeTax: paye.toFixed(2),
            napsaPension: napsa.toFixed(2),
          },
          netTakeHomePay: net.toFixed(2),
          employerContributions: {
            napsaEmployer: napsa.toFixed(2),
            wcfcbEmployerAssessment: wcfcb.toFixed(2),
          },
        }),
      },
    });
  }

  // Statutory Filing Evidence
  await prisma.statutoryFilingEvidence.createMany({
    data: [
      {
        payrollRunId: payrollOct.id,
        authority: StatutoryAuthority.ZRA_PAYE,
        submissionType: 'ZRA_TAXONLINE_CSV',
        referenceNumber: 'PRN-ZRA-2026-10-849102',
        remittedAmountZMW: 26840.00,
        filingDate: new Date('2026-10-23T14:30:00.000Z'),
        verifiedById: userMap.get(SystemRole.BURSAR).id,
      },
      {
        payrollRunId: payrollOct.id,
        authority: StatutoryAuthority.NAPSA,
        submissionType: 'ENAPSA_RETURN_FILE',
        referenceNumber: 'NAPSA-REC-2026-10-41029',
        remittedAmountZMW: 15420.00, // Emp + Employer
        filingDate: new Date('2026-10-23T15:00:00.000Z'),
        verifiedById: userMap.get(SystemRole.BURSAR).id,
      },
      {
        payrollRunId: payrollOct.id,
        authority: StatutoryAuthority.WCFCB,
        submissionType: 'WCFCB_DECLARATION',
        referenceNumber: 'WCFCB-ASSESS-2026-39182',
        remittedAmountZMW: 3855.00,
        filingDate: new Date('2026-10-23T15:30:00.000Z'),
        verifiedById: userMap.get(SystemRole.BURSAR).id,
      },
    ],
  });

  // 21. MODULE WORKSPACE RECORDS (Audited module status records)
  const workspaces = [
    ['admissions', '2026 Academic Admissions Cycle', 'VERIFIED_FUNCTIONAL', 'Active online admissions: 5 candidates processed through multi-step review, screening, and enrolment.'],
    ['academics', 'Higher Education Curriculum & Courses', 'VERIFIED_FUNCTIONAL', 'Registered Nursing, Clinical Medicine, and Pharmacy curriculum versions with module registrations.'],
    ['clinical', 'Clinical Preceptorship & Logbook System', 'VERIFIED_FUNCTIONAL', '3 approved clinical sites, de-identified electronic logbooks, supervisor sign-offs, and OSCE rubrics.'],
    ['finance', 'Double-Entry Student Accounts & Collections', 'VERIFIED_FUNCTIONAL', 'Balanced ledger entries, sequential receipts, and student account statements.'],
    ['payments', 'LamtonPay Connect Payment Orchestration', 'VERIFIED_FUNCTIONAL', 'MTN MoMo and Airtel Money collection adapters, idempotent webhooks, and settlement batches.'],
    ['payroll', 'Zambia Statutory Payroll Engine (2026)', 'VERIFIED_FUNCTIONAL', 'Effective-dated ZRA PAYE progressive bands, NAPSA 5% capped, WCFCB employer-only assessment, and payslips.'],
    ['entitlements', 'Verified Service Entitlement Engine', 'VERIFIED_FUNCTIONAL', 'Automatic activation of bus passes, hostel access, library loans, and gate credentials upon verified payment.'],
    ['operations', 'Hostels, Transport & Facilities Management', 'VERIFIED_FUNCTIONAL', 'Room 101 occupied at Florence Nightingale Residence; Bus 01 scheduled on Manyama-Lumwana route.'],
  ] as const;

  for (const [slug, title, status, summary] of workspaces) {
    await prisma.moduleWorkspaceRecord.upsert({
      where: { organisationId_moduleSlug_title: { organisationId: organisation.id, moduleSlug: slug, title } },
      update: { status, summary, metadataJson: JSON.stringify({ seededAt: new Date().toISOString(), live: true }) },
      create: { organisationId: organisation.id, moduleSlug: slug, title, status, summary, metadataJson: JSON.stringify({ seededAt: new Date().toISOString(), live: true }) },
    });
  }

  // 22. AUDIT TRAIL
  await prisma.auditEvent.create({
    data: {
      organisationId: organisation.id,
      userId: userMap.get(SystemRole.INSTITUTION_ADMIN).id,
      action: 'NWUCHAS_ENTERPRISE_SYSTEM_SEEDED',
      entityType: 'Organisation',
      entityId: organisation.id,
      detailsJson: JSON.stringify({
        institution: 'NWUCHAS',
        campuses: ['MAIN', 'SOL-ANNEX'],
        programmesSeeded: 4,
        studentsSeeded: studentSpecs.length,
        payrollRunLocked: 'October 2026',
        clinicalSites: 3,
      }),
    },
  });

  console.log('=== NWUCHAS Comprehensive Enterprise Seeding Completed Successfully! ===');
  console.log(`Development Administrator Login: principal@nwuchas.edu.zm`);
  console.log(`Password: ${DEV_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
