// lib/server/routes/search.js

// Note: Changed member directory queries from sandbox_lemur_app_views_v1.mv_member_core_v1
// lib/server/routes/search.js

import "server-only";

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

function normalizeSeatStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  if (value === "filled") return "filled";
  if (value === "vacant") return "vacant";
  return "";
}

function normalizeMemberRow(row) {
  return {
    directoryRowId: row.directoryRowId || null,
    rowKind: row.rowKind || "member",
    districtId: row.districtId || null,

    bioguideId: row.bioguideId || null,
    name: row.name,
    party: row.party || null,
    partyName: row.partyName || null,
    state: row.state,
    stateCode: String(row.stateCode || "").toUpperCase(),
    district: row.district == null ? null : Number(row.district),
    chamber: normalizeChamber(row.chamber),

    isVacant: Boolean(row.isVacant),
    seatStatus: row.seatStatus || (row.isVacant ? "vacant" : "filled"),

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

    if (a?.isVacant && !b?.isVacant) return 1;
    if (!a?.isVacant && b?.isVacant) return -1;

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

const DIRECTORY_SELECT = `
  SELECT
    directory_row_id AS "directoryRowId",
    row_kind AS "rowKind",
    district_id AS "districtId",
    bioguide_id AS "bioguideId",
    name,
    party,
    party_name AS "partyName",
    state,
    state_code AS "stateCode",
    district,
    chamber,
    is_vacant AS "isVacant",
    seat_status AS "seatStatus",
    image_url AS "imageUrl",
    url,
    updated_at AS "updateDate"
  FROM sandbox_lemur_app_views_v1.mv_member_directory_v2
`;

const DIRECTORY_ORDER = `
  ORDER BY
    state,
    CASE
      WHEN chamber = 'Senate' THEN 0
      WHEN chamber = 'House' THEN 1
      ELSE 2
    END,
    COALESCE(district, 0),
    is_vacant,
    name
`;

export async function getMembersDirectory() {
  console.log("[getMembersDirectory]");

  const sql = `
    ${DIRECTORY_SELECT}
    WHERE state_code = ANY($1::text[])
    ${DIRECTORY_ORDER};
  `;

  const params = [[...DIRECTORY_STATE_CODES]];

  const { rows } = await q("members:getMembersDirectory", sql, params);
  return { states: groupMembersByState(rows) };
}

export async function getStateRoster(stateCode) {
  console.log("[getStateRoster]");

  const normalizedStateCode = String(stateCode || "").trim().toUpperCase();

  if (!DIRECTORY_STATE_CODES.has(normalizedStateCode)) {
    return {
      senators: [],
      representatives: [],
    };
  }

  const sql = `
    ${DIRECTORY_SELECT}
    WHERE state_code = $1
    ${DIRECTORY_ORDER};
  `;

  const { rows } = await q("members:getStateRoster", sql, [normalizedStateCode]);
  const normalizedRows = rows.map(normalizeMemberRow);

  return {
    senators: sortMembers(normalizedRows.filter((r) => r.chamber === "Senate")),
    representatives: sortMembers(normalizedRows.filter((r) => r.chamber === "House")),
  };
}

export async function searchMembers({
  q: searchQuery = "",
  state = "",
  chamber = "",
  party = "",
  seatStatus = "",
} = {}) {
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
    parts.push(`chamber = $${i++}`);
    params.push(normalizedChamber);
  }

  const normalizedSeatStatus = normalizeSeatStatus(seatStatus);
  if (normalizedSeatStatus) {
    parts.push(`seat_status = $${i++}`);
    params.push(normalizedSeatStatus);
  }

  if (party && party.trim()) {
    parts.push(`is_vacant IS FALSE`);
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
    ${DIRECTORY_SELECT}
    ${where}
    ${DIRECTORY_ORDER};
  `;

  const { rows } = await q("members:search", sql, params);
  const normalizedRows = rows.map(normalizeMemberRow);

  return {
    senators: sortMembers(normalizedRows.filter((r) => r.chamber === "Senate")),
    representatives: sortMembers(normalizedRows.filter((r) => r.chamber === "House")),
    states: groupMembersByState(normalizedRows),
  };
}

export async function getMemberRecentChanges({ limit = 12 } = {}) {
  const sql = `
    SELECT
      detected_at AS "detectedAt",
      ui_event_type AS "eventType",
      headline,
      subheadline,
      badge_label AS "badge",
      state_code AS "stateCode",
      district,
      chamber,
      district_id AS "districtId",
      is_vacant AS "isVacant",
      special_election_date AS "specialElectionDate"
    FROM sandbox_lemur_app_views_v1.v_member_recent_changes_v4
    ORDER BY detected_at DESC
    LIMIT $1;
  `;

  const { rows } = await q("members:getRecentChanges", sql, [limit]);
  return rows;
}