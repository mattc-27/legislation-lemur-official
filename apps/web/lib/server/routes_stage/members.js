// lib/congress.js
import "server-only";
import { pool } from "../db/db";
import { q } from "../db/instrumented-query";

const ACTIVE_VIEW_SCHEMA = 'sandbox_lemur_app_views_v1'
const ACTIVE_DATA_SCHEMA = 'sandbox_public_v2'

/*
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
 */



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

// -- 
function groupBySubjectWithCounts(rows, kind) {
    const by = new Map();
    for (const r of rows) {
        const key = r.subject || "Uncategorized";
        if (!by.has(key)) by.set(key, new Map()); // inner map by bill_id
        const bucket = by.get(key);
        if (bucket.has(r.bill_id)) {
            // merge kinds if same bill appears twice
            const existing = bucket.get(r.bill_id);
            if (kind && !existing.kinds.includes(kind)) existing.kinds.push(kind);
        } else {
            bucket.set(r.bill_id, toItem(r, kind));
        }
    }
    // materialize with counts
    return Array.from(by.entries()).map(([subject, m]) => {
        const items = Array.from(m.values());
        return { subject, count: items.length, items };
    });
}

// add/keep these helpers near the top
function toItem(r, kind) {
    return {
        id: r.bill_id,
        title: r.title,
        type: r.type,               // HR / S / etc
        number: r.number,
        introducedAt: r.introduced_date,     // <-- BillList uses this
        latestActionDate: r.latest_action_date,
        latestActionText: r.latest_action_text,
        url: r.url,                 // <-- for getCongressBillUrl(url)
        appHref: `/bill/${r.bill_id}`,
        kinds: kind ? [kind] : [],  // <-- "s" or "c" for badge
    };
}
// --- helper: determine chamber for a bioguide ---


// ---------- PROFILE (+ terms + about) ----------

export async function getMemberProfile(bioguideId) {
    const sql = `
    SELECT
      m.bioguide_id        AS "bioguideId",
      m.name,
      m.party_code::text   AS party,
      m.party_name::text   AS "partyName",
      m.state,
      m.state_code         AS "stateCode",
      m.district,
      m.chamber::text      AS "chamber",
      m.image_url          AS "imageUrl",
      m.url,
      cs.serving_since     AS "servingSince"
    FROM ${ACTIVE_DATA_SCHEMA}.members m
    LEFT JOIN ${ACTIVE_VIEW_SCHEMA}.mv_current_chamber_since_v1 cs
      ON cs.bioguide_id = m.bioguide_id
     AND cs.chamber::text = m.chamber::text
    WHERE m.bioguide_id = $1
      AND m.is_current IS TRUE
    LIMIT 1;
  `;

    const { rows } = await q("member:getProfile", sql, [bioguideId], { bioguideId });

    const profile = rows?.[0] ?? null;
    if (!profile) return null;

    const terms = await getMemberTerms(bioguideId);
    const about = composeMemberAbout(profile, terms);

    return { ...profile, terms, about };
}



// ---------- TERMS (timeline source)  ----------
export async function getMemberTerms(bioguideId) {
    const sql = `
    SELECT
      t.member_id                  AS "bioguideId",
      t.chamber::text              AS chamber,
      t.start_year                 AS "startYear",
      t.end_year                   AS "endYear",
      (t.end_year IS NULL)         AS "isCurrent",
      t.year_range                 AS "yearRange"
    FROM ${ACTIVE_DATA_SCHEMA}.member_terms t
    WHERE t.member_id = $1
    ORDER BY t.start_year ASC NULLS LAST, t.end_year ASC NULLS LAST;
  `;
    const { rows } = await q(
        "member:getTerms",
        sql,
        [bioguideId],
        { bioguideId }
    );
    return rows ?? [];
}

