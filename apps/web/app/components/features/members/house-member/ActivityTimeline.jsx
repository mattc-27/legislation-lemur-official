// components/member/ActivityTimeline.jsx
"use client";
import { useState, useMemo } from "react";

function fmtAsOf(asOf) {
  if (!asOf) return null;
  const d = new Date(asOf);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ActivityTimeline({ data = [], filterTopic, freshnessAsOf = null }) {
  const [mode, setMode] = useState("all"); // "all" | "sponsored" | "cosponsored"
  const asOfLabel = fmtAsOf(freshnessAsOf);

  const filtered = filterTopic ? data.filter((m) => m.subjects?.includes?.(filterTopic)) : data;

  const months = useMemo(() => {
    const last12 = Array.isArray(filtered) ? filtered.slice(-12) : [];
    return last12.map((m) => ({
      month: ymKey(m.month),
      sponsored: num(m.sponsored ?? m.sponsored_count ?? m.sponsoredCount),
      cosponsored: num(m.cosponsored ?? m.cosponsored_count ?? m.cosponsoredCount),
    }));
  }, [filtered]);

  const totals = months.map((m) => (m.sponsored || 0) + (m.cosponsored || 0));
  const max = Math.max(1, ...totals);

  const bars = useMemo(() => {
    return months.map((m) => {
      const s = m.sponsored || 0;
      const c = m.cosponsored || 0;
      const total = s + c;
      const h = Math.max(2, Math.round((total / max) * 100));
      const sPct = total ? Math.round((s / total) * 100) : 0;
      const cPct = 100 - sPct;

      const emphasis = {
        sFill: mode === "cosponsored" ? "rgba(148, 163, 184, 1)" : "#6366F1",
        cFill: "#7C3AED",
        sOpacity: mode === "cosponsored" ? 0.55 : 1,
        cOpacity: mode === "sponsored" ? 0.55 : 1,
      };

      return { key: m.month, s, c, total, h, sPct, cPct, emphasis };
    });
  }, [months, max, mode]);

  return (
    <section className="llmp3-card llm3-activity" aria-label="Legislative activity">
      <div className="llmp3-card__head llm3-cardHead">
        <div className="llm3-activity__headText">
          <h3 className="llm3-h2" style={{ margin: 0 }}>
            Legislative activity (last 12 mo)
          </h3>
          {asOfLabel ? <div className="llm3-muted llm3-asof">Updated {asOfLabel}</div> : null}
        </div>

        <div className="ll3-seg llm3-activitySeg" role="tablist" aria-label="Activity view">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "all"}
            className={"ll3-filterPill" + (mode === "all" ? " is-active" : "")}
            onClick={() => setMode("all")}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "sponsored"}
            className={"ll3-filterPill" + (mode === "sponsored" ? " is-active" : "")}
            onClick={() => setMode("sponsored")}
          >
            Sponsored
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "cosponsored"}
            className={"ll3-filterPill" + (mode === "cosponsored" ? " is-active" : "")}
            onClick={() => setMode("cosponsored")}
          >
            Co-sponsored
          </button>
        </div>
      </div>

      <div className="llm3-activity__frame">
        <div
          className="llm3-activity__bars"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${bars.length || 1}, minmax(0, 1fr))`,
            gap: 6,
            alignItems: "end",
          }}
        >
          {bars.length === 0 ? (
            <div className="llm3-activity__empty" />
          ) : (
            bars.map((b) => {
              const tip = `${fmtMonth(b.key)} — Sponsored: ${b.s}, Cosponsored: ${b.c}, Total: ${b.total}`;
              return (
                <div key={b.key} className="llm3-bar" title={tip}>
                  <div
                    className="llm3-bar__stack"
                    style={{
                      height: `${b.h}%`,
                      display: "grid",
                      gridTemplateRows: `${b.cPct}% ${b.sPct}%`,
                    }}
                  >
                    <div
                      className="llm3-bar__c"
                      style={{
                        background: b.emphasis.cFill,
                        opacity: b.emphasis.cOpacity,
                        borderRadius: "4px 4px 0 0",
                      }}
                    />
                    <div
                      className="llm3-bar__s"
                      style={{
                        background: b.emphasis.sFill,
                        opacity: b.emphasis.sOpacity,
                        borderRadius: "0 0 4px 4px",
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {bars.length > 0 && (
          <div
            className="llm3-activity__axis"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))`,
              gap: 6,
              marginTop: 8,
            }}
          >
            {bars.map((b) => (
              <div
                key={`tick-${b.key}`}
                className="llm3-activity__tick"
                style={{ textAlign: "center" }}
              >
                {fmtMonth(b.key)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="llm3-legendRow">
        <span className="llm3-legendItem">
          <i className="llm3-legendSwatch" style={{ background: "#6366F1" }} /> Sponsored
        </span>
        <span className="llm3-legendItem">
          <i className="llm3-legendSwatch" style={{ background: "#7C3AED" }} /> Cosponsored
        </span>
        <span className="llm3-muted">Bar height = S + C</span>
      </div>
    </section>
  );
}

/* ---------- utils (unchanged) ---------- */

function ymKey(v) {
  if (!v) return "";
  if (v instanceof Date && !isNaN(v)) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }
  const s = String(v);
  const iso = Date.parse(s);
  if (!Number.isNaN(iso)) {
    const d = new Date(iso);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }
  const m = s.match(/^(\d{4})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}` : s;
}

function fmtMonth(key) {
  const m = key && String(key).match(/^(\d{4})-(\d{2})$/);
  if (!m) return String(key ?? "");
  const y = Number(m[1]),
    mo = Number(m[2]) - 1;
  const d = new Date(Date.UTC(y, mo, 1));
  return d.toLocaleString(undefined, { month: "short" });
}

const num = (x) => (x == null ? 0 : Number(x) || 0);