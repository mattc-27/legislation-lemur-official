import { getCommitteesDirectory } from "@/lib/server/routes/committees";
import { ExplorerPageShell, ExplorerPageHeader } from "@/app/components/shared/explorer";
import { LLLinkButton } from "@/app/components/shared/ui";
import {
    ArrowRight,
    Building2,
    Handshake,
    Landmark,
    Layers3,
    Network,
    Users,
} from "lucide-react";

import "@/app/styles/active/core/ll3.tokens.css";
import "@/app/styles/active/core/ll3.type.css";
import "@/app/styles/active/core/ll3.buttons.css";
import "@/app/styles/active/core/ll3.forms.css";
import "@/app/styles/active/core/ll3.cards.css";
import "@/app/styles/active/core/ll3.filters.css";
import "@/app/styles/active/core/ll3.explorer-shell.css";
import "@/app/styles/active/committees/ll3.committees.refactored.css";

export const revalidate = 600;

const CONGRESS = 119;

const TYPE_TABS = [
    { key: "standing", label: "Standing" },
    { key: "select", label: "Select / Special" },
    { key: "joint", label: "Joint" },
];

function normalizeTypeTab(raw) {
    const value = String(raw || "").toLowerCase().trim();
    if (value === "select" || value === "special") return "select";
    if (value === "joint") return "joint";
    return "standing";
}

function buildHref({ type, q }) {
    const params = new URLSearchParams();
    if (type && type !== "standing") params.set("type", type);
    if (q) params.set("q", q);

    const query = params.toString();
    return query ? `/committees?${query}` : "/committees";
}

function getCommitteeType(row) {
    const chamber = String(row?.chamber || "").toLowerCase();
    const typeCode = String(row?.committee_type_code || "").toLowerCase();

    if (chamber === "joint" || typeCode.includes("joint")) return "joint";
    if (typeCode.includes("select") || typeCode.includes("special")) return "select";
    return "standing";
}

function filterByType(rows, type) {
    return (rows || []).filter((row) => getCommitteeType(row) === type);
}

function groupByChamber(rows) {
    const grouped = { house: [], senate: [], joint: [] };

    for (const row of rows || []) {
        const chamber = String(row?.chamber || "").toLowerCase();
        if (chamber === "house") grouped.house.push(row);
        else if (chamber === "senate") grouped.senate.push(row);
        else grouped.joint.push(row);
    }

    return grouped;
}

function countSubcommittees(row) {
    return Array.isArray(row?.subcommittees) ? row.subcommittees.length : 0;
}

function buildCounts(rows) {
    const grouped = groupByChamber(rows);
    const chamberOrder = ["House", "Senate", "Joint"];

    const byChamber = chamberOrder
        .map((chamber) => {
            const key = chamber.toLowerCase();
            const chamberRows = grouped[key] || [];

            return {
                chamber,
                committees: chamberRows.length,
                subcommittees: chamberRows.reduce((sum, row) => sum + countSubcommittees(row), 0),
            };
        })
        .filter((item) => item.committees > 0 || item.subcommittees > 0);

    return {
        byChamber,
        totals: byChamber.reduce(
            (acc, item) => ({
                committees: acc.committees + item.committees,
                subcommittees: acc.subcommittees + item.subcommittees,
            }),
            { committees: 0, subcommittees: 0 }
        ),
    };
}

function laneTitle(key) {
    if (key === "house") return "House";
    if (key === "senate") return "Senate";
    return "Joint";
}

function chamberIcon(chamber) {
    const key = String(chamber || "").toLowerCase();
    if (key === "house") return Building2;
    if (key === "senate") return Landmark;
    if (key === "joint") return Handshake;
    return Layers3;
}

