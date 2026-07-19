// Canonical: lib/server/routes/members.js
import "server-only";
import { q } from "../db/instrumented-query";
import { perfLog } from "@/lib/server/debug/perf";

const ACTIVE_VIEW_SCHEMA = "sandbox_lemur_app_views_v1";
const ACTIVE_DATA_SCHEMA = "sandbox_public_v2";
const MEMBER_BILL_ACTIVITY_VIEW = "mv_member_bill_activity_v3";

// Canonical member data access. Browser-facing legislation reads only from
// mv_member_bill_activity_v3. mv_member_legislation_v3 remains an internal
// foundational object and is not queried directly by this route.

async function timed(label, fn, extra = {}) {
    const start = performance.now();

    try {
        const result = await fn();
        const ms = Math.round(performance.now() - start);

        const rowCount = Array.isArray(result?.rows)
            ? result.rows.length
            : Array.isArray(result)
                ? result.length
                : Array.isArray(result?.items)
                    ? result.items.length
                    : null;

        perfLog(`${label}: ${ms}ms`, {
            rowCount,
            ...extra,
        });

        return result;
    } catch (err) {
        perfLog(`${label}:error:${Math.round(performance.now() - start)}ms`, {
            message: err?.message,
            code: err?.code,
            ...extra,
        });

        throw err;
    }
}

function groupBySubjectWithCounts(rows, kind) {
    const by = new Map();

    for (const r of rows) {
        const key = r.subject || "Uncategorized";

        if (!by.has(key)) by.set(key, new Map());

        const bucket = by.get(key);

        if (bucket.has(r.bill_id)) {
            const existing = bucket.get(r.bill_id);
            if (kind && !existing.kinds.includes(kind)) existing.kinds.push(kind);
        } else {
            bucket.set(r.bill_id, toItem(r, kind));
        }
    }

    return Array.from(by.entries()).map(([subject, m]) => {
        const items = Array.from(m.values());
        return { subject, count: items.length, items };
    });
}

function roleCodeFor(row, fallback = null) {
    if (fallback === "s" || fallback === "c") return fallback;
    if (row?.my_role === "s" || row?.my_role === "c") return row.my_role;
    if (row?.member_role === "sponsored") return "s";
    if (row?.member_role === "cosponsored") return "c";
    return null;
}

