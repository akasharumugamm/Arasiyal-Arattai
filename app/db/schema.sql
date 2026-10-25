CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fresh-install schema for Arasiyal Arattai.
-- Existing empty tables must be dropped once before applying this version:
-- DROP TABLE IF EXISTS review_comments, review_post_officials, review_votes, review_images, review_posts, app_users CASCADE;

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
  review_type TEXT NOT NULL CHECK (review_type IN ('Positive', 'Concern', 'Allegation', 'Request')),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 10000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS review_post_officials (
  post_id UUID NOT NULL REFERENCES review_posts(id) ON DELETE CASCADE,
  official_name TEXT NOT NULL CHECK (char_length(official_name) BETWEEN 1 AND 200),
  official_key TEXT NOT NULL,
  official_category TEXT NOT NULL DEFAULT 'Other',
  PRIMARY KEY (post_id, official_key)
);

CREATE TABLE IF NOT EXISTS review_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES review_posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL CHECK (char_length(image_url) <= 2048),
  sort_order SMALLINT NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, sort_order)
);

CREATE TABLE IF NOT EXISTS review_votes (
  post_id UUID NOT NULL REFERENCES review_posts(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, voter_id)
);

CREATE TABLE IF NOT EXISTS review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES review_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES review_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 3000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS review_posts_author_created_idx ON review_posts (author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS review_post_officials_name_idx ON review_post_officials (official_name, post_id);
CREATE INDEX IF NOT EXISTS review_post_officials_identity_idx ON review_post_officials (official_key, post_id);
CREATE INDEX IF NOT EXISTS review_images_post_order_idx ON review_images (post_id, sort_order);
CREATE INDEX IF NOT EXISTS review_votes_post_idx ON review_votes (post_id);
CREATE INDEX IF NOT EXISTS review_comments_post_created_idx ON review_comments (post_id, created_at ASC) WHERE deleted_at IS NULL;
