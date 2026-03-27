import Link from "next/link";

import { getViewsFreshness, formatAsOfMMDDYYYY } from "@/lib/server/routes/viewStatus";
import {
    getBillsDirectoryV2,
    getBillsFilterOptionsV2,
    getBillsFacetCountsV2,
} from "@/lib/server/bills";
import { parseBillsFiltersV2 } from "@/lib/domains/bills/queryV2";

import BillCard from "@/app/components/features/bills/bill-archive/BillCard";
import BillsTable from "@/app/components/features/bills/bill-archive/BillsTable";
import RefineResultsBarClient from "@/app/components/features/bills/RefineResultsBarClient";
import ModifyRefineButtonClient from "@/app/components/features/bills/ModifyRefineButtonClient";
import MobileDraftFormClient from "@/app/components/features/forms/MobileDraftFormClient";
import BillsFilterForm from "@/app/components/features/bills/bill-archive/BillsFilterForm";

import "@/app/styles/active/bills/ll3.bills.tokens.css";
import "@/app/styles/active/bills/ll3.bills.ui.css";
import "@/app/styles/active/bills/bill-archive/ll3.bills.directory.layout.css";
import "@/app/styles/active/bills/bill-archive/ll3.bills.directory.controls.css";
import "@/app/styles/active/bills/bill-archive/ll3.bills.directory.cards.css";
import "@/app/styles/active/bills/bill-archive/ll3.bills.directory.refineSheet.css";

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

function buildSearchHref(searchParams, patch = {}) {
    const params = new URLSearchParams();

    for (const [key, raw] of Object.entries(searchParams || {})) {
        if (raw == null || raw === "") continue;

        if (Array.isArray(raw)) {
            raw.forEach((v) => {
                if (v != null && v !== "") params.append(key, String(v));
            });
        } else {
            params.set(key, String(raw));
        }
    }

    for (const [key, value] of Object.entries(patch)) {
        params.delete(key);

        if (value == null || value === "" || value === false) continue;

        if (Array.isArray(value)) {
            value.forEach((v) => {
                if (v != null && v !== "") params.append(key, String(v));
            });
        } else {
            params.set(key, String(value));
        }
    }

    const qs = params.toString();
    return qs ? `/bills?${qs}` : "/bills";
}

