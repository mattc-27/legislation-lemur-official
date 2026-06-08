"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Vote, Flame } from "lucide-react";

export default function VotesHeatmap({
    votes = [],
    days = null,
    weeks = null,
    height = 250,
    onSelectDay,
    selectedDate,
    title = "Voting activity",
    updatedLabel = null,
    compactLegend = false,
    showSummary = true,
    mode = "page",
    debug = false,
}) {
    const wrapRef = useRef(null);
    const isPanel = mode === "panel";
    const resolvedDays = Number.isFinite(Number(days)) ? Number(days) : weeks ? Number(weeks) * 7 : 90;
    const [box, setBox] = useState({ w: 640 });

    useEffect(() => {
        if (!wrapRef.current) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width } = entry.contentRect;
            if (width > 0) {
                setBox((prev) => (prev.w === Math.round(width) ? prev : { w: Math.round(width) }));
            }
        });
        ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, []);

    const {
        daysGrid,
        cell,
        gap,
        top,
        left,
        maxDayCount,
        talliedDays,
        badDates,
        totalVotes,
        busiestDay,
        avgActiveDay,
    } = useMemo(() => {
        return buildGrid(votes, {
            days: resolvedDays,
            width: box.w,
            height,
            selectedDate,
        });
    }, [votes, resolvedDays, box.w, height, selectedDate]);

    useEffect(() => {
        if (!debug || typeof window === "undefined") return;
        window.__VOTES_HEATMAP__ = {
            box,
            maxDayCount,
            talliedDays,
            totalVotes,
            busiestDay,
            avgActiveDay,
            badDates,
        };
    }, [debug, box, maxDayCount, talliedDays, totalVotes, busiestDay, avgActiveDay, badDates]);

    return (
        <section
            ref={wrapRef}
            className={`llm3-heatmapCard ${isPanel ? "llm3-heatmapCard--panel" : ""} ${compactLegend ? "llm3-heatmapCard--compactLegend" : ""}`.trim()}
            aria-label="Voting activity heatmap"
        >
            {title !== null || updatedLabel ? (
                <div className="llm3-heatmapCard__head">
                    {title !== null ? (
                        <div className="llm3-heatmapCard__titleBlock">
                            <h3 className="llm3-heatmapCard__title">{title}</h3>
                            <p className="llm3-heatmapCard__sub">
                                Daily voting activity over the last {resolvedDays} days. Darker squares indicate more votes on that day.
                            </p>
                        </div>
                    ) : <span />}

                    <div className="llm3-heatmapCard__meta">
                        {updatedLabel ? `Last ${resolvedDays} days • Updated ${updatedLabel}` : `Last ${resolvedDays} days`}
                    </div>
                </div>
            ) : null}

            <div className="llm3-heatmapCard__gridWrap">
                <svg
                    className="llm3-heatmapCard__svg"
                    width={box.w}
                    height={height}
                    viewBox={`0 0 ${box.w} ${height}`}
                    aria-hidden="true"
                >
                    {renderMonthTicks(daysGrid, { left, top: top - 8, cell, gap })}

                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                        <text
                            key={i}
                            x={left - 10}
                            y={top + i * (cell + gap) + cell * 0.72}
                            fontSize="10"
                            textAnchor="end"
                            fill="rgba(17,24,39,0.45)"
                        >
                            {d}
                        </text>
                    ))}

                    {daysGrid.map((d, i) => {
                        const x = left + d.col * (cell + gap);
                        const y = top + d.row * (cell + gap);
                        const color = swatch(d.count, maxDayCount);
                        const stroke = d.selected ? "rgba(17,24,39,0.9)" : "rgba(17,24,39,0.08)";
                        const clickable = d.count > 0;

                        const resultDot =
                            d.count > 0
                                ? d.passed > d.failed
                                    ? "#22C55E"
                                    : d.failed > d.passed
                                        ? "#EF4444"
                                        : null
                                : null;

                        return (
                            <g key={i} transform={`translate(${x},${y})`}>
                                <rect
                                    width={cell}
                                    height={cell}
                                    rx="3"
                                    fill={color}
                                    stroke={stroke}
                                    strokeWidth={d.selected ? 1.5 : 1}
                                    style={{ cursor: clickable ? "pointer" : "default" }}
                                    onClick={() => clickable && onSelectDay?.(d.key)}
                                >
                                    <title>{tooltipText(d)}</title>
                                </rect>

                                {resultDot ? (
                                    <circle
                                        cx={cell - 3}
                                        cy={3}
                                        r="1.75"
                                        fill={resultDot}
                                    />
                                ) : null}
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="llm3-heatmapCard__legendRow">
                <div className="llm3-heatmapCard__scale">
                    <span className="llm3-heatmapCard__legendText">less</span>
                    {[0, 1, 2, 3, 4].map((lvl) => (
                        <i
                            key={lvl}
                            className="llm3-heatmapCard__scaleBox"
                            style={{ background: ramp(lvl / 4) }}
                        />
                    ))}
                    <span className="llm3-heatmapCard__legendText">more</span>
                </div>

                <div className="llm3-heatmapCard__outcomes">
                    <span className="llm3-heatmapCard__outcome">
                        <i className="llm3-heatmapCard__outcomeDot is-pass" />
                        Mostly passed
                    </span>
                    <span className="llm3-heatmapCard__outcome">
                        <i className="llm3-heatmapCard__outcomeDot is-fail" />
                        Mostly failed
                    </span>
                </div>
            </div>

            {showSummary ? (
                <div className="llm3-heatmapCard__summary">
                    <div className="llm3-heatmapCard__summaryTitle">Summary</div>

                    <div className="llm3-heatmapCard__summaryStats">
                        <div className="llm3-heatmapCard__summaryItem">
                            <CalendarDays size={14} />
                            <span>{talliedDays} active days</span>
                        </div>

                        <div className="llm3-heatmapCard__summaryItem">
                            <Vote size={14} />
                            <span>{totalVotes} total votes</span>
                        </div>

                        <div className="llm3-heatmapCard__summaryItem">
                            <Flame size={14} />
                            <span>
                                Busiest: {busiestDay ? `${busiestDay.label} (${busiestDay.count})` : "—"}
                            </span>
                        </div>
                    </div>

                    <div className="llm3-heatmapCard__summaryMeta">
                        Days with votes: {talliedDays} • Max/day: {maxDayCount} • Avg/active day: {avgActiveDay}
                        {badDates ? ` • Unparsed: ${badDates}` : ""}
                    </div>
                </div>
            ) : null}
        </section>
    );
}

/* ---------- helpers ---------- */

function getVoteDateValue(v) {
    return v?.voted_at ?? v?.date ?? v?.votedAt ?? v?.vote_date ?? v?.voteDate ?? null;
}

function parseDateFlexible(i) {
    if (!i) return null;
    if (i instanceof Date) return isNaN(+i) ? null : i;
    if (typeof i === "number") {
        const ms = i > 1e12 ? i : i * 1000;
        const d = new Date(ms);
        return isNaN(+d) ? null : d;
    }
    if (typeof i === "string") {
        const s = i.trim();
        {
            const d = new Date(s);
            if (!isNaN(+d)) return d;
        }
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(s)) return new Date(s.replace(" ", "T"));
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
            const [y, m, d] = s.split("-").map(Number);
            return new Date(y, m - 1, d);
        }
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
            const [m, d, y] = s.split("/").map(Number);
            return new Date(y, m - 1, d);
        }
        if (/^\d+$/.test(s)) {
            const n = Number(s);
            return new Date(n > 1e12 ? n : n * 1000);
        }
    }
    return null;
}

