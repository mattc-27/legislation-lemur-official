export default function HomeHero({ children }) {

  return (
    <section className="hero hero--frost hero--tall">
      <div className="hero__top">
        <div className="container hero__top-inner">
          <div className="hero__brand">
            <h1 className="hero__title">Explore your representatives in Congress</h1>
            <p className="hero__sub">
              Search by member or state. See clear, data-driven summaries of activity and topics.
            </p>
          </div>
        </div>
      </div>
      <div className="hero__body">
        <div className="container">
          <div className="hero__glass">{children}</div>
        </div>
      </div>
    </section>
  );
}