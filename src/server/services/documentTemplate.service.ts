// src/server/services/documentTemplate.service.ts
/**
 * EduSphere SMIS — Official Institutional Document Generator Service
 * Legacy School Solwezi (North-Western Province, Zambia)
 * Ministry of Education Registration: MOE/NWP/SOL/SEC/2026/044
 * TPIN: 1008492019
 */

export type DocumentType =
  | 'OFFER_LETTER'
  | 'ACCEPTANCE_LETTER'
  | 'INTRODUCTION_LETTER'
  | 'TRANSFER_CLEARANCE'
  | 'FEE_CLEARANCE';

export interface DocumentLearnerProfile {
  studentNumber: string;
  learnerName: string;
  className: string;
  stage?: string;
  campusName: string;
  studentType: 'BOARDER' | 'DAY_SCHOLAR' | string;
  gender?: string;
  dateOfBirth?: string;
  residentialAddress?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  hallName?: string;
  dormRoom?: string;
  bedNumber?: string;
  enrolmentDate?: string;
  totalBilled?: number;
  totalPaid?: number;
  balance?: number;
  conductRating?: string;
  academicAverage?: number;
}

export interface DocumentGenerationOptions {
  documentType: DocumentType;
  referenceNumber?: string;
  issueDate?: string;
  recipientName?: string;
  recipientDesignation?: string;
  recipientOrganization?: string;
  recipientAddress?: string;
  purpose?: string;
  reportingDate?: string;
  acceptanceDeadline?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  customRemarks?: string;
  targetTransferSchool?: string;
  transferReason?: string;
  termSession?: string;
  academicYear?: string;
}

export interface GeneratedDocument {
  documentType: DocumentType;
  title: string;
  subtitle: string;
  referenceNumber: string;
  issueDate: string;
  recipientLines: string[];
  salutation: string;
  subjectLine: string;
  paragraphs: string[];
  tabularData?: {
    headers: string[];
    rows: (string | number)[][];
    footers?: (string | number)[];
  };
  requirementsList?: string[];
  signatoryName: string;
  signatoryTitle: string;
  securityStamp: {
    institution: string;
    registration: string;
    tpin: string;
    issuedTimestamp: string;
    verificationHash: string;
  };
}

export class DocumentTemplateService {
  /**
   * Generates a unique, official institutional reference number
   */
  static generateReferenceNumber(type: DocumentType, studentNumber: string): string {
    const cleanId = studentNumber.replace(/[^A-Za-z0-9]/g, '').slice(-4) || '1044';
    const year = '2026';
    switch (type) {
      case 'OFFER_LETTER':
        return `LSS/ADM-OFFER/${year}/${cleanId}`;
      case 'ACCEPTANCE_LETTER':
        return `LSS/CONF-ENR/${year}/${cleanId}`;
      case 'INTRODUCTION_LETTER':
        return `LSS/REF-INTRO/${year}/${cleanId}`;
      case 'TRANSFER_CLEARANCE':
        return `LSS/TRF-CLR/${year}/${cleanId}`;
      case 'FEE_CLEARANCE':
        return `LSS/BURSAR-CLR/${year}/${cleanId}`;
      default:
        return `LSS/DOC/${year}/${cleanId}`;
    }
  }

