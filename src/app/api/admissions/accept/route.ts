import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';

const acceptSchema = z.object({
  applicationNumber: z.string().trim().min(3),
  nrcOrEmail: z.string().trim().min(3),
  paymentReference: z.string().trim().min(3),
  paymentMethod: z.string().trim().default('MTN_MONEY'),
  amountPaid: z.number().positive(),
  payerPhone: z.string().trim().optional(),
  remarks: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = acceptSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({
      success: false,
      message: 'Please provide valid acceptance and payment details.',
      issues: parsed.error.flatten(),
    }, { status: 400 });
  }

  const { applicationNumber, nrcOrEmail, paymentReference, paymentMethod, amountPaid, payerPhone, remarks } = parsed.data;
  const p = prisma as any;

  // Find application
  const app = await p.admissionApplication.findFirst({
    where: {
      applicationNumber: { equals: applicationNumber, mode: 'insensitive' },
    },
    include: {
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!app) {
    return NextResponse.json({
      success: false,
      message: 'Application not found.',
    }, { status: 404 });
  }

  // Check state
  if (app.status !== 'OFFERED') {
    return NextResponse.json({
      success: false,
      message: `Cannot accept offer in state "${app.status}". A provisional offer letter must be active.`,
    }, { status: 409 });
  }

  // Parse existing metadata
  let prevMeta: any = {};
  const latestHistory = app.statusHistory[0];
  if (latestHistory?.metadataJson) {
    try {
      prevMeta = JSON.parse(latestHistory.metadataJson);
    } catch {}
  }

  const acceptancePayload = {
    ...prevMeta,
    acceptedAt: new Date().toISOString(),
    paymentConfirmation: {
      reference: paymentReference,
      method: paymentMethod,
      amountZMW: amountPaid,
      payerPhone: payerPhone || app.phone,
      recordedAt: new Date().toISOString(),
      verified: true,
    },
    acceptanceNotes: remarks || 'Candidate confirmed acceptance of provisional admission offer and submitted payment confirmation.',
  };

  const updated = await p.$transaction(async (tx: any) => {
    const updatedApp = await tx.admissionApplication.update({
      where: { id: app.id },
      data: {
        status: 'ACCEPTED',
      },
    });

    await tx.admissionStatusHistory.create({
      data: {
        organisationId: app.organisationId,
        applicationId: app.id,
        toStatus: 'ACCEPTED',
        reason: `Provisional offer accepted by candidate. Required deposit of ZMW ${amountPaid.toFixed(2)} paid via ${paymentMethod} (Ref: ${paymentReference}). Awaiting final matriculation signature.`,
        metadataJson: JSON.stringify(acceptancePayload),
      },
    });

    await tx.auditEvent.create({
      data: {
        organisationId: app.organisationId,
        action: 'ADMISSION_OFFER_ACCEPTED_WITH_PAYMENT',
        entityType: 'AdmissionApplication',
        entityId: app.id,
        detailsJson: JSON.stringify({
          applicationNumber: app.applicationNumber,
          amountZMW: amountPaid,
          reference: paymentReference,
          method: paymentMethod,
        }),
      },
    });

    return updatedApp;
  });

  return NextResponse.json({
    success: true,
    data: updated,
    message: `Offer acceptance and payment confirmation of ZMW ${amountPaid.toFixed(2)} submitted successfully! Your official Final Acceptance & Matriculation Letter is now being processed for signature by the Registrar and Principal.`,
  });
}
