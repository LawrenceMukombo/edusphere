// src/app/boarding/page.tsx
// Comprehensive Multi-Tenant Boarding Village, Roll-Call Console, Class Scorecards & Student 360° Dossiers
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Bed,
  Building2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  Award,
  Activity,
  Heart,
  User,
  Phone,
  Mail,
  Search,
  Download,
  Printer,
  TrendingUp,
  X,
  Layers,
  ChevronRight,
  Sparkles,
  Sun,
  Edit3,
  Plus,
  Save,
  RefreshCw,
  Check,
  ArrowRightLeft,
  UserCheck,
  Stethoscope,
  Droplets,
  MapPin,
  School,
  Trash2,
  ClipboardList,
  CheckSquare,
  AlertTriangle,
  BarChart3,
  Trophy,
  Users,
} from 'lucide-react';
import { useCampus } from '@/components/CampusContext';
import { EnterpriseTable, ColumnDef } from '@/components/EnterpriseTable';
import { LegacyLogo } from '@/components/LegacyLogo';
import { ModuleGate } from '@/components/ModuleGate';
import {
  generateLegacyLearners,
  LegacyLearnerBalance,
  AccommodationHistoryRecord,
  HistoricalFeeRecord,
  HistoricalAcademicRecord,
  HistoricalAcademicSubject,
  MedicalWelfareProfile,
  CurrentAccommodation,
} from '@/server/services/legacySchoolData';

// ----------------------------------------------------------------------------
// MULTI-TENANT BOARDING CONFIGURATION INTERFACE
// ----------------------------------------------------------------------------
export interface BoardingHallConfig {
  id: 'MOPANI_BOYS_HALL' | 'MUKWA_GIRLS_HALL' | string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'COED';
  capacity: number;
  seniorSupervisor: {
    title: string;
    name: string;
    phone: string;
  };
  assistantSupervisor?: {
    title: string;
    name: string;
  };
  wings: {
    juniorWing: { name: string; dorms: string[]; description: string };
    seniorWing: { name: string; dorms: string[]; description: string };
  };
  curfewTime: string;
  prepTime: string;
}

export interface SchoolBoardingVillageProfile {
  schoolId: string;
  schoolName: string;
  isBoardingEnabled: boolean;
  totalBedCapacity: number;
  standbyPower: {
    status: 'ONLINE' | 'STANDBY' | 'MAINTENANCE';
    generatorKva: string;
    fuelLevel: string;
    details: string;
  };
  halls: BoardingHallConfig[];
}

const LEGACY_BOARDING_PROFILE: SchoolBoardingVillageProfile = {
  schoolId: 'LEGACY_SOLWEZI',
  schoolName: 'Legacy School Solwezi',
  isBoardingEnabled: true,
  totalBedCapacity: 350,
  standbyPower: {
    status: 'ONLINE',
    generatorKva: '250kVA',
    fuelLevel: '91% Diesel • Normal',
    details: '24/7 ATS Standby linked via high-speed failover',
  },
  halls: [
    {
      id: 'MOPANI_BOYS_HALL',
      name: 'Kansanshi Boys Boarding Hall',
      gender: 'MALE',
      capacity: 180,
      seniorSupervisor: {
        title: 'Senior Housemaster',
        name: 'Mr. Kelvin Phiri',
        phone: '+260 967 288578',
      },
      assistantSupervisor: {
        title: 'Assistant Housemaster',
        name: 'Mr. Derrick Musonda',
      },
      wings: {
        juniorWing: {
          name: 'Junior Wing (Forms 1-2)',
          dorms: ['Dorm A (Chambishi)', 'Dorm B (Lumwana)'],
          description: 'Junior Boarders • Supervised Study & Quad',
        },
        seniorWing: {
          name: 'Senior Wing (Forms 3-5)',
          dorms: ['Dorm C (Kalumbila)', 'Dorm D (Kansanshi)', 'Senior Cubicle 04'],
          description: 'Senior Candidates • Private Prep Cubicles',
        },
      },
      curfewTime: '21:30',
      prepTime: '19:00 - 21:00 Daily',
    },
    {
      id: 'MUKWA_GIRLS_HALL',
      name: 'Kalumbila Girls Boarding Hall',
      gender: 'FEMALE',
      capacity: 170,
      seniorSupervisor: {
        title: 'Senior Matron',
        name: 'Mrs. Constance Kangwa',
        phone: '+260 975 119284',
      },
      assistantSupervisor: {
        title: 'Assistant Matron',
        name: 'Mrs. Eneless Tembo',
      },
      wings: {
        juniorWing: {
          name: 'North Wing (Forms 1-2)',
          dorms: ['Dorm 1 (Jacaranda)', 'Dorm 2 (Baobab)'],
          description: 'Junior Boarders • En-suite Common Rooms',
        },
        seniorWing: {
          name: 'South Wing (Forms 3-5)',
          dorms: ['Dorm 3 (Acacia)', 'Dorm 4 (Flame Tree)', 'Senior Cubicle 06'],
          description: 'Senior Candidates • Quiet Study Hall',
        },
      },
      curfewTime: '21:30',
      prepTime: '19:00 - 21:00 Daily',
    },
  ],
};

const STORAGE_KEY = 'edusphere_learners_v3';

// Standard Zambian ECZ Grade Evaluator
function calculateEczGrade(score: number): { grade: string; points: number } {
  if (score >= 85) return { grade: '1 (Distinction)', points: 1 };
  if (score >= 75) return { grade: '2 (Distinction)', points: 2 };
  if (score >= 70) return { grade: '3 (Merit)', points: 3 };
  if (score >= 65) return { grade: '4 (Merit)', points: 4 };
  if (score >= 60) return { grade: '5 (Credit)', points: 5 };
  if (score >= 55) return { grade: '6 (Credit)', points: 6 };
  if (score >= 50) return { grade: '7 (Satisfactory)', points: 7 };
  if (score >= 45) return { grade: '8 (Satisfactory)', points: 8 };
  return { grade: '9 (Unsatisfactory)', points: 9 };
}

function calculateDivision(avgScore: number): 'Division 1' | 'Division 2' | 'Division 3' {
  if (avgScore >= 75) return 'Division 1';
  if (avgScore >= 60) return 'Division 2';
  return 'Division 3';
}

