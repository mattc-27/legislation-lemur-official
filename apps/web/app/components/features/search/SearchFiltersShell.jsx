"use client";

import { useEffect, useState } from "react";

export default function SearchFiltersShell({
    children,
    hasQuery = false,
    hasAnyFilters = false,
}) {
    const [collapsed, setCollapsed] = useState(true);

    // On mount, default:
    // - if no query yet => show filters (help user start)
    // - if query exists => collapse (results-first)
    useEffect(() => {
        setCollapsed(Boolean(hasQuery));
    }, [hasQuery]);

    return (
        <div
            className="filters-shell"
            data-collapsed={collapsed ? "true" : "false"}
        >
            <button
                className="btn btn--ghost btn--pill filters-toggle"
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                aria-expanded={!collapsed}
                aria-controls="filters-panel"
            >
                {collapsed ? "Show filters" : "Hide filters"}
                {hasAnyFilters ? (
                    <span className="filters-toggle__badge" aria-label="Filters applied">
                        ●
                    </span>
                ) : null}
            </button>

            <section id="filters-panel" className="panel panel--frost">
                {children}
            </section>
        </div>
    );
}
