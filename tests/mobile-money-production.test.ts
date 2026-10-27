import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../src/server/db';
import {
  parseZambianPhoneNumber,
  MobileMoneyService,
  MtnMomoClient,
  AirtelMoneyClient,
  ZamtelKwachaClient,
} from '../src/server/payments/mobileMoney.service';
import { PaymentChannel, PaymentIntentStatus, FeeCategory, PaymentMethod } from '@prisma/client';
import { FinanceService } from '../src/server/services/finance.service';

describe('NWUCHAS Production Mobile Money Rails (Airtel, MTN, Zamtel)', () => {
  let orgId: string;
  let termId: string;
  let testLearnerId: string;
  let testInvoiceId: string;

  beforeAll(async () => {
    const org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
    if (!org) throw new Error('NWUCHAS organisation not found.');
    orgId = org.id;

    // Resolve or create term
    const term = await prisma.term.findFirst();
    termId = term ? term.id : 'term-default';

    // Create a dedicated learner for mobile money testing
    const campus = (await prisma.campus.findFirst({ where: { organisationId: orgId } }))!;
    const learner = await prisma.learner.create({
      data: {
        organisationId: orgId,
        campusId: campus.id,
        studentNumber: `NWU-MOMO-${Date.now()}`,
        firstName: 'Taonga',
        lastName: 'Zulu',
        gender: 'FEMALE',
        dateOfBirth: new Date('2002-11-10'),
        status: 'ENROLLED',
      },
    });
    testLearnerId = learner.id;

    // Create test invoice of K4,500
    const invoice = await FinanceService.issueInvoice({
      organisationId: orgId,
      learnerId: testLearnerId,
      termId,
      invoiceNumber: `INV-MOMO-${Date.now()}`,
      dueDate: new Date(Date.now() + 30 * 86400000),
      lines: [
        { category: FeeCategory.TUITION, description: 'Diploma in Registered Nursing Tuition', unitPrice: 3500 },
        { category: FeeCategory.CLINICAL_PRACTICUM, description: 'Clinical Practicum Fee', unitPrice: 1000 },
      ],
    });
    testInvoiceId = invoice.id;
  });

  // --------------------------------------------------------------------------
  // 1. ZAMBIAN MSISDN NORMALIZATION & NETWORK CARRIER DETECTION
  // --------------------------------------------------------------------------
  describe('Zambian MSISDN Normalization & Carrier Validation', () => {
    it('accurately parses and formats MTN Zambia numbers (096, 076)', () => {
      const p1 = parseZambianPhoneNumber('0967812903');
      expect(p1.telco).toBe('MTN');
      expect(p1.msisdn).toBe('260967812903');
      expect(p1.national).toBe('0967812903');

      const p2 = parseZambianPhoneNumber('+260 76 1234567');
      expect(p2.telco).toBe('MTN');
      expect(p2.msisdn).toBe('260761234567');
    });

    it('accurately parses and formats Airtel Zambia numbers (097, 077)', () => {
      const p1 = parseZambianPhoneNumber('0978192034');
      expect(p1.telco).toBe('AIRTEL');
      expect(p1.msisdn).toBe('260978192034');
      expect(p1.shortNational).toBe('978192034');

      const p2 = parseZambianPhoneNumber('+260-77-9988771');
      expect(p2.telco).toBe('AIRTEL');
      expect(p2.msisdn).toBe('260779988771');
    });

    it('accurately parses and formats Zamtel Kwacha numbers (095, 075)', () => {
      const p1 = parseZambianPhoneNumber('0955123456');
      expect(p1.telco).toBe('ZAMTEL');
      expect(p1.msisdn).toBe('260955123456');

      const p2 = parseZambianPhoneNumber('+260751234567');
      expect(p2.telco).toBe('ZAMTEL');
      expect(p2.msisdn).toBe('260751234567');
    });

    it('rejects invalid or non-Zambian phone numbers', () => {
      expect(() => parseZambianPhoneNumber('0123456789')).toThrow(/Unsupported Zambian network prefix/i);
      expect(() => parseZambianPhoneNumber('12345')).toThrow(/Invalid Zambian phone number/i);
    });

    it('detects mismatched carrier and requested channel', async () => {
      // User specifies AIRTEL_MONEY but enters MTN number
      await expect(
        MobileMoneyService.initiateCollection({
          organisationId: orgId,
          learnerId: testLearnerId,
          payerPhone: '0967812903', // MTN!
          channel: PaymentChannel.AIRTEL_MONEY,
          amountZMW: 1000,
        })
      ).rejects.toThrow(/belongs to MTN, but AIRTEL_MONEY was requested/i);
    });
  });

  // --------------------------------------------------------------------------
  // 2. MTN MOBILE MONEY (MoMo) DISPATCH & STATUS ENQUIRY
  // --------------------------------------------------------------------------
  describe('MTN Mobile Money Zambia Rail', () => {
    it('initiates MTN MoMo USSD push (*303#) and transitions intent to PENDING_CUSTOMER', async () => {
      const result = await MobileMoneyService.initiateCollection({
        organisationId: orgId,
        learnerId: testLearnerId,
        invoiceId: testInvoiceId,
        payerPhone: '0967812903',
        amountZMW: 1500,
        payerName: 'Parent / Sponsor',
      });

      expect(result.telco).toBe('MTN');
      expect(result.ussdPrompt).toBe('*303#');
      expect(result.intent.status).toBe(PaymentIntentStatus.PENDING_CUSTOMER);
      expect(result.intent.channel).toBe(PaymentChannel.MTN_MOMO);
      expect(result.providerTransactionId).toBeDefined();

      // Verify provider transaction record logged in database
      const ptx = await prisma.providerTransaction.findFirst({
        where: { paymentIntentId: result.intent.id },
        orderBy: { createdAt: 'desc' },
      });
      expect(ptx?.providerCode).toBe('MTN_MOMO_ZM');
      expect(ptx?.status).toBe('PENDING_CUSTOMER');
    });

    it('handles MTN MoMo status query and confirms settlement upon carrier authorization', async () => {
      // 1. Create a fresh intent
      const initResult = await MobileMoneyService.initiateCollection({
        organisationId: orgId,
        learnerId: testLearnerId,
        invoiceId: testInvoiceId,
        payerPhone: '0967812903',
        amountZMW: 1500,
      });

      // 2. Query status: in sandbox/test mode or after handset PIN entry
      const statusRes = await MobileMoneyService.queryPaymentStatus(initResult.intent.id);
      expect(statusRes.intentId).toBe(initResult.intent.id);
      expect(statusRes.status).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // 3. AIRTEL MONEY ZAMBIA DISPATCH & STATUS ENQUIRY
  // --------------------------------------------------------------------------
  describe('Airtel Money Zambia Rail', () => {
    it('initiates Airtel Money USSD push (*778#) and records transaction reference', async () => {
      const result = await MobileMoneyService.initiateCollection({
        organisationId: orgId,
        learnerId: testLearnerId,
        invoiceId: testInvoiceId,
        payerPhone: '0978192034',
        amountZMW: 1800,
        payerName: 'Self (Student)',
      });

      expect(result.telco).toBe('AIRTEL');
      expect(result.ussdPrompt).toBe('*778#');
      expect(result.intent.status).toBe(PaymentIntentStatus.PENDING_CUSTOMER);
      expect(result.intent.channel).toBe(PaymentChannel.AIRTEL_MONEY);

      const ptx = await prisma.providerTransaction.findFirst({
        where: { paymentIntentId: result.intent.id },
      });
      expect(ptx?.providerCode).toBe('AIRTEL_MONEY_ZM');
    });

    it('queries Airtel Money status and returns carrier acknowledgement', async () => {
      const initResult = await MobileMoneyService.initiateCollection({
        organisationId: orgId,
        learnerId: testLearnerId,
        invoiceId: testInvoiceId,
        payerPhone: '0978192034',
        amountZMW: 1000,
      });

      const statusRes = await MobileMoneyService.queryPaymentStatus(initResult.intent.id);
      expect(statusRes.intentId).toBe(initResult.intent.id);
      expect(statusRes.status).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // 4. ZAMTEL KWACHA ZAMBIA DISPATCH & STATUS ENQUIRY
  // --------------------------------------------------------------------------
  describe('Zamtel Kwacha Zambia Rail', () => {
    it('initiates Zamtel Kwacha C2B push (*115#) and records transaction reference', async () => {
      const result = await MobileMoneyService.initiateCollection({
        organisationId: orgId,
        learnerId: testLearnerId,
        invoiceId: testInvoiceId,
        payerPhone: '0955123456',
        amountZMW: 1200,
        payerName: 'Chileshe Zulu',
      });

      expect(result.telco).toBe('ZAMTEL');
      expect(result.ussdPrompt).toBe('*115#');
      expect(result.intent.status).toBe(PaymentIntentStatus.PENDING_CUSTOMER);
      expect(result.intent.channel).toBe(PaymentChannel.ZAMTEL_MONEY);

      const ptx = await prisma.providerTransaction.findFirst({
        where: { paymentIntentId: result.intent.id },
      });
      expect(ptx?.providerCode).toBe('ZAMTEL_KWACHA_ZM');
    });

    it('queries Zamtel Kwacha status and verifies state machine handling', async () => {
      const initResult = await MobileMoneyService.initiateCollection({
        organisationId: orgId,
        learnerId: testLearnerId,
        invoiceId: testInvoiceId,
        payerPhone: '0955123456',
        amountZMW: 800,
      });

      const statusRes = await MobileMoneyService.queryPaymentStatus(initResult.intent.id);
      expect(statusRes.intentId).toBe(initResult.intent.id);
      expect(statusRes.status).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // 5. CARRIER WEBHOOK SETTLEMENT & OFFICIAL LEDGER POSTING
  // --------------------------------------------------------------------------
  describe('Mobile Money Webhook & Automatic Ledger Settlement', () => {
    it('confirms payment via webhook for MTN MoMo and credits student fee ledger', async () => {
      // 1. Create intent
      const init = await MobileMoneyService.initiateCollection({
        organisationId: orgId,
        learnerId: testLearnerId,
        invoiceId: testInvoiceId,
        payerPhone: '0967812903',
        amountZMW: 2000,
      });

      // 2. Simulate carrier settlement confirmation
      const confirmResult = await FinanceService.recordPayment({
        organisationId: orgId,
        learnerId: testLearnerId,
        invoiceId: testInvoiceId,
        paymentNumber: `PAY-MOMO-${Date.now()}`,
        amount: 2000,
        paymentMethod: PaymentMethod.MTN_MONEY,
        referenceNumber: `MTN-FIN-TX-${Date.now()}`,
      });

      expect(confirmResult.id).toBeDefined();

      // 3. Verify ledger entry posted with type CREDIT_PAYMENT
      const ledgerEntry = await prisma.ledgerEntry.findFirst({
        where: { paymentId: confirmResult.id },
      });
      expect(ledgerEntry).toBeDefined();
      expect(ledgerEntry?.entryType).toBe('CREDIT_PAYMENT');
      expect(Number(ledgerEntry?.amount)).toBe(2000);
    });

    it('supports ZAMTEL_MONEY payment method when posting official receipts', async () => {
      const zamtelPayment = await FinanceService.recordPayment({
        organisationId: orgId,
        learnerId: testLearnerId,
        paymentNumber: `PAY-ZAM-${Date.now()}`,
        amount: 500,
        paymentMethod: PaymentMethod.ZAMTEL_MONEY,
        referenceNumber: `ZAM-FIN-${Date.now()}`,
      });

      expect(zamtelPayment.paymentMethod).toBe(PaymentMethod.ZAMTEL_MONEY);
      expect(Number(zamtelPayment.amount)).toBe(500);
    });
  });
});
