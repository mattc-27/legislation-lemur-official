// app/(app)/member/[bioguideId]/page.jsx
import MemberProfileView from "@/app/components/features/members/shared/MemberProfileView";

import "@/app/styles/active/core/ll3.entity-detail.css";
import "@/app/styles/active/core/ll3.entity-ui.css";
import "@/app/styles/active/members/ll3.members.details.css";
import "@/app/styles/active/members/ll3.members.about.css";
import "@/app/styles/active/members/ll3.members.terms.css";
import "@/app/styles/active/members/ll3.members.badges.css";
import "@/app/styles/active/members/ll3.members.tabs.css";
import "@/app/styles/active/members/ll3.members.heatmap.css";
import "@/app/styles/active/members/ll3.members.viz.css";
import "@/app/styles/active/members/ll3.members.votes.css";
import "@/app/styles/active/members/ll3.members.vote-alignment.css";
import "@/app/styles/active/members/ll3.members.historical.css";

export default async function MemberPage({ params, searchParams }) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const bioguideId = decodeURIComponent(
        String(resolvedParams?.bioguideId ?? "").trim()
    ).toUpperCase();

    return (
        <MemberProfileView
            bioguideId={bioguideId}
            requestedCongress={resolvedSearchParams?.congress ?? null}
            fromBill={resolvedSearchParams?.fromBill ?? null}
            fromBillLabel={resolvedSearchParams?.fromBillLabel ?? null}
            variant="page"
            showBackLink
        />
    );
}
