-- Likes, emoji reactions, and comments on blog_experiences (idempotent)

CREATE TABLE IF NOT EXISTS blog_experience_likes (
  id            SERIAL PRIMARY KEY,
  experience_id INTEGER NOT NULL REFERENCES blog_experiences (id) ON DELETE CASCADE,
  user_id       INTEGER REFERENCES users (id) ON DELETE CASCADE,
  anon_key      VARCHAR(64),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (user_id IS NOT NULL AND anon_key IS NULL) OR
    (user_id IS NULL AND anon_key IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_exp_like_user
  ON blog_experience_likes (experience_id, user_id) WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_exp_like_anon
  ON blog_experience_likes (experience_id, anon_key) WHERE anon_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_exp_like_experience ON blog_experience_likes (experience_id);

CREATE TABLE IF NOT EXISTS blog_experience_reactions (
  id            SERIAL PRIMARY KEY,
  experience_id INTEGER NOT NULL REFERENCES blog_experiences (id) ON DELETE CASCADE,
  user_id       INTEGER REFERENCES users (id) ON DELETE CASCADE,
  anon_key      VARCHAR(64),
  emoji         VARCHAR(8) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (user_id IS NOT NULL AND anon_key IS NULL) OR
    (user_id IS NULL AND anon_key IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_exp_reaction_user
  ON blog_experience_reactions (experience_id, user_id) WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_exp_reaction_anon
  ON blog_experience_reactions (experience_id, anon_key) WHERE anon_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_exp_reaction_experience ON blog_experience_reactions (experience_id);

CREATE TABLE IF NOT EXISTS blog_experience_comments (
  id            SERIAL PRIMARY KEY,
  experience_id INTEGER NOT NULL REFERENCES blog_experiences (id) ON DELETE CASCADE,
  user_id       INTEGER REFERENCES users (id) ON DELETE SET NULL,
  anon_key      VARCHAR(64),
  display_name  VARCHAR(120) NOT NULL,
  body          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (user_id IS NOT NULL AND anon_key IS NULL) OR
    (user_id IS NULL AND anon_key IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_exp_comment_experience ON blog_experience_comments (experience_id, created_at);
