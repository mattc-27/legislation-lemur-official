"use client";

import {
    HOME_INTRO_TITLE,
    HOME_INTRO_PARAS,
    HOME_COMING_SOON_BADGE,
    HOME_COMING_SOON_ITEMS,
} from "@/lib/content/homeContent";

export default function FeaturesGrid() {
    const now = HOME_COMING_SOON_ITEMS.slice(0, Math.ceil(HOME_COMING_SOON_ITEMS.length / 2));
    const soon = HOME_COMING_SOON_ITEMS.slice(Math.ceil(HOME_COMING_SOON_ITEMS.length / 2));

    return (
        <section className="home-features">
            <div className="container home-features__stack">

                <div className="feature-row">
                    <div className="feature-row__panel">


                        <div className="panel">
                            <h3 className="section__title">Start here</h3>
                            <p className="section__sub reg">
                                Jump straight into members or bills—then drill into activity, topics, and trends.
                            </p>
                            <div className="feature-row__cta">
                                <a className="btn btn--primary" href="/members">Explore members</a>
                                <a className="btn btn--ghost" href="/bills">Explore bills</a>
                            </div>
                        </div>
                    </div>
                    <div className="feature-row__blank" aria-hidden="true" />
                </div>

                <div className="feature-row feature-row--reverse">
                    <div className="feature-row__panel">
                        <div className="panel">
                            <div className="soon">
                                <span className="badge badge--soon">{HOME_COMING_SOON_BADGE}</span>
                                <ul className="checklist">
                                    {now.map((item) => <li key={item}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="feature-row__blank" aria-hidden="true" />
                </div>

                <div className="feature-row">
                    <div className="feature-row__panel">
                        <div className="panel">
                            <h3 className="section__title">On the roadmap</h3>
                            <p className="section__sub reg">
                                More “change-first” views and comparisons—designed to stay neutral and readable.
                            </p>
                            <ul className="checklist">
                                {soon.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                    <div className="feature-row__blank" aria-hidden="true" />
                </div>

            </div>
        </section>

    );
}
