# NWUCHAS Integrated College Management Information System (NWUCHAS-CMIS)
## Enterprise Premium Product Requirements Document — Version 2.0

**Institution:** North Western University College College of Health and Applied Science (NWUCHAS)  
**Location:** Manyama, Lumwana, North-Western Province, Zambia  
**Technology provider:** Lamton Investments Limited  
**Starting product:** An independent COPY of the EduSphere/Legacy School codebase  
**Deployment model:** Dedicated single-institution application with internal campus/department support  
**Status:** Requirements baseline; institutional policies and external API access subject to validation  
**Date:** 21 October 2026

## 1. Executive summary and strategic vision
NWUCHAS-CMIS is a single-institution, enterprise-grade information system supporting the full lifecycle of applicants, students, teaching, health-professions clinical training, examinations, statutory payroll, finances, institutional administration and alumni. The existing EduSphere school-oriented codebase will be copied, independently deployed and selectively refactored; the original Legacy School software and production data must remain untouched.

The solution must offer a single source of truth and robust integrated workflows: enquiry → application → eligibility screening → interview/selection → offer → enrolment → regulator indexing → academic/clinical delivery → examinations → graduation → alumni. In parallel it must run institutional HR/payroll, statutory employer reporting, student billing and collections, procurement, assets, accommodation, analytics and quality assurance.

**Strategic outcomes:** faster admissions, demonstrably accurate student ledgers, strong auditability, timely regulatory actions, streamlined teaching and clinical supervision, transparent payroll liabilities and reconciled mobile/card collections.

## 2. Scope, boundaries and architecture
### 2.1 In scope
- Public programme prospectus, applicant portal, recruitment CRM and online admissions.
- Student registry, academic years, intakes, curricula, programmes, modules, semesters, cohorts, timetables and attendance.
- Teaching/learning integrations, assessments, OSCE, examinations, grading, progression, transcript and graduation.
- Clinical training sites, clinical rotations, logbooks, competencies, supervisor validations, regulator indexing.
- Student fee plans, invoices, scholarships, sponsor billing, mobile money, card/EFTPOS and banking reconciliation.
- Employee HR, contractual compensation, monthly payroll, payslips, PAYE, NAPSA, WCFCB and optionally NHIMA.
- Staff leave/attendance, hostels, library, laboratory resources, procurement, assets, helpdesk and alumni.
- Institutional reporting, permissions, approval workflows, notifications, privacy, audit, observability, backups and disaster recovery.

### 2.2 Out of scope until formally authorised
Direct filing of statutory returns through unofficial endpoints; automated regulatory indexing through undocumented portals; capturing patient-identifying clinical case data; storing card PAN/CVV; connecting to live bank/POS merchant infrastructure without acquiring-bank agreement; production deployment without acceptance.

### 2.3 Single institution, not multi-tenant
NWUCHAS is the only customer in this codebase. Remove redundant external tenant selection, SaaS subscription billing and cross-school super-admin functions after dependency analysis. Support NWUCHAS campuses, departments and programmes as organisational units. Use a modular monolith/API-first design unless the audit justifies another architecture. The copied project must have separate git remotes, secrets, databases, file storage, messaging, payment credentials, domains, cron schedules and deployments.

## 3. Verified research and integration feasibility
Research is current to 21 October 2026; availability of a website or portal does **not** establish that public APIs are available or that NWUCHAS has access. No live credentials were tested.

| Area | Verified public capability | Public third-party API status | Required product approach |
|---|---|---|---|
| ZRA PAYE | TaxOnline registration, e-filing and e-payment (ZRA, 2020; 2026) | No general PAYE filing API verified | Calculate and approve payroll, export compliant schedules, capture filing/payment evidence; API adapter disabled pending ZRA permission/specification |
| ZRA Smart Invoice | ZRA publishes VSDC technical integration information (ZRA, 2026) | Smart Invoice integration documented; **not PAYE filing** | Separate optional fiscalisation discovery and tax-treatment review for chargeable supplies |
| NAPSA | eNAPSA employer registration, employee management, monthly returns and contributions (NAPSA, 2026a) | Public employer submission API not verified | Contribution engine, approved upload/return file, eNAPSA manual handoff, remittance tracking, optional authorised API adapter |
| WCFCB | eWorkers web/mobile employer registration, declarations and account services (WCFCB, 2026) | Public employer API not verified | Employer assessment class, approved annual/periodic liabilities, declaration file, receipt and compliance tracking |
| Mobile money | Flutterwave documents Zambia MTN/Airtel/Zamtel collection API and webhooks (Flutterwave, 2026) | Publicly documented provider API; commercial onboarding required | Hosted/authorised payment, server-side verification and reconciliation |
| EFTPOS/card | Absa describes integrated POS host-to-host and settlement reports (Absa Zambia, 2026); FNB offers merchant/POS services | Depends on acquirer and terminal provider agreement; no universal POS API | Initially manual terminal-reference reconciliation; enable certified integrated terminal adapter only with bank SDK/spec |

