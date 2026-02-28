// apps/web/app/components/features/insights/graphics/InsightsHeroGraphic.jsx
export default function InsightsHeroGraphic() {
    return (
        <svg
            className="ll3-hero-graphic"
            viewBox="0 0 900 520"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label=""
        >
            <defs>
                <radialGradient id="g_vignette" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(640 220) rotate(120) scale(460 540)">
                    <stop stopColor="white" stopOpacity="0.08" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="g_line" x1="0" y1="0" x2="900" y2="0">
                    <stop stopColor="white" stopOpacity="0.0" />
                    <stop offset="0.2" stopColor="white" stopOpacity="0.10" />
                    <stop offset="0.8" stopColor="white" stopOpacity="0.10" />
                    <stop offset="1" stopColor="white" stopOpacity="0.0" />
                </linearGradient>
            </defs>

            {/* LAYER: vignette (slow drift) */}
            <g data-layer="vignette">
                <rect x="0" y="0" width="900" height="520" fill="url(#g_vignette)" />
            </g>

            {/* LAYER: flow lines (draw + parallax) */}
            <g data-layer="flow" opacity="0.6">
                <path
                    data-stroke="flow"
                    d="M80 180 C170 130, 240 240, 330 190 C420 140, 480 240, 570 200 C660 160, 720 250, 820 205"
                    stroke="white"
                    strokeOpacity="0.12"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    data-stroke="flow"
                    d="M80 220 C160 180, 250 280, 340 230 C430 180, 480 270, 580 235 C680 200, 720 275, 820 245"
                    stroke="white"
                    strokeOpacity="0.10"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    data-stroke="flow"
                    d="M80 260 C170 220, 250 320, 350 270 C450 220, 510 310, 600 280 C690 255, 740 320, 820 290"
                    stroke="white"
                    strokeOpacity="0.08"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </g>

            {/* LAYER: baseline (draw in) */}
            <g data-layer="baseline">
                <path data-stroke="baseline" d="M70 360 H860" stroke="url(#g_line)" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* LAYER: lemur (fade + tiny float) */}
            <g data-layer="lemur" transform="translate(210 250)" opacity="0.92">
                <path
                    d="M75 90 C55 70, 52 45, 70 30 C92 12, 124 26, 126 55 C128 78, 112 98, 92 102 C86 103, 80 98, 75 90 Z"
                    fill="white"
                    fillOpacity="0.12"
                    stroke="white"
                    strokeOpacity="0.18"
                    strokeWidth="2"
                />
                <path
                    d="M110 40 C100 28, 104 14, 120 10 C140 6, 156 18, 154 34 C152 48, 136 56, 124 54 C118 53, 114 48, 110 40 Z"
                    fill="white"
                    fillOpacity="0.10"
                    stroke="white"
                    strokeOpacity="0.18"
                    strokeWidth="2"
                />
                <path
                    d="M55 78 C25 70, 18 48, 32 34 C54 12, 92 26, 88 46 C86 56, 74 60, 66 58"
                    stroke="white"
                    strokeOpacity="0.16"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                <path d="M62 104 H140" stroke="white" strokeOpacity="0.16" strokeWidth="2" strokeLinecap="round" />
            </g>
        </svg>
    );
}