export default async function CommitteesPage({ searchParams }) {
    const sp = await searchParams;
    const q = String(sp?.q || "").trim();
    const type = normalizeTypeTab(sp?.type);

    const allRows = await getCommitteesDirectory(CONGRESS, { search: q || null });
    const rows = filterByType(allRows, type);
    const grouped = groupByChamber(rows);
    const counts = buildCounts(rows);
    const isJoint = type === "joint";

    return (
        <ExplorerPageShell variant="committees" className="ll3-committees">
            <ExplorerPageHeader
                eyebrow="Committee directory"
                title="Congressional Committees"
                titleMeta={`${CONGRESS}th Congress`}
                activeTool="committees"
                description="Browse standing, select / special, and joint committees by chamber, system code, update date, and subcommittee structure. Use Smart Search when you want cross-entity discovery across bills, members, committees, and topics."
            />

            <section className="ll3-committees__summaryGrid" aria-label="Committee directory snapshot">
                <article className="ll3-card ll3-committeeMetric">
                    <Users className="ll3-committeeMetric__icon" aria-hidden="true" />
                    <div>
                        <div className="ll3-committeeMetric__label">Committees</div>
                        <div className="ll3-committeeMetric__value">{counts.totals.committees}</div>
                    </div>
                </article>

                <article className="ll3-card ll3-committeeMetric">
                    <Network className="ll3-committeeMetric__icon" aria-hidden="true" />
                    <div>
                        <div className="ll3-committeeMetric__label">Subcommittees</div>
                        <div className="ll3-committeeMetric__value">{counts.totals.subcommittees}</div>
                    </div>
                </article>

                <article className="ll3-card ll3-committeeReferenceCard">
                    <div>
                        <div className="ll3-eyebrow">Reference</div>
                        <h2 className="ll3-h2">Types of Committees</h2>
                        <p className="ll3-copy">
                            Standing committees handle ongoing legislative jurisdiction, select / special committees focus on targeted work, and joint committees include Members from both chambers.
                        </p>
                    </div>

                    <LLLinkButton href="/reference#committee-types" variant="secondary">
                        Info / Wiki
                        <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                    </LLLinkButton>
                </article>
            </section>

            <section className="ll3-card ll3-committeeControls" aria-label="Committee filters">
                <div className="ll3-committeeControls__row">
                    <nav className="ll3-segmented" aria-label="Committee type">
                        {TYPE_TABS.map((tab) => (
                            <a
                                key={tab.key}
                                href={buildHref({ type: tab.key, q })}
                                className="ll3-segmented__item"
                                aria-current={tab.key === type ? "page" : undefined}
                            >
                                {tab.label}
                            </a>
                        ))}
                    </nav>

                    <form className="ll3-committeeSearch" action="/committees">
                        {type !== "standing" ? <input type="hidden" name="type" value={type} /> : null}
                        <label className="ll3-label" htmlFor="committee-search">Search committees</label>
                        <div className="ll3-committeeSearch__control">
                            <input
                                id="committee-search"
                                className="ll3-input"
                                type="search"
                                name="q"
                                defaultValue={q}
                                placeholder="Search by name or code…"
                            />
                            <button className="ll3-btn ll3-btn--primary" type="submit">Search</button>
                            {q ? (
                                <LLLinkButton href={buildHref({ type })} variant="clear">
                                    Clear
                                </LLLinkButton>
                            ) : null}
                        </div>
                    </form>
                </div>

                {counts.byChamber.length ? (
                    <div className="ll3-chipGroup" aria-label="Committee counts by chamber">
                        {counts.byChamber.map((item) => {
                            const Icon = chamberIcon(item.chamber);
                            return (
                                <span className="ll3-chip ll3-committeeChip" key={item.chamber}>
                                    <Icon className="ll3-committeeChip__icon" aria-hidden="true" />
                                    {item.chamber}: <strong>{item.committees}</strong> + {item.subcommittees} subs
                                </span>
                            );
                        })}
                    </div>
                ) : null}
            </section>

            <section className="ll3-card ll3-committeesDirectory" aria-labelledby="committees-directory-title">
                <div className="ll3-results__header ll3-committeesDirectory__header">
                    <div className="ll3-results__left">
                        <h2 className="ll3-h2" id="committees-directory-title">Committees</h2>
                        <div className="ll3-results__count">
                            <span className="ll3-muted">
                                Showing <strong className="ll3-strong">{rows.length}</strong>
                                {q ? <> matching <strong className="ll3-strong">“{q}”</strong></> : null}
                            </span>
                        </div>
                    </div>
                </div>

                {rows.length === 0 ? (
                    <div className="ll3-committeesEmpty">No committees found. Try a different search or committee type.</div>
                ) : isJoint ? (
                    <CommitteeLane chamber="joint" rows={grouped.joint} />
                ) : (
                    <div className="ll3-committeeLanes">
                        <CommitteeLane chamber="house" rows={grouped.house} />
                        <CommitteeLane chamber="senate" rows={grouped.senate} />
                    </div>
                )}
            </section>
        </ExplorerPageShell>
    );
}

