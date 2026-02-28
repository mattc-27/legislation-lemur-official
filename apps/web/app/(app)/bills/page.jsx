// app/(app)/search/page.jsx
import Link from "next/link";

import { getViewsFreshness, formatAsOfMMDDYYYY } from "@/lib/server/routes/viewStatus";

import { getBillsDirectoryV2 } from "@/lib/server/bills";
import { getBillsFilterOptionsV2, getBillsFacetCountsV2 } from "@/lib/server/bills";
import { parseBillsFiltersV2, buildBillsPagination } from "@/lib/domains/bills/queryV2";

import BillCard from "@/app/components/features/bills/BillCard";
import RefineResultsBarClient from "@/app/components/features/bills/RefineResultsBarClient";
import ModifyRefineButtonClient from "@/app/components/features/bills/ModifyRefineButtonClient";
import MobileDraftFormClient from "@/app/components/features/forms/MobileDraftFormClient";
import BillsFilterForm from "@/app/components/features/forms/BillsFilterForm";

import "@/app/styles/legacy_refactor/home-styles.refactored.css";

import "@/app/styles/active/bills/ll3.bills.tokens.css";
import "@/app/styles/active/bills/ll3.bills.ui.css";
import "@/app/styles/active/bills/ll3.bills.directory.layout.css";
import "@/app/styles/active/bills/ll3.bills.directory.controls.css";
import "@/app/styles/active/bills/ll3.bills.directory.cards.css";
import "@/app/styles/active/bills/ll3.bills.directory.refineSheet.css";

export const revalidate = 600;

