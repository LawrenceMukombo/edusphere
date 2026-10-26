import { prisma } from '../db';
import { PaymentChannel, PaymentIntentStatus, PaymentMethod } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { assertPaymentTransition, PaymentWorkflowError } from './workflow';
import { FinanceService } from '../services/finance.service';
import { EntitlementService } from '../services/entitlement.service';

export interface CreateIntentInput {
  organisationId: string;
  learnerId?: string;
  invoiceId?: string;
  channel: PaymentChannel;
  amountZMW: number;
  payerPhone?: string;
  payerName?: string;
  idempotencyKey: string;
  metadata?: Record<string, any>;
}

export class LamtonPayService {
  /**
   * Initiate a collections payment intent (MTN MoMo, Airtel Money, EFTPOS, DPO)
   */
  static async createIntent(data: CreateIntentInput) {
    if (data.amountZMW <= 0) {
      throw new PaymentWorkflowError('Amount must be greater than zero.');
    }

    // 1. Idempotency Check: if intent already exists with this idempotencyKey, return it
    const existing = await prisma.paymentIntent.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
    });
    if (existing) {
      return {
        isExisting: true,
        intent: existing,
      };
    }

    // 2. Generate unique business reference: LP-NWU-2026-XXXXXX
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const businessReference = `LP-NWU-2026-${randomSuffix}`;

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes validity

    // Validate and sanitize learner and invoice foreign keys
    let validLearnerId: string | null = null;
    if (data.learnerId && typeof data.learnerId === 'string' && data.learnerId.trim() !== '') {
      const learnerExists = await prisma.learner.findUnique({
        where: { id: data.learnerId.trim() },
      });
      if (learnerExists) validLearnerId = learnerExists.id;
    }

    let validInvoiceId: string | null = null;
    if (data.invoiceId && typeof data.invoiceId === 'string' && data.invoiceId.trim() !== '') {
      const invoiceExists = await prisma.invoice.findUnique({
        where: { id: data.invoiceId.trim() },
      });
      if (invoiceExists) validInvoiceId = invoiceExists.id;
    }

    const intent = await prisma.paymentIntent.create({
      data: {
        organisationId: data.organisationId,
        learnerId: validLearnerId,
        invoiceId: validInvoiceId,
        channel: data.channel,
        status: 'CREATED',
        amountZMW: new Decimal(data.amountZMW.toFixed(2)),
        payerPhone: data.payerPhone,
        payerName: data.payerName,
        businessReference,
        idempotencyKey: data.idempotencyKey,
        expiresAt,
        rawMetadataJson: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });

    // 3. Create initial provider transaction attempt log
    await prisma.providerTransaction.create({
      data: {
        paymentIntentId: intent.id,
        providerCode: data.channel === 'MTN_MOMO' ? 'MTN_MOMO_ZM' : data.channel === 'AIRTEL_MONEY' ? 'AIRTEL_MONEY_ZM' : 'LAMTON_GENERIC',
        status: 'PENDING_AUTHORISATION',
        requestPayload: JSON.stringify({
          amount: data.amountZMW,
          phone: data.payerPhone,
          businessReference,
        }),
      },
    });

    return {
      isExisting: false,
      intent,
    };
  }

  /**
   * Verify and confirm a payment intent once mobile money / bank provider acknowledges settlement.
   * This posts the official receipt, updates student invoice ledger, and triggers automatic entitlement reassessment.
   */
  static async confirmPayment(data: {
    intentId: string;
    providerTransactionId: string;
    providerCode?: string;
    verifiedAmount?: number;
    receiptNumber?: string;
  }) {
    const intent = await prisma.paymentIntent.findUnique({
      where: { id: data.intentId },
      include: { invoice: true, organisation: true },
    });

    if (!intent) throw new PaymentWorkflowError('Payment intent not found.');

    if (intent.status === 'CONFIRMED') {
      return { alreadyConfirmed: true, intent };
    }

    // Advance state machine through intermediate provider states if arriving from CREATED/INITIATED
    let currentStatus: any = intent.status;
    if (currentStatus === 'CREATED') {
      assertPaymentTransition('CREATED', 'INITIATED');
      currentStatus = 'INITIATED';
    }
    if (currentStatus === 'INITIATED' || currentStatus === 'PENDING_CUSTOMER') {
      assertPaymentTransition(currentStatus, 'PENDING_PROVIDER');
      currentStatus = 'PENDING_PROVIDER';
    }

    // Validate final state transition
    assertPaymentTransition(currentStatus, 'CONFIRMED');

    const confirmedAmount = data.verifiedAmount ?? Number(intent.amountZMW);
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      // 1. Update Payment Intent
      const updatedIntent = await tx.paymentIntent.update({
        where: { id: intent.id },
        data: {
          status: 'CONFIRMED',
          settledAt: now,
          providerReference: data.providerTransactionId,
        },
      });

      // 2. Record Provider Transaction success
      await tx.providerTransaction.create({
        data: {
          paymentIntentId: intent.id,
          providerCode: data.providerCode || 'MTN_MOMO_ZM',
          providerTxId: data.providerTransactionId,
          status: 'SUCCESS',
          isVerified: true,
          verifiedAt: now,
          responsePayload: JSON.stringify({
            status: 'SUCCESS',
            amount: confirmedAmount,
            providerTxId: data.providerTransactionId,
          }),
        },
      });

      // 3. If tied to an invoice and learner, record official payment and ledger entry
      let receiptRecord = null;
      if (intent.invoiceId && intent.learnerId) {
        const paymentNumber = `PAY-${intent.businessReference}`;
        const receiptNumber = data.receiptNumber || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        const paymentMethod: PaymentMethod =
          intent.channel === 'MTN_MOMO'
            ? 'MTN_MONEY'
            : intent.channel === 'AIRTEL_MONEY'
            ? 'AIRTEL_MONEY'
            : 'BANK_TRANSFER';

        // Create Payment record
        const payment = await tx.payment.create({
          data: {
            organisationId: intent.organisationId,
            learnerId: intent.learnerId,
            paymentNumber,
            amount: new Decimal(confirmedAmount.toFixed(2)),
            paymentMethod,
            referenceNumber: data.providerTransactionId,
            notes: `LamtonPay verified settlement: ${intent.channel} [${intent.businessReference}]`,
            allocations: {
              create: {
                invoiceId: intent.invoiceId,
                allocatedAmount: new Decimal(confirmedAmount.toFixed(2)),
              },
            },
            receipt: {
              create: {
                organisationId: intent.organisationId,
                receiptNumber,
                amount: new Decimal(confirmedAmount.toFixed(2)),
                issuedAt: now,
              },
            },
          },
          include: { receipt: true },
        });

        receiptRecord = payment.receipt;

        // Update invoice balance
        if (intent.invoice) {
          const updatedPaid = Number(intent.invoice.paidAmount) + confirmedAmount;
          const updatedBalance = Number(intent.invoice.totalAmount) - updatedPaid;
          const newStatus = updatedBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';

          await tx.invoice.update({
            where: { id: intent.invoiceId },
            data: {
              paidAmount: new Decimal(updatedPaid.toFixed(2)),
              balance: new Decimal(Math.max(0, updatedBalance).toFixed(2)),
              status: newStatus,
            },
          });
        }

        // Post ledger entry
        const lastEntry = await tx.ledgerEntry.findFirst({
          where: { organisationId: intent.organisationId, learnerId: intent.learnerId },
          orderBy: { postedAt: 'desc' },
        });

        const prevBalance = lastEntry ? Number(lastEntry.balanceAfter) : 0;
        const newLedgerBalance = prevBalance - confirmedAmount;

        await tx.ledgerEntry.create({
          data: {
            organisationId: intent.organisationId,
            learnerId: intent.learnerId,
            invoiceId: intent.invoiceId,
            paymentId: payment.id,
            entryType: 'CREDIT_PAYMENT',
            amount: new Decimal(confirmedAmount.toFixed(2)),
            balanceAfter: new Decimal(newLedgerBalance.toFixed(2)),
            description: `Payment Allocated: ${receiptNumber} [${intent.businessReference}]`,
          },
        });
      }

      return {
        alreadyConfirmed: false,
        intent: updatedIntent,
        receipt: receiptRecord,
      };
    }).then(async (result) => {
      // 4. Trigger automatic student entitlement reassessment (asynchronously after successful commit)
      if (intent.learnerId) {
        try {
          await EntitlementService.reassessEntitlements(intent.learnerId, 'LAMTONPAY_WEBHOOK');
        } catch (err) {
          console.error('[LamtonPay] Entitlement reassessment notice:', err);
        }
      }
      return result;
    });
  }

  /**
   * List recent payment intents with search and status filtering
   */
  static async listIntents(organisationId: string, filter?: { learnerId?: string; status?: PaymentIntentStatus }) {
    return prisma.paymentIntent.findMany({
      where: {
        organisationId,
        ...(filter?.learnerId ? { learnerId: filter.learnerId } : {}),
        ...(filter?.status ? { status: filter.status } : {}),
      },
      include: {
        learner: {
          select: { studentNumber: true, firstName: true, lastName: true },
        },
        invoice: {
          select: { invoiceNumber: true, totalAmount: true, balance: true },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
