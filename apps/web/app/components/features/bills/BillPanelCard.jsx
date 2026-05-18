// /app/components/features/bills/BillPanelCard.jsx

import Link from "next/link";
import {
    Bookmark,
    BookmarkCheck,
    Clock3,
    TrendingUp,
    Zap,
} from "lucide-react";

import SaveBillButtonClient from "@/app/components/features/bills/SaveBillButtonClient";

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
function getBillSummary(bill) {
    return bill?.summary_short || bill?.summary_text_plain || null;
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

function SignalCard({ label, value, descriptor, tone = "impact", Icon }) {
    return (
        <div className={`ll3-scoreCard ll3-scoreCard--${tone}`}>
            <div className="ll3-scoreCard__icon" aria-hidden="true">
                <Icon size={16} />
            </div>

            <div className="ll3-scoreCard__body">
                <div className="ll3-scoreCard__eyebrow">{label}</div>
                {descriptor ? <div className="ll3-scoreCard__text">{descriptor}</div> : null}
            </div>

            <div className="ll3-scoreCard__value">{Number.isFinite(value) ? value : "—"}</div>
        </div>
    );
}

export default function BillCard({ bill }) {
    const r = bill;

    const slug =
        `${r.bill_type}-${r.bill_number}-${r.congress}`.toLowerCase();

    const href = `/bills/${slug}`;

    const billCode =
        `${String(r.bill_type || "").toUpperCase()}. ${r.bill_number}`;

    const statusKey = normalizeStatusKey(r.status_code);

    const sm =
        STATUS_META[statusKey] ||
        STATUS_META.introduced;
    const statusLabel = r.status_label || sm.label;
    const rawSubjects =
        (r.subjects || [])
            .map(subjectToGroup)
            .filter(Boolean);

    const topic = getTopicInfo(rawSubjects);

    const TopicIcon = topic.Icon;

    const impact =
        Number.isFinite(r.impact_score)
            ? r.impact_score
            : null;

    const trending =
        Number.isFinite(r.trending_score)
            ? r.trending_score
            : null;

    const summary = getBillSummary(r);

    const keyActions =
        Array.isArray(r.key_actions)
            ? r.key_actions.filter(Boolean).slice(0, 2)
            : [];

    const modifiedLabel = getModifiedLabel(
        r.summary_updated_at ||
        r.latest_action_date
    );

    return (
        <article
            className="ll3-cardV4"
            style={{
                "--ll3-topic-color": topic.color,
            }}
        >
            <div className="ll3-cardV4__header">
                <div className="ll3-cardV4__topic">
                    <TopicIcon size={18} />
                </div>

                <div className="ll3-cardV4__headerMain">
                    <div className="ll3-cardV4__topline">
                        <div className="ll3-cardV4__billCode">
                            {billCode}
                        </div>

                        <span
                            className={`ll3-cardV4__status ll3-cardV4__status--${sm.tone}`}
                        >
                            <span className="ll3-cardV4__statusDot" />
                            {statusLabel}
                        </span>
                    </div>

                    <h3 className="ll3-cardV4__title">
                        {r.display_title}
                    </h3>

                    {modifiedLabel ? (
                        <div className="ll3-cardV4__updated">
                            {modifiedLabel}
                        </div>
                    ) : null}
                </div>

                <SaveBillButtonClient
                    billId={r.bill_id || slug}
                    href={href}
                    label={`${billCode} (${r.congress})`}
                    size="sm"
                    iconOnly={true}
                    savedIcon={<BookmarkCheck size={16} />}
                    unsavedIcon={<Bookmark size={16} />}
                />
            </div>

            <div className="ll3-cardV4__signals">
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

            {summary ? (
                <div className="ll3-cardV4__summary">
                    {summary}
                </div>
            ) : null}

            {keyActions.length ? (
                <ul className="ll3-cardV4__actionsList">
                    {keyActions.map((action, index) => (
                        <li key={`${slug}-${index}`}>
                            {action}
                        </li>
                    ))}
                </ul>
            ) : null}

            <div className="ll3-cardV4__footer">
                <div className="ll3-cardV4__meta">
                    <span>
                        <Clock3 size={13} />
                        {fmtDate(r.latest_action_date)}
                    </span>

                    <span>
                        {r.origin_chamber || "—"}
                    </span>

                    <span>
                        {topic.label}
                    </span>
                </div>

                <Link
                    href={href}
                    className="ll3-btn ll3-btn--open"
                >
                    Open
                </Link>
            </div>
        </article>
    );
}