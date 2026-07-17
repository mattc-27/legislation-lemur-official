// modules/db/db.js
import pg from "pg";
const { Pool } = pg;

// Use your Supabase connection string here (Project Settings → Database)
const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  const err = new Error("Missing SUPABASE_DB_URL environment variable");

  // Structured log (good for Cloud Logging)
  console.error("[DB_INIT_ERROR]", {
    message: err.message,
    hasSupabaseUrl: Boolean(process.env.SUPABASE_DB_URL),
    service: process.env.K_SERVICE || null,
    revision: process.env.K_REVISION || null,
    project:
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCP_PROJECT ||
      null,
  });

  throw err;
}

export const pool = new Pool({
  connectionString,
  // Supabase requires SSL from external clients
  ssl: { rejectUnauthorized: false },

  // Optional tuning – tweak as needed
  max: 10,
  idleTimeoutMillis: 30_000,

  // Optional:
  //connectionTimeoutMillis: 5_000,  // fail faster if DB can't be reached
  //statement_timeout: 15_000,       // server-side query timeout (requires pg support via options)


});

// Capture unexpected idle client / pool errors
pool.on("error", (err) => {
  console.error("[DB_POOL_ERROR]", {
    message: err?.message,
    code: err?.code,
    severity: err?.severity,
    detail: err?.detail,
    hint: err?.hint,
    routine: err?.routine,
    schema: err?.schema,
    table: err?.table,
    column: err?.column,
    constraint: err?.constraint,
    service: process.env.K_SERVICE || null,
    revision: process.env.K_REVISION || null,
  });
});
