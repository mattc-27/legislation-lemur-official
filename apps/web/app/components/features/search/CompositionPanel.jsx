import { getCongressSummary, getCongressCompositionForState } from "@/lib/server/routes/views";

function clampInt(n) {
    const x = Number(n);
    return Number.isFinite(x) ? x : 0;
}

function timeAgo(d) {
    if (!d) return "";
    const ms = Date.now() - new Date(d).getTime();
    const mins = Math.max(1, Math.floor(ms / 60000));
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 48) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function countsFrom(row, prefix) {
    const d = clampInt(row?.[`${prefix}_d`]);
    const r = clampInt(row?.[`${prefix}_r`]);
    const i = clampInt(row?.[`${prefix}_i`]);
    const total = clampInt(row?.[`${prefix}_total`]) || (d + r + i);
    return { d, r, i, total };
}

function pct(n, total) {
    if (!total) return 0;
    return Math.round((n / total) * 1000) / 10; // 1 decimal
}

function Donut({ d, r, i, total, label }) {
    const pd = pct(d, total);
    const pr = pct(r, total);
    const pi = Math.max(0, 100 - pd - pr);
    return (
        <div
            className="comp-donut"
            aria-label={`${label} party breakdown`}
            style={{
                ["--pd"]: `${pd}%`,
                ["--pr"]: `${pr}%`,
                ["--pi"]: `${pi}%`,
            }}
        />
    );
}

function StackedBar({ d, r, i, total }) {
    const pd = pct(d, total);
    const pr = pct(r, total);
    const pi = Math.max(0, 100 - pd - pr);
    return (
        <div className="comp-bar" role="img" aria-label="Party breakdown stacked bar">
            <span className="comp-bar__seg is-d" style={{ width: `${pd}%` }} />
            <span className="comp-bar__seg is-r" style={{ width: `${pr}%` }} />
            <span className="comp-bar__seg is-i" style={{ width: `${pi}%` }} />
        </div>
    );
}

function ChamberCard({ title, d, r, i, total }) {
    const safeTotal = Math.max(1, Number(total) || 0);
    const pD = (d / safeTotal) * 100;
    const pR = (r / safeTotal) * 100;
    const pI = (i / safeTotal) * 100;

    return (
        <div className="comp-card comp-card--list">
            {/* header row */}
            <div className="comp-card__toprow">
                <div className="comp-card__title">{title}</div>
                <div className="comp-card__total">{total} total</div>
            </div>

            {/* stacked bar */}
            <div className="comp-bar2" aria-label={`${title} party split`}>
                <span className="comp-bar2__seg is-d" style={{ width: `${pD}%` }} />
                <span className="comp-bar2__seg is-r" style={{ width: `${pR}%` }} />
                <span className="comp-bar2__seg is-i" style={{ width: `${pI}%` }} />
            </div>

            {/* “company list” rows */}
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

    const total = {
        d: house.d + senate.d,
        r: house.r + senate.r,
        i: house.i + senate.i,
        total: house.total + senate.total,
    };

    const title = st ? `${st} Overview` : "Congress Overview";
    const subtitle = st
        ? "Party breakdown for this state (from composition view)."
        : "Quick context before you filter.";
    const updated = timeAgo(row.updated_at);

    return (
        <section className="comp" aria-label={title}>
            <div className="comp__top">
                <div>
                    <h2 className="comp__title">{title}</h2>
                    <p className="comp__sub">{subtitle}</p>
                </div>
                {/* {updated ? <span className="comp__stamp">Updated {updated}</span> : null}*/}
            </div>

            <div className="comp-shell">
                <div className="comp-total">
                    <div className="comp-total__label">Members</div>
                

                </div>

                <div className="comp-grid">
                    <ChamberCard title="House" {...house} />
                    <ChamberCard title="Senate" {...senate} />
                </div>
            </div>
        </section>
    );
}

      {/*   <div className="comp-total__meta">
                        <span><b>House</b> {house.total}</span>
                        <span className="comp-sep">•</span>
                        <span><b>Senate</b> {senate.total}</span>
                    </div>
                   
                    <StackedBar d={total.d} r={total.r} i={total.i} total={total.total} />

                         <div className="comp-legend">
                        <span className="comp-leg"><b>45</b> Dem</span>
                        <span className="comp-sep">|</span>
                        <span className="comp-leg"><b>9</b> Rep</span>
                        <span className="comp-sep">|</span>
                        <span className="comp-leg"><b>0</b> Ind</span>
                    </div>
                    */}