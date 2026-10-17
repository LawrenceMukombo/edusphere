// src/app/api/boarding/route.ts
// Comprehensive Boarding Village API serving resident boarders, multi-year accommodation histories, fee histories, and academic records.

import { NextRequest, NextResponse } from 'next/server';
import { LEGACY_SOLWEZI_BALANCES, LegacyLearnerBalance } from '@/server/services/legacySchoolData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const house = searchParams.get('house'); // MOPANI_BOYS_HALL | MUKWA_GIRLS_HALL
  const grade = searchParams.get('grade');
  const studentType = searchParams.get('type'); // BOARDER | DAY_SCHOLAR
  const search = searchParams.get('search')?.toLowerCase();

  let learners: LegacyLearnerBalance[] = LEGACY_SOLWEZI_BALANCES;

  // Filter by student type
  if (studentType === 'BOARDER') {
    learners = learners.filter((l) => l.studentType === 'BOARDER');
  } else if (studentType === 'DAY_SCHOLAR') {
    learners = learners.filter((l) => l.studentType === 'DAY_SCHOLAR');
  }

  // Filter by boarding house
  if (house) {
    learners = learners.filter((l) => l.currentAccommodation?.boardingHouse === house);
  }

  // Filter by grade
  if (grade) {
    learners = learners.filter((l) => l.className === grade);
  }

  // Free-text search
  if (search) {
    learners = learners.filter(
      (l) =>
        l.learnerName.toLowerCase().includes(search) ||
        l.studentNumber.toLowerCase().includes(search) ||
        l.className.toLowerCase().includes(search) ||
        (l.currentAccommodation?.dormRoom && l.currentAccommodation.dormRoom.toLowerCase().includes(search)) ||
        (l.currentAccommodation?.bedNumber && l.currentAccommodation.bedNumber.toLowerCase().includes(search))
    );
  }

  // Boarding Village Statistics
  const totalBoarders = LEGACY_SOLWEZI_BALANCES.filter((l) => l.studentType === 'BOARDER');
  const mopaniBoarders = totalBoarders.filter((l) => l.currentAccommodation?.boardingHouse === 'MOPANI_BOYS_HALL');
  const mukwaBoarders = totalBoarders.filter((l) => l.currentAccommodation?.boardingHouse === 'MUKWA_GIRLS_HALL');

  const stats = {
    totalBedCapacity: 350,
    activeBoarders: totalBoarders.length,
    overallOccupancyRate: Number(((totalBoarders.length / 350) * 100).toFixed(1)),
    mopani: {
      capacity: 180,
      occupied: mopaniBoarders.length,
      occupancyRate: Number(((mopaniBoarders.length / 180) * 100).toFixed(1)),
      housemaster: 'Mr. Kelvin Phiri (Senior Housemaster & Sports Director)',
      assistant: 'Mr. Derrick Musonda (Assistant Housemaster)',
    },
    mukwa: {
      capacity: 170,
      occupied: mukwaBoarders.length,
      occupancyRate: Number(((mukwaBoarders.length / 170) * 100).toFixed(1)),
      matron: 'Mrs. Constance Kangwa (Senior Boarding Matron)',
      assistant: 'Mrs. Eneless Tembo (Assistant Boarding Matron)',
    },
    standbyGeneratorKVA: 250,
    standbyGeneratorStatus: 'ONLINE / AUTOMATIC ATS ACTIVE',
    residentNurse: 'Mrs. Mary Mumba (RN - Solwezi School of Nursing)',
  };

  return NextResponse.json({
    success: true,
    stats,
    count: learners.length,
    learners,
  });
}
