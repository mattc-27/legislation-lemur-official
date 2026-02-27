// apps/web/app/components/features/insights/InsightsTopicFocusSection.jsx
"use client";

import { useMemo } from "react";

function fmtPctShare(p) {
    if (p == null || !Number.isFinite(p)) return "—";
    return `${(p * 100).toFixed(1)}%`;
}

function fmtSignedPP(diff) {
    if (diff == null || !Number.isFinite(diff)) return "—";
    const pp = diff * 100;
    const sign = pp > 0 ? "+" : "";
    return `${sign}${pp.toFixed(1)} pp`;
}

function chamberLabel(chamber) {
    if (chamber === "house") return "House only";
    if (chamber === "senate") return "Senate only";
    return "Congress (All)";
}

function fmtCoverage(cov) {
    if (!cov) return "Coverage: —";
    const pct = cov.classifiedPct;
    const parts = [];
    if (pct != null) parts.push(`${pct.toFixed(1)}% classified`);
    if (cov.introClassified != null && cov.introTotal != null) {
        parts.push(`${cov.introClassified}/${cov.introTotal}`);
    }
    return `Coverage: ${parts.join(" • ")}`;
}

function coverageTone(cov) {
    return cov?.state || "unknown"; // good | partial | low | unknown
}

function isUnknownTopic(t) {
    const slug = String(t?.policyAreaSlug ?? "").trim().toLowerCase();
    const name = String(t?.policyAreaName ?? "").trim().toLowerCase();
    return (
        slug === "unknown" ||
        slug === "unclassified" ||
        slug === "__unknown__" ||
        name === "unknown" ||
        name === "unclassified" ||
        name === "not classified"
    );
}

function withUnknownMovedToBottom(items) {
    const known = [];
    const unknown = [];
    for (const it of items ?? []) (isUnknownTopic(it) ? unknown : known).push(it);
    return known.concat(unknown);
}

function displayTopicName(t) {
    if (isUnknownTopic(t)) return "Unclassified";
    return t?.policyAreaName ?? "—";
}

function deltaToneFromDiff(diff) {
    if (diff == null || !Number.isFinite(diff)) return "flat";
    return diff > 0 ? "pos" : diff < 0 ? "neg" : "flat";
}

function clampPct(n) {
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
}

export default function InsightsTopicFocusSection({ topicFocus, chamber = "all" }) {
    const coverage = topicFocus?.coverage ?? null;
    const covTone = coverageTone(coverage);

    const rawItems = topicFocus?.items ?? [];
    const itemsForDist = useMemo(() => withUnknownMovedToBottom(rawItems), [rawItems]);
    const itemsForHeadline = useMemo(() => rawItems.filter((t) => !isUnknownTopic(t)), [rawItems]);
    const top3 = useMemo(() => itemsForHeadline.slice(0, 3), [itemsForHeadline]);

    const headline = useMemo(() => {
        if (!top3.length) return "Topic focus cannot be estimated reliably right now.";
        if (covTone === "low") return "Topic focus is still coming into view as classifications are added.";

        const a = top3[0]?.policyAreaName ?? "—";
        const b = top3[1]?.policyAreaName ?? null;

        if (!b) {
            return covTone === "partial" ? `${a} is leading among classified bills this month.` : `${a} led introductions this month.`;
        }

        return covTone === "partial"
            ? `${a} and ${b} are leading among classified bills this month.`
            : `${a} and ${b} led introductions this month.`;
    }, [top3, covTone]);

    const supporting = useMemo(() => {
        const wd = topicFocus?.windowDays ?? 30;
        if (covTone === "low") {
            return `This view summarizes policy area distribution for the past ${wd} days, but many recent bills have not been classified yet.`;
        }
        return `Topic shares reflect the distribution of bill introductions over the past ${wd} days among bills with an assigned policy area, compared to a baseline window.`;
    }, [topicFocus?.windowDays, covTone]);

    const showUnclassifiedNote =
        coverage?.introTotal != null && coverage?.introClassified != null && covTone !== "good";

    return (
        <section className="insights-topic" data-section="topicFocus">
            <div className="story-titlePanel insights-topic__titlePanel">
                <div className="insights-story__container">
                    <div className="insights-section-label">
                        <div className="insights-section-label__kicker">Section III</div>
                        <div className="insights-section-label__title">Topic Focus</div>
                    </div>

                    <h2 className="insights-story__headline insights-topic__headline">{headline}</h2>
                    <p className="insights-story__supporting insights-topic__supporting">{supporting}</p>

                    {showUnclassifiedNote ? (
                        <div className="insights-topic__note">
                            “Unclassified” reflects bills without an assigned policy area in the source data.
                        </div>
                    ) : null}

                    <div className="insights-topic__metaRow">
                        <span className="confidence-pill">
                            Viewing: <strong>{chamberLabel(chamber)}</strong>
                        </span>
                        <span className={`confidence-pill tone-${covTone}`}>{fmtCoverage(coverage)}</span>

                        {top3[0]?.change?.diff != null ? (
                            <span className="confidence-pill">
                                Top topic shift: <strong>{fmtSignedPP(top3[0].change.diff)}</strong>
                            </span>
                        ) : (
                            <span className="confidence-pill">Top topic shift: —</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="insights-story__container">
                <div className="topic-spotlight">
                    {top3.length ? (
                        top3.map((t, idx) => {
                            const diff = t?.change?.diff;
                            const deltaTone = deltaToneFromDiff(diff);

                            return (
                                <div key={t.policyAreaSlug ?? idx} className="topic-spot story-surface story-surface--soft">
                                    <div className="topic-spot__head">
                                        <div className="topic-spot__name">{displayTopicName(t)}</div>
                                        <div className="topic-spot__vals">
                                            <span className="topic-spot__share">{fmtPctShare(t.current?.share)}</span>
                                            <span className={`topic-spot__delta is-${deltaTone}`}>{fmtSignedPP(diff)}</span>
                                        </div>
                                    </div>

                                    <div className="topic-spot__barWrap" aria-hidden="true">
                                        <div
                                            className="topic-spot__bar"
                                            style={{
                                                width: `${clampPct(Math.max(2, (t.current?.share ?? 0) * 100))}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="topic-spot__sub">
                                        Baseline: <strong>{fmtPctShare(t.baseline?.share)}</strong>
                                        <span className="dotsep">•</span>
                                        p={t.change?.pValue != null ? t.change.pValue.toFixed(3) : "—"}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="topic-empty story-surface">No topic focus data returned.</div>
                    )}
                </div>

                <div className="topic-dist story-surface">
                    <div className="topic-dist__title">Ranked distribution</div>

                    <div className="topic-dist__grid" role="list" aria-label="Ranked policy areas">
                        {itemsForDist.slice(0, 12).map((t, i) => (
                            <div key={t.policyAreaSlug ?? `${t.policyAreaName}-${i}`} className="topic-row" role="listitem">
                                <div className="topic-row__name">{displayTopicName(t)}</div>

                                <div className="topic-row__barWrap" aria-hidden="true">
                                    <div
                                        className="topic-row__bar"
                                        style={{
                                            width: `${clampPct(Math.max(1, (t.current?.share ?? 0) * 100))}%`,
                                        }}
                                    />
                                </div>

                                <div className="topic-row__vals">
                                    <span className="topic-row__share">{fmtPctShare(t.current?.share)}</span>
                                    <span className="topic-row__delta">{fmtSignedPP(t.change?.diff)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="insights-topic__pad" aria-hidden="true" />
            </div>
        </section>
    );
}