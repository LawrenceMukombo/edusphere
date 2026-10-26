# Data migration and rollback plan

1. Catalogue and hash legacy exports; do not import generated fixtures, shared production records, credentials or documents.
2. Map approved source fields to NWUCHAS records with owner approval; separately list rejects and corrections.
3. Import into an access-restricted staging database; validate identifiers, duplicates, relations, balances and scanned documents.
4. Registrar, finance and HR reconcile counts/opening balances/employees against signed source reports. Clinical data with patient identifiers is rejected.
5. Run repeatable dry runs with migration manifests and sign-off.
6. At cutover take encrypted backups, apply additive migrations and verify balances/statuses.
7. Roll back application releases and restore only verified NWUCHAS backups. Never reset a shared or legacy database.

Corrections to results and finance records are append-only adjustment/version records, never overwrites.
