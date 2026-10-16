# EduSphere SMIS — Security, Privacy & Compliance Architecture
**Version:** 1.0.0 | **Jurisdiction:** Republic of Zambia | **Standard:** Enterprise Baseline

---

## 1. Statutory Alignment & Regulatory Baseline

### 1.1 Data Protection Act, 2021 (Act No. 3 of 2021)
- **Section 70 (Data Residency):** Requires personal data of Zambian citizens, particularly children, to be stored and processed within Zambia unless explicit statutory exceptions or regulatory approvals are verified. EduSphere SMIS is designed for deployment on Zambia-resident cloud infrastructure or on-premise institutional data centers.
- **Child Protection by Design:** Underage learners are never exposed to public directories, facial recognition, automated punitive profiling, or commercial marketing.
- **Right of Revocation & Purpose Limitation:** Guardian access relies on legally verified custody relationships. Revocation of guardian access immediately and synchronously blocks access across all portal endpoints.

### 1.2 Teaching Profession Act, 2026 (Act No. 1 of 2026)
- Staff profiles maintain structured records of Teaching Council of Zambia (TCZ) registration numbers and practising certificate validity dates.
- Automated alerts notify school leadership 90 days prior to certificate expiry.

### 1.3 Bank of Zambia Payment Systems Standards
- **Direct Settlement:** Student fee collections route directly to the educational institution's verified commercial merchant account (Zanaco, Stanbic, Airtel Money, MTN MoMo). The software vendor never holds client funds or acts as an unauthorized custodian.

---

## 2. Access Control & Authorization (RBAC)

1. **Denial by Default:** All operational routes require an authenticated session and verified organizational context. Unauthenticated requests receive HTTP 401; unauthorized cross-tenant requests receive HTTP 403 or 404.
2. **Server-Side Tenant Context Enforcement:** The tenant context is extracted strictly from verified JWT claims. Client-supplied headers or query parameters cannot override the session identity.
3. **Partitioned Sensitive Records:** Disciplinary incidents, learning-support interventions, and child safeguarding files are sequestered with distinct access gates and are never included in routine report card exports or generic API responses.

---

## 3. Cryptography & Key Management

- **Password Hashing:** Passwords are salted and hashed using `bcrypt` (work factor 10).
- **Transport Security:** Production traffic is enforced through HTTPS / TLS 1.3 with HSTS enabled.
- **Session Tokens:** JSON Web Tokens (JWT) signed with HMAC-SHA256 with an 8-hour expiry window.
- **Database Decimals:** All financial transactions strictly use decimal precision (`DECIMAL(10, 2)`), preventing floating-point rounding vulnerabilities.

---

## 4. Tamper-Evident Auditing

All privileged activities write immutable records to the `AuditEvent` entity:
- Timestamp (UTC / `Africa/Lusaka`)
- Actor ID & IP address
- Action classification (e.g., `LEARNER_ADMITTED`, `RESULT_PUBLISHED`, `PAYMENT_REVERSED`)
- JSON payload snapshot