### 3.1 Legal and accounting caveat
Do not hard-code PAYE rates, NAPSA ceilings, WCFCB assessment percentages or remittance due dates. Use effective-dated, sourced, administrator-approved rule tables and accountant validation. WCFCB is generally an **employer assessment**, not a routine payroll deduction from employee net pay (National Assembly of Zambia, 2025). An approved employer classification and current assessment basis must be verified. Current NAPSA guidance states employee and employer shares of 5% each, subject to annual ceilings (NAPSA, 2026b); all values must be configurable and annually reviewed. NHIMA, if applicable, shall be an optional independent statutory component with verified requirements.

## 4. Users, roles and segregation of duties
**Public:** prospective applicants, applicants, scholarship/sponsor contacts. **Academic:** students, lecturers, module coordinators, HoDs, dean, registrar, exam board, external examiners. **Clinical:** clinical coordinators, site supervisors/preceptors. **Administrative:** admissions officer, accountant, cashier, bursar, HR officer, payroll preparer, payroll reviewer, principal, procurement officer, accommodation officer, librarian, internal auditor, DPO, IT admin.

Use least-privilege permissions scoped by department, programme, cohort and individual record. Enforce separation of duties: payroll preparer ≠ payroll approver ≠ bank disburser; cashier ≠ bank reconciler; result-entry actor ≠ final result publisher; refund creator ≠ approver; candidate screener ≠ sole final admissions authority. Require MFA for finance/payroll/registry/admin, privileged reauthentication for high-impact acts, and auditable delegated approvals.

## 5. Applicant recruitment, prospectus and admissions (P0)
**Requirements:** public NWUCHAS-branded programme pages; published eligibility/tuition/intakes; inquiry-to-applicant CRM; verified applicant account; multi-step forms with autosave; ID/exam result uploads; configurable qualification matrices; fee payment; application reference; duplicate detection; review queue; document verification; interview scheduling/scoring; selection committee; capacity/waitlists; conditional offers and expiry; rejection/appeals; admissions letters with QR verification; acceptance and conversion into permanent student identity.

**Workflow:** Enquiry → Applicant registration → Draft → Submitted → Payment verification → Document check → Eligibility → Interview/waiver → Committee approval → Offer/waitlist/reject → Acceptance → Enrolment. Every state change must carry actor, timestamp, prior/new status, reason and notification.

**Acceptance:** candidate can complete from mobile; rejected qualification cannot silently pass; duplicate identifiers create review tasks; student created once; no fee marked paid from client-side callback alone.

## 6. Student information system and enrolment (P0)
Immutable student key; institutional registration numbers; contacts/emergency details; qualifications; programme/cohort/academic level; semester and module registrations; indexing; student card; status history; programme transfers; deferrals, suspension, withdrawal, readmission, graduation; sponsorship and accommodations; controlled merges with preserved audit. Academic standing, financial standing, indexing, clinical status and enrolment status are independent state machines. Provide change-history and completeness indicators.

## 7. Programme and academic administration (P0)
Institution → campus → school/department → programme → accredited curriculum version → academic year/semester → module → student group. Support entry requirements, credits (if approved), theory/practical mix, prerequisite rules, module registration, lecturer assignments, timetable conflicts, room/lab scheduling, roll calls, grading schemes, continuous assessment, exam moderation, external review, supplementary examinations, progression rules, academic probation, transcript approval and graduate clearance. Never assume a universal GPA or pass score. Curriculum changes must not retroactively mutate historic results.

