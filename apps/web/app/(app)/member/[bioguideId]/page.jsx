// app/(app)/member/[bioguideId]/page.jsx
import Link from "next/link";

import { getSectionFreshness } from "@/lib/domains/freshness/getSectionFreshness";

import { fetchMemberData } from '@/lib/utils/memberData';
import { getMemberVotes } from '@/lib/server/routes/votes';

import SectionBoundary from '@/app/components/ui/system/SectionBoundary';

import ActivityTimeline from '@/app/components/features/members/house-member/ActivityTimeline';

import MemberAbout from "@/app/components/features/members/shared/MemberAbout";
import MemberTabs from '@/app/components/features/members/shared/MemberTabs';
import MemberTerms from '@/app/components/features/members/shared/MemberTerms';

import KpiRow from '@/app/components/features/members/shared/KpiRow';

import SenateVotes from '@/app/components/features/members/senate-member/SenateVotes';
import VotesSection from '@/app/components/features/members/house-member/VoteSection';
import VoteAlignmentPanel from '@/app/components/features/members/house-member/VoteAlignmentGauge';
import VotesSplitSection from "@/app/components/features/members/shared/VoteSplitSection";
// import '@/app/styles/legacy_refactor/member-styles.refactored.css'

import {
    ArrowLeft
} from "lucide-react";

import "@/app/styles/active/members/ll3.members.tokens.css";
import "@/app/styles/active/members/ll3.members.ui.css";

import "@/app/styles/active/members/ll3.members.search.css";
import '@/app/styles/active/ll-members-styles.css';
import "@/app/styles/active/members/ll3.members.details.css";

import "@/app/styles/active/members/ll3.members.badges.css";
import "@/app/styles/active/members/ll3.members.tabs.css";
import "@/app/styles/active/members/ll3.members.heatmap.css";
import "@/app/styles/active/members/ll3.members.gauge.css";
import "@/app/styles/active/members/ll3.members.viz.css";
import "@/app/styles/active/members/ll3.vote-alignment.css";

// import '../../../../lib/stylesheets/refactored/member-styles.refactored.css';
// import '../../../../lib/stylesheets/refactored/vote-ui.refactored.css';
// import '../../../../lib/stylesheets/refactored/ui-controls.css';
// import '../../../../lib/stylesheets/refactored/home-styles.refactored.css';


