// /app/components/features/bills/BillPanelDetails.jsx
import Link from "next/link";
import { ArrowLeft, Gavel, Info } from "lucide-react";

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

function getShareUrl(bill) {
    const billId = bill?.bill_id;
    if (!billId) return null;

    const subject = encodeURIComponent(`Legislation Lemur: ${getBillCode(bill)}`);
    const body = encodeURIComponent(`/bills/${billId}`);
    return `mailto:?subject=${subject}&body=${body}`;
}

function getStatusTone(status = "") {
    const s = String(status).toLowerCase();
    if (s.includes("law") || s.includes("enacted") || s.includes("signed")) return "enacted";
    if (s.includes("pass")) return "passed";
    if (s.includes("committee") || s.includes("referred")) return "committee";
    if (s.includes("fail")) return "failed";
    return "introduced";
}

export default function BillPanelDetail({ bill, mode = "page", sourceMember = null }) {
    const billCode = getBillCode(bill);
    const title = bill?.display_title || bill?.title || "Untitled legislation";
    const summary = getSummary(bill);
    const keyActions = normalizeJsonArray(bill?.key_actions);

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
                <span>{billCode} - Policy Detail</span>
            </nav>

            <article className="llbp-panel">
                <header className="llbp-panel__header">
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

                            <div className="llbp-metaGrid">
                                <div className="llbp-meta">
                                    <div className="llbp-meta__label">Chamber</div>
                                    <div className="llbp-meta__value">{bill?.origin_chamber || "—"}</div>
                                </div>

                                {/*<div className="llbp-meta">
                                        <div className="llbp-meta__label">Sponsor</div>
                                        <div className="llbp-meta__value">
                                            {bill?.sponsor_name || bill?.sponsor_bioguide_id || "—"}
                                        </div>
                                    </div>*/}
                                <div className="llbp-meta">
                                    <div className="llbp-meta__label">Sponsor</div>

                                    <div className="llbp-meta__value llbp-sponsorMeta">
                                        {bill?.sponsor_bioguide_id ? (
                                            <>
                                                <Link
                                                    href={`/member/${bill.sponsor_bioguide_id}?fromBill=${encodeURIComponent(bill?.bill_id || "")}&fromBillLabel=${encodeURIComponent(billCode)}`}
                                                    className="llbp-memberLink"
                                                >
                                                    {bill?.sponsor_name || bill.sponsor_bioguide_id}
                                                </Link>

                                                <span className="llbp-sponsorTooltipWrap">
                                                    <button
                                                        type="button"
                                                        className="llbp-sponsorTooltipBtn"
                                                        aria-label="Sponsor details"
                                                    >
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
                                            </>
                                        ) : (
                                            bill?.sponsor_name || "—"
                                        )}
                                    </div>
                                </div>

                                <div className="llbp-meta">
                                    <div className="llbp-meta__label">Introduced</div>
                                    <div className="llbp-meta__value">{fmtDate(bill?.introduced_date)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="llbp-scoreGrid">
                            <BillPanelMetricCard
                                type="impact"
                                value={bill?.impact_score}
                                label="Impact Score"
                            />

                            <BillPanelMetricCard
                                type="momentum"
                                value={bill?.trending_score}
                                label="Momentum"
                            />
                        </div>
                    </div>
                </header>

                <div className="llbp-panel__body">
                    <section className="llbp-section" aria-labelledby="bill-summary-heading">
                        <div id="bill-summary-heading" className="llbp-section__label">
                            Summary
                        </div>

                        <div className={summary ? "llbp-summary" : "llbp-summary llbd3-muted"}>
                            {summary || "Summary not available yet."}
                        </div>
                    </section>

                    {keyActions.length ? (
                        <section className="llbp-keyActions" aria-labelledby="bill-actions-heading">
                            <div id="bill-actions-heading" className="llbp-keyActions__head">
                                <Gavel size={14} aria-hidden="true" />
                                What this does
                            </div>

                            <ul className="llbp-keyActions__list">
                                {keyActions.slice(0, 8).map((action, index) => (
                                    <li className="llbp-keyActions__item" key={`${bill?.bill_id}-action-${index}`}>
                                        <span className="llbp-keyActions__dot" aria-hidden="true" />
                                        <span>{action}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    {bill?.latest_action_text ? (
                        <section className="llbp-section" aria-labelledby="latest-action-heading">
                            <div id="latest-action-heading" className="llbp-section__label">
                                Latest action
                            </div>

                            <div className="llbp-summary">
                                <strong>{fmtDate(bill?.latest_action_date)}</strong>
                                {" — "}
                                {bill.latest_action_text}
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