// lib/congress.js
import "server-only";
import { pool } from "../db";
import { q, qExplain } from "../instrumented-query";

/**
 * Current congress helper (from stage.bills_meta_import)
 */
export async function getCurrentCongress() {
    const { rows } = await pool.query(`SELECT MAX(congress)::int AS c FROM stage.bills_meta_import;`);

    return rows[0]?.c || null;
}


export async function getBillsDirectory(
    congress,
    {
        q: query = null,
        chamber = null,
        subject = null,
        from = null,
        to = null,
        minCos = 0,
        sort = "latest_action",
        limit = 25,
        offset = 0,
    } = {}
) {
    if (!congress) congress = await getCurrentCongress();

    // Choose sort key
    const order =
        sort === "introduced"
            ? `introduced_date DESC NULLS LAST, bill_id`
            : sort === "cosponsors"
                ? `cosponsor_count DESC, bill_id`
                : `latest_action_date DESC NULLS LAST, bill_id`;

    // We’ll support partial subject matches with ILIKE if desired; for exact subject, use subjects @> ARRAY[...]
    const sql = `
 WITH base AS (
 SELECT *
 FROM mv.bill_core
 WHERE congress = $1
 AND ($2::text IS NULL OR origin_chamber = $2)
 AND ($3::date IS NULL OR introduced_date >= $3::date)
 AND ($4::date IS NULL OR introduced_date <= $4::date)
 AND cosponsor_count >= $5
 AND (
 $6::text IS NULL
 OR tsv @@ websearch_to_tsquery('simple', $6)
 OR title ILIKE '%' || $6 || '%'
 OR latest_action_text ILIKE '%' || $6 || '%'
 )
 AND (
 $7::text IS NULL
 OR EXISTS (
 SELECT 1
 FROM unnest(subjects) s(subject_name)
 WHERE s.subject_name ILIKE '%' || $7 || '%'
 )
 )
 )
 SELECT *, COUNT(*) OVER() AS total_count
 FROM base
 ORDER BY ${order}
 LIMIT $8 OFFSET $9;
 `;
    const params = [congress, chamber, from, to, minCos, query, subject, limit, offset];
    const { rows } = await q("bills:directory", sql, params);
    const total = rows.length ? rows[0].total_count : 0;
    return { rows, total, congress };
}


export async function getBillsActivity(congress) {
    if (!congress) congress = await getCurrentCongress();
    const sql = `
 SELECT week, introduced, actions
 FROM mv.bill_activity_weekly
 WHERE congress = $1
 ORDER BY week;
 `;
    const { rows } = await q("bills:activity", sql, [congress]);
    return rows;
}


export async function getBillDetail({ type, number, congress }) {
    const sql = `
  SELECT bc.*, to_jsonb(bc.subjects) AS subjects
  FROM mv.bill_core bc
  WHERE bc.type = $1 AND bc.number = $2 AND bc.congress = $3
  LIMIT 1;
`;

    const { rows } = await q("bill:detail:mv", sql, [type, number, congress]);
    return rows[0] || null;
}

export async function getBillActions({ type, number, congress, limit = 50 }) {
    const sql = `
    SELECT ba.id, ba.action_date, ba.action_code, ba.action_type, ba.action_text
    FROM stage.bill_actions ba
    JOIN stage.bills_meta_import bm ON bm.bill_id = ba.bill_id
    WHERE bm.type = $1 AND bm.number = $2 AND bm.congress = $3
    ORDER BY ba.action_date DESC NULLS LAST, ba.id DESC
    LIMIT $4;
  `;
    const { rows } = await q("bill:actions", sql, [type, number, congress, limit]);
    return rows;
}

/* 
export async function getBillSummaries({ type, number, congress }) {
    const sql = `
    SELECT s.id, s.version_code, s.action_date, s.action_desc, s.update_date, s.text_html
    FROM mv.bill_latest_summary s
    JOIN stage.bills_meta_import bm ON bm.bill_id = s.bill_id
    WHERE bm.type = $1 AND bm.number = $2 AND bm.congress = $3
    LIMIT 1;
  `;
    const { rows } = await q("bill:summariesLatest:mv", sql, [type, number, congress]);
    return rows;
}
    */


export async function getBillTextVersions({ type, number, congress }) {
    const sql = `
    SELECT t.id, t.format_type, t.version_date, t.format_url
    FROM stage.bill_text_versions t
    JOIN stage.bills_meta_import bm ON bm.bill_id = t.bill_id
    WHERE bm.type = $1 AND bm.number = $2 AND bm.congress = $3
    ORDER BY t.version_date DESC, t.id DESC;
  `;
    const { rows } = await q("bill:textVersions", sql, [type, number, congress]);
    return rows;
}

export async function getBillCosponsors({ type, number, congress, limit = 50 }) {
    const sql = `
    SELECT d.member_id, d.role, d.is_original, d.joined_at, d.withdrawn_at, d.name
    FROM mv.bill_cosponsors_denorm d
    JOIN stage.bills_meta_import bm ON bm.bill_id = d.bill_id
    WHERE bm.type = $1 AND bm.number = $2 AND bm.congress = $3
    ORDER BY d.joined_at ASC
    LIMIT $4;
  `;
    const { rows } = await q("bill:cosponsors:mv", sql, [type, number, congress, limit]);
    return { rows, total: rows.length, more: rows.length === limit };
}

export async function getBillCommittees({ type, number, congress }) {
    const sql = `
    SELECT bc.id, bc.committee_name, bc.committee_chamber, bc.committee_type, bc.activities
    FROM stage.bill_committees bc
    JOIN stage.bills_meta_import bm ON bm.bill_id = bc.bill_id
    WHERE bm.type = $1 AND bm.number = $2 AND bm.congress = $3
    ORDER BY bc.id ASC;
  `;
    const { rows } = await q("bill:committees", sql, [type, number, congress]);
    return rows;
}


export async function getBillRelated({ type, number, congress }) {
    const sql = `
    SELECT r.id, r.related_bill_id, r.related_type, r.related_number, r.related_congress,
           r.relationship_type, r.latest_action_text, r.latest_action_date
    FROM stage.related_bills r
    JOIN stage.bills_meta_import bm ON bm.bill_id = r.bill_id
    WHERE bm.type = $1 AND bm.number = $2 AND bm.congress = $3
    ORDER BY r.latest_action_date DESC NULLS LAST, r.id DESC;
  `;
    const { rows } = await q("bill:related", sql, [type, number, congress]);
    return rows;
}
