import RecentActivity from "./RecentActivity";
import {
    HOME_RECENTLY_ADDED_BADGE,
    HOME_RECENTLY_ADDED_ITEMS,
    HOME_ROADMAP_ITEMS,
} from "@/lib/content/homeContent";

export default function HomeSections() {
    return (
        <section className="home-features">
            <div className="container home-features__stack">

                {/* Start here (keep 2-col row + blank)
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
 */}
                {/* Full-width: Live snapshot */}
                <div className="feature-row feature-row--full">
                    <div className="feature-row__panel">
                        <RecentActivity
                            maxItems={6}
                            showHeader={true}
                            title="What’s happening this session"
                            sub="A quick snapshot of new bills and major actions."
                        />
                    </div>
                </div>

                {/* Full-width: Recently added */}
                <div className="feature-row feature-row--full">
                    <div className="feature-row__panel">
                        <div className="panel">
                            <div className="soon">
                                <span className="badge badge--new">{HOME_RECENTLY_ADDED_BADGE}</span>

                                <h3 className="section__title section__title--tight">Recently added</h3>
                                <p className="section__sub reg">
                                    New tools and views now live across the site.
                                </p>

                                <ul className="checklist">
                                    {HOME_RECENTLY_ADDED_ITEMS.map((item) => (
                                        <li key={item.label}>
                                            {item.href ? (
                                                <a href={item.href} className="home-inline-link">
                                                    {item.label}
                                                </a>
                                            ) : (
                                                item.label
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full-width: Roadmap */}
                <div className="feature-row feature-row--full">
                    <div className="feature-row__panel">
                        <div className="panel">
                            <h3 className="section__title">On the roadmap</h3>
                            <p className="section__sub reg">
                                More “change-first” views and comparisons—designed to stay neutral and readable.
                            </p>

                            <ul className="checklist">
                                {HOME_ROADMAP_ITEMS.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}