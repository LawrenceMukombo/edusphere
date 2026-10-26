/**
 * Zambian Gazetted Statutory Public Holidays (2026)
 * In accordance with Chapter 7 of the Laws of Zambia and Ministry of Education / NMCZ / HPCZ regulations.
 * North Western University College of Health and Applied Sciences (NWUCHAS)
 */

export interface ZambianHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  observedDate?: string; // YYYY-MM-DD if observed on another day
  category: 'NATIONAL_HERITAGE' | 'RELIGIOUS' | 'WORKERS_AND_YOUTH' | 'FOUNDATIONAL';
  significance: string;
}

export const ZAMBIAN_PUBLIC_HOLIDAYS_2026: ZambianHoliday[] = [
  {
    id: 'zm-new-year',
    name: "New Year's Day",
    date: '2026-01-01',
    dayOfWeek: 'Thursday',
    category: 'FOUNDATIONAL',
    significance: 'Global commencement of the calendar year celebrated across all 10 provinces of Zambia.',
  },
  {
    id: 'zm-womens-day',
    name: "International Women's Day",
    date: '2026-03-08',
    dayOfWeek: 'Sunday',
    observedDate: '2026-03-09',
    category: 'WORKERS_AND_YOUTH',
    significance: 'Commemoration of the cultural, social, and economic achievements of Zambian women and mothers.',
  },
  {
    id: 'zm-youth-day',
    name: 'National Youth Day',
    date: '2026-03-12',
    dayOfWeek: 'Thursday',
    category: 'WORKERS_AND_YOUTH',
    significance: 'Celebration of youth contributions to national development, civic responsibility, and empowerment.',
  },
  {
    id: 'zm-good-friday',
    name: 'Good Friday',
    date: '2026-04-03',
    dayOfWeek: 'Friday',
    category: 'RELIGIOUS',
    significance: 'Solemn Christian remembrance of the crucifixion of Jesus Christ.',
  },
  {
    id: 'zm-holy-saturday',
    name: 'Holy Saturday',
    date: '2026-04-04',
    dayOfWeek: 'Saturday',
    category: 'RELIGIOUS',
    significance: 'Easter weekend reflection between Good Friday and Easter Sunday.',
  },
  {
    id: 'zm-easter-monday',
    name: 'Easter Monday',
    date: '2026-04-06',
    dayOfWeek: 'Monday',
    category: 'RELIGIOUS',
    significance: 'Joyous celebration of the Resurrection of Jesus Christ in the Christian faith.',
  },
  {
    id: 'zm-kk-day',
    name: 'Kenneth Kaunda Day',
    date: '2026-04-28',
    dayOfWeek: 'Tuesday',
    category: 'FOUNDATIONAL',
    significance: 'Commemoration of the birthday and legacy of Dr. Kenneth David Kaunda, Founding President of Zambia.',
  },
  {
    id: 'zm-labour-day',
    name: "Labour Day (Workers' Day)",
    date: '2026-05-01',
    dayOfWeek: 'Friday',
    category: 'WORKERS_AND_YOUTH',
    significance: 'Honouring the contributions and rights of workers in mining, education, healthcare, and industry.',
  },
  {
    id: 'zm-africa-day',
    name: 'Africa Freedom Day',
    date: '2026-05-25',
    dayOfWeek: 'Monday',
    category: 'NATIONAL_HERITAGE',
    significance: 'Commemoration of the founding of the Organisation of African Unity (now African Union) in 1963.',
  },
  {
    id: 'zm-heroes-day',
    name: "Heroes' Day",
    date: '2026-07-06',
    dayOfWeek: 'Monday',
    category: 'NATIONAL_HERITAGE',
    significance: 'Honouring all Zambian freedom fighters, healthcare workers, and heroes who sacrifice for the nation.',
  },
  {
    id: 'zm-unity-day',
    name: 'Unity Day',
    date: '2026-07-07',
    dayOfWeek: 'Tuesday',
    category: 'NATIONAL_HERITAGE',
    significance: 'Promoting national solidarity under Zambia’s enduring motto: "One Zambia, One Nation".',
  },
  {
    id: 'zm-farmers-day',
    name: "Farmers' Day",
    date: '2026-08-03',
    dayOfWeek: 'Monday',
    category: 'WORKERS_AND_YOUTH',
    significance: 'Recognising agricultural producers, farmers, and agribusinesses driving food security.',
  },
  {
    id: 'zm-prayer-day',
    name: 'National Day of Prayer, Fasting & Reconciliation',
    date: '2026-10-18',
    dayOfWeek: 'Sunday',
    observedDate: '2026-10-19',
    category: 'RELIGIOUS',
    significance: 'Solemn national day of Christian prayer, repentance, and intercession for peace and prosperity.',
  },
  {
    id: 'zm-independence-day',
    name: 'Independence Day (62nd Anniversary)',
    date: '2026-10-24',
    dayOfWeek: 'Saturday',
    category: 'FOUNDATIONAL',
    significance: 'The birth of the sovereign Republic of Zambia on 24 October 1964.',
  },
  {
    id: 'zm-christmas-day',
    name: 'Christmas Day',
    date: '2026-12-25',
    dayOfWeek: 'Friday',
    category: 'RELIGIOUS',
    significance: 'The nativity and celebration of Jesus Christ with family reunions and church celebrations.',
  },
];

/**
 * Checks if a given date string (YYYY-MM-DD) is a Zambian gazetted public holiday
 * or an observed statutory public holiday.
 */
export function checkZambianPublicHoliday(dateStr: string): {
  isHoliday: boolean;
  holiday?: ZambianHoliday;
  isObservedDate?: boolean;
} {
  if (!dateStr) return { isHoliday: false };

  // Match exact date or observedDate
  for (const h of ZAMBIAN_PUBLIC_HOLIDAYS_2026) {
    if (h.date === dateStr) {
      return { isHoliday: true, holiday: h, isObservedDate: false };
    }
    if (h.observedDate === dateStr) {
      return { isHoliday: true, holiday: h, isObservedDate: true };
    }
  }

  return { isHoliday: false };
}

/**
 * Get all holidays in a given month (YYYY-MM)
 */
export function getHolidaysInMonth(yearMonth: string): ZambianHoliday[] {
  return ZAMBIAN_PUBLIC_HOLIDAYS_2026.filter((h) => {
    return h.date.startsWith(yearMonth) || (h.observedDate && h.observedDate.startsWith(yearMonth));
  });
}
