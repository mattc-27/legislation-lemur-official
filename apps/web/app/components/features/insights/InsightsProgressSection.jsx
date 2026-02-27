// apps/web/app/components/features/insights/InsightsProgressSection.jsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";

function chamberLabel(chamber) {
  if (chamber === "house") return "House only";
  if (chamber === "senate") return "Senate only";
  return "Congress (All)";
}

function fmtInt(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return new Intl.NumberFormat("en-US").format(Math.round(v));
}

function fmtPct(p, digits = 1) {
  if (p == null || !Number.isFinite(p)) return "—";
  return `${(p * 100).toFixed(digits)}%`;
}

function fmtRangePlain(ciLow, ciHigh, digits = 1) {
  if (ciLow == null || ciHigh == null || !Number.isFinite(ciLow) || !Number.isFinite(ciHigh)) return "—";
  return `${fmtPct(ciLow, digits)}–${fmtPct(ciHigh, digits)}`;
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function useResizeSignal(ref) {
  // Simple ResizeObserver “signal” to re-render D3 on size changes.
  // We avoid bringing in hooks from elsewhere so this stays drop-in.
  const signalRef = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      signalRef.current += 1;
      // Force a synchronous layout read to ensure D3 redraw sees updated width.
      // eslint-disable-next-line no-unused-expressions
      el.getBoundingClientRect().width;
      // Trigger a re-render by dispatching a custom event we listen for.
      window.dispatchEvent(new Event("ll:progress:resize"));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  const rerenderTick = useRef(0);
  useEffect(() => {
    const on = () => {
      rerenderTick.current += 1;
    };
    window.addEventListener("ll:progress:resize", on);
    return () => window.removeEventListener("ll:progress:resize", on);
  }, []);

  return rerenderTick.current;
}

function ProgressStageChartD3({ rows, overall }) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);

  // Resize signal forces the effect to re-run when container width changes.
  const _resizeTick = useResizeSignal(wrapRef);

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg || !overall || !rows?.length) return;

    const rect = wrap.getBoundingClientRect();
    const width = Math.max(280, rect.width || 0);
    const rowH = 34;
    const padTop = 12;
    const padBottom = 10;
    const labelW = width < 520 ? 108 : 140;
    const valueW = width < 520 ? 88 : 102;
    const gap = 10;
    const barW = Math.max(120, width - labelW - valueW - gap * 2);

    const height = padTop + padBottom + rows.length * rowH;

    const denomActive = overall?.counts?.introducedActive ?? 0;
    const denomTotal = overall?.counts?.totalIntroduced ?? 0;

    const data = rows.map((r) => {
      const denom = r.denomKey === "totalIntroduced" ? denomTotal : denomActive;
      const pct = denom > 0 ? r.v / denom : 0;
      return { ...r, denom, pct: clamp01(pct) };
    });

    const x = d3.scaleLinear().domain([0, 1]).range([0, barW]);

    const root = d3.select(svg);
    root.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    root.selectAll("*").remove();

    const g = root.append("g").attr("transform", `translate(0,${padTop})`);

    // Row groups
    const row = g
      .selectAll("g.row")
      .data(data, (d) => d.key)
      .join((enter) => enter.append("g").attr("class", "row"));

    row.attr("transform", (_, i) => `translate(0,${i * rowH})`);

    // Labels
    row
      .append("text")
      .attr("class", "progress-d3__label")
      .attr("x", 0)
      .attr("y", 22)
      .text((d) => d.label);

    // Track
    row
      .append("rect")
      .attr("class", "progress-d3__track")
      .attr("x", labelW + gap)
      .attr("y", 14)
      .attr("rx", 999)
      .attr("ry", 999)
      .attr("width", barW)
      .attr("height", 10);

    // Filled bar
    row
      .append("rect")
      .attr("class", (d) => `progress-d3__bar tone-${d.tone}`)
      .attr("x", labelW + gap)
      .attr("y", 14)
      .attr("rx", 999)
      .attr("ry", 999)
      .attr("width", (d) => Math.max(2, x(d.pct)))
      .attr("height", 10);

    // Values
    row
      .append("text")
      .attr("class", "progress-d3__value")
      .attr("x", labelW + gap + barW + gap + valueW)
      .attr("y", 22)
      .attr("text-anchor", "end")
      .text((d) => {
        if (!d.denom) return `${fmtInt(d.v)}`;
        return `${fmtInt(d.v)} (${(d.pct * 100).toFixed(1)}%)`;
      });
  }, [rows, overall, _resizeTick]);

  return (
    <div ref={wrapRef} className="progress-d3" aria-label="Where bills are in the process">
      <svg ref={svgRef} role="img" aria-label="Stage distribution chart" />
    </div>
  );
}

