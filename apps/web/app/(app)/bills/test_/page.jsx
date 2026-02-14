// app/(app)/search/page.jsx
{/* 
import relevent functions from @/lib/congress.js containing pool.query logic  
*/}
import Link from "next/link";

import { getBillsActivity, getBillsDirectory } from "@/lib/server/routes_stage/bills";
import { getViewsFreshness, formatAsOfMMDDYYYY } from "@/lib/server/routes/viewStatus";
import { parseBillsFilters, buildBillsPagination } from "@/lib/domains/bills/query";

import BillCard from "@/app/components/features/bills/BillCard";
import DensityToggleClient from '@/app/components/features/bills/DensityToggleClient';
import BillActivityChart from "@/app/components/features/bills/BillActivityChart";

import RefineResultsBarClient from '@/app/components/features/bills/RefineResultsBarClient';
import SubjectsTrendSection from "@/app/components/features/home/SubjectsTrendSection";
import '@/app/styles/legacy_refactor/home-styles.refactored.css'
import '@/app/styles/active/ll-bills-archive.css';
import '@/app/styles/active/bills-directory.ll3.css';

/* --- IGNORE ---------------------------------------------------------------------
import "../../../lib/stylesheets/refactored/search-styles.refactored.css";
import "../../../lib/stylesheets/refactored/ui-controls.css";
import '../../../lib/stylesheets/bill-page.css';

import SaveBillButtonClient from '../../components/bills/SaveBillButtonClient';
import BillActivityMini from "@/app/components/bills/BillActivityMini";
------------------------------------------------------------------------------------ */



export const revalidate = 600;

// ---------- client bits (density + save/watch) ---------- 


