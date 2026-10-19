// src/server/services/legacySchoolData.ts
// Comprehensive domain fixtures and operational dataset for Legacy School Solwezi
// Hundreds of learners and 48 staff members across all academic, administrative, boarding, and operational cadres.

export interface LegacySchoolInfo {
  name: string;
  officialName: string;
  code: string;
  motto: string;
  address: string;
  city: string;
  province: string;
  country: string;
  phoneNumbers: string[];
  email: string;
  registrationNo: string;
  taxNumber: string;
  campuses: {
    id: string;
    code: string;
    name: string;
    type: string;
    address: string;
    coordinates: { lat: number; lng: number };
    capacity: number;
    enrolled: number;
    hasBoarding: boolean;
    facilities: string[];
    headTeacher: string;
  }[];
}

export const LEGACY_SCHOOL_PROFILE: LegacySchoolInfo = {
  name: 'Legacy School Solwezi',
  officialName: 'Legacy School Solwezi Limited',
  code: 'EDS-ZM-SOL-001',
  motto: 'We strive for your academic and moral excellence',
  address: 'Stand # S/SOLWE/3177178, Kansanshi Mine Road (opp. SGC Filling Station), Mushitala',
  city: 'Solwezi',
  province: 'North-Western Province',
  country: 'Zambia',
  phoneNumbers: ['+260 974 371271', '+260 967 288578', '+260 977 114093'],
  email: 'legacyschool208@gmail.com',
  registrationNo: 'MOE/NWP/SOL/SEC/2026/044',
  taxNumber: '1008492019',
  campuses: [
    {
      id: 'LSS-MSC',
      code: 'MSC',
      name: 'Mushitala Campus (Near Kansanshi)',
      type: 'Secondary & Boarding Wing (Forms 1 to 5)',
      address: 'Stand # S/SOLWE/3177178, Plot 889, 890 Kansanshi Mine Road (opp. SGC Filling Station), Mushitala',
      coordinates: { lat: -12.151775, lng: 26.424711 },
      capacity: 650,
      enrolled: 420,
      hasBoarding: true,
      facilities: [
        'Kansanshi Boys Boarding Hall (180 beds)',
        'Kalumbila Girls Boarding Hall (170 beds)',
        'Central Dining Hall & Industrial Kitchen',
        '250kVA Standby Diesel Generator',
        'Advanced STEM Physics, Chemistry & Biology Labs',
        'Full Sports Oval & Netball Courts',
        '24/7 Sickbay with Resident Nurse',
      ],
      headTeacher: 'Mr. Emmanuel Mwansa (Director & Principal)',
    },
    {
      id: 'LSS-URB',
      code: 'URB',
      name: 'Urban Campus (Solwezi Central)',
      type: 'Early Childhood Education (ECE) & Primary Day School',
      address: 'Opposite Kikombe School, next to Zambia Army Mess, Solwezi Central',
      coordinates: { lat: -12.187002, lng: 26.406948 },
      capacity: 450,
      enrolled: 360,
      hasBoarding: false,
      facilities: [
        'Opposite Kikombe School & Adjacent to Zambia Army Mess',
        'ECE Nursery & Reception Play Park',
        'Junior Computer Laboratory',
        'Primary Classrooms (Grades 1-7)',
        'School Tuckshop & Dining Pavilion',
        'Urban Minibus Shuttle Terminal',
      ],
      headTeacher: 'Mrs. Grace Tembo (MEd Early Childhood & Primary)',
    },
  ],
};

// ----------------------------------------------------------------------------
// 48 STAFF MEMBERS ACROSS ALL CADRES
// ----------------------------------------------------------------------------
export interface LegacyStaffMember {
  id: string;
  staffNumber: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  jobTitle: string;
  department:
    | 'BOARDING_ADMIN'
    | 'ACADEMIC_SECONDARY'
    | 'ACADEMIC_PRIMARY'
    | 'FINANCE_OPERATIONS'
    | 'HEALTHCARE_WELFARE'
    | 'SUPPORT_OPERATIONS';
  departmentLabel: string;
  campusId: 'LSS-MSC' | 'LSS-URB' | 'LSS-MDC' | 'LSS-KBC' | 'CENTRAL';
  campusName: string;
  qualification: string;
  tczNumber: string;
  tczExpiry: string;
  tczStatus: 'COMPLIANT' | 'EXPIRING_SOON' | 'EXPIRED';
  employmentStatus: 'FULL_TIME' | 'CONTRACT' | 'PROBATION';
  dateJoined: string;
  phone: string;
  email: string;
  salaryGrade: string;
  leaveBalanceDays: number;
}

