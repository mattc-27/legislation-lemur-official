"use client";

import { useCallback } from "react";

const REFINE_MOBILE_QUERY = "(max-width: 980px)";

function isMobileBp() {
    return window.matchMedia(REFINE_MOBILE_QUERY).matches;
}
export default function ModifyRefineButtonClient({
    desktopTargetId = "ll3-refine-desktop",
    mobileTargetId = "ll3-open-refine",
    children = "Modify",
    className = "",
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
        <button
            type="button"
            className={[
                "ll3-btn",
                "ll3-btn--ghost",
                "ll3-btn--sm",
                "ll3-modifyRefineBtn",
                className,
            ].filter(Boolean).join(" ")}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
