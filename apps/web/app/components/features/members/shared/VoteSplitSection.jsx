"use client";

import { useMemo, useState, useEffect } from "react";
import VotesHeatmap from "../house-member/VotesHeatmap";
import VotesTable from "../house-member/VotesTable";
import VoteAlignmentPanel from "../house-member/VoteAlignmentUpdated";

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

function getVoteDateKey(v) {
    const raw =
        v?.voted_at ??
        v?.date ??
        v?.votedAt ??
        v?.vote_date ??
        v?.voteDate ??
        null;
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
}

/**
 * Member votes + visualization section.
 *
 * mode="page" keeps the full direct-page layout.
 * mode="panel" uses a compact drawer-friendly heatmap, alignment panel, and vote list.
 */
export default function VotesSplitSection({
    alignment, // legacy
    alignmentPanel = null, // new
    votes = [],
    tableInitialLimit = 20,
    votesFreshnessAsOf = null,
    chamberLabel = "",
    heatmapWeeks = 13,
    mode = "page",
}) {
    const isPanel = mode === "panel";
    const effectiveInitialLimit = isPanel
        ? Math.min(tableInitialLimit || 20, 12)
        : tableInitialLimit || 20;
    const heatmapDays = isPanel ? Math.min(heatmapWeeks * 7, 70) : heatmapWeeks <= 13 ? 90 : 365;
    const heatmapHeight = isPanel ? 188 : 260;

    const [selectedDate, setSelectedDate] = useState(null);
    const [tableLimit, setTableLimit] = useState(effectiveInitialLimit);

    useEffect(() => {
        setTableLimit(effectiveInitialLimit);
    }, [effectiveInitialLimit]);

    const vizVotes = votes ?? [];
    const asOfLabel = fmtAsOf(votesFreshnessAsOf);
    const alignmentValue = alignmentPanel ?? alignment ?? null;

    const filteredVotes = useMemo(() => {
        if (!selectedDate) return vizVotes;
        return vizVotes.filter((v) => getVoteDateKey(v) === selectedDate);
    }, [vizVotes, selectedDate]);

    const tableVotes = useMemo(() => {
        if (selectedDate) return filteredVotes;
        const limit = tableLimit || effectiveInitialLimit;
        return filteredVotes.slice(0, limit);
    }, [filteredVotes, selectedDate, tableLimit, effectiveInitialLimit]);

    const canShowMore = !selectedDate && filteredVotes.length > (tableLimit || effectiveInitialLimit);

    const selectedLabel = useMemo(() => {
        if (!selectedDate) return null;
        const d = new Date(selectedDate);
        if (Number.isNaN(d.getTime())) return selectedDate;
        return d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }, [selectedDate]);

    return (
        <section
            className={`llm3-votesSplit llm3-votesSplit--stacked llm3-votesSplit--${mode}`}
            data-mode={mode}
            aria-label="Votes overview"
        >
            <div className="llm3-votesSplit__row llm3-votesSplit__row--alignment">
                <VoteAlignmentPanel value={alignmentValue} chamber={chamberLabel} mode={mode} />
            </div>

            <div className="llm3-votesSplit__row llm3-votesSplit__row--activity llmp3-card">
                <div className="llmp3-card__head llm3-cardHead llm3-votesSplit__rightHead">
                    <div className="llm3-votesSplit__titleBlock">
                        <h3 className="llm3-h2" style={{ margin: 0 }}>
                            Voting activity
                        </h3>
                        <div className="llm3-muted">
                            {selectedDate ? (
                                <>
                                    Showing votes from <strong>{selectedLabel}</strong>
                                    <button
                                        type="button"
                                        className="llm3-linkInline"
                                        onClick={() => setSelectedDate(null)}
                                        title="Clear date filter"
                                    >
                                        Clear
                                    </button>
                                </>
                            ) : (
                                `Daily voting activity over the last ${heatmapDays} days. Darker squares indicate more votes on that day.`
                            )}
                        </div>
                    </div>

                    <div className="llm3-votesSplit__metaBlock">
                        <div className="llm3-votesSplit__metaText">
                            {isPanel ? `Last ${heatmapDays} days` : heatmapWeeks <= 13 ? "Last 90 days" : "Last year"}
                            {asOfLabel ? ` • Updated ${asOfLabel}` : ""}
                        </div>
                    </div>
                </div>

                <div className="llm3-votesSplit__heatWrap">
                    <VotesHeatmap
                        votes={vizVotes}
                        days={heatmapDays}
                        height={heatmapHeight}
                        mode={mode}
                        onSelectDay={(key) => {
                            setSelectedDate((prev) => (prev === key ? null : key));
                        }}
                        selectedDate={selectedDate}
                        title={null}
                        updatedLabel={null}
                        compactLegend={isPanel}
                        showSummary={!isPanel}
                    />
                </div>

                <div className="llm3-votesSplit__divider" />

                <div className="llmp3-card__head llm3-cardHead llm3-votesSplit__tableHead">
                    <h3 className="llm3-h2" style={{ margin: 0 }}>
                        Recent votes
                    </h3>
                    <div className="llm3-asof">
                        {selectedDate ? "Filtered by selected day" : "Most recent first"}
                    </div>
                </div>

                <div className="llm3-tableFrame llm3-tableFrame--tight llm3-votesSplit__tableFrame">
                    <VotesTable votes={tableVotes} mode={mode} />
                </div>

                {canShowMore && (
                    <div className="llm3-votesSplit__footer">
                        <button
                            className="ll3-linkbtn llm3-moreBtn"
                            type="button"
                            onClick={() => setTableLimit((n) => (n || effectiveInitialLimit) + effectiveInitialLimit)}
                        >
                            Show more votes
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
