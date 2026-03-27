import "@/app/styles/active/site/ll3.reference.css";

const LAST_CHECKED = "Feb 28, 2026";

const QUICK_LINKS = [
  {
    step: "Step 1",
    title: "Register / Check Status",
    desc: "Use the official federal portal to register or confirm your registration.",
    href: "https://vote.gov/",
    cta: "Open vote.gov",
  },
  {
    step: "Step 2",
    title: "State Deadlines & Rules",
    desc: "Find your state’s election office, ID requirements, early voting, and mail voting options.",
    href: "https://www.nass.org/can-I-vote",
    cta: "Open Can I Vote",
  },
  {
    step: "Step 3",
    title: "Upcoming Elections & Ballots",
    desc: "See what’s on your ballot and review major election dates.",
    href: "https://ballotpedia.org/",
    cta: "Open Ballotpedia",
  },
];

const BILL_PREFIXES = [
  { prefix: "H.R.", meaning: "House bill", notes: "A bill introduced in the House of Representatives." },
  { prefix: "S.", meaning: "Senate bill", notes: "A bill introduced in the Senate." },
  { prefix: "H.Res.", meaning: "House simple resolution", notes: "Affects House rules or operations, or expresses House sentiment; does not go to the President." },
  { prefix: "S.Res.", meaning: "Senate simple resolution", notes: "Affects Senate rules or operations, or expresses Senate sentiment; does not go to the President." },
  { prefix: "H.Con.Res.", meaning: "House concurrent resolution", notes: "Involves both chambers; generally does not go to the President." },
  { prefix: "S.Con.Res.", meaning: "Senate concurrent resolution", notes: "Involves both chambers; generally does not go to the President." },
  { prefix: "H.J.Res.", meaning: "House joint resolution", notes: "If passed by both chambers, typically goes to the President, or can propose constitutional amendments." },
  { prefix: "S.J.Res.", meaning: "Senate joint resolution", notes: "Same idea as H.J.Res., introduced in the Senate." },
];

function Anchor({ id, children }) {
  return (
    <div id={id} className="ll3-ref__anchor">
      {children}
    </div>
  );
}