## 8. Learning management (P1)
Lecturer and student workspaces; notes, resources, assignments, quizzes, submission feedback, discussions, recorded activities and announcements. Prefer a supported Moodle integration where NWUCHAS uses Moodle, with CMIS authoritative for identity, enrolment and official result release. Synchronisation must be idempotent and observable; manual review of errors is required.

## 9. Nursing, clinical medicine and practical education (P0)
Approved site registry and site capacity; contracts/MoUs and validity; departments, rotations, supervisors and placements; attendance/hours; e-logbook entries using **de-identified** case categories; supervisor signatures and competency checklists; skills labs; OSCE station configuration, marking and moderation; missed-hour remediation; clinical assessment; completion clearance. Regulators: NMCZ, HPCZ and HEA mapped per programme. Maintain indexing submission/evidence/acknowledgement and issue-specific deadline configurations. No API access shall be assumed for regulator portals. Do not capture patient names, identifiers or medical record numbers in logbooks.

## 10. Student fees, invoicing and finance (P0)
Programme/intake/semester-specific fee schedules; registration, tuition, clinical/lab/exam/hostel/other categories; instalments; invoicing; payment allocation; grants, bursaries, waivers, sponsors; student/sponsor statements; debt ageing; credits/refunds; cashier and bank reconciliation; cost centres; expenditure and approval limits. Financial postings shall use balanced double-entry journal principles with immutable posting identifiers, reversal documents rather than deletion, period close, audit logs and clear separation between operational invoices and statutory fiscal invoices. Validate whether and how ZRA Smart Invoice applies to relevant supplies with local tax counsel/accountant.

## 11. NEW — HR, PAYROLL AND STATUTORY COMPLIANCE (P0/P1)
### 11.1 Employee master
Staff legal identity, NRC/passport, TPIN where applicable, NAPSA SSN, WCFCB-relevant employment classification, employment dates, salary structure, contract, job grades, department, tax status, bank account token/masked details, professional licence, leave and allowances. Encrypt sensitive fields; restrict access.

### 11.2 Payroll setup and earnings engine
Payroll frequencies and periods, base salary, prorations, overtime, duty/teaching/clinical allowances, back pay, approved benefits, reimbursements, loans, advances, unpaid leave, pensionable and taxable flags, employer cost allocations, termination settlements and retroactive corrections. Use decimal-safe ZMW arithmetic, explicit rounding and effective-dated calculations. Generate payroll preview with gross pay, taxable earnings, employer costs, employee deductions and net pay. Add separate configurable payslip explanations.

### 11.3 PAYE engine (ZRA)
Effective-dated progressive tax bands and exclusions; taxable emoluments; applicable pension deduction treatment; approved exemptions/reliefs where documented; payroll journal; monthly PAYE schedules and reconciliation. Import updated bands only after an administrator approves official ZRA source and effective date. Output official-compatible CSV/XLSX if documented; otherwise provide NWUCHAS-reviewed export template and human filing through TaxOnline. Record submission/reference/date, ZRA payment and receipt, adjustments and overdue alerts. No automated e-filing without an approved interface.

### 11.4 NAPSA engine
Validate eligible employment and SSN; calculate configurable employee and employer shares subject to effective-dated ceiling, floor and exceptions. Produce member contributions report, eNAPSA-compatible file when mapping is verified, monthly remittance ledger, proof of submission/payment, exceptions and audit. Employee contribution is a payroll deduction; employer share is recorded separately as employer expense/liability. Avoid treating self-service eNAPSA access as an external API.

### 11.5 WCFCB employer assessment engine
Maintain employer WCFCB account, business activity/risk class, approved assessable earnings basis, worker population, declaration periods, notices, rates, assessment reference and payment status. Show WCFCB as employer liability/cost, not normal employee deduction. Generate declarations and supporting schedules, and retain proof of assessment/payment. Support class/rate amendments without rewriting historical assessments. Allow bank/eWorkers portal workflow until official API access is granted.

### 11.6 Optional additional obligations
NHIMA and other statutory or contract-specific deductions shall be pluggable, effective-dated and independently enabled only after NWUCHAS and its compliance adviser validate applicability. Optional voluntary deductions and employee loans must be consent/contract based and auditable.

