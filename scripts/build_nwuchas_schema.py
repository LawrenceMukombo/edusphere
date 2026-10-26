import re

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    schema = f.read()

# 1. Update Organisation with new relations
org_relations = """  departments            Department[]
  programmes             Programme[]
  cohorts                Cohort[]
  clinicalSites          ClinicalSite[]
  clinicalSupervisors    ClinicalSupervisor[]
  clinicalPlacements     ClinicalPlacement[]
  regulatoryIndexings    RegulatoryIndexing[]
  paymentIntents         PaymentIntent[]
  settlementBatches      SettlementBatch[]
  payrollRuns            PayrollRun[]
  libraryBooks           LibraryBook[]
"""
if "departments            Department[]" not in schema:
    schema = schema.replace(
        "  users                  User[]\n",
        "  users                  User[]\n" + org_relations
    )

# 2. Update Campus with hostelBuildings
if "hostelBuildings        HostelBuilding[]" not in schema:
    schema = schema.replace(
        "  transportRoutes   TransportRoute[]\n",
        "  transportRoutes   TransportRoute[]\n  hostelBuildings   HostelBuilding[]\n"
    )

# 3. Update Learner with new relations
learner_relations = """  courseRegistrations    CourseRegistration[]
  indexingRecord         RegulatoryIndexing?
  clinicalPlacements     ClinicalPlacement[]
  clinicalLogbookEntries ClinicalLogbookEntry[]
  competencyAssessments  CompetencyAssessment[]
  osceResults            OsceResult[]
  paymentIntents         PaymentIntent[]
  studentEntitlements    StudentEntitlement[]
  hostelAllocations      HostelAllocation[]
  transportSubscriptions TransportSubscription[]
  libraryLoans           LibraryLoan[]
  graduationClearance    GraduationClearance?
  alumniProfile          AlumniProfile?
"""
if "courseRegistrations    CourseRegistration[]" not in schema:
    schema = schema.replace(
        "  scores                 Score[]\n",
        "  scores                 Score[]\n" + learner_relations
    )

# 4. Update Staff with contract, payrollLines, etc.
staff_relations = """  clinicalSupervisors    ClinicalSupervisor[]
  contract               StaffContract?
  payrollLines           PayrollRunLine[]
  libraryLoans           LibraryLoan[]
"""
if "payrollLines           PayrollRunLine[]" not in schema:
    schema = schema.replace(
        "  subjectsTaught       SubjectAssignment[]\n",
        "  subjectsTaught       SubjectAssignment[]\n" + staff_relations
    )

# 5. Update Invoice with paymentIntents
if "paymentIntents         PaymentIntent[]" not in schema:
    schema = schema.replace(
        "  ledgerEntries   LedgerEntry[]\n",
        "  ledgerEntries   LedgerEntry[]\n  paymentIntents  PaymentIntent[]\n"
    )

# 6. Update Payment with refunds
if "refunds                PaymentRefund[]" not in schema:
    schema = schema.replace(
        "  ledgerEntries   LedgerEntry[]\n  receipt         Receipt?\n",
        "  ledgerEntries   LedgerEntry[]\n  receipt         Receipt?\n  refunds         PaymentRefund[]\n"
    )

# 7. Update TransportRoute with subscriptions
if "subscriptions          TransportSubscription[]" not in schema:
    schema = schema.replace(
        "  campus          Campus       @relation(fields: [campusId], references: [id], onDelete: Cascade)\n\n  @@unique([organisationId, routeCode])",
        "  campus          Campus       @relation(fields: [campusId], references: [id], onDelete: Cascade)\n  subscriptions   TransportSubscription[]\n\n  @@unique([organisationId, routeCode])"
    )

