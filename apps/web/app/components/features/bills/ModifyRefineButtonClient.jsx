"use client";

import { useCallback } from "react";

function isMobileBp() {
    return window.matchMedia("(max-width: 900px)").matches;
}

export default function ModifyRefineButtonClient({
    desktopTargetId = "ll3-refine-desktop",
    mobileTargetId = "ll3-open-refine",
    children = "Modify",
    className = "ll3-btn ll3-btn--ghost ll3-btn--sm",
}) {
    const onClick = useCallback(() => {
        if (typeof window === "undefined") return;

        if (isMobileBp()) {
            // open sheet
            document.getElementById(mobileTargetId)?.click();
            return;
        }

        // desktop: scroll to refine panel + focus first input if possible
        const panel = document.getElementById(desktopTargetId);
        panel?.scrollIntoView({ behavior: "smooth", block: "start" });

        // focus a useful field
        const firstFocusable =
            panel?.querySelector("input, select, textarea, button") || null;
        if (firstFocusable && typeof firstFocusable.focus === "function") {
            setTimeout(() => firstFocusable.focus({ preventScroll: true }), 250);
        }
    }, [desktopTargetId, mobileTargetId]);

    return (
        <button type="button" className={className} onClick={onClick}>
            {children}
        </button>
    );
}
