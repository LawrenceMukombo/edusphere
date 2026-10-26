# Threat model

| Threat | Required mitigation |
|---|---|
| Copied credentials/DSNs/remotes | separate resources, secret scanning and no defaults |
| ID enumeration/client-side authorisation | opaque IDs, server RBAC and scoped queries |
| Payroll bank-detail diversion | encrypted fields, dual approval, MFA and immutable audit |
| Forged/replayed webhook | signature + provider verification, idempotency and reconciliation queue |
| Unauthorised refund | creator/approver separation and immutable reversals |
| Patient data in clinical logbooks | de-identified validation, scope and audit |
| Statutory rule tampering | effective dates, approved immutable versions, accountant examples |
| Malicious upload | type/size policy, malware scanning and private storage |

## Dependency risk status

The inherited Next.js version was raised from 14.2.15 to 14.2.35 as a compatible patch update. `npm audit` still reports framework-level critical advisories whose automated remediation requires a breaking Next.js 16 upgrade, plus Tailwind 4 remediation. Those upgrades require a compatibility and regression workstream; they are not silently force-applied.
