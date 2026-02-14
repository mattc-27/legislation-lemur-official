// lib/server/bills/index.js
import "server-only";
import { pool } from "@/lib/server/db/db";
import { q } from "@/lib/server/db/instrumented-query";
import { ACTIVE_VIEW_SCHEMA, ACTIVE_DATA_SCHEMA, REF_SCHEMA } from "@/lib/server/db/schemas";

/** congress */
export async function getCurrentCongress() {
  const { rows } = await pool.query(
    `SELECT MAX(congress)::int AS c FROM ${ACTIVE_DATA_SCHEMA}.bills_meta;`
  );
  return rows[0]?.c || null;
}

/** directory */

export async function getBillsDirectoryV2(
  congress,
  {
    q: query = null,
    chamber = null,
    subject = null,
    from = null,
    to = null,
    minCos = 0,
    sort = "latest_action",
    limit = 25,
    offset = 0,

    // ✅ new
    policyAreaId = null,
    statusId = null,
    type = null,
    committeeCodes = null, // array of codes
  } = {}
) {
  if (!congress) congress = await getCurrentCongress();

  const order =
    sort === "introduced"
      ? `introduced_date DESC NULLS LAST, bill_id`
      : sort === "cosponsors"
        ? `cosponsors_total DESC NULLS LAST, bill_id`
        : `latest_action_date DESC NULLS LAST, bill_id`;

  const sql = `
    WITH base AS (
      SELECT *
      FROM ${ACTIVE_VIEW_SCHEMA}.bill_search_index
      WHERE
        congress = $1

        AND ($2::text IS NULL OR origin_chamber = $2)
        AND ($3::date IS NULL OR introduced_date >= $3::date)
        AND ($4::date IS NULL OR introduced_date <= $4::date)

        -- ✅ choose your meaning of "minCos"
        AND (COALESCE(cosponsors_total, 0) >= $5::int)

        AND ($6::bigint IS NULL OR policy_area_id = $6::bigint)
        AND ($7::bigint IS NULL OR status_id = $7::bigint)
        AND ($8::text   IS NULL OR bill_type = lower($8::text))

        AND ($9::text[] IS NULL OR committee_codes && $9::text[])

        AND (
          $10::text IS NULL
          OR tsv @@ websearch_to_tsquery('simple', $10)
          OR title ILIKE '%' || $10 || '%'
          OR latest_action_text ILIKE '%' || $10 || '%'
          OR display_title ILIKE '%' || $10 || '%'
        )

        AND (
          $11::text IS NULL
          OR EXISTS (
            SELECT 1
            FROM unnest(subjects) s(subject_name)
            WHERE s.subject_name ILIKE '%' || $11 || '%'
          )
        )
    )
    SELECT
      base.*,
      base.cosponsors_total AS cosponsor_count,   -- ✅ UI expects r.cosponsor_count
      COUNT(*) OVER() AS total_count
    FROM base
    ORDER BY ${order}
    LIMIT $12 OFFSET $13;
  `;

  const params = [
    congress,
    chamber,
    from,
    to,
    minCos,

    policyAreaId,
    statusId,
    type,
    committeeCodes,

    query,
    subject,

    limit,
    offset,
  ];

  const { rows } = await q("bills:directory:v2", sql, params);
  const total = rows.length ? Number(rows[0].total_count) : 0;

  return { rows, total, congress };
}

/** filter dictionaries */
export async function getBillsFilterOptionsV2() {
  const [policyAreas, statuses, types, committees] = await Promise.all([
    q("bills:filters:policyAreas", `
      SELECT policy_area_id, policy_area_name, policy_area_slug
      FROM ${REF_SCHEMA}.dim_policy_area
      WHERE is_active = true
      ORDER BY sort_order, policy_area_name;
    `),

    q("bills:filters:statuses", `
      SELECT status_id, status_key, status_label
      FROM ${REF_SCHEMA}.dim_bill_status_canon
      WHERE is_active = true
      ORDER BY sort_order, status_label;
    `),

    q("bills:filters:types", `
      SELECT bill_type, COUNT(*)::int AS bill_count
      FROM ${ACTIVE_VIEW_SCHEMA}.bill_search_index
      GROUP BY 1
      ORDER BY bill_count DESC, bill_type;
    `),

    q("bills:filters:committees", `
      SELECT committee_system_code, committee_name, COUNT(DISTINCT bill_id)::int AS bill_count
      FROM ${ACTIVE_DATA_SCHEMA}.bill_committees
      GROUP BY 1,2
      ORDER BY bill_count DESC, committee_name;
    `),
  ]);

  return {
    policyAreas: policyAreas.rows ?? [],
    statuses: statuses.rows ?? [],
    types: types.rows ?? [],
    committees: committees.rows ?? [],
  };
}

