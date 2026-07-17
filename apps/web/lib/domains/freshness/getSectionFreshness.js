// lib/domains/freshness/getSectionFreshness.js
import { q } from "../../server/db/instrumented-query";

const TEST_SCHEMA = "sandbox_lemur_app_views_v1";
const PROD_SCHEMA = "lemur_app_views_v1";

function uniqueNonEmptyStrings(values = []) {
  return Array.from(
    new Set(
      values
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter(Boolean)
    )
  );
}

function normalizeObject(value, fallback = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  return value;
}

/**
 * Return freshness metadata for a set of app-facing views/materialized views.
 *
 * Important semantics:
 * - `asOf` is only populated when every requested object has a view_status row.
 * - `perView` preserves the original shape: { [viewName]: last_success_at }.
 * - `details` / `perViewStatus` expose latest attempt status and error metadata.
 * - missing view_status rows are surfaced explicitly in `missingObjects`.
 */
export async function getSectionFreshness({
  schemaName = TEST_SCHEMA,
  viewNames = [],
  cacheKey = "freshness:section",
} = {}) {
  const requestedViewNames = uniqueNonEmptyStrings(viewNames);

  if (requestedViewNames.length === 0) {
    return {
      asOf: null,
      sectionFreshAsOf: null,
      perView: {},
      details: {},
      perViewStatus: {},
      statusByView: {},
      missingObjects: [],
      hasMissingObjects: false,
      isComplete: true,
      schemaName,
      viewNames: [],
    };
  }

  const sql = `
    WITH requested AS (
      SELECT unnest($2::text[]) AS view_name
    ), joined AS (
      SELECT
        r.view_name,
        vs.schema_name,
        vs.view_kind,
        vs.last_refresh_started_at,
        vs.last_refresh_finished_at,
        vs.last_refresh_status::text AS last_refresh_status,
        vs.last_refresh_run_group_id,
        vs.last_refresh_run_id,
        vs.last_success_at,
        vs.last_success_run_group_id,
        vs.last_row_count,
        vs.last_fingerprint,
        vs.last_error_class::text AS last_error_class,
        vs.last_error_message,
        vs.last_error_details,
        vs.updated_at,
        (vs.view_name IS NOT NULL) AS status_row_present
      FROM requested r
      LEFT JOIN sandbox_ops_control_v1.view_status vs
        ON vs.schema_name = $1
       AND vs.view_name = r.view_name
    )
    SELECT
      min(last_success_at) FILTER (WHERE status_row_present) AS section_fresh_as_of,
      coalesce(
        jsonb_object_agg(view_name, last_success_at ORDER BY view_name),
        '{}'::jsonb
      ) AS per_view_freshness,
      coalesce(
        jsonb_object_agg(
          view_name,
          jsonb_build_object(
            'present', status_row_present,
            'schemaName', $1,
            'viewName', view_name,
            'viewKind', view_kind,
            'lastSuccessAt', last_success_at,
            'lastSuccessRunGroupId', last_success_run_group_id,
            'lastRefreshStartedAt', last_refresh_started_at,
            'lastRefreshFinishedAt', last_refresh_finished_at,
            'lastRefreshStatus', last_refresh_status,
            'lastRefreshRunGroupId', last_refresh_run_group_id,
            'lastRefreshRunId', last_refresh_run_id,
            'lastRowCount', last_row_count,
            'lastFingerprint', last_fingerprint,
            'lastErrorClass', last_error_class,
            'lastErrorMessage', last_error_message,
            'lastErrorDetails', last_error_details,
            'updatedAt', updated_at
          )
          ORDER BY view_name
        ),
        '{}'::jsonb
      ) AS per_view_status,
      coalesce(
        array_agg(view_name ORDER BY view_name) FILTER (WHERE NOT status_row_present),
        ARRAY[]::text[]
      ) AS missing_objects,
      bool_or(NOT status_row_present) AS has_missing_objects
    FROM joined;
  `;

  const { rows } = await q(cacheKey, sql, [schemaName, requestedViewNames]);
  const r = rows?.[0] ?? {};

  const missingObjects = Array.isArray(r.missing_objects) ? r.missing_objects : [];
  const hasMissingObjects = Boolean(r.has_missing_objects) || missingObjects.length > 0;
  const perView = normalizeObject(r.per_view_freshness);
  const details = normalizeObject(r.per_view_status);

  const statusByView = Object.fromEntries(
    Object.entries(details).map(([viewName, meta]) => [
      viewName,
      meta?.lastRefreshStatus ?? null,
    ])
  );

  const sectionFreshAsOf = r.section_fresh_as_of ?? null;

  return {
    // Preserve existing consumer name, but do not silently report a partial as-of.
    asOf: hasMissingObjects ? null : sectionFreshAsOf,
    sectionFreshAsOf: hasMissingObjects ? null : sectionFreshAsOf,

    // Backward-compatible timestamp map.
    perView,

    // New detailed attempt/success/error metadata.
    details,
    perViewStatus: details,
    statusByView,
    missingObjects,
    hasMissingObjects,
    isComplete: !hasMissingObjects,

    schemaName,
    viewNames: requestedViewNames,
  };
}
