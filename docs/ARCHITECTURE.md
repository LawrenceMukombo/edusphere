# EduSphere SMIS — Architectural Specification
**Version:** 1.0.0 | **Date:** 16 October 2026 | **Status:** Enterprise Baseline  
**Target Market:** Zambia (Primary), Southern Africa & International (Expansion)  
**Classification:** Proprietary Enterprise Education Management System

---

## 1. System Vision & Paradigm

EduSphere SMIS is architected around a single foundational paradigm:

> **ONE SCHOOL. ONE DIGITAL PLATFORM. ONE CONTINUOUS LEARNER RECORD.**

Traditional school management systems in Sub-Saharan Africa suffer from:
1. Fragmented paper registers and spreadsheets resulting in corrupted or lost historical records.
2. Inflexible grade-level structures unable to accommodate Zambia's evolving curriculum framework (transitional Grade 1–7 vs. reformed 6-year primary and secondary forms).
3. Financial opacity with inconsistent tracking of tuition, levies, partial payments, mobile-money confirmations, and manual adjustments.
4. Overseas data hosting that conflicts with Section 70 of the **Zambia Data Protection Act No. 3 of 2021**.

EduSphere SMIS delivers a modular monolith engineered for local data residency, strict multi-tenant isolation, enterprise-grade auditability, and offline-resilient operational workflows.

---

## 2. High-Level System Architecture

```mermaid
graph TD
    Client[Browser / Progressive Web App] -->|HTTPS / TLS 1.3| Nginx[Reverse Proxy / SSL Termination]
    Nginx --> NextApp[Next.js Full-Stack Application]
    
    subgraph NextApp [EduSphere Monolith Engine]
        MW[Tenant & Auth Middleware]
        
        subgraph WebLayer [Role-Based Workspaces]
            AdminUI[Super Admin / Proprietor Portal]
            HeadUI[Headteacher / Academic Director Portal]
            StaffUI[Teacher & ECE Practitioner Workspace]
            BursarUI[Bursar & Finance Office]
            RegUI[Admissions & Registrar Hub]
            ParentUI[Parent & Guardian Mobile-First Portal]
        end
        
        subgraph APILayer [RESTful OpenAPI Services]
            AuthAPI[/api/auth]
            TenantAPI[/api/tenants]
            StudentAPI[/api/students]
            AcademicAPI[/api/academics]
            AttendanceAPI[/api/attendance]
            FinanceAPI[/api/finance]
            HRAPI[/api/hr]
            ParentAPI[/api/parent]
            AuditAPI[/api/audit]
        end
        
        subgraph DomainServices [Core Domain Logic]
            TenantService[Tenant Isolation & Entitlement Engine]
            LearnerService[Learner Registry & Guardian Relationship Engine]
            CurriculumService[Configurable Curriculum & Assessment Engine]
            AttendanceService[Attendance & Offline Sync Reconciliation Engine]
            LedgerService[Immutable Financial Posting & Billing Engine]
            ReportService[Moderated Results & PDF Report Card Engine]
            AuditService[Security & Financial Audit Trail Engine]
        end
    end
    
    NextApp -->|Prisma Client / Connection Pool| Postgres[(PostgreSQL 18+ Relational Database)]
    NextApp -.->|Asynchronous Job Queues| Redis[(Redis / BullMQ)]
    NextApp -.->|Encrypted Local Storage S3-Compatible| ObjectStore[(Zambia-Resident Object Storage)]
```

---

## 3. Technology Stack Justification

| Layer | Selected Technology | Architecture Rationale |
|---|---|---|
| **Frontend Framework** | Next.js 14 (App Router) + React 18 | Production-tested, zero client-bundle bloat for static routes, server-side data fetching for rapid 3G mobile rendering, and seamless API co-location. |
| **Language** | TypeScript 5.x | End-to-end type safety spanning database entities, domain transfer objects (DTOs), API contracts, and user interface components. |
| **Styling & Components** | Tailwind CSS + Lucide Icons | Utility-first CSS ensuring lightweight, responsive layouts optimized for mid-range smartphones and low-bandwidth connections. |
| **Data Tables** | Custom Enterprise Table System | Implements sorting, pagination, page-size selection, search, filtering, column visibility toggles, and CSV exports meeting enterprise rules. |
| **Analytics & Visualization** | Interactive SVG/Recharts Engine | Role-aware dashboards featuring drill-down filters, period selection, responsive tooltips, and zero third-party tracking scripts. |
| **Backend & ORM** | Next.js API Routes + Prisma ORM | Strong referential integrity, automated migration management, compile-time query safety, and transparent connection pooling. |
| **Primary Database** | PostgreSQL 18.4 | Enterprise ACID compliance, UUID primary keys, JSONB for extensible curriculum rubrics, decimal precision for currency, and Row-Level Security readiness. |
| **Testing** | Vitest + Automated Test Suite | Lightning-fast test runner validating cross-tenant isolation, financial ledger reversals, guardian access authorization, and grading schemes. |