### 11.7 Payroll workflow
HR validates employment → payroll preparer imports attendance/leave and earnings → pre-payroll exception checks → statutory calculation → preparer preview → independent review → payroll approval/lock → bank export/payment instruction → payslips → journal posting → PAYE/NAPSA/WCFCB schedules → external submissions/remittance → receipts and month-end reconciliation. Reopening a locked run requires exceptional approval and amendment runs, never silent rewriting.

### 11.8 Payroll reporting
Payroll register, bank disbursement file, payslips, employee statutory breakdown, employer cost, departmental payroll analysis, PAYE liability, NAPSA liability, WCFCB assessment, remittance status, exception register, year-end summaries, reconciliations, unpaid liabilities and submission audit.

### 11.9 Acceptance criteria
Representative salaries at threshold boundaries reconcile with approved official examples; employee deductions reconcile to net pay; employer contributions never reduce net pay; corrections create adjustment entries; payroll runs cannot be approved by preparer alone; all returns can be compiled and tracked without external API; statutory rule version is recorded on each payroll run.

## 12. NEW — Mobile money, online cards, EFTPOS and merchant reconciliation (P0/P1)
### 12.1 Multi-channel payment orchestration
Provide an internal payment intent with immutable invoice/student/application reference, ZMW amount, payer context, authorised channel, expiry and reconciliation status. Payment channels: MTN MoMo, Airtel Money, Zamtel where supported, hosted card checkout, bank transfer and on-site EFTPOS terminal. Only activate supported networks after provider acceptance, fee/settlement confirmation and sandbox tests. Provide provider abstraction so Flutterwave or another contracted local gateway can be substituted.

### 12.2 Mobile money flow
Create pending intent → provider API initiation → mobile approval by payer → signed webhook receipt → backend transaction verification by provider ID/amount/currency/status → idempotent ledger posting → official receipt → notifications. Never rely solely on browser redirect or unsafely trust a webhook. Handle pending, failed, cancelled, reversed, expired, duplicated and delayed events. Record provider fees and actual net settlement independently of tuition value.

### 12.3 EFTPOS/card flow
**Mode A (immediately deployable):** cashier selects invoice, takes payment on licensed bank terminal, records masked terminal ID, merchant ID, RRN/STAN/batch reference and amount, attaches slip, subject to daily settlement reconciliation; transaction status remains unverified/pending reconciliation until evidence is matched. **Mode B (conditional):** integrate terminal/acquirer API/SDK or host-to-host protocol under merchant agreement and bank certification; initiate amount from CMIS, obtain tokenised response, verify financial settlement. Do not collect card PAN/CVV in CMIS. Do not conflate online hosted card checkout with physical EFTPOS device integration.

### 12.4 Reconciliation and exceptions
Import bank/acquirer settlement CSV or obtain authorised API; match payment intents, provider transactions, bank settlements, invoice allocations, refunds and chargebacks. Support partial, split and sponsor payments, unapplied receipts, discrepancies, fees, reversed payments, chargebacks, settlement lag, refunds and dispute logs. Require independent cashier/finance approval where applicable. Prevent double credit on repeated callbacks.

### 12.5 Acceptance criteria
Two identical webhook deliveries result in one posting; mismatched amounts never auto-credit; payout fees do not reduce student fee settlement value without explicit policy; POS slip does not automatically mean bank settlement; cashiers cannot refund own transactions without approval; payment never marked final on redirect alone.

## 13. Other operations (P1/P2)
Human resources and staff development; hostel buildings/rooms/beds/fees; library catalogue/loans; laboratories/mannequins and consumables; procurement suppliers and purchase orders; inventory, depreciation and asset maintenance; student welfare/tickets/complaints with confidential case controls; graduation/transcript verification; alumni/graduate outcomes; institutional quality assurance, accreditations and inspections.

## 14. Common workflow automation
Stateful versioned workflows for admissions, indexing, assessment moderation, clinical approvals, payroll preparation/approval, PAYE submission, NAPSA remittance, WCFCB declaration, payment exception resolution, refund, procurement, leave, graduation and records corrections. Support role-based tasks, SLA, escalations, authorisation guards, rejection, rework, delegation, attachments, full state history and notifications.