function toItem(row, fallbackRole = null) {
    const roleCode = roleCodeFor(row, fallbackRole);
    const memberRole =
        row.member_role ||
        (roleCode === "s" ? "sponsored" : roleCode === "c" ? "cosponsored" : null);

    const legislativeTopics = Array.isArray(row.legislative_topics)
        ? row.legislative_topics
        : [];
    const primaryLegislativeTopic = legislativeTopics[0] || null;
    const policyAreaName = row.policy_area_name || null;
    const appHref = row.app_href || `/bills/${row.bill_id}`;
    const congressUrl = row.congress_url || null;
    const associationIsActive = row.association_is_active !== false;
    const associationStatusLabel =
        row.association_status_label ||
        (roleCode === "s"
            ? "Sponsored"
            : associationIsActive
                ? "Cosponsored"
                : "Cosponsorship withdrawn");

    const cosponsorsTotal = Number(row.cosponsors_total ?? 0);
    const cosponsorsActive = Number(row.cosponsors_active ?? 0);
    const cosponsorsWithdrawn = Number(row.cosponsors_withdrawn ?? 0);

    return {
        id: row.bill_id,
        billId: row.bill_id,
        bill_id: row.bill_id,
        congress: Number(row.congress),

        displayTitle: row.display_title || row.title,
        display_title: row.display_title || row.title,
        title: row.title,

        type: row.bill_type,
        billType: row.bill_type,
        bill_type: row.bill_type,
        number: row.bill_number,
        billNumber: row.bill_number,
        bill_number: row.bill_number,

        introducedAt: row.introduced_date,
        introduced_date: row.introduced_date,
        latestActionDate: row.latest_action_date,
        latest_action_date: row.latest_action_date,
        latestActionText: row.latest_action_text,
        latest_action_text: row.latest_action_text,

        associationDate: row.association_date,
        association_date: row.association_date,
        associationIsActive,
        association_is_active: associationIsActive,
        associationStatusLabel,
        association_status_label: associationStatusLabel,
        cosponsorJoinedDate: row.cosponsor_joined_date,
        cosponsor_joined_date: row.cosponsor_joined_date,
        cosponsorWithdrawnDate: row.cosponsor_withdrawn_date,
        cosponsor_withdrawn_date: row.cosponsor_withdrawn_date,
        isOriginalCosponsor: Boolean(row.is_original_cosponsor),
        is_original_cosponsor: Boolean(row.is_original_cosponsor),

        url: congressUrl,
        congressUrl,
        congress_url: congressUrl,
        appHref,
        app_href: appHref,

        bioguideId: row.bioguide_id,
        bioguide_id: row.bioguide_id,

        policyArea: policyAreaName,
        policy_area: policyAreaName,
        policyAreaSlug: row.policy_area_slug,
        policy_area_slug: row.policy_area_slug,
        policyAreaName: policyAreaName,
        policy_area_name: policyAreaName,

        legislativeTopic: primaryLegislativeTopic,
        legislative_topic: primaryLegislativeTopic,
        legislativeTopics,
        legislative_topics: legislativeTopics,

        statusKey: row.status_key,
        status_key: row.status_key,
        statusLabel: row.status_label,
        status_label: row.status_label,
        originChamber: row.origin_chamber,
        origin_chamber: row.origin_chamber,

        cosponsorCount: cosponsorsTotal,
        cosponsor_count: cosponsorsTotal,
        cosponsorsTotal,
        cosponsors_total: cosponsorsTotal,
        cosponsorsActive,
        cosponsors_active: cosponsorsActive,
        cosponsorsWithdrawn,
        cosponsors_withdrawn: cosponsorsWithdrawn,

        hasAiSummary: Boolean(row.has_ai_summary),
        has_ai_summary: Boolean(row.has_ai_summary),
        hasSummary: Boolean(row.has_summary),
        has_summary: Boolean(row.has_summary),
        hasOfficialSummary: Boolean(row.has_official_summary),
        has_official_summary: Boolean(row.has_official_summary),
        summaryShort: row.summary_short,
        summary_short: row.summary_short,

        // Full summaries and key-action JSON are intentionally omitted from
        // the profile list projection to keep the member response lightweight.
        summaryTextPlain: null,
        summary_text_plain: null,
        keyActions: [],
        key_actions: [],

        impactScore: row.impact_score,
        impact_score: row.impact_score,
        trendingScore: row.trending_score,
        trending_score: row.trending_score,

        memberRole,
        member_role: memberRole,
        roleCode,
        kinds: roleCode ? [roleCode] : [],
    };
}

const MEMBER_BILL_ACTIVITY_SELECT = `
      bill_id,
      congress,
      bioguide_id,
      my_role,
      member_role,
      association_date,
      association_is_active,
      association_status_label,
      cosponsor_joined_date,
      cosponsor_withdrawn_date,
      is_original_cosponsor,
      bill_type,
      bill_number,
      display_title,
      title,
      introduced_date,
      latest_action_date,
      latest_action_text,
      origin_chamber,
      status_key,
      status_label,
      policy_area_name,
      policy_area_slug,
      legislative_topics,
      cosponsors_total,
      cosponsors_active,
      cosponsors_withdrawn,
      has_summary,
      has_official_summary,
      has_ai_summary,
      summary_short,
      impact_score,
      trending_score,
      app_href,
      congress_url
`;

