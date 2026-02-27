// app/(app)/committees/page.jsx
import { getCommitteesDirectory, getCommitteeCounts } from "@/lib/server/routes_stage/committees";

// optional: reuse your hero/search visuals
//import "../../stylesheets/home-styles.css";

// LL3 committees styles (new)
import "@/app/styles/active/committees/ll3.committees.tokens.css";
import "@/app/styles/active/committees/ll3.committees.ui.css";
import "@/app/styles/active/committees/ll3.committees.directory.css";

export const revalidate = 600;

export default async function CommitteesPage({ searchParams }) {
    const sp = await searchParams;

    const congress = 119; // TODO: lift to config/env if needed
    const chamber = sp?.chamber ?? ""; // "House" | "Senate" | "Joint" | ""
    const q = (sp?.q ?? "").trim();

    const [rows, counts] = await Promise.all([
        getCommitteesDirectory(congress, { chamber: chamber || null, search: q || null }),
        getCommitteeCounts(congress),
    ]);

    return (
        <div className="ll3-committees container stack-24">
            <header className="ll3c-head">
                <div className="ll3c-head__title">
                    <h1 className="ll3c-h1">Committees</h1>
                    <p className="ll3c-sub">
                        Browse standing, select, and joint committees of the {congress}th Congress.
                    </p>
                </div>

                <form className="ll3c-filters" action="/committees" method="get">
                    <div className="ll3c-field ll3c-field--search">
                        <label className="ll3c-label" htmlFor="q">Search</label>
                        <input
                            id="q"
                            name="q"
                            type="search"
                            placeholder="Name or code (e.g., “Judiciary”, “ssju00”)"
                            defaultValue={q}
                            className="ll3c-input"
                        />
                    </div>

                    <div className="ll3c-field ll3c-field--chamber">
                        <label className="ll3c-label" htmlFor="chamber">Chamber</label>
                        <select
                            id="chamber"
                            name="chamber"
                            defaultValue={chamber}
                            className="ll3c-input ll3c-select"
                        >
                            <option value="">All</option>
                            <option value="House">House</option>
                            <option value="Senate">Senate</option>
                            <option value="Joint">Joint</option>
                        </select>
                    </div>

                    <div className="ll3c-actions">
                        <button className="ll3c-btn ll3c-btn--primary" type="submit">Apply</button>
                        <a className="ll3c-btn ll3c-btn--ghost" href="/committees">Reset</a>
                    </div>
                </form>

                <div className="ll3c-chips" aria-label="Committee counts">
                    <span className="ll3c-pill">
                        Total Committees: <strong className="ll3c-strong">{counts.totals.committees}</strong>
                    </span>
                    <span className="ll3c-pill">
                        Subcommittees: <strong className="ll3c-strong">{counts.totals.subcommittees}</strong>
                    </span>
                    {counts.byChamber.map((c) => (
                        <span className="ll3c-pill" key={c.chamber}>
                            {c.chamber}: <strong className="ll3c-strong">{c.committees}</strong> + {c.subcommittees} subs
                        </span>
                    ))}
                </div>
            </header>

            <section className="ll3c-panel">
                {rows.length === 0 ? (
                    <div className="ll3c-empty">No committees found. Try a different search.</div>
                ) : (
                    <ul className="ll3c-list">
                        {rows.map((c) => {
                            const chamberKey = (c.chamber || "").toLowerCase();
                            const subs = Array.isArray(c.subcommittees) ? c.subcommittees : [];

                            return (
                                <li key={c.system_code} className={`ll3c-card ll3c-card--${chamberKey}`}>
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

                                            {c.url && (
                                                <a className="ll3c-ext" href={c.url} target="_blank" rel="noreferrer">
                                                    API
                                                </a>
                                            )}

                                            {c.update_dt && (
                                                <span className="ll3c-updated">
                                                    Updated: {new Date(c.update_dt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {subs.length > 0 && (
                                        <details className="ll3c-details">
                                            <summary className="ll3c-details__summary">
                                                <span className="ll3c-details__chev" aria-hidden="true">▸</span>
                                                <span>
                                                    {subs.length} subcommittee{subs.length !== 1 ? "s" : ""}
                                                </span>
                                            </summary>

                                            <ul className="ll3c-sublist">
                                                {subs.map((s) => (
                                                    <li key={s.system_code} className="ll3c-subitem">
                                                        <span className="ll3c-subname">{s.name}</span>
                                                        <span className="ll3c-subcode">
                                                            (<code>{s.system_code}</code>)
                                                        </span>
                                                        {s.url && (
                                                            <a className="ll3c-ext" href={s.url} target="_blank" rel="noreferrer">
                                                                API
                                                            </a>
                                                        )}
                                                        {s.update_dt && (
                                                            <span className="ll3c-updated">
                                                                · {new Date(s.update_dt).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}