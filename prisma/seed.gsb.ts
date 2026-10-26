import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '@prisma/client';

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();

async function main() {
  console.log('=== Seeding Clean Government Service Bus (GSB) Records ===');

  const organisation =
    (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } })) ||
    (await prisma.organisation.findFirst());

  if (!organisation) {
    throw new Error('NWUCHAS organisation not found in database.');
  }

  const orgId = organisation.id;

  // 1. ASSET REGISTER (10 Seeded Assets)
  const assets = [
    {
      id: 'ast-1',
      tag: 'NWU-PWR-001',
      name: '250kVA Standby Diesel Generator (Perkins + DeepSea AMF)',
      category: 'POWER',
      location: 'Main Powerhouse, Manyama Campus',
      custodian: 'Eng. Patrick Banda (Facilities Mgr)',
      acquisitionDate: '15/01/2024',
      valueZmw: 680000,
      status: 'EXCELLENT',
      lastServiced: '10/10/2026',
      nextService: '10/01/2027',
      notes: 'Automatic mains failure switchover. 1,200L underground diesel reserve tested weekly.',
      serialNumber: 'PK-250-8492-ZM',
      supplier: 'Barloworld Power Zambia',
    },
    {
      id: 'ast-2',
      tag: 'NWU-WTR-001',
      name: 'Solar Borehole & Industrial UV Filtration (20,000L)',
      category: 'UTILITY',
      location: 'Water Treatment Reserve, Manyama',
      custodian: 'Facilities Maintenance Unit',
      acquisitionDate: '20/03/2024',
      valueZmw: 245000,
      status: 'EXCELLENT',
      lastServiced: '01/10/2026',
      nextService: '01/12/2026',
      notes: '12x 540W solar array + Grundfos DC pump. Potable water laboratory certified compliant.',
      serialNumber: 'GF-SQF-2024-08',
      supplier: 'Davis & Shirtliff Zambia',
    },
    {
      id: 'ast-3',
      tag: 'NWU-SIM-001',
      name: 'Laerdal SimMan 3G Advanced Patient Simulator',
      category: 'CLINICAL',
      location: 'Clinical Skills Simulation Lab A',
      custodian: 'Sr. Gertrude Mwape (Nursing Skills Lead)',
      acquisitionDate: '12/04/2024',
      valueZmw: 420000,
      status: 'OPERATIONAL',
      lastServiced: '15/09/2026',
      nextService: '15/12/2026',
      notes: 'Wireless telemetry, pupillary reaction, OSCE examinations, and trauma triage training.',
      serialNumber: 'LAER-3G-9921',
      supplier: 'Laerdal Medical South Africa',
    },
    {
      id: 'ast-4',
      tag: 'NWU-SIM-002',
      name: 'Gaumard Victoria High-Fidelity Neonatal Birthing Simulator',
      category: 'CLINICAL',
      location: 'Obstetrics Skills Simulation Suite',
      custodian: 'Sr. Beatrice Kalenga (Midwifery Preceptor)',
      acquisitionDate: '20/08/2024',
      valueZmw: 380000,
      status: 'OPERATIONAL',
      lastServiced: '20/08/2026',
      nextService: '20/11/2026',
      notes: 'Simulates normal delivery, breech, shoulder dystocia, and postpartum hemorrhage protocols.',
      serialNumber: 'GAUM-VIC-4812',
      supplier: 'Gaumard Scientific Ltd',
    },
    {
      id: 'ast-5',
      tag: 'NWU-SIM-003',
      name: 'Mindray DC-40 Portable Diagnostic Ultrasound Suite',
      category: 'CLINICAL',
      location: 'Clinical Medicine Diagnostic Lab',
      custodian: 'Dr. Joseph Kangwa (Clinical Medicine Head)',
      acquisitionDate: '05/02/2024',
      valueZmw: 195000,
      status: 'EXCELLENT',
      lastServiced: '05/08/2026',
      nextService: '05/02/2027',
      notes: 'Obstetric, abdominal, and vascular doppler probes. Battery backup for hospital rotations.',
      serialNumber: 'MDR-DC40-2024',
      supplier: 'Mindray Bio-Medical Electronics',
    },
    {
      id: 'ast-6',
      tag: 'NWU-ICT-001',
      name: 'Starlink Business Terminal & Campus Liquid Mesh (220 Mbps)',
      category: 'ICT',
      location: 'ICT Control Hub, Administration Wing',
      custodian: 'Mr. Lawrence Mukombo (ICT Admin)',
      acquisitionDate: '10/01/2024',
      valueZmw: 85000,
      status: 'EXCELLENT',
      lastServiced: '12/10/2026',
      nextService: '12/04/2027',
      notes: 'Provides high-speed dedicated corridor for online CBT testing, ZRA/NAPSA integrations.',
      serialNumber: 'SL-BIZ-2024-ZM',
      supplier: 'SpaceX / Paratus Zambia',
    },
    {
      id: 'ast-7',
      tag: 'NWU-ICT-002',
      name: '60-Seat CBT Thin-Client Examination Lab Cluster',
      category: 'ICT',
      location: 'CBT Examination Hall, Block B',
      custodian: 'Examinations Department',
      acquisitionDate: '14/05/2024',
      valueZmw: 310000,
      status: 'OPERATIONAL',
      lastServiced: '01/10/2026',
      nextService: '15/11/2026',
      notes: 'Isolated exam subnet. Biometric login and secure lockdown browser configured.',
      serialNumber: 'DELL-WYSE-60C',
      supplier: 'Dell Technologies Southern Africa',
    },
    {
      id: 'ast-8',
      tag: 'NWU-FLT-001',
      name: 'Toyota Coaster 30-Seater Campus Shuttle (BAA 2914)',
      category: 'FLEET',
      location: 'Campus Motor Pool',
      custodian: 'Transport Coordinator (Mr. J. Sakala)',
      acquisitionDate: '22/03/2024',
      valueZmw: 540000,
      status: 'OPERATIONAL',
      lastServiced: '18/09/2026',
      nextService: '18/11/2026',
      notes: 'Lumwana-Manyama-Solwezi hospital rotation route. GPS tracking and QR card reader active.',
      serialNumber: 'TOY-COAST-2914',
      supplier: 'Toyota Zambia Ltd',
    },
    {
      id: 'ast-9',
      tag: 'NWU-FLT-002',
      name: 'Toyota Land Cruiser Basic Life Support Ambulance (BLK 4012)',
      category: 'FLEET',
      location: 'Health Centre Rapid Response Bay',
      custodian: 'Campus Health Services',
      acquisitionDate: '18/07/2024',
      valueZmw: 620000,
      status: 'OPERATIONAL',
      lastServiced: '25/08/2026',
      nextService: '25/11/2026',
      notes: 'Equipped with oxygen delivery, AED defibrillator, spine board, and emergency suction unit.',
      serialNumber: 'TLC-79-AMB-4012',
      supplier: 'Toyota Zambia Ltd',
    },
    {
      id: 'ast-10',
      tag: 'NWU-FAC-001',
      name: 'Tuttnauer 85L Horizontal Medical Autoclave Sterilizer',
      category: 'FACILITY',
      location: 'Central Sterile Services Department (CSSD)',
      custodian: 'Infection Prevention Committee',
      acquisitionDate: '11/06/2024',
      valueZmw: 165000,
      status: 'OPERATIONAL',
      lastServiced: '04/10/2026',
      nextService: '04/01/2027',
      notes: 'Steam vacuum sterilization for clinical surgical packs, dental trays, and OSCE kits.',
      serialNumber: 'TUTT-85L-6401',
      supplier: 'Surgical Equipment Supplies Lusaka',
    },
  ];

  for (const a of assets) {
    await prisma.moduleWorkspaceRecord.upsert({
      where: {
        organisationId_moduleSlug_title: {
          organisationId: orgId,
          moduleSlug: 'assets',
          title: `${a.tag} — ${a.name}`,
        },
      },
      update: {
        status: a.status,
        summary: a.notes,
        metadataJson: JSON.stringify(a),
      },
      create: {
        organisationId: orgId,
        moduleSlug: 'assets',
        title: `${a.tag} — ${a.name}`,
        status: a.status,
        summary: a.notes,
        metadataJson: JSON.stringify(a),
      },
    });
  }

  // 2. COMMUNICATIONS / OFFICIAL DIRECTIVES (4 Seeded Circulars)
  const circulars = [
    {
      id: 'cir-1',
      reference: 'NWU/CIR/2026/011',
      title: 'Mandatory NMCZ Student Indexing Verification & Document Submission Deadline',
      targetAudience: 'Year 1 Nursing & Midwifery Learners (RN-2026-JAN)',
      channel: 'OFFICIAL_MEMO',
      dateIssued: '18/10/2026',
      status: 'DISPATCHED',
      recipientsCount: 185,
      content:
        'All newly enrolled Diploma in Registered Nursing learners must submit certified copies of Grade 12 results (5 credits or better including English, Math, Science/Biology) and National Registration Card (NRC) to the Academic Registrar for formal indexing with the Nursing and Midwifery Council of Zambia (NMCZ). Deadline: Friday, 31st October 2026.',
      issuedBy: 'Academic Registrar & Council Liaison Directorate',
    },
    {
      id: 'cir-2',
      reference: 'NWU/CIR/2026/015',
      title: 'Semester 1 Clinical Placement Rotations — Solwezi General Hospital Attachment',
      targetAudience: 'Year 2 Clinical Medicine & Nursing Cohorts',
      channel: 'SMS_WHATSAPP',
      dateIssued: '20/10/2026',
      status: 'DISPATCHED',
      recipientsCount: 510,
      content:
        'Solwezi General Hospital attachment commences Monday 03 November 2026. Uniform compliance: clean white clinical coat, NWUCHAS photo badge, and stethoscopes mandatory. Bus departs Manyama Campus at 06:15 AM sharp.',
      issuedBy: 'Clinical Practice Directorate',
    },
    {
      id: 'cir-3',
      reference: 'NWU/CIR/2026/016',
      title: 'Final Examination Clearance & 85% Roll-Call Policy Notice',
      targetAudience: 'All Registered Students (Campus-wide)',
      channel: 'PORTAL_NOTICE',
      dateIssued: '22/10/2026',
      status: 'PUBLISHED',
      recipientsCount: 420,
      content:
        'In strict compliance with Higher Education Authority (HEA) and Council standards, only learners with an aggregate lecture/ward attendance of at least 85% and a zero outstanding fee balance or approved bursary scheme will be issued digital exam hall entry tokens.',
      issuedBy: 'Office of the Registrar',
    },
    {
      id: 'cir-4',
      reference: 'NWU/CIR/2026/017',
      title: 'LamtonPay MTN & Airtel Money Collections Channel Integration Live',
      targetAudience: 'Students and Registered Sponsors/Guardians',
      channel: 'SMS_WHATSAPP',
      dateIssued: '24/10/2026',
      status: 'DISPATCHED',
      recipientsCount: 850,
      content:
        'Tuition and hostel fee payments can now be settled instantly via LamtonPay USSD Push. Use student admission number as reference. Official electronic receipts are posted automatically to the student ledger within 60 seconds.',
      issuedBy: 'Bursary & Student Accounts',
    },
  ];

  for (const c of circulars) {
    await prisma.moduleWorkspaceRecord.upsert({
      where: {
        organisationId_moduleSlug_title: {
          organisationId: orgId,
          moduleSlug: 'communications',
          title: `${c.reference} — ${c.title}`,
        },
      },
      update: {
        status: c.status,
        summary: c.content,
        metadataJson: JSON.stringify(c),
      },
      create: {
        organisationId: orgId,
        moduleSlug: 'communications',
        title: `${c.reference} — ${c.title}`,
        status: c.status,
        summary: c.content,
        metadataJson: JSON.stringify(c),
      },
    });

    // Also upsert into Notice table
    await prisma.notice.upsert({
      where: { id: `notice-${c.reference.replace(/\//g, '-')}` },
      update: {
        title: c.title,
        content: c.content,
        publishedAt: new Date(),
      },
      create: {
        id: `notice-${c.reference.replace(/\//g, '-')}`,
        organisationId: orgId,
        title: c.title,
        content: c.content,
        publishedAt: new Date(),
      },
    });
  }

  // 3. CONTROLLED DOCUMENTS & TEMPLATES (6 Seeded Documents)
  const documents = [
    {
      id: 'doc-1',
      reference: 'NWU-DOC-001',
      title: 'Provisional Admission & Acceptance Offer Letter (2026)',
      category: 'ADMISSIONS',
      authority: 'Office of the Academic Registrar',
      datePublished: '10/01/2026',
      version: 'v2.4',
      fileFormat: 'PDF',
      fileSize: '340 KB',
      summary:
        'Official admission offer containing student enrollment number, programme allocation, fee matrix, medical examination form, and statutory acceptance declaration.',
      templateContent:
        'NORTH WESTERN UNIVERSITY COLLEGE OF HEALTH AND APPLIED SCIENCES\nPROVISIONAL OFFER OF ADMISSION\nAcademic Session: 2026\nManyama Campus, North-Western Province, Zambia\n\nDear Candidate,\nWe are pleased to offer you provisional admission to the Diploma in Registered Nursing / Clinical Medicine programme...',
    },
    {
      id: 'doc-2',
      reference: 'NWU-DOC-002',
      title: 'NMCZ / HPCZ Statutory Student Indexing Verification Form',
      category: 'REGULATORY',
      authority: 'Council Indexing Liaison Office',
      datePublished: '14/01/2026',
      version: 'v1.8',
      fileFormat: 'PDF',
      fileSize: '410 KB',
      summary:
        'Official regulatory submission docket capturing ECZ Grade 12 statement of results, certified National Registration Card (NRC), birth certificate, and police finger-print clearances.',
      templateContent:
        'REPUBLIC OF ZAMBIA — STATUTORY INDEXING DOCKET\nNursing and Midwifery Council of Zambia (NMCZ) & Health Professions Council of Zambia (HPCZ)\n\nStudent Registry & Qualifications Verification Form...',
    },
    {
      id: 'doc-3',
      reference: 'NWU-DOC-003',
      title: 'Official Examination Clearance Slip & Hall Entry Docket',
      category: 'EXAMINATIONS',
      authority: 'Chief Examinations Invigilator',
      datePublished: '28/01/2026',
      version: 'v3.0',
      fileFormat: 'PDF',
      fileSize: '290 KB',
      summary:
        'Digital security hall entry pass verifying 85% attendance roll-call compliance, zero fee balance clearance from the Bursary, and CBT biometric verification barcode.',
      templateContent:
        'EXAMINATION CLEARANCE DOCKET\nNorth Western University College of Health and Applied Sciences\nCBT Examination Hall & OSCE Circuit Clearance...',
    },
    {
      id: 'doc-4',
      reference: 'NWU-DOC-004',
      title: 'Student Clinical Logbook & Preceptor Evaluation Dossier',
      category: 'CLINICAL',
      authority: 'Director of Clinical Practice',
      datePublished: '05/02/2026',
      version: 'v2.1',
      fileFormat: 'PDF',
      fileSize: '820 KB',
      summary:
        'Prescribed procedural logbook for hospital ward attachments: surgical scrubbing, IV cannulation, normal delivery management, catheterization, and post-operative monitoring sign-offs.',
      templateContent:
        'CLINICAL PRACTICE LOGBOOK\nSolwezi General Hospital & Manyama Rural Health Centre\nDe-Identified Clinical Skills Verification...',
    },
    {
      id: 'doc-5',
      reference: 'NWU-DOC-005',
      title: 'Official Academic Transcript & Statement of Results (Security Watermark)',
      category: 'ACADEMIC',
      authority: 'Academic Senate & Examinations Committee',
      datePublished: '12/02/2026',
      version: 'v2.0',
      fileFormat: 'PDF',
      fileSize: '510 KB',
      summary:
        'Formal certified transcript recording credit units, course grades, GPA, OSCE practical performance, clinical rotations completed, and official college seal.',
      templateContent:
        'OFFICIAL ACADEMIC TRANSCRIPT\nNORTH WESTERN UNIVERSITY COLLEGE OF HEALTH AND APPLIED SCIENCES\nCertified Statement of Results...',
    },
    {
      id: 'doc-6',
      reference: 'NWU-DOC-006',
      title: 'Standard Campus Tenancy & Hostel Accommodation Agreement',
      category: 'OPERATIONS',
      authority: 'Campus Operations & Dean of Students',
      datePublished: '18/02/2026',
      version: 'v1.5',
      fileFormat: 'PDF',
      fileSize: '220 KB',
      summary:
        'Binding residential agreement for hostel accommodation at Florence Nightingale and Albert Schweitzer halls, specifying room allocation rules, curfew policies, and utility services.',
      templateContent:
        'RESIDENTIAL HOSTEL ACCOMMODATION AGREEMENT\nManyama Campus Residences\nRules, Regulations, and Tenancy Conditions...',
    },
  ];

  for (const d of documents) {
    await prisma.moduleWorkspaceRecord.upsert({
      where: {
        organisationId_moduleSlug_title: {
          organisationId: orgId,
          moduleSlug: 'documents',
          title: `${d.reference} — ${d.title}`,
        },
      },
      update: {
        status: 'APPROVED',
        summary: d.summary,
        metadataJson: JSON.stringify(d),
      },
      create: {
        organisationId: orgId,
        moduleSlug: 'documents',
        title: `${d.reference} — ${d.title}`,
        status: 'APPROVED',
        summary: d.summary,
        metadataJson: JSON.stringify(d),
      },
    });
  }

  // 4. ACADEMIC CALENDAR EVENTS (8 Seeded Milestones)
  const calendarEvents = [
    {
      id: 'cal-1',
      title: 'Semester 1 Official Opening & Registration Verification',
      category: 'ACADEMIC',
      startDate: '12/01/2026',
      endDate: '16/01/2026',
      location: 'Main Auditorium, Manyama Campus',
      targetCohorts: 'All Registered Programmes',
      status: 'COMPLETED',
      description: 'Course enrollment validation, medical examination checks, and hostel room keys issuance.',
    },
    {
      id: 'cal-2',
      title: 'Pre-Clinical Simulation Lab Intensive & CPR Certification',
      category: 'CLINICAL',
      startDate: '19/01/2026',
      endDate: '30/01/2026',
      location: 'Clinical Skills Simulation Suite A & B',
      targetCohorts: 'Year 1 Nursing & Clinical Medicine',
      status: 'COMPLETED',
      description: 'Aseptic technique, basic life support, vital signs triage, and needle safety protocols.',
    },
    {
      id: 'cal-3',
      title: 'Continuous Assessment 1 (CA-1 Theory & Spot Tests - 15%)',
      category: 'EXAMINATION',
      startDate: '23/02/2026',
      endDate: '27/02/2026',
      location: 'CBT Exam Lab, Block B',
      targetCohorts: 'All Health Sciences Cohorts',
      status: 'COMPLETED',
      description: 'Mid-term computerized testing across Anatomy, Physiology, Microbiology, and Pharmacology.',
    },
    {
      id: 'cal-4',
      title: 'Hospital Ward Rotation Block 1 — Clinical Attachment',
      category: 'CLINICAL',
      startDate: '09/03/2026',
      endDate: '17/04/2026',
      location: 'Solwezi General Hospital & Manyama Rural Health Centre',
      targetCohorts: 'Year 2 & 3 Clinical Learners',
      status: 'COMPLETED',
      description: 'General medical/surgical inpatient care, pediatric ward rounds, and labor ward obstetrics.',
    },
    {
      id: 'cal-5',
      title: 'NMCZ & HPCZ Regulatory Professional Indexing Inspection',
      category: 'COUNCIL',
      startDate: '20/05/2026',
      endDate: '22/05/2026',
      location: 'Registrar Boardroom & Simulation Centre',
      targetCohorts: 'Year 1 Intake Indexing Batch',
      status: 'UPCOMING',
      description: 'Statutory verification of student entry qualifications, indexing quotas, and clinical logbooks.',
    },
    {
      id: 'cal-6',
      title: 'OSCE 8-Station Clinical Practical Circuit Examination',
      category: 'EXAMINATION',
      startDate: '08/06/2026',
      endDate: '12/06/2026',
      location: 'Solwezi Clinical Annex OSCE Circuit',
      targetCohorts: 'Final Year Registered Nursing & Clinical Medicine',
      status: 'UPCOMING',
      description: 'Standardized patient interactions, aseptic catheterization, neonatal resuscitation, and surgical stitching.',
    },
    {
      id: 'cal-7',
      title: 'Final Semester 1 Theory & CBT Examinations (60%)',
      category: 'EXAMINATION',
      startDate: '29/06/2026',
      endDate: '10/07/2026',
      location: 'Main Examination Hall & CBT Thin-Client Suite',
      targetCohorts: 'All Enrolled Students (85% Attendance Clearance)',
      status: 'UPCOMING',
      description: 'Official summative examinations administered under external chief invigilators.',
    },
    {
      id: 'cal-8',
      title: 'Semester 2 Commencement & Second Intake Registration',
      category: 'ACADEMIC',
      startDate: '10/08/2026',
      endDate: '14/08/2026',
      location: 'Manyama Campus & Clinical Facilities',
      targetCohorts: 'Continuing & July Intake Learners',
      status: 'UPCOMING',
      description: 'Orientation for July 2026 intake and resumption of clinical rotation modules.',
    },
  ];

  for (const cal of calendarEvents) {
    await prisma.moduleWorkspaceRecord.upsert({
      where: {
        organisationId_moduleSlug_title: {
          organisationId: orgId,
          moduleSlug: 'calendar',
          title: cal.title,
        },
      },
      update: {
        status: cal.status,
        summary: cal.description,
        metadataJson: JSON.stringify(cal),
      },
      create: {
        organisationId: orgId,
        moduleSlug: 'calendar',
        title: cal.title,
        status: cal.status,
        summary: cal.description,
        metadataJson: JSON.stringify(cal),
      },
    });
  }

  console.log('=== GSB Database Seeding Completed Successfully! ===');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
