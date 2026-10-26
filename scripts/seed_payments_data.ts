import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function seedPayments() {
  const p = prisma as any;
  const org = await p.organisation.findFirst({
    where: { code: 'NWUCHAS' },
  }) || await prisma.organisation.findFirst();

  if (!org) {
    console.error('No organisation found.');
    return;
  }

  console.log('Seeding payments data for organisation:', org.name, org.id);

  // 1. Get learners and unpaid invoices
  const learners = await p.learner.findMany({
    where: { organisationId: org.id },
    take: 5,
  });

  const invoices = await p.invoice.findMany({
    where: { organisationId: org.id },
    take: 5,
  });

  // 2. Upsert Sample Payment Intents if fewer than 4 exist
  const existingIntentsCount = await p.paymentIntent.count({
    where: { organisationId: org.id },
  });

  if (existingIntentsCount < 4 && learners.length > 0) {
    const sampleIntents = [
      {
        businessReference: 'LP-NWU-2026-410291',
        idempotencyKey: 'idem-momo-2026-001',
        channel: 'MTN_MOMO' as const,
        amountZMW: new Decimal('4500.00'),
        payerPhone: '0967812903',
        payerName: 'Kondwani Mwape (Sponsor)',
        status: 'CONFIRMED' as const,
        providerReference: 'MTN-ZM-TX-88291039',
        settledAt: new Date(Date.now() - 2 * 3600 * 1000),
        learnerId: learners[0]?.id,
        invoiceId: invoices[0]?.id,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
      {
        businessReference: 'LP-NWU-2026-410292',
        idempotencyKey: 'idem-airtel-2026-002',
        channel: 'AIRTEL_MONEY' as const,
        amountZMW: new Decimal('2800.00'),
        payerPhone: '0978192034',
        payerName: 'Agnes Banda',
        status: 'CONFIRMED' as const,
        providerReference: 'AIRTEL-MO-9938217',
        settledAt: new Date(Date.now() - 5 * 3600 * 1000),
        learnerId: learners[1]?.id || learners[0]?.id,
        invoiceId: invoices[1]?.id || invoices[0]?.id,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
      {
        businessReference: 'LP-NWU-2026-410293',
        idempotencyKey: 'idem-card-2026-003',
        channel: 'CARD_HOSTED' as const,
        amountZMW: new Decimal('7500.00'),
        payerPhone: '0955678123',
        payerName: 'Dr. Chola Mulenga',
        status: 'INITIATED' as const,
        providerReference: null,
        settledAt: null,
        learnerId: learners[2]?.id || learners[0]?.id,
        invoiceId: invoices[2]?.id || invoices[0]?.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
      {
        businessReference: 'LP-NWU-2026-410294',
        idempotencyKey: 'idem-momo-2026-004',
        channel: 'MTN_MOMO' as const,
        amountZMW: new Decimal('1200.00'),
        payerPhone: '0966453210',
        payerName: 'Mary Sichone',
        status: 'CREATED' as const,
        providerReference: null,
        settledAt: null,
        learnerId: learners[3]?.id || learners[0]?.id,
        invoiceId: invoices[3]?.id || invoices[0]?.id,
        expiresAt: new Date(Date.now() + 25 * 60 * 1000),
      },
    ];

    for (const item of sampleIntents) {
      await p.paymentIntent.upsert({
        where: { idempotencyKey: item.idempotencyKey },
        update: {},
        create: {
          organisationId: org.id,
          ...item,
        },
      });
    }
    console.log('Sample payment intents seeded.');
  }

  // 3. Upsert Sample Settlement Batches
  const existingBatchesCount = await p.settlementBatch.count({
    where: { organisationId: org.id },
  });

  if (existingBatchesCount === 0) {
    const batch1 = await p.settlementBatch.upsert({
      where: {
        organisationId_batchReference: {
          organisationId: org.id,
          batchReference: 'SET-MTN-2026-W16-01',
        },
      },
      update: {},
      create: {
        organisationId: org.id,
        providerCode: 'MTN_MOMO_ZM',
        batchReference: 'SET-MTN-2026-W16-01',
        settlementDate: new Date(Date.now() - 24 * 3600 * 1000),
        totalAmountZMW: new Decimal('24500.00'),
        feeAmountZMW: new Decimal('367.50'), // 1.5% gateway fee
        netAmountZMW: new Decimal('24132.50'),
        isReconciled: true,
        reconciledAt: new Date(Date.now() - 12 * 3600 * 1000),
        reconciledById: 'BURSAR-FIN-01',
        settlementLines: {
          create: [
            {
              providerTxId: 'MTN-ZM-TX-88291039',
              amountZMW: new Decimal('4500.00'),
              feeZMW: new Decimal('67.50'),
              netZMW: new Decimal('4432.50'),
              isMatched: true,
            },
            {
              providerTxId: 'MTN-ZM-TX-88291040',
              amountZMW: new Decimal('10000.00'),
              feeZMW: new Decimal('150.00'),
              netZMW: new Decimal('9850.00'),
              isMatched: true,
            },
            {
              providerTxId: 'MTN-ZM-TX-88291041',
              amountZMW: new Decimal('10000.00'),
              feeZMW: new Decimal('150.00'),
              netZMW: new Decimal('9850.00'),
              isMatched: true,
            },
          ],
        },
      },
    });

    const batch2 = await p.settlementBatch.upsert({
      where: {
        organisationId_batchReference: {
          organisationId: org.id,
          batchReference: 'SET-AIRTEL-2026-W16-02',
        },
      },
      update: {},
      create: {
        organisationId: org.id,
        providerCode: 'AIRTEL_MONEY_ZM',
        batchReference: 'SET-AIRTEL-2026-W16-02',
        settlementDate: new Date(Date.now() - 6 * 3600 * 1000),
        totalAmountZMW: new Decimal('18200.00'),
        feeAmountZMW: new Decimal('273.00'),
        netAmountZMW: new Decimal('17927.00'),
        isReconciled: false,
        settlementLines: {
          create: [
            {
              providerTxId: 'AIRTEL-MO-9938217',
              amountZMW: new Decimal('2800.00'),
              feeZMW: new Decimal('42.00'),
              netZMW: new Decimal('2758.00'),
              isMatched: true,
            },
            {
              providerTxId: 'AIRTEL-MO-9938218',
              amountZMW: new Decimal('8400.00'),
              feeZMW: new Decimal('126.00'),
              netZMW: new Decimal('8274.00'),
              isMatched: false,
            },
            {
              providerTxId: 'AIRTEL-MO-9938219',
              amountZMW: new Decimal('7000.00'),
              feeZMW: new Decimal('105.00'),
              netZMW: new Decimal('6895.00'),
              isMatched: false,
            },
          ],
        },
      },
    });

    console.log('Sample settlement batches created:', batch1.batchReference, batch2.batchReference);
  }

  // 4. Upsert Sample Webhook Inbox Logs
  const existingWebhooksCount = await p.webhookInboxEvent.count();
  if (existingWebhooksCount === 0) {
    const webhooks = [
      {
        providerCode: 'MTN_MOMO_ZM',
        signatureHeader: 'sha256=a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
        payloadJson: JSON.stringify({
          event: 'payment.success',
          reference: 'LP-NWU-2026-410291',
          externalId: 'MTN-ZM-TX-88291039',
          amount: '4500.00',
          currency: 'ZMW',
          payer: { msisdn: '260967812903', name: 'Kondwani Mwape' },
          timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        }),
        status: 'PROCESSED' as const,
        isSignatureValid: true,
        processedAt: new Date(Date.now() - 2 * 3600 * 1000),
      },
      {
        providerCode: 'AIRTEL_MONEY_ZM',
        signatureHeader: 'sha256=11223344556677889900aabbccddeeff001122334455',
        payloadJson: JSON.stringify({
          event: 'transaction.completed',
          txn_id: 'AIRTEL-MO-9938217',
          client_ref: 'LP-NWU-2026-410292',
          amount: 2800,
          fee: 42,
          phone: '260978192034',
          status: 'TS',
          timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        }),
        status: 'PROCESSED' as const,
        isSignatureValid: true,
        processedAt: new Date(Date.now() - 5 * 3600 * 1000),
      },
      {
        providerCode: 'MTN_MOMO_ZM',
        signatureHeader: 'sha256=badsignature99887766554433221100aabbccddeeff',
        payloadJson: JSON.stringify({
          event: 'payment.failed',
          reference: 'LP-NWU-2026-999999',
          error: 'INSUFFICIENT_FUNDS_CUSTOMER_WALLET',
          amount: '12000.00',
        }),
        status: 'FAILED' as const,
        isSignatureValid: false,
        processingError: 'HMAC signature verification failed against provider public secret.',
        processedAt: new Date(Date.now() - 8 * 3600 * 1000),
      },
    ];

    for (const w of webhooks) {
      await p.webhookInboxEvent.create({
        data: w,
      });
    }
    console.log('Sample webhook inbox logs created.');
  }

  console.log('Seeding completed successfully.');
}

seedPayments()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
