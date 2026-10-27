// src/server/services/officialDocument.service.ts — Enterprise Official Document & Verification Service
import { prisma } from '../db';
import { OfficialDocStatus, OfficialDocType, Prisma } from '@prisma/client';
import crypto from 'crypto';

export interface CreateDocumentInput {
  learnerId?: string;
  documentType: OfficialDocType;
  title?: string;
  recipientName?: string;
  recipientOrganization?: string;
  purpose?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  customRemarks?: string;
  academicYear?: string;
  semesterNumber?: number;
}

export class OfficialDocumentService {
  /**
   * Generates a unique, anti-counterfeit institutional reference number
   */
  static generateReference(type: OfficialDocType, studentNumber?: string): string {
    const year = new Date().getFullYear();
    const entropy = Math.floor(1000 + Math.random() * 9000);
    const cleanId = studentNumber ? `${studentNumber.replace(/[^A-Za-z0-9]/g, '').slice(-4)}-${entropy}` : entropy;
    const prefixMap: Record<OfficialDocType, string> = {
      OFFER_LETTER: 'ADM-OFFER',
      ACCEPTANCE_LETTER: 'CONF-ENR',
      INTRODUCTION_LETTER: 'REF-INTRO',
      TRANSFER_CLEARANCE: 'TRF-CLR',
      FEE_CLEARANCE: 'BURSAR-CLR',
      ACADEMIC_TRANSCRIPT: 'ACA-TRNS',
      BONAFIDE_STUDENT: 'REG-BONA',
      CLINICAL_COMPLETION: 'CLN-COMPL',
    };
    return `NWU/${prefixMap[type] || 'DOC'}/${year}/${cleanId}`;
  }

  /**
   * Generates SHA-256 verification signature and public QR verification code
   */
  static generateSecurityTokens(reference: string, orgId: string, studentNumber?: string) {
    const raw = `${reference}:${orgId}:${studentNumber || 'GENERAL'}:NWUCHAS_OFFICIAL_ARCHIVE`;
    const verificationHash = crypto.createHash('sha256').update(raw).digest('hex').toUpperCase();
    const qrVerificationCode = `NWU-VFY-${verificationHash.slice(0, 16)}`;
    return { verificationHash, qrVerificationCode };
  }

