// lib/server/bills/index.js
import "server-only";
import { pool } from "@/lib/server/db/db";
import { q } from "@/lib/server/db/instrumented-query";
import { ACTIVE_VIEW_SCHEMA, ACTIVE_DATA_SCHEMA, REF_SCHEMA } from "@/lib/server/db/schemas";
import { perfLog } from "@/lib/server/debug/perf";

const BILL_SEARCH_INDEX = "bill_search_index_v2";
const BILL_METRICS = "mv_bill_metrics_v2";
const BILL_CARD_DETAIL = "v_bill_card_detail_v1";

const ALLOWED_BILL_SORTS = new Set([
  "latest_action",
  "introduced",
  "cosponsors",
  "impact",
  "trending",
]);

function normalizeText(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s ? s : null;
}

function normalizeNum(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeBool(v) {
  return v === true || v === "true" || v === "1" || v === "on";
}

function normalizeTextArray(v, { lower = false } = {}) {
  if (v == null) return null;

  let arr = [];
  if (Array.isArray(v)) arr = v;
  else if (typeof v === "string" && v.includes(",")) {
    arr = v.split(",").map((s) => s.trim());
  } else {
    arr = [v];
  }

  const cleaned = arr
    .map((x) => String(x).trim())
    .filter(Boolean)
    .map((x) => (lower ? x.toLowerCase() : x));

  return cleaned.length ? cleaned : null;
}

function normalizeLimit(v, fallback = 25) {
  const n = normalizeNum(v) ?? fallback;
  return Math.min(Math.max(n, 1), 100);
}

function normalizeOffset(v) {
  return Math.max(0, normalizeNum(v) ?? 0);
}

async function timedQuery(label, sql, params = [], meta = {}) {
  const start = performance.now();

  try {
    const res = await q(label, sql, params);

    perfLog(`${label}: ${Math.round(performance.now() - start)}ms`, {
      rowCount: res?.rows?.length ?? 0,
      ...meta,
    });

    return res;
  } catch (err) {
    perfLog(`${label}:error:${Math.round(performance.now() - start)}ms`, {
      message: err?.message,
      code: err?.code,
      ...meta,
    });

    throw err;
  }
}

export async function getCurrentCongress() {
  const { rows } = await pool.query(
    `SELECT MAX(congress)::int AS c FROM ${ACTIVE_DATA_SCHEMA}.bills_meta;`
  );
  return rows[0]?.c ?? null;
}

async function resolveCongress(congress) {
  const c = normalizeNum(congress);
  return c ?? (await getCurrentCongress());
}

function buildBillsWhere(alias = "b") {
  return `
    ${alias}.congress = $1
    AND ($2::text IS NULL OR ${alias}.origin_chamber = $2)
    AND ($3::date IS NULL OR ${alias}.introduced_date >= $3::date)
    AND ($4::date IS NULL OR ${alias}.introduced_date <= $4::date)
    AND ($5::int <= 0 OR COALESCE(${alias}.cosponsors_total, 0) >= $5::int)

    AND ($6::bigint IS NULL OR ${alias}.policy_area_id = $6::bigint)
    AND ($7::bigint IS NULL OR ${alias}.status_id = $7::bigint)

    AND ($8::text[] IS NULL OR ${alias}.bill_type = ANY($8::text[]))
    AND ($9::text[] IS NULL OR ${alias}.committee_codes && $9::text[])

    AND (
      $10::text IS NULL
      OR ${alias}.tsv @@ websearch_to_tsquery('simple', $10)
      OR ${alias}.summary_tsv @@ websearch_to_tsquery('simple', $10)
      OR ${alias}.title ILIKE '%' || $10 || '%'
      OR ${alias}.latest_action_text ILIKE '%' || $10 || '%'
      OR ${alias}.display_title ILIKE '%' || $10 || '%'
      OR ${alias}.summary_short ILIKE '%' || $10 || '%'
      OR ${alias}.summary_text_plain ILIKE '%' || $10 || '%'
    )

    AND (
      $11::text IS NULL
      OR EXISTS (
        SELECT 1
        FROM unnest(${alias}.subjects) s(subject_name)
        WHERE s.subject_name ILIKE '%' || $11 || '%'
      )
    )

    AND ($12::boolean IS FALSE OR COALESCE(${alias}.has_ai_summary, false) IS TRUE)
  `;
}

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

    policyAreaId = null,
    statusId = null,
    type = null,
    committeeCodes = null,
    hasSummary = false,
  } = {}
) {
  const c = await resolveCongress(congress);

  const chamberNorm = normalizeText(chamber);
  const queryNorm = normalizeText(query);
  const subjectNorm = normalizeText(subject);

  const policyAreaIdNum = normalizeNum(policyAreaId);
  const statusIdNum = normalizeNum(statusId);

  const typeArr = normalizeTextArray(type, { lower: true });
  const committeeArr = normalizeTextArray(committeeCodes, { lower: false });
  const hasSummaryBool = normalizeBool(hasSummary);

  const safeLimit = normalizeLimit(limit, 25);
  const safeOffset = normalizeOffset(offset);

  const sortNorm = normalizeText(sort) || "latest_action";
  const safeSort = ALLOWED_BILL_SORTS.has(sortNorm) ? sortNorm : "latest_action";

  const params = [
    c,
    chamberNorm,
    from,
    to,
    Number(minCos) || 0,
    policyAreaIdNum,
    statusIdNum,
    typeArr,
    committeeArr,
    queryNorm,
    subjectNorm,
    hasSummaryBool,
  ];

  const countSql = `
    SELECT COUNT(*)::int AS total_count
    FROM ${ACTIVE_VIEW_SCHEMA}.${BILL_SEARCH_INDEX} b
    WHERE ${buildBillsWhere("b")};
  `;

  const needsMetricsForSort = safeSort === "impact" || safeSort === "trending";

  const nonMetricOrder =
    safeSort === "introduced"
      ? `b.introduced_date DESC NULLS LAST, b.bill_id`
      : safeSort === "cosponsors"
        ? `b.cosponsors_total DESC NULLS LAST, b.bill_id`
        : `b.latest_action_date DESC NULLS LAST, b.bill_id`;

  const metricOrder =
    safeSort === "impact"
      ? `m.impact_score DESC NULLS LAST, b.bill_id`
      : `m.trending_score DESC NULLS LAST, b.bill_id`;

  const rowsSql = needsMetricsForSort
    ? `
      WITH page_ids AS (
        SELECT
          b.bill_id,
          m.impact_score,
          m.trending_score
        FROM ${ACTIVE_VIEW_SCHEMA}.${BILL_SEARCH_INDEX} b
        LEFT JOIN ${ACTIVE_VIEW_SCHEMA}.${BILL_METRICS} m
          USING (bill_id)
        WHERE ${buildBillsWhere("b")}
        ORDER BY ${metricOrder}
        LIMIT $13 OFFSET $14
      )
      SELECT
        b.*,
        b.cosponsors_total AS cosponsor_count,
        COALESCE(b.has_ai_summary, false) AS has_ai_summary,
        NULLIF(b.summary_short, '') AS summary_short,
        NULLIF(b.summary_text_plain, '') AS summary_text_plain,
        COALESCE(b.key_actions, '[]'::jsonb) AS key_actions,
        p.impact_score,
        p.trending_score
      FROM page_ids p
      JOIN ${ACTIVE_VIEW_SCHEMA}.${BILL_SEARCH_INDEX} b
        USING (bill_id)
      ORDER BY ${safeSort === "impact"
      ? `p.impact_score DESC NULLS LAST, b.bill_id`
      : `p.trending_score DESC NULLS LAST, b.bill_id`
    };
    `
    : `
      WITH page AS (
        SELECT b.*
        FROM ${ACTIVE_VIEW_SCHEMA}.${BILL_SEARCH_INDEX} b
        WHERE ${buildBillsWhere("b")}
        ORDER BY ${nonMetricOrder}
        LIMIT $13 OFFSET $14
      )
      SELECT
        p.*,
        p.cosponsors_total AS cosponsor_count,
        COALESCE(p.has_ai_summary, false) AS has_ai_summary,
        NULLIF(p.summary_short, '') AS summary_short,
        NULLIF(p.summary_text_plain, '') AS summary_text_plain,
        COALESCE(p.key_actions, '[]'::jsonb) AS key_actions,
        m.impact_score,
        m.trending_score
      FROM page p
      LEFT JOIN ${ACTIVE_VIEW_SCHEMA}.${BILL_METRICS} m
        USING (bill_id)
      ORDER BY ${safeSort === "introduced"
      ? `p.introduced_date DESC NULLS LAST, p.bill_id`
      : safeSort === "cosponsors"
        ? `p.cosponsors_total DESC NULLS LAST, p.bill_id`
        : `p.latest_action_date DESC NULLS LAST, p.bill_id`
    };
    `;

  const [rowsRes, countRes] = await Promise.all([
    timedQuery("bills:directory:v2:rows", rowsSql, [...params, safeLimit, safeOffset], {
      congress: c,
      sort: safeSort,
      limit: safeLimit,
      offset: safeOffset,
    }),
    timedQuery("bills:directory:v2:count", countSql, params, {
      congress: c,
      sort: safeSort,
    }),
  ]);

  const total = Number(countRes.rows?.[0]?.total_count ?? 0);

  const rows = (rowsRes.rows ?? []).map((r) => ({
    ...r,
    total_count: total,
  }));

  return { rows, total, congress: c };
}

