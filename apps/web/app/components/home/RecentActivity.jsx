//"use client";
import { getHomeSnapshot } from "../../../lib/server/congress";

export const revalidate = 900; // cache snapshot for 15 min

// Normalize helpers (accepts a few shapes)
const pick = (obj, ...keys) => keys.find((k) => obj?.[k] != null);
const normBill = (b, i) => ({
    id: b?.id ?? b?.bill_id ?? `bill-${i}`,
    title:
        b?.title ??
        b?.name ??
        b?.label ??
        b?.short_title ??
        b?.number ??
        "Untitled bill",
    url: b?.url ?? b?.href ?? b?.link ?? "#",
});
const normAction = (a, i) => ({
    id: a?.id ?? `act-${i}`,
    label: a?.label ?? a?.title ?? a?.name ?? "Action",
    date: a?.date ?? a?.when ?? a?.updated_at ?? "",
    url: a?.url ?? a?.href ?? a?.link ?? "#",
});

export default async function RecentActivity({
    maxItems = 8,
    showHeader = true,
    title = "What’s happening this session",
    sub = "A quick snapshot of new bills and major actions.",
}) {
    let data = {};
    try {
        data = (await getHomeSnapshot()) || {};
    } catch {
        data = {};
    }

    const root = data?.data ?? data;
    const bills = (root?.bills ?? []).slice(0, maxItems).map(normBill);
    const actions = (root?.actions ?? []).slice(0, maxItems).map(normAction);

    const hasAny = bills.length || actions.length;

    return (
        <section className="section section--home-activity">
            {showHeader && (
                <div className="section__header">
                    <h2 className="section__title">{title}</h2>
                    <p className="section__sub">{sub}</p>
                </div>
            )}

            <div className="panel panel--activity">
                <div className="activity-header">
                    <div>
                        <span className="badge badge--soon">Live snapshot</span>
                        <p className="activity-meta text-dim">
                            Pulled from recent Congress activity and refreshed regularly.
                        </p>
                    </div>
                    <div className="activity-stats text-dim">
                        <span className="activity-pill">
                            <span className="activity-pill__label">Bills</span>
                            <span className="activity-pill__value">
                                {bills.length || 0}
                            </span>
                        </span>
                        <span className="activity-pill">
                            <span className="activity-pill__label">Actions</span>
                            <span className="activity-pill__value">
                                {actions.length || 0}
                            </span>
                        </span>
                    </div>
                </div>
                {hasAny ? (
                    <div className="split-2 activity-grid">
                        <div>
                            <h3 className="eyebrow">New bills</h3>
                            <ul className="list list--bullets activity-list">
                                {bills.length ? (
                                    bills.map((b) => (
                                        <li key={b.id}>
                                            <a className="link" href={b.url}>
                                                {b.title}
                                            </a>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-dim">No recent bills in this snapshot.</li>
                                )}
                            </ul>
                        </div>
                        <div>
                            <h3 className="eyebrow">Recent actions</h3>
                            <ul className="list list--bullets activity-list">
                                {actions.length ? (
                                    actions.map((a) => (
                                        <li key={a.id}>
                                            <a className="link" href={a.url}>
                                                {a.date ? `${a.date} — ` : ""}
                                                {a.label}
                                            </a>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-dim">No recent actions in this snapshot.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p className="text-dim activity-empty">
                        Nothing to show just yet — data will appear here as soon as new bills
                        and actions are ingested.
                    </p>
                )}
            </div>
        </section>
    );
}