export const LEGACY_STAFF_MEMBERS: LegacyStaffMember[] = [
  // 1. Executive Leadership
  {
    id: 'stf-001',
    staffNumber: 'LSS-STF-001',
    firstName: 'Emmanuel',
    lastName: 'Mwansa',
    gender: 'MALE',
    jobTitle: 'School Director & Principal',
    department: 'BOARDING_ADMIN',
    departmentLabel: 'Executive Directorate',
    campusId: 'CENTRAL',
    campusName: 'All Campuses (Consolidated)',
    qualification: 'BEd Natural Sciences (UNZA), Postgrad Ed Leadership',
    tczNumber: 'TCZ/2012/PR/04912',
    tczExpiry: '2028-04-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2019-01-10',
    phone: '+260 977 114093',
    email: 'emmanuel.mwansa@legacyschool.edu.zm',
    salaryGrade: 'GRADE-M1',
    leaveBalanceDays: 24,
  },
  {
    id: 'stf-002',
    staffNumber: 'LSS-STF-002',
    firstName: 'Grace',
    lastName: 'Tembo',
    gender: 'FEMALE',
    jobTitle: 'Headteacher — Mushitala Day Campus',
    department: 'ACADEMIC_PRIMARY',
    departmentLabel: 'Primary & ECE Administration',
    campusId: 'LSS-MDC',
    campusName: 'Mushitala Day Campus',
    qualification: 'MEd Early Childhood & Primary Education (Copperbelt Univ)',
    tczNumber: 'TCZ/2015/PR/10928',
    tczExpiry: '2027-11-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2020-05-15',
    phone: '+260 974 371271',
    email: 'grace.tembo@legacyschool.edu.zm',
    salaryGrade: 'GRADE-M2',
    leaveBalanceDays: 18,
  },
  {
    id: 'stf-003',
    staffNumber: 'LSS-STF-003',
    firstName: 'Kelvin',
    lastName: 'Phiri',
    gender: 'MALE',
    jobTitle: 'Senior Housemaster & Sports Director',
    department: 'BOARDING_ADMIN',
    departmentLabel: 'Boarding Administration',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'BSc Physical Education & Guidance Counseling (UNZA)',
    tczNumber: 'TCZ/2017/SEC/28194',
    tczExpiry: '2027-08-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2021-02-01',
    phone: '+260 967 288578',
    email: 'kelvin.phiri@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T1',
    leaveBalanceDays: 15,
  },
  {
    id: 'stf-004',
    staffNumber: 'LSS-STF-004',
    firstName: 'Beatrice',
    lastName: 'Kalenga',
    gender: 'FEMALE',
    jobTitle: 'Senior Boarding Matron & Welfare Officer',
    department: 'BOARDING_ADMIN',
    departmentLabel: 'Boarding Administration',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'Diploma in Registered Nursing & Adolescent Psychology',
    tczNumber: 'NMCZ/RN/2014/9021',
    tczExpiry: '2027-12-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2021-08-10',
    phone: '+260 978 440192',
    email: 'beatrice.kalenga@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 20,
  },
  {
    id: 'stf-005',
    staffNumber: 'LSS-STF-005',
    firstName: 'Chileshe',
    lastName: 'Mulenga',
    gender: 'MALE',
    jobTitle: 'Chief Financial Officer & Bursar',
    department: 'FINANCE_OPERATIONS',
    departmentLabel: 'Finance & Accounts',
    campusId: 'CENTRAL',
    campusName: 'All Campuses (Consolidated)',
    qualification: 'ACCA Professional, ZICA Fellow (Zambia Inst of Chartered Accountants)',
    tczNumber: 'ZICA/F/2016/4019',
    tczExpiry: '2026-12-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2020-01-05',
    phone: '+260 971 883019',
    email: 'bursar@legacyschool.edu.zm',
    salaryGrade: 'GRADE-M2',
    leaveBalanceDays: 14,
  },

  // 2. Secondary Academic Faculty (Senior & Junior Secondary)
  {
    id: 'stf-006',
    staffNumber: 'LSS-STF-006',
    firstName: 'Patrick',
    lastName: 'Lungu',
    gender: 'MALE',
    jobTitle: 'Head of Sciences (Physics & Chemistry)',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'BSc with Education — Chemistry & Physics (UNZA)',
    tczNumber: 'TCZ/2016/SEC/19402',
    tczExpiry: '2026-11-20',
    tczStatus: 'EXPIRING_SOON',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2022-01-10',
    phone: '+260 979 220194',
    email: 'patrick.lungu@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T1',
    leaveBalanceDays: 12,
  },
  {
    id: 'stf-007',
    staffNumber: 'LSS-STF-007',
    firstName: 'Martha',
    lastName: 'Mwanza',
    gender: 'FEMALE',
    jobTitle: 'Senior Mathematics & Additional Maths Teacher',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'BEd Mathematics & Computing (Copperbelt University)',
    tczNumber: 'TCZ/2018/SEC/33910',
    tczExpiry: '2027-06-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2022-05-15',
    phone: '+260 975 881029',
    email: 'martha.mwanza@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T1',
    leaveBalanceDays: 16,
  },
  {
    id: 'stf-008',
    staffNumber: 'LSS-STF-008',
    firstName: 'Hastings',
    lastName: 'Banda',
    gender: 'MALE',
    jobTitle: 'Senior Biology & Agricultural Science Teacher',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'BSc Agricultural Sciences with Education (UNZA)',
    tczNumber: 'TCZ/2017/SEC/21049',
    tczExpiry: '2027-09-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2021-09-01',
    phone: '+260 966 331902',
    email: 'hastings.banda@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T1',
    leaveBalanceDays: 14,
  },
  {
    id: 'stf-009',
    staffNumber: 'LSS-STF-009',
    firstName: 'Chimwemwe',
    lastName: 'Phiri',
    gender: 'FEMALE',
    jobTitle: 'Senior English Language & Literature Teacher',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'BA with Education — English Literature & Linguistics (UNZA)',
    tczNumber: 'TCZ/2016/SEC/18492',
    tczExpiry: '2028-02-28',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2020-08-15',
    phone: '+260 978 221094',
    email: 'chimwemwe.phiri@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T1',
    leaveBalanceDays: 19,
  },
  {
    id: 'stf-010',
    staffNumber: 'LSS-STF-010',
    firstName: 'Brian',
    lastName: 'Chanda',
    gender: 'MALE',
    jobTitle: 'Geography & Environmental Science Teacher',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'BEd Geography & Environmental Studies (Mulungushi Univ)',
    tczNumber: 'TCZ/2019/SEC/40192',
    tczExpiry: '2027-07-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2022-01-10',
    phone: '+260 976 440192',
    email: 'brian.chanda@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 15,
  },
  {
    id: 'stf-011',
    staffNumber: 'LSS-STF-011',
    firstName: 'Natasha',
    lastName: 'Siame',
    gender: 'FEMALE',
    jobTitle: 'History & Civic Education Teacher',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'BEd Civic Education & History (Kwame Nkrumah Univ)',
    tczNumber: 'TCZ/2020/SEC/49102',
    tczExpiry: '2028-05-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2023-01-05',
    phone: '+260 972 551928',
    email: 'natasha.siame@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 17,
  },
  {
    id: 'stf-012',
    staffNumber: 'LSS-STF-012',
    firstName: 'Donald',
    lastName: 'Chibwe',
    gender: 'MALE',
    jobTitle: 'Cambridge A-Level Physics & Mechanics Specialist',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'BSc Physics & Applied Mathematics (UNZA)',
    tczNumber: 'TCZ/2015/SEC/10928',
    tczExpiry: '2027-10-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2021-01-15',
    phone: '+260 976 339102',
    email: 'donald.chibwe@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T1',
    leaveBalanceDays: 11,
  },
  {
    id: 'stf-013',
    staffNumber: 'LSS-STF-013',
    firstName: 'Rabecca',
    lastName: 'Musonda',
    gender: 'FEMALE',
    jobTitle: 'Commerce & Principles of Accounts Teacher',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'BEd Business Studies & Accounting (Evelyn Hone / CBU)',
    tczNumber: 'TCZ/2018/SEC/31940',
    tczExpiry: '2027-12-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2021-08-10',
    phone: '+260 968 119402',
    email: 'rabecca.musonda@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T1',
    leaveBalanceDays: 18,
  },
  {
    id: 'stf-014',
    staffNumber: 'LSS-STF-014',
    firstName: 'Aaron',
    lastName: 'Chileshe',
    gender: 'MALE',
    jobTitle: 'Computer Studies, ICT & Web Systems Teacher',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'BSc Information Technology & Education (CBU)',
    tczNumber: 'TCZ/2019/SEC/42109',
    tczExpiry: '2028-01-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2022-09-01',
    phone: '+260 973 881029',
    email: 'aaron.chileshe@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 14,
  },
  {
    id: 'stf-015',
    staffNumber: 'LSS-STF-015',
    firstName: 'Memory',
    lastName: 'Tembo',
    gender: 'FEMALE',
    jobTitle: 'Religious Education & Guidance Counselor',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'BEd Religious Studies & Counseling Psychology (UNZA)',
    tczNumber: 'TCZ/2017/SEC/25910',
    tczExpiry: '2027-04-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2020-02-15',
    phone: '+260 977 441029',
    email: 'memory.tembo@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T1',
    leaveBalanceDays: 20,
  },
  {
    id: 'stf-016',
    staffNumber: 'LSS-STF-016',
    firstName: 'Joseph',
    lastName: 'Mwape',
    gender: 'MALE',
    jobTitle: 'Physical Education Coach & Swimming Instructor',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'Diploma in Sports Science & Fitness Conditioning (Evelyn Hone)',
    tczNumber: 'TCZ/2020/SEC/48192',
    tczExpiry: '2028-08-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2023-01-10',
    phone: '+260 965 221094',
    email: 'joseph.mwape@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 16,
  },
  {
    id: 'stf-017',
    staffNumber: 'LSS-STF-017',
    firstName: 'Choolwe',
    lastName: 'Mwiinga',
    gender: 'FEMALE',
    jobTitle: 'French Language & Literature Teacher',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'BA with Education — French & Linguistics (UNZA / Alliance Française)',
    tczNumber: 'TCZ/2021/SEC/51920',
    tczExpiry: '2028-09-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2023-05-15',
    phone: '+260 971 334910',
    email: 'choolwe.mwiinga@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 13,
  },
  {
    id: 'stf-018',
    staffNumber: 'LSS-STF-018',
    firstName: 'Mwamba',
    lastName: 'Bwalya',
    gender: 'MALE',
    jobTitle: 'Junior Secondary Integrated Science Teacher',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'Diploma in Secondary Science Education (Mufulira College of Ed)',
    tczNumber: 'TCZ/2019/SEC/39201',
    tczExpiry: '2027-03-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2022-01-05',
    phone: '+260 978 991024',
    email: 'mwamba.bwalya@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 15,
  },
  {
    id: 'stf-019',
    staffNumber: 'LSS-STF-019',
    firstName: 'Faith',
    lastName: 'Lungu',
    gender: 'FEMALE',
    jobTitle: 'Junior Secondary Mathematics & Social Studies',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'Diploma in Secondary Education (Nkrumah College)',
    tczNumber: 'TCZ/2020/SEC/45192',
    tczExpiry: '2028-06-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2022-09-01',
    phone: '+260 966 881029',
    email: 'faith.lungu@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 14,
  },
  {
    id: 'stf-020',
    staffNumber: 'LSS-STF-020',
    firstName: 'Peter',
    lastName: 'Sakala',
    gender: 'MALE',
    jobTitle: 'Technical Drawing, Design Tech & Woodwork Instructor',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'Diploma in Technical Education (NORTEC / Luanshya TVTC)',
    tczNumber: 'TCZ/2018/SEC/31049',
    tczExpiry: '2027-11-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2021-05-10',
    phone: '+260 974 661029',
    email: 'peter.sakala@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 12,
  },
  {
    id: 'stf-021',
    staffNumber: 'LSS-STF-021',
    firstName: 'Brenda',
    lastName: 'Chilufya',
    gender: 'FEMALE',
    jobTitle: 'Creative Performing Arts, Music & Drama Teacher',
    department: 'ACADEMIC_SECONDARY',
    departmentLabel: 'Secondary Faculty',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'Diploma in Music & Performing Arts Education (Evelyn Hone)',
    tczNumber: 'TCZ/2021/SEC/53910',
    tczExpiry: '2028-11-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2023-01-15',
    phone: '+260 979 441029',
    email: 'brenda.chilufya@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 16,
  },

  // 3. Primary & ECE Faculty (Mushitala Day Campus)
  {
    id: 'stf-022',
    staffNumber: 'LSS-STF-022',
    firstName: 'Agness',
    lastName: 'Chanda',
    gender: 'FEMALE',
    jobTitle: 'Lead ECE Practitioner (Reception Class)',
    department: 'ACADEMIC_PRIMARY',
    departmentLabel: 'Primary & ECE Faculty',
    campusId: 'LSS-MDC',
    campusName: 'Mushitala Day Campus',
    qualification: 'Diploma in Early Childhood Education (ZAMISE)',
    tczNumber: 'TCZ/2019/ECE/41029',
    tczExpiry: '2027-09-15',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2021-01-15',
    phone: '+260 966 550192',
    email: 'agness.chanda@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 19,
  },
  {
    id: 'stf-023',
    staffNumber: 'LSS-STF-023',
    firstName: 'Lubasi',
    lastName: 'Sakala',
    gender: 'FEMALE',
    jobTitle: 'ECE Nursery & Baby Class Specialist',
    department: 'ACADEMIC_PRIMARY',
    departmentLabel: 'Primary & ECE Faculty',
    campusId: 'LSS-MDC',
    campusName: 'Mushitala Day Campus',
    qualification: 'Certificate in Early Childhood Development & Phonics',
    tczNumber: 'TCZ/2021/ECE/52910',
    tczExpiry: '2028-07-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2023-01-05',
    phone: '+260 971 229104',
    email: 'lubasi.sakala@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T3',
    leaveBalanceDays: 15,
  },
  {
    id: 'stf-024',
    staffNumber: 'LSS-STF-024',
    firstName: 'Mirriam',
    lastName: 'Kasonde',
    gender: 'FEMALE',
    jobTitle: 'Grade 1 Gold Class Teacher (Early Literacy)',
    department: 'ACADEMIC_PRIMARY',
    departmentLabel: 'Primary & ECE Faculty',
    campusId: 'LSS-MDC',
    campusName: 'Mushitala Day Campus',
    qualification: 'Diploma in Primary Education (Kitwe College of Education)',
    tczNumber: 'TCZ/2018/PR/34190',
    tczExpiry: '2027-08-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2021-08-15',
    phone: '+260 977 881920',
    email: 'mirriam.kasonde@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 17,
  },
  {
    id: 'stf-025',
    staffNumber: 'LSS-STF-025',
    firstName: 'Abigail',
    lastName: 'Tembo',
    gender: 'FEMALE',
    jobTitle: 'Grade 1 Blue Class Teacher',
    department: 'ACADEMIC_PRIMARY',
    departmentLabel: 'Primary & ECE Faculty',
    campusId: 'LSS-MDC',
    campusName: 'Mushitala Day Campus',
    qualification: 'Diploma in Primary Education (Malcolm Moffat College)',
    tczNumber: 'TCZ/2019/PR/40921',
    tczExpiry: '2028-03-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2022-01-10',
    phone: '+260 967 882194',
    email: 'abigail.tembo@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 16,
  },
  {
    id: 'stf-026',
    staffNumber: 'LSS-STF-026',
    firstName: 'Davies',
    lastName: 'Mwewa',
    gender: 'MALE',
    jobTitle: 'Grade 2 Emerald Class Teacher',
    department: 'ACADEMIC_PRIMARY',
    departmentLabel: 'Primary & ECE Faculty',
    campusId: 'LSS-MDC',
    campusName: 'Mushitala Day Campus',
    qualification: 'Diploma in Primary Education (Kasama College of Education)',
    tczNumber: 'TCZ/2017/PR/29104',
    tczExpiry: '2027-05-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2020-09-01',
    phone: '+260 975 119284',
    email: 'davies.mwewa@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 14,
  },
  {
    id: 'stf-027',
    staffNumber: 'LSS-STF-027',
    firstName: 'Eunice',
    lastName: 'Banda',
    gender: 'FEMALE',
    jobTitle: 'Grade 3 Diamond Class Teacher',
    department: 'ACADEMIC_PRIMARY',
    departmentLabel: 'Primary & ECE Faculty',
    campusId: 'LSS-MDC',
    campusName: 'Mushitala Day Campus',
    qualification: 'Diploma in Primary Education (David Livingstone College)',
    tczNumber: 'TCZ/2018/PR/36102',
    tczExpiry: '2027-10-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2021-05-01',
    phone: '+260 968 440192',
    email: 'eunice.banda@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 18,
  },
  {
    id: 'stf-028',
    staffNumber: 'LSS-STF-028',
    firstName: 'Francis',
    lastName: 'Mwale',
    gender: 'MALE',
    jobTitle: 'Grade 4 Ruby Class Teacher',
    department: 'ACADEMIC_PRIMARY',
    departmentLabel: 'Primary & ECE Faculty',
    campusId: 'LSS-MDC',
    campusName: 'Mushitala Day Campus',
    qualification: 'BEd Primary Education (UNZA)',
    tczNumber: 'TCZ/2016/PR/20194',
    tczExpiry: '2027-04-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2019-08-15',
    phone: '+260 977 339102',
    email: 'francis.mwale@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T1',
    leaveBalanceDays: 15,
  },
  {
    id: 'stf-029',
    staffNumber: 'LSS-STF-029',
    firstName: 'Gertrude',
    lastName: 'Chanda',
    gender: 'FEMALE',
    jobTitle: 'Grade 5 Sapphire Class Teacher',
    department: 'ACADEMIC_PRIMARY',
    departmentLabel: 'Primary & ECE Faculty',
    campusId: 'LSS-MDC',
    campusName: 'Mushitala Day Campus',
    qualification: 'Diploma in Primary Education (Mufulira College of Ed)',
    tczNumber: 'TCZ/2019/PR/41920',
    tczExpiry: '2028-02-28',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2022-01-10',
    phone: '+260 979 119284',
    email: 'gertrude.chanda@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 16,
  },
  {
    id: 'stf-030',
    staffNumber: 'LSS-STF-030',
    firstName: 'Samson',
    lastName: 'Phiri',
    gender: 'MALE',
    jobTitle: 'Grade 6 Topaz Class Teacher',
    department: 'ACADEMIC_PRIMARY',
    departmentLabel: 'Primary & ECE Faculty',
    campusId: 'LSS-MDC',
    campusName: 'Mushitala Day Campus',
    qualification: 'Diploma in Primary Education (Solwezi College of Education)',
    tczNumber: 'TCZ/2017/PR/27190',
    tczExpiry: '2027-06-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2020-01-15',
    phone: '+260 965 441029',
    email: 'samson.phiri@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 13,
  },
  {
    id: 'stf-031',
    staffNumber: 'LSS-STF-031',
    firstName: 'Veronica',
    lastName: 'Zulu',
    gender: 'FEMALE',
    jobTitle: 'Grade 7 National Exam Lead Teacher',
    department: 'ACADEMIC_PRIMARY',
    departmentLabel: 'Primary & ECE Faculty',
    campusId: 'LSS-MDC',
    campusName: 'Mushitala Day Campus',
    qualification: 'BEd Primary Mathematics & Educational Testing (UNZA)',
    tczNumber: 'TCZ/2014/PR/14920',
    tczExpiry: '2027-11-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2019-05-10',
    phone: '+260 979 550192',
    email: 'veronica.zulu@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T1',
    leaveBalanceDays: 21,
  },
  {
    id: 'stf-032',
    staffNumber: 'LSS-STF-032',
    firstName: 'George',
    lastName: 'Bwalya',
    gender: 'MALE',
    jobTitle: 'Primary Science & Scratch Coding Instructor',
    department: 'ACADEMIC_PRIMARY',
    departmentLabel: 'Primary & ECE Faculty',
    campusId: 'LSS-MDC',
    campusName: 'Mushitala Day Campus',
    qualification: 'Diploma in ICT & Primary Education (Evelyn Hone)',
    tczNumber: 'TCZ/2021/PR/54190',
    tczExpiry: '2028-10-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2023-01-15',
    phone: '+260 976 881029',
    email: 'george.bwalya@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 14,
  },
  {
    id: 'stf-033',
    staffNumber: 'LSS-STF-033',
    firstName: 'Mutale',
    lastName: 'Chileshe',
    gender: 'FEMALE',
    jobTitle: 'Special Educational Needs (SEN) Coordinator',
    department: 'ACADEMIC_PRIMARY',
    departmentLabel: 'Student Welfare & SEN',
    campusId: 'LSS-MDC',
    campusName: 'Mushitala Day Campus',
    qualification: 'BEd Special Education & Remedial Learning (ZAMISE / UNZA)',
    tczNumber: 'TCZ/2017/PR/28190',
    tczExpiry: '2027-09-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2021-02-15',
    phone: '+260 971 441029',
    email: 'mutale.chileshe@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T1',
    leaveBalanceDays: 17,
  },

  // 4. Boarding Village, Welfare & Clinic (Kansanshi Boarding Campus)
  {
    id: 'stf-034',
    staffNumber: 'LSS-STF-034',
    firstName: 'Victor',
    lastName: 'Chinyama',
    gender: 'MALE',
    jobTitle: 'Assistant Housemaster (Kansanshi Boys Hall)',
    department: 'BOARDING_ADMIN',
    departmentLabel: 'Boarding Staff',
    campusId: 'LSS-KBC',
    campusName: 'Mushitala Campus (Near Kansanshi)',
    qualification: 'Certificate in Youth Welfare & Pastoral Care',
    tczNumber: 'TCZ/2021/SEC/52910',
    tczExpiry: '2028-04-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2022-05-10',
    phone: '+260 967 114092',
    email: 'victor.chinyama@legacyschool.edu.zm',
    salaryGrade: 'GRADE-S1',
    leaveBalanceDays: 15,
  },
  {
    id: 'stf-035',
    staffNumber: 'LSS-STF-035',
    firstName: 'Given',
    lastName: 'Musonda',
    gender: 'MALE',
    jobTitle: 'Assistant Housemaster (Kansanshi East Wing)',
    department: 'BOARDING_ADMIN',
    departmentLabel: 'Boarding Staff',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'Certificate in Sports Coaching & Student Discipline',
    tczNumber: 'TCZ/2022/SEC/59102',
    tczExpiry: '2028-12-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2023-01-10',
    phone: '+260 978 221049',
    email: 'given.musonda@legacyschool.edu.zm',
    salaryGrade: 'GRADE-S1',
    leaveBalanceDays: 14,
  },
  {
    id: 'stf-036',
    staffNumber: 'LSS-STF-036',
    firstName: 'Constance',
    lastName: 'Kangwa',
    gender: 'FEMALE',
    jobTitle: 'Assistant Boarding Matron (Kalumbila Girls Hall)',
    department: 'BOARDING_ADMIN',
    departmentLabel: 'Boarding Staff',
    campusId: 'LSS-KBC',
    campusName: 'Mushitala Campus (Near Kansanshi)',
    qualification: 'Certificate in Psychosocial Counseling & Child Safeguarding',
    tczNumber: 'NMCZ/EN/2016/4019',
    tczExpiry: '2027-07-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2022-08-01',
    phone: '+260 975 119284',
    email: 'constance.kangwa@legacyschool.edu.zm',
    salaryGrade: 'GRADE-S1',
    leaveBalanceDays: 18,
  },
  {
    id: 'stf-037',
    staffNumber: 'LSS-STF-037',
    firstName: 'Eneless',
    lastName: 'Tembo',
    gender: 'FEMALE',
    jobTitle: 'Assistant Boarding Matron (Kalumbila South Wing)',
    department: 'BOARDING_ADMIN',
    departmentLabel: 'Boarding Staff',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'Certificate in Institutional Housekeeping & First Aid',
    tczNumber: 'TEVETA/HK/2018/194',
    tczExpiry: '2028-03-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2023-03-15',
    phone: '+260 966 441029',
    email: 'eneless.tembo@legacyschool.edu.zm',
    salaryGrade: 'GRADE-S1',
    leaveBalanceDays: 16,
  },
  {
    id: 'stf-038',
    staffNumber: 'LSS-STF-038',
    firstName: 'Mary',
    lastName: 'Mumba',
    gender: 'FEMALE',
    jobTitle: 'Resident Registered Nurse & Sickbay Supervisor',
    department: 'HEALTHCARE_WELFARE',
    departmentLabel: 'Healthcare & Sickbay',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'Diploma in Registered Nursing (Solwezi School of Nursing)',
    tczNumber: 'NMCZ/RN/2013/8192',
    tczExpiry: '2028-10-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2020-06-01',
    phone: '+260 977 991024',
    email: 'clinic@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T1',
    leaveBalanceDays: 22,
  },

  // 5. Finance, Admissions & ICT Administration
  {
    id: 'stf-039',
    staffNumber: 'LSS-STF-039',
    firstName: 'Joyce',
    lastName: 'Phiri',
    gender: 'FEMALE',
    jobTitle: 'Assistant Bursar & Fee Collection Cashier',
    department: 'FINANCE_OPERATIONS',
    departmentLabel: 'Finance & Accounts',
    campusId: 'CENTRAL',
    campusName: 'All Campuses (Consolidated)',
    qualification: 'ZICA Licentiate / Diploma in Accountancy (ZCAS)',
    tczNumber: 'ZICA/L/2019/5190',
    tczExpiry: '2027-12-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2021-03-10',
    phone: '+260 974 551920',
    email: 'cashier@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 14,
  },
  {
    id: 'stf-040',
    staffNumber: 'LSS-STF-040',
    firstName: 'Derrick',
    lastName: 'Mwewa',
    gender: 'MALE',
    jobTitle: 'School Registrar & Admissions Coordinator',
    department: 'FINANCE_OPERATIONS',
    departmentLabel: 'Registry & Admissions',
    campusId: 'CENTRAL',
    campusName: 'All Campuses (Consolidated)',
    qualification: 'BA in Public Administration (UNZA)',
    tczNumber: 'ZAP/PA/2017/2810',
    tczExpiry: '2028-06-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2020-11-01',
    phone: '+260 967 881029',
    email: 'admissions@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T1',
    leaveBalanceDays: 15,
  },
  {
    id: 'stf-041',
    staffNumber: 'LSS-STF-041',
    firstName: 'Angela',
    lastName: 'Sakala',
    gender: 'FEMALE',
    jobTitle: 'Executive Secretary & Front Office Coordinator',
    department: 'FINANCE_OPERATIONS',
    departmentLabel: 'Administration',
    campusId: 'CENTRAL',
    campusName: 'All Campuses (Consolidated)',
    qualification: 'Diploma in Secretarial & Office Management (Evelyn Hone)',
    tczNumber: 'TEVETA/SM/2016/9102',
    tczExpiry: '2027-08-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2019-10-15',
    phone: '+260 978 119284',
    email: 'secretary@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 18,
  },
  {
    id: 'stf-042',
    staffNumber: 'LSS-STF-042',
    firstName: 'Kenneth',
    lastName: 'Bwalya',
    gender: 'MALE',
    jobTitle: 'Systems Administrator & Starlink/Fibre Engineer',
    department: 'FINANCE_OPERATIONS',
    departmentLabel: 'ICT & Infrastructure',
    campusId: 'CENTRAL',
    campusName: 'All Campuses (Consolidated)',
    qualification: 'BSc Computer Engineering (CBU), Cisco CCNA Certified',
    tczNumber: 'EIZ/ENG/2018/4910',
    tczExpiry: '2027-12-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2021-07-01',
    phone: '+260 972 881029',
    email: 'systems@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T1',
    leaveBalanceDays: 12,
  },
  {
    id: 'stf-043',
    staffNumber: 'LSS-STF-043',
    firstName: 'Prudence',
    lastName: 'Banda',
    gender: 'FEMALE',
    jobTitle: 'Senior Librarian & E-Learning Resource Officer',
    department: 'FINANCE_OPERATIONS',
    departmentLabel: 'Academic Support',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'Diploma in Library & Information Science (UNZA)',
    tczNumber: 'TEVETA/LIS/2017/3491',
    tczExpiry: '2028-05-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2022-02-15',
    phone: '+260 965 119284',
    email: 'library@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 16,
  },

  // 6. Catering, Transport, Technical & Facilities
  {
    id: 'stf-044',
    staffNumber: 'LSS-STF-044',
    firstName: 'Moses',
    lastName: 'Banda',
    gender: 'MALE',
    jobTitle: 'Head Chef & Boarding Dining Director',
    department: 'SUPPORT_OPERATIONS',
    departmentLabel: 'Catering & Hospitality',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    qualification: 'Advanced Diploma in Food Production & Nutrition (Fairview)',
    tczNumber: 'TEVETA/HM/2015/091',
    tczExpiry: '2028-12-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2020-03-01',
    phone: '+260 973 118492',
    email: 'catering@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 10,
  },
  {
    id: 'stf-045',
    staffNumber: 'LSS-STF-045',
    firstName: 'Timothy',
    lastName: 'Kabwe',
    gender: 'MALE',
    jobTitle: 'Senior Minibus Driver & Fleet Supervisor (BAX 3192 ZM)',
    department: 'SUPPORT_OPERATIONS',
    departmentLabel: 'Transport & Fleet',
    campusId: 'CENTRAL',
    campusName: 'All Campuses (Consolidated)',
    qualification: 'PSV Heavy Duty License & Defensive Driving Certificate (RTSA)',
    tczNumber: 'RTSA/PSV/2012/1092',
    tczExpiry: '2027-09-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2019-04-10',
    phone: '+260 976 119284',
    email: 'transport@legacyschool.edu.zm',
    salaryGrade: 'GRADE-S2',
    leaveBalanceDays: 14,
  },
  {
    id: 'stf-046',
    staffNumber: 'LSS-STF-046',
    firstName: 'Patrick',
    lastName: 'Zulu',
    gender: 'MALE',
    jobTitle: 'Minibus Driver & Facilities Assistant (BAL 4920 ZM)',
    department: 'SUPPORT_OPERATIONS',
    departmentLabel: 'Transport & Fleet',
    campusId: 'CENTRAL',
    campusName: 'All Campuses (Consolidated)',
    qualification: 'PSV Passenger Vehicle License (RTSA Certified)',
    tczNumber: 'RTSA/PSV/2016/4019',
    tczExpiry: '2028-01-31',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2021-09-15',
    phone: '+260 971 883920',
    email: 'transport2@legacyschool.edu.zm',
    salaryGrade: 'GRADE-S2',
    leaveBalanceDays: 15,
  },
  {
    id: 'stf-047',
    staffNumber: 'LSS-STF-047',
    firstName: 'Bauleni',
    lastName: 'Siame',
    gender: 'MALE',
    jobTitle: 'Facilities Supervisor & 250kVA Generator Maintenance',
    department: 'SUPPORT_OPERATIONS',
    departmentLabel: 'Maintenance & Power',
    campusId: 'CENTRAL',
    campusName: 'All Campuses (Consolidated)',
    qualification: 'Advanced Craft Certificate in Electrical Engineering (NORTEC)',
    tczNumber: 'TEVETA/EE/2014/8192',
    tczExpiry: '2027-11-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2020-05-01',
    phone: '+260 968 551029',
    email: 'maintenance@legacyschool.edu.zm',
    salaryGrade: 'GRADE-T2',
    leaveBalanceDays: 12,
  },
  {
    id: 'stf-048',
    staffNumber: 'LSS-STF-048',
    firstName: 'Justin',
    lastName: 'Mwape',
    gender: 'MALE',
    jobTitle: 'Chief Campus Security Officer & Gate Supervisor',
    department: 'SUPPORT_OPERATIONS',
    departmentLabel: 'Security & Checkpoint',
    campusId: 'CENTRAL',
    campusName: 'All Campuses (Consolidated)',
    qualification: 'Certificate in Security Operations & Emergency Response',
    tczNumber: 'SEC/ZM/2015/0912',
    tczExpiry: '2028-06-30',
    tczStatus: 'COMPLIANT',
    employmentStatus: 'FULL_TIME',
    dateJoined: '2019-02-01',
    phone: '+260 975 440192',
    email: 'security@legacyschool.edu.zm',
    salaryGrade: 'GRADE-S2',
    leaveBalanceDays: 16,
  },
];

