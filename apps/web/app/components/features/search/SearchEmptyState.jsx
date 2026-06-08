import Link from "next/link";
import { Building2, FileText, Sparkles, Users } from "lucide-react";

const QUICK_SEARCHES = [
  "AI regulation",
  "border security",
  "defense budget",
  "judiciary committee",
  "Colorado senator",
  "veterans benefits",
];

const ENTITY_CARDS = [
  {
    title: "Legislation Archive",
    desc: "Browse bills by topic, status, chamber, and recent activity.",
    href: "/bills",
    icon: FileText,
  },
  {
    title: "Member Directory",
    desc: "Browse Congress by state, delegation, and vacant seats.",
    href: "/member",
    icon: Users,
  },
  {
    title: "Committees",
    desc: "Explore committee and subcommittee structure.",
    href: "/committees",
    icon: Building2,
  },
];

export function EmptyWorkspace() {
  return (
    <section className="ll3-searchEmptyWorkspace">

      <section className="ll3-searchPopular">
        <div className="ll3-searchPopular__head">
          <Sparkles size={16} aria-hidden="true" />
          <span>Popular searches</span>
        </div>

        <div className="ll3-chipGroup ll3-chipGroup--searchPrompt">
          {QUICK_SEARCHES.map((q) => (
            <Link
              key={q}
              href={`/search?q=${encodeURIComponent(q)}`}
              className="ll3-pill ll3-pill--search"
            >
              {q}
            </Link>
          ))}
        </div>
      </section>

      <section className="ll3-searchBrowse">
        <div className="ll3-searchBrowseLabel">
          Browse Congress
        </div>

        <div className="ll3-searchExploreGrid">
          {ENTITY_CARDS.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.href}
                href={card.href}
                className="ll3-searchExploreCard"
              >
                <span className="ll3-searchExploreCard__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>

                <span className="ll3-searchExploreCard__copy">
                  <strong>{card.title}</strong>
                  <span>{card.desc}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </section>
  );
}

export function NoResultsState({ query }) {
  return (
    <div className="ll3-searchEmpty">
      <h2>No results found</h2>

      <p>
        No results matched <strong>“{query}”</strong>.
        Try a broader topic, remove filters, or browse one of the
        congressional directories below.
      </p>

      <div className="ll3-searchEmpty__links">
        <Link href="/search">Start over</Link>
        <Link href="/bills">Legislation Archive</Link>
        <Link href="/member">Member Directory</Link>
        <Link href="/committees">Committees</Link>
      </div>
    </div>
  );
}