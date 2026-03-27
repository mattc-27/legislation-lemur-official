import { useState, useMemo, useEffect } from "react";
import {
    getTopicMeta,
    getTopicColor,
    normalizeTopicLabel,
} from "@/lib/utils/member-info-topics";

export default function TopicDonut({ data, groups = [], onSelectTopic }) {
    const rows = useMemo(() => {
        if (Array.isArray(data) && data.length) {
            return data
                .map((d) => ({
                    label: normalizeTopicLabel(d?.label),
                    value: Number(d?.value) || 0,
                }))
                .filter((r) => r.value > 0);
        }

        const g = Array.isArray(groups) ? groups : [];
        const map = new Map();

        for (const group of g) {
            const key = normalizeTopicLabel(group?.subject);
            const inc = Array.isArray(group?.items) ? group.items.length : Number(group?.count) || 0;
            map.set(key, (map.get(key) || 0) + inc);
        }

        return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    }, [data, groups]);

    const total = rows.reduce((n, r) => n + r.value, 0);

    const annotated = rows
        .slice()
        .sort((a, b) => b.value - a.value)
        .map((r) => ({
            ...r,
            pct: total ? Math.round((r.value / total) * 100) : 0,
        }));

    const [showAllLegend, setShowAllLegend] = useState(false);
    const [legendDefaultCount, setLegendDefaultCount] = useState(5);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mq = window.matchMedia("(min-width: 641px)");
        const apply = () => setLegendDefaultCount(mq.matches ? 5 : 5);

        apply();

        if (mq.addEventListener) {
            mq.addEventListener("change", apply);
            return () => mq.removeEventListener("change", apply);
        }

        mq.addListener(apply);
        return () => mq.removeListener(apply);
    }, []);

    const legendRows = showAllLegend ? annotated : annotated.slice(0, legendDefaultCount);
    const remaining = Math.max(0, annotated.length - legendRows.length);

    const R = 44;
    const C = 2 * Math.PI * R;
    const GAP = 0.8;
    let offset = 0;

    return (
        <div className="viz viz--donut" role="group" aria-label="Topic mix">
            <div className="viz__title">Topic mix</div>

            <div className="viz-donut__body">
                <div className="viz-donut__chart">
                    <svg className="viz-donut__svg" viewBox="0 0 120 120" aria-hidden="true">
                        <g transform="translate(60,60)">
                            <circle r={R} fill="none" stroke="#E5E7EB" strokeWidth="16" />
                            {annotated.map((r, i) => {
                                const seg = total ? (r.value / total) * C : 0;
                                const visible = Math.max(seg - GAP, 0);
                                const dasharray = `${visible} ${C - visible}`;
                                const color = getTopicColor(i);

                                const el = (
                                    <circle
                                        key={`${r.label}-${i}`}
                                        r={R}
                                        fill="none"
                                        strokeWidth="16"
                                        strokeLinecap="butt"
                                        strokeLinejoin="round"
                                        strokeDasharray={dasharray}
                                        strokeDashoffset={-offset}
                                        stroke={color}
                                        transform="rotate(-90)"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => onSelectTopic?.(r.label)}
                                    >
                                        <title>{`${r.label}: ${r.value} (${r.pct}%)`}</title>
                                    </circle>
                                );

                                offset += seg;
                                return el;
                            })}
                            <text x="0" y="6" textAnchor="middle" fontWeight="650" fontSize="14">
                                {total}
                            </text>
                        </g>
                    </svg>
                </div>

                <ul className="viz__legend">
                    {legendRows.map((r, i) => {
                        const topicMeta = getTopicMeta(r.label);
                        const Icon = topicMeta.icon;
                        const color = getTopicColor(i);

                        return (
                            <li
                                key={`${r.label}-lg-${i}`}
                                className="viz__legend-item viz__legend-item--plain"
                                role="button"
                                tabIndex={0}
                                onClick={() => onSelectTopic?.(r.label)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        onSelectTopic?.(r.label);
                                    }
                                }}
                                title={r.label}
                            >
                                <span className="viz__legend-label">
                                    <Icon
                                        className="viz__legend-icon"
                                        size={14}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                        style={{ color }}
                                    />
                                    {topicMeta.short}
                                </span>
                                <span className="muted">{r.pct}%</span>
                            </li>
                        );
                    })}

                    {annotated.length > legendDefaultCount && (
                        <li className="viz__legendToggleRow">
                            <button
                                type="button"
                                className="viz__legend-more"
                                onClick={() => setShowAllLegend((v) => !v)}
                                aria-expanded={showAllLegend}
                            >
                                {showAllLegend ? "Show fewer" : `Show ${remaining} more`}
                            </button>
                        </li>
                    )}
                </ul>
            </div>

            <div className="viz__hint">Click a slice or topic to filter the bill list.</div>
        </div>
    );
}