# Target architecture

NWUCHAS-CMIS remains a modular monolith with PostgreSQL-compatible transactions and typed server APIs. The browser is never an authority for approvals, balances, enrolment, grades, payroll or payment finality.

```text
Portals -> authenticated API -> domain services -> transactional database
                                  |-> workflow/RBAC/audit
                                  `-> outbox + provider adapters
                                           -> manual/export by default
```

Domain boundaries: identity/access, institution, admissions, student registry, academics/exams, clinical, student finance, payment orchestration, HR/payroll, statutory rules/returns, general ledger, documents/notifications, integrations and audit/reporting.

Integration states: `UNAVAILABLE`, `MANUAL_ONLY`, `EXPORT_IMPORT`, `SANDBOX_TESTED`, `LIVE_APPROVED`. Live use requires explicit owner approval and proof.
