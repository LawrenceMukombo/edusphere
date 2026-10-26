# NWUCHAS CMIS — Enterprise, Public Portal, Persona and Offline-First Remediation Prompt

## Mission

Transform the current NWUCHAS CMIS codebase into a production-ready, secure, offline-capable College Management Information System for North Western University College of Health and Applied Sciences (NWUCHAS). The result must be a real operational system: every displayed operational record must originate in the NWUCHAS database or an authorised integration, every permitted change must be persisted and auditable, and no workflow may claim success when it has not completed.

This is not a visual rebrand or a demo-data exercise. Do not copy school-domain concepts, Legacy School/EduSphere language, campuses, learner identities, dates, regulatory claims, payment providers, or seeded figures into NWUCHAS. Preserve only reusable technical components after adapting their data model, terminology, access controls, and workflows to a tertiary health-and-applied-sciences institution.

## Authoritative inputs

Read these documents before changing code:

1. `C:\nwuchas\docs\NWUCHAS_CMIS_Agent_Prompt_v2.md`
2. `C:\nwuchas\docs\NWUCHAS_CMIS_PRD_v2.md`
3. `C:\nwuchas\docs\NWUCHAS_Production_Remediation_Agent_Prompt.md`
4. This prompt.

If they conflict, do not invent policy. Record the conflict and obtain a product-owner decision. This prompt takes precedence for production-readiness, public access, personas, data integrity, and offline safety.

## Official NWUCHAS website and brand reference

