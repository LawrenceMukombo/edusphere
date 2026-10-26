# NWUCHAS-CMIS Production Remediation Agent Prompt

## Mission

Transform the current NWUCHAS-CMIS codebase into a production-grade, single-institution College Management Information System for the North Western University College of Health and Applied Sciences (NWUCHAS).

The result must be a real operational system. It must not be a rebranded EduSphere/Legacy School demonstration, a browser-only prototype, a simulated workflow, or a UI that reports success without a committed, authorised database change.

Work in the existing repository. Preserve legitimate NWUCHAS work already present, but remove inherited Legacy School/EduSphere operational behavior completely.

## Non-negotiable rules

1. NWUCHAS is the only institution in scope.
   - Never expose, seed, query, import, display, or fall back to Legacy School, Chenoda, EduSphere, Mushitala, Urban Campus, Kansanshi, Kalumbila, LSS identifiers, or their records.
   - Retain historic source files only if isolated from all runtime imports and clearly scheduled for removal. Prefer deleting/replacing them after confirming no runtime dependency.

2. No simulated operational data.
   - Never use `generateLegacyLearners`, `Math.random()` identifiers, hard-coded learner/staff/guardian/payment/bed/grade/attendance data, fake success responses, or generated statistics in an operational route or screen.
   - Never silently substitute fixture data when PostgreSQL is unavailable or empty. Return a clear, safe error state instead.
   - Synthetic NWUCHAS-only data is allowed in development/staging seed scripts only. It must be explicitly labelled, deterministic, separately invoked, and never used by production runtime code.

3. Database is the source of truth.
   - Every operational record displayed in the UI must come from PostgreSQL through an authenticated API or server-side query.
   - Browser storage may be used only for non-operational UI preferences, such as sidebar state or a temporary unsaved form draft. It must never hold records, balances, permissions, approvals, documents, payments, staff, students, attendance, or audit history.

4. All writes are real, authorised, validated, and auditable.
   - Create, edit, delete, approve, publish, reverse, and archive operations must call a server-side API.
   - Validate every request with Zod (or equivalent), enforce role and campus scope server-side, execute related writes transactionally, and create an audit event.
   - A UI action may report success only after the server confirms the database transaction.

5. “Editable and deletable” does not mean unrestricted destruction.
   - Draft records may be edited/deleted by authorised users.
   - Approved, posted, paid, published, assessed, clinical, or statutory records require a correction/amendment/reversal workflow with reason, actor, timestamp, before/after values, and approval where appropriate.
   - Never hard-delete finance, assessment, attendance, clinical, identity, or audit records.

6. Do not invent institutional, legal, financial, clinical, regulatory, contact, banking, merchant, examination, or patient facts.
   - Store configurable institutional facts in the database and collect them through controlled setup screens.
   - Integrations remain disabled until real credentials, contracts, security review, and approval are supplied.

## Immediate stop-the-line defects

Before implementing new features, remove or remediate all runtime instances of:

- `generateLegacyLearners`, `legacySchoolData`, Legacy/EduSphere fixtures, fallback learners, and fake baseline records.
- `LSS-*`, Legacy School, Chenoda, Mushitala, Urban Campus, Kansanshi, Kalumbila, and other inherited identity/campus data.
- In-memory successful fallbacks when a database write fails.
- `localStorage` persistence for operational data or security identity.
- Client-side payment/2FA/approval simulations.
- Random business identifiers. Use transactional, database-enforced numbering sequences instead.
- Default production credentials, default JWT secrets, exposed database ports, and “first organisation” fallback scope.
- UI text or cards that imply a regulatory, payment-provider, statutory, medical, clinical, or institutional integration is live when it is not.

Use repository-wide searches to prove removal from runtime code. Keep an evidence log listing the search terms, affected files, and replacements.

## Required architecture

### Institution and tenancy

- Use one organisation record: `NWUCHAS`.
- Derive organisation, campus, and role scope from the authenticated session only. Do not accept arbitrary organisation IDs/codes from normal clients.
- Replace `CampusContext` and client-local identity state with API-backed institution/campus configuration and a server-issued session.
- Institution, campus, programme, department, cohort, term, subject, fee schedule, residence, document template, and integration configuration must be managed through authorised administrative CRUD.

