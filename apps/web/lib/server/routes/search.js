// lib/congress.js
import "server-only";

import { pool } from "../db/db";
import { q } from "../db/instrumented-query";


export async function getStateRoster(stateCode) {

  console.log("[getStateRoster]");

  // 1) DB identity probe (same connection via q())
  try {
    const identSql = `
      select
        current_user,
        session_user,
        current_database() as db,
        inet_server_addr() as server_ip
    `;
    const ident = await q("debug:identity", identSql, []);
    console.log("[db identity]", ident.rows?.[0]);
  } catch (e) {
    console.log("[db identity] probe failed", e);
  }


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
    FROM sandbox_lemur_app_views_v1.mv_member_core_v1
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
    console.log(err);
  }
  throw err; // rethrow so Next still returns a 500 and surfaces it
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
    FROM sandbox_lemur_app_views_v1.member_core_v1
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
    console.log(err);
  }
  throw err; // rethrow so Next still returns a 500 and surfaces it
}