export async function getBillsFilterOptionsV2(congress = null) {
  const c = await resolveCongress(congress);

  const [policyAreas, statuses, types, committees] = await Promise.all([
    timedQuery("bills:filters:policyAreas", `
      SELECT policy_area_id, policy_area_name, policy_area_slug
      FROM ${REF_SCHEMA}.dim_policy_area
      WHERE is_active = true
      ORDER BY sort_order, policy_area_name;
    `),

    timedQuery("bills:filters:statuses", `
      SELECT status_id, status_key, status_label
      FROM ${REF_SCHEMA}.dim_bill_status_canon
      WHERE is_active = true
      ORDER BY sort_order, status_label;
    `),

    timedQuery("bills:filters:types", `
      SELECT bill_type, COUNT(*)::int AS bill_count
      FROM ${ACTIVE_VIEW_SCHEMA}.${BILL_SEARCH_INDEX}
      WHERE congress = $1
      GROUP BY 1
      ORDER BY bill_count DESC, bill_type;
    `, [c], { congress: c }),

    timedQuery("bills:filters:committees", `
      SELECT committee_system_code, committee_name, COUNT(DISTINCT bill_id)::int AS bill_count
      FROM ${ACTIVE_DATA_SCHEMA}.bill_committees
      GROUP BY 1,2
      ORDER BY bill_count DESC, committee_name;
    `),
  ]);

  return {
    congress: c,
    policyAreas: policyAreas.rows ?? [],
    statuses: statuses.rows ?? [],
    types: types.rows ?? [],
    committees: committees.rows ?? [],
  };
}

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
  hasSummary = false,
} = {}) {
  const c = await resolveCongress(congress);

  const chamberNorm = normalizeText(chamber);
  const queryNorm = normalizeText(query);
  const subjectNorm = normalizeText(subject);

  const policyAreaIdNum = normalizeNum(policyAreaId);
  const statusIdNum = normalizeNum(statusId);

  const typeArr = normalizeTextArray(type, { lower: true });
  const committeeArr = normalizeTextArray(committeeCodes, { lower: false });
  const hasSummaryBool = normalizeBool(hasSummary);

  const baseWhere = `
    congress = $1
    AND ($2::text IS NULL OR origin_chamber = $2)
    AND ($3::date IS NULL OR introduced_date >= $3::date)
    AND ($4::date IS NULL OR introduced_date <= $4::date)
    AND ($5::int <= 0 OR COALESCE(cosponsors_total, 0) >= $5::int)
    AND (
      $6::text IS NULL
      OR tsv @@ websearch_to_tsquery('simple', $6)
      OR summary_tsv @@ websearch_to_tsquery('simple', $6)
      OR title ILIKE '%' || $6 || '%'
      OR latest_action_text ILIKE '%' || $6 || '%'
      OR display_title ILIKE '%' || $6 || '%'
      OR summary_short ILIKE '%' || $6 || '%'
      OR summary_text_plain ILIKE '%' || $6 || '%'
    )
    AND (
      $7::text IS NULL
      OR EXISTS (
        SELECT 1
        FROM unnest(subjects) s(subject_name)
        WHERE s.subject_name ILIKE '%' || $7 || '%'
      )
    )
    AND ($11::boolean IS FALSE OR COALESCE(has_ai_summary, false) IS TRUE)
  `;

  const commonParams = [
    c,
    chamberNorm,
    from,
    to,
    Number(minCos) || 0,
    queryNorm,
    subjectNorm,
  ];

  const policySql = `
    WITH base AS (
      SELECT policy_area_id
      FROM ${ACTIVE_VIEW_SCHEMA}.${BILL_SEARCH_INDEX}
      WHERE ${baseWhere}
        AND ($8::bigint IS NULL OR status_id = $8::bigint)
        AND ($9::text[] IS NULL OR bill_type = ANY($9::text[]))
        AND ($10::text[] IS NULL OR committee_codes && $10::text[])
    )
    SELECT policy_area_id, COUNT(*)::int AS bill_count
    FROM base
    WHERE policy_area_id IS NOT NULL
    GROUP BY 1
    ORDER BY bill_count DESC;
  `;

  const statusSql = `
    WITH base AS (
      SELECT status_id
      FROM ${ACTIVE_VIEW_SCHEMA}.${BILL_SEARCH_INDEX}
      WHERE ${baseWhere}
        AND ($8::bigint IS NULL OR policy_area_id = $8::bigint)
        AND ($9::text[] IS NULL OR bill_type = ANY($9::text[]))
        AND ($10::text[] IS NULL OR committee_codes && $10::text[])
    )
    SELECT status_id, COUNT(*)::int AS bill_count
    FROM base
    WHERE status_id IS NOT NULL
    GROUP BY 1
    ORDER BY bill_count DESC;
  `;

  const committeeSql = `
    WITH base AS (
      SELECT committee_codes
      FROM ${ACTIVE_VIEW_SCHEMA}.${BILL_SEARCH_INDEX}
      WHERE ${baseWhere}
        AND ($8::bigint IS NULL OR policy_area_id = $8::bigint)
        AND ($9::bigint IS NULL OR status_id = $9::bigint)
        AND ($10::text[] IS NULL OR bill_type = ANY($10::text[]))
    ),
    flat AS (
      SELECT unnest(committee_codes) AS committee_system_code
      FROM base
    )
    SELECT committee_system_code, COUNT(*)::int AS bill_count
    FROM flat
    WHERE committee_system_code IS NOT NULL
      AND committee_system_code <> ''
    GROUP BY 1
    ORDER BY bill_count DESC;
  `;

  const [policyRes, statusRes, committeeRes] = await Promise.all([
    timedQuery("bills:facets:policy", policySql, [
      ...commonParams,
      statusIdNum,
      typeArr,
      committeeArr,
      hasSummaryBool,
    ]),
    timedQuery("bills:facets:status", statusSql, [
      ...commonParams,
      policyAreaIdNum,
      typeArr,
      committeeArr,
      hasSummaryBool,
    ]),
    timedQuery("bills:facets:committee", committeeSql, [
      ...commonParams,
      policyAreaIdNum,
      statusIdNum,
      typeArr,
      hasSummaryBool,
    ]),
  ]);

  return {
    congress: c,
    policyAreas: policyRes.rows ?? [],
    statuses: statusRes.rows ?? [],
    committees: committeeRes.rows ?? [],
  };
}