Use the official NWUCHAS public website, [https://nwuc.edu.zm/](https://nwuc.edu.zm/), as the primary visual and public-information reference. At the time of review it publishes the institution name **North Western University College of Health and Applied Sciences**, a public navigation pattern around Home, About Us, Vision, Courses, How to Apply, and the NWUCHAS E-Learning Portal, official college imagery, and a blue-led presentation (including the homepage accent `#1a6bd6`).

Use this reference to create a recognisably NWUCHAS experience:

- Obtain the official logo, emblem, favicon, typography guidance, imagery, colour palette, and usage rules from the institution/brand owner or a confirmed institutional asset repository. Create an internal, versioned brand-asset library with provenance, copyright status, alt text, approved variants, and review dates.
- Do **not** hotlink `nwuc.edu.zm` logo or image URLs into CMIS. Do not download or republish assets unless NWUCHAS authorises their use. Store approved optimised copies in the CMIS-controlled asset pipeline/object store.
- Establish semantic design tokens after brand-owner approval. The verified blue accent may be used as a starting reference, but do not assume it is the complete official palette. Define accessible primary, secondary, surface, text, focus, success, warning, error, data-visualisation, light/dark and high-contrast tokens; test contrast rather than copying a colour mechanically.
- Let the public-site information architecture inspire the landing page: About, Vision, Programmes/Courses, How to Apply, student experience/facilities, contact/enquiries, and e-learning link where approved. Retain separate, clear calls to `Apply`, `Student/Sponsor login`, and `Staff login`.
- Treat every address, telephone number, e-mail address, programme, intake, fee, accommodation statement, accreditation statement, photograph caption, social account, external link, and other published fact as editable, approved CMS content. The official site is a reference, not permission to freeze its current content in code.
- Keep the CMIS more polished and accessible than the reference site: responsive composition, reduced visual clutter, strong typographic hierarchy, accessible contrast/focus, a high-quality programme catalogue, content governance, and no unrelated school-era styling.

Before implementation, produce a short brand-adoption sheet that identifies the confirmed source/owner for every logo, icon, image, font and colour token. Obtain sign-off before replacing production assets or claiming the design is official.

## Findings already verified in the current codebase

Treat the following as remediation evidence, not as intended product behavior:

- The root route is an unauthenticated executive dashboard exposing operational counts and financial/clinical summaries instead of a public college website.
- Operational navigation is rendered globally without a server-enforced, persona-specific route gate.
- The public application page contains prefilled applicant details, programme, residence, subject grades, and uploaded-document examples. These are placeholders and must not appear as a real applicant's data.
- The root dashboard substitutes fabricated values when database counts are zero (for example learner counts, fees collected, active rotations, and partner hospitals).
- Legacy identifiers, assets, storage keys, module names, files, PWA metadata, Docker names, and source comments remain (`EduSphere`, `Legacy School`, `LSS`, Mushitala/Urban school fixtures).
- The PWA manifest and service worker still identify the old product. The root layout unregisters service workers while another component contains an obsolete worker.
- The current service worker returns a successful response for failed non-GET requests. This is unacceptable: it can make a finance, attendance, or other operation appear completed when the server never accepted it.
- The offline queue uses unaudited browser storage and generic endpoint routing, with no secure device enrolment, immutable operation identity, server idempotency contract, conflict resolution, safe scope, or transaction classification.
- Multiple modules import generated legacy learners, use local storage as operational persistence, generate random identifiers, or simulate payment, receipt, document, payroll, and operational outcomes.
- API patterns include first-organisation/fallback behavior and development-style authentication patterns. A client-side permission matrix is not a security boundary.
- The database schema has useful domain models, but there are no committed Prisma migrations. Docker configuration has inherited database names, exposed internal ports, and unsafe default credentials/secrets.

Do not conceal these issues with more NWUCHAS labels. Remove or remediate the behavior and prove the replacement works.

## Non-negotiable operating rules

1. **Database and authorised integrations are the source of truth.** Do not display fallback totals, fabricated records, synthetic operational data, or static school facts as live data.
2. **No fake success.** If an action is pending offline, rejected, conflicted, unauthorised, or integration-dependent, show that exact state. Never return HTTP success or a completed receipt merely to keep the interface smooth.
3. **CRUD means controlled lifecycle, not indiscriminate deletion.** Use validation, permissions, concurrency control, audit records, soft deletion/retention where required, and reversals/corrections for financial, academic, identity, and compliance records.
4. **The server enforces authorisation.** Hiding a button is usability, not access control. Every API, server action, export, download, and record lookup must authenticate and check permission and scope.
5. **Default deny.** An unknown role, missing organisation/campus/programme scope, invalid session, or failed policy evaluation must deny access.
6. **Never invent NWUCHAS facts.** Institution profile, programmes, campuses, contacts, accreditations, fees, intake dates, clinical partners, staff, and policies must be administrator-managed data. Use a clearly marked empty state until authorised content is entered.
7. **Do not expose student, applicant, sponsor, finance, HR, clinical, or staff data on the public website, in caches, in logs, or in client-side fixtures.**
8. **Do not claim regulatory accreditation, integration certification, payment-provider connection, compliance, or production readiness without supplied evidence and an approved configuration.**

## Work in phases and stop at each gate

### Phase 0 — establish a safe baseline

1. Inspect the repository, current environment, schema, existing routes, APIs, test coverage, and running application.
2. Create a versioned implementation plan with a module-by-module inventory showing: real database-backed workflow, incomplete workflow, static/demo fixture, unsafe simulation, missing API, missing permission, offline eligibility, and migration impact.
3. Locate every use of:
   - `Legacy`, `EduSphere`, `LSS`, inherited school/campus/cohort names;
   - `Math.random`, hardcoded operational totals, fixture generators, placeholder people/records;
   - `localStorage`/`sessionStorage` used as a system of record;
   - silent fallbacks, mock API responses, catch-and-succeed handlers, fake receipts, and simulated payment completion.
4. Disable external publication and remove public access to internal dashboards until public/private routing and authorisation gates have been verified.
5. Preserve useful data only through an explicit migration/normalisation plan. Do not copy demo identities into the NWUCHAS production database.

**Gate:** provide the inventory, risks, and phased plan. Do not declare the application ready at this point.

### Phase 1 — identity, tenancy, permissions, and route boundaries

Implement a server-side identity and access model appropriate to NWUCHAS. Use secure, httpOnly, Secure, SameSite cookies or a proven equivalent session architecture; do not place bearer tokens or long-lived privileged identities in browser storage. Rotate/validate secrets through environment-managed configuration. Add CSRF protection where the session model needs it, secure password reset/enrolment, rate limits, account-lockout policy, security event logging, session revocation, and MFA for privileged/finance/administration roles.

Create a real role and permission system stored in the database. It must support role assignment, activation/deactivation, expiry, delegated scope, and audited changes. Enforce both RBAC and contextual scope (organisation, campus, faculty/school, programme, cohort, module, learner relationship, ownership, and workflow state) on the server.

At a minimum design and implement these personas, subject to the approved NWUCHAS organisational structure:

| Persona | Primary permitted experience |
| --- | --- |
| Public visitor | View only approved public content, programmes, admission guidance, contact details, notices, and public events. |
| Applicant | Create and manage only their own application, uploads, consent, fee/invoice where applicable, status and authorised correspondence. |
| Student | View their own profile, registration, timetable, attendance, results released to them, financial account, documents, clinical requirements, and support requests. |
| Sponsor/guardian | View only explicitly linked student information approved by policy; no access by name, guessed ID, or browser state. |
| Admissions officer / registry officer | Process assigned applications, offers, enrolment, records and controlled corrections. |
| Lecturer | Access only assigned modules/cohorts; enter attendance and assessment evidence within configured windows. |
| Programme coordinator / Head of Department | Manage programme- and cohort-scoped academic workflows, moderation, and approvals within delegation. |
| Academic registrar / examinations officer / moderator | Manage curriculum, assessment, results, transcripts, moderation, releases, and immutable correction/review workflows. |
| Clinical placement coordinator / clinical supervisor | Manage authorised placements and learning evidence only for allocated students/sites; minimise clinical/personal data. |
| Finance officer / bursar / finance approver | Manage invoices, receipts, reconciliation, journals and approved reversals under separation of duties. |
| HR officer / line manager | Manage staff records and approved HR workflows within their scope. |
| Facilities, residences, transport, library, and asset officers | Receive only the operations capability and personal data needed for their approved module. Do not retain school-only terminology unless NWUCHAS confirms the service exists. |
| Executive / principal | Read and approve according to delegation; no unrestricted operational mutation merely because of title. |
| ICT/system administrator | Configure identity, roles, integrations, audit, and system settings; do not automatically see confidential finance, HR, clinical, or academic content. |
| Auditor / regulator | Time-bound, read-only, redacted, auditable access to approved evidence/export sets. |
| Integration service account | Narrow machine permissions, rotated credentials, IP/network restriction where available, and auditable calls. |

For every persona, build a real dashboard and navigation from permissions returned by the server. Test direct URL access and direct API calls for denial outside scope. Treat client navigation only as a convenience layer.

**Gate:** automated tests demonstrate unauthenticated rejection, role denial, organisation/campus/programme/relationship scoping, disabled-user rejection, session revocation, and audit logging for access and role changes.

### Phase 2 — public, client-facing NWUCHAS website

Make `/` a beautiful, responsive, accessible public NWUCHAS landing experience; do not wrap it in the staff shell or expose internal navigation, metrics, search, records, or operational APIs.

Build a public information architecture with only approved, database-managed content:

- Header with the approved NWUCHAS brand assets and accessible public navigation inspired by the official website: Home, About, Vision, Programmes/Courses, How to Apply, approved e-learning destination, plus `Apply`, `Student/Sponsor login`, and `Staff login` calls to action.
- Hero with configurable approved heading, supporting text, image/media, and application/login calls to action. Do not hardcode claims about accreditation, location, programmes, contact numbers, or intake dates.
- About NWUCHAS, leadership/governance, programmes, admissions requirements/process, academic calendar/notices, facilities/student life, clinical learning information, news/events, FAQs, contacts/directions, privacy/cookie/accessibility information, and emergency/contact notices as configured content blocks.
- Programme catalogue with approved programme information, admissions requirements, intake availability, duration, campus/mode only where authorised, and a clear application path.
- CMS/content administration for every public text, image, document, notice, event, programme publication, contact channel, navigation item, SEO metadata, and home-page block. Include draft/review/publish/unpublish states, role approval, revision history, asset alt text, file validation, and rollback.
- A real application journey that persists drafts and submissions to the NWUCHAS database, validates server-side, stores uploaded files in approved object storage with scanning and access controls, obtains consent, and gives the applicant a secure way to resume or track only their own application.
- Separate public layout and signed-in portal layouts. An authenticated user goes to the correct persona dashboard; a public visitor never lands in the executive dashboard.

Build to WCAG 2.2 AA expectations: keyboard navigation, visible focus, semantic landmarks, contrast, labelled controls, error summaries, responsive layouts, image alt text, sane motion preferences, and screen-reader testing. Add SEO metadata, robots/sitemap rules, structured data only for verified public facts, canonical URLs, and privacy-safe analytics with consent.

**Gate:** public route tests prove no protected content/data appears without a session, content can be created/reviewed/published by authorised staff, the application journey is persisted securely, and public pages perform well on mobile/slow networks.

### Phase 3 — real module workflows and data lifecycle

Replace inherited demo screens incrementally. For each approved module, deliver its schema migration, APIs/services, permissions, UI, validation, audit trail, real CRUD lifecycle, empty states, tests, and operating documentation together.

Prioritise these NWUCHAS capabilities according to the PRD and product-owner approval:

1. Institution configuration and reference data: organisation, campuses, faculties/schools, programmes, curriculum versions, academic years/terms, fees, contacts, public content, integration configuration.
2. Admissions and registry: applications, document requirements, qualification checks, review, decision, offer, acceptance, enrolment, student identity, status changes, withdrawal/deferral, controlled correction.
3. Academic delivery and examinations: programme/curriculum setup, module offerings, enrolment, teaching allocation, timetable, attendance, assessment setup, mark entry, moderation, approval, release, transcripts, appeals/corrections.
4. Clinical learning: placement/site records, authorised supervisors, logbooks/competencies, sign-off and review. Do not include patient-identifying data unless a documented lawful process, minimisation controls, and approvals exist.
5. Finance: charge/invoice, payment intent/provider webhook verification, receipt, reconciliation, credit/reversal with approval, ledger/journal controls, statement, clearance. Money must use decimal-safe calculations, idempotency keys, immutable references, double-entry controls where applicable, and separation of duties.
6. Staff/HR, assets, facilities/residences, communications, documents, calendar and other approved modules: implement only genuine NWUCHAS requirements; otherwise keep them hidden or provide a clearly empty administrator-configurable module, never a simulated school workflow.

For every write, use validation schemas, authorization, optimistic concurrency/version checks where necessary, idempotency for externally retried operations, audit events with before/after or event metadata, actor, scope, source, correlation ID, and timestamp. Implement correct retention/soft-delete/reversal mechanisms. Never allow destructive deletion of posted financial records, released results, audit evidence, identity records, or final approval history.

Remove fixture fallback code from production paths. Any optional developer seed must be isolated, explicit, idempotent, clearly synthetic, excluded from production, and must never fabricate a successful workflow or bypass access controls.

**Gate:** each released module has end-to-end tests using a clean database, no legacy fixture imports in runtime code, no client-only source of truth, and no fabricated values when records are absent.

### Phase 4 — genuine offline-first capability

Offline first means the system remains honest and useful when network connectivity is absent; it does not mean caching every endpoint or returning false success.

#### Offline architecture

1. Replace the inherited service worker, manifest, cache names, icons, URLs, and product wording with NWUCHAS-managed assets. Register exactly one production service worker through a tested PWA setup.
2. Cache only the versioned application shell and explicitly approved public/static assets. Do not broadly cache authenticated API responses, `Set-Cookie` responses, financial data, confidential documents, or personally identifiable data through a generic service-worker rule.
3. Maintain a per-device, per-user, time-limited offline read model in IndexedDB. Encrypt sensitive local data at rest where platform capability permits, require device enrolment, expire/revoke it on logout or role/scope changes, and provide a secure shared-device wipe/logout flow.
4. Download only the least data needed for that staff member's authorised work (for example, an assigned lecturer's scheduled roster). Do not preload all student, finance, HR, clinical, or institution data.
5. Store offline commands in IndexedDB with immutable operation IDs, actor/device/session metadata, entity version, idempotency key, correlation ID, timestamp, retry policy, and explicit status: queued, synchronising, accepted, rejected, conflicted, or blocked.
6. Server endpoints must validate the queued operation exactly as if it were online; they must deduplicate by idempotency key, enforce current permissions, append audits, and return a definitive outcome. A client must never convert a transport failure into success.
7. Define deterministic conflict policy by operation. Offer a review interface for conflicts; do not silently last-write-wins for academic, finance, identity, or approval records.
8. Use background sync only as a delivery mechanism, not as a permission bypass. Give users a visible sync queue, last verified sync time, error details, retry control, and evidence of server acknowledgement.

