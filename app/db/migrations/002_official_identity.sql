-- Canonical identity keys make sentiment follow a person, not a display label or role.
-- Apply this migration to the existing PostgreSQL database before deploying code that reads official_key.

ALTER TABLE review_post_officials
  ADD COLUMN IF NOT EXISTS official_key TEXT;

UPDATE review_post_officials
SET official_key = CASE
  WHEN regexp_replace(
    regexp_replace(lower(trim(official_name)), '^((honou?rable|thiru|thirumathi|thirumagan|mr|mrs|ms|dr|justice)[[:space:]]+)+', '', 'g'),
    '[^a-z0-9]', '', 'g'
  ) IN ('cjosephvijay', 'josephvijay') THEN 'joseph-vijay'
  ELSE regexp_replace(
    regexp_replace(lower(trim(official_name)), '^((honou?rable|thiru|thirumathi|thirumagan|mr|mrs|ms|dr|justice)[[:space:]]+)+', '', 'g'),
    '[^a-z0-9]', '', 'g'
  )
END
WHERE official_key IS NULL OR official_key = '';

-- If an old post tagged the same person under two aliases, keep one canonical association.
WITH duplicates AS (
  SELECT ctid,
         row_number() OVER (PARTITION BY post_id, official_key ORDER BY official_name) AS row_num
  FROM review_post_officials
)
DELETE FROM review_post_officials po
USING duplicates d
WHERE po.ctid = d.ctid AND d.row_num > 1;

ALTER TABLE review_post_officials
  ALTER COLUMN official_key SET NOT NULL;

ALTER TABLE review_post_officials
  DROP CONSTRAINT IF EXISTS review_post_officials_pkey;

ALTER TABLE review_post_officials
  ADD CONSTRAINT review_post_officials_pkey PRIMARY KEY (post_id, official_key);

CREATE INDEX IF NOT EXISTS review_post_officials_identity_idx
  ON review_post_officials (official_key, post_id);
