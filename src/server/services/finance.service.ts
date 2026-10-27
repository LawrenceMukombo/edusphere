// EduSphere SMIS — Financial Ledger & Billing Service
import { prisma } from '../db';
import {
  FeeCategory,
  InvoiceStatus,
  PaymentMethod,
  LedgerEntryType,
  ResidencyType,
  WalletTxType,
  ReversalStatus,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class FinanceService {
  /**
   * Generate an Invoice for a learner with duplicate prevention (idempotency)
   * Automatically draws down and applies available Student Advance Wallet balances.
   */
  static async issueInvoice(data: {
    organisationId: string;
    learnerId: string;
    termId: string;
    invoiceNumber: string;
    dueDate: string | Date;
    idempotencyKey?: string;
    lines: Array<{
      category: FeeCategory;
      description: string;
      unitPrice: number;
      quantity?: number;
    }>;
  }) {
    if (data.idempotencyKey) {
      const existing = await prisma.invoice.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
        include: { lines: true },
      });
      if (existing) return existing;
    }

    const totalAmount = data.lines.reduce((sum, line) => {
      const q = line.quantity || 1;
      return sum + line.unitPrice * q;
    }, 0);

    return prisma.$transaction(async (tx) => {
      // 1. Create base invoice
      let invoice = await tx.invoice.create({
        data: {
          organisationId: data.organisationId,
          learnerId: data.learnerId,
          termId: data.termId,
          invoiceNumber: data.invoiceNumber,
          idempotencyKey: data.idempotencyKey,
          totalAmount: new Decimal(totalAmount.toFixed(2)),
          paidAmount: new Decimal(0),
          balance: new Decimal(totalAmount.toFixed(2)),
          status: InvoiceStatus.ISSUED,
          dueDate: new Date(data.dueDate),
          lines: {
            create: data.lines.map((l) => ({
              category: l.category,
              description: l.description,
              unitPrice: new Decimal(l.unitPrice.toFixed(2)),
              quantity: l.quantity || 1,
              lineTotal: new Decimal((l.unitPrice * (l.quantity || 1)).toFixed(2)),
            })),
          },
        },
        include: { lines: true },
      });

      // 2. Post immutable debit charge to ledger
      const lastEntry = await tx.ledgerEntry.findFirst({
        where: { organisationId: data.organisationId, learnerId: data.learnerId },
        orderBy: { postedAt: 'desc' },
      });

      const prevBalance = lastEntry ? Number(lastEntry.balanceAfter) : 0;
      let runningLedgerBalance = prevBalance + totalAmount;

      await tx.ledgerEntry.create({
        data: {
          organisationId: data.organisationId,
          learnerId: data.learnerId,
          invoiceId: invoice.id,
          entryType: LedgerEntryType.DEBIT_CHARGE,
          amount: new Decimal(totalAmount.toFixed(2)),
          balanceAfter: new Decimal(runningLedgerBalance.toFixed(2)),
          description: `Invoice Issued: ${data.invoiceNumber}`,
        },
      });

      // 3. Auto-apply any available Student Advance Wallet credit (GAP-05)
      const wallet = await tx.studentWallet.findUnique({
        where: { learnerId: data.learnerId },
      });

      if (wallet && Number(wallet.balance) > 0) {
        const creditToApply = Math.min(Number(wallet.balance), totalAmount);
        if (creditToApply > 0) {
          const newWalletBalance = Number(wallet.balance) - creditToApply;

          await tx.studentWallet.update({
            where: { id: wallet.id },
            data: { balance: new Decimal(newWalletBalance.toFixed(2)) },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              amount: new Decimal(creditToApply.toFixed(2)),
              type: WalletTxType.DEBIT_APPLICATION,
              reference: invoice.invoiceNumber,
              description: `Advance balance applied to ${invoice.invoiceNumber}`,
              balanceAfter: new Decimal(newWalletBalance.toFixed(2)),
            },
          });

          const newPaidAmount = creditToApply;
          const newInvBalance = totalAmount - creditToApply;
          const newStatus = newInvBalance <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

          invoice = await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              paidAmount: new Decimal(newPaidAmount.toFixed(2)),
              balance: new Decimal(newInvBalance.toFixed(2)),
              status: newStatus,
            },
            include: { lines: true },
          });

          runningLedgerBalance -= creditToApply;

          await tx.ledgerEntry.create({
            data: {
              organisationId: data.organisationId,
              learnerId: data.learnerId,
              invoiceId: invoice.id,
              entryType: LedgerEntryType.DEBIT_ADVANCE_APPLICATION,
              amount: new Decimal(creditToApply.toFixed(2)),
              balanceAfter: new Decimal(runningLedgerBalance.toFixed(2)),
              description: `Advance Credit Applied: ${data.invoiceNumber} (K${creditToApply.toFixed(2)})`,
            },
          });
        }
      }

      return invoice;
    });
  }

  /**
   * 1-Click Batch Cohort Invoicing (GAP-04)
   * Invoices all enrolled students in a cohort (e.g., Nursing Jan 2026 Cohort).
   */
  static async batchInvoiceCohort(params: {
    organisationId: string;
    cohortId: string;
    termId: string;
    dueDate: string | Date;
    semesterNumber?: number;
    residencyType?: ResidencyType;
    lines?: Array<{ category: FeeCategory; description: string; unitPrice: number; quantity?: number }>;
    actorId?: string;
  }) {
    const cohort = await prisma.cohort.findUnique({
      where: { id: params.cohortId },
      include: { programme: true },
    });
    if (!cohort) throw new Error('Cohort not found.');

    // 1. Resolve fee lines from ProgrammeFeeSchedule or fallback
    let invoiceLines = params.lines;
    const targetSemester = params.semesterNumber ?? cohort.currentSemester;
    const targetResidency = params.residencyType ?? ResidencyType.DAY_SCHOLAR;

    if (!invoiceLines || invoiceLines.length === 0) {
      const scheduleItems = await prisma.programmeFeeSchedule.findMany({
        where: {
          organisationId: params.organisationId,
          programmeId: cohort.programmeId,
          semesterNumber: targetSemester,
          residencyType: targetResidency,
        },
      });

      if (scheduleItems.length > 0) {
        invoiceLines = scheduleItems.map((item) => ({
          category: item.category,
          description: item.name,
          unitPrice: Number(item.amountZMW),
          quantity: 1,
        }));
      } else {
        // Tertiary Health Sciences default schedule fallback
        invoiceLines = [
          {
            category: FeeCategory.TUITION,
            description: `${cohort.programme.name} — Semester ${targetSemester} Tuition Fee`,
            unitPrice: Number(cohort.programme.tuitionFeePerSem) || 6500,
            quantity: 1,
          },
          {
            category: FeeCategory.CLINICAL_PRACTICUM,
            description: 'Hospital Affiliation & Clinical Practicum Facility Fee',
            unitPrice: Number(cohort.programme.clinicalFeePerSem) || 1500,
            quantity: 1,
          },
          {
            category: FeeCategory.NMCZ_INDEXING,
            description: 'Statutory Health Council Indexation & Assessment Levy',
            unitPrice: 1200,
            quantity: 1,
          },
          {
            category: FeeCategory.SKILLS_LAB,
            description: 'Clinical Simulation Skills Lab Consumables',
            unitPrice: 850,
            quantity: 1,
          },
        ];
      }
    }

    // 2. Resolve learners for this cohort
    // Look for learners tied to this programme, enrolled in classes matching cohort, or general enrolled
    let learners = await prisma.learner.findMany({
      where: {
        organisationId: params.organisationId,
        status: 'ENROLLED',
        OR: [
          { currentClass: { name: { contains: cohort.name, mode: 'insensitive' } } },
          { currentClass: { stream: { contains: cohort.intake, mode: 'insensitive' } } },
          { courseRegistrations: { some: { courseModule: { programmeId: cohort.programmeId } } } },
        ],
      },
      select: { id: true, studentNumber: true, firstName: true, lastName: true },
    });

    // If no specific class match found, include enrolled learners in the organization
    if (learners.length === 0) {
      learners = await prisma.learner.findMany({
        where: {
          organisationId: params.organisationId,
          status: 'ENROLLED',
        },
        take: cohort.capacity || 120,
        select: { id: true, studentNumber: true, firstName: true, lastName: true },
      });
    }

    const term = await prisma.term.findUnique({ where: { id: params.termId } });
    const termLabel = term ? term.name.replace(/\s+/g, '') : 'SEM1';

    const results = {
      cohortId: cohort.id,
      cohortName: cohort.name,
      programmeName: cohort.programme.name,
      totalStudentsFound: learners.length,
      invoicesCreated: 0,
      skippedExisting: 0,
      totalAmountBilled: 0,
      invoices: [] as any[],
    };

    const totalPerInvoice = invoiceLines.reduce((sum, l) => sum + (l.unitPrice * (l.quantity || 1)), 0);

    for (const learner of learners) {
      const idempotencyKey = `INV-${cohort.name}-${learner.studentNumber}-${termLabel}`.replace(/[^A-Za-z0-9_-]/g, '-');
      const invoiceNumber = `INV-${new Date().getFullYear()}-${learner.studentNumber.slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Check if already invoiced under this idempotency key
      const existing = await prisma.invoice.findUnique({ where: { idempotencyKey } });
      if (existing) {
        results.skippedExisting++;
        continue;
      }

      const inv = await this.issueInvoice({
        organisationId: params.organisationId,
        learnerId: learner.id,
        termId: params.termId,
        invoiceNumber,
        dueDate: params.dueDate,
        idempotencyKey,
        lines: invoiceLines,
      });

      results.invoicesCreated++;
      results.totalAmountBilled += totalPerInvoice;
      results.invoices.push({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        learnerId: learner.id,
        studentNumber: learner.studentNumber,
        name: `${learner.firstName} ${learner.lastName}`,
        amount: totalPerInvoice,
        status: inv.status,
      });
    }

    return results;
  }

  /**
   * Record a payment (Cash, Bank, Mobile Money), generate a receipt, and allocate to invoice(s).
   * Implements Waterfall Allocation (GAP-05) across open invoices, and surplus credit into StudentWallet.
   */
  static async recordPayment(data: {
    organisationId: string;
    learnerId: string;
    invoiceId?: string;
    paymentNumber?: string;
    receiptNumber?: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    notes?: string;
    recordedById?: string;
  }) {
    const paymentAmount = new Decimal(data.amount.toFixed(2));
    const paymentNumber = data.paymentNumber || `PAY-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const receiptNumber = data.receiptNumber || `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    return prisma.$transaction(async (tx) => {
      // 1. Create Payment record with recordedById for auditability
      const payment = await tx.payment.create({
        data: {
          organisationId: data.organisationId,
          learnerId: data.learnerId,
          paymentNumber,
          amount: paymentAmount,
          paymentMethod: data.paymentMethod,
          referenceNumber: data.referenceNumber,
          recordedById: data.recordedById,
          notes: data.notes,
          receipt: {
            create: {
              organisationId: data.organisationId,
              receiptNumber,
              amount: paymentAmount,
            },
          },
        },
        include: { receipt: true },
      });

      // 2. Resolve target invoices in Waterfall order (oldest overdue first)
      let candidateInvoices = [];
      if (data.invoiceId) {
        const primary = await tx.invoice.findUnique({ where: { id: data.invoiceId } });
        if (primary) {
          candidateInvoices.push(primary);
        }
        // Fetch remaining unpaid invoices
        const others = await tx.invoice.findMany({
          where: {
            organisationId: data.organisationId,
            learnerId: data.learnerId,
            id: { not: data.invoiceId },
            status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID] },
          },
          orderBy: { dueDate: 'asc' },
        });
        candidateInvoices.push(...others);
      } else {
        candidateInvoices = await tx.invoice.findMany({
          where: {
            organisationId: data.organisationId,
            learnerId: data.learnerId,
            status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID] },
          },
          orderBy: { dueDate: 'asc' },
        });
      }

      // 3. Multi-Invoice Waterfall Allocation
      let remainingPayment = data.amount;
      for (const inv of candidateInvoices) {
        if (remainingPayment <= 0.001) break;
        const invBalance = Number(inv.balance);
        if (invBalance <= 0) continue;

        const allocAmount = Math.min(remainingPayment, invBalance);
        if (allocAmount > 0) {
          await tx.paymentAllocation.create({
            data: {
              paymentId: payment.id,
              invoiceId: inv.id,
              allocatedAmount: new Decimal(allocAmount.toFixed(2)),
            },
          });

          const updatedPaid = Number(inv.paidAmount) + allocAmount;
          const updatedBalance = Number(inv.totalAmount) - updatedPaid;
          const newStatus = updatedBalance <= 0.009 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

          await tx.invoice.update({
            where: { id: inv.id },
            data: {
              paidAmount: new Decimal(updatedPaid.toFixed(2)),
              balance: new Decimal(Math.max(0, updatedBalance).toFixed(2)),
              status: newStatus,
            },
          });

          remainingPayment -= allocAmount;
        }
      }

      // 4. Surplus Payment into Student Advance Wallet (GAP-05)
      // When payment exceeds all open invoices, the excess amount is credited to the Student Advance Wallet
      if (remainingPayment > 0.009) {
        const excessAmount = remainingPayment;
        const wallet = await tx.studentWallet.upsert({
          where: { learnerId: data.learnerId },
          update: {
            balance: { increment: new Decimal(excessAmount.toFixed(2)) },
          },
          create: {
            organisationId: data.organisationId,
            learnerId: data.learnerId,
            balance: new Decimal(excessAmount.toFixed(2)),
          },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: new Decimal(excessAmount.toFixed(2)),
            type: WalletTxType.CREDIT_ADVANCE,
            reference: data.referenceNumber,
            description: `Surplus payment credited to advance wallet: Ref ${data.referenceNumber}`,
            balanceAfter: wallet.balance,
          },
        });
      }

      // 5. Post immutable credit entry to ledger
      const lastEntry = await tx.ledgerEntry.findFirst({
        where: { organisationId: data.organisationId, learnerId: data.learnerId },
        orderBy: { postedAt: 'desc' },
      });

      const prevBalance = lastEntry ? Number(lastEntry.balanceAfter) : 0;
      const newLedgerBalance = prevBalance - data.amount;

      await tx.ledgerEntry.create({
        data: {
          organisationId: data.organisationId,
          learnerId: data.learnerId,
          paymentId: payment.id,
          entryType: LedgerEntryType.CREDIT_PAYMENT,
          amount: paymentAmount,
          balanceAfter: new Decimal(newLedgerBalance.toFixed(2)),
          description: `Payment Received: Ref ${data.referenceNumber} (${data.paymentMethod})${
            remainingPayment > 0.009 ? ` [K${remainingPayment.toFixed(2)} to Advance Wallet]` : ''
          }`,
        },
      });

      return payment;
    });
  }

  /**
   * Cashier initiates a payment reversal request (Four-Eyes principle step 1) (GAP-07)
   */
  static async requestPaymentReversal(data: {
    organisationId: string;
    paymentId: string;
    requestedById: string;
    requestedByName?: string;
    reason: string;
  }) {
    const payment = await prisma.payment.findUnique({
      where: { id: data.paymentId },
    });
    if (!payment) throw new Error('Payment not found.');

    const pending = await prisma.paymentReversalRequest.findFirst({
      where: {
        paymentId: data.paymentId,
        status: ReversalStatus.PENDING_APPROVAL,
      },
    });
    if (pending) {
      throw new Error('A reversal request for this payment is already pending Bursar review.');
    }

    return prisma.paymentReversalRequest.create({
      data: {
        organisationId: data.organisationId,
        paymentId: data.paymentId,
        requestedById: data.requestedById,
        requestedByName: data.requestedByName,
        reason: data.reason,
        status: ReversalStatus.PENDING_APPROVAL,
      },
    });
  }

  /**
   * Bursar approves payment reversal request (Four-Eyes principle step 2) (GAP-07)
   * Strictly enforces that initiator cannot approve their own reversal request.
   */
  static async approvePaymentReversal(data: {
    organisationId: string;
    requestId: string;
    reviewedById: string;
    reviewedByName?: string;
    reviewerRole: string;
  }) {
    const request = await prisma.paymentReversalRequest.findUnique({
      where: { id: data.requestId },
      include: {
        payment: {
          include: { allocations: true },
        },
      },
    });

    if (!request) throw new Error('Reversal request not found.');
    if (request.status !== ReversalStatus.PENDING_APPROVAL) {
      throw new Error(`Reversal request cannot be approved because it is already ${request.status}.`);
    }

    // Four-Eyes Rule Enforced: Approver MUST be different from requester
    if (request.requestedById === data.reviewedById) {
      throw new Error('Four-Eyes Security Violation: The requesting cashier cannot approve their own reversal request.');
    }

    // Role check: Must be Bursar or Admin
    const APPROVER_ROLES = ['BURSAR', 'INSTITUTION_ADMIN', 'ACCOUNTANT', 'PLATFORM_SUPER_ADMIN'];
    if (!APPROVER_ROLES.includes(data.reviewerRole)) {
      throw new Error('Forbidden: Only Bursar or Institution Admin can approve ledger reversals.');
    }

    const payment = request.payment;
    const reverseAmount = Number(payment.amount);

    return prisma.$transaction(async (tx) => {
      // 1. Revert invoice balances
      for (const alloc of payment.allocations) {
        const inv = await tx.invoice.findUnique({ where: { id: alloc.invoiceId } });
        if (inv) {
          const revPaid = Number(inv.paidAmount) - Number(alloc.allocatedAmount);
          const revBalance = Number(inv.totalAmount) - revPaid;
          await tx.invoice.update({
            where: { id: inv.id },
            data: {
              paidAmount: new Decimal(Math.max(0, revPaid).toFixed(2)),
              balance: new Decimal(revBalance.toFixed(2)),
              status: revPaid <= 0 ? InvoiceStatus.ISSUED : InvoiceStatus.PARTIALLY_PAID,
            },
          });
        }
      }

      // 2. Compute ledger balance
      const lastEntry = await tx.ledgerEntry.findFirst({
        where: { organisationId: data.organisationId, learnerId: payment.learnerId },
        orderBy: { postedAt: 'desc' },
      });

      const prevBalance = lastEntry ? Number(lastEntry.balanceAfter) : 0;
      const newLedgerBalance = prevBalance + reverseAmount;

      // 3. Post corrective debit reversal entry
      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          organisationId: data.organisationId,
          learnerId: payment.learnerId,
          paymentId: payment.id,
          entryType: LedgerEntryType.DEBIT_REVERSAL,
          amount: new Decimal(reverseAmount.toFixed(2)),
          balanceAfter: new Decimal(newLedgerBalance.toFixed(2)),
          description: `Approved Payment Reversal: ${request.reason} [Req: ${request.id.slice(0, 8)}]`,
        },
      });

      // 4. Mark request APPROVED
      const approvedRequest = await tx.paymentReversalRequest.update({
        where: { id: request.id },
        data: {
          status: ReversalStatus.APPROVED,
          reviewedById: data.reviewedById,
          reviewedByName: data.reviewedByName,
          reviewedAt: new Date(),
          ledgerEntryId: ledgerEntry.id,
        },
      });

      return { request: approvedRequest, ledgerEntry };
    });
  }

  /**
   * Reject a payment reversal request
   */
  static async rejectPaymentReversal(data: {
    organisationId: string;
    requestId: string;
    reviewedById: string;
    reviewedByName?: string;
    reason: string;
  }) {
    const request = await prisma.paymentReversalRequest.findUnique({
      where: { id: data.requestId },
    });
    if (!request) throw new Error('Reversal request not found.');

    return prisma.paymentReversalRequest.update({
      where: { id: data.requestId },
      data: {
        status: ReversalStatus.REJECTED,
        reviewedById: data.reviewedById,
        reviewedByName: data.reviewedByName,
        reviewedAt: new Date(),
        rejectionReason: data.reason,
      },
    });
  }

  /**
   * List pending and historical reversal requests
   */
  static async listReversalRequests(organisationId: string, status?: ReversalStatus) {
    return prisma.paymentReversalRequest.findMany({
      where: {
        organisationId,
        ...(status ? { status } : {}),
      },
      include: {
        payment: {
          include: {
            learner: {
              select: { studentNumber: true, firstName: true, lastName: true },
            },
            receipt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get Student Advance Wallet balance and transaction history (GAP-05)
   */
  static async getStudentWallet(organisationId: string, learnerId: string) {
    const wallet = await prisma.studentWallet.findUnique({
      where: { learnerId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    return {
      learnerId,
      balance: wallet ? Number(wallet.balance) : 0,
      transactions: wallet?.transactions || [],
    };
  }

  /**
   * Reverse payment (posts corrective reversing entry to ledger without deletes)
   * Maintained for direct ledger reversals and four-eyes execution.
   */
  static async reversePayment(data: {
    organisationId: string;
    paymentId: string;
    reason: string;
    actorId?: string;
  }) {

    // Direct supervisor reversal
    const payment = await prisma.payment.findUnique({
      where: { id: data.paymentId },
      include: { allocations: true },
    });
    if (!payment) throw new Error('Payment not found.');

    const reverseAmount = Number(payment.amount);

    return prisma.$transaction(async (tx) => {
      for (const alloc of payment.allocations) {
        const inv = await tx.invoice.findUnique({ where: { id: alloc.invoiceId } });
        if (inv) {
          const revPaid = Number(inv.paidAmount) - Number(alloc.allocatedAmount);
          const revBalance = Number(inv.totalAmount) - revPaid;
          await tx.invoice.update({
            where: { id: inv.id },
            data: {
              paidAmount: new Decimal(Math.max(0, revPaid).toFixed(2)),
              balance: new Decimal(revBalance.toFixed(2)),
              status: revPaid <= 0 ? InvoiceStatus.ISSUED : InvoiceStatus.PARTIALLY_PAID,
            },
          });
        }
      }

      const lastEntry = await tx.ledgerEntry.findFirst({
        where: { organisationId: data.organisationId, learnerId: payment.learnerId },
        orderBy: { postedAt: 'desc' },
      });

      const prevBalance = lastEntry ? Number(lastEntry.balanceAfter) : 0;
      const newLedgerBalance = prevBalance + reverseAmount;

      return tx.ledgerEntry.create({
        data: {
          organisationId: data.organisationId,
          learnerId: payment.learnerId,
          paymentId: payment.id,
          entryType: LedgerEntryType.DEBIT_REVERSAL,
          amount: new Decimal(reverseAmount.toFixed(2)),
          balanceAfter: new Decimal(newLedgerBalance.toFixed(2)),
          description: `Supervisor Payment Reversal: ${data.reason}`,
        },
      });
    });
  }


  static async getLearnerStatement(organisationId: string, learnerId: string) {
    const entries = await prisma.ledgerEntry.findMany({
      where: { organisationId, learnerId },
      orderBy: { postedAt: 'asc' },
    });

    const invoices = await prisma.invoice.findMany({
      where: { organisationId, learnerId },
      include: { lines: true },
      orderBy: { issuedDate: 'desc' },
    });

    const payments = await prisma.payment.findMany({
      where: { organisationId, learnerId },
      include: { receipt: true },
      orderBy: { receivedDate: 'desc' },
    });

    return { entries, invoices, payments };
  }

  /**
   * Capture all learners' fee balances with comprehensive aged receivables (debtors ageing)
   */
  static async getAllLearnersFeeBalances(organisationId: string, filters?: { classId?: string; status?: string; search?: string }) {
    const where: any = { organisationId };
    if (filters?.classId) where.currentClassId = filters.classId;
    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { studentNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const learners = await prisma.learner.findMany({
      where,
      include: {
        currentClass: true,
        campus: true,
        guardians: {
          include: { guardian: true },
          where: { isAccessRevoked: false },
        },
        invoices: {
          where: { organisationId },
          include: { lines: true },
          orderBy: { dueDate: 'asc' },
        },
        payments: {
          where: { organisationId },
          include: { receipt: true },
          orderBy: { receivedDate: 'desc' },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    const now = new Date();

    return learners.map((learner) => {
      const totalBilled = learner.invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
      const totalPaid = learner.invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
      const balance = Math.max(0, totalBilled - totalPaid);

      // Debtors Ageing Calculation based on invoice due dates
      let currentBucket = 0;   // 0 - 30 days or not yet due
      let days31to60 = 0;       // 31 - 60 days overdue
      let days61to90 = 0;       // 61 - 90 days overdue
      let over90days = 0;       // > 90 days overdue

      for (const inv of learner.invoices) {
        const invBalance = Number(inv.balance);
        if (invBalance <= 0) continue;

        const due = new Date(inv.dueDate);
        const diffTime = now.getTime() - due.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 30) {
          currentBucket += invBalance;
        } else if (diffDays <= 60) {
          days31to60 += invBalance;
        } else if (diffDays <= 90) {
          days61to90 += invBalance;
        } else {
          over90days += invBalance;
        }
      }

      let financialStatus = 'NO_INVOICE';
      if (totalBilled > 0) {
        if (balance <= 0) financialStatus = 'CLEARED';
        else if (totalPaid > 0) financialStatus = 'PARTIAL';
        else if (over90days > 0 || days61to90 > 0) financialStatus = 'CHRONIC_ARREARS';
        else financialStatus = 'ARREARS';
      }

      const primaryGuardian = learner.guardians?.[0]?.guardian;

      return {
        id: learner.id,
        studentNumber: learner.studentNumber,
        learnerName: `${learner.firstName} ${learner.lastName}`,
        className: learner.currentClass?.name || 'Unassigned',
        stage: learner.currentClass?.stage || 'PRIMARY',
        campusName: learner.campus?.name || 'Main Campus',
        totalBilled,
        totalPaid,
        balance,
        financialStatus,
        ageing: {
          current: currentBucket,
          days31to60,
          days61to90,
          over90days,
        },
        guardian: primaryGuardian
          ? {
              name: `${primaryGuardian.firstName} ${primaryGuardian.lastName}`,
              phone: primaryGuardian.phone,
              email: primaryGuardian.email,
            }
          : null,
        invoiceCount: learner.invoices.length,
        paymentCount: learner.payments.length,
      };
    });
  }

  /**
   * Get detailed payment history for an individual learner
   */
  static async getLearnerPaymentHistory(organisationId: string, learnerId: string) {
    const payments = await prisma.payment.findMany({
      where: { organisationId, learnerId },
      include: {
        receipt: true,
        allocations: {
          include: {
            invoice: {
              include: { lines: true },
            },
          },
        },
      },
      orderBy: { receivedDate: 'desc' },
    });

    const learner = await prisma.learner.findUnique({
      where: { id: learnerId },
      include: { currentClass: true, campus: true },
    });

    return {
      learner,
      payments,
      totalPaid: payments.reduce((sum, p) => sum + Number(p.amount), 0),
    };
  }

  /**
   * Multi-type institutional financial reports:
   * 1. Daily Cashbook (collections by date and channel)
   * 2. Fee Category Revenue (by Tuition, Registration, Levies)
   * 3. Cohort / Class Collection Performance
   * 4. Aged Debtors Institutional Summary
   */
  static async getFinancialReports(organisationId: string) {
    const [invoices, payments, classes, schedules] = await Promise.all([
      prisma.invoice.findMany({
        where: { organisationId },
        include: { lines: true, learner: { include: { currentClass: true } } },
      }),
      prisma.payment.findMany({
        where: { organisationId },
        include: { receipt: true, learner: { include: { currentClass: true } } },
        orderBy: { receivedDate: 'desc' },
      }),
      prisma.class.findMany({
        where: { campus: { organisationId } },
        include: { learners: true },
      }),
      prisma.feeSchedule.findMany({
        where: { organisationId },
      }),
    ]);

    // 1. Daily Cashbook Breakdown (grouped by date and method)
    const cashbookMap = new Map<string, { date: string; cash: number; bank: number; airtel: number; mtn: number; cheque: number; total: number; transactions: number }>();

    for (const p of payments) {
      const dateKey = p.receivedDate.toISOString().split('T')[0];
      if (!cashbookMap.has(dateKey)) {
        cashbookMap.set(dateKey, { date: dateKey, cash: 0, bank: 0, airtel: 0, mtn: 0, cheque: 0, total: 0, transactions: 0 });
      }
      const entry = cashbookMap.get(dateKey)!;
      const amount = Number(p.amount);
      entry.total += amount;
      entry.transactions += 1;

      if (p.paymentMethod === PaymentMethod.CASH) entry.cash += amount;
      else if (p.paymentMethod === PaymentMethod.BANK_TRANSFER || p.paymentMethod === PaymentMethod.BANK_DEPOSIT) entry.bank += amount;
      else if (p.paymentMethod === PaymentMethod.AIRTEL_MONEY) entry.airtel += amount;
      else if (p.paymentMethod === PaymentMethod.MTN_MONEY) entry.mtn += amount;
      else if (p.paymentMethod === PaymentMethod.CHEQUE) entry.cheque += amount;
    }

    const cashbook = Array.from(cashbookMap.values()).sort((a, b) => b.date.localeCompare(a.date));

    // 2. Fee Category Revenue Breakdown
    const categoryMap = new Map<string, { category: string; billed: number; collectedEstimate: number }>();
    for (const inv of invoices) {
      for (const line of inv.lines) {
        if (!categoryMap.has(line.category)) {
          categoryMap.set(line.category, { category: line.category, billed: 0, collectedEstimate: 0 });
        }
        const cat = categoryMap.get(line.category)!;
        const lineTotal = Number(line.lineTotal);
        cat.billed += lineTotal;
        // Proportion of payment collected
        const invTotal = Number(inv.totalAmount) || 1;
        const collectionRatio = Number(inv.paidAmount) / invTotal;
        cat.collectedEstimate += lineTotal * collectionRatio;
      }
    }
    const categoryRevenue = Array.from(categoryMap.values());

    // 3. Class / Cohort Collection Comparison
    const classComparison = classes.map((cls) => {
      const classInvoices = invoices.filter((inv) => inv.learner?.currentClassId === cls.id);
      const billed = classInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
      const collected = classInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
      const outstanding = Math.max(0, billed - collected);
      const collectionRate = billed > 0 ? Math.round((collected / billed) * 1000) / 10 : 0;

      return {
        classId: cls.id,
        className: cls.name,
        stage: cls.stage,
        learnerCount: cls.learners.length,
        billed,
        collected,
        outstanding,
        collectionRate,
      };
    });

    // 4. Institutional Debtors Ageing Summary
    const now = new Date();
    let ageingSummary = {
      current: 0,
      days31to60: 0,
      days61to90: 0,
      over90days: 0,
      totalOutstanding: 0,
    };

    for (const inv of invoices) {
      const invBalance = Number(inv.balance);
      if (invBalance <= 0) continue;

      ageingSummary.totalOutstanding += invBalance;
      const due = new Date(inv.dueDate);
      const diffTime = now.getTime() - due.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) ageingSummary.current += invBalance;
      else if (diffDays <= 60) ageingSummary.days31to60 += invBalance;
      else if (diffDays <= 90) ageingSummary.days61to90 += invBalance;
      else ageingSummary.over90days += invBalance;
    }

    const totalBilledAll = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const totalCollectedAll = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totals: {
        totalBilled: totalBilledAll,
        totalCollected: totalCollectedAll,
        totalOutstanding: ageingSummary.totalOutstanding,
        overallCollectionRate: totalBilledAll > 0 ? Math.round((totalCollectedAll / totalBilledAll) * 1000) / 10 : 0,
      },
      cashbook,
      categoryRevenue,
      classComparison,
      ageingSummary,
    };
  }
}
