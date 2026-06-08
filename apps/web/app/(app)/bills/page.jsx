import Link from "next/link";
import { ExplorerPageShell, ExplorerPageHeader, ExplorerContentGrid } from "@/app/components/shared/explorer";
import { LLSegmentedControl, LLLinkButton } from "@/app/components/shared/ui";
import { ExplorerFilterShell } from "@/app/components/shared/explorer/filters";

import { getViewsFreshness, formatAsOfMMDDYYYY } from "@/lib/server/routes/viewStatus";
import { parseBillsFiltersV2 } from "@/lib/domains/bills/queryV4";
import { getBillsDirectoryV2, getBillsFilterOptionsV2, getBillsFacetCountsV2 } from "@/lib/server/bills/indexV2";

import BillCard from "@/app/components/features/bills/BillPanelCard";
import BillsTable from "@/app/components/features/bills/BillsTable";
import RefineResultsBarClient from "@/app/components/features/bills/RefineResultsBarClient";
// import ModifyRefineButtonClient from "@/app/components/features/bills/ModifyRefineButtonClient";
import MobileDraftFormClient from "@/app/components/features/forms/MobileDraftFormClient";
import BillsFilterForm from "@/app/components/features/bills/BillsFilterForm";
import BillsMobileBottomNavClient from "@/app/components/features/bills/BillsMobileBottomNavClient";
//import ExplorerSidePanel from "@/app/components/features/search/ExplorerSidePanel";

import "@/app/styles/active/core/ll3.tokens.css";
import "@/app/styles/active/core/ll3.type.css";
import "@/app/styles/active/core/ll3.buttons.css";
import "@/app/styles/active/core/ll3.forms.css";
import "@/app/styles/active/core/ll3.cards.css";
import "@/app/styles/active/core/ll3.tables.css";
import "@/app/styles/active/core/ll3.filters.css";
import "@/app/styles/active/core/ll3.explorer-shell.css";
import "@/app/styles/active/bills/ll3.bills.page.css";
import "@/app/styles/active/bills/ll3.bills.directory.refineSheet.updated.css";

export const revalidate = 600;

function indexCountsById(rows, key = "id") { const m = new Map(); for (const r of rows || []) { const k = r?.[key]; if (k != null) m.set(String(k), Number(r.bill_count ?? 0)); } return m; }
function indexCountsByCode(rows, key = "committee_system_code") { const m = new Map(); for (const r of rows || []) { const k = r?.[key]; if (k) m.set(String(k), Number(r.bill_count ?? 0)); } return m; }
function buildSearchHref(searchParams, patch = {}) { const params = new URLSearchParams(); for (const [key, raw] of Object.entries(searchParams || {})) { if (raw == null || raw === "") continue; if (Array.isArray(raw)) raw.forEach((v) => v != null && v !== "" && params.append(key, String(v))); else params.set(key, String(raw)); } for (const [key, value] of Object.entries(patch)) { params.delete(key); if (value == null || value === "" || value === false) continue; if (Array.isArray(value)) value.forEach((v) => v != null && v !== "" && params.append(key, String(v))); else params.set(key, String(value)); } const qs = params.toString(); return qs ? `/bills?${qs}` : "/bills"; }
function getMobileNavActive(filters = {}) { if (filters.sort === "trending") return "trending"; if (filters.sort === "impact") return "impact"; return "bills"; }
function buildFiltersSummary(activeFilters, lookups) { const parts = []; if (activeFilters.q) parts.push(`“${activeFilters.q}”`); if (activeFilters.chamber) parts.push(activeFilters.chamber); if (activeFilters.type?.length) parts.push(activeFilters.type.map((t) => t.toUpperCase()).join(", ")); if (activeFilters.policyAreaId) { const pa = lookups.policyAreas?.find((p) => String(p.policy_area_id) === String(activeFilters.policyAreaId)); if (pa) parts.push(pa.policy_area_name); } if (activeFilters.statusId) { const st = lookups.statuses?.find((s) => String(s.status_id) === String(activeFilters.statusId)); if (st) parts.push(st.status_label); } if (activeFilters.subject) parts.push(`Subject: ${activeFilters.subject}`); if (activeFilters.committeeCodes?.length) parts.push(`Committees: ${activeFilters.committeeCodes.length}`); if (activeFilters.from || activeFilters.to) parts.push("Dates"); if (activeFilters.hasSummary) parts.push("Has summary"); return parts; }

