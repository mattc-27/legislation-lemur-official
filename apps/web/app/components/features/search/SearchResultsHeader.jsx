import Link from "next/link";
import {
  Building2,
  FileText,
  Layers3,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { ENTITY_OPTIONS, getEntityCounts, paramsFrom } from "./searchUtils";

const ENTITY_ICONS = {
  all: Layers3,
  bill: FileText,
  member: Users,
  committee: Building2,
};

export default function SearchResultsHeader({
  filters,
  rows = [],
  grouped = {},
  onOpenFilters,
}) {
  const activeEntity = filters?.entityTypes?.[0] || "";
  const counts = getEntityCounts(grouped, rows);

  return (
    <div className="ll3-searchToolbar">

      {/* Results summary */}
      <div className="ll3-searchMetaRow">
        <div className="ll3-searchMeta">
          Showing <strong>{rows.length}</strong> results for{" "}
          <strong className="ll3-searchMeta__query">
            “{filters.q}”
          </strong>
        </div>
      </div>

      {/* Entity filters */}
      <div className="ll3-searchTypeScroller">
        {ENTITY_OPTIONS
          .filter((opt) => opt.value !== "seat")
          .map((opt) => {
            const key = opt.value || "all";
            const Icon = ENTITY_ICONS[key] || Layers3;
            const count = opt.value ? counts[opt.value] : counts.all;

            const active = activeEntity === opt.value;
            const isZero = opt.value && Number(count) === 0;

            return (
              <Link
                key={key}
                href={paramsFrom(filters, {
                  entityTypes: opt.value ? [opt.value] : [],
                })}
                className={[
                  "ll3-pill",
                  "ll3-pill--entity",
                  active ? "is-active" : "",
                  isZero ? "is-disabled" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={active ? "true" : undefined}
                aria-disabled={isZero ? "true" : undefined}
                tabIndex={isZero ? -1 : undefined}
              >
                <Icon size={15} aria-hidden="true" />
                <span>{opt.label}</span>

                {Number.isFinite(count) ? (
                  <span className="ll3-searchTab__count">
                    {count}
                  </span>
                ) : null}
              </Link>
            );
          })}
      </div>

      {/* Filters row */}
      <div className="ll3-searchActionsRow">
        <button
          type="button"
          className="ll3-btn ll3-btn--dark ll3-btn--sm ll3-searchFilterBtn"
          onClick={onOpenFilters}
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
        </button>
      </div>

      <div className="ll3-searchDivider" />
    </div>
  );
}