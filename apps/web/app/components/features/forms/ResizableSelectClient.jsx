"use client";

import { useEffect, useMemo, useState } from "react";

export default function ResizableSelectClient({
    id,
    name,
    options = [],
    defaultValue = [],
    placeholder = "Select…",
    minRows = 2,
    maxRows = 12,
    className = "ll3-multiSelect",
    hint = "Tip: hold ⌘/Ctrl to select multiple.",
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

    useEffect(() => {
        setValue(normalizeDefault);
    }, [normalizeDefault]);

    const optValue = (o) => {
        if (getValue) return String(getValue(o) ?? "");
        return String(o.value ?? o.committee_system_code ?? "");
    };

    const optLabel = (o) => {
        if (getLabel) return String(getLabel(o) ?? "");

        if (o.committee_name) {
            const c = o.bill_count != null ? ` (${o.bill_count})` : "";
            return `${o.committee_name}${c}`;
        }

        return String(o.label ?? o.value ?? "");
    };

    return (
        <div className="ll3-multiSelectBox">
            {hint ? (
                <div className="ll3-multiSelectBox__top">
                    <div className="ll3-multiSelectBox__hint">{hint}</div>
                </div>
            ) : null}

            <select
                id={id}
                name={name}
                multiple
                value={value}
                onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(
                        (o) => o.value
                    );
                    setValue(selected);
                }}
                size={rows}
                className={`${className} ll3-multiSelectBox__control`}
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