// app/(app)/member/@panel/(.)[bioguideId]/page.jsx
import MemberProfilePanelShell from "@/app/components/features/members/MemberProfilePanelShell";
import MemberProfileView from "@/app/components/features/members/shared/MemberProfileView";

import "@/app/styles/active/members/ll3.members.tokens.css";
import "@/app/styles/active/members/ll3.members.ui.css";
import "@/app/styles/active/members/ll3.members.details.css";
import "@/app/styles/active/members/ll3.members.about.css";
import "@/app/styles/active/members/ll3.members.terms.css";
import "@/app/styles/active/members/ll3.members.badges.css";
import "@/app/styles/active/members/ll3.members.tabs.css";
import "@/app/styles/active/members/ll3.members.heatmap.css";
import "@/app/styles/active/members/ll3.members.viz.css";
import "@/app/styles/active/members/ll3.members.votes.css";
import "@/app/styles/active/members/ll3.members.vote-alignment.css";
import "@/app/styles/active/core/ll3.route-panel.css";
import "@/app/styles/active/members/ll3.members.profile-panel.css";
import "@/app/styles/active/members/ll3.members.page.css";
import "@/app/styles/active/members/ll3.members.historical.css";

export default async function MemberPanelRoute({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const bioguideId = decodeURIComponent(
    String(resolvedParams?.bioguideId ?? "").trim()
  ).toUpperCase();

  return (
    <MemberProfilePanelShell>
      <MemberProfileView
        bioguideId={bioguideId}
        requestedCongress={resolvedSearchParams?.congress ?? null}
        variant="panel"
        showBackLink={false}
      />
    </MemberProfilePanelShell>
  );
}
