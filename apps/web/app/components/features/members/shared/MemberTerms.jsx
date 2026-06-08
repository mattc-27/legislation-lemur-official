"use client";
import React, { useMemo, useState } from "react";
import { History, CalendarClock, ChevronDown } from "lucide-react";

export default function MemberTerms({ terms = [], compact = false, mode = "page" }) {
  const [expanded, setExpanded] = useState(false);

  const byChamber = useMemo(() => {
    const map = new Map();

    for (const t of terms || []) {
      const key = t.chamber || "Service";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    }

    for (const [, list] of map.entries()) {
      list.sort((a, b) => b.startYear - a.startYear);
    }

    return Object.fromEntries(map);
  }, [terms]);

  const snapshot = useMemo(() => {
    const all = Object.values(byChamber).flat();
    if (!all.length) return null;

    const sortedAsc = [...all].sort((a, b) => a.startYear - b.startYear);
    const first = sortedAsc[0];
    const latest = sortedAsc[sortedAsc.length - 1];

    const currentYear = new Date().getFullYear();
    const totalTerms = sortedAsc.length;
    const yearsServed = sortedAsc.reduce((sum, t) => {
      const end = t.endYear ?? currentYear;
      return sum + (end - t.startYear);
    }, 0);

    return {
      firstYear: first.startYear,
      lastRange: `${latest.startYear} – ${latest.endYear ?? "present"}`,
      totalTerms,
      yearsServed,
    };
  }, [byChamber]);

  return (
    <section className={`llmp3-card llmp3-card--soft llmp3-termsCard llmp3-termsCard--${mode}`} data-view-mode={mode}>
      {!compact && (
        <div className="llmp3-card__head llmp3-termsCard__head">
          <h2 className="llmp3-h2 llmp3-termsCard__title">
            <History className="llmp3-termsCard__titleIcon" size={17} aria-hidden="true" />
            <span>Term history</span>
          </h2>
        </div>
      )}

      <div className="llmp3-terms">
        <div className="llmp3-terms__timeline">
          {Object.entries(byChamber).map(([chamber, list]) => {
            const visible = expanded ? list : list.slice(0, 3);
            const hiddenCount = Math.max(0, list.length - visible.length);

            return (
              <div className="llmp3-terms__group" key={chamber}>
                <div className="llmp3-terms__groupHead">
                  <h4 className="llmp3-terms__groupTitle">
                    {chamber === "House" ? "House of Representatives" : chamber}
                  </h4>

                  {hiddenCount > 0 || expanded ? (
                    <button
                      type="button"
                      className="llmp3-terms__toggle"
                      onClick={() => setExpanded((v) => !v)}
                      aria-expanded={expanded}
                    >
                      <ChevronDown
                        size={15}
                        className={`llmp3-terms__toggleIcon ${expanded ? "is-open" : ""}`}
                        aria-hidden="true"
                      />
                      {expanded ? "Show fewer terms" : `+ ${hiddenCount} earlier terms`}
                    </button>
                  ) : null}
                </div>

                <ol className="llmp3-terms__list">
                  {visible.map((t, i) => {
                    const label = `${t.startYear} – ${t.endYear ?? "present"}`;
                    const current = t.isCurrent;

                    return (
                      <li
                        key={`${chamber}-${i}-${t.startYear}-${t.endYear ?? "present"}`}
                        className={`llmp3-terms__item ${current ? "is-current" : ""}`}
                      >
                        <span className="llmp3-terms__rail" aria-hidden="true">
                          <span className={`llmp3-terms__dot ${current ? "is-current" : ""}`} />
                        </span>

                        <div className="llmp3-terms__content">
                          <div className="llmp3-terms__meta">
                            <span className="llmp3-terms__date">{label}</span>
                            {current ? <span className="llmp3-terms__type">Current</span> : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}

          {!compact && (
            <p className="llmp3-note">
              Ranges reflect service years per chamber; “present” indicates the current term.
            </p>
          )}
        </div>

        {!compact && snapshot ? (
          <aside className="llmp3-terms__summary">
            <div className="llmp3-terms__summaryTitle">
              <CalendarClock className="llmp3-terms__summaryIcon" size={15} aria-hidden="true" />
              <span>Service snapshot</span>
            </div>

            <dl className="llmp3-dl">
              <div className="llmp3-dl__row">
                <dt>First elected</dt>
                <dd>{snapshot.firstYear}</dd>
              </div>
              <div className="llmp3-dl__row">
                <dt>Most recent term</dt>
                <dd>{snapshot.lastRange}</dd>
              </div>
              <div className="llmp3-dl__row">
                <dt>Total terms</dt>
                <dd>{snapshot.totalTerms}</dd>
              </div>
              <div className="llmp3-dl__row">
                <dt>Approx. years served</dt>
                <dd>{snapshot.yearsServed}</dd>
              </div>
            </dl>
          </aside>
        ) : null}
      </div>
    </section>
  );
}