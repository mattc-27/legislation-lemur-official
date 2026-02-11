import {
  HOME_INTRO_TITLE,
  HOME_INTRO_PARAS,
} from "@/lib/content/homeContent";

export default function HomeHero({ children }) {

  return (
    <section className="hero hero--home">
      <div className="container hero__grid">
        <div className="hero__content">
          <h1 className="hero__title">Explore your representatives in Congress</h1>
          <p className="hero__sub">
            Search by member or state. See clear, data-driven summaries of activity and topics.
          </p>

          <div className="hero__intro">
            <h3 className="hero__kicker">{HOME_INTRO_TITLE}</h3>
            {HOME_INTRO_PARAS.map((text, i) => (
              <p key={i} className="hero__para">
                {text}
              </p>
            ))}
          </div>

          <div className="hero__cta">
            <a className="btn btn--primary" href="/members">
              Find your representative
            </a>
            <a className="btn btn--ghost" href="/bills">
              Browse bills
            </a>
          </div>
        </div>

        <figure className="hero__art" data-anim="fade-up">
          <img
            src="https://storage.googleapis.com/legislation-lemur-images/coming-soon-email-lemur.png"
            alt="Legislation Lemur in the stacks—brand illustration"
            className="hero__img"
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}