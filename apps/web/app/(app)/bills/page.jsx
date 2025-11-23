// app/(app)/search/page.jsx
{/* 
import relevent functions from @/lib/congress.js containing pool.query logic  
*/}
import Link from "next/link";
// import { getBillsDirectory, getBillsActivity } from '@/lib/server/legislation';
import { getBillsActivity, getBillsDirectory } from '../../../lib/server/bills';

import "../../../lib/stylesheets/refactored/home-styles.refactored.css";   // reuse hero/searchbox visuals
import "../../../lib/stylesheets/refactored/search-styles.refactored.css"; // page-specific tweaks]
import "../../../lib/stylesheets/refactored/ui-controls.css";
import '../../../lib/stylesheets/bill-page.css';

import BillActivityMini from "@/app/components/bills/BillActivityMini";

// helpers
const fmtDate = (d) => {
    if (!d) return "";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toISOString().slice(0, 10); // YYYY-MM-DD
};

export const revalidate = 600;

export default async function BillsPage({ searchParams }) {
    // ✅ Next 15: await first
    const sp = await searchParams;

    const nz = (v) => (v === "" ? null : v);
    const toNum = (v, d = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : d;
    };

    const filters = {
        q: nz(sp?.q),
        chamber: nz(sp?.chamber),
        subject: nz(sp?.subject),
        from: nz(sp?.from),
        to: nz(sp?.to),
        minCos: toNum(sp?.minCos, 0),
        sort: nz(sp?.sort) || "latest_action",
        limit: 25,
        offset: toNum(sp?.offset, 0),
    };

    const [{ rows, total, congress }, activity] = await Promise.all([
        getBillsDirectory(null, filters),
        getBillsActivity(null),
    ]);

    // ---- Build JSON-clean pagination hrefs (strings) ----
    // Start from awaited `sp`, not the raw `searchParams` prop.
    const baseParams = new URLSearchParams();
    for (const [k, v] of Object.entries(sp || {})) {
        if (v != null && v !== "") baseParams.set(k, String(v));
    }
    // We control these explicitly
    baseParams.delete("offset");
    baseParams.delete("limit");

    const withOffset = (o) => {
        const p = new URLSearchParams(baseParams.toString());
        p.set("offset", String(Math.max(0, o)));
        p.set("limit", String(filters.limit));
        return `/bills?${p.toString()}`;
    };

    return (
        <div className="container stack-32 bills-page">
            <header className="search-header">
                <h1 className="section__title">Legislation Archive (Congress {congress})</h1>
                <p className="section__sub">Browse bills by topic, chamber, and recent activity.</p>
            </header>

            <section className="panel panel--frost">
                <form className="filters filters__grid" method="get">
                    <input
                        name="q"
                        defaultValue={filters.q || ""}
                        className="field field--grow"
                        placeholder="Search title, actions, or topic"
                    />

                    <select
                        name="chamber"
                        defaultValue={filters.chamber || ""}
                        className="field"
                    >
                        <option value="">All Chambers</option>
                        <option value="House">House</option>
                        <option value="Senate">Senate</option>
                    </select>

                    <input
                        name="subject"
                        defaultValue={filters.subject || ""}
                        className="field"
                        placeholder="Subject (e.g., Energy)"
                    />

                    <input
                        type="date"
                        name="from"
                        defaultValue={filters.from || ""}
                        className="field field--sm"
                    />
                    <input
                        type="date"
                        name="to"
                        defaultValue={filters.to || ""}
                        className="field field--sm"
                    />

                    <input
                        type="number"
                        min="0"
                        name="minCos"
                        defaultValue={filters.minCos}
                        className="field field--sm"
                        placeholder="Min cosponsors"
                    />

                    <select
                        name="sort"
                        defaultValue={filters.sort}
                        className="field"
                    >
                        <option value="latest_action">Sort: Latest action</option>
                        <option value="introduced">Sort: Introduced</option>
                        <option value="cosponsors">Sort: Cosponsors</option>
                    </select>

                    <div className="filters__actions">
                        <button className="btn btn--primary btn--full-sm" type="submit">
                            Apply
                        </button>
                    </div>
                </form>
            </section>

            {/* Mini activity chart */}
            <section className="panel">
                <div className="panel__header">
                    <h2 className="panel__title">Recent Activity (12 weeks)</h2>
                </div>
                <BillActivityMini data={activity} />
            </section>

            {/* Results table */}
            <section className="panel">
                <div className="panel__header">
                    <h2 className="panel__title">Bills ({total})</h2>
                </div>
                <div className="table table--bills">
                    <div className="table__head">
                        <div>Bill</div>
                        <div>Title</div>
                        <div>Status</div>
                        <div>Introduced</div>
                        <div>Latest action</div>
                        <div>Cosponsors</div>
                        <div>Subjects</div>
                    </div>
                    <div className="table__body">
                        {rows.map((r) => {
                            const slug = `${r.type}-${r.number}-${r.congress}`.toLowerCase();
                            const statusLabel = (r.status_code || "").replace("_", " ");
                            return (
                                <div key={r.bill_id} className="table__row">
                                    <div className="cell cell--bill">
                                        <Link href={`/bills/${slug}`}>{`${r.type.toUpperCase()}. ${r.number} (${r.congress})`}</Link>
                                        <div className={`pill pill--${(r.origin_chamber || "").toLowerCase()}`}>
                                            {r.origin_chamber}
                                        </div>
                                    </div>
                                    <div className="cell cell--title">{r.title}</div>
                                    <div className="cell">
                                        <span className={`status status--${r.status_code}`}>{statusLabel}</span>
                                    </div>
                                    <div className="cell">{fmtDate(r.introduced_date)}</div>
                                    <div className="cell">
                                        <div className="muted small">{fmtDate(r.latest_action_date)}</div>
                                        <div className="truncate-2">{r.latest_action_text}</div>
                                    </div>
                                    <div className="cell">{r.cosponsor_count}</div>
                                    <div className="cell">
                                        {(r.subjects || []).slice(0, 3).map((s, i) => (
                                            <span key={i} className="chip">
                                                {typeof s === "string" ? s : s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Pagination — pass plain string hrefs */}
            <div className="pager">
                {filters.offset > 0 && (
                    <Link className="btn btn--ghost" href={withOffset(filters.offset - filters.limit)}>
                        Prev
                    </Link>
                )}
                {filters.offset + rows.length < total && (
                    <Link className="btn btn--ghost" href={withOffset(filters.offset + filters.limit)}>
                        Next
                    </Link>
                )}
            </div>
        </div>
    );
}