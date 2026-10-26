// src/server/services/schoolCalendarData.ts
/**
 * Zambian National School Calendar, Gazetted Public Holidays & Learner Birthdays Registry
 * Legacy School Solwezi (Urban Campus & Mushitala Campus)
 * Aligned with the Ministry of Education Zambia (MoE) 2026 Tri-Term Framework
 */

export interface CalendarLearnerRecord {
  id: string;
  studentNumber: string;
  learnerName: string;
  className: string;
  campusName: string;
  studentType: 'DAY_SCHOLAR' | 'BOARDER';
  hallName?: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
  guardian?: {
    name: string;
    phone: string;
  };
}

export interface ZambianPublicHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  observedDate?: string;
  category: 'NATIONAL_HERITAGE' | 'RELIGIOUS' | 'WORKERS_AND_YOUTH' | 'FOUNDATIONAL';
  schoolClosure: 'MANDATORY_CLOSURE';
  significance: string;
  historicalContext: string;
}

export interface AcademicTermPeriod {
  termNumber: 1 | 2 | 3;
  termLabel: string;
  academicYear: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  teachingWeeks: number;
  midTermBreak: {
    startDate: string;
    endDate: string;
    description: string;
  };
  vacation: {
    startDate: string;
    endDate: string;
    weeks: number;
  };
  eczExamWindow?: {
    startDate: string;
    endDate: string;
    description: string;
  };
  totalTeachingDays: number;
}

export interface SchoolCalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  time?: string;
  category: 'ACADEMIC' | 'SPORTS' | 'PASTORAL' | 'ECZ_EXAM' | 'COMMUNITY_PTA' | 'CEREMONY';
  campus: 'All Campuses' | 'Mushitala Campus (Near Kansanshi)' | 'Urban Campus (Solwezi Central)';
  location: string;
  description: string;
  audience: string;
}

export interface LearnerBirthdayProfile {
  id: string;
  studentNumber: string;
  learnerName: string;
  className: string;
  campusName: string;
  studentType: 'DAY_SCHOLAR' | 'BOARDER';
  hallName?: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string; // YYYY-MM-DD
  birthMonth: number; // 1-12
  birthDay: number; // 1-31
  turningAge: number;
  guardianName: string;
  guardianPhone: string;
}

