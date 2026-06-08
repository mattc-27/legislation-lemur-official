// app/member/@panel/(.)[bioguideId]/page.jsx
import { notFound } from "next/navigation";

//import { fetchMemberData } from "@/lib/memberData";
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


export default async function MemberPanelRoute({ params }) {
    // const resolvedParams = await params;
    //const bioguideId = decodeURIComponent((resolvedParams?.bioguideId ?? "").toString().trim()).toUpperCase();
    const { bioguideId } = await params;

    // if (!bioguideId) return notFound();

    // const data = await fetchMemberData(bioguideId);

    //if (!data?.profile) return notFound();

    return (
        <MemberProfilePanelShell>
            <MemberProfileView //{...data} mode="panel" 
                bioguideId={bioguideId}
                variant="panel"
                showBackLink={false}
            />
        </MemberProfilePanelShell>
    );
}