// ---------- ABOUT/BIO ----------
function composeMemberAbout(profile, terms = []) {
    const {
        name,
        chamber,
        state,
        stateCode,
        district,
        partyName,
        servingSince,
    } = profile;

    // If MV is missing for some reason, fall back to scanning terms of same chamber
    const backupSince = (() => {
        const currentSameChamber = terms
            .filter((t) => t.chamber === chamber && t.endYear == null)
            .map((t) => t.startYear);
        return currentSameChamber.length ? Math.min(...currentSameChamber) : null;
    })();

    const since = servingSince ?? backupSince;
    const sinceTxt = since ? ` since ${since}` : "";
    const stateLabel = state || stateCode;

    if (chamber === "House of Representatives") {
        const distText =
            district == null || district === 0 || district === "AL"
                ? "at-large district"
                : `${ordinal(+district)} district`;
        return `${name} is a ${partyName} member of the U.S. House representing ${stateLabel}’s ${distText}${sinceTxt}.`;
    }

    if (chamber === "Senate") {
        return `${name} is a ${partyName} U.S. senator for ${stateLabel}${sinceTxt}.`;
    }

    return `${name} is a ${partyName} member of Congress from ${stateLabel}.`;
}

function ordinal(n) {
    if (Number.isNaN(n)) return `${n}`;
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}


// ---------- Chamber lookup (kept if you still use it elsewhere)
// stage.senate_member_id_ref
//  ----------
export async function getMemberChamber(bioguideId) {
    const sql = `SELECT chamber FROM ${ACTIVE_DATA_SCHEMA}.members WHERE bioguide_id = $1 LIMIT 1`;
    let r = await q("member:getChamber", sql, [bioguideId]);
    if (r.rows.length) return r.rows[0].chamber;

    const fallback = `SELECT 1 FROM ${ACTIVE_DATA_SCHEMA}.senate_member_id_ref WHERE bioguide_id = $1 LIMIT 1`;
    r = await q("member:getChamberFallback", fallback, [bioguideId]);
    return r.rows.length ? "Senate" : "House";
}



export async function getMemberSubjects(bioguideId, { limit = 12 } = {}) {
    const sql = `
    SELECT subject_name, total_count AS count,
           sponsored_count, cosponsored_count
    FROM ${ACTIVE_VIEW_SCHEMA}.mv_member_subject_counts_v1
    WHERE bioguide_id = $1
    ORDER BY total_count DESC, subject_name ASC
    LIMIT $2;
  `;
    const { rows } = await q("member:getSubjects:mv", sql, [bioguideId, limit]);
    return rows;
}



export async function getMemberMonthlyStats(bioguideId) {
    const sql = `
    SELECT month, sponsored_count AS sponsored, cosponsored_count AS cosponsored
    FROM ${ACTIVE_VIEW_SCHEMA}.member_monthly_activity_v1
    WHERE bioguide_id = $1
    ORDER BY month DESC;
  `;
    const { rows } = await q("member:getMonthlyStats:mv", sql, [bioguideId]);
    return rows;
}

export async function getMemberMonthlyActivity(bioguideId) {
    const sql = `
    SELECT month, sponsored_count, cosponsored_count, total_count
    FROM ${ACTIVE_VIEW_SCHEMA}.member_monthly_activity_v1
    WHERE bioguide_id = $1
    ORDER BY month ASC;
  `;
    const { rows } = await q("member:getMonthlyActivity:mv", sql, [bioguideId]);
    return rows;
}



export async function getMemberBills(bioguideId, { limit = 50, offset = 0, congress = 119 } = {}) {
    const sql = `
    SELECT bill_id, type, number, title, latest_action_date, latest_action_text, url,
           my_role, cosponsor_count
    FROM ${ACTIVE_VIEW_SCHEMA}.mv_member_legislation_v1
    WHERE bioguide_id = $1 AND congress = $2
    ORDER BY latest_action_date DESC NULLS LAST, bill_id
    LIMIT $3 OFFSET $4;
  `;
    const { rows } = await q("member:getBills:mv", sql, [bioguideId, congress, limit, offset]);
    return rows;
}

