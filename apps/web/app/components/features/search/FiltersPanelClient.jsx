"use client";

import { useMemo, useState } from "react";

export default function FiltersPanelClient({
  title = "Filters",
  defaultCollapsed = false,
  children,
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const btnLabel = useMemo(() => (collapsed ? "Show filters" : "Hide filters"), [collapsed]);

  return (
    <section className="filters-shell" aria-label="Search filters panel">
      <div className="filters-shell__head">
        <div className="filters-shell__title">{title}</div>

        <button
          type="button"
          className="btn btn--ghost btn--sm filters-shell__toggle"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
        >
          {btnLabel}
        </button>
      </div>

      <div className={collapsed ? "filters-shell__body is-collapsed" : "filters-shell__body"}>
        {children}
      </div>
    </section>
  );
}
