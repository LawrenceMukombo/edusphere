/**
 * Global Formatters and Enum Cleaners for NWUCHAS-CMIS
 * North Western University College of Health and Applied Sciences
 */

/**
 * Maps known database raw enums to polished, human-friendly titles.
 */
const ENUM_LABEL_MAP: Record<string, string> = {
  // Payroll & Finance
  APPROVED_LOCKED: 'Approved & Locked',
  CALCULATED: 'Calculated',
  DRAFT: 'Draft',
  REJECTED: 'Rejected',
  PENDING_APPROVAL: 'Pending Approval',
  FULLY_PAID: 'Fully Paid',
  PARTIALLY_PAID: 'Partially Paid',
  UNPAID: 'Unpaid',
  OVERDUE: 'Overdue',
  CONFIRMED: 'Confirmed',
  PROCESSED: 'Processed',
  CREATED: 'Created',
  INITIATED: 'Initiated',
  RECONCILED: 'Reconciled',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  
  // Roles
  INSTITUTION_ADMIN: 'Institution Admin',
  SUPER_ADMIN: 'Super Admin',
  PRINCIPAL: 'Principal & Head of College',
  VICE_PRINCIPAL: 'Vice Principal',
  ACADEMIC_REGISTRAR: 'Academic Registrar',
  REGISTRAR: 'Academic Registrar & Board',
  BURSAR: 'Bursar & Finance Officer',
  BURSAR_OFFICER: 'Bursar Officer',
  HEAD_OF_DEPARTMENT: 'Head of Department',
  CLINICAL_COORDINATOR: 'Clinical Coordinator',
  FACULTY_LECTURER: 'Faculty Lecturer',
  LECTURER: 'Faculty Lecturer & Assessor',
  CLINICAL_PRECEPTOR: 'Clinical Preceptor',
  CLINICAL_SUPERVISOR: 'Clinical Preceptor & Hospital Supervisor',
  EXAM_OFFICER: 'Examinations Officer',
  EXAMINATIONS_OFFICER: 'Examinations Officer & Verification',
  IT_ADMIN: 'IT Systems & Security Admin',
  STUDENT_AFFAIRS: 'Student Affairs Dean',
  QUALITY_ASSURANCE: 'Quality Assurance Officer',
  LIBRARY_OFFICER: 'Library Officer',
  SYSTEM_AUDITOR: 'System Auditor',
  DATA_CLERK: 'Data Clerk',
  STUDENT: 'Student Trainee',

  // Admissions & Students
  SUBMITTED: 'Submitted',
  UNDER_SCREENING: 'Under Screening',
  COMMITTEE_OFFER: 'Committee Offer',
  PROVISIONAL_OFFER: 'Provisional Offer',
  ADMITTED: 'Admitted & Enrolled',
  REVERTED_WAITLIST: 'Waitlisted',
  REJECTED_QUALIFICATION: 'Ineligible (O-Levels)',
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  COMPLETED: 'Completed',
  WITHDRAWN: 'Withdrawn',

  // Attendance & Calendar
  PRESENT: 'Present',
  LATE: 'Late',
  ABSENT: 'Absent',
  EXCUSED: 'Excused',
  AT_RISK: 'At Risk',
  HOLIDAY: 'Public Holiday',
  SCHOOL_RECESS: 'School Recess / Closed',
  SHORT_HOLIDAY: 'Short Holiday / Break',
  RECESS: 'Recess / Closed',
  CLOSED: 'School Closed',

  // Sessions & Exams
  LECTURE: 'Didactic Lecture',
  SKILLS_LAB: 'Clinical Skills Lab',
  WARD_ROUND: 'Hospital Ward Round',
  OSCE: 'OSCE Clinical Exam',
  COMMUNITY: 'Community Field Placement',

  // Hardware & Network
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  DEGRADED: 'Degraded Service',
  DISPATCHED: 'Dispatched',
  PUBLISHED: 'Published',
  SCHEDULED: 'Scheduled',
  QUEUED: 'Queued',
  SYNCHRONISING: 'Synchronising',
  CONFLICTED: 'Conflict Resolved',
};

/**
 * Converts any raw string/enum with underscores into clean, Title Case or mapped readable text.
 * e.g. "APPROVED_LOCKED" -> "Approved & Locked"
 *      "SOMETHING_NEW_HERE" -> "Something New Here"
 */
export function formatCleanEnum(val: string | null | undefined): string {
  if (!val) return '—';
  
  const trimmed = String(val).trim();
  if (!trimmed) return '—';

  // Check known map first
  if (ENUM_LABEL_MAP[trimmed]) {
    return ENUM_LABEL_MAP[trimmed];
  }

  // Fallback: replace underscores with spaces and capitalize each word
  return trimmed
    .split('_')
    .map((word) => {
      if (!word) return '';
      // Keep acronyms like ZRA, HPCZ, NMCZ uppercase
      if (['ZRA', 'NAPSA', 'WCFCB', 'NHIMA', 'HPCZ', 'NMCZ', 'HEA', 'ECZ', 'OSCE', 'EPA', 'ID', 'IT', 'SMS'].includes(word.toUpperCase())) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Format currency amounts in Zambian Kwacha (ZMW)
 */
export function formatMoney(amount: number | string | null | undefined): string {
  const num = Number(amount || 0);
  return num.toLocaleString('en-ZM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats date into readable string e.g. "26 Oct 2026"
 */
export function formatDisplayDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '—';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