export async function getMemberProfile(bioguideId) {
    const totalStart = performance.now();

    const sql = `
    SELECT
      m.bioguide_id        AS "bioguideId",
      m.name,
      m.party_code::text   AS party,
      m.party_name::text   AS "partyName",
      m.state,
      m.state_code         AS "stateCode",
      m.district,
      m.chamber::text      AS chamber,
      m.image_url          AS "imageUrl",
      m.url,
      m.is_current         AS "isCurrent",
      m.congress           AS "memberCongress",
      COALESCE(cs.serving_since, term_summary.service_start_year) AS "servingSince",
      term_summary.service_start_year AS "serviceStartYear",
      term_summary.service_end_year   AS "serviceEndYear",
      activity.available_congresses   AS "availableCongresses",
      COALESCE(activity.last_congress_served, m.congress) AS "lastCongressServed",
      COALESCE(
        hd.vacant_since,
        hd.vacancy_started_at::date,
        recent_departure.event_date::date
      ) AS "serviceEndDate",
      CASE
        WHEN hd.vacant_since IS NOT NULL THEN 'house_districts_vacant_since'
        WHEN hd.vacancy_started_at IS NOT NULL THEN 'house_districts_vacancy_started_at'
        WHEN recent_departure.event_date IS NOT NULL THEN 'recent_changes_event_date'
        ELSE NULL
      END AS "serviceEndDateBasis",
      hd.is_vacant                    AS "seatCurrentlyVacant",
      hd.vacancy_reason               AS "vacancyReason",
      COALESCE(hd.vacant_since, hd.vacancy_started_at::date) AS "vacancyEffectiveDate",
      CASE
        WHEN hd.vacant_since IS NOT NULL THEN 'house_districts_vacant_since'
        WHEN hd.vacancy_started_at IS NOT NULL THEN 'house_districts_vacancy_started_at'
        ELSE NULL
      END AS "vacancyDateBasis",
      hd.special_election_scheduled   AS "specialElectionScheduled",
      hd.special_election_date        AS "specialElectionDate",
      hd.special_election_url         AS "specialElectionUrl"
    FROM ${ACTIVE_DATA_SCHEMA}.members m
    LEFT JOIN ${ACTIVE_VIEW_SCHEMA}.mv_current_chamber_since_v1 cs
      ON cs.bioguide_id = m.bioguide_id
     AND cs.chamber::text = m.chamber::text
    LEFT JOIN LATERAL (
      SELECT
        MIN(t.start_year)::int AS service_start_year,
        MAX(t.end_year)::int   AS service_end_year
      FROM ${ACTIVE_DATA_SCHEMA}.member_terms t
      WHERE t.member_id = m.bioguide_id
        AND t.chamber::text = m.chamber::text
    ) term_summary ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        ARRAY_AGG(DISTINCT a.congress ORDER BY a.congress DESC) AS available_congresses,
        MAX(a.congress)::int AS last_congress_served
      FROM ${ACTIVE_VIEW_SCHEMA}.${MEMBER_BILL_ACTIVITY_VIEW} a
      WHERE a.bioguide_id = m.bioguide_id
    ) activity ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        rc.event_date,
        rc.change_type
      FROM ${ACTIVE_VIEW_SCHEMA}.v_member_recent_changes_v5 rc
      WHERE rc.former_member_bioguide_id = m.bioguide_id
        AND rc.ui_event_type = 'seat_vacancy_opened'
        AND rc.event_date IS NOT NULL
      ORDER BY rc.event_date DESC
      LIMIT 1
    ) recent_departure ON m.is_current IS FALSE
    LEFT JOIN sandbox_lemur_ref_v2.house_districts_v1 hd
      ON hd.congress = COALESCE(activity.last_congress_served, m.congress)
     AND hd.state_code = m.state_code::text
     AND hd.district = m.district
     AND m.chamber::text = 'House of Representatives'
    WHERE m.bioguide_id = $1
    LIMIT 1;
  `;

    const { rows } = await timed(
        "memberRoute:getMemberProfile:query",
        () => q("member:getProfile", sql, [bioguideId], { bioguideId }),
        { bioguideId }
    );

    const raw = rows?.[0] ?? null;

    if (!raw) {
        perfLog(`memberRoute:getMemberProfile:total: ${Math.round(performance.now() - totalStart)}ms`, {
            bioguideId,
            found: false,
        });
        return null;
    }

    const terms = await timed(
        "memberRoute:getMemberProfile:getTerms",
        () => getMemberTerms(bioguideId),
        { bioguideId }
    );

    const availableCongresses = Array.from(
        new Set(
            [
                ...(Array.isArray(raw.availableCongresses)
                    ? raw.availableCongresses
                    : []),
                raw.memberCongress,
                raw.lastCongressServed,
            ]
                .map(Number)
                .filter(Number.isInteger)
        )
    ).sort((a, b) => b - a);

    const profile = {
        ...raw,
        availableCongresses,
        lastCongressServed:
            Number(raw.lastCongressServed) || availableCongresses[0] || Number(raw.memberCongress) || null,
        memberStatus: raw.isCurrent ? "current" : "former",
    };

    const about = composeMemberAbout(profile, terms);

    perfLog(`memberRoute:getMemberProfile:total: ${Math.round(performance.now() - totalStart)}ms`, {
        bioguideId,
        found: true,
        isCurrent: profile.isCurrent,
        termsCount: terms?.length ?? 0,
    });

    return { ...profile, terms, about };
}

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

    const { rows } = await timed(
        "memberRoute:getMemberTerms:query",
        () => q("member:getTerms", sql, [bioguideId], { bioguideId }),
        { bioguideId }
    );

    return rows ?? [];
}

