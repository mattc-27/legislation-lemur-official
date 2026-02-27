// apps/web/app/components/features/insights/client/InsightsShellClient.jsx
"use client";

import { useEffect, useRef, useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import InsightsHeroNew from "../InsightsHeroNew";
import InsightsPulseSection from "../InsightsPulseSection";
import TransitionalBanner1 from "../TransitionalBanner1";
import TransitionalBanner2 from "../TransitionalBanner2";
import InsightsProgressSection from "../InsightsProgressSection";
import InsightsTopicFocusSection from "../InsightsTopicFocusSection";
import InsightsExploreFurtherSection from "../InsightsExploreFurtherSection";
import { useResizeObserver } from "../hooks/useResizeObserver";

// -------------------------
// helpers
// -------------------------
function clampChamber(x) {
    return x === "house" || x === "senate" || x === "all" ? x : "all";
}
function clampInt(x, fallback = 0) {
    const n = Number(x);
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
}
function buildInsightsQS({ congress, chamber, windowDays }) {
    const p = new URLSearchParams();
    p.set("congress", String(congress));
    p.set("chamber", chamber);
    p.set("windowDays", String(windowDays));
    return `?${p.toString()}`;
}

async function fetchBriefing({ congress, chamber, windowDays, signal }) {
    const qs = new URLSearchParams({
        congress: String(congress),
        chamber,
        windowDays: String(windowDays),
    });

    const res = await fetch(`/api/insights/briefing?${qs.toString()}`, {
        method: "GET",
        cache: "no-store",
        signal,
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Briefing fetch failed (${res.status}): ${txt.slice(0, 160)}`);
    }
    return res.json();
}

function adaptLegacyBriefingToV1(raw) {
    if (!raw) return null;

    if (
        raw?.sections?.pulse?.series &&
        (raw?.sections?.pulse?.headlinesByWindow || raw?.sections?.pulse?.headline)
    ) {
        return raw;
    }

    // legacy adapter (v0 -> v1)
    const congress = Number(raw?.meta?.congress ?? 119);
    const chamber = raw?.meta?.chamber ?? "all";
    const windowDays = Number(raw?.meta?.windowDays ?? 30);
    const asOfDate = raw?.meta?.updatedAt ?? null;

    const series = (raw?.activityWeekly || []).map((r) => ({
        periodStart: String(r.week).slice(0, 10),
        introduced: Number(r.introduced ?? 0),
        actioned: Number(r.actions ?? 0),
    }));

    const introCur = Number(raw?.snapshot?.introducedWindow ?? 0);
    const actCur = Number(raw?.snapshot?.actedWindow ?? 0);

    const headline = {
        asOfDate: asOfDate ? String(asOfDate).slice(0, 10) : null,
        windowDays,
        chamber,
        introduced: {
            current: introCur,
            baselineAvg: null,
            rr: null,
            rrCiLow: null,
            rrCiHigh: null,
            deltaPct: null,
            state: "consistent",
            flags: [],
        },
        actioned: {
            current: actCur,
            baselineAvg: null,
            rr: null,
            rrCiLow: null,
            rrCiHigh: null,
            deltaPct: null,
            state: "consistent",
            flags: [],
        },
        state: "ok",
    };

    return {
        congress,
        chamber,
        asOfDate: headline.asOfDate,
        windowDays,
        sections: {
            pulse: { series, headline },
            progress: null,
            topicFocus: null,
        },
    };
}

// -------------------------
// component
// -------------------------
export default function InsightsShellClient({ briefing }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const adapted = adaptLegacyBriefingToV1(briefing);

    const initialCongress = clampInt(adapted?.congress, 119);
    const initialWindowDays = clampInt(adapted?.windowDays, 30);
    const initialChamber = clampChamber(adapted?.chamber || "all");

    const [state, setState] = useState(() => ({
        briefing: adapted,
        congress: initialCongress,
        windowDays: initialWindowDays,
        chamber: initialChamber,
        asOfDate: adapted?.asOfDate ?? null,
        status: "ready",
        error: null,
    }));

    const abortRef = useRef(null);
    const [isPending, startTransition] = useTransition();

    const shellRef = useRef(null);
    useResizeObserver(shellRef); // still useful for layout hooks; no GSAP refresh needed

    const spKey = searchParams?.toString?.() ?? "";

    useEffect(() => {
        const spCongress = clampInt(searchParams?.get("congress") ?? initialCongress, initialCongress);
        const spWindowDays = clampInt(searchParams?.get("windowDays") ?? initialWindowDays, initialWindowDays);
        const spChamber = clampChamber(searchParams?.get("chamber") ?? initialChamber);

        const needsSync =
            spCongress !== state.congress ||
            spWindowDays !== state.windowDays ||
            spChamber !== state.chamber;

        if (!needsSync) return;

        void setControlsAndRefetch({
            congress: spCongress,
            chamber: spChamber,
            windowDays: spWindowDays,
            pushUrl: false,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spKey]);

    async function setControlsAndRefetch({
        congress = state.congress,
        chamber,
        windowDays = state.windowDays,
        pushUrl = true,
    }) {
        const nextChamber = clampChamber(chamber);

        if (abortRef.current) abortRef.current.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        setState((prev) => ({
            ...prev,
            chamber: nextChamber,
            congress,
            windowDays,
            status: "loading",
            error: null,
        }));

        if (pushUrl) {
            const qs = buildInsightsQS({ congress, chamber: nextChamber, windowDays });
            startTransition(() => {
                router.replace(`/insights${qs}`, { scroll: false });
            });
        }

        try {
            const raw = await fetchBriefing({ congress, chamber: nextChamber, windowDays, signal: ac.signal });
            const nextBriefing = adaptLegacyBriefingToV1(raw);
            if (!nextBriefing) throw new Error("Insights briefing adapter returned null.");

            setState((prev) => ({
                ...prev,
                briefing: nextBriefing,
                asOfDate: nextBriefing?.asOfDate ?? prev.asOfDate,
                status: "ready",
                error: null,
            }));
        } catch (err) {
            if (err?.name === "AbortError") return;

            setState((prev) => ({
                ...prev,
                status: "error",
                error: err?.message || "Failed to refresh Insights data.",
            }));
        } finally {
            if (abortRef.current === ac) abortRef.current = null;
        }
    }

    const loading = state.status === "loading" || isPending;

    const pulse = state.briefing?.sections?.pulse ?? null;
    const progress = state.briefing?.sections?.progress ?? null;
    const topicFocus = state.briefing?.sections?.topicFocus ?? null;

    const heroMicro = useMemo(() => {
        const asOf = state.asOfDate ? `As of ${state.asOfDate}` : "Data refreshed daily";
        return `${asOf} • Congress ${state.congress} • ${state.windowDays}d window`;
    }, [state.asOfDate, state.congress, state.windowDays]);

    return (
        <div ref={shellRef} className={`insights-shell ${loading ? "is-loading" : ""}`}>
            <main>
                <InsightsHeroNew micro={heroMicro} />

                {pulse ? (
                    <InsightsPulseSection
                        pulse={pulse}
                        chamber={state.chamber}
                        congress={state.congress}
                        onChamberChange={(next) => setControlsAndRefetch({ chamber: next, pushUrl: true })}
                    />
                ) : null}

                <TransitionalBanner1 />

                <InsightsProgressSection progress={progress} chamber={state.chamber} />

                <TransitionalBanner2 />

                <InsightsTopicFocusSection topicFocus={topicFocus} chamber={state.chamber} />

                <InsightsExploreFurtherSection />
            </main>

            {state.status === "error" ? (
                <div className="insights-error" role="status">
                    <div className="insights-error__title">Couldn’t refresh data</div>
                    <div className="insights-error__msg">{state.error}</div>
                </div>
            ) : null}
        </div>
    );
}