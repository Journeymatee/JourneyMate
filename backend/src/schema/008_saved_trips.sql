-- Saved trips & wishlist (idempotent).
--
-- One row per save action by a user. Stores the full server-shaped trip
-- payload (origin / destination / silver / gold / itinerary / maps / …) as
-- JSONB so a saved trip can be re-rendered exactly even if pricing or the
-- itinerary engine change later. Silver/Gold prices are denormalised into
-- columns so list views / filters do not have to crack JSON on every row.
--
-- `share_token` is a 22-char URL-safe random string. Anyone with the link
-- can read the trip via the public share endpoint (no auth) — write
-- operations always require the owner's auth token.

CREATE TABLE IF NOT EXISTS saved_trips (
  id            BIGSERIAL    PRIMARY KEY,
  user_id       INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug          VARCHAR(180) NOT NULL,
  name          VARCHAR(200) NOT NULL,
  origin        VARCHAR(160) NOT NULL,
  destination   VARCHAR(160) NOT NULL,
  days          INTEGER      NOT NULL CHECK (days BETWEEN 1 AND 5),
  trip_type     VARCHAR(16),
  vibes         TEXT[]       NOT NULL DEFAULT '{}',
  silver_price  INTEGER,
  gold_price    INTEGER,
  payload       JSONB        NOT NULL,
  notes         TEXT         NOT NULL DEFAULT '',
  share_token   VARCHAR(64)  NOT NULL UNIQUE,
  is_public     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_trips_user
  ON saved_trips (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_trips_share
  ON saved_trips (share_token);

-- Soft upgrade for older installs that may have created the table without
-- some columns. Safe no-ops on a fresh install.
DO $$ BEGIN
  ALTER TABLE saved_trips ADD COLUMN notes TEXT NOT NULL DEFAULT '';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE saved_trips ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT TRUE;
EXCEPTION WHEN others THEN NULL; END $$;
