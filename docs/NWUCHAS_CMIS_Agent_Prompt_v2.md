# NWUCHAS-CMIS — Master Transformation Agent Prompt
## Enterprise Agent Instructions — Version 2.0 | 21 October 2026

**Task:** Transform the independently copied EduSphere/Legacy School repository into the dedicated, single-institution NWUCHAS Integrated College Management Information System for North Western University College College of Health and Applied Science in Manyama, Zambia.

**Required input:** Read `NWUCHAS_CMIS_PRD_v2.md` fully and treat it as the authoritative product baseline. This prompt governs execution, quality and safety. Never assume that vendor APIs or NWUCHAS-specific compliance settings are approved without evidence.

## 1. Assume multidisciplinary expert roles
Operate as principal enterprise architect, senior full-stack developer, Zambia payroll specialist (subject to accountant verification), tertiary education domain analyst, clinical education specialist, database architect, payments engineer, integration specialist, application security engineer, DevOps/SRE, UX lead, QA engineer and technical writer. Deliver a genuinely working end-to-end system, not mock dashboards.

## 2. Non-negotiable rules
1. **Single institution only:** NWUCHAS exclusively; internal multi-campus/department structure allowed. Do not add SaaS tenant selection or multi-customer billing.
2. **Protect the original:** compare and isolate Git remotes, database DSNs, secrets, object storage, email/SMS senders, payment merchant IDs, webhook URLs, deployment targets and background jobs. Never write to Legacy School production assets.
3. **Inspect before editing:** audit architecture, dependencies, routes, tables, business rules, permissions, tests and existing user journeys. Classify functionality as complete, partial, UI-only, broken or absent.
4. **Keep validated reuse:** refactor existing working code, not indiscriminately rewrite; guard it with regression tests.
5. **Implement vertical slices:** schema → API → permissions → validations → UI → workflows → audit → tests → docs.
6. **Never fabricate:** regulatory approval, APIs, credentials, merchant agreements, fees, tax tables, institution facts or live operational data.
7. **Never hard-code law:** all statutory rules and deadlines must be effective-dated, source-linked, reviewed and approved.
8. **Protect sensitive data:** payroll, NRC/SSN/TPIN, student records and clinical training records need least-privilege handling; no patient identifiers in logbooks.
9. **Protect money:** use immutable double-entry financial posting, external transaction verification, segregation of duties and idempotency.
10. **No uncontrolled production actions:** no live money movement, regulator submission, credential use, production migration or deployment without explicit owner approval.
11. Keep an issue/risk/decision register, traceability from requirements to tests, and accurate status of completed versus pending functionality.
12. Preserve critical historical records; perform additive/backward-compatible migrations with rollback and backfill plans.

## 3. Phase 0: Repository audit and transformation blueprint
- Read every project manifest, relevant source area, environment example, DB migration, seed, CI/CD and Docker/deployment file.
- Confirm independent copy and detect embedded production URLs/credentials/PII. Quarantine any copied real data.
- Establish clean build, test baseline and key end-to-end smoke tests.
- Inventory UI/backend modules; map school-oriented terms (pupil, grade, term, guardian, subject, PTA, class teacher) to higher education semantics only where appropriate.
- Identify code that must be retained, adapted, redesigned, retired or added.
- Audit finance correctness, access control, copied multi-tenant assumptions, insecure direct object references, file handling, secret exposure and missing tests.
- Build diagrams for modules, data dependencies, trust boundaries and migration sequences.
- Produce `docs/01-audit.md`, `docs/02-gap-analysis.md`, `docs/03-architecture.md`, `docs/04-data-migration.md`, `docs/05-permission-matrix.md`, `docs/06-workflow-catalogue.md`, `docs/07-implementation-backlog.md`, `docs/08-threat-model.md`, `docs/09-integration-feasibility.md`.
- Report discovered risks and immediately begin safe, authorised refactoring with baseline regression tests; avoid prolonged speculative planning.

## 4. Target modules to deliver
### 4.1 Admissions, applicant and student registry
Public prospectus and intake; configurable admission rules; multi-step mobile application; draft/resume; document upload; screening; interview; selection committee; offer, acceptance, enrolment; immutable student identity and status history; self-service applicant/student portal. Approval steps must be audited and must not be client-only.

