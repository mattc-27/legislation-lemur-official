"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

export default function BillActivityChart({ data = [] }) {
    const ref = useRef(null);
    const [size, setSize] = useState({ w: 0, h: 200 });

    const ds = useMemo(() => {
        const parse = (d) => ({
            week: new Date(d.week),
            introduced: +d.introduced || 0,
            actions: +d.actions || 0,
        });
        return (data || []).map(parse).filter((d) => !Number.isNaN(d.week.getTime()));
    }, [data]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const ro = new ResizeObserver((entries) => {
            for (const e of entries) {
                const w = Math.max(260, Math.floor(e.contentRect.width || 0));
                setSize({ w, h: 200 });
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.innerHTML = "";

        const w = size.w || el.clientWidth || 640;
        const h = size.h || 200;

        const m = { top: 18, right: 18, bottom: 30, left: 34 };
        const innerW = w - m.left - m.right;
        const innerH = h - m.top - m.bottom;

        const svg = d3.select(el).append("svg").attr("width", w).attr("height", h);
        const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

        if (!ds.length) {
            g.append("text")
                .attr("x", 0)
                .attr("y", 16)
                .attr("class", "ll3-chart__empty")
                .text("No activity data.");
            return;
        }

        const x = d3.scaleTime().domain(d3.extent(ds, (d) => d.week)).range([0, innerW]);
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(ds, (d) => Math.max(d.introduced, d.actions)) || 1])
            .nice()
            .range([innerH, 0]);

        // gridlines
        g.append("g")
            .attr("class", "ll3-chart__grid")
            .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat(""))
            .selectAll("line")
            .attr("class", "ll3-chart__gridline");

        const lineIntro = d3
            .line()
            .curve(d3.curveMonotoneX)
            .x((d) => x(d.week))
            .y((d) => y(d.introduced));

        const lineActs = d3
            .line()
            .curve(d3.curveMonotoneX)
            .x((d) => x(d.week))
            .y((d) => y(d.actions));

        g.append("path").datum(ds).attr("class", "ll3-chart__line ll3-chart__line--intro").attr("d", lineIntro);
        g.append("path").datum(ds).attr("class", "ll3-chart__line ll3-chart__line--acts").attr("d", lineActs);

        const ax = d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%b %d"));
        const ay = d3.axisLeft(y).ticks(4);

        g.append("g").attr("transform", `translate(0,${innerH})`).attr("class", "ll3-chart__axis").call(ax);
        g.append("g").attr("class", "ll3-chart__axis").call(ay);

        // legend
        const legend = svg.append("g").attr("transform", `translate(${m.left},8)`);
        legend.append("circle").attr("r", 4).attr("class", "ll3-chart__dot ll3-chart__dot--intro");
        legend.append("text").attr("x", 10).attr("y", 4).attr("class", "ll3-chart__legend").text("Introduced");
        legend.append("circle").attr("cx", 120).attr("r", 4).attr("class", "ll3-chart__dot ll3-chart__dot--acts");
        legend.append("text").attr("x", 130).attr("y", 4).attr("class", "ll3-chart__legend").text("Actions");

        // hover layer
        const fmt = d3.timeFormat("%Y-%m-%d");
        const bisect = d3.bisector((d) => d.week).left;

        const hover = g.append("g").attr("class", "ll3-chart__hover").style("display", "none");
        hover.append("line").attr("class", "ll3-chart__hoverline").attr("y1", 0).attr("y2", innerH);

        const dotIntro = hover.append("circle").attr("r", 4).attr("class", "ll3-chart__hoverdot ll3-chart__hoverdot--intro");
        const dotActs = hover.append("circle").attr("r", 4).attr("class", "ll3-chart__hoverdot ll3-chart__hoverdot--acts");

        const tip = d3.select(el).append("div").attr("class", "ll3-chart__tip").style("display", "none");

        const overlay = g
            .append("rect")
            .attr("class", "ll3-chart__overlay")
            .attr("width", innerW)
            .attr("height", innerH)
            .attr("fill", "transparent")
            .on("mouseenter", () => {
                hover.style("display", null);
                tip.style("display", null);
            })
            .on("mouseleave", () => {
                hover.style("display", "none");
                tip.style("display", "none");
            })
            .on("mousemove", (event) => {
                const [mx] = d3.pointer(event);
                const xDate = x.invert(mx);
                const i = bisect(ds, xDate);
                const d0 = ds[Math.max(0, i - 1)];
                const d1 = ds[Math.min(ds.length - 1, i)];
                const d = !d0 ? d1 : !d1 ? d0 : xDate - d0.week > d1.week - xDate ? d1 : d0;

                const cx = x(d.week);
                hover.select("line").attr("x1", cx).attr("x2", cx);
                dotIntro.attr("cx", cx).attr("cy", y(d.introduced));
                dotActs.attr("cx", cx).attr("cy", y(d.actions));

                tip
                    .html(
                        `<div class="ll3-chart__tipdate">${fmt(d.week)}</div>
             <div class="ll3-chart__tiplines">
               <div><span class="swatch swatch--intro"></span> Introduced: <strong>${d.introduced}</strong></div>
               <div><span class="swatch swatch--acts"></span> Actions: <strong>${d.actions}</strong></div>
             </div>`
                    )
                    .style("left", `${m.left + cx + 10}px`)
                    .style("top", `${m.top + 22}px`);
            });

        return () => {
            overlay.on("mouseenter", null).on("mouseleave", null).on("mousemove", null);
        };
    }, [ds, size]);

    return <div ref={ref} className="ll3-chart" />;
}