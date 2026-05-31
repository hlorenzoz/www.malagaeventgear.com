-- MEG Lead Capture — initial D1 schema
-- Apply with: wrangler d1 migrations apply meg-leads

-- leads
CREATE TABLE IF NOT EXISTS leads (
  id           TEXT PRIMARY KEY,          -- crypto.randomUUID()
  package_slug TEXT NOT NULL,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  event_date   TEXT,                      -- ISO date YYYY-MM-DD
  message      TEXT,
  lang         TEXT NOT NULL DEFAULT 'es',
  status       TEXT NOT NULL DEFAULT 'new', -- new | contacted | converted | lost
  created_at   TEXT NOT NULL,             -- ISO 8601 UTC
  updated_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_package_slug ON leads(package_slug);
CREATE INDEX IF NOT EXISTS idx_leads_status       ON leads(status);

-- lead_events (audit trail)
CREATE TABLE IF NOT EXISTS lead_events (
  id         TEXT PRIMARY KEY,
  lead_id    TEXT NOT NULL REFERENCES leads(id),
  step       TEXT NOT NULL,  -- submitted | email_sent | notified | review_requested | converted | lost
  meta       TEXT,           -- JSON blob (e.g. message_id from Resend)
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id ON lead_events(lead_id);

-- email_messages (Resend send log)
CREATE TABLE IF NOT EXISTS email_messages (
  id         TEXT PRIMARY KEY,
  lead_id    TEXT NOT NULL REFERENCES leads(id),
  kind       TEXT NOT NULL,  -- confirmation | notification | review_reminder
  resend_id  TEXT,           -- Resend message ID
  sent_at    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'sent' -- sent | failed
);
CREATE INDEX IF NOT EXISTS idx_email_messages_lead_id ON email_messages(lead_id);

-- review_requests
CREATE TABLE IF NOT EXISTS review_requests (
  id           TEXT PRIMARY KEY,
  lead_id      TEXT NOT NULL REFERENCES leads(id),
  token        TEXT NOT NULL UNIQUE,
  event_date   TEXT NOT NULL,          -- ISO date
  next_send_at TEXT NOT NULL,          -- ISO 8601 UTC; when to fire next reminder
  send_count   INTEGER NOT NULL DEFAULT 0,
  max_sends    INTEGER NOT NULL DEFAULT 3,
  clicked_at   TEXT,                   -- NULL = not clicked; set on /r/[token]
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_review_requests_next_send_at ON review_requests(next_send_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_review_requests_token ON review_requests(token);

-- recipients (per-package or global notification targets)
CREATE TABLE IF NOT EXISTS recipients (
  id          TEXT PRIMARY KEY,
  package_id  TEXT,          -- NULL = global
  email       TEXT NOT NULL,
  active      INTEGER NOT NULL DEFAULT 1,  -- 0 = disabled
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_recipients_package_id ON recipients(package_id);