#### Offline eligibility policy

Establish a policy table in code and documentation. As a starting point:

- Potentially offline-capable after product-owner approval: viewing assigned rosters/reference data; draft notes; attendance capture for an assigned session; limited clinical learning draft evidence where privacy rules permit.
- Online-only: authentication/initial device registration, user/role management, payments and payment-provider confirmation, finance posting/reversals/reconciliation, payroll, final result release, transcript issuance, official approvals, high-risk document issue, destructive actions, full-record search, and sensitive exports.

If offline authentication is required, design it specifically with a short-lived, device-bound, revocable offline entitlement and strong local protection. Do not rely on a locally stored role or stale browser session as authority.

#### Mandatory corrections

- Delete the worker behavior that responds `200 success` for a failed POST/PUT/PATCH/DELETE.
- Do not use localStorage as the authoritative queue, identity store, finance store, document store, or security profile.
- Do not cache all `/api/*` replies; create endpoint-specific cache rules with privacy review.
- Use tests that actually disable the network, restart the browser/application, alter server-side permission and record versions, reconnect, and verify queue acceptance/rejection/conflict behavior.

**Gate:** offline E2E tests prove that allowed work can be queued and reconciled honestly, prohibited work cannot be performed offline, sensitive data is not broadly cached, and failed sync is visible and recoverable without data loss or false completion.

