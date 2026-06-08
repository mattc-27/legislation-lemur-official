// app/components/features/home/HomeSections.jsx
import Link from "next/link";
import RecentActivitySection from "./RecentActivitySection";
import { HOME_RECENT_ACTIVITY, HOME_WHY } from "@/lib/content/homeContent";

export default function HomeSections() {
  return (
    <main className="ll3-homeMain">
      <div className="ll3-homeShell ll3-homeMain__stack">
        <RecentActivitySection
          maxItems={3}
          showHeader={true}
          eyebrow={HOME_RECENT_ACTIVITY.eyebrow}
          title={HOME_RECENT_ACTIVITY.title}
          sub={HOME_RECENT_ACTIVITY.description}
          cta={HOME_RECENT_ACTIVITY.cta}
        />

        <section className="ll3-homeSection ll3-homeWhy" aria-labelledby="home-why-title">
          <div className="ll3-homeSection__header ll3-homeWhy__header">
            <div className="ll3-homeEyebrow">{HOME_WHY.eyebrow}</div>
            <h2 className="ll3-homeSection__title" id="home-why-title">
              {HOME_WHY.title}
            </h2>
            <p className="ll3-homeSection__sub">{HOME_WHY.description}</p>
          </div>

          <div className="ll3-homeWhy__grid">
            {HOME_WHY.cards.map((card) => (
              <Link href={card.href} className="ll3-homeWhyCard" key={card.title}>
                <span className="ll3-homeWhyCard__dot" aria-hidden="true" />
                <h3 className="ll3-homeWhyCard__title">{card.title}</h3>
                <p className="ll3-homeWhyCard__desc">{card.desc}</p>
                <span className="ll3-homeWhyCard__cta">{card.cta}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