  /**
   * List institutional documents with filters
   */
  static async listDocuments(
    organisationId: string,
    filters: {
      learnerId?: string;
      documentType?: OfficialDocType;
      status?: OfficialDocStatus;
      search?: string;
    } = {}
  ) {
    const where: Prisma.OfficialDocumentWhereInput = {
      organisationId,
      isArchived: false,
    };

    if (filters.learnerId) where.learnerId = filters.learnerId;
    if (filters.documentType) where.documentType = filters.documentType;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { referenceNumber: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
        { recipientName: { contains: filters.search, mode: 'insensitive' } },
        { recipientOrganization: { contains: filters.search, mode: 'insensitive' } },
        { purpose: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.officialDocument.findMany({
      where,
      include: {
        learner: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
            gender: true,
            currentClass: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Retrieve document by ID with parsed payload
   */
  static async getDocumentById(organisationId: string, documentId: string) {
    const doc = await prisma.officialDocument.findFirst({
      where: { id: documentId, organisationId, isArchived: false },
      include: {
        learner: {
          include: {
            campus: true,
            currentClass: true,
            invoices: { include: { lines: true } },
            payments: { include: { receipt: true } },
            scores: { include: { assessment: { include: { subject: true } } } },
            hostelAllocations: { include: { bed: { include: { room: { include: { building: true } } } } } },
          },
        },
      },
    });

    if (!doc) return null;

    let payload: any = {};
    try {
      payload = JSON.parse(doc.payloadJson);
    } catch {}

    return {
      ...doc,
      payload,
    };
  }

  /**
   * Create and compile an official institutional document
   */
  static async createDocument(
    organisationId: string,
    input: CreateDocumentInput,
    creatorId?: string
  ) {
    let student: any = null;
    if (input.learnerId) {
      student = await prisma.learner.findUnique({
        where: { id: input.learnerId },
        include: {
          campus: true,
          currentClass: true,
          invoices: true,
          payments: true,
        },
      });
    }

    const referenceNumber = this.generateReference(input.documentType, student?.studentNumber);
    const { verificationHash, qrVerificationCode } = this.generateSecurityTokens(
      referenceNumber,
      organisationId,
      student?.studentNumber
    );

    // Build title
    const titles: Record<OfficialDocType, string> = {
      OFFER_LETTER: 'OFFER OF ADMISSION',
      ACCEPTANCE_LETTER: 'CONFIRMATION OF ENROLMENT',
      INTRODUCTION_LETTER: 'LETTER OF INTRODUCTION',
      TRANSFER_CLEARANCE: 'OFFICIAL SCHOOL TRANSFER CERTIFICATE',
      FEE_CLEARANCE: 'BURSARY FINANCIAL CLEARANCE CERTIFICATE',
      ACADEMIC_TRANSCRIPT: 'OFFICIAL ACADEMIC TRANSCRIPT',
      BONAFIDE_STUDENT: 'BONAFIDE STUDENT CERTIFICATE',
      CLINICAL_COMPLETION: 'CLINICAL PRACTICUM CLEARANCE',
    };

    const title = input.title || titles[input.documentType] || 'OFFICIAL INSTITUTIONAL DOCUMENT';

    // Compile comprehensive document payload
    const studentName = student ? `${student.firstName} ${student.lastName}` : input.recipientName || 'Candidate';
    const totalBilled = student ? student.invoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount || 0), 0) : 0;
    const totalPaid = student ? student.payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0) : 0;
    const balance = Math.max(0, totalBilled - totalPaid);

    const payload = {
      referenceNumber,
      documentType: input.documentType,
      title,
      studentNumber: student?.studentNumber || null,
      studentName,
      programme: student?.currentClass?.name || 'Diploma in Registered Nursing',
      campusName: student?.campus?.name || 'Manyama Main Campus',
      recipientName: input.recipientName || null,
      recipientOrganization: input.recipientOrganization || null,
      purpose: input.purpose || null,
      customRemarks: input.customRemarks || null,
      academicYear: input.academicYear || '2026',
      totalBilled,
      totalPaid,
      balance,
      clearanceStatus: balance === 0 ? 'FULLY_CLEARED' : 'ARREARS_PENDING',
      securityStamp: {
        institution: 'North Western University College of Health and Applied Sciences (NWUCHAS)',
        registration: 'MOE/NWP/SOL/HE/2026/044',
        tpin: '1008492019',
        verificationHash,
        qrVerificationCode,
        issuedTimestamp: new Date().toISOString(),
      },
    };

    return prisma.officialDocument.create({
      data: {
        organisationId,
        learnerId: input.learnerId || null,
        documentType: input.documentType,
        status: OfficialDocStatus.SUBMITTED,
        referenceNumber,
        title,
        recipientName: input.recipientName?.trim() || null,
        recipientOrganization: input.recipientOrganization?.trim() || null,
        purpose: input.purpose?.trim() || null,
        signatoryName: input.signatoryName || 'Office of the Registrar',
        signatoryTitle: input.signatoryTitle || 'Academic Registrar',
        payloadJson: JSON.stringify(payload),
        qrVerificationCode,
        verificationHash,
        issuedById: creatorId || null,
      },
      include: {
        learner: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Transition document workflow status: APPROVE, ISSUE, REJECT, REVOKE
   */
  static async updateStatus(
    organisationId: string,
    documentId: string,
    action: 'APPROVE' | 'ISSUE' | 'REJECT' | 'REVOKE',
    actorId?: string,
    notes?: string
  ) {
    const doc = await prisma.officialDocument.findFirst({
      where: { id: documentId, organisationId, isArchived: false },
    });

    if (!doc) throw new Error('Document record not found.');

    const now = new Date();
    let status: OfficialDocStatus;
    const updateData: Prisma.OfficialDocumentUpdateInput = {};

    switch (action) {
      case 'APPROVE':
        status = OfficialDocStatus.APPROVED;
        updateData.status = status;
        updateData.approvedAt = now;
        updateData.approvedById = actorId || null;
        break;
      case 'ISSUE':
        status = OfficialDocStatus.ISSUED;
        updateData.status = status;
        updateData.issuedAt = now;
        updateData.issuedById = actorId || null;
        break;
      case 'REJECT':
        status = OfficialDocStatus.REJECTED;
        updateData.status = status;
        updateData.rejectionReason = notes || 'Document issuance rejected by Academic Senate.';
        break;
      case 'REVOKE':
        status = OfficialDocStatus.REVOKED;
        updateData.status = status;
        updateData.rejectionReason = notes || 'Document revoked due to academic/disciplinary hold.';
        break;
      default:
        throw new Error(`Unsupported document workflow action: ${action}`);
    }

    return prisma.officialDocument.update({
      where: { id: documentId },
      data: updateData,
      include: { learner: true },
    });
  }

  /**
   * Safe soft-delete / archival
   */
  static async archiveDocument(organisationId: string, documentId: string) {
    return prisma.officialDocument.update({
      where: { id: documentId },
      data: { isArchived: true, status: OfficialDocStatus.REVOKED },
    });
  }

  /**
   * Verify document authenticity from public QR code or reference
   */
  static async verifyAuthenticity(codeOrRef: string) {
    const doc = await prisma.officialDocument.findFirst({
      where: {
        OR: [
          { qrVerificationCode: codeOrRef },
          { referenceNumber: codeOrRef },
        ],
      },
      include: {
        organisation: { select: { name: true, officialName: true, code: true } },
        learner: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
            gender: true,
            currentClass: { select: { name: true } },
          },
        },
      },
    });

    if (!doc) {
      return {
        isValid: false,
        message: 'No institutional document found matching this verification token.',
      };
    }

    if (doc.status === OfficialDocStatus.REVOKED) {
      return {
        isValid: false,
        isRevoked: true,
        message: 'WARNING: This document was formally REVOKED by the College Registrar.',
        doc,
      };
    }

    return {
      isValid: true,
      status: doc.status,
      referenceNumber: doc.referenceNumber,
      title: doc.title,
      studentNumber: doc.learner?.studentNumber || 'N/A',
      studentName: doc.learner ? `${doc.learner.firstName} ${doc.learner.lastName}` : doc.recipientName,
      programme: doc.learner?.currentClass?.name || 'Tertiary Health Programme',
      institution: doc.organisation.officialName || doc.organisation.name,
      issuedAt: doc.issuedAt || doc.createdAt,
      signatory: `${doc.signatoryName} (${doc.signatoryTitle})`,
      verificationHash: doc.verificationHash,
    };
  }
}
