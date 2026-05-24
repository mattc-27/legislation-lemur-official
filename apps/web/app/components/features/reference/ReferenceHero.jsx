const QUICK_LINKS = [
  { step: "Step 1", title: "Register or check status", desc: "Start at the federal portal, then finish directly with your state where required.", href: "https://vote.gov/", cta: "Open vote.gov" },
  { step: "Step 2", title: "Review deadlines and rules", desc: "Find ID rules, mail voting, early voting, and state election office details.", href: "https://www.nass.org/can-I-vote", cta: "Open Can I Vote" },
  { step: "Step 3", title: "Preview ballots and elections", desc: "Check upcoming elections, ballot measures, and candidate information before election day.", href: "https://ballotpedia.org/", cta: "Open Ballotpedia" },
];

export default function ReferenceHero() {
  return (
    <section className="ll3-refHero" aria-labelledby="reference-title">
      <div className="ll3-refHero__masthead">
        <div className="ll3-refHero__copy">
          <div className="ll3-ref__eyebrow">Voting resources & civic reference</div>
          <h1 className="ll3-refHero__title" id="reference-title">Reference Center</h1>
          <p className="ll3-refHero__lead">
            Official voting links, congressional terms, and plain-language shortcuts for understanding what you’re seeing across Legislation Lemur.
          </p>
          <div className="ll3-refHero__pills" aria-label="Page principles">
            <span>Official public resources</span>
            <span>No forms here</span>
            <span>Plain-language explainers</span>
          </div>
        </div>

        <aside className="ll3-refHero__aside" aria-label="Before you begin">
          <div className="ll3-refHero__asideKicker">Before you begin</div>
          <ul>
            <li>Have your current address ready.</li>
            <li>Deadlines and voting rules vary by state.</li>
            <li>Always follow your state election office for final instructions.</li>
          </ul>
        </aside>
      </div>

      <div className="ll3-refHero__quickLinks" aria-label="Recommended starting points">
        {QUICK_LINKS.map((item) => (
          <a className="ll3-refHero__quickCard" href={item.href} target="_blank" rel="noreferrer" key={item.title}>
            <span>{item.step}</span>
            <strong>{item.title}</strong>
            <em>{item.desc}</em>
            <small>{item.cta} →</small>
          </a>
        ))}
      </div>
    </section>
  );
}