export async function autocompleteCommittees(prefix) {
  const p = normalizeText(prefix) || "";

  const sql = `
    SELECT committee_system_code, committee_name, COUNT(DISTINCT bill_id)::int AS bill_count
    FROM ${ACTIVE_DATA_SCHEMA}.bill_committees
    WHERE committee_name ILIKE ($1 || '%')
    GROUP BY 1,2
    ORDER BY bill_count DESC, committee_name;
    LIMIT 20;
  `;

  const { rows } = await timedQuery("bills:auto:committees", sql, [p], {
    prefix: p,
  });

  return rows ?? [];
}

export async function autocompleteSubjects(prefix) {
  const p = normalizeText(prefix) || "";

  const sql = `
    SELECT subject_name AS subject, COUNT(DISTINCT bill_id)::int AS bill_count
    FROM ${ACTIVE_DATA_SCHEMA}.bill_subjects
    WHERE subject_name ILIKE ($1 || '%')
    GROUP BY subject_name
    ORDER BY bill_count DESC, subject_name
    LIMIT 20;
  `;

  const { rows } = await timedQuery("bills:auto:subjects", sql, [p], {
    prefix: p,
  });

  return rows ?? [];
}

export async function autocompleteBillsQuery(prefix, { limit = 12 } = {}) {
  const qraw = normalizeText(prefix);
  if (!qraw) return [];

  const safeLimit = normalizeLimit(limit, 12);
  const cleaned = qraw.toLowerCase().replace(/\./g, "").trim();
  const m = cleaned.match(/^(hr|hres|hconres|hjres|s|sres|sconres|sjres)\s*(\d+)$/i);

  if (m) {
    const billType = m[1].toLowerCase();
    const billNumber = m[2];

    const sql = `
      SELECT
        bill_id,
        congress,
        bill_type,
        bill_number,
        display_title,
        latest_action_text,
        latest_action_date,
        COALESCE(has_ai_summary, false) AS has_ai_summary,
        NULLIF(summary_short, '') AS summary_short,
        NULLIF(summary_text_plain, '') AS summary_text_plain,
        COALESCE(key_actions, '[]'::jsonb) AS key_actions
      FROM ${ACTIVE_VIEW_SCHEMA}.${BILL_SEARCH_INDEX}
      WHERE bill_type = $1
        AND bill_number = $2
      ORDER BY congress DESC
      LIMIT $3;
    `;

    const { rows } = await timedQuery(
      "bills:auto:q:billcode",
      sql,
      [billType, billNumber, safeLimit],
      { billType, billNumber, limit: safeLimit }
    );

    return rows ?? [];
  }

  const sql = `
    SELECT
      bill_id,
      congress,
      bill_type,
      bill_number,
      display_title,
      latest_action_text,
      latest_action_date,
      COALESCE(has_ai_summary, false) AS has_ai_summary,
      NULLIF(summary_short, '') AS summary_short,
      NULLIF(summary_text_plain, '') AS summary_text_plain,
      COALESCE(key_actions, '[]'::jsonb) AS key_actions
    FROM ${ACTIVE_VIEW_SCHEMA}.${BILL_SEARCH_INDEX}
    WHERE
      display_title ILIKE ($1 || '%')
      OR title ILIKE ($1 || '%')
      OR latest_action_text ILIKE ('%' || $1 || '%')
      OR summary_short ILIKE ('%' || $1 || '%')
      OR summary_text_plain ILIKE ('%' || $1 || '%')
      OR tsv @@ websearch_to_tsquery('simple', $1)
      OR summary_tsv @@ websearch_to_tsquery('simple', $1)
    ORDER BY latest_action_date DESC NULLS LAST
    LIMIT $2;
  `;

  const { rows } = await timedQuery("bills:auto:q:search", sql, [qraw, safeLimit], {
    query: qraw,
    limit: safeLimit,
  });

  return rows ?? [];
}

