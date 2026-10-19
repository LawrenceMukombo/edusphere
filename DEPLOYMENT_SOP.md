# EduSphere SMIS — Robust Deployment SOP & Verification Runbook
**Standard Operating Procedure (SOP): Safe Deployments, Feature Audits & Multi-Campus Data Integrity**
*Version: v1.0.0 | System: EduSphere Multi-Campus SMIS | Compliance: Zero Data Loss / UPSERT Only*

---

## 1. Executive Summary & Purpose

This Standard Operating Procedure (SOP) establishes mandatory operational guidelines for developing, verifying, deploying, and maintaining the **EduSphere School Management Information System (SMIS)**. 

### Core Objectives:
1. **Prevent "Lost Records" Illusions & Scoping Glitches**: Guarantee that multi-campus tenant isolation never results in false-positive data loss or zeroed metrics when switching between day and boarding campuses.
2. **Enforce Non-Destructive Deployments**: Uphold strict Antigravity Global Customization Rules—**NEVER WIPE, NO OVERWRITE, UPSERT ONLY**. Never drop tables, truncate databases, or overwrite production `.env` configuration.
3. **Mandatory Pre-Flight & Post-Change Verification**: Enforce systematic, automated quality gates before any code is pushed or deployed, followed by feature and data verification audits across all campuses.

---

## 2. Root Cause Analysis: The "Lost Records" Incident

### What Happened:
A user reported *"All the records are gone!"* with a screenshot showing `Resident Boarders: 0 / 350 beds`, `Kansanshi Boys Boarding Hall: 0 / 180 capacity`, and `Kalumbila Girls Boarding Hall: 0 / 170 capacity`.

### Root Cause:
1. **Campus Filter Scoping**: The global campus selector was set to **"Urban Campus (Solwezi Central)"**. Urban Campus operates exclusively as an Early Childhood Education (ECE) & Primary Day School (360 day pupils, 0 boarders).
2. **Facility-to-Campus Over-Filtering**: The Boarding Village overview cards were previously filtering the residential population against the active campus pool (`campusPool`). When Urban Campus was selected, `campusPool` contained only day scholars, causing the boarding counters to compute `0 / 350 beds (0%)`.
3. **The Data Was Not Lost**: In fact, the directory table tab explicitly showed `Directory (360)`, confirming all 360 Urban scholars were intact, and the 420 Mushitala scholars (including 315 boarders) existed in the database. However, displaying `0 / 350` on facility cards created the perception of a catastrophic data wipe.

### Architectural Invariants Enforced:
1. **Institutional Facility Totals**: Physical facilities belonging to the school institution (e.g., Boarding Village, 250kVA generator standby power, central chemistry labs) **MUST ALWAYS** display institutional baseline metrics (315 / 350 beds, 158 boys, 157 girls) regardless of which campus is currently active in the top navigation.
2. **Context Banners with Quick-Switch Controls**: When a day-only campus (Urban Campus) is selected while browsing boarding facilities, the UI must render an informative banner clearly explaining that Urban Campus is day-only, and provide an instant 1-click button to *"Switch to Mushitala Boarding Wing"* or *"View All Campuses Consolidated"*.
3. **Synchronous State Fallback**: Client-side state initialization (`learnersList`) must initialize synchronously with baseline data (`generateLegacyLearners(780)`) so the UI never mounts an empty array `[]` before localStorage/API hydration completes.

---

## 3. Pre-Deployment Automated Quality Gates

Before any deployment, pull request, or commit, the following three automated checks **MUST** be run locally in PowerShell:

```powershell
# 1. Strict TypeScript Compile Check (Zero Type Errors)
npm run check

# 2. Automated Test Suite (All Unit & Integration Tests Must Pass)
npm test

# 3. Production Bundle Build (Zero Next.js Compilation Errors)
npm run build
```

### Passing Criteria:
- `npm run check` exits with code `0` (zero `TS2304`, `TS2552`, or any other compilation errors).
- `npm test` runs 6 test suites and achieves **100% pass rate** (`tests/guardian-access.test.ts`, `tests/gis-campuses.test.ts`, `tests/academic-engine.test.ts`, `tests/attendance.test.ts`, `tests/tenant-isolation.test.ts`, `tests/finance-ledger.test.ts`).
- `npm run build` generates all static and dynamic chunks without bundle failure.

---

## 4. Post-Change Feature & Data Integrity Audit Checklist

Following any modification to `src/app/`, `src/server/`, or `src/lib/`, the engineer or deployment agent must execute the following structured verification:

### Audit Step 1: Multi-Campus & Boarding Verification Matrix

| Campus Context | Expected Total Pupils | Expected Boarders | Expected Day Scholars | Boarding Village Display |
| :--- | :--- | :--- | :--- | :--- |
| **All Campuses (Consolidated)** | **780** | **315** | **465** | 315 / 350 Beds (90% Occ)<br>158 Kansanshi Boys, 157 Kalumbila Girls |
| **Mushitala Campus (Secondary & Boarding)** | **420** | **315** | **105** | 315 / 350 Beds (90% Occ)<br>158 Kansanshi Boys, 157 Kalumbila Girls |
| **Urban Campus (Solwezi Central ECE/Primary)** | **360** | **0 (Campus)**<br>*315 (Institution)* | **360** | Banner: "ECE & Primary Day School"<br>Facility Cards: 315 / 350 Institutional Beds<br>Switch Button: "Switch to Mushitala Boarding Wing" |

