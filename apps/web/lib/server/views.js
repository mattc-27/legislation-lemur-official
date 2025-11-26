// lib/congress.js
import "server-only";
import { pool } from "../db";
import * as Sentry from "@sentry/nextjs";
import { q, qExplain } from "../instrumented-query";

/* ------------------------------------------
Set to public schema, 11/25/2025
----
MATERAILIZED VIEWS using public schema tables 
For stage, remove the `_v1` 
--------------------------------------------- */

// tiny WHERE builder
function where(parts, params) {
  const text = parts.length ? "WHERE " + parts.join(" AND ") : "";
  return { text, params };
}



/** State-level party composition (House + Senate), shaped for the hex map. */
export async function getCongressComposition() {
  // Change schema below if you created the view in a different schema (e.g., ref.*)
  const sql = `
     SELECT
      state,
      house_counts,   -- jsonb: {"D":7,"R":5,"I":0}
      senate_counts,  -- jsonb: {"D":2,"R":0,"I":0}
      house_total,
      senate_total
    FROM mv.congress_composition_json
    ORDER BY state;
  `;
  // Ensure stable keys for the client & (optionally) filter to 50 + DC + PR
  const ALLOWED = new Set([
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
    "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM",
    "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
    "WV", "WI", "WY"
  ]);
  try {
    const { rows } = await pool.query(sql)

    // optional: keep this while debugging
    // console.log("getCongressSummary rows:", rows);
    return rows
      .filter(r => ALLOWED.has(r.state))
      .map(r => ({
        state: r.state,
        house_counts: {
          D: r.house_counts?.D ?? 0,
          R: r.house_counts?.R ?? 0,
          I: r.house_counts?.I ?? 0,
        },
        senate_counts: {
          D: r.senate_counts?.D ?? 0,
          R: r.senate_counts?.R ?? 0,
          I: r.senate_counts?.I ?? 0,
        },
        house_total: r.house_total ?? 0,
        senate_total: r.senate_total ?? 0,
      }));
  } catch (err) {
    Sentry.captureException(err, {
      tags: { helper: "getCongressComposition" },
      extra: { congress },
    });
    throw err; // rethrow so Next still returns a 500 and surfaces it
  }
}

export async function getCongressSummary(congress = 119) {
  // Change schema below if you created the view in a different schema (e.g., ref.*)
  const sql = `
     SELECT
      congress,
      house_total, house_d, house_r, house_i,
      senate_total, senate_d, senate_r, senate_i,
      updated_at
    FROM mv.congress_summary_50_v1
    WHERE congress = $1
    LIMIT 1;
  `;

  try {
    const { rows } = await pool.query(sql, [congress]);
    // optional: keep this while debugging
    // console.log("getCongressSummary rows:", rows);
    return rows[0] || null;
  } catch (err) {
    Sentry.captureException(err, {
      tags: { helper: "getCongressSummary" },
      extra: { congress },
    });
    throw err; // rethrow so Next still returns a 500 and surfaces it
  }

}


/**
 * Committees directory for a given congress with optional filters.
 * Returns parent committees with a nested `subcommittees` array.
 */
export async function getCommitteesDirectory(
  congress,
  { chamber = null, search = null } = {}
) {
  const sql = `
    SELECT
      c.congress,
      c.chamber,
      c.committee_type_code,
      c.name,
      c.system_code,
      c.url,
      c.update_dt,
      COALESCE((
        SELECT json_agg(json_build_object(
                 'name', s.subcommittee_name,
                 'system_code', s.subcommittee_system_code,
                 'url', s.subcommittee_url,
                 'update_dt', s.update_dt
               ) ORDER BY s.subcommittee_name)
        FROM public.committee_subcommittees s
        WHERE s.congress = c.congress
          AND s.parent_system_code = c.system_code
      ), '[]'::json) AS subcommittees
    FROM public.committees c
    WHERE c.congress = $1
      AND ($2::text IS NULL OR c.chamber = $2)
      AND (
        $3::text IS NULL
        OR c.name ILIKE '%' || $3 || '%'
        OR c.system_code ILIKE '%' || $3 || '%'
      )
    ORDER BY c.chamber, c.committee_type_code, c.name;
  `;
  const { rows } = await pool.query(sql, [congress, chamber, search]);
  return rows;
}

