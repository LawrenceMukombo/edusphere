# LAMTONPAY CONNECT — CONSOLIDATED MASTER PRD & DEVELOPMENT AGENT PROMPT

**Owner:** Lamton Investments Limited  
**Version:** 1.0 | **Date:** 24 October 2026  
**Initial country / currency:** Zambia / ZMW  
**Initial consuming application:** NWUCHAS-CMIS  
**Target:** A reusable, secure, provider-independent payment orchestration and verified-entitlement integration layer for Lamton-developed applications.

> **Implementation boundary:** LamtonPay Connect is a software integration/orchestration service, not a deposit-taking wallet or licensed payment aggregator. Each client/merchant must use its own approved provider onboarding, settlement account and contractual authorisations. Confirm regulatory treatment with qualified counsel and the Bank of Zambia before offering fund custody, pooling, merchant-of-record, or payments aggregation.

---

## 1. MASTER AGENT DIRECTIVE

Act as a principal payments architect, senior TypeScript engineer, financial systems engineer, security architect, database architect, QA automation engineer and DevOps lead. Read this entire document **and all existing project PRDs, `.md` implementation instructions, API contracts, architecture notes and pending task lists** before changing code. Audit the repository, identify working, partial, mocked and missing functionality, and produce a requirements-to-code-and-test traceability matrix.

**Implement complete working capabilities, not static screens, fake provider responses or dead buttons.** Real integrations must only be declared operational once verified with authorised sandbox and, separately, production merchant credentials. When external approval is pending, implement contract-validated mock tests and mark the provider `BLOCKED — EXTERNAL ONBOARDING`; do not claim that payment collections are live.

Proceed autonomously on permitted development tasks; pause for owner approval before production deployment, destructive migrations, activating live financial transactions or changes affecting client funds. Never ask for live secrets in chat or commit them to the repository.

## 2. PRODUCT GOALS & SCOPE

LamtonPay Connect shall:

1. Integrate with **MTN MoMo Collections** and **Airtel Money Collections** in Zambia first.
2. Support future **DPO Pay**, **Lipila**, **Lenco**, **ZynlePay**, **Zamtel**, and **bank EFTPOS** via adapters after independent verification of capabilities and provider approval.
3. Provide one stable, versioned API/SDK for NWUCHAS, EduSphere, restaurants/POS and other Lamton applications.
4. Isolate every client organisation, application, merchant configuration, provider credentials, webhook destination and transaction history.
5. Initiate collections, maintain payment intent state, verify provider outcomes, send signed client webhooks and reconcile settlements.
6. Trigger **institution-owned finance posting and access entitlement re-evaluation**, including bus passes, hostel access, library services, approved fee-clearance rules and other eligible services.
7. Provide administrators with real database-backed monitoring, transaction search, exceptions and audited operations.
8. Include fully working schema migrations, seed data for **development only**, unit/integration/E2E tests, and operational documentation.

### Explicit exclusions

- Holding, pooling or settling third-party funds in Lamton accounts unless separately authorised/licensed.
- Claiming access to an external API without documentation and authorised credentials.
- Processing raw cardholder data; prefer provider-hosted card checkout and certified hardware integrations.
- Treating a browser redirect or HTTP 202 as payment success.
- Blocking physical emergency egress or falsifying student attendance based on unpaid fees.

## 3. REFERENCE LINKS & API CONTRACT VERIFICATION

**MTN:** https://momodeveloper.mtn.com/API-collections#api=collection  
**MTN API information:** https://momo.mtn.com/api/  
**Airtel Zambia developer:** https://developers.airtel.co.zm/home  
**Owner's Airtel application (requires login):** https://developers.airtel.co.zm/developer/dashboard/26600/30351/details?info=1  
**DPO API:** https://docs.dpopay.com/dpo-pay-by-network/reference/quick-start-guide  
**Lipila:** https://docs.lipila.io/docs/gettingstarted/overview.html  
**Lenco:** https://lenco-api.readme.io/v2.0/reference/initiate-collection-from-mobile-money  
**Absa merchant POS:** https://www.absa.co.zm/business/merchant-services/  
**Bank of Zambia:** https://www.boz.zm/

**Contract-gating rule:** For each provider, obtain and version its **actual subscribed product's** OpenAPI/Postman/specification, authentication and country-specific environment settings. The Airtel private dashboard cannot be assumed readable to the coding agent. Never invent endpoints, signatures, encryption rules, exchange parameters or Zambia availability. Validate whether a given MTN account uses MoMo Open API rather than a separate MTN payment product; do not mix credentials.

