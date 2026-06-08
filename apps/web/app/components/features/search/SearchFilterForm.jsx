import Link from "next/link";
import { CalendarDays, FileText, Landmark, ListFilter, MapPin, Users } from "lucide-react";
import { ENTITY_OPTIONS, POLICY_AREA_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from "./searchUtils";

function Field({ label, children, className = "" }) {
  return (
    <div className={["ll3-field", className].filter(Boolean).join(" ")}>
      <label className="ll3-label">{label}</label>
      {children}
    </div>
  );
}

function Section({ icon: Icon, title, hint, children, defaultOpen = true }) {
  return (
    <details className="ll3-fsection" open={defaultOpen}>
      <summary className="ll3-fsection__summary">
        <span className="ll3-fsection__titleWrap">
          <span className="ll3-fsection__icon">
            <Icon size={14} aria-hidden="true" />
          </span>
          <span className="ll3-fsection__title">{title}</span>
        </span>
        {hint ? <span className="ll3-fsection__hint">{hint}</span> : null}
      </summary>

      <div className="ll3-fsection__body">{children}</div>
    </details>
  );
}
export default function SearchFilterForm({ filters, onClose }) {
  const activeEntity = filters?.entityTypes?.[0] || "";
  const clearHref = filters?.q ? `/search?q=${encodeURIComponent(filters.q)}` : "/search";

  const showBills = !activeEntity || activeEntity === "bill";
  const showMembers = !activeEntity || activeEntity === "member" || activeEntity === "seat";
  const showCommittees = !activeEntity || activeEntity === "committee";

  return (
    <form action="/search" method="get" className="ll3-filters ll3-filters--drawer">
      <input type="hidden" name="q" value={filters?.q || ""} />

      <Section icon={ListFilter} title="Search scope" hint="Entity + sort" defaultOpen>
        <Field label="Entity type">
          <select className="ll3-input" name="entityType" defaultValue={activeEntity}>
            {ENTITY_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Sort">
          <select className="ll3-input" name="sort" defaultValue={filters?.sort || "relevance"}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Field>
      </Section>

      {showBills ? (
        <Section icon={FileText} title="Bills" hint="Legislation filters" defaultOpen>
          <Field label="Chamber">
            <select className="ll3-select" name="chamber" defaultValue={filters?.chamber || ""}>
              <option value="">All chambers</option>
              <option value="House">House</option>
              <option value="Senate">Senate</option>
            </select>
          </Field>

          <Field label="Status">
            <select className="ll3-select" name="status" defaultValue={filters?.statusCode || ""}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Policy area">
            <select className="ll3-select" name="policyAreaId" defaultValue={filters?.policyAreaId || ""}>
              {POLICY_AREA_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
          <label className="ll3-checkRow">
            <input
              type="checkbox"
              name="hasSummary"
              value="true"
              defaultChecked={Boolean(filters?.hasSummary)}
              className="ll3-inputll3-checkRow__input"
            />
            <span className="ll3-checkRow__body">
              <span className="ll3-checkRow__label">Has summary</span>
              <span className="ll3-checkRow__hint">
                Only show bills with a generated summary.
              </span>
            </span>
          </label>
        </Section>
      ) : null}

      {showMembers ? (
        <Section icon={Users} title="Members & seats" hint="People + geography" defaultOpen={activeEntity === "member" || activeEntity === "seat"}>
          <Field label="State">
            <input className="ll3-input" name="state" defaultValue={filters?.stateCode || ""} placeholder="CO, ME, CA…" />
          </Field>

          <Field label="Chamber">
            <select className="ll3-input" name="chamber" defaultValue={filters?.chamber || ""}>
              <option value="">All chambers</option>
              <option value="House">House</option>
              <option value="Senate">Senate</option>
            </select>
          </Field>

          <Field label="Seat status">
            <select className="ll3-input ll3-select" name="seatStatus" defaultValue={filters?.seatStatus || ""}>
              <option value="">All seats</option>
              <option value="filled">Filled</option>
              <option value="vacant">Vacant</option>
            </select>
          </Field>
        </Section>
      ) : null}

      {showCommittees ? (
        <Section icon={Landmark} title="Committees" hint="Structure" defaultOpen={activeEntity === "committee"}>
          <Field label="Chamber">
            <select className="ll3-input" name="chamber" defaultValue={filters?.chamber || ""}>
              <option value="">All chambers</option>
              <option value="House">House</option>
              <option value="Senate">Senate</option>
            </select>
          </Field>
        </Section>
      ) : null}

      <Section icon={CalendarDays} title="Dates" hint="Activity" defaultOpen={false}>
        <Field label="Introduced after">
          <input className="ll3-input" type="date" name="from" defaultValue={filters?.from || ""} />
        </Field>
        <Field label="Introduced before">
          <input className="ll3-input" type="date" name="to" defaultValue={filters?.to || ""} />
        </Field>
      </Section>

      <div className="ll3-actions">
        <button type="submit" className="ll3-btn ll3-btn--primary ll3-btn--full">
          Apply filters
        </button>

        <Link
          href={clearHref}
          className="ll3-btn ll3-btn--clear ll3-btn--full"
          onClick={onClose}
        >
          Clear filters
        </Link>
      </div>
    </form>
  );
}