### Phase 5 — production engineering and external publication

1. Create and commit reviewed Prisma migrations. Never rely on ad-hoc schema push for production. Include backup, restore, rollback, and data-migration runbooks.
2. Rename all infrastructure, package, database, volume, cache, DNS, logs, assets, and documentation from the inherited product to NWUCHAS.
3. Remove development defaults. Require strong secrets/configuration at deployment; do not expose PostgreSQL or Redis publicly by default. Use TLS termination, secure headers, reverse proxy/WAF, rate limiting, upload limits/scanning, network segmentation, secret management, backups, monitoring, centralised audit/security logs, health/readiness endpoints, and alerting.
4. Separate environments: local, test, staging, production. Use production-safe build/release configuration, least-privilege database credentials, managed backups with restoration drills, and tested migration deployment.
5. Add CI gates: typecheck, lint, unit/integration tests, schema migration verification, dependency/security scanning, API authorization tests, E2E tests for each persona, accessibility checks, PWA/offline tests, and performance budgets.
6. Add observability that does not leak personal data: request/correlation IDs, structured error logging, metrics, uptime checks, queue/sync error telemetry, and audit event integrity checks.
7. Document incident response, support workflows, data retention, privacy governance, user onboarding, administrator operations, disaster recovery, and go-live rollback.

