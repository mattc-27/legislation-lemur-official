import { NextResponse } from "next/server";
import { q } from "@/lib/server/db/instrumented-query";

const BILL_SEARCH_SCHEMA = "sandbox_public_v2";

function parseBillCode(input) {
  // accepts: "hr1531", "hr 1531", "H.R. 1531", "s 42", etc.
  const s = input.toLowerCase().replace(/\./g, "").trim();
  const m = s.match(/^(hr|hres|hconres|hjres|s|sres|sconres|sjres)\s*(\d+)$/i);
  if (!m) return null;
  return { type: m[1], number: m[2] };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("q") || "").trim();
  if (!raw) return NextResponse.json({ items: [] });

  const bill = parseBillCode(raw);

  // If user typed a bill code, prioritize exact matches
  if (bill) {
    const sql = `
      SELECT bill_id, congress, bill_type, bill_number, display_title, latest_action_text
      FROM ${BILL_SEARCH_SCHEMA}.bill_search_index
      WHERE lower(bill_type) = $1 AND bill_number = $2
      ORDER BY congress DESC
      LIMIT 10;
    `;
    const { rows } = await q("auto:q:billcode", sql, [bill.type, bill.number]);
    return NextResponse.json({ items: rows || [] });
  }

  // Otherwise: prefix-ish matching on display_title/title + action text.
  // Keep it cheap: ILIKE prefix for title/display_title, and contains for action text.
  const sql = `
    SELECT bill_id, congress, bill_type, bill_number, display_title, latest_action_text
    FROM ${BILL_SEARCH_SCHEMA}.bill_search_index
    WHERE
      display_title ILIKE ($1 || '%')
      OR title ILIKE ($1 || '%')
      OR latest_action_text ILIKE ('%' || $1 || '%')
    ORDER BY latest_action_date DESC NULLS LAST
    LIMIT 12;
  `;
  const { rows } = await q("auto:q:search", sql, [raw]);
  return NextResponse.json({ items: rows || [] });
}