function CommitteeLane({ chamber, rows }) {
    return (
        <section className={`ll3-committeeLane ll3-committeeLane--${chamber}`} aria-labelledby={`committee-lane-${chamber}`}>
            <div className="ll3-committeeLane__head">
                <h3 className="ll3-committeeLane__title" id={`committee-lane-${chamber}`}>{laneTitle(chamber)}</h3>
                <span className="ll3-committeeLane__count">{rows.length}</span>
            </div>

            <ul className="ll3-committeeList" role="list">
                {rows.map((committee) => (
                    <CommitteeCard key={committee.system_code} committee={committee} />
                ))}
            </ul>
        </section>
    );
}

function CommitteeCard({ committee }) {
    const chamberKey = String(committee?.chamber || "").toLowerCase();
    const subcommittees = Array.isArray(committee?.subcommittees) ? committee.subcommittees : [];

    return (
        <li className={`ll3-card ll3-committeeCard ll3-committeeCard--${chamberKey}`}>
            <div className="ll3-committeeCard__top">
                <div className="ll3-committeeCard__titleRow">
                    <span className={`ll3-committeeBadge ll3-committeeBadge--${chamberKey}`}>{committee.chamber}</span>
                    <span className="ll3-committeeCard__name">{committee.name}</span>
                </div>

                <div className="ll3-committeeCard__meta">
                    <span className="ll3-chip ll3-committeeTag">{committee.committee_type_code}</span>
                    <span className="ll3-committeeCode">
                        Code: <code>{committee.system_code}</code>
                    </span>

                    {committee.update_dt ? (
                        <span className="ll3-committeeUpdated">
                            Updated: {new Date(committee.update_dt).toLocaleDateString()}
                        </span>
                    ) : null}

                    {committee.url ? (
                        <a className="ll3-linkBtn ll3-linkBtn--sm ll3-linkBtn--soft" href={committee.url} target="_blank" rel="noreferrer">
                            API
                        </a>
                    ) : null}
                </div>
            </div>

            {subcommittees.length > 0 ? (
                <details className="ll3-committeeDetails">
                    <summary className="ll3-disclosureBtn ll3-committeeDetails__summary">
                        <span className="ll3-committeeDetails__chev" aria-hidden="true">▸</span>
                        <span>{subcommittees.length} subcommittee{subcommittees.length !== 1 ? "s" : ""}</span>
                    </summary>

                    <ul className="ll3-committeeSublist" role="list">
                        {subcommittees.map((subcommittee) => (
                            <li key={subcommittee.system_code} className="ll3-committeeSubitem">
                                <span className="ll3-committeeSubitem__name">{subcommittee.name}</span>
                                <span className="ll3-committeeSubitem__code">
                                    (<code>{subcommittee.system_code}</code>)
                                </span>

                                {subcommittee.update_dt ? (
                                    <span className="ll3-committeeUpdated">· {new Date(subcommittee.update_dt).toLocaleDateString()}</span>
                                ) : null}

                                {subcommittee.url ? (
                                    <a className="ll3-linkBtn ll3-linkBtn--sm ll3-linkBtn--soft" href={subcommittee.url} target="_blank" rel="noreferrer">
                                        API
                                    </a>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </details>
            ) : null}
        </li>
    );
}
