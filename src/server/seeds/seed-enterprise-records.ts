// src/server/seeds/seed-enterprise-records.ts — Idempotent Enterprise Seeding for NWUCHAS
import { prisma } from '../db';
import { AssetCategory, AssetCondition, AssetStatus, OfficialDocStatus, OfficialDocType } from '@prisma/client';
import crypto from 'crypto';

export async function seedEnterpriseRecords() {
  console.log('[Seed] Initializing Enterprise Records Seeding for NWUCHAS...');

  const org = await prisma.organisation.findFirst({
    where: { code: 'NWUCHAS' },
  });

  if (!org) {
    console.error('[Seed] Organisation NWUCHAS not found!');
    return;
  }

  const mainCampus = await prisma.campus.findFirst({
    where: { organisationId: org.id, code: 'MAIN' },
  }) || await prisma.campus.findFirst({ where: { organisationId: org.id } });

  const annexCampus = await prisma.campus.findFirst({
    where: { organisationId: org.id, code: 'SOL-ANNEX' },
  }) || mainCampus;

  if (!mainCampus) {
    console.error('[Seed] Campus not found!');
    return;
  }

  // =========================================================================
  // 1. SEED PRODUCTION-GRADE ASSET REGISTER (AssetItem)
  // =========================================================================
  console.log('[Seed] Upserting Capital Assets...');
  const assetsData = [
    {
      assetTag: 'NWU-AST-LAB-001',
      qrCodeData: 'BC-NWU-LAB-001',
      name: 'Olympus CX23 Clinical Diagnostic Binocular Microscopes (Batch of 10)',
      category: 'LABORATORY' as AssetCategory,
      campusId: mainCampus.id,
      location: 'Skills Lab 2, Main Science Complex',
      serialNumber: 'OLY-CX23-ZM-99201',
      purchaseDate: new Date('2024-03-15'),
      purchaseCostZMW: 185000,
      currentValueZMW: 148000,
      depreciationRatePct: 10,
      condition: 'EXCELLENT' as AssetCondition,
      status: 'OPERATIONAL' as AssetStatus,
      custodianName: 'Dr. Chileshe Mulenga (Head of Pathology)',
      notes: 'Prescribed for parasitology, haematology, and microbiology practicals.',
    },
    {
      assetTag: 'NWU-AST-LAB-002',
      qrCodeData: 'BC-NWU-LAB-002',
      name: 'Mindray BS-240 Clinical Chemistry Analyzer',
      category: 'LABORATORY' as AssetCategory,
      campusId: annexCampus?.id || mainCampus.id,
      location: 'Clinical Biochemistry Unit, Solwezi Hospital Annex',
      serialNumber: 'MIN-BS240-88412',
      purchaseDate: new Date('2024-06-20'),
      purchaseCostZMW: 420000,
      currentValueZMW: 357000,
      depreciationRatePct: 15,
      condition: 'EXCELLENT' as AssetCondition,
      status: 'OPERATIONAL' as AssetStatus,
      custodianName: 'Sr. Beatrice Mwila (Lab Superintendent)',
      notes: 'High-throughput biochemistry automated analyzer for serum electrolytes, renal & liver function assays.',
    },
    {
      assetTag: 'NWU-AST-PWR-001',
      qrCodeData: 'BC-NWU-PWR-001',
      name: '200kVA Heavy-Duty Standby Diesel Generator (Silent Enclosed Perkins)',
      category: 'POWER_ENERGY' as AssetCategory,
      campusId: mainCampus.id,
      location: 'Substation Alpha, Manyama Main Campus',
      serialNumber: 'FGW-200-PK-33910',
      purchaseDate: new Date('2023-11-10'),
      purchaseCostZMW: 560000,
      currentValueZMW: 448000,
      depreciationRatePct: 10,
      condition: 'EXCELLENT' as AssetCondition,
      status: 'OPERATIONAL' as AssetStatus,
      custodianName: 'Eng. Patrick Banda (Estates & Facilities)',
      notes: 'Automated mains failure (AMF) transfer switch wired directly to clinical simulation labs and server room.',
    },
    {
      assetTag: 'NWU-AST-PWR-002',
      qrCodeData: 'BC-NWU-PWR-002',
      name: '15kW Victron Energy Quattro Solar Hybrid Microgrid & Lithium Storage',
      category: 'POWER_ENERGY' as AssetCategory,
      campusId: mainCampus.id,
      location: 'ICT Data Centre & Server Room',
      serialNumber: 'VIC-QUA-48-15K-881',
      purchaseDate: new Date('2024-01-22'),
      purchaseCostZMW: 295000,
      currentValueZMW: 265500,
      depreciationRatePct: 10,
      condition: 'EXCELLENT' as AssetCondition,
      status: 'OPERATIONAL' as AssetStatus,
      custodianName: 'Eng. Patrick Banda (Estates & Facilities)',
      notes: 'Zero-interruption solar backup inverter bank providing 24/7 continuous uptime for CMIS servers and CBT labs.',
    },
    {
      assetTag: 'NWU-AST-FLT-001',
      qrCodeData: 'BC-NWU-FLT-001',
      name: 'Toyota Coaster 30-Seater Clinical Attachment Shuttle Bus (Reg: BAF 8492)',
      category: 'FLEET_TRANSPORT' as AssetCategory,
      campusId: mainCampus.id,
      location: 'Campus Motor Pool & Shuttle Terminal',
      serialNumber: 'TOY-CST-HZB50-4829',
      purchaseDate: new Date('2023-08-14'),
      purchaseCostZMW: 750000,
      currentValueZMW: 562500,
      depreciationRatePct: 12.5,
      condition: 'GOOD' as AssetCondition,
      status: 'OPERATIONAL' as AssetStatus,
      custodianName: 'Mr. Moses Mwewa (Head of Transport)',
      notes: 'Designated daily student transport connecting Manyama Main Campus and Solwezi General Hospital.',
    },
    {
      assetTag: 'NWU-AST-FLT-002',
      qrCodeData: 'BC-NWU-FLT-002',
      name: 'Toyota Land Cruiser 4x4 Emergency Mobile Health Outreach Ambulance',
      category: 'FLEET_TRANSPORT' as AssetCategory,
      campusId: mainCampus.id,
      location: 'Emergency Bay Alpha, Manyama',
      serialNumber: 'TOY-HZJ78-EMG-1029',
      purchaseDate: new Date('2024-02-18'),
      purchaseCostZMW: 890000,
      currentValueZMW: 778750,
      depreciationRatePct: 12.5,
      condition: 'EXCELLENT' as AssetCondition,
      status: 'OPERATIONAL' as AssetStatus,
      custodianName: 'Mr. Moses Mwewa (Head of Transport)',
      notes: 'Equipped with oxygen delivery system, emergency spine board, suction unit, and defibrillator bracket.',
    },
    {
      assetTag: 'NWU-AST-LAB-003',
      qrCodeData: 'BC-NWU-LAB-003',
      name: 'Laerdal Nursing Anne Advanced Clinical Simulation Mannequin Set',
      category: 'LABORATORY' as AssetCategory,
      campusId: mainCampus.id,
      location: 'Nursing Skills Lab 1, Manyama Campus',
      serialNumber: 'LAE-ANN-ADV-2024-01',
      purchaseDate: new Date('2024-04-10'),
      purchaseCostZMW: 310000,
      currentValueZMW: 263500,
      depreciationRatePct: 15,
      condition: 'EXCELLENT' as AssetCondition,
      status: 'OPERATIONAL' as AssetStatus,
      custodianName: 'Mrs. Enid Tembo (Clinical Skills Coordinator)',
      notes: 'Interactive full-body mannequin for CPR, airway management, catheterization, and IV cannulation training.',
    },
    {
      assetTag: 'NWU-AST-ITC-001',
      qrCodeData: 'BC-NWU-ITC-001',
      name: 'HP ProDesk 400 G7 Core i7 Computer Workstations (CBT Lab Array - 40 Units)',
      category: 'IT_COMPUTING' as AssetCategory,
      campusId: mainCampus.id,
      location: 'Digital CBT & E-Learning Lab, Main Library',
      serialNumber: 'HP-PD400-ARRAY-40',
      purchaseDate: new Date('2024-01-10'),
      purchaseCostZMW: 380000,
      currentValueZMW: 304000,
      depreciationRatePct: 20,
      condition: 'EXCELLENT' as AssetCondition,
      status: 'OPERATIONAL' as AssetStatus,
      custodianName: 'Mr. Kelvin Mumba (Systems Administrator)',
      notes: 'Dedicated online examination CBT terminals locked down with SEB (Safe Exam Browser).',
    },
    {
      assetTag: 'NWU-AST-LAB-004',
      qrCodeData: 'BC-NWU-LAB-004',
      name: 'Tuttnauer 3870EL 85L Heavy-Duty Medical Autoclave Sterilizer',
      category: 'LABORATORY' as AssetCategory,
      campusId: mainCampus.id,
      location: 'CSSD & Surgical Prep Room, Manyama',
      serialNumber: 'TUT-3870EL-ZM-192',
      purchaseDate: new Date('2024-05-12'),
      purchaseCostZMW: 145000,
      currentValueZMW: 130500,
      depreciationRatePct: 10,
      condition: 'EXCELLENT' as AssetCondition,
      status: 'OPERATIONAL' as AssetStatus,
      custodianName: 'Sr. Beatrice Mwila (Lab Superintendent)',
      notes: 'High-pressure clinical sterilizer for surgical instrument trays, dental packs, and microbiology culture media.',
    },
    {
      assetTag: 'NWU-AST-BOD-001',
      qrCodeData: 'BC-NWU-BOD-001',
      name: 'Commercial Two-Tier Steel Bunk Bed Units (Florence Nightingale Hall - 40 Sets)',
      category: 'BOARDING_RESIDENTIAL' as AssetCategory,
      campusId: mainCampus.id,
      location: 'Florence Nightingale Hall (Hostel 1)',
      serialNumber: 'BUN-FNH-SET-040',
      purchaseDate: new Date('2023-12-01'),
      purchaseCostZMW: 240000,
      currentValueZMW: 192000,
      depreciationRatePct: 10,
      condition: 'GOOD' as AssetCondition,
      status: 'OPERATIONAL' as AssetStatus,
      custodianName: 'Mrs. Janet Phiri (Hostel Warden)',
      notes: 'Heavy gauge steel tubular construction with orthopaedic foam mattresses for 80 residential students.',
    },
  ];

  for (const a of assetsData) {
    await prisma.assetItem.upsert({
      where: { assetTag: a.assetTag },
      create: {
        ...a,
        organisationId: org.id,
      },
      update: {
        name: a.name,
        category: a.category,
        location: a.location,
        currentValueZMW: a.currentValueZMW,
        condition: a.condition,
        status: a.status,
        custodianName: a.custodianName,
        notes: a.notes,
      },
    });
  }

  // =========================================================================
  // 2. SEED OFFICIAL CONTROLLED DOCUMENTS (OfficialDocument)
  // =========================================================================
  console.log('[Seed] Upserting Official Documents...');
  const learner = await prisma.learner.findFirst({
    where: { organisationId: org.id },
  });

  const docsData = [
    {
      referenceNumber: 'NWU/ADM-OFFER/2026/0001',
      documentType: 'OFFER_LETTER' as OfficialDocType,
      title: 'Provisional Admission & Acceptance Offer Letter (2026 Academic Intake)',
      status: 'ISSUED' as OfficialDocStatus,
      recipientName: learner ? `${learner.firstName} ${learner.lastName}` : 'Admitted Candidates Cohort 2026',
      recipientOrganization: 'North Western University College of Health and Applied Sciences',
      purpose: 'Statutory admission offer containing student enrollment number, programme allocation, fee matrix, and medical fitness form.',
      signatoryName: 'Dr. Mukombo L.',
      signatoryTitle: 'Office of the Academic Registrar',
      payloadJson: JSON.stringify({
        academicYear: '2026',
        semester: 1,
        programme: 'Diploma in Registered Nursing',
        statutoryBody: 'HEA / NMCZ Accredited',
      }),
    },
    {
      referenceNumber: 'NWU/REG-BONA/2026/0002',
      documentType: 'BONAFIDE_STUDENT' as OfficialDocType,
      title: 'NMCZ / HPCZ Statutory Student Indexing Verification & Bonafide Letter',
      status: 'ISSUED' as OfficialDocStatus,
      recipientName: learner ? `${learner.firstName} ${learner.lastName}` : 'Enrolled Student',
      recipientOrganization: 'Nursing and Midwifery Council of Zambia / Health Professions Council',
      purpose: 'Official regulatory submission docket verifying Grade 12 statement of results, certified National Registration Card (NRC), and professional council indexing compliance.',
      signatoryName: 'Mrs. Janet Phiri',
      signatoryTitle: 'Council Indexing Liaison Officer',
      payloadJson: JSON.stringify({
        indexingStatus: 'VERIFIED',
        council: 'NMCZ',
        intakeYear: '2026',
      }),
    },
    {
      referenceNumber: 'NWU/BURSAR-CLR/2026/0003',
      documentType: 'FEE_CLEARANCE' as OfficialDocType,
      title: 'Official Examination Clearance Slip & CBT Hall Entry Docket',
      status: 'ISSUED' as OfficialDocStatus,
      recipientName: learner ? `${learner.firstName} ${learner.lastName}` : 'Enrolled Student',
      recipientOrganization: 'Chief Examinations Invigilator & Academic Senate',
      purpose: 'Digital security hall entry pass verifying 85% attendance roll-call compliance and zero tuition fee balance clearance from the Bursary.',
      signatoryName: 'Mr. Kenneth Mwila',
      signatoryTitle: 'Bursar & Director of Finance',
      payloadJson: JSON.stringify({
        bursaryStatus: 'CLEARED_ZERO_BALANCE',
        attendanceRatePct: 95.0,
      }),
    },
    {
      referenceNumber: 'NWU/CLN-COMPL/2026/0004',
      documentType: 'CLINICAL_COMPLETION' as OfficialDocType,
      title: 'Student Clinical Logbook & Preceptor Evaluation Dossier',
      status: 'APPROVED' as OfficialDocStatus,
      recipientName: learner ? `${learner.firstName} ${learner.lastName}` : 'Nursing & Clinical Medicine Candidates',
      recipientOrganization: 'Directorate of Clinical Practice & Hospital Preceptors',
      purpose: 'Prescribed procedural logbook for hospital ward attachments: surgical scrubbing, IV cannulation, normal delivery management, catheterization, and post-operative monitoring.',
      signatoryName: 'Dr. Chileshe Mulenga',
      signatoryTitle: 'Dean of Health Sciences & Clinical Practice',
      payloadJson: JSON.stringify({
        clinicalHours: 320,
        preceptorApproval: 'APPROVED',
      }),
    },
    {
      referenceNumber: 'NWU/ACA-TRNS/2026/0005',
      documentType: 'ACADEMIC_TRANSCRIPT' as OfficialDocType,
      title: 'Official Academic Transcript & Statement of Results (Watermarked)',
      status: 'ISSUED' as OfficialDocStatus,
      recipientName: learner ? `${learner.firstName} ${learner.lastName}` : 'Enrolled Student',
      recipientOrganization: 'Academic Senate & Examinations Committee',
      purpose: 'Formal certified transcript recording credit units, course grades, GPA, OSCE practical performance, clinical rotations completed, and official college seal.',
      signatoryName: 'Dr. Mukombo L.',
      signatoryTitle: 'Office of the Academic Registrar',
      payloadJson: JSON.stringify({
        gpa: 3.75,
        distinctionCount: 4,
        senateClearance: 'CONFIRMED',
      }),
    },
    {
      referenceNumber: 'NWU/REF-INTRO/2026/0006',
      documentType: 'INTRODUCTION_LETTER' as OfficialDocType,
      title: 'Standard Campus Tenancy & Hostel Accommodation Agreement',
      status: 'ISSUED' as OfficialDocStatus,
      recipientName: learner ? `${learner.firstName} ${learner.lastName}` : 'Hostel Resident',
      recipientOrganization: 'Campus Operations & Dean of Students',
      purpose: 'Binding residential agreement for hostel accommodation at Florence Nightingale and Albert Schweitzer halls, specifying room allocation rules, curfew policies, and utility services.',
      signatoryName: 'Eng. Patrick Banda',
      signatoryTitle: 'Director of Campus Operations',
      payloadJson: JSON.stringify({
        residenceHall: 'Florence Nightingale Hall',
        roomNumber: 'Room 01',
        bedNumber: 'Bed A',
      }),
    },
  ];

  for (const d of docsData) {
    const raw = `${d.referenceNumber}:${org.id}:${learner?.studentNumber || 'GENERAL'}:NWUCHAS_OFFICIAL_ARCHIVE`;
    const verificationHash = crypto.createHash('sha256').update(raw).digest('hex').toUpperCase();
    const qrVerificationCode = `NWU-VFY-${verificationHash.slice(0, 16)}`;

    await prisma.officialDocument.upsert({
      where: { referenceNumber: d.referenceNumber },
      create: {
        ...d,
        organisationId: org.id,
        learnerId: learner?.id,
        verificationHash,
        qrVerificationCode,
        issuedAt: new Date(),
      },
      update: {
        title: d.title,
        status: d.status,
        recipientName: d.recipientName,
        purpose: d.purpose,
        signatoryName: d.signatoryName,
        signatoryTitle: d.signatoryTitle,
        payloadJson: d.payloadJson,
        verificationHash,
        qrVerificationCode,
      },
    });
  }

  // =========================================================================
  // 3. SEED HOSTELS, ROOMS & BEDS (Campus Operations)
  // =========================================================================
  console.log('[Seed] Upserting Hostels, Rooms, and Beds...');
  const hostels = [
    {
      name: 'Florence Nightingale Hall (Hostel 1)',
      genderPolicy: 'FEMALE_ONLY' as const,
      totalRooms: 10,
      totalBeds: 40,
      wardenName: 'Mrs. Janet Phiri',
      wardenPhone: '+260 97 711 2233',
      feePerSemesterZMW: 2200,
    },
    {
      name: 'Albert Schweitzer Hall (Hostel 2)',
      genderPolicy: 'MALE_ONLY' as const,
      totalRooms: 10,
      totalBeds: 40,
      wardenName: 'Mr. David Kapata',
      wardenPhone: '+260 97 822 3344',
      feePerSemesterZMW: 2200,
    },
    {
      name: 'Dag Hammarskjöld Hall (Hostel 3)',
      genderPolicy: 'CO_ED_SEGREGATED' as const,
      totalRooms: 6,
      totalBeds: 24,
      wardenName: 'Mrs. Enid Tembo',
      wardenPhone: '+260 97 933 4455',
      feePerSemesterZMW: 2400,
    },
  ];

  for (const h of hostels) {
    let building = await prisma.hostelBuilding.findFirst({
      where: { campusId: mainCampus.id, name: h.name },
    });

    if (!building) {
      building = await prisma.hostelBuilding.create({
        data: {
          name: h.name,
          campusId: mainCampus.id,
          genderPolicy: h.genderPolicy,
          totalRooms: h.totalRooms,
          totalBeds: h.totalBeds,
          wardenName: h.wardenName,
          wardenPhone: h.wardenPhone,
          feePerSemesterZMW: h.feePerSemesterZMW,
        },
      });
    }

    // Ensure rooms exist
    for (let r = 1; r <= 4; r++) {
      const roomNum = `Room ${r < 10 ? '0' + r : r}`;
      let room = await prisma.hostelRoom.findFirst({
        where: { buildingId: building.id, roomNumber: roomNum },
      });

      if (!room) {
        room = await prisma.hostelRoom.create({
          data: {
            buildingId: building.id,
            roomNumber: roomNum,
            floor: r <= 2 ? 1 : 2,
            capacityBeds: 4,
          },
        });
      }

      // Ensure beds exist
      const bedLetters = ['A', 'B', 'C', 'D'];
      for (const letter of bedLetters) {
        const bedNum = `Bed ${letter}`;
        const existingBed = await prisma.hostelBed.findFirst({
          where: { roomId: room.id, bedNumber: bedNum },
        });

        if (!existingBed) {
          await prisma.hostelBed.create({
            data: {
              roomId: room.id,
              bedNumber: bedNum,
              isOccupied: false,
            },
          });
        }
      }
    }
  }

  console.log('[Seed] Enterprise Records successfully seeded and verified in PostgreSQL!');
}

if (require.main === module) {
  seedEnterpriseRecords()
    .catch((err) => {
      console.error('[Seed] Error during execution:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
