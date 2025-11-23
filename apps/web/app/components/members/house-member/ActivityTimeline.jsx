// components/member/ActivityTimeline.jsx
"use client";
import { useState, useMemo } from "react";

export default function ActivityTimeline({ data = [], filterTopic }) {
  const [mode, setMode] = useState("all"); // "all" | "sponsored" | "cosponsored"

  // optional topic filter (kept)
  const filtered = filterTopic ? data.filter(m => m.subjects?.includes?.(filterTopic)) : data;

  // normalize last 12 months + field names
  const months = useMemo(() => {
    const last12 = Array.isArray(filtered) ? filtered.slice(-12) : [];
    return last12.map((m) => ({
      // month key in "YYYY-MM" form for stable keys/labels
      month: ymKey(m.month),
      sponsored: num(m.sponsored ?? m.sponsored_count ?? m.sponsoredCount),
      cosponsored: num(m.cosponsored ?? m.cosponsored_count ?? m.cosponsoredCount),
    }));
  }, [filtered]);

  const totals = months.map(m => (m.sponsored || 0) + (m.cosponsored || 0));
  const max = Math.max(1, ...totals);

  const bars = useMemo(() => {
    return months.map(m => {
      const s = m.sponsored || 0;
      const c = m.cosponsored || 0;
      const total = s + c;
      const h = Math.max(2, Math.round((total / max) * 100));
      const sPct = total ? Math.round((s / total) * 100) : 0;
      const cPct = 100 - sPct;

      const emphasis = {
        sFill: mode === "cosponsored" ? "#C7C9D1" : "#6366F1", // blue
        cFill: "#7C3AED",                                       // purple
        sOpacity: mode === "cosponsored" ? 0.55 : 1,
        cOpacity: mode === "sponsored" ? 0.55 : 1,
      };

      return { key: m.month, s, c, total, h, sPct, cPct, emphasis };
    });
  }, [months, max, mode]);

  return (
    <div className="viz viz--timeline" role="group" aria-label="Legislative activity">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div><div className="viz__title">Legislative activity (last 12 mo)</div></div>
        <div style={{ flex: 1 }} />
        <div className="segmented" role="tablist" aria-label="Activity view">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "all"}
            className={"segmented__btn" + (mode === "all" ? " segmented__btn--active" : "")}
            onClick={() => setMode("all")}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "sponsored"}
            className={"segmented__btn" + (mode === "sponsored" ? " segmented__btn--active" : "")}
            onClick={() => setMode("sponsored")}
          >
            Sponsored
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "cosponsored"}
            className={"segmented__btn" + (mode === "cosponsored" ? " segmented__btn--active" : "")}
            onClick={() => setMode("cosponsored")}
          >
            Co-sponsored
          </button>
        </div>
      </div>

      <div className="viz__bars" style={{ display: "grid", gridTemplateColumns: `repeat(${bars.length || 1},1fr)`, gap: 6, alignItems: "end", minHeight: 120 }}>
        {bars.length === 0 ? (
          <div className="viz__ph" />
        ) : (
          bars.map((b) => {
            const tip = `${fmtMonth(b.key)} — Sponsored: ${b.s}, Cosponsored: ${b.c}, Total: ${b.total}`;
            return (
              <div key={b.key} className="viz__bar has-tip" title={tip} data-tip={tip}
                style={{ display: "grid", gridTemplateRows: `${b.cPct}% ${b.sPct}%`, height: `${b.h}%` }}>
                <div className="viz__bar-c" style={{ background: b.emphasis.cFill, opacity: b.emphasis.cOpacity, borderRadius: "4px 4px 0 0" }} />
                <div className="viz__bar-s" style={{ background: b.emphasis.sFill, opacity: b.emphasis.sOpacity, borderRadius: "0 0 4px 4px" }} />
              </div>
            );
          })
        )}
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 8, color: "#64748B", fontSize: 12 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i style={{ width: 10, height: 10, background: "#6366F1", borderRadius: 2, display: "inline-block" }} /> Sponsored</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i style={{ width: 10, height: 10, background: "#7C3AED", borderRadius: 2, display: "inline-block" }} /> Cosponsored</span>
        <span className="muted">Bar height = S + C</span>
      </div>

      {bars.length > 0 && (
        <div className="viz__axis" style={{ display: "grid", gridTemplateColumns: `repeat(${bars.length},1fr)`, gap: 6, marginTop: 6 }}>
          {bars.map((b) => (
            <div key={`tick-${b.key}`} className="viz__tick" style={{ textAlign: "center", fontSize: 12, color: "#64748B" }}>
              {fmtMonth(b.key)}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
=
        .has-tip{position:relative}
        .has-tip:hover::after,.has-tip:focus-visible::after{content:attr(data-tip);position:absolute;left:50%;transform:translateX(-50%);bottom:calc(100% + 8px);padding:6px 8px;font-size:12px;line-height:1.3;color:#0b1221;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 8px 16px rgba(0,0,0,.08);white-space:nowrap;z-index:10}
        .has-tip:hover::before,.has-tip:focus-visible::before{content:"";position:absolute;left:50%;transform:translateX(-50%);bottom:calc(100% + 2px);border:6px solid transparent;border-top-color:#e5e7eb}
      `}</style>
    </div>
  );
}

/* ---------- utils ---------- */

// Accept Date | "YYYY-MM" | "YYYY-MM-DD" | ISO datetime → "YYYY-MM"
function ymKey(v) {
  if (!v) return "";
  if (v instanceof Date && !isNaN(v)) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }
  const s = String(v);
  // quick ISO parse
  const iso = Date.parse(s);
  if (!Number.isNaN(iso)) {
    const d = new Date(iso);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }
  // fallback: match "YYYY-MM" or "YYYY-MM-DD"
  const m = s.match(/^(\d{4})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}` : s;
}

function fmtMonth(key) {
  const m = key && String(key).match(/^(\d{4})-(\d{2})$/);
  if (!m) return String(key ?? "");
  const y = Number(m[1]), mo = Number(m[2]) - 1;
  const d = new Date(Date.UTC(y, mo, 1));
  return d.toLocaleString(undefined, { month: "short" });
}

const num = (x) => (x == null ? 0 : Number(x) || 0);
