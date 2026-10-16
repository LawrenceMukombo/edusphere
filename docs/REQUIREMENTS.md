# EduSphere SMIS — Requirements Specification & Traceability Matrix
**Version:** 1.0.0 | **Baseline:** Zambia School MIS Enterprise PRD 2026

---

## 1. Functional Requirements Index

### 1.1 Platform Foundation & Multi-Tenancy (FR-PLT)
- **FR-PLT-001 (Must):** Create isolated organizations/tenants with one or multiple campuses, separate branding, and independent administration.
- **FR-PLT-002 (Must):** Provision, suspend, renew, and manage module entitlements without corrupting archived historical records.
- **FR-PLT-003 (Must):** Configurable school settings, academic calendar, branding colors, local timezone (`Africa/Lusaka`), and document numbering patterns.
- **FR-PLT-004 (Must):** Fine-grained RBAC, MFA enforcement for privileged roles, scoped support access, and tamper-evident audit logs.
- **FR-PLT-005 (Must):** Protected bulk CSV/Excel import and export with schema validation, preview, duplicate detection, and rollback.

### 1.2 Admissions & Learner Registration (FR-ADM)
- **FR-ADM-001 (Must):** Online and administrative admissions pipeline: enquiry &rarr; application &rarr; interview &rarr; approval &rarr; enrollment.
- **FR-ADM-002 (Must):** Capture learner identity, date of birth, sex, citizenship, campus, class level, entry date, and emergency information.
- **FR-ADM-003 (Must):** Capture multiple guardians, relationship types, verified contact details, legal custody restrictions, and billing responsibility.
- **FR-ADM-004 (Must):** Issue unique student registration numbers (e.g., `EDS-2026-00142`) with duplicate detection and controlled merge capability.
- **FR-ADM-005 (Must):** Manage student lifecycle events: class allocations, promotions, repetitions, transfers, suspensions, and alumni archiving.

### 1.3 Longitudinal Student Information System (FR-SIS)
- **FR-SIS-001 (Must):** Single master learner profile connecting academic marks, attendance, fee ledgers, guardian links, and health alerts.
- **FR-SIS-002 (Must):** Continuous longitudinal timeline preserving historical terms, classes, assessment schemes, and report cards without overwriting past data.
- **FR-SIS-003 (Must):** Family account structure allowing a guardian to manage multiple linked pupils across classes and campuses.
- **FR-SIS-004 (Must):** Partitioned sensitive health, allergy, disability, and learning-support records accessible strictly by authorized personnel.

### 1.4 Student Attendance & Offline Capture (FR-ATT)
- **FR-ATT-001 (Must):** Daily class-based attendance registers supporting Present, Absent, Late, Excused, and custom school statuses.
- **FR-ATT-002 (Must):** Offline-capable attendance recording with local encrypted queue and conflict-resilient reconciliation.
- **FR-ATT-003 (Must):** Guardian-submitted absence explanations, staff approval workflows, and chronic absence tracking.
- **FR-ATT-004 (Must):** School-wide attendance dashboards with real-time submission tracking and alerts for unsubmitted registers.

### 1.5 Academic Engine & Assessment (FR-ACA)
- **FR-ACA-001 (Must):** Configurable academic years, terms, grade/form levels, classes, streams, subjects, and teacher allocations.
- **FR-ACA-002 (Must):** Multiple concurrent assessment modes: numeric marks, percentages, letter grades, competency rubrics, and ECE developmental milestones.
- **FR-ACA-003 (Must):** Fast tabular mark entry for teachers with weight validation, out-of-range checks, and draft saving.
- **FR-ACA-004 (Must):** Multi-tier results workflow: Draft &rarr; Submitted &rarr; Moderated &rarr; Approved &rarr; Published &rarr; Archived.
- **FR-ACA-005 (Must):** Branded, printable, and downloadable report cards with teacher remarks, headteacher signature stamp, and verification references.
- **FR-ACA-006 (Must):** Historical report integrity: past cohorts retain their original grading scales and curriculum rules.