// ----------------------------------------------------------------------------
// 1. GAZETTED ZAMBIAN STATUTORY PUBLIC HOLIDAYS (2026)
// ----------------------------------------------------------------------------
export const ZAMBIAN_PUBLIC_HOLIDAYS_2026: ZambianPublicHoliday[] = [
  {
    id: 'zm-new-year',
    name: "New Year's Day",
    date: '2026-01-01',
    dayOfWeek: 'Thursday',
    category: 'FOUNDATIONAL',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'Global commencement of the calendar year celebrated across all 10 provinces of Zambia.',
    historicalContext: 'Statutory public holiday gazetted under Chapter 7 of the Laws of Zambia.',
  },
  {
    id: 'zm-womens-day',
    name: "International Women's Day",
    date: '2026-03-08',
    dayOfWeek: 'Sunday',
    observedDate: '2026-03-09',
    category: 'WORKERS_AND_YOUTH',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'Commemoration of the cultural, social, and economic achievements of Zambian women and mothers.',
    historicalContext: 'Observed with a statutory public holiday on Monday 9 March as 8 March falls on a Sunday.',
  },
  {
    id: 'zm-youth-day',
    name: 'National Youth Day',
    date: '2026-03-12',
    dayOfWeek: 'Thursday',
    category: 'WORKERS_AND_YOUTH',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'Celebration of youth contributions to national development, civic responsibility, and empowerment.',
    historicalContext: 'Honours the historical contribution of Zambian youth in the liberation struggle and nation-building.',
  },
  {
    id: 'zm-good-friday',
    name: 'Good Friday',
    date: '2026-04-03',
    dayOfWeek: 'Friday',
    category: 'RELIGIOUS',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'Solemn Christian remembrance of the crucifixion of Jesus Christ.',
    historicalContext: 'Declared statutory religious holiday under Article 19 of the Republican Constitution.',
  },
  {
    id: 'zm-holy-saturday',
    name: 'Holy Saturday',
    date: '2026-04-04',
    dayOfWeek: 'Saturday',
    category: 'RELIGIOUS',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'Easter weekend reflection between Good Friday and Easter Sunday.',
    historicalContext: 'Statutory weekend holiday observed by banks, public institutions, and boarding schools.',
  },
  {
    id: 'zm-easter-monday',
    name: 'Easter Monday',
    date: '2026-04-06',
    dayOfWeek: 'Monday',
    category: 'RELIGIOUS',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'Joyous celebration of the Resurrection of Jesus Christ in the Christian faith.',
    historicalContext: 'Concluding day of the national Easter liturgical weekend.',
  },
  {
    id: 'zm-kk-day',
    name: 'Kenneth Kaunda Day',
    date: '2026-04-28',
    dayOfWeek: 'Tuesday',
    category: 'FOUNDATIONAL',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'Commemoration of the birthday and legacy of Dr. Kenneth David Kaunda, Founding President of Zambia.',
    historicalContext: 'Enacted by presidential decree to celebrate KK’s leadership, pan-African solidarity, and universal education ideals.',
  },
  {
    id: 'zm-labour-day',
    name: "Labour Day (Workers' Day)",
    date: '2026-05-01',
    dayOfWeek: 'Friday',
    category: 'WORKERS_AND_YOUTH',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'Honouring the contributions and rights of workers in mining, education, agriculture, and industry.',
    historicalContext: 'Celebrated with civic marches, trade union assemblies, and labour awards across Solwezi district.',
  },
  {
    id: 'zm-africa-day',
    name: 'Africa Freedom Day',
    date: '2026-05-25',
    dayOfWeek: 'Monday',
    category: 'NATIONAL_HERITAGE',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'Commemoration of the founding of the Organisation of African Unity (now African Union) in 1963.',
    historicalContext: 'Zambia served as the frontline base for southern African liberation movements hosted in Lusaka.',
  },
  {
    id: 'zm-heroes-day',
    name: "Heroes' Day",
    date: '2026-07-06',
    dayOfWeek: 'Monday',
    category: 'NATIONAL_HERITAGE',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'Honouring all Zambian freedom fighters, civil servants, and heroes who sacrifice for the nation.',
    historicalContext: 'Celebrated annually on the first Monday of July across the Republic of Zambia.',
  },
  {
    id: 'zm-unity-day',
    name: 'Unity Day',
    date: '2026-07-07',
    dayOfWeek: 'Tuesday',
    category: 'NATIONAL_HERITAGE',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'Promoting national solidarity under Zambia’s enduring national motto: "One Zambia, One Nation".',
    historicalContext: 'Observed on the Tuesday following Heroes’ Day, bridging cultural and linguistic harmony across 73 ethnic groups.',
  },
  {
    id: 'zm-farmers-day',
    name: "Farmers' Day",
    date: '2026-08-03',
    dayOfWeek: 'Monday',
    category: 'WORKERS_AND_YOUTH',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'Recognising the agricultural producers, farmers, and agribusinesses driving food security.',
    historicalContext: 'First Monday of August; coincides with the Agricultural & Commercial Show exhibitions.',
  },
  {
    id: 'zm-prayer-day',
    name: 'National Day of Prayer, Fasting & Reconciliation',
    date: '2026-10-18',
    dayOfWeek: 'Sunday',
    observedDate: '2026-10-19',
    category: 'RELIGIOUS',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'Solemn national day of Christian prayer, repentance, and intercession for peace and prosperity.',
    historicalContext: 'Gazetted national statutory observance under the declaration of Zambia as a Christian nation.',
  },
  {
    id: 'zm-independence-day',
    name: 'Independence Day (62nd Anniversary)',
    date: '2026-10-24',
    dayOfWeek: 'Saturday',
    category: 'FOUNDATIONAL',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'The birth of the sovereign Republic of Zambia on 24 October 1964.',
    historicalContext: 'Celebrated nationwide with military flypasts, school drills, traditional dancing, and civic awards.',
  },
  {
    id: 'zm-christmas-day',
    name: 'Christmas Day',
    date: '2026-12-25',
    dayOfWeek: 'Friday',
    category: 'RELIGIOUS',
    schoolClosure: 'MANDATORY_CLOSURE',
    significance: 'The nativity and celebration of Jesus Christ with family reunions and church celebrations.',
    historicalContext: 'Universal statutory national holiday celebrated across the Republic.',
  },
];

