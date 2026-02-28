"use client";

import { useEffect, useMemo, useState } from "react";

function submitClosestForm(el) {
    const form = el?.closest?.("form");
    if (!form) return;
    if (form.requestSubmit) form.requestSubmit();
    else form.submit();
}

export default function ChamberToggleClient({
    id = "chamber",
    name = "chamber",
    defaultValue = "", // "" | "House" | "Senate"
    autoSubmit = true,
}) {
    const initial = useMemo(() => {
        const v = String(defaultValue || "");
        return {
            house: v === "House",
            senate: v === "Senate",
        };
    }, [defaultValue]);

    const [house, setHouse] = useState(initial.house);
    const [senate, setSenate] = useState(initial.senate);

    useEffect(() => {
        setHouse(initial.house);
        setSenate(initial.senate);
    }, [initial.house, initial.senate]);

    const computed = useMemo(() => {
        // both or none => All
        if ((house && senate) || (!house && !senate)) return "";
        return house ? "House" : "Senate";
    }, [house, senate]);

    function toggle(which, el) {
        if (which === "house") setHouse((v) => !v);
        if (which === "senate") setSenate((v) => !v);

        if (autoSubmit) {
            // allow state to update first
            requestAnimationFrame(() => submitClosestForm(el));
        }
    }

    function setAll(el) {
        setHouse(false);
        setSenate(false);
        if (autoSubmit) requestAnimationFrame(() => submitClosestForm(el));
    }

    return (
        <div className="ll3-seg" role="group" aria-label="Chamber" id={id}>
            {/* Hidden actual query field (single-valued) */}
            <input type="hidden" name={name} value={computed} />

            <button
                type="button"
                className={`ll3-pill ${computed === "" ? "is-active" : ""}`}
                onClick={(e) => setAll(e.currentTarget)}
            >
                All
            </button>

            <button
                type="button"
                className={`ll3-pill ${house ? "is-active" : ""}`}
                aria-pressed={house ? "true" : "false"}
                onClick={(e) => toggle("house", e.currentTarget)}
            >
                House
            </button>

            <button
                type="button"
                className={`ll3-pill ${senate ? "is-active" : ""}`}
                aria-pressed={senate ? "true" : "false"}
                onClick={(e) => toggle("senate", e.currentTarget)}
            >
                Senate
            </button>
        </div>
    );
}
