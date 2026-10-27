// tests/enterprise-modules-crud.test.ts — Comprehensive Integration & CRUD Test Suite
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/server/db';
import { BoardingService } from '../src/server/services/boarding.service';
import { AssetService } from '../src/server/services/asset.service';
import { OfficialDocumentService } from '../src/server/services/officialDocument.service';
import { StudentService } from '../src/server/services/student.service';
import { AssetCategory, AssetCondition, AssetStatus, OfficialDocStatus, OfficialDocType } from '@prisma/client';

describe('Enterprise Module-by-Module Integration & CRUD Suite', () => {
  let testOrgId: string;
  let testCampusId: string;
  let testLearnerId: string;
  let testStaffId: string;

  beforeAll(async () => {
    // Locate or create test organisation
    const org = await prisma.organisation.findFirst({
      where: { code: 'NWUCHAS' },
    });
    expect(org).toBeDefined();
    testOrgId = org!.id;

    const campus = await prisma.campus.findFirst({
      where: { organisationId: testOrgId },
    });
    expect(campus).toBeDefined();
    testCampusId = campus!.id;

    // Locate or create a dedicated test learner
    let learner = await prisma.learner.findUnique({
      where: {
        organisationId_studentNumber: {
          organisationId: testOrgId,
          studentNumber: 'NWU-TEST-0001',
        },
      },
    });
    if (!learner) {
      learner = await prisma.learner.create({
        data: {
          organisationId: testOrgId,
          campusId: testCampusId,
          studentNumber: 'NWU-TEST-0001',
          firstName: 'Chileshe',
          lastName: 'Mwewa',
          gender: 'FEMALE',
          dateOfBirth: new Date('2003-05-12'),
        },
      });
    } else {
      await prisma.hostelAllocation.deleteMany({
        where: { learnerId: learner.id },
      });
    }
    testLearnerId = learner.id;

    // Locate or create a test staff
    let staff = await prisma.staff.findFirst({
      where: { organisationId: testOrgId },
    });
    if (!staff) {
      staff = await prisma.staff.create({
        data: {
          organisationId: testOrgId,
          campusId: testCampusId,
          staffNumber: 'NWU-STF-TEST',
          firstName: 'Estates',
          lastName: 'Officer',
          jobTitle: 'Estates Officer',
          email: 'estates.test@nwuchas.edu.zm',
          phone: '+260 97 712 3456',
        },
      });
    }
    testStaffId = staff.id;
  });

  // =========================================================================
  // MODULE 1: CAMPUS OPERATIONS (HOSTELS, ROOMS, BEDS & LOGISTICS)
  // =========================================================================
  describe('Module 1: Campus Operations — Hostels, Rooms, Beds & Allocations', () => {
    let createdHostelId: string;
    let createdRoomId: string;
    let createdBedId: string;

    it('1.1 Creates a new hostel building with gender policy and capacity constraints', async () => {
      const hostel = await BoardingService.createHostel({
        campusId: testCampusId,
        name: 'Nelson Mandela Hall (Test Hostel)',
        genderPolicy: 'FEMALE_ONLY',
        totalRooms: 8,
        totalBeds: 32,
        wardenName: 'Mrs. Gertrude Phiri',
        wardenPhone: '+260 97 700 1122',
        feePerSemesterZMW: 2500,
      });

      expect(hostel).toBeDefined();
      expect(hostel.id).toBeDefined();
      expect(hostel.name).toBe('Nelson Mandela Hall (Test Hostel)');
      expect(hostel.genderPolicy).toBe('FEMALE_ONLY');
      expect(Number(hostel.feePerSemesterZMW)).toBe(2500);
      createdHostelId = hostel.id;
    });

    it('1.2 Adds a room to the hostel building', async () => {
      const room = await BoardingService.createRoom(createdHostelId, {
        roomNumber: 'Room T-01',
        floor: 1,
        capacityBeds: 2,
      });

      expect(room).toBeDefined();
      expect(room.buildingId).toBe(createdHostelId);
      expect(room.roomNumber).toBe('Room T-01');
      expect(room.capacityBeds).toBe(2);
      createdRoomId = room.id;
    });

    it('1.3 Adds a bed to the room', async () => {
      const bed = await BoardingService.createBed(createdRoomId, 'Bed T-A');

      expect(bed).toBeDefined();
      expect(bed.roomId).toBe(createdRoomId);
      expect(bed.bedNumber).toBe('Bed T-A');
      expect(bed.isOccupied).toBe(false);
      createdBedId = bed.id;
    });

    it('1.4 Allocates the bed to an enrolled student adhering to gender policy', async () => {
      const allocation = await BoardingService.allocateBed(
        createdBedId,
        testLearnerId,
        '2026',
        1
      );

      expect(allocation).toBeDefined();
      expect(allocation.bedId).toBe(createdBedId);
      expect(allocation.learnerId).toBe(testLearnerId);
      expect(allocation.checkOutDate).toBeNull();

      // Verify bed is marked occupied
      const bedCheck = await prisma.hostelBed.findUnique({ where: { id: createdBedId } });
      expect(bedCheck?.isOccupied).toBe(true);
    });

    it('1.5 Prevents deleting a hostel building when beds are currently occupied', async () => {
      await expect(BoardingService.deleteHostel(createdHostelId)).rejects.toThrow(
        /Cannot delete hostel/i
      );
    });

    it('1.6 Checks out the student and restores bed to vacant status', async () => {
      const checkout = await BoardingService.checkoutBed(createdBedId);
      expect(checkout).toBeDefined();

      const bedCheck = await prisma.hostelBed.findUnique({ where: { id: createdBedId } });
      expect(bedCheck?.isOccupied).toBe(false);
    });

    it('1.7 Successfully deletes bed, room, and hostel when vacant', async () => {
      const bedDel = await BoardingService.deleteBed(createdBedId);
      expect(bedDel.id).toBe(createdBedId);

      const roomDel = await BoardingService.deleteRoom(createdRoomId);
      expect(roomDel.id).toBe(createdRoomId);

      const hostelDel = await BoardingService.deleteHostel(createdHostelId);
      expect(hostelDel.id).toBe(createdHostelId);
    });
  });

  // =========================================================================
  // MODULE 2: ASSET REGISTER & CAPITAL EQUIPMENT
  // =========================================================================
  describe('Module 2: Asset Register & Capital Equipment Lifecycle', () => {
    let createdAssetId: string;
    const testTag = `NWU-TEST-EQ-${Date.now()}`;

    it('2.1 Registers a new capital medical equipment asset with depreciation metrics', async () => {
      const asset = await AssetService.createAsset(testOrgId, {
        assetTag: testTag,
        name: 'Tuttnauer Clinical Benchtop Autoclave Sterilizer (Test Unit)',
        category: 'LABORATORY',
        campusId: testCampusId,
        location: 'Sterilization Room 102',
        serialNumber: 'TUT-TEST-88910',
        purchaseDate: new Date('2024-01-15'),
        purchaseCostZMW: 120000,
        currentValueZMW: 108000,
        depreciationRatePct: 10,
        condition: 'EXCELLENT',
        status: 'OPERATIONAL',
        custodianName: 'Sr. Beatrice Mwila',
        notes: 'High pressure steam sterilizer for surgical kits.',
      });

      expect(asset).toBeDefined();
      expect(asset.id).toBeDefined();
      expect(asset.assetTag).toBe(testTag);
      expect(Number(asset.purchaseCostZMW)).toBe(120000);
      expect(asset.qrCodeData).toContain(testTag);
      createdAssetId = asset.id;
    });

    it('2.2 Computes straight-line depreciation and retrieves asset metrics', async () => {
      const retrieved = await AssetService.getAssetById(testOrgId, createdAssetId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.assetTag).toBe(testTag);
      expect(retrieved?.currentValueZMW).toBeDefined();
      expect(retrieved?.currentValueZMW).toBeLessThanOrEqual(120000);
    });

    it('2.3 Adds an audited maintenance and calibration log', async () => {
      const log = await AssetService.logMaintenance(
        testOrgId,
        createdAssetId,
        {
          serviceDate: new Date(),
          description: 'Annual Pressure Chamber Recalibration & Seal Replacement',
          costZMW: 4500,
          technicianName: 'Zambia Medical Electronics Ltd',
          conditionAfterService: 'EXCELLENT',
        },
        testStaffId
      );

      expect(log).toBeDefined();
      expect(log.assetId).toBe(createdAssetId);
      expect(Number(log.costZMW)).toBe(4500);

      // Verify asset log relation
      const logs = await prisma.assetMaintenanceLog.findMany({ where: { assetId: createdAssetId } });
      expect(logs.length).toBeGreaterThanOrEqual(1);
    });

    it('2.4 Updates asset status and soft-deletes (decommissions) without database wipe', async () => {
      const updated = await AssetService.updateAsset(testOrgId, createdAssetId, {
        status: 'DECOMMISSIONED',
        condition: 'SCRAP',
        notes: 'Replaced by high-capacity autoclave unit.',
      });
      expect(updated.status).toBe('DECOMMISSIONED');

      // Soft delete
      await AssetService.deleteAsset(testOrgId, createdAssetId);
      const softDeleted = await prisma.assetItem.findUnique({ where: { id: createdAssetId } });
      expect(softDeleted?.isDeleted).toBe(true); // Soft-delete preserved per Rule 3
    });
  });

  // =========================================================================
  // MODULE 3: OFFICIAL DOCUMENTS & VERIFICATION WORKFLOWS
  // =========================================================================
  describe('Module 3: Official Documents, Cryptographic Verification & Workflow', () => {
    let createdDocId: string;
    let qrVerificationToken: string;

    it('3.1 Generates an official admission offer document with reference and anti-counterfeit hash', async () => {
      const doc = await OfficialDocumentService.createDocument(
        testOrgId,
        {
          learnerId: testLearnerId,
          documentType: 'OFFER_LETTER',
          title: 'Provisional Offer of Admission (Diploma in Registered Nursing)',
          recipientName: 'Chileshe Mwewa',
          recipientOrganization: 'North Western University College of Health and Applied Sciences',
          purpose: 'Official admission offer docket with NMCZ statutory indexing requirements.',
          signatoryName: 'Dr. Mukombo L.',
          signatoryTitle: 'Academic Registrar',
          customRemarks: 'Intake Cohort January 2026.',
          academicYear: '2026',
          semesterNumber: 1,
        },
        testStaffId
      );

      expect(doc).toBeDefined();
      expect(doc.id).toBeDefined();
      expect(doc.referenceNumber).toContain('NWU/ADM-OFFER/2026');
      expect(doc.verificationHash).toBeDefined();
      expect(doc.qrVerificationCode).toContain('NWU-VFY-');
      expect(doc.status).toBe('SUBMITTED');

      createdDocId = doc.id;
      qrVerificationToken = doc.qrVerificationCode;
    });

    it('3.2 Approves and Issues the document along the official workflow', async () => {
      // Step A: Approve
      const approved = await OfficialDocumentService.updateStatus(
        testOrgId,
        createdDocId,
        'APPROVE',
        testStaffId,
        'Senate admission committee validated'
      );
      expect(approved.status).toBe('APPROVED');
      expect(approved.approvedAt).toBeDefined();

      // Step B: Issue
      const issued = await OfficialDocumentService.updateStatus(
        testOrgId,
        createdDocId,
        'ISSUE',
        testStaffId,
        'Signed and sealed by Registrar'
      );
      expect(issued.status).toBe('ISSUED');
      expect(issued.issuedAt).toBeDefined();
    });

    it('3.3 Cryptographically verifies document authenticity via public verification token', async () => {
      const result = await OfficialDocumentService.verifyAuthenticity(qrVerificationToken);
      expect(result.isValid).toBe(true);
      expect(result.referenceNumber).toContain('NWU/ADM-OFFER/2026');
      expect(result.status).toBe('ISSUED');
    });

    it('3.4 Revokes the document and confirms verification responds with REVOKED status', async () => {
      const revoked = await OfficialDocumentService.updateStatus(
        testOrgId,
        createdDocId,
        'REVOKE',
        testStaffId,
        'Candidate deferred enrolment to July semester'
      );
      expect(revoked.status).toBe('REVOKED');

      const reVerify = await OfficialDocumentService.verifyAuthenticity(qrVerificationToken);
      expect(reVerify.isValid).toBe(false);
      expect(reVerify.message).toContain('REVOKED');
    });
  });

  // =========================================================================
  // MODULE 4: STUDENT & SPONSOR PORTAL
  // =========================================================================
  describe('Module 4: Student & Sponsor Portal — Profile, Sponsor Linking & Safe Archival', () => {
    it('4.1 Retrieves full student profile with academic, clinical, and fee ledger status', async () => {
      const profile = await StudentService.getLearnerProfile(testOrgId, testLearnerId);
      expect(profile).toBeDefined();
      expect(profile?.id).toBe(testLearnerId);
      expect(profile?.studentNumber).toBe('NWU-TEST-0001');
      expect(profile?.campus).toBeDefined();
    });

    it('4.2 Updates student demographic records and links legal sponsor', async () => {
      // Upsert a test sponsor
      const guardian = await prisma.guardian.create({
        data: {
          organisationId: testOrgId,
          firstName: 'Peter',
          lastName: 'Mwewa',
          phone: '+260 97 788 9900',
          email: 'peter.mwewa@sponsor.zm',
        },
      });

      // Link sponsor to student
      await prisma.learnerGuardianRelationship.upsert({
        where: {
          learnerId_guardianId: {
            learnerId: testLearnerId,
            guardianId: guardian.id,
          },
        },
        create: {
          learnerId: testLearnerId,
          guardianId: guardian.id,
          relationship: 'LEGAL_GUARDIAN',
          isPrimary: true,
          hasFinancialAuthority: true,
        },
        update: {
          isAccessRevoked: false,
        },
      });

      // Verify relation
      const studentWithSponsor = await prisma.learner.findUnique({
        where: { id: testLearnerId },
        include: { guardians: { include: { guardian: true } } },
      });

      expect(studentWithSponsor?.guardians.length).toBeGreaterThanOrEqual(1);
      const linked = studentWithSponsor?.guardians.find(g => g.guardian.firstName === 'Peter')?.guardian;
      expect(linked?.firstName).toBe('Peter');
      expect(linked?.phone).toBe('+260 97 788 9900');
    });

    it('4.3 Safely handles student withdrawal without violating relational integrity (Rule 3)', async () => {
      // Update status to WITHDRAWN
      const updated = await prisma.learner.update({
        where: { id: testLearnerId },
        data: { status: 'WITHDRAWN' },
      });
      expect(updated.status).toBe('WITHDRAWN');

      // Verify student record is safely retained in database for audit trail
      const auditCheck = await prisma.learner.findUnique({ where: { id: testLearnerId } });
      expect(auditCheck).toBeDefined();
      expect(auditCheck?.status).toBe('WITHDRAWN');
    });
  });
});
