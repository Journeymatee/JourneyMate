-- User-submitted travel stories (idempotent)

CREATE TABLE IF NOT EXISTS blog_experiences (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users (id) ON DELETE SET NULL,
  display_name  VARCHAR(120) NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  destination   VARCHAR(120),
  is_approved   BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_experiences_list
  ON blog_experiences (is_approved, created_at DESC);
