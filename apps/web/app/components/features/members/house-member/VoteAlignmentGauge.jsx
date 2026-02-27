import React from "react";

export default function VoteAlignmentPanel({
  value,
  size = undefined, // ✅ IMPORTANT: don’t default-lock to 132
  className = "",
  chamber = "",
}) {
  const alignment = pickNum(value, ["alignment_pct", "alignmentPct", "value"]);
  const attendance = pickNum(value, ["attendance_pct", "attendancePct"]);
  const alignedCount = pickInt(value, ["aligned_count", "alignedCount"]);
  const consideredCount = pickInt(value, ["considered_count", "consideredCount"]);

  const hasAlignment = Number.isFinite(alignment);
  const pct = clamp(hasAlignment ? alignment : 0, 0, 100);

  // Use a fixed internal coordinate system; CSS scales the final rendered size
  const VB = 132;

  // SVG geometry in VB units
  const stroke = 12;
  const r = (VB - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = (pct / 100) * c;
  const color = colorFor(pct);

  // Only set --gauge-size if caller explicitly passes a size
  const style = size ? { "--gauge-size": `${size}px` } : undefined;

  return (
    <section
      className={`llmp3-card llm3-align ${className}`}
      aria-label="Party vote alignment"
      style={style}
    >
      <div className="llmp3-card__head llm3-cardHead">
        <h3 className="llm3-h2 llm3-align__title">Party vote alignment</h3>

        {Number.isFinite(attendance) && (
          <span
            className="llm3-pill llm3-pill--subtle"
            title="Share of this member’s cast votes out of all roll calls in their active window"
          >
            Attendance{" "}
            <strong className="llm3-pill__strong">
              {Math.round(attendance)}%
            </strong>
          </span>
        )}
      </div>

      {/* viz */}
      <div className="llm3-align__viz">
        <div className="llm3-gauge__frame" aria-hidden="true">
          <svg
            className="llm3-gauge__svg"
            viewBox={`0 0 ${VB} ${VB}`}
            role="img"
            aria-label={
              hasAlignment
                ? `Aligned with party ${Math.round(pct)} percent`
                : "Alignment not available"
            }
          >
            <circle
              cx={VB / 2}
              cy={VB / 2}
              r={r}
              fill="none"
              stroke="rgba(17, 24, 39, 0.10)"
              strokeWidth={stroke}
            />
            <circle
              cx={VB / 2}
              cy={VB / 2}
              r={r}
              fill="none"
              stroke={hasAlignment ? color : "rgba(148, 163, 184, 0.9)"}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${progress} ${c - progress}`}
              transform={`rotate(-90 ${VB / 2} ${VB / 2})`}
            />
          </svg>

          <div className="llm3-gauge__center">
            <div className="llm3-gauge__valueRow">
              <span className="llm3-gauge__value">
                {hasAlignment ? Math.round(pct) : "—"}
              </span>
              {hasAlignment && <span className="llm3-gauge__unit">%</span>}
            </div>
            <div className="llm3-gauge__caption">aligned</div>
          </div>
        </div>
      </div>

      {/* footer / description */}
      <div className="llm3-align__footer">
        <p className="llm3-align__blurb">
          Share of this member’s votes that matched the{" "}
          <span className="llm3-strong">party line</span> on{" "}
          {chamber ? `${chamber} roll calls.` : "roll calls."} When a vote’s party
          totals are tied or unavailable, it’s excluded from the alignment rate.
        </p>

        {(Number.isInteger(alignedCount) || Number.isInteger(consideredCount)) && (
          <div className="llm3-pillRow">
            {Number.isInteger(alignedCount) && (
              <span className="llm3-pill llm3-pill--good">
                Aligned:{" "}
                <strong className="llm3-pill__strong">{alignedCount}</strong>
              </span>
            )}
            {Number.isInteger(consideredCount) && (
              <span className="llm3-pill">
                Considered:{" "}
                <strong className="llm3-pill__strong">{consideredCount}</strong>
              </span>
            )}
          </div>
        )}
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
  if (pct > 75) return "#059669";
  if (pct > 50) return "#d97706";
  return "#dc2626";
}