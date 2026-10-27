// One-shot: create schema + seed on the DATABASE_URL in env.
// Run against your CLOUD database after deploy:
//   DATABASE_URL="postgres://..." npx tsx db/migrate.ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";
import { execSync } from "node:child_process";

function loadEnv() {
  if (process.env.DATABASE_URL) return;
  try {
    const env = readFileSync(join(process.cwd(), ".env"), "utf8");
    for (const line of env.split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (m) process.env[m[1]] = m[2];
    }
  } catch {
    /* ignore */
  }
}
loadEnv();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set.");
    process.exit(1);
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Cloud providers (Neon/Supabase/Vercel) require SSL.
    ssl: process.env.DATABASE_URL.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });

  const schema = readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8");
  console.log("Applying schema…");
  await pool.query(schema);

  // Ensure inquiries table (schema.sql already includes it via IF NOT EXISTS).
  console.log("Schema applied.");
  await pool.end();

  console.log("Seeding…");
  execSync("npx tsx db/seed.ts", { stdio: "inherit", env: process.env });
  console.log("Migration complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
