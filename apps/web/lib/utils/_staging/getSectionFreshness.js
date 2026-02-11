// lib/freshness/getSectionFreshness.js
import { q } from "../../instrumented-query";

const TEST_SCHEMA = 'sandbox_lemur_app_views_v1'
const PROD_SCHEMA = 'lemur_app_views_v1'

export async function getSectionFreshness({
    schemaName = TEST_SCHEMA,
    viewNames = [],
    cacheKey = "freshness:section",
} = {}) {
    if (!Array.isArray(viewNames) || viewNames.length === 0) {
        return { asOf: null, perView: {}, schemaName, viewNames: [] };
    }

    const sql = `
    select
      min(vs.last_success_at) as section_fresh_as_of,
      coalesce(jsonb_object_agg(vs.view_name, vs.last_success_at), '{}'::jsonb) as per_view_freshness
    from sandbox_ops_control_v1.view_status vs
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
