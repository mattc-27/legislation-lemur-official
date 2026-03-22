import { getHomeSnapshot } from "@/lib/server/routes/congress";

export const revalidate = 900;

// Normalize helpers (accepts a few shapes)
const normBill = (b, i) => {
    const url = b?.url ?? b?.href ?? b?.link ?? "#";
    const href = preferBillHref(b, url);

    return {
        id: b?.id ?? b?.bill_id ?? `bill-${i}`,
        title: b?.title ?? b?.name ?? b?.label ?? b?.short_title ?? b?.number ?? "Untitled bill",
        url,    // keep external / provided link as-is
        href,   // new: preferred in-app link when possible
    };
};

const normAction = (a, i) => {
    const url = a?.url ?? a?.href ?? a?.link ?? "#";

    // If actions have the bill fields directly, this works.
    // If actions have a nested bill object, this also covers it.
    const billLike = a?.bill ?? a?.bill_ref ?? a;
    const href = preferBillHref(billLike, url);

    return {
        id: a?.id ?? `act-${i}`,
        label: a?.label ?? a?.title ?? a?.name ?? "Action",
        date: a?.date ?? a?.when ?? a?.updated_at ?? "",
        url,   // keep
        href,  // new preferred link
    };
};

function billSlugFromRecord(r) {
    const billType = r?.bill_type ?? r?.billType ?? r?.type;
    const billNumber = r?.bill_number ?? r?.billNumber ?? r?.number;
    const congress = r?.congress ?? r?.congress_num ?? r?.congressNumber;

    if (!billType || !billNumber || !congress) return null;

    return `${billType}-${billNumber}-${congress}`.toLowerCase();
}

function billHrefFromRecord(r) {
    const slug = billSlugFromRecord(r);
    return slug ? `/bills/${slug}` : null;
}

// tiny helper: prefer in-app href, fall back to existing url
function preferBillHref(r, fallbackUrl = "#") {
    return billHrefFromRecord(r) ?? fallbackUrl;
}


/*    const slug = `${r.bill_type}-${r.bill_number}-${r.congress}`.toLowerCase();
    const href = `/bills/${slug}`;
    */
export default async function RecentActivity({
    maxItems = 6,
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
                        <span className="badge badge--live">Live snapshot</span>
                        <p className="activity-meta text-dim">
                            Pulled from recent Congress activity and refreshed regularly.
                        </p>
                    </div>

                    <div className="activity-stats text-dim">
                        <span className="activity-pill">
                            <span className="activity-pill__label">Bills</span>
                            <span className="activity-pill__value">{bills.length || 0}</span>
                        </span>
                        <span className="activity-pill">
                            <span className="activity-pill__label">Actions</span>
                            <span className="activity-pill__value">{actions.length || 0}</span>
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
                                            <a className="link" href={b.href ?? b.url}>
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
                                            <a className="link" href={a.href ?? a.url}>
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
                        Nothing to show just yet — data will appear here as soon as new bills and actions are ingested.
                    </p>
                )}
            </div>
        </section>
    );
}