export default function BoardingVillagePage() {
  const { selectedCampus, setSelectedCampus } = useCampus();

  // Multi-tenant configuration
  const [villageConfig] = useState<SchoolBoardingVillageProfile>(LEGACY_BOARDING_PROFILE);

  // Reactive state for learners - initialized synchronously to ensure data is never empty
  const [learnersList, setLearnersList] = useState<LegacyLearnerBalance[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored =
          localStorage.getItem('edusphere_learners_v3') ||
          localStorage.getItem('edusphere_learners_v2');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length >= 400) return parsed;
        }
      } catch (e) {}
    }
    return generateLegacyLearners(780);
  });

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'KANSANSHI' | 'KALUMBILA' | 'SCORECARDS' | 'ALL_STUDENTS'>('OVERVIEW');
  const [selectedStudent, setSelectedStudent] = useState<LegacyLearnerBalance | null>(null);
  const [dossierTab, setDossierTab] = useState<'ACADEMICS' | 'ACCOMMODATION' | 'FEES' | 'HEALTH' | 'LETTERHEAD'>('ACADEMICS');
  const [houseFilter, setHouseFilter] = useState<'ALL' | 'MOPANI_BOYS_HALL' | 'MUKWA_GIRLS_HALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BOARDER' | 'DAY_SCHOLAR'>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Roll-Call Session State
  const [isRollCallOpen, setIsRollCallOpen] = useState(false);
  const [rollCallSession, setRollCallSession] = useState<'PREP' | 'CURFEW' | 'MORNING'>('CURFEW');
  const [rollCallScope, setRollCallScope] = useState<'KANSANSHI' | 'KALUMBILA' | 'ALL'>('KANSANSHI');
  const [rollCallRecords, setRollCallRecords] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'SICKBAY' | 'EXCUSED'>>({});

  // CRUD Sub-Modals
  const [isEditBioOpen, setIsEditBioOpen] = useState(false);
  const [isEditAccommodationOpen, setIsEditAccommodationOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isEditAcademicOpen, setIsEditAcademicOpen] = useState(false);
  const [isEditMedicalOpen, setIsEditMedicalOpen] = useState(false);
  const [isAddSickbayOpen, setIsAddSickbayOpen] = useState(false);

  // Form State Containers
  const [bioForm, setBioForm] = useState({
    learnerName: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    className: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
  });

  const [accForm, setAccForm] = useState({
    studentType: 'BOARDER' as 'BOARDER' | 'DAY_SCHOLAR',
    boardingHouse: 'MOPANI_BOYS_HALL' as 'MOPANI_BOYS_HALL' | 'MUKWA_GIRLS_HALL',
    boardingHouseLabel: 'Kansanshi Boys Boarding Hall',
    wing: 'Junior Wing',
    dormRoom: 'Dorm A (Chambishi)',
    bedNumber: 'Bed-01 (Lower Bunk)',
    lockerNumber: 'LCK-KBH-01',
    supervisorName: 'Mr. Kelvin Phiri (Housemaster)',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 10400,
    paymentMethod: 'Zanaco Billmaster' as HistoricalFeeRecord['paymentMethod'],
    referenceNumber: '',
    termLabel: '2026 Term 1',
    category: 'BOARDING_AND_TUITION' as HistoricalFeeRecord['category'],
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const [academicForm, setAcademicForm] = useState({
    termLabel: '2026 Term 1',
    className: 'Form 1 Alpha',
    positionInClass: '4 out of 28',
    principalRemarks: 'Approved for commendation. Displays exceptional discipline and leadership in prep.',
    subjects: [] as HistoricalAcademicSubject[],
  });

  const [medicalForm, setMedicalForm] = useState<MedicalWelfareProfile>({
    bloodGroup: 'O+',
    allergies: 'None recorded',
    chronicConditions: 'None',
    sickbayVisitsCount: 0,
    lastNurseCheckup: '2026-02-10',
    nurseNotes: 'General vitals normal. Fit for sports and active study.',
    dietaryRequirements: 'Regular Boarding Village Balanced Diet',
  });

  const [sickbayVisitForm, setSickbayVisitForm] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    complaint: 'Mild headache after sports',
    treatment: 'Paracetamol 500mg, 2 hours observation in sickbay',
    nurseName: 'Mrs. Mary Mumba, RN',
    disposition: 'Discharged to Dormitory' as 'Discharged to Dormitory' | 'Admitted to Sickbay' | 'Referred to General Hospital',
  });

  // Load Dataset from Storage or Baseline Generator
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 400) {
          setLearnersList(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Initializing fresh baseline...');
    }

    const baseline = generateLegacyLearners(780);
    setLearnersList(baseline);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(baseline));
    } catch (e) {}
  }, []);

  const saveLearnersState = (updatedList: LegacyLearnerBalance[], updatedStudent?: LegacyLearnerBalance) => {
    setLearnersList(updatedList);
    if (updatedStudent) {
      setSelectedStudent(updatedStudent);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {}
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResetBaseline = () => {
    if (confirm('Reset all 780 student dossiers and academic records to baseline?')) {
      const fresh = generateLegacyLearners(780);
      saveLearnersState(fresh);
      setSelectedStudent(null);
      showNotification('780 student records reset to system baseline.');
    }
  };

  // --------------------------------------------------------------------------
  // INSTITUTIONAL BOARDING POPULATION (Always accurately reflects Boarding Village)
  // --------------------------------------------------------------------------
  const allBoarders = useMemo(() => {
    return learnersList.filter((l) => l.studentType === 'BOARDER');
  }, [learnersList]);

  const allBoysBoarders = useMemo(() => {
    return allBoarders.filter(
      (l) =>
        l.gender === 'MALE' ||
        l.currentAccommodation?.boardingHouse === 'MOPANI_BOYS_HALL' ||
        (l.hallName && l.hallName.toLowerCase().includes('kansanshi'))
    );
  }, [allBoarders]);

  const allGirlsBoarders = useMemo(() => {
    return allBoarders.filter(
      (l) =>
        l.gender === 'FEMALE' ||
        l.currentAccommodation?.boardingHouse === 'MUKWA_GIRLS_HALL' ||
        (l.hallName && l.hallName.toLowerCase().includes('kalumbila'))
    );
  }, [allBoarders]);

  // Campus Pool for Directory & Class Scorecards
  const [directoryScope, setDirectoryScope] = useState<'CURRENT' | 'ALL' | 'MUSHITALA' | 'URBAN'>('CURRENT');

  const campusPool = useMemo(() => {
    const scope = directoryScope === 'CURRENT' ? selectedCampus : directoryScope;
    if (scope === 'MUSHITALA' || scope === 'KANSANSHI') {
      return learnersList.filter((l) => l.campusName.includes('Mushitala') || l.campusName.includes('Kansanshi'));
    }
    if (scope === 'URBAN') {
      return learnersList.filter((l) => l.campusName.includes('Urban'));
    }
    return learnersList; // Consolidated View (780 total)
  }, [learnersList, selectedCampus, directoryScope]);

  const campusBoarders = useMemo(() => {
    return campusPool.filter((l) => l.studentType === 'BOARDER');
  }, [campusPool]);

  // --------------------------------------------------------------------------
  // CLASS SCORECARDS (Aggregated Analytics to show Best Performing Classes)
  // --------------------------------------------------------------------------
  const classScorecards = useMemo(() => {
    const classMap = new Map<string, LegacyLearnerBalance[]>();
    campusPool.forEach((s) => {
      const arr = classMap.get(s.className) || [];
      arr.push(s);
      classMap.set(s.className, arr);
    });

    const scorecards = Array.from(classMap.entries()).map(([className, students]) => {
      let totalAvg = 0;
      let passCount = 0;
      let div1Count = 0;
      let totalDistinctions = 0;
      let bestStudent: { name: string; score: number } = { name: '', score: 0 };

      students.forEach((s) => {
        const latest = s.performanceHistory?.[0] || s.performanceHistory?.[s.performanceHistory.length - 1];
        const score = latest?.averageScore || 0;
        totalAvg += score;
        if (score >= 50) passCount++;
        if (latest?.eczDivision === 'Division 1' || score >= 75) div1Count++;

        latest?.subjects?.forEach((sub) => {
          if (sub.score >= 75) totalDistinctions++;
        });

        if (score > bestStudent.score) {
          bestStudent = { name: s.learnerName, score };
        }
      });

      const count = students.length || 1;
      const classAverage = Number((totalAvg / count).toFixed(1));
      const passRate = Number(((passCount / count) * 100).toFixed(1));
      const div1Rate = Number(((div1Count / count) * 100).toFixed(1));

      return {
        className,
        studentCount: count,
        classAverage,
        passRate,
        div1Rate,
        totalDistinctions,
        bestStudent,
        stage: students[0]?.stage || 'SECONDARY',
      };
    });

    // Rank from highest average score to lowest
    return scorecards.sort((a, b) => b.classAverage - a.classAverage);
  }, [campusPool]);

  // --------------------------------------------------------------------------
  // DIRECTORY LIST
  // --------------------------------------------------------------------------
  const displayedStudents = useMemo(() => {
    // Dedicated Hall Views ALWAYS return the resident boarders of that hall
    if (activeTab === 'KANSANSHI') {
      return allBoysBoarders;
    }
    if (activeTab === 'KALUMBILA') {
      return allGirlsBoarders;
    }

    let list = campusPool;

    if (typeFilter !== 'ALL') {
      list = list.filter((l) => l.studentType === typeFilter);
    }

    if (classFilter !== 'ALL') {
      list = list.filter((l) => l.className === classFilter);
    }

    if (houseFilter === 'MOPANI_BOYS_HALL') {
      return allBoysBoarders;
    } else if (houseFilter === 'MUKWA_GIRLS_HALL') {
      return allGirlsBoarders;
    }

    return list;
  }, [campusPool, activeTab, allBoysBoarders, allGirlsBoarders, typeFilter, classFilter, houseFilter]);

  // --------------------------------------------------------------------------
  // ROLL-CALL LOGIC
  // --------------------------------------------------------------------------
  const rollCallPool = useMemo(() => {
    if (rollCallScope === 'KANSANSHI') return allBoysBoarders;
    if (rollCallScope === 'KALUMBILA') return allGirlsBoarders;
    return allBoarders;
  }, [rollCallScope, allBoysBoarders, allGirlsBoarders, allBoarders]);

  const openRollCallModal = () => {
    const initial: Record<string, 'PRESENT' | 'ABSENT' | 'SICKBAY' | 'EXCUSED'> = {};
    rollCallPool.forEach((s) => {
      initial[s.id] =
        s.currentAccommodation?.todayStatus === 'SICKBAY'
          ? 'SICKBAY'
          : s.todayAttendance === 'LATE'
          ? 'PRESENT'
          : s.todayAttendance || 'PRESENT';
    });
    setRollCallRecords(initial);
    setIsRollCallOpen(true);
  };

  const handleMarkAllRollCall = (status: 'PRESENT' | 'ABSENT' | 'SICKBAY' | 'EXCUSED') => {
    const updated: Record<string, 'PRESENT' | 'ABSENT' | 'SICKBAY' | 'EXCUSED'> = {};
    rollCallPool.forEach((s) => {
      updated[s.id] = status;
    });
    setRollCallRecords(updated);
  };

  const handleSaveRollCall = () => {
    const updatedList: LegacyLearnerBalance[] = learnersList.map((l) => {
      if (rollCallRecords[l.id]) {
        const att = rollCallRecords[l.id];
        const studentAttendance: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' =
          att === 'SICKBAY' ? 'EXCUSED' : att;
        const boardingStatus: CurrentAccommodation['todayStatus'] =
          att === 'PRESENT'
            ? 'IN_DORM'
            : att === 'SICKBAY'
            ? 'SICKBAY'
            : att === 'EXCUSED'
            ? 'APPROVED_EXEAT'
            : 'IN_CLASSES';

        return {
          ...l,
          todayAttendance: studentAttendance,
          currentAccommodation: {
            ...l.currentAccommodation,
            todayStatus: boardingStatus,
          },
        };
      }
      return l;
    });

    saveLearnersState(updatedList);
    setIsRollCallOpen(false);

    const presentCount = Object.values(rollCallRecords).filter((v) => v === 'PRESENT').length;
    const total = rollCallPool.length;
    showNotification(
      `Roll-call verified for ${rollCallScope === 'KANSANSHI' ? 'Kansanshi Boys Hall' : rollCallScope === 'KALUMBILA' ? 'Kalumbila Girls Hall' : 'Boarding Village'}: ${presentCount}/${total} Present.`
    );
  };

  // --------------------------------------------------------------------------
  // CRUD EDIT HANDLERS
  // --------------------------------------------------------------------------
  const openBioModal = (student: LegacyLearnerBalance) => {
    setBioForm({
      learnerName: student.learnerName,
      gender: student.gender,
      className: student.className,
      guardianName: student.guardian.name,
      guardianPhone: student.guardian.phone,
      guardianEmail: student.guardian.email,
    });
    setIsEditBioOpen(true);
  };

  const handleSaveBio = () => {
    if (!selectedStudent) return;
    const updatedStudent: LegacyLearnerBalance = {
      ...selectedStudent,
      learnerName: bioForm.learnerName,
      gender: bioForm.gender,
      className: bioForm.className,
      guardian: {
        ...selectedStudent.guardian,
        name: bioForm.guardianName,
        phone: bioForm.guardianPhone,
        email: bioForm.guardianEmail,
      },
    };
    const updatedList = learnersList.map((l) => (l.id === selectedStudent.id ? updatedStudent : l));
    saveLearnersState(updatedList, updatedStudent);
    setIsEditBioOpen(false);
    showNotification(`Student details updated for ${bioForm.learnerName}`);
  };

  const openAccommodationModal = (student: LegacyLearnerBalance) => {
    const bHouse =
      student.currentAccommodation?.boardingHouse ||
      (student.gender === 'MALE' ? 'MOPANI_BOYS_HALL' : 'MUKWA_GIRLS_HALL');

    setAccForm({
      studentType: student.studentType,
      boardingHouse: bHouse,
      boardingHouseLabel:
        student.currentAccommodation?.boardingHouseLabel ||
        (student.gender === 'MALE' ? 'Kansanshi Boys Boarding Hall' : 'Kalumbila Girls Boarding Hall'),
      wing: student.currentAccommodation?.wing || (student.gender === 'MALE' ? 'Junior Wing' : 'North Wing'),
      dormRoom: student.currentAccommodation?.dormRoom || (student.gender === 'MALE' ? 'Dorm A (Chambishi)' : 'Dorm 1 (Jacaranda)'),
      bedNumber: student.currentAccommodation?.bedNumber || 'Bed-01 (Lower Bunk)',
      lockerNumber: student.currentAccommodation?.lockerNumber || (student.gender === 'MALE' ? 'LCK-KBH-01' : 'LCK-KGH-01'),
      supervisorName:
        student.currentAccommodation?.supervisorName ||
        (student.gender === 'MALE' ? 'Mr. Kelvin Phiri (Housemaster)' : 'Mrs. Constance Kangwa (Senior Matron)'),
    });
    setIsEditAccommodationOpen(true);
  };

  const handleSaveAccommodation = () => {
    if (!selectedStudent) return;
    const isNowBoarder = accForm.studentType === 'BOARDER';

    const newAccommodation: CurrentAccommodation = isNowBoarder
      ? {
          isBoarder: true,
          boardingHouse: accForm.boardingHouse,
          boardingHouseLabel:
            accForm.boardingHouse === 'MOPANI_BOYS_HALL'
              ? 'Kansanshi Boys Boarding Hall'
              : 'Kalumbila Girls Boarding Hall',
          wing: accForm.wing,
          dormRoom: accForm.dormRoom,
          bedNumber: accForm.bedNumber,
          lockerNumber: accForm.lockerNumber,
          supervisorName: accForm.supervisorName,
          cleanlinessScore: '5/5 Star Cleanliness Verified',
          todayStatus: 'IN_CLASSES',
        }
      : {
          isBoarder: false,
          wing: 'Day Scholar Terminal',
          dormRoom: 'Locker Cluster B',
          bedNumber: 'N/A (Day Scholar)',
          lockerNumber: `DAY-${accForm.lockerNumber.replace('LCK-', '')}`,
          supervisorName: 'Mr. Patrick Zulu (Transport Marshall)',
          cleanlinessScore: 'Compliant',
          todayStatus: 'IN_CLASSES',
        };

    const newFee = isNowBoarder ? 10400 : 3800;
    const newPaid = selectedStudent.totalPaid > newFee ? newFee : selectedStudent.totalPaid;
    const newBalance = Math.max(0, newFee - newPaid);
    const newStatus: LegacyLearnerBalance['financialStatus'] =
      newBalance === 0 ? 'CLEARED' : newPaid > 0 ? 'PARTIAL' : 'ARREARS';

    const updatedStudent: LegacyLearnerBalance = {
      ...selectedStudent,
      studentType: accForm.studentType,
      hallName: isNowBoarder ? newAccommodation.boardingHouseLabel : undefined,
      currentAccommodation: newAccommodation,
      totalBilled: newFee,
      totalPaid: newPaid,
      balance: newBalance,
      financialStatus: newStatus,
    };

    const updatedList = learnersList.map((l) => (l.id === selectedStudent.id ? updatedStudent : l));
    saveLearnersState(updatedList, updatedStudent);
    setIsEditAccommodationOpen(false);
    showNotification(
      `Accommodation updated: ${isNowBoarder ? `${newAccommodation.boardingHouseLabel} - ${newAccommodation.dormRoom}` : 'Allocated to Day Scholar'}`
    );
  };

  const openPaymentModal = (student: LegacyLearnerBalance) => {
    setPaymentForm({
      amount: student.balance > 0 ? student.balance : 10400,
      paymentMethod: 'Zanaco Billmaster',
      referenceNumber: `ZAN-${Math.floor(1000000 + Math.random() * 9000000)}`,
      termLabel: '2026 Term 1',
      category: student.studentType === 'BOARDER' ? 'BOARDING_AND_TUITION' : 'DAY_TUITION',
      paymentDate: new Date().toISOString().split('T')[0],
    });
    setIsRecordPaymentOpen(true);
  };

  const handleSavePayment = () => {
    if (!selectedStudent) return;
    const paidAmount = Number(paymentForm.amount);
    if (isNaN(paidAmount) || paidAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const newTotalPaid = selectedStudent.totalPaid + paidAmount;
    const newBalance = Math.max(0, selectedStudent.totalBilled - newTotalPaid);
    const newStatus: LegacyLearnerBalance['financialStatus'] =
      newBalance === 0 ? 'CLEARED' : newTotalPaid > 0 ? 'PARTIAL' : 'ARREARS';

    const newFeeRecord: HistoricalFeeRecord = {
      id: `fee-${Date.now()}`,
      academicYear: '2026',
      term: 'Term 1',
      termLabel: paymentForm.termLabel,
      category: paymentForm.category,
      amountBilled: selectedStudent.totalBilled,
      amountPaid: paidAmount,
      balanceRemaining: newBalance,
      status: newBalance === 0 ? 'CLEARED' : 'PARTIAL',
      receiptNumber: paymentForm.referenceNumber || `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentDate: paymentForm.paymentDate,
      paymentMethod: paymentForm.paymentMethod,
      referenceNumber: paymentForm.referenceNumber,
    };

    const updatedStudent: LegacyLearnerBalance = {
      ...selectedStudent,
      totalPaid: newTotalPaid,
      balance: newBalance,
      financialStatus: newStatus,
      feeHistory: [newFeeRecord, ...(selectedStudent.feeHistory || [])],
    };

    const updatedList = learnersList.map((l) => (l.id === selectedStudent.id ? updatedStudent : l));
    saveLearnersState(updatedList, updatedStudent);
    setIsRecordPaymentOpen(false);
    showNotification(`Payment of K${paidAmount.toLocaleString()} recorded. Balance is now K${newBalance.toLocaleString()}.`);
  };

  const openAcademicModal = (student: LegacyLearnerBalance) => {
    const latest = student.performanceHistory?.[0] || {
      termLabel: '2026 Term 1',
      className: student.className,
      positionInClass: '4 out of 28',
      principalRemarks: 'Approved for commendation. Displays exceptional discipline and leadership.',
      subjects: [],
    };

    setAcademicForm({
      termLabel: latest.termLabel,
      className: student.className,
      positionInClass: latest.positionInClass || '5 out of 28',
      principalRemarks: latest.principalRemarks || 'Approved for commendation by School Directorate.',
      subjects: JSON.parse(JSON.stringify(latest.subjects || [])),
    });
    setIsEditAcademicOpen(true);
  };

  const handleUpdateSubjectScore = (index: number, newScore: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(newScore) ? 0 : newScore));
    const gradeInfo = calculateEczGrade(clamped);
    const updatedSubjects = [...academicForm.subjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      score: clamped,
      eczGrade: gradeInfo.grade,
    };
    setAcademicForm({ ...academicForm, subjects: updatedSubjects });
  };

  const handleUpdateSubjectRemark = (index: number, newRemark: string) => {
    const updatedSubjects = [...academicForm.subjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      teacherRemark: newRemark,
    };
    setAcademicForm({ ...academicForm, subjects: updatedSubjects });
  };

  const handleSaveAcademic = () => {
    if (!selectedStudent) return;
    const subs = academicForm.subjects;
    const avg =
      subs.length > 0 ? Number((subs.reduce((acc, curr) => acc + curr.score, 0) / subs.length).toFixed(1)) : 75;
    const div = calculateDivision(avg);

    const updatedTermRecord: HistoricalAcademicRecord = {
      academicYear: academicForm.termLabel.split(' ')[0] || '2026',
      term: academicForm.termLabel.split(' ')[1] || 'Term 1',
      termLabel: academicForm.termLabel,
      className: academicForm.className,
      averageScore: avg,
      positionInClass: academicForm.positionInClass,
      eczDivision: div,
      conductGrade: avg >= 80 ? 'A (Exemplary)' : 'B (Good)',
      principalRemarks: academicForm.principalRemarks,
      subjects: subs,
    };

    const currentHistory = selectedStudent.performanceHistory || [];
    const existingIdx = currentHistory.findIndex((h) => h.termLabel === academicForm.termLabel);
    let newHistory: HistoricalAcademicRecord[];
    if (existingIdx >= 0) {
      newHistory = [...currentHistory];
      newHistory[existingIdx] = updatedTermRecord;
    } else {
      newHistory = [updatedTermRecord, ...currentHistory];
    }

    const updatedStudent: LegacyLearnerBalance = {
      ...selectedStudent,
      performanceHistory: newHistory,
    };

    const updatedList = learnersList.map((l) => (l.id === selectedStudent.id ? updatedStudent : l));
    saveLearnersState(updatedList, updatedStudent);
    setIsEditAcademicOpen(false);
    showNotification(`Academic results saved: Average ${avg}% (${div}), Position: ${academicForm.positionInClass}`);
  };

  const openMedicalModal = (student: LegacyLearnerBalance) => {
    setMedicalForm({
      bloodGroup: student.medicalProfile?.bloodGroup || 'O+',
      allergies: student.medicalProfile?.allergies || 'None recorded',
      chronicConditions: student.medicalProfile?.chronicConditions || 'None',
      sickbayVisitsCount: student.medicalProfile?.sickbayVisitsCount || 0,
      lastNurseCheckup: student.medicalProfile?.lastNurseCheckup || new Date().toISOString().split('T')[0],
      nurseNotes: student.medicalProfile?.nurseNotes || 'General vitals normal. Supervised by Nurse Mary Mumba.',
      dietaryRequirements: student.medicalProfile?.dietaryRequirements || 'Standard Boarding Nutrition',
    });
    setIsEditMedicalOpen(true);
  };

  const handleSaveMedical = () => {
    if (!selectedStudent) return;
    const updatedStudent: LegacyLearnerBalance = {
      ...selectedStudent,
      medicalProfile: medicalForm,
    };
    const updatedList = learnersList.map((l) => (l.id === selectedStudent.id ? updatedStudent : l));
    saveLearnersState(updatedList, updatedStudent);
    setIsEditMedicalOpen(false);
    showNotification('Healthcare & Welfare profile updated.');
  };

  const handleSaveSickbayVisit = () => {
    if (!selectedStudent) return;
    const prevNotes = selectedStudent.medicalProfile?.nurseNotes || '';
    const newCount = (selectedStudent.medicalProfile?.sickbayVisitsCount || 0) + 1;
    const newNote = `[${sickbayVisitForm.visitDate}] ${sickbayVisitForm.complaint}. Treatment: ${sickbayVisitForm.treatment}. Disposition: ${sickbayVisitForm.disposition}. Prev: ${prevNotes}`;

    const updatedProfile: MedicalWelfareProfile = {
      ...(selectedStudent.medicalProfile || {
        bloodGroup: 'O+',
        allergies: 'None',
        chronicConditions: 'None',
        dietaryRequirements: 'Standard',
      }),
      sickbayVisitsCount: newCount,
      lastNurseCheckup: sickbayVisitForm.visitDate,
      nurseNotes: newNote,
    };

    const updatedStudent: LegacyLearnerBalance = {
      ...selectedStudent,
      medicalProfile: updatedProfile,
    };

    const updatedList = learnersList.map((l) => (l.id === selectedStudent.id ? updatedStudent : l));
    saveLearnersState(updatedList, updatedStudent);
    setIsAddSickbayOpen(false);
    showNotification(`Sickbay visit recorded. Total visits: ${newCount}`);
  };

  // Enterprise Table Columns
  const columns: ColumnDef<LegacyLearnerBalance>[] = [
    {
      key: 'studentNumber',
      header: 'Student ID',
      accessor: (row) => (
        <button
          onClick={() => setSelectedStudent(row)}
          className="font-mono text-xs font-bold text-blue-900 hover:text-blue-700 underline text-left"
        >
          {row.studentNumber}
        </button>
      ),
      sortable: true,
    },
    {
      key: 'learnerName',
      header: 'Learner Name',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{row.learnerName}</span>
          <span className="text-[11px] text-slate-500">
            {row.gender} • {row.className}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'studentType',
      header: 'Cadre / Type',
      accessor: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
            row.studentType === 'BOARDER'
              ? 'bg-purple-100 text-purple-800 border border-purple-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
        >
          {row.studentType === 'BOARDER' ? 'Full Boarder' : 'Day Scholar'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'hallName',
      header: 'Boarding House & Dorm',
      accessor: (row) => {
        if (row.studentType !== 'BOARDER') {
          return <span className="text-xs text-slate-400 italic">Day Scholar (Minibus)</span>;
        }
        return (
          <div className="flex flex-col text-xs">
            <span className="font-bold text-slate-800">
              {row.currentAccommodation?.boardingHouseLabel || row.hallName || 'Unassigned'}
            </span>
            <span className="text-slate-500 font-medium">
              {row.currentAccommodation?.dormRoom || 'Dormitory'} • {row.currentAccommodation?.bedNumber || 'Bed Assigned'}
            </span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'financialStatus',
      header: 'Fees Ledger Balance',
      accessor: (row) => (
        <div className="flex flex-col text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-slate-900">K{row.balance.toLocaleString()}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                row.financialStatus === 'CLEARED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : row.financialStatus === 'PARTIAL'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {row.financialStatus}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Paid K{row.totalPaid.toLocaleString()} of K{row.totalBilled.toLocaleString()}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'academicScore',
      header: 'Performance Trend',
      accessor: (row) => {
        const latest = row.performanceHistory?.[0] || row.performanceHistory?.[row.performanceHistory.length - 1];
        if (!latest) return <span className="text-xs text-slate-400">N/A</span>;
        return (
          <div className="flex flex-col text-xs">
            <div className="flex items-center gap-1">
              <span className="font-bold text-blue-900">{latest.averageScore}%</span>
              <span className="text-[10px] text-slate-500">({latest.eczDivision})</span>
            </div>
            <span className="text-[10px] text-slate-400">Rank: {latest.positionInClass}</span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Dossier Actions',
      accessor: (row) => (
        <button
          onClick={() => setSelectedStudent(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 transition"
        >
          <span>View 360° Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <ModuleGate
      moduleKey="boarding"
      moduleName="Boarding Village & Residential Houses"
      moduleDescription="Real-time bed allocation, dormitory rosters, night curfew headcounts, and weekend exeat gate passes for Kansanshi and Kalumbila halls."
      planRequired="PROFESSIONAL"
      pricePerTermZMW={2200}
    >
      <div className="space-y-6 w-full pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Official Legacy School Banner */}
      <LegacyLogo variant="banner" />

      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-900">
              <Bed className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900">
              Boarding Village & Student 360° Dossiers
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Residential accommodation management, night roll-calls, multi-year fees ledgers, subject performance, and healthcare records.
          </p>
        </div>

        {/* View Tabs & Roll-Call Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openRollCallModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition"
          >
            <ClipboardList className="w-4 h-4 text-purple-300" />
            <span>Conduct Roll-Call</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setActiveTab('OVERVIEW');
                setHouseFilter('ALL');
                setTypeFilter('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'OVERVIEW' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Village Overview
            </button>
            <button
              onClick={() => {
                setActiveTab('KANSANSHI');
                setHouseFilter('MOPANI_BOYS_HALL');
                setTypeFilter('BOARDER');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'KANSANSHI' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kansanshi Boys ({allBoysBoarders.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('KALUMBILA');
                setHouseFilter('MUKWA_GIRLS_HALL');
                setTypeFilter('BOARDER');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'KALUMBILA' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kalumbila Girls ({allGirlsBoarders.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('SCORECARDS');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                activeTab === 'SCORECARDS' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Class Scorecards</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('ALL_STUDENTS');
                setHouseFilter('ALL');
                setTypeFilter('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'ALL_STUDENTS' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Directory ({learnersList.length})
            </button>
          </div>

          <button
            onClick={handleResetBaseline}
            title="Reset to 780 Clean Records"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Urban Campus Notice Banner when URBAN is selected */}
      {selectedCampus === 'URBAN' && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sky-950 text-sm">Urban Campus (Solwezi Central) — ECE & Primary Day School</h3>
              <p className="text-xs text-sky-800 mt-0.5">
                Urban Campus operates exclusively as a Day School for Early Childhood and Primary grades (360 pupils). The residential Boarding Village facilities below are situated at <strong>Mushitala Campus (Near Kansanshi)</strong> with 315 resident boarders across Kansanshi Boys and Kalumbila Girls Halls.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedCampus('MUSHITALA')}
              className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition"
            >
              Switch to Mushitala Boarding Wing
            </button>
            <button
              type="button"
              onClick={() => setSelectedCampus('ALL')}
              className="px-3 py-2 rounded-xl bg-white border border-sky-300 hover:bg-sky-100 text-sky-900 font-bold text-xs shadow-2xs transition"
            >
              Consolidate All Campuses (780)
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* HARMONIZED INSTITUTIONAL KPI CARDS */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Boarders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Resident Boarders (Boarding Village)</span>
            <Bed className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{allBoarders.length}</span>
            <span className="text-xs text-slate-500">/ {villageConfig.totalBedCapacity} beds</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center justify-between">
            <span>Occupancy Rate</span>
            <span>
              {villageConfig.totalBedCapacity > 0
                ? ((allBoarders.length / villageConfig.totalBedCapacity) * 100).toFixed(1)
                : '0.0'}
              %
            </span>
          </div>
        </div>

        {/* Kansanshi Boys Boarding Hall */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Kansanshi Boys Boarding Hall</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{allBoysBoarders.length}</span>
            <span className="text-xs text-slate-500">/ 180 capacity</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-600 truncate font-medium">
            Housemaster: <strong>Mr. Kelvin Phiri</strong>
          </p>
        </div>

        {/* Kalumbila Girls Boarding Hall */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Kalumbila Girls Boarding Hall</span>
            <Building2 className="w-4 h-4 text-pink-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{allGirlsBoarders.length}</span>
            <span className="text-xs text-slate-500">/ 170 capacity</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-600 truncate font-medium">
            Senior Matron: <strong>Mrs. C. Kangwa</strong>
          </p>
        </div>

        {/* Standby Power */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{villageConfig.standbyPower.generatorKva} Standby Power</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{villageConfig.standbyPower.status}</span>
            <span className="text-xs text-slate-500">24/7 ATS Standby</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-600 truncate font-medium">
            Fuel Tank: <strong>{villageConfig.standbyPower.fuelLevel}</strong>
          </p>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: VILLAGE OVERVIEW */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kansanshi Hall Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-blue-100 text-blue-900 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Kansanshi Boys Boarding Hall</h3>
                  <p className="text-xs text-slate-500">Mushitala Campus • 180 Bed Capacity</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                {allBoysBoarders.length} / 180 Beds ({((allBoysBoarders.length / 180) * 100).toFixed(0)}%)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">Junior Wing (Forms 1-2)</span>
                <span className="text-base font-black text-slate-900 mt-1 block">Dorm A & Dorm B</span>
                <span className="text-[11px] text-slate-500">Chambishi & Lumwana Wings</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">Senior Wing (Forms 3-5)</span>
                <span className="text-base font-black text-slate-900 mt-1 block">Dorm C & Dorm D</span>
                <span className="text-[11px] text-slate-500">Kalumbila & Prefect Cubicles</span>
              </div>
            </div>

            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-xs space-y-1">
              <p className="font-semibold text-blue-950">Supervision & Study Schedule:</p>
              <p className="text-slate-700">Senior Housemaster: <strong>Mr. Kelvin Phiri</strong> (+260 967 288578)</p>
              <p className="text-slate-700">Evening Study Prep: <strong>19:00 - 21:00 Daily</strong> • Curfew: <strong>21:30</strong></p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRollCallScope('KANSANSHI');
                  openRollCallModal();
                }}
                className="flex-1 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Boys Hall Roll-Call</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('KANSANSHI');
                  setHouseFilter('MOPANI_BOYS_HALL');
                  setTypeFilter('BOARDER');
                }}
                className="flex-1 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <span>View Resident Roster</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Kalumbila Hall Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-pink-100 text-pink-900 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Kalumbila Girls Boarding Hall</h3>
                  <p className="text-xs text-slate-500">Mushitala Campus • 170 Bed Capacity</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-800 border border-pink-200">
                {allGirlsBoarders.length} / 170 Beds ({((allGirlsBoarders.length / 170) * 100).toFixed(0)}%)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">North Wing (Forms 1-2)</span>
                <span className="text-base font-black text-slate-900 mt-1 block">Dorm 1 & Dorm 2</span>
                <span className="text-[11px] text-slate-500">Jacaranda & Baobab Wings</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">South Wing (Forms 3-5)</span>
                <span className="text-base font-black text-slate-900 mt-1 block">Dorm 3 & Dorm 4</span>
                <span className="text-[11px] text-slate-500">Acacia & Senior Cubicles</span>
              </div>
            </div>

            <div className="bg-pink-50/50 p-3 rounded-xl border border-pink-100 text-xs space-y-1">
              <p className="font-semibold text-pink-950">Supervision & Study Schedule:</p>
              <p className="text-slate-700">Senior Matron: <strong>Mrs. Constance Kangwa</strong> (+260 975 119284)</p>
              <p className="text-slate-700">Evening Study Prep: <strong>19:00 - 21:00 Daily</strong> • Curfew: <strong>21:30</strong></p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRollCallScope('KALUMBILA');
                  openRollCallModal();
                }}
                className="flex-1 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Girls Hall Roll-Call</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('KALUMBILA');
                  setHouseFilter('MUKWA_GIRLS_HALL');
                  setTypeFilter('BOARDER');
                }}
                className="flex-1 py-2 rounded-xl bg-pink-900 hover:bg-pink-800 text-white text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <span>View Resident Roster</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: CLASS SCORECARDS & INSTITUTIONAL LEADERBOARD */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'SCORECARDS' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Institutional Academic Scorecards & Class Rankings</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparative analysis of academic performance across all grades. Click any scorecard to inspect learner details.
              </p>
            </div>
            <div className="text-xs font-bold bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200 self-start">
              ECZ Benchmark Target: ≥ 75% Division 1
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classScorecards.map((cs, idx) => (
              <div
                key={cs.className}
                onClick={() => {
                  setClassFilter(cs.className);
                  setActiveTab('ALL_STUDENTS');
                }}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950 font-mono shadow-xs'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800 font-mono'
                          : idx === 2
                          ? 'bg-amber-700 text-white font-mono'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <h3 className="font-black text-slate-900 text-sm">{cs.className}</h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {cs.studentCount} Pupils
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                  <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-800 font-bold block">Class Average</span>
                    <span className="text-base font-black text-blue-950 font-mono mt-0.5 block">{cs.classAverage}%</span>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 font-bold block">Pass Rate</span>
                    <span className="text-base font-black text-emerald-950 font-mono mt-0.5 block">{cs.passRate}%</span>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-xl border border-purple-100">
                    <span className="text-[10px] text-purple-800 font-bold block">Distinctions</span>
                    <span className="text-base font-black text-purple-950 font-mono mt-0.5 block">{cs.totalDistinctions}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2 text-[11px] flex items-center justify-between text-slate-600">
                  <span>
                    Top Learner: <strong>{cs.bestStudent.name}</strong> ({cs.bestStudent.score}%)
                  </span>
                  <span className="text-blue-900 font-bold flex items-center gap-0.5">
                    View <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* DIRECTORY TABLE & FILTERS SECTION */}
      {/* --------------------------------------------------------------------- */}
      {(activeTab === 'ALL_STUDENTS' || activeTab === 'KANSANSHI' || activeTab === 'KALUMBILA') && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 mr-1">Filter by Cadre:</span>
              <button
                onClick={() => setTypeFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  typeFilter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({campusPool.length})
              </button>
              <button
                onClick={() => setTypeFilter('BOARDER')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  typeFilter === 'BOARDER' ? 'bg-purple-800 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                Boarders Only ({campusBoarders.length})
              </button>
              <button
                onClick={() => setTypeFilter('DAY_SCHOLAR')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  typeFilter === 'DAY_SCHOLAR' ? 'bg-emerald-800 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Day Scholars ({campusPool.length - campusBoarders.length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Class:</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                <option value="ALL">All Classes</option>
                {classScorecards.map((c) => (
                  <option key={c.className} value={c.className}>
                    {c.className}
                  </option>
                ))}
              </select>

              <span className="text-xs font-bold text-slate-600 ml-2">House:</span>
              <select
                value={houseFilter}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setHouseFilter(val);
                  if (val === 'MOPANI_BOYS_HALL') setActiveTab('KANSANSHI');
                  else if (val === 'MUKWA_GIRLS_HALL') setActiveTab('KALUMBILA');
                  else setActiveTab('ALL_STUDENTS');
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                <option value="ALL">All Houses & Day</option>
                <option value="MOPANI_BOYS_HALL">Kansanshi Boys Boarding Hall ({allBoysBoarders.length})</option>
                <option value="MUKWA_GIRLS_HALL">Kalumbila Girls Boarding Hall ({allGirlsBoarders.length})</option>
              </select>
            </div>
          </div>

          <EnterpriseTable
            data={displayedStudents}
            columns={columns}
            title={
              activeTab === 'KANSANSHI'
                ? 'Kansanshi Boys Boarding Hall — Resident Roster'
                : activeTab === 'KALUMBILA'
                ? 'Kalumbila Girls Boarding Hall — Resident Roster'
                : 'Legacy School Solwezi — Student Registry & 360° Dossiers'
            }
            description={`Displaying ${displayedStudents.length} verified student records with full academic, financial, accommodation and healthcare histories.`}
            exportFilename="legacy-school-student-dossiers"
            onRowClick={(row) => setSelectedStudent(row)}
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ROLL-CALL WORKFLOW MODAL */}
      {/* --------------------------------------------------------------------- */}
      {isRollCallOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-100 text-purple-900">
                  <ClipboardList className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Residential Boarding Roll-Call & Bed Check
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live warden verification. Unaccounted absences trigger immediate security and matron alerts.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsRollCallOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scope & Session Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Boarding Facility</label>
                <select
                  value={rollCallScope}
                  onChange={(e) => setRollCallScope(e.target.value as any)}
                  className="w-full p-1.5 border rounded-lg bg-white font-bold"
                >
                  <option value="KANSANSHI">Kansanshi Boys Boarding Hall ({allBoysBoarders.length})</option>
                  <option value="KALUMBILA">Kalumbila Girls Boarding Hall ({allGirlsBoarders.length})</option>
                  <option value="ALL">Entire Boarding Village ({allBoarders.length})</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Roll-Call Session</label>
                <select
                  value={rollCallSession}
                  onChange={(e) => setRollCallSession(e.target.value as any)}
                  className="w-full p-1.5 border rounded-lg bg-white font-semibold"
                >
                  <option value="CURFEW">Night Curfew & Dorm Bed-Check (21:30)</option>
                  <option value="PREP">Evening Study Prep Roll-Call (19:00 - 21:00)</option>
                  <option value="MORNING">Morning Assembly & Muster (06:30)</option>
                </select>
              </div>

              <div className="flex items-end gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMarkAllRollCall('PRESENT')}
                  className="flex-1 py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition"
                >
                  Mark All Present
                </button>
              </div>
            </div>

            {/* Status Counter Banner */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                <span className="text-[10px] text-emerald-800 font-bold block">Present in Dorm</span>
                <span className="font-mono text-base font-black text-emerald-950">
                  {Object.values(rollCallRecords).filter((v) => v === 'PRESENT').length}
                </span>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-2 rounded-xl">
                <span className="text-[10px] text-rose-800 font-bold block">Absent / Unaccounted</span>
                <span className="font-mono text-base font-black text-rose-950">
                  {Object.values(rollCallRecords).filter((v) => v === 'ABSENT').length}
                </span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl">
                <span className="text-[10px] text-amber-800 font-bold block">In Sickbay Ward</span>
                <span className="font-mono text-base font-black text-amber-950">
                  {Object.values(rollCallRecords).filter((v) => v === 'SICKBAY').length}
                </span>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-2 rounded-xl">
                <span className="text-[10px] text-blue-800 font-bold block">Approved Exeat</span>
                <span className="font-mono text-base font-black text-blue-950">
                  {Object.values(rollCallRecords).filter((v) => v === 'EXCUSED').length}
                </span>
              </div>
            </div>

            {/* Learners Roster List */}
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 border border-slate-200 rounded-xl text-xs">
              {rollCallPool.map((s) => {
                const currentStatus = rollCallRecords[s.id] || 'PRESENT';
                return (
                  <div key={s.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 gap-3">
                    <div className="flex flex-col min-w-44">
                      <span className="font-bold text-slate-900">{s.learnerName}</span>
                      <span className="text-[11px] text-slate-500">
                        {s.studentNumber} • {s.className}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 hidden sm:block">
                      <span className="font-bold">{s.currentAccommodation?.dormRoom}</span>
                      <span className="text-slate-400 block">{s.currentAccommodation?.bedNumber}</span>
                    </div>

                    {/* Quick Attendance Selector */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setRollCallRecords({ ...rollCallRecords, [s.id]: 'PRESENT' })}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                          currentStatus === 'PRESENT'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setRollCallRecords({ ...rollCallRecords, [s.id]: 'ABSENT' })}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                          currentStatus === 'ABSENT'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => setRollCallRecords({ ...rollCallRecords, [s.id]: 'SICKBAY' })}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                          currentStatus === 'SICKBAY'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Sickbay
                      </button>
                      <button
                        type="button"
                        onClick={() => setRollCallRecords({ ...rollCallRecords, [s.id]: 'EXCUSED' })}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                          currentStatus === 'EXCUSED'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Exeat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-xs text-slate-500">
                Verified by Housemaster / Senior Matron on duty
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsRollCallOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRollCall}
                  className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-xs"
                >
                  Save & Verify Roll-Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* STUDENT 360° DOSSIER MODAL WITH COMPLETE CRUD */}
      {/* --------------------------------------------------------------------- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-blue-950 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <LegacyLogo variant="emblem" size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black tracking-wide text-white font-serif">
                      {selectedStudent.learnerName}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-blue-950 font-mono">
                      {selectedStudent.studentNumber}
                    </span>
                    <button
                      onClick={() => openBioModal(selectedStudent)}
                      title="Edit Student Info"
                      className="p-1 rounded-md bg-blue-900 hover:bg-blue-800 text-blue-200 hover:text-white transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-blue-200 mt-0.5">
                    {selectedStudent.className} • {selectedStudent.campusName} •{' '}
                    <strong className="text-white">
                      {selectedStudent.studentType === 'BOARDER'
                        ? `Full Boarder (${selectedStudent.currentAccommodation?.boardingHouseLabel || selectedStudent.hallName || 'Hall'})`
                        : 'Day Scholar'}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => openPaymentModal(selectedStudent)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>
                <button
                  onClick={() => openAcademicModal(selectedStudent)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Edit Marks</span>
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-blue-200 hover:text-white transition ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dossier Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setDossierTab('ACADEMICS')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  dossierTab === 'ACADEMICS'
                    ? 'border-blue-900 text-blue-950 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Academic Records & Performance Trend</span>
              </button>
              <button
                onClick={() => setDossierTab('ACCOMMODATION')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  dossierTab === 'ACCOMMODATION'
                    ? 'border-blue-900 text-blue-950 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bed className="w-3.5 h-3.5 text-purple-600" />
                <span>Accommodation & Room History</span>
              </button>
              <button
                onClick={() => setDossierTab('FEES')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  dossierTab === 'FEES'
                    ? 'border-blue-900 text-blue-950 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fees Ledger History</span>
              </button>
              <button
                onClick={() => setDossierTab('HEALTH')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  dossierTab === 'HEALTH'
                    ? 'border-blue-900 text-blue-950 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Healthcare & Sickbay</span>
              </button>
              <button
                onClick={() => setDossierTab('LETTERHEAD')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  dossierTab === 'LETTERHEAD'
                    ? 'border-blue-900 text-blue-950 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Printer className="w-3.5 h-3.5 text-blue-700" />
                <span>Official Letterhead Dossier</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* ------------------------------------------------------------- */}
              {/* TAB 1: ACADEMIC PERFORMANCE (FULL SUBJECTS & TREND GRAPH) */}
              {/* ------------------------------------------------------------- */}
              {dossierTab === 'ACADEMICS' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Termly Academic Records & Multi-Year Performance Trend</span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        Complete subject scores, ECZ grading, and historical progress over the years.
                      </p>
                    </div>

                    <button
                      onClick={() => openAcademicModal(selectedStudent)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Current Marks</span>
                    </button>
                  </div>

                  {/* Visual Performance Graph Over Time */}
                  {selectedStudent.performanceHistory && selectedStudent.performanceHistory.length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-blue-900" />
                          <span>Average Performance Trend Line Over Time (2024 - 2026)</span>
                        </span>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="flex items-center gap-1 text-slate-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-800 inline-block"></span> Learner Score
                          </span>
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <span className="w-2.5 h-0.5 bg-emerald-500 inline-block"></span> Distinction Threshold (75%)
                          </span>
                        </div>
                      </div>

                      {/* SVG Trend Graph */}
                      <div className="h-32 w-full pt-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100">
                          {/* Grid line at 75% (y = 25) */}
                          <line x1="20" y1="25" x2="480" y2="25" stroke="#10b981" strokeDasharray="3 3" strokeWidth="1" />
                          <text x="485" y="28" fill="#10b981" fontSize="9" fontWeight="bold">75% (Div 1)</text>

                          {/* Line and Points */}
                          {(() => {
                            const rev = [...(selectedStudent.performanceHistory || [])].reverse();
                            const step = rev.length > 1 ? 440 / (rev.length - 1) : 440;
                            const pts = rev.map((p, idx) => {
                              const x = 30 + idx * step;
                              // Map score 50%-100% to y 85-15
                              const y = 85 - ((Math.min(100, Math.max(50, p.averageScore)) - 50) / 50) * 70;
                              return { x, y, score: p.averageScore, label: p.termLabel };
                            });

                            const pathStr = pts.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

                            return (
                              <>
                                <path d={pathStr} fill="none" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
                                {pts.map((p, i) => (
                                  <g key={i}>
                                    <circle cx={p.x} cy={p.y} r="5" fill="#1e3a8a" stroke="#ffffff" strokeWidth="2" />
                                    <text x={p.x} y={p.y - 10} fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle">
                                      {p.score}%
                                    </text>
                                    <text x={p.x} y="98" fill="#64748b" fontSize="9" textAnchor="middle">
                                      {p.label}
                                    </text>
                                  </g>
                                ))}
                              </>
                            );
                          })()}
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Term Results Cards with ALL subjects */}
                  {selectedStudent.performanceHistory?.map((p, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-blue-950 text-white font-bold text-xs">
                            {p.termLabel}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{p.className}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            Average: {p.averageScore}%
                          </span>
                          <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {p.eczDivision}
                          </span>
                          <span className="text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                            Rank: <strong>{p.positionInClass}</strong>
                          </span>
                          <button
                            onClick={() => openAcademicModal(selectedStudent)}
                            className="p-1 text-blue-900 hover:bg-blue-50 rounded transition"
                            title="Edit this term"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* ALL Subjects Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
                        {p.subjects.map((sub, sIdx) => (
                          <div key={sIdx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 transition">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 truncate pr-1">{sub.subjectName}</span>
                              <span className="font-mono font-black text-blue-950 text-sm shrink-0">{sub.score}%</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                              <span>Grade: <strong className="text-blue-900">{sub.eczGrade}</strong></span>
                            </div>
                            <p className="text-[10px] text-slate-600 italic mt-1 line-clamp-1">
                              {sub.teacherRemark}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="text-xs text-slate-700 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100 flex items-start justify-between gap-3">
                        <div>
                          <strong className="text-blue-950 block">Principal Remarks:</strong>
                          <span className="italic">{p.principalRemarks}</span>
                        </div>
                        <button
                          onClick={() => openAcademicModal(selectedStudent)}
                          className="text-[11px] font-bold text-blue-900 hover:underline shrink-0"
                        >
                          Edit Remark
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 2: ACCOMMODATION HISTORY */}
              {/* ------------------------------------------------------------- */}
              {dossierTab === 'ACCOMMODATION' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-900">
                      Active Accommodation & Room Allocation (2026 Term 1)
                    </h4>
                    <button
                      onClick={() => openAccommodationModal(selectedStudent)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Reallocate Room / Change Cadre</span>
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    {selectedStudent.studentType === 'BOARDER' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 font-semibold block">Boarding House</span>
                          <span className="font-bold text-slate-900 mt-0.5 block">
                            {selectedStudent.currentAccommodation?.boardingHouseLabel || selectedStudent.hallName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block">Wing & Room</span>
                          <span className="font-bold text-slate-900 mt-0.5 block">
                            {selectedStudent.currentAccommodation?.wing} • {selectedStudent.currentAccommodation?.dormRoom}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block">Bed & Locker ID</span>
                          <span className="font-bold text-slate-900 mt-0.5 block">
                            {selectedStudent.currentAccommodation?.bedNumber} • {selectedStudent.currentAccommodation?.lockerNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block">Housemaster/Matron</span>
                          <span className="font-bold text-slate-900 mt-0.5 block">
                            {selectedStudent.currentAccommodation?.supervisorName}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-slate-700">
                        <p>
                          Enrolled as a <strong>Day Scholar</strong> at {selectedStudent.campusName}. Transport corridor: Stand # S/SOLWE/3177178 Kansanshi Corridor • Day locker: {selectedStudent.currentAccommodation?.lockerNumber}.
                        </p>
                        <button
                          onClick={() => openAccommodationModal(selectedStudent)}
                          className="px-3 py-1 bg-purple-700 text-white rounded-lg font-bold text-xs shrink-0 ml-3 hover:bg-purple-600 transition"
                        >
                          Promote to Boarder
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-800" />
                      <span>Historical Accommodation Timeline Over The Years</span>
                    </h4>

                    {selectedStudent.accommodationHistory && selectedStudent.accommodationHistory.length > 0 ? (
                      <div className="space-y-3">
                        {selectedStudent.accommodationHistory.map((h, i) => (
                          <div
                            key={h.id || i}
                            className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:border-blue-300 transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-xs">
                                {h.termLabel}
                              </span>
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                {h.inspectionScore}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-slate-700">
                              <div><strong>Dormitory:</strong> {h.dormRoom}</div>
                              <div><strong>Bed Assigned:</strong> {h.bedNumber}</div>
                              <div><strong>Supervisor:</strong> {h.housemasterOrMatron}</div>
                              <div><strong>Exeats Taken:</strong> {h.exeatsCount} approved</div>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-2 italic border-t border-slate-100 pt-1.5">
                              Remarks: {h.remarks}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                        No previous residential history recorded.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 3: FEES LEDGER HISTORY */}
              {/* ------------------------------------------------------------- */}
              {dossierTab === 'FEES' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-slate-500 font-semibold">Current Term 1 Balance</span>
                      <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                        K{selectedStudent.balance.toLocaleString()}
                      </div>
                      <span className="text-xs text-slate-400">
                        Total Paid: K{selectedStudent.totalPaid.toLocaleString()} / Billed: K{selectedStudent.totalBilled.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          selectedStudent.financialStatus === 'CLEARED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {selectedStudent.financialStatus}
                      </span>

                      <button
                        onClick={() => openPaymentModal(selectedStudent)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Record Payment Receipt</span>
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-black text-slate-900">
                    Comprehensive Fees Payment History Over The Years (2024–2026)
                  </h4>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                          <th className="p-3">Academic Term</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Amount Billed</th>
                          <th className="p-3">Amount Paid</th>
                          <th className="p-3">Balance</th>
                          <th className="p-3">Receipt / Ref</th>
                          <th className="p-3">Payment Method</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedStudent.feeHistory?.map((f, idx) => (
                          <tr key={f.id || idx} className="hover:bg-slate-50/80">
                            <td className="p-3 font-bold text-slate-900">{f.termLabel}</td>
                            <td className="p-3 text-slate-600">
                              {f.category === 'BOARDING_AND_TUITION' ? 'Boarding & Tuition' : 'Day Tuition'}
                            </td>
                            <td className="p-3 font-mono">K{f.amountBilled.toLocaleString()}</td>
                            <td className="p-3 font-mono font-bold text-emerald-700">K{f.amountPaid.toLocaleString()}</td>
                            <td className="p-3 font-mono">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                  f.balanceRemaining === 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                                }`}
                              >
                                K{f.balanceRemaining.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-blue-900 font-bold">{f.receiptNumber}</td>
                            <td className="p-3 text-slate-600">{f.paymentMethod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 4: HEALTHCARE & WELFARE */}
              {/* ------------------------------------------------------------- */}
              {dossierTab === 'HEALTH' && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Sickbay & Medical Profile (Supervised by Nurse Mary Mumba, RN)</span>
                      </h4>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsAddSickbayOpen(true)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Log Sickbay Visit</span>
                        </button>
                        <button
                          onClick={() => openMedicalModal(selectedStudent)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Profile</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-semibold block">Blood Group</span>
                        <span className="font-black text-rose-700 text-lg mt-0.5 block">
                          {selectedStudent.medicalProfile?.bloodGroup || 'O+'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-semibold block">Allergies</span>
                        <span className="font-bold text-slate-800 mt-0.5 block truncate">
                          {selectedStudent.medicalProfile?.allergies || 'None recorded'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-semibold block">Chronic Conditions</span>
                        <span className="font-bold text-slate-800 mt-0.5 block truncate">
                          {selectedStudent.medicalProfile?.chronicConditions || 'None'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-semibold block">Sickbay Visits</span>
                        <span className="font-bold text-slate-900 mt-0.5 block">
                          {selectedStudent.medicalProfile?.sickbayVisitsCount || 0} visits logged
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-blue-950">Clinical Examination & Observation Log:</p>
                        <span className="text-[11px] text-blue-800 font-mono">
                          Date: {selectedStudent.medicalProfile?.lastNurseCheckup || '2026-02-10'}
                        </span>
                      </div>
                      <p className="text-slate-700">{selectedStudent.medicalProfile?.nurseNotes}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 block">Emergency Guardian Contact:</span>
                        <p className="text-slate-700 mt-0.5">
                          {selectedStudent.guardian.name} • Phone: <strong>{selectedStudent.guardian.phone}</strong> • Email: {selectedStudent.guardian.email}
                        </p>
                      </div>
                      <button
                        onClick={() => openBioModal(selectedStudent)}
                        className="text-xs font-bold text-blue-900 hover:underline"
                      >
                        Edit Contact
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 5: OFFICIAL LETTERHEAD DOSSIER */}
              {/* ------------------------------------------------------------- */}
              {dossierTab === 'LETTERHEAD' && (
                <div className="space-y-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-bold shadow-xs hover:bg-blue-800 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Official Student Dossier</span>
                    </button>
                  </div>

                  <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
                    <LegacyLogo variant="letterhead" />

                    <div className="text-center">
                      <h2 className="text-base font-black tracking-wider uppercase text-blue-950 border-b-2 border-blue-900 pb-1 inline-block">
                        OFFICIAL CONFIDENTIAL STUDENT DOSSIER
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        ISSUED UNDER THE AUTHORITY OF THE SCHOOL DIRECTOR & BURSARY
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                      <div><strong>Learner Full Name:</strong> {selectedStudent.learnerName}</div>
                      <div><strong>Student ID Number:</strong> {selectedStudent.studentNumber}</div>
                      <div><strong>Current Class & Stage:</strong> {selectedStudent.className} ({selectedStudent.stage})</div>
                      <div><strong>Campus:</strong> {selectedStudent.campusName}</div>
                      <div><strong>Enrolment Cadre:</strong> {selectedStudent.studentType === 'BOARDER' ? 'Residential Boarder' : 'Day Scholar'}</div>
                      <div><strong>Residential Hall:</strong> {selectedStudent.currentAccommodation?.boardingHouseLabel || selectedStudent.hallName || 'N/A (Day Scholar)'}</div>
                      <div><strong>Room & Bed Number:</strong> {selectedStudent.currentAccommodation?.dormRoom || 'N/A'} • {selectedStudent.currentAccommodation?.bedNumber || 'N/A'}</div>
                      <div><strong>Guardian Name:</strong> {selectedStudent.guardian.name}</div>
                      <div><strong>Emergency Phone:</strong> {selectedStudent.guardian.phone}</div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase text-blue-900 mb-2">Verified Academic Record (Term 1)</h4>
                      <table className="w-full text-left text-xs border border-slate-200">
                        <thead className="bg-slate-100 font-bold">
                          <tr>
                            <th className="p-2 border-b">Subject</th>
                            <th className="p-2 border-b">Score</th>
                            <th className="p-2 border-b">ECZ Grade</th>
                            <th className="p-2 border-b">Teacher Remark</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.performanceHistory?.[0]?.subjects.map((sub, i) => (
                            <tr key={i} className="border-b border-slate-100">
                              <td className="p-2 font-bold">{sub.subjectName}</td>
                              <td className="p-2 font-mono">{sub.score}%</td>
                              <td className="p-2 font-bold text-blue-900">{sub.eczGrade}</td>
                              <td className="p-2 text-slate-600 italic">{sub.teacherRemark}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase text-blue-900 mb-2">Bursar Statement Summary</h4>
                      <table className="w-full text-left text-xs border border-slate-200">
                        <thead className="bg-slate-100 font-bold">
                          <tr>
                            <th className="p-2 border-b">Term</th>
                            <th className="p-2 border-b">Billed (ZMW)</th>
                            <th className="p-2 border-b">Paid (ZMW)</th>
                            <th className="p-2 border-b">Receipt Ref</th>
                            <th className="p-2 border-b">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.feeHistory?.slice(0, 4).map((f, i) => (
                            <tr key={i} className="border-b border-slate-100">
                              <td className="p-2 font-bold">{f.termLabel}</td>
                              <td className="p-2 font-mono">K{f.amountBilled.toLocaleString()}</td>
                              <td className="p-2 font-mono text-emerald-800">K{f.amountPaid.toLocaleString()}</td>
                              <td className="p-2 font-mono text-[11px] font-bold">{f.receiptNumber}</td>
                              <td className="p-2 font-bold text-[11px]">{f.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">Mrs. Grace Tembo / Mr. Emmanuel Mwansa</p>
                        <p className="text-[11px] text-slate-500">School Directorate & Principal</p>
                      </div>
                      <div className="border-2 border-dashed border-blue-900 px-4 py-2 rounded-xl text-center">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-blue-900">
                          LEGACY SCHOOL SOLWEZI
                        </span>
                        <span className="block text-[9px] text-slate-500">OFFICIAL ARCHIVE STAMP</span>
                        <span className="block text-[9px] font-mono text-blue-800">MOE/NWP/SOL/SEC/2026/044</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CRUD MODAL 1: EDIT BIO & PERSONAL DETAILS */}
      {/* --------------------------------------------------------------------- */}
      {isEditBioOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <User className="w-5 h-5 text-blue-900" />
                <span>Edit Student Bio & Guardian Details</span>
              </h3>
              <button onClick={() => setIsEditBioOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Learner Full Name</label>
                <input
                  type="text"
                  value={bioForm.learnerName}
                  onChange={(e) => setBioForm({ ...bioForm, learnerName: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={bioForm.gender}
                    onChange={(e) => setBioForm({ ...bioForm, gender: e.target.value as any })}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class / Grade</label>
                  <input
                    type="text"
                    value={bioForm.className}
                    onChange={(e) => setBioForm({ ...bioForm, className: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="border-t pt-3 mt-3">
                <span className="font-black text-slate-800 block mb-2">Guardian Contact Information</span>
                <div className="space-y-2">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-0.5">Guardian Name & Title</label>
                    <input
                      type="text"
                      value={bioForm.guardianName}
                      onChange={(e) => setBioForm({ ...bioForm, guardianName: e.target.value })}
                      className="w-full p-2 border rounded-lg bg-slate-50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-0.5">Phone Number</label>
                      <input
                        type="text"
                        value={bioForm.guardianPhone}
                        onChange={(e) => setBioForm({ ...bioForm, guardianPhone: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-0.5">Email Address</label>
                      <input
                        type="email"
                        value={bioForm.guardianEmail}
                        onChange={(e) => setBioForm({ ...bioForm, guardianEmail: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-slate-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setIsEditBioOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBio}
                className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
              >
                Save Student Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CRUD MODAL 2: REALLOCATE ACCOMMODATION & CADRE */}
      {/* --------------------------------------------------------------------- */}
      {isEditAccommodationOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Bed className="w-5 h-5 text-purple-700" />
                <span>Reallocate Room & Boarding Cadre</span>
              </h3>
              <button onClick={() => setIsEditAccommodationOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Cadre</label>
                <select
                  value={accForm.studentType}
                  onChange={(e) => setAccForm({ ...accForm, studentType: e.target.value as any })}
                  className="w-full p-2 border rounded-lg bg-slate-50 font-bold text-slate-800"
                >
                  <option value="BOARDER">Full Residential Boarder (K10,400 / Term)</option>
                  <option value="DAY_SCHOLAR">Day Scholar (K3,800 / Term)</option>
                </select>
              </div>

              {accForm.studentType === 'BOARDER' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Boarding House</label>
                      <select
                        value={accForm.boardingHouse}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setAccForm({
                            ...accForm,
                            boardingHouse: val,
                            boardingHouseLabel:
                              val === 'MOPANI_BOYS_HALL' ? 'Kansanshi Boys Boarding Hall' : 'Kalumbila Girls Boarding Hall',
                            supervisorName:
                              val === 'MOPANI_BOYS_HALL'
                                ? 'Mr. Kelvin Phiri (Housemaster)'
                                : 'Mrs. Constance Kangwa (Senior Matron)',
                          });
                        }}
                        className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                      >
                        <option value="MOPANI_BOYS_HALL">Kansanshi Boys Boarding Hall</option>
                        <option value="MUKWA_GIRLS_HALL">Kalumbila Girls Boarding Hall</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Wing</label>
                      <select
                        value={accForm.wing}
                        onChange={(e) => setAccForm({ ...accForm, wing: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                      >
                        {accForm.boardingHouse === 'MOPANI_BOYS_HALL' ? (
                          <>
                            <option value="Junior Wing">Junior Wing (Forms 1-2)</option>
                            <option value="Senior Wing">Senior Wing (Forms 3-5)</option>
                          </>
                        ) : (
                          <>
                            <option value="North Wing">North Wing (Forms 1-2)</option>
                            <option value="South Wing">South Wing (Forms 3-5)</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Dormitory Room</label>
                      <select
                        value={accForm.dormRoom}
                        onChange={(e) => setAccForm({ ...accForm, dormRoom: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                      >
                        {accForm.boardingHouse === 'MOPANI_BOYS_HALL' ? (
                          <>
                            <option value="Dorm A (Chambishi)">Dorm A (Chambishi)</option>
                            <option value="Dorm B (Lumwana)">Dorm B (Lumwana)</option>
                            <option value="Dorm C (Kalumbila)">Dorm C (Kalumbila)</option>
                            <option value="Dorm D (Kansanshi)">Dorm D (Kansanshi)</option>
                            <option value="Senior Cubicle 04">Senior Cubicle 04</option>
                          </>
                        ) : (
                          <>
                            <option value="Dorm 1 (Jacaranda)">Dorm 1 (Jacaranda)</option>
                            <option value="Dorm 2 (Baobab)">Dorm 2 (Baobab)</option>
                            <option value="Dorm 3 (Acacia)">Dorm 3 (Acacia)</option>
                            <option value="Dorm 4 (Flame Tree)">Dorm 4 (Flame Tree)</option>
                            <option value="Senior Cubicle 06">Senior Cubicle 06</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Bed Number & Bunk</label>
                      <input
                        type="text"
                        value={accForm.bedNumber}
                        onChange={(e) => setAccForm({ ...accForm, bedNumber: e.target.value })}
                        placeholder="Bed-04 (Lower Bunk)"
                        className="w-full p-2 border rounded-lg bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Locker Number</label>
                      <input
                        type="text"
                        value={accForm.lockerNumber}
                        onChange={(e) => setAccForm({ ...accForm, lockerNumber: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Assigned Supervisor</label>
                      <input
                        type="text"
                        value={accForm.supervisorName}
                        onChange={(e) => setAccForm({ ...accForm, supervisorName: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-slate-50"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <p className="text-slate-600">
                    Day Scholars are allocated to the Day Transport Marshall network and day lockers at Mushitala / Urban Campus.
                  </p>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Day Locker Allocation</label>
                    <input
                      type="text"
                      value={accForm.lockerNumber}
                      onChange={(e) => setAccForm({ ...accForm, lockerNumber: e.target.value })}
                      className="w-full p-2 border rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setIsEditAccommodationOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAccommodation}
                className="px-4 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
              >
                Save Room Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CRUD MODAL 3: RECORD PAYMENT */}
      {/* --------------------------------------------------------------------- */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-700" />
                <span>Record Fee Payment & Issue Receipt</span>
              </h3>
              <button onClick={() => setIsRecordPaymentOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-semibold block">Outstanding Balance</span>
                  <span className="text-lg font-black text-emerald-900 font-mono">
                    K{selectedStudent?.balance.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-800">
                  Total Billed: K{selectedStudent?.totalBilled.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Amount to Pay (ZMW)</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg bg-slate-50 font-mono text-base font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                  >
                    <option value="Zanaco Billmaster">Zanaco Billmaster</option>
                    <option value="Stanbic Bank Deposit">Stanbic Bank Deposit</option>
                    <option value="Airtel Money Merchant">Airtel Money Merchant</option>
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                    <option value="Absa Bank Transfer">Absa Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bank Reference / Merchant Receipt Number</label>
                <input
                  type="text"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  placeholder="e.g. ZAN-8921822 or ATM-38910"
                  className="w-full p-2 border rounded-lg bg-slate-50 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setIsRecordPaymentOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePayment}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs"
              >
                Post Payment & Update Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CRUD MODAL 4: EDIT ALL SUBJECT MARKS & REMARKS */}
      {/* --------------------------------------------------------------------- */}
      {isEditAcademicOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span>Edit Academic Performance & All Subject Marks</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Captures all subjects. Numerical changes automatically update ECZ Grades, average score, and class positions.
                </p>
              </div>
              <button onClick={() => setIsEditAcademicOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Academic Term</label>
                  <input
                    type="text"
                    value={academicForm.termLabel}
                    onChange={(e) => setAcademicForm({ ...academicForm, termLabel: e.target.value })}
                    className="w-full p-1.5 border rounded-lg bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class / Form</label>
                  <input
                    type="text"
                    value={academicForm.className}
                    onChange={(e) => setAcademicForm({ ...academicForm, className: e.target.value })}
                    className="w-full p-1.5 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class Position / Rank</label>
                  <input
                    type="text"
                    value={academicForm.positionInClass}
                    onChange={(e) => setAcademicForm({ ...academicForm, positionInClass: e.target.value })}
                    className="w-full p-1.5 border rounded-lg bg-white font-bold"
                  />
                </div>
              </div>

              {/* Subject Rows for All Subjects */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-xs">
                    Complete Subject Roster ({academicForm.subjects.length} Subjects Captured)
                  </h4>
                  <span className="text-[11px] text-slate-500">Scale: 0 - 100%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {academicForm.subjects.map((sub, sIdx) => (
                    <div key={sIdx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 text-xs truncate flex-1">{sub.subjectName}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={sub.score}
                            onChange={(e) => handleUpdateSubjectScore(sIdx, Number(e.target.value))}
                            className="w-16 p-1 border rounded bg-white font-mono font-bold text-right text-xs"
                          />
                          <span className="text-[11px] font-bold text-slate-500">%</span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px] whitespace-nowrap min-w-20 text-center">
                            {sub.eczGrade}
                          </span>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={sub.teacherRemark}
                        onChange={(e) => handleUpdateSubjectRemark(sIdx, e.target.value)}
                        placeholder="Subject teacher remark..."
                        className="w-full p-1 border rounded bg-white text-[11px] text-slate-600 italic"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Principal Remarks */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Principal / Headteacher Commendation Remarks</label>
                <textarea
                  rows={2}
                  value={academicForm.principalRemarks}
                  onChange={(e) => setAcademicForm({ ...academicForm, principalRemarks: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setIsEditAcademicOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAcademic}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs"
              >
                Save Academic Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CRUD MODAL 5: EDIT MEDICAL PROFILE */}
      {/* --------------------------------------------------------------------- */}
      {isEditMedicalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                <span>Edit Healthcare & Medical Profile</span>
              </h3>
              <button onClick={() => setIsEditMedicalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={medicalForm.bloodGroup}
                    onChange={(e) => setMedicalForm({ ...medicalForm, bloodGroup: e.target.value as any })}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-bold text-rose-800"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Last Nurse Examination</label>
                  <input
                    type="date"
                    value={medicalForm.lastNurseCheckup}
                    onChange={(e) => setMedicalForm({ ...medicalForm, lastNurseCheckup: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Allergies (Medications / Food)</label>
                <input
                  type="text"
                  value={medicalForm.allergies}
                  onChange={(e) => setMedicalForm({ ...medicalForm, allergies: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Chronic Conditions</label>
                <input
                  type="text"
                  value={medicalForm.chronicConditions}
                  onChange={(e) => setMedicalForm({ ...medicalForm, chronicConditions: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dietary Requirements</label>
                <input
                  type="text"
                  value={medicalForm.dietaryRequirements}
                  onChange={(e) => setMedicalForm({ ...medicalForm, dietaryRequirements: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nurse Clinical Observations & Notes</label>
                <textarea
                  rows={2}
                  value={medicalForm.nurseNotes}
                  onChange={(e) => setMedicalForm({ ...medicalForm, nurseNotes: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setIsEditMedicalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMedical}
                className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
              >
                Save Health Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CRUD MODAL 6: LOG SICKBAY VISIT */}
      {/* --------------------------------------------------------------------- */}
      {isAddSickbayOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-rose-600" />
                <span>Log Sickbay Clinical Visit</span>
              </h3>
              <button onClick={() => setIsAddSickbayOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Visit Date</label>
                  <input
                    type="date"
                    value={sickbayVisitForm.visitDate}
                    onChange={(e) => setSickbayVisitForm({ ...sickbayVisitForm, visitDate: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Attending Nurse</label>
                  <input
                    type="text"
                    value={sickbayVisitForm.nurseName}
                    onChange={(e) => setSickbayVisitForm({ ...sickbayVisitForm, nurseName: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Complaint / Symptoms</label>
                <input
                  type="text"
                  value={sickbayVisitForm.complaint}
                  onChange={(e) => setSickbayVisitForm({ ...sickbayVisitForm, complaint: e.target.value })}
                  placeholder="e.g. Headache, fever, sporting scrape, asthma wheeze"
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Treatment / Medication Administered</label>
                <input
                  type="text"
                  value={sickbayVisitForm.treatment}
                  onChange={(e) => setSickbayVisitForm({ ...sickbayVisitForm, treatment: e.target.value })}
                  placeholder="e.g. Paracetamol 500mg, oral rehydration, dressing"
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Disposition</label>
                <select
                  value={sickbayVisitForm.disposition}
                  onChange={(e) => setSickbayVisitForm({ ...sickbayVisitForm, disposition: e.target.value as any })}
                  className="w-full p-2 border rounded-lg bg-slate-50 font-bold"
                >
                  <option value="Discharged to Dormitory">Discharged to Dormitory / Classes</option>
                  <option value="Admitted to Sickbay">Admitted to Sickbay Ward for Observation</option>
                  <option value="Referred to General Hospital">Referred to Solwezi General Hospital</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setIsAddSickbayOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSickbayVisit}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs"
              >
                Save Sickbay Record
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ModuleGate>
  );
}