function startOfDayLocal(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function localISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
}

function startOfWeek(d) {
    const x = new Date(d);
    const day = x.getDay();
    x.setDate(x.getDate() - day);
    x.setHours(0, 0, 0, 0);
    return x;
}

function addDays(d, n) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}

function buildGrid(votes, { days, width, height, selectedDate }) {
    const today = startOfDayLocal(new Date());
    const start = addDays(today, -(days - 1));
    const gridStart = startOfWeek(start);

    const tallies = new Map();
    let badDates = 0;

    for (const v of votes || []) {
        const src = getVoteDateValue(v);
        const parsed = parseDateFlexible(src);
        if (!parsed) {
            badDates++;
            continue;
        }

        const key = localISO(startOfDayLocal(parsed));
        const x =
            tallies.get(key) || { count: 0, yea: 0, nay: 0, present: 0, passed: 0, failed: 0, other: 0 };

        x.count++;

        const pos = (v.choice || v.position || "").toLowerCase();
        if (pos === "yea" || pos === "yes" || pos === "aye") x.yea++;
        else if (pos === "nay" || pos === "no") x.nay++;
        else if (pos.includes("present")) x.present++;

        const res = (v.result || "").toLowerCase();
        if (res.includes("pass") || res.includes("agreed")) x.passed++;
        else if (res.includes("fail")) x.failed++;
        else x.other++;

        tallies.set(key, x);
    }

    const totalWeeks = Math.ceil(days / 7) + 1;
    const rows = 7;
    const gap = 4;
    const reservedTop = 26;
    const reservedLeft = 22;

    const innerW = Math.max(220, width - reservedLeft - 8);
    const innerH = Math.max(120, height - reservedTop - 8);

    const vCell = Math.floor((innerH - gap * (rows - 1)) / rows);
    const hCell = Math.floor((innerW - gap * (totalWeeks - 1)) / totalWeeks);
    const cell = Math.max(10, Math.min(vCell, hCell));

    const selectedKey =
        typeof selectedDate === "string" && selectedDate.length >= 10 ? selectedDate.slice(0, 10) : null;

    const daysGrid = [];
    let maxDayCount = 0;
    let totalVotes = 0;
    let d = gridStart;
    let busiest = null;

    for (let c = 0; c < totalWeeks; c++) {
        for (let r = 0; r < rows; r++) {
            const key = localISO(d);
            const t = tallies.get(key);
            const count = t ? t.count : 0;

            const node = {
                key,
                date: new Date(d),
                row: r,
                col: c,
                ...t,
                count,
                selected: selectedKey ? key === selectedKey : false,
            };

            daysGrid.push(node);

            if (count > maxDayCount) {
                maxDayCount = count;
                busiest = {
                    label: node.date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
                    count,
                };
            }

            totalVotes += count;
            d = addDays(d, 1);
        }
    }

    const talliedDays = Array.from(tallies.values()).filter((x) => x.count > 0).length;
    const avgActiveDay = talliedDays ? (totalVotes / talliedDays).toFixed(1) : "0.0";

    return {
        daysGrid,
        cell,
        gap,
        top: reservedTop,
        left: reservedLeft,
        maxDayCount,
        talliedDays,
        badDates,
        totalVotes,
        busiestDay: busiest,
        avgActiveDay,
    };
}

