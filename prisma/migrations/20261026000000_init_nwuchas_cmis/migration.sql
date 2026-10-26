-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('ECE_CENTRE', 'PRIMARY_ONLY', 'SECONDARY_ONLY', 'COMBINED_PRIMARY_SECONDARY', 'MULTI_CAMPUS_GROUP');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('COMMUNITY_STARTER', 'GROWING_SCHOOL', 'PROFESSIONAL', 'CAMPUS_PLUS', 'ENTERPRISE_GROUP');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'GRACE_PERIOD', 'SUSPENDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('INSTITUTION_ADMIN', 'APPLICANT', 'ADMISSIONS_OFFICER', 'ADMISSIONS_COMMITTEE', 'LECTURER', 'MODULE_COORDINATOR', 'EXAMINATIONS_OFFICER', 'EXAM_BOARD_MEMBER', 'CLINICAL_SUPERVISOR', 'CASHIER', 'FINANCE_RECONCILER', 'PAYROLL_PREPARER', 'PAYROLL_REVIEWER', 'PAYROLL_APPROVER', 'IT_ADMIN', 'PLATFORM_SUPER_ADMIN', 'SCHOOL_PROPRIETOR', 'HEADTEACHER', 'DEPUTY_HEADTEACHER', 'REGISTRAR', 'BURSAR', 'TEACHER', 'ECE_PRACTITIONER', 'PARENT_GUARDIAN', 'HR_OFFICER', 'LEARNER', 'AUDITOR_READONLY');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "LearnerStatus" AS ENUM ('ENROLLED', 'APPLICANT', 'TRANSFERRED_OUT', 'SUSPENDED', 'ALUMNI', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "GuardianRelationship" AS ENUM ('FATHER', 'MOTHER', 'LEGAL_GUARDIAN', 'GRANDPARENT', 'AUNT_UNCLE', 'FOSTER_PARENT', 'OTHER');

-- CreateEnum
CREATE TYPE "CurriculumFramework" AS ENUM ('ZAMBIA_REFORMED_2026', 'ZAMBIA_LEGACY_7_5', 'EARLY_CHILDHOOD_ECE', 'HYBRID_INTERNATIONAL');

