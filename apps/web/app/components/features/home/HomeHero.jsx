import {
  HOME_INTRO_TITLE,
  HOME_INTRO_PARAS,
} from "@/lib/content/homeContent";
export default function HomeHero() {
  return (
    <section className="hero hero--home" aria-label="Home hero">
      <div className="container hero__grid hero__grid--center">
        {/* Background art */}
        <figure className="hero__bg" aria-hidden="true">
          <img
            src="https://storage.googleapis.com/legislation-lemur-images/coming-soon-email-lemur.png"
            alt=""
            className="hero__bgImg"
            loading="lazy"
          />
        </figure>

        <div className="hero__content hero__content--center">
          <div className="hero__pill">LEGISLATION LEMUR</div>
          <h1 className="hero__title hero__title--home">
            Explore your representatives in Congress
          </h1>
          <p className="hero__sub">
            Search by member or state. Clear, data-driven summaries of activity and topics.
          </p>

          <div className="hero__cta hero__cta--center">
            <a className="btn btn--primary" href="/search">
              Find your representative
            </a>
            <a className="btn btn--ghost" href="/bills">
              Browse bills
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}