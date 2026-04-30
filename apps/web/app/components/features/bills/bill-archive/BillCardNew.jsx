import Link from "next/link";
import {
    ArrowUpRight,
    Bookmark,
    BookmarkCheck,
    Clock3,
    TrendingUp,
    Zap,
} from "lucide-react";

import SaveBillButtonClient from "../SaveBillButtonClient";

import { fmtDate } from "@/lib/domains/bills/format";
import { STATUS_META, normalizeStatusKey, subjectToGroup } from "@/lib/domains/bills/meta";
import {
    normalizeTopicLabel,
    getTopicMeta,
    getTopicColor,
} from "@/lib/utils/member-info-topics";

function hashTopicIndex(value = "") {
    const str = String(value || "Uncategorized");
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function getImpactDescriptor(value) {
    if (!Number.isFinite(value)) return "Insufficient signal";
    if (value >= 90) return "Significant Policy Shift";
    if (value >= 80) return "High Legislative Weight";
    if (value >= 70) return "Substantial Policy Reach";
    if (value >= 60) return "Meaningful Policy Activity";
    if (value >= 45) return "Moderate Policy Signal";
    return "Limited Policy Signal";
}

function getMomentumDescriptor(value) {
    if (!Number.isFinite(value)) return "Insufficient signal";
    if (value >= 90) return "Rapid Momentum Growth";
    if (value >= 80) return "Viral Support Spikes";
    if (value >= 70) return "Strong Attention Cycle";
    if (value >= 60) return "Growing Legislative Momentum";
    if (value >= 45) return "Moderate Momentum";
    return "Low Momentum";
}

function getModifiedLabel(value) {
    if (!value) return null;

    const ts = new Date(value).getTime();
    if (!Number.isFinite(ts)) return null;

    const diffMs = Date.now() - ts;
    if (diffMs < 0) return "Updated just now";

    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Updated just now";
    if (mins < 60) return `Updated ${mins}m ago`;

    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Updated ${hrs}h ago`;

    const days = Math.floor(hrs / 24);
    if (days < 7) return `Updated ${days}d ago`;

    return `Updated ${fmtDate(value)}`;
}

function getTopicInfo(subjects = []) {
    const first = (subjects || []).find(Boolean);
    const normalized = normalizeTopicLabel(first || "Uncategorized");
    const meta = getTopicMeta(normalized);
    const color = getTopicColor(hashTopicIndex(normalized));

    return {
        label: meta.short || normalized,
        full: normalized,
        Icon: meta.icon,
        color,
    };
}

function getCosponsorPreview(bill) {
    return (
        bill.cosponsors_preview ||
        bill.cosponsor_preview ||
        bill.cosponsors_sample ||
        bill.cosponsor_members ||
        []
    );
}

function getAvatarSrc(person) {
    return (
        person?.image_url ||
        person?.photo_url ||
        person?.portrait_url ||
        person?.img_url ||
        null
    );
}

function getAvatarAlt(person) {
    return person?.name || person?.full_name || person?.display_name || "Cosponsor";
}

function getBillSummary(bill) {
    return bill?.summary_short || bill?.summary_text_plain || null;
}

function SignalCard({ label, value, descriptor, tone = "impact", Icon }) {
    return (
        <div className={`ll3-scoreCard ll3-scoreCard--${tone}`}>
            <div className="ll3-scoreCard__icon" aria-hidden="true">
                <Icon size={16} />
            </div>

            <div className="ll3-scoreCard__body">
                <div className="ll3-scoreCard__eyebrow">{label}</div>
                <div className="ll3-scoreCard__text">{descriptor}</div>
            </div>

            <div className="ll3-scoreCard__value">{Number.isFinite(value) ? value : "—"}</div>
        </div>
    );
}

export default function BillCard({ bill }) {
    const r = bill;

    const slug = `${r.bill_type}-${r.bill_number}-${r.congress}`.toLowerCase();
    const href = `/bills/${slug}`;
    const billCode = `${String(r.bill_type || "").toUpperCase()}. ${r.bill_number}`;

    const statusKey = normalizeStatusKey(r.status_code);
    const sm = STATUS_META[statusKey] || STATUS_META.introduced;

    const rawSubjects = (r.subjects || []).map(subjectToGroup).filter(Boolean);
    const topic = getTopicInfo(rawSubjects);
    const TopicIcon = topic.Icon;

    const impact = Number.isFinite(r.impact_score) ? r.impact_score : null;
    const trending = Number.isFinite(r.trending_score) ? r.trending_score : null;

    const summary = getBillSummary(r);
    const keyActions = Array.isArray(r.key_actions) ? r.key_actions.filter(Boolean) : [];

    const previewMembers = getCosponsorPreview(r).slice(0, 3);
    const extraCosponsors = Math.max(
        0,
        Number(r.cosponsor_count ?? 0) - previewMembers.length
    );

    const modifiedLabel = getModifiedLabel(
        r.summary_updated_at ||
        r.summary_generated_at ||
        r.freshness_timestamp ||
        r.freshness_updated_at ||
        r.updated_at ||
        r.search_updated_at ||
        r.latest_action_date
    );

    return (
        <details
            className="ll3-card ll3-cardV3"
            role="listitem"
            style={{
                "--ll3-topic-color": topic.color,
            }}
        >
            <summary className="ll3-cardV3__summary">
                <div className="ll3-cardV3__collapsed">
                    <div className="ll3-cardV3__topic" title={topic.full} aria-hidden="true">
                        <TopicIcon size={18} />
                    </div>

                    <div className="ll3-cardV3__main">
                        <div className="ll3-cardV3__billCode">{billCode}</div>
                        <div className="ll3-cardV3__title">{r.display_title}</div>


                    </div>

                    <div className="ll3-cardV3__score">
                        <div className="ll3-cardV3__scoreValue">{impact ?? "—"}</div>
                        <div className="ll3-cardV3__scoreLabel">Impact</div>
                    </div>
                </div>
            </summary>

            <div className="ll3-cardV3__expanded">
                <div className="ll3-cardV3__expandedHeader">
                    <div className="ll3-cardV3__topbar">
                        <div className="ll3-cardV3__statusWrap">
                            <span className={`ll3-cardV3__status ll3-cardV3__status--${sm.tone}`}>
                                <span className="ll3-cardV3__statusDot" aria-hidden="true" />
                                <span className="ll3-cardV3__statusText">{sm.label}</span>
                            </span>

                            {modifiedLabel ? (
                                <span className="ll3-cardV3__updated">{modifiedLabel}</span>
                            ) : null}
                        </div>

                        <SaveBillButtonClient
                            billId={r.bill_id || slug}
                            href={href}
                            label={`${String(r.bill_type || "").toUpperCase()}. ${r.bill_number} (${r.congress})`}
                            meta={{
                                congress: r.congress,
                                type: r.bill_type,
                                number: r.bill_number,
                                introduced: r.introduced_date,
                                latest_action_date: r.latest_action_date,
                                latest_action_text: r.latest_action_text,
                                summary_short: r.summary_short,
                            }}
                            size="sm"
                            iconOnly={true}
                            savedIcon={<BookmarkCheck size={16} aria-hidden="true" />}
                            unsavedIcon={<Bookmark size={16} aria-hidden="true" />}
                        />
                    </div>



                    <div className="ll3-cardV3__signals">
                        <SignalCard
                            label="Legislative Impact"
                            value={impact}
                            descriptor={getImpactDescriptor(impact)}
                            tone="impact"
                            Icon={Zap}
                        />

                        <SignalCard
                            label="Momentum Score"
                            value={trending}
                            descriptor={getMomentumDescriptor(trending)}
                            tone="momentum"
                            Icon={TrendingUp}
                        />
                    </div>
                </div>


                <div className="ll3-cardV3__expandedBody">
                    <div className="ll3-cardV3__summaryFull">
                        <div className="ll3-cardV3__latestHead">
                            <span className="ll3-cardV3__latestLabel">Summary</span>
                        </div>

                        <div className={summary ? "ll3-cardV3__latestText" : "ll3-cardV3__latestText ll3-muted"}>
                            {summary || "Summary not available."}
                        </div>

                        {keyActions.length ? (
                            <div className="ll3-cardV3__keyActionsWrap">
                                <div className="ll3-cardV3__latestLabel">What this does</div>

                                <ul className="ll3-cardV3__keyActions">
                                    {keyActions.slice(0, 3).map((action, index) => (
                                        <li key={`${r.bill_id || slug}-action-${index}`}>{action}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                    <div className="ll3-cardV3__latest">
                        <div className="ll3-cardV3__latestHead">
                            <span className="ll3-cardV3__latestLabel">
                                <Clock3 size={13} aria-hidden="true" />
                                Latest action
                            </span>
                            <span className="ll3-cardV3__latestDate">{fmtDate(r.latest_action_date)}</span>
                        </div>

                        <div className="ll3-cardV3__latestText">{r.latest_action_text || "—"}</div>
                    </div>

                    <div className="ll3-cardV3__bottom">
                        <div className="ll3-cardV3__metaRow">
                            <span className="ll3-cardV3__metaItem">
                                <span className="ll3-cardV3__metaKey">Introduced</span>
                                <span className="ll3-cardV3__metaValue">{fmtDate(r.introduced_date)}</span>
                            </span>

                            <span className="ll3-cardV3__metaDot" aria-hidden="true" />

                            <span className="ll3-cardV3__metaItem">
                                <span className="ll3-cardV3__metaKey">Chamber</span>
                                <span className="ll3-cardV3__metaValue">{r.origin_chamber || "—"}</span>
                            </span>

                            <span className="ll3-cardV3__metaDot" aria-hidden="true" />

                            <span className="ll3-cardV3__metaItem">
                                <span className="ll3-cardV3__metaKey">Topic</span>
                                <span className="ll3-cardV3__metaValue">{topic.label}</span>
                            </span>
                        </div>

                        <div className="ll3-cardV3__footer">
                            <div className="ll3-cardV3__people">
                                {previewMembers.length ? (
                                    <div className="ll3-cardV3__avatars" aria-label="Cosponsor preview">
                                        {previewMembers.map((person, index) => {
                                            const src = getAvatarSrc(person);
                                            const alt = getAvatarAlt(person);

                                            return (
                                                <span
                                                    key={`${alt}-${index}`}
                                                    className="ll3-cardV3__avatar"
                                                    style={{ zIndex: previewMembers.length - index }}
                                                    title={alt}
                                                >
                                                    {src ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={src} alt={alt} />
                                                    ) : (
                                                        <span className="ll3-cardV3__avatarFallback">
                                                            {String(alt).charAt(0)}
                                                        </span>
                                                    )}
                                                </span>
                                            );
                                        })}

                                        {extraCosponsors > 0 ? (
                                            <span className="ll3-cardV3__avatar ll3-cardV3__avatar--count">
                                                +{extraCosponsors}
                                            </span>
                                        ) : null}
                                    </div>
                                ) : Number.isFinite(r.cosponsor_count) ? (
                                    <span className="ll3-cardV3__cosponsorText">
                                        {r.cosponsor_count} cosponsor{r.cosponsor_count === 1 ? "" : "s"}
                                    </span>
                                ) : null}
                            </div>

                            <Link className="ll3-btn ll3-btn--open ll3-btn--sm" href={href}>
                                <ArrowUpRight size={16} aria-hidden="true" />
                                Open
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </details>
    );
}