### Authentication and authorisation

- Use a secure HTTP-only, Secure, SameSite session cookie in production, with CSRF protection for mutation requests.
- Remove known development secrets and forbid server startup in production when required secrets are missing.
- Require authentication for every protected route. Default-deny permissions.
- Implement role/permission checks at API/service level, including organisation and campus access constraints.
- Add account lockout/rate limiting, password policy, password reset flow, session revocation, MFA for privileged finance/administration roles, and audit records for security events.
- Never trust client-local role, campus, 2FA, or entitlement state.

### Database and migrations

- Use PostgreSQL with least-privilege application and migration accounts.
- Create reviewed Prisma migrations for every schema change. Do not use `prisma db push` in production.
- Add unique constraints, foreign keys, indexes, check constraints where supported, soft-delete/archive fields where required, optimistic concurrency/version fields for edit conflicts, and created/updated/actor metadata.
- Add database-backed sequence/numbering services for student, application, invoice, receipt, journal, document, payment, staff, and asset identifiers.
- Provide backup/restore procedures and prove a restore in a non-production environment.

### Audit and lifecycle

- Use one immutable audit-event model for all sensitive actions: actor, role, organisation, campus, action, entity type/id, correlation ID, source/IP metadata, timestamp, before value, after value, reason, and approval linkage.
- Implement lifecycle states explicitly: Draft → Submitted → Reviewed → Approved/Rejected → Published/Posted/Closed, as relevant to each module.
- Enforce state transitions in services, not merely in the UI.

## Module-by-module delivery requirements

Implement modules in this order. A module is not complete until its UI, API, data model, authorization, audit, tests, and error states are complete.

### 1. Foundation and administration

- NWUCHAS institution profile, campuses, departments, programmes, academic years, terms, roles, permissions, users, numbering policies, document templates, and system settings.
- Full CRUD with server validation and audit trail.
- Setup wizard for required information; no fabricated details.

### 2. Admissions and student registry

- Applicant creation, editing, submission, document checklist, decision workflow, offer/acceptance, enrolment, guardian/emergency-contact management, programme/cohort allocation, defer/withdraw/transfer/archive.
- Student number generated transactionally only upon authorised enrolment.
- Student API never returns fixtures and never writes an in-memory fallback.
- Search, pagination, filtering, export, edit history, and controlled duplicate handling.

### 3. Academics and examinations

- Programme structure, modules/subjects, assessments, marking schemes, score entry, validation, moderation, approval, publication, transcript/report generation, corrections, and versioned result history.
- No generated scores, ranks, grades, ECZ claims, or report cards.
- Results remain empty until authorised assessments and scores are entered.

### 4. Attendance and engagement

- Calendar/session setup, class/cohort register creation, attendance entry, amendment workflow, absence reason, evidence/approval, reports, and exports from stored attendance records.
- No pre-generated timelines, historical rates, birthday lists, residence counts, compliance claims, or attendance statistics.
- Derived metrics must be calculated from persisted records and display the applicable date range and record count.

### 5. Finance and payments

- Fee schedules, invoices, invoice lines, discounts/scholarships, credit notes, payment intents, payment allocation, receipts, refunds/reversals, cashbook, journals, double-entry ledger, ageing, reconciliation, and close periods.
- Monetary values use integers/decimal-safe types; never JavaScript floating-point currency.
- Numbers and receipts come from database sequences.
- Payment providers use verified webhook signatures, idempotency, replay protection, inbox/outbox records, retry policy, reconciliation, and a disabled state until configured.
- No client-side payment confirmation or simulated 2FA.

### 6. Staff, HR, and payroll

- Staff identity, contracts, qualifications, leave, attendance, payroll inputs, approval, payroll run, payslips, statutory deductions only where legally verified/configured, and immutable paid-run history.
- Do not store HR data in localStorage or fabricate statutory identifiers.

### 7. Residence, transport, assets, and operations