## 4. ARCHITECTURE

Recommended: TypeScript, Node.js (NestJS or structured Express), PostgreSQL, Redis-backed durable queue if justified, OpenAPI, containerised deployment, structured logging and OpenTelemetry-compatible tracing. Prefer a **modular monolith** initially; avoid premature microservices.

```text
NWUCHAS / EduSphere / LSpot / Other Lamton apps
                      |
              LamtonPay API + SDK
                      |
 Client/Merchant identity and permissions
                      |
 Payment Intent + Provider Adapter Registry
       /         |         |        \
    MTN       Airtel     DPO      Other adapters
       \         |         |        /
     Verified status & audit event history
                      |
   Signed outbound payment events + settlement reconciliation
                      |
 Client financial ledger posts verified allocation exactly once
                      |
 Entitlement rules engine => access provisioners => devices/services
```

### Suggested repository

```text
lamtonpay-connect/
  apps/api/
  apps/admin-dashboard/
  packages/payment-core/
  packages/provider-mtn/
  packages/provider-airtel/
  packages/provider-dpo/             # not active until implemented
  packages/client-sdk/
  packages/shared-types/
  prisma/ or migrations/
  tests/unit/ tests/integration/ tests/e2e/
  docs/architecture/ docs/providers/ docs/operations/
  .env.example
```

## 5. PROVIDER-NEUTRAL PAYMENTS DOMAIN

Maintain unique `paymentId`, `clientId`, `applicationId`, `merchantId`, `providerCode`, `businessReference`, `idempotencyKey`, `providerReference`, exact amount (minor units or DECIMAL), currency, payer reference (minimised/masked), timestamped events, verification evidence and reconciliation status.

**States:** CREATED → VALIDATING → INITIATING → PENDING_CUSTOMER / PENDING_PROVIDER → VERIFICATION_REQUIRED → SUCCEEDED / FAILED / CANCELLED / EXPIRED. Track REFUND_PENDING / PARTIALLY_REFUNDED / REFUNDED and RECONCILIATION_EXCEPTION as distinct later lifecycle events/ledger facts. Define allowed transitions and immutable payment event history; do not overwrite final state on out-of-order callbacks.

Payment intent/attempt events, transaction settlement, refunds and merchant payout must be separately modelled. A successful collection is **not** evidence that provider settlement has reached the merchant bank.

```typescript
interface PaymentProviderAdapter {
  readonly providerCode: string;
  getCapabilities(): ProviderCapabilities;
  initiateCollection(request: CollectionRequest, merchant: MerchantConfig): Promise<CollectionResponse>;
  getCollectionStatus(reference: string, merchant: MerchantConfig): Promise<ProviderPaymentStatus>;
  verifyCallback(payload: unknown, headers: Record<string,string>, merchant: MerchantConfig): Promise<VerifiedProviderEvent>;
  // Refund, reversal and settlement operations are optional capabilities.
}
```

Unsupported provider operations must raise explicit `UNSUPPORTED_OPERATION` results; never return simulated success.

### REST API

- `POST /api/v1/payments` — authenticated payment intent/initiation.
- `GET /api/v1/payments/{id}` — current verified status.
- `GET /api/v1/payments/{id}/events` — authorised history.
- `GET /api/v1/payment-methods` — enabled options per merchant.
- `POST /api/v1/webhooks/mtn` — provider callback adapter.
- `POST /api/v1/webhooks/airtel` — provider callback adapter.
- `POST /api/v1/webhooks/dpo` — only once actual DPO implementation exists.
- `GET /api/v1/settlements` / `GET /api/v1/reconciliation-exceptions`.
- Admin APIs for merchant provisioning, enabled providers, destinations, health, transactions, refunds and overrides, permission-scoped.

Never trust client-supplied merchant context or invoice amount without authentication and server-side business-reference validation.

## 6. MTN MOMO COLLECTIONS IMPLEMENTATION

**Onboarding with an existing developer account:** Sign in → subscribe to Zambia-compatible Collections product → obtain sandbox subscription key → follow MTN documented sandbox API user and API key provisioning → generate access token → test `RequestToPay` and status lookup → separately request production merchant approval and credentials.

