// lib/server/view/committees.js
// lib/congress.js
import "server-only";
import { pool } from "../db/db";
import { q } from "../db/instrumented-query";

const ACTIVE_VIEW_SCHEMA = 'sandbox_lemur_app_views_v1'
const ACTIVE_DATA_SCHEMA = 'sandbox_public_v2'

/* ------------------------------------------
Set to public schema, 11/25/2025
----
MATERAILIZED VIEWS using public schema tables 
For stage, remove the `_v1` 
--------------------------------------------- */
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
        FROM sandbox_public_v2.committee_subcommittees s
        WHERE s.congress = c.congress
          AND s.parent_system_code = c.system_code
      ), '[]'::json) AS subcommittees
    FROM sandbox_public_v2.committees c
    WHERE c.congress = $1
      AND ($2::text IS NULL OR c.chamber = $2)
      AND (
        $3::text IS NULL
        OR c.name ILIKE '%' || $3 || '%'
        OR c.system_code ILIKE '%' || $3 || '%'
      )
    ORDER BY c.chamber, c.committee_type_code, c.name;
  `;

    const { rows } = await q("committees:directory", sql, [congress, chamber, search])
    return rows;
}

/**
 * Quick counts for header chips.
 */
export async function getCommitteeCounts(congress) {
    const sql = `
    WITH parents AS (
      SELECT congress, chamber, COUNT(*)::int AS committees
      FROM sandbox_public_v2.committees
      WHERE congress = $1
      GROUP BY 1,2
    ),
    subs AS (
      SELECT congress, chamber, COUNT(*)::int AS subcommittees
      FROM sandbox_public_v2.committee_subcommittees
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

    const { rows } = await q("committee:counts", sql, [congress])

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