// ----------------------------------------------------------------------------
// FULL SPECTRUM OF ALL GRADES & HISTORICAL PROFILES
// ----------------------------------------------------------------------------

export interface AccommodationHistoryRecord {
  id: string;
  academicYear: string;
  term: string;
  termLabel: string;
  boardingHouse: 'MOPANI_BOYS_HALL' | 'MUKWA_GIRLS_HALL';
  boardingHouseLabel: string;
  wing: 'Junior Wing' | 'Senior Wing' | 'North Wing' | 'South Wing';
  dormRoom: string;
  bedNumber: string;
  lockerNumber: string;
  housemasterOrMatron: string;
  inspectionScore: string;
  exeatsCount: number;
  status: 'CHECKED_IN' | 'COMPLETED' | 'VACATED';
  curfewComplianceRate: string;
  remarks: string;
}

export interface HistoricalFeeRecord {
  id: string;
  academicYear: string;
  term: string;
  termLabel: string;
  category: 'BOARDING_AND_TUITION' | 'DAY_TUITION';
  amountBilled: number;
  amountPaid: number;
  balanceRemaining: number;
  status: 'CLEARED' | 'PARTIAL' | 'ARREARS';
  receiptNumber: string;
  paymentDate: string;
  paymentMethod: 'Zanaco Billmaster' | 'Stanbic Bank Deposit' | 'Airtel Money Merchant' | 'MTN Mobile Money' | 'Absa Bank Transfer';
  referenceNumber: string;
}

