import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';

const trackSchema = z.object({
  applicationNumber: z.string().trim().optional(),
  nrcOrEmail: z.string().trim().min(2),
});

export async function POST(request: Request) {
  const parsed = trackSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({
      success: false,
      message: 'Please provide your Email, Phone Number, NRC or Application Number.',
    }, { status: 400 });
  }

  const { applicationNumber, nrcOrEmail } = parsed.data;
  const p = prisma as any;
  const cleanInput = nrcOrEmail.toLowerCase().trim();

  // If applicationNumber is explicitly supplied, find that exact application
  if (applicationNumber && applicationNumber.trim()) {
    const apps = await p.admissionApplication.findMany({
      where: {
        applicationNumber: { equals: applicationNumber.trim(), mode: 'insensitive' },
      },
      include: {
        enrolledLearner: { select: { studentNumber: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!apps || apps.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No application found with the provided Application Number.',
      }, { status: 404 });
    }

    const matched = apps.find((app: any) => {
      if (app.email && app.email.toLowerCase().includes(cleanInput)) return true;
      if (app.phone && app.phone.toLowerCase().includes(cleanInput)) return true;
      for (const h of app.statusHistory) {
        if (h.metadataJson) {
          try {
            const meta = JSON.parse(h.metadataJson);
            if (meta.nrc && meta.nrc.toLowerCase().includes(cleanInput)) return true;
            if (meta.phone && meta.phone.toLowerCase().includes(cleanInput)) return true;
          } catch {}
        }
      }
      return false;
    });

    if (!matched) {
      return NextResponse.json({
        success: false,
        message: 'Application found, but NRC/Email does not match our records.',
      }, { status: 403 });
    }

    let metadata: any = {};
    const latestWithMeta = matched.statusHistory.find((h: any) => h.metadataJson);
    if (latestWithMeta?.metadataJson) {
      try {
        metadata = JSON.parse(latestWithMeta.metadataJson);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: {
        id: matched.id,
        applicationNumber: matched.applicationNumber,
        firstName: matched.firstName,
        middleName: matched.middleName,
        lastName: matched.lastName,
        email: matched.email,
        phone: matched.phone,
        programmeChoice: matched.programmeChoice,
        intakeLabel: matched.intakeLabel,
        status: matched.status,
        dateOfBirth: matched.dateOfBirth,
        submittedAt: matched.submittedAt,
        decisionAt: matched.decisionAt,
        enrolledLearner: matched.enrolledLearner,
        metadata,
        statusHistory: matched.statusHistory.map((h: any) => ({
          id: h.id,
          toStatus: h.toStatus,
          reason: h.reason,
          createdAt: h.createdAt,
        })),
      },
    });
  }

  // Prospective Student Sign-In Mode (using Email, Phone, NRC, or App Number)
  const allApps = await p.admissionApplication.findMany({
    include: {
      enrolledLearner: { select: { studentNumber: true } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const stripChars = (s: string) => (s || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const normalizedClean = stripChars(cleanInput);

  const matchingApps = allApps.filter((app: any) => {
    if (app.email && app.email.toLowerCase().includes(cleanInput)) return true;
    if (app.phone && (app.phone.toLowerCase().includes(cleanInput) || stripChars(app.phone).includes(normalizedClean))) return true;
    if (app.applicationNumber && (app.applicationNumber.toLowerCase().includes(cleanInput) || stripChars(app.applicationNumber).includes(normalizedClean))) return true;
    for (const h of app.statusHistory) {
      if (h.metadataJson) {
        try {
          const meta = JSON.parse(h.metadataJson);
          if (meta.nrc && (meta.nrc.toLowerCase().includes(cleanInput) || stripChars(meta.nrc).includes(normalizedClean))) return true;
          if (meta.phone && (meta.phone.toLowerCase().includes(cleanInput) || stripChars(meta.phone).includes(normalizedClean))) return true;
        } catch {}
      }
    }
    return false;
  });

  if (matchingApps.length === 0) {
    return NextResponse.json({
      success: false,
      message: `No candidate profile found matching "${nrcOrEmail}". Please verify your details or start a new application.`,
    }, { status: 404 });
  }

  const primary = matchingApps[0];
  let metadata: any = {};
  const latestWithMeta = primary.statusHistory.find((h: any) => h.metadataJson);
  if (latestWithMeta?.metadataJson) {
    try {
      metadata = JSON.parse(latestWithMeta.metadataJson);
    } catch {}
  }

  return NextResponse.json({
    success: true,
    data: {
      id: primary.id,
      applicationNumber: primary.applicationNumber,
      firstName: primary.firstName,
      middleName: primary.middleName,
      lastName: primary.lastName,
      email: primary.email,
      phone: primary.phone,
      programmeChoice: primary.programmeChoice,
      intakeLabel: primary.intakeLabel,
      status: primary.status,
      dateOfBirth: primary.dateOfBirth,
      submittedAt: primary.submittedAt,
      decisionAt: primary.decisionAt,
      enrolledLearner: primary.enrolledLearner,
      metadata,
      allApplications: matchingApps.map((a: any) => ({
        id: a.id,
        applicationNumber: a.applicationNumber,
        programmeChoice: a.programmeChoice,
        intakeLabel: a.intakeLabel,
        status: a.status,
        submittedAt: a.submittedAt,
      })),
      statusHistory: primary.statusHistory.map((h: any) => ({
        id: h.id,
        toStatus: h.toStatus,
        reason: h.reason,
        createdAt: h.createdAt,
      })),
    },
  });
}
