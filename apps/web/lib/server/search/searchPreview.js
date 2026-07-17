// apps/web/lib/server/search/searchPreview.js
import "server-only";
import { q } from "@/lib/server/db/instrumented-query";
import { detectStateIntent } from "./inferSearchIntent";

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

function createStateNavigationResult(intent, counts = {}) {
  if (!intent?.stateCode || !intent?.stateName) return null;

  const senatorCount = Number(counts.senators || 0);
  const representativeCount = Number(counts.representatives || 0);

  const parts = [];
  if (senatorCount) parts.push(`${senatorCount} ${senatorCount === 1 ? "Senator" : "Senators"}`);
  if (representativeCount) parts.push(`${representativeCount} ${representativeCount === 1 ? "Representative" : "Representatives"}`);

  if (!parts.length) parts.push("View congressional delegation");

  const isHouse = intent.kind === "state_house";
  const title = isHouse
    ? `${intent.stateName} House Delegation`
    : `${intent.stateName} Congressional Delegation`;

  const params = new URLSearchParams({ state: intent.stateCode });
  if (isHouse) params.set("chamber", "House");

  return {
    search_document_id: `state-${intent.stateCode}-${isHouse ? "house" : "delegation"}`,
    entity_type: "state",
    entity_id: intent.stateCode,
    display_title: title,
    subtitle: parts.join(" • "),
    summary: isHouse
      ? `View House members from ${intent.stateName}.`
      : `View senators and representatives from ${intent.stateName}.`,
    url: `/member?${params.toString()}#${intent.stateCode.toLowerCase()}`,
    state_code: intent.stateCode,
    chamber: isHouse ? "House" : null,
    metadata: {
      synthetic: true,
      stateCode: intent.stateCode,
      stateName: intent.stateName,
      senators: senatorCount,
      representatives: representativeCount,
    },
    relevance_score: 999,
  };
}

function emptyGrouped() {
  return { bills: [], members: [], committees: [], seats: [], states: [] };
}

function groupRows(rows = []) {
  const grouped = emptyGrouped();

  for (const row of rows) {
    if (row.entity_type === "bill") grouped.bills.push(row);
    else if (row.entity_type === "member") grouped.members.push(row);
    else if (row.entity_type === "committee") grouped.committees.push(row);
    else if (row.entity_type === "seat") grouped.seats.push(row);
    else if (row.entity_type === "state") grouped.states.push(row);
  }

  return grouped;
}

async function getStateMemberCounts(stateCode) {
  if (!stateCode) return { senators: 0, representatives: 0 };

  const sql = `
        SELECT
            COUNT(*) FILTER (WHERE chamber = 'Senate')::integer AS senators,
            COUNT(*) FILTER (WHERE chamber = 'House')::integer AS representatives
        FROM sandbox_lemur_app_views_v1.global_search_documents_v1
        WHERE state_code = $1
          AND entity_type IN ('member', 'seat');
    `;

  const { rows } = await q("search:preview:state-counts", sql, [stateCode]);
  return rows?.[0] || { senators: 0, representatives: 0 };
}

async function searchStateMembers(intent, limit) {
  const parts = ["d.entity_type IN ('member', 'seat')", "d.state_code = $1"];
  const params = [intent.stateCode];
  let i = 2;

  if (intent.chamber) {
    parts.push(`d.chamber = $${i++}`);
    params.push(intent.chamber);
  }

  if (intent.district !== undefined && intent.district !== null) {
    parts.push(`COALESCE(d.district, 0) = $${i++}`);
    params.push(intent.district);
  }

  params.push(limit);

  const sql = `
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
            (100 + (d.entity_priority::numeric / 1000.0)) AS relevance_score
        FROM sandbox_lemur_app_views_v1.global_search_documents_v1 d
        WHERE ${parts.join(" AND ")}
        ORDER BY
            CASE WHEN d.entity_type = 'member' THEN 0 ELSE 1 END,
            CASE WHEN d.chamber = 'Senate' THEN 0 WHEN d.chamber = 'House' THEN 1 ELSE 2 END,
            COALESCE(d.district, 0),
            d.display_title
        LIMIT $${i};
    `;

  const { rows } = await q("search:preview:state-members", sql, params);
  return rows ?? [];
}

async function searchEntityPreview(filters) {
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

  return rows ?? [];
}

export async function searchPreview(input = {}) {
  const stateIntent = detectStateIntent(input.q);
  const filters = {
    q: cleanText(input.q),
    entityTypes: cleanArray(input.entityTypes, ENTITY_TYPES),
    limit: cleanLimit(input.limit, 6),
    intent: stateIntent,
  };

  if (!filters.q || filters.q.length < 2) {
    return { filters, rows: [], grouped: emptyGrouped() };
  }

  if (stateIntent?.kind === "state_district" || stateIntent?.kind === "state_senators") {
    const rows = await searchStateMembers(stateIntent, filters.limit);
    return { filters, rows, grouped: groupRows(rows) };
  }

  if (stateIntent?.kind === "state_house") {
    const counts = await getStateMemberCounts(stateIntent.stateCode);
    const navigationResult = createStateNavigationResult(stateIntent, counts);
    const rows = navigationResult ? [navigationResult] : [];
    return { filters, rows, grouped: groupRows(rows) };
  }

  if (stateIntent?.kind === "state" || stateIntent?.kind === "state_members") {
    const counts = await getStateMemberCounts(stateIntent.stateCode);
    const navigationResult = createStateNavigationResult(stateIntent, counts);
    const billRows = await searchEntityPreview({ ...filters, entityTypes: ["bill"], limit: Math.max(filters.limit - 1, 1) });
    const rows = navigationResult ? [navigationResult, ...billRows] : billRows;
    return { filters, rows, grouped: groupRows(rows) };
  }

  const rows = await searchEntityPreview(filters);
  return { filters, rows, grouped: groupRows(rows) };
}
