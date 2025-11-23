"use client";
import { useMemo, useState, useEffect } from "react";
import VotesHeatmap from "./VotesHeatmap";
import VotesTable from "./VotesTable";

export default function VotesSection({
  votes = [],
  tableInitialLimit = 20,   // sensible default
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

  return (
    <section className="card card--p-24">
      <h3 className="section-title" style={{ marginBottom: 4 }}>
        Recent votes
      </h3>
      <div className="muted" style={{ fontSize: 12, marginBottom: 16 }}>
        Includes floor votes for the last year
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
              className="btn btn--ghost btn--pill"
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
