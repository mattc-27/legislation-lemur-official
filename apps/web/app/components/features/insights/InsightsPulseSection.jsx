// apps/web/app/components/features/insights/InsightsPulseSection.jsx
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import PulseTimeSeriesV1 from "./client/PulseTimeSeriesV1";

function subjectFromChamber(chamber) {
    return chamber === "house" ? "House" : chamber === "senate" ? "Senate" : "Congress";
}

function chamberLabel(chamber) {
    if (chamber === "house") return "House only";
    if (chamber === "senate") return "Senate only";
    return "Congress (All)";
}

function headlineFromIntroState(subject, state) {
    if (state === "above_baseline") return `${subject} legislative activity is trending above recent averages.`;
    if (state === "below_baseline") return `${subject} legislative activity is trending below recent averages.`;
    if (state === "low_n") return `${subject} legislative activity is within expected variation (low sample).`;
    if (state === "insufficient_data") return `${subject} activity cannot be estimated reliably right now.`;
    return `${subject} legislative activity is consistent with recent averages.`;
}

function fmtSignedPct(p) {
    if (p == null || !Number.isFinite(p)) return "—";
    const sign = p > 0 ? "+" : "";
    return `${sign}${p.toFixed(1)}%`;
}

function fmtCiPct(rrCiLow, rrCiHigh) {
    if (rrCiLow == null || rrCiHigh == null) return "—";
    const lo = (rrCiLow - 1) * 100;
    const hi = (rrCiHigh - 1) * 100;
    const s = (x) => (x > 0 ? `+${x.toFixed(0)}` : `${x.toFixed(0)}`);
    return `${s(lo)}% to ${s(hi)}%`;
}

function pickHeadline(pulse, wd) {
    if (!pulse) return null;
    const by = pulse?.headlinesByWindow ?? pulse?.headlineByWindow ?? null;
    if (by && by[wd]) return by[wd];
    return pulse?.headline ?? null;
}

function deltaTone(state) {
    // aligns to your existing state-* classes but adds a safe mapping
    if (state === "above_baseline") return "up";
    if (state === "below_baseline") return "down";
    if (state === "insufficient_data") return "mute";
    if (state === "low_n") return "mute";
    return "flat";
}

