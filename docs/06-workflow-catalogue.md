# Workflow catalogue

| Workflow | States / control |
|---|---|
| Admissions | enquiry → draft → submitted → document check → eligibility → interview/waiver → committee decision → offer/waitlist/reject → accepted → enrolled; server-authoritative transition contract exists, with committee and registrar separation. Persistence/audit UI remains queued. |
| Results | draft → submitted → moderated → exam-board approved → published; correction creates approved version. |
| Clinical | placement planned → active → supervisor validated → coordinator cleared/remediation; de-identified logbooks only. |
| Payroll | DRAFT → INPUTS_VALIDATED → CALCULATED → EXCEPTIONS_RESOLVED → PREPARED → REVIEWED → APPROVED_LOCKED → BANK_FILE_GENERATED → DISBURSEMENT_RECONCILED → STATUTORY_PREPARED → FILED/REMITTED → CLOSED. |
| Payments | CREATED → PENDING_AUTHORISATION → PROCESSING → CONFIRMED/FAILED/EXPIRED/REVERSED/REFUNDED/DISPUTED; final credit after signed, server-verified, exact-match event and idempotent posting only. |
