import Link from "next/link";
import {
  HOME_HERO_EYEBROW,
  HOME_HERO_TITLE,
  HOME_HERO_SUB,
  HOME_HERO_PRIMARY_CTA,
  HOME_HERO_SECONDARY_CTA,
} from "@/lib/content/homeContent";

export default function HomeHero() {
  return (
    <section className="hero hero--home" aria-label="Home hero">
      <div className="container hero__grid hero__grid--home">
        <div className="hero__content hero__content--home">
          <div className="hero__eyebrow">{HOME_HERO_EYEBROW}</div>

          <h1 className="hero__title hero__title--home">{HOME_HERO_TITLE}</h1>

          <p className="hero__sub hero__sub--home">{HOME_HERO_SUB}</p>

          <div className="hero__cta hero__cta--home">
            <Link className="btn btn--primary" href={HOME_HERO_PRIMARY_CTA.href}>
              {HOME_HERO_PRIMARY_CTA.label}
            </Link>

            <Link className="btn btn--ghost" href={HOME_HERO_SECONDARY_CTA.href}>
              {HOME_HERO_SECONDARY_CTA.label}
            </Link>
          </div>
        </div>

        <div className="hero__art hero__art--home" aria-hidden="true">
          <img
            src="https://storage.googleapis.com/legislation-lemur-images/f7262476-5004-46d9-b414-10e7ffafc652.png"
            alt=""
            className="hero__art-img"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}