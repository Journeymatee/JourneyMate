-- Trip collaboration MVP — comments + Silver/Gold votes (idempotent).
--
-- Both tables hang off `saved_trips(id)` and cascade on delete. `user_id`
-- is nullable + ON DELETE SET NULL so a user-deletion does not lose the
-- discussion thread on a still-alive trip.
--
-- "Anyone with the share link can read" is enforced at the route layer —
-- writes always require requireAuth.

CREATE TABLE IF NOT EXISTS trip_comments (
  id              BIGSERIAL    PRIMARY KEY,
  saved_trip_id   BIGINT       NOT NULL REFERENCES saved_trips(id) ON DELETE CASCADE,
  user_id         INTEGER               REFERENCES users(id)       ON DELETE SET NULL,
  author_name     VARCHAR(120) NOT NULL DEFAULT 'Traveler',
  body            VARCHAR(2000) NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trip_comments_trip
  ON trip_comments (saved_trip_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trip_comments_user
  ON trip_comments (user_id);

CREATE TABLE IF NOT EXISTS trip_votes (
  saved_trip_id   BIGINT       NOT NULL REFERENCES saved_trips(id) ON DELETE CASCADE,
  user_id         INTEGER      NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
  choice          VARCHAR(8)   NOT NULL CHECK (choice IN ('silver','gold')),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (saved_trip_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_trip_votes_trip
  ON trip_votes (saved_trip_id);