export default function InsightsPulseSection({ pulse, chamber = "all", onChamberChange }) {
    const chartRef = useRef(null);

    const sectionId = useId().replace(/:/g, "");
    const guideId = `pulseGuide-${sectionId}`;
    const legendId = `pulseLegend-${sectionId}`;
    const chartTitleId = `pulseChartTitle-${sectionId}`;

    const [windowMode, setWindowMode] = useState(30); // 30 | 365

    const subject = useMemo(() => subjectFromChamber(chamber), [chamber]);

    const headline30 = useMemo(() => pickHeadline(pulse, 30), [pulse]);
    const headline365 = useMemo(() => pickHeadline(pulse, 365), [pulse]);
    const has365 = !!headline365;

    // keep mode valid if server lacks 365
    useEffect(() => {
        if (windowMode === 365 && !has365) setWindowMode(30);
    }, [windowMode, has365]);

    const headlineObj = useMemo(() => {
        if (windowMode === 365 && headline365) return headline365;
        return headline30 ?? pulse?.headline ?? null;
    }, [windowMode, headline365, headline30, pulse]);

    const intro = headlineObj?.introduced;
    const act = headlineObj?.actioned;

    const headline = useMemo(() => {
        const diverging = headlineObj?.state === "diverging";
        if (diverging) return `${subject} introductions and actions are moving in opposite directions.`;
        const s = intro?.state || "consistent";
        return headlineFromIntroState(subject, s);
    }, [headlineObj?.state, intro?.state, subject]);

    const supporting = useMemo(() => {
        const wd = headlineObj?.windowDays ?? windowMode;
        const cur = intro?.current ?? 0;
        const delta = intro?.deltaPct;
        const ci = fmtCiPct(intro?.rrCiLow, intro?.rrCiHigh);
        return `Over the past ${wd} days, ${cur} bills were introduced — ${fmtSignedPct(
            delta
        )} vs baseline (95% CI: ${ci}, n=${cur}).`;
    }, [headlineObj?.windowDays, windowMode, intro?.current, intro?.deltaPct, intro?.rrCiLow, intro?.rrCiHigh]);

    const confidencePill = useMemo(() => {
        const cur = intro?.current ?? 0;
        const ci = fmtCiPct(intro?.rrCiLow, intro?.rrCiHigh);
        const wd = headlineObj?.windowDays ?? windowMode;
        return `Window: ${wd}d • 95% CI: ${ci} • n=${cur}`;
    }, [headlineObj?.windowDays, windowMode, intro?.current, intro?.rrCiLow, intro?.rrCiHigh]);

    const cards = useMemo(() => {
        const wd = headlineObj?.windowDays ?? windowMode;
        return [
            {
                key: "introduced",
                label: `Introductions (${wd}d)`,
                value: intro?.current ?? 0,
                delta: intro?.deltaPct,
                state: intro?.state,
                ci: fmtCiPct(intro?.rrCiLow, intro?.rrCiHigh),
            },
            {
                key: "actioned",
                label: `Actions (${wd}d)`,
                value: act?.current ?? 0,
                delta: act?.deltaPct,
                state: act?.state,
                ci: fmtCiPct(act?.rrCiLow, act?.rrCiHigh),
            },
        ];
    }, [headlineObj?.windowDays, windowMode, intro, act]);

    function handleMode(next) {
        const n = next === 365 ? 365 : 30;
        setWindowMode(n);
        if (n === 365) chartRef.current?.zoomOut?.();
        else chartRef.current?.zoomIn?.();
    }

    async function handleChamber(next) {
        if (!onChamberChange) return;
        if (next === chamber) return;
        await onChamberChange(next);

        // keep the chart mode after chamber switch
        if (windowMode === 365) chartRef.current?.zoomOut?.();
        else chartRef.current?.zoomIn?.();
    }

    return (
        <section className="insights-pulse ll3-insights-section" data-section="pulse" aria-labelledby={guideId}>
            <div className="ll3-insights-section__inner">
                {/* Title / narrative panel */}
                <header className="ll3-insights-section__head">
                    <div className="insights-section-label">
                        <div className="insights-section-label__kicker">Section I</div>
                        <div className="insights-section-label__title">Legislative Activity</div>
                    </div>

                    <h2 className="insights-pulse__headline">{headline}</h2>
                    <p className="insights-pulse__supporting">{supporting}</p>

                    <div className="insights-pulse__headMeta">
                        <span className="confidence-pill">
                            Viewing: <strong>{chamberLabel(chamber)}</strong>
                        </span>
                        <span className={`confidence-pill state-${intro?.state || "consistent"}`}>{confidencePill}</span>
                    </div>

                    <div className="insights-pulse__chartLegend" id={legendId} aria-label="Chart legend">
                        <span className="legendItem">
                            <span className="legendSwatch legendSwatch--a" aria-hidden="true" />
                            Introductions
                        </span>
                        <span className="legendItem">
                            <span className="legendSwatch legendSwatch--b" aria-hidden="true" />
                            Actions
                        </span>
                    </div>
                </header>

                {/* Main layout */}
                <div className="insights-pulse__main">
                    <div className="insights-pulse__grid">
                        {/* Left: chart */}
                        <div className="insights-pulse__chartCol">
                            <div className="insights-pulse__chartTitleRow">
                                <div className="insights-pulse__chartTitle" id={chartTitleId}>
                                    Legislative Activity Over Time
                                </div>

                                <div className="insights-pulse__chartControls">
                                    <div className="segmented" role="group" aria-label="Time window">
                                        <button
                                            type="button"
                                            className={`segmented__btn ${windowMode === 30 ? "is-active" : ""}`}
                                            aria-pressed={windowMode === 30}
                                            onClick={() => handleMode(30)}
                                        >
                                            30d
                                        </button>
                                        <button
                                            type="button"
                                            className={`segmented__btn ${windowMode === 365 ? "is-active" : ""}`}
                                            aria-pressed={windowMode === 365}
                                            onClick={() => handleMode(365)}
                                            disabled={!has365}
                                            title={!has365 ? "Year view not available for this payload" : undefined}
                                        >
                                            365d
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="insights-pulse__chartWrap"
                                aria-describedby={guideId}
                                aria-labelledby={chartTitleId}
                                role="img"
                            >
                                <PulseTimeSeriesV1
                                    ref={chartRef}
                                    rows={pulse?.series || []}
                                    height={360}
                                    recentPoints={6}
                                    fullPoints={52}
                                />
                            </div>

                            <div className="insights-pulse__controlsRow">
                                <div className="insights-pulse__controls" role="group" aria-label="Chamber view">
                                    <SegmentedRadio
                                        value={chamber}
                                        onChange={handleChamber}
                                        options={[
                                            { value: "all", label: "All" },
                                            { value: "house", label: "House" },
                                            { value: "senate", label: "Senate" },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right: guide + cards */}
                        <aside className="insights-pulse__sideCol">
                            <div className="pulse-descCard">
                                <div className="pulse-descCard__label">Summary</div>
                                <div className="pulse-descCard__text" id={guideId}>
                                    Reading guide: the lines show introductions vs actions. The cards summarize the last{" "}
                                    {headlineObj?.windowDays ?? windowMode} days.
                                </div>

                                <div className="pulse-descCard__meta">
                                    <span className={`confidence-pill is-compact state-${intro?.state || "consistent"}`}>
                                        {confidencePill}
                                    </span>
                                    <button className="method-link" type="button" aria-label="View method details">
                                        Method
                                    </button>
                                </div>
                            </div>

                            <div className="insights-pulse__cards" aria-label="Summary metrics">
                                {cards.map((c) => {
                                    const tone = deltaTone(c.state);
                                    return (
                                        <div key={c.key} className="pulse-card">
                                            <div className="pulse-card__label">{c.label}</div>
                                            <div className="pulse-card__value">{c.value}</div>
                                            <div className="pulse-card__sub">
                                                <span className={`delta is-${tone}`}>{fmtSignedPct(c.delta)}</span>
                                                <span className="ci">95% CI: {c.ci}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="insights-pulse__viewingSmall">
                                Viewing: <strong>{chamberLabel(chamber)}</strong>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SegmentedRadio({ value, onChange, options, disabled }) {
    const groupId = useId().replace(/:/g, "");
    return (
        <div className={`segmented ${disabled ? "is-disabled" : ""}`} role="radiogroup" aria-label="Chamber selection">
            {options.map((opt) => {
                const active = opt.value === value;
                return (
                    <button
                        key={opt.value}
                        id={`${groupId}-${opt.value}`}
                        type="button"
                        className={`segmented__btn ${active ? "is-active" : ""}`}
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(opt.value)}
                        disabled={disabled}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}