export default async function BillsPage({ searchParams }) {
    const sp = await searchParams;
    const { filters } = parseBillsFiltersV2(sp);

    const view = sp?.view === "compact" ? "compact" : "cards";

    const [dirRes, freshness, filterOptions] = await Promise.all([
        getBillsDirectoryV2(null, filters),
        getViewsFreshness(["bill_search_index", "mv_bill_activity_weekly_v1"]),
        getBillsFilterOptionsV2(),
    ]);

    const { rows, total, congress } = dirRes;

    const facets = await getBillsFacetCountsV2({
        congress,
        ...filters,
    });

    const policyCounts = indexCountsById(
        (facets?.policyAreas || []).map((r) => ({
            id: r.policy_area_id,
            bill_count: r.bill_count,
        })),
        "id"
    );

    const statusCounts = indexCountsById(
        (facets?.statuses || []).map((r) => ({
            id: r.status_id,
            bill_count: r.bill_count,
        })),
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
        bill_count:
            committeeCounts.get(String(c.committee_system_code)) ?? Number(c.bill_count ?? 0),
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
        (filters.committeeCodes?.length ? 1 : 0);

    function buildFiltersSummary(activeFilters, lookups) {
        const parts = [];

        if (activeFilters.q) parts.push(`“${activeFilters.q}”`);
        if (activeFilters.chamber) parts.push(activeFilters.chamber);
        if (activeFilters.type?.length) {
            parts.push(activeFilters.type.map((t) => t.toUpperCase()).join(", "));
        }

        if (activeFilters.policyAreaId) {
            const pa = lookups.policyAreas?.find(
                (p) => String(p.policy_area_id) === String(activeFilters.policyAreaId)
            );
            if (pa) parts.push(pa.policy_area_name);
        }

        if (activeFilters.statusId) {
            const st = lookups.statuses?.find(
                (s) => String(s.status_id) === String(activeFilters.statusId)
            );
            if (st) parts.push(st.status_label);
        }

        if (activeFilters.subject) parts.push(`Subject: ${activeFilters.subject}`);
        if (activeFilters.committeeCodes?.length) {
            parts.push(`Committees: ${activeFilters.committeeCodes.length}`);
        }
        if (activeFilters.from || activeFilters.to) parts.push("Dates");

        return parts;
    }

    const summaryParts = buildFiltersSummary(filters, { policyAreas, statuses });

    const prevHref =
        filters.offset > 0
            ? buildSearchHref(sp, {
                offset: Math.max(0, filters.offset - filters.limit),
                view,
            })
            : null;

    const nextHref =
        filters.offset + rows.length < total
            ? buildSearchHref(sp, {
                offset: filters.offset + filters.limit,
                view,
            })
            : null;

    const cardsHref = buildSearchHref(sp, { view: "cards", offset: 0 });
    const compactHref = buildSearchHref(sp, { view: "compact", offset: 0 });

    return (
        <div className="ll3-bills">
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

            <section className="ll3-searchTop" aria-label="Search bills">
                <div className="ll3-searchTop__inner">
                    <BillsFilterForm
                        formId="bills-search-top"
                        variant="top"
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

            <section className="ll3-directory">
                <aside id="ll3-filters-sidebar" className="ll3-sidebar" aria-label="Filters">
                    <div className="ll3-sidebar__head">
                        <h2 className="ll3-h2">Filters</h2>
                        <p className="ll3-muted">Narrow results using the options below.</p>
                    </div>

                    <BillsFilterForm
                        formId="bills-filters-sidebar"
                        variant="sidebar"
                        filters={filters}
                        types={types}
                        policyAreas={policyAreas}
                        statuses={statuses}
                        committees={committees}
                        showSearch={false}
                        showFilters={true}
                        showActions={true}
                    />
                </aside>

                <div className={`ll3-results ll3-results--${view}`}>
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
                            <div className="ll3-results__topline">
                                <div className="ll3-viewToggle" aria-label="View mode">
                                    <Link
                                        href={cardsHref}
                                        className={`ll3-viewToggle__btn ${view === "cards" ? "is-active" : ""}`}
                                        aria-current={view === "cards" ? "page" : undefined}
                                    >
                                        Detailed
                                    </Link>

                                    <Link
                                        href={compactHref}
                                        className={`ll3-viewToggle__btn ${view === "compact" ? "is-active" : ""}`}
                                        aria-current={view === "compact" ? "page" : undefined}
                                    >
                                        Compact
                                    </Link>
                                </div>

                                <ModifyRefineButtonClient
                                    desktopTargetId="ll3-filters-sidebar"
                                    mobileTargetId="ll3-open-refine"
                                >
                                    Modify
                                </ModifyRefineButtonClient>
                            </div>

                            {summaryParts.length ? (
                                <div className="ll3-results__summary">
                                    Showing results for:{" "}
                                    <strong className="ll3-strong">{summaryParts.join(" • ")}</strong>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <RefineResultsBarClient
                        label="Bills"
                        hint="Tap to refine results"
                        activeCount={activeCount}
                    >
                        <div className="ll3-control__panel">
                            <MobileDraftFormClient>
                                <BillsFilterForm
                                    formId="bills-filters-sheet"
                                    variant="sheet"
                                    filters={filters}
                                    types={types}
                                    policyAreas={policyAreas}
                                    statuses={statuses}
                                    committees={committees}
                                    showSearch={false}
                                    showFilters={true}
                                    showActions={true}
                                />
                            </MobileDraftFormClient>
                        </div>
                    </RefineResultsBarClient>

                    {view === "compact" ? (
                        <BillsTable rows={rows} />
                    ) : (
                        <div className="ll3-cards" role="list">
                            {rows.map((r) => {
                                const billKey =
                                    r.bill_id || `${r.bill_type}-${r.bill_number}-${r.congress}`.toLowerCase();
                                return <BillCard key={billKey} bill={r} />;
                            })}
                        </div>
                    )}

                    <div className="ll3-pager">
                        {prevHref ? (
                            <Link className="ll3-btn ll3-btn--ghost" href={prevHref}>
                                Prev
                            </Link>
                        ) : null}

                        {nextHref ? (
                            <Link className="ll3-btn ll3-btn--ghost" href={nextHref}>
                                Next
                            </Link>
                        ) : null}
                    </div>
                </div>
            </section>
        </div>
    );
}