export default function InsightsProgressSection({ progress, chamber = "all" }) {
  const overall = progress?.overall ?? null;
  const topics = progress?.topics ?? [];
  const adjusted = progress?.adjustedOverallEnacted ?? null;

  const nActive = useMemo(() => {
    const n =
      overall?.rates?.enacted?.n ??
      overall?.counts?.introducedActive ??
      overall?.counts?.totalIntroduced ??
      null;
    return n;
  }, [overall]);

  const rates = useMemo(() => {
    const r = overall?.rates ?? {};
    return {
      advanced: r.advanced ?? {},
      passed: r.passedOneChamber ?? {},
      enacted: r.enacted ?? {},
      failed: r.failed ?? {},
    };
  }, [overall]);

  const narrative = useMemo(() => {
    if (!overall) {
      return {
        headline: "Progress cannot be estimated reliably right now.",
        dek: "We track how bills move through key milestones — but this snapshot did not return enough data to summarize movement.",
        context: "Try again later or switch chambers to compare activity patterns.",
      };
    }

    const adv = rates.advanced?.p;
    const pass = rates.passed?.p;
    const enact = rates.enacted?.p;

    const advPct = adv != null ? adv * 100 : null;
    const enactPct = enact != null ? enact * 100 : null;

    let headline = "Most bills remain in early stages.";
    if (enact === 0 && adv != null && adv < 0.15) headline = "Few bills have moved beyond introduction.";
    else if (enact === 0 && adv != null && adv < 0.35) headline = "Activity is concentrated early, with little reaching enactment.";
    else if (enact != null && enact > 0 && adv != null) headline = "A small share of bills are progressing to later stages.";

    const dekParts = [];
    dekParts.push(`Of ${fmtInt(nActive)} active bills, ${fmtPct(adv)} have moved beyond introduction.`);
    if (pass != null) dekParts.push(`${fmtPct(pass)} have cleared at least one chamber.`);
    if (enact != null) dekParts.push(`${fmtPct(enact)} have become law so far.`);
    const dek = dekParts.join(" ");

    let context = "Progress rates help separate volume from outcomes: introductions are common, enactment is selective.";
    if (enact === 0) context = "Early in the process, enactment is often rare — this snapshot reflects how quickly the funnel narrows.";
    if (enactPct != null && enactPct >= 1) context = "Even when activity is high, only a small fraction typically becomes law.";

    return { headline, dek, context };
  }, [overall, rates, nActive]);

  const funnelRows = useMemo(() => {
    if (!overall) return [];
    const c = overall.counts ?? {};
    return [
      { key: "introducedActive", label: "Active", v: c.introducedActive ?? 0, denomKey: "introducedActive", tone: "a" },
      { key: "advanced", label: "Moved forward", v: c.advanced ?? 0, denomKey: "introducedActive", tone: "b" },
      {
        key: "passedOneChamber",
        label: "Cleared one chamber",
        v: c.passedOneChamber ?? 0,
        denomKey: "introducedActive",
        tone: "b",
      },
      { key: "enacted", label: "Became law", v: c.enacted ?? 0, denomKey: "introducedActive", tone: "accent" },
      { key: "failed", label: "Did not advance", v: c.failed ?? 0, denomKey: "totalIntroduced", tone: "danger" },
    ];
  }, [overall]);

  const cards = useMemo(() => {
    // Plain-language labels + “Estimated range” language
    if (!overall) return [];
    return [
      {
        key: "advanced",
        label: "Bills that moved forward",
        value: fmtPct(rates.advanced?.p),
        sub: `Estimated range: ${fmtRangePlain(rates.advanced?.ciLow, rates.advanced?.ciHigh)}`,
      },
      {
        key: "passed",
        label: "Cleared one chamber",
        value: fmtPct(rates.passed?.p),
        sub: `Estimated range: ${fmtRangePlain(rates.passed?.ciLow, rates.passed?.ciHigh)}`,
      },
      {
        key: "enacted",
        label: "Became law",
        value: fmtPct(rates.enacted?.p),
        sub: `Estimated range: ${fmtRangePlain(rates.enacted?.ciLow, rates.enacted?.ciHigh)}`,
      },
      {
        key: "failed",
        label: "Did not advance",
        value: fmtPct(rates.failed?.p),
        sub: `Estimated range: ${fmtRangePlain(rates.failed?.ciLow, rates.failed?.ciHigh)}`,
      },
    ];
  }, [overall, rates]);

  return (
    <section className="insights-progress" data-section="progress">
      <div className="story-titlePanel insights-progress__titlePanel">
        <div className="insights-story__container">
          <div className="insights-section-label">
            <div className="insights-section-label__kicker">Section II</div>
            <div className="insights-section-label__title">Progress</div>
          </div>

          {/* Narrative first */}
          <h2 className="insights-story__headline insights-progress__headline">{narrative.headline}</h2>
          <p className="insights-story__supporting insights-progress__supporting">{narrative.dek}</p>

          <div className="insights-progress__metaRow">
            <span className="confidence-pill">
              Viewing: <strong>{chamberLabel(chamber)}</strong>
            </span>

            {adjusted?.adjusted?.p != null ? (
              <span className="confidence-pill">
                Adjusted “became law”: <strong>{fmtPct(adjusted.adjusted.p)}</strong>
                <span className="insights-progress__metaSub">
                  {" "}
                  (range {fmtRangePlain(adjusted.adjusted.ciLow, adjusted.adjusted.ciHigh)})
                </span>
              </span>
            ) : (
              <span className="confidence-pill">Adjusted view: —</span>
            )}

            <details className="progress-method">
              <summary className="progress-method__summary">How this is measured</summary>
              <div className="progress-method__body">
                <div className="progress-method__p">
                  We track stage movement among <strong>active</strong> bills in the current snapshot.
                </div>
                <ul className="progress-method__list">
                  <li>
                    <strong>Moved forward</strong>, <strong>Cleared one chamber</strong>, and <strong>Became law</strong>{" "}
                    are calculated using <strong>active bills</strong> as the denominator.
                  </li>
                  <li>
                    <strong>Did not advance</strong> is calculated using <strong>all introduced bills</strong> as the
                    denominator (when available).
                  </li>
                  <li>
                    Ranges reflect statistical uncertainty (commonly reported as a 95% confidence interval).
                  </li>
                </ul>
              </div>
            </details>
          </div>

          <div className="insights-progress__context">{narrative.context}</div>
        </div>
      </div>

      <div className="insights-story__container">
        <div className="insights-progress__grid">
          {/* Evidence first: D3 chart anchored under the narrative */}
          <div className="progress-panel story-surface">
            <div className="progress-panel__title">Where bills are in the process</div>
            <div className="progress-panel__hint">
              This shows the distribution of active bills across key milestones in the legislative pipeline.
            </div>

            {!overall ? (
              <div className="progress-panel__empty">No progress data returned.</div>
            ) : (
              <ProgressStageChartD3 rows={funnelRows} overall={overall} />
            )}
          </div>

          {/* Key rates, plain language */}
          <div className="progress-side" aria-label="Key progress rates">
            {!overall ? (
              <div className="progress-card story-surface">
                <div className="progress-card__label">Key rates</div>
                <div className="progress-card__sub">Not available for this snapshot.</div>
              </div>
            ) : (
              cards.map((c) => (
                <div key={c.key} className="progress-card story-surface">
                  <div className="progress-card__label">{c.label}</div>
                  <div className="progress-card__value">{c.value}</div>
                  <div className="progress-card__sub">{c.sub}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Topics: keep it, but make it read like a briefing */}
        {topics?.length ? (
          <div className="progress-topics">
            <div className="progress-topics__header">
              <div className="progress-topics__title">Where volume is concentrated</div>
              <div className="progress-topics__subtitle">Highest-volume policy areas by active bills in this snapshot.</div>
            </div>

            <div className="progress-topics__grid" role="list" aria-label="Highest-volume policy areas">
              {topics.slice(0, 6).map((t) => (
                <div
                  key={t.policyAreaSlug ?? t.policyAreaName}
                  className="progress-topic story-surface story-surface--soft"
                  role="listitem"
                >
                  <div className="progress-topic__name">{t.policyAreaName ?? "—"}</div>
                  <div className="progress-topic__meta">
                    Active: <strong>{fmtInt(t.counts?.introducedActive ?? 0)}</strong>
                    <span className="dotsep">•</span>
                    Became law: <strong>{fmtPct(t.rates?.enacted?.p)}</strong>
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