/**
 * Quick counts for header chips.
 */
export async function getCommitteeCounts(congress) {
  const sql = `
    WITH parents AS (
      SELECT congress, chamber, COUNT(*)::int AS committees
      FROM public.committees
      WHERE congress = $1
      GROUP BY 1,2
    ),
    subs AS (
      SELECT congress, chamber, COUNT(*)::int AS subcommittees
      FROM public.committee_subcommittees
      WHERE congress = $1
      GROUP BY 1,2
    )
    SELECT
      COALESCE(p.chamber, s.chamber) AS chamber,
      COALESCE(p.committees, 0)      AS committees,
      COALESCE(s.subcommittees, 0)   AS subcommittees
    FROM parents p
    FULL OUTER JOIN subs s
      ON p.congress = s.congress AND p.chamber = s.chamber
    ORDER BY chamber;
  `;
  const { rows } = await pool.query(sql, [congress]);
  const totals = rows.reduce(
    (acc, r) => {
      acc.committees += r.committees;
      acc.subcommittees += r.subcommittees;
      return acc;
    },
    { committees: 0, subcommittees: 0 }
  );
  return { byChamber: rows, totals };
}


/**
 * Fetch top-N subject trends for the current session.
 *
 * Returns:
 *   {
 *     subjects: string[],
 *     rows: { month: string, subject_name: string, bills_count: number }[]
 *   }
 * 
 *     
 * SELECT subject_name
    FROM mv.congress_subjects_trend
    WHERE congress = 119
      AND month >= 12
      
    GROUP BY subject_name
    ORDER BY SUM(bills_count) DESC
    LIMIT 8;
 */
const SESSION1_START = new Date(Date.UTC(2025, 0, 3)); // 2025-01-03
const SESSION1_END = new Date(Date.UTC(2026, 0, 3)); // 2026-01-03 (exclusive)

/**
 * timeWindow:
 *   - "session1" (default): Jan 3, 2025 → Jan 3, 2026 (exclusive)
 *   - "30d", "7d", "6mo": placeholders for future use
 */
export async function getSubjectsTrend(
  congress,
  {
    chamber = null,      // "House" | "Senate" | null
    timeWindow = "session1",
    limitSubjects = 8,
  } = {},
) {
  const now = new Date();

  let start;
  let end;

  if (timeWindow === "session1") {
    start = SESSION1_START;
    end = SESSION1_END;
  } else if (timeWindow === "30d") {
    // monthly MV, but this will just clamp to recent month(s)
    end = now;
    start = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - 30,
    ));
  } else if (timeWindow === "7d") {
    end = now;
    start = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - 7,
    ));
  } else if (timeWindow === "6mo") {
    end = now;
    start = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - 5,
      1,
    ));
  } else {
    // fallback: no date filter
    start = null;
    end = null;
  }

  // 1) Get the top subject names for the window
  const topSql = `
    SELECT subject_name
    FROM mv.congress_subjects_trend_v1
    WHERE congress = $1
      AND ($2::date IS NULL OR month >= $2::date)
      AND ($3::date IS NULL OR month <  $3::date)
      AND ($4::text IS NULL OR chamber = $4)
    GROUP BY subject_name
    ORDER BY SUM(bills_count) DESC
    LIMIT $5;
  `;

  const { rows: subjectRows } = await q(
    "subjectsTrend:getTopSubjects",
    topSql,
    [congress, start, end, chamber, limitSubjects],
  );

  const subjects = subjectRows.map(r => r.subject_name);
  if (!subjects.length) return { subjects: [], rows: [] };

  // 2) Fetch monthly data for those subjects
  const dataSql = `
    SELECT
      month,
      subject_name,
      bills_count
    FROM mv.congress_subjects_trend_v1
    WHERE congress = $1
      AND ($2::date IS NULL OR month >= $2::date)
      AND ($3::date IS NULL OR month <  $3::date)
      AND ($4::text IS NULL OR chamber = $4)
      AND subject_name = ANY($5::text[])
    ORDER BY month ASC, subject_name ASC;
  `;

  const { rows } = await q(
    "subjectsTrend:getRows",
    dataSql,
    [congress, start, end, chamber, subjects],
  );

  return { subjects, rows };
}