export interface HistoricalAcademicSubject {
  subjectName: string;
  code: string;
  score: number;
  eczGrade: string; // "1 (Distinction)", "2", "3 (Merit)", etc.
  teacherRemark: string;
}

export interface HistoricalAcademicRecord {
  academicYear: string;
  term: string;
  termLabel: string;
  className: string;
  averageScore: number;
  positionInClass: string;
  eczDivision: 'Division 1' | 'Division 2' | 'Division 3';
  conductGrade: 'A (Exemplary)' | 'B (Good)' | 'C (Satisfactory)';
  principalRemarks: string;
  subjects: HistoricalAcademicSubject[];
}

export interface MedicalWelfareProfile {
  bloodGroup: 'O+' | 'A+' | 'B+' | 'AB+' | 'O-';
  allergies: string;
  chronicConditions: string;
  sickbayVisitsCount: number;
  lastNurseCheckup: string;
  nurseNotes: string;
  dietaryRequirements: string;
}

export interface CurrentAccommodation {
  isBoarder: boolean;
  boardingHouse?: 'MOPANI_BOYS_HALL' | 'MUKWA_GIRLS_HALL';
  boardingHouseLabel?: string;
  wing?: string;
  dormRoom?: string;
  bedNumber?: string;
  lockerNumber?: string;
  supervisorName?: string;
  cleanlinessScore?: string;
  todayStatus?: 'IN_DORM' | 'IN_CLASSES' | 'PREP_ROOM' | 'SICKBAY' | 'APPROVED_EXEAT';
}

export interface LegacyLearnerBalance {
  id: string;
  studentNumber: string;
  learnerName: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
  className: string;
  stage: string;
  campusName: string;
  studentType: 'DAY_SCHOLAR' | 'BOARDER';
  hallName?: string;
  totalBilled: number;
  totalPaid: number;
  balance: number;
  financialStatus: 'CLEARED' | 'PARTIAL' | 'ARREARS' | 'CHRONIC_ARREARS';
  ageing: {
    current: number;
    days31to60: number;
    days61to90: number;
    over90days: number;
  };
  guardian: {
    name: string;
    phone: string;
    email: string;
  };
  todayAttendance: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  invoiceCount: number;
  paymentCount: number;
  currentAccommodation: CurrentAccommodation;
  accommodationHistory: AccommodationHistoryRecord[];
  feeHistory: HistoricalFeeRecord[];
  performanceHistory: HistoricalAcademicRecord[];
  medicalProfile: MedicalWelfareProfile;
}

const FIRST_NAMES_MALE = [
  'Chileshe', 'Kondwani', 'Mwamba', 'Mulenga', 'Luyando', 'Bupe', 'Mutale', 'Zondani',
  'Dalitso', 'Bwalya', 'Chanda', 'Davies', 'Kelvin', 'Gift', 'Taonga', 'Given',
  'Victor', 'Emmanuel', 'Patrick', 'Francis', 'Hastings', 'Donald', 'Brian', 'Samson',
  'Nathan', 'Timothy', 'Bright', 'Lameck', 'Stanley', 'Reuben', 'Moses', 'Kennedy',
];

const FIRST_NAMES_FEMALE = [
  'Natasha', 'Tinkhani', 'Blessing', 'Taonga', 'Mapalo', 'Chimwemwe', 'Rabecca', 'Memory',
  'Agness', 'Lubasi', 'Mirriam', 'Abigail', 'Eunice', 'Gertrude', 'Veronica', 'Mutale',
  'Choolwe', 'Brenda', 'Faith', 'Mary', 'Constance', 'Eneless', 'Angela', 'Prudence',
  'Mercy', 'Chilufya', 'Bupe', 'Sekwila', 'Njavwa', 'Thandiwe', 'Mwansa', 'Chileshe',
];

const LAST_NAMES = [
  'Mwansa', 'Banda', 'Phiri', 'Chanda', 'Tembo', 'Mulenga', 'Mwape', 'Sakala',
  'Lungu', 'Siame', 'Musonda', 'Chilufya', 'Bwalya', 'Kasonde', 'Zulu', 'Mwanza',
  'Kabwe', 'Chileshe', 'Mwale', 'Kalenga', 'Mwewa', 'Chibwe', 'Mumba', 'Mwiinga',
  'Siame', 'Kangwa', 'Chinyama', 'Miti', 'Sikazwe', 'Chiluba', 'Sinkala', 'Mubanga',
];

const GUARDIAN_TITLES = ['Eng.', 'Dr.', 'Mr.', 'Mrs.', 'Capt.', 'Rev.', 'Prof.', 'Director'];

