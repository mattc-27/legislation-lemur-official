"use client";

import { useMemo } from "react";

function submitClosestForm(el) {
    const form = el?.closest?.("form");
    if (!form) return;
    // requestSubmit is best; fallback to submit()
    if (form.requestSubmit) form.requestSubmit();
    else form.submit();
}

export default function TypePillsClient({
    name = "type",
    value = "",
    types = [], // [{ bill_type, bill_count }]
    includeAll = true,
}) {
    const list = useMemo(() => {
        // normalize: ensure bill_type is lowercase-ish for value matching
        return (types || [])
            .filter((t) => t?.bill_type)
            .map((t) => ({
                bill_type: String(t.bill_type).toLowerCase(),
                bill_count: Number(t.bill_count ?? 0),
            }));
    }, [types]);

    const current = String(value || "").toLowerCase();

    return (
        <div className="ll3-chipset" role="radiogroup" aria-label="Bill type">
            {includeAll ? (
                <label className={`ll3-chip ${!current ? "is-active" : ""}`}>
                    <input
                        type="radio"
                        name={name}
                        value=""
                        defaultChecked={!current}
                        onChange={(e) => submitClosestForm(e.currentTarget)}
                    />
                    All
                </label>
            ) : null}

            {list.map((t) => (
                <label key={t.bill_type} className={`ll3-chip ${current === t.bill_type ? "is-active" : ""}`}>
                    <input
                        type="radio"
                        name={name}
                        value={t.bill_type}
                        defaultChecked={current === t.bill_type}
                        onChange={(e) => submitClosestForm(e.currentTarget)}
                    />
                    {t.bill_type.toUpperCase()}
                </label>
            ))}
        </div>
    );
}
