import SearchResultCard from "./SearchResultCard";

const SECTIONS = [
  ["Bills", "bills"],
  ["Members", "members"],
  ["Committees", "committees"],
  ["Seats", "seats"],
];

function ResultSection({ title, rows = [] }) {
  if (!rows?.length) return null;

  return (
    <section className="ll3-searchSection">
      <div className="ll3-searchSection__head">
        <h2>{title}</h2>
        <span className="ll3-searchSection__count">{rows.length}</span>
      </div>

      <div className="ll3-searchSection__list">
        {rows.map((item) => (
          <SearchResultCard
            key={item.search_document_id || `${item.entity_type}-${item.entity_id}`}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}

export default function SearchResultsGrouped({ grouped = {} }) {
  return (
    <>
      {SECTIONS.map(([title, key]) => (
        <ResultSection key={key} title={title} rows={grouped[key] || []} />
      ))}
    </>
  );
}