// ----------------------------------------------------------------------------
// 2. MINISTRY OF EDUCATION ZAMBIA (MoE) 2026 ACADEMIC CALENDAR
// ----------------------------------------------------------------------------
export const ACADEMIC_TERMS_2026: AcademicTermPeriod[] = [
  {
    termNumber: 1,
    termLabel: 'Term 1 (Autumn Term)',
    academicYear: 2026,
    startDate: '2026-01-12',
    endDate: '2026-04-10',
    teachingWeeks: 13,
    midTermBreak: {
      startDate: '2026-02-20',
      endDate: '2026-02-23',
      description: 'Term 1 Mid-Term Exeat & Staff In-Service Review',
    },
    vacation: {
      startDate: '2026-04-11',
      endDate: '2026-05-10',
      weeks: 4,
    },
    totalTeachingDays: 63,
  },
  {
    termNumber: 2,
    termLabel: 'Term 2 (Winter Term)',
    academicYear: 2026,
    startDate: '2026-05-11',
    endDate: '2026-08-07',
    teachingWeeks: 13,
    midTermBreak: {
      startDate: '2026-06-19',
      endDate: '2026-06-22',
      description: 'Term 2 Mid-Term Exeat & Solwezi District Sports Inter-house',
    },
    vacation: {
      startDate: '2026-08-08',
      endDate: '2026-09-06',
      weeks: 4,
    },
    totalTeachingDays: 62,
  },
  {
    termNumber: 3,
    termLabel: 'Term 3 (Promotional & ECZ Examination Term)',
    academicYear: 2026,
    startDate: '2026-09-07',
    endDate: '2026-12-04',
    teachingWeeks: 13,
    midTermBreak: {
      startDate: '2026-10-16',
      endDate: '2026-10-19',
      description: 'Term 3 Mid-Term Exeat coinciding with National Day of Prayer Weekend',
    },
    eczExamWindow: {
      startDate: '2026-10-26',
      endDate: '2026-11-27',
      description: 'Examinations Council of Zambia (ECZ) Grade 7, Grade 9 & Grade 12 National Certificate Exams',
    },
    vacation: {
      startDate: '2026-12-05',
      endDate: '2027-01-10',
      weeks: 5,
    },
    totalTeachingDays: 62,
  },
];

