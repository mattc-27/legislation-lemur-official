// apps/web/lib/home.js

const API_BASE = "https://api.congress.gov/v3";
const API_KEY = process.env.CONGRESS_API_KEY;

/**
 * Build a URL with api_key + arbitrary params
 */
function makeUrl(path, params = {}) {
    const sp = new URLSearchParams({ api_key: API_KEY });
    for (const [k, v] of Object.entries(params)) {
        if (v == null) continue;
        sp.set(k, String(v));
    }
    return `${API_BASE}${path}?${sp.toString()}`;
}

async function apiFetch(path, params = {}, { revalidate = 1800 } = {}) {
    if (!API_KEY) throw new Error("Missing CONGRESS_API_KEY in environment");
    const url = makeUrl(path, params);
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Congress.gov ${res.status} on ${path}: ${body}`);
    }
    return res.json();
}


/**
 * Fetch “recent bills” for the current Congress (119) ordered by latest update.
 * We use a rolling window (last 14 days) + limit for speed.
 */
async function fetchRecentBills({ days = 14, limit = 50, revalidate = 1800 } = {}) {
    const now = new Date();
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const toISO = (d) => d.toISOString().replace(/\.\d{3}Z$/, "Z"); // trim ms

    // Congress.gov supports list by congress with date window + sort by updateDate
    // e.g. /v3/bill/117?fromDateTime=...&toDateTime=...&sort=updateDate+desc&limit=...
    const json = await apiFetch(
        `/bill/119`,
        {
            fromDateTime: toISO(from),
            toDateTime: toISO(now),
            sort: "updateDate desc",
            limit,
        },
        { revalidate }
    );

    return json?.bills || json?.data?.bills || [];
}

/* ---------- shaping helpers ---------- */

function toBillLite(b) {
    const congress = b.congress || b.Congress;
    const billType = b.billType || b.type || b.bill_type;
    const number = b.number || b.billNumber;
    const id = [congress, billType, number].filter(Boolean).join("-");

    // Try reasonable title fallbacks
    const title =
        b.title ||
        b.titles?.title ||
        (Array.isArray(b.titles?.item) ? b.titles.item[0]?.title : null) ||
        b.shortTitle ||
        b.short_title ||
        "(Untitled bill)";

    return {
        id,
        congress,
        billType,
        number,
        title,
        href:
            congress && billType && number
                ? `/bill/${congress}/${billType}/${number}`
                : undefined,
        updateDate: b.updateDate || b.latestAction?.actionDate || null,
    };
}

function toActionLite(b) {
    const la = b.latestAction || b.latest_action || {};
    const congress = b.congress || b.Congress;
    const billType = b.billType || b.type || b.bill_type;
    const number = b.number || b.billNumber;

    return {
        date: la.actionDate || la.date || null,
        label: la.text || la.description || "Action",
        href:
            congress && billType && number
                ? `/bill/${congress}/${billType}/${number}`
                : "#",
    };
}
/* ---------- public API used by <RecentActivity /> ---------- */

/**
 * getHomeSnapshot()
 * Returns:
 *   {
 *     bills: [{ id, title, href, updateDate }],
 *     actions: [{ date, label, href }]
 *   }
 */
export async function getHomeSnapshot({ days = 14, limit = 50 } = {}) {
    const list = await fetchRecentBills({ days, limit });
    const bills = list.map(toBillLite);
    // De-dup actions by (href + date + label) and keep the newest first
    const seen = new Set();
    const actions = [];
    for (const b of list) {
        const a = toActionLite(b);
        const key = `${a.href}|${a.date}|${a.label}`;
        if (!seen.has(key)) {
            seen.add(key);
            actions.push(a);
        }
    }
    // Sort newest first by date if present
    actions.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));

    return { bills, actions };
}
