"use client";

import { useState } from "react";
import CongressCompositionMap from "./CongressCompositionMap";
import HouseCompositionHemicycle from "./HouseCompositionHemicycle";

export default function CongressCompositionSection({ data }) {
    const [view, setView] = useState("map");

    return (
        <section className="ll3-refComposition">
            <div className="ll3-refComposition__head">
                <div>
                    <p className="ll3-eyebrow">Congress composition</p>
                    <h2>Current partisan balance</h2>
                    <p>
                        Explore congressional makeup by state or view the House as a chamber-level seat breakdown.
                    </p>
                </div>

                <div className="ll3-refComposition__toggle">
                    <button
                        type="button"
                        className={view === "map" ? "is-active" : ""}
                        onClick={() => setView("map")}
                    >
                        Map
                    </button>
                    <button
                        type="button"
                        className={view === "house" ? "is-active" : ""}
                        onClick={() => setView("house")}
                    >
                        House
                    </button>
                </div>
            </div>

            {view === "map" ? (
                <CongressCompositionMap states={data.states} />
            ) : (
                <HouseCompositionHemicycle house={data.house} states={data.states} />
            )}
        </section>
    );
}