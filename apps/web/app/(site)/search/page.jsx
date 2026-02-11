// app/(app)/search/page.jsx
import dynamic from "next/dynamic";
import { Suspense } from "react";

import { searchMembers, getStateRoster } from "@/lib/server/routes/search";
import { getCongressCompositionByState, getCongressSummary } from "@/lib/server/routes/views";
import { getViewsFreshness, formatAsOfMMDDYYYY } from "@/lib/server/routes/viewStatus";

import SearchFilters from "@/app/components/features/search/SearchFilters";
import SearchResultCard from "@/app/components/features/search/SearchResultCard";
import CompositionPanel from "@/app/components/features/search/CompositionPanel";

import '@/app/styles/active/ll-bills-archive.css';
import '@/app/styles/active/member-search-base.css';
import '@/app/styles/active/member-search-components.css';

import CongressPicker from "@/app/components/features/search/CongressPicker";

import { Landmark, Gavel, Users2 } from "lucide-react"; // ⟵ NEW

/*
// import FiltersPanelClient from "@/app/components/search/FiltersPanelClient";
// import "../../../lib/stylesheets/refactored/home-styles.refactored.css";   // reuse hero/searchbox visuals
// import "../../../lib/stylesheets/refactored/search-styles.refactored.css"; // page-specific tweaks
// import "../../../lib/stylesheets/refactored/ui-controls.css";
// import { searchMembers, getStateRoster } from "@/lib/server/search";
// import InfoStatCard from "@/app/components/search/InfoStatCard";
// import SearchOverviewSection from "@/app/components/search/SearchOverviewSection";
// import CongressHexMap from '@/app/components/search/CongressHeatMap';
// import SearchFiltersShell from "@/app/components/search/SearchFiltersShell";
*/


export const revalidate = 600;

// ⟵ Dynamically load the map (no SSR) with a nice fallback
/* const CongressHexMap = dynamic(
  () => import("@/components/member/CongressHeatMap"),
  { ssr: false, loading: () => <p className="map-loading-inline">Loading map…</p> }
);
*/

export default async function SearchPage({ searchParams }) {

    const sp = await searchParams;
    const get = (k) => (typeof sp?.get === "function" ? sp.get(k) ?? "" : sp?.[k] ?? "");


    const q = String(get("q"));
    const chamber = String(get("chamber"));
    const party = String(get("party"));
    const congress = Number(get("congress")) || 119;
    const state = String(searchParams?.state || "").toUpperCase();


    const summary = await getCongressSummary();
    const composition = state
        ? await getCongressCompositionByState(congress, state)
        : null;

    console.log(summary)

    // console.log(summary)

    let senators = [];
    let representatives = [];
    if (q || chamber || party) {
        const found = await searchMembers({ q, state, chamber, party, congress });
        senators = found.senators;
        representatives = found.representatives;
    } else if (state) {
        const roster = await getStateRoster(state, { congress });
        senators = roster.senators;
        representatives = roster.representatives;
    }

    const hasQuery = Boolean(q || chamber || party || state);
    const hasAnyFilters = hasQuery;
    const freshness = await getViewsFreshness(["mv_member_core_v1"]);
    const asOfText = formatAsOfMMDDYYYY(freshness.asOf);
    return (
        <div className="ll3-bills ll3-members">
            <header className="ll3-head">
                <div className="ll3-head__top">
                    <h1 className="ll3-h1">Explore Members of Congress</h1>
                    <div className="ll3-head__meta">
                        {/* put CongressPicker here styled like bills KPI area
                               <CongressPicker /> */}

                        {asOfText && (
                            <span className="ll3-freshness">
                                Data current as of <strong className="ll3-strong">{asOfText}</strong>
                            </span>
                        )}
                    </div>
                </div>
                <p className="ll3-sub">
                    Find representatives and senators, view voting history, committees, and sponsored legislation.
                </p>
            </header>

            <section className="ll3-control ll3-membersControl">
                <div className="ll3-control__panel">
                    {/* Filters go here */}
                    <SearchFilters />
                </div>
                <div className="ll3-control__panel">
                    {/* Composition/overview panel (server) */}
                    <CompositionPanel congress={congress} state={state} />
                </div>
            </section>

            <section className="ll3-results">
                {hasQuery && (
                    <section className="stack-24">
                        {senators.length > 0 && (
                            <div className="stack-12">
                                <h2 className="section__title section__title--sm">
                                    Senators <span className="section__count">({senators.length})</span>
                                </h2>
                                <div className="grid-2">
                                    {senators.map((m) => <SearchResultCard key={m.bioguideId || m.id} m={m} />)}
                                </div>
                            </div>
                        )}

                        {representatives.length > 0 && (
                            <div className="stack-12">
                                <h2 className="section__title section__title--sm">
                                    Representatives <span className="section__count">({representatives.length})</span>
                                </h2>
                                <div className="grid-2">
                                    {representatives.map((m) => <SearchResultCard key={m.bioguideId || m.id} m={m} />)}
                                </div>
                            </div>
                        )}

                        {senators.length + representatives.length === 0 && (
                            <p className="search-empty">
                                No members found{state ? ` for ${state}` : ""}{q ? ` matching “${q}”` : ""}.
                            </p>
                        )}
                    </section>
                )}
            </section>
        </div>
    );
}
