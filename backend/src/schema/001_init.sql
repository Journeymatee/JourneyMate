-- JourneyMate schema v2
-- Fully idempotent — safe to run on every boot.

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255),                          -- nullable for OAuth users
  full_name       VARCHAR(255) NOT NULL DEFAULT 'Traveler',
  google_id       VARCHAR(255) UNIQUE,
  avatar_url      TEXT,
  provider        VARCHAR(16) NOT NULL DEFAULT 'local',  -- 'local' | 'google'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email_lower  ON users (LOWER(email));

-- Upgrade existing installs: safely add new columns if missing
DO $$ BEGIN
  ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE users ADD COLUMN avatar_url TEXT;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE users ADD COLUMN provider VARCHAR(16) NOT NULL DEFAULT 'local';
EXCEPTION WHEN others THEN NULL; END $$;

-- Create index only after upgrades ensured google_id exists.
CREATE INDEX IF NOT EXISTS idx_users_google_id    ON users (google_id);

CREATE TABLE IF NOT EXISTS cities (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(160) NOT NULL,
  slug            VARCHAR(180) NOT NULL UNIQUE,
  state           VARCHAR(80)  NOT NULL,
  state_code      VARCHAR(4)   NOT NULL,
  country         VARCHAR(3)   NOT NULL DEFAULT 'IN',
  type            VARCHAR(24)  NOT NULL DEFAULT 'city',
  lat             NUMERIC(9,6) NOT NULL,
  lng             NUMERIC(9,6) NOT NULL,
  popularity      INTEGER      NOT NULL DEFAULT 50,
  tags            TEXT[]       NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cities_name_trgm ON cities (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_cities_state     ON cities (state_code);
CREATE INDEX IF NOT EXISTS idx_cities_type      ON cities (type);
CREATE INDEX IF NOT EXISTS idx_cities_pop       ON cities (popularity DESC);

CREATE TABLE IF NOT EXISTS routes (
  id              SERIAL PRIMARY KEY,
  origin_slug     VARCHAR(180) NOT NULL,
  destination_slug VARCHAR(180) NOT NULL,
  duration        VARCHAR(80)  NOT NULL,
  tag             VARCHAR(32)  NOT NULL DEFAULT 'General',
  data            JSONB        NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (origin_slug, destination_slug)
);
CREATE INDEX IF NOT EXISTS idx_routes_origin ON routes (origin_slug);
CREATE INDEX IF NOT EXISTS idx_routes_dest   ON routes (destination_slug);

CREATE TABLE IF NOT EXISTS bookings (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origin          VARCHAR(160) NOT NULL,
  destination     VARCHAR(160) NOT NULL,
  plan            VARCHAR(16)  NOT NULL CHECK (plan IN ('silver','gold')),
  price_inr       INTEGER      NOT NULL,
  travel_date     DATE,
  status          VARCHAR(16)  NOT NULL DEFAULT 'pending',
  payload         JSONB        NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id              BIGSERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            VARCHAR(16) NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_time ON ai_chat_messages (user_id, id DESC);