-- CreateEnum
CREATE TYPE "EducationStage" AS ENUM ('ECE_NURSERY', 'ECE_RECEPTION', 'PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('CONTINUOUS_ASSESSMENT', 'MID_TERM_TEST', 'END_TERM_EXAMINATION', 'COMPETENCY_EVALUATION', 'MILESTONE_OBSERVATION');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'MODERATED', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "FeeCategory" AS ENUM ('TUITION', 'REGISTRATION', 'EXAMINATION', 'TRANSPORT', 'BOARDING', 'MEALS', 'UNIFORM', 'DEVELOPMENT_LEVY', 'OTHER');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'BANK_DEPOSIT', 'AIRTEL_MONEY', 'MTN_MONEY', 'CHEQUE');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('DEBIT_CHARGE', 'CREDIT_PAYMENT', 'CREDIT_CONCESSION', 'DEBIT_REVERSAL', 'CREDIT_REFUND');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('FULL_TIME', 'PART_TIME', 'PROBATION', 'CONTRACT', 'RESIGNED');

-- CreateEnum
CREATE TYPE "AdmissionApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'DOCUMENT_CHECK', 'ELIGIBILITY_REVIEW', 'INTERVIEW_PENDING', 'COMMITTEE_REVIEW', 'OFFERED', 'WAITLISTED', 'ACCEPTED', 'ENROLLED', 'REJECTED', 'EXPIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "CouncilType" AS ENUM ('NMCZ', 'HPCZ', 'HEA');

-- CreateEnum
CREATE TYPE "IndexingStatus" AS ENUM ('PENDING_SUBMISSION', 'SUBMITTED', 'INDEXED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ClinicalSiteType" AS ENUM ('GENERAL_HOSPITAL', 'FIRST_LEVEL_HOSPITAL', 'HEALTH_CENTRE', 'SPECIALISED_CLINIC', 'COMMUNITY_POST');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'EXTENDED', 'REMEDIATION', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "CompetencyLevel" AS ENUM ('NOVICE', 'DEVELOPING', 'COMPETENT', 'PROFICIENT');

-- CreateEnum
CREATE TYPE "PaymentChannel" AS ENUM ('MTN_MOMO', 'AIRTEL_MONEY', 'ZAMTEL_MONEY', 'CARD_HOSTED', 'BANK_TRANSFER', 'EFTPOS_TERMINAL', 'MANUAL_CASH');

-- CreateEnum
CREATE TYPE "PaymentIntentStatus" AS ENUM ('CREATED', 'INITIATED', 'PENDING_CUSTOMER', 'PENDING_PROVIDER', 'CONFIRMED', 'FAILED', 'CANCELLED', 'EXPIRED', 'REVERSED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('RECEIVED', 'VERIFIED', 'PROCESSED', 'RETRYING', 'FAILED', 'IGNORED');

-- CreateEnum
CREATE TYPE "ServiceEntitlementType" AS ENUM ('BUS_TRANSPORT', 'HOSTEL_ACCESS', 'LIBRARY_LOAN', 'EXAM_ADMISSION', 'CAMPUS_GATE', 'CLINICAL_ACCESS');

-- CreateEnum
CREATE TYPE "EntitlementStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'INPUTS_VALIDATED', 'CALCULATED', 'REVIEWED', 'APPROVED_LOCKED', 'DISBURSED', 'RECONCILED');

-- CreateEnum
CREATE TYPE "StatutoryAuthority" AS ENUM ('ZRA_PAYE', 'NAPSA', 'WCFCB', 'NHIMA');

-- CreateEnum
CREATE TYPE "HostelGenderPolicy" AS ENUM ('MALE_ONLY', 'FEMALE_ONLY', 'CO_ED_SEGREGATED');

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "officialName" TEXT,
    "type" "OrgType" NOT NULL DEFAULT 'COMBINED_PRIMARY_SECONDARY',
    "registrationNo" TEXT,
    "taxNumber" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Lusaka',
    "province" TEXT NOT NULL DEFAULT 'Lusaka',
    "country" TEXT NOT NULL DEFAULT 'Zambia',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Lusaka',
    "currency" TEXT NOT NULL DEFAULT 'ZMW',
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#1e3a8a',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "phone" TEXT,
    "isMainCampus" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "elevationMeters" DOUBLE PRECISION,
    "catchmentRadiusKm" DOUBLE PRECISION DEFAULT 5.0,
    "capacity" INTEGER DEFAULT 500,
    "campusType" TEXT DEFAULT 'BRANCH',
    "landAreaHectares" DOUBLE PRECISION,
    "facilitiesJson" TEXT,
    "contactEmail" TEXT,
    "headTeacherName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatchmentZone" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "zoneName" TEXT NOT NULL,
    "radiusKm" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "centerLatitude" DOUBLE PRECISION NOT NULL,
    "centerLongitude" DOUBLE PRECISION NOT NULL,
    "polygonGeoJson" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatchmentZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportRoute" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "routeCode" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "vehicleReg" TEXT,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "fareZMW" DECIMAL(10,2),
    "stopsJson" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'GROWING_SCHOOL',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "activeLearnerCap" INTEGER NOT NULL DEFAULT 250,
    "currentActiveLearners" INTEGER NOT NULL DEFAULT 0,
    "billingCycle" TEXT NOT NULL DEFAULT 'TERMLY',
    "priceZMW" DECIMAL(10,2) NOT NULL DEFAULT 399.00,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "gracePeriodEnds" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleEntitlement" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "enabledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),

    CONSTRAINT "ModuleEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "SystemRole" NOT NULL DEFAULT 'TEACHER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detailsJson" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Learner" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "studentNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "birthCertificateNo" TEXT,
    "nationality" TEXT NOT NULL DEFAULT 'Zambian',
    "status" "LearnerStatus" NOT NULL DEFAULT 'ENROLLED',
    "currentClassId" TEXT,
    "admissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allergies" TEXT,
    "medicalNotes" TEXT,
    "emergencyContact" TEXT,
    "photoUrl" TEXT,
    "residentialArea" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Learner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "nrcNumber" TEXT,
    "address" TEXT,
    "occupation" TEXT,
    "employer" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerGuardianRelationship" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "relationship" "GuardianRelationship" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "hasFinancialAuthority" BOOLEAN NOT NULL DEFAULT true,
    "canPickUp" BOOLEAN NOT NULL DEFAULT true,
    "emergencyOrder" INTEGER NOT NULL DEFAULT 1,
    "isAccessRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnerGuardianRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrolment" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "termId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "promotionStatus" TEXT NOT NULL DEFAULT 'PROMOTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enrolment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "termNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage" "EducationStage" NOT NULL DEFAULT 'PRIMARY',
    "stream" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 40,
    "classTeacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "stage" "EducationStage" NOT NULL,
    "isCore" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectAssignment" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,

    CONSTRAINT "SubjectAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL DEFAULT 'END_TERM_EXAMINATION',
    "maxMarks" DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    "weightPercentage" DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    "status" "ResultStatus" NOT NULL DEFAULT 'DRAFT',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "marksObtained" DECIMAL(5,2),
    "letterGrade" TEXT,
    "teacherComments" TEXT,
    "isAbsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyObservation" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "competencyName" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "observations" TEXT,
    "termId" TEXT NOT NULL,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetencyObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportCardVersion" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "ResultStatus" NOT NULL DEFAULT 'PUBLISHED',
    "summaryJson" TEXT NOT NULL,
    "teacherRemarks" TEXT,
    "principalRemarks" TEXT,
    "attendancePresent" INTEGER NOT NULL DEFAULT 0,
    "attendanceTotal" INTEGER NOT NULL DEFAULT 0,
    "approvedById" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportCardVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceSession" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "takenById" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "arrivalMinutesLate" INTEGER,
    "remarks" TEXT,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbsenceExplanation" (
    "id" TEXT NOT NULL,
    "attendanceRecordId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "isExcused" BOOLEAN NOT NULL DEFAULT false,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbsenceExplanation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeSchedule" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "category" "FeeCategory" NOT NULL DEFAULT 'TUITION',
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "applicableStage" "EducationStage" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "balance" DECIMAL(10,2) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "category" "FeeCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "lineTotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "referenceNumber" TEXT NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAllocation" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "allocatedAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "paymentId" TEXT,
    "entryType" "LedgerEntryType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "postedById" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "userId" TEXT,
    "staffNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "qualification" TEXT,
    "tczNumber" TEXT,
    "tczCertificateExpiry" TIMESTAMP(3),
    "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'FULL_TIME',
    "dateJoined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "targetRole" "SystemRole",
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionApplication" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "programmeChoice" TEXT,
    "intakeLabel" TEXT,
    "status" "AdmissionApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "decisionAt" TIMESTAMP(3),
    "enrolledLearnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionStatusHistory" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStatus" "AdmissionApplicationStatus",
    "toStatus" "AdmissionApplicationStatus" NOT NULL,
    "reason" TEXT,
    "changedByUserId" TEXT,
    "metadataJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleWorkspaceRecord" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "moduleSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "metadataJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModuleWorkspaceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "headOfDeptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programme" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qualificationLevel" TEXT NOT NULL,
    "durationYears" INTEGER NOT NULL DEFAULT 3,
    "accreditingCouncil" "CouncilType" NOT NULL DEFAULT 'NMCZ',
    "tuitionFeePerSem" DECIMAL(10,2) NOT NULL DEFAULT 6500.00,
    "clinicalFeePerSem" DECIMAL(10,2) NOT NULL DEFAULT 1500.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Programme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseModule" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creditUnits" INTEGER NOT NULL DEFAULT 3,
    "semesterNumber" INTEGER NOT NULL DEFAULT 1,
    "theoryHours" INTEGER NOT NULL DEFAULT 45,
    "practicalHours" INTEGER NOT NULL DEFAULT 60,
    "isClinical" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cohort" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "intake" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL DEFAULT '2026',
    "currentYear" INTEGER NOT NULL DEFAULT 1,
    "currentSemester" INTEGER NOT NULL DEFAULT 1,
    "capacity" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseRegistration" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "courseModuleId" TEXT NOT NULL,
    "semesterNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "examScore" DECIMAL(5,2),
    "continuousScore" DECIMAL(5,2),
    "finalScore" DECIMAL(5,2),
    "finalGrade" TEXT,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulatoryIndexing" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "council" "CouncilType" NOT NULL DEFAULT 'NMCZ',
    "indexNumber" TEXT,
    "status" "IndexingStatus" NOT NULL DEFAULT 'PENDING_SUBMISSION',
    "submissionDate" TIMESTAMP(3),
    "indexedDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "documentsVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegulatoryIndexing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalSite" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "siteType" "ClinicalSiteType" NOT NULL DEFAULT 'GENERAL_HOSPITAL',
    "location" TEXT NOT NULL,
    "province" TEXT NOT NULL DEFAULT 'North-Western',
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "capacityStudents" INTEGER NOT NULL DEFAULT 30,
    "mouValidUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalSupervisor" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "clinicalSiteId" TEXT NOT NULL,
    "staffId" TEXT,
    "fullName" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "councilRegNumber" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalSupervisor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalPlacement" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "clinicalSiteId" TEXT NOT NULL,
    "wardOrDept" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PlacementStatus" NOT NULL DEFAULT 'SCHEDULED',
    "totalHoursTarget" INTEGER NOT NULL DEFAULT 120,
    "hoursCompleted" INTEGER NOT NULL DEFAULT 0,
    "supervisorRemarks" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalRotation" (
    "id" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "supervisorId" TEXT,
    "rotationName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "requiredProcedures" INTEGER NOT NULL DEFAULT 10,
    "completedProcedures" INTEGER NOT NULL DEFAULT 0,
    "supervisorNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalRotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalLogbookEntry" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "rotationId" TEXT,
    "procedureCategory" TEXT NOT NULL,
    "caseSummaryDeidentified" TEXT NOT NULL,
    "hoursLogged" DECIMAL(4,1) NOT NULL DEFAULT 4.0,
    "procedureDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "competencySelfRating" TEXT,
    "isSupervisorSigned" BOOLEAN NOT NULL DEFAULT false,
    "supervisorId" TEXT,
    "supervisorSignedAt" TIMESTAMP(3),
    "supervisorFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalLogbookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyAssessment" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "procedureName" TEXT NOT NULL,
    "level" "CompetencyLevel" NOT NULL DEFAULT 'NOVICE',
    "attemptsCount" INTEGER NOT NULL DEFAULT 1,
    "evaluatedById" TEXT NOT NULL,
    "evaluatorRemarks" TEXT,
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetencyAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsceStation" (
    "id" TEXT NOT NULL,
    "courseModuleId" TEXT NOT NULL,
    "stationNumber" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "maxScore" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "timeAllowedMins" INTEGER NOT NULL DEFAULT 7,
    "checklistJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OsceStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsceResult" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "examinerId" TEXT NOT NULL,
    "scoreObtained" DECIMAL(5,2) NOT NULL,
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "feedback" TEXT,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OsceResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentIntent" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "learnerId" TEXT,
    "invoiceId" TEXT,
    "channel" "PaymentChannel" NOT NULL DEFAULT 'MTN_MOMO',
    "status" "PaymentIntentStatus" NOT NULL DEFAULT 'CREATED',
    "amountZMW" DECIMAL(10,2) NOT NULL,
    "payerPhone" TEXT,
    "payerName" TEXT,
    "businessReference" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "providerReference" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "settledAt" TIMESTAMP(3),
    "reconciledAt" TIMESTAMP(3),
    "rawMetadataJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderTransaction" (
    "id" TEXT NOT NULL,
    "paymentIntentId" TEXT NOT NULL,
    "providerCode" TEXT NOT NULL,
    "providerTxId" TEXT,
    "requestPayload" TEXT,
    "responsePayload" TEXT,
    "httpStatus" INTEGER NOT NULL DEFAULT 200,
    "status" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookInboxEvent" (
    "id" TEXT NOT NULL,
    "providerCode" TEXT NOT NULL,
    "signatureHeader" TEXT,
    "payloadJson" TEXT NOT NULL,
    "status" "WebhookStatus" NOT NULL DEFAULT 'RECEIVED',
    "isSignatureValid" BOOLEAN NOT NULL DEFAULT false,
    "processingError" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookInboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementBatch" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "providerCode" TEXT NOT NULL,
    "batchReference" TEXT NOT NULL,
    "settlementDate" TIMESTAMP(3) NOT NULL,
    "totalAmountZMW" DECIMAL(12,2) NOT NULL,
    "feeAmountZMW" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "netAmountZMW" DECIMAL(12,2) NOT NULL,
    "isReconciled" BOOLEAN NOT NULL DEFAULT false,
    "reconciledAt" TIMESTAMP(3),
    "reconciledById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementLine" (
    "id" TEXT NOT NULL,
    "settlementBatchId" TEXT NOT NULL,
    "providerTxId" TEXT NOT NULL,
    "amountZMW" DECIMAL(10,2) NOT NULL,
    "feeZMW" DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    "netZMW" DECIMAL(10,2) NOT NULL,
    "isMatched" BOOLEAN NOT NULL DEFAULT false,
    "matchedPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationException" (
    "id" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "discrepancyType" TEXT NOT NULL,
    "amountExpected" DECIMAL(10,2),
    "amountReceived" DECIMAL(10,2),
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolutionAction" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReconciliationException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRefund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amountZMW" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "reversalLedgerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentRefund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffContract" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "basicSalaryZMW" DECIMAL(10,2) NOT NULL,
    "housingAllowance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "transportAllowance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "clinicalAllowance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "tpin" TEXT,
    "napsaNumber" TEXT,
    "wcfcbClass" TEXT NOT NULL DEFAULT 'HEALTH_EDUCATION_CLASS_4',
    "nhimaNumber" TEXT,
    "bankName" TEXT,
    "bankAccountMasked" TEXT,
    "contractStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contractEndDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatutoryRuleSet" (
    "id" TEXT NOT NULL,
    "authority" "StatutoryAuthority" NOT NULL,
    "title" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "rulesJson" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "approvedBy" TEXT NOT NULL DEFAULT 'Accountant General / Principal',
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatutoryRuleSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRun" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "periodName" TEXT NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "totalGrossZMW" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "totalNetZMW" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "totalPayeZMW" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "totalNapsaEmpZMW" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "totalNapsaEmployerZMW" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "totalWcfcbEmployerZMW" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "preparedById" TEXT,
    "reviewedById" TEXT,
    "approvedById" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRunLine" (
    "id" TEXT NOT NULL,
    "payrollRunId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "basicSalaryZMW" DECIMAL(10,2) NOT NULL,
    "totalAllowancesZMW" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "grossPayZMW" DECIMAL(10,2) NOT NULL,
    "payeDeductionZMW" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "napsaEmployeeZMW" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "otherDeductionsZMW" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "netPayZMW" DECIMAL(10,2) NOT NULL,
    "napsaEmployerZMW" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "wcfcbEmployerZMW" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "isDisbursed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollRunLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaySlip" (
    "id" TEXT NOT NULL,
    "payrollRunLineId" TEXT NOT NULL,
    "slipNumber" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "breakdownJson" TEXT NOT NULL,
    "pdfDownloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaySlip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatutoryFilingEvidence" (
    "id" TEXT NOT NULL,
    "payrollRunId" TEXT NOT NULL,
    "authority" "StatutoryAuthority" NOT NULL,
    "submissionType" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "remittedAmountZMW" DECIMAL(12,2) NOT NULL,
    "filingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptDocumentUrl" TEXT,
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatutoryFilingEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentEntitlement" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "serviceType" "ServiceEntitlementType" NOT NULL,
    "status" "EntitlementStatus" NOT NULL DEFAULT 'ACTIVE',
    "grantedByPolicy" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isSafetyExempt" BOOLEAN NOT NULL DEFAULT false,
    "overrideNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelBuilding" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genderPolicy" "HostelGenderPolicy" NOT NULL DEFAULT 'FEMALE_ONLY',
    "totalRooms" INTEGER NOT NULL DEFAULT 20,
    "totalBeds" INTEGER NOT NULL DEFAULT 80,
    "wardenName" TEXT,
    "wardenPhone" TEXT,
    "feePerSemesterZMW" DECIMAL(10,2) NOT NULL DEFAULT 2200.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostelBuilding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelRoom" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "floor" INTEGER NOT NULL DEFAULT 1,
    "capacityBeds" INTEGER NOT NULL DEFAULT 4,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostelRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelBed" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "bedNumber" TEXT NOT NULL,
    "isOccupied" BOOLEAN NOT NULL DEFAULT false,
    "currentLearnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostelBed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelAllocation" (
    "id" TEXT NOT NULL,
    "bedId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL DEFAULT '2026',
    "semesterNumber" INTEGER NOT NULL DEFAULT 1,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "checkInDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostelAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportSubscription" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "passQrCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransportSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryBook" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "isbn" TEXT,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "shelfLocation" TEXT,
    "totalCopies" INTEGER NOT NULL DEFAULT 5,
    "availableCopies" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryLoan" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "learnerId" TEXT,
    "staffId" TEXT,
    "borrowedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "returnedDate" TIMESTAMP(3),
    "fineAmountZMW" DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    "isReturned" BOOLEAN NOT NULL DEFAULT false,
    "issuedById" TEXT,

    CONSTRAINT "LibraryLoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampusAccessEvent" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT,
    "staffId" TEXT,
    "gateName" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "credentialMethod" TEXT NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "denialReason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampusAccessEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraduationClearance" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "academicCleared" BOOLEAN NOT NULL DEFAULT false,
    "financeCleared" BOOLEAN NOT NULL DEFAULT false,
    "clinicalCleared" BOOLEAN NOT NULL DEFAULT false,
    "libraryCleared" BOOLEAN NOT NULL DEFAULT false,
    "hostelCleared" BOOLEAN NOT NULL DEFAULT false,
    "isFullyCleared" BOOLEAN NOT NULL DEFAULT false,
    "clearedAt" TIMESTAMP(3),
    "certificateNumber" TEXT,
    "gpaOrClassification" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GraduationClearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumniProfile" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL DEFAULT 2026,
    "programmeName" TEXT NOT NULL,
    "employerName" TEXT,
    "currentRole" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlumniProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_code_key" ON "Organisation"("code");

-- CreateIndex
CREATE INDEX "Organisation_code_idx" ON "Organisation"("code");

-- CreateIndex
CREATE INDEX "Campus_organisationId_idx" ON "Campus"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "Campus_organisationId_code_key" ON "Campus"("organisationId", "code");

-- CreateIndex
CREATE INDEX "CatchmentZone_organisationId_campusId_idx" ON "CatchmentZone"("organisationId", "campusId");

-- CreateIndex
CREATE INDEX "TransportRoute_organisationId_campusId_idx" ON "TransportRoute"("organisationId", "campusId");

-- CreateIndex
CREATE UNIQUE INDEX "TransportRoute_organisationId_routeCode_key" ON "TransportRoute"("organisationId", "routeCode");

-- CreateIndex
CREATE INDEX "Subscription_organisationId_status_idx" ON "Subscription"("organisationId", "status");

-- CreateIndex
CREATE INDEX "ModuleEntitlement_organisationId_idx" ON "ModuleEntitlement"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleEntitlement_organisationId_moduleKey_key" ON "ModuleEntitlement"("organisationId", "moduleKey");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organisationId_role_idx" ON "User"("organisationId", "role");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuditEvent_organisationId_entityType_entityId_idx" ON "AuditEvent"("organisationId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "Learner_organisationId_status_idx" ON "Learner"("organisationId", "status");

-- CreateIndex
CREATE INDEX "Learner_currentClassId_idx" ON "Learner"("currentClassId");

-- CreateIndex
CREATE UNIQUE INDEX "Learner_organisationId_studentNumber_key" ON "Learner"("organisationId", "studentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_userId_key" ON "Guardian"("userId");

-- CreateIndex
CREATE INDEX "Guardian_organisationId_phone_idx" ON "Guardian"("organisationId", "phone");

-- CreateIndex
CREATE INDEX "LearnerGuardianRelationship_guardianId_idx" ON "LearnerGuardianRelationship"("guardianId");

-- CreateIndex
CREATE INDEX "LearnerGuardianRelationship_learnerId_idx" ON "LearnerGuardianRelationship"("learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerGuardianRelationship_learnerId_guardianId_key" ON "LearnerGuardianRelationship"("learnerId", "guardianId");

-- CreateIndex
CREATE INDEX "Enrolment_learnerId_academicYearId_idx" ON "Enrolment"("learnerId", "academicYearId");

-- CreateIndex
CREATE INDEX "AcademicYear_organisationId_isCurrent_idx" ON "AcademicYear"("organisationId", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_organisationId_name_key" ON "AcademicYear"("organisationId", "name");

-- CreateIndex
CREATE INDEX "Term_academicYearId_termNumber_idx" ON "Term"("academicYearId", "termNumber");

-- CreateIndex
CREATE INDEX "Class_campusId_academicYearId_idx" ON "Class"("campusId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_organisationId_code_key" ON "Subject"("organisationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectAssignment_classId_subjectId_key" ON "SubjectAssignment"("classId", "subjectId");

-- CreateIndex
CREATE INDEX "Assessment_termId_subjectId_idx" ON "Assessment"("termId", "subjectId");

-- CreateIndex
CREATE INDEX "Score_learnerId_idx" ON "Score"("learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_assessmentId_learnerId_key" ON "Score"("assessmentId", "learnerId");

-- CreateIndex
CREATE INDEX "CompetencyObservation_learnerId_termId_idx" ON "CompetencyObservation"("learnerId", "termId");

-- CreateIndex
CREATE INDEX "ReportCardVersion_learnerId_status_idx" ON "ReportCardVersion"("learnerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ReportCardVersion_learnerId_termId_versionNumber_key" ON "ReportCardVersion"("learnerId", "termId", "versionNumber");

-- CreateIndex
CREATE INDEX "AttendanceSession_date_idx" ON "AttendanceSession"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceSession_classId_date_key" ON "AttendanceSession"("classId", "date");

-- CreateIndex
CREATE INDEX "AttendanceRecord_learnerId_status_idx" ON "AttendanceRecord"("learnerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_sessionId_learnerId_key" ON "AttendanceRecord"("sessionId", "learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "AbsenceExplanation_attendanceRecordId_key" ON "AbsenceExplanation"("attendanceRecordId");

-- CreateIndex
CREATE INDEX "FeeSchedule_organisationId_academicYearId_idx" ON "FeeSchedule"("organisationId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_idempotencyKey_key" ON "Invoice"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Invoice_organisationId_status_idx" ON "Invoice"("organisationId", "status");

-- CreateIndex
CREATE INDEX "Invoice_learnerId_idx" ON "Invoice"("learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_organisationId_invoiceNumber_key" ON "Invoice"("organisationId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "Payment_organisationId_referenceNumber_idx" ON "Payment"("organisationId", "referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_organisationId_paymentNumber_key" ON "Payment"("organisationId", "paymentNumber");

-- CreateIndex
CREATE INDEX "PaymentAllocation_paymentId_idx" ON "PaymentAllocation"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentAllocation_invoiceId_idx" ON "PaymentAllocation"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_paymentId_key" ON "Receipt"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_organisationId_receiptNumber_key" ON "Receipt"("organisationId", "receiptNumber");

-- CreateIndex
CREATE INDEX "LedgerEntry_organisationId_learnerId_idx" ON "LedgerEntry"("organisationId", "learnerId");

-- CreateIndex
CREATE INDEX "LedgerEntry_postedAt_idx" ON "LedgerEntry"("postedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_key" ON "Staff"("userId");

-- CreateIndex
CREATE INDEX "Staff_organisationId_tczNumber_idx" ON "Staff"("organisationId", "tczNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_organisationId_staffNumber_key" ON "Staff"("organisationId", "staffNumber");

-- CreateIndex
CREATE INDEX "Notice_organisationId_publishedAt_idx" ON "Notice"("organisationId", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionApplication_enrolledLearnerId_key" ON "AdmissionApplication"("enrolledLearnerId");

-- CreateIndex
CREATE INDEX "AdmissionApplication_organisationId_email_idx" ON "AdmissionApplication"("organisationId", "email");

-- CreateIndex
CREATE INDEX "AdmissionApplication_organisationId_status_idx" ON "AdmissionApplication"("organisationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionApplication_organisationId_applicationNumber_key" ON "AdmissionApplication"("organisationId", "applicationNumber");

-- CreateIndex
CREATE INDEX "AdmissionStatusHistory_changedByUserId_idx" ON "AdmissionStatusHistory"("changedByUserId");

-- CreateIndex
CREATE INDEX "AdmissionStatusHistory_organisationId_applicationId_created_idx" ON "AdmissionStatusHistory"("organisationId", "applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "ModuleWorkspaceRecord_organisationId_moduleSlug_updatedAt_idx" ON "ModuleWorkspaceRecord"("organisationId", "moduleSlug", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleWorkspaceRecord_organisationId_moduleSlug_title_key" ON "ModuleWorkspaceRecord"("organisationId", "moduleSlug", "title");

-- CreateIndex
CREATE INDEX "Department_organisationId_idx" ON "Department"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_organisationId_code_key" ON "Department"("organisationId", "code");

-- CreateIndex
CREATE INDEX "Programme_organisationId_departmentId_idx" ON "Programme"("organisationId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Programme_organisationId_code_key" ON "Programme"("organisationId", "code");

-- CreateIndex
CREATE INDEX "CourseModule_programmeId_semesterNumber_idx" ON "CourseModule"("programmeId", "semesterNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CourseModule_programmeId_code_key" ON "CourseModule"("programmeId", "code");

-- CreateIndex
CREATE INDEX "Cohort_organisationId_programmeId_idx" ON "Cohort"("organisationId", "programmeId");

-- CreateIndex
CREATE UNIQUE INDEX "Cohort_organisationId_name_key" ON "Cohort"("organisationId", "name");

-- CreateIndex
CREATE INDEX "CourseRegistration_learnerId_idx" ON "CourseRegistration"("learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseRegistration_learnerId_courseModuleId_key" ON "CourseRegistration"("learnerId", "courseModuleId");

-- CreateIndex
CREATE UNIQUE INDEX "RegulatoryIndexing_learnerId_key" ON "RegulatoryIndexing"("learnerId");

-- CreateIndex
CREATE INDEX "RegulatoryIndexing_organisationId_status_idx" ON "RegulatoryIndexing"("organisationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RegulatoryIndexing_council_indexNumber_key" ON "RegulatoryIndexing"("council", "indexNumber");

-- CreateIndex
CREATE INDEX "ClinicalSite_organisationId_idx" ON "ClinicalSite"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicalSite_organisationId_code_key" ON "ClinicalSite"("organisationId", "code");

-- CreateIndex
CREATE INDEX "ClinicalSupervisor_organisationId_clinicalSiteId_idx" ON "ClinicalSupervisor"("organisationId", "clinicalSiteId");

-- CreateIndex
CREATE INDEX "ClinicalPlacement_organisationId_learnerId_idx" ON "ClinicalPlacement"("organisationId", "learnerId");

-- CreateIndex
CREATE INDEX "ClinicalPlacement_clinicalSiteId_status_idx" ON "ClinicalPlacement"("clinicalSiteId", "status");

-- CreateIndex
CREATE INDEX "ClinicalRotation_placementId_idx" ON "ClinicalRotation"("placementId");

-- CreateIndex
CREATE INDEX "ClinicalLogbookEntry_learnerId_isSupervisorSigned_idx" ON "ClinicalLogbookEntry"("learnerId", "isSupervisorSigned");

-- CreateIndex
CREATE INDEX "ClinicalLogbookEntry_placementId_idx" ON "ClinicalLogbookEntry"("placementId");

-- CreateIndex
CREATE INDEX "CompetencyAssessment_learnerId_procedureName_idx" ON "CompetencyAssessment"("learnerId", "procedureName");

-- CreateIndex
CREATE INDEX "OsceStation_courseModuleId_idx" ON "OsceStation"("courseModuleId");

-- CreateIndex
CREATE INDEX "OsceResult_learnerId_idx" ON "OsceResult"("learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "OsceResult_stationId_learnerId_key" ON "OsceResult"("stationId", "learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_idempotencyKey_key" ON "PaymentIntent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentIntent_organisationId_status_idx" ON "PaymentIntent"("organisationId", "status");

-- CreateIndex
CREATE INDEX "PaymentIntent_learnerId_idx" ON "PaymentIntent"("learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_organisationId_businessReference_key" ON "PaymentIntent"("organisationId", "businessReference");

-- CreateIndex
CREATE INDEX "ProviderTransaction_paymentIntentId_idx" ON "ProviderTransaction"("paymentIntentId");

-- CreateIndex
CREATE INDEX "ProviderTransaction_providerTxId_idx" ON "ProviderTransaction"("providerTxId");

-- CreateIndex
CREATE INDEX "WebhookInboxEvent_providerCode_status_idx" ON "WebhookInboxEvent"("providerCode", "status");

-- CreateIndex
CREATE INDEX "SettlementBatch_organisationId_isReconciled_idx" ON "SettlementBatch"("organisationId", "isReconciled");

-- CreateIndex
CREATE UNIQUE INDEX "SettlementBatch_organisationId_batchReference_key" ON "SettlementBatch"("organisationId", "batchReference");

-- CreateIndex
CREATE INDEX "SettlementLine_settlementBatchId_isMatched_idx" ON "SettlementLine"("settlementBatchId", "isMatched");

-- CreateIndex
CREATE INDEX "ReconciliationException_isResolved_idx" ON "ReconciliationException"("isResolved");

-- CreateIndex
CREATE INDEX "PaymentRefund_paymentId_idx" ON "PaymentRefund"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffContract_staffId_key" ON "StaffContract"("staffId");

-- CreateIndex
CREATE INDEX "StatutoryRuleSet_authority_effectiveFrom_idx" ON "StatutoryRuleSet"("authority", "effectiveFrom");

-- CreateIndex
CREATE INDEX "PayrollRun_organisationId_status_idx" ON "PayrollRun"("organisationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRun_organisationId_periodMonth_periodYear_key" ON "PayrollRun"("organisationId", "periodMonth", "periodYear");

-- CreateIndex
CREATE INDEX "PayrollRunLine_payrollRunId_idx" ON "PayrollRunLine"("payrollRunId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRunLine_payrollRunId_staffId_key" ON "PayrollRunLine"("payrollRunId", "staffId");

-- CreateIndex
CREATE UNIQUE INDEX "PaySlip_payrollRunLineId_key" ON "PaySlip"("payrollRunLineId");

-- CreateIndex
CREATE UNIQUE INDEX "PaySlip_slipNumber_key" ON "PaySlip"("slipNumber");

-- CreateIndex
CREATE INDEX "StatutoryFilingEvidence_payrollRunId_authority_idx" ON "StatutoryFilingEvidence"("payrollRunId", "authority");

-- CreateIndex
CREATE INDEX "StudentEntitlement_learnerId_status_idx" ON "StudentEntitlement"("learnerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StudentEntitlement_learnerId_serviceType_key" ON "StudentEntitlement"("learnerId", "serviceType");

-- CreateIndex
CREATE INDEX "HostelBuilding_campusId_idx" ON "HostelBuilding"("campusId");

-- CreateIndex
CREATE INDEX "HostelRoom_buildingId_idx" ON "HostelRoom"("buildingId");

-- CreateIndex
CREATE UNIQUE INDEX "HostelRoom_buildingId_roomNumber_key" ON "HostelRoom"("buildingId", "roomNumber");

-- CreateIndex
CREATE UNIQUE INDEX "HostelBed_currentLearnerId_key" ON "HostelBed"("currentLearnerId");

-- CreateIndex
CREATE INDEX "HostelBed_roomId_isOccupied_idx" ON "HostelBed"("roomId", "isOccupied");

-- CreateIndex
CREATE UNIQUE INDEX "HostelBed_roomId_bedNumber_key" ON "HostelBed"("roomId", "bedNumber");

-- CreateIndex
CREATE INDEX "HostelAllocation_bedId_idx" ON "HostelAllocation"("bedId");

-- CreateIndex
CREATE INDEX "HostelAllocation_learnerId_idx" ON "HostelAllocation"("learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "TransportSubscription_passQrCode_key" ON "TransportSubscription"("passQrCode");

-- CreateIndex
CREATE INDEX "TransportSubscription_learnerId_status_idx" ON "TransportSubscription"("learnerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TransportSubscription_learnerId_termId_key" ON "TransportSubscription"("learnerId", "termId");

-- CreateIndex
CREATE INDEX "LibraryBook_organisationId_category_idx" ON "LibraryBook"("organisationId", "category");

-- CreateIndex
CREATE INDEX "LibraryLoan_bookId_idx" ON "LibraryLoan"("bookId");

-- CreateIndex
CREATE INDEX "LibraryLoan_learnerId_idx" ON "LibraryLoan"("learnerId");

-- CreateIndex
CREATE INDEX "CampusAccessEvent_gateName_timestamp_idx" ON "CampusAccessEvent"("gateName", "timestamp");

-- CreateIndex
CREATE INDEX "CampusAccessEvent_learnerId_idx" ON "CampusAccessEvent"("learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "GraduationClearance_learnerId_key" ON "GraduationClearance"("learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "GraduationClearance_certificateNumber_key" ON "GraduationClearance"("certificateNumber");

-- CreateIndex
CREATE INDEX "GraduationClearance_isFullyCleared_idx" ON "GraduationClearance"("isFullyCleared");

-- CreateIndex
CREATE UNIQUE INDEX "AlumniProfile_learnerId_key" ON "AlumniProfile"("learnerId");

-- AddForeignKey
ALTER TABLE "Campus" ADD CONSTRAINT "Campus_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatchmentZone" ADD CONSTRAINT "CatchmentZone_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportRoute" ADD CONSTRAINT "TransportRoute_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleEntitlement" ADD CONSTRAINT "ModuleEntitlement_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Learner" ADD CONSTRAINT "Learner_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Learner" ADD CONSTRAINT "Learner_currentClassId_fkey" FOREIGN KEY ("currentClassId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Learner" ADD CONSTRAINT "Learner_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerGuardianRelationship" ADD CONSTRAINT "LearnerGuardianRelationship_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerGuardianRelationship" ADD CONSTRAINT "LearnerGuardianRelationship_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_classTeacherId_fkey" FOREIGN KEY ("classTeacherId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectAssignment" ADD CONSTRAINT "SubjectAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectAssignment" ADD CONSTRAINT "SubjectAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectAssignment" ADD CONSTRAINT "SubjectAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyObservation" ADD CONSTRAINT "CompetencyObservation_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCardVersion" ADD CONSTRAINT "ReportCardVersion_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCardVersion" ADD CONSTRAINT "ReportCardVersion_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCardVersion" ADD CONSTRAINT "ReportCardVersion_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AttendanceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsenceExplanation" ADD CONSTRAINT "AbsenceExplanation_attendanceRecordId_fkey" FOREIGN KEY ("attendanceRecordId") REFERENCES "AttendanceRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsenceExplanation" ADD CONSTRAINT "AbsenceExplanation_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeSchedule" ADD CONSTRAINT "FeeSchedule_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeSchedule" ADD CONSTRAINT "FeeSchedule_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_enrolledLearnerId_fkey" FOREIGN KEY ("enrolledLearnerId") REFERENCES "Learner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionStatusHistory" ADD CONSTRAINT "AdmissionStatusHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "AdmissionApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionStatusHistory" ADD CONSTRAINT "AdmissionStatusHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionStatusHistory" ADD CONSTRAINT "AdmissionStatusHistory_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleWorkspaceRecord" ADD CONSTRAINT "ModuleWorkspaceRecord_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Programme" ADD CONSTRAINT "Programme_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Programme" ADD CONSTRAINT "Programme_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cohort" ADD CONSTRAINT "Cohort_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cohort" ADD CONSTRAINT "Cohort_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRegistration" ADD CONSTRAINT "CourseRegistration_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRegistration" ADD CONSTRAINT "CourseRegistration_courseModuleId_fkey" FOREIGN KEY ("courseModuleId") REFERENCES "CourseModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulatoryIndexing" ADD CONSTRAINT "RegulatoryIndexing_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulatoryIndexing" ADD CONSTRAINT "RegulatoryIndexing_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulatoryIndexing" ADD CONSTRAINT "RegulatoryIndexing_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalSite" ADD CONSTRAINT "ClinicalSite_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalSupervisor" ADD CONSTRAINT "ClinicalSupervisor_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalSupervisor" ADD CONSTRAINT "ClinicalSupervisor_clinicalSiteId_fkey" FOREIGN KEY ("clinicalSiteId") REFERENCES "ClinicalSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalSupervisor" ADD CONSTRAINT "ClinicalSupervisor_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalPlacement" ADD CONSTRAINT "ClinicalPlacement_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalPlacement" ADD CONSTRAINT "ClinicalPlacement_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalPlacement" ADD CONSTRAINT "ClinicalPlacement_clinicalSiteId_fkey" FOREIGN KEY ("clinicalSiteId") REFERENCES "ClinicalSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalRotation" ADD CONSTRAINT "ClinicalRotation_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "ClinicalPlacement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalRotation" ADD CONSTRAINT "ClinicalRotation_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "ClinicalSupervisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalLogbookEntry" ADD CONSTRAINT "ClinicalLogbookEntry_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalLogbookEntry" ADD CONSTRAINT "ClinicalLogbookEntry_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "ClinicalPlacement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalLogbookEntry" ADD CONSTRAINT "ClinicalLogbookEntry_rotationId_fkey" FOREIGN KEY ("rotationId") REFERENCES "ClinicalRotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyAssessment" ADD CONSTRAINT "CompetencyAssessment_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsceStation" ADD CONSTRAINT "OsceStation_courseModuleId_fkey" FOREIGN KEY ("courseModuleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsceResult" ADD CONSTRAINT "OsceResult_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "OsceStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsceResult" ADD CONSTRAINT "OsceResult_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderTransaction" ADD CONSTRAINT "ProviderTransaction_paymentIntentId_fkey" FOREIGN KEY ("paymentIntentId") REFERENCES "PaymentIntent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementBatch" ADD CONSTRAINT "SettlementBatch_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementLine" ADD CONSTRAINT "SettlementLine_settlementBatchId_fkey" FOREIGN KEY ("settlementBatchId") REFERENCES "SettlementBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationException" ADD CONSTRAINT "ReconciliationException_paymentIntentId_fkey" FOREIGN KEY ("paymentIntentId") REFERENCES "PaymentIntent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRefund" ADD CONSTRAINT "PaymentRefund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffContract" ADD CONSTRAINT "StaffContract_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRun" ADD CONSTRAINT "PayrollRun_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRunLine" ADD CONSTRAINT "PayrollRunLine_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRunLine" ADD CONSTRAINT "PayrollRunLine_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaySlip" ADD CONSTRAINT "PaySlip_payrollRunLineId_fkey" FOREIGN KEY ("payrollRunLineId") REFERENCES "PayrollRunLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatutoryFilingEvidence" ADD CONSTRAINT "StatutoryFilingEvidence_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEntitlement" ADD CONSTRAINT "StudentEntitlement_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelBuilding" ADD CONSTRAINT "HostelBuilding_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelRoom" ADD CONSTRAINT "HostelRoom_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "HostelBuilding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelBed" ADD CONSTRAINT "HostelBed_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "HostelRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelAllocation" ADD CONSTRAINT "HostelAllocation_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "HostelBed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelAllocation" ADD CONSTRAINT "HostelAllocation_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportSubscription" ADD CONSTRAINT "TransportSubscription_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportSubscription" ADD CONSTRAINT "TransportSubscription_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "TransportRoute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryBook" ADD CONSTRAINT "LibraryBook_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryLoan" ADD CONSTRAINT "LibraryLoan_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "LibraryBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryLoan" ADD CONSTRAINT "LibraryLoan_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryLoan" ADD CONSTRAINT "LibraryLoan_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationClearance" ADD CONSTRAINT "GraduationClearance_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumniProfile" ADD CONSTRAINT "AlumniProfile_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