export function generateLegacyLearners(totalCount = 780): LegacyLearnerBalance[] {
  const learners: LegacyLearnerBalance[] = [];

  // Complete spectrum of all grades across both campuses (360 Urban + 420 Mushitala = 780 Total)
  const classesConfig = [
    // --- Urban Campus (ECE & Primary Day School — Solwezi Central) (360 Pupils) ---
    { name: 'Baby Class (Little Stars)', stage: 'EARLY_CHILDHOOD', campus: 'Urban Campus (Solwezi Central)', isSecondary: false, fee: 2400, count: 30, yearLevel: 0 },
    { name: 'Middle Class', stage: 'EARLY_CHILDHOOD', campus: 'Urban Campus (Solwezi Central)', isSecondary: false, fee: 2400, count: 30, yearLevel: 0 },
    { name: 'Reception Stars', stage: 'EARLY_CHILDHOOD', campus: 'Urban Campus (Solwezi Central)', isSecondary: false, fee: 2600, count: 40, yearLevel: 0 },
    { name: 'Grade 1 Gold', stage: 'PRIMARY', campus: 'Urban Campus (Solwezi Central)', isSecondary: false, fee: 2800, count: 38, yearLevel: 1 },
    { name: 'Grade 2 Emerald', stage: 'PRIMARY', campus: 'Urban Campus (Solwezi Central)', isSecondary: false, fee: 2800, count: 38, yearLevel: 2 },
    { name: 'Grade 3 Diamond', stage: 'PRIMARY', campus: 'Urban Campus (Solwezi Central)', isSecondary: false, fee: 2800, count: 38, yearLevel: 3 },
    { name: 'Grade 4 Ruby', stage: 'PRIMARY', campus: 'Urban Campus (Solwezi Central)', isSecondary: false, fee: 2800, count: 38, yearLevel: 4 },
    { name: 'Grade 5 Blue', stage: 'PRIMARY', campus: 'Urban Campus (Solwezi Central)', isSecondary: false, fee: 2800, count: 36, yearLevel: 5 },
    { name: 'Grade 6 Silver', stage: 'PRIMARY', campus: 'Urban Campus (Solwezi Central)', isSecondary: false, fee: 2900, count: 36, yearLevel: 6 },
    { name: 'Grade 7 Top (Candidates)', stage: 'PRIMARY', campus: 'Urban Campus (Solwezi Central)', isSecondary: false, fee: 3100, count: 36, yearLevel: 7 },

    // --- Mushitala Campus (Secondary & Boarding Wing — Near Kansanshi Mine) (420 Pupils) ---
    { name: 'Form 1 Alpha', stage: 'JUNIOR_SECONDARY', campus: 'Mushitala Campus (Near Kansanshi)', isSecondary: true, fee: 10400, count: 42, yearLevel: 8 },
    { name: 'Form 1 Beta', stage: 'JUNIOR_SECONDARY', campus: 'Mushitala Campus (Near Kansanshi)', isSecondary: true, fee: 10400, count: 42, yearLevel: 8 },
    { name: 'Form 2 Gold (ECZ Candidates)', stage: 'JUNIOR_SECONDARY', campus: 'Mushitala Campus (Near Kansanshi)', isSecondary: true, fee: 10400, count: 44, yearLevel: 9 },
    { name: 'Form 2 Green', stage: 'JUNIOR_SECONDARY', campus: 'Mushitala Campus (Near Kansanshi)', isSecondary: true, fee: 10400, count: 44, yearLevel: 9 },
    { name: 'Form 3 Blue', stage: 'SENIOR_SECONDARY', campus: 'Mushitala Campus (Near Kansanshi)', isSecondary: true, fee: 10400, count: 42, yearLevel: 10 },
    { name: 'Form 3 Red', stage: 'SENIOR_SECONDARY', campus: 'Mushitala Campus (Near Kansanshi)', isSecondary: true, fee: 10400, count: 42, yearLevel: 10 },
    { name: 'Form 4 Green', stage: 'SENIOR_SECONDARY', campus: 'Mushitala Campus (Near Kansanshi)', isSecondary: true, fee: 10400, count: 42, yearLevel: 11 },
    { name: 'Form 4 Gold', stage: 'SENIOR_SECONDARY', campus: 'Mushitala Campus (Near Kansanshi)', isSecondary: true, fee: 10400, count: 40, yearLevel: 11 },
    { name: 'Form 5 Sciences (Senior Candidates)', stage: 'SENIOR_SECONDARY', campus: 'Mushitala Campus (Near Kansanshi)', isSecondary: true, fee: 10400, count: 42, yearLevel: 12 },
    { name: 'Form 5 Arts & Commerce', stage: 'SENIOR_SECONDARY', campus: 'Mushitala Campus (Near Kansanshi)', isSecondary: true, fee: 10400, count: 40, yearLevel: 12 },
  ];

  let studentIndex = 1;
  let assignedBoysBoarders = 0;
  let assignedGirlsBoarders = 0;

  for (const c of classesConfig) {
    for (let i = 0; i < c.count; i++) {
      const isMale = studentIndex % 2 === 1;
      const firstName = isMale
        ? FIRST_NAMES_MALE[(studentIndex * 3 + i) % FIRST_NAMES_MALE.length]
        : FIRST_NAMES_FEMALE[(studentIndex * 3 + i) % FIRST_NAMES_FEMALE.length];
      const lastName = LAST_NAMES[(studentIndex * 7 + i) % LAST_NAMES.length];
      const studentNumber = `LSS-2026-${String(studentIndex).padStart(4, '0')}`;

      // Deterministic Date of Birth matching stage & year level
      const birthYear = 2026 - Math.max(4, c.yearLevel + 6);
      const birthMonth = ((studentIndex * 7 + i) % 12) + 1;
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][birthMonth - 1];
      const birthDay = ((studentIndex * 13 + i) % daysInMonth) + 1;
      const dateOfBirth = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

      // Boarding designation (BRD-001):
      // Enforce hall bed capacity: Boys 162/180 (90.0%), Girls 156/170 (91.8%), Total 318/350 (90.9%)
      let studentType: 'DAY_SCHOLAR' | 'BOARDER' = 'DAY_SCHOLAR';
      let hallName: string | undefined = undefined;

      if (c.isSecondary) {
        const candidateForBoarding = (studentIndex * 7 + i) % 10 < 8;
        if (isMale && candidateForBoarding && assignedBoysBoarders < 162) {
          studentType = 'BOARDER';
          hallName = 'Kansanshi Boys Boarding Hall';
          assignedBoysBoarders++;
        } else if (!isMale && candidateForBoarding && assignedGirlsBoarders < 156) {
          studentType = 'BOARDER';
          hallName = 'Kalumbila Girls Boarding Hall';
          assignedGirlsBoarders++;
        } else if (isMale && assignedBoysBoarders < 162 && (781 - studentIndex) <= (162 - assignedBoysBoarders + 156 - assignedGirlsBoarders)) {
          studentType = 'BOARDER';
          hallName = 'Kansanshi Boys Boarding Hall';
          assignedBoysBoarders++;
        } else if (!isMale && assignedGirlsBoarders < 156 && (781 - studentIndex) <= (162 - assignedBoysBoarders + 156 - assignedGirlsBoarders)) {
          studentType = 'BOARDER';
          hallName = 'Kalumbila Girls Boarding Hall';
          assignedGirlsBoarders++;
        }
      }

      // Financial status & balances
      const dayFee = c.isSecondary ? 3800 : c.fee;
      const totalBilled = studentType === 'BOARDER' ? 10400 : dayFee;
      let totalPaid = 0;
      let balance = 0;
      let financialStatus: 'CLEARED' | 'PARTIAL' | 'ARREARS' | 'CHRONIC_ARREARS' = 'CLEARED';

      const paymentRoll = (studentIndex * 11 + i) % 10;
      if (paymentRoll < 7) {
        totalPaid = totalBilled;
        balance = 0;
        financialStatus = 'CLEARED';
      } else if (paymentRoll < 9) {
        totalPaid = Math.round(totalBilled * 0.6);
        balance = totalBilled - totalPaid;
        financialStatus = 'PARTIAL';
      } else {
        totalPaid = 0;
        balance = totalBilled;
        financialStatus = paymentRoll === 9 ? 'ARREARS' : 'CHRONIC_ARREARS';
      }

      const ageing = {
        current: financialStatus === 'PARTIAL' || financialStatus === 'ARREARS' ? balance : 0,
        days31to60: financialStatus === 'CHRONIC_ARREARS' ? Math.round(balance * 0.5) : 0,
        days61to90: financialStatus === 'CHRONIC_ARREARS' ? Math.round(balance * 0.3) : 0,
        over90days: financialStatus === 'CHRONIC_ARREARS' ? Math.round(balance * 0.2) : 0,
      };

      // Attendance state
      const attRoll = (studentIndex * 13 + i) % 100;
      let todayAttendance: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' = 'PRESENT';
      if (attRoll >= 97) todayAttendance = 'ABSENT';
      else if (attRoll >= 95) todayAttendance = 'LATE';
      else if (attRoll >= 94) todayAttendance = 'EXCUSED';

      const guardianTitle = GUARDIAN_TITLES[(studentIndex + i) % GUARDIAN_TITLES.length];
      const guardianLastName = LAST_NAMES[(studentIndex * 5 + i) % LAST_NAMES.length];
      const guardian = {
        name: `${guardianTitle} ${isMale ? 'Frank' : 'Joyce'} ${guardianLastName}`,
        phone: `+260 97${Math.floor(1000000 + ((studentIndex * 31415) % 8999999))}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@kansanshigroup.zm`,
      };

      // ----------------------------------------------------------------------
      // 1. Current Accommodation Details
      // ----------------------------------------------------------------------
      let currentAccommodation: CurrentAccommodation;
      const dormsMaleJunior = ['Dorm A (Chambishi)', 'Dorm B (Lumwana)'];
      const dormsMaleSenior = ['Dorm C (Kalumbila)', 'Dorm D (Kansanshi)', 'Senior Cubicle 04'];
      const dormsFemaleJunior = ['Dorm 1 (Jacaranda)', 'Dorm 2 (Baobab)'];
      const dormsFemaleSenior = ['Dorm 3 (Acacia)', 'Dorm 4 (Flame Tree)', 'Senior Cubicle 06'];

      if (studentType === 'BOARDER') {
        const isJunior = c.yearLevel <= 9;
        const bHouse: 'MOPANI_BOYS_HALL' | 'MUKWA_GIRLS_HALL' = isMale ? 'MOPANI_BOYS_HALL' : 'MUKWA_GIRLS_HALL';
        const wing = isMale
          ? isJunior ? 'Junior Wing' : 'Senior Wing'
          : isJunior ? 'North Wing' : 'South Wing';
        const dormList = isMale
          ? isJunior ? dormsMaleJunior : dormsMaleSenior
          : isJunior ? dormsFemaleJunior : dormsFemaleSenior;
        const room = dormList[(studentIndex + i) % dormList.length];
        const bedNum = `Bed-${String((studentIndex % 30) + 1).padStart(2, '0')} (${(studentIndex % 2 === 0 ? 'Lower' : 'Upper')} Bunk)`;
        const locker = `LCK-${isMale ? 'KBH' : 'KGH'}-${String((studentIndex % 30) + 1).padStart(2, '0')}`;
        const supervisor = isMale ? 'Mr. Kelvin Phiri (Housemaster)' : 'Mrs. Constance Kangwa (Senior Matron)';

        currentAccommodation = {
          isBoarder: true,
          boardingHouse: bHouse,
          boardingHouseLabel: isMale ? 'Kansanshi Boys Boarding Hall' : 'Kalumbila Girls Boarding Hall',
          wing,
          dormRoom: room,
          bedNumber: bedNum,
          lockerNumber: locker,
          supervisorName: supervisor,
          cleanlinessScore: '5/5 Star Cleanliness Verified',
          todayStatus: todayAttendance === 'EXCUSED' ? 'APPROVED_EXEAT' : todayAttendance === 'ABSENT' ? 'SICKBAY' : 'IN_CLASSES',
        };
      } else {
        currentAccommodation = {
          isBoarder: false,
          wing: 'Day Scholar Terminal',
          dormRoom: 'Locker Cluster B',
          bedNumber: 'N/A (Day Scholar)',
          lockerNumber: `DAY-LCK-${String(studentIndex).padStart(3, '0')}`,
          supervisorName: 'Mr. Patrick Zulu (Transport Marshall)',
          cleanlinessScore: 'Compliant',
          todayStatus: 'IN_CLASSES',
        };
      }

      // ----------------------------------------------------------------------
      // 2. Multi-Year Accommodation History
      // ----------------------------------------------------------------------
      const accommodationHistory: AccommodationHistoryRecord[] = [];
      if (studentType === 'BOARDER') {
        // Generate past terms based on yearLevel
        // e.g. Form 5 has 2024 (Form 3), 2025 (Form 4), 2026 (Form 5)
        const pastTerms = [
          { yr: '2024', t: 'Term 1', dorm: isMale ? 'Dorm A (Chambishi)' : 'Dorm 1 (Jacaranda)', bed: 'Bed-12', exeat: 1, score: '4.8/5.0' },
          { yr: '2024', t: 'Term 2', dorm: isMale ? 'Dorm A (Chambishi)' : 'Dorm 1 (Jacaranda)', bed: 'Bed-12', exeat: 0, score: '4.9/5.0' },
          { yr: '2024', t: 'Term 3', dorm: isMale ? 'Dorm B (Lumwana)' : 'Dorm 2 (Baobab)', bed: 'Bed-08', exeat: 2, score: '5.0/5.0' },
          { yr: '2025', t: 'Term 1', dorm: isMale ? 'Dorm C (Kalumbila)' : 'Dorm 3 (Acacia)', bed: 'Bed-04', exeat: 1, score: '5.0/5.0' },
          { yr: '2025', t: 'Term 2', dorm: isMale ? 'Dorm C (Kalumbila)' : 'Dorm 3 (Acacia)', bed: 'Bed-04', exeat: 0, score: '4.7/5.0' },
          { yr: '2025', t: 'Term 3', dorm: isMale ? 'Dorm D (Kansanshi)' : 'Dorm 4 (Flame Tree)', bed: 'Bed-15', exeat: 1, score: '5.0/5.0' },
          { yr: '2026', t: 'Term 1', dorm: currentAccommodation.dormRoom || '', bed: currentAccommodation.bedNumber || '', exeat: 1, score: '5.0/5.0' },
        ];

        // Slice history matching their years at school
        const termsToInclude = c.yearLevel >= 11 ? pastTerms : c.yearLevel >= 9 ? pastTerms.slice(3) : pastTerms.slice(6);

        termsToInclude.forEach((h, hIdx) => {
          accommodationHistory.push({
            id: `acc-hist-${studentIndex}-${hIdx}`,
            academicYear: h.yr,
            term: h.t,
            termLabel: `${h.yr} ${h.t}`,
            boardingHouse: isMale ? 'MOPANI_BOYS_HALL' : 'MUKWA_GIRLS_HALL',
            boardingHouseLabel: isMale ? 'Kansanshi Boys Boarding Hall' : 'Kalumbila Girls Boarding Hall',
            wing: isMale ? (c.yearLevel <= 9 ? 'Junior Wing' : 'Senior Wing') : (c.yearLevel <= 9 ? 'North Wing' : 'South Wing'),
            dormRoom: h.dorm,
            bedNumber: h.bed,
            lockerNumber: `LCK-${h.yr}-${String((studentIndex % 20) + 1).padStart(2, '0')}`,
            housemasterOrMatron: isMale ? 'Mr. Kelvin Phiri (Housemaster)' : 'Mrs. Constance Kangwa (Senior Matron)',
            inspectionScore: h.score,
            exeatsCount: h.exeat,
            status: h.yr === '2026' ? 'CHECKED_IN' : 'COMPLETED',
            curfewComplianceRate: '98.5% On-Time',
            remarks: 'Polite conduct, active in dorm study circles, prefect endorsed.',
          });
        });
      }

      // ----------------------------------------------------------------------
      // 3. Multi-Year Fee Payment History (2024, 2025, 2026)
      // ----------------------------------------------------------------------
      const feeHistory: HistoricalFeeRecord[] = [];
      const paymentMethods: Array<HistoricalFeeRecord['paymentMethod']> = [
        'Zanaco Billmaster',
        'Stanbic Bank Deposit',
        'Airtel Money Merchant',
        'MTN Mobile Money',
        'Absa Bank Transfer',
      ];

      const historicalTerms = [
        { yr: '2024', t: 'Term 1', bill: studentType === 'BOARDER' ? 9800 : 2500, paid: studentType === 'BOARDER' ? 9800 : 2500, date: '2024-01-14' },
        { yr: '2024', t: 'Term 2', bill: studentType === 'BOARDER' ? 9800 : 2500, paid: studentType === 'BOARDER' ? 9800 : 2500, date: '2024-05-10' },
        { yr: '2024', t: 'Term 3', bill: studentType === 'BOARDER' ? 9800 : 2500, paid: studentType === 'BOARDER' ? 9800 : 2500, date: '2024-09-08' },
        { yr: '2025', t: 'Term 1', bill: studentType === 'BOARDER' ? 10200 : 2700, paid: studentType === 'BOARDER' ? 10200 : 2700, date: '2025-01-12' },
        { yr: '2025', t: 'Term 2', bill: studentType === 'BOARDER' ? 10200 : 2700, paid: studentType === 'BOARDER' ? 10200 : 2700, date: '2025-05-11' },
        { yr: '2025', t: 'Term 3', bill: studentType === 'BOARDER' ? 10200 : 2700, paid: studentType === 'BOARDER' ? 10200 : 2700, date: '2025-09-07' },
        { yr: '2026', t: 'Term 1', bill: totalBilled, paid: totalPaid, date: '2026-01-15' },
      ];

      const feeTermsToInclude = c.yearLevel >= 11 ? historicalTerms : c.yearLevel >= 9 ? historicalTerms.slice(3) : historicalTerms.slice(6);

      feeTermsToInclude.forEach((f, fIdx) => {
        const bal = f.bill - f.paid;
        const pMethod = paymentMethods[(studentIndex + fIdx) % paymentMethods.length];
        feeHistory.push({
          id: `fee-hist-${studentIndex}-${fIdx}`,
          academicYear: f.yr,
          term: f.t,
          termLabel: `${f.yr} ${f.t}`,
          category: studentType === 'BOARDER' ? 'BOARDING_AND_TUITION' : 'DAY_TUITION',
          amountBilled: f.bill,
          amountPaid: f.paid,
          balanceRemaining: bal,
          status: bal === 0 ? 'CLEARED' : f.paid > 0 ? 'PARTIAL' : 'ARREARS',
          receiptNumber: `REC-SOL-${f.yr}-${String((studentIndex * 7 + fIdx) % 8999 + 1000)}`,
          paymentDate: f.date,
          paymentMethod: pMethod,
          referenceNumber: `TXN-${f.yr}-${String((studentIndex * 31 + fIdx) % 89999 + 10000)}`,
        });
      });

      // ----------------------------------------------------------------------
      // 4. Multi-Year Academic Performance History
      // ----------------------------------------------------------------------
      const performanceHistory: HistoricalAcademicRecord[] = [];
      const baseScore = 65 + ((studentIndex * 17) % 32); // Realistic grades 65% to 97%
      const acadYears = c.yearLevel >= 11 ? ['2024', '2025', '2026'] : c.yearLevel >= 9 ? ['2025', '2026'] : ['2026'];

      acadYears.forEach((yr, yIdx) => {
        const base = Math.min(96, Math.max(55, baseScore + yIdx * 2.5));
        const pos = `${Math.floor(((studentIndex * 3) % 15) + 1)} out of ${c.count}`;

        const getGrade = (s: number) => {
          if (s >= 85) return '1 (Distinction)';
          if (s >= 75) return '2 (Distinction)';
          if (s >= 70) return '3 (Merit)';
          if (s >= 65) return '4 (Merit)';
          if (s >= 60) return '5 (Credit)';
          if (s >= 55) return '6 (Credit)';
          if (s >= 50) return '7 (Satisfactory)';
          if (s >= 45) return '8 (Satisfactory)';
          return '9 (Unsatisfactory)';
        };

        let subjects: HistoricalAcademicSubject[] = [];

        if (c.yearLevel >= 10) {
          // Senior Secondary (Forms 3 - 5): Full 10 to 12 Subject Spectrum
          const isScienceStream = c.name.includes('Science') || (studentIndex % 2 === 0);
          const rawScores = [
            { name: 'Mathematics', code: 'MATH', delta: (studentIndex % 7) - 2, remark: 'Superb algebraic problem-solving and calculus comprehension.' },
            { name: 'English Language', code: 'ENG', delta: (studentIndex % 5) - 1, remark: 'Articulate essay writing, formal rhetoric, and comprehension.' },
            { name: 'Biology', code: 'BIO', delta: isScienceStream ? 4 : -2, remark: 'Thorough biological experimental write-ups and genetics grasp.' },
            { name: 'Chemistry', code: 'CHEM', delta: isScienceStream ? 3 : -3, remark: 'Strong stoichiometry, chemical titrations, and organic analysis.' },
            { name: 'Physics', code: 'PHY', delta: isScienceStream ? 2 : -4, remark: 'Solid mechanics, optics, and electrical circuit experimentation.' },
            { name: 'Computer Studies / ICT', code: 'COMP', delta: 5, remark: 'Advanced practical coding, algorithm design, and digital literacy.' },
            { name: 'Civic Education', code: 'CIV', delta: 1, remark: 'Exemplary understanding of constitution, civic duty, and human rights.' },
            { name: 'Geography', code: 'GEO', delta: 0, remark: 'Proficient topographical map reading and regional economic geostudies.' },
            { name: 'History', code: 'HIST', delta: -1, remark: 'In-depth analysis of African independence movements and world history.' },
            { name: 'Commerce & Accounts', code: 'COMM', delta: !isScienceStream ? 4 : 0, remark: 'Accurate double-entry bookkeeping and business operations acumen.' },
            { name: 'Religious Education (2046)', code: 'RE', delta: 3, remark: 'Thoughtful ethical discussions and moral philosophy appreciation.' },
            { name: 'Zambian Languages (Icibemba / Kiikaonde)', code: 'ZAM', delta: 2, remark: 'Fluent vernacular literature appreciation and cultural proverbs.' },
          ];

          subjects = rawScores.map((s) => {
            const finalScore = Math.max(40, Math.min(99, Math.round(base + s.delta)));
            return {
              subjectName: s.name,
              code: s.code,
              score: finalScore,
              eczGrade: getGrade(finalScore),
              teacherRemark: s.remark,
            };
          });
        } else if (c.isSecondary) {
          // Junior Secondary (Forms 1 - 2): Complete Junior ECZ Curriculum
          const rawJunior = [
            { name: 'Mathematics', code: 'MATH', delta: (studentIndex % 6) - 2, remark: 'Fluent algebraic geometry and arithmetic principles.' },
            { name: 'English Language', code: 'ENG', delta: (studentIndex % 4) - 1, remark: 'Strong grammar, creative writing, and comprehension.' },
            { name: 'Integrated Science', code: 'SCI', delta: 3, remark: 'Inquisitive scientific methodology and laboratory observations.' },
            { name: 'Computer Studies', code: 'COMP', delta: 4, remark: 'Hands-on computer hardware, word processing, and digital skills.' },
            { name: 'Social Studies', code: 'SOC', delta: 1, remark: 'Sound grasp of Zambian geography, history, and development.' },
            { name: 'Civic Education', code: 'CIV', delta: 0, remark: 'Active participation in civic principles and governance debates.' },
            { name: 'Business Studies', code: 'BUS', delta: 2, remark: 'Good understanding of basic commercial transactions and enterprise.' },
            { name: 'Religious Education', code: 'RE', delta: 2, remark: 'Respectful and engaged engagement in moral lessons.' },
            { name: 'Zambian Languages (Kiikaonde / Icibemba)', code: 'ZAM', delta: 1, remark: 'Commendable grammar and vocabulary in Zambian language.' },
            { name: 'Physical Education & Health', code: 'PE', delta: 5, remark: 'High physical stamina, teamwork, and athletic dedication.' },
          ];

          subjects = rawJunior.map((s) => {
            const finalScore = Math.max(42, Math.min(98, Math.round(base + s.delta)));
            return {
              subjectName: s.name,
              code: s.code,
              score: finalScore,
              eczGrade: getGrade(finalScore),
              teacherRemark: s.remark,
            };
          });
        } else {
          // Primary Education (Grades 1 - 7): Full Zambian Primary Curriculum
          const rawPrimary = [
            { name: 'Mathematics', code: 'MATH', delta: (studentIndex % 5) - 1, remark: 'Great number sense and foundational arithmetic mastery.' },
            { name: 'English Literacy & Language', code: 'ENG', delta: 2, remark: 'Expressive reading aloud and creative sentence structure.' },
            { name: 'Integrated Science', code: 'SCI', delta: 1, remark: 'Keen interest in living things and environment exploration.' },
            { name: 'Social Studies', code: 'SOC', delta: 0, remark: 'Good knowledge of community, culture, and family life.' },
            { name: 'Creative & Technology Studies (CTS)', code: 'CTS', delta: 4, remark: 'Artistic talent, craft work, and introductory technology skills.' },
            { name: 'Home Economics', code: 'HE', delta: 2, remark: 'Neat personal hygiene, nutrition, and food preparation.' },
            { name: 'Zambian Languages', code: 'ZAM', delta: 1, remark: 'Clear vernacular pronunciation and storytelling.' },
            { name: 'Physical Education', code: 'PE', delta: 5, remark: 'Energetic participation in drills and games.' },
          ];

          subjects = rawPrimary.map((s) => {
            const finalScore = Math.max(45, Math.min(98, Math.round(base + s.delta)));
            return {
              subjectName: s.name,
              code: s.code,
              score: finalScore,
              eczGrade: getGrade(finalScore),
              teacherRemark: s.remark,
            };
          });
        }

        const calculatedAvg = Number((subjects.reduce((sum, s) => sum + s.score, 0) / subjects.length).toFixed(1));
        const div: 'Division 1' | 'Division 2' | 'Division 3' =
          calculatedAvg >= 75 ? 'Division 1' : calculatedAvg >= 60 ? 'Division 2' : 'Division 3';

        performanceHistory.push({
          academicYear: yr,
          term: 'Term 1',
          termLabel: `${yr} Term 1`,
          className: c.name,
          averageScore: calculatedAvg,
          positionInClass: pos,
          eczDivision: div,
          conductGrade: calculatedAvg >= 80 ? 'A (Exemplary)' : 'B (Good)',
          principalRemarks: 'Approved for commendation. Displays moral and intellectual distinction.',
          subjects,
        });
      });

      // ----------------------------------------------------------------------
      // 5. Healthcare & Sickbay Profile
      // ----------------------------------------------------------------------
      const bloodGroups: Array<MedicalWelfareProfile['bloodGroup']> = ['O+', 'A+', 'B+', 'AB+', 'O-'];
      const medicalProfile: MedicalWelfareProfile = {
        bloodGroup: bloodGroups[(studentIndex * 3) % bloodGroups.length],
        allergies: studentIndex % 8 === 0 ? 'Penicillin allergy (Flagged on Sickbay Card)' : 'None known (Nil allergies)',
        chronicConditions: studentIndex % 15 === 0 ? 'Mild Exercise-Induced Asthma (Inhaler with Matron)' : 'None',
        sickbayVisitsCount: studentIndex % 5 === 0 ? 2 : 0,
        lastNurseCheckup: '2026-09-18 (Routine Term 1 Baseline Health Screen)',
        nurseNotes: 'Checked by Nurse Mary Mumba (RN). Vitals normal: BP 115/75, Pulse 72bpm, Dental clearance valid.',
        dietaryRequirements: studentType === 'BOARDER' ? 'Standard Boarding Dining Plan (Balanced Nutrition)' : 'Day Scholar Packed Lunch / Tuckshop',
      };

      learners.push({
        id: `lrn-${studentIndex}`,
        studentNumber,
        learnerName: `${firstName} ${lastName}`,
        gender: isMale ? 'MALE' : 'FEMALE',
        dateOfBirth,
        className: c.name,
        stage: c.stage,
        campusName: c.campus,
        studentType,
        hallName,
        totalBilled,
        totalPaid,
        balance,
        financialStatus,
        ageing,
        guardian,
        todayAttendance,
        invoiceCount: feeHistory.length,
        paymentCount: totalPaid > 0 ? (totalPaid === totalBilled ? 1 : 2) : 0,
        currentAccommodation,
        accommodationHistory,
        feeHistory,
        performanceHistory,
        medicalProfile,
      });

      studentIndex++;
      if (studentIndex > totalCount) break;
    }
    if (studentIndex > totalCount) break;
  }

  return learners;
}

