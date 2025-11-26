// lib/congress.js
import "server-only";
// import { pool } from "@/modules/db/db";
import { q, qExplain } from '../instrumented-query';

/* ------------------------------------------
Set to public schema, 11/25/2025
----
MATERAILIZED VIEWS using public schema tables 
For stage, remove the `_v1` 
--------------------------------------------- */

// --- Votes: recent roll calls for a member (House) --------------------------
/**
 * Return recent votes for a member, shaped for <VotesTable/>.
 * Each row has: date, chamber, roll, question (or bill title), position, result.
 */



/* House member votes */
export async function getHouseMemberVotes(
  bioguideId,
  { limit = 1000, offset = 0, verify = true } = {}
) {
  const dataSql = `
    SELECT
      vm.identifier                              AS vote_id,
      vm.voted_at,
      vm.question,
      vm.result,
      hv.choice::text                             AS choice,
      vm.session,
      vm.rollcall_number,
      vm.bill_id,
   
      CASE
        WHEN vm.bill_id IS NULL THEN NULL
        ELSE UPPER(
               REGEXP_REPLACE(
                 SPLIT_PART(vm.bill_id, '-', 1),   -- 'hr1047'
                 '^([a-z]+)(\\d+)$',
                 '\\1-\\2'
               )
             )
      END                                          AS bill_display,
      COALESCE(vm.url)             AS bill_url
    FROM public.house_member_votes hv
    JOIN public.votes_meta vm
      ON vm.congress        = hv.congress
     AND vm.chamber         = hv.chamber
     AND vm.session         = hv.session
     AND vm.rollcall_number = hv.rollcall_number
    WHERE hv.member_id = $1
    ORDER BY vm.voted_at DESC NULLS LAST
    LIMIT $2 OFFSET $3;
  `;

  const aggSql = `
    SELECT
      COUNT(*)::int       AS total_count,
      MIN(vm.voted_at)    AS earliest,
      MAX(vm.voted_at)    AS latest
    FROM public.house_member_votes hv
    JOIN public.votes_meta vm
      ON vm.congress        = hv.congress
     AND vm.chamber         = hv.chamber
     AND vm.session         = hv.session
     AND vm.rollcall_number = hv.rollcall_number
    WHERE hv.member_id = $1;
  `;

  /*     const [dataRes, aggRes] = await Promise.all([
        pool.query(dataSql, [bioguideId, limit, offset]),
        pool.query(aggSql, [bioguideId]),
      ]);
      */
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

/* Senate member votes */

export async function getSenateMemberVotes(
  bioguideId,
  { limit = 1000, offset = 0 } = {}
) {
  const sql = `
    WITH party_majorities AS (
      SELECT
        p.congress,
        p.session,
        p.rollcall_number,
        CASE
          WHEN SUM((p.choice = 'Yea')::int)
               FILTER (WHERE p.party_at_vote = 'D')
             > SUM((p.choice = 'Nay')::int)
               FILTER (WHERE p.party_at_vote = 'D')
          THEN 'Yea'
          WHEN SUM((p.choice = 'Nay')::int)
               FILTER (WHERE p.party_at_vote = 'D')
             > SUM((p.choice = 'Yea')::int)
               FILTER (WHERE p.party_at_vote = 'D')
          THEN 'Nay'
          ELSE NULL
        END AS dem_majority_position,
        CASE
          WHEN SUM((p.choice = 'Yea')::int)
               FILTER (WHERE p.party_at_vote = 'R')
             > SUM((p.choice = 'Nay')::int)
               FILTER (WHERE p.party_at_vote = 'R')
          THEN 'Yea'
          WHEN SUM((p.choice = 'Nay')::int)
               FILTER (WHERE p.party_at_vote = 'R')
             > SUM((p.choice = 'Yea')::int)
               FILTER (WHERE p.party_at_vote = 'R')
          THEN 'Nay'
          ELSE NULL
        END AS rep_majority_position,
        CASE
          WHEN SUM((p.choice = 'Yea')::int)
               FILTER (WHERE p.party_at_vote IN ('I', 'ID'))
             > SUM((p.choice = 'Nay')::int)
               FILTER (WHERE p.party_at_vote IN ('I', 'ID'))
          THEN 'Yea'
          WHEN SUM((p.choice = 'Nay')::int)
               FILTER (WHERE p.party_at_vote IN ('I', 'ID'))
             > SUM((p.choice = 'Yea')::int)
               FILTER (WHERE p.party_at_vote IN ('I', 'ID'))
          THEN 'Nay'
          ELSE NULL
        END AS ind_majority_position
      FROM public.senate_member_votes p
      GROUP BY p.congress, p.session, p.rollcall_number
    )
    SELECT
      p.congress,
      p.session,
      p.rollcall_number,
      p.voted_at,
      p.choice,
      p.party_at_vote,
      p.state_code,
      p.lis_member_id,
      COALESCE(m.document_number, m.amendment_to_document_number) AS base_measure_number,
      m.document_name AS base_measure_name,
      m.identifier    AS senate_vote_id,
      m.url           AS senate_vote_url,
      m.question_group,
      m.question_raw,
      m.result        AS vote_result,
      m.majority_position AS overall_majority_position,
      pm.dem_majority_position,
      pm.rep_majority_position,
      pm.ind_majority_position,
      CASE
        WHEN p.party_at_vote = 'D'
             AND pm.dem_majority_position IS NOT NULL
          THEN CASE
                 WHEN p.choice = pm.dem_majority_position
                   THEN 'with'
                 ELSE 'against'
               END
        WHEN p.party_at_vote = 'R'
             AND pm.rep_majority_position IS NOT NULL
          THEN CASE
                 WHEN p.choice = pm.rep_majority_position
                   THEN 'with'
                 ELSE 'against'
               END
        WHEN p.party_at_vote IN ('I', 'ID')
             AND pm.ind_majority_position IS NOT NULL
          THEN CASE
                 WHEN p.choice = pm.ind_majority_position
                   THEN 'with'
                 ELSE 'against'
               END
        ELSE 'neutral'
      END AS party_alignment
    FROM public.senate_member_votes p
    JOIN public.senate_votes_meta m
      ON (m.congress, m.session, m.rollcall_number) =
         (p.congress, p.session, p.rollcall_number)
    JOIN party_majorities pm
      ON (pm.congress, pm.session, pm.rollcall_number) =
         (p.congress, p.session, p.rollcall_number)
    WHERE p.bioguide_id = $1
    ORDER BY p.voted_at DESC
    LIMIT $2
    OFFSET $3;
  `;

  //const { rows } = await pool.query(sql, [bioguideId, limit, offset]);
  const { rows } = await q("member:getSenateVotes", sql, [bioguideId, limit, offset]);
  // Group rows by measure (each measure = one card)
  const groups = {};
  for (const r of rows) {
    const key = `${r.base_measure_number || "PN"}:${r.congress}`;
    if (!groups[key]) {
      groups[key] = {
        base_measure: r.base_measure_number || "PN",
        congress: r.congress,
        title: r.base_measure_name,
        link: r.senate_vote_url,
        stages: [],
      };
    }
    groups[key].stages.push({
      datetime: r.voted_at,
      label: r.question_group,
      question: r.question_raw,
      choice: r.choice,
      party_alignment: r.party_alignment,
      result: r.vote_result,
      roll: `${r.session}-${r.rollcall_number}`,
      vote_id: r.senate_vote_id,
      url: r.senate_vote_url,
    });
  }

  // Sort each group chronologically
  return Object.values(groups).map((g) => {
    g.stages.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    return g;
  });
}




// --- Vote alignment: % of votes matching member’s party caucus ------------- */

export async function getHouseMemberVoteAlignment(bioguideId) {
  const sql = `
  WITH member_party AS (
    SELECT
      m.bioguide_id,
      COALESCE(
        m.party_code::text,
        CASE m.party_name::text
          WHEN 'Republican'  THEN 'R'
          WHEN 'Democrat'    THEN 'D'
          WHEN 'Democratic'  THEN 'D'
          WHEN 'Independent' THEN 'I'
          ELSE NULL
        END
      ) AS party_txt
    FROM public.members m
    WHERE m.bioguide_id = $1
  ),
  party_line AS (

SELECT
vm.identifier AS vote_id,
    CASE
WHEN(j ->> 'yeaTotal') IS NULL OR(j ->> 'nayTotal') IS NULL THEN NULL
WHEN(j ->> 'yeaTotal'):: int = (j ->> 'nayTotal')::int       THEN NULL
WHEN(j ->> 'yeaTotal'):: int > (j ->> 'nayTotal')::int       THEN 'Yea'
        ELSE 'Nay'
      END AS party_line_choice
    FROM public.votes_meta vm
    JOIN member_party mp ON TRUE
    LEFT JOIN LATERAL(
    SELECT j
      FROM jsonb_array_elements(
        COALESCE(
            vm.rest -> 'votePartyTotal',
            vm.rest #> '{houseRollCallVotes,votePartyTotal}',
            '[]':: jsonb
        )
    ) AS j
      WHERE j ->> 'voteParty' = mp.party_txt
) s ON TRUE
    WHERE vm.chamber = 'House of Representatives'
  ),
  base AS(

    SELECT hv.identifier AS vote_id, hv.choice:: text AS choice_txt
    FROM public.house_member_votes hv
    WHERE hv.member_id = $1
)
SELECT
CASE
      WHEN SUM((pl.party_line_choice IS NOT NULL AND b.choice_txt IN('Yea', 'Nay'))::int ) = 0
        THEN NULL
ELSE
100.0 * SUM((pl.party_line_choice IS NOT NULL AND b.choice_txt IN('Yea', 'Nay') AND b.choice_txt = pl.party_line_choice)::int )
              / SUM( (pl.party_line_choice IS NOT NULL AND b.choice_txt IN ('Yea','Nay'))::int )
    END AS alignment_pct,
    CASE
      WHEN SUM((b.choice_txt IN('Yea', 'Nay', 'Present', 'Not Voting'))::int ) = 0
        THEN NULL
ELSE
100.0 * SUM((b.choice_txt IN('Yea', 'Nay', 'Present'))::int )
              / SUM( (b.choice_txt IN ('Yea','Nay','Present','Not Voting'))::int )
    END AS attendance_pct
  FROM base b
  LEFT JOIN party_line pl ON pl.vote_id = b.vote_id;
`;
  //  const { rows } = await pool.query(sql, [bioguideId]);
  const { rows } = await q("member:getHouseVoteAlignment", sql, [bioguideId]);
  return rows[0] ?? { alignment_pct: null, attendance_pct: null };
}




export async function getMemberVotes(bioguideId, opts = {}) {
  const chamber = await getMemberChamber(bioguideId);
  return chamber === 'Senate'
    ? getSenateMemberVotes(bioguideId, opts)
    : getHouseMemberVotes(bioguideId, opts);
}


export async function getMemberVoteAlignment(bioguideId) {
  await getHouseMemberVoteAlignment(bioguideId);
}





// ---------- Chamber lookup (kept if you still use it elsewhere) ----------
export async function getMemberChamber(bioguideId) {
  const sql = `SELECT chamber FROM public.members WHERE bioguide_id = $1 LIMIT 1`;
  let r = await q("member:getChamber", sql, [bioguideId]);
  if (r.rows.length) return r.rows[0].chamber;

  const fallback = `SELECT 1 FROM public.senate_member_id_ref WHERE bioguide_id = $1 LIMIT 1`;
  r = await q("member:getChamberFallback", fallback, [bioguideId]);
  return r.rows.length ? "Senate" : "House";
}
