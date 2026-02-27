"use client";

import { useMemo } from "react";

function chamberLabel(chamber) {
  if (chamber === "house") return "House only";
  if (chamber === "senate") return "Senate only";
  return "Congress (All)";
}

function fmtPct(p) {
  if (p == null || !Number.isFinite(p)) return "—";
  return `${(p * 100).toFixed(1)}%`;
}

function fmtCi(ciLow, ciHigh) {
  if (ciLow == null || ciHigh == null) return "—";
  return `${fmtPct(ciLow)}–${fmtPct(ciHigh)}`;
}

function clampPct(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export default function InsightsProgressSection({ progress, chamber = "all" }) {
  const overall = progress?.overall ?? null;
  const topics = progress?.topics ?? [];
  const adjusted = progress?.adjustedOverallEnacted ?? null;

  const headline = useMemo(() => {
    if (!overall) return "Progress cannot be estimated reliably right now.";
    return "Activity is concentrated in early stages, with limited conversion to enactment.";
  }, [overall]);

  const supporting = useMemo(() => {
    if (!overall)
      return "This section tracks movement through key milestones: advanced, passed, enacted, and failed.";
    const n = overall?.rates?.enacted?.n ?? overall?.counts?.introducedActive ?? null;
    return `We measure progress as stage movement among active bills (n=${n ?? "—"}), reported as rates with confidence intervals.`;
  }, [overall]);

  const funnelRows = useMemo(() => {
    if (!overall) return [];
    const c = overall.counts ?? {};
    return [
      { key: "introducedActive", label: "Active", v: c.introducedActive ?? 0, denomKey: "introducedActive", tone: "a" },
      { key: "advanced", label: "Advanced", v: c.advanced ?? 0, denomKey: "introducedActive", tone: "b" },
      { key: "passedOneChamber", label: "Passed 1 chamber", v: c.passedOneChamber ?? 0, denomKey: "introducedActive", tone: "b" },
      { key: "enacted", label: "Enacted", v: c.enacted ?? 0, denomKey: "introducedActive", tone: "accent" },
      { key: "failed", label: "Failed", v: c.failed ?? 0, denomKey: "totalIntroduced", tone: "danger" },
    ];
  }, [overall]);

  return (
    <section className="insights-progress" data-section="progress">
      <div className="story-titlePanel insights-progress__titlePanel">
        <div className="insights-story__container">
          <div className="insights-section-label">
            <div className="insights-section-label__kicker">Section II</div>
            <div className="insights-section-label__title">Progress</div>
          </div>

          <h2 className="insights-story__headline insights-progress__headline">{headline}</h2>
          <p className="insights-story__supporting insights-progress__supporting">{supporting}</p>

          <div className="insights-progress__metaRow">
            <span className="confidence-pill">
              Viewing: <strong>{chamberLabel(chamber)}</strong>
            </span>

            {adjusted?.adjusted?.p != null ? (
              <span className="confidence-pill">
                Adjusted enacted rate: <strong>{fmtPct(adjusted.adjusted.p)}</strong>{" "}
                <span className="insights-progress__metaSub">
                  (95% CI {fmtCi(adjusted.adjusted.ciLow, adjusted.adjusted.ciHigh)})
                </span>
              </span>
            ) : (
              <span className="confidence-pill">Adjusted view: —</span>
            )}
          </div>
        </div>
      </div>

      <div className="insights-story__container">
        <div className="insights-progress__grid">
          <div className="progress-panel story-surface">
            <div className="progress-panel__title">Stage distribution (overall)</div>
            <div className="progress-panel__hint">
              Advanced / Passed / Enacted rates use active bills as denominator; Failed uses total introduced.
            </div>

            {!overall ? (
              <div className="progress-panel__empty">No progress data returned.</div>
            ) : (
              <div className="progress-funnel" role="list" aria-label="Progress funnel">
                {funnelRows.map((r) => {
                  const denom =
                    r.denomKey === "totalIntroduced"
                      ? overall.counts?.totalIntroduced ?? 0
                      : overall.counts?.introducedActive ?? 0;

                  const pct = denom > 0 ? (r.v / denom) * 100 : 0;
                  const width = clampPct(Math.max(2, pct));

                  return (
                    <div key={r.key} className="progress-funnel__row" role="listitem">
                      <div className="progress-funnel__label">{r.label}</div>

                      <div className="progress-funnel__barWrap" aria-hidden="true">
                        <div
                          className={`progress-funnel__bar tone-${r.tone}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>

                      <div className="progress-funnel__value">
                        {r.v}
                        <span className="progress-funnel__valueSub">
                          {denom > 0 ? ` (${pct.toFixed(1)}%)` : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="progress-side">
            <div className="progress-card story-surface">
              <div className="progress-card__label">Advanced rate</div>
              <div className="progress-card__value">{fmtPct(overall?.rates?.advanced?.p)}</div>
              <div className="progress-card__sub">95% CI: {fmtCi(overall?.rates?.advanced?.ciLow, overall?.rates?.advanced?.ciHigh)}</div>
            </div>

            <div className="progress-card story-surface">
              <div className="progress-card__label">Passed one chamber</div>
              <div className="progress-card__value">{fmtPct(overall?.rates?.passedOneChamber?.p)}</div>
              <div className="progress-card__sub">
                95% CI: {fmtCi(overall?.rates?.passedOneChamber?.ciLow, overall?.rates?.passedOneChamber?.ciHigh)}
              </div>
            </div>

            <div className="progress-card story-surface">
              <div className="progress-card__label">Enacted rate</div>
              <div className="progress-card__value">{fmtPct(overall?.rates?.enacted?.p)}</div>
              <div className="progress-card__sub">95% CI: {fmtCi(overall?.rates?.enacted?.ciLow, overall?.rates?.enacted?.ciHigh)}</div>
            </div>

            <div className="progress-card story-surface">
              <div className="progress-card__label">Failed rate</div>
              <div className="progress-card__value">{fmtPct(overall?.rates?.failed?.p)}</div>
              <div className="progress-card__sub">95% CI: {fmtCi(overall?.rates?.failed?.ciLow, overall?.rates?.failed?.ciHigh)}</div>
            </div>
          </div>
        </div>

        {topics?.length ? (
          <div className="progress-topics">
            <div className="progress-topics__title">Highest-volume policy areas</div>
            <div className="progress-topics__grid" role="list" aria-label="Highest-volume policy areas">
              {topics.slice(0, 6).map((t) => (
                <div
                  key={t.policyAreaSlug ?? t.policyAreaName}
                  className="progress-topic story-surface story-surface--soft"
                  role="listitem"
                >
                  <div className="progress-topic__name">{t.policyAreaName ?? "—"}</div>
                  <div className="progress-topic__meta">
                    Active: <strong>{t.counts?.introducedActive ?? 0}</strong>
                    <span className="dotsep">•</span>
                    Enacted: <strong>{fmtPct(t.rates?.enacted?.p)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}