"use client";

import { useMemo } from "react";

export default function ImpactTrendingScatterPanel({
    data = [],
    title = "Impact vs Trending",
    subtitle = "Where influence and momentum intersect",
}) {
    const maxImpact = useMemo(
        () => Math.max(...data.map(d => d.impact_score || 0), 1),
        [data]
    );

    const maxTrending = useMemo(
        () => Math.max(...data.map(d => d.trending_score || 0), 1),
        [data]
    );

    const width = 1000;
    const height = 420;
    const padding = 40;

    const scaleX = (v) =>
        padding + (v / maxTrending) * (width - padding * 2);

    const scaleY = (v) =>
        height - padding - (v / maxImpact) * (height - padding * 2);

    return (
        <section className="ll3-insightPanel">
            <header className="ll3-insightPanel__head">
                <h3 className="ll3-h3">{title}</h3>
                <p className="ll3-muted">{subtitle}</p>
            </header>

            <div className="ll3-scatterWrap">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="ll3-scatter"
                    role="img"
                >
                    {/* Axes */}
                    <line
                        x1={padding}
                        y1={height - padding}
                        x2={width - padding}
                        y2={height - padding}
                        className="ll3-axis"
                    />
                    <line
                        x1={padding}
                        y1={padding}
                        x2={padding}
                        y2={height - padding}
                        className="ll3-axis"
                    />

                    {/* Points */}
                    {data.map((d, i) => (
                        <circle
                            key={i}
                            cx={scaleX(d.trending_score)}
                            cy={scaleY(d.impact_score)}
                            r="5"
                            className="ll3-dot"
                        >
                            <title>
                                {d.display_title}
                                {"\n"}
                                Impact: {d.impact_score}
                                {"\n"}
                                Trending: {d.trending_score}
                            </title>
                        </circle>
                    ))}
                </svg>
            </div>

            <div className="ll3-scatterLegend">
                <div>↑ Impact</div>
                <div>→ Trending</div>
            </div>
        </section>
    );
}
