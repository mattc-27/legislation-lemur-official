"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    CheckCircle2,
    Users,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Vote,
    CalendarClock,
    Filter,
    ArrowUpDown,
    ChevronDown,
    Info,
    ExternalLink,
} from "lucide-react";

export default function VoteAlignmentUpdated({ value, className = "", chamber = "" }) {
    const isPanel = !!value && typeof value === "object" && !!value.overall;
    const overall = isPanel ? value.overall : value;

    const alignment = pickNum(overall, ["alignment_pct", "alignmentPct", "value"]);
    const attendance = pickNum(overall, ["attendance_pct", "attendancePct"]);

    const alignmentVsMedian = pickNum(overall, ["alignment_vs_house_median"]);
    const attendanceVsMedian = pickNum(overall, ["attendance_vs_house_median"]);
    const alignmentPctile = pickNum(overall, ["alignment_percentile"]);
    const attendancePctile = pickNum(overall, ["attendance_percentile"]);

    const votesTotal = pickInt(overall, ["votes_total", "votesTotal"]);
    const votesMissed = pickInt(overall, ["votes_missed", "votesMissed"]);
    const dataFreshAsOf = overall?.data_fresh_as_of ?? overall?.dataFreshAsOf ?? null;

    const hasAlignment = Number.isFinite(alignment);
    const hasAttendance = Number.isFinite(attendance);

    const pct = clamp(hasAlignment ? alignment : 0, 0, 100);
    const att = clamp(hasAttendance ? attendance : 0, 0, 100);

    const chamberNoun = chamber || "House";
    const label = chamber ? `${chamber} roll calls` : "roll calls";

    const initialMinVotes = isPanel ? (value?.minVotes ?? 10) : 10;
    const [minVotes, setMinVotes] = useState(initialMinVotes);
    const [sortKey, setSortKey] = useState("votes");
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(min-width: 901px)");
        const apply = () => setDetailsOpen(mq.matches);
        apply();
        if (mq.addEventListener) {
            mq.addEventListener("change", apply);
            return () => mq.removeEventListener("change", apply);
        }
        mq.addListener(apply);
        return () => mq.removeListener(apply);
    }, []);

    const rawByPolicy = isPanel ? (Array.isArray(value.byPolicy) ? value.byPolicy : []) : [];

    const byPolicy = useMemo(() => {
        const rows = rawByPolicy
            .map((r) => {
                const rPct = toNum(r.alignment_pct);
                const rVotes = toInt(r.considered_count);
                const rAligned = toInt(r.aligned_count);
                const rMis =
                    r.misaligned_count != null ? toInt(r.misaligned_count) : (rVotes != null && rAligned != null ? rVotes - rAligned : null);

                const delta =
                    r.alignment_delta != null
                        ? toNum(r.alignment_delta)
                        : (rPct != null && hasAlignment ? rPct - pct : null);

                return {
                    ...r,
                    alignment_pct: rPct,
                    considered_count: rVotes,
                    aligned_count: rAligned,
                    misaligned_count: rMis,
                    alignment_delta: delta,
                };
            })
            .filter((r) => Number.isFinite(r.considered_count) && r.considered_count >= (minVotes || 0));

        const cmp =
            {
                votes: (a, b) => (b.considered_count || 0) - (a.considered_count || 0),
                lowest_alignment: (a, b) =>
                    (a.alignment_pct ?? 999) - (b.alignment_pct ?? 999) ||
                    (b.considered_count || 0) - (a.considered_count || 0),
                highest_alignment: (a, b) =>
                    (b.alignment_pct ?? -1) - (a.alignment_pct ?? -1) ||
                    (b.considered_count || 0) - (a.considered_count || 0),
                biggest_delta: (a, b) =>
                    Math.abs(b.alignment_delta || 0) - Math.abs(a.alignment_delta || 0) ||
                    (b.considered_count || 0) - (a.considered_count || 0),
            }[sortKey] || ((a, b) => (b.considered_count || 0) - (a.considered_count || 0));

        return rows.sort(cmp);
    }, [rawByPolicy, minVotes, sortKey, hasAlignment, pct]);

    const topDeviations = useMemo(() => {
        if (isPanel && Array.isArray(value.topDeviations) && value.topDeviations.length) {
            return value.topDeviations.slice(0, 3).map((r) => ({
                policy_area_name: r.policy_area_name ?? r.policyAreaName ?? "—",
                considered_count: toInt(r.considered_count),
                alignment_delta: toNum(r.alignment_delta),
            }));
        }

        return byPolicy
            .slice()
            .sort((a, b) => Math.abs(b.alignment_delta || 0) - Math.abs(a.alignment_delta || 0))
            .slice(0, 3)
            .map((r) => ({
                policy_area_name: r.policy_area_name ?? "—",
                considered_count: r.considered_count,
                alignment_delta: r.alignment_delta,
            }));
    }, [isPanel, value, byPolicy]);

    const freshnessLabel = fmtAsOfShort(dataFreshAsOf);
    const deviationsLine = topDeviations.length ? topDeviations : null;

    return (
        <section className={`llmp3-card llm3-va ${className}`} aria-label="Vote alignment">
            <header className="llmp3-card__head llm3-va__head">
                <div className="llm3-va__title">
                    <div className="llm3-va__titleRow">
                        <h3 className="llm3-h2 llm3-va__h" style={{ margin: 0 }}>
                            Votes aligned with party majority
                        </h3>

                        <InfoPopover
                            label="About party-majority voting"
                            wikiHref="/wiki/party-line-voting"
                            title="What this measures"
                            body="This shows how often the member voted the same way as most members of their party on comparable roll calls. It is not a value judgment; it is a voting-pattern measure."
                        />
                    </div>

                    <div className="llm3-va__subtitle">
                        How often this member voted with most members of their party on {label}.
                    </div>
                </div>

                {hasAttendance && (
                    <Chip
                        tone={att >= 95 ? "good" : att >= 85 ? "neutral" : "warn"}
                        icon={<CalendarClock size={14} />}
                        label="Attendance"
                        value={`${Math.round(att)}%`}
                        title="Share of roll calls where this member cast a vote"
                    />
                )}
            </header>

            <div className="llm3-va__body">
                <div className="llm3-va__topGrid">
                    <div className="llm3-va__hero">
                        <div className="llm3-va__heroRow">
                            <div className="llm3-va__pct">
                                {hasAlignment ? Math.round(pct) : "—"}
                                {hasAlignment ? <span className="llm3-va__pctUnit">%</span> : null}
                            </div>

                            <div className="llm3-va__heroMeta">
                                <div className="llm3-va__heroLabel">
                                    <CheckCircle2 size={16} />
                                    <span>Voted with party majority</span>
                                </div>

                                <div className="llm3-va__metaLine">
                                    {votesTotal != null ? (
                                        <span className="llm3-va__metaItem">
                                            <Vote size={14} />
                                            Compared across {votesTotal.toLocaleString()} votes
                                            {votesMissed != null ? (
                                                <span className="llm3-va__metaMuted">
                                                    {" "}
                                                    • {votesMissed.toLocaleString()} missed
                                                </span>
                                            ) : null}
                                        </span>
                                    ) : null}

                                    {freshnessLabel ? (
                                        <span className="llm3-va__metaItem llm3-va__metaMuted">
                                            <CalendarClock size={14} />
                                            Updated {freshnessLabel}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="llm3-va__stats">
                        <StatCard
                            icon={<Users size={16} />}
                            label={`Compared with ${chamberNoun} median`}
                            value={Number.isFinite(alignmentVsMedian) ? fmtDelta(alignmentVsMedian, { pts: true }) : "—"}
                            tone={toneForDelta(alignmentVsMedian)}
                            hint="Difference from the chamber median, in percentage points"
                        />
                        <StatCard
                            icon={<BarChart3 size={16} />}
                            label="Alignment percentile"
                            value={Number.isFinite(alignmentPctile) ? fmtPercentileLabel(alignmentPctile) : "—"}
                            tone="neutral"
                            hint="Relative standing among members in the chamber"
                        />
                        <StatCard
                            icon={Number.isFinite(attendanceVsMedian) && attendanceVsMedian < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                            label={`Attendance vs ${chamberNoun}`}
                            value={Number.isFinite(attendanceVsMedian) ? fmtDelta(attendanceVsMedian, { pts: true }) : "—"}
                            tone={toneForDelta(attendanceVsMedian)}
                            hint="Difference in attendance from the chamber median, in percentage points"
                        />
                        <StatCard
                            icon={<BarChart3 size={16} />}
                            label="Attendance percentile"
                            value={Number.isFinite(attendancePctile) ? fmtPercentileLabel(attendancePctile) : "—"}
                            tone="neutral"
                            hint="Relative standing among members in the chamber"
                        />
                    </div>
                </div>

                {isPanel && deviationsLine ? (
                    <div className="llm3-va__deviations">
                        <div className="llm3-va__deviationsLabel">Biggest differences by policy area</div>
                        <div className="llm3-va__deviationsList">
                            {deviationsLine.map((d, i) => (
                                <DeviationPill
                                    key={`${d.policy_area_name}-${i}`}
                                    name={d.policy_area_name}
                                    delta={d.alignment_delta}
                                />
                            ))}
                        </div>
                    </div>
                ) : null}

                {isPanel ? (
                    <details className="llm3-va__details" open={detailsOpen}>
                        <summary
                            className="llm3-va__summary"
                            onClick={(e) => {
                                e.preventDefault();
                                setDetailsOpen((v) => !v);
                            }}
                        >
                            <span>Voting with party majority by policy area</span>
                            <span className="llm3-va__summaryIcon" aria-hidden="true">
                                <ChevronDown size={16} />
                            </span>
                        </summary>

                        {detailsOpen ? (
                            <div className="llm3-va__drill">
                                <div className="llm3-va__drillIntro">
                                    Shows how often this member voted with most members of their party within each policy area.
                                </div>

                                <div className="llm3-va__controls">
                                    <label className="llm3-va__control">
                                        <span className="llm3-va__controlLabel">
                                            <ArrowUpDown size={14} /> Sort by
                                        </span>
                                        <select
                                            className="llm3-va__select"
                                            value={sortKey}
                                            onChange={(e) => setSortKey(e.target.value)}
                                            aria-label="Sort policy areas"
                                        >
                                            <option value="votes">Most votes</option>
                                            <option value="biggest_delta">Biggest difference</option>
                                            <option value="lowest_alignment">Lowest alignment</option>
                                            <option value="highest_alignment">Highest alignment</option>
                                        </select>
                                    </label>

                                    <label className="llm3-va__control">
                                        <span className="llm3-va__controlLabel">
                                            <Filter size={14} /> Min votes
                                        </span>
                                        <select
                                            className="llm3-va__select"
                                            value={minVotes}
                                            onChange={(e) => setMinVotes(parseInt(e.target.value, 10))}
                                            aria-label="Minimum votes threshold"
                                        >
                                            <option value={5}>5+</option>
                                            <option value={10}>10+</option>
                                            <option value={20}>20+</option>
                                            <option value={50}>50+</option>
                                        </select>
                                    </label>

                                    <div className="llm3-va__controlsHint">
                                        Showing areas with <strong>{minVotes}+</strong> comparable votes
                                    </div>
                                </div>

                                <div className="llm3-va__rows">
                                    {byPolicy.length ? (
                                        byPolicy.map((row) => (
                                            <PolicyRow
                                                key={row.policy_area_id ?? row.policy_area_slug ?? row.policy_area_name}
                                                row={row}
                                            />
                                        ))
                                    ) : (
                                        <div className="llm3-va__empty">No policy areas meet this threshold.</div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </details>
                ) : null}
            </div>
        </section>
    );
}

function InfoPopover({ label, title, body, wikiHref }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        function onDocClick(e) {
            if (!wrapRef.current?.contains(e.target)) setOpen(false);
        }
        function onEsc(e) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    return (
        <span
            className="llm3-vaInfoWrap"
            ref={wrapRef}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                className="llm3-va__info"
                aria-label={label}
                aria-expanded={open}
                onFocus={() => setOpen(true)}
                onBlur={(e) => {
                    if (!wrapRef.current?.contains(e.relatedTarget)) setOpen(false);
                }}
                onClick={() => setOpen((v) => !v)}
            >
                <Info size={14} />
            </button>

            {open ? (
                <div className="llm3-vaPopover" role="dialog" aria-label={label}>
                    <div className="llm3-vaPopover__title">{title}</div>
                    <div className="llm3-vaPopover__body">{body}</div>
                    {wikiHref ? (
                        <a href={wikiHref} className="llm3-vaPopover__link">
                            Learn more
                            <ExternalLink size={13} aria-hidden="true" />
                        </a>
                    ) : null}
                </div>
            ) : null}
        </span>
    );
}

function Chip({ icon, label, value, tone = "neutral", title }) {
    return (
        <span className={`llm3-vaChip llm3-vaChip--${tone}`} title={title}>
            <span className="llm3-vaChip__icon" aria-hidden="true">{icon}</span>
            <span className="llm3-vaChip__label">{label}</span>
            <span className="llm3-vaChip__value">{value}</span>
        </span>
    );
}

function StatCard({ icon, label, value, tone = "neutral", hint }) {
    return (
        <div className={`llm3-vaStat llm3-vaStat--${tone}`} title={hint}>
            <div className="llm3-vaStat__icon" aria-hidden="true">{icon}</div>
            <div className="llm3-vaStat__text">
                <div className="llm3-vaStat__label">{label}</div>
                <div className="llm3-vaStat__value">{value}</div>
            </div>
        </div>
    );
}

function DeviationPill({ name, delta }) {
    const tone = toneForDelta(delta);
    const icon =
        Number.isFinite(delta) && delta < 0 ? <TrendingDown size={14} /> :
            Number.isFinite(delta) && delta > 0 ? <TrendingUp size={14} /> :
                <ArrowUpDown size={14} />;

    return (
        <span className={`llm3-vaDev llm3-vaDev--${tone}`} title="Difference from overall alignment">
            <span className="llm3-vaDev__name" title={name}>{name}</span>
            <span className="llm3-vaDev__delta">
                <span className="llm3-vaDev__icon" aria-hidden="true">{icon}</span>
                {fmtDelta(delta, { pts: true })}
            </span>
        </span>
    );
}

function PolicyRow({ row }) {
    const nameRaw = row.policy_area_name ?? "—";
    const name = nameRaw === "Congress" ? "Procedural / Congress" : nameRaw;

    const pct = clamp(toNum(row.alignment_pct) ?? 0, 0, 100);
    const delta = toNum(row.alignment_delta);
    const n = toInt(row.considered_count);
    const tone = toneForDelta(delta);

    return (
        <div className="llm3-vaRow" title={`${name} • ${pct.toFixed(1)}% • ${fmtDelta(delta, { pts: true })}`}>
            <div className="llm3-vaRow__left">
                <div className="llm3-vaRow__name" title={name}>{name}</div>
                <div className="llm3-vaRow__sub">{n != null ? `${n} comparable votes` : "—"}</div>
            </div>

            <div className="llm3-vaRow__bar" aria-hidden="true">
                <div className="llm3-vaRow__barFill" style={{ width: `${pct}%` }} />
            </div>

            <div className="llm3-vaRow__right">
                <div className="llm3-vaRow__pct">{pct.toFixed(1)}%</div>
                <span className={`llm3-vaRow__delta llm3-vaRow__delta--${tone}`}>
                    {fmtDelta(delta, { pts: true })}
                </span>
            </div>
        </div>
    );
}

function toneForDelta(x) {
    if (!Number.isFinite(x)) return "neutral";
    if (x > 0.25) return "good";
    if (x < -0.25) return "bad";
    return "neutral";
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, Number(n)));
}
function pickNum(obj, keys) {
    if (!obj) return null;
    for (const k of keys) {
        const raw = obj[k];
        if (raw == null) continue;
        const n = typeof raw === "number" ? raw : parseFloat(raw);
        if (Number.isFinite(n)) return n;
    }
    return null;
}
function pickInt(obj, keys) {
    if (!obj) return null;
    for (const k of keys) {
        const raw = obj[k];
        if (raw == null) continue;
        const n = typeof raw === "number" ? raw : parseInt(raw, 10);
        if (Number.isFinite(n)) return n;
    }
    return null;
}
function toNum(x) {
    if (x == null) return null;
    const n = typeof x === "number" ? x : parseFloat(x);
    return Number.isFinite(n) ? n : null;
}
function toInt(x) {
    if (x == null) return null;
    const n = typeof x === "number" ? x : parseInt(x, 10);
    return Number.isFinite(n) ? n : null;
}
function fmtDelta(x, { pts = false } = {}) {
    if (!Number.isFinite(x)) return "—";
    const sign = x > 0 ? "+" : "";
    return pts ? `${sign}${x.toFixed(1)} pts` : `${sign}${x.toFixed(1)}`;
}
function fmtAsOfShort(asOf) {
    if (!asOf) return null;
    const d = new Date(asOf);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
function fmtPercentileLabel(n) {
    if (!Number.isFinite(n)) return "—";
    const x = Math.round(n);
    if (x >= 90) return `Top ${100 - x}%`;
    if (x >= 75) return `Upper ${100 - x}%`;
    if (x <= 10) return `Bottom ${10 - x}%`;
    return `${x}th percentile`;
}