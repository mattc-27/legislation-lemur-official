"use client";

import { useEffect, useMemo, useState } from "react";

export default function RefineResultsBarClient({
    children,
    activeCount = 0,
    label = "Bills",
    hint = "Sort & filters",
}) {
    const [open, setOpen] = useState(false);

    const badge = useMemo(() => (activeCount ? String(activeCount) : null), [activeCount]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    // Lock scroll while open
    useEffect(() => {
        if (!open) return;
        const prevOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";
        return () => {
            document.documentElement.style.overflow = prevOverflow || "";
        };
    }, [open]);

    // Auto-close when leaving mobile breakpoint
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 900px)");
        const onChange = (e) => {
            if (!e.matches) setOpen(false);
        };

        if (!mq.matches) setOpen(false);

        if (mq.addEventListener) mq.addEventListener("change", onChange);
        else mq.addListener(onChange);

        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", onChange);
            else mq.removeListener(onChange);
        };
    }, []);

    const openSheet = () => setOpen(true);

    return (
        <>
            {/* Hidden external trigger for top “Modify” button */}
            <button
                id="ll3-open-refine"
                type="button"
                onClick={openSheet}
                style={{ display: "none" }}
                aria-hidden="true"
                tabIndex={-1}
            />

            {/* Sticky bar (mobile only via CSS) */}
            <div className="ll3-refineBar">
                <div className="ll3-refineBar__inner">
                    <div className="ll3-refineBar__meta">
                        <div className="ll3-refineBar__label">{label}</div>
                        <div className="ll3-refineBar__hint">{hint}</div>
                    </div>

                    <button
                        type="button"
                        className="ll3-refineBar__btn"
                        onClick={openSheet}
                        aria-haspopup="dialog"
                        aria-expanded={open ? "true" : "false"}
                    >
                        Refine
                        {badge ? <span className="ll3-refineBar__badge">{badge}</span> : null}
                    </button>
                </div>
            </div>

            {/* Sheet */}
            {open ? (
                <div className="ll3-refineOverlay" role="presentation" onClick={() => setOpen(false)}>
                    <div
                        className="ll3-refineSheet__panel"
                        role="dialog"
                        aria-label="Refine results"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="ll3-refineSheet__handle" />

                        <div className="ll3-refineSheet__head">
                            <div>
                                <h2 className="ll3-refineSheet__title">Refine results</h2>
                                <p className="ll3-refineSheet__sub">Search and filter, then browse bills.</p>
                            </div>

                            <button type="button" className="ll3-refineSheet__close" onClick={() => setOpen(false)}>
                                Close
                            </button>
                        </div>

                        {children}
                    </div>
                </div>
            ) : null}
        </>
    );
}
