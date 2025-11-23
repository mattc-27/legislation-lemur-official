// lib/congress.js
import "server-only";
// import { pool } from "@/modules/db/db";
import * as Sentry from "@sentry/nextjs";
import { q, qExplain } from "../instrumented-query";


export async function getStateRoster(stateCode) {
  const sql = `
    SELECT
      bioguide_id        AS "bioguideId",
      name,
      party              AS party,
      party_name         AS "partyName",
      state,
      state_code         AS "stateCode",
      district,
      chamber            AS chamber,
      image_url          AS "imageUrl",
      url
    FROM mv.member_core
    WHERE state_code = $1
    ORDER BY
      CASE WHEN chamber = 'Senate' THEN 0 ELSE 1 END,
      COALESCE(district, 0),
      name;
  `;

  try {
    const { rows } = await q("members:getStateRoster", sql, [String(stateCode || "").toUpperCase()]);
    return {
      senators: rows.filter(r => r.chamber === "Senate"),
      representatives: rows.filter(r => r.chamber !== "Senate"),
    };
  } catch (err) {
    Sentry.captureException(err, {
      tags: { helper: "getStateRoster" },
      extra: { congress },
    });
    throw err; // rethrow so Next still returns a 500 and surfaces it
  }


}


export async function searchMembers({ q = "", state = "", chamber = "", party = "" } = {}) {
  const parts = [];
  const params = [];
  let i = 1;

  if (state && state.trim()) {
    parts.push(`state_code = $${i++}`);
    params.push(state.trim().toUpperCase());
  }
  if (chamber && chamber.trim()) {
    parts.push(`chamber = $${i++}`);
    params.push(chamber.trim());
  }
  if (party && party.trim()) {
    parts.push(`party = $${i++}`);
    params.push(party.trim().toUpperCase());
  }

  // text search: prefer tsquery, fallback to trigram contains
  const hasQ = q && q.trim();
  if (hasQ) {
    parts.push(`(
      tsv @@ websearch_to_tsquery('simple', unaccent($${i}))
      OR search_name ILIKE unaccent('%' || lower($${i}) || '%')
    )`);
    params.push(q.trim());
    i++;
  }

  const where = parts.length ? `WHERE ${parts.join(" AND ")}` : "";

  const sql = `
    SELECT
      bioguide_id   AS "bioguideId",
      name,
      party         AS party,
      state,
      state_code    AS "stateCode",
      district,
      chamber       AS chamber,
      image_url     AS "imageUrl",
      url
    FROM mv.member_core
    ${where}
    ORDER BY
      CASE WHEN chamber = 'Senate' THEN 0 ELSE 1 END,
      COALESCE(district, 0),
      name;
  `;
  try {
    const { rows } = await q("members:search", sql, params);
    return {
      senators: rows.filter(r => r.chamber === "Senate"),
      representatives: rows.filter(r => r.chamber !== "Senate"),
    };
  } catch (err) {
    Sentry.captureException(err, {
      tags: { helper: "searchMembers" },
      extra: { congress },
    });
    throw err; // rethrow so Next still returns a 500 and surfaces it
  }
}