import "@/app/styles/active/site/ll3.reference.css";

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
    desc: "Find your state election office, ID requirements, early voting, and mail voting options.",
    href: "https://www.nass.org/can-I-vote",
    cta: "Open Can I Vote",
  },
  {
    step: "Step 3",
    title: "Upcoming Elections & Ballots",
    desc: "Review election dates, ballot measures, and candidate information before election day.",
    href: "https://ballotpedia.org/",
    cta: "Open Ballotpedia",
  },
];

const RESOURCE_LINKS = [
  {
    label: "Federal registration portal",
    title: "vote.gov",
    desc: "Start registration, check registration options, and find official state-specific voting guidance.",
    href: "https://vote.gov/",
    cta: "Open vote.gov",
  },
  {
    label: "Federal voting hub",
    title: "USA.gov Voting & Elections",
    desc: "Plain-language federal guidance for registration, voting, election process basics, and voter rights.",
    href: "https://www.usa.gov/voting-and-elections",
    cta: "Open USA.gov",
  },
  {
    label: "Mail and absentee voting",
    title: "USA.gov Absentee Voting",
    desc: "Dedicated federal resource for absentee and mail voting basics, with links to state instructions.",
    href: "https://www.usa.gov/absentee-voting",
    cta: "Open absentee guide",
  },
  {
    label: "State election offices",
    title: "Can I Vote",
    desc: "A state-by-state directory from the National Association of Secretaries of State.",
    href: "https://www.nass.org/can-I-vote",
    cta: "Open Can I Vote",
  },
  {
    label: "State law comparisons",
    title: "NCSL Elections & Campaigns",
    desc: "State-by-state voting law resources, including election administration and policy comparisons.",
    href: "https://www.ncsl.org/elections-and-campaigns",
    cta: "Open NCSL",
  },
  {
    label: "Federal legislation",
    title: "Congress.gov",
    desc: "The authoritative federal source for bill text, actions, sponsors, committees, and legislative status.",
    href: "https://www.congress.gov/",
    cta: "Open Congress.gov",
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

const TOC_LINKS = [
  ["bill-prefixes", "Bill prefixes"],
  ["committee-types", "Committee types"],
  ["congress-number", "What is a Congress number?"],
  ["how-long", "How long is a Congress?"],
  ["reported", "What does “Reported” mean?"],
  ["markup", "Markup"],
  ["resolution", "What is a resolution?"],
  ["cloture", "Cloture & filibuster"],
  ["engrossed-enrolled", "Engrossed vs. Enrolled"],
  ["pocket-veto", "Pocket veto"],
  ["laid-on-table", "Laid on the table"],
  ["reconciliation", "Reconciliation"],
  ["bill-signals", "Impact & Trending signals"],
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
    <main className="ll3-ref" id="top">
      <div className="container ll3-ref__wrap">
        <section className="ll3-ref__hero">
          <div className="ll3-ref__hero-grid">
            <div className="ll3-ref__hero-copy">
              <div className="ll3-ref__eyebrow">Voting resources & civic reference</div>

              <h1 className="ll3-ref__title">Reference Center</h1>

              <p className="ll3-ref__subtitle">
                Fast links to official voting resources, plus plain-language explanations for common congressional terms you’ll see across bills, committees, and status timelines.
              </p>

              <p className="ll3-ref__neutral-note">
                Legislation Lemur does not endorse candidates or parties. This page links to official public resources and explains civic process terms in plain language.
              </p>

              <div className="ll3-ref__meta">
                <span className="ll3-ref__pill">Official public resources only</span>
                <span className="ll3-ref__pill ll3-ref__pill--soft">No forms or sign-ups here</span>
              </div>

              <div className="ll3-ref__signals" aria-label="Page highlights">
                <div className="ll3-ref__signal">
                  <span className="ll3-ref__signal-dot" aria-hidden="true" />
                  <div>
                    <div className="ll3-ref__signal-title">Source-aware shortcuts</div>
                    <div className="ll3-ref__signal-copy">
                      Use this as a starting point, then complete registration or lookups directly on official sites.
                    </div>
                  </div>
                </div>

                <div className="ll3-ref__signal">
                  <span className="ll3-ref__signal-dot" aria-hidden="true" />
                  <div>
                    <div className="ll3-ref__signal-title">Plain-language explanations</div>
                    <div className="ll3-ref__signal-copy">
                      Quick definitions for procedural terms that can make bill tracking confusing.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="ll3-ref__hero-aside" aria-label="Before you begin">
              <div className="ll3-ref__hero-card">
                <div className="ll3-ref__hero-card-kicker">Before you begin</div>
                <ul className="ll3-ref__hero-list">
                  <li>Have your current address ready.</li>
                  <li>Some states may require ID verification.</li>
                  <li>Deadlines and voting rules vary by state.</li>
                  <li>For final instructions, always follow your state election office.</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section className="ll3-ref__steps" aria-label="Voting steps">
          {QUICK_LINKS.map((item) => (
            <article className="ll3-ref__step-card" key={item.title}>
              <div className="ll3-ref__step-eyebrow">{item.step}</div>
              <h2 className="ll3-ref__step-title">{item.title}</h2>
              <p className="ll3-ref__step-desc">{item.desc}</p>

              <a className="ll3-ref__step-cta" href={item.href} target="_blank" rel="noreferrer">
                {item.cta}
              </a>
            </article>
          ))}
        </section>

        <section className="ll3-ref__resources" aria-labelledby="wk-resources">
          <div className="ll3-ref__section-head">
            <div className="ll3-ref__eyebrow">Practical resources</div>
            <h2 className="ll3-ref__section-title" id="wk-resources">
              Official links worth keeping handy
            </h2>
            <p className="ll3-ref__section-sub">
              These links are useful now and do not depend on state-level scraper data. State-specific routing can be added later once the EAC link dataset is ready.
            </p>
          </div>

          <div className="ll3-ref__resource-grid">
            {RESOURCE_LINKS.map((item) => (
              <article className="ll3-ref__resource-card" key={item.href}>
                <div className="ll3-ref__resource-label">{item.label}</div>
                <h3 className="ll3-ref__resource-title">{item.title}</h3>
                <p className="ll3-ref__resource-desc">{item.desc}</p>
                <a className="ll3-ref__resource-link" href={item.href} target="_blank" rel="noreferrer">
                  {item.cta}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="ll3-ref__about" aria-labelledby="wk-about">
          <div className="ll3-ref__section-head">
            <div className="ll3-ref__eyebrow">About this page</div>
            <h2 className="ll3-ref__section-title" id="wk-about">
              A shortcut layer, not a replacement for official instructions
            </h2>
            <p className="ll3-ref__section-sub">
              This page is meant to reduce friction: find the right public source faster, understand the basic process, and then verify details with the official authority that owns the rule or record.
            </p>
          </div>

          <div className="ll3-ref__faq-grid ll3-ref__faq-grid--compact">
            <div className="ll3-ref__faq-card">
              <h3 className="ll3-ref__faq-title">Where do these links go?</h3>
              <p className="ll3-ref__faq-copy">
                To official or widely used public reference sources such as vote.gov, USA.gov, Congress.gov, NASS, NCSL, and state election offices.
              </p>
            </div>

            <div className="ll3-ref__faq-card">
              <h3 className="ll3-ref__faq-title">Do you store my information?</h3>
              <p className="ll3-ref__faq-copy">
                No. Any registration, voter lookup, or form completion happens directly on the external official site you choose to open.
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
              {TOC_LINKS.map(([id, label]) => (
                <a className="ll3-ref__toc-link" href={`#${id}`} key={id}>
                  {label}
                </a>
              ))}
              <a className="ll3-ref__toc-link ll3-ref__toc-link--top" href="#top">
                ↑ Back to top
              </a>
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
                        Often created to investigate, study, or focus on issues that cross jurisdictions or do not fit neatly into a standing committee.
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
                <Anchor id="markup">
                  <h3 className="ll3-ref__content-title">What is a markup?</h3>
                  <p className="ll3-ref__content-copy">
                    A markup is a committee session where members debate, amend, and revise legislation before deciding whether to advance it.
                  </p>
                  <p className="ll3-ref__content-copy">
                    Amendments adopted during markup can substantially change a bill before it reaches the full chamber.
                  </p>
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
                <Anchor id="cloture">
                  <h3 className="ll3-ref__content-title">What are cloture and the filibuster?</h3>
                  <p className="ll3-ref__content-copy">
                    In the Senate, debate on legislation can continue for an extended period unless senators agree to end debate. This extended debate is commonly referred to as a filibuster.
                  </p>
                  <p className="ll3-ref__content-copy">
                    Cloture is the formal process used to end debate and move toward a vote. Most legislation requires a supermajority vote to invoke cloture.
                  </p>
                  <div className="ll3-ref__callout">
                    <div className="ll3-ref__callout-title">Why it matters</div>
                    <p className="ll3-ref__content-copy">
                      Bills can have majority support but still stall if cloture cannot be invoked.
                    </p>
                  </div>
                </Anchor>
              </article>

              <article className="ll3-ref__panel">
                <Anchor id="engrossed-enrolled">
                  <h3 className="ll3-ref__content-title">Engrossed vs. Enrolled bills</h3>
                  <p className="ll3-ref__content-copy">
                    An engrossed bill is an updated official version that includes amendments passed by one chamber.
                  </p>
                  <p className="ll3-ref__content-copy">
                    An enrolled bill is the final version passed by both chambers in identical form and sent to the President.
                  </p>
                </Anchor>
              </article>

              <article className="ll3-ref__panel">
                <Anchor id="pocket-veto">
                  <h3 className="ll3-ref__content-title">What is a pocket veto?</h3>
                  <p className="ll3-ref__content-copy">
                    A pocket veto occurs when the President does not sign a bill and Congress adjourns before the bill can automatically become law.
                  </p>
                  <p className="ll3-ref__content-copy">
                    Unlike a regular veto, Congress generally cannot override a pocket veto after adjournment.
                  </p>
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
                      If you are tracking momentum, this can signal that leadership is moving on from a measure, at least for the moment.
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
          <span className="ll3-ref__footer-copy">
            Civic reference layer • Official public resources where possible • Not legal advice
          </span>
        </footer>
      </div>
    </main>
  );
}
