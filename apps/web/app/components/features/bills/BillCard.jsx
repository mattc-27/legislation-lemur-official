// app/(app)/test_/BillCard.jsx
import Link from "next/link";
import SaveBillButtonClient from "./SaveBillButtonClient";
import { fmtDate } from "@/lib/domains/bills/format";
import { STATUS_META, normalizeStatusKey, subjectToGroup } from "@/lib/domains/bills/meta";
import BillChip from "./BillChip";

import {
    ArrowUpRight,
    Calendar,
    Clock3,
    Hash,
    Tags,
    Users,
    ChevronDown,
    Info,
    Zap,
    TrendingUp,
} from "lucide-react";

export default function BillCard({ bill }) {
    const r = bill;

    const slug = `${r.bill_type}-${r.bill_number}-${r.congress}`.toLowerCase();
    const href = `/bills/${slug}`;

    const billCode = `${String(r.bill_type || "").toUpperCase()}. ${r.bill_number}`;
    const chamber = r.origin_chamber || "—";

    const statusKey = normalizeStatusKey(r.status_code);
    const sm = STATUS_META[statusKey] || STATUS_META.introduced;

    const subjects = (r.subjects || []).slice(0, 3).map(subjectToGroup);
    const extraSubjects = Math.max(0, (r.subjects || []).length - subjects.length);

    const impact = Number.isFinite(r.impact_score) ? r.impact_score : null;
    const trending = Number.isFinite(r.trending_score) ? r.trending_score : null;

    const level = (v) => Math.min(5, Math.max(1, Math.ceil(v / 20)));

    return (
        <article className="ll3-card" role="listitem">
            {/* Tier A */}
            <div className="ll3-card__a">
                <div className="ll3-card__toprow">
                    <BillChip href={href} billCode={billCode} chamber={chamber} congress={r.congress} />

                    <span
                        className={`ll3-status ll3-status--${sm.tone}`}
                        title={`${sm.label}: ${sm.desc}`}
                        aria-label={`${sm.label}. ${sm.desc}`}
                    >
                        <span className="ll3-status__dot" aria-hidden="true" />
                        <span className="ll3-status__label">{sm.label}</span>
                    </span>
                </div>

                <Link className="ll3-titlelink" href={href}>
                    <h3 className="ll3-title">{r.display_title}</h3>
                </Link>
            </div>

            {/* Tier B */}
            <div className="ll3-card__b">
                <div className="ll3-hero">
                    <div className="ll3-hero__label">
                        <Clock3 size={14} aria-hidden="true" /> Latest action
                    </div>
                    <div className="ll3-hero__date">{fmtDate(r.latest_action_date)}</div>
                    <div className="ll3-hero__text">{r.latest_action_text || "—"}</div>
                </div>

                {/* ✅ Signals strip (Impact + Trending + info tooltip/link) */}
                <div className="ll3-signals" aria-label="Bill signals">
                    <div className="ll3-signals__head">
                        <span className="ll3-signals__title">Signals</span>

                        {/* Tooltip + link */}
                        <a
                            className="ll3-signalInfo"
                            href="/references#bill-signals"
                            aria-label="What are Impact and Trending? Open reference."
                            data-tip="What are these? Impact & Trending are heuristic signals (0–100)."
                        >
                            <Info size={16} aria-hidden="true" />
                            <span className="ll3-signalInfo__txt">What is this?</span>
                        </a>
                    </div>

                    <div className="ll3-signals__grid">
                        <span className="ll3-signal" data-tone="impact" title="Heuristic Impact Score (0–100)">
                            <span className="ll3-signal__k">
                                <Zap size={14} aria-hidden="true" />
                                Impact
                            </span>
                            <span className="ll3-signal__v">{impact ?? "—"}</span>

                            {impact != null ? (
                                <span className="ll3-meter" aria-hidden="true" data-level={level(impact)} />
                            ) : (
                                <span className="ll3-meter ll3-meter--empty" aria-hidden="true" />
                            )}
                        </span>

                        <span className="ll3-signal" data-tone="trending" title="Heuristic Trending Score (0–100)">
                            <span className="ll3-signal__k">
                                <TrendingUp size={14} aria-hidden="true" />
                                Trending
                            </span>
                            <span className="ll3-signal__v">{trending ?? "—"}</span>

                            {trending != null ? (
                                <span className="ll3-meter" aria-hidden="true" data-level={level(trending)} />
                            ) : (
                                <span className="ll3-meter ll3-meter--empty" aria-hidden="true" />
                            )}
                        </span>
                    </div>
                </div>

                <div className="ll3-meta">
                    <div className="ll3-meta__item">
                        <div className="ll3-meta__k">
                            <Calendar size={14} aria-hidden="true" /> Introduced
                        </div>
                        <div className="ll3-meta__v">{fmtDate(r.introduced_date)}</div>
                    </div>

                    <div className="ll3-meta__item">
                        <div className="ll3-meta__k">
                            <Users size={14} aria-hidden="true" /> Cosponsors
                        </div>
                        <div className="ll3-meta__v">{r.cosponsor_count ?? "—"}</div>
                    </div>

                    <div className="ll3-meta__item ll3-meta__subjects">
                        <div className="ll3-meta__k">
                            <Tags size={14} aria-hidden="true" /> Subjects
                        </div>
                        <div className="ll3-subjects" title={subjects.join(", ")}>
                            {subjects.slice(0, 2).map((s, i) => (
                                <span key={`${s}-${i}`} className="ll3-subject">
                                    {s}
                                </span>
                            ))}
                            {extraSubjects > 0 && (
                                <span className="ll3-subject ll3-subject--more">+{extraSubjects}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="ll3-card__actions">
                    <Link className="ll3-btn ll3-btn--primary ll3-btn--sm ll3-btn--open" href={href}>
                        <ArrowUpRight size={16} aria-hidden="true" />
                        Open
                    </Link>

                    <SaveBillButtonClient
                        billId={r.billCode}
                        href={href}
                        label={`${r.type?.toUpperCase()}. ${r.number} (${r.congress})`}
                        meta={{
                            congress: r.congress,
                            type: r.bill_type,
                            number: r.bill_number,
                            introduced: r.introduced_date,
                            latest_action_date: r.latest_action_date,
                            latest_action_text: r.latest_action_text,
                        }}
                        size="sm"
                    />

                    <details className="ll3-details">
                        <summary className="ll3-details__summary">
                            <Hash size={16} aria-hidden="true" />
                            Details
                            <ChevronDown size={16} className="ll3-details__chev" aria-hidden="true" />
                        </summary>

                        <div className="ll3-details__body">
                            <div className="ll3-details__row">
                                <span className="ll3-details__k">Bill</span>
                                <span className="ll3-details__v">
                                    {billCode} ({r.congress}) • {chamber}
                                </span>
                            </div>

                            <div className="ll3-details__row">
                                <span className="ll3-details__k">Status</span>
                                <span className="ll3-details__v">
                                    {sm.label} — <span className="ll3-muted">{sm.desc}</span>
                                </span>
                            </div>

                            <div className="ll3-details__row">
                                <span className="ll3-details__k">Subjects</span>
                                <span className="ll3-details__v">
                                    {(r.subjects || []).length ? (r.subjects || []).map(subjectToGroup).join(", ") : "—"}
                                </span>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        </article>
    );
}
