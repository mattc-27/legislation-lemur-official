"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function VotesHeatmap({
    votes = [],
    weeks = 52,
    height = 160,
    plotRatio,
    heatmapRatio,
    onSelectDay,
    selectedDate,
    title = null,
    debug = false,
    compactLegend = false,
}) {
    const wrapRef = useRef(null);
    const [box, setBox] = useState({ w: 340 });

    const ratio = plotRatio ?? heatmapRatio ?? 0.78;

    useEffect(() => {
        if (!wrapRef.current) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width } = entry.contentRect;
            if (width > 0) {
                setBox((prev) => (width === prev.w ? prev : { ...prev, w: Math.round(width) }));
            }
        });
        ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, []);

    const totalH = height;

    // tighter legend area in compact mode
    const minLegend = compactLegend ? 42 : 70;
    const gridAreaH = Math.max(110, Math.floor(totalH * ratio));
    const legendAreaH = Math.max(minLegend, totalH - gridAreaH);

    const { days, cell, gap, top, left, maxDayCount, talliedDays, badDates } = useMemo(
        () =>
            buildGrid(votes, {
                weeks,
                width: box.w,
                height: gridAreaH,
                selectedDate,
            }),
        [votes, weeks, box.w, gridAreaH, selectedDate]
    );

    useEffect(() => {
        if (!debug || typeof window === "undefined") return;
        window.__VOTES_HEATMAP__ = {
            box,
            totalH,
            gridAreaH,
            legendAreaH,
            talliedDays,
            badDates,
            maxDayCount,
        };
    }, [debug, box, totalH, gridAreaH, legendAreaH, talliedDays, badDates, maxDayCount]);

    return (
        <div
            ref={wrapRef}
            className={`llm3-heatmap ${compactLegend ? "llm3-heatmap--compact" : ""}`}
            role="group"
            aria-label="Voting activity heatmap"
            style={{ height: totalH }}
        >
            <div className="llm3-heatmap__plot">
                <svg width={box.w} height={gridAreaH} viewBox={`0 0 ${box.w} ${gridAreaH}`} aria-hidden="true">
                    {renderMonthTicks(days, { left, top: top - 8, cell, gap })}
                    {["S", "T", "T", "S"].map((d, i) => (
                        <text
                            key={i}
                            x={left - 8}
                            y={top + (i * 2 + 0.9) * (cell + gap)}
                            fontSize="8"
                            textAnchor="end"
                            fill="#94A3B8"
                        >
                            {d}
                        </text>
                    ))}

                    {days.map((d, i) => {
                        const x = left + d.col * (cell + gap);
                        const y = top + d.row * (cell + gap);
                        const color = swatch(d.count, maxDayCount);
                        const stroke = d.selected ? "#111827" : "rgba(0,0,0,0.06)";
                        const clickable = d.count > 0;

                        return (
                            <g key={i} transform={`translate(${x},${y})`}>
                                <rect
                                    width={cell}
                                    height={cell}
                                    rx="2"
                                    fill={color}
                                    stroke={stroke}
                                    strokeWidth={d.selected ? 1.5 : 1}
                                    style={{ cursor: clickable ? "pointer" : "default" }}
                                    onClick={() => clickable && onSelectDay?.(d.key)}
                                >
                                    <title>{tooltipText(d)}</title>
                                </rect>
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="llm3-heatmap__legend" style={{ minHeight: legendAreaH }}>
                <div className="llm3-heatmap__legendRow">
                    <span className="llm3-heatmap__muted">less</span>
                    {[0, 1, 2, 3, 4].map((lvl) => (
                        <i key={lvl} className="llm3-heatmap__box" style={{ background: ramp(lvl / 4) }} />
                    ))}
                    <span className="llm3-heatmap__muted">more</span>
                </div>

                <div className="llm3-heatmap__meta">
                    Days with votes: {talliedDays} • Max/day: {maxDayCount}
                    {badDates ? ` • Unparsed: ${badDates}` : ""}
                </div>
            </div>
        </div>
    );
}

/* ---------- helpers (unchanged from your file) ---------- */

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

function buildGrid(votes, { weeks, width, height, selectedDate }) {
    const today = startOfDayLocal(new Date());
    const start = addDays(today, -7 * (weeks - 1));
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

    const rows = 7;
    const gap = weeks > 40 ? 1 : 2;
    const reservedTop = 18;
    const reservedLeft = 22;
    const innerH = Math.max(120, height - reservedTop - 6);
    const innerW = Math.max(120, width - reservedLeft - 6);
    const vCell = Math.floor((innerH - gap * (rows - 1)) / rows);
    const cols = weeks;
    const hCell = Math.floor((innerW - gap * (cols - 1)) / cols);
    const cell = Math.max(3, Math.min(vCell, hCell));

    const days = [];
    let maxDayCount = 0;
    let d = gridStart;

    const selectedKey =
        typeof selectedDate === "string" && selectedDate.length >= 10 ? selectedDate.slice(0, 10) : null;

    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            const key = localISO(d);
            const t = tallies.get(key);
            const node = {
                key,
                date: new Date(d),
                row: r,
                col: c,
                ...t,
                count: t ? t.count : 0,
                selected: selectedKey ? key === selectedKey : false,
            };
            days.push(node);
            if (node.count > maxDayCount) maxDayCount = node.count;
            d = addDays(d, 1);
        }
    }

    return {
        days,
        cell,
        gap,
        top: reservedTop,
        left: reservedLeft,
        maxDayCount,
        talliedDays: Array.from(tallies.values()).filter((x) => x.count > 0).length,
        badDates,
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
    return `${dd}: ${d.count} vote${d.count > 1 ? "s" : ""}\n${parts.join(" · ")}${res.length ? `\n${res.join(" · ")}` : ""
        }`;
}

function ramp(t) {
    const k = Math.max(0, Math.min(1, t));
    const a = [232, 234, 253];
    const b = [99, 102, 241];
    const r = Math.round(a[0] + (b[0] - a[0]) * k);
    const g = Math.round(a[1] + (b[1] - a[1]) * k);
    const bb = Math.round(a[2] + (b[2] - a[2]) * k);
    return `rgb(${r},${g},${bb})`;
}
function swatch(count, max) {
    if (!count || max <= 1) return "#F1F5F9";
    const t = Math.min(1, count / max);
    if (t < 0.25) return ramp(0.25);
    if (t < 0.5) return ramp(0.5);
    if (t < 0.75) return ramp(0.75);
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
                <text key={i} x={t.x + 1} y={top - 4} fontSize="10" fill="#475569">
                    {t.label}
                </text>
            ))}
        </>
    );
}