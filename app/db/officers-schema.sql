-- Arasiyal Arattai: additive officer-directory schema.
-- This creates new tables and does not alter existing app_users/review_* tables.

CREATE TABLE IF NOT EXISTS government_officers (
    id BIGSERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('IAS', 'IPS')),
    batch_year SMALLINT,
    cadre TEXT,
    employee_id TEXT NOT NULL,
    current_designation TEXT,
    current_department TEXT,
    posting_location TEXT,
    date_of_birth DATE,
    recruitment_type TEXT,
    education TEXT,
    home_state_or_domicile TEXT,
    gender TEXT,
    pay_level TEXT,
    posting_effective_date DATE,
    source_name TEXT,
    source_url TEXT,
    source_snapshot_date DATE,
    source_page INTEGER,
    last_verified DATE,
    verification_status TEXT,
    source_specific_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT government_officers_service_employee_unique
        UNIQUE (service_type, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_government_officers_name
    ON government_officers (LOWER(full_name));
CREATE INDEX IF NOT EXISTS idx_government_officers_service
    ON government_officers (service_type);
CREATE INDEX IF NOT EXISTS idx_government_officers_cadre
    ON government_officers (cadre);
CREATE INDEX IF NOT EXISTS idx_government_officers_batch
    ON government_officers (batch_year);

-- Optional view for the directory UI.
CREATE OR REPLACE VIEW government_officer_directory AS
SELECT
    id, full_name, service_type, batch_year, cadre, employee_id,
    current_designation, current_department, posting_location,
    recruitment_type, education, pay_level, source_name,
    source_snapshot_date, verification_status
FROM government_officers;
