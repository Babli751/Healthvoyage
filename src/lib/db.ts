import { Pool, type QueryResultRow } from "pg";

// One shared pool. Reused across hot-reloads in dev so we don't leak connections.
const globalForPg = globalThis as unknown as { pgPool?: Pool };

const connectionString = process.env.DATABASE_URL;

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString,
    // Cloud Postgres (Neon/Supabase/Vercel) needs SSL; local does not.
    ssl: connectionString && !connectionString.includes("localhost")
      ? { rejectUnauthorized: false }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;

// Small typed query helper.
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const res = await pool.query<T>(text, params as never);
  return res.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