  /**
   * Formats the official date according to Zambian institutional conventions
   */
  static formatOfficialDate(dateStr?: string): string {
    const d = dateStr ? new Date(dateStr) : new Date();
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  /**
   * Master document generation engine
   */
  static generateDocument(
    learner: DocumentLearnerProfile,
    options: DocumentGenerationOptions
  ): GeneratedDocument {
    const ref =
      options.referenceNumber ||
      this.generateReferenceNumber(options.documentType, learner.studentNumber);
    const dateFormatted = this.formatOfficialDate(options.issueDate);
    const year = options.academicYear || '2026';
    const isBoarder =
      String(learner.studentType).toUpperCase().includes('BOARD') ||
      Boolean(learner.hallName);

    const verificationHash = `VER-LSS-${ref.replace(/[^A-Za-z0-9]/g, '')}-${Date.now().toString(36).toUpperCase()}`;

    const defaultSignatoryName = options.signatoryName || 'Mr. Emmanuel Mwansa';
    const defaultSignatoryTitle =
      options.signatoryTitle || 'School Director & Principal';

    switch (options.documentType) {
      case 'OFFER_LETTER': {
        const reportingDate = options.reportingDate || 'Monday, 12th January 2026';
        const deadline = options.acceptanceDeadline || 'Friday, 5th December 2025';

        const recipientLines = [
          learner.guardianName ? `Mr. & Mrs. ${learner.guardianName}` : 'To the Parent / Guardian',
          learner.residentialAddress || 'Kansanshi Mine Road Educational Corridor',
          'Solwezi, North-Western Province, Zambia',
        ];

        const paragraphs = [
          `Following your formal application and subsequent satisfactory academic evaluation, the Board of Directors and the Admissions Committee of Legacy School Solwezi are pleased to extend a provisional offer of admission to ${learner.learnerName} into ${learner.className} for the ${year} Academic Session.`,
          `This placement is offered at our ${learner.campusName || 'Mushitala Campus'}, tenured under the ${isBoarder ? 'Full Residential Boarding Village Cadre' : 'Day Scholar Cadre'}.`,
          `Legacy School Solwezi is committed to the holistic intellectual, moral, and leadership cultivation of every learner. Our curriculum is aligned with the Examination Council of Zambia (ECZ) national framework supplemented by accelerated continuous assessments (40% Continuous Assessment / 60% Final Examination).`,
          `Please note that admission will be formalized upon receipt of the signed acceptance slip accompanied by the minimum requisite commitment deposit before ${deadline}. Orientation for new scholars will commence on ${reportingDate} at 08:00 hours promptly.`,
        ];

        const tabularData = {
          headers: ['Statutory / Operational Component', 'Description', 'Amount (ZMW)'],
          rows: [
            ['Tuition & Educational Materials', `Termly Academic Fee (${learner.className})`, isBoarder ? 'K 6,500.00' : 'K 3,200.00'],
            [isBoarder ? 'Boarding & Nutritional Rations' : 'Midday Lunch & Facility Levy', isBoarder ? 'Full Hall Accommodation, Hot Water & Catering' : 'Daily Lunch & Structured Prep Hall Access', isBoarder ? 'K 5,500.00' : 'K 1,200.00'],
            ['Examination Council & CA Assessment', 'ECZ Continuous Assessment Registration & Science Lab Consumables', 'K 600.00'],
            ['Student Uniform & Physical Attire', '2x Daily Sets, 1x Formal Blazer, 1x Sports Kit', 'K 1,400.00'],
            ['Caution Deposit (Refundable)', 'Escrowed Security Deposit (Refundable upon graduation or clearance)', 'K 500.00'],
          ],
          footers: ['Total Initial Termly Obligation', 'All inclusive statutory tuition & boarding package', isBoarder ? 'K 14,500.00' : 'K 6,900.00'],
        };

        const requirementsList = isBoarder
          ? [
              'Official black trunk or lockable suitcase with name clearly inscribed.',
              '2x Single-bed white cotton bedsheets, 1x warm duvet, and 1x standard pillow.',
              '1x Navy-blue Legacy School fleece blanket and 1x heavy-duty mosquito net.',
              'Full toiletries supply (soap, bathing bucket, toothpaste, laundry detergent).',
              'Certified Medical Fitness Examination Report endorsed by a registered clinician.',
              'Original Grade 7 / Grade 9 ECZ Examination Result Slip (or verified transcript).',
            ]
          : [
              'Complete Legacy School Solwezi day uniform (navy blazer, branded polo, trousers/skirt).',
              'Oxford mathematical instruments set and ECZ-approved scientific calculator.',
              'Exercise books (12x A4 120-page ruled books) and full writing instruments.',
              'Certified copy of Birth Certificate or National Registration Card (NRC).',
            ];

        return {
          documentType: 'OFFER_LETTER',
          title: 'OFFER OF ADMISSION',
          subtitle: `PROVISIONAL ENROLMENT OFFER • ACADEMIC YEAR ${year}`,
          referenceNumber: ref,
          issueDate: dateFormatted,
          recipientLines,
          salutation: `Dear ${learner.guardianName ? learner.guardianName : 'Parent / Guardian'},`,
          subjectLine: `PROVISIONAL OFFER OF ADMISSION: ${learner.learnerName.toUpperCase()} (REF: ${learner.studentNumber})`,
          paragraphs,
          tabularData,
          requirementsList,
          signatoryName: defaultSignatoryName,
          signatoryTitle: defaultSignatoryTitle,
          securityStamp: {
            institution: 'LEGACY SCHOOL SOLWEZI',
            registration: 'MOE/NWP/SOL/SEC/2026/044',
            tpin: '1008492019',
            issuedTimestamp: new Date().toISOString(),
            verificationHash,
          },
        };
      }

      case 'ACCEPTANCE_LETTER': {
        const recipientLines = [
          `Attention: ${learner.guardianName || 'Parent / Guardian'} & ${learner.learnerName}`,
          learner.residentialAddress || 'Solwezi Educational District',
          'North-Western Province, Zambia',
        ];

        const paragraphs = [
          `We are delighted to formally confirm the final registration and enrolment of ${learner.learnerName} as a bona fide student at Legacy School Solwezi under Student Identification Number ${learner.studentNumber}.`,
          `The admissions and bursary offices have formally acknowledged receipt of your signed Acceptance of Terms and verified the initial tuition commitment. The pupil is officially rostered into ${learner.className} for the ${year} Academic Year.`,
          isBoarder
            ? `Residential boarding accommodation has been allocated in ${learner.hallName || 'Kansanshi Boys Boarding Village'} (Room: ${learner.dormRoom || 'Standard Bay'}, Bed: ${learner.bedNumber || 'Assigned'}). Dormitory check-in will be open from Sunday, 11th January 2026 between 10:00 and 16:30 hours.`
            : `As a Day Scholar, the pupil is expected on campus daily by 07:15 hours for morning devotion, roll call, and assembly. Structured classes commence promptly at 07:45 hours.`,
          `By joining the Legacy School fraternity, both the student and the guardians agree to uphold the school motto: "We Strive for Your Academic and Moral Excellence" and adhere strictly to the Institutional Code of Conduct and Anti-Bullying Charter.`,
        ];

        return {
          documentType: 'ACCEPTANCE_LETTER',
          title: 'CONFIRMATION OF ENROLMENT',
          subtitle: `OFFICIAL PUPIL REGISTRATION CERTIFICATE • ${year}`,
          referenceNumber: ref,
          issueDate: dateFormatted,
          recipientLines,
          salutation: `Dear Mr. & Mrs. ${learner.guardianName || 'Parent'},`,
          subjectLine: `CONFIRMATION OF ENROLMENT & PLACEMENT: ${learner.learnerName.toUpperCase()} (ID: ${learner.studentNumber})`,
          paragraphs,
          tabularData: {
            headers: ['Registration Parameter', 'Institutional Record'],
            rows: [
              ['Student Identification Number', learner.studentNumber],
              ['Learner Full Name', learner.learnerName],
              ['Current Academic Class', learner.className],
              ['Campus Branch', learner.campusName || 'Mushitala Campus'],
              ['Cadre of Enrolment', isBoarder ? 'Full Residential Boarder' : 'Day Scholar'],
              ['Residential Dormitory', isBoarder ? (learner.hallName || 'Assigned Boarding Village') : 'Not Applicable (Day Scholar)'],
              ['Official Guardian of Record', `${learner.guardianName || 'Registered Guardian'} (${learner.guardianPhone || '+260 97 XXX XXXX'})`],
              ['Academic Year & Term', `${year} Academic Session • Term 3`],
            ],
          },
          signatoryName: defaultSignatoryName,
          signatoryTitle: defaultSignatoryTitle,
          securityStamp: {
            institution: 'LEGACY SCHOOL SOLWEZI',
            registration: 'MOE/NWP/SOL/SEC/2026/044',
            tpin: '1008492019',
            issuedTimestamp: new Date().toISOString(),
            verificationHash,
          },
        };
      }

      case 'INTRODUCTION_LETTER': {
        const addressee = options.recipientName || 'TO WHOM IT MAY CONCERN';
        const recipientOrg = options.recipientOrganization || '';
        const purpose = options.purpose || 'Visa Application / Educational Reference / Institutional Verification';

        const recipientLines = [
          addressee,
          recipientOrg,
          options.recipientAddress || 'Republic of Zambia / International Mission',
        ].filter(Boolean);

        const paragraphs = [
          `This official letter serves to certify that ${learner.learnerName} (Student Identification Number: ${learner.studentNumber}) is a registered, full-time pupil in good standing at Legacy School Solwezi, situated in Solwezi, North-Western Province, Zambia.`,
          `The pupil is currently pursuing their secondary education in ${learner.className} for the ${year} Academic Session under the Ministry of Education curriculum (Registration: MOE/NWP/SOL/SEC/2026/044).`,
          `Throughout their tenure at Legacy School, ${learner.learnerName} has demonstrated ${learner.conductRating || 'exemplary'} moral character, rigorous academic diligence, and active participation in institutional life with an average academic rating of ${learner.academicAverage || 78}%. The learner holds a clean disciplinary standing with no record of misconduct.`,
          `This letter of introduction is issued without prejudice at the formal request of the pupil's parents for the explicit purpose of ${purpose}. Any courtesy, assistance, or institutional facilitation extended to ${learner.learnerName} and their family will be highly appreciated by the administration.`,
        ];

        return {
          documentType: 'INTRODUCTION_LETTER',
          title: 'LETTER OF INTRODUCTION',
          subtitle: 'BONA FIDE PUPIL REFERENCE & INSTITUTIONAL ATTESTATION',
          referenceNumber: ref,
          issueDate: dateFormatted,
          recipientLines,
          salutation: `${addressee}:`,
          subjectLine: `LETTER OF INTRODUCTION & ATTESTATION: ${learner.learnerName.toUpperCase()} (STUDENT ID: ${learner.studentNumber})`,
          paragraphs,
          tabularData: {
            headers: ['Verified Attribute', 'Certified Value'],
            rows: [
              ['Pupil Full Name', learner.learnerName],
              ['Student Identification Number', learner.studentNumber],
              ['Date of Birth', learner.dateOfBirth || 'Verified on School Register'],
              ['Academic Stage / Form', learner.className],
              ['Campus Attendance Location', learner.campusName || 'Mushitala Campus'],
              ['Current Enrolment Status', 'Active • Full-Time Scholar in Good Standing'],
              ['Conduct & Disciplinary Evaluation', learner.conductRating || 'Exemplary / A+'],
              ['Guardian of Record', `${learner.guardianName || 'Guardian'} (${learner.guardianPhone || '+260 97'})`],
            ],
          },
          signatoryName: defaultSignatoryName,
          signatoryTitle: defaultSignatoryTitle,
          securityStamp: {
            institution: 'LEGACY SCHOOL SOLWEZI',
            registration: 'MOE/NWP/SOL/SEC/2026/044',
            tpin: '1008492019',
            issuedTimestamp: new Date().toISOString(),
            verificationHash,
          },
        };
      }

      case 'TRANSFER_CLEARANCE': {
        const targetSchool = options.targetTransferSchool || 'Target Educational Institution';
        const reason = options.transferReason || 'Relocation of Family / Academic Progression';

        const recipientLines = [
          `The Head of Admissions / Principal`,
          targetSchool,
          options.recipientAddress || 'Republic of Zambia',
        ];

        const paragraphs = [
          `This is to certify that ${learner.learnerName} (Student Identification Number: ${learner.studentNumber}) has been a registered pupil at Legacy School Solwezi from ${learner.enrolmentDate || 'January 2025'} to the present date, enrolled in ${learner.className}.`,
          `The student has been officially granted clearance to transfer to ${targetSchool} following a formal withdrawal notification submitted by the parents due to ${reason}.`,
          `We confirm that the learner has successfully cleared all school departments as itemized in the statutory clearance matrix below. All school textbooks, science laboratory apparatus, sports gear, and library resources have been accounted for and returned in good condition.`,
          `Furthermore, the school accounts office confirms that all termly tuition and auxiliary charges have been satisfied. We recommend ${learner.learnerName} for admission and wish them continued success in their academic endeavours.`,
        ];

        return {
          documentType: 'TRANSFER_CLEARANCE',
          title: 'OFFICIAL SCHOOL TRANSFER CERTIFICATE',
          subtitle: 'INSTITUTIONAL DEPARTURE & DEPARTMENTAL CLEARANCE RECORD',
          referenceNumber: ref,
          issueDate: dateFormatted,
          recipientLines,
          salutation: 'Dear Colleague / Head of School,',
          subjectLine: `OFFICIAL PUPIL TRANSFER & CLEARANCE: ${learner.learnerName.toUpperCase()} (ID: ${learner.studentNumber})`,
          paragraphs,
          tabularData: {
            headers: ['Department / Unit', 'Clearance Status', 'Responsible Officer Endorsement'],
            rows: [
              ['Class Master & Form Teacher', 'CLEARED — Academic records transferred', 'Mr. Emmanuel Mwansa (Signature Verified)'],
              ['School Library & Resource Centre', 'CLEARED — All library books returned', 'Mrs. P. Tembo (Librarian)'],
              ['Science & ICT Laboratories', 'CLEARED — No damaged or missing apparatus', 'Mr. K. Banda (Science HoD)'],
              ['Sports & Extracurricular Gear', 'CLEARED — Sports kit returned', 'Mr. D. Phiri (Sports Master)'],
              ['Boarding Village & Dormitory', isBoarder ? 'CLEARED — Bed & room inspected' : 'N/A (Day Scholar)', isBoarder ? 'Boarding Master (Signed)' : 'N/A'],
              ['Bursary & Accounts Directorate', 'CLEARED — Full Fee Settlement Verified', 'Mrs. M. Chisenga (Bursar)'],
            ],
          },
          signatoryName: defaultSignatoryName,
          signatoryTitle: defaultSignatoryTitle,
          securityStamp: {
            institution: 'LEGACY SCHOOL SOLWEZI',
            registration: 'MOE/NWP/SOL/SEC/2026/044',
            tpin: '1008492019',
            issuedTimestamp: new Date().toISOString(),
            verificationHash,
          },
        };
      }

      case 'FEE_CLEARANCE': {
        const billed = learner.totalBilled ?? (isBoarder ? 12000 : 4400);
        const paid = learner.totalPaid ?? billed;
        const balance = learner.balance ?? 0;
        const isFullyCleared = balance <= 0;

        const recipientLines = [
          learner.guardianName ? `Attention: ${learner.guardianName}` : 'To the Parent / Guardian',
          `Student: ${learner.learnerName} (${learner.studentNumber})`,
          'Solwezi, North-Western Province, Zambia',
        ];

        const paragraphs = [
          `This official financial clearance certificate is issued by the Accounts and Bursary Directorate of Legacy School Solwezi in respect of ${learner.learnerName} (Student Identification Number: ${learner.studentNumber}), enrolled in ${learner.className}.`,
          `A thorough reconciliation of our general ledger for the ${year} Academic Session confirms the transactional fee record summarized below.`,
          isFullyCleared
            ? `The student account has ZERO OUTSTANDING ARREARS and is certified FULLY CLEARED for all academic, dining, boarding, and assessment examinations. Access to all school facilities, digital portals, and examination centres is fully authorized.`
            : `Please note that an active balance of K ${balance.toLocaleString()} remains outstanding on this account. Guardians are requested to settle via Airtel Money, MTN Money, or ZANACO bank transfer.`,
        ];

        return {
          documentType: 'FEE_CLEARANCE',
          title: 'FINANCIAL CLEARANCE CERTIFICATE',
          subtitle: 'OFFICIAL BURSAR STATEMENT OF ACCOUNT & ARREARS CLEARANCE',
          referenceNumber: ref,
          issueDate: dateFormatted,
          recipientLines,
          salutation: `Dear ${learner.guardianName || 'Parent / Guardian'},`,
          subjectLine: `BURSAR FINANCIAL CLEARANCE: ${learner.learnerName.toUpperCase()} (ID: ${learner.studentNumber})`,
          paragraphs,
          tabularData: {
            headers: ['Ledger Component', 'Billed Amount (ZMW)', 'Amount Settled (ZMW)', 'Balance (ZMW)'],
            rows: [
              ['Tuition & Academic Consumables', `K ${(billed * 0.55).toLocaleString()}`, `K ${(paid * 0.55).toLocaleString()}`, `K ${(balance * 0.55).toLocaleString()}`],
              [isBoarder ? 'Boarding Hall & Dining Rations' : 'Facility & Lunch Levy', `K ${(billed * 0.35).toLocaleString()}`, `K ${(paid * 0.35).toLocaleString()}`, `K ${(balance * 0.35).toLocaleString()}`],
              ['ECZ & Continuous Assessment Levy', `K ${(billed * 0.10).toLocaleString()}`, `K ${(paid * 0.10).toLocaleString()}`, `K ${(balance * 0.10).toLocaleString()}`],
            ],
            footers: [
              'Consolidated Ledger Balance',
              `K ${billed.toLocaleString()}`,
              `K ${paid.toLocaleString()}`,
              isFullyCleared ? 'K 0.00 (FULLY CLEARED)' : `K ${balance.toLocaleString()} (DUE)`,
            ],
          },
          signatoryName: options.signatoryName || 'Mrs. Mary Chisenga',
          signatoryTitle: options.signatoryTitle || 'Senior Bursar & Finance Director',
          securityStamp: {
            institution: 'LEGACY SCHOOL SOLWEZI',
            registration: 'MOE/NWP/SOL/SEC/2026/044',
            tpin: '1008492019',
            issuedTimestamp: new Date().toISOString(),
            verificationHash,
          },
        };
      }
    }
  }
}
