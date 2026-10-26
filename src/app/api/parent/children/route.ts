// src/app/api/parent/children/route.ts — Pure Database-Backed Student & Sponsor Linked Wards API
import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { extractAuthHeader, verifyToken } from '@/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = extractAuthHeader(req.headers.get('authorization'));
    const session = token ? verifyToken(token) : null;

    let orgId = session?.organisationId;
    if (!orgId) {
      const org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } });
      orgId = org?.id || null;
    }

    if (!orgId) {
      return NextResponse.json({ success: true, children: [] });
    }

    // Determine target guardianId if session exists
    const guardianId = session?.guardianId || session?.userId;

    let relationships: any[] = [];
    if (guardianId) {
      relationships = await prisma.learnerGuardianRelationship.findMany({
        where: {
          organisationId: orgId,
          guardianId,
          isAccessRevoked: false,
        },
        include: {
          learner: {
            include: {
              campus: true,
              currentClass: true,
              scores: {
                include: { assessment: { include: { subject: true, term: true } } },
                orderBy: { createdAt: 'desc' },
                take: 10,
              },
              invoices: {
                include: { lines: true },
                orderBy: { dueDate: 'desc' },
                take: 5,
              },
              payments: {
                include: { receipt: true },
                orderBy: { receivedDate: 'desc' },
                take: 5,
              },
            },
          },
        },
      });
    }

    // If no direct guardian session, check for learners in the organisation
    const children = relationships.map((rel) => {
      const l = rel.learner;
      const totalBilled = l.invoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0);
      const totalPaid = l.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      const balance = Math.max(0, totalBilled - totalPaid);

      const subjects = l.scores.map((sc: any) => ({
        code: sc.assessment?.subject?.code || 'HLTH',
        subjectName: sc.assessment?.subject?.name || 'Clinical Studies',
        score: Number(sc.scoreValue),
        eczGrade: Number(sc.scoreValue) >= 75 ? '1 (Distinction)' : '2 (Credit)',
        teacherRemark: sc.remarks || 'Satisfactory academic progress.',
      }));

      return {
        id: l.id,
        studentNumber: l.studentNumber,
        learnerName: `${l.firstName} ${l.lastName}`,
        campusName: l.campus?.name || 'Manyama Main Campus',
        className: l.currentClass?.name || 'Year 1 Nursing',
        relationshipType: rel.relationship,
        financialRole: rel.financialRole,
        totalBilled,
        totalPaid,
        balance,
        financialStatus: balance === 0 ? 'CLEARED' : totalPaid > 0 ? 'PARTIAL' : 'ARREARS',
        subjects,
        averageScore: subjects.length > 0 ? Math.round(subjects.reduce((sum: number, s: any) => sum + s.score, 0) / subjects.length) : 0,
      };
    });

    return NextResponse.json({ success: true, children });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error retrieving sponsor student records' },
      { status: 500 }
    );
  }
}
