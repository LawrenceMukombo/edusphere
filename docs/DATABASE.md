# EduSphere SMIS — Database Specification & Data Dictionary
**Version:** 1.0.0 | **RDBMS:** PostgreSQL 18.4 | **ORM:** Prisma 5.22.0

---

## 1. Architectural Principles

1. **Relational Integrity:** All child entities enforce foreign keys referencing their parent organization and domain models. Cascade deletes are strictly controlled: operational records (invoices, scores, report cards) use `onDelete: Restrict` or preserve historical records.
2. **Deterministic Primary Keys:** All tables use standard UUID v4 strings ensuring collision-free replication and safe imports.
3. **Currency & Financial Safety:** All financial amounts use PostgreSQL `DECIMAL(10, 2)` or `DECIMAL(12, 2)`. Floating-point arithmetic (`FLOAT`/`REAL`) is completely forbidden.
4. **Tenant Isolation:** Every operational record carries a mandatory `organisationId`. High-throughput queries are supported by composite indexes `[organisationId, status]`, `[organisationId, code]`, etc.
5. **Auditing by Default:** The `AuditEvent` table captures all privileged activities, changes to student status, grade publications, fee payments, and permission revocations.

---

## 2. Entity Relationship Overview

```mermaid
erDiagram
    Organisation ||--o{ Campus : "has"
    Organisation ||--o{ User : "employs / serves"
    Organisation ||--o{ Subscription : "subscribes"
    Organisation ||--o{ AcademicYear : "schedules"
    Organisation ||--o{ Learner : "enrols"
    Organisation ||--o{ Guardian : "registers"
    Organisation ||--o{ Staff : "employs"
    Organisation ||--o{ FeeSchedule : "configures"
    Organisation ||--o{ Invoice : "issues"
    Organisation ||--o{ Payment : "receives"
    Organisation ||--o{ Receipt : "issues"
    Organisation ||--o{ LedgerEntry : "records"

    Campus ||--o{ Class : "houses"
    AcademicYear ||--o{ Term : "divides into"
    AcademicYear ||--o{ Class : "schedules"
    Class ||--o{ Learner : "contains"
    Class ||--o{ SubjectAssignment : "teaches"
    Class ||--o{ AttendanceSession : "takes"
    Class ||--o{ ReportCardVersion : "compiles"

    Learner ||--o{ LearnerGuardianRelationship : "linked to"
    Guardian ||--o{ LearnerGuardianRelationship : "linked to"
    Learner ||--o{ Enrolment : "progresses through"
    Learner ||--o{ AttendanceRecord : "recorded in"
    Learner ||--o{ Score : "earns"
    Learner ||--o{ CompetencyObservation : "demonstrates"
    Learner ||--o{ ReportCardVersion : "receives"
    Learner ||--o{ Invoice : "billed"
    Learner ||--o{ Payment : "pays"

    Invoice ||--o{ InvoiceLine : "itemises"
    Payment ||--o{ PaymentAllocation : "allocates to"
    Invoice ||--o{ PaymentAllocation : "satisfied by"
    Payment ||--|| Receipt : "evidenced by"
```

---

## 3. Data Dictionary

### 3.1 Tenancy & Access
- `Organisation`: Master tenant entity with unique institutional code (e.g., `EDS-ZM-001`), tax identifier (TPIN), official Ministry registration number, and custom UI branding.
- `Campus`: School branch or facility. Facilitates multi-campus school groups while maintaining isolated class cohorts and staff allocations.
- `Subscription`: SaaS licensing state, tier (Community Starter to Enterprise Group), learner cap, expiration, and grace period controls.
- `ModuleEntitlement`: Feature flags for modular commercial add-ons (`ONLINE_PAYMENTS`, `HR_PAYROLL`, `LMS`, `TRANSPORT`, etc.).
- `User`: System credentials, bcrypt password hash, MFA flag, assigned system role, and last login metadata.
- `AuditEvent`: Tamper-evident ledger of administrative and sensitive actions with IP address, user agent, action code, and full JSON payload snapshot.

### 3.2 Learners & Guardians
- `Learner`: Central student profile with unique student registration number (e.g., `EDS-2026-0042`), name, gender, date of birth, admission date, lifecycle status, and health notes.
- `Guardian`: Parent or caregiver contact with National Registration Card (NRC), phone number, email, and verification status.
- `LearnerGuardianRelationship`: Join table defining relationship type (`FATHER`, `MOTHER`, `LEGAL_GUARDIAN`, etc.), primary carer status, billing responsibility, and immediate access revocation flags.
- `Enrolment`: Historical record of student placement per academic year and class stream.

### 3.3 Academics & Curricula
- `AcademicYear`: Operational school calendar year (e.g., `2026 Academic Year`).
- `Term`: Sub-period (e.g., `Term 1`, `Term 2`, `Term 3`) with start/end dates.
- `Class`: Class cohort (e.g., `Grade 1A`, `Form 2 Blue`) assigned to a campus and academic year.
- `Subject`: Learning area (e.g., `Mathematics`, `English Language`) tagged with its educational stage.
- `SubjectAssignment`: Links subject, class, and assigned teacher.
- `Assessment`: Test, exam, continuous assessment, or milestone component with maximum marks and weight percentage.
- `Score`: Subject grade and marks obtained by a pupil, with absence flag and teacher remarks.
- `CompetencyObservation`: Qualitative ECE evaluations across developmental domains (Cognitive, Motor, Social) rated `EMERGING`, `DEVELOPING`, `COMPETENT`, or `MASTERED`.
- `ReportCardVersion`: Immutable snapshot of student term performance, teacher remarks, principal approval, and attendance summary.

### 3.4 Attendance
- `AttendanceSession`: Daily class register timestamped by date, class, and teacher.
- `AttendanceRecord`: Individual pupil status (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`) and minutes late.
- `AbsenceExplanation`: Guardian-submitted justification with staff approval status.

### 3.5 Finance & Posting Journal
- `FeeSchedule`: Catalog of billable items by academic year and educational stage.
- `Invoice`: Authoritative bill itemizing term fees with unique sequential number (`INV-2026-00341`), total amount, paid amount, and outstanding balance.
- `InvoiceLine`: Itemized charge breakdown.
- `Payment`: Recorded incoming funds with payment method (`CASH`, `BANK_TRANSFER`, `AIRTEL_MONEY`, `MTN_MONEY`, etc.) and external transaction reference.
- `PaymentAllocation`: Maps payment amounts directly to specific invoices.
- `Receipt`: Numbered payment receipt (`REC-2026-00412`) generated upon verified payment capture.
- `LedgerEntry`: Double-entry styled journal recording every debit charge, credit payment, concession, reversal, and refund, computing `balanceAfter` deterministically.

### 3.6 Staff & HR
- `Staff`: Employee record with job title, qualification, Teaching Council of Zambia (TCZ) registration number, TCZ practising certificate expiration, and employment status.