export default async function MemberPage({ params }) {
    const { bioguideId } = await params; // no await
    //const bioguideId = params.id;

    const {
        profile,
        monthly,
        sponsoredRes,
        cosponsoredRes,
        //recentVotes,
        // alignment,
        kpis,
        alignmentPanel,
        monthlyActivity,
        subjects,
        bills,

    } = await fetchMemberData(bioguideId);


    const allVotes = await getMemberVotes(bioguideId, { limit: 50 });
    // console.log(allVotes)
    const stateLabel = profile.state_name || profile.state || profile.state_code || "state";
    const isSenate = profile?.chamber === 'Senate';

    if (!profile) {
        return (
            <div className="container">
                <p className="muted">Member not found.</p>
            </div>
        );
    }

    // Map helper return shapes to what the UI expects
    const sponsoredGroups = sponsoredRes?.groups ?? [];
    const cosponsoredGroups = cosponsoredRes?.groups ?? [];

    // KPIs (KpiRow hides nulls; you can refine “YTD” later)
    const sponsoredYTD = (monthly || []).reduce((a, r) => a + (r.sponsored || 0), 0);
    const cosponsoredYTD = (monthly || []).reduce((a, r) => a + (r.cosponsored || 0), 0);
    const totalYTD = sponsoredYTD + cosponsoredYTD;
    //const kpis = { totalYTD, sponsoredYTD, cosponsoredYTD };


    const freshness = await getSectionFreshness({
        schemaName: "sandbox_lemur_views_v1",
        viewNames: ["member_legislation_v1", "member_monthly_activity_v1"],
        cacheKey: `member:${bioguideId}:tabsFreshness`,
    });

    const votesFreshness = await getSectionFreshness({
        schemaName: "sandbox_lemur_app_views_v1",
        viewNames: ["mv_member_votes_v2", "mv_member_vote_agg_v1"],
        cacheKey: `member:${bioguideId}:votesFreshness`,
    });

    // --- Merge for the donut on this page (dedupe by id) ---
    const labelFromSubject = (subj) =>
        typeof subj === "string" ? subj :
            (subj && typeof subj === "object" && (subj.name || subj.title)) ? String(subj.name || subj.title) :
                "Uncategorized";

    function mergeForDonut(...sets) {
        const bySubject = new Map();
        for (const set of sets) {
            for (const g of (set?.groups || [])) {
                const key = labelFromSubject(g.subject);
                const prev = bySubject.get(key) || { subject: key, items: [] };
                const next = [...prev.items, ...(g.items || [])];

                // de-dupe by a stable key (id || href || title)
                const dedup = new Map();
                for (const it of next) {
                    const id = it?.id || it?.href || it?.url || it?.title;
                    if (!dedup.has(id)) dedup.set(id, it);
                }
                bySubject.set(key, { subject: key, items: Array.from(dedup.values()) });
            }
        }
        return Array.from(bySubject.values()).map(g => ({ ...g, count: g.items.length }));
    }


    return (
        // page.jsx (fragment)
        <div className="llmp3-page">
            <div className="llmp3-wrap llmp3-stack-24">
                <div className="llmp3-back">
                    <Link
                        href={`/search?state=${encodeURIComponent(profile.stateCode || "")}`}
                        className="llmp3-back__members llmp3-back--member"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        <span>Back to {stateLabel} results</span>
                    </Link>
                </div>
                {/* Header */}
                <SectionBoundary where="MemberHeader">
                    <>
                        <MemberAbout profile={profile} />
                        <MemberTerms terms={profile.terms} />
                    </>
                </SectionBoundary>

                {/* KPIs */}
                <SectionBoundary where="KpiRow">
                    <KpiRow kpis={kpis} />
                </SectionBoundary>

                {/* Tabs                          <SectionBoundary where="MemberTabs">     </SectionBoundary> */}

                <div className="llmp3-panel">
                    <MemberTabs
                        title="Recent bills by topic"
                        groupsSponsored={sponsoredRes}
                        groupsCosponsored={cosponsoredRes}
                        monthly={monthly}
                        sourceLabel="Includes sponsored + co-sponsored bills"
                        freshnessAsOf={freshness.asOf}
                        freshnessPerView={freshness.perView}
                    />
                </div>



                {/* Votes + viz */}
                <SectionBoundary where="MemberVotesAndViz">
                    <div className="llmp3-panel">
                        {isSenate ? (
                            <SenateVotes groups={allVotes} />
                        ) : (
                            <>
                                <VotesSplitSection
                                    alignmentPanel={alignmentPanel}
                                    votes={allVotes}
                                    tableInitialLimit={20}
                                    votesFreshnessAsOf={votesFreshness.asOf}
                                    chamberLabel={isSenate ? "Senate" : "House"}
                                    heatmapWeeks={52}
                                />
                            </>
                        )}
                    </div>
                </SectionBoundary>
            </div>
        </div>
        /*         <MemberAbout profile={profile} />
        <MemberTerms terms={profile.terms} />



        <KpiRow kpis={kpis} />


 <ErrorBoundary where="MemberTabs">
         <ErrorBoundary where="KpiRow">
                  <ErrorBoundary where="MemberHeader">
        </ErrorBoundary>
   

        <div className="llmp3-panel">
            <MemberTabs
                title="Recent bills by topic"
                groupsSponsored={sponsoredRes}
                groupsCosponsored={cosponsoredRes}
                monthly={monthly}
                sourceLabel="Includes sponsored + co-sponsored bills"
                freshnessAsOf={freshness.asOf}
                freshnessPerView={freshness.perView}
            />
        </div>

        {/*    <ErrorBoundary where="MemberVotesAndViz"> 
        </ErrorBoundary>
   
        <div className="llmp3-panel">
            {isSenate ? (
                <SenateVotes groups={allVotes} />
            ) : (
                <>
                    <div className="llmp3-grid-2">
                        <VoteAlignmentPanel value={alignment} />
                        <div className="llmp3-card">
                            <VotesSection votes={allVotes} tableInitialLimit={20} freshnessAsOf={votesFreshness.asOf} />
                        </div>
                    </div>

                    <div className="llmp3-card llmp3-card--soft">
                        <ActivityTimeline
                            data={monthly}
                            freshnessAsOf={freshness.perView?.member_monthly_activity_v1 ?? freshness.asOf}
                        />
                    </div>
                </>
            )}
        </div>

    </div>
</div>  */

    );
}