// ----------------------------------------------------------------------------
// 3. LEGACY SCHOOL SOLWEZI INSTITUTIONAL EVENTS (2026)
// ----------------------------------------------------------------------------
export const SCHOOL_EVENTS_2026: SchoolCalendarEvent[] = [
  {
    id: 'evt-001',
    title: 'Term 1 Opening Assembly & Boarding Arrival',
    date: '2026-01-12',
    time: '07:30 - 09:00',
    category: 'CEREMONY',
    campus: 'All Campuses',
    location: 'Central Assembly Quadrangles (Urban & Mushitala)',
    description: 'Welcome addresses by Director Emmanuel Mwansa and Headmistress Grace Tembo. Room allocations for 315 boarders.',
    audience: 'All Students, Teachers, Boarding Staff',
  },
  {
    id: 'evt-002',
    title: 'Inter-House Athletics Championship & Cross-Country',
    date: '2026-02-27',
    time: '08:00 - 16:30',
    category: 'SPORTS',
    campus: 'Mushitala Campus (Near Kansanshi)',
    location: 'Solwezi Sports Oval & Athletics Track',
    description: 'Chambishi, Lumwana, Kalumbila, and Kansanshi houses compete in track, field, and sprint disciplines.',
    audience: 'Entire School Community, Parents, Invited Solwezi Schools',
  },
  {
    id: 'evt-003',
    title: 'PTA Annual General Meeting & Fee Review',
    date: '2026-03-14',
    time: '09:00 - 13:00',
    category: 'COMMUNITY_PTA',
    campus: 'Mushitala Campus (Near Kansanshi)',
    location: 'Main School Hall, Mushitala',
    description: 'Review of audited 2025 financials, STEM laboratory equipment acquisition, and PTA executive committee elections.',
    audience: 'All Guardians, Board Members, Administration',
  },
  {
    id: 'evt-004',
    title: 'End of Term 1 Academic Reports & Parent Consultations',
    date: '2026-04-10',
    time: '08:00 - 15:00',
    category: 'ACADEMIC',
    campus: 'All Campuses',
    location: 'Classrooms & Dining Pavilions',
    description: 'Collection of verified report cards, teacher-guardian 1-on-1 consultations, and vacation reading assignments.',
    audience: 'Parents, Students, Teachers',
  },
  {
    id: 'evt-005',
    title: 'Solwezi Mining & STEM Engineering Careers Day',
    date: '2026-04-24',
    time: '09:00 - 15:30',
    category: 'ACADEMIC',
    campus: 'Mushitala Campus (Near Kansanshi)',
    location: 'Advanced Science Laboratory Quadrangle',
    description: 'Guest lectures, robotics displays, and metallurgy exhibitions facilitated by engineers from Kansanshi Mine & First Quantum Minerals.',
    audience: 'Forms 3, 4, 5 Secondary Scholars',
  },
  {
    id: 'evt-006',
    title: 'Term 2 Opening & Mid-Year Diagnostic Tests',
    date: '2026-05-11',
    time: '07:30 - 14:00',
    category: 'ACADEMIC',
    campus: 'All Campuses',
    location: 'Respective Classrooms',
    description: 'Commencement of Term 2 syllabus across Early Childhood, Primary, and Secondary streams.',
    audience: 'All Learners',
  },
  {
    id: 'evt-007',
    title: 'North-Western Province Inter-School Science Fair',
    date: '2026-06-12',
    time: '08:30 - 16:00',
    category: 'ACADEMIC',
    campus: 'Mushitala Campus (Near Kansanshi)',
    location: 'STEM Complex & Physics Labs',
    description: 'Student research presentations in renewable solar energy, clean mining tailings, and agricultural biotechnology.',
    audience: 'Participating Schools across North-Western Province',
  },
  {
    id: 'evt-008',
    title: 'Traditional Arts, Cultural Heritage & Vernacular Gala',
    date: '2026-07-17',
    time: '09:00 - 16:00',
    category: 'CEREMONY',
    campus: 'Urban Campus (Solwezi Central)',
    location: 'Urban Campus Outdoor Amphitheatre',
    description: 'Celebration of Zambian languages (Kiikaonde, Icibemba, Chitonga, Silozi), indigenous poetry, folk dance, and craft exhibitions.',
    audience: 'Open to All Parents & Community',
  },
  {
    id: 'evt-009',
    title: 'Form 5 & Grade 7 Candidate Dedication & Intercession',
    date: '2026-09-18',
    time: '10:00 - 12:30',
    category: 'PASTORAL',
    campus: 'Mushitala Campus (Near Kansanshi)',
    location: 'Chapel & Central Dining Hall',
    description: 'Spiritual blessing and motivational session for 42 Form 5 candidates and 36 Grade 7 candidates facing ECZ national examinations.',
    audience: 'Candidates, Teachers, Clergy, Parents',
  },
  {
    id: 'evt-010',
    title: 'National Day of Prayer Special Assembly',
    date: '2026-10-18',
    time: '08:30 - 10:30',
    category: 'PASTORAL',
    campus: 'All Campuses',
    location: 'Central Assembly Quadrangle',
    description: 'Schoolwide prayers for unity, academic integrity, national peace, and youth mentorship.',
    audience: 'Staff & Boarding Pupils',
  },
  {
    id: 'evt-011',
    title: 'ECZ National Certificate Final Examinations',
    date: '2026-10-26',
    endDate: '2026-11-27',
    time: '08:00 - 16:00 Daily',
    category: 'ECZ_EXAM',
    campus: 'All Campuses',
    location: 'Approved Examination Centers (Mushitala & Urban)',
    description: 'Official Examinations Council of Zambia (ECZ) national exams for Grade 7 composite, Grade 9 Junior, and Grade 12 School Certificate.',
    audience: 'Registered ECZ Candidates',
  },
  {
    id: 'evt-012',
    title: 'Annual Speech Day, Prize Giving & Valedictory Banquet',
    date: '2026-11-20',
    time: '09:00 - 16:30',
    category: 'CEREMONY',
    campus: 'Mushitala Campus (Near Kansanshi)',
    location: 'School Pavilion & Dining Hall',
    description: 'Honouring top academic, sporting, and moral distinction scholars. Valedictory dinner for graduating Form 5 class of 2026.',
    audience: 'Graduands, Parents, Honoured Guests, Staff',
  },
  {
    id: 'evt-013',
    title: 'Academic Year Thanksgiving Service & Carols by Candlelight',
    date: '2026-12-04',
    time: '16:00 - 19:30',
    category: 'CEREMONY',
    campus: 'Urban Campus (Solwezi Central)',
    location: 'School Grounds & Auditorium',
    description: 'Closing thanksgiving assembly, school choir Christmas carols, and vacation send-off for learners and staff.',
    audience: 'Entire School Community & Families',
  },
];

