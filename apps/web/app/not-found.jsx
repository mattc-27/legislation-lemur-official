import '../lib/stylesheets/refactored/error-pages.refactored.css';

export default function NotFound() {
    return (
        <div className="error-page">
            <div className="error-page__inner">
                <header className="error-header">
                    <p className="error-kicker">Error 404</p>
                    <h1 className="error-title">Page not found</h1>
                    <p className="error-subtitle">
                        We couldn’t find the page you were looking for. It may have
                        moved, been renamed, or never existed.
                    </p>
                    <div className="error-actions">
                        <a className="btn" href="/">
                            Go home
                        </a>
                        <a className="btn btn--ghost" href="/members">
                            Browse members of Congress
                        </a>
                    </div>
                </header>

                <section className="error-layout">
                    <div className="error-copy-secondary">
                        <h2 className="error-secondary-title">Where to next?</h2>
                        <ul className="error-links">
                            <li>
                                <a href="/members">Search members by name or state</a>
                            </li>
                            <li>
                                <a href="/committees">Browse Congressional committees</a>
                            </li>
                            <li>
                                <a href="/bills">Explore recent bills and activity</a>
                            </li>
                        </ul>
                        <p className="error-hint">
                            If you believe this is a broken link, feel free to try again
                            later or return to the homepage.
                        </p>
                    </div>

                    <figure
                        className="error-figure"
                        data-anim="fade-up"
                        style={{ "--i": 1 }}
                    >
                        <img
                            //src="/lemur-images/lemur-found.png"
                            src="https://storage.googleapis.com/legislation-lemur-images/not-found-lemur.png"
                            alt="Legislation Lemur looking lost among the stacks"
                            className="error-figure__img"
                            loading="lazy"
                        />
                    </figure>
                </section>
            </div>
        </div>
    );
}
