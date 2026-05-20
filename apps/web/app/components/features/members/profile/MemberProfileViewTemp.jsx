// app/components/features/members/profile/MemberProfileView.jsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getSectionFreshness } from "@/lib/domains/freshness/getSectionFreshness";
// import { fetchMemberData } from "@/lib/utils/memberData";
import { fetchMemberData } from "@/lib/utils/temp/memberData";
import { getMemberVotes } from "@/lib/server/routes/votes";

import SectionBoundary from "@/app/components/ui/system/SectionBoundary";

import MemberAbout from "@/app/components/features/members/shared/MemberAbout";
//import MemberTabs from "@/app/components/features/members/shared/MemberTabs";
import MemberTabs from "@/app/components/features/members/shared/temp/MemberTabs";

import MemberTerms from "@/app/components/features/members/shared/MemberTerms";
import SenateVotes from "@/app/components/features/members/senate-member/SenateVotes";
import VotesSplitSection from "@/app/components/features/members/shared/VoteSplitSection";

function stateBackLabel(profile) {
    return profile?.state_name || profile?.state || profile?.stateCode || profile?.state_code || "members";
}

function stateQueryValue(profile) {
    return profile?.stateCode || profile?.state_code || profile?.state || "";
}

async function timed(label, fn) {
    const start = performance.now();
    try {
        return await fn();
    } finally {
        console.log(`[perf] ${label}: ${Math.round(performance.now() - start)}ms`);
    }
}

export default async function MemberProfileView({
    bioguideId,
    variant = "page",
    showBackLink = true,
}) {
    const {
        profile,
        monthly,
        sponsoredRes,
        cosponsoredRes,
        alignmentPanel,
    } = await timed("member:fetchMemberData", () => fetchMemberData(bioguideId));

    if (!profile) {
        return (
            <div className="llmp3-panel llmp3-panel--empty">
                <p className="llm3-muted">Member not found.</p>
            </div>
        );
    }

    const isSenate = profile?.chamber === "Senate";
    const stateLabel = stateBackLabel(profile);
    const stateHref = `/search?state=${encodeURIComponent(stateQueryValue(profile))}`;

    const [allVotes, freshness, votesFreshness] = await Promise.all([
        timed("member:getMemberVotes", () =>
            getMemberVotes(bioguideId, { limit: variant === "panel" ? 40 : 50 })
        ),
        timed("member:tabsFreshness", () =>
            getSectionFreshness({
                schemaName: "sandbox_lemur_app_views_v1",
                viewNames: ["mv_member_bill_activity_v1", "member_monthly_activity_v1"],
                cacheKey: `member:${bioguideId}:tabsFreshness:v2`,
            })
        ),
        timed("member:votesFreshness", () =>
            getSectionFreshness({
                schemaName: "sandbox_lemur_app_views_v1",
                viewNames: ["mv_member_votes_v2", "mv_member_vote_agg_v1"],
                cacheKey: `member:${bioguideId}:votesFreshness`,
            })
        ),
    ]);

    return (
        <div className={`llmp3-profileView llmp3-profileView--${variant}`}>
            <section className="llmp3-intro">
                {showBackLink ? (
                    <div className="llmp3-back">
                        <Link href={stateHref} className="llmp3-back__link">
                            <ArrowLeft size={16} aria-hidden="true" />
                            <span>Back to {stateLabel} results</span>
                        </Link>
                    </div>
                ) : null}

                <SectionBoundary where="MemberHeader">
                    <div className="llmp3-intro__stack">
                        <MemberAbout profile={profile} />
                        <MemberTerms terms={profile.terms} compact={variant === "panel" && false} />
                    </div>
                </SectionBoundary>
            </section>

            <SectionBoundary where="MemberTabs">
                <div className="llmp3-panel llmp3-panel--legislation">
                    <MemberTabs
                        title="Legislative focus"
                        groupsSponsored={sponsoredRes}
                        groupsCosponsored={cosponsoredRes}
                        monthly={monthly}
                        sourceLabel="Includes sponsored + cosponsored bills"
                        freshnessAsOf={freshness.asOf}
                        freshnessPerView={freshness.perView}
                    />
                </div>
            </SectionBoundary>

            <SectionBoundary where="MemberVotesAndViz">
                <div className="llmp3-panel llmp3-panel--votes">
                    {isSenate ? (
                        <SenateVotes groups={allVotes} />
                    ) : (
                        <VotesSplitSection
                            alignmentPanel={alignmentPanel}
                            votes={allVotes}
                            tableInitialLimit={variant === "panel" ? 12 : 20}
                            votesFreshnessAsOf={votesFreshness.asOf}
                            chamberLabel={isSenate ? "Senate" : "House"}
                            heatmapWeeks={13}
                        />
                    )}
                </div>
            </SectionBoundary>
        </div>
    );
}
