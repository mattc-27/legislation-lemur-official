// components/member/MemberTerms.jsx
"use client";
import React, { useMemo } from "react";

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
    <section className="member-section member-section--terms card card--p-24">
      {!compact && (
        <h3 className="section-title" style={{ marginBottom: 12 }}>
          Term history
        </h3>
      )}

      <div className="terms-layout">
        {/* LEFT: timeline */}
        <div className="terms-layout__timeline">
          <div className="terms">
            {Object.entries(byChamber).map(([chamber, list]) => (
              <div className="terms__group" key={chamber}>
                <h4 className="terms__group-title">{chamber}</h4>
                <ol className="terms__list">
                  {list.map((t, i) => {
                    const label = `${t.startYear} – ${t.endYear ?? "present"}`;
                    const current = t.isCurrent;
                    return (
                      <li
                        key={`${chamber}-${i}`}
                        className={`terms__item ${current ? "terms__item--current" : ""
                          }`}
                      >
                        <span
                          className={`terms__badge ${current ? "terms__badge--current" : ""
                            }`}
                          title={chamber}
                        >
                          <span>{label}</span>
                          {current && (
                            <span className="terms__meta">current</span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>

          {!compact && (
            <p className="terms__note">
              Ranges reflect service years per chamber; “present” indicates the
              current term.
            </p>
          )}
        </div>

        {/* RIGHT: snapshot card */}
        {!compact && snapshot && (
          <aside className="terms-layout__summary">
            <h4 className="terms-summary__title">Service snapshot</h4>
            <dl className="terms-summary__list">
              <div className="terms-summary__item">
                <dt>First elected</dt>
                <dd>{snapshot.firstYear}</dd>
              </div>
              <div className="terms-summary__item">
                <dt>Most recent term</dt>
                <dd>{snapshot.lastRange}</dd>
              </div>
              <div className="terms-summary__item">
                <dt>Total terms</dt>
                <dd>{snapshot.totalTerms}</dd>
              </div>
              <div className="terms-summary__item">
                <dt>Approx. years served</dt>
                <dd>{snapshot.yearsServed}</dd>
              </div>
              {snapshot.chambersServed > 1 && (
                <div className="terms-summary__item">
                  <dt>Chambers served</dt>
                  <dd>{snapshot.chambersServed}</dd>
                </div>
              )}
            </dl>
          </aside>
        )}
      </div>
    </section>

  );
}
