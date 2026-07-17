// app/components/features/members/shared/MemberProfileView.jsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getSectionFreshness } from "@/lib/domains/freshness/getSectionFreshness";
import { fetchMemberData } from "@/lib/utils/memberData";
import { getMemberVotes } from "@/lib/server/routes/votes";

import SectionBoundary from "@/app/components/ui/system/SectionBoundary";

import MemberAbout from "@/app/components/features/members/shared/MemberAbout";
import MemberTabs from "@/app/components/features/members/shared/MemberTabs";
import MemberTerms from "@/app/components/features/members/shared/MemberTerms";
import SenateVotes from "@/app/components/features/members/senate-member/SenateVotes";
import VotesSplitSection from "@/app/components/features/members/shared/VoteSplitSection";

const APP_VIEW_SCHEMA = "sandbox_lemur_app_views_v1";

const MEMBER_TABS_FRESHNESS_VIEWS = [
  "mv_member_legislation_v2",
  "mv_member_bill_activity_v2",
  "member_monthly_activity_v1",
];

const HOUSE_VOTE_FRESHNESS_VIEWS = [
  "mv_member_votes_v2",
  "mv_member_vote_agg_v1",
];

const SENATE_VOTE_FRESHNESS_VIEWS = [
  "mv_member_votes_v2",
  "mv_senate_vote_party_majorities_v1",
];

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
  const mode = variant === "panel" ? "panel" : "page";

  const {
    profile,
    monthly,
    sponsoredRes,
    cosponsoredRes,
    alignmentPanel,
  } = await timed("member:fetchMemberData", () => fetchMemberData(bioguideId));

  if (!profile) {
    return (
      <div
        className={`llmp3-page llmp3-page--${mode} llmp3-profileView llmp3-profileView--${mode}`}
        data-view-mode={mode}
      >
        <div className="llmp3-panel llmp3-panel--empty">
          <p className="llm3-muted">Member not found.</p>
        </div>
      </div>
    );
  }

  const isSenate = profile?.chamber === "Senate";
  const stateLabel = stateBackLabel(profile);
  const stateHref = `/search?state=${encodeURIComponent(stateQueryValue(profile))}`;
  const voteFreshnessViews = isSenate ? SENATE_VOTE_FRESHNESS_VIEWS : HOUSE_VOTE_FRESHNESS_VIEWS;

  const [allVotes, freshness, votesFreshness] = await Promise.all([
    timed("member:getMemberVotes", () =>
      getMemberVotes(bioguideId, { limit: mode === "panel" ? 40 : 50 })
    ),
    timed("member:tabsFreshness", () =>
      getSectionFreshness({
        schemaName: APP_VIEW_SCHEMA,
        viewNames: MEMBER_TABS_FRESHNESS_VIEWS,
        cacheKey: `member:${bioguideId}:tabsFreshness`,
      })
    ),
    timed("member:votesFreshness", () =>
      getSectionFreshness({
        schemaName: APP_VIEW_SCHEMA,
        viewNames: voteFreshnessViews,
        cacheKey: `member:${bioguideId}:votesFreshness`,
      })
    ),
  ]);

  return (
    <div
      className={`llmp3-page llmp3-page--${mode} llmp3-profileView llmp3-profileView--${mode}`}
      data-view-mode={mode}
    >
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
            <MemberAbout profile={profile} mode={mode} />
            <MemberTerms terms={profile.terms} compact={mode === "panel"} mode={mode} />
          </div>
        </SectionBoundary>
      </section>

      <SectionBoundary where="MemberTabs">
        <div className="llmp3-panel llmp3-panel--legislation">
          <MemberTabs
            mode={mode}
            title="Recent bills by topic"
            groupsSponsored={sponsoredRes}
            groupsCosponsored={cosponsoredRes}
            monthly={monthly}
            sourceLabel="Includes sponsored + co-sponsored bills"
            freshnessAsOf={freshness.asOf}
            freshnessPerView={freshness.perView}
            freshnessDetails={freshness.details}
            freshnessMissingObjects={freshness.missingObjects}
          />
        </div>
      </SectionBoundary>

      <SectionBoundary where="MemberVotesAndViz">
        <div className="llmp3-panel llmp3-panel--votes">
          {isSenate ? (
            <SenateVotes groups={allVotes} mode={mode} />
          ) : (
            <VotesSplitSection
              mode={mode}
              alignmentPanel={alignmentPanel}
              votes={allVotes}
              tableInitialLimit={mode === "panel" ? 12 : 20}
              votesFreshnessAsOf={votesFreshness.asOf}
              votesFreshnessPerView={votesFreshness.perView}
              votesFreshnessDetails={votesFreshness.details}
              chamberLabel={isSenate ? "Senate" : "House"}
              heatmapWeeks={mode === "panel" ? 10 : 13}
            />
          )}
        </div>
      </SectionBoundary>
    </div>
  );
}
