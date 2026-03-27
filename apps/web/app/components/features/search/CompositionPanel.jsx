import { getCongressSummary, getCongressCompositionForState } from "@/lib/server/routes/views";

function clampInt(n) {
    const x = Number(n);
    return Number.isFinite(x) ? x : 0;
}

function countsFrom(row, prefix) {
    const d = clampInt(row?.[`${prefix}_d`]);
    const r = clampInt(row?.[`${prefix}_r`]);
    const i = clampInt(row?.[`${prefix}_i`]);
    const total = clampInt(row?.[`${prefix}_total`]) || d + r + i;
    return { d, r, i, total };
}

function ChamberCard({ title, d, r, i, total }) {
    const safeTotal = Math.max(1, Number(total) || 0);
    const pD = (d / safeTotal) * 100;
    const pR = (r / safeTotal) * 100;
    const pI = (i / safeTotal) * 100;

    return (
        <div className="comp-card comp-card--list">
            <div className="comp-card__toprow">
                <div className="comp-card__title">{title}</div>
                <div className="comp-card__total">{total} total</div>
            </div>

            <div className="comp-bar2" aria-label={`${title} party split`}>
                <span className="comp-bar2__seg is-d" style={{ width: `${pD}%` }} />
                <span className="comp-bar2__seg is-r" style={{ width: `${pR}%` }} />
                <span className="comp-bar2__seg is-i" style={{ width: `${pI}%` }} />
            </div>

            <div className="comp-lines" role="list" aria-label={`${title} breakdown`}>
                <div className="comp-line" role="listitem">
                    <div className="comp-line__left">
                        <span className="comp-dot is-d" />
                        <span className="comp-line__label">Democrats</span>
                    </div>
                    <div className="comp-line__value">{d}</div>
                </div>

                <div className="comp-line" role="listitem">
                    <div className="comp-line__left">
                        <span className="comp-dot is-r" />
                        <span className="comp-line__label">Republicans</span>
                    </div>
                    <div className="comp-line__value">{r}</div>
                </div>

                <div className="comp-line" role="listitem">
                    <div className="comp-line__left">
                        <span className="comp-dot is-i" />
                        <span className="comp-line__label">Independent</span>
                    </div>
                    <div className="comp-line__value">{i}</div>
                </div>
            </div>
        </div>
    );
}

export default async function CompositionPanel({ congress = 119, state = "" }) {
    const st = (state || "").toUpperCase().trim();

    const row = st
        ? await getCongressCompositionForState(congress, st)
        : await getCongressSummary(congress);

    if (!row) return null;

    const house = countsFrom(row, "house");
    const senate = countsFrom(row, "senate");

    const title = st ? `${st} Overview` : "Congress Overview";
    const subtitle = st
        ? "Current party breakdown for this state."
        : "Quick context before you filter.";

    return (
        <section className="comp" aria-label={title}>
            <div className="comp__top">
                <div>
                    <h2 className="comp__title">{title}</h2>
                    <p className="comp__sub">{subtitle}</p>
                </div>
            </div>

            <div className="comp-shell">
                <div className="comp-grid">
                    <ChamberCard title="House" {...house} />
                    <ChamberCard title="Senate" {...senate} />
                </div>
            </div>
        </section>
    );
}