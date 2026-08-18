# LuxDrive database baseline

This directory contains the reproducible database structure for a new LuxDrive customer installation.

- `migrations/` builds database structure only.
- `seeds/` contains safe, neutral defaults only.
- SQL files must never contain customer rows, passwords, hashes, credentials, or secrets.
- Never clone a live customer database to create another customer installation.
- Every customer must use a separate database and separate deployment configuration.
- Admin account creation is intentionally deferred to a later phase.

## Intended installation order

1. Create an empty customer database.
2. Run the migrations.
3. Run the safe default seed.
4. Bootstrap the customer Admin account through the later owner-provisioning process.
5. Configure company details and content through Admin.

The baseline is structure-only and must not be applied to the live production database as part of this phase.
