import Link from "next/link";
import { Clock3, Landmark, TrendingUp, Zap } from "lucide-react";

import { fmtDate } from "@/lib/domains/bills/format";
import { STATUS_META, normalizeStatusKey } from "@/lib/domains/bills/meta";

function meterLevel(v) {
    if (!Number.isFinite(v)) return 0;
    return Math.min(5, Math.max(1, Math.ceil(v / 20)));
}

function getBillSummary(bill) {
    return bill?.summary_short || bill?.summary_text_plain || null;
}

function SignalMini({ label, value, tone = "impact", Icon }) {
    const lvl = meterLevel(value);

    return (
        <div className={`ll3-tableSignal ll3-tableSignal--${tone}`}>
            <div className="ll3-tableSignal__head">
                <span className="ll3-tableSignal__label">
                    <Icon size={13} aria-hidden="true" />
                    {label}
                </span>
                <span className="ll3-tableSignal__value">{Number.isFinite(value) ? value : "—"}</span>
            </div>

            <span
                className={`ll3-tableSignal__meter ${lvl ? "" : "is-empty"}`}
                data-level={lvl || undefined}
                aria-hidden="true"
            />
        </div>
    );
}

export default function BillsTable({ rows = [] }) {
    return (
        <div className="ll3-tableWrap">
            <table className="ll3-table" role="table">
                <thead>
                    <tr>
                        <th className="ll3-table__colId">ID</th>
                        <th className="ll3-table__colTitle">Title</th>
                        <th className="ll3-table__colProcess">Process</th>
                        <th className="ll3-table__colAction">Latest action</th>
                        <th className="ll3-table__colSignals">Signals</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map((r) => {
                        const slug = `${r.bill_type}-${r.bill_number}-${r.congress}`.toLowerCase();
                        const href = `/bills/${slug}`;
                        const billCode = `${String(r.bill_type || "").toUpperCase()}. ${r.bill_number}`;

                        const statusKey = normalizeStatusKey(r.status_code);
                        const sm = STATUS_META[statusKey] || STATUS_META.introduced;
                        const summary = getBillSummary(r);

                        return (
                            <tr key={r.bill_id || slug}>
                                <td className="ll3-table__id">
                                    <Link href={href} className="ll3-table__billCode">
                                        {billCode}
                                    </Link>
                                </td>

                                <td className="ll3-table__titleCol">
                                    <Link href={href} className="ll3-table__titleLink">
                                        {r.display_title}
                                    </Link>

                                    <div className="ll3-table__metaLine">
                                        Sponsor: {r.sponsor_name || "—"}
                                        {Number.isFinite(r.cosponsor_count) ? ` • ${r.cosponsor_count} cosponsors` : ""}
                                    </div>

                                    <div className={summary ? "ll3-table__summary" : "ll3-table__summary ll3-muted"}>
                                        {summary || "Summary not available."}
                                    </div>
                                </td>

                                <td className="ll3-table__process">
                                    <div className="ll3-table__chamber">
                                        <Landmark size={13} aria-hidden="true" />
                                        {r.origin_chamber || "—"}
                                    </div>

                                    <span className={`ll3-status ll3-status--${sm.tone}`}>
                                        <span className="ll3-status__dot" aria-hidden="true" />
                                        <span className="ll3-status__label">{sm.label}</span>
                                    </span>
                                </td>

                                <td className="ll3-table__action">
                                    <div className="ll3-table__actionText">{r.latest_action_text || "—"}</div>
                                    <div className="ll3-table__actionDate">
                                        <Clock3 size={13} aria-hidden="true" />
                                        {fmtDate(r.latest_action_date)}
                                    </div>
                                </td>

                                <td className="ll3-table__signals">
                                    <SignalMini
                                        label="Impact"
                                        value={r.impact_score}
                                        tone="impact"
                                        Icon={Zap}
                                    />
                                    <SignalMini
                                        label="Trending"
                                        value={r.trending_score}
                                        tone="trending"
                                        Icon={TrendingUp}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}