export async function getMemberSponsoredLegislation(bioguideId, { max = 250 } = {}) {
    const sql = `
    SELECT bill_id, type, number, title, introduced_date, latest_action_date, latest_action_text, url,
           policy_area, legislative_topic, legislative_topics, cosponsor_count
    FROM ${ACTIVE_VIEW_SCHEMA}.mv_member_legislation_v1
    WHERE bioguide_id = $1 AND my_role = 's'
    ORDER BY latest_action_date DESC NULLS LAST, bill_id
    LIMIT $2;
  `;
    const { rows } = await q("member:getSponsored:mv", sql, [bioguideId, Math.min(max, 1000)]);
    const normalized = rows.map(r => ({
        ...r,
        subject: r.policy_area ?? r.legislative_topic ?? "Uncategorized",
    }));
    return {
        groups: {
            policy_area: groupBySubjectWithCounts(normalized.map(r => ({ ...r, subject: r.policy_area ?? "Uncategorized" })), "s"),
            legislative: groupBySubjectWithCounts(normalized.map(r => ({ ...r, subject: r.legislative_topic ?? "Uncategorized" })), "s"),
        },
        legacy: groupBySubjectWithCounts(normalized, "s"),
        items: normalized,
    };
}

export async function getMemberCosponsoredLegislation(bioguideId, { max = 250 } = {}) {
    const sql = `
    SELECT bill_id, type, number, title, introduced_date, latest_action_date, latest_action_text, url,
           policy_area, legislative_topic, legislative_topics, cosponsor_count
    FROM ${ACTIVE_VIEW_SCHEMA}.mv_member_legislation_v1
    WHERE bioguide_id = $1 AND my_role = 'c'
    ORDER BY latest_action_date DESC NULLS LAST, bill_id
    LIMIT $2;
  `;
    const { rows } = await q("member:getCosponsored:mv", sql, [bioguideId, Math.min(max, 1000)]);
    const normalized = rows.map(r => ({
        ...r,
        subject: r.policy_area ?? r.legislative_topic ?? "Uncategorized",
    }));
    return {
        groups: {
            policy_area: groupBySubjectWithCounts(normalized.map(r => ({ ...r, subject: r.policy_area ?? "Uncategorized" })), "c"),
            legislative: groupBySubjectWithCounts(normalized.map(r => ({ ...r, subject: r.legislative_topic ?? "Uncategorized" })), "c"),
        },
        legacy: groupBySubjectWithCounts(normalized, "c"),
        items: normalized,
    };
}



export async function getHouseMemberVoteAlignment(bioguideId) {
    const sql = `
    SELECT alignment_pct, attendance_pct
    FROM ${ACTIVE_VIEW_SCHEMA}.mv_member_alignment_house_v1
    WHERE bioguide_id = $1;
  `;
    const { rows } = await q("member:getHouseVoteAlignment:mv", sql, [bioguideId]);
    return rows[0] ?? { alignment_pct: null, attendance_pct: null };
}




export async function getMemberVoteAgg(bioguideId) {
    const sql = `
    SELECT votes_total AS total_count, earliest, latest
    FROM ${ACTIVE_VIEW_SCHEMA}.mv_member_vote_agg_v1
    WHERE bioguide_id = $1;
  `;
    const { rows } = await q("member:getVoteAgg", sql, [bioguideId]);
    return rows[0] ?? { total_count: 0, earliest: null, latest: null };
}



export async function getMemberVoteAlignment(bioguideId) {
    await getHouseMemberVoteAlignment(bioguideId);
}

export async function getMemberKpis(bioguideId) {
    const sql = `
    SELECT
      k.votes_total,
      k.votes_missed,
      k.attendance_pct,
      k.alignment_pct,
      k.sponsored_bills,
      k.cosponsored_bills,
      vs.last_success_at AS data_fresh_as_of
    FROM ${ACTIVE_VIEW_SCHEMA}.member_kpis_v1 k
    LEFT JOIN sandbox_ops_control_v1.view_status vs
      ON vs.schema_name = '${ACTIVE_VIEW_SCHEMA}'
     AND vs.view_name   = 'member_kpis_v1'
    WHERE k.bioguide_id = $1;
  `;
    const { rows } = await q("member:getKpis:mv", sql, [bioguideId]);
    return rows[0] ?? null;
}





