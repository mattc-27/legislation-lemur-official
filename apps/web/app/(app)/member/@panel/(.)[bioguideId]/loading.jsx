import MemberProfilePanelShell from "@/app/components/features/members/MemberProfilePanelShell";

import "@/app/styles/active/members/ll3.members.tokens.css";
import "@/app/styles/active/members/ll3.members.ui.css";
import "@/app/styles/active/members/ll3.members.profile-panel.css";

export default function LoadingMemberPanel() {
    return (
        <MemberProfilePanelShell>
            <div className="llmp3-page llmp3-page--panel">
                <div className="llmp3-profileView llmp3-profileView--panel">
                    <section className="llmp3-intro">
                        <div className="llmp3-panel llmp3-panel--loading">
                            <div className="llmp3-skeleton llmp3-skeleton--avatar" />
                            <div className="llmp3-skeletonStack">
                                <div className="llmp3-skeleton llmp3-skeleton--title" />
                                <div className="llmp3-skeleton llmp3-skeleton--line" />
                                <div className="llmp3-skeleton llmp3-skeleton--line short" />
                            </div>
                        </div>
                    </section>

                    <div className="llmp3-panel llmp3-panel--loadingBlock">
                        <div className="llmp3-skeleton llmp3-skeleton--cardTitle" />
                        <div className="llmp3-skeleton llmp3-skeleton--card" />
                    </div>

                    <div className="llmp3-panel llmp3-panel--loadingBlock">
                        <div className="llmp3-skeleton llmp3-skeleton--cardTitle" />
                        <div className="llmp3-skeleton llmp3-skeleton--card" />
                    </div>
                </div>
            </div>
        </MemberProfilePanelShell>
    );
}