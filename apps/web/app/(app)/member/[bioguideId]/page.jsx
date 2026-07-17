// app/(app)/member/[bioguideId]/page.jsx
import Link from "next/link";

import { getSectionFreshness } from "@/lib/domains/freshness/getSectionFreshness";
import { fetchMemberData } from '@/lib/utils/memberData';
import { getMemberVotes } from '@/lib/server/routes/votes';

import EntityDetailShell from "@/app/components/ui/EntityDetailShell";
import SectionBoundary from '@/app/components/ui/system/SectionBoundary';
import {
    EntityBackLink,
    EntityCard,
    EntitySection,
} from "@/app/components/ui/entity";

import MemberAbout from "@/app/components/features/members/shared/MemberAbout";
import MemberTabs from '@/app/components/features/members/shared/MemberTabs';
import MemberTerms from '@/app/components/features/members/shared/MemberTerms';

import SenateVotes from '@/app/components/features/members/senate-member/SenateVotes';

import VotesSplitSection from "@/app/components/features/members/shared/VoteSplitSection";



import {
    ArrowLeft
} from "lucide-react";


import "@/app/styles/active/core/ll3.entity-detail.css";
import "@/app/styles/active/core/ll3.entity-ui.css";

// import "@/app/styles/active/members/refactored/ll3.members.tokens.css";
// import "@/app/styles/active/members/refactored/ll3.members.ui.css";

// import "@/app/styles/active/members/refactored/ll3.members.details.css";
import "@/app/styles/active/members/ll3.members.details.css";
import "@/app/styles/active/members/ll3.members.about.css";
import "@/app/styles/active/members/ll3.members.terms.css";
import "@/app/styles/active/members/ll3.members.badges.css";
import "@/app/styles/active/members/ll3.members.tabs.css";
import "@/app/styles/active/members/ll3.members.heatmap.css";
import "@/app/styles/active/members/ll3.members.viz.css";
import "@/app/styles/active/members/ll3.members.votes.css";
import "@/app/styles/active/members/ll3.members.vote-alignment.css";


// import "@/app/styles/active/bills/bill-details/ll3.bills.details.css";
// import "@/app/styles/active/bills/bill-details/ll3.bill-panel.css";

export default async function MemberPage({ params, searchParams }) {
    const { bioguideId } = await params;
    const resolvedSearchParams = await searchParams;

    const fromBill = resolvedSearchParams?.fromBill || null;
    const fromBillLabel = resolvedSearchParams?.fromBillLabel || null;

    const {
        profile,
        monthly,
        sponsoredRes,
        cosponsoredRes,
        alignmentPanel,
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
        schemaName: "sandbox_lemur_app_views_v1",
        viewNames: [
            "mv_member_legislation_v2",
            "mv_member_bill_activity_v2",
            "member_monthly_activity_v1",
        ],
        cacheKey: `member:${bioguideId}:tabsFreshness`,
    });

    const votesFreshness = await getSectionFreshness({
        schemaName: "sandbox_lemur_app_views_v1",
        viewNames: isSenate
            ? ["mv_member_votes_v2", "mv_senate_vote_party_majorities_v1"]
            : ["mv_member_votes_v2", "mv_member_vote_agg_v1"],
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
        <EntityDetailShell entity="member" variant="wide" className="llmp3-page">
            <EntitySection className="llmp3-intro">
                <div className="llmp3-back">
                    <EntityBackLink
                        href={
                            fromBill
                                ? `/bills/${fromBill}`
                                : `/member?state=${encodeURIComponent(profile.stateCode || "")}`
                        }
                    >
                        {fromBill
                            ? `Back to ${fromBillLabel || "bill"}`
                            : `Back to ${stateLabel} results`}
                    </EntityBackLink>
                </div>
                <SectionBoundary where="MemberHeader">
                    <div className="llmp3-intro__stack">
                        <MemberAbout profile={profile} />
                        <MemberTerms terms={profile.terms} />
                    </div>
                </SectionBoundary>
            </EntitySection>
            <EntityCard variant="panel" className="llmp3-panel">
                <MemberTabs
                    title="Recent bills by topic"
                    groupsSponsored={sponsoredRes}
                    groupsCosponsored={cosponsoredRes}
                    monthly={monthly}
                    sourceLabel="Includes sponsored + co-sponsored bills"
                    freshnessAsOf={freshness.asOf}
                    freshnessPerView={freshness.perView}
                />
            </EntityCard>

            <SectionBoundary where="MemberVotesAndViz">
                <EntityCard variant="panel" className="llmp3-panel">
                    {isSenate ? (
                        <SenateVotes groups={allVotes} />
                    ) : (
                        <VotesSplitSection
                            alignmentPanel={alignmentPanel}
                            votes={allVotes}
                            tableInitialLimit={20}
                            votesFreshnessAsOf={votesFreshness.asOf}
                            chamberLabel={isSenate ? "Senate" : "House"}
                            heatmapWeeks={13}
                        />
                    )}
                </EntityCard>
            </SectionBoundary>
        </EntityDetailShell>
    );
}