/* UPDATED VOTES */
export async function getHouseMemberAlignmentPanelOverall(bioguideId) {
    const sql = `
    SELECT
      b.bioguide_id,
      b.alignment_pct,
      b.attendance_pct,
      round((b.alignment_pct - b.house_alignment_median)::numeric, 1)  AS alignment_vs_house_median,
      round((b.attendance_pct - b.house_attendance_median)::numeric, 1) AS attendance_vs_house_median,
      round((b.alignment_cume_dist * 100.0)::numeric, 1)              AS alignment_percentile,
      round((b.attendance_cume_dist * 100.0)::numeric, 1)             AS attendance_percentile,
      va.votes_total::int                                             AS votes_total,
      va.votes_missed::int                                            AS votes_missed,
      vs.last_success_at                                              AS data_fresh_as_of
    FROM ${ACTIVE_VIEW_SCHEMA}.mv_house_alignment_benchmarks_v1 b
    LEFT JOIN ${ACTIVE_VIEW_SCHEMA}.mv_member_vote_agg_v1 va
      ON va.bioguide_id = b.bioguide_id
    LEFT JOIN sandbox_ops_control_v1.view_status vs
      ON vs.schema_name = '${ACTIVE_VIEW_SCHEMA}'
     AND vs.view_name   = 'mv_house_alignment_benchmarks_v1'
    WHERE b.bioguide_id = $1;
  `;
    const { rows } = await q("member:getAlignPanel:overall", sql, [bioguideId]);
    return rows[0] ?? null;
}


export async function getHouseMemberAlignmentByPolicy(
    bioguideId,
    { minVotes = 10, sort = "votes", limit = 60 } = {}
) {
    const sortSql =
        sort === "lowest_alignment"
            ? `p.alignment_pct ASC NULLS LAST, p.considered_count DESC`
            : sort === "highest_alignment"
                ? `p.alignment_pct DESC NULLS LAST, p.considered_count DESC`
                : sort === "biggest_delta"
                    ? `abs(p.alignment_pct - o.overall_alignment_pct) DESC, p.considered_count DESC`
                    : `p.considered_count DESC`; // default "votes"

    const sql = `
    WITH overall AS (
      SELECT k.alignment_pct AS overall_alignment_pct
      FROM ${ACTIVE_VIEW_SCHEMA}.member_kpis_v1 k
      WHERE k.bioguide_id = $1
    )
    SELECT
      p.policy_area_id,
      p.policy_area_slug,
      p.policy_area_name,
      p.alignment_pct,
      p.attendance_pct,
      p.considered_count::int,
      p.aligned_count::int,
      (p.considered_count - p.aligned_count)::int AS misaligned_count,
      round((p.alignment_pct - o.overall_alignment_pct)::numeric, 1) AS alignment_delta
    FROM ${ACTIVE_VIEW_SCHEMA}.mv_member_alignment_house_by_policy_area_v1 p
    CROSS JOIN overall o
    WHERE p.bioguide_id = $1
      AND p.considered_count >= $2
    ORDER BY ${sortSql}
    LIMIT $3;
  `;

    const { rows } = await q("member:getAlignPanel:policy", sql, [
        bioguideId,
        minVotes,
        limit,
    ]);
    return rows;
}


export async function getHouseMemberAlignmentTopDeviations(
    bioguideId,
    { minVotes = 10, limit = 3 } = {}
) {
    const sql = `
    WITH overall AS (
      SELECT k.alignment_pct AS overall_alignment_pct
      FROM ${ACTIVE_VIEW_SCHEMA}.member_kpis_v1 k
      WHERE k.bioguide_id = $1
    )
    SELECT
      p.policy_area_id,
      p.policy_area_slug,
      p.policy_area_name,
      p.considered_count::int,
      round((p.alignment_pct - o.overall_alignment_pct)::numeric, 1) AS alignment_delta
    FROM ${ACTIVE_VIEW_SCHEMA}.mv_member_alignment_house_by_policy_area_v1 p
    CROSS JOIN overall o
    WHERE p.bioguide_id = $1
      AND p.considered_count >= $2
    ORDER BY abs(p.alignment_pct - o.overall_alignment_pct) DESC, p.considered_count DESC
    LIMIT $3;
  `;
    const { rows } = await q("member:getAlignPanel:deviations", sql, [
        bioguideId,
        minVotes,
        limit,
    ]);
    return rows;
}