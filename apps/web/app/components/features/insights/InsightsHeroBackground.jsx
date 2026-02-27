// apps/web/app/components/features/insights/InsightsHeroBackground.jsx
"use client";

import { useMemo } from "react";

function mulberry32(seed) {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export default function InsightsHeroBackground({ seed = 202602, nodes = 26, links = 34 }) {
    const data = useMemo(() => {
        const rand = mulberry32(seed);

        const pts = Array.from({ length: nodes }).map(() => ({
            x: rand(),
            y: rand(),
            r: 0.9 + rand() * 1.6,
        }));

        const edges = [];
        for (let i = 0; i < pts.length; i++) {
            const a = pts[i];
            const candidates = pts
                .map((b, j) => {
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    return { j, d: dx * dx + dy * dy };
                })
                .filter((c) => c.j !== i)
                .sort((p, q) => p.d - q.d)
                .slice(0, 3 + Math.floor(rand() * 2));

            candidates.forEach((c) => {
                if (edges.length < links) edges.push([i, c.j]);
            });
        }

        return { pts, edges };
    }, [seed, nodes, links]);

    return (
        <svg className="insights-hero-bg" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="llHeroFade" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopOpacity="0.8" />
                    <stop offset="100%" stopOpacity="0.2" />
                </linearGradient>

                <filter id="llGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <rect x="0" y="0" width="1000" height="700" className="insights-hero-bg__wash" />

            <g className="insights-hero-bg__layer is-far">
                {data.edges.map(([i, j], idx) => {
                    const a = data.pts[i];
                    const b = data.pts[j];
                    return (
                        <line
                            key={`f-${idx}`}
                            x1={a.x * 1000}
                            y1={a.y * 700}
                            x2={b.x * 1000}
                            y2={b.y * 700}
                            className="insights-hero-bg__line"
                        />
                    );
                })}
            </g>

            <g className="insights-hero-bg__layer is-near" filter="url(#llGlow)">
                {data.edges.slice(0, Math.floor(data.edges.length * 0.7)).map(([i, j], idx) => {
                    const a = data.pts[i];
                    const b = data.pts[j];
                    return (
                        <line
                            key={`n-${idx}`}
                            x1={a.x * 1000}
                            y1={a.y * 700}
                            x2={b.x * 1000}
                            y2={b.y * 700}
                            className="insights-hero-bg__line is-near"
                        />
                    );
                })}

                {data.pts.map((p, idx) => (
                    <circle
                        key={`c-${idx}`}
                        cx={p.x * 1000}
                        cy={p.y * 700}
                        r={p.r}
                        className="insights-hero-bg__node"
                    />
                ))}
            </g>

            <rect x="0" y="0" width="1000" height="700" fill="url(#llHeroFade)" />
        </svg>
    );
}