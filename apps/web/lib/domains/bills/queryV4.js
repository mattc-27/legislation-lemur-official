// lib/domains/bills/queryV3.js
// Server-safe helpers for parsing bill directory search params + building pagination hrefs.

export function parseBillsFiltersV2(searchParams) {
    const sp = searchParams || {};
    const nz = (v) => (v === "" || v == null ? null : v);

    const toNumOrNull = (v) => {
        if (v === "" || v == null) return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    };

    const toNum = (v, d = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : d;
    };

    const clampLimit = (v, d = 25) => {
        const n = toNum(v, d);
        return Math.min(Math.max(n, 1), 100);
    };

    const toArray = (v) => {
        if (v == null) return null;
        if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
        if (typeof v === "string" && v.includes(",")) {
            return v.split(",").map((s) => s.trim()).filter(Boolean);
        }
        return [String(v).trim()].filter(Boolean);
    };

    const toBool = (v) => v === true || v === "true" || v === "1" || v === "on";

    const sortRaw = nz(sp.sort) || "latest_action";
    const allowedSort = new Set([
        "latest_action",
        "introduced",
        "cosponsors",
        "impact",
        "trending",
    ]);

    const sort = allowedSort.has(sortRaw) ? sortRaw : "latest_action";

    return {
        filters: {
            q: nz(sp.q),
            chamber: nz(sp.chamber),
            subject: nz(sp.subject),
            from: nz(sp.from),
            to: nz(sp.to),
            minCos: toNum(sp.minCos, 0),
            sort,
            limit: clampLimit(sp.limit, 25),
            offset: Math.max(0, toNum(sp.offset, 0)),

            policyAreaId: toNumOrNull(sp.policyAreaId),
            statusId: toNumOrNull(sp.statusId),
            type: toArray(sp.type),
            committeeCodes: toArray(sp.committeeCodes),

            hasSummary: toBool(sp.hasSummary),
        },
        raw: sp,
    };
}

export function buildBillsPagination(searchParams, { limit } = { limit: 25 }) {
    const sp = searchParams || {};
    const baseParams = new URLSearchParams();

    for (const [k, v] of Object.entries(sp)) {
        if (v == null || v === "") continue;

        if (Array.isArray(v)) {
            for (const item of v) {
                if (item != null && item !== "") baseParams.append(k, String(item));
            }
        } else {
            baseParams.set(k, String(v));
        }
    }

    baseParams.delete("offset");
    baseParams.delete("limit");

    const withOffset = (o) => {
        const p = new URLSearchParams(baseParams.toString());
        p.set("offset", String(Math.max(0, o)));
        p.set("limit", String(limit));
        return `/bills?${p.toString()}`;
    };

    return { withOffset, baseParams };
}