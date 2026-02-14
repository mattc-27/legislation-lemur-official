// app/(app)/search/page.jsx
{/* 
import relevent functions from @/lib/congress.js containing pool.query logic  
*/}
import Link from "next/link";

import { getViewsFreshness, formatAsOfMMDDYYYY } from "@/lib/server/routes/viewStatus";

import { getBillsDirectoryV2 } from "@/lib/server/bills";
import { getBillsFilterOptionsV2, getBillsFacetCountsV2 } from "@/lib/server/bills";
import { parseBillsFiltersV2, buildBillsPagination } from "@/lib/domains/bills/queryV2";

import BillCard from "@/app/components/features/bills/BillCard";
import DensityToggleClient from '@/app/components/features/bills/DensityToggleClient';

import RefineResultsBarClient from '@/app/components/features/bills/RefineResultsBarClient';
import SubjectsTrendSection from "@/app/components/features/home/SubjectsTrendSection";

import '@/app/styles/legacy_refactor/home-styles.refactored.css'



import BillsFilterForm from "@/app/components/features/forms/BillsFilterForm";

import '@/app/styles/active/bills/ll3.bills.tokens.css';
import '@/app/styles/active/bills/ll3.bills.ui.css';
import '@/app/styles/active/bills/ll3.bills.directory.layout.css';
import '@/app/styles/active/bills/ll3.bills.directory.controls.css';
import '@/app/styles/active/bills/ll3.bills.directory.cards.css';
import '@/app/styles/active/bills/ll3.bills.directory.refineSheet.css';
import '@/app/styles/active/bills/ll3.bills.directory.chart.css';

/* --- IGNORE ---------------------------------------------------------------------
import "../../../lib/stylesheets/refactored/search-styles.refactored.css";
import "../../../lib/stylesheets/refactored/ui-controls.css";
import '../../../lib/stylesheets/bill-page.css';

import '@/app/styles/active/ll-bills-archive.css';
import '@/app/styles/active/bills-directory.ll3.css';

import SaveBillButtonClient from '../../components/bills/SaveBillButtonClient';
import BillActivityMini from "@/app/components/bills/BillActivityMini";
------------------------------------------------------------------------------------ */



export const revalidate = 600;


function indexCountsById(rows, key = "id") {
    // rows like: [{ policy_area_id, bill_count }, ...]
    const m = new Map();
    for (const r of rows || []) {
        const k = r?.[key];
        if (k == null) continue;
        m.set(String(k), Number(r.bill_count ?? 0));
    }
    return m;
}

function indexCountsByCode(rows, key = "committee_system_code") {
    const m = new Map();
    for (const r of rows || []) {
        const k = r?.[key];
        if (!k) continue;
        m.set(String(k), Number(r.bill_count ?? 0));
    }
    return m;
}


// ---------- client bits (density + save/watch) ---------- 


export default async function BillsPage({ searchParams }) {
    // ✅ Next 15: await first
    const sp = await searchParams;

    const { filters } = parseBillsFiltersV2(sp);
    const { withOffset } = buildBillsPagination(sp, { limit: filters.limit });
    // congress is needed for facets (your facet helper expects it)
    // getBillsDirectoryV2 will default to current congress if null; we’ll reuse returned congress.
    const [dirRes, freshness, filterOptions] = await Promise.all([
        getBillsDirectoryV2(null, filters),
        getViewsFreshness([
            // ✅ update this later once view_status tracks bill_search_index explicitly
            "bill_search_index",
            "mv_bill_activity_weekly_v1",
            // If you add bill_search_index to view_status, include it here:
            // "bill_search_index"
        ]),
        getBillsFilterOptionsV2(),
    ]);

    const { rows, total, congress } = dirRes;

    // Facet counts depend on "current filtered set"
    // Important: pass congress explicitly + the same filters you used for directory
    const facets = await getBillsFacetCountsV2({
        congress,
        ...filters,
    });

    // Merge counts into options lists
    const policyCounts = indexCountsById(
        (facets?.policyAreas || []).map((r) => ({ id: r.policy_area_id, bill_count: r.bill_count })),
        "id"
    );
    const statusCounts = indexCountsById(
        (facets?.statuses || []).map((r) => ({ id: r.status_id, bill_count: r.bill_count })),
        "id"
    );
    const committeeCounts = indexCountsByCode(facets?.committees || [], "committee_system_code");

    const policyAreas = (filterOptions?.policyAreas || []).map((p) => ({
        ...p,
        bill_count: policyCounts.get(String(p.policy_area_id)) ?? 0,
    }));

    const statuses = (filterOptions?.statuses || []).map((s) => ({
        ...s,
        bill_count: statusCounts.get(String(s.status_id)) ?? 0,
    }));

    const committees = (filterOptions?.committees || []).map((c) => ({
        ...c,
        bill_count: committeeCounts.get(String(c.committee_system_code)) ?? Number(c.bill_count ?? 0),
    }));

    // Types: you already return counts from getBillsFilterOptionsV2
    const types = filterOptions?.types || [];

    // Freshness display
    const asOfText = formatAsOfMMDDYYYY(freshness.asOf);
    const activityAsOfText = formatAsOfMMDDYYYY(freshness.perView?.mv_bill_activity_weekly_v1);

    const CURRENT_CONGRESS = 119;

    // Active filters badge count (for mobile refine bar)
    const activeCount =
        (filters.q ? 1 : 0) +
        (filters.chamber ? 1 : 0) +
        (filters.subject ? 1 : 0) +
        (filters.from ? 1 : 0) +
        (filters.to ? 1 : 0) +
        (filters.minCos ? 1 : 0) +
        (filters.sort && filters.sort !== "latest_action" ? 1 : 0) +
        (filters.policyAreaId ? 1 : 0) +
        (filters.statusId ? 1 : 0) +
        (filters.type ? 1 : 0) +
        ((filters.committeeCodes && filters.committeeCodes.length) ? 1 : 0);

    console.log(rows[0])
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
         ========================================= */}
            <section className="ll3-control">
                <div className="ll3-control__panel">
                    <div className="ll3-control__header">
                        <div>
                            <h2 className="ll3-h2">Refine</h2>
                            <p className="ll3-muted">Search and filter, then browse the cards below.</p>
                        </div>

                    </div>

                    {/* DESKTOP FILTERS */}
                    <BillsFilterForm
                        variant="desktop"
                        filters={filters}
                        types={types}
                        policyAreas={policyAreas}
                        statuses={statuses}
                        committees={committees}
                    />

                </div>

                <div className="ll3-control__panel ll3-control__panel--chart">
                    <SubjectsTrendSection congress={CURRENT_CONGRESS} activityAsOfText={activityAsOfText} />
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

                {/* MOBILE SHEET */}
                <RefineResultsBarClient label="Bills" hint="Tap to refine results" activeCount={activeCount}>
                    <div className="ll3-control__panel">
                        <BillsFilterForm
                            variant="sheet"
                            filters={filters}
                            types={types}
                            policyAreas={policyAreas}
                            statuses={statuses}
                            committees={committees}
                        />
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
