import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { entityLabel, stripMarks } from "./searchUtils";

export default function SearchPreviewDropdown({
  open,
  query,
  loading,
  results,
  groupedResults = [],
  onMouseDown,
}) {
  const trimmed = String(query || "").trim();

  if (!open || trimmed.length < 2) return null;

  return (
    <div className="ll3-globalSearch__panel" onMouseDown={onMouseDown}>
      <div className="ll3-globalSearch__panelTop">
        <span>Quick results</span>
        {loading ? <span>Searching…</span> : null}
      </div>

      {!loading && results?.error ? (
        <div className="ll3-globalSearch__state">Search is temporarily unavailable.</div>
      ) : null}

      {!loading && results && groupedResults.length === 0 ? (
        <div className="ll3-globalSearch__state">No quick results. Try viewing all results.</div>
      ) : null}

      {groupedResults.map((group) => (
        <section className="ll3-globalSearch__group" key={group.type}>
          <div className="ll3-globalSearch__groupTitle">{entityLabel(group.type, true)}</div>

          {group.items.slice(0, 4).map((item) => (
            <Link
              key={item.search_document_id || `${item.entity_type}-${item.entity_id}`}
              href={item.url || "#"}
              className="ll3-globalSearch__item"
            >
              <span className="ll3-globalSearch__itemTitle">{item.display_title}</span>

              {item.subtitle ? <span className="ll3-globalSearch__itemSub">{item.subtitle}</span> : null}

              {item.search_headline || item.summary ? (
                <span className="ll3-globalSearch__itemSnippet">
                  {stripMarks(item.search_headline || item.summary)}
                </span>
              ) : null}
            </Link>
          ))}
        </section>
      ))}

      <Link className="ll3-globalSearch__all" href={`/search?q=${encodeURIComponent(trimmed)}`}>
        View all results for “{trimmed}”
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
