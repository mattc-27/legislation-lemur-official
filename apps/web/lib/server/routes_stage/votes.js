// lib/congress.js
import "server-only";
import { pool } from "../db/db";
import { q } from "../db/instrumented-query";

const ACTIVE_VIEW_SCHEMA = 'sandbox_lemur_app_views_v1'
const ACTIVE_DATA_SCHEMA = 'sandbox_public_v2'


const freshness = await getSectionFreshness({
    schemaName: "sandbox_lemur_app_views_v1",
    viewNames: ["mv_member_legislation_v1", "member_monthly_activity_v1"],
    cacheKey: `member:${bioguideId}:tabsFreshness`,
});

const votesFreshness = await getSectionFreshness({
    schemaName: "sandbox_lemur_app_views_v1",
    viewNames: ["mv_member_votes_v1", "mv_member_vote_agg_v1"],
    cacheKey: `member:${bioguideId}:votesFreshness`,
});



/* ------------------------------------------
Set to public schema, 11/25/2025
----
MATERAILIZED VIEWS using public schema tables 
For stage, remove the `_v1` 
--------------------------------------------- */

/* 
async function qWithSentry(label, sql, params = [], extra = {}) {
    try {
        return await q(label, sql, params);
    } catch (err) {
        Sentry.captureException(err, {
            tags: {
                area: "congress",
                queryLabel: label,
            },
            extra: {
                label,
                params,
                ...extra,
            },
        });
        throw err; 
    }
}
*/


export async function getHouseMemberVotes(
    bioguideId,
    { limit = 1000, offset = 0, verify = true } = {}
) {
    const dataSql = `
    SELECT
      identifier            AS vote_id,
      voted_at,
      question,
      result,
      choice::text          AS choice,
      session,
      rollcall_number,
      bill_id,
      bill_display,
      bill_url
    FROM ${ACTIVE_VIEW_SCHEMA}.mv_member_votes_v1
    WHERE bioguide_id = $1
      AND chamber = 'House of Representatives'
    ORDER BY voted_at DESC NULLS LAST
    LIMIT $2 OFFSET $3;
  `;

    const aggSql = `
    SELECT votes_total::int AS total_count, earliest, latest
    FROM ${ACTIVE_VIEW_SCHEMA}.mv_member_vote_agg_v1
    WHERE bioguide_id = $1;
  `;

    const [dataRes, aggRes] = await Promise.all([
        q("house:getVotes:data", dataSql, [bioguideId, limit, offset]),
        q("house:getVotes:agg", aggSql, [bioguideId]),
    ]);

    const rows = dataRes.rows;

    if (verify) {
        const { total_count = 0, earliest = null, latest = null } = aggRes.rows[0] || {};
        const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);
        if (rows.length === 0 && total_count > 0) {
            console.warn(
                `[getMemberVotes] ${bioguideId}: 0 rows; DB has ${total_count}. ${fmt(earliest)} → ${fmt(latest)}.`
            );
        }
    }

    return rows;
}



/* 
export async function getMemberVoteAlignment(bioguideId) {
    return await getHouseMemberVoteAlignment(bioguideId);
}
*/

export async function getMemberVoteAlignment(bioguideId) {
    await getHouseMemberVoteAlignment(bioguideId);
}
