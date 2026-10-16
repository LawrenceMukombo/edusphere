# EduSphere SMIS — API Architecture & Contracts
**Version:** 1.0.0 | **Standard:** RESTful / OpenAPI 3.0.3 | **Base URL:** `/api`

---

## 1. Authentication & Security
All protected endpoints require a Bearer token in the HTTP Authorization header:
```http
Authorization: Bearer <jwt-token>
```
The JWT payload embeds `userId`, `organisationId`, `role`, and `campusId`.

---

## 2. API Endpoints Catalog

### 2.1 Authentication & Sessions
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user credentials and return JWT session token | Public |
| `GET` | `/api/auth/me` | Retrieve profile and entitlements for current session | Authenticated |

### 2.2 Multi-Tenant Administration
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/tenants` | List all school organizations and subscriptions | Super Admin, Proprietor |
| `POST` | `/api/tenants` | Provision a new school tenant with isolated database schema | Super Admin |

### 2.3 Learner Registry & Admissions
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/students` | Query learners filtered by campus, class, or keyword | Registrar, Teacher, Bursar |
| `POST` | `/api/students` | Admit learner, generate unique student ID, link guardian | Registrar |
| `GET` | `/api/students/[id]` | Full longitudinal profile, history, fees, and report cards | Authorized Staff |

### 2.4 Academics, Assessments & Report Cards
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/academics/scores` | Record or update marks for an assessment | Class / Subject Teacher |
| `GET` | `/api/academics/report-cards/[id]` | View compiled report card | Staff, Authorized Parent |
| `POST` | `/api/academics/report-cards/[id]` | Compile, approve, and publish report card | Headteacher / Principal |

### 2.5 Attendance & Offline Sync
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/attendance` | Retrieve class register for a specific date | Teacher, Admin |
| `POST` | `/api/attendance` | Submit register or reconcile offline queued batch | Teacher |

### 2.6 Fees & Financial Ledger
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/finance/invoices` | List pupil fee invoices and payment statuses | Bursar, Proprietor |
| `POST` | `/api/finance/invoices` | Generate invoice with idempotency key | Bursar |
| `GET` | `/api/finance/payments` | List recorded fee payments and receipts | Bursar |
| `POST` | `/api/finance/payments` | Record payment, post credit to ledger, issue receipt | Bursar |
| `GET` | `/api/finance/ledger` | Audit double-entry posting journal | Bursar, Auditor |

### 2.7 Parent & Guardian Portal
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/parent/children` | Fetch verified, non-revoked linked children | Verified Parent/Guardian |

### 2.8 Staff & Professional Compliance
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/hr` | Staff directory & TCZ certificate expiry alerts | HR Officer, Headteacher |

### 2.9 Developer Specifications
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/docs` | OpenAPI 3.0.3 machine-readable schema definition | Public |
