// apps/web/lib/server/search/searchPreview.js
import "server-only";
import { q } from "@/lib/server/db/instrumented-query";

const ENTITY_TYPES = new Set(["bill", "member", "seat", "committee"]);

function cleanText(v) {
    const s = String(v ?? "").trim();
    return s || null;
}

function cleanArray(v, allowed = null) {
    const arr = Array.isArray(v) ? v : v ? [v] : [];
    const cleaned = arr.map((x) => String(x).trim()).filter(Boolean);
    return allowed ? cleaned.filter((x) => allowed.has(x)) : cleaned;
}

function cleanLimit(v, fallback = 6) {
    const n = Number(v ?? fallback);
    return Math.min(Math.max(Number.isFinite(n) ? n : fallback, 1), 12);
}

export async function searchPreview(input = {}) {
    const filters = {
        q: cleanText(input.q),
        entityTypes: cleanArray(input.entityTypes, ENTITY_TYPES),
        limit: cleanLimit(input.limit, 6),
    };

    if (!filters.q || filters.q.length < 2) {
        return { filters, rows: [], grouped: { bills: [], members: [], committees: [], seats: [] } };
    }

    const sql = `
    WITH params AS (
  SELECT
    websearch_to_tsquery('simple', unaccent($1::text)) AS tsq,
    $2::text[] AS entity_types
),
ranked AS (
  SELECT
    d.search_document_id,
    d.entity_type,
    d.entity_id,
    d.display_title,
    d.subtitle,
    d.summary,
    d.url,
    d.chamber,
    d.state_code,
    d.district,
    d.status_code,
    d.status_key,
    d.policy_area_id,
    d.policy_area_name,
    d.introduced_date,
    d.latest_action_date,
    d.updated_at,
    d.entity_priority,
    d.metadata,
    ts_rank_cd(d.search_entity_vector, p.tsq) AS entity_rank
  FROM sandbox_lemur_app_views_v1.global_search_documents_v1 d
  CROSS JOIN params p
  WHERE
    d.search_entity_vector @@ p.tsq
    AND (
      p.entity_types IS NULL
      OR cardinality(p.entity_types) = 0
      OR d.entity_type = ANY(p.entity_types)
    )
)
SELECT
  *,
  (
    entity_rank
    + (entity_priority::numeric / 1000.0)
  ) AS relevance_score
FROM ranked
ORDER BY
  relevance_score DESC,
  entity_rank DESC,
  entity_priority DESC,
  updated_at DESC NULLS LAST
LIMIT $3;
  `;

    const { rows } = await q("search:preview", sql, [
        filters.q,
        filters.entityTypes.length ? filters.entityTypes : null,
        filters.limit,
    ]);

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

    return { filters, rows: safeRows, grouped };
}