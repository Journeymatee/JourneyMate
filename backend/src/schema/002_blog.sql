-- Blog posts (idempotent)

CREATE TABLE IF NOT EXISTS blog_posts (
  id              SERIAL PRIMARY KEY,
  slug            VARCHAR(180) NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  excerpt         TEXT NOT NULL,
  body            TEXT,
  category        VARCHAR(80) NOT NULL,
  read_time_mins  INTEGER NOT NULL DEFAULT 5,
  author          VARCHAR(120) NOT NULL,
  emoji           VARCHAR(8) NOT NULL DEFAULT '✈️',
  tags            TEXT[] NOT NULL DEFAULT '{}',
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_published    BOOLEAN NOT NULL DEFAULT true,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published
  ON blog_posts (is_published, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_category
  ON blog_posts (category);
