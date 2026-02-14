"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { llToast } from "@/lib/llToast";

export default function BillsFilterFormToastsClient({
    formId,
    total = null, // (kept, but not used on submit)
    variant = "desktop",
}) {
    const sp = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // Track prev vs current query for Undo
    const prevQueryRef = useRef("");
    const lastQueryRef = useRef("");

    useEffect(() => {
        const q = sp?.toString() ?? "";
        prevQueryRef.current = lastQueryRef.current; // shift
        lastQueryRef.current = q;
    }, [sp]);

    useEffect(() => {
        const form = document.getElementById(formId);
        if (!form) return;

        const resetLink = form.querySelector('a[href="/bills"]');

        const onSubmit = () => {
            // Avoid lying about totals here (total is from previous render)
            llToast.info("Filters applied", "Updating results…");
        };

        const onResetClick = () => {
            const prev = prevQueryRef.current || "";
            llToast.undo("Cleared filters", "Back to default view", () => {
                router.push(prev ? `${pathname}?${prev}` : pathname);
            });
        };

        form.addEventListener("submit", onSubmit);
        resetLink?.addEventListener("click", onResetClick);

        return () => {
            form.removeEventListener("submit", onSubmit);
            resetLink?.removeEventListener("click", onResetClick);
        };
    }, [formId, pathname, router, variant]);

    return null;
}