/** facet counts */
export async function getBillsFacetCountsV2({
  congress,
  chamber = null,
  from = null,
  to = null,
  minCos = 0,
  q: query = null,
  subject = null,

  policyAreaId = null,
  statusId = null,
  type = null,
  committeeCodes = null,
} = {}) {
  // IMPORTANT: congress should be required for consistent UX
  // If you want, default it like you do elsewhere.

  const baseWhere = `
    congress = $1
    AND ($2::text IS NULL OR origin_chamber = $2)
    AND ($3::date IS NULL OR introduced_date >= $3::date)
    AND ($4::date IS NULL OR introduced_date <= $4::date)
    AND (COALESCE(cosponsors_total, 0) >= $5::int)
    AND (
      $6::text IS NULL
      OR tsv @@ websearch_to_tsquery('simple', $6)
      OR title ILIKE '%' || $6 || '%'
      OR latest_action_text ILIKE '%' || $6 || '%'
      OR display_title ILIKE '%' || $6 || '%'
    )
    AND (
      $7::text IS NULL
      OR EXISTS (
        SELECT 1
        FROM unnest(subjects) s(subject_name)
        WHERE s.subject_name ILIKE '%' || $7 || '%'
      )
    )
  `;

  const commonParams = [congress, chamber, from, to, minCos, query, subject];

  // Policy area counts (exclude policyAreaId filter)
  const policySql = `
    WITH base AS (
      SELECT policy_area_id
      FROM ${ACTIVE_VIEW_SCHEMA}.bill_search_index
      WHERE ${baseWhere}
        AND ($8::bigint IS NULL OR status_id = $8::bigint)
        AND ($9::text   IS NULL OR bill_type = lower($9::text))
        AND ($10::text[] IS NULL OR committee_codes && $10::text[])
    )
    SELECT policy_area_id, COUNT(*)::int AS bill_count
    FROM base
    GROUP BY 1
    ORDER BY bill_count DESC;
  `;

  // Status counts (exclude statusId filter)
  const statusSql = `
    WITH base AS (
      SELECT status_id
      FROM ${ACTIVE_VIEW_SCHEMA}.bill_search_index
      WHERE ${baseWhere}
        AND ($8::bigint IS NULL OR policy_area_id = $8::bigint)
        AND ($9::text   IS NULL OR bill_type = lower($9::text))
        AND ($10::text[] IS NULL OR committee_codes && $10::text[])
    )
    SELECT status_id, COUNT(*)::int AS bill_count
    FROM base
    GROUP BY 1
    ORDER BY bill_count DESC;
  `;

  // Committee counts (exclude committeeCodes filter)
  const committeeSql = `
    WITH base AS (
      SELECT committee_codes
      FROM ${ACTIVE_VIEW_SCHEMA}.bill_search_index
      WHERE ${baseWhere}
        AND ($8::bigint IS NULL OR policy_area_id = $8::bigint)
        AND ($9::bigint IS NULL OR status_id = $9::bigint)
        AND ($10::text   IS NULL OR bill_type = lower($10::text))
    ),
    flat AS (
      SELECT unnest(committee_codes) AS committee_system_code
      FROM base
    )
    SELECT committee_system_code, COUNT(*)::int AS bill_count
    FROM flat
    GROUP BY 1
    ORDER BY bill_count DESC;
  `;

  const [policyRes, statusRes, committeeRes] = await Promise.all([
    q("bills:facets:policy", policySql, [...commonParams, statusId, type, committeeCodes]),
    q("bills:facets:status", statusSql, [...commonParams, policyAreaId, type, committeeCodes]),
    q("bills:facets:committee", committeeSql, [...commonParams, policyAreaId, statusId, type]),
  ]);

  return {
    policyAreas: policyRes.rows ?? [],
    statuses: statusRes.rows ?? [],
    committees: committeeRes.rows ?? [],
  };
}

/** autocomplete */

export async function autocompleteCommittees(prefix) {
  const sql = `
    SELECT committee_system_code, committee_name, COUNT(DISTINCT bill_id)::int AS bill_count
    FROM ${ACTIVE_DATA_SCHEMA}.bill_committees
    WHERE committee_name ILIKE ($1 || '%')
    GROUP BY 1,2
    ORDER BY bill_count DESC, committee_name
    LIMIT 20;
  `;
  const { rows } = await q("bills:auto:committees", sql, [prefix || ""]);
  return rows ?? [];
}

export async function autocompleteSubjects(prefix) {
  const sql = `
    WITH flat AS (
      SELECT unnest(subjects) AS subject
      FROM ${ACTIVE_VIEW_SCHEMA}.bill_search_index
    ),
    agg AS (
      SELECT subject, COUNT(*)::int AS bill_count
      FROM flat
      GROUP BY 1
    )
    SELECT subject, bill_count
    FROM agg
    WHERE subject ILIKE ($1 || '%')
    ORDER BY bill_count DESC, subject
    LIMIT 20;
  `;
  const { rows } = await q("bills:auto:subjects", sql, [prefix || ""]);
  return rows ?? [];
}


export async function autocompleteBillsQuery(prefix, { limit = 12 } = {}) {
  const qraw = (prefix || "").trim();
  if (!qraw) return [];

  // bill code recognition: "hr 1531", "H.R.1531", "s42"
  const cleaned = qraw.toLowerCase().replace(/\./g, "").trim();
  const m = cleaned.match(/^(hr|hres|hconres|hjres|s|sres|sconres|sjres)\s*(\d+)$/i);

  if (m) {
    const billType = m[1].toLowerCase();
    const billNumber = m[2];

    const sql = `
      SELECT bill_id, congress, bill_type, bill_number, display_title, latest_action_text, latest_action_date
      FROM ${ACTIVE_VIEW_SCHEMA}.bill_search_index
      WHERE lower(bill_type) = $1 AND bill_number = $2
      ORDER BY congress DESC
      LIMIT $3;
    `;
    const { rows } = await q("bills:auto:q:billcode", sql, [billType, billNumber, limit]);
    return rows ?? [];
  }

  const sql = `
    SELECT bill_id, congress, bill_type, bill_number, display_title, latest_action_text, latest_action_date
    FROM ${ACTIVE_VIEW_SCHEMA}.bill_search_index
    WHERE
      display_title ILIKE ($1 || '%')
      OR title ILIKE ($1 || '%')
      OR latest_action_text ILIKE ('%' || $1 || '%')
    ORDER BY latest_action_date DESC NULLS LAST
    LIMIT $2;
  `;
  const { rows } = await q("bills:auto:q:search", sql, [qraw, limit]);
  return rows ?? [];
}