*Check Passed:* Verify that clicking between **All Campuses**, **Mushitala**, and **Urban Campus** preserves student counts and never displays an unexpected `0` on facility cards.

---

### Audit Step 2: Academic Performance & Full ECZ Subject Spectrum

Verify that student dossiers and performance engine reflect the full Zambian ECZ curriculum:
1. **Senior Secondary (Forms 3, 4, 5)**:
   - Full 12-subject spectrum:
     - Mathematics
     - English Language
     - Biology
     - Chemistry
     - Physics
     - Computer Studies / ICT
     - Civic Education
     - Geography
     - History
     - Commerce & Principles of Accounts
     - Religious Education (RE 2046)
     - Zambian Languages (KiKaonde)
2. **Junior Secondary (Forms 1, 2)**: 10 subjects including Integrated Science, Social Studies, Business Studies.
3. **Primary (Grades 1 to 7)**: 8 foundational subjects (Literacy, Numeracy, Integrated Science, CTS, Social Studies, Home Economics, Physical Education, Zambian Language).
4. **Class Scorecards**:
   - Class leaderboard ranked by Class Average (%)
   - Pass Rate (%), Division 1 Rate (%), Total Distinctions count
   - Best Performing Student named with score.
5. **Student 360° Historical Performance Graph**:
   - Multi-term trajectory (2025 Term 1, 2, 3; 2026 Term 1) rendered with interactive trend curves and ECZ division badges.

---

### Audit Step 3: Operational Attendance & Roll-Call Verification

1. **Boarding Roll-Call Console**:
   - Open *"Conduct Roll-Call"* modal.
   - Test Scopes: **Kansanshi Boys Boarding Hall (158)**, **Kalumbila Girls Boarding Hall (157)**, and **Entire Boarding Village (315)**.
   - Verify Session types: **Curfew Bed-Check (21:30)**, **Evening Prep Study (19:00 - 21:00)**, **Morning Muster (06:30)**.
   - Verify status transitions: `PRESENT` -> In Dorm, `SICKBAY` -> Clinic/Infirmary, `APPROVED_EXEAT` -> Excused Gatepass.
   - Ensure saving roll-call updates both student dossier and live attendance state.

---

### Audit Step 4: Enterprise Table & CRUD Pre-fill Standards

In accordance with Platform Rule 24:
1. **Interactive Controls**:
   - Pagination (10, 25, 50, 100 per page)
   - Search bar across learner names, student IDs, and guardian details
   - Column visibility popover to toggle columns on/off
   - Sortable column headers (ascending/descending indicators)
2. **Row Click & Pre-filled CRUD Modals**:
   - Clicking any student row opens the **Student 360° Dossier Drawer/Modal**.
   - Clicking *"Edit Biodata & Guardian"* pre-fills learner name, gender, class, guardian phone, and email.
   - Saving updates local state and persists via storage/API with user toast notification.

---

## 5. Non-Destructive Production Deployment Runbook

### Protected Files Notice (DO NOT TOUCH):
- `.env`, `.env.production`, `.env.local`
- `nginx.conf`, PM2 configs, SSL certificates
- Database credentials, production tokens

### Safe Deployment Sequence (Hostinger VPS / Production Linux):

```bash
# 1. Navigate to deployment root
cd /var/www/edusphere

# 2. Check Git status (ensure working tree is clean)
git status

# 3. Pull verified changes from release branch
git pull origin feat/edusphere-smis-baseline

# 4. Install production dependencies safely
npm install --production=false

# 5. Execute additive database migrations ONLY if required (NO RESET, NO FORCE)
# npx prisma migrate deploy  (Only run additive migrations; NEVER db push --force-reset)

# 6. Build the Next.js production bundle
npm run build

# 7. Graceful reload of PM2 process
pm2 reload legacyschool || pm2 start npm --name "legacyschool" -- run start

# 8. Save PM2 process list
pm2 save

# 9. Verify production process logs (no unhandled rejections or crashes)
pm2 logs legacyschool --lines 50

# 10. Confirm system responsiveness
curl -I http://localhost:3025/attendance
```

---

## 6. Rollback & Emergency Contingency

If a production regression or data display issue occurs:
1. **Immediate Rollback**:
   ```bash
   git log -n 5 --oneline
   git checkout <LAST_KNOWN_STABLE_COMMIT_HASH>
   npm run build
   pm2 reload edusphere
   ```
2. **Data Preservation Guarantee**:
   Because EduSphere employs **UPSERT ONLY** and client-safe persistence routines, rolling back code will never delete or corrupt persistent student records.
3. **Escalation**:
   Notify the Principal/Director and System Administrator with the exact error log and commit identifier.

---
*EduSphere SMIS Engineering Team | Solwezi Operations Online | 2026*
