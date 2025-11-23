// components/home/SubjectsTrendPanel.jsx
"use client";

import { useState, useMemo } from "react";
import SubjectsStackedArea from "./SubjectsStackedArea";
import "../../../lib/stylesheets/refactored/subject-trend.refactored.css";
import "../../../lib/stylesheets/refactored/ui-controls.css";

const WINDOW_OPTIONS = [
    { id: "session", label: "Session 1" },
    { id: "6mo", label: "Last 6 months" },
    { id: "30d", label: "Last 30 days" },
    { id: "7d", label: "Last 7 days" },
];

export default function SubjectsTrendPanel({ subjects, rows }) {
    const [windowId, setWindowId] = useState("session");

    const filteredRows = useMemo(() => {
        if (!rows?.length) return [];

        // Normalize months and find unique month buckets in the data
        const monthTimes = Array.from(
            new Set(
                rows
                    .map(r => {
                        const d = new Date(r.month);
                        if (Number.isNaN(d.getTime())) return null;
                        return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
                    })
                    .filter(Boolean),
            ),
        ).sort((a, b) => a - b);

        const monthDates = monthTimes.map(t => new Date(t));
        if (!monthDates.length) return [];

        const lastMonth = monthDates[monthDates.length - 1];

        let startDate = null;

        if (windowId === "session") {
            // Full data set for this session
            return rows;
        }

        if (windowId === "6mo") {
            const idx = Math.max(0, monthDates.length - 6);
            startDate = monthDates[idx];
        } else if (windowId === "30d") {
            // Approx: last month of data
            startDate = lastMonth;
        } else if (windowId === "7d") {
            // Approx: also last month of data (MV is monthly)
            startDate = lastMonth;
        } else {
            return rows;
        }

        return rows.filter(r => {
            const d = new Date(r.month);
            if (Number.isNaN(d.getTime())) return false;
            const m = new Date(d.getFullYear(), d.getMonth(), 1);
            return m >= startDate;
        });
    }, [rows, windowId]);

    return (
        <div className="subjects-trend">
            <div className="subjects-trend__filters segmented" role="tablist" aria-label="Subjects timeframe">
                {WINDOW_OPTIONS.map(opt => (
                    <button
                        key={opt.id}
                        type="button"
                        role="tab"
                        aria-selected={opt.id === windowId}
                        className={
                            "segmented__btn" +
                            (opt.id === windowId ? " segmented__btn--active" : "")
                        }
                        onClick={() => setWindowId(opt.id)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            <SubjectsStackedArea subjects={subjects} rows={filteredRows} />
        </div>
    );
}
