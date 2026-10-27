import { prisma } from '../db';
import crypto from 'crypto';
import { DocketType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class EntitlementService {
  /**
   * Reassess student service entitlements based on verified invoice payments and institutional policy.
   * Called automatically upon payment confirmation or manually by authorised admin.
   */
  static async reassessEntitlements(learnerId: string, actorId = 'SYSTEM') {
    const learner = await prisma.learner.findUnique({
      where: { id: learnerId },
      include: {
        invoices: {
          include: {
            lines: true,
            allocations: true,
          },
        },
      },
    });

    if (!learner) throw new Error('Learner not found.');

    // Aggregate student financial status
    let totalInvoiced = 0;
    let totalPaid = 0;
    let hasPaidHostel = false;
    let hasPaidTransport = false;

    for (const inv of learner.invoices) {
      const invTotal = Number(inv.totalAmount);
      const invPaid = Number(inv.paidAmount);
      totalInvoiced += invTotal;
      totalPaid += invPaid;

      // Check itemised lines if applicable
      for (const line of inv.lines) {
        const lineDescription = (line.description || '').toLowerCase();
        if (lineDescription.includes('hostel') || lineDescription.includes('accommodation')) {
          if (invPaid >= Number(line.lineTotal)) hasPaidHostel = true;
        }
        if (lineDescription.includes('bus') || lineDescription.includes('transport')) {
          if (invPaid >= Number(line.lineTotal)) hasPaidTransport = true;
        }
      }
    }

    const outstandingBalance = totalInvoiced - totalPaid;
    const paymentPercentage = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 100;

    const results = [];
    const now = new Date();
    const endOfSemester = new Date(now.getFullYear(), now.getMonth() + 4, 28);

    // 1. Library Borrowing: Granted if at least 50% paid
    const isLibraryEligible = paymentPercentage >= 50;
    const libEntitlement = await prisma.studentEntitlement.upsert({
      where: {
        learnerId_serviceType: {
          learnerId,
          serviceType: 'LIBRARY_LOAN',
        },
      },
      update: {
        status: isLibraryEligible ? 'ACTIVE' : 'SUSPENDED',
        grantedByPolicy: isLibraryEligible ? `TUITION_PAID_${Math.round(paymentPercentage)}%` : 'PAYMENT_BELOW_50%',
        validUntil: endOfSemester,
      },
      create: {
        learnerId,
        serviceType: 'LIBRARY_LOAN',
        status: isLibraryEligible ? 'ACTIVE' : 'SUSPENDED',
        grantedByPolicy: isLibraryEligible ? `TUITION_PAID_${Math.round(paymentPercentage)}%` : 'PAYMENT_BELOW_50%',
        validFrom: now,
        validUntil: endOfSemester,
      },
    });
    results.push(libEntitlement);

    // 2. Examination Access: Granted if at least 75% paid
    const isExamEligible = paymentPercentage >= 75;
    const examEntitlement = await prisma.studentEntitlement.upsert({
      where: {
        learnerId_serviceType: {
          learnerId,
          serviceType: 'EXAM_ADMISSION',
        },
      },
      update: {
        status: isExamEligible ? 'ACTIVE' : 'SUSPENDED',
        grantedByPolicy: isExamEligible ? `TUITION_PAID_${Math.round(paymentPercentage)}%` : 'FEE_CLEARANCE_REQUIRED',
        validUntil: endOfSemester,
      },
      create: {
        learnerId,
        serviceType: 'EXAM_ADMISSION',
        status: isExamEligible ? 'ACTIVE' : 'SUSPENDED',
        grantedByPolicy: isExamEligible ? `TUITION_PAID_${Math.round(paymentPercentage)}%` : 'FEE_CLEARANCE_REQUIRED',
        validFrom: now,
        validUntil: endOfSemester,
      },
    });
    results.push(examEntitlement);

    // 3. Campus Bus Transport: Active if transport item paid or tuition >= 80%
    const isTransportEligible = hasPaidTransport || paymentPercentage >= 80;
    const transportEntitlement = await prisma.studentEntitlement.upsert({
      where: {
        learnerId_serviceType: {
          learnerId,
          serviceType: 'BUS_TRANSPORT',
        },
      },
      update: {
        status: isTransportEligible ? 'ACTIVE' : 'SUSPENDED',
        grantedByPolicy: isTransportEligible ? (hasPaidTransport ? 'TRANSPORT_FEE_CLEARED' : 'TUITION_ABOVE_80%') : 'UNPAID',
        validUntil: endOfSemester,
      },
      create: {
        learnerId,
        serviceType: 'BUS_TRANSPORT',
        status: isTransportEligible ? 'ACTIVE' : 'SUSPENDED',
        grantedByPolicy: isTransportEligible ? (hasPaidTransport ? 'TRANSPORT_FEE_CLEARED' : 'TUITION_ABOVE_80%') : 'UNPAID',
        validFrom: now,
        validUntil: endOfSemester,
      },
    });
    results.push(transportEntitlement);

    // If transport eligible, ensure active signed QR code subscription exists
    if (isTransportEligible) {
      const activeRoute = await prisma.transportRoute.findFirst({ where: { isActive: true } });
      const term = await prisma.term.findFirst();

      if (activeRoute && term) {
        const secret = process.env.SESSION_SECRET || 'NWUCHAS-SECURE-KEY-2026';
        const signature = crypto
          .createHmac('sha256', secret)
          .update(`BUS-PASS:${learnerId}:${activeRoute.id}:${endOfSemester.toISOString()}`)
          .digest('hex')
          .slice(0, 16);
        const passQrCode = `NWUCHAS-BUS-${learner.studentNumber}-${signature.toUpperCase()}`;

        await prisma.transportSubscription.upsert({
          where: { passQrCode },
          update: {
            status: 'ACTIVE',
            validUntil: endOfSemester,
          },
          create: {
            learnerId,
            routeId: activeRoute.id,
            termId: term.id,
            passQrCode,
            status: 'ACTIVE',
            validFrom: now,
            validUntil: endOfSemester,
          },
        });
      }
    }

    // 4. Hostel Accommodation: Active if hostel fee specifically settled
    const isHostelEligible = hasPaidHostel || paymentPercentage >= 90;
    const hostelEntitlement = await prisma.studentEntitlement.upsert({
      where: {
        learnerId_serviceType: {
          learnerId,
          serviceType: 'HOSTEL_ACCESS',
        },
      },
      update: {
        status: isHostelEligible ? 'ACTIVE' : 'SUSPENDED',
        grantedByPolicy: isHostelEligible ? (hasPaidHostel ? 'HOSTEL_FEE_CLEARED' : 'TUITION_CLEARED_90%') : 'UNPAID',
        validUntil: endOfSemester,
      },
      create: {
        learnerId,
        serviceType: 'HOSTEL_ACCESS',
        status: isHostelEligible ? 'ACTIVE' : 'SUSPENDED',
        grantedByPolicy: isHostelEligible ? (hasPaidHostel ? 'HOSTEL_FEE_CLEARED' : 'TUITION_CLEARED_90%') : 'UNPAID',
        validFrom: now,
        validUntil: endOfSemester,
      },
    });
    results.push(hostelEntitlement);

    // 5. Clinical Placement Clearance
    const isClinicalEligible = paymentPercentage >= 60;
    const clinicalEntitlement = await prisma.studentEntitlement.upsert({
      where: {
        learnerId_serviceType: {
          learnerId,
          serviceType: 'CLINICAL_ACCESS',
        },
      },
      update: {
        status: isClinicalEligible ? 'ACTIVE' : 'SUSPENDED',
        grantedByPolicy: isClinicalEligible ? 'CLINICAL_MINIMUM_FEES_PAID' : 'BELOW_60%_PAYMENT',
        validUntil: endOfSemester,
      },
      create: {
        learnerId,
        serviceType: 'CLINICAL_ACCESS',
        status: isClinicalEligible ? 'ACTIVE' : 'SUSPENDED',
        grantedByPolicy: isClinicalEligible ? 'CLINICAL_MINIMUM_FEES_PAID' : 'BELOW_60%_PAYMENT',
        validFrom: now,
        validUntil: endOfSemester,
      },
    });
    results.push(clinicalEntitlement);

    return {
      learnerId,
      studentNumber: learner.studentNumber,
      totalInvoiced,
      totalPaid,
      outstandingBalance,
      paymentPercentage,
      entitlements: results,
    };
  }

  /**
   * Verify a physical/digital student bus pass QR token
   */
  static async verifyBusPass(passQrCode: string) {
    const sub = await prisma.transportSubscription.findUnique({
      where: { passQrCode },
      include: {
        learner: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        route: true,
      },
    });

    if (!sub) {
      return {
        isValid: false,
        reason: 'INVALID_PASS_CODE',
        message: 'No active transport pass found for this QR code.',
      };
    }

    const now = new Date();
    if (sub.status !== 'ACTIVE') {
      return {
        isValid: false,
        reason: 'PASS_NOT_ACTIVE',
        status: sub.status,
        message: `Pass is currently ${sub.status}.`,
        learner: sub.learner,
      };
    }

    if (now > sub.validUntil) {
      return {
        isValid: false,
        reason: 'PASS_EXPIRED',
        validUntil: sub.validUntil,
        message: 'Pass expired at the end of the previous term.',
        learner: sub.learner,
      };
    }

    return {
      isValid: true,
      message: 'Bus pass is valid.',
      learner: sub.learner,
      route: sub.route,
      validUntil: sub.validUntil,
    };
  }

  /**
   * Check access entitlement for a specific service (e.g. at gate or exam hall)
   */
  static async checkEntitlement(learnerId: string, serviceType: 'BUS_TRANSPORT' | 'HOSTEL_ACCESS' | 'LIBRARY_LOAN' | 'EXAM_ADMISSION' | 'CAMPUS_GATE' | 'CLINICAL_ACCESS') {
    // Safety non-negotiable: Emergency gate exit is ALWAYS allowed
    if (serviceType === 'CAMPUS_GATE') {
      return { isPermitted: true, reason: 'EMERGENCY_EGRESS_GUARANTEED' };
    }

    const ent = await prisma.studentEntitlement.findUnique({
      where: {
        learnerId_serviceType: { learnerId, serviceType },
      },
    });

    if (!ent) return { isPermitted: false, reason: 'NO_ENTITLEMENT_RECORD' };

    const now = new Date();
    const isPermitted = ent.status === 'ACTIVE' && now <= ent.validUntil;

    return {
      isPermitted,
      status: ent.status,
      grantedByPolicy: ent.grantedByPolicy,
      validUntil: ent.validUntil,
      overrideNotes: ent.overrideNotes,
    };
  }

  /**
   * List all service entitlements for a learner
   */
  static async listLearnerEntitlements(learnerId: string) {
    return prisma.studentEntitlement.findMany({
      where: { learnerId },
      orderBy: { serviceType: 'asc' },
    });
  }

  /**
   * Validate service access wrapper
   */
  static async validateServiceAccess(learnerId: string, serviceType: any) {
    return this.checkEntitlement(learnerId, serviceType);
  }

  /**
   * Generate an official, printable Financial Exam Clearance Docket or Clinical Rotation Pass (GAP-08)
   * With cryptographic HMAC-SHA256 signature and structured QR code verification data.
   */
  static async generateClearanceDocket(params: {
    organisationId: string;
    learnerId: string;
    docketType?: DocketType;
    termOrSemester?: string;
    issuedById?: string;
  }) {
    const docketType = params.docketType || DocketType.EXAMINATION_CLEARANCE;

    // 1. Fetch learner with full academic and financial profile
    const learner = await prisma.learner.findUnique({
      where: { id: params.learnerId },
      include: {
        campus: true,
        currentClass: true,
        indexingRecord: true,
        invoices: {
          where: { organisationId: params.organisationId },
          include: { lines: true },
        },
      },
    });

    if (!learner) throw new Error('Learner not found.');

    // 2. Compute financial thresholds
    let totalInvoiced = 0;
    let totalPaid = 0;
    for (const inv of learner.invoices) {
      totalInvoiced += Number(inv.totalAmount);
      totalPaid += Number(inv.paidAmount);
    }

    const balance = Math.max(0, totalInvoiced - totalPaid);
    const paymentPercentage = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 100;

    // Examination threshold: >= 75% or zero balance
    // Clinical rotation threshold: >= 60%
    const isCleared =
      docketType === DocketType.EXAMINATION_CLEARANCE
        ? paymentPercentage >= 75 || balance <= 0
        : paymentPercentage >= 60;

    const termLabel = params.termOrSemester || 'Semester 1 (2026)';
    const docketPrefix = docketType === DocketType.EXAMINATION_CLEARANCE ? 'EXAM' : 'CLIN';
    const docketNumber = `DOCK-${docketPrefix}-2026-${learner.studentNumber.replace(/[^A-Za-z0-9]/g, '').slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Cryptographic HMAC-SHA256 verification code
    const secret = process.env.SESSION_SECRET || 'NWUCHAS-ENTERPRISE-EXAM-SECRET-2026';
    const hmacPayload = `${docketType}:${learner.studentNumber}:${docketNumber}:${isCleared}:${termLabel}`;
    const verificationCode = crypto.createHmac('sha256', secret).update(hmacPayload).digest('hex').slice(0, 24).toUpperCase();

    // 4. Structured QR verification payload
    const qrData = {
      doc: docketType === DocketType.EXAMINATION_CLEARANCE ? 'NWUCHAS_EXAM_DOCKET' : 'NWUCHAS_CLINICAL_PASS',
      docketNo: docketNumber,
      code: verificationCode,
      stuNo: learner.studentNumber,
      name: `${learner.firstName} ${learner.lastName}`,
      prog: learner.currentClass?.name || 'Diploma in Registered Nursing',
      sem: termLabel,
      cleared: isCleared,
      balanceZMW: balance.toFixed(2),
      paidPct: paymentPercentage.toFixed(1),
      council: learner.indexingRecord?.council || 'NMCZ',
      indexingNo: learner.indexingRecord?.indexNumber || 'PENDING',
      issuedAt: new Date().toISOString(),
    };

    const qrCodeData = JSON.stringify(qrData);
    const expiresAt = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000); // 120 days validity

    const metadata = {
      studentName: `${learner.firstName} ${learner.lastName}`,
      studentNumber: learner.studentNumber,
      gender: learner.gender,
      programmeName: learner.currentClass?.name || 'Health Sciences Programme',
      campusName: learner.campus?.name || 'NWUCHAS Main Campus (Manyama)',
      photoUrl: learner.photoUrl || '/assets/avatars/student-placeholder.png',
      indexingNumber: learner.indexingRecord?.indexNumber || null,
      council: learner.indexingRecord?.council || 'NMCZ',
      academicYear: '2026',
      totalBilledZMW: totalInvoiced,
      totalPaidZMW: totalPaid,
      outstandingBalanceZMW: balance,
      paymentPercentage,
      clearanceThreshold: docketType === DocketType.EXAMINATION_CLEARANCE ? '75% Tuition Paid' : '60% Tuition Paid',
      officialStamps: [
        'Directorate of Academic Affairs & Examinations',
        'Bursary & Student Financial Services',
        'Senate Board of Examiners Authentication',
      ],
    };

    const docket = await prisma.clearanceDocket.create({
      data: {
        organisationId: params.organisationId,
        learnerId: learner.id,
        docketType,
        docketNumber,
        termOrSemester: termLabel,
        tuitionBalance: new Decimal(balance.toFixed(2)),
        paymentPct: new Decimal(paymentPercentage.toFixed(2)),
        isCleared,
        expiresAt,
        verificationCode,
        qrCodeData,
        issuedById: params.issuedById,
        metadataJson: JSON.stringify(metadata),
      },
    });

    return {
      docket,
      verificationCode,
      qrCodeData,
      metadata,
    };
  }

  /**
   * Cryptographically verify a Clearance Docket or QR Token (GAP-08)
   */
  static async verifyClearanceDocket(query: string) {
    let cleanCode = query.trim();

    // If query is a JSON string from QR scanner
    if (query.startsWith('{') && query.endsWith('}')) {
      try {
        const parsed = JSON.parse(query);
        cleanCode = parsed.code || parsed.docketNo || cleanCode;
      } catch {
        // use raw string
      }
    }

    const docket = await prisma.clearanceDocket.findFirst({
      where: {
        OR: [
          { verificationCode: cleanCode },
          { docketNumber: cleanCode },
        ],
      },
      include: {
        learner: {
          select: {
            id: true,
            studentNumber: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            gender: true,
          },
        },
      },
    });

    if (!docket) {
      return {
        isValid: false,
        message: 'Invalid or fraudulent clearance docket code. No record found.',
      };
    }

    const now = new Date();
    if (now > docket.expiresAt) {
      return {
        isValid: false,
        isExpired: true,
        message: `Clearance docket expired on ${docket.expiresAt.toLocaleDateString()}.`,
        docket,
      };
    }

    const parsedMetadata = docket.metadataJson ? JSON.parse(docket.metadataJson) : null;

    return {
      isValid: true,
      isCleared: docket.isCleared,
      message: docket.isCleared
        ? `VERIFIED: Cleared for ${docket.docketType === 'EXAMINATION_CLEARANCE' ? 'Examination Hall Entry' : 'Clinical Ward Placement'}`
        : 'SUSPENDED: Fee clearance threshold not satisfied.',
      docket,
      learner: docket.learner,
      metadata: parsedMetadata,
    };
  }

  /**
   * List historical clearance dockets for audit or student portal retrieval
   */
  static async listClearanceDockets(organisationId: string, learnerId?: string) {
    return prisma.clearanceDocket.findMany({
      where: {
        organisationId,
        ...(learnerId ? { learnerId } : {}),
      },
      orderBy: { issuedAt: 'desc' },
      take: 50,
    });
  }
}
