# Officer directory import

The application lives in `app/` and already depends on `pg`; no package changes are needed.

1. From `app/`, confirm `DATABASE_URL` points to the intended PostgreSQL database.
2. Apply the additive migration:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/officers-schema.sql
```

3. Place `tamil_nadu_officers_standardized.csv` in `app/data/` (keep generated data files out of Git if preferred).
4. Run:

```bash
node scripts/import-officers.mjs ./data/tamil_nadu_officers_standardized.csv
```

The importer reuses the installed `pg` package, handles quoted CSV fields, parses common date formats, preserves source-specific columns in JSONB, and upserts by `(service_type, employee_id)`. Re-running it will update matching records instead of duplicating them.

For RDS, the importer uses `RDS_CA_CERT_PATH` or the same default CA path used in `lib/db.ts`: `/etc/ssl/certs/rds/global-bundle.pem`.

Verify:

```sql
SELECT service_type, COUNT(*) FROM government_officers GROUP BY service_type ORDER BY service_type;
```

Expected source CSV counts: 10 IAS and 260 IPS. These are source records, not a live confirmation that every officer currently serves in Tamil Nadu. The IAS source is a 10-record preview and the IPS source reflects the 1 January 2026 Civil List. The CSV's `last_verified` is the standardization date, not a live posting check.

The SQL is additive: it does not modify the existing authentication or community-review tables. Never commit `.env.local` or database credentials.