## 15. Reports and dashboards
Executive KPIs: applicant pipeline, programme occupancy, enrolments, student retention, attendance, academic success, clinical competency completion, indexing compliance, invoiced/collected/outstanding fees, payment-channel settlement, payroll gross/net/employer cost, due/unpaid PAYE/NAPSA/WCFCB, staffing ratios, assets/hostel utilisation and compliance expiries. Every metric must have documented formula/source/date, permissions and drill-down; no invented production KPIs.

## 16. System architecture and data model
**Suggested logical domains:** identity/access; institution; CRM/admissions; student registry; academics; learning; clinical; examinations; fee ledger; payment orchestration; HR/payroll; statutory rules/returns; finance general ledger; procurement/assets; accommodation; quality assurance; analytics; notifications; integrations; audit; document storage.

**New core entities:** payroll_periods, payroll_runs, payroll_run_lines, pay_components, employee_contracts, employee_tax_profiles, statutory_rule_sets, statutory_rule_versions, statutory_calculations, regulatory_remittances, statutory_filing_evidence, wcfcb_assessments, pay_slips, payroll_approvals, salary_payment_batches, payment_intents, gateway_transactions, payment_provider_events, card_terminal_receipts, settlement_batches, settlement_lines, reconciliation_cases, payment_refunds, disputes and integration_credentials_metadata. Store secrets in a secret manager, not in credentials tables.

Use transactions, foreign keys, unique financial references, row authorisation, immutable postings and audited corrections. Ensure all official calculation snapshots preserve rule version and relevant input fields.

## 17. External integration interface contracts
Create internal interfaces rather than embedding vendors into domain logic:
- `PaymentGateway`: createIntent, initiateCollection, verifyTransaction, parseSignedWebhook, refundIfSupported, fetchSettlementIfSupported.
- `PosAcquirer`: initiateTerminalPaymentIfSupported, verifyAcquirerReference, importSettlement, fetchBatchIfSupported.
- `StatutoryAuthorityAdapter`: validateExport, generateSubmissionFile, submitIfAuthorised, queryReceiptIfAuthorised, importAcknowledgement.
- `BankingAdapter`: exportSalaryPayments, importBankStatement, reconcileTransactions.
Each adapter must define sandbox/live credentials, idempotency keys, encryption, retries/backoff, webhook signature validation, error mapping, observability and safe manual fallback. Create capability flags: `NOT_AVAILABLE`, `MANUAL_ONLY`, `FILE_IMPORT_EXPORT`, `SANDBOX_TESTED`, `PRODUCTION_APPROVED`.

## 18. Security, privacy and governance
OWASP ASVS-aligned controls, MFA for privileged roles, encrypted personal/financial documents, least privilege, separation of duties, account lifecycle, session security, API rate limits, audit logging, secure backups, data retention and lawful processing. No patient-identifying information in clinical student logs. Never expose payroll salary information to ordinary lecturers or students. Use PCI-compliant hosted payment pages or acquirer terminal solutions; do not store card authentication data or cardholder sensitive data. Assess Zambia Data Protection Act, 2021 and applicable cross-border transfer obligations. Conduct threat modelling for identity, payroll fraud, payments and integration webhooks.

## 19. Non-functional requirements and service targets
Initial targets subject to hosting/load tests: 99.5% monthly availability; p95 standard page under 3 seconds; p95 ordinary API under 500ms under agreed workload; RPO ≤4 hours and RTO ≤8 hours for core data; daily encrypted backups with tested recovery; WCAG 2.2 AA; mobile responsive; low-bandwidth optimisation; fully versioned migrations; monitoring/error tracing; secrets rotation; cost-conscious modular deployment. Separate development, staging and production environments.

## 20. Delivery roadmap and release gates
**Phase 0 — Independent-copy audit:** code/dependency/permissions inventory, threat model, legacy data quarantine, test baseline, NWUCHAS discovery, verified payroll/tax inputs and payment provider due diligence.

**Phase 1 — Dedicated institutional foundation:** branding, single-institution organisational model, identity, RBAC, core registry, audit and workflow engine.

**Phase 2 — Admissions:** programme prospectus, applications, document checks, selection, offer, enrolment.

**Phase 3 — Core academics and fees:** curriculum, semesters, teaching, results, invoices, student ledgers, banking and manual cash/POS capture.

