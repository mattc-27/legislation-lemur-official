"use client";

import { useEffect, useMemo, useState } from "react";

export default function ResizableSelectClient({
    id,
    name,
    options = [], // [{ value, label }] OR [{ committee_system_code, committee_name, bill_count }]
    defaultValue = [],
    placeholder = "Select…",
    minRows = 2,
    maxRows = 12,
    rowsStep = 2,
    className = "ll3-input",
    hint = "Tip: hold ⌘/Ctrl to select multiple.",
    // map helpers (optional)
    getValue,
    getLabel,
}) {
    const normalizeDefault = useMemo(() => {
        if (Array.isArray(defaultValue)) return defaultValue.map(String);
        if (defaultValue == null) return [];
        return [String(defaultValue)];
    }, [defaultValue]);

    const [rows] = useState(() => Math.min(Math.max(minRows, 7), maxRows));

    const [value, setValue] = useState(normalizeDefault);

    // Keep internal state in sync if defaultValue changes (rare, but safe)
    useEffect(() => {
        setValue(normalizeDefault);
    }, [normalizeDefault]);

    const optValue = (o) => {
        if (getValue) return String(getValue(o) ?? "");
        return String(o.value ?? o.committee_system_code ?? "");
    };

    const optLabel = (o) => {
        if (getLabel) return String(getLabel(o) ?? "");
        // committee dictionary shape
        if (o.committee_name) {
            const c = o.bill_count != null ? ` (${o.bill_count})` : "";
            return `${o.committee_name}${c}`;
        }
        // generic shape
        return String(o.label ?? o.value ?? "");
    };

    return (
        <div className="ll3-resize">
            <div className="ll3-resize__top">
                <div className="ll3-resize__hint">{hint}</div>

                {/* 
              
                <div className="ll3-resize__controls" aria-label="Resize controls">
                    <button
                        type="button"
                        className="ll3-resize__btn"
                        onClick={() => setRows((r) => Math.max(minRows, r - rowsStep))}
                        aria-label="Show fewer rows"
                    >
                        −
                    </button>
                    <button
                        type="button"
                        className="ll3-resize__btn"
                        onClick={() => setRows((r) => Math.min(maxRows, r + rowsStep))}
                        aria-label="Show more rows"
                    >
                        +
                    </button>
                </div>
                
                */}
            </div>

            <select
                id={id}
                name={name}
                multiple
                value={value}
                onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                    setValue(selected);
                }}
                size={rows}
                className={`${className} ll3-resize__select`}
            >
                {options.length === 0 ? (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                ) : (
                    options.map((o, idx) => (
                        <option key={`${optValue(o)}-${idx}`} value={optValue(o)}>
                            {optLabel(o)}
                        </option>
                    ))
                )}
            </select>
        </div>
    );
}
