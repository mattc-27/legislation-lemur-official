"use client";

import { useEffect, useState } from "react";

export default function DensityToggleClient() {
    const [density, setDensity] = useState("comfortable");

    useEffect(() => {
        const v = window.localStorage.getItem("ll3_density");
        if (v === "compact" || v === "comfortable") setDensity(v);
    }, []);

    useEffect(() => {
        document.documentElement.dataset.ll3Density = density; // html[data-ll3-density]
        window.localStorage.setItem("ll3_density", density);
    }, [density]);

    return (
        <div className="ll3-density" role="group" aria-label="Density">
            <button
                type="button"
                className={`ll3-chipbtn ${density === "comfortable" ? "is-active" : ""}`}
                onClick={() => setDensity("comfortable")}
            >
                Comfortable
            </button>
            <button
                type="button"
                className={`ll3-chipbtn ${density === "compact" ? "is-active" : ""}`}
                onClick={() => setDensity("compact")}
            >
                Compact
            </button>
        </div>
    );
}
