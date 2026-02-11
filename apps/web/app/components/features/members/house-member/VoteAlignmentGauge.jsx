// components/member/VoteAlignmentPanel.jsx
import React from "react";
// import '../../../../lib/stylesheets/refactored/vote-ui.refactored.css';

export default function VoteAlignmentPanel({
  value,
  size = 132,          // donut outer diameter (px)
  className = "",
  chamber = "",
}) {
  const alignment = pickNum(value, ["alignment_pct", "alignmentPct", "value"]);
  const attendance = pickNum(value, ["attendance_pct", "attendancePct"]);
  const alignedCount = pickInt(value, ["aligned_count", "alignedCount"]);
  const consideredCount = pickInt(value, ["considered_count", "consideredCount"]);

  const hasAlignment = Number.isFinite(alignment);
  const pct = clamp(hasAlignment ? alignment : 0, 0, 100);

  // SVG geometry
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = (pct / 100) * c;
  const color = colorFor(pct);

  return (
    <section
      className={`vote-panel ${className}`}
      aria-label="Party vote alignment"
      style={{ "--gauge-size": `${size}px` }}
    >
      <div className="vote-panel__head">
        <h3 className="vote-panel__title">Party vote alignment</h3>
        {Number.isFinite(attendance) && (
          <span className="vote-badge" title="Share of this member’s cast votes out of all roll calls in their active window">
            Attendance <strong className="vote-badge__strong">{Math.round(attendance)}%</strong>
          </span>
        )}
      </div>

      <div className="vote-panel__body">
        <div className="gauge">
          <svg
            className="gauge__svg"
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={
              hasAlignment
                ? `Aligned with party ${Math.round(pct)} percent`
                : "Alignment not available"
            }
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={hasAlignment ? color : "#cbd5e1"}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${progress} ${c - progress}`}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </svg>

          <div className="gauge__center">
            <div className="gauge__label">
              <span className="gauge__value">
                {hasAlignment ? Math.round(pct) : "—"}
              </span>
              {hasAlignment && <span className="gauge__unit">%</span>}
              <div className="gauge__caption">aligned</div>
            </div>
          </div>
        </div>

        <div className="vote-panel__text">
          <p className="vote-panel__blurb">
            Share of this member’s votes that matched the <span className="text-strong">party line</span> on
            {` ${chamber} roll calls.`} When a vote’s party totals are tied or unavailable, it’s excluded
            from the alignment rate.
          </p>

          {(Number.isInteger(alignedCount) || Number.isInteger(consideredCount)) && (
            <div className="pill-row">
              {Number.isInteger(alignedCount) && (
                <span className="pill pill--green">
                  Aligned: <strong>{alignedCount}</strong>
                </span>
              )}
              {Number.isInteger(consideredCount) && (
                <span className="pill">
                  Considered: <strong>{consideredCount}</strong>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* helpers */
function clamp(n, min, max) { return Math.max(min, Math.min(max, Number(n))); }
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
function pickInt(obj, keys) {
  if (!obj) return null;
  for (const k of keys) {
    const raw = obj[k];
    if (raw == null) continue;
    const n = typeof raw === "number" ? raw : parseInt(raw, 10);
    if (Number.isInteger(n)) return n;
  }
  return null;
}
function colorFor(pct) {
  if (pct > 75) return "#059669"; // emerald-600
  if (pct > 50) return "#d97706"; // amber-600
  return "#dc2626";              // red-600
}
