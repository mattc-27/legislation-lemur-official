// global-search

import "server-only";
import { q } from "@/lib/server/db/instrumented-query";

const ENTITY_TYPES = new Set(["bill", "member", "seat", "committee"]);
const SORTS = new Set(["relevance", "updated", "introduced", "latest_action"]);

function cleanText(v) {
    const s = String(v ?? "").trim();
    return s || null;
}

function cleanArray(v, allowed = null) {
    const arr = Array.isArray(v) ? v : v ? [v] : [];
    const cleaned = arr.map((x) => String(x).trim()).filter(Boolean);
    return allowed ? cleaned.filter((x) => allowed.has(x)) : cleaned;
}

function cleanLimit(v, fallback = 20) {
    const n = Number(v ?? fallback);
    return Math.min(Math.max(Number.isFinite(n) ? n : fallback, 1), 50);
}

function cleanOffset(v) {
    const n = Number(v ?? 0);
    return Math.max(Number.isFinite(n) ? n : 0, 0);
}

function normalizeInput(input = {}) {
    return {
        q: cleanText(input.q),
        entityTypes: cleanArray(input.entityTypes, ENTITY_TYPES),
        chamber: cleanText(input.chamber),
        stateCode: cleanText(input.stateCode)?.toUpperCase() ?? null,
        statusCode: cleanText(input.statusCode),
        policyAreaId: input.policyAreaId ? Number(input.policyAreaId) : null,
        hasSummary: input.hasSummary === true || input.hasSummary === "true",
        sort: SORTS.has(input.sort) ? input.sort : "relevance",
        limit: cleanLimit(input.limit),
        offset: cleanOffset(input.offset),
    };
}

function sortSql(sort) {
    if (sort === "updated") return `d.updated_at DESC NULLS LAST`;
    if (sort === "introduced") return `d.introduced_date DESC NULLS LAST`;
    if (sort === "latest_action") return `d.latest_action_date DESC NULLS LAST`;

    return `
    relevance_score DESC,
    full_rank DESC,
    entity_rank DESC,
    fuzzy_rank DESC,
    d.entity_priority DESC,
    d.updated_at DESC NULLS LAST
  `;
}

export async function searchGlobal(input = {}) {
    const filters = normalizeInput(input);

   const sql = `
  WITH params AS (
    SELECT
      $1::text AS raw_q,
      CASE
        WHEN $1::text IS NULL THEN NULL::tsquery
        ELSE websearch_to_tsquery('simple', unaccent($1::text))
      END AS tsq,
      CASE
        WHEN $1::text IS NULL THEN NULL::text
        ELSE unaccent(lower($1::text))
      END AS fuzzy_q,
      $2::text[] AS entity_types,
      $3::text AS chamber,
      $4::text AS state_code,
      $5::text AS status_code,
      $6::integer AS policy_area_id,
      $7::boolean AS has_summary
  ),
  ranked AS (
    SELECT
      d.search_document_id,
      d.entity_type,
      d.entity_id,
      d.display_title,
      d.subtitle,
      d.summary,
      d.search_headline_source,
      d.url,
      d.external_url,
      d.chamber,
      d.state_code,
      d.district,
      d.status_code,
      d.status_key,
      d.policy_area_id,
      d.policy_area_name,
      d.introduced_date,
      d.latest_action_date,
      d.has_summary,
      d.updated_at,
      d.entity_priority,
      d.metadata,
      p.tsq,

      CASE
        WHEN p.tsq IS NULL THEN 0
        ELSE ts_rank_cd(d.search_vector, p.tsq)
      END AS full_rank,

      CASE
        WHEN p.tsq IS NULL THEN 0
        ELSE ts_rank_cd(d.search_entity_vector, p.tsq)
      END AS entity_rank,

      CASE
        WHEN p.fuzzy_q IS NULL THEN 0
        ELSE similarity(d.search_text, p.fuzzy_q)
      END AS fuzzy_rank

    FROM sandbox_lemur_app_views_v1.global_search_documents_v1 d
    CROSS JOIN params p
    WHERE
      (
        p.raw_q IS NULL
        OR d.search_vector @@ p.tsq
        OR d.search_entity_vector @@ p.tsq
        OR d.search_text % p.fuzzy_q
      )
      AND (
        p.entity_types IS NULL
        OR cardinality(p.entity_types) = 0
        OR d.entity_type = ANY(p.entity_types)
      )
      AND (p.chamber IS NULL OR d.chamber = p.chamber)
      AND (p.state_code IS NULL OR d.state_code = p.state_code)
      AND (p.status_code IS NULL OR d.status_code = p.status_code)
      AND (p.policy_area_id IS NULL OR d.policy_area_id = p.policy_area_id)
      AND (p.has_summary IS FALSE OR d.has_summary IS TRUE)
  ),
  scored AS (
    SELECT
      *,
      (
        full_rank
        + (entity_rank * 0.65)
        + (fuzzy_rank * 0.35)
        + (entity_priority::numeric / 1000.0)
      ) AS relevance_score
    FROM ranked
  ),
  limited AS (
    SELECT *
    FROM scored d
    ORDER BY ${sortSql(filters.sort)}
    LIMIT $8 OFFSET $9
  )
  SELECT
    search_document_id,
    entity_type,
    entity_id,
    display_title,
    subtitle,
    summary,
    url,
    external_url,
    chamber,
    state_code,
    district,
    status_code,
    status_key,
    policy_area_id,
    policy_area_name,
    introduced_date,
    latest_action_date,
    has_summary,
    updated_at,
    entity_priority,
    metadata,
    full_rank,
    entity_rank,
    fuzzy_rank,
    relevance_score,
    CASE
      WHEN tsq IS NULL THEN NULL
      ELSE ts_headline(
        'simple',
        coalesce(search_headline_source, summary, display_title),
        tsq,
        'StartSel=<mark>, StopSel=</mark>, MaxFragments=2, MinWords=6, MaxWords=24'
      )
    END AS search_headline
  FROM limited;
`;

    const params = [
        filters.q,
        filters.entityTypes.length ? filters.entityTypes : null,
        filters.chamber,
        filters.stateCode,
        filters.statusCode,
        filters.policyAreaId,
        filters.hasSummary,
        filters.limit,
        filters.offset,
    ];

    const { rows } = await q("search:global", sql, params);

    const safeRows = rows ?? [];

    const grouped = {
        bills: [],
        members: [],
        committees: [],
        seats: [],
    };

    for (const row of safeRows) {
        if (row.entity_type === "bill") grouped.bills.push(row);
        else if (row.entity_type === "member") grouped.members.push(row);
        else if (row.entity_type === "committee") grouped.committees.push(row);
        else if (row.entity_type === "seat") grouped.seats.push(row);
    }

    return {
        filters,
        rows: safeRows,
        grouped,
    };
}


