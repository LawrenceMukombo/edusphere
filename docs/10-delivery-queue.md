# NWUCHAS-CMIS delivery queue

This queue is tracked against the active transformation goal. Tasks remain ordered by dependency and safety; `blocked` means that an institutional owner or external authority must provide evidence before work can proceed.

| Order | Status | Work item | Exit evidence |
|---|---|---|---|
| 1 | In progress | M1 dedicated foundation: replace school/SaaS schema and legacy administration UI with NWUCHAS organisation, RBAC and audit foundations | dedicated RBAC capability tests pass; additive migration/bootstrap runbook remain database-gated |
| 2 | In progress | M1 registry/workflow: applicant and immutable student identity/status history | admissions application/status-history schema contract and transition tests exist; API/UI/audit persistence awaits the dedicated database migration |
| 3 | Queued | M2 admissions vertical slice | mobile draft-to-enrolment lifecycle without duplicate student |
| 4 | Queued | M3 academics, examinations and fees | curriculum versioning, result approval and reconciled journals |
| 5 | Queued | M4 HR/payroll/statutory rules | effective-dated rules, dual approval, locked run, manual exports/evidence |
| 6 | Blocked | Obtain accountant-approved PAYE/NAPSA/WCFCB inputs and employer identifiers | source links, effective dates and reviewer approval |
| 7 | Queued | M5 payment orchestration and manual EFTPOS | idempotent intent/webhook/settlement tests; no live merchant use |
| 8 | Blocked | Merchant/acquirer/provider onboarding | contracts, sandbox credentials/specification and owner approval |
| 9 | Queued | M6 clinical/regulatory and remaining operations | de-identified logbook/placement/OSCE controls |
| 10 | Blocked | Regulator interface enablement | official specification and authorised sandbox access |
| 11 | Queued | M7 release hardening | accessibility, performance, security, backup restore, UAT and release sign-off |

## Development workspace coverage — 22 October 2026

Every visible NWUCHAS module now receives a clearly labelled synthetic `ModuleWorkspaceRecord`, shown in its workspace and retrievable through the authenticated `/api/modules/:slug` endpoint. The seed also creates development-only academic subject/assessment/score, attendance, admissions, invoice/payment/allocation/receipt, staff, notice and RBAC examples. Administrators can add a development activity record through the same API; each write is audited.

This is seed and workflow-interface coverage, not a declaration that all PRD workflows are production-complete. Clinical learning remains free of patient data; payroll/statutory, payments-provider, regulator, sponsor, asset, document and portal records remain development-safe placeholders until their dedicated vertical slices and authorised inputs are delivered.

## Immediate prerequisite

Database-backed work now defaults only to a local `nwuchas_cmis` database and production requires `DATABASE_URL`. A fresh local PostgreSQL 16 container is running on `127.0.0.1:5434`, backed by the NWUCHAS-specific volume. It contains only clearly labelled synthetic development records created with `npm run seed:nwuchas`; it is not a copy of any Legacy School database. The local schema was synchronised only to this development target; create reviewed migration history before any shared or production deployment. Institutional bootstrap remains gated on verified official contact, registration, campus, and authorised administrator details. The seed never creates statutory rules, live merchant configuration, regulator data, clinical patient data, or payroll records. Do not use `prisma db push` against inherited data.
