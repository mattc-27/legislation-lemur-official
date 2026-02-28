import Link from "next/link";

function pct(part, total) {
    if (!total) return 0;
    return Math.round((part / total) * 100);
}

export default function PolicyAreaBreakdownPanel({
    counts = [],
    dict = [],
    total = 0,
    limit = 8,
    currentPolicyAreaId = null,
    baseParams = null,
    title = "Policy areas",
    subtitle = "Where these bills cluster",
}) {
    const nameById = new Map(dict.map((d) => [String(d.policy_area_id), d.policy_area_name]));
    const slugById = new Map(dict.map((d) => [String(d.policy_area_id), d.policy_area_slug]));

    const rows = (counts || [])
        .map((r) => {
            const id = String(r.policy_area_id);
            return {
                id,
                name: nameById.get(id) || `Policy ${id}`,
                slug: slugById.get(id) || null,
                count: Number(r.bill_count || 0),
            };
        })
        .filter((r) => r.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

    const max = rows[0]?.count || 0;

    const hrefFor = (id) => {
        if (!baseParams) return null;
        const p = new URLSearchParams(baseParams.toString());
        p.set("policyAreaId", String(id));
        p.set("offset", "0");
        return `/bills?${p.toString()}`;
    };

    return (
        <section className="ll3-lemurPanel ll3-lemurPanel--policy" aria-label="Policy area breakdown">
            <header className="ll3-lemurPanel__head">
                <div className="ll3-lemurPanel__badge" aria-hidden="true">
                    <span className="ll3-lemurMark">
                        <span className="ll3-lemurMark__ear" />
                        <span className="ll3-lemurMark__face" />
                        <span className="ll3-lemurMark__ear ll3-lemurMark__ear--r" />
                    </span>
                </div>

                <div className="ll3-lemurPanel__titles">
                    <h3 className="ll3-h3 ll3-lemurPanel__title">{title}</h3>
                    <p className="ll3-muted ll3-lemurPanel__sub">{subtitle}</p>
                </div>

                <div className="ll3-lemurPanel__kpi" title="Total matching bills">
                    <div className="ll3-lemurPanel__kpiLabel">Total</div>
                    <div className="ll3-lemurPanel__kpiValue">{Number(total || 0).toLocaleString()}</div>
                </div>
            </header>

            {rows.length === 0 ? (
                <div className="ll3-lemurPanel__empty">No policy area breakdown available for this filter set.</div>
            ) : (
                <div className="ll3-lemurBars" role="list">
                    {rows.map((r) => {
                        const active = currentPolicyAreaId != null && String(currentPolicyAreaId) === r.id;
                        const w = max ? Math.max(6, Math.round((r.count / max) * 100)) : 0;
                        const p = pct(r.count, total);
                        const href = hrefFor(r.id);

                        const inner = (
                            <>
                                <div className="ll3-lemurBars__row">
                                    <div className="ll3-lemurBars__name" title={r.name}>
                                        {r.name}
                                    </div>
                                    <div className="ll3-lemurBars__nums" aria-label={`${r.count} bills (${p} percent)`}>
                                        <span className="ll3-lemurBars__count">{r.count.toLocaleString()}</span>
                                        <span className="ll3-lemurBars__pct">{p}%</span>
                                    </div>
                                </div>

                                <div className="ll3-lemurBars__track" aria-hidden="true">
                                    <div
                                        className={`ll3-lemurBars__fill ${active ? "is-active" : ""}`}
                                        style={{ width: `${w}%` }}
                                    />
                                </div>

                                {r.slug ? <div className="ll3-lemurBars__hint ll3-muted">#{r.slug}</div> : null}
                            </>
                        );

                        return href ? (
                            <Link
                                key={r.id}
                                className={`ll3-lemurBars__item ${active ? "is-active" : ""}`}
                                href={href}
                                prefetch={false}
                            >
                                {inner}
                            </Link>
                        ) : (
                            <div key={r.id} className={`ll3-lemurBars__item ${active ? "is-active" : ""}`}>
                                {inner}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
