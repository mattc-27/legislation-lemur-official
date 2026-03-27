import Link from "next/link";
import {
    CalendarDays,
    FolderKanban,
    Landmark,
    Users,
} from "lucide-react";

import AutocompleteInputClient from "@/app/components/features/forms/AutoCompleteInputClient";
import ResizableSelectClient from "@/app/components/features/forms/ResizableSelectClient";
import ChamberToggleClient from "@/app/components/features/forms/ChamberToggleClient";

import TypePillsClient from "../../forms/TypePillsClient";

function FilterSection({ icon: Icon, title, hint, children, defaultOpen = true }) {
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

export default function BillsFilterForm({
    variant = "desktop",
    filters,
    types = [],
    policyAreas = [],
    statuses = [],
    committees = [],
    action = null,
    formId,
    showSearch = true,
    showFilters = true,
    showActions = true,
}) {
    const isMobile = variant === "sheet";
    const isSidebar = variant === "sidebar";
    const suffix = variant;

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

    const topLevelClass = ["ll3-filters", variant ? `ll3-filters--${variant}` : ""]
        .filter(Boolean)
        .join(" ");

    return (
        <form id={formId} className={topLevelClass} method="get" action={action || "/bills"}>
            {showSearch ? (
                <div className="ll3-field ll3-field--span2">
                    <label className="ll3-label" htmlFor={ids.q}>
                        Search
                    </label>

                    <AutocompleteInputClient
                        id={ids.q}
                        name="q"
                        defaultValue={filters.q || ""}
                        placeholder="Search by bill number, topic, action, sponsor…"
                        endpoint="/api/bills/autocomplete/q"
                        mode="q"
                        autoSubmitOnType={!isMobile}
                        autoSubmitOnSelect={!isMobile}
                    />
                </div>
            ) : null}

            {showFilters ? (
                <div className="ll3-filterSections">
                    <FilterSection
                        icon={Landmark}
                        title="Overview"
                        hint="Process + type"
                        defaultOpen={true}
                    >
                        <div className="ll3-filterGrid">
                            <div className="ll3-field">
                                <label className="ll3-label">Chamber</label>
                                <ChamberToggleClient
                                    id={ids.chamber}
                                    name="chamber"
                                    defaultValue={filters.chamber || ""}
                                    autoSubmit={!isMobile}
                                />
                            </div>

                            <div className="ll3-field">
                                <label className="ll3-label">Type</label>
                                <TypePillsClient
                                    name="type"
                                    value={filters.type || null}
                                    types={types}
                                    autoSubmit={!isMobile}
                                />
                            </div>

                            <div className="ll3-field">
                                <label className="ll3-label" htmlFor={ids.statusId}>
                                    Status
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

                            <div className="ll3-field">
                                <label className="ll3-label" htmlFor={ids.sort}>
                                    Sort
                                </label>
                                <select
                                    id={ids.sort}
                                    name="sort"
                                    defaultValue={filters.sort}
                                    className="ll3-input"
                                >
                                    <option value="latest_action">Latest action</option>
                                    <option value="introduced">Introduced</option>
                                    <option value="cosponsors">Cosponsors</option>
                                    <option value="impact">Impact</option>
                                    <option value="trending">Trending</option>
                                </select>
                            </div>
                        </div>
                    </FilterSection>

                    <FilterSection
                        icon={FolderKanban}
                        title="Topics & committees"
                        hint="Subject matter"
                        defaultOpen={isSidebar ? false : true}
                    >
                        <div className="ll3-filterGrid">
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

                            <div className="ll3-field">
                                <label className="ll3-label" htmlFor={ids.subject}>
                                    Subject
                                </label>
                                <AutocompleteInputClient
                                    id={ids.subject}
                                    name="subject"
                                    defaultValue={filters.subject || ""}
                                    placeholder="Energy, Health, Taxes..."
                                    endpoint="/api/bills/autocomplete/subjects"
                                    mode="subject"
                                />
                            </div>

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
                                    minRows={isSidebar ? 6 : 3}
                                    maxRows={12}
                                />
                            </div>
                        </div>
                    </FilterSection>

                    <FilterSection
                        icon={CalendarDays}
                        title="Dates"
                        hint="Introduced range"
                        defaultOpen={false}
                    >
                        <div className="ll3-filterGrid">
                            <div className="ll3-field">
                                <label className="ll3-label" htmlFor={ids.from}>
                                    From
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
                                    To
                                </label>
                                <input
                                    id={ids.to}
                                    type="date"
                                    name="to"
                                    defaultValue={filters.to || ""}
                                    className="ll3-input"
                                />
                            </div>
                        </div>
                    </FilterSection>

                    <FilterSection
                        icon={Users}
                        title="Sponsorship"
                        hint="Support level"
                        defaultOpen={false}
                    >
                        <div className="ll3-filterGrid">
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
                        </div>
                    </FilterSection>
                </div>
            ) : null}

            {showActions ? (
                <div className="ll3-actions">
                    <button
                        id="ll3-apply-filters"
                        name="applyFilters"
                        data-apply="true"
                        type="submit"
                        className="ll3-btn ll3-btn--primary ll3-btn--full"
                    >
                        Apply filters
                    </button>

                    <Link className="ll3-btn ll3-btn--ghost ll3-btn--full" href="/bills">
                        Reset
                    </Link>
                </div>
            ) : null}
        </form>
    );
}