// Full Spectrum of Seeded Learners across all grades (with Boarding & Day histories)
export const LEGACY_SOLWEZI_BALANCES = generateLegacyLearners(780);


// ----------------------------------------------------------------------------
// EXPENDITURES DATASET
// ----------------------------------------------------------------------------
export interface ExpenditureRecord {
  id: string;
  expenseNumber: string;
  expenseDate: string;
  fiscalPeriod: string;
  campusId: 'LSS-MSC' | 'LSS-URB' | 'LSS-MDC' | 'LSS-KBC' | 'CENTRAL';
  campusName: string;
  category:
    | 'FOOD_BOARDING_RATIONS'
    | 'UTILITIES_GENERATOR_POWER'
    | 'STAFF_SALARIES_ALLOWANCES'
    | 'FACILITY_MAINTENANCE'
    | 'LEARNING_LAB_SUPPLIES'
    | 'TRANSPORT_FUEL'
    | 'ADMIN_OPERATIONS';
  categoryLabel: string;
  title: string;
  description: string;
  vendorName: string;
  vendorTpin?: string;
  amountZMW: number;
  paymentMethod: 'BANK_EFT' | 'CHEQUE' | 'CORPORATE_CARD' | 'PETTY_CASH' | 'MOBILE_MONEY';
  referenceNumber: string;
  voucherNumber: string;
  initiatedBy: string;
  verifiedBy: string;
  approvedBy: string;
  status: 'DISBURSED' | 'PENDING_APPROVAL' | 'RECONCILED';
}

