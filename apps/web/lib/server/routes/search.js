// lib/server/routes/search.js
import "server-only";

import { pool } from "../db/db";
import { q } from "../db/instrumented-query";

const DIRECTORY_STATE_CODES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC",
]);

function normalizeChamber(chamber) {
  const value = String(chamber || "").trim();

  if (value === "Senate") return "Senate";
  if (value === "House" || value === "House of Representatives") return "House";

  return value;
}

function normalizeMemberRow(row) {
  return {
    bioguideId: row.bioguideId,
    name: row.name,
    party: row.party || null,
    partyName: row.partyName || null,
    state: row.state,
    stateCode: String(row.stateCode || "").toUpperCase(),
    district: row.district == null ? null : Number(row.district),
    chamber: normalizeChamber(row.chamber),
    imageUrl: row.imageUrl || null,
    url: row.url || null,
    updateDate: row.updateDate || null,
  };
}

function sortMembers(list) {
  return [...list].sort((a, b) => {
    const chamberA = normalizeChamber(a?.chamber);
    const chamberB = normalizeChamber(b?.chamber);

    if (chamberA !== chamberB) {
      if (chamberA === "Senate") return -1;
      if (chamberB === "Senate") return 1;
      return chamberA.localeCompare(chamberB);
    }

    const districtA = Number(a?.district);
    const districtB = Number(b?.district);

    if (Number.isFinite(districtA) && Number.isFinite(districtB) && districtA !== districtB) {
      return districtA - districtB;
    }

    if (Number.isFinite(districtA) && !Number.isFinite(districtB)) return -1;
    if (!Number.isFinite(districtA) && Number.isFinite(districtB)) return 1;

    return String(a?.name || "").localeCompare(String(b?.name || ""));
  });
}

function groupMembersByState(rows) {
  const byState = new Map();

  rows.forEach((rawRow) => {
    const row = normalizeMemberRow(rawRow);

    if (!DIRECTORY_STATE_CODES.has(row.stateCode)) return;

    if (!byState.has(row.stateCode)) {
      byState.set(row.stateCode, {
        state: row.state,
        stateCode: row.stateCode,
        senators: [],
        representatives: [],
      });
    }

    const stateGroup = byState.get(row.stateCode);

    if (row.chamber === "Senate") {
      stateGroup.senators.push(row);
    } else if (row.chamber === "House") {
      stateGroup.representatives.push(row);
    }
  });

  return [...byState.values()]
    .map((state) => ({
      ...state,
      senators: sortMembers(state.senators),
      representatives: sortMembers(state.representatives),
    }))
    .sort((a, b) => String(a.state || "").localeCompare(String(b.state || "")));
}

export async function getMembersDirectory() {
  console.log("[getMembersDirectory]");

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
      bioguide_id AS "bioguideId",
      name,
      party AS party,
      party_name AS "partyName",
      state,
      state_code AS "stateCode",
      district,
      chamber AS chamber,
      image_url AS "imageUrl",
      url,
      NULL::timestamptz AS "updateDate"
    FROM sandbox_lemur_app_views_v1.mv_member_core_v1
    WHERE state_code = ANY($1::text[])
    ORDER BY
      state,
      CASE
        WHEN chamber = 'Senate' THEN 0
        WHEN chamber = 'House' THEN 1
        WHEN chamber = 'House of Representatives' THEN 1
        ELSE 2
      END,
      COALESCE(district, 0),
      name;
  `;

  const params = [[...DIRECTORY_STATE_CODES]];

  try {
    const { rows } = await q("members:getMembersDirectory", sql, params);
    return { states: groupMembersByState(rows) };
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function getStateRoster(stateCode) {
  console.log("[getStateRoster]");

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

  const normalizedStateCode = String(stateCode || "").trim().toUpperCase();

  if (!DIRECTORY_STATE_CODES.has(normalizedStateCode)) {
    return {
      senators: [],
      representatives: [],
    };
  }

  const sql = `
    SELECT
      bioguide_id AS "bioguideId",
      name,
      party AS party,
      party_name AS "partyName",
      state,
      state_code AS "stateCode",
      district,
      chamber AS chamber,
      image_url AS "imageUrl",
      url,
      NULL::timestamptz AS "updateDate"
    FROM sandbox_lemur_app_views_v1.mv_member_core_v1
    WHERE state_code = $1
    ORDER BY
      CASE
        WHEN chamber = 'Senate' THEN 0
        WHEN chamber = 'House' THEN 1
        WHEN chamber = 'House of Representatives' THEN 1
        ELSE 2
      END,
      COALESCE(district, 0),
      name;
  `;

  try {
    const { rows } = await q("members:getStateRoster", sql, [normalizedStateCode]);
    const normalizedRows = rows.map(normalizeMemberRow);

    return {
      senators: sortMembers(normalizedRows.filter((r) => r.chamber === "Senate")),
      representatives: sortMembers(normalizedRows.filter((r) => r.chamber === "House")),
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function searchMembers({ q: searchQuery = "", state = "", chamber = "", party = "" } = {}) {
  const parts = [];
  const params = [];
  let i = 1;

  parts.push(`state_code = ANY($${i++}::text[])`);
  params.push([...DIRECTORY_STATE_CODES]);

  if (state && state.trim()) {
    parts.push(`state_code = $${i++}`);
    params.push(state.trim().toUpperCase());
  }

  const normalizedChamber = normalizeChamber(chamber);
  if (normalizedChamber) {
    if (normalizedChamber === "House") {
      parts.push(`chamber IN ('House', 'House of Representatives')`);
    } else {
      parts.push(`chamber = $${i++}`);
      params.push(normalizedChamber);
    }
  }

  if (party && party.trim()) {
    parts.push(`party = $${i++}`);
    params.push(party.trim().toUpperCase());
  }

  const hasQ = searchQuery && searchQuery.trim();
  if (hasQ) {
    parts.push(`(
      tsv @@ websearch_to_tsquery('simple', unaccent($${i}))
      OR search_name ILIKE unaccent('%' || lower($${i}) || '%')
      OR state ILIKE unaccent('%' || $${i} || '%')
      OR state_code ILIKE unaccent('%' || $${i} || '%')
      OR CAST(COALESCE(district, 0) AS text) = regexp_replace($${i}, '[^0-9]', '', 'g')
    )`);
    params.push(searchQuery.trim());
    i++;
  }

  const where = parts.length ? `WHERE ${parts.join(" AND ")}` : "";

  const sql = `
    SELECT
      bioguide_id AS "bioguideId",
      name,
      party AS party,
      party_name AS "partyName",
      state,
      state_code AS "stateCode",
      district,
      chamber AS chamber,
      image_url AS "imageUrl",
      url,
      NULL::timestamptz AS "updateDate"
    FROM sandbox_lemur_app_views_v1.mv_member_core_v1
    ${where}
    ORDER BY
      state,
      CASE
        WHEN chamber = 'Senate' THEN 0
        WHEN chamber = 'House' THEN 1
        WHEN chamber = 'House of Representatives' THEN 1
        ELSE 2
      END,
      COALESCE(district, 0),
      name;
  `;

  try {
    const { rows } = await q("members:search", sql, params);
    const normalizedRows = rows.map(normalizeMemberRow);

    return {
      senators: sortMembers(normalizedRows.filter((r) => r.chamber === "Senate")),
      representatives: sortMembers(normalizedRows.filter((r) => r.chamber === "House")),
      states: groupMembersByState(normalizedRows),
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
}