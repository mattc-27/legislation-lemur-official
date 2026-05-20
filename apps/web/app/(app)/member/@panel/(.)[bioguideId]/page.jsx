// app/(app)/@memberPanel/(.)member/[bioguideId]/page.jsx
// import MemberProfileView from "@/app/components/features/members/profile/MemberProfileView";
import MemberProfileView from "@/app/components/features/members/profile/MemberProfileViewTemp";
import MemberProfilePanelShell from "@/app/components/features/members/profile/MemberProfilePanelShell";

import "@/app/styles/active/members/refactored/ll3.members.tokens.css";
import "@/app/styles/active/members/refactored/ll3.members.ui.css";
import "@/app/styles/active/members/refactored/ll3.members.details.css";
import "@/app/styles/active/members/refactored/ll3.members.about.css";
import "@/app/styles/active/members/refactored/ll3.members.terms.css";
import "@/app/styles/active/members/refactored/ll3.members.badges.css";
import "@/app/styles/active/members/refactored/ll3.members.tabs.css";
import "@/app/styles/active/members/refactored/ll3.members.heatmap.css";
import "@/app/styles/active/members/refactored/ll3.members.viz.css";
import "@/app/styles/active/members/refactored/ll3.members.votes.css";
import "@/app/styles/active/members/refactored/ll3.members.vote-alignment.css";
import "@/app/styles/active/members/updates/ll3.members.profile-panel.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MemberPanelPage({ params }) {
    const { bioguideId } = await params;

    return (
        <MemberProfilePanelShell>
            <div className="llmp3-page llmp3-page--panel">
                <MemberProfileView
                    bioguideId={bioguideId}
                    variant="panel"
                    showBackLink={false}
                />
            </div>
        </MemberProfilePanelShell>
    );
}