export const LEGACY_EXPENDITURES: ExpenditureRecord[] = [
  {
    id: 'exp-001',
    expenseNumber: 'EXP-SOL-2026-001',
    expenseDate: '2026-10-14',
    fiscalPeriod: '2026 Term 1',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    category: 'FOOD_BOARDING_RATIONS',
    categoryLabel: 'Food & Boarding Dining Provisions',
    title: 'Fortnightly Beef, Chicken & Dairy Supply for Dining Hall',
    description: 'Bulk delivery of 450kg prime beef, 300 broiler chickens, 80 crates eggs, 120L pasteurized milk for Kansanshi & Kalumbila boarding halls.',
    vendorName: 'Kansanshi Fresh Meat & Agri Supplies',
    vendorTpin: '1002391024',
    amountZMW: 48600.0,
    paymentMethod: 'BANK_EFT',
    referenceNumber: 'EFT-ZAN-984210',
    voucherNumber: 'PV-2026-0182',
    initiatedBy: 'Chef M. Banda (Head of Catering)',
    verifiedBy: 'Mr. C. Mulenga (Bursar)',
    approvedBy: 'Mr. E. Mwansa (Director)',
    status: 'DISBURSED',
  },
  {
    id: 'exp-002',
    expenseNumber: 'EXP-SOL-2026-002',
    expenseDate: '2026-10-12',
    fiscalPeriod: '2026 Term 1',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    category: 'UTILITIES_GENERATOR_POWER',
    categoryLabel: 'Generator Diesel & Power Utilities',
    title: '2,500L Low Sulphur Gasoil for 250kVA Standby Generator',
    description: 'Bulk fuel tanker delivery into Kansanshi Boarding on-site reserve tank to guarantee 24/7 electricity during mining grid load management.',
    vendorName: 'SGC Filling Station Solwezi (Opposite Campus)',
    vendorTpin: '1001849182',
    amountZMW: 72500.0,
    paymentMethod: 'BANK_EFT',
    referenceNumber: 'EFT-STB-440192',
    voucherNumber: 'PV-2026-0178',
    initiatedBy: 'Mr. K. Phiri (Facilities & Boarding Master)',
    verifiedBy: 'Mr. C. Mulenga (Bursar)',
    approvedBy: 'Mr. E. Mwansa (Director)',
    status: 'DISBURSED',
  },
  {
    id: 'exp-003',
    expenseNumber: 'EXP-SOL-2026-003',
    expenseDate: '2026-10-10',
    fiscalPeriod: '2026 Term 1',
    campusId: 'CENTRAL',
    campusName: 'All Campuses (Consolidated)',
    category: 'STAFF_SALARIES_ALLOWANCES',
    categoryLabel: 'Staff Salaries & Statutory Remittances',
    title: 'NAPSA & NHIMA Statutory Pension & Healthcare Remittances',
    description: 'Monthly mandatory statutory payroll contributions for 48 academic and support staff conforming to Zambian labor regulations.',
    vendorName: 'National Pension Scheme Authority (NAPSA) & NHIMA',
    vendorTpin: '1000000001',
    amountZMW: 68400.0,
    paymentMethod: 'BANK_EFT',
    referenceNumber: 'EFT-ZAN-771923',
    voucherNumber: 'PV-2026-0175',
    initiatedBy: 'Mr. D. Mwewa (Registrar)',
    verifiedBy: 'Mr. C. Mulenga (Bursar)',
    approvedBy: 'Mr. E. Mwansa (Director)',
    status: 'DISBURSED',
  },
  {
    id: 'exp-004',
    expenseNumber: 'EXP-SOL-2026-004',
    expenseDate: '2026-10-08',
    fiscalPeriod: '2026 Term 1',
    campusId: 'LSS-KBC',
    campusName: 'Kansanshi Boarding Campus',
    category: 'LEARNING_LAB_SUPPLIES',
    categoryLabel: 'Academic & Laboratory Materials',
    title: 'Cambridge & ECZ Chemistry/Biology Practical Reagents',
    description: 'Analytical grade hydrochloric acid, Benedicts solution, Bunsen burners, agar plates, microscope slides for Form 3 and Form 4 practicals.',
    vendorName: 'Solwezi Scientific & Educational Equipment Ltd',
    vendorTpin: '1003491820',
    amountZMW: 26400.0,
    paymentMethod: 'CHEQUE',
    referenceNumber: 'CHQ-004921',
    voucherNumber: 'PV-2026-0171',
    initiatedBy: 'Mr. P. Lungu (Head of Sciences)',
    verifiedBy: 'Mr. C. Mulenga (Bursar)',
    approvedBy: 'Mr. E. Mwansa (Director)',
    status: 'DISBURSED',
  },
  {
    id: 'exp-005',
    expenseNumber: 'EXP-SOL-2026-005',
    expenseDate: '2026-10-05',
    fiscalPeriod: '2026 Term 1',
    campusId: 'LSS-MDC',
    campusName: 'Mushitala Day Campus',
    category: 'FACILITY_MAINTENANCE',
    categoryLabel: 'Facility Repairs & Infrastructure Maintenance',
    title: 'Deep Borehole Solar Water Pump Servicing & Water Tank Chlorination',
    description: 'Routine maintenance of Mushitala 80-meter commercial borehole, replacement of solar pressure valves, and water sanitization tablets.',
    vendorName: 'North-Western Borehole & Irrigation Engineers',
    vendorTpin: '1008821940',
    amountZMW: 14800.0,
    paymentMethod: 'CHEQUE',
    referenceNumber: 'CHQ-004918',
    voucherNumber: 'PV-2026-0168',
    initiatedBy: 'Mr. B. Siame (Grounds Supervisor)',
    verifiedBy: 'Mr. C. Mulenga (Bursar)',
    approvedBy: 'Mr. E. Mwansa (Director)',
    status: 'DISBURSED',
  },
  {
    id: 'exp-006',
    expenseNumber: 'EXP-SOL-2026-006',
    expenseDate: '2026-10-02',
    fiscalPeriod: '2026 Term 1',
    campusId: 'CENTRAL',
    campusName: 'All Campuses (Consolidated)',
    category: 'TRANSPORT_FUEL',
    categoryLabel: 'Student Minibus Fleet & Logistics',
    title: 'Diesel Fuel Allowance for Inter-Campus Shuttle Bus (BAX 3192 ZM)',
    description: 'Monthly scheduled fuel coupons for student morning pickup in Kyawama, Golf Estate, and inter-campus academic shuttle.',
    vendorName: 'TotalEnergies Solwezi Town Terminal',
    vendorTpin: '1001092834',
    amountZMW: 18500.0,
    paymentMethod: 'CORPORATE_CARD',
    referenceNumber: 'POS-TOT-39182',
    voucherNumber: 'PV-2026-0164',
    initiatedBy: 'Mr. T. Kabwe (Senior Driver)',
    verifiedBy: 'Mr. C. Mulenga (Bursar)',
    approvedBy: 'Mr. E. Mwansa (Director)',
    status: 'DISBURSED',
  },
];

// ----------------------------------------------------------------------------
// LEAVE REQUESTS & APPRAISALS
// ----------------------------------------------------------------------------
export interface LegacyLeaveRecord {
  id: string;
  staffId: string;
  staffName: string;
  jobTitle: string;
  campusName: string;
  leaveType: 'ANNUAL' | 'SICK' | 'MATERNITY' | 'STUDY' | 'COMPASSIONATE';
  leaveTypeLabel: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  handoverTo: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  approvedBy?: string;
  appliedDate: string;
}

export const LEGACY_LEAVE_REQUESTS: LegacyLeaveRecord[] = [
  {
    id: 'lev-001',
    staffId: 'stf-006',
    staffName: 'Mr. Patrick Lungu',
    jobTitle: 'Head of Sciences',
    campusName: 'Kansanshi Boarding Campus',
    leaveType: 'STUDY',
    leaveTypeLabel: 'Study / Examination Leave',
    startDate: '2026-10-22',
    endDate: '2026-10-26',
    totalDays: 4,
    reason: 'Attending ECZ National Practical Examiners Workshop in Ndola.',
    handoverTo: 'Mrs. Martha Mwanza',
    status: 'APPROVED',
    approvedBy: 'Mr. E. Mwansa (Director)',
    appliedDate: '2026-10-10',
  },
  {
    id: 'lev-002',
    staffId: 'stf-022',
    staffName: 'Mrs. Agness Chanda',
    jobTitle: 'Lead ECE Practitioner',
    campusName: 'Mushitala Day Campus',
    leaveType: 'ANNUAL',
    leaveTypeLabel: 'Annual Leave',
    startDate: '2026-10-28',
    endDate: '2026-11-04',
    totalDays: 6,
    reason: 'Scheduled mid-term family respite leave.',
    handoverTo: 'Ms. Lubasi Sakala',
    status: 'PENDING',
    appliedDate: '2026-10-15',
  },
  {
    id: 'lev-003',
    staffId: 'stf-003',
    staffName: 'Mr. Kelvin Phiri',
    jobTitle: 'Senior Housemaster',
    campusName: 'Kansanshi Boarding Campus',
    leaveType: 'COMPASSIONATE',
    leaveTypeLabel: 'Compassionate Leave',
    startDate: '2026-10-06',
    endDate: '2026-10-09',
    totalDays: 3,
    reason: 'Bereavement in extended family in Kitwe.',
    handoverTo: 'Mr. Victor Chinyama (Relief Housemaster)',
    status: 'APPROVED',
    approvedBy: 'Mr. E. Mwansa (Director)',
    appliedDate: '2026-10-05',
  },
];

export interface LegacyEvaluationRecord {
  id: string;
  staffId: string;
  staffName: string;
  jobTitle: string;
  campusName: string;
  evaluationPeriod: string;
  evaluatorName: string;
  evaluatorRole: string;
  pedagogicalScore: number;
  classroomManagementScore: number;
  punctualityScore: number;
  professionalismScore: number;
  studentOutcomesScore: number;
  overallRating: 'OUTSTANDING' | 'COMMENDABLE' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';
  keyStrengths: string;
  developmentAreas: string;
  signedOff: boolean;
  conductedDate: string;
}

export const LEGACY_STAFF_EVALUATIONS: LegacyEvaluationRecord[] = [
  {
    id: 'eval-001',
    staffId: 'stf-006',
    staffName: 'Mr. Patrick Lungu',
    jobTitle: 'Head of Sciences',
    campusName: 'Kansanshi Boarding Campus',
    evaluationPeriod: '2026 Term 1 Mid-Term Appraisal',
    evaluatorName: 'Mr. Emmanuel Mwansa',
    evaluatorRole: 'School Director',
    pedagogicalScore: 4.8,
    classroomManagementScore: 4.6,
    punctualityScore: 4.9,
    professionalismScore: 4.7,
    studentOutcomesScore: 4.8,
    overallRating: 'OUTSTANDING',
    keyStrengths: 'Exceptional mastery of Cambridge AS-Level Chemistry practical sessions; high learner engagement in science club projects.',
    developmentAreas: 'Mentorship of junior lab assistants in chemical disposal protocols.',
    signedOff: true,
    conductedDate: '2026-10-11',
  },
  {
    id: 'eval-002',
    staffId: 'stf-004',
    staffName: 'Mrs. Beatrice Kalenga',
    jobTitle: 'Senior Boarding Matron',
    campusName: 'Kansanshi Boarding Campus',
    evaluationPeriod: '2026 Term 1 Mid-Term Appraisal',
    evaluatorName: 'Mr. Emmanuel Mwansa',
    evaluatorRole: 'School Director',
    pedagogicalScore: 4.5,
    classroomManagementScore: 4.9,
    punctualityScore: 5.0,
    professionalismScore: 4.8,
    studentOutcomesScore: 4.7,
    overallRating: 'OUTSTANDING',
    keyStrengths: 'Impeccable hygiene standards in Kalumbila Girls Boarding Hall; compassionate handling of student sickbay consultations.',
    developmentAreas: 'Coordination of weekend life-skills and peer mentoring workshops.',
    signedOff: true,
    conductedDate: '2026-10-12',
  },
  {
    id: 'eval-003',
    staffId: 'stf-022',
    staffName: 'Mrs. Agness Chanda',
    jobTitle: 'Lead ECE Practitioner',
    campusName: 'Mushitala Day Campus',
    evaluationPeriod: '2026 Term 1 Mid-Term Appraisal',
    evaluatorName: 'Mrs. Grace Tembo',
    evaluatorRole: 'Headteacher Mushitala',
    pedagogicalScore: 4.4,
    classroomManagementScore: 4.5,
    punctualityScore: 4.6,
    professionalismScore: 4.6,
    studentOutcomesScore: 4.5,
    overallRating: 'COMMENDABLE',
    keyStrengths: 'Creative learning stations; gentle phonics acceleration program showing 92% emergent reading by age 5.',
    developmentAreas: 'Increase digital parent observation notes via the EduSphere portal.',
    signedOff: true,
    conductedDate: '2026-10-14',
  },
];

export interface LegacyJobPosting {
  id: string;
  title: string;
  department: string;
  campusName: string;
  employmentType: string;
  vacancies: number;
  closingDate: string;
  status: 'ACTIVE' | 'INTERVIEWING' | 'FILLED';
  description: string;
  applicantsCount: number;
}

export const LEGACY_JOB_POSTINGS: LegacyJobPosting[] = [
  {
    id: 'job-001',
    title: 'Senior A-Level Physics & Additional Maths Teacher',
    department: 'Academic Secondary',
    campusName: 'Mushitala Campus (Near Kansanshi)',
    employmentType: 'Full-Time Permanent',
    vacancies: 1,
    closingDate: '2026-11-15',
    status: 'INTERVIEWING',
    description: 'Lead instruction for Cambridge IGCSE / A-Level Physics and ECZ Senior Secondary Additional Mathematics.',
    applicantsCount: 6,
  },
  {
    id: 'job-002',
    title: 'Assistant Boarding Matron (Night Supervisor)',
    department: 'Boarding Operations',
    campusName: 'Mushitala Campus (Near Kansanshi)',
    employmentType: 'Full-Time Shift',
    vacancies: 1,
    closingDate: '2026-11-20',
    status: 'ACTIVE',
    description: 'Support Kalumbila Girls Boarding Hall welfare, nightly roll-call supervision, and medical escort assistance.',
    applicantsCount: 9,
  },
  {
    id: 'job-003',
    title: 'Primary Computer Studies & Robotics Instructor',
    department: 'Academic Primary',
    campusName: 'Urban Campus (Solwezi Central)',
    employmentType: 'Full-Time Permanent',
    vacancies: 1,
    closingDate: '2026-11-30',
    status: 'ACTIVE',
    description: 'Introduce STEM robotics, Scratch coding, and digital literacy in our modern junior computer laboratory.',
    applicantsCount: 4,
  },
];

export interface LegacyApplicant {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  tczNumber: string;
  experienceYears: number;
  stage: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFER_EXTENDED' | 'HIRED';
  rating: number;
  appliedDate: string;
  interviewNotes?: string;
}

export const LEGACY_APPLICANTS: LegacyApplicant[] = [
  {
    id: 'app-001',
    jobId: 'job-001',
    jobTitle: 'Senior A-Level Physics & Additional Maths Teacher',
    fullName: 'Mr. Donald Chibwe',
    email: 'donald.chibwe@gmail.com',
    phone: '+260 976 339102',
    qualification: 'BSc Education with Physics & Mathematics (UNZA)',
    tczNumber: 'TCZ/2015/SEC/10928',
    experienceYears: 7,
    stage: 'INTERVIEW_SCHEDULED',
    rating: 4.8,
    appliedDate: '2026-10-02',
    interviewNotes: 'Strong demonstration lesson on electromagnetic induction. Panel scored 88/100.',
  },
  {
    id: 'app-002',
    jobId: 'job-001',
    jobTitle: 'Senior A-Level Physics & Additional Maths Teacher',
    fullName: 'Ms. Theresa Mutale',
    email: 'theresa.mutale@yahoo.com',
    phone: '+260 968 440192',
    qualification: 'BEd Secondary Sciences (Mulungushi Univ)',
    tczNumber: 'TCZ/2019/SEC/28491',
    experienceYears: 4,
    stage: 'SHORTLISTED',
    rating: 4.2,
    appliedDate: '2026-10-05',
  },
  {
    id: 'app-003',
    jobId: 'job-002',
    jobTitle: 'Assistant Boarding Matron (Night Supervisor)',
    fullName: 'Mrs. Constance Kangwa',
    email: 'constance.k@outlook.com',
    phone: '+260 975 119284',
    qualification: 'Certificate in Psychosocial Counseling & Child Safeguarding',
    tczNumber: 'NMCZ/EN/2016/4019',
    experienceYears: 5,
    stage: 'INTERVIEW_SCHEDULED',
    rating: 4.6,
    appliedDate: '2026-10-08',
  },
];

