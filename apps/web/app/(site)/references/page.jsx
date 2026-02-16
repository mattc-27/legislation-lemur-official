// app/(wiki)/reference/page.jsx
// ✅ Restores the “hero card” look from wk-page (panel bg, shadow, pill styling)
// ✅ Still uses LL3 primitives for buttons/inputs/panels so it matches the rest of the site
// ✅ Removes inline styles (keeps spacing consistent via CSS)

import "@/app/styles/active/reference.ll3.css";

const LAST_CHECKED = "Nov 25, 2025";

const QUICK_LINKS = [
  {
    step: "Step 1",
    title: "Register / Check Status",
    desc: "Use the official federal portal to register or confirm your registration.",
    href: "https://vote.gov/",
    cta: "Open vote.gov →",
  },
  {
    step: "Step 2",
    title: "State Deadlines & Rules",
    desc: "Find your state’s election office, ID requirements, early voting & mail options.",
    href: "https://www.nass.org/can-I-vote",
    cta: "Open Can I Vote →",
  },
  {
    step: "Step 3",
    title: "Upcoming Elections & Ballots",
    desc: "See what’s on your ballot and key election dates.",
    href: "https://ballotpedia.org/",
    cta: "Open Ballotpedia →",
  },
];

const BILL_PREFIXES = [
  { prefix: "H.R.", meaning: "House bill", notes: "A bill introduced in the House of Representatives." },
  { prefix: "S.", meaning: "Senate bill", notes: "A bill introduced in the Senate." },
  { prefix: "H.Res.", meaning: "House simple resolution", notes: "Affects House rules/operations or expresses House sentiment; does not go to the President." },
  { prefix: "S.Res.", meaning: "Senate simple resolution", notes: "Affects Senate rules/operations or expresses Senate sentiment; does not go to the President." },
  { prefix: "H.Con.Res.", meaning: "House concurrent resolution", notes: "Involves both chambers (e.g., budget framework); does not go to the President." },
  { prefix: "S.Con.Res.", meaning: "Senate concurrent resolution", notes: "Involves both chambers; does not go to the President." },
  { prefix: "H.J.Res.", meaning: "House joint resolution", notes: "If passed by both chambers, typically goes to the President (or can propose constitutional amendments)." },
  { prefix: "S.J.Res.", meaning: "Senate joint resolution", notes: "Same idea as H.J.Res., introduced in the Senate." },
];

function Anchor({ id, children }) {
  return (
    <div id={id} className="ll3-wk__anchor">
      {children}
    </div>
  );
}

