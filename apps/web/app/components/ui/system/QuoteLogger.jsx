"use client";

import { useEffect } from "react";

export default function QuoteLogger() {
    useEffect(() => {
        const quotes = [
            "If you don't know the rules of procedure, you're not really in the room.",
            "Nothing is real until it’s in the Congressional Record.",
            "Behind every bill is a staffer quietly crying into a spreadsheet.",
            "Legislation: where good ideas go to get ten more sponsors.",
            "Always read the amendments. Always.",
            "Trust the process. No really… trust *which* process?",
        ];

        const q = quotes[Math.floor(Math.random() * quotes.length)];

        // ✅ expose for other UI (toasts, etc.)
        window.__LL_QUOTE__ = q;

        // (your existing console banner)
        console.log(
            "%c   LEGISLATION LEMUR   %c\n%cExplore your Congress, one nerdy console log at a time.%c",
            "font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 11px; letter-spacing: 0.18em; padding: 4px 10px; background: #020617; color: #7dd3fc; border-radius: 6px 6px 0 0; border: 1px solid #1e293b; border-bottom: none;",
            "font-size: 0;",
            "font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 11px; padding: 4px 10px; background: #020617; color: #e5e7eb; border-radius: 0 0 6px 6px; border: 1px solid #1e293b; border-top: none;",
            ""
        );

        console.log(
            "%c📜 Capitol Factoid:%c " + q,
            "font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; color: #7dd3fc; font-size: 11px;",
            "font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; color: #e5e7eb; font-size: 11px;"
        );
    }, []);

    return null;
}
