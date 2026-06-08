"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import SearchFilterForm from "./SearchFilterForm";

export default function SearchFilterDrawer({ open, onClose, filters }) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);

    return () => {
      document.documentElement.style.overflow = prevOverflow || "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ll3-searchDrawer" role="dialog" aria-modal="true" aria-label="Refine search">
      <button className="ll3-searchDrawer__backdrop" type="button" aria-label="Close filters" onClick={onClose} />

      <aside className="ll3-searchDrawer__panel">
        <div className="ll3-searchDrawer__head">
          <div>
            <h2>Refine search</h2>
            <p>Keep the query, narrow the results.</p>
          </div>
          <button type="button" className="ll3-searchDrawer__close" onClick={onClose} aria-label="Close filters">
            <X size={18} />
          </button>
        </div>

        <SearchFilterForm filters={filters} onClose={onClose} />
      </aside>
    </div>
  );
}
