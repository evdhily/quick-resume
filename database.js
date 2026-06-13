import pg from "pg";

const { Pool } = pg;

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Use PostgreSQL for production storage.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
      max: Number(process.env.DATABASE_POOL_SIZE || 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return pool;
}

export async function initDatabase() {
  await getPool().query(`
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
  `);
}

export async function savePaidAccess({ email, sessionId, plan, paidAt, expiresAt }) {
  await getPool().query(
    `
      INSERT INTO paid_access (email, stripe_session_id, plan, paid_at, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (stripe_session_id) DO UPDATE SET
        email = EXCLUDED.email,
        plan = EXCLUDED.plan,
        paid_at = EXCLUDED.paid_at,
        expires_at = EXCLUDED.expires_at
    `,
    [email.toLowerCase(), sessionId, plan, paidAt, expiresAt]
  );
}

export async function getActiveAccessByEmail(email) {
  const result = await getPool().query(
    `
      SELECT
        email,
        stripe_session_id AS "sessionId",
        plan,
        paid_at AS "paidAt",
        expires_at AS "expiresAt"
      FROM paid_access
      WHERE email = $1 AND expires_at > $2
      ORDER BY expires_at DESC
      LIMIT 1
    `,
    [email.toLowerCase(), Date.now()]
  );

  return result.rows[0] || null;
}

export function getDatabaseInfo() {
  return {
    type: "postgres",
    configured: Boolean(process.env.DATABASE_URL),
    poolSize: Number(process.env.DATABASE_POOL_SIZE || 10),
  };
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
