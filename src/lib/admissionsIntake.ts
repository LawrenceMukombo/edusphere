// NWUCHAS CMIS — Dynamic Admissions Intake Generator
// Generates upcoming tertiary intake sessions based on current date and statutory health education calendar

export interface AvailableIntake {
  id: string;
  label: string;
  shortLabel: string;
  year: number;
  season: 'JANUARY' | 'JULY';
  status: 'OPEN' | 'CLOSING_SOON' | 'UPCOMING';
  applicationDeadline: string;
  commencementDate: string;
  isRecommendedDefault: boolean;
}

/**
 * Returns the next available intake sessions based on the current month and year.
 * In Zambian tertiary health sciences (NWUCHAS / NMCZ / HPCZ), the primary academic intakes are:
 * - January Intake (Main Academic Intake / Semester 1)
 * - July Intake (Mid-Year Academic Intake / Semester 2)
 */
export function getUpcomingIntakes(referenceDate: Date = new Date()): AvailableIntake[] {
  const currentMonth = referenceDate.getMonth(); // 0 = Jan, 9 = Oct, etc.
  const currentYear = referenceDate.getFullYear();

  const intakes: AvailableIntake[] = [];

  if (currentMonth >= 0 && currentMonth <= 5) {
    // Current date is January - June
    // 1. July of current year
    const isClosingSoonJuly = currentMonth >= 4; // May or June
    intakes.push({
      id: `JUL-${currentYear}`,
      label: `July ${currentYear} (Mid-Year Academic Intake)`,
      shortLabel: `July ${currentYear}`,
      year: currentYear,
      season: 'JULY',
      status: isClosingSoonJuly ? 'CLOSING_SOON' : 'OPEN',
      applicationDeadline: `30 June ${currentYear}`,
      commencementDate: `13 July ${currentYear}`,
      isRecommendedDefault: true,
    });

    // 2. January of next year
    intakes.push({
      id: `JAN-${currentYear + 1}`,
      label: `January ${currentYear + 1} (Main Academic Intake)`,
      shortLabel: `January ${currentYear + 1}`,
      year: currentYear + 1,
      season: 'JANUARY',
      status: 'UPCOMING',
      applicationDeadline: `31 December ${currentYear}`,
      commencementDate: `11 January ${currentYear + 1}`,
      isRecommendedDefault: false,
    });

    // 3. July of next year
    intakes.push({
      id: `JUL-${currentYear + 1}`,
      label: `July ${currentYear + 1} (Mid-Year Academic Intake)`,
      shortLabel: `July ${currentYear + 1}`,
      year: currentYear + 1,
      season: 'JULY',
      status: 'UPCOMING',
      applicationDeadline: `30 June ${currentYear + 1}`,
      commencementDate: `12 July ${currentYear + 1}`,
      isRecommendedDefault: false,
    });
  } else {
    // Current date is July - December (months 6 - 11)
    // 1. January of next year
    const isClosingSoonJan = currentMonth >= 10; // November or December
    intakes.push({
      id: `JAN-${currentYear + 1}`,
      label: `January ${currentYear + 1} (Main Academic Intake)`,
      shortLabel: `January ${currentYear + 1}`,
      year: currentYear + 1,
      season: 'JANUARY',
      status: isClosingSoonJan ? 'CLOSING_SOON' : 'OPEN',
      applicationDeadline: `31 December ${currentYear}`,
      commencementDate: `11 January ${currentYear + 1}`,
      isRecommendedDefault: true,
    });

    // 2. July of next year
    intakes.push({
      id: `JUL-${currentYear + 1}`,
      label: `July ${currentYear + 1} (Mid-Year Academic Intake)`,
      shortLabel: `July ${currentYear + 1}`,
      year: currentYear + 1,
      season: 'JULY',
      status: 'UPCOMING',
      applicationDeadline: `30 June ${currentYear + 1}`,
      commencementDate: `12 July ${currentYear + 1}`,
      isRecommendedDefault: false,
    });

    // 3. January of year + 2
    intakes.push({
      id: `JAN-${currentYear + 2}`,
      label: `January ${currentYear + 2} (Main Academic Intake)`,
      shortLabel: `January ${currentYear + 2}`,
      year: currentYear + 2,
      season: 'JANUARY',
      status: 'UPCOMING',
      applicationDeadline: `31 December ${currentYear + 1}`,
      commencementDate: `10 January ${currentYear + 2}`,
      isRecommendedDefault: false,
    });
  }

  return intakes;
}