// ----------------------------------------------------------------------------
// 4. LEARNER BIRTHDAYS REGISTRY & STATS
// ----------------------------------------------------------------------------
let cachedLearners: CalendarLearnerRecord[] | null = null;

function getCachedLearners(): CalendarLearnerRecord[] {
  if (!cachedLearners) {
    cachedLearners = [];
  }
  return cachedLearners;
}

export function getAllLearnerBirthdays(): LearnerBirthdayProfile[] {
  const learners = getCachedLearners();
  return learners.map((l) => {
    const dob = l.dateOfBirth || '2010-06-15';
    const [yearStr, monthStr, dayStr] = dob.split('-');
    const birthYear = parseInt(yearStr, 10);
    const birthMonth = parseInt(monthStr, 10);
    const birthDay = parseInt(dayStr, 10);
    const turningAge = 2026 - birthYear;

    return {
      id: l.id,
      studentNumber: l.studentNumber,
      learnerName: l.learnerName,
      className: l.className,
      campusName: l.campusName,
      studentType: l.studentType,
      hallName: l.hallName,
      gender: l.gender,
      dateOfBirth: dob,
      birthMonth,
      birthDay,
      turningAge,
      guardianName: l.guardian?.name || 'Guardian',
      guardianPhone: l.guardian?.phone || '+260 970 000000',
    };
  });
}

export function getBirthdaysByMonth(month: number): LearnerBirthdayProfile[] {
  const all = getAllLearnerBirthdays();
  return all
    .filter((l) => l.birthMonth === month)
    .sort((a, b) => a.birthDay - b.birthDay);
}

export function getBirthdaysForDate(dateStr: string): LearnerBirthdayProfile[] {
  // dateStr is 'YYYY-MM-DD'
  const parts = dateStr.split('-');
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const all = getAllLearnerBirthdays();
  return all.filter((l) => l.birthMonth === month && l.birthDay === day);
}

/**
 * Authoritative timezone-aware current date for Zambia (Africa/Lusaka) (CAL-001)
 */
export function getSchoolCurrentDateStr(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lusaka' }).format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function getTodayBirthdays(overrideDate?: string): {
  date: string;
  count: number;
  birthdays: LearnerBirthdayProfile[];
} {
  const targetDate = overrideDate || getSchoolCurrentDateStr();
  const matches = getBirthdaysForDate(targetDate);
  return {
    date: targetDate,
    count: matches.length,
    birthdays: matches,
  };
}

export function generateSmsBirthdayWish(learner: LearnerBirthdayProfile): string {
  return `Happy ${learner.turningAge}th Birthday ${learner.learnerName.split(' ')[0]}! Legacy School Solwezi celebrates your dedication, bright intellect, and character. May this new year of life bring you boundless academic excellence and joy! - Directorate & Teachers, Legacy School Solwezi`;
}

