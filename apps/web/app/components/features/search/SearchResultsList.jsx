import SearchResultCard from "./v1/SearchResultCard";

export default function SearchResultsList({ rows = [] }) {
  if (!rows.length) return null;

  return (
    <section className="ll3-searchSection">
      <div className="ll3-searchSection__head">
        <h2>All results</h2>
        <span>{rows.length}</span>
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
