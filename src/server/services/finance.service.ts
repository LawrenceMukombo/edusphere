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
}
