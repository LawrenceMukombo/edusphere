# NWUCHAS-CMIS Production Remediation Status Register

**Institution:** North Western University College of Health and Applied Sciences (NWUCHAS)  
**Location:** Plot 412, Lumwana Road, Manyama Educational Corridor, Kalumbila, Zambia  
**Baseline Document:** `docs/NWUCHAS_Production_Remediation_Agent_Prompt.md`  
**Date:** 25 October 2026 | **Environment Status:** Active Remediation Phase  

---

## 1. Executive Summary

This register tracks the comprehensive transformation of the NWUCHAS-CMIS codebase from the inherited EduSphere/Legacy School baseline into a production-grade, single-institution College Management Information System strictly for NWUCHAS.

All operational records must originate from the authoritative PostgreSQL database (`nwuchas_cmis`). In-memory fixtures, fake fallbacks (`generateLegacyLearners`), random identifiers, and client-side balance/payment/2FA simulations are strictly eliminated from runtime execution paths.

---

## 2. Immediate Stop-the-Line Defects Inventory

| Defect ID | Severity | Category | Description | Affected Areas | Remediation Strategy |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **DEF-001** | **P0** | Simulated Data | `generateLegacyLearners(780)` and `legacySchoolData.ts` imported in runtime screens and APIs | `src/app/teacher/page.tsx`, `src/app/finance/page.tsx`, `src/app/admissions/page.tsx`, `src/app/boarding/page.tsx`, `src/app/attendance/page.tsx`, `src/app/documents/page.tsx`, `src/app/messages/page.tsx`, `src/app/api/students/` | Replace with Prisma database queries or decommission redirected legacy routes in favor of `/modules/[slug]`. |
| **DEF-002** | **P0** | Inherited Tenancy | Legacy School, Chenoda, Mushitala, Kansanshi, Urban Campus, LSS identifiers in fixtures and UI | `src/server/services/legacySchoolData.ts`, legacy routes | Ensure `NWUCHAS` is the sole institution in scope. Remove/isolate legacy school data. |
| **DEF-003** | **P0** | False Fallbacks | In-memory successful fallbacks when database query returns empty or fails | `src/app/api/students/route.ts`, `src/app/admissions/page.tsx` | Eliminate fallback generators; return honest empty states or typed server errors. |
| **DEF-004** | **P1** | Browser Persistence | Operational state or candidate records stored in browser storage | `localStorage` usage in legacy components | Constrain `localStorage` strictly to non-sensitive UI preferences (such as collapsed sidebar). |
| **DEF-005** | **P0** | Numbering | Random business identifiers (`Math.random()`) for students, applications, receipts | UI components and legacy services | Use transactional, database-enforced numbering sequences (`NWU-APP-...`, `NWU-2026-...`, `REC-...`). |
| **DEF-006** | **P1** | Unverified Claims | Decorative badges or cards implying live regulatory (NMCZ/HPCZ), payment, or SMS integrations | Header cards, setting toggles | Mark external integrations explicitly as "Integration Configuration Required" or "Sandbox / Offline". |

---

## 3. Module Remediation Backlog & Progress

### Module 1: Foundation & Administration
- [x] Single institution organization record locked to `NWUCHAS`.
- [x] Dedicated session cookie `nwuchas_cmis_session`.
- [x] Universal Search engine indexed across all active NWUCHAS modules.
- [ ] Decommission legacy `/admin` routes in favor of `/modules/administration`.
- [ ] Database-backed sequence services for numbering policies.

### Module 2: Admissions & Student Registry
- [x] Multi-stage admissions workflow: `SUBMITTED` -> `DOCUMENT_CHECK` -> `ELIGIBILITY_REVIEW` -> `COMMITTEE_REVIEW` -> `OFFERED` -> `ENROLLED`.
- [x] Candidate dossier modal with auto-dismissing toast notifications.
- [x] Prospective student sign-in with Email, Phone, NRC (normalized), and Application Number.
- [x] Interactive workflow visualizer on `/apply`.
- [ ] Remove `generateLegacyLearners` fallback from legacy `/admissions` route.
- [ ] Transactional student number assignment upon matriculation only.

### Module 3: Academics & Examinations
- [x] Academic modules schema: nursing, clinical medicine, pharmacy programmes.
- [ ] Decommission legacy school secondary subjects (Form 1 - Form 4) in runtime endpoints.
- [ ] Implement server-side assessment score entry and moderation workflow.

### Module 4: Attendance & Engagement
- [x] Timezone locked to `Africa/Lusaka` (CAT).
- [ ] Replace 780 legacy learner roster in `src/app/attendance/page.tsx` with enrolled college students query.
- [ ] Class register generation strictly from database cohorts.

### Module 5: Finance & Payments
- [x] Double-entry general ledger architecture with credit/debit validation.
- [x] Consolidated `/modules/finance` with Payment Orchestration & Fee Ledger.
- [ ] Remove legacy `generateLegacyLearners` billing balances from `src/app/finance/page.tsx` and `/api/finance/balances`.
- [ ] Connect fee balances to real Prisma `Invoice` and `LedgerEntry` tables.

### Module 6: Staff, HR & Payroll
- [x] Zambia statutory rules (NAPSA 5% capped, NHIMA 1%, PAYE bands 2026).
- [ ] Remove hardcoded legacy staff fixtures from runtime HR routes.
- [ ] Persist payroll runs transactionally to `PayrollRun` in Prisma.

### Module 7: Operations, Boarding & Assets
- [ ] Replace legacy boarding hall fixtures (Boys' Hall / Girls' Hall) with NWUCHAS college residence allocations.
- [ ] Database-backed asset registry lifecycle.

### Module 8: Clinical Learning
- [x] Clinical site, supervisor, and placement schema models present in Prisma.
- [ ] De-identified clinical logbook entries and competency sign-offs.

### Module 9: Communications, Documents & Portals
- [x] Merged candidate online portal into Admissions & candidate portal.
- [ ] Replace legacy document learner profiles with database learners.

---

## 4. Verification Evidence & Test Run Register

- **Test Suite Status:** 21 test files, 84 tests passing (Vitest baseline).
- **TypeScript Compilation:** `npm run check` (`tsc --noEmit`) 0 errors.
- **Dedicated Enforcement Gate:** Added `tests/no-inherited-runtime-data.test.ts`.

---

## 5. Institutional Blockers & External Dependencies

1. **Merchant / Acquirer Credentials:** Mobile Money (MTN MoMo, Airtel Money) and Bank integrations remain offline until production merchant agreements are finalized.
2. **Regulatory API Access:** Direct NMCZ / HPCZ indexing APIs remain in manual upload mode until statutory portal endpoints are authorized.