export default function ReferencePage() {
  return (
    <main className="ll3-ref">
      <div className="container ll3-ref__wrap">
        <section className="ll3-ref__hero">
          <div className="ll3-ref__hero-grid">
            <div className="ll3-ref__hero-copy">
              <div className="ll3-ref__eyebrow">Official voting resources</div>

              <h1 className="ll3-ref__title">Voting Resources</h1>

              <p className="ll3-ref__subtitle">
                Fast, official links for registration, deadlines, and polling information.
                This page is designed as a neutral shortcut layer that sends you directly to
                trusted sources like{" "}
                <a className="ll3-ref__link" href="https://vote.gov/" target="_blank" rel="noreferrer">
                  vote.gov
                </a>{" "}
                and{" "}
                <a className="ll3-ref__link" href="https://www.nass.org/can-I-vote" target="_blank" rel="noreferrer">
                  Can I Vote
                </a>
                .
              </p>

              <div className="ll3-ref__meta">
                <span className="ll3-ref__pill">Nonpartisan • Official links only</span>
                <span className="ll3-ref__checked">
                  Last checked: <strong>{LAST_CHECKED}</strong>
                </span>
              </div>

              <div className="ll3-ref__signals" aria-label="Page highlights">
                <div className="ll3-ref__signal">
                  <span className="ll3-ref__signal-dot" aria-hidden="true" />
                  <div>
                    <div className="ll3-ref__signal-title">No sign-ups here</div>
                    <div className="ll3-ref__signal-copy">
                      You’ll complete any registration or lookup directly on official sites.
                    </div>
                  </div>
                </div>

                <div className="ll3-ref__signal">
                  <span className="ll3-ref__signal-dot" aria-hidden="true" />
                  <div>
                    <div className="ll3-ref__signal-title">Built for direct access</div>
                    <div className="ll3-ref__signal-copy">
                      A quicker starting point for new or returning voters.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ll3-ref__hero-aside">
              <div className="ll3-ref__hero-card">
                <div className="ll3-ref__hero-card-kicker">Use these first</div>
                <ul className="ll3-ref__hero-list">
                  <li>Register or confirm status on vote.gov</li>
                  <li>Check your state’s election office and deadlines</li>
                  <li>Review what’s on your ballot before election day</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="ll3-ref__steps" aria-label="Voting steps">
          {QUICK_LINKS.map((item) => (
            <article className="ll3-ref__step-card" key={item.title}>
              <div className="ll3-ref__step-eyebrow">{item.step}</div>
              <h2 className="ll3-ref__step-title">{item.title}</h2>
              <p className="ll3-ref__step-desc">{item.desc}</p>

              <a
                className="ll3-ref__step-cta"
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                {item.cta}
              </a>
            </article>
          ))}
        </section>

        <section className="ll3-ref__lookup-band" aria-labelledby="wk-lookup">
          <div className="ll3-ref__lookup-grid">
            <div className="ll3-ref__lookup-copy">
              <div className="ll3-ref__eyebrow">Quick state lookup</div>
              <h2 className="ll3-ref__section-title" id="wk-lookup">
                Jump to your state’s official page
              </h2>
              <p className="ll3-ref__section-sub">
                Choose a state to go straight to its page on vote.gov. You’ll finish registration
                or status lookup on the official site.
              </p>

              <div className="ll3-ref__selectWrap">
                <div className="ll3-field">
                  <label className="ll3-label" htmlFor="state">
                    Choose your state or territory
                  </label>
                  <select id="state" className="ll3-input ll3-ref__select" defaultValue="">
                    <option value="" disabled>
                      — Select —
                    </option>
                    <option value="CO">Colorado</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="WA">Washington</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="ll3-ref__lookup-cards">
              <article className="ll3-ref__mini-card ll3-ref__mini-card--primary">
                <h3 className="ll3-ref__mini-title">vote.gov • Registration</h3>
                <p className="ll3-ref__mini-desc">
                  Official federal portal for registration and state-by-state voting information.
                </p>
                <button className="ll3-ref__mini-btn" type="button" disabled>
                  Select a state
                </button>
              </article>

              <article className="ll3-ref__mini-card">
                <h3 className="ll3-ref__mini-title">Can I Vote • State Info</h3>
                <p className="ll3-ref__mini-desc">
                  Find your state election office, official FAQs, and additional voting guidance.
                </p>
                <a
                  className="ll3-ref__mini-link"
                  href="https://www.nass.org/can-I-vote"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Can I Vote
                </a>
              </article>
            </div>
          </div>
        </section>

        <section className="ll3-ref__about" aria-labelledby="wk-about">
          <div className="ll3-ref__section-head">
            <div className="ll3-ref__eyebrow">About these resources</div>
            <h2 className="ll3-ref__section-title" id="wk-about">
              Why this page exists
            </h2>
            <p className="ll3-ref__section-sub">
              A simple, source-aware layer for getting to official election information faster.
            </p>
          </div>

          <div className="ll3-ref__faq-grid">
            <div className="ll3-ref__faq-card">
              <h3 className="ll3-ref__faq-title">Where do these links go?</h3>
              <p className="ll3-ref__faq-copy">
                They point to official, nonpartisan resources like vote.gov and Can I Vote so you get accurate, current information directly from election authorities.
              </p>
            </div>

            <div className="ll3-ref__faq-card">
              <h3 className="ll3-ref__faq-title">Do you store any of my information?</h3>
              <p className="ll3-ref__faq-copy">
                No. When you click through, any forms or lookups happen directly on the official sites.
              </p>
            </div>

            <div className="ll3-ref__faq-card">
              <h3 className="ll3-ref__faq-title">Is this legal advice?</h3>
              <p className="ll3-ref__faq-copy">
                No. This page is a convenience layer. For final instructions, always follow your state’s official election site.
              </p>
            </div>
          </div>
        </section>

        <section className="ll3-ref__wiki" aria-labelledby="wk-wiki">
          <div className="ll3-ref__section-head">
            <div className="ll3-ref__eyebrow">Congressional reference</div>
            <h2 className="ll3-ref__section-title" id="wk-wiki">
              Wiki / Reference
            </h2>
            <p className="ll3-ref__section-sub">
              Quick definitions for common congressional terms you’ll see in bill listings, committee pages, and status timelines.
            </p>
          </div>

          <div className="ll3-ref__wiki-layout">
            <nav className="ll3-ref__toc" aria-label="Table of contents">
              <div className="ll3-ref__toc-title">On this page</div>
              <a className="ll3-ref__toc-link" href="#bill-prefixes">Bill prefixes</a>
              <a className="ll3-ref__toc-link" href="#committee-types">Committee types</a>
              <a className="ll3-ref__toc-link" href="#congress-number">What is a Congress number?</a>
              <a className="ll3-ref__toc-link" href="#how-long">How long is a Congress?</a>
              <a className="ll3-ref__toc-link" href="#reported">What does “Reported” mean?</a>
              <a className="ll3-ref__toc-link" href="#resolution">What is a resolution?</a>
              <a className="ll3-ref__toc-link" href="#laid-on-table">What does “laid on the table” mean?</a>
              <a className="ll3-ref__toc-link" href="#reconciliation">What is reconciliation?</a>
              <a className="ll3-ref__toc-link" href="#bill-signals">Impact & Trending signals</a>
            </nav>

            <div className="ll3-ref__content">
              <article className="ll3-ref__panel">
                <Anchor id="bill-prefixes">
                  <h3 className="ll3-ref__content-title">Bill prefixes (H.R., S., H.Res., S.J.Res., etc.)</h3>
                  <p className="ll3-ref__content-copy">
                    The prefix tells you what kind of legislative item it is and which chamber introduced it.
                  </p>

                  <div className="ll3-ref__tableWrap" role="region" aria-label="Bill prefixes table">
                    <table className="ll3-ref__table">
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
                            <td className="ll3-ref__mono">{row.prefix}</td>
                            <td>{row.meaning}</td>
                            <td>{row.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="ll3-ref__callout">
                    <div className="ll3-ref__callout-title">Tip</div>
                    <p className="ll3-ref__content-copy">
                      A bill (<span className="ll3-ref__mono">H.R.</span> / <span className="ll3-ref__mono">S.</span>) can become law if passed by both chambers and signed by the President. Many resolution types do not.
                    </p>
                  </div>
                </Anchor>
              </article>

              <article className="ll3-ref__panel">
                <Anchor id="committee-types">
                  <h3 className="ll3-ref__content-title">Committee types (Standing, Select / Special, Joint)</h3>
                  <p className="ll3-ref__content-copy">
                    Committees are usually grouped into a few core categories. These labels help explain how a committee is formed and the type of work it usually handles.
                  </p>

                  <div className="ll3-ref__faq-grid ll3-ref__faq-grid--inside">
                    <div className="ll3-ref__faq-card">
                      <h3 className="ll3-ref__faq-title">Standing</h3>
                      <p className="ll3-ref__faq-copy">
                        Permanent committees with legislative jurisdiction, hearings, oversight responsibilities, and bill development work.
                      </p>
                    </div>

                    <div className="ll3-ref__faq-card">
                      <h3 className="ll3-ref__faq-title">Select / Special</h3>
                      <p className="ll3-ref__faq-copy">
                        Often created to investigate, study, or focus on issues that cross jurisdictions or don’t fit neatly into a standing committee.
                      </p>
                    </div>

                    <div className="ll3-ref__faq-card">
                      <h3 className="ll3-ref__faq-title">Joint</h3>
                      <p className="ll3-ref__faq-copy">
                        Committees made up of Members from both chambers, often focused on studies or administrative and oversight work.
                      </p>
                    </div>
                  </div>

                  <div className="ll3-ref__callout ll3-ref__callout--subtle">
                    <div className="ll3-ref__callout-title">Note</div>
                    <p className="ll3-ref__content-copy">
                      Conference committees are temporary and are usually formed to reconcile House and Senate versions of a measure.
                    </p>
                  </div>
                </Anchor>
              </article>

              <article className="ll3-ref__panel">
                <Anchor id="congress-number">
                  <h3 className="ll3-ref__content-title">What is a Congress number?</h3>
                  <p className="ll3-ref__content-copy">
                    A Congress number groups time in the federal legislature. Each new Congress begins after a federal election cycle and is numbered sequentially, such as the 118th or 119th Congress.
                  </p>
                  <p className="ll3-ref__content-copy">
                    Example: <span className="ll3-ref__mono">H.R. 1234 (119th)</span> means the bill was introduced during the 119th Congress.
                  </p>
                </Anchor>
              </article>

              <article className="ll3-ref__panel">
                <Anchor id="how-long">
                  <h3 className="ll3-ref__content-title">How long is a Congress?</h3>
                  <p className="ll3-ref__content-copy">
                    A Congress lasts <strong>two years</strong> and is typically divided into two annual sessions. Bills that do not pass by the end of a Congress generally do not carry over and must be reintroduced.
                  </p>
                </Anchor>
              </article>

              <article className="ll3-ref__panel">
                <Anchor id="reported">
                  <h3 className="ll3-ref__content-title">What does “Reported” mean?</h3>
                  <p className="ll3-ref__content-copy">
                    “Reported” usually means a committee has finished considering a bill and has sent it back to the full chamber with a recommendation. That often includes a written committee report and may include amendments adopted in committee.
                  </p>

                  <div className="ll3-ref__callout ll3-ref__callout--subtle">
                    <div className="ll3-ref__callout-title">Common pattern</div>
                    <p className="ll3-ref__content-copy">
                      Introduced → Referred to committee → Committee action or markup → <strong>Reported</strong> → Placed on calendar or scheduled.
                    </p>
                  </div>
                </Anchor>
              </article>

              <article className="ll3-ref__panel">
                <Anchor id="resolution">
                  <h3 className="ll3-ref__content-title">What is a resolution?</h3>
                  <p className="ll3-ref__content-copy">
                    A resolution is a legislative measure that often addresses rules, procedures, or expresses the sense of a chamber.
                  </p>
                  <ul className="ll3-ref__list">
                    <li><strong>Simple resolutions</strong> (<span className="ll3-ref__mono">H.Res.</span>, <span className="ll3-ref__mono">S.Res.</span>) apply to one chamber and do not go to the President.</li>
                    <li><strong>Concurrent resolutions</strong> (<span className="ll3-ref__mono">H.Con.Res.</span>, <span className="ll3-ref__mono">S.Con.Res.</span>) involve both chambers and generally do not go to the President.</li>
                    <li><strong>Joint resolutions</strong> (<span className="ll3-ref__mono">H.J.Res.</span>, <span className="ll3-ref__mono">S.J.Res.</span>) function more like bills and typically go to the President, or propose constitutional amendments.</li>
                  </ul>
                </Anchor>
              </article>

              <article className="ll3-ref__panel">
                <Anchor id="laid-on-table">
                  <h3 className="ll3-ref__content-title">What does “laid on the table” mean?</h3>
                  <p className="ll3-ref__content-copy">
                    “Laid on the table” is a parliamentary action that sets aside a measure or motion without further debate. In many contexts, it effectively pauses consideration and can function as a quick way to dispose of a motion.
                  </p>

                  <div className="ll3-ref__callout ll3-ref__callout--warn">
                    <div className="ll3-ref__callout-title">Why it matters</div>
                    <p className="ll3-ref__content-copy">
                      If you’re tracking momentum, this can signal that leadership is moving on from a measure, at least for the moment.
                    </p>
                  </div>
                </Anchor>
              </article>

              <article className="ll3-ref__panel">
                <Anchor id="reconciliation">
                  <h3 className="ll3-ref__content-title">What is reconciliation?</h3>
                  <p className="ll3-ref__content-copy">
                    Reconciliation is a special budget-related process that can make it easier to pass certain fiscal legislation. It is tied to the budget resolution and is intended for measures affecting spending, revenues, or the debt limit.
                  </p>
                  <ul className="ll3-ref__list">
                    <li>Typically limited to budget-related provisions.</li>
                    <li>Often associated with expedited consideration in the Senate.</li>
                    <li>Rules may restrict non-budgetary provisions.</li>
                  </ul>
                  <p className="ll3-ref__content-copy">
                    In practice, reconciliation is often used for major tax and spending packages when the changes have clear budget impacts.
                  </p>
                </Anchor>
              </article>

              <article className="ll3-ref__panel">
                <Anchor id="bill-signals">
                  <h3 className="ll3-ref__content-title">Impact & Trending (Bill signals)</h3>
                  <p className="ll3-ref__content-copy">
                    Bills can be important for different reasons. These two signals are meant to help you scan results faster without making a value judgment.
                  </p>

                  <div className="ll3-ref__callout">
                    <div className="ll3-ref__callout-title">How to read them</div>
                    <ul className="ll3-ref__list">
                      <li><strong>Impact</strong>: a heuristic estimate of potential significance (0–100).</li>
                      <li><strong>Trending</strong>: a heuristic estimate of current momentum or attention (0–100).</li>
                      <li>Higher scores mean more signal, not good or bad.</li>
                    </ul>
                  </div>

                  <div className="ll3-ref__callout ll3-ref__callout--subtle">
                    <div className="ll3-ref__callout-title">Important</div>
                    <p className="ll3-ref__content-copy">
                      These are experimental indicators used for sorting and exploration. Always read the bill details and latest actions for the full picture.
                    </p>
                  </div>
                </Anchor>
              </article>
            </div>
          </div>
        </section>

        <footer className="ll3-ref__footer">
          <span className="ll3-ref__footer-copy">Nonpartisan info layer • Official links only</span>
        </footer>
      </div>
    </main>
  );
}