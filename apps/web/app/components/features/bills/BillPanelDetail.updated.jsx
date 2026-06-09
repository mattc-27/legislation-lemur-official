// /app/components/features/bills/BillPanelDetails.jsx
import Link from "next/link";
import { ArrowLeft, CalendarDays, Gavel, Info, Landmark, UserRound } from "lucide-react";

import BillPanelActions from "./BillPanelActions";
import BillPanelMetricCard from "./BillPanelMetricCard";
import BillPanelBackClient from "./BillPanelBackClient";

function fmtDate(value) {
    if (!value) return "—";

    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toISOString().slice(0, 10);
    } catch {
        return String(value);
    }
}

function titleCase(value) {
    return String(value || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getBillCode(bill) {
    const type = String(bill?.bill_type || bill?.type || "").toUpperCase();
    const number = bill?.bill_number || bill?.number;
    return type && number ? `${type}. ${number}` : bill?.bill_id || "Bill";
}

function normalizeJsonArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean);

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
            return value.trim() ? [value.trim()] : [];
        }
    }

    return [];
}

function getSummary(bill) {
    return bill?.summary_short || bill?.summary_text_plain || null;
}

function getPrimaryTextUrl(bill) {
    const rows = normalizeJsonArray(bill?.text_versions);

    return (
        bill?.primary_text_url ||
        rows.find((row) => String(row?.format_type || "").toLowerCase() === "pdf")?.format_url ||
        rows[0]?.format_url ||
        null
    );
}

function getStatusTone(status = "") {
    const s = String(status).toLowerCase();
    if (s.includes("law") || s.includes("enacted") || s.includes("signed")) return "enacted";
    if (s.includes("pass")) return "passed";
    if (s.includes("committee") || s.includes("referred")) return "committee";
    if (s.includes("fail")) return "failed";
    return "introduced";
}

function getTopicItems(bill) {
    const subjects = normalizeJsonArray(bill?.subjects)
        .map((item) => (typeof item === "string" ? item : item?.name || item?.subject || item?.title))
        .filter(Boolean);

    return [bill?.policy_area, ...subjects]
        .map((item) => String(item).trim())
        .filter(Boolean)
        .filter((item, index, rows) => rows.findIndex((row) => row.toLowerCase() === item.toLowerCase()) === index)
        .slice(0, 8);
}

function SponsorValue({ bill, billCode }) {
    if (!bill?.sponsor_bioguide_id) return bill?.sponsor_name || "—";

    return (
        <div className="llbp-meta__value llbp-sponsorMeta">
            <Link
                href={`/member/${bill.sponsor_bioguide_id}?fromBill=${encodeURIComponent(bill?.bill_id || "")}&fromBillLabel=${encodeURIComponent(billCode)}`}
                className="llbp-memberLink"
            >
                {bill?.sponsor_name || bill.sponsor_bioguide_id}
            </Link>

            <span className="llbp-sponsorTooltipWrap">
                <button type="button" className="llbp-sponsorTooltipBtn" aria-label="Sponsor details">
                    <Info size={12} strokeWidth={2.4} />
                </button>

                <span className="llbp-sponsorTooltip" role="tooltip">
                    <span className="llbp-sponsorTooltip__name">
                        {bill?.sponsor_name || bill.sponsor_bioguide_id}
                    </span>

                    <span className="llbp-sponsorTooltip__meta">
                        {[
                            bill?.sponsor_party,
                            bill?.sponsor_state_name || bill?.sponsor_state,
                            bill?.origin_chamber,
                            bill?.sponsor_district ? `District ${bill.sponsor_district}` : null,
                        ].filter(Boolean).join(" • ")}
                    </span>
                </span>
            </span>
        </div>
    );
}

function FactCard({ icon: Icon, label, children }) {
    return (
        <div className="llbp-fact">
            <div className="llbp-fact__icon" aria-hidden="true">
                <Icon size={15} />
            </div>
            <div className="llbp-fact__body">
                <div className="llbp-fact__label">{label}</div>
                <div className="llbp-fact__value">{children}</div>
            </div>
        </div>
    );
}

