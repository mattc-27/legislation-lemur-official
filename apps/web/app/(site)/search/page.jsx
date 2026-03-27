// import { searchMembers, getStateRoster } from "@/lib/server/routes/search";
import { getMembersDirectory } from "@/lib/server/routes/search";
import { getViewsFreshness, formatAsOfMMDDYYYY } from "@/lib/server/routes/viewStatus";

import SearchFilters from "@/app/components/features/search/SearchFilters";
import SearchResultCard from "@/app/components/features/search/SearchResultCard";
import CompositionPanel from "@/app/components/features/search/CompositionPanel";

import MemberDirectoryClient from "@/app/components/features/search/MemberDirectoryClient";

import "@/app/styles/active/members/refactored/ll3.members.tokens.css";
import "@/app/styles/active/members/refactored/ll3.members.ui.css";
import "@/app/styles/active/members/refactored/ll3.members.badges.css";

// import "@/app/styles/active/members/search/ll3.members.search.layout.css";
// import "@/app/styles/active/members/search/ll3.members.search.filters.css";
// import "@/app/styles/active/members/search/ll3.members.search.composition.css";
// import "@/app/styles/active/members/search/ll3.members.search.results.css";


import "@/app/styles/active/members/search/ll3.members.directory.layout.css";

import "@/app/styles/active/members/search/ll3.members.directory.filters.css";

import "@/app/styles/active/members/search/ll3.members.directory.sidebar.css";
import "@/app/styles/active/members/search/ll3.members.directory.results.css";
import "@/app/styles/active/members/search/ll3.members.directory.css";




export const revalidate = 1800;

export default async function SearchPage() {
    const directory = await getMembersDirectory();
    const freshness = await getViewsFreshness(["mv_member_core_v1"]);
    const asOfText = formatAsOfMMDDYYYY(freshness?.asOf);

    return (
        <div className="ll3-members ll3-membersDirectoryPage">
            <header className="ll3-head">
                <div className="ll3-head__top">
                    <div className="ll3-head__titleWrap">
                        <h1 className="ll3-h1">Explore Members of Congress</h1>
                        <p className="ll3-sub">
                            Browse members by state, filter by chamber or party, and open cleaner
                            congressional profiles.
                        </p>
                    </div>

                    <div className="ll3-head__meta">
                        {asOfText ? (
                            <span className="ll3-freshness">
                                Data current as of <strong className="ll3-strong">{asOfText}</strong>
                            </span>
                        ) : null}
                    </div>
                </div>
            </header>

            <MemberDirectoryClient initialData={directory} />
        </div>
    );
}


/*

export default async function SearchPage({ searchParams }) {
    const sp = await searchParams;
    const get = (k) => (typeof sp?.get === "function" ? sp.get(k) ?? "" : sp?.[k] ?? "");

    const q = String(get("q"));
    const chamber = String(get("chamber"));
    const party = String(get("party"));
    const congress = Number(get("congress")) || 119;
    const state = String(get("state") || "").toUpperCase();

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
    const freshness = await getViewsFreshness(["mv_member_core_v1"]);
    const asOfText = formatAsOfMMDDYYYY(freshness.asOf);

    return (
        <div className="ll3-members ll3-membersSearch">
            <header className="ll3-head">
                <div className="ll3-head__top">
                    <div className="ll3-head__titleWrap">
                        <h1 className="ll3-h1">Explore Members of Congress</h1>
                        <p className="ll3-sub">
                            Find representatives and senators, view voting history, committees, and
                            sponsored legislation.
                        </p>
                    </div>

                    <div className="ll3-head__meta">
                        {asOfText && (
                            <span className="ll3-freshness">
                                Data current as of <strong className="ll3-strong">{asOfText}</strong>
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <section className="ll3-membersSearch__controls" aria-label="Member search controls">
                <div className="ll3-membersSearch__panel ll3-membersSearch__panel--filters">
                    <SearchFilters />
                </div>

                <div className="ll3-membersSearch__panel ll3-membersSearch__panel--composition">
                    <CompositionPanel congress={congress} state={state} />
                </div>
            </section>

            <section className="ll3-results">
                {hasQuery && (
                    <section className="stack-24">
                        {senators.length > 0 && (
                            <section className="ll3-resultsSection stack-12">
                                <h2 className="section__title section__title--sm">
                                    Senators <span className="section__count">({senators.length})</span>
                                </h2>

                                <div className="grid-2">
                                    {senators.map((m) => (
                                        <SearchResultCard key={m.bioguideId || m.id} m={m} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {representatives.length > 0 && (
                            <section className="ll3-resultsSection stack-12">
                                <h2 className="section__title section__title--sm">
                                    Representatives <span className="section__count">({representatives.length})</span>
                                </h2>

                                <div className="grid-2">
                                    {representatives.map((m) => (
                                        <SearchResultCard key={m.bioguideId || m.id} m={m} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {senators.length + representatives.length === 0 && (
                            <p className="search-empty">
                                No members found{state ? ` for ${state}` : ""}
                                {q ? ` matching “${q}”` : ""}.
                            </p>
                        )}
                    </section>
                )}
            </section>
        </div>
    );
}
    */