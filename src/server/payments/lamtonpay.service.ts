import { prisma } from '../db';
import { PaymentChannel, PaymentIntentStatus, PaymentMethod, SuspenseStatus } from '@prisma/client';
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
        providerCode:
          data.channel === 'MTN_MOMO'
            ? 'MTN_MOMO_ZM'
            : data.channel === 'AIRTEL_MONEY'
            ? 'AIRTEL_MONEY_ZM'
            : data.channel === 'ZAMTEL_MONEY'
            ? 'ZAMTEL_KWACHA_ZM'
            : 'LAMTON_GENERIC',
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

    const expectedAmount = Number(intent.amountZMW);
    const confirmedAmount = data.verifiedAmount ?? expectedAmount;
    if (!Number.isFinite(confirmedAmount) || confirmedAmount <= 0) {
      throw new PaymentWorkflowError('Provider confirmation must include a positive payment amount.');
    }
    if (Math.round(confirmedAmount * 100) !== Math.round(expectedAmount * 100)) {
      throw new PaymentWorkflowError('Provider confirmation amount does not match the payment intent.');
    }
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
            : intent.channel === 'ZAMTEL_MONEY'
            ? 'ZAMTEL_MONEY'
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

  /**
   * Parse Zambian Bank Statements (Zanaco BillMaster, Atlas Mara, Stanbic, Standard Chartered, MT940, CSV)
   * Extracts Date, Transaction Reference, Narration, Amount, and student ID candidates. (GAP-06)
   */
  static parseBankStatement(rawContent: string): Array<{
    transactionDate: Date;
    referenceNumber: string;
    narration: string;
    amountZMW: number;
    extractedStudentId: string | null;
  }> {
    const lines = rawContent.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const parsedRows: Array<{
      transactionDate: Date;
      referenceNumber: string;
      narration: string;
      amountZMW: number;
      extractedStudentId: string | null;
    }> = [];

    // Check if MT940 format (contains :61: or :86:)
    const isMT940 = rawContent.includes(':61:') || rawContent.includes(':20:');

    if (isMT940) {
      let currentDate = new Date();
      let currentRef = '';
      let currentAmount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith(':61:')) {
          // MT940 statement line :61:YYMMDD...
          const dateStr = line.substring(4, 10);
          if (dateStr.length === 6) {
            const year = 2000 + parseInt(dateStr.substring(0, 2), 10);
            const month = parseInt(dateStr.substring(2, 4), 10) - 1;
            const day = parseInt(dateStr.substring(4, 6), 10);
            currentDate = new Date(year, month, day);
          }
          const amountMatch = line.match(/[CD]([0-9]+[.,]?[0-9]*)/);
          currentAmount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;
          currentRef = `MT940-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        } else if (line.startsWith(':86:')) {
          // Information to account owner / narration
          const narration = line.substring(4) + (lines[i + 1] && !lines[i + 1].startsWith(':') ? ' ' + lines[++i] : '');
          const studentMatch = narration.match(/(?:NWU|DEV|CMIS)[-_ ]?(?:202[4-9])?[-_ ]?\d{3,5}/i);
          parsedRows.push({
            transactionDate: currentDate,
            referenceNumber: currentRef,
            narration,
            amountZMW: currentAmount,
            extractedStudentId: studentMatch ? studentMatch[0].replace(/\s+/g, '-').toUpperCase() : null,
          });
        }
      }
      return parsedRows;
    }

    // CSV Parsing (Zanaco BillMaster, Commercial Bank EFT extract)
    const headerLineIndex = lines.findIndex((l) =>
      /date|reference|ref|narration|description|amount|credit/i.test(l)
    );
    const dataLines = headerLineIndex >= 0 ? lines.slice(headerLineIndex + 1) : lines;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line || line.startsWith('#')) continue;

      // Split CSV (respecting quoted values)
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.replace(/^"|"$/g, '').trim());
      if (cols.length < 3) continue;

      // Heuristic column detection
      let dateVal = new Date();
      let refVal = `TX-${Date.now()}-${i}`;
      let narrVal = '';
      let amountVal = 0;

      for (let c = 0; c < cols.length; c++) {
        const val = cols[c];
        const numClean = val.replace(/,/g, '');
        if (!isNaN(Date.parse(val)) && (val.includes('-') || val.includes('/') || val.includes('.'))) {
          dateVal = new Date(val);
        } else if (/^[A-Z0-9_-]{6,30}$/i.test(val) && !/^\d+(\.\d+)?$/.test(val)) {
          refVal = val;
        } else if (!isNaN(parseFloat(numClean)) && parseFloat(numClean) > 0 && Number(numClean) > 10) {
          amountVal = parseFloat(numClean);
        } else if (val.length > narrVal.length) {
          narrVal = val;
        }
      }

      if (!narrVal && cols.length > 2) {
        narrVal = cols.slice(1, -1).join(' ');
      }

      // Regex matching for Zambian Student Number in narration: NWU-2026-XXXX, NWU-STU-XXXX, etc.
      const studentMatch = narrVal.match(/(?:NWU|DEV|CMIS)[-_ ]?(?:202[4-9])?[-_ ]?\d{3,5}/i);
      const extractedStudentId = studentMatch ? studentMatch[0].replace(/\s+/g, '-').toUpperCase() : null;

      if (amountVal > 0) {
        parsedRows.push({
          transactionDate: isNaN(dateVal.getTime()) ? new Date() : dateVal,
          referenceNumber: refVal,
          narration: narrVal || 'Bank Deposit / EFT Credit',
          amountZMW: amountVal,
          extractedStudentId,
        });
      }
    }

    return parsedRows;
  }

  /**
   * Ingest Zambian Bank Statement CSV / MT940 and auto-match into receipts and Suspense Queue (GAP-06)
   */
  static async ingestBankStatement(params: {
    organisationId: string;
    bankName: string;
    rawContent: string;
    filename?: string;
    importedById?: string;
  }) {
    const parsedRows = this.parseBankStatement(params.rawContent);
    if (parsedRows.length === 0) {
      throw new Error('No valid financial transactions detected in statement. Verify file format.');
    }

    const totalAmount = parsedRows.reduce((sum, r) => sum + r.amountZMW, 0);

    // 1. Create statement import batch record
    const importBatch = await prisma.bankStatementImport.create({
      data: {
        organisationId: params.organisationId,
        bankName: params.bankName || 'Zanaco BillMaster',
        filename: params.filename || 'bank_statement.csv',
        totalRows: parsedRows.length,
        totalAmountZMW: new Decimal(totalAmount.toFixed(2)),
        importedById: params.importedById,
      },
    });

    let matchedCount = 0;
    let suspenseCount = 0;
    const matchedEntries: any[] = [];
    const suspenseEntries: any[] = [];

    for (const row of parsedRows) {
      let matchedLearner = null;

      if (row.extractedStudentId) {
        // Look up learner by extracted student number
        matchedLearner = await prisma.learner.findFirst({
          where: {
            organisationId: params.organisationId,
            studentNumber: {
              contains: row.extractedStudentId.replace(/[^A-Za-z0-9]/g, ''),
              mode: 'insensitive',
            },
          },
        });

        // Fallback exact or clean match
        if (!matchedLearner) {
          matchedLearner = await prisma.learner.findFirst({
            where: {
              organisationId: params.organisationId,
              OR: [
                { studentNumber: { equals: row.extractedStudentId, mode: 'insensitive' } },
                { studentNumber: { endsWith: row.extractedStudentId.slice(-4) } },
              ],
            },
          });
        }
      }

      if (matchedLearner) {
        // Auto-match successful: post payment via FinanceService waterfall
        const paymentNumber = `PAY-BANK-${Math.floor(10000 + Math.random() * 90000)}`;
        const receiptNumber = `REC-BANK-${Math.floor(10000 + Math.random() * 90000)}`;

        const payment = await FinanceService.recordPayment({
          organisationId: params.organisationId,
          learnerId: matchedLearner.id,
          amount: row.amountZMW,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          paymentNumber,
          receiptNumber,
          referenceNumber: row.referenceNumber,
          notes: `Auto-reconciled from ${params.bankName}: ${row.narration}`,
          recordedById: params.importedById,
        });

        matchedCount++;
        matchedEntries.push({
          reference: row.referenceNumber,
          amount: row.amountZMW,
          studentNumber: matchedLearner.studentNumber,
          learnerName: `${matchedLearner.firstName} ${matchedLearner.lastName}`,
          paymentId: payment.id,
        });

        // Trigger entitlement reassessment
        EntitlementService.reassessEntitlements(matchedLearner.id, 'BANK_RECONCILIATION').catch((err) =>
          console.error('[BankRecon] Entitlement update notice:', err)
        );
      } else {
        // No match: deposit into Bank Suspense Queue for manual cashier allocation
        const suspense = await prisma.bankSuspenseEntry.create({
          data: {
            importBatchId: importBatch.id,
            organisationId: params.organisationId,
            transactionDate: row.transactionDate,
            referenceNumber: row.referenceNumber,
            narration: row.narration,
            amountZMW: new Decimal(row.amountZMW.toFixed(2)),
            extractedStudentId: row.extractedStudentId,
            status: SuspenseStatus.PENDING,
          },
        });

        suspenseCount++;
        suspenseEntries.push(suspense);
      }
    }

    // Update import batch statistics
    const updatedBatch = await prisma.bankStatementImport.update({
      where: { id: importBatch.id },
      data: {
        matchedRows: matchedCount,
        suspenseRows: suspenseCount,
      },
    });

    return {
      batch: updatedBatch,
      totalProcessed: parsedRows.length,
      matchedCount,
      suspenseCount,
      matchedEntries,
      suspenseEntries,
    };
  }

  /**
   * Cashier manually allocates an entry from the Suspense Queue to a verified student (GAP-06)
   */
  static async allocateSuspenseEntry(params: {
    organisationId: string;
    entryId: string;
    learnerId: string;
    allocatedById: string;
    notes?: string;
  }) {
    const entry = await prisma.bankSuspenseEntry.findUnique({
      where: { id: params.entryId },
    });
    if (!entry) throw new Error('Suspense entry not found.');
    if (entry.status !== SuspenseStatus.PENDING) {
      throw new Error(`Suspense entry is already ${entry.status}.`);
    }

    const learner = await prisma.learner.findUnique({
      where: { id: params.learnerId },
    });
    if (!learner) throw new Error('Selected student not found.');

    const paymentNumber = `PAY-SUSP-${Math.floor(10000 + Math.random() * 90000)}`;
    const receiptNumber = `REC-SUSP-${Math.floor(10000 + Math.random() * 90000)}`;

    const payment = await FinanceService.recordPayment({
      organisationId: params.organisationId,
      learnerId: learner.id,
      amount: Number(entry.amountZMW),
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentNumber,
      receiptNumber,
      referenceNumber: entry.referenceNumber,
      notes: `Manual Suspense Allocation: ${entry.narration} ${params.notes ? `(${params.notes})` : ''}`,
      recordedById: params.allocatedById,
    });

    const updatedEntry = await prisma.bankSuspenseEntry.update({
      where: { id: entry.id },
      data: {
        status: SuspenseStatus.ALLOCATED,
        matchedLearnerId: learner.id,
        matchedPaymentId: payment.id,
        allocatedById: params.allocatedById,
        allocatedAt: new Date(),
        notes: params.notes,
      },
    });

    EntitlementService.reassessEntitlements(learner.id, 'SUSPENSE_MANUAL_ALLOCATION').catch((err) =>
      console.error('[BankRecon] Entitlement update notice:', err)
    );

    return { entry: updatedEntry, payment };
  }

  /**
   * List items currently in the Suspense Queue
   */
  static async listSuspenseQueue(organisationId: string, status?: SuspenseStatus) {
    return prisma.bankSuspenseEntry.findMany({
      where: {
        organisationId,
        ...(status ? { status } : {}),
      },
      include: {
        importBatch: true,
      },
      orderBy: { transactionDate: 'desc' },
      take: 100,
    });
  }

  /**
   * List statement import batches
   */
  static async listBankStatementImports(organisationId: string) {
    return prisma.bankStatementImport.findMany({
      where: { organisationId },
      include: {
        entries: {
          take: 10,
        },
      },
      orderBy: { statementDate: 'desc' },
      take: 20,
    });
  }
}

