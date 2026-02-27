// apps/web/app/components/features/insights/client/PulseTimeSeriesV1.jsx
"use client";

import React, { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

function toDateSafe(s) {
    if (!s) return null;
    if (s instanceof Date && !Number.isNaN(+s)) return s;

    const str = String(s);
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        const d = new Date(str.slice(0, 10) + "T00:00:00Z");
        return Number.isNaN(+d) ? null : d;
    }
    return null;
}

function useResizeSignal(ref) {
    const [n, setN] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setN((x) => x + 1));
        ro.observe(el);
        return () => ro.disconnect();
    }, [ref]);

    return n;
}

const PulseTimeSeriesV1 = forwardRef(function PulseTimeSeriesV1(
    { rows, height = 360, recentPoints = 6, fullPoints = 52 },
    ref
) {
    const wrapRef = useRef(null);
    const svgRef = useRef(null);

    const resizeSignal = useResizeSignal(wrapRef);

    const [mode, setMode] = useState("recent"); // recent | full
    const [revealed, setRevealed] = useState(false);

    const uid = useId().replace(/:/g, "");
    const clipId = `pulseClip_${uid}`;
    const glowId = `pulseGlow_${uid}`;

    const parsed = useMemo(() => {
        const out = (rows || [])
            .map((r) => {
                const dt = toDateSafe(r.periodStart);
                if (!dt) return null;
                return {
                    dt,
                    introduced: Number(r.introduced ?? 0),
                    actioned: Number(r.actioned ?? 0),
                };
            })
            .filter(Boolean);

        out.sort((a, b) => +a.dt - +b.dt);
        return out;
    }, [rows]);

    useImperativeHandle(ref, () => ({
        reveal: () => setRevealed(true),
        zoomOut: () => setMode("full"),
        zoomIn: () => setMode("recent"),
    }));

    useEffect(() => {
        const wrap = wrapRef.current;
        const svgEl = svgRef.current;
        if (!wrap || !svgEl) return;

        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

        const W = Math.max(320, wrap.clientWidth || 900);
        const H = height;

        const margin = { top: 18, right: 18, bottom: 30, left: 52 };
        const innerW = W - margin.left - margin.right;
        const innerH = H - margin.top - margin.bottom;

        const svg = d3.select(svgEl);
        svg.attr("viewBox", `0 0 ${W} ${H}`);

        // Root groups
        let root = svg.select("g.__root");
        if (root.empty()) {
            root = svg.append("g").attr("class", "__root");
            root.append("g").attr("class", "band");
            root.append("g").attr("class", "grid");
            root.append("g").attr("class", "lines");
            root.append("g").attr("class", "markers");
            root.append("g").attr("class", "glow");
            root.append("g").attr("class", "axes");

            const defs = svg.append("defs");

            defs.append("clipPath").attr("id", clipId).append("rect").attr("class", "__clipRect");

            const f = defs.append("filter").attr("id", glowId);
            f.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "blur");
            f.append("feMerge")
                .selectAll("feMergeNode")
                .data(["blur", "SourceGraphic"])
                .enter()
                .append("feMergeNode")
                .attr("in", (d) => d);
        }

        svg
            .select(`#${clipId} rect.__clipRect`)
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", innerW)
            .attr("height", innerH);

        root.attr("transform", `translate(${margin.left},${margin.top})`);

        const dataFull = parsed || [];
        const full = dataFull.slice(Math.max(0, dataFull.length - fullPoints));
        const recent = full.slice(Math.max(0, full.length - recentPoints));
        const data = mode === "recent" ? recent : full;

        if (!data || data.length < 2) {
            // Clear if insufficient
            root.select("g.lines").selectAll("*").remove();
            root.select("g.glow").selectAll("*").remove();
            root.select("g.grid").selectAll("*").remove();
            root.select("g.band").selectAll("*").remove();
            root.select("g.markers").selectAll("*").remove();
            return;
        }

        const xDomain = d3.extent(data, (d) => d.dt);
        const yMax = d3.max(data, (d) => Math.max(d.introduced, d.actioned)) ?? 0;

        const x = d3.scaleUtc().domain(xDomain).range([0, innerW]);
        const y = d3
            .scaleLinear()
            .domain([0, Math.max(1, yMax) * 1.08])
            .nice()
            .range([innerH, 0]);

        const t = d3.transition().duration(reduce ? 0 : 650).ease(d3.easeCubicOut);

        // band: always show recent range even in full mode
        const bandG = root.select("g.band");
        bandG.selectAll("*").remove();
        if (recent.length >= 2) {
            const start = recent[0].dt;
            const end = recent[recent.length - 1].dt;

            bandG
                .append("rect")
                .attr("x", x(start))
                .attr("y", 0)
                .attr("width", Math.max(2, x(end) - x(start)))
                .attr("height", innerH)
                .attr("rx", 12)
                .attr("fill", "rgba(255,255,255,0.035)");
        }

        // grid
        const grid = root.select("g.grid");
        const yTicks = y.ticks(5);

        grid
            .selectAll("line")
            .data(yTicks, (d) => d)
            .join(
                (enter) => enter.append("line").attr("x1", 0).attr("x2", innerW),
                (update) => update,
                (exit) => exit.remove()
            )
            .transition(t)
            .attr("y1", (d) => y(d))
            .attr("y2", (d) => y(d))
            .attr("stroke", "rgba(255,255,255,0.08)");

        // axes
        const axes = root.select("g.axes");

        const xAxis = d3
            .axisBottom(x)
            .ticks(mode === "full" ? 10 : 6)
            .tickSizeOuter(0)
            .tickFormat((d) => d3.utcFormat("%b %d")(d));

        const yAxis = d3.axisLeft(y).ticks(5).tickSizeOuter(0).tickFormat(d3.format(","));

        let gx = axes.select("g.x");
        if (gx.empty()) gx = axes.append("g").attr("class", "x");
        gx.attr("transform", `translate(0,${innerH})`).transition(t).call(xAxis);

        let gy = axes.select("g.y");
        if (gy.empty()) gy = axes.append("g").attr("class", "y");
        gy.transition(t).call(yAxis);

        axes.selectAll(".domain").attr("stroke", "rgba(255,255,255,0.10)");
        axes.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.10)");
        axes
            .selectAll(".tick text")
            .attr("fill", "rgba(255,255,255,0.74)")
            .attr("font-size", 12);

        // series
        const series = [
            { key: "introduced", values: data.map((d) => ({ t: d.dt, v: d.introduced })) },
            { key: "actioned", values: data.map((d) => ({ t: d.dt, v: d.actioned })) },
        ];

        const strokeFor = (key) =>
            key === "introduced" ? "var(--c-series-a, #78A6FF)" : "var(--c-series-b, #9BE7C4)";
        const line = d3
            .line()
            .x((d) => x(d.t))
            .y((d) => y(d.v))
            .curve(d3.curveLinear);

        const linesG = root.select("g.lines").attr("clip-path", `url(#${clipId})`);
        const glowG = root.select("g.glow").attr("clip-path", `url(#${clipId})`);
        const markersG = root.select("g.markers").attr("clip-path", `url(#${clipId})`);

        // main lines
        const paths = linesG.selectAll("path.__line").data(series, (d) => d.key);

        const merged = paths.join(
            (enter) =>
                enter
                    .append("path")
                    .attr("class", "__line")
                    .attr("fill", "none")
                    .attr("stroke", (d) => strokeFor(d.key))
                    .attr("stroke-width", (d) => (d.key === "introduced" ? 2.6 : 2.4))
                    .attr("opacity", 0.96)
                    .attr("d", (d) => line(d.values)),
            (update) => update,
            (exit) => exit.remove()
        );

        merged.transition(t).attr("d", (d) => line(d.values));

        // glow overlay on recent region
        glowG.selectAll("*").remove();
        if (recent.length >= 2) {
            const glowSeries = [
                { key: "introduced", values: recent.map((d) => ({ t: d.dt, v: d.introduced })) },
                { key: "actioned", values: recent.map((d) => ({ t: d.dt, v: d.actioned })) },
            ];

            glowG
                .selectAll("path.__glow")
                .data(glowSeries, (d) => d.key)
                .enter()
                .append("path")
                .attr("class", "__glow")
                .attr("fill", "none")
                .attr("stroke", (d) => strokeFor(d.key))
                .attr("stroke-width", (d) => (d.key === "introduced" ? 3.6 : 3.2))
                .attr("opacity", mode === "full" ? 0.22 : 0.16)
                .attr("filter", `url(#${glowId})`)
                .attr("d", (d) => line(d.values));
        }

        // last-point markers (helps color/readability)
        markersG.selectAll("*").remove();
        const last = data[data.length - 1];
        if (last) {
            const pts = [
                { key: "introduced", x: x(last.dt), y: y(last.introduced) },
                { key: "actioned", x: x(last.dt), y: y(last.actioned) },
            ];

            markersG
                .selectAll("circle.__last")
                .data(pts, (d) => d.key)
                .enter()
                .append("circle")
                .attr("class", "__last")
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
                .attr("r", 4.2)
                .attr("fill", (d) => strokeFor(d.key))
                .attr("stroke", "rgba(10,12,16,0.85)")
                .attr("stroke-width", 1.4)
                .attr("opacity", 0.95);
        }

        // optional “draw” reveal (respects reduced motion)
        if (revealed && !reduce) {
            merged.each(function () {
                const node = this;
                const len = node.getTotalLength?.() ?? 0;
                const p = d3.select(node);

                p.interrupt();
                p.attr("stroke-dasharray", `${len} ${len}`)
                    .attr("stroke-dashoffset", len)
                    .transition()
                    .duration(850)
                    .ease(d3.easeCubicOut)
                    .attr("stroke-dashoffset", 0)
                    .on("end", () => {
                        p.attr("stroke-dasharray", null).attr("stroke-dashoffset", null);
                    });
            });
        }
    }, [parsed, height, mode, revealed, recentPoints, fullPoints, resizeSignal, clipId, glowId]);

    return (
        <div ref={wrapRef} className="pulse-ts">
            <svg ref={svgRef} className="pulse-ts__svg" />
        </div>
    );
});

export default PulseTimeSeriesV1;