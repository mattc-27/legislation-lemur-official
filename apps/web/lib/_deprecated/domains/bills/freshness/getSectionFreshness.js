// lib/freshness/getSectionFreshness.js
// Server-side helper (call from route handlers / server actions), NOT a client component.
import { pool } from '../../../../server/db/db';
import { q } from "../../../../server/db/instrumented-query";


export async function getSectionFreshness({
  schemaName = "sandbox_lemur_views_v2",
  viewNames = [],
  cacheKey = "freshness:section",
} = {}) {
  if (!Array.isArray(viewNames) || viewNames.length === 0) {
    return { asOf: null, perView: {}, schemaName, viewNames: [] };
  }

  const sql = `
    select
      min(vs.last_success_at) as section_fresh_as_of,
      jsonb_object_agg(vs.view_name, vs.last_success_at) as per_view_freshness
    from sandbox_ops_v3.view_status vs
    where vs.schema_name = $1
      and vs.view_name = any($2::text[]);
  `;

  const { rows } = await q(cacheKey, sql, [schemaName, viewNames]);
  const r = rows?.[0] ?? {};

  return {
    asOf: r.section_fresh_as_of ?? null,
    perView: r.per_view_freshness ?? {},
    schemaName,
    viewNames,
  };
}
