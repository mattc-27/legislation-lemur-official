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
 * ✅ Drop-in replacement for VotesSplitSection (STACKED rows)
 *
 * Row 1: Alignment (full width)
 * Row 2: Voting activity + Recent votes (full width, heatmap filters table)
 */
export default function VotesSplitSection({
    alignment, // legacy
    alignmentPanel = null, // new
    votes = [],
    tableInitialLimit = 20,
    votesFreshnessAsOf = null,
    chamberLabel = "",
    heatmapWeeks = 13,
}) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [tableLimit, setTableLimit] = useState(tableInitialLimit);

    useEffect(() => {
        setTableLimit(tableInitialLimit || 20);
    }, [tableInitialLimit]);

    const vizVotes = votes ?? [];
    const asOfLabel = fmtAsOf(votesFreshnessAsOf);
    const alignmentValue = alignmentPanel ?? alignment ?? null;

    const filteredVotes = useMemo(() => {
        if (!selectedDate) return vizVotes;
        return vizVotes.filter((v) => getVoteDateKey(v) === selectedDate);
    }, [vizVotes, selectedDate]);

    const tableVotes = useMemo(() => {
        if (selectedDate) return filteredVotes;
        const limit = tableLimit || tableInitialLimit || 20;
        return filteredVotes.slice(0, limit);
    }, [filteredVotes, selectedDate, tableLimit, tableInitialLimit]);

    const canShowMore =
        !selectedDate && filteredVotes.length > (tableLimit || tableInitialLimit || 20);

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
        <section className="llm3-votesSplit llm3-votesSplit--stacked" aria-label="Votes overview">
            {/* ROW 1: Alignment */}
            <div className="llm3-votesSplit__row llm3-votesSplit__row--alignment">
                <VoteAlignmentPanel value={alignmentValue} chamber={chamberLabel} />
            </div>

            {/* ROW 2: Activity + table */}
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
                                "Daily voting activity over the last 90 days. Darker squares indicate more votes on that day."
                            )}
                        </div>
                    </div>

                    <div className="llm3-votesSplit__metaBlock">
                        <div className="llm3-votesSplit__metaText">
                            {heatmapWeeks <= 13 ? "Last 90 days" : "Last year"}
                            {asOfLabel ? ` • Updated ${asOfLabel}` : ""}
                        </div>
                    </div>
                </div>

                <div className="llm3-votesSplit__heatWrap">
                    <VotesHeatmap
                        votes={vizVotes}
                        weeks={heatmapWeeks}
                        height={260}
                        heatmapRatio={0.87}
                        onSelectDay={(key) => {
                            setSelectedDate((prev) => (prev === key ? null : key));
                        }}
                        selectedDate={selectedDate}
                        title={null}
                        compactLegend
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

                <div className="llm3-tableFrame llm3-tableFrame--tight">
                    <VotesTable votes={tableVotes} />
                </div>

                {canShowMore && (
                    <button
                        className="ll3-linkbtn llm3-moreBtn"
                        type="button"
                        onClick={() =>
                            setTableLimit((n) => (n || tableInitialLimit || 20) + (tableInitialLimit || 20))
                        }
                    >
                        Show more votes
                    </button>
                )}
            </div>
        </section>
    );
}