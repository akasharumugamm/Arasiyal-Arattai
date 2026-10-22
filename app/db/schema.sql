CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_sub TEXT NOT NULL UNIQUE,
  email TEXT,
  display_name TEXT,
  username TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL,
  review_type TEXT NOT NULL CHECK (review_type IN ('Positive', 'Negative', 'Allegation', 'Request')),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 10000),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS review_votes (
  post_id UUID NOT NULL REFERENCES review_posts(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, voter_id)
);

CREATE INDEX IF NOT EXISTS review_posts_author_created_idx ON review_posts (author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS review_posts_profile_created_idx ON review_posts (profile_name, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS review_votes_post_idx ON review_votes (post_id);