export default function ReferencePage() {
  return (
    <main className="ll3-bills ll3-wk">
      {/* HERO (restores the old wk-hero visual) */}
      <header className="ll3-wk__hero">
        <div className="ll3-wk__heroTop">
          <span className="ll3-wk__pill">
            NONPARTISAN • OFFICIAL LINKS ONLY
          </span>

          <span className="ll3-wk__checked">
            Last checked: <span className="ll3-strong">{LAST_CHECKED}</span>
          </span>
        </div>

        <h1 className="ll3-wk__title">
          Voting Resources
        </h1>

        <p className="ll3-wk__subtitle">
          Fast, official links for registration, deadlines, and polling info. Keep it official—use{" "}
          <a className="ll3-wk__link" href="https://vote.gov/" target="_blank" rel="noreferrer">
            vote.gov
          </a>{" "}
          and{" "}
          <a className="ll3-wk__link" href="https://www.nass.org/can-I-vote" target="_blank" rel="noreferrer">
            Can I Vote
          </a>
          .
        </p>

        <ul className="ll3-wk__bullets">
          <li>No accounts or sign-ups here.</li>
          <li>We send you directly to trusted, official sources.</li>
          <li>Great starting point whether you’re a new or returning voter.</li>
        </ul>
      </header>

      {/* Steps */}
      <section className="ll3-wk__steps" aria-label="Voting steps">
        {QUICK_LINKS.map((c) => (
          <article className="ll3-wk__card" key={c.title}>
            <div className="ll3-wk__eyebrow">{c.step}</div>
            <h2 className="ll3-wk__cardTitle">{c.title}</h2>
            <p className="ll3-wk__cardDesc">{c.desc}</p>

            <a
              className="ll3-btn ll3-btn--open ll3-btn--full ll3-wk__cta"
              href={c.href}
              target="_blank"
              rel="noreferrer"
            >
              {c.cta}
            </a>
          </article>
        ))}
      </section>

      {/* Quick state lookup */}
      <section className="ll3-wk__panel" aria-labelledby="wk-lookup">
        <div className="ll3-wk__panelHead">
          <h2 className="ll3-wk__h2" id="wk-lookup">Quick State Lookup</h2>
          <p className="ll3-wk__muted">
            Choose a state to jump straight to its page on vote.gov. You’ll finish your registration or lookup on the official site.
          </p>
        </div>

        <div className="ll3-wk__lookup">
          <div className="ll3-field">
            <label className="ll3-label" htmlFor="state">
              Choose your state or territory
            </label>
            <select id="state" className="ll3-input" defaultValue="">
              <option value="" disabled>— Select —</option>
              <option value="CO">Colorado</option>
              <option value="CA">California</option>
              <option value="NY">New York</option>
              <option value="TX">Texas</option>
              <option value="WA">Washington</option>
            </select>
          </div>

          <div className="ll3-wk__lookupCards">
            <article className="ll3-wk__mini">
              <h3 className="ll3-wk__miniTitle">vote.gov • Registration</h3>
              <p className="ll3-wk__miniDesc">
                Official federal portal with your state’s registration and voting info.
              </p>
              <button className="ll3-btn ll3-btn--sm ll3-btn--full ll3-wk__btnMuted" type="button" disabled>
                Select a state
              </button>
            </article>

            <article className="ll3-wk__mini">
              <h3 className="ll3-wk__miniTitle">Can I Vote • State Info</h3>
              <p className="ll3-wk__miniDesc">
                Find your state election office, official FAQs, and more details.
              </p>
              <a className="ll3-btn ll3-btn--sm ll3-btn--ghost ll3-btn--full" href="https://www.nass.org/can-I-vote" target="_blank" rel="noreferrer">
                Open Can I Vote →
              </a>
            </article>
          </div>
        </div>
      </section>

      <hr className="ll3-wk__hr" />

      {/* About */}
      <section className="ll3-wk__about" aria-labelledby="wk-about">
        <h2 className="ll3-wk__h2" id="wk-about">About these resources</h2>

        <div className="ll3-wk__aboutGrid">
          <div className="ll3-wk__faq">
            <h3 className="ll3-wk__h3">Where do these links go?</h3>
            <p className="ll3-wk__muted">
              We point to official, nonpartisan sites like vote.gov and Can I Vote so you get accurate, up-to-date information straight from election officials.
            </p>
          </div>

          <div className="ll3-wk__faq">
            <h3 className="ll3-wk__h3">Do you store any of my information?</h3>
            <p className="ll3-wk__muted">
              No. When you click through, you complete any forms directly on the official sites. We don’t collect or store your registration details.
            </p>
          </div>

          <div className="ll3-wk__faq">
            <h3 className="ll3-wk__h3">Is this page giving legal advice?</h3>
            <p className="ll3-wk__muted">
              No. This page is a convenience layer on top of official resources. When in doubt, follow instructions on your state’s official election site.
            </p>
          </div>
        </div>
      </section>

      {/* Wiki */}
      <section className="ll3-wk__wiki" aria-labelledby="wk-wiki">
        <div className="ll3-wk__wikiHead">
          <h2 className="ll3-wk__h2" id="wk-wiki">Wiki / Reference</h2>
          <p className="ll3-wk__muted">
            Quick definitions for common congressional terms you’ll see in bill listings and status timelines.
          </p>
        </div>

        <div className="ll3-wk__wikiLayout">
          <nav className="ll3-wk__toc" aria-label="Table of contents">
            <div className="ll3-wk__tocTitle">On this page</div>
            <a className="ll3-wk__tocLink" href="#bill-prefixes">Bill prefixes</a>
            <a className="ll3-wk__tocLink" href="#congress-number">What is a Congress number?</a>
            <a className="ll3-wk__tocLink" href="#how-long">How long is a Congress?</a>
            <a className="ll3-wk__tocLink" href="#reported">What does “Reported” mean?</a>
            <a className="ll3-wk__tocLink" href="#resolution">What is a resolution?</a>
            <a className="ll3-wk__tocLink" href="#laid-on-table">What does “laid on the table” mean?</a>
            <a className="ll3-wk__tocLink" href="#reconciliation">What is reconciliation?</a>

            <a className="ll3-wk__tocLink" href="#bill-signals">Impact & Trending signals</a>
          </nav>

          <div className="ll3-wk__content">
            <article className="ll3-wk__panel">
              <Anchor id="bill-prefixes">
                <h3 className="ll3-wk__h3Big">Bill prefixes (H.R., S., H.Res., S.J.Res., etc.)</h3>
                <p className="ll3-wk__muted">
                  The prefix tells you what kind of legislative item it is and which chamber introduced it.
                </p>

                <div className="ll3-wk__tableWrap" role="region" aria-label="Bill prefixes table">
                  <table className="ll3-wk__table">
                    <thead>
                      <tr>
                        <th>Prefix</th>
                        <th>Meaning</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BILL_PREFIXES.map((row) => (
                        <tr key={row.prefix}>
                          <td className="ll3-wk__mono">{row.prefix}</td>
                          <td>{row.meaning}</td>
                          <td className="ll3-wk__muted">{row.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="ll3-wk__callout">
                  <div className="ll3-wk__calloutTitle">Tip</div>
                  <p className="ll3-wk__muted">
                    A bill (<span className="ll3-wk__mono">H.R.</span> / <span className="ll3-wk__mono">S.</span>) can become law if
                    passed by both chambers and signed by the President. Many “resolution” types do not become law.
                  </p>
                </div>
              </Anchor>
            </article>

            <article className="ll3-wk__panel">
              <Anchor id="congress-number">
                <h3 className="ll3-wk__h3Big">What is a Congress number?</h3>
                <p className="ll3-wk__muted">
                  The “Congress number” groups time in the U.S. federal legislature. Each new Congress begins after a federal election cycle
                  and is numbered sequentially (e.g., 118th, 119th).
                </p>
                <p className="ll3-wk__muted">
                  Example: <span className="ll3-wk__mono">H.R. 1234 (119th)</span> means the bill was introduced during the 119th Congress.
                </p>
              </Anchor>
            </article>

            <article className="ll3-wk__panel">
              <Anchor id="how-long">
                <h3 className="ll3-wk__h3Big">How long is a Congress?</h3>
                <p className="ll3-wk__muted">
                  A Congress lasts <span className="ll3-strong">two years</span> and is typically divided into two annual sessions (“1st Session” and “2nd Session”).
                  Bills that don’t pass by the end of a Congress generally do not carry over and must be reintroduced.
                </p>
              </Anchor>
            </article>

            <article className="ll3-wk__panel">
              <Anchor id="reported">
                <h3 className="ll3-wk__h3Big">What does “Reported” mean?</h3>
                <p className="ll3-wk__muted">
                  “Reported” usually means a committee has finished considering a bill and has sent it back to the full chamber with a recommendation.
                  This often includes a written committee report and may include amendments adopted in committee.
                </p>

                <div className="ll3-wk__callout ll3-wk__callout--subtle">
                  <div className="ll3-wk__calloutTitle">Common pattern</div>
                  <p className="ll3-wk__muted">
                    Introduced → Referred to committee → Committee action/markup → <span className="ll3-strong">Reported</span> → Placed on calendar / scheduled.
                  </p>
                </div>
              </Anchor>
            </article>

            <article className="ll3-wk__panel">
              <Anchor id="resolution">
                <h3 className="ll3-wk__h3Big">What is a resolution?</h3>
                <p className="ll3-wk__muted">
                  A resolution is a legislative measure that often addresses rules, procedures, or expresses the sense of a chamber. There are different types:
                </p>
                <ul className="ll3-wk__list">
                  <li><span className="ll3-strong">Simple resolutions</span> (<span className="ll3-wk__mono">H.Res.</span>, <span className="ll3-wk__mono">S.Res.</span>): one chamber only; do not go to the President.</li>
                  <li><span className="ll3-strong">Concurrent resolutions</span> (<span className="ll3-wk__mono">H.Con.Res.</span>, <span className="ll3-wk__mono">S.Con.Res.</span>): both chambers; generally do not go to the President.</li>
                  <li><span className="ll3-strong">Joint resolutions</span> (<span className="ll3-wk__mono">H.J.Res.</span>, <span className="ll3-wk__mono">S.J.Res.</span>): like bills; typically go to the President (or propose constitutional amendments).</li>
                </ul>
              </Anchor>
            </article>

            <article className="ll3-wk__panel">
              <Anchor id="laid-on-table">
                <h3 className="ll3-wk__h3Big">What does “laid on the table” mean?</h3>
                <p className="ll3-wk__muted">
                  “Laid on the table” is a parliamentary action that sets aside a measure (or motion) without further debate.
                  In many contexts, it effectively pauses consideration—and can function like a quick way to dispose of a motion—depending on chamber rules and context.
                </p>

                <div className="ll3-wk__callout ll3-wk__callout--warn">
                  <div className="ll3-wk__calloutTitle">Why it matters</div>
                  <p className="ll3-wk__muted">
                    If you’re tracking momentum, “laid on the table” can be a sign leadership is moving on (at least for now).
                  </p>
                </div>
              </Anchor>
            </article>

            <article className="ll3-wk__panel">
              <Anchor id="reconciliation">
                <h3 className="ll3-wk__h3Big">What is reconciliation?</h3>
                <p className="ll3-wk__muted">
                  Reconciliation is a special budget-related process that can make it easier to pass certain fiscal legislation.
                  It’s tied to the budget resolution and is intended for measures affecting spending, revenues, or the debt limit.
                </p>

                <ul className="ll3-wk__list">
                  <li>Typically limited to budget-related provisions.</li>
                  <li>Often associated with expedited consideration in the Senate.</li>
                  <li>Rules may restrict “extra” non-budgetary provisions.</li>
                </ul>

                <p className="ll3-wk__muted">
                  In practice, reconciliation is often used for major tax and spending packages—when the changes have clear budget impacts.
                </p>
              </Anchor>
            </article>
            <article className="ll3-wk__panel">
              <Anchor id="bill-signals">
                <h3 className="ll3-wk__h3Big">Impact & Trending (Bill signals)</h3>
                <p className="ll3-wk__muted">
                  Bills can be “important” for different reasons. These two signals help you scan results faster without
                  making a value judgment.
                </p>

                <div className="ll3-wk__callout">
                  <div className="ll3-wk__calloutTitle">How to read them</div>
                  <ul className="ll3-wk__list">
                    <li><span className="ll3-strong">Impact</span>: a heuristic estimate of potential significance (0–100).</li>
                    <li><span className="ll3-strong">Trending</span>: a heuristic estimate of current momentum/attention (0–100).</li>
                    <li>Higher scores mean “more signal,” not “good” or “bad.”</li>
                  </ul>
                </div>

                <div className="ll3-wk__callout ll3-wk__callout--subtle">
                  <div className="ll3-wk__calloutTitle">Important</div>
                  <p className="ll3-wk__muted">
                    These are experimental indicators used for sorting and exploration. Always read the bill details and
                    latest actions for the real story.
                  </p>
                </div>
              </Anchor>
            </article>
          </div>
        </div>
      </section>

      <footer className="ll3-wk__footer">
        <span className="ll3-wk__muted">Nonpartisan info layer • Official links only</span>
      </footer>
    </main>
  );
}
