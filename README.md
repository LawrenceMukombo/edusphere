# NWUCHAS CMIS — Campus Management Information System

> **North Western University College of Health and Applied Sciences (NWUCHAS)**  
> *Plot 511/518 Shilenda Road, Manyama, Lumwana, Kalumbila District, North-Western Province, Zambia*  
> **Official Website:** [nwuc.edu.zm](https://nwuc.edu.zm) | **Email:** [info@nwuc.edu.zm](mailto:info@nwuc.edu.zm) | **Admissions:** [admissions@nwuc.edu.zm](mailto:admissions@nwuc.edu.zm)  
> **Contact Hotlines:** 0964240051 • 0955550051 • 0979000051 • 0974896096 • 0974240051 | **WhatsApp:** +260 775747848

---

## 1. Institutional Overview & Accreditation

NWUCHAS is a premier Zambian higher education institution dedicated exclusively to health and applied sciences education. The college operates its main campus in Manyama, Lumwana, and clinical training annexes in Solwezi.

All tertiary programmes and curricula are fully verified and accredited under Zambian statutory frameworks:
- **Higher Education Authority (HEA):** Institutional Registration No. `HEA/INST/2024/089`
- **Nursing and Midwifery Council of Zambia (NMCZ):** Accredited Nursing School (Diploma in Registered Nursing)
- **Health Professions Council of Zambia (HPCZ):** Accredited Clinical Medicine School (Diploma in Clinical Medicine / COG & Diploma in Public Health)

---

## 2. Institutional Brand Standards & Palette

| Element | Color Name | Hex Code | Purpose |
|---|---|---|---|
| **Primary** | Teal-blue | `#007B99` | Navigation brandmark, primary buttons, active links, header accents |
| **Secondary** | Lime-green | `#8DC63F` | Action CTA buttons, status badges, banners, success states |
| **Accent** | Pink | `#EC008C` | Healthcare heart pulse indicators, statutory alerts, fee highlights |

---

## 3. Core CMIS Functional Modules

1. **Admissions & Candidate Portal (`/apply`):**
   - Public online applications for Registered Nursing, Clinical Medicine, and Public Health.
   - Dynamic, month-aware intake session detection (January Main Intake & Mid-Year In-Service Intake).
   - Collapsible step navigation, automated ECZ 5-credit eligibility verification, next-of-kin capture, and multi-file document uploads.
   - Integrated application processing fee checkout (MTN MoMo, Airtel Money, Zamtel Kwacha, Zanaco Bank, and Campus Bursar).
   - Instant tracking number issuance (`NWU-APP-...`) and real-time candidate portal.

2. **Executive & Registry Portal (`/portal/executive`):**
   - High-level KPIs: Enrolled Trainees, Hospital Placements, Bed Occupancy, Fee Collections, and Statutory Payroll.
   - One-click generation of Official Provisional Offer Letters, Final Acceptance Letters, and Official Academic Transcripts.

3. **Academic Engine & OSCE Assessment (`/modules/academics`):**
   - Curricula management for 3-year health diplomas.
   - Objective Structured Clinical Examination (OSCE) 8-station evaluation matrix.
   - Result moderation workflow (Draft → Faculty Moderated → Senate Approved → Published).

4. **Clinical Attachments & Hospital Rotations (`/modules/clinical`):**
   - Hospital rotation scheduling across Solwezi General Hospital, Lumwana First Level Hospital, and Manyama Rural Health Centres.
   - Privacy-preserving clinical logbook entry with anonymized patient identifiers and supervisor digital sign-offs.

5. **Operations, Hostels & Digital Transport (`/modules/operations`):**
   - Florence Nightingale (Female) and Albert Schweitzer (Male) hostel room and bed allocation.
   - Solwezi-Manyama campus shuttle routing, fuel telematics, and digital bus passes.

6. **Statutory Attendance & Returns (`/modules/attendance`):**
   - Trainee Attendance Passports with biometric/card tracking.
   - Monthly & termly attendance horizons, Form 12A statutory returns for councils, and DEBS audit trails.

7. **Finance, Fee Ledgers & Payments (`/modules/finance` & `/modules/payments`):**
   - Double-entry chart of accounts, immutable journal audit trail, sequential official invoices and receipts.
   - LamtonPay Mobile Money (MTN MoMo, Airtel Money, Zamtel Kwacha) automated webhook clearance and fee reconciliation.

8. **Statutory Zambian Payroll (`/modules/payroll`):**
   - NHIMA statutory employee/employer deductions (1% each, capped at ZMW 332.00).
   - NAPSA statutory pension deductions (5% employee + 5% employer, 2026 statutory ceiling ZMW 1,570.80).
   - ZRA PAYE 2026 progressive tax bands (0%, 20%, 30%, 37.5%).
   - Official cryptographic QR-verified payslips with direct PDF printing.

---

## 4. Technology Architecture

- **Framework:** Next.js 14 App Router + React 18, TypeScript (Strict).
- **Styling:** Tailwind CSS with custom NWUCHAS palette (`#007B99`, `#8DC63F`, `#EC008C`).
- **Database & ORM:** PostgreSQL 16+ / PostGIS, Prisma ORM 5.22.
- **Security & RBAC:** Edge-safe JWT sessions, HTTP-only Lax cookies, strict multi-tenant isolation, separation of powers.
- **Offline PWA:** Service Worker v1.0.2 with cache fallbacks and IndexedDB background sync.
- **Testing:** Vitest automated test suite (25/25 test suites passed, 111/111 unit & integration tests passing).

---

## 5. Quick Start for Development

### Prerequisites
- Node.js 18+ (tested on Node v20/v26)
- PostgreSQL 16+ running on port 5434 (or configured in local environment)

### Commands
```bash
# 1. Install dependencies
npm install

# 2. Database schema generation
npx prisma generate

# 3. Type check validation (0 errors)
npm run check

# 4. Run test suite (111 tests passing)
npm test

# 5. Start development server
npm run dev
```

The application runs on `http://localhost:3025`.

---

## 6. Default Institutional Demonstration Personas

*All default local development accounts are pre-configured with dev password: `NWUCHAS-DEV-ONLY-CHANGE-ME`*

| Role | Email | Person / Office |
|---|---|---|
| **IT Administrator** | `it.admin@nwuchas.edu.zm` | Mr. Lawrence Mukombo |
| **Executive Principal** | `principal@nwuchas.edu.zm` | Dr. Mwila Chileshe |
| **Academic Registrar** | `registrar@nwuchas.edu.zm` | Mr. Kabwe Mumba |
| **College Bursar** | `bursar@nwuchas.edu.zm` | Mr. Patrick Banda |
| **Admissions Officer** | `admissions@nwuchas.edu.zm` | Ms. Brenda Mwansa |
| **Clinical Coordinator** | `clinical.coord@nwuchas.edu.zm` | Mr. Chileshe Mulenga |

---

## 7. License & Rights

© 2026 North Western University College of Health and Applied Sciences Limited. All rights reserved.  
Plot 511/518 Shilenda Road, Manyama, Lumwana, Kalumbila District, Zambia.