function isHouseChamber(chamber) {
    return chamber === "House" || chamber === "House of Representatives";
}

function formatServiceEnd(profile) {
    const basis = String(profile?.serviceEndDateBasis || "");
    const isAuthoritativeDate = basis.startsWith("house_districts_");

    if (isAuthoritativeDate && profile.serviceEndDate) {
        const date = new Date(`${profile.serviceEndDate}T00:00:00`);
        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        }
    }

    return profile.serviceEndYear || null;
}

function composeMemberAbout(profile, terms = []) {
    const {
        name,
        chamber,
        state,
        stateCode,
        district,
        partyName,
        servingSince,
        isCurrent,
        serviceStartYear,
    } = profile;

    const backupSince = (() => {
        const sameChamber = terms
            .filter((t) => t.chamber === chamber)
            .map((t) => t.startYear)
            .filter(Number.isFinite);

        return sameChamber.length ? Math.min(...sameChamber) : null;
    })();

    const since = servingSince ?? serviceStartYear ?? backupSince;
    const stateLabel = state || stateCode;
    const serviceEnd = formatServiceEnd(profile);

    if (isHouseChamber(chamber)) {
        const distText =
            district == null || district === 0 || district === "AL"
                ? "at-large district"
                : `${ordinal(+district)} district`;

        if (!isCurrent) {
            const range = since && serviceEnd
                ? ` from ${since} to ${serviceEnd}`
                : since
                    ? ` beginning in ${since}`
                    : serviceEnd
                        ? ` until ${serviceEnd}`
                        : "";

            return `${name} served as a ${partyName} member of the U.S. House representing ${stateLabel}’s ${distText}${range}.`;
        }

        return `${name} is a ${partyName} member of the U.S. House representing ${stateLabel}’s ${distText}${since ? ` since ${since}` : ""}.`;
    }

    if (chamber === "Senate") {
        if (!isCurrent) {
            const range = since && serviceEnd
                ? ` from ${since} to ${serviceEnd}`
                : since
                    ? ` beginning in ${since}`
                    : serviceEnd
                        ? ` until ${serviceEnd}`
                        : "";

            return `${name} served as a ${partyName} U.S. senator for ${stateLabel}${range}.`;
        }

        return `${name} is a ${partyName} U.S. senator for ${stateLabel}${since ? ` since ${since}` : ""}.`;
    }

    return !isCurrent
        ? `${name} previously served in Congress representing ${stateLabel}.`
        : `${name} is a ${partyName} member of Congress from ${stateLabel}.`;
}

