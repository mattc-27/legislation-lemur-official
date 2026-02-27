// components/member/VotesSection.jsx
"use client";
import { useMemo, useState, useEffect } from "react";
import VotesHeatmap from "./VotesHeatmap";
import VotesTable from "./VotesTable";

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

export default function VotesSection({
  votes = [],
  tableInitialLimit = 20,
  freshnessAsOf = null,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [tableLimit, setTableLimit] = useState(tableInitialLimit);

  useEffect(() => {
    setTableLimit(tableInitialLimit || 20);
  }, [tableInitialLimit]);

  const vizVotes = votes ?? [];

  const baseTable = useMemo(() => {
    if (!selectedDate) return vizVotes;

    return vizVotes.filter((v) => {
      const raw =
        v?.voted_at ??
        v?.date ??
        v?.votedAt ??
        v?.vote_date ??
        v?.voteDate ??
        null;
      if (!raw) return false;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return false;
      const key = d.toISOString().slice(0, 10);
      return key === selectedDate;
    });
  }, [vizVotes, selectedDate]);

  const tableVotes = useMemo(() => {
    if (selectedDate) return baseTable;
    const limit = tableLimit || tableInitialLimit || 20;
    return baseTable.slice(0, limit);
  }, [baseTable, selectedDate, tableLimit, tableInitialLimit]);

  const canShowMore =
    !selectedDate && baseTable.length > (tableLimit || tableInitialLimit || 20);

  const asOfLabel = fmtAsOf(freshnessAsOf);

  return (
    <section className="llmp3-card llm3-votes">
      <div className="llmp3-card__head llm3-cardHead">
        <h3 className="llm3-h2" style={{ margin: 0 }}>
          Recent votes
        </h3>
        <div className="llm3-asof">
          Includes floor votes for the last year
          {asOfLabel ? ` • Updated ${asOfLabel}` : ""}
        </div>
      </div>

      <div className="llm3-votesRow">
        {/* Viz */}
        <div className="llm3-votesViz">
          <div className="llm3-votesViz__frame" aria-label="Voting activity heatmap">
            <VotesHeatmap
              votes={vizVotes}
              weeks={52}
              height={320}
              heatmapRatio={0.7}
              onSelectDay={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>
        </div>

        {/* Table */}
        <div className="llm3-votesTable">
          {selectedDate && (
            <button
              type="button"
              className="llm3-chipBtn"
              onClick={() => setSelectedDate(null)}
              title="Clear date filter"
            >
              <span className="llm3-chipBtn__label">
                {new Date(selectedDate).toLocaleDateString()}
              </span>
              <span className="llm3-chipBtn__sep" aria-hidden="true" />
              <span className="llm3-chipBtn__action">Clear</span>
            </button>
          )}

          <div className="llm3-tableFrame">
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
      </div>
    </section>
  );
}