---

## 4. Multi-Tenant Segregation & Security Model

### 4.1 Tenant Scoping
Every operational database entity contains a mandatory `organisationId` foreign key and, where appropriate, an optional `campusId` foreign key. 
1. **Server-Side Enforcement:** The authenticated JWT token encapsulates `userId`, `organisationId`, `campusId`, and assigned roles. All API requests extract the organisation context directly from the verified session. Client-supplied organisation IDs are rejected if they differ from the session token.
2. **Denial by Default:** Any database query targeting operational entities must include `where: { organisationId }`.
3. **Cross-Tenant Isolation Tests:** Automated test suites verify that an administrator or teacher from School A cannot query, update, or export records belonging to School B.

### 4.2 Role-Based Access Control (RBAC) Matrix
The system provides 14 distinct personas:
- **Platform Super Admin:** Manages SaaS tenants, subscriptions, and platform health; no routine access to student marks or medical records.
- **School Proprietor:** Strategic KPIs, cross-campus enrollment, fee summaries, and institutional health.
- **Headteacher / Principal:** Academic approvals, result publication, staff governance, and learner promotions.
- **Deputy Headteacher:** Curriculum moderation, teacher workloads, and attendance escalations.
- **Registrar:** Admissions funnel, pupil registration, verified guardian linking, and class allocation.
- **Bursar / Finance Officer:** Invoicing, cashbook, manual payments, reconciliation, and debt ageing.
- **Class / Subject Teacher:** Mark books, competency observations, daily attendance, and report drafts.
- **ECE Practitioner:** Developmental milestone rubrics, narrative observations, and guardian feedback.
- **Parent / Legal Guardian:** Verified child-only portal, published reports, fee statements, and absence notices.
- **HR Officer:** Staff credentials, Teaching Council of Zambia (TCZ) certificate tracking, and leave.
- **Learner:** Age-appropriate, read-only homework and academic overview.
- **Librarian / Transport / Auditor:** Constrained, role-specific operational permissions.

---

## 5. Zambian Regulatory & Statutory Alignment

1. **Education Act, 2011 (as amended 2026):**
   - Configurable school types (ECE, Primary, Secondary, Combined, Boarding, Day).
   - Ministry of Education annual school census export templates.
   - Statutory registers maintained with permanent audit history.
2. **Data Protection Act, 2021 (Section 70):**
   - Personal and sensitive child records are stored and processed within Zambia by default.
   - Separate development and synthetic demonstration environments prevent offshore transfer of real learner records.
   - Immediate guardian access revocation upon legal or family relationship changes.
3. **Teaching Profession Act, 2026:**
   - Staff records track TCZ registration numbers, practising certificate issuance, and renewal dates.
4. **Bank of Zambia Payment System Framework:**
   - Direct settlement model: funds route directly to the institution's verified merchant account. The platform never acts as an unauthorized money transmitter or custodian of school funds.

---

## 6. Financial Ledger Architecture

EduSphere SMIS implements an **immutable posting journal**:
- Financial balances are calculated dynamically from posted `Invoice` and `LedgerEntry` records using currency-safe decimals (`Decimal(12, 2)`). Floating-point math is strictly forbidden.
- Adjustments, waivers, and refunds create verifiable offsetting ledger entries with authorizer audit links.
- Payment intents utilize idempotency keys to guarantee duplicate webhook callbacks do not generate double receipts.

---

## 7. Curricular & Assessment Architecture

The academic engine decouples grade structures from hardcoded assumptions:
- **Curriculum Versions:** Allows concurrent execution of legacy Grade 1–7 / 8–12 frameworks alongside the revised 6-year primary and secondary forms.
- **Assessment Schemes:** Supports weighted continuous assessment (e.g., 40% Continuous Assessment, 60% Final Exam), ECE developmental milestones (Emerging, Developing, Competent, Mastered), and letter-grade scales (Distinction, Merit, Credit, Pass, Fail).
- **Result Lifecycle:** Draft &rarr; Submitted &rarr; Moderated &rarr; Approved &rarr; Published &rarr; Archived. Only approved reports are visible on the parent portal or downloadable as stamped PDF cards.
