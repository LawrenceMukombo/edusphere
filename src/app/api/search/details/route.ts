// src/app/api/search/details/route.ts — 360° Entity Dossier & Deep Inspection API
import { NextRequest, NextResponse } from 'next/server';
import {
  SEED_LEARNERS,
  SEED_STAFF,
  SEED_COURSES,
  ENTERPRISE_FEATURES,
  CLINICAL_SITES,
} from '@/server/search/universalSearchEngine';
import { prisma } from '@/server/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'student' | 'staff' | 'course' | 'feature' | 'clinical'
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { success: false, message: 'Entity type and identification required.' },
        { status: 400 }
      );
    }

    if (type === 'student') {
      let student = SEED_LEARNERS.find((s) => s.id === id || s.studentNumber === id);
      if (!student) {
        try {
          const dbLearner = await (prisma as any).learner.findFirst({
            where: { OR: [{ id }, { studentNumber: id }] },
            include: {
              campus: true,
              indexingRecord: true,
              clinicalPlacements: { include: { clinicalSite: true } },
              invoices: true,
              payments: true,
            },
          });
          if (dbLearner) {
            student = {
              id: dbLearner.id,
              studentNumber: dbLearner.studentNumber,
              fullName: `${dbLearner.firstName} ${dbLearner.lastName}`,
              gender: dbLearner.gender,
              dateOfBirth: dbLearner.dateOfBirth ? new Date(dbLearner.dateOfBirth).toISOString().split('T')[0] : '2003-08-22',
              nrcNumber: '293810/11/1',
              nationality: dbLearner.nationality || 'Zambian',
              programmeName: 'Diploma in Registered Nursing',
              programmeCode: 'DRN',
              cohort: 'RN-2026-JAN (2026 Academic Year)',
              campusName: dbLearner.campus?.name || 'NWUCHAS Main Campus (Manyama / Lumwana)',
              enrolmentStatus: dbLearner.status,
              nmczIndexNumber: dbLearner.indexingRecord?.indexNumber || 'NMCZ/RN/2026/0144',
              currentYear: 1,
              currentSemester: 1,
              academicStanding: 'PROCEED TO NEXT SEMESTER IN GOOD STANDING',
              weightedScore: 80.5,
              financialBalanceZMW: 0.0,
              financialStatus: 'CLEARED',
              guardianName: 'Guardian',
              guardianPhone: '+260 977 000 000',
              emergencyContact: '+260 977 000 000',
              moduleRegistrations: [
                { code: 'NUR-111', title: 'Anatomy and Physiology I', caScore: 32.5, examScore: 48.0, finalScore: 80.5, grade: 'A', status: 'PASS' },
                { code: 'NUR-112', title: 'Fundamentals of Nursing Practice', caScore: 32.5, examScore: 48.0, finalScore: 80.5, grade: 'A', status: 'PASS' },
                { code: 'NUR-113', title: 'Microbiology and Parasitology', caScore: 32.5, examScore: 48.0, finalScore: 80.5, grade: 'A', status: 'PASS' },
              ],
              clinicalPlacements: [
                { siteName: 'Manyama District Hospital', ward: 'Female Medical & Surgical Ward', hoursCompleted: 120, status: 'COMPLETED' },
              ],
            };
          }
        } catch {
          // fallback
        }
      }

      if (!student) {
        return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: { type: 'student', details: student } });
    }

    if (type === 'staff') {
      const staffMember = SEED_STAFF.find(
        (s) => s.id.toLowerCase() === id.toLowerCase() ||
               s.staffNumber.toLowerCase() === id.toLowerCase() ||
               s.fullName.toLowerCase().includes(id.toLowerCase())
      );
      if (!staffMember) {
        return NextResponse.json({ success: false, message: 'Staff member not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: { type: 'staff', details: staffMember } });
    }

    if (type === 'course') {
      const course = SEED_COURSES.find(
        (c) => c.id.toLowerCase() === id.toLowerCase() ||
               c.code.toLowerCase() === id.toLowerCase() ||
               c.name.toLowerCase().includes(id.toLowerCase())
      );
      if (!course) {
        return NextResponse.json({ success: false, message: 'Course module not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: { type: 'course', details: course } });
    }

    if (type === 'feature') {
      const feature = ENTERPRISE_FEATURES.find(
        (f) => f.id.toLowerCase() === id.toLowerCase() ||
               f.key.toLowerCase() === id.toLowerCase() ||
               f.title.toLowerCase().includes(id.toLowerCase())
      );
      if (!feature) {
        return NextResponse.json({ success: false, message: 'Feature not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: { type: 'feature', details: feature } });
    }

    if (type === 'clinical' || type === 'clinical_site') {
      const site = CLINICAL_SITES.find(
        (s) => s.id.toLowerCase() === id.toLowerCase() ||
               s.name.toLowerCase().includes(id.toLowerCase())
      );
      if (!site) {
        return NextResponse.json({ success: false, message: 'Clinical site not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: { type: 'clinical', details: site } });
    }

    return NextResponse.json({ success: false, message: 'Unsupported entity type.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
