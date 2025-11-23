"use client";

export default function FeaturesGrid() {

    return (
        <section className="section features-intro">
            <div className="container features-intro__grid">
                <div className="panel panel--intro">
                    <h3 className="section__title">Legislation Lemur (light preview)</h3>

                    <p className="section__sub reg">
                        You’re viewing an early, lightweight version of Legislation Lemur. The core data foundation is now in place—covering members of Congress, sponsored and co-sponsored bills, floor votes, and high-level composition of the current session. You can search members by name or state and quickly open a clean, factual profile.
                    </p>

                    <p className="section__sub reg">
                        The homepage highlights a clear snapshot of the 119th Congress, paired with simple visuals designed to help you get oriented without digging through dense tables or PDFs. Speed, clarity, and neutrality are the priorities.
                    </p>

                    <div className="soon">
                        <span className="badge badge--soon">More detail coming soon</span>
                        <ul className="checklist">
                            <li>Richer member pages: committees, voting patterns, issue focus</li>

                            <li>Deeper Congress composition views: filters, trends, demographics</li>

                            <li>Interactive timelines for bills, floor actions, and committee progress</li>

                            <li>Saved members & states for quick return visits</li>

                            <li>Email subscriptions for periodic updates (weekly summaries, activity highlights) — planned for 2026</li>

                            <li>Election tools: state proposition breakdowns, voter guides, and neutral AI summaries</li>

                            <li>Session 2 of the 119th Congress begins January 7, 2026 — LL will expand coverage as the new session starts</li>
                        </ul>
                    </div>
                </div>

                <figure
                    className="features-intro__art"
                    data-anim="fade-up"
                >
                    <img
                        //  src="/lemur-images/coming-soon-email-lemur.png"
                        src="https://storage.googleapis.com/legislation-lemur-images/coming-soon-email-lemur.png"
                        alt="Legislation Lemur in the stacks—brand illustration"
                        className="features-intro__img"
                        loading="lazy"
                    />
                </figure>
            </div>
        </section>

    );
}