### 4.2 Academic and examinations
Departments/programmes, curriculum versions, academic years, semesters, modules, cohorts, credit/prerequisites, registrations, teaching assignments, room/lecture timetables, attendance, LMS/Moodle adapter, assessments, moderation, exam board, results publication, transcript, progression, graduation. Grades may be amended only through approved versioned correction.

### 4.3 Clinical and regulator
NMCZ/HPCZ programme mappings, policy-versioned indexing, evidence and reminders; site approvals/capacity; clinical rotations, shift attendance, e-logbooks, supervisor validation, competency assessment, OSCE, remediation, completion. Use de-identified clinical practice entries; never create patient EHR by accident.

### 4.4 Fees and institutional finance
Institution-approved programme/intake fee matrices; student/sponsor invoices and instalments; student account ledger, scholarships, waivers, receipts, statements, aged debt, refunds and authorisations; cash/bank/merchant reconciliation; balanced journals and locked financial periods.

### 4.5 HR and payroll (NEW — mandatory)
Build employee master/contracts, compensation components, leave/time integration, prorations, allowances, deductions, payroll calendar, preview, statutory engines, two-person approval, payroll lock, payslip, bank disbursement export, general-ledger posting, year-end reporting and reconciliation. Do not confuse payroll administration with student finance transactions, but integrate both with the finance ledger and institution cost centres.

### 4.6 Additional modules
HR appraisals and staff development, accommodation, library, laboratory teaching equipment, asset maintenance, procurement, stock, welfare case management, QA, accreditation evidence, alumni, dashboard, analytics, communication centre and institution settings.

## 5. Payroll statutory engine — precise implementation contract
### 5.1 Universal rule engine
Implement `StatutoryRuleSet {authority, obligation, jurisdiction, source_url, effective_from, effective_to, approval_state, approved_by, approved_at, payload, version}` with immutable approved versions and snapshot of applied version in each payroll calculation. Store rounding, thresholds, caps, relevant exemptions, earning classifications and remittance calendars explicitly. Never silently auto-update statutory data from websites. A payroll operator must be able to simulate before adoption and compare against accountant-approved examples.

### 5.2 PAYE / ZRA
- Create progressive PAYE bracket calculation with approved chargeable earnings and pension/tax relief treatment; precise decimals and deterministic rounding.
- Record employees' TPIN/tax classification securely.
- Track payroll periods, calculation results, liabilities, adjustments, approved monthly schedules, filing reference, remittance amount/date/receipt, overdue alerts and audit logs.
- Build compliant configurable export files and a human-operated filing checklist linking to official ZRA TaxOnline.
- **Do not claim PAYE REST API exists:** currently public TaxOnline service is confirmed, not a third-party PAYE submission API. Build `ZraPayeAdapter` in `MANUAL_ONLY` mode with `submitReturn` gated/disabled; unlock only after official spec, authorisation and sandbox proof.
- Distinguish ZRA Smart Invoice VSDC integration (fiscal invoices) from PAYE returns. Evaluate Smart Invoice separately with a tax professional if NWUCHAS's transactions require it.

### 5.3 NAPSA
- Record employee NAPSA SSN and employer ID securely.
- Calculate employee and employer contributions independently, each with current approved rate, relevant earnings base and capped contribution basis.
- Ensure employee share affects take-home pay, employer share does not.
- Generate eNAPSA-compatible import/export only after mapping confirmed; offer manual checklist and upload evidence in the meantime.
- Store monthly submitted/acknowledged/paid state, receipt and reconciliation against payroll liabilities.
- `NapsaAdapter` defaults to `FILE_IMPORT_EXPORT` or `MANUAL_ONLY`; no unauthorised automated logins/browser scraping.

### 5.4 WCFCB
- Track employer registration/account, sector/risk class, assessable wage basis, declaration periods, issued assessments, payments and receipts.
- **Treat employer WCFCB contribution as employer cost**, not an employee deduction.
- Do not select a fixed assessment rate without the actual NWUCHAS-approved WCFCB class, notice and effective date.
- Build assessment declaration and reconciliation workflows; portal handoff to eWorkers; capture compliance certificates/references.
- `WcfcbAdapter` remains manually supported until authorised API/spec exists.

### 5.5 NHIMA and other statutory components
Implement optional plugin-style rules if employer requirement is confirmed; do not enable or assume specific rates without current verified source and policy.

