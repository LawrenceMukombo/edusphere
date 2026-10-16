# EduSphere SMIS — User Roles & Permissions Matrix
**Version:** 1.0.0 | **Model:** Role-Based Access Control (RBAC) + Scoped Attributes

---

## 1. System Role Hierarchy

| Role Code | Title | Workspace Access | Primary Responsibilities |
|---|---|---|---|
| `PLATFORM_SUPER_ADMIN` | Platform Super Administrator | `/admin` | Tenant provisioning, SaaS subscription governance, system health; no routine access to child marks or medical files. |
| `SCHOOL_PROPRIETOR` | School Proprietor / Board | `/admin`, `/` | Strategic oversight, fee collection trends, multi-campus consolidation, capacity planning. |
| `HEADTEACHER` | Headteacher / Principal | `/`, `/academics`, `/hr` | Academic leadership, results moderation and approval, official report card publication, staff governance. |
| `DEPUTY_HEADTEACHER` | Deputy Headteacher | `/academics`, `/teacher` | Curriculum supervision, teacher allocations, attendance follow-up, mark moderation. |
| `REGISTRAR` | Admissions & Registrar | `/admissions` | Candidate intake, learner registration, unique student number generation, verified guardian linking. |
| `BURSAR` | Bursar / Finance Officer | `/finance` | Fee catalog, invoicing, manual and mobile payment recording, receipts, immutable ledger reconciliation, debtors ageing. |
| `TEACHER` | Class & Subject Teacher | `/teacher` | Daily class attendance registers, continuous assessment marks, ECE competency observations. |
| `ECE_PRACTITIONER` | ECE Practitioner | `/teacher` | Early childhood developmental domain rubrics, qualitative observations, milestone reporting. |
| `PARENT_GUARDIAN` | Verified Legal Guardian | `/parent` | Child academic progress, approved published reports, attendance history, itemized fee statements, mobile money checkout. |
| `HR_OFFICER` | Human Resource Officer | `/hr` | Staff directory, Teaching Council of Zambia registration tracking, practising certificate expiry alerts. |
| `LEARNER` | Student | `/parent` (restricted) | Read-only access to published homework, syllabus, and approved term progress. |
| `AUDITOR_READONLY` | School Auditor / Inspector | Read-only | Time-limited read-only access to registers, ledger journals, and Ministry returns. |