For **documented MTN MoMo Open API v1_0 sandbox** (confirm your account's version):

- API user: `POST /v1_0/apiuser`
- API key: `POST /v1_0/apiuser/{apiUserId}/apikey`
- Access token: `POST /collection/token/`
- Collection initiation: `POST /collection/v1_0/requesttopay`
- Status: `GET /collection/v1_0/requesttopay/{referenceId}`

Use MTN's required subscription-key, target-environment, bearer-token, correlation/reference UUID and callback headers according to the subscribed contract. Do **not** interpret initiation `202 Accepted` as paid. Query authoritative status and verify reference, amount, currency and merchant before finalisation. Never assume sandbox currency/payer examples are acceptable in production Zambia.

Secure configuration (blank secrets by design):

```dotenv
MTN_MOMO_ENVIRONMENT=sandbox
MTN_MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY=
MTN_MOMO_API_USER=
MTN_MOMO_API_KEY=
MTN_MOMO_TARGET_ENVIRONMENT=sandbox
MTN_MOMO_CALLBACK_URL=
```

Treat callbacks as notification-only if the selected MTN contract does not provide sufficient sender authenticity; verify via server-to-server status query. Handle delayed/duplicate callbacks, declines, timeouts, token expiry, unknown outcomes, reference collision and rate limits.

## 7. AIRTEL MONEY ZAMBIA IMPLEMENTATION

With the user's existing Airtel developer account:

1. Open the registered dashboard (link above) while logged in.
2. Confirm **Collections** product access, API version and approval status.
3. Export the **authorised** specification/Postman collection and environment configuration securely.
4. Record actual sandbox URL, auth mode, token expiry, collection endpoint, query/status endpoint, callbacks, request encryption/signing rules and currency/country parameters.
5. Implement only that approved version's schema; do not combine endpoints from other Airtel API versions.
6. Run authentication, initiation, pending, success, failure, callback and reconciliation sandbox tests.
7. Complete Airtel merchant onboarding before obtaining production credentials and testing real settlements.

```dotenv
AIRTEL_MONEY_ENVIRONMENT=sandbox
AIRTEL_MONEY_BASE_URL=
AIRTEL_MONEY_CLIENT_ID=
AIRTEL_MONEY_CLIENT_SECRET=
AIRTEL_MONEY_API_VERSION=
AIRTEL_MONEY_COUNTRY=ZM
AIRTEL_MONEY_CURRENCY=ZMW
AIRTEL_MONEY_CALLBACK_URL=
```

If the Airtel private contract is unavailable, complete the rest of LamtonPay and isolate the Airtel adapter as **blocked pending authorised API specification**. Mock provider tests cannot count as real Airtel sandbox verification.

## 8. DPO PAY, ADDITIONAL GATEWAYS & EFTPOS

Design separate adapters that are not enabled until contract-confirmed and tested.

**DPO:** Register as a technology/integration partner, assess separate merchant accounts per client, request sandbox token/service type and verify v6 protocol documentation. For documented versions, DPO uses token creation and server-side token verification with hosted checkout; do not rely on the browser's success redirect. Confirm Zambia supported methods, card schemes, fees and settlement with DPO.

**Lipila / Lenco:** Explore documented MTN/Airtel/Zamtel aggregation, sandbox registration and webhook/status verification. Verify regulator authorisation, merchant contract, fee model and settlements before production.

**EFTPOS:** Distinguish standalone bank terminal (cashier enters payment; reconcile terminal receipt and bank batch) from **integrated POS** (bank/acquirer-approved terminal API or middleware). Do not invent a universal card-terminal API. Require acquirer specifications, terminal certification and hardware testing; do not handle raw PIN/card details in Lamton applications. Card-not-present payments should use provider-hosted checkout.

## 9. VERIFIED PAYMENTS → FINANCE POSTING → SERVICE ENTITLEMENTS

**Fundamental separation:**

- **LamtonPay** confirms authoritative provider payment outcome.
- **Business application (e.g. NWUCHAS)** allocates payment to the correct invoice and posts it *exactly once* to its ledger.
- **Entitlement engine** evaluates which services become available under approved policy.
- **Access provisioning** propagates permissions to apps, bus readers, hostel systems and approved gate controllers.

```text
Provider confirmed paid
→ LamtonPay verified `payment.succeeded`
→ signed client webhook
→ business application verifies + deduplicates
→ durable ledger posting / invoice allocation
→ `finance.payment_allocated`
→ policy-based entitlement re-evaluation
→ entitlement granted/renewed/restricted as warranted
→ access provisioner/device sync
→ notifications + reconciliation + auditable events
```

**Never unlock on a mere pending payment, payment initiation, browser redirect or unverified callback.** A partial payment only activates services whose policy requirements it satisfies.

### Services / policy controls

- **Bus access:** verified fee/approved deposit + route assignment + valid dates activates signed transport pass. Provide manifest, QR validation, boarding events and controlled offline use.
- **College gates:** financial clearance may influence approved access policies, **but do not prevent emergency egress or essential safety access**; implement safety overrides, signed QR/NFC credentials, device authentication and access audit.
- **Attendance/roll call:** always preserve accurate registers and enrolment records regardless of fees. Payment never marks attendance, deletes students from class registers or invents presence. Differentiate class, clinical, bus and hostel roll call.
- **Hostels:** payment plus approved room/bed allocation and validity dates may activate access; do not assign occupied beds automatically.
- **Library, examinations, paid documents and optional services:** apply verified, lawful, institutional policies with overrides and appeal paths; preserve essential academic rights.

Policy attributes: student category, programme, service, invoice/fee category, minimum amount or percentage, instalment plan, grace period, scholarship/waiver, valid dates, academic standing where relevant, approver, policy version, explanation and override audit.

Events: `payment.verified`, `finance.payment_posted`, `finance.payment_allocated`, `finance.payment_reversed`, `entitlement.evaluation_requested`, `entitlement.granted`, `entitlement.expired`, `access.provisioning_requested`, `access.provisioning_succeeded`, `access.device_sync_failed`.

Use the **transactional outbox** for financial posting and event creation and idempotent consumers for at-least-once delivery. Do not claim distributed exactly-once delivery; implement exactly-once **financial effects** with constraints/transactions.

**Latency objectives (internal, not provider guarantees):** after verified payment and ledger allocation, target p95 <2s for event handling, <1s policy evaluation, <2s internal entitlement update; physical device connectivity may introduce delay. Display `PAYMENT_VERIFIED`, `POSTED`, `ENTITLED`, `DEVICE_SYNC_PENDING`, `ACTIVE` separately.

## 10. DATABASE ENTITIES

- `clients`, `applications`, `application_credentials`
- `merchant_accounts`, `merchant_provider_configs`, `merchant_settlement_accounts`
- `payment_intents`, `payment_attempts`, `payment_transactions`, `payment_events`, `provider_transactions`, `idempotency_keys`
- `provider_webhook_events`, `client_webhook_deliveries`, `webhook_delivery_attempts`
- `settlement_batches`, `settlement_entries`, `reconciliation_runs`, `reconciliation_exceptions`, `refunds`
- `service_catalog`, `entitlement_policies`, `entitlement_policy_versions`, `student_entitlements`, `entitlement_history`, `entitlement_overrides`
- `transport_routes`, `transport_subscriptions`, `boarding_events`, `access_credentials`, `access_devices`, `access_events`, `device_sync_jobs`
- `users`, `roles`, `permissions`, `audit_events`, `integration_health_events`, `outbox_events`.

Where the entitlement domain resides inside NWUCHAS rather than LamtonPay, keep NWUCHAS data in the separate NWUCHAS database and exchange authenticated events; LamtonPay must not directly change NWUCHAS tables. Enforce tenant/client/merchant scoping, uniqueness, foreign keys, encryption, least-privilege DB roles and data minimisation.

## 11. SECURITY, GOVERNANCE & NON-FUNCTIONAL REQUIREMENTS

- TLS, secure secret store, rotation and segregation of sandbox/production credentials.
- Provider calls server-to-server; never expose keys or client secrets in browsers.
- Strong authentication, MFA for privileged admin, per-merchant RBAC, immutable audit and access logs.
- Signed outbound client webhook + replay detection, retries, dead-letter queue and validated endpoints.
- Treat ambiguous provider callbacks as hints; confirm transaction authoritatively.
- Accurate money representation, duplicate protection, immutable journal/ledger entries in client finance systems.
- Restrict PII, redact logs, configure data retention, encrypt backups, test restoration.
- OWASP ASVS-aligned application controls and applicable Zambian data-protection requirements.
- Card data only through compliant hosted checkout/approved terminal service.
- Rate limits, bounded retries, circuit breakers, idempotent jobs, distributed tracing and actionable alerting.
- Device sync queues and short-lived, signed, revocable credentials; offline grace policies with safety/manual overrides.

## 12. ADMINISTRATIVE UX — NO NONFUNCTIONAL PLACEHOLDERS

Implement tested, database-driven:

- Merchant and application onboarding, payment provider status/configuration.
- Transactions search/filter/detail, status timeline, amount/provider distributions.
- Collection success/failure/pending indicators from real records.
- Reconciliation batches, unmatched funds and exception-resolution workflows.
- Signed webhook delivery logs, retries, queue health and provider error monitoring.
- Entitlement and access provisioning dashboard for NWUCHAS (or its own app).
- Audit and safe, reasoned administrator overrides.

Never show fictitious production KPIs. Clearly label seeded **development/demo** data; do not seed production payment history.

## 13. TESTING & ACCEPTANCE

**Provider sandbox:** auth, valid collection, pending, success, rejection, timeout, invalid number/currency, duplicate reference, token expiration, delayed and repeated callback, status-poll fallback, ambiguous outcome.

**Cross-app isolation:** merchant A cannot read/use merchant B's credentials, transaction history, webhook destination or settlement settings.

**Financial:** callback repeats cannot double-post; idempotency keys preserve exactly one payment effect; partial/multiple invoice allocation is correct; refunds and reversals recalculate outstanding balances without deleting history.

**Entitlements:** verified transport payment unlocks only assigned eligible route; tuition payment does not accidentally unlock transport; offline gate fails safely with authorised manual override; refunded payments re-evaluate privileges; unpaid students remain in attendance; payment never creates a presence event.

**Operations:** credential leakage checks, disaster-recovery restore, event replay, outbox recovery, device-sync retry and production config guards.

Every module is **VERIFIED FUNCTIONAL** only with UI, backend, DB, security, tests and workflow evidence. External integrations cannot be called verified based solely on mocks.

## 14. PHASED IMPLEMENTATION ROADMAP

**0 — Repository/API audit:** inspect existing code, documentation, provider subscriptions, API versions and security boundaries; create gap and dependency reports.

**1 — Core payment service:** PostgreSQL schema, migrations, merchant isolation, authenticated API, provider adapter abstraction, fake/mock provider for deterministic local tests, observability.

**2 — MTN sandbox:** authorised provisioning, tokens, RequestToPay, status verification, callbacks/status reconciliation, integration tests.

**3 — Airtel sandbox:** confirm private dashboard product contract, credential configuration, auth, initiation, status and callback handling, integration tests.

**4 — NWUCHAS finance:** student fees/invoices, LamtonPay SDK, posted-payment journal, receipts, verified webhook, finance reconciliation.

**5 — Entitlements:** policy engine, bus passes, hostels, library, finance clearance statuses, gate-device adapter with physical safety review, accurate roll-call separation.

**6 — Admin/operations:** dashboard, merchant configuration, statement reports, errors, retry tools, audit, SRE runbooks.

**7 — Additional providers:** DPO hosted checkout and verification; local aggregators; bank EFTPOS after acquirer agreement and testing.

**8 — Production readiness:** provider merchant accounts, security tests, disaster recovery, settlement pilot, institution approval and explicit authorised go-live.

## 15. REQUIRED AGENT OUTPUTS & EXECUTION

Create and maintain:

- `docs/00-repository-audit.md`
- `docs/01-api-contracts-and-access.md`
- `docs/02-target-architecture.md`
- `docs/03-database-and-migrations.md`
- `docs/04-security-and-merchant-isolation.md`
- `docs/05-payment-state-machine.md`
- `docs/06-nwuchas-finance-integration.md`
- `docs/07-payment-entitlements.md`
- `docs/08-sandbox-test-results.md`
- `docs/09-reconciliation-runbook.md`
- `docs/10-production-onboarding.md`
- `docs/IMPLEMENTATION_PROGRESS.md`

For each requirement record implementation files, status (NOT STARTED / IN PROGRESS / BLOCKED / VERIFIED), actual test proof, blockers and next action. Read all relevant project MDs/PRDs and reconcile pending tasks; do not stop after generating planning documents. Proceed through feasible implementation and tests, protect all original applications/databases, and report external integration blockers accurately. **No placeholders described as features, no fake payments, no claim of live status without verified provider testing.**

## REFERENCES (HARVARD STYLE)

Airtel Africa (2026) *Airtel Zambia Developer Portal*. Available at: https://developers.airtel.co.zm/home (Accessed: 24 October 2026).

DPO Pay (2026) *Developer Quick Start Guide*. Available at: https://docs.dpopay.com/dpo-pay-by-network/reference/quick-start-guide (Accessed: 24 October 2026).

Lenco (2026) *Mobile Money Collection API*. Available at: https://lenco-api.readme.io/v2.0/reference/initiate-collection-from-mobile-money (Accessed: 24 October 2026).

Lipila (2026) *Integration Documentation*. Available at: https://docs.lipila.io/docs/gettingstarted/overview.html (Accessed: 24 October 2026).

MTN Group (2026) *MoMo Collections API*. Available at: https://momodeveloper.mtn.com/API-collections#api=collection (Accessed: 24 October 2026).

Bank of Zambia (2026) *Payment Systems*. Available at: https://www.boz.zm/ (Accessed: 24 October 2026).
