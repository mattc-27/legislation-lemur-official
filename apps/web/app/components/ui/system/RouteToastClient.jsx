"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { llToast } from "@/lib/llToast";

function labelForPath(pathname) {
    if (pathname === "/" || pathname === "/home") return "Home";
    if (pathname.startsWith("/bills")) return "Bills";
    if (pathname.startsWith("/search") || pathname.startsWith("/members")) return "Members";
    return null;
}

export default function RouteToastClient() {
    const pathname = usePathname();
    const prevLabelRef = useRef(null);

    useEffect(() => {
        const label = labelForPath(pathname);
        const prevLabel = prevLabelRef.current;
        prevLabelRef.current = label;

        if (!label) return;
        if (!prevLabel) return;              // ignore first render
        if (prevLabel === label) return;     // only when switching sections

        // ✅ don't overlap with loading-toasts
        if (window.__LL_NAV_LOADING_TOAST_ID__) return;

        // ✅ not chatty: only once per session
        const key = "ll3_quote_toast_shown";
        try {
            if (sessionStorage.getItem(key) === "1") return;
            sessionStorage.setItem(key, "1");
        } catch {
            // ignore if storage blocked; just proceed
        }

        const quote = window.__LL_QUOTE__;
        if (!quote) return;

        llToast.info(`Opening ${label}`, quote);
    }, [pathname]);

    return null;
}
