CREATE TABLE IF NOT EXISTS paid_access (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  stripe_session_id TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('day', 'week')),
  paid_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS paid_access_email_idx
  ON paid_access (email);

CREATE INDEX IF NOT EXISTS paid_access_email_expires_idx
  ON paid_access (email, expires_at DESC);

CREATE INDEX IF NOT EXISTS paid_access_expires_at_idx
  ON paid_access (expires_at);
