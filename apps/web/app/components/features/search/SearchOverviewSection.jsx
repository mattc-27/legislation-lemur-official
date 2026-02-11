// components/search/SearchOverviewSection.jsx
export default function SearchOverviewSection({
    // For “Congress Overview” (no state selected)
    summary = null,

    // For “State Overview” (state selected) — from congress_composition_json
    composition = null,

    state = "",
    showTotal = false,
}) {
    const isStateMode = Boolean(state);

    // Source of truth depending on mode
    const house = isStateMode
        ? fromRow("house", composition)
        : fromRow("house", summary);

    const senate = isStateMode
        ? fromRow("senate", composition)
        : fromRow("senate", summary);

    const all = mergeSummaries(house, senate);

    const title = isStateMode ? `${state.toUpperCase()} Overview` : "Congress Overview";
    const subtitle = isStateMode
        ? "Party breakdown for this state (from composition view)."
        : "Quick context before you filter.";

    const updatedAt = isStateMode ? composition?.updated_at : summary?.updated_at;

    return (
        <section className="overview stack-12" aria-label="Overview">
            <header className="overview__header">
                <div>
                    <h2 className="overview__title">{title}</h2>
                    <p className="overview__sub">{subtitle}</p>
                </div>

                {updatedAt ? (
                    <div className="overview__stamp" title={`Updated at: ${String(updatedAt)}`}>
                        Updated {fmtRelative(updatedAt)}
                    </div>
                ) : null}
            </header>
            <div className="overview__card">
                <div className="overview__top">
                    <div className="overview__meta">
                        {showTotal ? (
                            <div className="overview__kpi">
                                <div className="overview__kpi-label">Total</div>
                                <div className="overview__kpi-value">{all.total || "—"}</div>
                            </div>
                        ) : (
                            <div className="overview__kpi">
                                <div className="overview__kpi-label">Members</div>
                                <div className="overview__kpi-value">
                                    <span className="overview__kpi-inline">
                                        House <b>{house.total ?? "—"}</b> · Senate <b>{senate.total ?? "—"}</b>
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="overview__legend" aria-hidden="true">
                            <span className="legend-pill legend-pill--d">D</span>
                            <span className="legend-pill legend-pill--r">R</span>
                            <span className="legend-pill legend-pill--i">I</span>
                        </div>
                    </div>

                    <div className="overview__bar">
                        <div
                            className="stackedbar"
                            style={stackedBarStyle(all)}
                            role="img"
                            aria-label={`Party breakdown: D ${all.D}, R ${all.R}, I ${all.I}`}
                        />
                        <div className="stackedbar__labels">
                            <span><b>{all.D}</b> Dem</span>
                            <span><b>{all.R}</b> Rep</span>
                            <span><b>{all.I}</b> Ind</span>
                        </div>
                    </div>
                </div>

                <div className="overview__grid">
                    <ChamberCard chamber="House" {...house} />
                    <ChamberCard chamber="Senate" {...senate} />
                </div>
            </div>
        </section>
    );
}

function ChamberCard({ chamber, total = 0, D = 0, R = 0, I = 0 }) {
    const pct = pctParts({ total, D, R, I });
    return (
        <article className="chambercard">
            <div className="chambercard__head">
                <div>
                    <div className="chambercard__title">{chamber}</div>
                    <div className="chambercard__hint">{total} total</div>
                </div>

                <div
                    className="minipie"
                    style={pieStyle(pct)}
                    role="img"
                    aria-label={`${chamber} party breakdown: D ${D}, R ${R}, I ${I}`}
                />
            </div>

            <div className="chambercard__rows">
                <div className="chamberrow">
                    <span className="dot dot--d" aria-hidden="true" />
                    <span className="chamberrow__label">Dem</span>
                    <span className="chamberrow__value">{D}</span>
                </div>
                <div className="chamberrow">
                    <span className="dot dot--r" aria-hidden="true" />
                    <span className="chamberrow__label">Rep</span>
                    <span className="chamberrow__value">{R}</span>
                </div>
                <div className="chamberrow">
                    <span className="dot dot--i" aria-hidden="true" />
                    <span className="chamberrow__label">Ind</span>
                    <span className="chamberrow__value">{I}</span>
                </div>
            </div>
        </article>
    );
}

/** Pulls chamber values from either `summary` row or `composition` row */
function fromRow(chamber, row) {
    if (!row) return { total: 0, D: 0, R: 0, I: 0 };

    const prefix = chamber === "house" ? "house" : "senate";
    return {
        total: row[`${prefix}_total`] ?? 0,
        D: row[`${prefix}_d`] ?? 0,
        R: row[`${prefix}_r`] ?? 0,
        I: row[`${prefix}_i`] ?? 0,
    };
}

function mergeSummaries(a, b) {
    return {
        total: (a.total || 0) + (b.total || 0),
        D: (a.D || 0) + (b.D || 0),
        R: (a.R || 0) + (b.R || 0),
        I: (a.I || 0) + (b.I || 0),
    };
}

function pctParts({ total, D, R, I }) {
    const t = Math.max(1, total || 0);
    const d = Math.round((D / t) * 100);
    const r = Math.round((R / t) * 100);
    const i = Math.max(0, 100 - d - r);
    return { d, r, i };
}

function pieStyle({ d, r, i }) {
    return { "--pD": `${d}%`, "--pR": `${r}%`, "--pI": `${i}%` };
}

function stackedBarStyle({ total, D, R, I }) {
    const pct = pctParts({ total, D, R, I });
    return { "--pD": `${pct.d}%`, "--pR": `${pct.r}%`, "--pI": `${pct.i}%` };
}

/** Minimal “relative” text without client JS */
function fmtRelative(ts) {
    try {
        const d = new Date(ts);
        const diff = Date.now() - d.getTime();
        const min = Math.floor(diff / 60000);
        if (min < 60) return `${min}m ago`;
        const hr = Math.floor(min / 60);
        if (hr < 48) return `${hr}h ago`;
        const days = Math.floor(hr / 24);
        return `${days}d ago`;
    } catch {
        return "recently";
    }
}