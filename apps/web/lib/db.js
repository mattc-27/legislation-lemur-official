// modules/db/db.js
import pg from "pg";
import * as Sentry from "@sentry/nextjs"; // ⟵ add this
const { Pool } = pg;

// Use your Supabase connection string here (Project Settings → Database)
const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
  const err = new Error("Missing SUPABASE_DB_URL (or DATABASE_URL) env var");

  // This will show up early if prod is misconfigured
  Sentry.captureException(err, {
    tags: { area: "db", stage: "init" },
    extra: {
      hasSupabaseUrl: Boolean(process.env.SUPABASE_DB_URL),
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    },
  });

  throw err;
}

export const pool = new Pool({
  connectionString,
  // Supabase requires SSL from external clients
  ssl: {
    rejectUnauthorized: false,
  },
  // Optional tuning – tweak as needed
  max: 10,
  idleTimeoutMillis: 30_000,
});

// Capture unexpected idle client / pool errors
pool.on("error", (err) => {
  Sentry.captureException(err, {
    tags: { area: "db", stage: "pool" },
    extra: {
      message: err?.message,
      code: err?.code,
      severity: "pool_error",
    },
  });
});
