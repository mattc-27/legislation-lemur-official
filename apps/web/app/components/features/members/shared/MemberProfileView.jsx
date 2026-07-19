// app/components/features/members/shared/MemberProfileView.jsx
import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";

import { getSectionFreshness } from "@/lib/domains/freshness/getSectionFreshness";
import { fetchMemberData } from "@/lib/utils/memberData";
import { getMemberVotes } from "@/lib/server/routes/votes";

import SectionBoundary from "@/app/components/ui/system/SectionBoundary";
import MemberAbout from "@/app/components/features/members/shared/MemberAbout";
import MemberCongressSelector from "@/app/components/features/members/shared/MemberCongressSelector";
import MemberTabs from "@/app/components/features/members/shared/MemberTabs";
import MemberTerms from "@/app/components/features/members/shared/MemberTerms";
import SenateVotes from "@/app/components/features/members/senate-member/SenateVotes";
import VotesSplitSection from "@/app/components/features/members/shared/VoteSplitSection";

const APP_VIEW_SCHEMA = "sandbox_lemur_app_views_v1";
const MEMBER_TABS_FRESHNESS_VIEWS = ["mv_member_bill_activity_v3"];
const HOUSE_VOTE_FRESHNESS_VIEWS = ["mv_member_votes_v2", "mv_member_vote_agg_v1"];
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

function parseCongress(value) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function ordinal(value) {
  const n = Number(value);
  if (!Number.isInteger(n)) return String(value ?? "");
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  if (n % 10 === 1) return `${n}st`;
  if (n % 10 === 2) return `${n}nd`;
  if (n % 10 === 3) return `${n}rd`;
  return `${n}th`;
}

function congressLabel(value) {
  return `${ordinal(value)} Congress`;
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
  requestedCongress = null,
  variant = "page",
  showBackLink = true,
  fromBill = null,
  fromBillLabel = null,
}) {
  const mode = variant === "panel" ? "panel" : "page";
  const data = await timed("member:fetchMemberData", () =>
    fetchMemberData(bioguideId, { congress: parseCongress(requestedCongress) })
  );
  const { profile, monthly, sponsoredRes, cosponsoredRes, alignmentPanel, selectedCongress } = data;

  if (!profile) {
    return (
      <div className={`llmp3-page llmp3-page--${mode} llmp3-profileView llmp3-profileView--${mode}`} data-view-mode={mode}>
        <div className="llmp3-panel llmp3-panel--empty">
          <p className="llm3-muted">Member not found.</p>
        </div>
      </div>
    );
  }

  const isSenate = profile.chamber === "Senate";
  const isFormer = profile.isCurrent === false;
  const stateLabel = stateBackLabel(profile);
  const stateHref = `/member?state=${encodeURIComponent(stateQueryValue(profile))}#${String(stateQueryValue(profile)).toLowerCase()}`;
  const backHref = fromBill ? `/bills/${encodeURIComponent(fromBill)}` : stateHref;
  const backLabel = fromBill ? `Back to ${fromBillLabel || "bill"}` : `Back to ${stateLabel} results`;
  const voteFreshnessViews = isSenate ? SENATE_VOTE_FRESHNESS_VIEWS : HOUSE_VOTE_FRESHNESS_VIEWS;

  const [allVotes, freshness, votesFreshness] = await Promise.all([
    timed("member:getMemberVotes", () =>
      getMemberVotes(bioguideId, {
        congress: selectedCongress,
        limit: mode === "panel" ? 40 : 50,
      })
    ),
    timed("member:tabsFreshness", () =>
      getSectionFreshness({
        schemaName: APP_VIEW_SCHEMA,
        viewNames: MEMBER_TABS_FRESHNESS_VIEWS,
        cacheKey: `member:${bioguideId}:${selectedCongress}:tabsFreshness`,
      })
    ),
    timed("member:votesFreshness", () =>
      getSectionFreshness({
        schemaName: APP_VIEW_SCHEMA,
        viewNames: voteFreshnessViews,
        cacheKey: `member:${bioguideId}:${selectedCongress}:votesFreshness`,
      })
    ),
  ]);

  const disclosure = isFormer
    ? "This profile shows legislation sponsored or cosponsored during the member’s congressional service. Bill status and latest actions may reflect developments after the member left office."
    : null;

  return (
    <div className={`llmp3-page llmp3-page--${mode} llmp3-profileView llmp3-profileView--${mode}`} data-view-mode={mode}>
      <section className="llmp3-intro">
        {showBackLink ? (
          <div className="llmp3-back">
            <Link href={backHref} className="llmp3-back__link">
              <ArrowLeft size={16} aria-hidden="true" />
              <span>{backLabel}</span>
            </Link>
          </div>
        ) : null}

        <MemberCongressSelector
          availableCongresses={profile.availableCongresses}
          selectedCongress={selectedCongress}
        />

        <SectionBoundary where="MemberHeader">
          <div className="llmp3-intro__stack">
            <MemberAbout profile={profile} mode={mode} />
            {isFormer ? (
              <aside className="llmp3-historicalNotice" aria-label="Historical profile context">
                <History size={17} aria-hidden="true" />
                <div>
                  <strong>Historical profile</strong>
                  <span>
                    Showing activity from the {congressLabel(selectedCongress)}. Current-House comparison metrics are hidden unless a valid historical cohort is available.
                  </span>
                </div>
              </aside>
            ) : null}
            <MemberTerms terms={profile.terms} compact={mode === "panel"} mode={mode} />
          </div>
        </SectionBoundary>
      </section>

      <SectionBoundary where="MemberTabs">
        <div className="llmp3-panel llmp3-panel--legislation">
          <MemberTabs
            mode={mode}
            title={`Bills by topic — ${congressLabel(selectedCongress)}`}
            groupsSponsored={sponsoredRes}
            groupsCosponsored={cosponsoredRes}
            monthly={monthly}
            sourceLabel="Includes sponsored + cosponsored bills"
            freshnessAsOf={freshness.asOf}
            freshnessPerView={freshness.perView}
            freshnessDetails={freshness.details}
            freshnessMissingObjects={freshness.missingObjects}
            historicalDisclosure={disclosure}
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
              chamberLabel="House"
              heatmapWeeks={mode === "panel" ? 10 : 13}
            />
          )}
        </div>
      </SectionBoundary>
    </div>
  );
}
