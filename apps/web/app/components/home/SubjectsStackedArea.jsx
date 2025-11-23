"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

/**
 * props.rows: [{ month, subject_name, bills_count }]
 *   - month will be serialized as an ISO string (e.g., "2025-01-01T00:00:00.000Z")
 * props.subjects: string[]
 */
export default function SubjectsStackedArea({
    rows,
    subjects,
    height = 260,
}) {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(600);

    // Responsive width via ResizeObserver
    useEffect(() => {
        if (!containerRef.current) return;

        const el = containerRef.current;
        const resize = () => {
            const bounds = el.getBoundingClientRect();
            if (bounds.width > 0) {
                setWidth(bounds.width);
            }
        };

        resize();

        const observer = new ResizeObserver(resize);
        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    const {
        stackedSeries,
        xScale,
        yScale,
        xTicks,
        colorScale,
        areaGenerator,
    } = useMemo(() => {
        if (!rows?.length || !subjects?.length || width <= 0) {
            return {};
        }

        // Normalize month -> Date at first-of-month
        const normalizeMonth = val => {
            let d;
            if (val instanceof Date) d = val;
            else d = new Date(val); // handles ISO strings like "2025-01-01T00:00:00.000Z"

            if (Number.isNaN(d.getTime())) return null;
            return new Date(d.getFullYear(), d.getMonth(), 1);
        };

        // Unique months as Date objects, sorted
        const monthTimes = Array.from(
            new Set(
                rows
                    .map(r => normalizeMonth(r.month))
                    .filter(Boolean)
                    .map(d => d.getTime()),
            ),
        ).sort((a, b) => a - b);

        const months = monthTimes.map(t => new Date(t));
        if (!months.length) {
            return {};
        }

        // Map month+subject -> count
        const valueMap = new Map();
        rows.forEach(r => {
            const d = normalizeMonth(r.month);
            if (!d) return;
            const key = `${d.getTime()}::${r.subject_name}`;
            valueMap.set(key, Number(r.bills_count) || 0);
        });

        // Build stacked input: [{ date, SubjectA: n, SubjectB: m, ... }]
        const stackedInput = months.map(date => {
            const rowObj = { date };
            subjects.forEach(subj => {
                const key = `${date.getTime()}::${subj}`;
                rowObj[subj] = valueMap.get(key) ?? 0;
            });
            return rowObj;
        });

        const margin = { top: 10, right: 16, bottom: 28, left: 40 };

        const xScale = d3
            .scaleTime()
            .domain(d3.extent(stackedInput, d => d.date))
            .range([margin.left, width - margin.right]);

        const yMax = d3.max(stackedInput, d =>
            subjects.reduce((sum, subj) => sum + (d[subj] || 0), 0),
        );

        const yScale = d3
            .scaleLinear()
            .domain([0, yMax || 1])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const colorPalette = [
            "#5B8FF9",
            "#61DDAA",
            "#65789B",
            "#F6BD16",
            "#7262FD",
            "#78D3F8",
            "#9661BC",
            "#F6903D",
            "#E86452",
            "#6DC8EC",
        ];

        const colorScale = d3
            .scaleOrdinal()
            .domain(subjects)
            .range(colorPalette.slice(0, subjects.length));

        const stack = d3
            .stack()
            .keys(subjects)
            .value((d, key) => d[key] || 0)
            .order(d3.stackOrderNone); // offset defaults to "none"

        const stackedSeries = stack(stackedInput);

        const areaGenerator = d3
            .area()
            .x(d => xScale(d.data.date))
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]))
            .curve(d3.curveMonotoneX);

        const xTicks = xScale.ticks(6);

        return {
            stackedSeries,
            xScale,
            yScale,
            xTicks,
            colorScale,
            areaGenerator,
        };
    }, [rows, subjects, width, height]);

    if (!stackedSeries || !width) {
        return <div ref={containerRef} className="subjects-chart__container" />;
    }

    return (
        <div ref={containerRef} className="subjects-chart__container">
            <svg
                className="subjects-chart__svg"
                width={width}
                height={height}
                role="img"
                aria-label="Stacked area chart of bill subjects over time"
            >
                {/* Areas */}
                <g className="subjects-chart__areas">
                    {stackedSeries.map(serie => (
                        <path
                            key={serie.key}
                            d={areaGenerator(serie)}
                            fill={colorScale(serie.key)}
                            fillOpacity={0.85}
                            stroke="none"
                        />
                    ))}
                </g>

                {/* X axis */}
                <g className="subjects-chart__axis subjects-chart__axis--x">
                    {xTicks.map(t => (
                        <g key={t.getTime()} transform={`translate(${xScale(t)}, 0)`}>
                            <line
                                y1={height - 28}
                                y2={height - 24}
                                className="subjects-chart__tick-line"
                            />
                            <text y={height - 12} className="subjects-chart__tick-label">
                                {d3.timeFormat("%b")(t)}
                            </text>
                        </g>
                    ))}
                </g>

                {/* Y axis (grid + 0/peak) */}
                <g className="subjects-chart__axis subjects-chart__axis--y">
                    {yScale.ticks(3).map(val => (
                        <g key={val} transform={`translate(0, ${yScale(val)})`}>
                            <line
                                x1={40}
                                x2={width - 16}
                                className="subjects-chart__grid-line"
                            />
                            <text
                                x={32}
                                dy="0.32em"
                                className="subjects-chart__tick-label subjects-chart__tick-label--y"
                            >
                                {val}
                            </text>
                        </g>
                    ))}
                </g>
            </svg>

            {/* Legend */}
            <div className="subjects-chart__legend">
                {subjects.map(subj => (
                    <div key={subj} className="subjects-chart__legend-item">
                        <span
                            className="subjects-chart__legend-swatch"
                            style={{ backgroundColor: colorScale(subj) }}
                        />
                        <span className="subjects-chart__legend-label">{subj}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
