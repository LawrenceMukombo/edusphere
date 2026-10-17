// EduSphere SMIS — Financial Ledger & Billing Service
import { prisma } from '../db';
import { FeeCategory, InvoiceStatus, PaymentMethod, LedgerEntryType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class FinanceService {
  /**
   * Generate an Invoice for a learner with duplicate prevention (idempotency)
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
      // Create invoice
      const invoice = await tx.invoice.create({
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

      // Calculate previous learner balance
      const lastEntry = await tx.ledgerEntry.findFirst({
        where: { organisationId: data.organisationId, learnerId: data.learnerId },
        orderBy: { postedAt: 'desc' },
      });

      const prevBalance = lastEntry ? Number(lastEntry.balanceAfter) : 0;
      const newBalance = prevBalance + totalAmount;

      // Post immutable debit entry to ledger
      await tx.ledgerEntry.create({
        data: {
          organisationId: data.organisationId,
          learnerId: data.learnerId,
          invoiceId: invoice.id,
          entryType: LedgerEntryType.DEBIT_CHARGE,
          amount: new Decimal(totalAmount.toFixed(2)),
          balanceAfter: new Decimal(newBalance.toFixed(2)),
          description: `Invoice Issued: ${data.invoiceNumber}`,
        },
      });

      return invoice;
    });
  }

  /**
   * Record a payment (Cash, Bank, Mobile Money), generate a receipt, and allocate to invoice
   */
  static async recordPayment(data: {
    organisationId: string;
    learnerId: string;
    invoiceId: string;
    paymentNumber: string;
    receiptNumber: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    notes?: string;
  }) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });
    if (!invoice) throw new Error('Invoice not found.');

    const paymentAmount = new Decimal(data.amount.toFixed(2));

    return prisma.$transaction(async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          organisationId: data.organisationId,
          learnerId: data.learnerId,
          paymentNumber: data.paymentNumber,
          amount: paymentAmount,
          paymentMethod: data.paymentMethod,
          referenceNumber: data.referenceNumber,
          notes: data.notes,
          allocations: {
            create: {
              invoiceId: data.invoiceId,
              allocatedAmount: paymentAmount,
            },
          },
          receipt: {
            create: {
              organisationId: data.organisationId,
              receiptNumber: data.receiptNumber,
              amount: paymentAmount,
            },
          },
        },
        include: { receipt: true },
      });

      // 2. Update invoice balances
      const updatedPaid = Number(invoice.paidAmount) + data.amount;
      const updatedBalance = Number(invoice.totalAmount) - updatedPaid;
      const newStatus = updatedBalance <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: {
          paidAmount: new Decimal(updatedPaid.toFixed(2)),
          balance: new Decimal(Math.max(0, updatedBalance).toFixed(2)),
          status: newStatus,
        },
      });

      // 3. Post immutable credit entry to ledger
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
          description: `Payment Received: Ref ${data.referenceNumber} (${data.paymentMethod})`,
        },
      });

      return payment;
    });
  }

  /**
   * Reverse a bounced or erroneous payment using a corrective reversing entry (no deletes!)
   */
  static async reversePayment(data: {
    organisationId: string;
    paymentId: string;
    reason: string;
  }) {
    const payment = await prisma.payment.findUnique({
      where: { id: data.paymentId },
      include: { allocations: true },
    });
    if (!payment) throw new Error('Payment not found.');

    const reverseAmount = Number(payment.amount);

    return prisma.$transaction(async (tx) => {
      // Revert invoice balances
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

      // Compute balance
      const lastEntry = await tx.ledgerEntry.findFirst({
        where: { organisationId: data.organisationId, learnerId: payment.learnerId },
        orderBy: { postedAt: 'desc' },
      });

      const prevBalance = lastEntry ? Number(lastEntry.balanceAfter) : 0;
      const newLedgerBalance = prevBalance + reverseAmount;

      // Post corrective debit reversal entry
      return tx.ledgerEntry.create({
        data: {
          organisationId: data.organisationId,
          learnerId: payment.learnerId,
          paymentId: payment.id,
          entryType: LedgerEntryType.DEBIT_REVERSAL,
          amount: new Decimal(reverseAmount.toFixed(2)),
          balanceAfter: new Decimal(newLedgerBalance.toFixed(2)),
          description: `Payment Reversal: ${data.reason}`,
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
