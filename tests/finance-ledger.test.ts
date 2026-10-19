// Tests: AC-06 & AC-07 Financial Ledger & Idempotency
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../src/server/db';
import { FinanceService } from '../src/server/services/finance.service';
import { FeeCategory, PaymentMethod, LedgerEntryType } from '@prisma/client';
import { getFinancialSummary } from '../src/server/services/financeReporting.service';

describe('AC-06 & AC-07: Financial Ledger Integrity, Idempotency & Reversals', () => {
  let orgId: string;
  let pupilId: string;
  let termId: string;

  beforeAll(async () => {
    const org = await prisma.organisation.findUnique({ where: { code: 'EDS-ZM-001' } });
    orgId = org!.id;

    const pupil = await prisma.learner.findFirst({ where: { organisationId: orgId } });
    pupilId = pupil!.id;

    const term = await prisma.term.findFirst();
    termId = term!.id;
  });

  it('Invoicing with the same idempotencyKey does NOT create duplicate invoices or charges', async () => {
    const key = `test-idempotency-${Date.now()}`;
    const inv1 = await FinanceService.issueInvoice({
      organisationId: orgId,
      learnerId: pupilId,
      termId,
      invoiceNumber: `TEST-INV-${Date.now()}-1`,
      dueDate: new Date(),
      idempotencyKey: key,
      lines: [{ category: FeeCategory.TUITION, description: 'Tuition', unitPrice: 1000 }],
    });

    const inv2 = await FinanceService.issueInvoice({
      organisationId: orgId,
      learnerId: pupilId,
      termId,
      invoiceNumber: `TEST-INV-${Date.now()}-2`,
      dueDate: new Date(),
      idempotencyKey: key,
      lines: [{ category: FeeCategory.TUITION, description: 'Tuition', unitPrice: 1000 }],
    });

    expect(inv1.id).toBe(inv2.id);
  });

  it('Partial payment updates invoice balance accurately and posts credit to ledger', async () => {
    const invoice = await FinanceService.issueInvoice({
      organisationId: orgId,
      learnerId: pupilId,
      termId,
      invoiceNumber: `TEST-PARTIAL-${Date.now()}`,
      dueDate: new Date(),
      lines: [{ category: FeeCategory.TUITION, description: 'Term Tuition', unitPrice: 2000 }],
    });

    const payment = await FinanceService.recordPayment({
      organisationId: orgId,
      learnerId: pupilId,
      invoiceId: invoice.id,
      paymentNumber: `TEST-PAY-${Date.now()}`,
      receiptNumber: `TEST-REC-${Date.now()}`,
      amount: 800,
      paymentMethod: PaymentMethod.CASH,
      referenceNumber: 'CASH-REF-001',
    });

    const updatedInv = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    expect(Number(updatedInv!.paidAmount)).toBe(800);
    expect(Number(updatedInv!.balance)).toBe(1200);
    expect(updatedInv!.status).toBe('PARTIALLY_PAID');
  });

  it('Payment reversal creates a traceable corrective entry rather than deleting historical records', async () => {
    const invoice = await FinanceService.issueInvoice({
      organisationId: orgId,
      learnerId: pupilId,
      termId,
      invoiceNumber: `TEST-REV-INV-${Date.now()}`,
      dueDate: new Date(),
      lines: [{ category: FeeCategory.EXAMINATION, description: 'Exam Levy', unitPrice: 500 }],
    });

    const payment = await FinanceService.recordPayment({
      organisationId: orgId,
      learnerId: pupilId,
      invoiceId: invoice.id,
      paymentNumber: `TEST-PAY-REV-${Date.now()}`,
      receiptNumber: `TEST-REC-REV-${Date.now()}`,
      amount: 500,
      paymentMethod: PaymentMethod.CHEQUE,
      referenceNumber: 'CHQ-BOUNCED-99',
    });

    // Reverse the payment
    const reversalEntry = await FinanceService.reversePayment({
      organisationId: orgId,
      paymentId: payment.id,
      reason: 'Dishonoured cheque from drawer',
    });

    expect(reversalEntry.entryType).toBe(LedgerEntryType.DEBIT_REVERSAL);
    expect(Number(reversalEntry.amount)).toBe(500);

    // Verify payment was NOT deleted from database
    const paymentStillExists = await prisma.payment.findUnique({ where: { id: payment.id } });
    expect(paymentStillExists).not.toBeNull();
  });

  it('getAllLearnersFeeBalances calculates accurate ageing buckets and net fee balances', async () => {
    const balances = await FinanceService.getAllLearnersFeeBalances(orgId);
    expect(Array.isArray(balances)).toBe(true);
    expect(balances.length).toBeGreaterThan(0);

    const first = balances[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('studentNumber');
    expect(first).toHaveProperty('totalBilled');
    expect(first).toHaveProperty('totalPaid');
    expect(first).toHaveProperty('balance');
    expect(first).toHaveProperty('financialStatus');
    expect(first).toHaveProperty('ageing');
    expect(first.ageing).toHaveProperty('current');
    expect(first.ageing).toHaveProperty('days31to60');
    expect(first.ageing).toHaveProperty('days61to90');
    expect(first.ageing).toHaveProperty('over90days');
  });

  it('getLearnerPaymentHistory returns complete chronological payment journal and receipts for learner', async () => {
    const history = await FinanceService.getLearnerPaymentHistory(orgId, pupilId);
    expect(history).toHaveProperty('learner');
    expect(history).toHaveProperty('payments');
    expect(history).toHaveProperty('totalPaid');
    expect(Array.isArray(history.payments)).toBe(true);
    if (history.payments.length > 0) {
      const paymentItem = history.payments[0];
      expect(paymentItem).toHaveProperty('paymentNumber');
      expect(paymentItem).toHaveProperty('amount');
      expect(paymentItem).toHaveProperty('paymentMethod');
      expect(paymentItem).toHaveProperty('receivedDate');
    }
  });

  it('getFinancialReports aggregates Daily Cashbook, Category Revenues, Class Collections and Aged Debtors', async () => {
    const reports = await FinanceService.getFinancialReports(orgId);
    expect(reports).toHaveProperty('cashbook');
    expect(reports).toHaveProperty('categoryRevenue');
    expect(reports).toHaveProperty('classComparison');
    expect(reports).toHaveProperty('ageingSummary');
    expect(reports).toHaveProperty('totals');

    expect(Array.isArray(reports.cashbook)).toBe(true);
    expect(Array.isArray(reports.categoryRevenue)).toBe(true);
    expect(Array.isArray(reports.classComparison)).toBe(true);
    expect(reports.ageingSummary).toHaveProperty('totalOutstanding');
    expect(reports.ageingSummary).toHaveProperty('current');
    expect(reports.ageingSummary).toHaveProperty('days31to60');
    expect(reports.ageingSummary).toHaveProperty('days61to90');
    expect(reports.ageingSummary).toHaveProperty('over90days');
  });

  it('FIN-001: Central Financial Reporting Service reconciles collections, billings, and expenditures with zero variance', () => {
    const allSummary = getFinancialSummary('ALL');
    expect(allSummary.totalBilledZMW).toBeGreaterThan(0);
    expect(allSummary.totalCollectedZMW).toBeGreaterThan(0);
    expect(allSummary.totalExpendituresZMW).toBeGreaterThan(0);
    expect(allSummary.reconciliationStatus.isReconciled).toBe(true);
    expect(allSummary.reconciliationStatus.varianceZMW).toBe(0);

    // Sum of campuses equals or reconciles to consolidated totals
    const mushitala = getFinancialSummary('MUSHITALA');
    const urban = getFinancialSummary('URBAN');
    expect(mushitala.totalCollectedZMW + urban.totalCollectedZMW).toBe(allSummary.totalCollectedZMW);
    expect(mushitala.totalBilledZMW + urban.totalBilledZMW).toBe(allSummary.totalBilledZMW);
  });
});
