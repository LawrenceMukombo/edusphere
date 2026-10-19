// tests/official-documents.test.ts
import { describe, it, expect } from 'vitest';
import {
  DocumentTemplateService,
  DocumentLearnerProfile,
} from '../src/server/services/documentTemplate.service';

describe('Official Institutional Document Generator Engine (DOC-001)', () => {
  const sampleLearner: DocumentLearnerProfile = {
    studentNumber: 'LSS-2026-1044',
    learnerName: 'Chanda Emmanuel Musonda',
    className: 'Grade 10 Blue',
    campusName: 'Mushitala Campus (Near Kansanshi)',
    studentType: 'BOARDER',
    gender: 'MALE',
    dateOfBirth: '2010-06-14',
    guardianName: 'Dr. Mwamba Musonda',
    guardianPhone: '+260 97 712 3456',
    guardianEmail: 'mwamba.musonda@zambia.co.zm',
    residentialAddress: 'Plot 442 Kansanshi Golf Estate, Solwezi',
    hallName: 'Kansanshi Boys Boarding Hall',
    dormRoom: 'Room B-12',
    bedNumber: 'Bed #4',
    conductRating: 'Exemplary (A+)',
    academicAverage: 82.5,
    totalBilled: 12000,
    totalPaid: 12000,
    balance: 0,
  };

  it('generates an official Offer Letter with fee breakdown and requirements', () => {
    const doc = DocumentTemplateService.generateDocument(sampleLearner, {
      documentType: 'OFFER_LETTER',
      academicYear: '2026',
    });

    expect(doc.documentType).toBe('OFFER_LETTER');
    expect(doc.title).toBe('OFFER OF ADMISSION');
    expect(doc.referenceNumber).toContain('LSS/ADM-OFFER/2026');
    expect(doc.paragraphs.some((p) => p.includes('Chanda Emmanuel Musonda'))).toBe(true);
    expect(doc.tabularData).toBeDefined();
    expect(doc.tabularData?.rows.length).toBeGreaterThanOrEqual(4);
    expect(doc.requirementsList).toBeDefined();
    expect(doc.securityStamp.registration).toBe('MOE/NWP/SOL/SEC/2026/044');
    expect(doc.securityStamp.tpin).toBe('1008492019');
  });

  it('generates an Enrolment Acceptance Letter with student ID & room details', () => {
    const doc = DocumentTemplateService.generateDocument(sampleLearner, {
      documentType: 'ACCEPTANCE_LETTER',
    });

    expect(doc.documentType).toBe('ACCEPTANCE_LETTER');
    expect(doc.title).toBe('CONFIRMATION OF ENROLMENT');
    expect(doc.referenceNumber).toContain('LSS/CONF-ENR/2026');
    expect(doc.paragraphs.some((p) => p.includes('LSS-2026-1044'))).toBe(true);
    expect(doc.paragraphs.some((p) => p.includes('Kansanshi Boys Boarding Hall'))).toBe(true);
  });

  it('generates an Introduction Letter for Visa/Bank/Embassy with verified attributes', () => {
    const doc = DocumentTemplateService.generateDocument(sampleLearner, {
      documentType: 'INTRODUCTION_LETTER',
      recipientName: 'The Consular Officer',
      recipientOrganization: 'Embassy of the Republic of South Africa',
      purpose: 'Minor Student Study Visa Clearance',
    });

    expect(doc.documentType).toBe('INTRODUCTION_LETTER');
    expect(doc.title).toBe('LETTER OF INTRODUCTION');
    expect(doc.referenceNumber).toContain('LSS/REF-INTRO/2026');
    expect(doc.paragraphs.some((p) => p.includes('Minor Student Study Visa Clearance'))).toBe(true);
    expect(doc.paragraphs.some((p) => p.includes('good standing'))).toBe(true);
  });

  it('generates a School Transfer Certificate with full departmental clearance matrix', () => {
    const doc = DocumentTemplateService.generateDocument(sampleLearner, {
      documentType: 'TRANSFER_CLEARANCE',
      targetTransferSchool: 'Chengelo School, Mkushi',
      transferReason: 'Family Relocation to Central Province',
    });

    expect(doc.documentType).toBe('TRANSFER_CLEARANCE');
    expect(doc.title).toBe('OFFICIAL SCHOOL TRANSFER CERTIFICATE');
    expect(doc.referenceNumber).toContain('LSS/TRF-CLR/2026');
    expect(doc.paragraphs.some((p) => p.includes('Chengelo School, Mkushi'))).toBe(true);
    expect(doc.tabularData?.headers).toContain('Clearance Status');
  });

  it('generates a Bursar Financial Clearance Certificate confirming zero balance', () => {
    const doc = DocumentTemplateService.generateDocument(sampleLearner, {
      documentType: 'FEE_CLEARANCE',
    });

    expect(doc.documentType).toBe('FEE_CLEARANCE');
    expect(doc.title).toBe('FINANCIAL CLEARANCE CERTIFICATE');
    expect(doc.referenceNumber).toContain('LSS/BURSAR-CLR/2026');
    expect(doc.paragraphs.some((p) => p.includes('ZERO OUTSTANDING ARREARS'))).toBe(true);
    expect(doc.tabularData?.footers?.some((f) => String(f).includes('FULLY CLEARED'))).toBe(true);
  });
});
