import Link from "next/link";
import RecentActivitySection from "./RecentActivitySection";
import {
  HOME_RECENTLY_ADDED_BADGE,
  HOME_RECENTLY_ADDED_ITEMS,
  HOME_ROADMAP_ITEMS,
} from "@/lib/content/homeContent";

const HERO_BANNER_ITEMS = [
  {
    title: "Clearer legislative snapshots",
    desc: "Readable profiles, bill context, and ongoing session activity.",
  },
  {
    title: "Neutral presentation",
    desc: "Built for clarity, not spin.",
  },
];

const FEATURE_CARDS = [
  {
    title: "Representative profiles",
    desc: "Browse members by state or name and open clean snapshots of service, activity, and legislative context.",
    href: "/search",
    cta: "Explore profiles",
    accent: "primary",
  },
  {
    title: "Bill tracking",
    desc: "Follow sponsored bills, recent actions, and legislative movement in a more readable interface.",
    href: "/bills",
    cta: "Explore bills",
  },
  {
    title: "Committee navigation",
    desc: "Explore committee structure, roles, and coverage without getting lost in government directory sprawl.",
    href: "/committees",
    cta: "Explore committees",
  },
  {
    title: "Congressional reference",
    desc: "Get straightforward explanations of core congressional concepts, data sources, and terminology.",
    href: "/references",
    cta: "Open reference",
  },
];

export default function HomeSections() {
  return (
    <section className="home-sections">
      <div className="container home-sections__stack">
        <section className="hero-banner" aria-label="Platform highlights">
          <div className="hero-banner__grid">
            {HERO_BANNER_ITEMS.map((item) => (
              <article className="hero-banner__item" key={item.title}>
                <span className="hero-banner__icon" aria-hidden="true" />
                <div className="hero-banner__copy">
                  <h2 className="hero-banner__title">{item.title}</h2>
                  <p className="hero-banner__desc">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <RecentActivitySection
          maxItems={3}
          showHeader={true}
          title="Recent Congressional Activity"
          sub="New bills and major actions, surfaced in a cleaner, more readable format."
        />

        <section className="home-feature-band" aria-label="Platform overview">
          <div className="home-feature-band__grid">
            <div className="home-feature-band__lead panel panel--feature-lead">
              <div className="section__eyebrow">Platform overview</div>

              <h2 className="section__title section__title--feature">
                A clearer way to follow Congress
              </h2>

              <div className="stack stack-16">
                <p className="section__sub reg">
                  Legislation Lemur is a neutral, data-driven way to explore the U.S.
                  Congress. It brings together members, bills, votes, committees, and
                  session-level context into a faster, more readable interface built for
                  clarity.
                </p>

                <p className="section__sub reg">
                  Browse members by state or name, open clean factual profiles, and
                  follow legislative activity without digging through dense tables or
                  PDFs. Core data is refreshed regularly, with an emphasis on
                  readability, stability, and source-aware presentation.
                </p>
              </div>
            </div>

            <div className="home-feature-band__cards">
              {FEATURE_CARDS.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`feature-tile ${item.accent === "primary" ? "feature-tile--primary" : ""
                    }`}
                >
                  <div className="feature-tile__inner">
                    <h3 className="feature-tile__title">{item.title}</h3>
                    <p className="feature-tile__desc">{item.desc}</p>
                    <span className="feature-tile__cta">{item.cta}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--recently-added">
          <div className="section__header">
            <div className="section__eyebrow">{HOME_RECENTLY_ADDED_BADGE}</div>
            <h2 className="section__title">What’s new across the site</h2>
            <p className="section__sub">
              Ongoing improvements to make congressional data easier to scan,
              understand, and revisit.
            </p>
          </div>

          <div className="update-grid">
            {HOME_RECENTLY_ADDED_ITEMS.map((item) => {
              const content = (
                <>
                  <h3 className="update-card__title">{item.label}</h3>
                  <p className="update-card__desc">{item.desc}</p>
                </>
              );

              return item.href ? (
                <Link key={item.label} href={item.href} className="update-card">
                  {content}
                </Link>
              ) : (
                <div key={item.label} className="update-card">
                  {content}
                </div>
              );
            })}
          </div>
        </section>

        <section className="section section--roadmap">
          <div className="section__header">
            <h2 className="section__title">On the roadmap</h2>
            <p className="section__sub">
              More readable, neutral tools for tracking legislative change over time.
            </p>
          </div>

          <div className="roadmap">
            <div className="roadmap__line" aria-hidden="true" />
            <div className="roadmap__grid">
              {HOME_ROADMAP_ITEMS.map((item, idx) => (
                <article className="roadmap__item" key={`${item.quarter}-${item.title}`}>
                  <div
                    className={`roadmap__dot roadmap__dot--${(idx % 4) + 1}`}
                    aria-hidden="true"
                  />
                  <div className="roadmap__quarter">{item.quarter}</div>
                  <h3 className="roadmap__title">{item.title}</h3>
                  <p className="roadmap__desc">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}