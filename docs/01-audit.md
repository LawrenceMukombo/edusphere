# NWUCHAS-CMIS Phase 0 audit

**Date:** 22 October 2026. **Scope:** local independent copy at `C:\nwuchas`; no production system was contacted.

## Evidence and baseline

- Git remote is `https://github.com/LawrenceMukombo/edusphere.git`; it is an inherited upstream remote, not evidence of a dedicated NWUCHAS remote. It must be replaced or removed before any push.
- Current branch is `fix/tenant-isolation-api`. A pre-existing JWT-secret hardening change in `src/server/auth.ts` was preserved; NWUCHAS-specific session isolation was added separately.
- `npm run check` passes. Verbose Vitest baseline: 11 files / 51 tests pass. The suite remains legacy-focused and does not evidence the NWUCHAS acceptance criteria.
- No `.env` files were present. No database, object-store, payment, e-mail or SMS credentials were used.

## Inventory

| Area | Evidence | Classification | Required disposition |
|---|---|---|---|
| Web/API | Next.js 14 route handlers and services | Partial | Retain stack; establish authenticated domain boundaries. |
| Persistence | Prisma/PostgreSQL schema | Partial, school/multi-tenant | Additive NWUCHAS migrations only. |
| Identity | JWT/bcrypt and school roles | Partial | Retain primitives; replace roles/scope/MFA controls. |
| Tenancy | Organisations, subscriptions, `/api/tenants` | Incompatible | Retire external tenant selection and SaaS billing. |
| Admissions/registry | Learner/class/guardian plus generated fallbacks | UI-heavy/partial | Build applicant/student workflows. |
| Academics/finance/HR | School-oriented models | Partial | Adapt only behind tested domain contracts. |
| Clinical/payroll/payments | No verified domain models/adapters | Absent | Build in phases. |

## Material findings

1. Legacy School/EduSphere fixture records and generated fallbacks occur in routes/UI. They are demo fixtures, not acceptable NWUCHAS records.
2. The legacy tenant API has demo fallback/provisioning paths without server-side enforcement. It must not be exposed for NWUCHAS.
3. The schema models multi-institution subscriptions and school roles; it cannot meet the PRD without a controlled additive transition.
4. Docker allowed well-known fallback production secrets and inherited database naming. This change set removes those defaults.
5. The lock file records a Next.js security warning; dependency remediation is required before release.
6. Login now rejects users outside the active `NWUCHAS` organisation and the server session cookie namespace is `nwuchas_cmis_session`; an inherited EduSphere browser session must not be reused.

## Immediate controls

Do not run database push/seed, Docker Compose, migrations, payment actions or deployments against non-local systems until DSNs, accounts and ownership are verified. Use separate NWUCHAS credentials, database, bucket, senders, merchant IDs, webhook endpoints and deployment targets. The runtime's local fallback now targets only `nwuchas_cmis`; database-backed tests require an explicitly provisioned dedicated DSN. This workstation currently has no local PostgreSQL service/listener/client, so provisioning remains an environment prerequisite rather than a reason to reuse the inherited EduSphere database.