export default function BillPanelDetail({ bill, mode = "page", sourceMember = null }) {
    const billCode = getBillCode(bill);
    const title = bill?.display_title || bill?.title || "Untitled legislation";
    const summary = getSummary(bill);
    const keyActions = normalizeJsonArray(bill?.key_actions);
    const topicItems = getTopicItems(bill);

    const statusLabel =
        bill?.status_label || titleCase(bill?.status_key || bill?.status_code || "Introduced");

    const statusTone = getStatusTone(statusLabel);
    const primaryTextUrl =
        bill?.has_primary_text_pdf && bill?.primary_text_pdf_url
            ? bill.primary_text_pdf_url
            : getPrimaryTextUrl(bill);

    return (
        <div
            className={`llbp-detail llbp-detail--${mode} llbd3-page llbd3-page--${mode}`}
            data-view-mode={mode}
        >
            <nav className="llbp-breadcrumb" aria-label="Breadcrumb">
                {mode === "panel" ? (
                    <BillPanelBackClient />
                ) : sourceMember?.bioguideId ? (
                    <Link href={`/member/${sourceMember.bioguideId}`}>
                        <ArrowLeft size={14} aria-hidden="true" />
                        {sourceMember.name ? `Back to ${sourceMember.name}` : "Back to member profile"}
                    </Link>
                ) : (
                    <Link href="/bills">
                        <ArrowLeft size={14} aria-hidden="true" />
                        Legislation
                    </Link>
                )}

                <span aria-hidden="true">›</span>
                <span>{billCode} · Bill detail</span>
            </nav>

            <article className="llbp-panel llbp-panel--explainer">
                <header className="llbp-panel__header llbp-panel__header--explainer">
                    <div className="llbp-headerGrid">
                        <div className="llbp-titleBlock">
                            <div className="llbp-kicker">
                                <span className="llbp-billCode">{billCode}</span>

                                <span className={`llbd3-status llbd3-status--${statusTone}`}>
                                    <span className="llbd3-status__dot" aria-hidden="true" />
                                    <span className="llbd3-status__label">{statusLabel}</span>
                                </span>
                            </div>

                            <h1 className="llbp-title">{title}</h1>

                            <p className={summary ? "llbp-dek" : "llbp-dek llbd3-muted"}>
                                {summary || "Summary not available yet."}
                            </p>
                        </div>

                        <aside className="llbp-scoreGrid" aria-label="Bill signals">
                            <BillPanelMetricCard type="impact" value={bill?.impact_score} label="Impact Score" />
                            <BillPanelMetricCard type="momentum" value={bill?.trending_score} label="Momentum" />
                        </aside>
                    </div>
                </header>

                <div className="llbp-panel__body llbp-panel__body--explainer">
                    <section className="llbp-explainer" aria-labelledby="bill-explainer-heading">
                        <div className="llbp-section__label">Plain-English overview</div>
                        <h2 id="bill-explainer-heading" className="llbp-sectionTitle">
                            What this bill does
                        </h2>

                        <div className="llbp-explainerGrid">
                            <div className="llbp-explainer__main">
                                <p className={summary ? "llbp-summary" : "llbp-summary llbd3-muted"}>
                                    {summary || "A plain-English summary is not available for this bill yet."}
                                </p>

                                {keyActions.length ? (
                                    <div className="llbp-keyActions llbp-keyActions--inline" aria-labelledby="bill-key-points-heading">
                                        <div id="bill-key-points-heading" className="llbp-keyActions__head">
                                            <Gavel size={14} aria-hidden="true" />
                                            Key points
                                        </div>

                                        <ul className="llbp-keyActions__list">
                                            {keyActions.slice(0, 6).map((action, index) => (
                                                <li className="llbp-keyActions__item" key={`${bill?.bill_id}-action-${index}`}>
                                                    <span className="llbp-keyActions__dot" aria-hidden="true" />
                                                    <span>{action}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                            </div>

                            <aside className="llbp-atGlance" aria-label="Bill at a glance">
                                <div className="llbp-atGlance__label">At a glance</div>

                                <FactCard icon={Landmark} label="Chamber">
                                    {bill?.origin_chamber || "—"}
                                </FactCard>

                                <FactCard icon={UserRound} label="Sponsor">
                                    <SponsorValue bill={bill} billCode={billCode} />
                                </FactCard>

                                <FactCard icon={CalendarDays} label="Introduced">
                                    {fmtDate(bill?.introduced_date)}
                                </FactCard>
                            </aside>
                        </div>
                    </section>

                    <section className="llbp-section llbp-statusBlock" aria-labelledby="bill-status-heading">
                        <div className="llbp-section__label">Current status</div>
                        <h2 id="bill-status-heading" className="llbp-sectionTitle">
                            Where it stands
                        </h2>

                        <div className="llbp-statusBlock__grid">
                            <div className="llbp-statusBlock__card">
                                <div className="llbp-statusBlock__label">Status</div>
                                <div className="llbp-statusBlock__value">{statusLabel}</div>
                            </div>

                            <div className="llbp-statusBlock__card llbp-statusBlock__card--wide">
                                <div className="llbp-statusBlock__label">Latest action</div>
                                <div className="llbp-statusBlock__value llbp-statusBlock__value--body">
                                    {bill?.latest_action_text ? (
                                        <>
                                            <strong>{fmtDate(bill?.latest_action_date)}</strong>
                                            {" — "}
                                            {bill.latest_action_text}
                                        </>
                                    ) : (
                                        "Latest action not available."
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {topicItems.length ? (
                        <section className="llbp-section" aria-labelledby="bill-topics-heading">
                            <div className="llbp-section__label">Related context</div>
                            <h2 id="bill-topics-heading" className="llbp-sectionTitle">
                                Topics and policy areas
                            </h2>

                            <div className="llbp-topicList">
                                {topicItems.map((topic) => (
                                    <span className="llbp-topicPill" key={topic}>{topic}</span>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    <BillPanelActions
                        bill={bill}
                        congressUrl={bill?.congress_url || bill?.url}
                        primaryTextUrl={primaryTextUrl}
                        amendmentsUrl={bill?.amendments_url}
                        amendmentCount={bill?.amendment_count}
                    />
                </div>
            </article>
        </div>
    );
}