### 1.6 Fee Management, Billing & Financial Ledger (FR-FEE)
- **FR-FEE-001 (Must):** Configurable fee catalog (tuition, registration, examination, transport, boarding, meals, uniforms, levies) by class, year, and student category.
- **FR-FEE-002 (Must):** Automated and manual invoice generation with idempotency keys preventing duplicate billing.
- **FR-FEE-003 (Must):** Record sibling discounts, staff concessions, scholarships, and waivers with mandatory reason and authorizer audit.
- **FR-FEE-004 (Must):** Multi-channel payment recording: cash, bank deposit, bank transfer, cheque, and mobile money with reference numbers and receipts.
- **FR-FEE-005 (Must):** Support partial payments, prepayments, unallocated balances, credit adjustments, and refunds.
- **FR-FEE-006 (Must):** Immutable financial journal where corrections are posted as offsetting entries rather than destructive deletes.
- **FR-FEE-007 (Must):** Daily cashbook, fee collection trends, outstanding receivables, debtor ageing analysis, and campus comparisons.

### 1.7 Parent & Guardian Portal (FR-PAR)
- **FR-PAR-001 (Must):** Mobile-first responsive interface with secure login and seamless switching between authorized children.
- **FR-PAR-002 (Must):** Direct access to attendance records, published term reports, academic growth curves, and school notices.
- **FR-PAR-003 (Must):** Itemized fee statements, payment history, downloadable receipts, and simulated/live online payment checkout.
- **FR-PAR-004 (Must):** Instant access revocation when legal guardianship or custody arrangements change.

### 1.8 Staff Records & Teacher Qualifications (FR-HR)
- **FR-HR-001 (Must):** Comprehensive staff directory, academic qualifications, employment contracts, and department assignments.
- **FR-HR-002 (Must):** Tracking Teaching Council of Zambia (TCZ) registration numbers, practising certificate status, and expiry alert notifications.
- **FR-HR-003 (Should):** Leave application and approval workflows, staff attendance, and continuous professional development (CPD) logs.

---

## 2. Acceptance Criteria (PRD Section 13)

| ID | Criterion Description | Verification Test Suite |
|---|---|---|
| **AC-01** | School A administrator cannot read, edit, or export School B data under any circumstances. | `tests/tenant-isolation.test.ts` |
| **AC-02** | Guardians can only see authorized children; revocation immediately terminates access. | `tests/guardian-access.test.ts` |
| **AC-03** | Kindergarten pupils receive competency/milestone assessments while secondary pupils receive weighted numerical grades. | `tests/academic-engine.test.ts` |
| **AC-04** | Historical report card grading scales remain preserved after curriculum framework transitions. | `tests/academic-engine.test.ts` |
| **AC-05** | Teachers cannot publish results without principal approval; post-publication changes require versioned audit trails. | `tests/academic-engine.test.ts` |
| **AC-06** | Duplicate payment webhook events create exactly one receipt and one ledger entry. | `tests/finance-ledger.test.ts` |
| **AC-07** | Partial payments update balances accurately; reversals/refunds create traceable corrective journal entries. | `tests/finance-ledger.test.ts` |
| **AC-08** | Unexplained absence notices reach only verified guardians linked to that specific child. | `tests/attendance.test.ts` |
| **AC-09** | Offline attendance captures sync cleanly without silently overwriting newer server records. | `tests/attendance.test.ts` |
| **AC-10** | Generated PDF reports reconcile with stored database records and omit confidential medical/safeguarding notes. | `tests/reporting.test.ts` |
| **AC-11** | Backup recovery procedures satisfy RPO and RTO recovery targets. | `docs/DEPLOYMENT.md` |
| **AC-12** | Sensitive HR and safeguarding records are denied to unauthorized roles and audit-logged on access. | `tests/security-audit.test.ts` |
| **AC-13** | Subscription plan downgrades retain existing historical data in safe read/export mode. | `tests/subscriptions.test.ts` |
| **AC-14** | Personal child data conforms to Zambia Data Protection Act Section 70 local residency design. | `docs/SECURITY.md` |
| **AC-15** | CSV import validates required fields, catches duplicates, and provides detailed error reporting. | `tests/import-export.test.ts` |
| **AC-16** | Parent portal and reports are fully responsive and functional on low-bandwidth mobile connections. | `src/app/parent/*` |
