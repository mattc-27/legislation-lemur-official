"use client";

import { useMemo, useState, useEffect } from "react";

function submitClosestForm(el) {
    const form = el?.closest?.("form");
    if (!form) return;
    if (form.requestSubmit) form.requestSubmit();
    else form.submit();
}

export default function TypePillsClient({
    name = "type",
    value = null,      // array|string|null
    types = [],        // [{ bill_type, bill_count }]
    autoSubmit = false,
}) {
    const initial = useMemo(() => {
        if (!value) return [];
        if (Array.isArray(value)) return value.map(v => String(v).toLowerCase());
        return [String(value).toLowerCase()];
    }, [value]);

    const [selected, setSelected] = useState(initial);
    useEffect(() => setSelected(initial), [initial]);

    const toggle = (t, el) => {
        const key = String(t).toLowerCase();
        setSelected((prev) => {
            const next = prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key];
            if (autoSubmit) requestAnimationFrame(() => submitClosestForm(el));
            return next;
        });
    };

    const clear = (el) => {
        setSelected([]);
        if (autoSubmit) requestAnimationFrame(() => submitClosestForm(el));
    };

    return (
        <div className="ll3-pills" role="group" aria-label="Type">
            {/* ✅ robust GET param: single field, comma-separated */}
            {selected.length ? (
                <input type="hidden" name={name} value={selected.join(",")} />
            ) : null}

            <button
                type="button"
                className={`ll3-pill ${selected.length === 0 ? "is-active" : ""}`}
                onClick={(e) => clear(e.currentTarget)}
            >
                All
            </button>

            {types.map((t) => {
                const key = String(t.bill_type || "").toLowerCase();
                const on = selected.includes(key);
                return (
                    <button
                        key={key}
                        type="button"
                        className={`ll3-pill ${on ? "is-active" : ""}`}
                        onClick={(e) => toggle(key, e.currentTarget)}
                        aria-pressed={on ? "true" : "false"}
                        title={`${key.toUpperCase()} (${t.bill_count ?? 0})`}
                    >
                        {key.toUpperCase()}
                    </button>
                );
            })}
        </div>
    );
}