**Phase 4 — Payroll and statutory compliance:** employee data, effective-dated PAYE/NAPSA/WCFCB, payslips, approval, return preparation, manual filing evidence, bank salary export.

**Phase 5 — Digital collections:** merchant onboarding, mobile money gateway, webhooks, hosted card payments, settlement reconciliation; EFTPOS integrated mode only after acquirer approval.

**Phase 6 — Clinical/regulatory and remaining operations:** indexing, placements, logbooks, OSCE, hostels, HR extension, library/assets, QA, graduation.

**Phase 7 — Optimisation:** integrations where authorised, accessibility, load/security testing, backup drills, training and go-live acceptance.

Each phase needs scope-locked stories, demos, UAT, automated regression, security gates, data reconciliation and signoff. Phase order may adjust to NWUCHAS readiness, but foundational security and integrity are not optional.

## 21. Key acceptance tests (minimum)
1. Complete application-to-enrolment flow without duplicate student record.
2. Grade submission cannot bypass examination board approval.
3. Clinic logbook activities require supervisor approval and no identifiable patient data.
4. Employee gross/net/payroll journal reconcile exactly using approved tax rule version.
5. Boundary salary tests across every PAYE bracket and NAPSA ceiling.
6. WCFCB assessment remains an employer-only liability.
7. Locked payroll runs cannot be mutated; adjustment run is auditable.
8. Correct statutory export and evidence trail without external API credentials.
9. Duplicate or forged payment webhook cannot credit account.
10. Verified mobile transaction matches amount, currency, provider and reference.
11. Manual EFTPOS payments reconcile to acquirer settlement before confirmed status.
12. Refund/chargeback produces balanced, traceable ledger reversal.
13. Unauthorised finance/payroll data access denied.
14. Database rollback and tested backup restore preserve critical balances.
15. No copied Legacy School data, credentials or deployed resource is reused.

## 22. Institutional discovery and decisions required
Confirm NWUCHAS registered legal name/contacts/accreditation, programmes, intakes, curriculum and assessment rules, regulator processes, clinical sites, staff count and compensation policies, employer TPIN/NAPSA/WCFCB identifiers, WCFCB business class, annual statutory parameters and remittance cadence, preferred employer bank, merchant entity, mobile gateway, card acquirer/EFTPOS terminal make/model, merchant settlement agreement, fees and refunds policies, existing data and infrastructure. Create a decision register and distinguish validated facts from assumptions.

## 23. Risks
Unverified statutory rates → use effective-dated approved versions; unavailable public APIs → manual filing/upload and adapters; payment fraud → signed callbacks/backend verification; card-data exposure → external hosted/acquirer components; payroll errors → dual control and independent accountant UAT; copied production data → quarantine/scrub; poor clinical privacy → de-identified logbooks; unreliable network → mobile optimisations and retry queues; excessive scope → phased milestone delivery.

## 24. References (Harvard style)
Absa Zambia (2026) *Merchant services and integrated POS*. Available at: https://www.absa.co.zm/business/merchant-services/ (Accessed: 21 October 2026).

Flutterwave (2026) *Zambia Mobile Money documentation*. Available at: https://developer.flutterwave.com/docs/zambia-mobile-money (Accessed: 21 October 2026).

National Assembly of Zambia (2025) *Parliamentary proceedings, 25 November 2025: Workers' Compensation assessment*. Available at: https://www.parliament.gov.zm/node/12742 (Accessed: 21 October 2026).

National Pension Scheme Authority (NAPSA) (2026a) *eNAPSA*. Available at: https://www.napsa.co.zm/enapsa/ (Accessed: 21 October 2026).

NAPSA (2026b) *Important facts*. Available at: https://napsa.co.zm/important-facts/ (Accessed: 21 October 2026).

Workers' Compensation Fund Control Board (WCFCB) (2026) *e-Services*. Available at: https://www.workers.com.zm/eservices (Accessed: 21 October 2026).

Zambia Revenue Authority (ZRA) (2020) *Zambia Revenue Authority launches updated TaxOnline*. Available at: https://www.zra.org.zm/zambia-revenue-authority-launches-updated-taxonline/ (Accessed: 21 October 2026).

ZRA (2026) *ZRA website: Tax tools and Smart Invoice integrations*. Available at: https://www.zra.org.zm/ (Accessed: 21 October 2026).