export async function getBillPanelDetail({
  billId = null,
  type = null,
  number = null,
  congress = null,
} = {}) {
  const totalStart = performance.now();

  const billIdNorm = normalizeText(billId)?.toLowerCase();
  const typeNorm = normalizeText(type)?.toLowerCase();
  const numberNorm = normalizeText(number);
  const congressNorm = normalizeNum(congress);

  if (billIdNorm) {
    const sql = `
      SELECT *
      FROM ${ACTIVE_VIEW_SCHEMA}.${BILL_CARD_DETAIL} b
      WHERE b.bill_id = $1::text
      LIMIT 1;
    `;

    const { rows } = await timedQuery(
      "bill:panelDetail:v1:byBillId",
      sql,
      [billIdNorm],
      { billId: billIdNorm }
    );

    perfLog(`billRoute:getBillPanelDetail:total: ${Math.round(performance.now() - totalStart)}ms`, {
      billId: billIdNorm,
      found: Boolean(rows?.[0]),
    });

    return rows?.[0] ?? null;
  }

  const sql = `
    SELECT *
    FROM ${ACTIVE_VIEW_SCHEMA}.${BILL_CARD_DETAIL} b
    WHERE b.bill_type::text = $1::text
      AND b.bill_number::text = $2::text
      AND b.congress::int = $3::int
    LIMIT 1;
  `;

  const { rows } = await timedQuery(
    "bill:panelDetail:v1:byParts",
    sql,
    [typeNorm, numberNorm, congressNorm],
    {
      type: typeNorm,
      number: numberNorm,
      congress: congressNorm,
    }
  );

  perfLog(`billRoute:getBillPanelDetail:total: ${Math.round(performance.now() - totalStart)}ms`, {
    billId: billIdNorm,
    found: Boolean(rows?.[0]),
  });

  return rows?.[0] ?? null;
}