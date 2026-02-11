// components/member/MemberTerms.jsx
"use client";
import React, { useMemo } from "react";
import { History, CalendarClock } from "lucide-react";
/**
 * terms: [{ chamber:"House"|"Senate", startYear:number, endYear:number|null, isCurrent:boolean }]
 * compact?: boolean
 */
export default function MemberTerms({ terms = [], compact = false }) {
  // byChamber stays how you already had it
  const byChamber = useMemo(() => {
    const map = new Map();
    for (const t of terms || []) {
      const key = t.chamber || "Service";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    }
    // sort each chamber by startYear asc
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => a.startYear - b.startYear);
    }
    return Object.fromEntries(map);
  }, [terms]);

  // --- Service snapshot for the right-hand side ---
  const snapshot = useMemo(() => {
    const all = Object.values(byChamber).flat();
    if (!all.length) return null;

    const sorted = [...all].sort((a, b) => a.startYear - b.startYear);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const currentYear = new Date().getFullYear();
    const totalTerms = sorted.length;
    const yearsServed = sorted.reduce((sum, t) => {
      const end = t.endYear ?? currentYear;
      return sum + (end - t.startYear);
    }, 0);

    const chambersServed = Object.keys(byChamber).length;

    return {
      firstYear: first.startYear,
      lastRange: `${last.startYear} – ${last.endYear ?? "present"}`,
      totalTerms,
      yearsServed,
      chambersServed,
    };
  }, [byChamber]);
  return (
    <section className="llmp3-card llmp3-card--soft">
      {!compact && (
        <div className="llmp3-card__head">
          <h2 className="llmp3-h2">
            <History size={18} aria-hidden="true" />
            Term history
          </h2>
        </div>
      )}

      <div className="llmp3-terms">
        <div className="llmp3-terms__timeline">
          {Object.entries(byChamber).map(([chamber, list]) => (
            <div className="llmp3-terms__group" key={chamber}>
              <h4 className="llmp3-terms__groupTitle">{chamber}</h4>
              <ol className="llmp3-terms__list">
                {list.map((t, i) => {
                  const label = `${t.startYear} – ${t.endYear ?? "present"}`;
                  const current = t.isCurrent;
                  return (
                    <li key={`${chamber}-${i}`} className={`llmp3-terms__item ${current ? "is-current" : ""}`}>
                      <span className={`llmp3-terms__badge ${current ? "is-current" : ""}`}>
                        <span>{label}</span>
                        {current && <span className="llmp3-terms__meta">current</span>}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}

          {!compact && (
            <p className="llmp3-note">
              Ranges reflect service years per chamber; “present” indicates the current term.
            </p>
          )}
        </div>

        {!compact && snapshot && (
          <aside className="llmp3-terms__summary">
            <div className="llmp3-terms__summaryTitle">
              <CalendarClock size={16} aria-hidden="true" />
              Service snapshot
            </div>

            <dl className="llmp3-dl">
              <div className="llmp3-dl__row"><dt>First elected</dt><dd>{snapshot.firstYear}</dd></div>
              <div className="llmp3-dl__row"><dt>Most recent term</dt><dd>{snapshot.lastRange}</dd></div>
              <div className="llmp3-dl__row"><dt>Total terms</dt><dd>{snapshot.totalTerms}</dd></div>
              <div className="llmp3-dl__row"><dt>Approx. years served</dt><dd>{snapshot.yearsServed}</dd></div>
              {snapshot.chambersServed > 1 && (
                <div className="llmp3-dl__row"><dt>Chambers served</dt><dd>{snapshot.chambersServed}</dd></div>
              )}
            </dl>
          </aside>
        )}
      </div>
    </section>
  );
}
