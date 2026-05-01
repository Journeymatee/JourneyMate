-- Street-food catalog (idempotent — safe to run on every boot).
--
-- One row per (city_slug, name). The seed script upserts on this pair so
-- editing trip.data.js and restarting the server cleanly updates the table
-- without duplicating rows.

CREATE TABLE IF NOT EXISTS street_food_items (
  id                 SERIAL PRIMARY KEY,
  city_slug          VARCHAR(64)  NOT NULL,
  name               VARCHAR(160) NOT NULL,
  emoji              VARCHAR(8),
  description        TEXT,
  where_to_eat       TEXT,
  tier               VARCHAR(8)   NOT NULL DEFAULT 'street'
                       CHECK (tier IN ('street', 'fine')),
  maps_url           TEXT,
  affiliate_url      TEXT,
  affiliate_partner  VARCHAR(80),
  position           INTEGER      NOT NULL DEFAULT 0,
  is_published       BOOLEAN      NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (city_slug, name)
);

CREATE INDEX IF NOT EXISTS idx_street_food_city
  ON street_food_items (city_slug, position);

CREATE INDEX IF NOT EXISTS idx_street_food_tier
  ON street_food_items (city_slug, tier, position);

CREATE INDEX IF NOT EXISTS idx_street_food_published
  ON street_food_items (is_published);
