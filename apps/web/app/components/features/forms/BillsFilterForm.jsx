// app/components/features/bills/BillsFilterForm.jsx
import Link from "next/link";

import AutocompleteInputClient from "@/app/components/features/forms/AutoCompleteInputClient";
import ResizableSelectClient from "@/app/components/features/forms/ResizableSelectClient";
import ChamberToggleClient from "@/app/components/features/forms/ChamberToggleClient";

import TypePillsClient from "./TypePillsClient";
import { llToast } from "@/lib/llToast";

export default function BillsFilterForm({
  variant = "desktop", // "desktop" | "sheet"
  filters,
  types = [],
  policyAreas = [],
  statuses = [],
  committees = [],
  action = null, // optional; defaults to current route when null
  formId, // ✅ add
}) {
  const isDesktop = variant === "desktop";
  const suffix = isDesktop ? "desktop" : "sheet";

  const ids = {
    q: `q_${suffix}`,
    chamber: `chamber_${suffix}`,
    type: `type_${suffix}`,
    policyAreaId: `policyAreaId_${suffix}`,
    statusId: `statusId_${suffix}`,
    committeeCodes: `committeeCodes_${suffix}`,
    subject: `subject_${suffix}`,
    from: `from_${suffix}`,
    to: `to_${suffix}`,
    minCos: `minCos_${suffix}`,
    sort: `sort_${suffix}`,
  };

  return (
    <form id={formId} className="ll3-filters" method="get" action={action || undefined}>
      {/* Search */}
      <div className="ll3-field ll3-field--span2">
        <label className="ll3-label" htmlFor={ids.q}>
          Search
        </label>
        <AutocompleteInputClient
          id={ids.q}
          name="q"
          defaultValue={filters.q || ""}
          placeholder="Search title, actions, or bill (e.g., Taiwan)"
          endpoint="/api/bills/autocomplete/q"
          mode="q"
          autoSubmitOnType
          autoSubmitOnSelect
        />


      </div>

      {/* Chamber (auto-submit) */}
      <div className="ll3-field">
        <label className="ll3-label">Chamber</label>
        <ChamberToggleClient
          id={ids.chamber}
          name="chamber"
          defaultValue={filters.chamber || ""}
          autoSubmit
        />
      </div>

      {/* Type (auto-submit) */}
      <div className="ll3-field">
        <label className="ll3-label">Type</label>
        <TypePillsClient
          name="type"
          value={filters.type || ""}
          types={types}
        />
      </div>

      {/* Policy area */}
      <div className="ll3-field">
        <label className="ll3-label" htmlFor={ids.policyAreaId}>
          Policy area
        </label>
        <select
          id={ids.policyAreaId}
          name="policyAreaId"
          defaultValue={filters.policyAreaId ?? ""}
          className="ll3-input"
        >
          <option value="">All policy areas</option>
          {policyAreas.map((p) => (
            <option key={p.policy_area_id} value={p.policy_area_id}>
              {p.policy_area_name} ({p.bill_count})
            </option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div className="ll3-field">
        <label className="ll3-label" htmlFor={ids.subject}>
          Subject
        </label>
        <AutocompleteInputClient
          id={ids.subject}
          name="subject"
          defaultValue={filters.subject || ""}
          placeholder="Energy, Health, Taxes…"
          endpoint="/api/bills/autocomplete/subjects"
          mode="subject"
        />
      </div>

      {/* Committees */}
      <div className="ll3-field ll3-field--span2">
        <label className="ll3-label" htmlFor={ids.committeeCodes}>
          Committees
        </label>
        <ResizableSelectClient
          id={ids.committeeCodes}
          name="committeeCodes"
          options={committees}
          defaultValue={filters.committeeCodes || []}
          placeholder="No committees available"
          minRows={2}
          maxRows={12}
        />
      </div>

      {/* Status */}
      <div className="ll3-field">
        <label className="ll3-label" htmlFor={ids.statusId}>
          Status <span className="ll3-label__hint">Where it is in the process</span>
        </label>
        <select
          id={ids.statusId}
          name="statusId"
          defaultValue={filters.statusId ?? ""}
          className="ll3-input"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s.status_id} value={s.status_id}>
              {s.status_label} ({s.bill_count})
            </option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div className="ll3-field">
        <label className="ll3-label" htmlFor={ids.from}>
          Introduced from <span className="ll3-label__hint">Introduced date</span>
        </label>
        <input
          id={ids.from}
          type="date"
          name="from"
          defaultValue={filters.from || ""}
          className="ll3-input"
        />
      </div>

      <div className="ll3-field">
        <label className="ll3-label" htmlFor={ids.to}>
          Introduced to <span className="ll3-label__hint">Introduced date</span>
        </label>
        <input
          id={ids.to}
          type="date"
          name="to"
          defaultValue={filters.to || ""}
          className="ll3-input"
        />
      </div>

      {/* Min cosponsors */}
      <div className="ll3-field">
        <label className="ll3-label" htmlFor={ids.minCos}>
          Min cosponsors
        </label>
        <input
          id={ids.minCos}
          type="number"
          min="0"
          name="minCos"
          defaultValue={filters.minCos}
          className="ll3-input"
          placeholder="0"
        />
      </div>

      {/* Sort */}
      <div className="ll3-field">
        <label className="ll3-label" htmlFor={ids.sort}>
          Sort
        </label>
        <select id={ids.sort} name="sort" defaultValue={filters.sort} className="ll3-input">
          <option value="latest_action">Latest action</option>
          <option value="introduced">Introduced</option>
          <option value="cosponsors">Cosponsors</option>
        </select>
      </div>

      {/* Actions */}
      <div className="ll3-actions">
        <button className="ll3-btn ll3-btn--primary ll3-btn--full" type="submit">
          Apply filters
        </button>

        {isDesktop ? (
          <Link className="ll3-btn ll3-btn--ghost ll3-btn--full ll3-only-desktop" href="/bills">
            Reset
          </Link>
        ) : (
          <Link className="ll3-btn ll3-btn--ghost ll3-btn--full" href="/bills">
            Reset
          </Link>
        )}
      </div>
    </form>
  );
}
