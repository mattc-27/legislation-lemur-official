// app/components/features/home/HomeHero.jsx
import { Suspense } from "react";
import Link from "next/link";
import GlobalSearchBoxClient from "@/app/components/features/search/GlobalSearchBoxClient";
import { HOME_HERO } from "@/lib/content/homeContent";

export default function HomeHero() {
  return (
    <section className="ll3-homeHero" aria-label="Home hero">
      <div className="ll3-homeHero__bg" aria-hidden="true">
        <div className="ll3-homeHero__capitol" />
        <div className="ll3-homeHero__network" />
      </div>

      <div className="ll3-homeShell ll3-homeHero__inner">
        <div className="ll3-homeHero__content">
          <div className="ll3-homeEyebrow">{HOME_HERO.eyebrow}</div>

          <h1 className="ll3-homeHero__title">{HOME_HERO.title}</h1>

          <p className="ll3-homeHero__sub">{HOME_HERO.subtitle}</p>

          <div className="ll3-homeHero__search">
            <Suspense fallback={null}>
              <GlobalSearchBoxClient
                variant="home"
                popularSearches={HOME_HERO.popularSearches}
                placeholder={HOME_HERO.searchPlaceholder}
              />
            </Suspense>
          </div>

          <nav className="ll3-homeHero__actions" aria-label="Homepage browse links">
            {HOME_HERO.browseActions.map((action, index) => (
              <Link
                key={action.href}
                className={`ll3-homeBtn ${index === 0 ? "ll3-homeBtn--primary" : "ll3-homeBtn--secondary"}`}
                href={action.href}
              >
                {action.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}