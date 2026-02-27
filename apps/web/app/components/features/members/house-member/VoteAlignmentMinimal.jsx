import React from "react";

export default function VoteAlignmentPanel({
    value,
    className = "",
    chamber = "",
}) {
    const alignment = pickNum(value, ["alignment_pct", "alignmentPct", "value"]);
    const attendance = pickNum(value, ["attendance_pct", "attendancePct"]);

    const hasAlignment = Number.isFinite(alignment);
    const hasAttendance = Number.isFinite(attendance);

    const pct = clamp(hasAlignment ? alignment : 0, 0, 100);
    const att = clamp(hasAttendance ? attendance : 0, 0, 100);

    const label = chamber ? `${chamber} roll calls` : "roll calls";

    return (
        <section
            className={`llmp3-card llm3-alignBadge ${className}`}
            aria-label="Party vote alignment"
        >
            <div className="llmp3-card__head llm3-cardHead">
                <h3 className="llm3-h2" style={{ margin: 0 }}>
                    Party vote alignment
                </h3>

                {hasAttendance && (
                    <span
                        className="llm3-pill llm3-pill--subtle"
                        title="Share of this member’s cast votes out of all roll calls in their active window"
                    >
                        Attendance <strong className="llm3-pill__strong">{Math.round(att)}%</strong>
                    </span>
                )}
            </div>

            <div className="llm3-alignBadge__body">
                <div className="llm3-alignBadge__metric">
                    <div className="llm3-alignBadge__value">
                        {hasAlignment ? Math.round(pct) : "—"}
                        {hasAlignment && <span className="llm3-alignBadge__unit">%</span>}
                    </div>
                    <div className="llm3-alignBadge__sub">Aligned with party totals</div>
                </div>

                <p className="llm3-alignBadge__blurb">
                    Share of this member’s votes that matched the{" "}
                    <span className="llm3-strong">party line</span> on {label}. When a vote’s
                    party totals are tied or unavailable, it’s excluded.
                </p>
            </div>
        </section>
    );
}

/* helpers */
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, Number(n)));
}
function pickNum(obj, keys) {
    if (!obj) return null;
    for (const k of keys) {
        const raw = obj[k];
        if (raw == null) continue;
        const n = typeof raw === "number" ? raw : parseFloat(raw);
        if (Number.isFinite(n)) return n;
    }
    return null;
}