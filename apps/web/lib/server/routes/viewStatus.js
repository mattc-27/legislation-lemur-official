// @/lib/server/viewStatus.js
import "server-only";
import { pool } from "../db/db";
import { q } from "../db/instrumented-query";
const ACTIVE_VIEW_SCHEMA = 'sandbox_lemur_app_views_v1'
const ACTIVE_DATA_SCHEMA = 'sandbox_public_v2'

export async function getViewsFreshness(viewNames = []) {
    if (!viewNames.length) return { asOf: null, perView: {} };

    const sql = `
    SELECT view_name, last_success_at
    FROM sandbox_ops_control_v1.view_status
    WHERE schema_name = $1
      AND view_name = ANY($2::text[]);
  `;
    const { rows } = await q("view_status:bulk", sql, [ACTIVE_VIEW_SCHEMA, viewNames]);

    const perView = Object.fromEntries(
        (rows ?? []).map(r => [r.view_name, r.last_success_at])
    );

    // conservative "page as-of" = the oldest successful refresh among included views
    const dates = Object.values(perView).filter(Boolean).map(d => new Date(d));
    const asOf = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))).toISOString() : null;

    return { asOf, perView };
}

export function formatAsOfMMDDYYYY(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    return `${mm}-${dd}-${yyyy}`;
}