### 5.6 Payroll state machine
DRAFT → INPUTS_VALIDATED → CALCULATED → EXCEPTIONS_RESOLVED → PREPARED → REVIEWED → APPROVED_LOCKED → BANK_FILE_GENERATED → DISBURSEMENT_RECONCILED → STATUTORY_PREPARED → FILED/REMITTED → CLOSED.
Include FAILED/REVERSED/ADJUSTED statuses with logged reasons and control approvals. Salary disbursement and statutory remittance are separate financial obligations.

### 5.7 Statutory tests
Test every PAYE bracket boundary, NAPSA earnings ceiling, exempt earnings, joiner/leaver pro rata, retroactive pay, negative adjustments, rounding, leap/month dates, payroll re-run, dual approval, balance posting and employer-only WCFCB. Confirm against regulator-issued/qualified accountant-approved examples prior to live use.

## 6. Payment collection integration — precise contract
### 6.1 Provider-agnostic architecture
Create `PaymentGateway` and `PosAcquirer` adapter interfaces and the core entities `payment_intents`, `provider_transactions`, `webhook_inbox`, `settlement_batches`, `reconciliation_matches`, `disputes`, `refund_requests`. Use a strict event-state machine (CREATED, PENDING_AUTHORISATION, PROCESSING, CONFIRMED, FAILED, EXPIRED, REVERSED, REFUNDED, DISPUTED); provider-specific extensions only in adapters.

### 6.2 Mobile money
Research and sandbox Flutterwave Zambia mobile-money API (or another provider contractually selected by NWUCHAS), including MTN/Airtel/Zamtel availability for the merchant account. Implement payment initiation, redirect/approval, signed webhook handling, backend verification, robust retries, idempotent credit to invoice/student, settlement reconciliation, reversal/refund handling and receipt notifications. Do not post a final payment just because a frontend success redirect occurred. Do not process live payments without explicit merchant approval.

### 6.3 Online card payments
Prefer PCI-scope-minimising hosted payment checkout. Never store PAN/CVV or handle raw PIN entry. Verify successful authorised transaction and settlement; handle chargeback, refunds, fees and exchange/settlement discrepancies.

### 6.4 Physical EFTPOS (bank terminal)
Design two operational modes:
- **Manual terminal mode:** choose invoice, staff takes card payment on licensed terminal, attach merchant/acquirer references (RRN/STAN/batch/terminal), cashier records provisional payment, bank/merchant batch reconciliation confirms payment.
- **Integrated terminal mode:** only if Absa/FNB/other acquirer supplies certified terminal protocol/SDK, merchant agreement, credentials, sandbox and required compliance. Terminal response must be server-verified; no raw card collection. Track terminal health, timeouts and reconnection.
Bank's provision of a POS terminal does NOT imply open public device API.

### 6.5 Payments tests
Test duplicate webhook, unsigned webhook, amount/currency mismatch, out-of-order events, timeout after charge, double-click, expired intent, manual POS mismatch, bank batch shortfall, chargeback, partial/split payments and refund segregation. All ledger postings balanced and immutable.

## 7. Security, privacy and audit
- MFA for administration/registry/payroll/finance; least-privilege RBAC with department/record scope.
- Strict salary confidentiality; student financial records segregated from staff payroll; secure bank information and ID storage.
- OWASP ASVS-aligned auth/session/API controls, CSRF where relevant, file malware scanning, rate limiting, encryption at rest/in transit, secret rotation, secure telemetry.
- Threat model payroll diversion, changed banking coordinates, insider refunds, fake payment callbacks, ID enumeration, copied production secrets and leaked clinical records.
- Dual authorisation for bank account change/large refunds/payroll approvals, step-up MFA, immutable high-risk audit.
- No card data storage and no identifiable clinical patient data.
- Zambia Data Protection Act-aligned privacy notices, purposes, retention, access/request handling and appropriate cross-border safeguards.

## 8. UI/UX, accessibility and low-bandwidth operation
Replace school-grade/term UI with programmes/semesters/cohorts/courses; staff dashboards and separated applicant/student/lecturer/clinical/finance/payroll portals. Unified design system, responsive mobile, keyboard accessibility/WCAG 2.2 AA, data dense but readable tables, search/filter/bulk actions with authorisation, loading/error/empty states, audit history and permissions. No fake analytics. Support selective offline draft logbooks and attendance only after encrypted storage, conflict/replay handling and device threat model.

