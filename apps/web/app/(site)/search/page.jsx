// import { searchMembers, getStateRoster } from "@/lib/server/routes/search";
import { getMembersDirectory, getMemberRecentChanges, } from "@/lib/server/routes/search";
import { getViewsFreshness, formatAsOfMMDDYYYY } from "@/lib/server/routes/viewStatus";

import SearchFilters from "@/app/components/features/search/SearchFilters";
import SearchResultCard from "@/app/components/features/search/SearchResultCard";
import CompositionPanel from "@/app/components/features/search/CompositionPanel";

import MemberDirectoryClient from "@/app/components/features/search/MemberDirectoryClient";
import MemberUpdatesPanel from "@/app/components/features/search/MemberUpdatesPanel";

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
import "@/app/styles/active/members/ll3.members.updates.css";



export const revalidate = 1800;

export default async function SearchPage() {
    const [directory, changes, freshness] = await Promise.all([
        getMembersDirectory(),
        getMemberRecentChanges({ limit: 12 }),
        getViewsFreshness([
            "mv_member_directory_v2",
            "v_house_seats_current_v1",
            "v_member_recent_changes_v3",
        ]),
    ]);

    const asOfText = formatAsOfMMDDYYYY(freshness?.asOf);

    return (
        <div className="ll3-members ll3-membersDirectoryPage">
            <header className="ll3-head">
                <div className="ll3-head__top">
                    <div className="ll3-head__titleWrap">
                        <h1 className="ll3-h1">Explore Members of Congress</h1>
                        <p className="ll3-sub">
                            Browse current members and House seats by state, including vacant districts.
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

            <MemberUpdatesPanel changes={changes} />
            <MemberDirectoryClient initialData={directory} />
        </div>
    );
}