// ----------------------------------------------------------------------------
// BOARDING ROLL-CALLS & EXEATS
// ----------------------------------------------------------------------------
export interface BoardingRollCall {
  id: string;
  hallName: string;
  callType: 'MORNING_RISING' | 'AFTERNOON_DINING' | 'EVENING_PREP' | 'NIGHT_CURFEW';
  callTypeLabel: string;
  scheduledTime: string;
  date: string;
  totalBoarders: number;
  present: number;
  sickbay: number;
  authorizedExeat: number;
  unaccounted: number;
  wardenInCharge: string;
  status: 'ALL_ACCOUNTED' | 'DISCREPANCY_FLAGGED';
}

export const LEGACY_BOARDING_ROLLCALLS: BoardingRollCall[] = [
  {
    id: 'rc-001',
    hallName: 'Kansanshi Boys Boarding Hall',
    callType: 'EVENING_PREP',
    callTypeLabel: 'Evening Prep Roll-Call (18:30 - 20:30)',
    scheduledTime: '18:35',
    date: '2026-10-16',
    totalBoarders: 162,
    present: 156,
    sickbay: 1,
    authorizedExeat: 5,
    unaccounted: 0,
    wardenInCharge: 'Mr. Kelvin Phiri',
    status: 'ALL_ACCOUNTED',
  },
  {
    id: 'rc-002',
    hallName: 'Kalumbila Girls Boarding Hall',
    callType: 'EVENING_PREP',
    callTypeLabel: 'Evening Prep Roll-Call (18:30 - 20:30)',
    scheduledTime: '18:35',
    date: '2026-10-16',
    totalBoarders: 156,
    present: 150,
    sickbay: 2,
    authorizedExeat: 4,
    unaccounted: 0,
    wardenInCharge: 'Mrs. Beatrice Kalenga',
    status: 'ALL_ACCOUNTED',
  },
  {
    id: 'rc-003',
    hallName: 'Kansanshi Boys Boarding Hall',
    callType: 'NIGHT_CURFEW',
    callTypeLabel: 'Night Bed-Check & Lights Out (21:30)',
    scheduledTime: '21:30',
    date: '2026-10-16',
    totalBoarders: 162,
    present: 156,
    sickbay: 1,
    authorizedExeat: 5,
    unaccounted: 0,
    wardenInCharge: 'Mr. Kelvin Phiri',
    status: 'ALL_ACCOUNTED',
  },
  {
    id: 'rc-004',
    hallName: 'Kalumbila Girls Boarding Hall',
    callType: 'NIGHT_CURFEW',
    callTypeLabel: 'Night Bed-Check & Lights Out (21:30)',
    scheduledTime: '21:30',
    date: '2026-10-16',
    totalBoarders: 156,
    present: 150,
    sickbay: 2,
    authorizedExeat: 4,
    unaccounted: 0,
    wardenInCharge: 'Mrs. Beatrice Kalenga',
    status: 'ALL_ACCOUNTED',
  },
];

export interface BoardingExeatRecord {
  id: string;
  passNumber: string;
  studentNumber: string;
  studentName: string;
  hallName: string;
  grade: string;
  reason: string;
  destination: string;
  guardianName: string;
  guardianPhone: string;
  departTime: string;
  returnDeadline: string;
  securityGateStatus: 'DEPARTED' | 'RETURNED_ON_TIME' | 'OVERDUE' | 'AUTHORIZED_PENDING';
  approvedBy: string;
}

export const LEGACY_BOARDING_EXEATS: BoardingExeatRecord[] = [
  {
    id: 'ext-001',
    passNumber: 'EXT-2026-081',
    studentNumber: 'LSS-2026-0142',
    studentName: 'Chileshe Mulenga Jr.',
    hallName: 'Kansanshi Boys Boarding Hall',
    grade: 'Form 4 Green',
    reason: 'Dental appointment & family weekend in Kansanshi Golf Estate',
    destination: 'Plot 14, Golf Estate, Solwezi',
    guardianName: 'Eng. Chileshe Mulenga',
    guardianPhone: '+260 977 401928',
    departTime: '2026-10-16 15:30',
    returnDeadline: '2026-10-18 17:00',
    securityGateStatus: 'DEPARTED',
    approvedBy: 'Mr. K. Phiri (Boarding Master)',
  },
  {
    id: 'ext-002',
    passNumber: 'EXT-2026-082',
    studentNumber: 'LSS-2026-0189',
    studentName: 'Natasha Mwape',
    hallName: 'Kalumbila Girls Boarding Hall',
    grade: 'Form 3 Blue',
    reason: 'National Junior Chess Championship in Chingola',
    destination: 'Chingola Town Centre',
    guardianName: 'Mrs. Joyce Mwape',
    guardianPhone: '+260 966 883910',
    departTime: '2026-10-16 14:00',
    returnDeadline: '2026-10-18 18:00',
    securityGateStatus: 'DEPARTED',
    approvedBy: 'Mr. E. Mwansa (Principal)',
  },
  {
    id: 'ext-003',
    passNumber: 'EXT-2026-083',
    studentNumber: 'LSS-2026-0205',
    studentName: 'Blessing Kasonde',
    hallName: 'Kalumbila Girls Boarding Hall',
    grade: 'Form 2 Gold',
    reason: 'Family wedding anniversary in Solwezi Mess area',
    destination: 'Mess Residential, Solwezi',
    guardianName: 'Dr. Frank Kasonde',
    guardianPhone: '+260 971 223940',
    departTime: '2026-10-17 09:00',
    returnDeadline: '2026-10-18 16:30',
    securityGateStatus: 'DEPARTED',
    approvedBy: 'Mrs. B. Kalenga (Senior Matron)',
  },
];

// ----------------------------------------------------------------------------
// TRANSPARENT FEE TRANSACTIONS LEDGER (Detailed Inflows)
// ----------------------------------------------------------------------------
export interface FeeTransactionRecord {
  id: string;
  receiptNumber: string;
  paymentDate: string;
  studentNumber: string;
  learnerName: string;
  campusName: string;
  gradeName: string;
  studentType: 'BOARDER' | 'DAY_SCHOLAR';
  categoryPaid: 'BOARDING_AND_TUITION' | 'DAY_TUITION' | 'EXAM_FEE' | 'TRANSPORT';
  categoryLabel: string;
  amountZMW: number;
  paymentMethod: 'ZANACO_BILLPAY' | 'STANBIC_DEPOSIT' | 'MTN_MOMO' | 'AIRTEL_MONEY' | 'ABSA_TRANSFER' | 'CASH_OFFICE';
  paymentMethodLabel: string;
  referenceNumber: string;
  recordedBy: string;
  balanceRemainingZMW: number;
  invoiceNumber: string;
}

export const LEGACY_FEE_TRANSACTIONS: FeeTransactionRecord[] = [
  {
    id: 'txn-001',
    receiptNumber: 'REC-SOL-2026-00412',
    paymentDate: '2026-10-16 11:24',
    studentNumber: 'LSS-2026-0142',
    learnerName: 'Chileshe Mulenga Jr.',
    campusName: 'Kansanshi Boarding Campus',
    gradeName: 'Form 4 Green',
    studentType: 'BOARDER',
    categoryPaid: 'BOARDING_AND_TUITION',
    categoryLabel: 'Term 1 Boarding & Tuition Fee',
    amountZMW: 10400.0,
    paymentMethod: 'ZANACO_BILLPAY',
    paymentMethodLabel: 'Zanaco BillPay Direct',
    referenceNumber: 'ZNCO-SOL-882194',
    recordedBy: 'Mr. C. Mulenga (Bursar)',
    balanceRemainingZMW: 0.0,
    invoiceNumber: 'INV-2026-0089',
  },
  {
    id: 'txn-002',
    receiptNumber: 'REC-SOL-2026-00413',
    paymentDate: '2026-10-16 14:02',
    studentNumber: 'LSS-2026-0091',
    learnerName: 'Tinkhani Banda',
    campusName: 'Mushitala Day Campus',
    gradeName: 'Grade 5 Blue',
    studentType: 'DAY_SCHOLAR',
    categoryPaid: 'DAY_TUITION',
    categoryLabel: 'Term 1 Primary Day Tuition',
    amountZMW: 2800.0,
    paymentMethod: 'MTN_MOMO',
    paymentMethodLabel: 'MTN Mobile Money Merchant (0967...)',
    referenceNumber: 'MOMO-992019402',
    recordedBy: 'Mrs. J. Phiri (Cashier)',
    balanceRemainingZMW: 0.0,
    invoiceNumber: 'INV-2026-0145',
  },
  {
    id: 'txn-003',
    receiptNumber: 'REC-SOL-2026-00414',
    paymentDate: '2026-10-15 09:45',
    studentNumber: 'LSS-2026-0189',
    learnerName: 'Natasha Mwape',
    campusName: 'Kansanshi Boarding Campus',
    gradeName: 'Form 3 Blue',
    studentType: 'BOARDER',
    categoryPaid: 'BOARDING_AND_TUITION',
    categoryLabel: 'Term 1 Boarding Fee (Instalment 2 of 2)',
    amountZMW: 5200.0,
    paymentMethod: 'STANBIC_DEPOSIT',
    paymentMethodLabel: 'Stanbic Bank Deposit Slip',
    referenceNumber: 'STB-SOL-394019',
    recordedBy: 'Mr. C. Mulenga (Bursar)',
    balanceRemainingZMW: 0.0,
    invoiceNumber: 'INV-2026-0072',
  },
  {
    id: 'txn-004',
    receiptNumber: 'REC-SOL-2026-00415',
    paymentDate: '2026-10-15 15:10',
    studentNumber: 'LSS-2026-0034',
    learnerName: 'Kondwani Tembo',
    campusName: 'Mushitala Day Campus',
    gradeName: 'Grade 1 Gold',
    studentType: 'DAY_SCHOLAR',
    categoryPaid: 'DAY_TUITION',
    categoryLabel: 'Primary Tuition + Mini-Bus Transport Levy',
    amountZMW: 3750.0,
    paymentMethod: 'AIRTEL_MONEY',
    paymentMethodLabel: 'Airtel Money Paybill (0974...)',
    referenceNumber: 'ARTL-882194021',
    recordedBy: 'Mrs. J. Phiri (Cashier)',
    balanceRemainingZMW: 0.0,
    invoiceNumber: 'INV-2026-0199',
  },
  {
    id: 'txn-005',
    receiptNumber: 'REC-SOL-2026-00416',
    paymentDate: '2026-10-14 16:30',
    studentNumber: 'LSS-2026-0211',
    learnerName: 'Luyando Chiluba',
    campusName: 'Kansanshi Boarding Campus',
    gradeName: 'Form 5 Sciences',
    studentType: 'BOARDER',
    categoryPaid: 'EXAM_FEE',
    categoryLabel: 'ECZ Grade 12 National Exam Entry Fee',
    amountZMW: 1850.0,
    paymentMethod: 'ABSA_TRANSFER',
    paymentMethodLabel: 'Absa Bank Direct Transfer',
    referenceNumber: 'ABSA-FT-194029',
    recordedBy: 'Mr. C. Mulenga (Bursar)',
    balanceRemainingZMW: 0.0,
    invoiceNumber: 'INV-2026-0230',
  },
  {
    id: 'txn-006',
    receiptNumber: 'REC-SOL-2026-00417',
    paymentDate: '2026-10-14 10:15',
    studentNumber: 'LSS-2026-0056',
    learnerName: 'Taonga Zulu',
    campusName: 'Mushitala Day Campus',
    gradeName: 'Reception Stars',
    studentType: 'DAY_SCHOLAR',
    categoryPaid: 'DAY_TUITION',
    categoryLabel: 'ECE Term 1 Tuition & Learning Kit',
    amountZMW: 2600.0,
    paymentMethod: 'CASH_OFFICE',
    paymentMethodLabel: 'School Bursar Cash Office Receipt',
    referenceNumber: 'CSH-SOL-09214',
    recordedBy: 'Mrs. J. Phiri (Cashier)',
    balanceRemainingZMW: 0.0,
    invoiceNumber: 'INV-2026-0248',
  },
];
