// app/(app)/member/[bioguideId]/page.jsx
import Link from "next/link";
import { fetchMemberData } from '../../../../lib/utils/memberData';
import { getMemberVotes } from '@/lib/server/votes';

import ErrorBoundary from '@/app/components/ui/system/ErrorBoundary';

import ActivityTimeline from '@/app/components/members/house-member/ActivityTimeline';

import MemberAbout from "@/app/components/members/chamber-agnostic/MemberAbout";
import MemberTabs from '@/app/components/members/chamber-agnostic/MemberTabs';
import MemberTerms from '@/app/components/members/chamber-agnostic/MemberTerms';

import KpiRow from '@/app/components/members/chamber-agnostic/KpiRow';

import SenateVotes from '@/app/components/members/senate-member/SenateVotes';
import VotesSection from '@/app/components/members/house-member/VoteSection';
import VoteAlignmentPanel from '@/app/components/members/house-member/VoteAlignmentGauge';

import '../../../../lib/stylesheets/refactored/member-styles.refactored.css';
import '../../../../lib/stylesheets/refactored/vote-ui.refactored.css';
import '../../../../lib/stylesheets/refactored/ui-controls.css';

export default async function MemberPage({ params }) {
    const { bioguideId } = await params; // no await
    //const bioguideId = params.id;

    const {
        profile,
        monthly,
        sponsoredRes,
        cosponsoredRes,
        //recentVotes,
        alignment,
        kpis,
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

    //console.log(alignment)
    //  console.log(profile)


    // Map helper return shapes to what the UI expects
    const sponsoredGroups = sponsoredRes?.groups ?? [];
    const cosponsoredGroups = cosponsoredRes?.groups ?? [];

    // KPIs (KpiRow hides nulls; you can refine “YTD” later)
    const sponsoredYTD = (monthly || []).reduce((a, r) => a + (r.sponsored || 0), 0);
    const cosponsoredYTD = (monthly || []).reduce((a, r) => a + (r.cosponsored || 0), 0);
    const totalYTD = sponsoredYTD + cosponsoredYTD;
    //const kpis = { totalYTD, sponsoredYTD, cosponsoredYTD };

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
        <div className="member-page stack-24">
            <div className="member-back">
                <Link
                    href={`/search?state=${encodeURIComponent(profile.stateCode || "")}`}
                    className="btn btn--ghost btn--pill member-back__btn"
                >
                    <span className="member-back__icon">←</span>
                    <span>Back to {stateLabel} results</span>
                </Link>
            </div>

            <ErrorBoundary where="MemberHeader">
                <MemberAbout profile={profile} />
                <MemberTerms terms={profile.terms} />
            </ErrorBoundary>
            <ErrorBoundary where="KpiRow">
                <KpiRow kpis={kpis} />
            </ErrorBoundary>

            <ErrorBoundary where="MemberTabs">
                <MemberTabs
                    title="Recent bills by topic"
                    groupsSponsored={sponsoredRes}
                    groupsCosponsored={cosponsoredRes}
                    monthly={monthly}
                    sourceLabel="Includes sponsored + co-sponsored bills"
                />
            </ErrorBoundary>
            <ErrorBoundary where="MemberTabs">
                {/* <VotesTable votes={recentVotes} />*/}
                {isSenate ? (
                    <SenateVotes groups={allVotes} />
                ) : (
                    <>
                        <VoteAlignmentPanel value={alignment} />
                        <div className="tabs-topviz__item">
                            <VotesSection votes={allVotes} tableInitialLimit={20} />
                        </div>
                        <div className="tabs-topviz__timeline">
                            <ActivityTimeline data={monthly} />
                        </div>
                    </>
                )}
            </ErrorBoundary>
        </div>
    );
}