**Gate:** staging sign-off demonstrates secure public access, persona access, CRUD auditability, offline behavior, backups/restores, external dependencies in sandbox/test mode, security review, accessibility review, performance review, and product-owner acceptance. Only then present a production publication plan for approval.

## Required design quality

Use a calm, premium, contemporary education/health-sciences visual system that is visibly NWUCHAS. Start from the official NWUCHAS website's approved logo, image direction, public information architecture and brand palette; express them through accessible, documented semantic tokens rather than copied WordPress CSS or hardcoded colours. The public site should feel welcoming and trustworthy; authenticated portals should be dense only where staff work requires density. Maintain a consistent component library, clear hierarchy, responsive behavior, empty/loading/error states, and no misleading "all systems healthy" or operational claims when data/integrations are absent.

Do not reuse the legacy school layout as the product information architecture. Reuse well-tested generic UI primitives only after they meet accessibility, data, and permission requirements.

## Required deliverables

At the end of each phase provide:

1. A concise change log with files, migrations, endpoints, roles, and affected workflows.
2. A data model and lifecycle summary.
3. Permission matrix and direct-API/route enforcement evidence.
4. Test results, including failures/known limitations.
5. A fixture/legacy-removal report proving runtime paths no longer use inherited demo content.
6. Offline capability matrix and tested reconciliation evidence.
7. Public-content configuration guide and editor workflow.
8. Deployment, backup/restore, security, and rollback instructions.
9. An explicit readiness statement that distinguishes implemented, staged, blocked, and not yet approved items.

## Definition of done

Do not call NWUCHAS CMIS production-ready, externally accessible, offline-first, integrated, or compliant until all of the following are true:

- The public landing site is separated from authenticated portals and every public claim/content item has an authorised source and publishing workflow.
- Every persona can only reach permitted data and actions, verified through UI, direct route, API, export, and offline-sync tests.
- Published operational data is database/integration-backed; no runtime fixture, fallback count, generated legacy learner, static placeholder person, or random workflow identifier remains in live flows.
- CRUD is real, validated, scoped, audited, and uses appropriate reversals/retention for sensitive records.
- Offline work is intentional, restricted, encrypted/protected where needed, server-validated, conflict-aware, test-proven, and never falsely reported as complete.
- There are reviewed migrations, secure configuration, backups/restores, observability, release gates, and a staging acceptance record.
- All inherited Legacy School/EduSphere naming, data, assets, PWA behavior, and infrastructure references are removed or intentionally retained only as documented migration history outside production paths.

When a requirement depends on an institutional decision, an external payment/SMS/email/identity provider, accreditation evidence, legal/privacy approval, content, or deployment access, stop at the boundary, list the exact missing decision/configuration, and provide the safe next action. Do not simulate completion.