- Residence halls/rooms/beds, allocations, roll-calls, exeats, visitor logs, maintenance, transport routes, stops, assignments, and asset lifecycle records must be configured and operated from the database.
- If NWUCHAS has not supplied residence data, show an honest empty state and authorised setup action—never invented halls or capacity.

### 8. Clinical learning

- Clinical sites, agreements, supervisors, placements, logbook entries, competency assessments, sign-off, escalation, and audit history.
- Do not pre-seed clinical sites/patient facts. Use de-identified learning evidence and strict role scope.

### 9. Communications, documents, portals, and integrations

- Messages, notices, document requests, templates, generated documents, approval, delivery status, and archive records must persist server-side.
- Student/sponsor portal must authenticate each account and restrict access to linked records only.
- All integrations require explicit configuration, secret management, health status based on real checks, and an honest “not configured” state.

## UI and UX standard

- Keep the polished, dense enterprise application feel, but never use decorative values as operational facts.
- Every list requires loading, empty, error, unauthorized, and success states.
- Every destructive action requires confirmation and states its scope.
- Tables require server-backed search/filtering/pagination and export permissions.
- Forms require validation, field-level errors, unsaved-changes warning, optimistic concurrency conflict handling, and accessible keyboard operation.
- Status badges must map to real lifecycle state from the API.
- Use a single NWUCHAS design system and institution profile; no Legacy assets, terminology, or branding.

## Production infrastructure and security

- Replace `edusphere` package/database/volume names and remove default secrets from Docker configuration.
- Use environment-specific configuration, a secrets manager, TLS termination, secure cookies, security headers, request size limits, CORS policy, rate limits, structured logging, error tracking, health/readiness endpoints, metrics, and alerting.
- Do not publish PostgreSQL or Redis publicly in production.
- Add encrypted backups, tested restore, retention policy, disaster recovery runbook, dependency scanning, secret scanning, SAST, and regular access reviews.
- Pin and update dependencies deliberately; resolve framework/security advisories before release.

## Testing and release gates

No module may be marked complete without:

1. Unit tests for validation, permission checks, lifecycle transitions, numbering, and calculations.
2. Integration tests against PostgreSQL for CRUD, transactions, tenancy/campus isolation, and audit creation.
3. End-to-end tests for all critical workflows: login, admissions-to-enrolment, assessment-to-publication, attendance entry/amendment, invoice-to-payment/reconciliation, and document approval.
4. Negative tests proving unauthorised users cannot read/write out-of-scope data.
5. Tests proving database failure never produces fixture data or false success.
6. Migration test from empty database and rollback/restore verification.
7. Accessibility, performance, security, and mobile/responsive checks.
8. A clean repository search proving runtime code contains no Legacy/EduSphere names, fixture generators, static operational arrays, mock/fake/simulation paths, or localStorage operational records.

## Required implementation workflow

1. Create a remediation backlog from the current repository audit, grouped by module and risk.
2. Add a machine-checkable “no inherited runtime data” test/lint gate before broad UI changes.
3. Establish migrations, authentication, authorization, audit service, numbering service, API validation, and error conventions first.
4. Replace one module end-to-end at a time. Do not claim a module complete because its labels have changed.
5. Run tests and inspect the running route after each module.
6. Maintain `docs/PRODUCTION_REMEDIATION_STATUS.md` with: completed work, evidence, migrations, APIs, tests, known gaps, and release blockers.
7. Do not create a production deployment, connect a real payment provider, send messages, or process real personal/financial/clinical data without explicit authorisation and required credentials.

## Definition of done

The CMIS is production-ready only when:

- every displayed operational record is traceable to authorised NWUCHAS database data;
- every permitted create/edit/delete action persists correctly and is auditable;
- all fake/fallback/static operational data is removed from runtime code;
- permissions, scope, security controls, migrations, backup/restore, tests, observability, and release checks pass;
- live integrations are either genuinely configured and verified or honestly disabled;
- a full user acceptance test confirms real workflows for NWUCHAS administrators, admissions, lecturers, finance, HR, clinical supervisors, students, and sponsors.

Until then, label the environment as development only and do not represent it as an operational CMIS.
