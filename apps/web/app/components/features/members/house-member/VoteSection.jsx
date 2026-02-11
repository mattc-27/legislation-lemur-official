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
  tableInitialLimit = 20,   // sensible default
  freshnessAsOf = null,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [tableLimit, setTableLimit] = useState(tableInitialLimit);

  // keep tableLimit in sync if the prop changes
  useEffect(() => {
    setTableLimit(tableInitialLimit || 20);
  }, [tableInitialLimit]);

  const vizVotes = votes ?? [];

  // 1) Base set of votes for the table (depends on selected date)
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

  // 2) Actually displayed rows
  const tableVotes = useMemo(() => {
    if (selectedDate) {
      // when you click a day, show ALL votes for that day
      return baseTable;
    }
    const limit = tableLimit || tableInitialLimit || 20;
    return baseTable.slice(0, limit);
  }, [baseTable, selectedDate, tableLimit, tableInitialLimit]);

  // 3) Whether to show the button
  const canShowMore =
    !selectedDate && baseTable.length > (tableLimit || tableInitialLimit || 20);

  const asOfLabel = fmtAsOf(freshnessAsOf);

  return (
    <section className="llmp3-card">
      <div className="llmp3-card__head">
        <h3 className="llmp3-h2" style={{ margin: 0 }}>Recent votes</h3>
        <div className="llmp3-asof">
          Includes floor votes for the last year
          {asOfLabel ? ` • Updated ${asOfLabel}` : ""}
        </div>
      </div>

      <div className="member_votes-row">
        <div className="votes-viz">
          <VotesHeatmap
            votes={vizVotes}
            weeks={52}
            height={320}
            heatmapRatio={0.7}
            onSelectDay={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        <div className="votes-list">
          {selectedDate && (
            <div className="chip" onClick={() => setSelectedDate(null)}>
              {new Date(selectedDate).toLocaleDateString()} • Clear
            </div>
          )}

          <div className="votes-table-wrap">
            <VotesTable votes={tableVotes} />
          </div>

          {canShowMore && (
            <button
              className="llmp3-linkbtn"
              type="button"
              onClick={() => setTableLimit((n) => (n || tableInitialLimit || 20) + (tableInitialLimit || 20))}
            >
              Show more votes
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