// ----------------------------------------------------------------------------
// 5. CALENDAR UTILITY HELPERS FOR MONTH VIEW
// ----------------------------------------------------------------------------
export interface CalendarDayCell {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  month: number;
  year: number;
  dayOfWeek: number; // 0 Sunday, 6 Saturday
  isCurrentMonth: boolean;
  isToday: boolean;
  isSchoolDay: boolean;
  activeTerm?: AcademicTermPeriod;
  isMidTermBreak: boolean;
  isVacation: boolean;
  publicHoliday?: ZambianPublicHoliday;
  schoolEvents: SchoolCalendarEvent[];
  birthdayCount: number;
  birthdays: LearnerBirthdayProfile[];
}

export function buildMonthCalendarMatrix(year: number, month: number, todayDateStr?: string): CalendarDayCell[][] {
  const activeToday = todayDateStr || getSchoolCurrentDateStr();
  const firstDay = new Date(year, month - 1, 1);
  const totalDays = new Date(year, month, 0).getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const allHolidays = ZAMBIAN_PUBLIC_HOLIDAYS_2026;
  const allEvents = SCHOOL_EVENTS_2026;
  const allBirthdays = getAllLearnerBirthdays();

  const matrix: CalendarDayCell[][] = [];
  let currentWeek: CalendarDayCell[] = [];

  // Previous month trailing days
  const prevMonthTotalDays = new Date(year, month - 1, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const dStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    currentWeek.push(createDayCell(prevYear, prevMonth, dayNum, false, dStr, activeToday, allHolidays, allEvents, allBirthdays));
  }

  // Current month days
  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayCell = createDayCell(year, month, dayNum, true, dStr, activeToday, allHolidays, allEvents, allBirthdays);
    currentWeek.push(dayCell);

    if (currentWeek.length === 7) {
      matrix.push(currentWeek);
      currentWeek = [];
    }
  }

  // Next month leading days to complete final week
  if (currentWeek.length > 0) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    let nextDayNum = 1;
    while (currentWeek.length < 7) {
      const dStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(nextDayNum).padStart(2, '0')}`;
      currentWeek.push(createDayCell(nextYear, nextMonth, nextDayNum, false, dStr, activeToday, allHolidays, allEvents, allBirthdays));
      nextDayNum++;
    }
    matrix.push(currentWeek);
  }

  return matrix;
}

function createDayCell(
  year: number,
  month: number,
  dayNumber: number,
  isCurrentMonth: boolean,
  dateStr: string,
  todayDateStr: string,
  holidays: ZambianPublicHoliday[],
  events: SchoolCalendarEvent[],
  birthdays: LearnerBirthdayProfile[]
): CalendarDayCell {
  const d = new Date(year, month - 1, dayNumber);
  const dayOfWeek = d.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Check public holiday
  const holiday = holidays.find((h) => h.date === dateStr || h.observedDate === dateStr);

  // Check term and school day
  let activeTerm: AcademicTermPeriod | undefined = undefined;
  let isMidTermBreak = false;
  let isVacation = false;

  for (const term of ACADEMIC_TERMS_2026) {
    if (dateStr >= term.startDate && dateStr <= term.endDate) {
      activeTerm = term;
      if (dateStr >= term.midTermBreak.startDate && dateStr <= term.midTermBreak.endDate) {
        isMidTermBreak = true;
      }
      break;
    }
    if (dateStr >= term.vacation.startDate && dateStr <= term.vacation.endDate) {
      isVacation = true;
      break;
    }
  }

  const isSchoolDay = !isWeekend && !holiday && !isMidTermBreak && !isVacation && !!activeTerm;

  // Check events
  const dayEvents = events.filter((e) => {
    if (e.date === dateStr) return true;
    if (e.endDate && dateStr >= e.date && dateStr <= e.endDate) return true;
    return false;
  });

  // Check birthdays
  const dayBirthdays = birthdays.filter((b) => b.birthMonth === month && b.birthDay === dayNumber);

  return {
    date: dateStr,
    dayNumber,
    month,
    year,
    dayOfWeek,
    isCurrentMonth,
    isToday: dateStr === todayDateStr,
    isSchoolDay,
    activeTerm,
    isMidTermBreak,
    isVacation,
    publicHoliday: holiday,
    schoolEvents: dayEvents,
    birthdayCount: dayBirthdays.length,
    birthdays: dayBirthdays,
  };
}
