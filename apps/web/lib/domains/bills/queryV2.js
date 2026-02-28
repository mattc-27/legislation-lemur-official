// lib/ui/bills/query.js
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

    const toArray = (v) => {
        if (v == null) return null;
        if (Array.isArray(v)) return v.filter(Boolean);
        if (typeof v === "string" && v.includes(",")) return v.split(",").map(s => s.trim()).filter(Boolean);
        return [String(v)].filter(Boolean);
    };

    // ✅ sort allowlist (keeps URLs clean + prevents weird values)
    const sortRaw = nz(sp.sort) || "latest_action";
    const allowedSort = new Set(["latest_action", "introduced", "cosponsors", "impact", "trending"]);
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
            limit: 25,
            offset: toNum(sp.offset, 0),

            policyAreaId: toNumOrNull(sp.policyAreaId),
            statusId: toNumOrNull(sp.statusId),
            type: toArray(sp.type),
            committeeCodes: toArray(sp.committeeCodes),
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
