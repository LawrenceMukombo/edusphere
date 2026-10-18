// src/app/api/parent/children/route.ts
// Comprehensive Multi-Child Family Guardian Portal API
// Provides full academic scores over time, itemized fee billing, attendance history, and printable report cards

import { NextResponse } from 'next/server';
import { generateLegacyLearners, LegacyLearnerBalance } from '@/server/services/legacySchoolData';

export async function GET(req: Request) {
  try {
    const all780 = generateLegacyLearners(780);

    // Primary family wards for Eng. Chileshe Mulenga (4 children across both campuses)
    // 1. Bupe Mwewa (Form 2 Green, Secondary Boarding, Mushitala Campus)
    // 2. Kondwani Mwewa (Grade 6 Silver, Primary Day Scholar, Urban Campus)
    // 3. Natasha Mwewa (Reception Stars, Early Years, Urban Campus)
    // 4. Chileshe Mwewa Jr. (Form 4 Gold, Senior Secondary Boarding, Mushitala Campus)

    const familyStudentNumbers = ['LSS-2026-0042', 'LSS-2026-0155', 'LSS-2026-0198', 'LSS-2026-0260'];

    const familyLearners: LegacyLearnerBalance[] = [];
    familyStudentNumbers.forEach((sn) => {
      const match = all780.find((l) => l.studentNumber === sn);
      if (match) familyLearners.push(match);
    });

    // Fallbacks if any index moved
    if (familyLearners.length < 4) {
      all780.slice(0, 4).forEach((l) => {
        if (!familyLearners.some((f) => f.studentNumber === l.studentNumber)) {
          familyLearners.push(l);
        }
      });
    }

    const children = familyLearners.map((learner, idx) => {
      // Build full academic subjects for the active term
      const latestAcademic = learner.performanceHistory && learner.performanceHistory.length > 0
        ? learner.performanceHistory[learner.performanceHistory.length - 1]
        : null;

      const subjects = latestAcademic?.subjects || [
        { subjectName: 'Mathematics', code: 'MATH', score: 88, eczGrade: '1 (Distinction)', teacherRemark: 'Superb algebraic problem-solving and calculus comprehension.' },
        { subjectName: 'English Language', code: 'ENG', score: 82, eczGrade: '2 (Distinction)', teacherRemark: 'Articulate essay writing, formal rhetoric, and comprehension.' },
        { subjectName: 'Integrated Science', code: 'SCI', score: 89, eczGrade: '1 (Distinction)', teacherRemark: 'Inquisitive scientific methodology and laboratory observations.' },
        { subjectName: 'Social Studies', code: 'SOC', score: 78, eczGrade: '2 (Distinction)', teacherRemark: 'Sound grasp of Zambian geography and history.' },
        { subjectName: 'Computer Studies / ICT', code: 'COMP', score: 94, eczGrade: '1 (Distinction)', teacherRemark: 'Advanced practical coding and digital literacy.' },
        { subjectName: 'Civic Education', code: 'CIV', score: 76, eczGrade: '2 (Distinction)', teacherRemark: 'Exemplary understanding of constitutional principles.' },
      ];

      const averageScore = Math.round(
        subjects.reduce((sum, s) => sum + s.score, 0) / (subjects.length || 1)
      );

      // Determine standing
      let academicStanding = 'Distinction (1)';
      if (averageScore < 65) academicStanding = 'Credit (3)';
      else if (averageScore < 75) academicStanding = 'Merit (2)';

      // Itemized Billing Schedule
      const isBoarder = learner.currentAccommodation.isBoarder;
      const itemizedFees = isBoarder
        ? [
            { id: 'item-1', name: 'Secondary Tuition & Academic Scheme', category: 'Academic Core', billed: 4200, paid: 4200, balance: 0 },
            { id: 'item-2', name: `Boarding & Nutrition Hall (${learner.currentAccommodation.boardingHouseLabel})`, category: 'Boarding & Dining', billed: 3500, paid: learner.totalPaid >= 7700 ? 3500 : Math.max(0, learner.totalPaid - 4200), balance: learner.totalPaid >= 7700 ? 0 : 3500 - Math.max(0, learner.totalPaid - 4200) },
            { id: 'item-3', name: 'Science Lab, STEM & ICT Maintenance Levy', category: 'Operations Levy', billed: 1200, paid: learner.totalPaid >= 8900 ? 1200 : Math.max(0, learner.totalPaid - 7700), balance: learner.totalPaid >= 8900 ? 0 : 1200 - Math.max(0, learner.totalPaid - 7700) },
            { id: 'item-4', name: 'PTA & Co-Curricular Sports Facility Levy', category: 'Student Welfare', billed: 1500, paid: learner.balance === 0 ? 1500 : Math.max(0, learner.totalPaid - 8900), balance: learner.balance === 0 ? 0 : 1500 - Math.max(0, learner.totalPaid - 8900) },
          ]
        : [
            { id: 'item-1', name: 'Primary Day Tuition & Foundation Curriculum', category: 'Academic Core', billed: 2200, paid: 2200, balance: 0 },
            { id: 'item-2', name: 'Hot Lunch Nutrition & Tuckshop Pavilion', category: 'Dining & Nutrition', billed: 400, paid: learner.totalPaid >= 2600 ? 400 : Math.max(0, learner.totalPaid - 2200), balance: learner.totalPaid >= 2600 ? 0 : 400 - Math.max(0, learner.totalPaid - 2200) },
            { id: 'item-3', name: 'Computer Lab, Workbooks & Literacy Scheme', category: 'Learning Materials', billed: 200, paid: learner.balance === 0 ? 200 : 0, balance: learner.balance === 0 ? 0 : 200 },
          ];

      // Multi-term academic performance trend (2024 to 2026)
      const termPerformanceTrend = [
        { term: '2024 Term 1', average: Math.max(68, averageScore - 6), rank: '4th of 42' },
        { term: '2024 Term 2', average: Math.max(70, averageScore - 4), rank: '3rd of 42' },
        { term: '2024 Term 3', average: Math.max(72, averageScore - 3), rank: '2nd of 42' },
        { term: '2025 Term 1', average: Math.max(75, averageScore - 2), rank: '2nd of 44' },
        { term: '2025 Term 2', average: Math.max(78, averageScore - 1), rank: '1st of 44' },
        { term: '2025 Term 3', average: averageScore, rank: '1st of 44' },
        { term: '2026 Term 1 (Current)', average: averageScore, rank: '1st of 44' },
      ];

      // Attendance history
      const attendance = {
        ratePercent: 96.7,
        daysPresent: 58,
        totalDays: 60,
        unexcusedAbsences: 0,
        excusedAbsences: 2,
        lateArrivals: 1,
        recentSessions: [
          { date: '2026-10-17', status: 'PRESENT', session: 'Morning Registration', time: '07:22 AM' },
          { date: '2026-10-16', status: 'PRESENT', session: 'Morning Registration', time: '07:18 AM' },
          { date: '2026-10-15', status: 'PRESENT', session: 'Morning Registration', time: '07:25 AM' },
          { date: '2026-10-14', status: 'PRESENT', session: 'Morning Registration', time: '07:20 AM' },
          { date: '2026-10-13', status: 'EXCUSED', session: 'Dental Clinic Exeat', time: 'Exeat Approved' },
          { date: '2026-10-10', status: 'PRESENT', session: 'Morning Registration', time: '07:19 AM' },
          { date: '2026-10-09', status: 'PRESENT', session: 'Morning Registration', time: '07:28 AM' },
        ],
      };

      return {
        relationshipId: `rel-00${idx + 1}`,
        relationshipType: 'FATHER',
        hasFinancialAuthority: true,
        learner: {
          id: learner.id,
          studentNumber: learner.studentNumber,
          firstName: learner.learnerName.split(' ')[0],
          lastName: learner.learnerName.split(' ').slice(1).join(' '),
          fullName: learner.learnerName,
          gender: idx % 2 === 0 ? 'MALE' : 'FEMALE',
          stage: learner.stage,
          campusName: learner.campusName,
          currentClass: {
            name: learner.className,
            stage: learner.stage,
          },
          campus: {
            name: learner.campusName,
            address: learner.campusName.includes('Mushitala')
              ? 'Stand # S/SOLWE/3177178, Plot 889, 890 Kansanshi Mine Road (opp. SGC Filling Station), Mushitala'
              : 'Opposite Kikombe School, next to Zambia Army Mess, Solwezi Central',
          },
          isBoarder,
          accommodation: learner.currentAccommodation,
          accommodationHistory: learner.accommodationHistory,
          // Financials
          totalBilled: learner.totalBilled,
          totalPaid: learner.totalPaid,
          balance: learner.balance,
          financialStatus: learner.financialStatus,
          itemizedFees,
          feeHistory: learner.feeHistory,
          // Academics
          academicStanding,
          averageScore,
          subjects,
          termPerformanceTrend,
          reportCards: [
            {
              id: `rep-${learner.studentNumber}-2026-T1`,
              title: 'Term 1 Official Progress & Competency Report',
              academicYear: '2026',
              term: 'Term 1',
              status: 'PUBLISHED',
              publishedAt: '2026-10-15T08:00:00Z',
              conductGrade: 'EXEMPLARY (A+)',
              classTeacherRemarks: `${learner.learnerName.split(' ')[0]} is a focused, diligent learner with remarkable academic consistency and strong leadership qualities.`,
              principalRemarks: 'Approved for progression. An exemplary term result demonstrating high scholastic mastery.',
              conductScore: 98,
              positionInClass: `1st of ${learner.className.includes('Grade') ? '36' : '44'} Learners`,
              verifiedBy: 'Mr. Emmanuel Mwansa (Director & Principal)',
            },
          ],
          // Attendance
          attendance,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: children,
      totalWards: children.length,
      guardian: {
        name: 'Eng. Chileshe Mulenga',
        phone: '+260 977 889900',
        email: 'chileshe.mulenga@kansanshigroup.zm',
        residentialAddress: 'House # 42, Kansanshi Golf Estate, Solwezi',
        profession: 'Senior Metallurgical Superintendent, Kansanshi Mining PLC',
      },
      allSchoolLearnersSummary: all780.map((l) => ({
        id: l.id,
        studentNumber: l.studentNumber,
        learnerName: l.learnerName,
        className: l.className,
        campusName: l.campusName,
        balance: l.balance,
        totalBilled: l.totalBilled,
        totalPaid: l.totalPaid,
        gender: l.gender || 'MALE',
        isBoarder: l.currentAccommodation.isBoarder,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
