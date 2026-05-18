// app/components/features/members/profile/MemberProfilePanelShell.jsx
"use client";

import { useRouter } from "next/navigation";
import { X, ArrowLeft } from "lucide-react";

export default function MemberProfilePanelShell({ children }) {
    const router = useRouter();

    const closePanel = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
        }

        router.push("/search");
    };

    return (
        <div className="llmp3-panelRoute" role="dialog" aria-modal="true" aria-label="Member profile">
            <button
                type="button"
                className="llmp3-panelRoute__scrim"
                aria-label="Close member profile"
                onClick={closePanel}
            />

            <aside className="llmp3-panelRoute__panel">
                <div className="llmp3-panelRoute__bar">
                    <button type="button" className="llmp3-panelRoute__back" onClick={closePanel}>
                        <ArrowLeft size={16} aria-hidden="true" />
                        <span>Members</span>
                    </button>

                    <button type="button" className="llmp3-panelRoute__close" onClick={closePanel} aria-label="Close">
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                <div className="llmp3-panelRoute__body">{children}</div>
            </aside>
        </div>
    );
}