new_extensions = """
// ============================================================================
// NWUCHAS HIGHER EDUCATION & HEALTH SCIENCES EXTENSION MODELS
// ============================================================================

enum CouncilType {
  NMCZ // Nursing and Midwifery Council of Zambia
  HPCZ // Health Professions Council of Zambia
  HEA  // Higher Education Authority
}

enum IndexingStatus {
  PENDING_SUBMISSION
  SUBMITTED
  INDEXED
  REJECTED
  EXPIRED
}

enum ClinicalSiteType {
  GENERAL_HOSPITAL
  FIRST_LEVEL_HOSPITAL
  HEALTH_CENTRE
  SPECIALISED_CLINIC
  COMMUNITY_POST
}

enum PlacementStatus {
  SCHEDULED
  ACTIVE
  COMPLETED
  EXTENDED
  REMEDIATION
  WITHDRAWN
}

enum CompetencyLevel {
  NOVICE
  DEVELOPING
  COMPETENT
  PROFICIENT
}

enum PaymentChannel {
  MTN_MOMO
  AIRTEL_MONEY
  ZAMTEL_MONEY
  CARD_HOSTED
  BANK_TRANSFER
  EFTPOS_TERMINAL
  MANUAL_CASH
}

enum PaymentIntentStatus {
  CREATED
  INITIATED
  PENDING_CUSTOMER
  PENDING_PROVIDER
  CONFIRMED
  FAILED
  CANCELLED
  EXPIRED
  REVERSED
  REFUNDED
}

enum WebhookStatus {
  RECEIVED
  VERIFIED
  PROCESSED
  RETRYING
  FAILED
  IGNORED
}

enum ServiceEntitlementType {
  BUS_TRANSPORT
  HOSTEL_ACCESS
  LIBRARY_LOAN
  EXAM_ADMISSION
  CAMPUS_GATE
  CLINICAL_ACCESS
}

enum EntitlementStatus {
  ACTIVE
  SUSPENDED
  EXPIRED
  REVOKED
}

enum PayrollStatus {
  DRAFT
  INPUTS_VALIDATED
  CALCULATED
  REVIEWED
  APPROVED_LOCKED
  DISBURSED
  RECONCILED
}

enum StatutoryAuthority {
  ZRA_PAYE
  NAPSA
  WCFCB
  NHIMA
}

enum HostelGenderPolicy {
  MALE_ONLY
  FEMALE_ONLY
  CO_ED_SEGREGATED
}

// ----------------------------------------------------------------------------
// ACADEMICS & HIGHER EDUCATION PROGRAMMES
// ----------------------------------------------------------------------------

model Department {
  id             String       @id @default(uuid())
  organisationId String
  code           String       // e.g. "NURS", "CLIN", "PHARM", "PUBH"
  name           String       // e.g. "Department of Nursing & Midwifery"
  description    String?
  headOfDeptId   String?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @default(now()) @updatedAt

  organisation   Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  programmes     Programme[]

  @@unique([organisationId, code])
  @@index([organisationId])
}

model Programme {
  id                 String       @id @default(uuid())
  organisationId     String
  departmentId       String
  code               String       // e.g. "DRN", "DCM", "DPHARM", "BScN"
  name               String       // e.g. "Diploma in Registered Nursing"
  qualificationLevel String       // DIPLOMA, DEGREE, CERTIFICATE
  durationYears      Int          @default(3)
  accreditingCouncil CouncilType  @default(NMCZ)
  tuitionFeePerSem   Decimal      @default(6500.00) @db.Decimal(10, 2)
  clinicalFeePerSem  Decimal      @default(1500.00) @db.Decimal(10, 2)
  isActive           Boolean      @default(true)
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @default(now()) @updatedAt

  organisation       Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  department         Department   @relation(fields: [departmentId], references: [id], onDelete: Restrict)
  courses            CourseModule[]
  cohorts            Cohort[]
  indexingRecords    RegulatoryIndexing[]

  @@unique([organisationId, code])
  @@index([organisationId, departmentId])
}

model CourseModule {
  id              String       @id @default(uuid())
  programmeId     String
  code            String       // e.g. "NUR-110", "MED-210"
  name            String       // e.g. "Anatomy & Physiology for Nurses I"
  creditUnits     Int          @default(3)
  semesterNumber  Int          @default(1) // Semester 1, 2, 3, 4, 5, 6
  theoryHours     Int          @default(45)
  practicalHours  Int          @default(60)
  isClinical      Boolean      @default(false)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @default(now()) @updatedAt

  programme       Programme    @relation(fields: [programmeId], references: [id], onDelete: Cascade)
  registrations   CourseRegistration[]
  osceStations    OsceStation[]

  @@unique([programmeId, code])
  @@index([programmeId, semesterNumber])
}

model Cohort {
  id              String       @id @default(uuid())
  organisationId  String
  programmeId     String
  name            String       // e.g. "RN-2026-JAN", "CM-2026-JUL"
  intake          String       // "January 2026", "July 2026"
  academicYear    String       @default("2026")
  currentYear     Int          @default(1) // Year 1, Year 2, Year 3
  currentSemester Int          @default(1) // 1 to 6
  capacity        Int          @default(60)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @default(now()) @updatedAt

  organisation    Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  programme       Programme    @relation(fields: [programmeId], references: [id], onDelete: Restrict)

  @@unique([organisationId, name])
  @@index([organisationId, programmeId])
}

model CourseRegistration {
  id              String       @id @default(uuid())
  learnerId       String
  courseModuleId  String
  semesterNumber  Int
  status          String       @default("REGISTERED") // REGISTERED, DROPPED, PASSED, FAILED
  examScore       Decimal?     @db.Decimal(5, 2)
  continuousScore Decimal?     @db.Decimal(5, 2)
  finalScore      Decimal?     @db.Decimal(5, 2)
  finalGrade      String?      // A, B+, B, C+, C, D, F
  isModerated     Boolean      @default(false)
  isApproved      Boolean      @default(false)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @default(now()) @updatedAt

  learner         Learner      @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  courseModule    CourseModule @relation(fields: [courseModuleId], references: [id], onDelete: Restrict)

  @@unique([learnerId, courseModuleId])
  @@index([learnerId])
}

// ----------------------------------------------------------------------------
// NURSING & HEALTH SCIENCES CLINICAL TRAINING & REGULATORS
// ----------------------------------------------------------------------------

model RegulatoryIndexing {
  id                String         @id @default(uuid())
  organisationId    String
  learnerId         String         @unique
  programmeId       String
  council           CouncilType    @default(NMCZ)
  indexNumber       String?        // e.g. "NMCZ/RN/2026/0412"
  status            IndexingStatus @default(PENDING_SUBMISSION)
  submissionDate    DateTime?
  indexedDate       DateTime?
  expiryDate        DateTime?
  rejectionReason   String?
  documentsVerified Boolean        @default(false)
  verifiedById      String?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @default(now()) @updatedAt

  organisation      Organisation   @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  learner           Learner        @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  programme         Programme      @relation(fields: [programmeId], references: [id], onDelete: Restrict)

  @@unique([council, indexNumber])
  @@index([organisationId, status])
}

model ClinicalSite {
  id                String           @id @default(uuid())
  organisationId    String
  code              String           // e.g. "SOL-GEN", "LUM-HOSP", "MAN-HC"
  name              String           // e.g. "Solwezi General Hospital"
  siteType          ClinicalSiteType @default(GENERAL_HOSPITAL)
  location          String           // e.g. "Solwezi Central"
  province          String           @default("North-Western")
  contactPerson     String?
  contactPhone      String?
  capacityStudents  Int              @default(30)
  mouValidUntil     DateTime?
  isActive          Boolean          @default(true)
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @default(now()) @updatedAt

  organisation      Organisation     @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  placements        ClinicalPlacement[]
  supervisors       ClinicalSupervisor[]

  @@unique([organisationId, code])
  @@index([organisationId])
}

model ClinicalSupervisor {
  id                String       @id @default(uuid())
  organisationId    String
  clinicalSiteId    String
  staffId           String?
  fullName          String
  profession        String       // e.g. "Registered Nurse", "Medical Officer"
  councilRegNumber  String       // NMCZ or HPCZ registration
  phone             String
  email             String?
  isActive          Boolean      @default(true)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @default(now()) @updatedAt

  organisation      Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  clinicalSite      ClinicalSite @relation(fields: [clinicalSiteId], references: [id], onDelete: Cascade)
  staff             Staff?       @relation(fields: [staffId], references: [id], onDelete: SetNull)
  rotations         ClinicalRotation[]

  @@index([organisationId, clinicalSiteId])
}

model ClinicalPlacement {
  id                String          @id @default(uuid())
  organisationId    String
  learnerId         String
  clinicalSiteId    String
  wardOrDept        String          // e.g. "Paediatric Ward", "Maternity / Labour Ward", "Surgical Ward"
  startDate         DateTime
  endDate           DateTime
  status            PlacementStatus @default(SCHEDULED)
  totalHoursTarget  Int             @default(120)
  hoursCompleted    Int             @default(0)
  supervisorRemarks String?
  isCompleted       Boolean         @default(false)
  completedAt       DateTime?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @default(now()) @updatedAt

  organisation      Organisation    @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  learner           Learner         @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  clinicalSite      ClinicalSite    @relation(fields: [clinicalSiteId], references: [id], onDelete: Restrict)
  rotations         ClinicalRotation[]
  logbookEntries    ClinicalLogbookEntry[]

  @@index([organisationId, learnerId])
  @@index([clinicalSiteId, status])
}

model ClinicalRotation {
  id                  String             @id @default(uuid())
  placementId         String
  supervisorId        String?
  rotationName        String             // e.g. "Post-Natal Care & Neonatal Triage"
  startDate           DateTime
  endDate             DateTime
  requiredProcedures  Int                @default(10)
  completedProcedures Int                @default(0)
  supervisorNotes     String?
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @default(now()) @updatedAt

  placement           ClinicalPlacement  @relation(fields: [placementId], references: [id], onDelete: Cascade)
  supervisor          ClinicalSupervisor? @relation(fields: [supervisorId], references: [id], onDelete: SetNull)
  logbookEntries      ClinicalLogbookEntry[]

  @@index([placementId])
}

model ClinicalLogbookEntry {
  id                      String             @id @default(uuid())
  learnerId               String
  placementId             String
  rotationId              String?
  procedureCategory       String             // e.g. "Wound Debridement", "Normal Delivery", "IV Cannulation"
  caseSummaryDeidentified String             // Crucial: De-identified patient details (age group, clinical diagnosis category)
  hoursLogged             Decimal            @default(4.0) @db.Decimal(4, 1)
  procedureDate           DateTime           @default(now())
  competencySelfRating    String?            // OBSERVED, ASSISTED, PERFORMED_UNDER_SUPERVISION, INDEPENDENT
  isSupervisorSigned      Boolean            @default(false)
  supervisorId            String?
  supervisorSignedAt      DateTime?
  supervisorFeedback      String?
  createdAt               DateTime           @default(now())
  updatedAt               DateTime           @default(now()) @updatedAt

  learner                 Learner            @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  placement               ClinicalPlacement  @relation(fields: [placementId], references: [id], onDelete: Cascade)
  rotation                ClinicalRotation?  @relation(fields: [rotationId], references: [id], onDelete: SetNull)

  @@index([learnerId, isSupervisorSigned])
  @@index([placementId])
}

model CompetencyAssessment {
  id                String          @id @default(uuid())
  learnerId         String
  procedureName     String          // e.g. "Aseptic Catheterisation", "Episiotomy & Repair"
  level             CompetencyLevel @default(NOVICE)
  attemptsCount     Int             @default(1)
  evaluatedById     String          // Supervisor or faculty examiner
  evaluatorRemarks  String?
  isPassed          Boolean         @default(false)
  assessedAt        DateTime        @default(now())
  createdAt         DateTime        @default(now())

  learner           Learner         @relation(fields: [learnerId], references: [id], onDelete: Cascade)

  @@index([learnerId, procedureName])
}

model OsceStation {
  id                String          @id @default(uuid())
  courseModuleId    String
  stationNumber     Int             @default(1)
  title             String          // e.g. "Station 1: Neonatal Resuscitation Technique"
  domain            String          // CLINICAL_SKILLS, COMMUNICATION, INTERPRETATION
  maxScore          Decimal         @default(20.00) @db.Decimal(5, 2)
  timeAllowedMins   Int             @default(7)
  checklistJson     String          // Array of rubrics [{ item, weight, criteria }]
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @default(now()) @updatedAt

  courseModule      CourseModule    @relation(fields: [courseModuleId], references: [id], onDelete: Cascade)
  results           OsceResult[]

  @@index([courseModuleId])
}

model OsceResult {
  id                String       @id @default(uuid())
  stationId         String
  learnerId         String
  examinerId        String
  scoreObtained     Decimal      @db.Decimal(5, 2)
  isPassed          Boolean      @default(false)
  feedback          String?
  evaluatedAt       DateTime     @default(now())

  station           OsceStation  @relation(fields: [stationId], references: [id], onDelete: Cascade)
  learner           Learner      @relation(fields: [learnerId], references: [id], onDelete: Cascade)

  @@unique([stationId, learnerId])
  @@index([learnerId])
}

// ----------------------------------------------------------------------------
// LAMTONPAY CONNECT & FINANCIAL ORCHESTRATION
// ----------------------------------------------------------------------------

model PaymentIntent {
  id                String              @id @default(uuid())
  organisationId    String
  learnerId         String?
  invoiceId         String?
  channel           PaymentChannel      @default(MTN_MOMO)
  status            PaymentIntentStatus @default(CREATED)
  amountZMW         Decimal             @db.Decimal(10, 2)
  payerPhone        String?             // e.g. "0961234567"
  payerName         String?
  businessReference String              // e.g. "LP-NWU-2026-00412"
  idempotencyKey    String              @unique
  providerReference String?             // MTN transactionId or Airtel ref
  expiresAt         DateTime
  settledAt         DateTime?
  reconciledAt      DateTime?
  rawMetadataJson   String?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @default(now()) @updatedAt

  organisation      Organisation        @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  learner           Learner?            @relation(fields: [learnerId], references: [id], onDelete: SetNull)
  invoice           Invoice?            @relation(fields: [invoiceId], references: [id], onDelete: SetNull)
  transactions      ProviderTransaction[]
  reconciliationEx  ReconciliationException[]

  @@unique([organisationId, businessReference])
  @@index([organisationId, status])
  @@index([learnerId])
}

model ProviderTransaction {
  id                String         @id @default(uuid())
  paymentIntentId   String
  providerCode      String         // "MTN_MOMO_ZM", "AIRTEL_MONEY_ZM", "DPO_PAY", "ABSA_EFTPOS"
  providerTxId      String?
  requestPayload    String?
  responsePayload   String?
  httpStatus        Int            @default(200)
  status            String         // SUCCESS, PENDING, FAILED, TIMEOUT
  isVerified        Boolean        @default(false)
  verifiedAt        DateTime?
  createdAt         DateTime       @default(now())

  paymentIntent     PaymentIntent  @relation(fields: [paymentIntentId], references: [id], onDelete: Cascade)

  @@index([paymentIntentId])
  @@index([providerTxId])
}

model WebhookInboxEvent {
  id                String        @id @default(uuid())
  providerCode      String        // "MTN_MOMO", "AIRTEL_MONEY"
  signatureHeader   String?
  payloadJson       String
  status            WebhookStatus @default(RECEIVED)
  isSignatureValid  Boolean       @default(false)
  processingError   String?
  processedAt       DateTime?
  createdAt         DateTime      @default(now())

  @@index([providerCode, status])
}

model SettlementBatch {
  id                String       @id @default(uuid())
  organisationId    String
  providerCode      String
  batchReference    String       // e.g. "SET-MTN-2026-04"
  settlementDate    DateTime
  totalAmountZMW    Decimal      @db.Decimal(12, 2)
  feeAmountZMW      Decimal      @default(0.00) @db.Decimal(10, 2)
  netAmountZMW      Decimal      @db.Decimal(12, 2)
  isReconciled      Boolean      @default(false)
  reconciledAt      DateTime?
  reconciledById    String?
  createdAt         DateTime     @default(now())

  organisation      Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  settlementLines   SettlementLine[]

  @@unique([organisationId, batchReference])
  @@index([organisationId, isReconciled])
}

model SettlementLine {
  id                String          @id @default(uuid())
  settlementBatchId String
  providerTxId      String
  amountZMW         Decimal         @db.Decimal(10, 2)
  feeZMW            Decimal         @default(0.00) @db.Decimal(8, 2)
  netZMW            Decimal         @db.Decimal(10, 2)
  isMatched         Boolean         @default(false)
  matchedPaymentId  String?
  createdAt         DateTime        @default(now())

  settlementBatch   SettlementBatch @relation(fields: [settlementBatchId], references: [id], onDelete: Cascade)

  @@index([settlementBatchId, isMatched])
}

model ReconciliationException {
  id                String        @id @default(uuid())
  paymentIntentId   String?
  discrepancyType   String        // AMOUNT_MISMATCH, UNKNOWN_PROVIDER_REF, DUPLICATE_CALLBACK, TIMEOUT_UNCONFIRMED
  amountExpected    Decimal?      @db.Decimal(10, 2)
  amountReceived    Decimal?      @db.Decimal(10, 2)
  isResolved        Boolean       @default(false)
  resolutionAction  String?
  resolvedById      String?
  resolvedAt        DateTime?
  notes             String?
  createdAt         DateTime      @default(now())

  paymentIntent     PaymentIntent? @relation(fields: [paymentIntentId], references: [id], onDelete: SetNull)

  @@index([isResolved])
}

model PaymentRefund {
  id                String       @id @default(uuid())
  paymentId         String
  amountZMW         Decimal      @db.Decimal(10, 2)
  reason            String
  isApproved        Boolean      @default(false)
  approvedById      String?
  approvedAt        DateTime?
  reversalLedgerId  String?
  createdAt         DateTime     @default(now())

  payment           Payment      @relation(fields: [paymentId], references: [id], onDelete: Cascade)

  @@index([paymentId])
}

// ----------------------------------------------------------------------------
// HR, PAYROLL & ZAMBIAN STATUTORY ENGINES
// ----------------------------------------------------------------------------

model StaffContract {
  id                 String       @id @default(uuid())
  staffId            String       @unique
  basicSalaryZMW     Decimal      @db.Decimal(10, 2)
  housingAllowance   Decimal      @default(0.00) @db.Decimal(10, 2)
  transportAllowance Decimal      @default(0.00) @db.Decimal(10, 2)
  clinicalAllowance  Decimal      @default(0.00) @db.Decimal(10, 2)
  tpin               String?      // ZRA TPIN
  napsaNumber        String?      // NAPSA SSN
  wcfcbClass         String       @default("HEALTH_EDUCATION_CLASS_4") // WCFCB Assessment category
  nhimaNumber        String?
  bankName           String?      // e.g. "Absa Bank Zambia"
  bankAccountMasked  String?      // e.g. "******4921"
  contractStartDate  DateTime     @default(now())
  contractEndDate    DateTime?
  isActive           Boolean      @default(true)
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @default(now()) @updatedAt

  staff              Staff        @relation(fields: [staffId], references: [id], onDelete: Cascade)
}

model StatutoryRuleSet {
  id                String             @id @default(uuid())
  authority         StatutoryAuthority // ZRA_PAYE, NAPSA, WCFCB, NHIMA
  title             String             // e.g. "ZRA PAYE Tax Bands 2026"
  effectiveFrom     DateTime
  effectiveTo       DateTime?
  rulesJson         String             // Complete JSON defining brackets, rates, ceilings
  isApproved        Boolean            @default(true)
  approvedBy        String             @default("Accountant General / Principal")
  approvedAt        DateTime           @default(now())
  createdAt         DateTime           @default(now())

  @@index([authority, effectiveFrom])
}

model PayrollRun {
  id                    String        @id @default(uuid())
  organisationId        String
  periodName            String        // e.g. "October 2026"
  periodMonth           Int           // 1 to 12
  periodYear            Int           // 2026
  status                PayrollStatus @default(DRAFT)
  totalGrossZMW         Decimal       @default(0.00) @db.Decimal(12, 2)
  totalNetZMW           Decimal       @default(0.00) @db.Decimal(12, 2)
  totalPayeZMW          Decimal       @default(0.00) @db.Decimal(12, 2)
  totalNapsaEmpZMW      Decimal       @default(0.00) @db.Decimal(12, 2)
  totalNapsaEmployerZMW Decimal       @default(0.00) @db.Decimal(12, 2)
  totalWcfcbEmployerZMW Decimal       @default(0.00) @db.Decimal(12, 2)
  preparedById          String?
  reviewedById          String?
  approvedById          String?
  isLocked              Boolean       @default(false)
  lockedAt              DateTime?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @default(now()) @updatedAt

  organisation          Organisation  @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  lines                 PayrollRunLine[]
  filings               StatutoryFilingEvidence[]

  @@unique([organisationId, periodMonth, periodYear])
  @@index([organisationId, status])
}

model PayrollRunLine {
  id                   String       @id @default(uuid())
  payrollRunId         String
  staffId              String
  basicSalaryZMW       Decimal      @db.Decimal(10, 2)
  totalAllowancesZMW   Decimal      @default(0.00) @db.Decimal(10, 2)
  grossPayZMW          Decimal      @db.Decimal(10, 2)
  payeDeductionZMW     Decimal      @default(0.00) @db.Decimal(10, 2)
  napsaEmployeeZMW     Decimal      @default(0.00) @db.Decimal(10, 2)
  otherDeductionsZMW   Decimal      @default(0.00) @db.Decimal(10, 2)
  netPayZMW            Decimal      @db.Decimal(10, 2)
  napsaEmployerZMW     Decimal      @default(0.00) @db.Decimal(10, 2)
  wcfcbEmployerZMW     Decimal      @default(0.00) @db.Decimal(10, 2)
  isDisbursed          Boolean      @default(false)
  createdAt            DateTime     @default(now())

  payrollRun           PayrollRun   @relation(fields: [payrollRunId], references: [id], onDelete: Cascade)
  staff                Staff        @relation(fields: [staffId], references: [id], onDelete: Restrict)
  paySlip              PaySlip?

  @@unique([payrollRunId, staffId])
  @@index([payrollRunId])
}

model PaySlip {
  id                String         @id @default(uuid())
  payrollRunLineId  String         @unique
  slipNumber        String         // e.g. "PS-2026-10-0014"
  issuedDate        DateTime       @default(now())
  breakdownJson     String         // Comprehensive snapshot of earnings & deductions
  pdfDownloadedAt   DateTime?
  createdAt         DateTime       @default(now())

  payrollRunLine    PayrollRunLine @relation(fields: [payrollRunLineId], references: [id], onDelete: Cascade)

  @@unique([slipNumber])
}

model StatutoryFilingEvidence {
  id                 String             @id @default(uuid())
  payrollRunId       String
  authority          StatutoryAuthority
  submissionType     String             // "ZRA_TAXONLINE_CSV", "ENAPSA_RETURN_FILE", "WCFCB_DECLARATION"
  referenceNumber    String             // ZRA PRN / NAPSA Receipt / WCFCB assessment reference
  remittedAmountZMW  Decimal            @db.Decimal(12, 2)
  filingDate         DateTime           @default(now())
  receiptDocumentUrl String?
  verifiedById       String?
  createdAt          DateTime           @default(now())

  payrollRun         PayrollRun         @relation(fields: [payrollRunId], references: [id], onDelete: Cascade)

  @@index([payrollRunId, authority])
}

// ----------------------------------------------------------------------------
// INSTITUTIONAL OPERATIONS: HOSTELS, TRANSPORT, LIBRARY & ENTITLEMENTS
// ----------------------------------------------------------------------------

model StudentEntitlement {
  id                String                 @id @default(uuid())
  learnerId         String
  serviceType       ServiceEntitlementType
  status            EntitlementStatus      @default(ACTIVE)
  grantedByPolicy   String                 // "TUITION_CLEARED_100", "TRANSPORT_PAID", "HOSTEL_PAID"
  validFrom         DateTime               @default(now())
  validUntil        DateTime
  isSafetyExempt    Boolean                @default(false) // Emergency gate exit NEVER blocked
  overrideNotes     String?
  createdAt         DateTime               @default(now())
  updatedAt         DateTime               @default(now()) @updatedAt

  learner           Learner                @relation(fields: [learnerId], references: [id], onDelete: Cascade)

  @@unique([learnerId, serviceType])
  @@index([learnerId, status])
}

model HostelBuilding {
  id                String             @id @default(uuid())
  campusId          String
  name              String             // e.g. "Florence Nightingale Hall", "Manyama Residence"
  genderPolicy      HostelGenderPolicy @default(FEMALE_ONLY)
  totalRooms        Int                @default(20)
  totalBeds         Int                @default(80)
  wardenName        String?
  wardenPhone       String?
  feePerSemesterZMW Decimal            @default(2200.00) @db.Decimal(10, 2)
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @default(now()) @updatedAt

  campus            Campus             @relation(fields: [campusId], references: [id], onDelete: Cascade)
  rooms             HostelRoom[]

  @@index([campusId])
}

model HostelRoom {
  id                String         @id @default(uuid())
  buildingId        String
  roomNumber        String         // e.g. "Room 101", "A-12"
  floor             Int            @default(1)
  capacityBeds      Int            @default(4)
  currentOccupancy  Int            @default(0)
  createdAt         DateTime       @default(now())

  building          HostelBuilding @relation(fields: [buildingId], references: [id], onDelete: Cascade)
  beds              HostelBed[]

  @@unique([buildingId, roomNumber])
  @@index([buildingId])
}

model HostelBed {
  id                String            @id @default(uuid())
  roomId            String
  bedNumber         String            // e.g. "Bed 1", "Bed 2"
  isOccupied        Boolean           @default(false)
  currentLearnerId  String?           @unique
  createdAt         DateTime          @default(now())

  room              HostelRoom        @relation(fields: [roomId], references: [id], onDelete: Cascade)
  allocations       HostelAllocation[]

  @@unique([roomId, bedNumber])
  @@index([roomId, isOccupied])
}

model HostelAllocation {
  id                String       @id @default(uuid())
  bedId             String
  learnerId         String
  academicYear      String       @default("2026")
  semesterNumber    Int          @default(1)
  isApproved        Boolean      @default(true)
  checkInDate       DateTime     @default(now())
  checkOutDate      DateTime?
  createdAt         DateTime     @default(now())

  bed               HostelBed    @relation(fields: [bedId], references: [id], onDelete: Cascade)
  learner           Learner      @relation(fields: [learnerId], references: [id], onDelete: Cascade)

  @@index([bedId])
  @@index([learnerId])
}

model TransportSubscription {
  id                String         @id @default(uuid())
  learnerId         String
  routeId           String
  termId            String
  passQrCode        String         @unique // Signed verification string
  status            String         @default("ACTIVE") // ACTIVE, SUSPENDED, EXPIRED
  validFrom         DateTime       @default(now())
  validUntil        DateTime
  activatedAt       DateTime       @default(now())

  learner           Learner        @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  route             TransportRoute @relation(fields: [routeId], references: [id], onDelete: Restrict)

  @@unique([learnerId, termId])
  @@index([learnerId, status])
}

model LibraryBook {
  id                String        @id @default(uuid())
  organisationId    String
  isbn              String?
  title             String        // e.g. "Brunner & Suddarth's Textbook of Medical-Surgical Nursing"
  author            String        // e.g. "Hinkle & Cheever"
  category          String        // NURSING, PHARMACOLOGY, ANATOMY, CLINICAL_MEDICINE
  shelfLocation     String?       // "Shelf N-12"
  totalCopies       Int           @default(5)
  availableCopies   Int           @default(5)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @default(now()) @updatedAt

  organisation      Organisation  @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  loans             LibraryLoan[]

  @@index([organisationId, category])
}

model LibraryLoan {
  id                String       @id @default(uuid())
  bookId            String
  learnerId         String?
  staffId           String?
  borrowedDate      DateTime     @default(now())
  dueDate           DateTime
  returnedDate      DateTime?
  fineAmountZMW     Decimal      @default(0.00) @db.Decimal(6, 2)
  isReturned        Boolean      @default(false)
  issuedById        String?

  book              LibraryBook  @relation(fields: [bookId], references: [id], onDelete: Cascade)
  learner           Learner?     @relation(fields: [learnerId], references: [id], onDelete: SetNull)
  staff             Staff?       @relation(fields: [staffId], references: [id], onDelete: SetNull)

  @@index([bookId])
  @@index([learnerId])
}

model CampusAccessEvent {
  id                String       @id @default(uuid())
  learnerId         String?
  staffId           String?
  gateName          String       // "Main Gate - Lumwana", "Clinical Hospital Turnstile"
  direction         String       // "ENTRY", "EXIT"
  credentialMethod  String       // "QR_PASS", "BIOMETRIC", "MANUAL_OVERRIDE"
  isAllowed         Boolean      @default(true)
  denialReason      String?
  timestamp         DateTime     @default(now())

  @@index([gateName, timestamp])
  @@index([learnerId])
}

// ----------------------------------------------------------------------------
// GRADUATION & ALUMNI
// ----------------------------------------------------------------------------

model GraduationClearance {
  id                  String       @id @default(uuid())
  learnerId           String       @unique
  academicCleared     Boolean      @default(false)
  financeCleared      Boolean      @default(false)
  clinicalCleared     Boolean      @default(false)
  libraryCleared      Boolean      @default(false)
  hostelCleared       Boolean      @default(false)
  isFullyCleared      Boolean      @default(false)
  clearedAt           DateTime?
  certificateNumber   String?      @unique // e.g. "NWU-CERT-2026-0041"
  gpaOrClassification String?    // "DISTINCTION", "MERIT", "CREDIT", "PASS"
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @default(now()) @updatedAt

  learner             Learner      @relation(fields: [learnerId], references: [id], onDelete: Cascade)

  @@index([isFullyCleared])
}

model AlumniProfile {
  id                String       @id @default(uuid())
  learnerId         String       @unique
  graduationYear    Int          @default(2026)
  programmeName     String
  employerName      String?      // e.g. "Solwezi General Hospital"
  currentRole       String?      // e.g. "Staff Nurse"
  phone             String?
  email             String?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @default(now()) @updatedAt

  learner           Learner      @relation(fields: [learnerId], references: [id], onDelete: Cascade)
}
"""

if "NWUCHAS HIGHER EDUCATION & HEALTH SCIENCES EXTENSION MODELS" not in schema:
    schema = schema + "\n" + new_extensions

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(schema)

print("prisma/schema.prisma updated successfully with NWUCHAS models!")