## 9. Technical delivery requirements
Reuse confirmed stack. Default architecture modular monolith and PostgreSQL-compatible transactional domains if supported by audit. Introduce API contracts, database migrations/backfills, typed validation, domain transactions, job queues, observable integrations and consistent errors. Define integration capability flags: UNAVAILABLE, MANUAL_ONLY, EXPORT_IMPORT, SANDBOX_TESTED, LIVE_APPROVED; never display LIVE_APPROVED falsely.

Use separate local, staging and production credentials, databases, buckets and domains. Implement CI, lint, tests, secret checks, dependency vulnerability scans, versioned release, rollback, backups and observability. No destructive DB resets, unreviewed breaking schema changes or production deployments.

## 10. Implementation sequencing and milestones
**M0:** Inventory and hard isolation; baseline tests; risk and decision registers; classify modules.
**M1:** NWUCHAS institutional configuration, UX, RBAC, registry/data foundation, workflow and audit.
**M2:** Applicants, eligibility, documents, interviews, offers, enrolment.
**M3:** Curricula, semesters, teaching, assessments, exam approval, fees, accounts and manual payments.
**M4:** HR payroll and approved PAYE/NAPSA/WCFCB calculations, returns exports, approval, payslips, bank output and accounting entries.
**M5:** Sandboxed Zambian mobile-money, signed webhooks, student invoice posting, settlements; hosted cards; conditional EFTPOS/acquirer integration.
**M6:** Clinical education/indexing/OSCE and remaining institutional operations.
**M7:** Institutional UAT, performance/penetration tests, backup drills, training, release readiness and expressly authorised launch.

At every milestone present: files changed; completed business scenarios; screenshots or browser evidence where available; test commands/results; security checks; migration status; outstanding dependencies and blockers; what has NOT been completed. Continue authorised local tasks incrementally rather than claiming entire project completion prematurely.

## 11. Acceptance and release gates
- No cross-reference to live Legacy School resources.
- One fully tested applicant-to-enrolment lifecycle.
- Reproducible payroll with effective-dated rules and independent reviewer approval.
- PAYE/NAPSA/WCFCB return exports and proof tracking work without APIs.
- WCFCB employer contribution never reduces salary net pay.
- Payment callback fraud, replay and settlement mismatch are rejected or placed in reconciliation queue.
- Tuition ledger, receipts, payroll journals and bank settlement fully reconcile.
- Clinical records are de-identified and privilege-protected.
- Grade and document approval cannot be bypassed.
- Role tests, regression tests, data migrations and restore tests pass.
- Requirements traceability and institutional policy assumptions are current.

## 12. FIRST ACTIONS — EXECUTE NOW
1. Inspect repository and verify it is an independent copy with no inherited production credentials/data dependencies.
2. Run the existing build/tests; capture baseline errors without hiding them.
3. Produce module/dependency inventory, migration plan, target architecture, permissions matrix and PRD-to-backlog traceability.
4. Produce explicit statutory compliance feasibility table and payment provider/acquirer dependency matrix. Do not assert API availability based only on portal login pages.
5. Set up quality gates and baseline smoke/regression tests.
6. Begin the NWUCHAS core transformation and complete the first approved vertical feature slice.
7. Provide a concise evidence-backed progress report and continue the next authorised development task.

**Definition of successful transformation:** an auditable, private, secure, dedicated NWUCHAS system that administers a health sciences student's complete education lifecycle and the college's financial, staffing, payroll, compliance and digital collection processes, with external integrations accurately labelled according to approval and technical readiness.

## 13. Authoritative sources to consult
Use the Harvard-style bibliography in `NWUCHAS_CMIS_PRD_v2.md`. Relevant starting points: ZRA TaxOnline https://portal.zra.org.zm/login; NAPSA eNAPSA https://www.napsa.co.zm/enapsa/; WCFCB eWorkers https://www.workers.com.zm/eservices; Flutterwave Zambia mobile money https://developer.flutterwave.com/docs/zambia-mobile-money; Absa integrated POS https://www.absa.co.zm/business/merchant-services/. Confirm effective regulatory rules and commercial/API access before production activation.
