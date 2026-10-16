# EduSphere SMIS — Enterprise School Management Information System

> **ONE SCHOOL. ONE DIGITAL PLATFORM. ONE CONTINUOUS LEARNER RECORD.**

**Product Category:** Enterprise SaaS / Education Technology / School ERP  
**Initial Market:** Zambia (Primary), Southern Africa & International (Expansion)  
**Standard:** Enterprise Baseline | **Baseline PRD:** 2026

---

## 1. Executive Summary

EduSphere SMIS is a Zambia-first, cloud-capable, enterprise-grade School Management Information System engineered for early childhood education (ECE) centres, primary schools, secondary schools, combined academies, and multi-campus school groups.

Built around a high-performance modular monolith with strict multi-tenant isolation, EduSphere SMIS complies with the **Education Act 2011 (as amended 2026)**, the **Data Protection Act 2021 (Section 70 Data Residency)**, and the **Teaching Profession Act 2026**.

---

## 2. Core Functional Modules

1. **Multi-Tenant Foundation & SaaS Oversight (`/admin`):** Provision isolated school tenants, manage multi-campus branches, and govern subscription tiers (Community Starter K149/mo to Enterprise Group).
2. **Admissions & Longitudinal Learner Registry (`/admissions`):** Online/in-person applications, unique student number generation, class allocations, verified guardian links, and permanent historical records.
3. **Academic Engine & Report Moderation (`/academics`):** Configurable curriculum schemes, continuous assessment weighting (40% CA, 60% Exam), Early Childhood qualitative developmental milestone rubrics, moderation workflow (Draft &rarr; Moderated &rarr; Approved &rarr; Published), and branded PDF report cards.
4. **Teacher Workspace & Offline Attendance (`/teacher`):** Fast class registers, lateness tracking, continuous assessment markbooks, and offline synchronization queue simulation.
5. **Fees, Billing & Financial Ledger (`/finance`):** Configurable fee schedules, automated invoicing with idempotency keys, payment recording across cash, bank, and mobile money, sequential receipts, and immutable double-entry posting journal.
6. **Parent & Guardian Portal (`/parent`):** Mobile-first responsive experience allowing guardians to toggle between verified children, inspect attendance, view published report cards, and simulate online fee payments.
7. **Staff & TCZ Credential Tracking (`/hr`):** Directory of educators with qualifications, Teaching Council of Zambia registration tracking, and 90-day certificate expiry alerts.

---

## 3. Technology Stack

- **Frontend:** Next.js 14 (App Router) + React 18, TypeScript, Tailwind CSS, Lucide Icons, Enterprise Table Component (Rule 24), Interactive Analytics Engine (Rule 25).
- **Backend & APIs:** Next.js Route Handlers + Modular Domain Services, OpenAPI 3.0 specification (`/api/docs`), JWT authentication, bcrypt hashing.
- **Database:** PostgreSQL 18.4, Prisma 5.22.0 ORM, UUID primary keys, currency-safe decimals, versioned migrations.
- **Testing:** Vitest 5.0.5 automated test runner (12/12 passing tests).

---

## 4. Quick Start & Local Development

### Prerequisites
- Node.js 18+ (tested on Node v26)
- PostgreSQL 16+ running locally on port 5432

### Setup Commands
```bash
# 1. Install dependencies
npm install

# 2. Synchronize database schema (PostgreSQL)
npx prisma db push

# 3. Seed realistic Zambian school test fixtures
npm run seed

# 4. Run typecheck validation
npm run check

# 5. Run automated test suite
npm test

# 6. Build production bundle
npm run build

# 7. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access EduSphere SMIS.

---

## 5. Demonstration Accounts

All demonstration accounts use the password: `Password123!`

| Role | Email | Institution |
|---|---|---|
| **Platform Super Admin** | `admin@edusphere.zm` | EduSphere Cloud |
| **School Proprietor** | `proprietor@kabulonga.edu.zm` | Kabulonga Combined Academy |
| **Headteacher / Principal** | `principal@kabulonga.edu.zm` | Kabulonga Combined Academy |
| **Registrar** | `registrar@kabulonga.edu.zm` | Kabulonga Combined Academy |
| **Bursar / Finance Officer** | `bursar@kabulonga.edu.zm` | Kabulonga Combined Academy |
| **Senior Teacher** | `teacher@kabulonga.edu.zm` | Kabulonga Combined Academy |
| **Verified Parent** | `parent@gmail.com` | Family of Bupe & Kondwani Mwewa |
| **ECE Practitioner** | `ece@sunshine.edu.zm` | Sunshine Early Childhood Centre |

---

## 6. Documentation Index

- [System Architecture](docs/ARCHITECTURE.md)
- [Requirements & Traceability Matrix](docs/REQUIREMENTS.md)
- [Database Specification & Data Dictionary](docs/DATABASE.md)
- [API Architecture & Contracts](docs/API.md)
- [Security, Privacy & Zambia Compliance](docs/SECURITY.md)
- [Deployment & Infrastructure Guide](docs/DEPLOYMENT.md)
- [User Roles & Permissions Matrix](docs/USER_ROLES.md)
- [Testing Strategy & Automated Results](docs/TESTING.md)
- [Implementation Progress & Definition of Done](docs/PROGRESS.md)
- [Changelog](docs/CHANGELOG.md)
