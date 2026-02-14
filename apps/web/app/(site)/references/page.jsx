// app/(wiki)/reference/page.jsx
// Drop-in Next.js (App Router) page. Also works as a plain React component.
// Styling is in /app/(wiki)/reference/reference.css (below).

import '@/app/styles/active/reference.ll3.css';

const LAST_CHECKED = "Feb 13, 2026";

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
        <div className="wk-anchor" id={id}>
            {children}
        </div>
    );
}

export default function ReferencePage() {
    return (
        <main className="wk-page">
            <div className="wk-wrap">
                {/* Hero */}
                <section className="wk-hero" aria-labelledby="wk-title">
                    <div className="wk-hero__pill">
                        <span className="wk-pill">NONPARTISAN • OFFICIAL LINKS ONLY</span>
                        <span className="wk-hero__checked">Last checked: {LAST_CHECKED}</span>
                    </div>

                    <h1 className="wk-title" id="wk-title">
                        Voting Resources
                    </h1>

                    <p className="wk-subtitle">
                        Fast, official links for registration, deadlines, and polling info. Keep it official—use{" "}
                        <a className="wk-link" href="https://vote.gov/" target="_blank" rel="noreferrer">
                            vote.gov
                        </a>{" "}
                        and{" "}
                        <a className="wk-link" href="https://www.nass.org/can-I-vote" target="_blank" rel="noreferrer">
                            Can I Vote
                        </a>
                        .
                    </p>

                    <ul className="wk-bullets" aria-label="Key notes">
                        <li>No accounts or sign-ups here.</li>
                        <li>We send you directly to trusted, official sources.</li>
                        <li>Great starting point whether you’re a new or returning voter.</li>
                    </ul>
                </section>

                {/* 3 Steps */}
                <section className="wk-grid3" aria-label="Voting steps">
                    {QUICK_LINKS.map((c) => (
                        <article className="wk-card" key={c.title}>
                            <div className="wk-card__eyebrow">{c.step}</div>
                            <h2 className="wk-card__title">{c.title}</h2>
                            <p className="wk-card__desc">{c.desc}</p>
                            <a className="wk-btn" href={c.href} target="_blank" rel="noreferrer">
                                {c.cta}
                            </a>
                        </article>
                    ))}
                </section>

                {/* Quick State Lookup */}
                <section className="wk-panel" aria-labelledby="wk-lookup">
                    <div className="wk-panel__head">
                        <h2 className="wk-h2" id="wk-lookup">
                            Quick State Lookup
                        </h2>
                        <p className="wk-muted">
                            Choose a state to jump straight to its page on vote.gov. You’ll finish your registration or lookup on the
                            official site.
                        </p>
                    </div>

                    <div className="wk-lookup">
                        <label className="wk-label" htmlFor="state">
                            Choose your state or territory
                        </label>

                        {/* Note: This is “static UI” recreation; wire it up however you prefer. */}
                        <select id="state" className="wk-select" defaultValue="">
                            <option value="" disabled>
                                — Select —
                            </option>
                            <option value="CO">Colorado</option>
                            <option value="CA">California</option>
                            <option value="NY">New York</option>
                            <option value="TX">Texas</option>
                            <option value="WA">Washington</option>
                        </select>

                        <div className="wk-lookup__cards">
                            <article className="wk-mini">
                                <h3 className="wk-mini__title">vote.gov • Registration</h3>
                                <p className="wk-mini__desc">Official federal portal with your state’s registration and voting info.</p>
                                <button className="wk-btn wk-btn--muted" type="button" disabled>
                                    Select a state
                                </button>
                            </article>

                            <article className="wk-mini">
                                <h3 className="wk-mini__title">Can I Vote • State Info</h3>
                                <p className="wk-mini__desc">
                                    Find your state election office, official FAQs, and more details.
                                </p>
                                <a className="wk-btn wk-btn--ghost" href="https://www.nass.org/can-I-vote" target="_blank" rel="noreferrer">
                                    Open Can I Vote →
                                </a>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Divider */}
                <hr className="wk-hr" />

                {/* About these resources */}
                <section className="wk-about" aria-labelledby="wk-about">
                    <h2 className="wk-h2" id="wk-about">
                        About these resources
                    </h2>

                    <div className="wk-grid3 wk-grid3--tight">
                        <div className="wk-faq">
                            <h3 className="wk-h3">Where do these links go?</h3>
                            <p className="wk-muted">
                                We point to official, nonpartisan sites like vote.gov and Can I Vote so you get accurate, up-to-date
                                information straight from election officials.
                            </p>
                        </div>

                        <div className="wk-faq">
                            <h3 className="wk-h3">Do you store any of my information?</h3>
                            <p className="wk-muted">
                                No. When you click through, you complete any forms directly on the official sites. We don’t collect or
                                store your registration details.
                            </p>
                        </div>

                        <div className="wk-faq">
                            <h3 className="wk-h3">Is this page giving legal advice?</h3>
                            <p className="wk-muted">
                                No. This page is a convenience layer on top of official resources. When in doubt, follow instructions on
                                your state’s official election site.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Wiki / Reference */}
                <section className="wk-wiki" aria-labelledby="wk-wiki">
                    <div className="wk-wiki__head">
                        <h2 className="wk-h2" id="wk-wiki">
                            Wiki / Reference
                        </h2>
                        <p className="wk-muted">
                            Quick definitions for common congressional terms you’ll see in bill listings and status timelines.
                        </p>
                    </div>

                    <div className="wk-wiki__layout">
                        {/* TOC */}
                        <nav className="wk-toc" aria-label="Table of contents">
                            <div className="wk-toc__title">On this page</div>
                            <a className="wk-toc__link" href="#bill-prefixes">
                                Bill prefixes
                            </a>
                            <a className="wk-toc__link" href="#congress-number">
                                What is a Congress number?
                            </a>
                            <a className="wk-toc__link" href="#how-long">
                                How long is a Congress?
                            </a>
                            <a className="wk-toc__link" href="#reported">
                                What does “Reported” mean?
                            </a>
                            <a className="wk-toc__link" href="#resolution">
                                What is a resolution?
                            </a>
                            <a className="wk-toc__link" href="#laid-on-table">
                                What does “laid on the table” mean?
                            </a>
                            <a className="wk-toc__link" href="#reconciliation">
                                What is reconciliation?
                            </a>
                        </nav>

                        {/* Content */}
                        <div className="wk-wiki__content">
                            <Anchor id="bill-prefixes">
                                <h3 className="wk-h3">Bill prefixes (H.R., S., H.Res., S.J.Res., etc.)</h3>
                                <p className="wk-muted">
                                    The prefix tells you what kind of legislative item it is and which chamber introduced it.
                                </p>

                                <div className="wk-tableWrap" role="region" aria-label="Bill prefixes table">
                                    <table className="wk-table">
                                        <thead>
                                            <tr>
                                                <th scope="col">Prefix</th>
                                                <th scope="col">Meaning</th>
                                                <th scope="col">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {BILL_PREFIXES.map((row) => (
                                                <tr key={row.prefix}>
                                                    <td className="wk-mono">{row.prefix}</td>
                                                    <td>{row.meaning}</td>
                                                    <td className="wk-muted">{row.notes}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="wk-callout">
                                    <div className="wk-callout__title">Tip</div>
                                    <p className="wk-muted">
                                        A bill (<span className="wk-mono">H.R.</span> / <span className="wk-mono">S.</span>) can become law if
                                        passed by both chambers and signed by the President. Many “resolution” types do not become law.
                                    </p>
                                </div>
                            </Anchor>

                            <Anchor id="congress-number">
                                <h3 className="wk-h3">What is a Congress number?</h3>
                                <p className="wk-muted">
                                    The “Congress number” is a way to group time in the U.S. federal legislature. Each new Congress begins
                                    after a federal election cycle and is numbered sequentially (e.g., 118th, 119th).
                                </p>
                                <p className="wk-muted">
                                    When you see a bill like <span className="wk-mono">H.R. 1234 (119th)</span>, it means that bill was
                                    introduced during the 119th Congress.
                                </p>
                            </Anchor>

                            <Anchor id="how-long">
                                <h3 className="wk-h3">How long is a Congress?</h3>
                                <p className="wk-muted">
                                    A Congress lasts <strong>two years</strong> and is typically divided into two annual sessions (“1st
                                    Session” and “2nd Session”). Bills that don’t pass by the end of a Congress generally do not carry over
                                    into the next Congress and must be reintroduced.
                                </p>
                            </Anchor>

                            <Anchor id="reported">
                                <h3 className="wk-h3">What does “Reported” mean?</h3>
                                <p className="wk-muted">
                                    “Reported” usually means a committee has finished considering a bill (or nomination) and has sent it
                                    back to the full chamber with a recommendation. Often this includes a written committee report and may
                                    include amendments adopted in committee.
                                </p>
                                <div className="wk-callout wk-callout--subtle">
                                    <div className="wk-callout__title">Common pattern</div>
                                    <p className="wk-muted">
                                        Introduced → Referred to committee → Committee action/markup → <strong>Reported</strong> → Placed on
                                        calendar / scheduled for floor consideration.
                                    </p>
                                </div>
                            </Anchor>

                            <Anchor id="resolution">
                                <h3 className="wk-h3">What is a resolution?</h3>
                                <p className="wk-muted">
                                    A resolution is a legislative measure that often addresses rules, procedures, or expresses the sense of
                                    a chamber. There are different types:
                                </p>
                                <ul className="wk-list">
                                    <li>
                                        <strong>Simple resolutions</strong> (<span className="wk-mono">H.Res.</span>,{" "}
                                        <span className="wk-mono">S.Res.</span>): apply to one chamber only; do not go to the President.
                                    </li>
                                    <li>
                                        <strong>Concurrent resolutions</strong> (<span className="wk-mono">H.Con.Res.</span>,{" "}
                                        <span className="wk-mono">S.Con.Res.</span>): involve both chambers; generally do not go to the
                                        President.
                                    </li>
                                    <li>
                                        <strong>Joint resolutions</strong> (<span className="wk-mono">H.J.Res.</span>,{" "}
                                        <span className="wk-mono">S.J.Res.</span>): similar to bills; if passed, typically go to the President
                                        (or can propose constitutional amendments).
                                    </li>
                                </ul>
                            </Anchor>

                            <Anchor id="laid-on-table">
                                <h3 className="wk-h3">What does “laid on the table” mean?</h3>
                                <p className="wk-muted">
                                    “Laid on the table” is a parliamentary action that sets aside a measure (or a motion) without further
                                    debate. In many contexts, it effectively pauses consideration—and can function like a quick way to
                                    dispose of a motion—though procedures and practical effect can vary by chamber and situation.
                                </p>
                                <div className="wk-callout wk-callout--warn">
                                    <div className="wk-callout__title">Why it matters</div>
                                    <p className="wk-muted">
                                        If you’re tracking a bill’s momentum, “laid on the table” can be a sign that leadership is moving on
                                        (at least for now).
                                    </p>
                                </div>
                            </Anchor>

                            <Anchor id="reconciliation">
                                <h3 className="wk-h3">What is reconciliation?</h3>
                                <p className="wk-muted">
                                    Reconciliation is a special budget-related process used in Congress that can make it easier to pass
                                    certain fiscal legislation. It’s tied to the budget resolution and is designed for measures that
                                    affect spending, revenues, or the debt limit.
                                </p>
                                <ul className="wk-list">
                                    <li>Typically limited to budget-related provisions.</li>
                                    <li>Often associated with expedited consideration in the Senate.</li>
                                    <li>Rules may restrict “extra” policy provisions that aren’t budgetary in nature.</li>
                                </ul>
                                <p className="wk-muted">
                                    In practice, reconciliation is often used for major tax, spending, and health policy packages—when the
                                    underlying changes have budget impacts.
                                </p>
                            </Anchor>
                        </div>
                    </div>
                </section>

                <footer className="wk-footer">
                    <span className="wk-muted">Nonpartisan info layer • Official links only</span>
                </footer>
            </div>
        </main>
    );
}
