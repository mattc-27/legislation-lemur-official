// components/.../TopicDonut.jsx
import { useState, useMemo } from "react";

const PALETTE = ["#6366F1", "#22C55E", "#F59E0B", "#06B6D4", "#F43F5E", "#10B981", "#A78BFA", "#FB7185"];

function normLabel(x) {
    if (typeof x === "string") return x;
    if (x && typeof x === "object") return String(x.name || x.title || x.subject || "Uncategorized");
    return "Uncategorized";
}

export default function TopicDonut({ data, groups = [], onSelectTopic }) {
    const rows = useMemo(() => {
        if (Array.isArray(data) && data.length) {
            return data
                .map(d => ({ label: normLabel(d.label), value: Number(d.value) || 0 }))
                .filter(r => r.value > 0);
        }

        const g = Array.isArray(groups) ? groups : [];
        const map = new Map();
        for (const group of g) {
            const key = normLabel(group?.subject);
            const inc = Array.isArray(group?.items) ? group.items.length : Number(group?.count) || 0;
            map.set(key, (map.get(key) || 0) + inc);
        }
        return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    }, [data, groups]);

    const total = rows.reduce((n, r) => n + r.value, 0);
    const annotated = rows
        .slice()
        .sort((a, b) => b.value - a.value)
        .map(r => ({ ...r, pct: total ? Math.round((r.value / total) * 100) : 0 }));

    // NEW: legend expand/collapse
    const [showAllLegend, setShowAllLegend] = useState(false);
    const legendRows = showAllLegend ? annotated : annotated.slice(0, 6);
    const remaining = annotated.length - legendRows.length;

    const R = 44;
    const C = 2 * Math.PI * R;
    const GAP = 0.8;
    let offset = 0;

    return (
        <div className="viz viz--donut" role="group" aria-label="Topic mix">
            <div className="viz__title">Topic mix</div>

            <div className="viz-donut__body">
                <div className="viz-donut__chart">
                    <svg
                        className="viz-donut__svg"
                        viewBox="0 0 120 120"
                        aria-hidden="true"
                    >
                        <g transform="translate(60,60)">
                            <circle r={R} fill="none" stroke="#E5E7EB" strokeWidth="16" />
                            {annotated.map((r, i) => {
                                const seg = total ? (r.value / total) * C : 0;
                                const visible = Math.max(seg - GAP, 0);
                                const dasharray = `${visible} ${C - visible}`;
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
                                        stroke={PALETTE[i % PALETTE.length]}
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
                            <text x="0" y="6" textAnchor="middle" fontWeight="600" fontSize="14">
                                {total}
                            </text>
                        </g>
                    </svg>

                </div>

                <ul className="viz__legend">
                    {legendRows.map((r, i) => (
                        <li
                            key={`${r.label}-lg-${i}`}
                            className="viz__legend-item"
                            role="button"
                            tabIndex={0}
                            onClick={() => onSelectTopic?.(r.label)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onSelectTopic?.(r.label);
                                }
                            }}
                        >
                            <span className="viz__legend-label">
                                <i
                                    className="viz__legend-swatch"
                                    style={{ background: PALETTE[i % PALETTE.length] }}
                                />
                                {r.label}
                            </span>
                            <span className="muted">{r.pct}%</span>
                        </li>
                    ))}

                    {remaining > 0 && (
                        <li>
                            <button
                                type="button"
                                className="viz__legend-more"
                                onClick={() => setShowAllLegend((v) => !v)}
                            >
                                {showAllLegend ? "Show fewer" : `+${remaining} more`}
                            </button>
                        </li>
                    )}
                </ul>
            </div>

            <div className="viz__hint">Click a slice to filter the table.</div>
        </div>
    );
}
