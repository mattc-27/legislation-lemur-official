// app/(app)/search/page.jsx
import dynamic from "next/dynamic";
import { Suspense } from "react";

import SearchFilters from "@/app/components/search/SearchFilters";
import SearchResultCard from "@/app/components/search/SearchResultCard";
import CongressHexMap from '@/app/components/search/CongressHeatMap';

import CongressPicker from "@/app/components/search/CongressPicker";
import InfoStatCard from "@/app/components/search/InfoStatCard";
import "../../../lib/stylesheets/refactored/home-styles.refactored.css";   // reuse hero/searchbox visuals
import "../../../lib/stylesheets/refactored/search-styles.refactored.css"; // page-specific tweaks
import "../../../lib/stylesheets/refactored/ui-controls.css";

// import { searchMembers, getStateRoster } from "@/lib/server/search";
import { searchMembers, getStateRoster } from "@/lib/server/search";
import { getCongressComposition, getCongressSummary } from "@/lib/server/views";

import { Landmark, Gavel, Users2 } from "lucide-react"; // ⟵ NEW

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

    const state = String(get("state")).toUpperCase();
    const q = String(get("q"));
    const chamber = String(get("chamber"));
    const party = String(get("party"));
    const congress = Number(get("congress")) || 119;


    const summary = await getCongressSummary(congress);
    const composition = await getCongressComposition();



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

    const hasQuery = Boolean(q || state || chamber || party);

    return (
        <div className="container stack-32 search-page">
            <header className="search-header stack-12">
                <div className="page-tools">
                    <h1 className="section__title">Explore Members of Congress</h1>
                    <CongressPicker value={congress} options={[115, 116, 117, 118, 119]} label="Congress" />
                </div>
                <p className="section__sub">
                    Find representatives and senators, view voting history, committees, and sponsored legislation.
                </p>
            </header>



            {/* Filters (Name field now uses the SAME dropdown UX as Home SearchBox) */}
            <section className="panel panel--frost">
                <SearchFilters initial={{ state, q, chamber, party }} />
            </section>

            {!hasQuery && <p className="text-dim mt16">Search by name or choose a state to begin.</p>}

            {hasQuery && (
                <section className="stack-24">
                    {senators.length > 0 && (
                        <div className="stack-12">
                            <h2 className="section__title section__title--sm">Senators</h2>
                            <div className="grid-2">
                                {senators.map((m) => <SearchResultCard key={m.bioguideId || m.id} m={m} />)}
                            </div>
                        </div>
                    )}
                    {representatives.length > 0 && (
                        <div className="stack-12">
                            <h2 className="section__title section__title--sm">Representatives</h2>
                            <div className="grid-2">
                                {representatives.map((m) => <SearchResultCard key={m.bioguideId || m.id} m={m} />)}
                            </div>
                        </div>
                    )}
                    {senators.length + representatives.length === 0 && (
                        <p className="text-dim mt16">
                            No members found{state ? ` for ${state}` : ""}{q ? ` matching “${q}”` : ""}.
                        </p>
                    )}
                </section>
            )}

            {/* Light info cards with Lucide icons */}
            {!hasQuery && summary && (
                <>
                    <section className="infocards grid-3 section-gap-28">
                        <InfoStatCard
                            title="House"
                            primary={summary.house_total}
                            meta={[
                                { label: "D", value: summary.house_d, tone: "d" },
                                { label: "R", value: summary.house_r, tone: "r" },
                                { label: "I", value: summary.house_i, tone: "i" },
                            ]}
                            icon={<Landmark aria-hidden="true" />}
                            accent="blue"
                        />
                        <InfoStatCard
                            title="Senate"
                            primary={summary.senate_total}
                            meta={[
                                { label: "D", value: summary.senate_d, tone: "d" },
                                { label: "R", value: summary.senate_r, tone: "r" },
                                { label: "I", value: summary.senate_i, tone: "i" },
                            ]}
                            icon={<Gavel aria-hidden="true" />}
                            accent="red"
                        />
                        <InfoStatCard
                            title="Total Members"
                            primary={summary.house_total + summary.senate_total}
                            meta={[
                                { label: "House", value: summary.house_total },
                                { label: "Senate", value: summary.senate_total },
                            ]}
                            icon={<Users2 aria-hidden="true" />}
                            accent="slate"
                        />
                    </section>

                    {/* Single timestamp below the cards */}
                    <p className="cards-footnote">Updated {new Date(summary.updated_at).toLocaleDateString()}</p>






                    <section className="panel panel--frost section-gap-40">
                        <div className="map-header">
                            <h3 className="section__title section__title--sm">Congressional Representation by State</h3>
                            <div className="legend">
                                <span className="legend-chip legend-fill" aria-hidden="true"></span>
                                <span>House majority by state</span>
                                <span className="legend-sep">•</span>
                                <span className="legend-chip legend-dot" aria-hidden="true"></span>
                                <span>Senate seats</span>
                            </div>
                        </div>
                        {/* Optional: shows a text fallback until the client component hydrates */}
                        <Suspense fallback={<p className="map-loading-inline">Loading map…</p>}>
                            <CongressHexMap
                                data={composition}
                                /* medium-light map bg so white labels pop without going dark */
                                fillBackground="#E7EDF6"
                                strokeStates="#D4DCE7"
                                labelFill="#FFFFFF"
                                labelHalo="#2B3A52"
                            />
                        </Suspense>
                    </section>
                </>
            )}
        </div>
    );
}
