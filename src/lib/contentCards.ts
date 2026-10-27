// src/lib/contentCards.ts — Institutional Dynamic Content Cards & CMS Registry
// Centralized definitions, interfaces, and default content for NWUCHAS pages & cards

export interface ContentCardItem {
  pageKey: string;
  sectionKey: string;
  cardKey: string;
  title: string;
  subtitle?: string;
  badge?: string;
  body: string;
  iconName?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  metadata?: {
    items?: string[];
    specs?: { label: string; value: string }[];
    requirements?: string;
    duration?: string;
    professionalBody?: string;
    focusAreas?: string;
    statNumber?: string;
    statLabel?: string;
    accentColor?: string;
  };
  displayOrder?: number;
  isPublished?: boolean;
}

export const DEFAULT_CONTENT_CARDS: ContentCardItem[] = [
  // =========================================================================
  // 1. HERO SECTION
  // =========================================================================
  {
    pageKey: 'landing',
    sectionKey: 'hero',
    cardKey: 'hero_main',
    title: 'Empowering the Next Generation of Healthcare Pioneers',
    subtitle: 'HPCZ & NMCZ Verified Institution • Higher Education Authority (HEA) Registered',
    badge: '2026 Admissions Open',
    body: 'North Western University College of Health and Applied Sciences (NWUCHAS) is a premier tertiary healthcare institution situated in Manyama, Lumwana, Zambia. We deliver rigorous, hands-on clinical education in Registered Nursing, Clinical Medicine, and Public Health.',
    ctaLabel: 'Start 2026 Application',
    ctaUrl: '/apply',
    metadata: {
      specs: [
        { label: 'Accredited Curricula', value: '100%' },
        { label: 'Hospital Ward Rotations', value: 'Practical' },
        { label: 'Kalumbila Campus', value: 'Manyama' },
      ],
      items: [
        'January & Mid-Year Intakes',
        'Direct Hospital Rotations',
        'NMCZ & HPCZ Accredited',
      ],
    },
    displayOrder: 1,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'hero',
    cardKey: 'hero_intake',
    title: 'Key Admission Windows',
    subtitle: '2026 Academic Calendar',
    badge: 'Active Intake',
    body: 'Enrollment is officially open for full-time tertiary diplomas and advance mid-year bridging programmes.',
    metadata: {
      items: [
        'January 2026 Main Intake: Full-time Diploma in Registered Nursing (RN) & Diploma in Clinical Medicine (COG).',
        'July 2026 Mid-Year Intake: Diploma in Public Health & In-Service Bridging Programmes.',
        'Accredited Clinical Attachment Sites: Solwezi General Hospital, Lumwana First Level Hospital, and district health centres.',
      ],
    },
    displayOrder: 2,
    isPublished: true,
  },

  // =========================================================================
  // 2. VISION, MISSION & VALUES
  // =========================================================================
  {
    pageKey: 'landing',
    sectionKey: 'vision_mission',
    cardKey: 'vision',
    title: 'Our Institutional Vision',
    subtitle: 'Pinnacle of Healthcare Excellence',
    badge: 'Vision 2030',
    body: 'To be a centre of excellence in the education, training, and development of ethical, competent, and innovative health professionals in Zambia and across the Southern African sub-region.',
    iconName: 'Compass',
    displayOrder: 1,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'vision_mission',
    cardKey: 'mission',
    title: 'Our Mission',
    subtitle: 'Learner-Centred & Practice-Driven',
    badge: 'Institutional Mission',
    body: 'To provide quality, learner-centred, and practice-driven education and research in health and applied sciences that directly responds to community healthcare needs and global standards.',
    iconName: 'HeartPulse',
    displayOrder: 2,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'vision_mission',
    cardKey: 'values',
    title: 'Institutional Core Values',
    subtitle: 'Ethical Foundations',
    badge: 'Core Pillars',
    body: 'Grounded in unyielding professional ethics, patient dignity, clinical precision, and community-centred service across Zambia.',
    iconName: 'Award',
    metadata: {
      items: ['Clinical Excellence', 'Compassion', 'Integrity', 'Community Care'],
    },
    displayOrder: 3,
    isPublished: true,
  },

  // =========================================================================
  // 3. ACADEMIC PROGRAMMES
  // =========================================================================
  {
    pageKey: 'landing',
    sectionKey: 'programmes',
    cardKey: 'prog_rn',
    title: 'Diploma in Registered Nursing (RN)',
    subtitle: '3 Years • Full Time',
    badge: 'NMCZ Accredited',
    body: 'Prepares professional registered nurses to deliver comprehensive general, pediatric, psychiatric, and community nursing care with high clinical competencies and leadership.',
    ctaLabel: 'Apply for Registered Nursing',
    ctaUrl: '/apply?programme=nursing',
    metadata: {
      duration: '3 Years • Full Time',
      requirements: 'Five (5) O-Level Credits in ECZ/GCE or equivalent: English Language, Mathematics, Biology / Science, and two other subjects.',
      professionalBody: 'Nursing and Midwifery Council of Zambia (NMCZ)',
    },
    displayOrder: 1,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'programmes',
    cardKey: 'prog_coe',
    title: 'Diploma in Clinical Medicine (COG)',
    subtitle: '3 Years • Full Time',
    badge: 'HPCZ Accredited',
    body: 'Trains Clinical Officers (General) to diagnose, manage medical emergencies, perform essential minor surgical and obstetric procedures, and administer primary healthcare.',
    ctaLabel: 'Apply for Clinical Medicine',
    ctaUrl: '/apply?programme=clinical',
    metadata: {
      duration: '3 Years • Full Time',
      requirements: 'Five (5) O-Level Credits in ECZ/GCE: English Language, Mathematics, Biology, Physical Science / Chemistry / Physics, and any other subject.',
      professionalBody: 'Health Professions Council of Zambia (HPCZ)',
    },
    displayOrder: 2,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'programmes',
    cardKey: 'prog_ph',
    title: 'Diploma in Public Health',
    subtitle: '3 Years • Full / Blended',
    badge: 'HPCZ & HEA Approved',
    body: 'Equips professionals with epidemiological surveillance, occupational health & safety in mining, environmental sanitation, infectious disease control, and health policy management.',
    ctaLabel: 'Apply for Public Health',
    ctaUrl: '/apply?programme=public-health',
    metadata: {
      duration: '3 Years • Full / Blended',
      requirements: 'Five (5) O-Level Credits in ECZ/GCE or equivalent including English Language, Mathematics, and a Science subject.',
      professionalBody: 'Health Professions Council of Zambia (HPCZ) & HEA',
      focusAreas: 'Community Health, Mining Health & Epidemiology',
    },
    displayOrder: 3,
    isPublished: true,
  },

  // =========================================================================
  // 4. HOW TO APPLY STEPS
  // =========================================================================
  {
    pageKey: 'landing',
    sectionKey: 'steps',
    cardKey: 'step_1',
    title: 'Check Criteria',
    subtitle: 'Step 01',
    badge: '01',
    body: 'Ensure you meet the minimum entry requirements: 5 O-Level credits in Zambian GCE / ECZ.',
    displayOrder: 1,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'steps',
    cardKey: 'step_2',
    title: 'Prepare Docs',
    subtitle: 'Step 02',
    badge: '02',
    body: 'Have certified copies of your ECZ statement of results, NRC, and passport photograph ready.',
    displayOrder: 2,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'steps',
    cardKey: 'step_3',
    title: 'Apply Online',
    subtitle: 'Step 03',
    badge: '03',
    body: 'Complete the online form and immediately obtain your unique NWU-APP tracking number.',
    displayOrder: 3,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'steps',
    cardKey: 'step_4',
    title: 'Screening',
    subtitle: 'Step 04',
    badge: '04',
    body: 'The admissions registry verifies qualifications and communicates selection committee decisions.',
    displayOrder: 4,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'steps',
    cardKey: 'step_5',
    title: 'Enrollment',
    subtitle: 'Step 05',
    badge: '05',
    body: 'Receive your provisional admission offer letter, accept online, and complete professional indexing.',
    displayOrder: 5,
    isPublished: true,
  },

  // =========================================================================
  // 5. CLINICAL ROTATIONS & ATTACHMENTS
  // =========================================================================
  {
    pageKey: 'landing',
    sectionKey: 'clinical',
    cardKey: 'clin_solwezi',
    title: 'Solwezi General Hospital',
    subtitle: 'Provincial Tertiary Hospital',
    badge: 'Level 2 Referral',
    body: 'Provincial tertiary hospital providing major surgical, internal medicine, pediatric, and obstetric rotations with experienced consultant preceptors.',
    iconName: 'Hospital',
    displayOrder: 1,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'clinical',
    cardKey: 'clin_lumwana',
    title: 'Lumwana First Level Hospital',
    subtitle: 'Emergency & Industrial Care',
    badge: 'Level 1 Hospital',
    body: 'Emergency medicine, trauma management, and industrial mining healthcare clinical placements in the heart of Kalumbila district.',
    iconName: 'Hospital',
    displayOrder: 2,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'clinical',
    cardKey: 'clin_manyama',
    title: 'Manyama Rural Health Facilities',
    subtitle: 'Community & Primary Healthcare',
    badge: 'Primary Outreach',
    body: 'Maternal child health (MCH), immunisation outreach, and primary community healthcare embedded directly with local populations.',
    iconName: 'Hospital',
    displayOrder: 3,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'clinical',
    cardKey: 'clin_assurance',
    title: 'Clinical Competency Assurance',
    subtitle: 'Electronic NMCZ & HPCZ Logbooks',
    badge: 'Statutory Standard',
    body: 'Every clinical student maintains an electronic logbook tracking ward hours, procedures observed, assisted, and performed independently in compliance with NMCZ and HPCZ regulations.',
    iconName: 'HeartPulse',
    metadata: {
      specs: [
        { label: 'Preceptor Supervised', value: '100%' },
        { label: 'Attendance Threshold', value: '85%' },
      ],
    },
    displayOrder: 4,
    isPublished: true,
  },

  // =========================================================================
  // 6. CAMPUS FACILITIES
  // =========================================================================
  {
    pageKey: 'landing',
    sectionKey: 'facilities',
    cardKey: 'fac_sim_lab',
    title: 'Skills & Simulation Lab',
    subtitle: 'Advanced Clinical Simulation',
    badge: 'Simulated Wards',
    body: 'High-fidelity adult, pediatric, and birthing simulators for pre-clinical procedural practice in a zero-risk simulated clinical environment.',
    iconName: 'Stethoscope',
    displayOrder: 1,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'facilities',
    cardKey: 'fac_library',
    title: 'Digital Medical Library',
    subtitle: 'E-Resources & Clinical Journals',
    badge: '24/7 Knowledge Base',
    body: 'Comprehensive collection of physical medical textbooks, quiet study zones, computer suites, and online clinical journal subscriptions.',
    iconName: 'BookOpenCheck',
    displayOrder: 2,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'facilities',
    cardKey: 'fac_residences',
    title: 'Student Residences',
    subtitle: 'Safe On-Campus Hostels',
    badge: 'Accommodated Campus',
    body: 'Secure on-campus hostels including Florence Nightingale residence with 24/7 power, borehole water, warden oversight, and perimeter security.',
    iconName: 'Bed',
    displayOrder: 3,
    isPublished: true,
  },
  {
    pageKey: 'landing',
    sectionKey: 'facilities',
    cardKey: 'fac_theatres',
    title: 'Modern Lecture Theatres',
    subtitle: 'Digital Multimedia Amphitheatres',
    badge: 'Smart Classrooms',
    body: 'Spacious amphitheatre-style lecture halls equipped with digital multimedia projectors, acoustic baffling, and high-clarity sound systems.',
    iconName: 'Building2',
    displayOrder: 4,
    isPublished: true,
  },

  // =========================================================================
  // 7. ABOUT & STATUTORY CREDENTIALS
  // =========================================================================
  {
    pageKey: 'landing',
    sectionKey: 'about',
    cardKey: 'about_overview',
    title: 'North Western University College of Health and Applied Sciences',
    subtitle: 'Manyama Educational Corridor, Kalumbila District',
    badge: 'HEA / NMCZ / HPCZ Registered',
    body: 'Located in the Manyama Educational Corridor along Lumwana Road in Kalumbila District, NWUCHAS is an established Zambian higher education institution dedicated exclusively to health sciences.\n\nOur curriculum aligns with the national healthcare priorities articulated by the Ministry of Health (MOH) and verified by the Higher Education Authority (HEA), the Nursing and Midwifery Council of Zambia (NMCZ), and the Health Professions Council of Zambia (HPCZ).',
    metadata: {
      items: [
        'Registered Higher Education Institution',
        'NMCZ Accredited Nursing School',
        'HPCZ Verified Clinical Training',
        'Affiliated Hospital Attachments',
      ],
      specs: [
        { label: 'Institution Name', value: 'North Western University College of Health and Applied Sciences (NWUCHAS)' },
        { label: 'Campus Location', value: 'Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia' },
        { label: 'District & Province', value: 'Kalumbila District, North Western Province, Zambia' },
        { label: 'Statutory Regulator', value: 'Higher Education Authority (HEA)' },
        { label: 'Nursing Regulator', value: 'Nursing and Midwifery Council of Zambia (NMCZ)' },
        { label: 'Medical Regulator', value: 'Health Professions Council of Zambia (HPCZ)' },
        { label: 'Statutory TPIN', value: '1008492019' },
      ],
    },
    displayOrder: 1,
    isPublished: true,
  },
];

/**
 * Helper to get default card by key
 */
export function getDefaultCard(pageKey: string, sectionKey: string, cardKey: string): ContentCardItem | undefined {
  return DEFAULT_CONTENT_CARDS.find(
    (c) => c.pageKey === pageKey && c.sectionKey === sectionKey && c.cardKey === cardKey
  );
}

/**
 * Helper to get all default cards for a page and section
 */
export function getDefaultCardsForSection(pageKey: string, sectionKey: string): ContentCardItem[] {
  return DEFAULT_CONTENT_CARDS.filter(
    (c) => c.pageKey === pageKey && c.sectionKey === sectionKey
  ).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}
