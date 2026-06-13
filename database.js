import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const databasePath = resolve(process.env.DATABASE_PATH || "data/quick-resume.sqlite");

mkdirSync(dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);

db.exec(`
  CREATE TABLE IF NOT EXISTS paid_access (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    stripe_session_id TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL,
    paid_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  CREATE INDEX IF NOT EXISTS paid_access_email_idx
    ON paid_access (email);

  CREATE INDEX IF NOT EXISTS paid_access_expires_at_idx
    ON paid_access (expires_at);
`);

const saveAccessStatement = db.prepare(`
  INSERT INTO paid_access (email, stripe_session_id, plan, paid_at, expires_at)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(stripe_session_id) DO UPDATE SET
    email = excluded.email,
    plan = excluded.plan,
    paid_at = excluded.paid_at,
    expires_at = excluded.expires_at
`);

const getAccessStatement = db.prepare(`
  SELECT email, stripe_session_id AS sessionId, plan, paid_at AS paidAt, expires_at AS expiresAt
  FROM paid_access
  WHERE email = ? AND expires_at > ?
  ORDER BY expires_at DESC
  LIMIT 1
`);

export function savePaidAccess({ email, sessionId, plan, paidAt, expiresAt }) {
  saveAccessStatement.run(email.toLowerCase(), sessionId, plan, paidAt, expiresAt);
}

export function getActiveAccessByEmail(email) {
  return getAccessStatement.get(email.toLowerCase(), Date.now()) || null;
}

export function getDatabaseInfo() {
  return { path: databasePath };
}