function tooltipText(d) {
    const dd = d.date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    if (!d.count) return `${dd}: No votes`;

    const parts = [];
    if (d.yea) parts.push(`Yea ${d.yea}`);
    if (d.nay) parts.push(`Nay ${d.nay}`);
    if (d.present) parts.push(`Present ${d.present}`);

    const res = [];
    if (d.passed) res.push(`Passed ${d.passed}`);
    if (d.failed) res.push(`Failed ${d.failed}`);
    if (d.other) res.push(`Other ${d.other}`);

    return `${dd}: ${d.count} vote${d.count > 1 ? "s" : ""}\n${parts.join(" · ")}${res.length ? `\n${res.join(" · ")}` : ""}`;
}

function ramp(t) {
    const k = Math.max(0, Math.min(1, t));
    const a = [224, 232, 255];
    const b = [91, 33, 182];
    const r = Math.round(a[0] + (b[0] - a[0]) * k);
    const g = Math.round(a[1] + (b[1] - a[1]) * k);
    const bb = Math.round(a[2] + (b[2] - a[2]) * k);
    return `rgb(${r},${g},${bb})`;
}

function swatch(count, max) {
    if (!count || max <= 1) return "#DCE6F7";
    const t = Math.min(1, count / max);
    if (t < 0.2) return ramp(0.18);
    if (t < 0.4) return ramp(0.36);
    if (t < 0.6) return ramp(0.56);
    if (t < 0.8) return ramp(0.78);
    return ramp(1);
}

function renderMonthTicks(days, { left, top, cell, gap }) {
    const ticks = [];
    let lastMonth = -1;

    for (let i = 0; i < days.length; i += 7) {
        const d = days[i].date;
        const m = d.getMonth();
        if (m !== lastMonth) {
            const col = days[i].col;
            const x = left + col * (cell + gap);
            ticks.push({ x, label: d.toLocaleString(undefined, { month: "short" }) });
            lastMonth = m;
        }
    }

    return (
        <>
            {ticks.map((t, i) => (
                <text
                    key={i}
                    x={t.x + 1}
                    y={top - 8}
                    fontSize="11"
                    fill="rgba(17,24,39,0.62)"
                >
                    {t.label}
                </text>
            ))}
        </>
    );
}