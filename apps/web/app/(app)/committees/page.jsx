import { getCommitteesDirectory, getCommitteeCounts } from "@/lib/server/routes/committees";
import {
    Users,
    Network,
    Landmark,
    Handshake,
    ArrowRight,
    Building2,
    Layers3,
} from "lucide-react";

// import "@/app/styles/active/committees/ll3.committees.tokens.css";
// import "@/app/styles/active/committees/ll3.committees.ui.css";
// import "@/app/styles/active/committees/ll3.committees.directory.css";
import "@/app/styles/active/committees/ll3.committees.css";


export const revalidate = 600;

const TYPE_TABS = [
    { key: "standing", label: "Standing" },
    { key: "select", label: "Select / Special" },
    { key: "joint", label: "Joint" },
];

function normalizeTypeTab(raw) {
    const t = (raw || "").toLowerCase().trim();
    if (t === "select" || t === "special") return "select";
    if (t === "joint") return "joint";
    return "standing";
}

function buildHref({ type, q }) {
    const params = new URLSearchParams();
    if (type && type !== "standing") params.set("type", type);
    if (q) params.set("q", q);
    const s = params.toString();
    return s ? `/committees?${s}` : `/committees`;
}

function groupByChamber(rows) {
    const out = { house: [], senate: [], joint: [] };
    for (const r of rows || []) {
        const c = (r.chamber || "").toLowerCase();
        if (c === "house") out.house.push(r);
        else if (c === "senate") out.senate.push(r);
        else out.joint.push(r);
    }
    return out;
}

function laneTitle(key) {
    if (key === "house") return "House";
    if (key === "senate") return "Senate";
    return "Joint";
}