export default async function BillsPage({ searchParams }) {
    // ✅ Next 15: await first
    const sp = await searchParams;


    const { filters } = parseBillsFilters(sp);
    const { withOffset } = buildBillsPagination(sp, { limit: filters.limit });

    const [dirRes, activity, freshness] = await Promise.all([
        getBillsDirectory(null, filters),
        getBillsActivity(null),
        getViewsFreshness([
            "mv_bill_core_v1",
            "mv_bill_activity_weekly_v1",
        ]),
    ]);

    const { rows, total, congress } = dirRes;

    const asOfText = formatAsOfMMDDYYYY(freshness.asOf);
    const activityAsOfText = formatAsOfMMDDYYYY(freshness.perView?.mv_bill_activity_weekly_v1);

    const CURRENT_CONGRESS = 119;


    return (
        <div className="ll3-bills">
            <header className="ll3-head">
                <div className="ll3-head__top">
                    <h1 className="ll3-h1">
                        Legislation Archive <span className="ll3-h1__sep" aria-hidden="true">|</span>{" "}
                        <span className="ll3-h1__meta">{congress}th Congress</span>
                    </h1>

                    <div className="ll3-head__meta">
                        <span className="ll3-kpi">
                            <span className="ll3-kpi__label">Bills</span>
                            <span className="ll3-kpi__value">{total}</span>
                        </span>

                        {asOfText && (
                            <span className="ll3-freshness">
                                Data current as of <strong className="ll3-strong">{asOfText}</strong>
                            </span>
                        )}
                    </div>
                </div>

                <p className="ll3-sub">Browse bills by topic, chamber, and recent activity.</p>
            </header>

            {/* =========================================
          Control section (desktop + chart)
          - Mobile CSS should hide this filter panel and keep chart as "Highlights"
         ========================================= */}
            <section className="ll3-control">
                <div className="ll3-control__panel">
                    <div className="ll3-control__header">
                        <div>
                            <h2 className="ll3-h2">Refine</h2>
                            <p className="ll3-muted">Search and filter, then browse the cards below.</p>
                        </div>
                        <DensityToggleClient />
                    </div>

                    <form className="ll3-filters" method="get">
                        <div className="ll3-field ll3-field--span2">
                            <label className="ll3-label" htmlFor="q_desktop">
                                Search
                            </label>
                            <input
                                id="q_desktop"
                                name="q"
                                defaultValue={filters.q || ""}
                                className="ll3-input"
                                placeholder="Search title, actions, or topic"
                            />
                        </div>

                        <div className="ll3-field">
                            <label className="ll3-label" htmlFor="chamber_desktop">
                                Chamber
                            </label>
                            <select
                                id="chamber_desktop"
                                name="chamber"
                                defaultValue={filters.chamber || ""}
                                className="ll3-input"
                            >
                                <option value="">All Chambers</option>
                                <option value="House">House</option>
                                <option value="Senate">Senate</option>
                            </select>
                        </div>

                        <div className="ll3-field">
                            <label className="ll3-label" htmlFor="subject_desktop">
                                Subject
                            </label>
                            <input
                                id="subject_desktop"
                                name="subject"
                                defaultValue={filters.subject || ""}
                                className="ll3-input"
                                placeholder="Energy, Health, Taxes…"
                            />
                        </div>

                        <div className="ll3-field">
                            <label className="ll3-label" htmlFor="from_desktop">
                                From
                            </label>
                            <input
                                id="from_desktop"
                                type="date"
                                name="from"
                                defaultValue={filters.from || ""}
                                className="ll3-input"
                            />
                        </div>

                        <div className="ll3-field">
                            <label className="ll3-label" htmlFor="to_desktop">
                                To
                            </label>
                            <input id="to_desktop" type="date" name="to" defaultValue={filters.to || ""} className="ll3-input" />
                        </div>

                        <div className="ll3-field">
                            <label className="ll3-label" htmlFor="minCos_desktop">
                                Min cosponsors
                            </label>
                            <input
                                id="minCos_desktop"
                                type="number"
                                min="0"
                                name="minCos"
                                defaultValue={filters.minCos}
                                className="ll3-input"
                                placeholder="0"
                            />
                        </div>

                        <div className="ll3-field">
                            <label className="ll3-label" htmlFor="sort_desktop">
                                Sort
                            </label>
                            <select id="sort_desktop" name="sort" defaultValue={filters.sort} className="ll3-input">
                                <option value="latest_action">Latest action</option>
                                <option value="introduced">Introduced</option>
                                <option value="cosponsors">Cosponsors</option>
                            </select>
                        </div>

                        <div className="ll3-actions">
                            <button className="ll3-btn ll3-btn--primary ll3-btn--full" type="submit">
                                Apply filters
                            </button>
                            <Link className="ll3-btn ll3-btn--ghost ll3-btn--full ll3-only-desktop" href="/bills">
                                Reset
                            </Link>
                        </div>
                    </form>
                </div>

                <div className="ll3-control__panel ll3-control__panel--chart">
                    {/* <div className="ll3-control__header">
                        <div>
                            <h2 className="ll3-h2">Recent activity</h2>
                            <p className="ll3-muted">Introduced vs actions (last 12 weeks).</p>
                            {activityAsOfText && (
                                <p className="ll3-muted ll3-freshness--sub">
                                    Activity updated through <strong className="ll3-strong">{activityAsOfText}</strong>
                                </p>
                            )}
                        </div>
                    </div>*/}
                    <SubjectsTrendSection congress={CURRENT_CONGRESS} activityAsOfText={activityAsOfText} />
                    {/* <BillActivityChart data={activity} />*/}
                </div>
            </section>

            <section className="ll3-results">
                <div className="ll3-results__header">
                    <h2 className="ll3-h2">Bills</h2>
                    <div className="ll3-results__meta">
                        <span className="ll3-muted">
                            Showing <strong className="ll3-strong">{rows.length}</strong> of{" "}
                            <strong className="ll3-strong">{total}</strong>
                        </span>
                    </div>
                </div>

                {/* ✅ NEW: Mobile sticky refine bar + controlled bottom sheet */}
                <RefineResultsBarClient label="Bills" hint="Tap to refine results">
                    <div className="ll3-control__panel">
                        <div className="ll3-control__header">
                            <div>
                                <h2 className="ll3-h2">Refine</h2>
                                <p className="ll3-muted">Search and filter, then browse the cards below.</p>
                            </div>
                            <DensityToggleClient />
                        </div>

                        <form className="ll3-filters" method="get">
                            <div className="ll3-field ll3-field--span2">
                                <label className="ll3-label" htmlFor="q">
                                    Search
                                </label>
                                <input
                                    id="q"
                                    name="q"
                                    defaultValue={filters.q || ""}
                                    className="ll3-input"
                                    placeholder="Search title, actions, or topic"
                                />
                            </div>

                            <div className="ll3-field">
                                <label className="ll3-label" htmlFor="chamber">
                                    Chamber
                                </label>
                                <select id="chamber" name="chamber" defaultValue={filters.chamber || ""} className="ll3-input">
                                    <option value="">All Chambers</option>
                                    <option value="House">House</option>
                                    <option value="Senate">Senate</option>
                                </select>
                            </div>

                            <div className="ll3-field">
                                <label className="ll3-label" htmlFor="subject">
                                    Subject
                                </label>
                                <input
                                    id="subject"
                                    name="subject"
                                    defaultValue={filters.subject || ""}
                                    className="ll3-input"
                                    placeholder="Energy, Health, Taxes…"
                                />
                            </div>

                            <div className="ll3-field">
                                <label className="ll3-label" htmlFor="from">
                                    From
                                </label>
                                <input id="from" type="date" name="from" defaultValue={filters.from || ""} className="ll3-input" />
                            </div>

                            <div className="ll3-field">
                                <label className="ll3-label" htmlFor="to">
                                    To
                                </label>
                                <input id="to" type="date" name="to" defaultValue={filters.to || ""} className="ll3-input" />
                            </div>

                            <div className="ll3-field">
                                <label className="ll3-label" htmlFor="minCos">
                                    Min cosponsors
                                </label>
                                <input
                                    id="minCos"
                                    type="number"
                                    min="0"
                                    name="minCos"
                                    defaultValue={filters.minCos}
                                    className="ll3-input"
                                    placeholder="0"
                                />
                            </div>

                            <div className="ll3-field">
                                <label className="ll3-label" htmlFor="sort">
                                    Sort
                                </label>
                                <select id="sort" name="sort" defaultValue={filters.sort} className="ll3-input">
                                    <option value="latest_action">Latest action</option>
                                    <option value="introduced">Introduced</option>
                                    <option value="cosponsors">Cosponsors</option>
                                </select>
                            </div>

                            <div className="ll3-actions">
                                <button className="ll3-btn ll3-btn--primary ll3-btn--full" type="submit">
                                    Apply filters
                                </button>
                                {/* Reset is still useful inside sheet on mobile */}
                                <Link className="ll3-btn ll3-btn--ghost ll3-btn--full" href="/bills">
                                    Reset
                                </Link>
                            </div>
                        </form>
                    </div>
                </RefineResultsBarClient>

                <div className="ll3-cards" role="list">
                    {rows.map((r) => {
                        const billKey = r.bill_id || `${r.type}-${r.number}-${r.congress}`.toLowerCase();
                        return <BillCard key={billKey} bill={r} />;
                    })}
                </div>

                <div className="ll3-pager">
                    {filters.offset > 0 && (
                        <Link className="ll3-btn ll3-btn--ghost" href={withOffset(filters.offset - filters.limit)}>
                            Prev
                        </Link>
                    )}
                    {filters.offset + rows.length < total && (
                        <Link className="ll3-btn ll3-btn--ghost" href={withOffset(filters.offset + filters.limit)}>
                            Next
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}
