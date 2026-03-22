import { useState, useMemo, useEffect } from "react";
import {
    AlertTriangle,
    Banknote,
    BookOpen,
    Briefcase,
    Building2,
    Car,
    DollarSign,
    Feather,
    Flag,
    Gavel,
    Globe,
    GraduationCap,
    HandHeart,
    HeartPulse,
    Landmark,
    Leaf,
    Megaphone,
    PawPrint,
    Scale,
    Shield,
    Sprout,
    Tractor,
    Trees,
    Users,
    Waves,
} from "lucide-react";

const PALETTE = ["#6366F1", "#22C55E", "#F59E0B", "#06B6D4", "#F43F5E", "#10B981", "#A78BFA", "#FB7185"];

const TOPIC_META = {
    "Agriculture and Food": { short: "Ag & food", icon: Tractor },
    Animals: { short: "Animals", icon: PawPrint },
    "Armed Forces and National Security": { short: "Defense", icon: Shield },
    "Arts, Culture, Religion": { short: "Arts & culture", icon: Feather },
    "Civil Rights and Liberties, Minority Issues": { short: "Civil rights", icon: Scale },
    Commerce: { short: "Commerce", icon: Briefcase },
    Congress: { short: "Congress", icon: Landmark },
    "Crime and Law Enforcement": { short: "Crime", icon: Gavel },
    "Economics and Public Finance": { short: "Econ & finance", icon: DollarSign },
    Education: { short: "Education", icon: GraduationCap },
    Energy: { short: "Energy", icon: AlertTriangle },
    "Environmental Protection": { short: "Environment", icon: Leaf },
    Families: { short: "Families", icon: Users },
    "Finance and Financial Sector": { short: "Finance", icon: Banknote },
    "Foreign Trade and International Finance": { short: "Trade", icon: Globe },
    "Government Operations and Politics": { short: "Gov ops", icon: Building2 },
    Health: { short: "Health", icon: HeartPulse },
    Immigration: { short: "Immigration", icon: Flag },
    "International Affairs": { short: "Intl affairs", icon: Globe },
    "Labor and Employment": { short: "Labor", icon: Briefcase },
    "Native Americans": { short: "Native affairs", icon: Sprout },
    "Public Lands and Natural Resources": { short: "Public lands", icon: Trees },
    "Science, Technology, Communications": { short: "Sci / tech", icon: Megaphone },
    "Social Welfare": { short: "Social welfare", icon: HandHeart },
    Taxation: { short: "Taxation", icon: BookOpen },
    "Transportation and Public Works": { short: "Transport", icon: Car },
    Uncategorized: { short: "Other", icon: Waves },
};

function normLabel(x) {
    if (typeof x === "string") return x;
    if (x && typeof x === "object") return String(x.name || x.title || x.subject || "Uncategorized");
    return "Uncategorized";
}

function getTopicMeta(label = "") {
    return TOPIC_META[label] || { short: label || "Other", icon: BookOpen };
}

export default function TopicDonut({ data, groups = [], onSelectTopic }) {
    const rows = useMemo(() => {
        if (Array.isArray(data) && data.length) {
            return data
                .map((d) => ({ label: normLabel(d.label), value: Number(d.value) || 0 }))
                .filter((r) => r.value > 0);
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
        .map((r) => ({ ...r, pct: total ? Math.round((r.value / total) * 100) : 0 }));

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
                        const color = PALETTE[i % PALETTE.length];

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