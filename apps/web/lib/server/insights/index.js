// lib/server/insights/getImpactTrendingMap.js
import "server-only";
import { pool } from "@/lib/server/db/db";
import { q } from "@/lib/server/db/instrumented-query";
import { ACTIVE_VIEW_SCHEMA, ACTIVE_DATA_SCHEMA, REF_SCHEMA } from "@/lib/server/db/schemas";


export async function getImpactTrendingMap({ congress, limit = 500 }) {
    const { rows } = await pool.query(`
    SELECT
      b.bill_id,
      b.display_title,
      b.policy_area_name,
      b.origin_chamber,
      m.impact_score,
      m.trending_score
    FROM ${ACTIVE_VIEW_SCHEMA}.mv_bill_metrics_v1 m
    JOIN ${ACTIVE_VIEW_SCHEMA}.bill_search_index b
      ON b.bill_id = m.bill_id
    WHERE m.impact_score IS NOT NULL
      AND m.trending_score IS NOT NULL
      ${congress ? "AND b.congress = $1" : ""}
    ORDER BY m.trending_score DESC
    LIMIT ${limit}
  `, congress ? [congress] : []);

    return rows;
}