function ordinal(n) {
    if (Number.isNaN(n)) return `${n}`;

    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;

    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export async function getMemberChamber(bioguideId) {
    const sql = `
    WITH candidates AS (
      SELECT
        m.chamber::text AS chamber,
        CASE WHEN m.is_current IS TRUE THEN 1 ELSE 2 END AS priority,
        m.updated_at AS sort_ts,
        NULL::int AS sort_year
      FROM ${ACTIVE_DATA_SCHEMA}.members m
      WHERE m.bioguide_id = $1
        AND m.chamber IS NOT NULL

      UNION ALL

      SELECT
        cs.chamber::text AS chamber,
        3 AS priority,
        NULL::timestamptz AS sort_ts,
        cs.serving_since::int AS sort_year
      FROM ${ACTIVE_VIEW_SCHEMA}.mv_current_chamber_since_v1 cs
      WHERE cs.bioguide_id = $1
        AND cs.chamber IS NOT NULL

      UNION ALL

      SELECT
        t.chamber::text AS chamber,
        CASE WHEN t.end_year IS NULL THEN 4 ELSE 5 END AS priority,
        NULL::timestamptz AS sort_ts,
        t.start_year::int AS sort_year
      FROM ${ACTIVE_DATA_SCHEMA}.member_terms t
      WHERE t.member_id = $1
        AND t.chamber IS NOT NULL
    )
    SELECT chamber
    FROM candidates
    ORDER BY priority ASC, sort_year DESC NULLS LAST, sort_ts DESC NULLS LAST
    LIMIT 1;
  `;

    const r = await timed(
        "memberRoute:getMemberChamber:query",
        () => q("member:getChamber", sql, [bioguideId]),
        { bioguideId }
    );

    return r.rows?.[0]?.chamber ?? null;
}

export async function getMemberSubjects(
    bioguideId,
    { congress, limit = 12, serviceEndDate = null } = {}
) {
    const sql = `
    SELECT
      COALESCE(policy_area_name, legislative_topics[1], 'Uncategorized') AS subject_name,
      COUNT(DISTINCT bill_id)::int AS total_count,
      COUNT(DISTINCT bill_id) FILTER (WHERE my_role = 's')::int AS sponsored_count,
      COUNT(DISTINCT bill_id) FILTER (WHERE my_role = 'c')::int AS cosponsored_count
    FROM ${ACTIVE_VIEW_SCHEMA}.${MEMBER_BILL_ACTIVITY_VIEW}
    WHERE bioguide_id = $1
      AND congress = $2
      AND association_date IS NOT NULL
      AND ($3::date IS NULL OR association_date <= $3::date)
    GROUP BY 1
    ORDER BY total_count DESC, subject_name ASC
    LIMIT $4;
  `;

    const { rows } = await timed(
        "memberRoute:getMemberSubjects:query",
        () => q("member:getSubjects:v3", sql, [bioguideId, congress, serviceEndDate, limit]),
        { bioguideId, congress, serviceEndDate, limit }
    );

    return rows;
}

export async function getMemberMonthlyStats(
    bioguideId,
    { congress, serviceEndDate = null } = {}
) {
    const rows = await getMemberMonthlyActivity(bioguideId, {
        congress,
        serviceEndDate,
    });

    return rows.map((row) => ({
        month: row.month,
        sponsored: row.sponsored_count,
        cosponsored: row.cosponsored_count,
    }));
}

export async function getMemberMonthlyActivity(
    bioguideId,
    { congress, serviceEndDate = null } = {}
) {
    const sql = `
    SELECT
      date_trunc('month', association_date)::date AS month,
      COUNT(DISTINCT bill_id) FILTER (WHERE my_role = 's')::int AS sponsored_count,
      COUNT(DISTINCT bill_id) FILTER (WHERE my_role = 'c')::int AS cosponsored_count,
      COUNT(DISTINCT bill_id)::int AS total_count
    FROM ${ACTIVE_VIEW_SCHEMA}.${MEMBER_BILL_ACTIVITY_VIEW}
    WHERE bioguide_id = $1
      AND congress = $2
      AND association_date IS NOT NULL
      AND ($3::date IS NULL OR association_date <= $3::date)
    GROUP BY 1
    ORDER BY month ASC;
  `;

    const { rows } = await timed(
        "memberRoute:getMemberMonthlyActivity:query",
        () => q("member:getMonthlyActivity:v3", sql, [bioguideId, congress, serviceEndDate]),
        { bioguideId, congress, serviceEndDate }
    );

    return rows;
}

export async function getMemberBills(
    bioguideId,
    { limit = 50, offset = 0, congress, serviceEndDate = null } = {}
) {
    const sql = `
    SELECT ${MEMBER_BILL_ACTIVITY_SELECT}
    FROM ${ACTIVE_VIEW_SCHEMA}.${MEMBER_BILL_ACTIVITY_VIEW}
    WHERE bioguide_id = $1
      AND congress = $2
      AND association_date IS NOT NULL
      AND ($3::date IS NULL OR association_date <= $3::date)
    ORDER BY association_date DESC NULLS LAST, latest_action_date DESC NULLS LAST, bill_id
    LIMIT $4 OFFSET $5;
  `;

    const { rows } = await timed(
        "memberRoute:getMemberBills:query",
        () => q("member:getBills:mvBillActivityV3", sql, [bioguideId, congress, serviceEndDate, limit, offset]),
        { bioguideId, congress, serviceEndDate, limit, offset }
    );

    return rows.map((row) => toItem(row));
}

export async function getMemberSponsoredLegislation(
    bioguideId,
    { congress, max = 250, serviceEndDate = null } = {}
) {
    const totalStart = performance.now();
    const queryLimit = Math.min(max, 1000);

    const sql = `
    SELECT ${MEMBER_BILL_ACTIVITY_SELECT}
    FROM ${ACTIVE_VIEW_SCHEMA}.${MEMBER_BILL_ACTIVITY_VIEW}
    WHERE bioguide_id = $1
      AND congress = $2
      AND my_role = 's'
      AND association_date IS NOT NULL
      AND ($3::date IS NULL OR association_date <= $3::date)
    ORDER BY association_date DESC NULLS LAST, latest_action_date DESC NULLS LAST, bill_id
    LIMIT $4;
  `;

    const { rows } = await timed(
        "memberRoute:getMemberSponsoredLegislation:query",
        () => q("member:getSponsored:mvBillActivityV3", sql, [bioguideId, congress, serviceEndDate, queryLimit]),
        { bioguideId, congress, serviceEndDate, max, queryLimit }
    );

    const normalized = rows.map((r) => ({
        ...r,
        subject:
            r.policy_area_name ??
            (Array.isArray(r.legislative_topics) ? r.legislative_topics[0] : null) ??
            "Uncategorized",
    }));

    const result = {
        groups: {
            policy_area: groupBySubjectWithCounts(
                normalized.map((r) => ({ ...r, subject: r.policy_area_name ?? "Uncategorized" })),
                "s"
            ),
            legislative: groupBySubjectWithCounts(
                normalized.map((r) => ({ ...r, subject: (Array.isArray(r.legislative_topics) ? r.legislative_topics[0] : null) ?? "Uncategorized" })),
                "s"
            ),
        },
        legacy: groupBySubjectWithCounts(normalized, "s"),
        items: normalized.map((r) => toItem(r, "s")),
    };

    perfLog(`memberRoute:getMemberSponsoredLegislation:total: ${Math.round(performance.now() - totalStart)}ms`, {
        bioguideId,
        congress,
        itemCount: normalized.length,
    });

    return result;
}

export async function getMemberCosponsoredLegislation(
    bioguideId,
    { congress, max = 250, serviceEndDate = null } = {}
) {
    const totalStart = performance.now();
    const queryLimit = Math.min(max, 1000);

    const sql = `
    SELECT ${MEMBER_BILL_ACTIVITY_SELECT}
    FROM ${ACTIVE_VIEW_SCHEMA}.${MEMBER_BILL_ACTIVITY_VIEW}
    WHERE bioguide_id = $1
      AND congress = $2
      AND my_role = 'c'
      AND association_date IS NOT NULL
      AND ($3::date IS NULL OR association_date <= $3::date)
    ORDER BY association_date DESC NULLS LAST, latest_action_date DESC NULLS LAST, bill_id
    LIMIT $4;
  `;

    const { rows } = await timed(
        "memberRoute:getMemberCosponsoredLegislation:query",
        () => q("member:getCosponsored:mvBillActivityV3", sql, [bioguideId, congress, serviceEndDate, queryLimit]),
        { bioguideId, congress, serviceEndDate, max, queryLimit }
    );

    const normalized = rows.map((r) => ({
        ...r,
        subject:
            r.policy_area_name ??
            (Array.isArray(r.legislative_topics) ? r.legislative_topics[0] : null) ??
            "Uncategorized",
    }));

    const result = {
        groups: {
            policy_area: groupBySubjectWithCounts(
                normalized.map((r) => ({ ...r, subject: r.policy_area_name ?? "Uncategorized" })),
                "c"
            ),
            legislative: groupBySubjectWithCounts(
                normalized.map((r) => ({ ...r, subject: (Array.isArray(r.legislative_topics) ? r.legislative_topics[0] : null) ?? "Uncategorized" })),
                "c"
            ),
        },
        legacy: groupBySubjectWithCounts(normalized, "c"),
        items: normalized.map((r) => toItem(r, "c")),
    };

    perfLog(`memberRoute:getMemberCosponsoredLegislation:total: ${Math.round(performance.now() - totalStart)}ms`, {
        bioguideId,
        congress,
        itemCount: normalized.length,
    });

    return result;
}

export async function getHouseMemberVoteAlignment(bioguideId) {
    const sql = `
    SELECT alignment_pct, attendance_pct
    FROM ${ACTIVE_VIEW_SCHEMA}.mv_member_alignment_house_v1
    WHERE bioguide_id = $1;
  `;

    const { rows } = await timed(
        "memberRoute:getHouseMemberVoteAlignment:query",
        () => q("member:getHouseVoteAlignment:mv", sql, [bioguideId]),
        { bioguideId }
    );

    return rows[0] ?? { alignment_pct: null, attendance_pct: null };
}

export async function getMemberVoteAgg(bioguideId) {
    const sql = `
    SELECT votes_total AS total_count, earliest, latest
    FROM ${ACTIVE_VIEW_SCHEMA}.mv_member_vote_agg_v1
    WHERE bioguide_id = $1;
  `;

    const { rows } = await timed(
        "memberRoute:getMemberVoteAgg:query",
        () => q("member:getVoteAgg", sql, [bioguideId]),
        { bioguideId }
    );

    return rows[0] ?? { total_count: 0, earliest: null, latest: null };
}

export async function getMemberVoteAlignment(bioguideId) {
    return getHouseMemberVoteAlignment(bioguideId);
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

    const { rows } = await timed(
        "memberRoute:getMemberKpis:query",
        () => q("member:getKpis:mv", sql, [bioguideId]),
        { bioguideId }
    );

    return rows[0] ?? null;
}

export async function getHouseMemberAlignmentPanelOverall(bioguideId) {
    const totalStart = performance.now();

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

    const { rows } = await timed(
        "memberRoute:getHouseMemberAlignmentPanelOverall:query",
        () => q("member:getAlignPanel:overall", sql, [bioguideId]),
        { bioguideId }
    );

    perfLog(`memberRoute:getHouseMemberAlignmentPanelOverall:total: ${Math.round(performance.now() - totalStart)}ms`, {
        bioguideId,
        rowCount: rows.length,
    });

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
                    : `p.considered_count DESC`;

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

    const { rows } = await timed(
        "memberRoute:getHouseMemberAlignmentByPolicy:query",
        () => q("member:getAlignPanel:policy", sql, [bioguideId, minVotes, limit]),
        { bioguideId, minVotes, sort, limit }
    );

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

    const { rows } = await timed(
        "memberRoute:getHouseMemberAlignmentTopDeviations:query",
        () => q("member:getAlignPanel:deviations", sql, [bioguideId, minVotes, limit]),
        { bioguideId, minVotes, limit }
    );

    return rows;
}