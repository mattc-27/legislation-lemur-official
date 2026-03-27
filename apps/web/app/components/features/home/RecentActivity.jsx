import { FileText, ArrowRight } from "lucide-react";
// import { getHomeSnapshot } from "@/lib/server/routes/congress";
// import { getHomepageRecentBills } from "@/lib/server/routes/homepage";
// import getHomepageRecentBills from "@/lib/server/routes/homepage";

export const revalidate = 900;

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

function preferBillHref(r, fallbackUrl = "#") {
    return billHrefFromRecord(r) ?? fallbackUrl;
}

const normBill = (b, i) => {
    const url = b?.url ?? b?.href ?? b?.link ?? "#";
    const href = preferBillHref(b, url);

    return {
        id: b?.id ?? b?.bill_id ?? `bill-${i}`,
        title:
            b?.title ??
            b?.name ??
            b?.label ??
            b?.short_title ??
            b?.number ??
            "Untitled bill",
        summary:
            b?.summary ??
            b?.description ??
            b?.latest_action ??
            b?.latestAction ??
            "",
        date:
            b?.updated_at ??
            b?.introduced_date ??
            b?.date ??
            b?.latest_action_date ??
            "",
        chamber:
            b?.originChamber ??
            b?.origin_chamber ??
            b?.chamber ??
            b?.originChamberCode ??
            "",
        url,
        href,
    };
};

const normAction = (a, i) => {
    const url = a?.url ?? a?.href ?? a?.link ?? "#";
    const billLike = a?.bill ?? a?.bill_ref ?? a;
    const href = preferBillHref(billLike, url);

    return {
        id: a?.id ?? `act-${i}`,
        title: a?.label ?? a?.title ?? a?.name ?? "Action",
        summary: a?.summary ?? a?.description ?? "",
        date: a?.date ?? a?.when ?? a?.updated_at ?? "",
        url,
        href,
    };
};

function formatBillSummary(bill) {
    if (bill?.summary && String(bill.summary).trim()) return String(bill.summary).trim();
    return "Recently introduced in the current Congress.";
}

function formatBillMeta(bill) {
    const chamber = bill?.chamber ? String(bill.chamber).trim() : "";
    return chamber ? `${chamber} • Introduced recently` : "Introduced recently";
}

function formatActionSummary(action) {
    if (action?.summary && String(action.summary).trim()) return String(action.summary).trim();
    return "A major recent action captured from current congressional activity.";
}

function formatActionMeta(action) {
    return action?.date ? String(action.date) : "Recent action";
}

export default async function RecentActivity({
    maxItems = 3,
    showHeader = true,
    title = "Recent Congressional Activity",
    sub = "New bills and major actions, surfaced in a cleaner, more readable format.",
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

    const cards = [
        ...bills.map((b) => ({
            id: `bill-${b.id}`,
            kind: "New bill",
            title: b.title,
            summary: formatBillSummary(b),
            meta: formatBillMeta(b),
            href: b.href ?? b.url,
        })),
        ...actions.map((a) => ({
            id: `action-${a.id}`,
            kind: "Recent action",
            title: a.title,
            summary: formatActionSummary(a),
            meta: formatActionMeta(a),
            href: a.href ?? a.url,
        })),
    ].slice(0, maxItems);

    return (
        <section className="section section--home-activity">
            {showHeader && (
                <div className="section__header section__header--activity">
                    <div>
                        <div className="section__eyebrow">Live activity</div>
                        <h2 className="section__title">{title}</h2>
                    </div>

                    <a className="section__action-link" href="/bills">
                        View latest bills
                    </a>
                </div>
            )}

            {sub ? <p className="section__sub section__sub--activity">{sub}</p> : null}

            {cards.length ? (
                <div className="activity-card-grid">
                    {cards.map((card) => (
                        <a className="activity-card" href={card.href} key={card.id}>
                            <div className="activity-card__iconchip" aria-hidden="true">
                                <FileText size={18} strokeWidth={2} />
                            </div>

                            <div className="activity-card__kind">{card.kind}</div>
                            <h3 className="activity-card__title">{card.title}</h3>
                            <p className="activity-card__summary">{card.summary}</p>

                            <div className="activity-card__footer">
                                <span className="activity-card__meta">{card.meta}</span>
                                <span className="activity-card__open">
                                    Open
                                    <ArrowRight size={14} strokeWidth={2} />
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            ) : (
                <div className="panel panel--activity-empty">
                    <p className="text-dim">
                        Nothing to show just yet — activity cards will appear here as soon as new bills and major actions are ingested.
                    </p>
                </div>
            )}
        </section>
    );
}