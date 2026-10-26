# Initial permission matrix

| Role | Scope | Separation requirement |
|---|---|---|
| Applicant/student | own records | cannot approve documents, results or payments |
| Admissions officer | assigned queues | committee approves final offers |
| Registrar | registry/enrolment | exceptional merges need separate approval |
| Lecturer/coordinator | assigned modules/cohorts | cannot publish results |
| Clinical supervisor | assigned placements | no patient identifiers |
| Cashier | provisional collections | cannot reconcile/approve own refund |
| Finance reconciler | settlements/ledger | separate from cashier/refund creator |
| HR officer | employment/contracts | cannot approve payroll |
| Payroll preparer | prepare calculations | cannot review/approve/disburse same run |
| Payroll reviewer/approver | review/lock run | distinct actor, MFA |
| IT admin | technical configuration | no default salary/grade access |

Sensitive server actions require record-scope checks plus actor, time and reason audit data.
