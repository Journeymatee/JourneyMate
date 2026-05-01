-- Per-user trip-type & vibe preferences (idempotent).
--
-- One row per user. Updated on every successful /trips/search so the
-- next visit can prefill the picker — and so we have signal for future
-- recommendation features.
--
-- Soft-typed columns (TEXT[] for vibes, VARCHAR for trip_type) so we can
-- evolve the taxonomy in `tripVibe.engine.js` without a schema migration.

CREATE TABLE IF NOT EXISTS user_trip_preferences (
  user_id     INTEGER     PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  trip_type   VARCHAR(16),
  vibes       TEXT[]      NOT NULL DEFAULT '{}',
  last_from   VARCHAR(160),
  last_to     VARCHAR(160),
  last_days   INTEGER     CHECK (last_days IS NULL OR (last_days BETWEEN 1 AND 5)),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_trip_pref_updated
  ON user_trip_preferences (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_trip_pref_type
  ON user_trip_preferences (trip_type);
