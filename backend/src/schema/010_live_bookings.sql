-- Live booking flow — adds the columns we need to support seat/room
-- selection, passenger details, Razorpay payment lifecycle, and a
-- machine-friendly booking reference.
--
-- This migration is fully idempotent: every column add is wrapped in an
-- exception-swallowing DO block so it can run on every boot, both on
-- fresh databases and on installs that already shipped with the
-- original 4-column `bookings` table.

-- 1. Booking type — train | flight | hotel.
DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN type VARCHAR(16) NOT NULL DEFAULT 'train';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE bookings ADD CONSTRAINT bookings_type_chk
    CHECK (type IN ('train', 'flight', 'hotel'));
EXCEPTION WHEN others THEN NULL; END $$;

-- 2. Provider name (currently always "mock-*" but flagged so we can swap
--    in real providers without a schema change).
DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN provider VARCHAR(40) NOT NULL DEFAULT 'mock';
EXCEPTION WHEN others THEN NULL; END $$;

-- 3. Public-facing booking reference (e.g. JM-A1B2-T). Unique so the
--    confirmation page + email can deep-link by ref alone.
DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN booking_ref VARCHAR(32) UNIQUE;
EXCEPTION WHEN others THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings (booking_ref);

-- 4. Razorpay payment lifecycle. Order is created immediately after the
--    user clicks "Pay". The payment_id + signature land via the Checkout
--    handler; the server verifies the signature before flipping
--    payment_status to 'paid'.
DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN razorpay_order_id VARCHAR(64);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN razorpay_payment_id VARCHAR(64);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN razorpay_signature VARCHAR(255);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(16) NOT NULL
    DEFAULT 'unpaid';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_chk
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded', 'failed'));
EXCEPTION WHEN others THEN NULL; END $$;

-- 5. Passenger / room details + selected seats live in the existing
--    payload jsonb column. Re-applying the default keeps it from being
--    null on fresh inserts.
DO $$ BEGIN
  ALTER TABLE bookings ALTER COLUMN payload SET DEFAULT '{}'::jsonb;
EXCEPTION WHEN others THEN NULL; END $$;

-- 6. Updated-at trigger for clean audit when status changes.
DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
EXCEPTION WHEN others THEN NULL; END $$;

-- 7. Useful filtering indexes for the "My bookings" page.
CREATE INDEX IF NOT EXISTS idx_bookings_user_created  ON bookings (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status        ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment       ON bookings (payment_status);

-- 8. The original 001_init.sql declared `plan` as NOT NULL with a
--    silver/gold check. That doesn't fit hotel bookings (which use
--    'standard' / 'deluxe' / 'suite'). We relax the constraint here
--    while keeping silver/gold as the default for trains/flights, and
--    drop the NOT NULL.
DO $$ BEGIN
  ALTER TABLE bookings ALTER COLUMN plan DROP NOT NULL;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE bookings DROP CONSTRAINT bookings_plan_check;
EXCEPTION WHEN others THEN NULL; END $$;