export default async function BillsPage({ searchParams }) {
    const sp = await searchParams; const { filters } = parseBillsFiltersV2(sp); const view = sp?.view === "compact" ? "compact" : "cards";
    const [dirRes, freshness, filterOptions] = await Promise.all([getBillsDirectoryV2(null, filters), getViewsFreshness(["bill_search_index_v2", "mv_bill_activity_weekly_v1"]), getBillsFilterOptionsV2()]);
    const { rows = [], total = 0, congress } = dirRes || {}; const facets = await getBillsFacetCountsV2({ congress, ...filters });
    const policyCounts = indexCountsById((facets?.policyAreas || []).map((r) => ({ id: r.policy_area_id, bill_count: r.bill_count })), "id");
    const statusCounts = indexCountsById((facets?.statuses || []).map((r) => ({ id: r.status_id, bill_count: r.bill_count })), "id");
    const committeeCounts = indexCountsByCode(facets?.committees || [], "committee_system_code");
    const policyAreas = (filterOptions?.policyAreas || []).map((p) => ({ ...p, bill_count: policyCounts.get(String(p.policy_area_id)) ?? 0 }));
    const statuses = (filterOptions?.statuses || []).map((s) => ({ ...s, bill_count: statusCounts.get(String(s.status_id)) ?? 0 }));
    const committees = (filterOptions?.committees || []).map((c) => ({ ...c, bill_count: committeeCounts.get(String(c.committee_system_code)) ?? Number(c.bill_count ?? 0) }));
    const types = filterOptions?.types || []; const asOfText = formatAsOfMMDDYYYY(freshness?.asOf);
    const activeCount = (filters.q ? 1 : 0) + (filters.chamber ? 1 : 0) + (filters.subject ? 1 : 0) + (filters.from ? 1 : 0) + (filters.to ? 1 : 0) + (filters.minCos ? 1 : 0) + (filters.sort && filters.sort !== "latest_action" ? 1 : 0) + (filters.policyAreaId ? 1 : 0) + (filters.statusId ? 1 : 0) + (filters.type?.length ? 1 : 0) + (filters.committeeCodes?.length ? 1 : 0) + (filters.hasSummary ? 1 : 0);
    const summaryParts = buildFiltersSummary(filters, { policyAreas, statuses });
    const prevHref = filters.offset > 0 ? buildSearchHref(sp, { offset: Math.max(0, filters.offset - filters.limit), view }) : null;
    const nextHref = filters.offset + rows.length < total ? buildSearchHref(sp, { offset: filters.offset + filters.limit, view }) : null;
    const cardsHref = buildSearchHref(sp, { view: "cards", offset: 0 }); const compactHref = buildSearchHref(sp, { view: "compact", offset: 0 });

    return (
        <ExplorerPageShell variant="bills" className="ll3-bills">
            <ExplorerPageHeader eyebrow="Legislation explorer" title="Legislation Archive" titleMeta={`${congress}th Congress`} activeTool="bills" asOfText={asOfText} description="Browse and analyze legislation by topic, chamber, status, summaries, and recent activity. Use Smart Search when you want cross-entity discovery across bills, members, committees, and topics." />
            <ExplorerContentGrid wideSidebar>
                <ExplorerFilterShell
                    id="ll3-filters-sidebar"
                    variant="sidebar"
                    title="Filters"
                    description="Narrow results using the options below."
                >
                    <BillsFilterForm formId="bills-filters-sidebar" variant="sidebar" filters={filters} types={types} policyAreas={policyAreas} statuses={statuses} committees={committees} showSearch={false} showFilters showActions />
                </ExplorerFilterShell>
                <div className={`ll3-results ll3-results--${view}`}>
                    <div className="ll3-results__header">
                        <div className="ll3-results__left"><h2 className="ll3-h2">Bills</h2><div className="ll3-results__count"><span className="ll3-muted">Showing <strong className="ll3-strong">{rows.length}</strong> of <strong className="ll3-strong">{total}</strong></span></div></div>
                        <div className="ll3-results__right"><div className="ll3-results__topline">
                            <LLSegmentedControl label="View mode" activeValue={view} items={[{ label: "Detailed", value: "cards", href: cardsHref }, { label: "Compact", value: "compact", href: compactHref }]} />

                        </div>{summaryParts.length ? <div className="ll3-results__summary">Showing results for: <strong className="ll3-strong">{summaryParts.join(" • ")}</strong></div> : null}</div>
                    </div>
                    <RefineResultsBarClient label="Bills" hint="Search, sort, and filter" activeCount={activeCount}><div className="ll3-control__panel"><MobileDraftFormClient><BillsFilterForm formId="bills-filters-sheet" variant="sheet" filters={filters} types={types} policyAreas={policyAreas} statuses={statuses} committees={committees} showSearch showFilters showActions /></MobileDraftFormClient></div></RefineResultsBarClient>
                    {view === "compact" ? <BillsTable rows={rows} /> : <div className="ll3-cards" role="list">{rows.map((r) => <BillCard key={r.bill_id || `${r.bill_type}-${r.bill_number}-${r.congress}`.toLowerCase()} bill={r} />)}</div>}
                    <div className="ll3-pager">{prevHref ? <LLLinkButton variant="ghost" href={prevHref}>Prev</LLLinkButton> : null}{nextHref ? <LLLinkButton variant="ghost" href={nextHref}>Next</LLLinkButton> : null}</div>
                </div>
            </ExplorerContentGrid>
            <BillsMobileBottomNavClient active={getMobileNavActive(filters)} />
        </ExplorerPageShell>
    );
}