function indexCountsById(rows, key = "id") {
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

export default async function BillsPage({ searchParams }) {
    const sp = await searchParams;

    const { filters } = parseBillsFiltersV2(sp);
    const { withOffset, baseParams } = buildBillsPagination(sp, { limit: filters.limit });

    const [dirRes, freshness, filterOptions] = await Promise.all([
        getBillsDirectoryV2(null, filters),
        getViewsFreshness([
            "bill_search_index",
            "mv_bill_activity_weekly_v1",
        ]),
        getBillsFilterOptionsV2(),
    ]);

    const { rows, total, congress } = dirRes;

    const facets = await getBillsFacetCountsV2({
        congress,
        ...filters,
    });

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

    const types = filterOptions?.types || [];

    const asOfText = formatAsOfMMDDYYYY(freshness.asOf);

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
        (filters.type?.length ? 1 : 0) +
        ((filters.committeeCodes && filters.committeeCodes.length) ? 1 : 0);

    function buildFiltersSummary(filters, lookups) {
        const parts = [];
        if (filters.q) parts.push(`“${filters.q}”`);
        if (filters.chamber) parts.push(filters.chamber);
        if (filters.type?.length) parts.push(filters.type.map(t => t.toUpperCase()).join(", "));

        if (filters.policyAreaId) {
            const pa = lookups.policyAreas?.find(p => String(p.policy_area_id) === String(filters.policyAreaId));
            if (pa) parts.push(pa.policy_area_name);
        }

        if (filters.statusId) {
            const st = lookups.statuses?.find(s => String(s.status_id) === String(filters.statusId));
            if (st) parts.push(st.status_label);
        }

        if (filters.subject) parts.push(`Subject: ${filters.subject}`);
        if (filters.committeeCodes?.length) parts.push(`Committees: ${filters.committeeCodes.length}`);
        if (filters.from || filters.to) parts.push(`Dates`);

        return parts;
    }

    const summaryParts = buildFiltersSummary(filters, { policyAreas, statuses });

    return (
        <div className="ll3-bills">
            {/* =============================
          HEADER
      ============================== */}
            <header className="ll3-head">
                <div className="ll3-head__top">
                    <h1 className="ll3-h1">
                        Legislation Archive <span className="ll3-h1__sep" aria-hidden="true">|</span>{" "}
                        <span className="ll3-h1__meta">{congress}th Congress</span>
                    </h1>

                    {asOfText ? (
                        <div className="ll3-head__fresh">
                            Data current as of <strong className="ll3-strong">{asOfText}</strong>
                        </div>
                    ) : null}
                </div>

                <p className="ll3-sub">Browse bills by topic, chamber, and recent activity.</p>
            </header>

            {/* =============================
          TOP SEARCH ROW (NEW)
          - Desktop: primary search lives here
          - Mobile: can remain visible; refine sheet handles filters
      ============================== */}
            <section className="ll3-searchTop" aria-label="Search bills">
                <div className="ll3-searchTop__inner">
                    <BillsFilterForm
                        formId="bills-search-top"
                        variant="top"              // NEW variant
                        filters={filters}
                        types={types}
                        policyAreas={policyAreas}
                        statuses={statuses}
                        committees={committees}
                        showSearch={true}
                        showFilters={false}
                        showActions={false}
                    />
                </div>
            </section>

            {/* =============================
          DIRECTORY LAYOUT (NEW)
          - Left: sticky sidebar filters (desktop)
          - Right: results
      ============================== */}
            <section className="ll3-directory">
                {/* DESKTOP SIDEBAR */}
                <aside id="ll3-filters-sidebar" className="ll3-sidebar" aria-label="Filters">
                    <div className="ll3-sidebar__head">
                        <h2 className="ll3-h2">Filters</h2>
                        <p className="ll3-muted">Narrow results using the options below.</p>
                    </div>

                    <BillsFilterForm
                        formId="bills-filters-sidebar"
                        variant="sidebar"          // NEW variant
                        filters={filters}
                        types={types}
                        policyAreas={policyAreas}
                        statuses={statuses}
                        committees={committees}
                        showSearch={false}
                        showFilters={true}
                        showActions={true}         // keep Apply/Reset for now
                    />
                </aside>

                {/* RESULTS COLUMN */}
                <div className="ll3-results">
                    <div className="ll3-results__header">
                        <div className="ll3-results__left">
                            <h2 className="ll3-h2">Bills</h2>
                            <div className="ll3-results__count">
                                <span className="ll3-muted">
                                    Showing <strong className="ll3-strong">{rows.length}</strong> of{" "}
                                    <strong className="ll3-strong">{total}</strong>
                                </span>
                            </div>
                        </div>

                        <div className="ll3-results__right">
                            {summaryParts.length ? (
                                <>
                                    <div className="ll3-results__summary">
                                        Showing results for:{" "}
                                        <strong className="ll3-strong">{summaryParts.join(" • ")}</strong>
                                    </div>

                                    <ModifyRefineButtonClient
                                        desktopTargetId="ll3-filters-sidebar"
                                        mobileTargetId="ll3-open-refine"
                                    >
                                        Modify
                                    </ModifyRefineButtonClient>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {/* MOBILE SHEET (UNCHANGED PATTERN) */}
                    <RefineResultsBarClient label="Bills" hint="Tap to refine results" activeCount={activeCount}>
                        <div className="ll3-control__panel">
                            <MobileDraftFormClient debug>
                                <BillsFilterForm
                                    formId="bills-filters-sheet"
                                    variant="sheet"
                                    filters={filters}
                                    types={types}
                                    policyAreas={policyAreas}
                                    statuses={statuses}
                                    committees={committees}
                                    showSearch={false}   // keep search in top row; set true if you want inside sheet too
                                    showFilters={true}
                                    showActions={true}
                                />
                            </MobileDraftFormClient>
                        </div>
                    </RefineResultsBarClient>

                    {/* CARDS */}
                    <div className="ll3-cards" role="list">
                        {rows.map((r) => {
                            const billKey = r.bill_id || `${r.type}-${r.number}-${r.congress}`.toLowerCase();
                            return <BillCard key={billKey} bill={r} />;
                        })}
                    </div>

                    {/* PAGER */}
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
                </div>
            </section>
        </div>
    );
}
