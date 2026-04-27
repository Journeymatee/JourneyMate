-- When to go: helps new members pick months (idempotent)
ALTER TABLE blog_experiences ADD COLUMN IF NOT EXISTS visit_months VARCHAR(200);