export default async function CommitteesPage({ searchParams }) {
    const sp = await searchParams;

    const congress = 119;
    const q = (sp?.q ?? "").trim();
    const type = normalizeTypeTab(sp?.type);

    const [rows, counts] = await Promise.all([
        getCommitteesDirectory(congress, { type, search: q || null }),
        getCommitteeCounts(congress, { type }),
    ]);

    const grouped = groupByChamber(rows);
    const isJoint = type === "joint";

    return (
        <div className="ll3-committees container stack-24">
            <header className="ll3c-hero">
                <div className="ll3c-hero__grid">
                    <div className="ll3c-hero__copy">
                        <div className="ll3c-eyebrow">Committee directory</div>

                        <h1 className="ll3c-h1">Congressional Committees</h1>

                        <p className="ll3c-sub">
                            Browse standing, select / special, and joint committees of the {congress}th Congress in a cleaner, more readable layout.
                        </p>

                        <div className="ll3c-signals" aria-label="Committees page highlights">
                            <div className="ll3c-signal">
                                <span className="ll3c-signal__dot" aria-hidden="true" />
                                <div>
                                    <div className="ll3c-signal__title">Structured by chamber</div>
                                    <div className="ll3c-signal__copy">
                                        House, Senate, and Joint committees grouped into simpler browsing lanes.
                                    </div>
                                </div>
                            </div>

                            <div className="ll3c-signal">
                                <span className="ll3c-signal__dot" aria-hidden="true" />
                                <div>
                                    <div className="ll3c-signal__title">Clearer committee context</div>
                                    <div className="ll3c-signal__copy">
                                        Includes type, chamber, system code, update date, and subcommittee structure.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="ll3c-hero__aside">
                        <div className="ll3c-summaryCard">
                            <div className="ll3c-summaryCard__kicker">Snapshot</div>

                            <div className="ll3c-summaryStats" aria-label="Committee counts">
                                <div className="ll3c-summaryStat">
                                    <Users className="ll3c-summaryStat__icon" aria-hidden="true" />
                                    <div>
                                        <div className="ll3c-summaryStat__label">Committees</div>
                                        <div className="ll3c-summaryStat__value">{counts.totals.committees}</div>
                                    </div>
                                </div>

                                <div className="ll3c-summaryStat">
                                    <Network className="ll3c-summaryStat__icon" aria-hidden="true" />
                                    <div>
                                        <div className="ll3c-summaryStat__label">Subcommittees</div>
                                        <div className="ll3c-summaryStat__value">{counts.totals.subcommittees}</div>
                                    </div>
                                </div>
                            </div>

                            <a className="ll3c-infoLink ll3c-infoLink--hero" href="/reference#committee-types">
                                Open committee reference
                                <ArrowRight size={14} strokeWidth={2} />
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <section className="ll3c-head">
                <div className="ll3c-tabsRow">
                    <nav className="ll3c-tabs" aria-label="Committee type">
                        {TYPE_TABS.map((t) => {
                            const active = t.key === type;
                            return (
                                <a
                                    key={t.key}
                                    href={buildHref({ type: t.key, q })}
                                    className={`ll3c-tab ${active ? "is-active" : ""}`}
                                    aria-current={active ? "page" : undefined}
                                >
                                    {t.label}
                                </a>
                            );
                        })}
                    </nav>

                    <a className="ll3c-infoLink" href="/reference#committee-types">
                        Info / Wiki
                    </a>
                </div>

                <div className="ll3c-chips" aria-label="Committee counts by chamber">
                    {counts.byChamber.map((c) => {
                        const ch = (c.chamber || "").toLowerCase();
                        const Icon =
                            ch === "house" ? Building2 :
                                ch === "senate" ? Landmark :
                                    ch === "joint" ? Handshake :
                                        Layers3;

                        return (
                            <span className="ll3c-pill" key={c.chamber}>
                                <Icon className="ll3c-pill__icon" aria-hidden="true" />
                                {c.chamber}: <strong className="ll3c-strong">{c.committees}</strong> + {c.subcommittees} subs
                            </span>
                        );
                    })}
                </div>

                <section className="ll3c-typePanel" aria-labelledby="committee-types">
                    <div className="ll3c-typeHead">
                        <div className="ll3c-eyebrow ll3c-eyebrow--small">Reference</div>
                        <h2 className="ll3c-h2" id="committee-types">Types of Committees</h2>
                        <p className="ll3c-typeSub">
                            Committees generally fall into three categories. Use the tabs above to browse each group.
                        </p>
                    </div>

                    <div className="ll3c-typeGrid">
                        <article className="ll3c-typeCard">
                            <div className="ll3c-typeKicker">Standing</div>
                            <p className="ll3c-typeBody">
                                Permanent committees with legislative jurisdiction. They hold hearings, conduct oversight,
                                and consider bills within assigned subject areas.
                            </p>
                        </article>

                        <article className="ll3c-typeCard">
                            <div className="ll3c-typeKicker">Select / Special</div>
                            <p className="ll3c-typeBody">
                                Often created to investigate, study, or focus on work that doesn’t fit neatly within standing committee jurisdiction.
                            </p>
                        </article>

                        <article className="ll3c-typeCard">
                            <div className="ll3c-typeKicker">Joint</div>
                            <p className="ll3c-typeBody">
                                Composed of Members from both chambers. Joint committees usually focus on studies or administrative and oversight work.
                            </p>
                        </article>
                    </div>

                    <div className="ll3c-typeNote">
                        <span className="ll3c-muted">
                            Note: Conference committees exist to reconcile House and Senate versions of legislation, but they are not a standing directory category.
                        </span>
                    </div>
                </section>
            </section>

            <section className="ll3c-panel ll3c-panel--directory">
                {rows.length === 0 ? (
                    <div className="ll3c-empty">No committees found. Try a different search.</div>
                ) : isJoint ? (
                    <div className="ll3c-lanes ll3c-lanes--single">
                        <div className="ll3c-lane ll3c-lane--joint">
                            <div className="ll3c-lane__head">
                                <h2 className="ll3c-lane__title">{laneTitle("joint")}</h2>
                                <div className="ll3c-lane__count">{grouped.joint.length}</div>
                            </div>

                            <ul className="ll3c-list">
                                {grouped.joint.map((c) => (
                                    <CommitteeCard key={c.system_code} c={c} />
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="ll3c-lanes">
                        <div className="ll3c-lane ll3c-lane--house">
                            <div className="ll3c-lane__head">
                                <h2 className="ll3c-lane__title">{laneTitle("house")}</h2>
                                <div className="ll3c-lane__count">{grouped.house.length}</div>
                            </div>

                            <ul className="ll3c-list">
                                {grouped.house.map((c) => (
                                    <CommitteeCard key={c.system_code} c={c} />
                                ))}
                            </ul>
                        </div>

                        <div className="ll3c-lane ll3c-lane--senate">
                            <div className="ll3c-lane__head">
                                <h2 className="ll3c-lane__title">{laneTitle("senate")}</h2>
                                <div className="ll3c-lane__count">{grouped.senate.length}</div>
                            </div>

                            <ul className="ll3c-list">
                                {grouped.senate.map((c) => (
                                    <CommitteeCard key={c.system_code} c={c} />
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

function CommitteeCard({ c }) {
    const chamberKey = (c.chamber || "").toLowerCase();
    const subs = Array.isArray(c.subcommittees) ? c.subcommittees : [];

    return (
        <li className={`ll3c-card ll3c-card--${chamberKey}`}>
            <div className="ll3c-card__top">
                <div className="ll3c-card__titleRow">
                    <span className={`ll3c-badge ll3c-badge--${chamberKey}`}>{c.chamber}</span>
                    <span className="ll3c-card__name">{c.name}</span>
                </div>

                <div className="ll3c-card__meta">
                    <span className="ll3c-tag">{c.committee_type_code}</span>
                    <span className="ll3c-code">
                        Code: <code>{c.system_code}</code>
                    </span>

                    {c.update_dt && (
                        <span className="ll3c-updated">
                            Updated: {new Date(c.update_dt).toLocaleDateString()}
                        </span>
                    )}

                    {c.url && (
                        <a className="ll3c-ext" href={c.url} target="_blank" rel="noreferrer">
                            API
                        </a>
                    )}
                </div>
            </div>

            {subs.length > 0 && (
                <details className="ll3c-details">
                    <summary className="ll3c-details__summary">
                        <span className="ll3c-details__chev" aria-hidden="true">▸</span>
                        <span>{subs.length} subcommittee{subs.length !== 1 ? "s" : ""}</span>
                    </summary>

                    <ul className="ll3c-sublist">
                        {subs.map((s) => (
                            <li key={s.system_code} className="ll3c-subitem">
                                <span className="ll3c-subname">{s.name}</span>
                                <span className="ll3c-subcode">
                                    (<code>{s.system_code}</code>)
                                </span>

                                {s.update_dt && (
                                    <span className="ll3c-updated">· {new Date(s.update_dt).toLocaleDateString()}</span>
                                )}

                                {s.url && (
                                    <a className="ll3c-ext" href={s.url} target="_blank" rel="noreferrer">
                                        API
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                </details>
            )}
        </li>
    );
}