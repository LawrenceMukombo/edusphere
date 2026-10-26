# Implementation backlog and traceability

| ID | PRD requirement | Milestone | Acceptance evidence |
|---|---|---|---|
| NWU-001 | Dedicated single institution/isolation | M0/M1 | no tenant selection; dedicated resources checklist |
| NWU-002 | RBAC/audit | M1 | authorisation and segregation tests |
| NWU-003 | Applicant-to-enrolment | M2 | server workflow contract implemented; remaining schema/API/UI/audit persistence and end-to-end application/enrolment test |
| NWU-004 | Academics/exams/fees | M3 | immutable journal, finance capture, and versioned result-correction foundations implemented; legacy invoice/payment service now enforces tenant ownership, exact amounts, no overpayment and single reversal. Remaining programme/semester schema, persisted moderation/journals and reconciliation tests |
| NWU-005 | Payroll/statutory rules | M4 | approval-gated, effective-dated progressive-calculation foundation implemented with boundary tests; remaining persistence, payroll workflow, exports and accountant-approved real inputs |
| NWU-006 | Digital collections | M5 | payment confirmation contract now requires signed, server-verified exact-match events and detects replay; remaining persistence, adapters, ledger posting and settlement tests |
| NWU-007 | Clinical/regulatory | M6 | de-identified logbook validation and supervisor-transition contract implemented; remaining placement persistence, approvals, regulator evidence and OSCE workflows |
| NWU-008 | Release readiness | M7 | restore, performance, accessibility, security and UAT evidence |

NWU-001 now includes deployment isolation plus a dedicated, authenticated `/api/institution` profile endpoint. The inherited `/api/tenants` provisioning surface is retired with HTTP 410. Legacy browser-side tenant registry, switching and provisioning actions are disabled. The remaining administration UI is intentionally not a NWUCHAS operational surface and will be replaced in M1; no operational admissions workflow is claimed complete.
