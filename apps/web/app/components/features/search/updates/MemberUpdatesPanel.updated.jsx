import Link from "next/link";
import { Clock3 } from "lucide-react";

function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function hrefFor(change) {
    if (change.isVacant) {
        const params = new URLSearchParams();
        if (change.stateCode) params.set("state", change.stateCode);
        if (change.district != null) params.set("district", change.district);
        params.set("seatStatus", "vacant");
        return `/search?${params.toString()}`;
    }

    return "/members";
}

export default function MemberUpdatesPanel({ changes = [] }) {
    if (!changes.length) return null;

    return (
        <section className="ll3-memberUpdates">
            <details className="ll3-memberUpdates__details">
                <summary className="ll3-memberUpdates__summary">
                    <div>
                        <h2 className="ll3-memberUpdates__title">Recent Changes</h2>
                        <p className="ll3-memberUpdates__sub">
                            Live updates on House vacancies and member activity.
                        </p>
                    </div>

                    <span className="ll3-memberUpdates__summaryPill">
                        {changes.length} update{changes.length === 1 ? "" : "s"}
                    </span>
                </summary>

                <div className="ll3-memberUpdates__list">
                    {changes.slice(0, 3).map((c, i) => (
                        <article key={`${c.districtId}-${i}`} className="ll3-memberUpdateCard">
                            <div className="ll3-memberUpdateCard__body">
                                <div className="ll3-memberUpdateCard__top">
                                    <h3 className="ll3-memberUpdateCard__headline">
                                        {c.headline}
                                    </h3>

                                    {c.badge ? (
                                        <span className={`ll3-badge ll3-badge--${c.badge.toLowerCase()}`}>
                                            {c.badge}
                                        </span>
                                    ) : null}
                                </div>

                                {c.subheadline ? (
                                    <p className="ll3-memberUpdateCard__sub">
                                        {c.subheadline}
                                    </p>
                                ) : null}

                                <div className="ll3-memberUpdateCard__meta">
                                    <span>
                                        {c.stateCode}
                                        {c.district != null ? `-${c.district === 0 ? "AL" : c.district}` : ""}
                                    </span>

                                    <span className="ll3-metaSep">•</span>

                                    <Clock3 size={13} />
                                    <span>{formatDate(c.detectedAt)}</span>
                                </div>

                                <Link href={hrefFor(c)} className="ll3-memberUpdateCard__link">
                                    View details →
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </details>
        </section>
    );
}
