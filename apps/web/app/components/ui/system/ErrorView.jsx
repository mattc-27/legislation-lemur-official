"use client";

import { useMemo, useState } from "react";

export default function ErrorView({
    title = "We hit a snag",
    message = "Something went wrong while loading this page.",
    errorId,
    details, // { name, message, stack, status, cause?, ... }
    onRetry,
    homeHref = "/",
    img,
}) {
    const isDev = process.env.NODE_ENV !== "production";
    const [copied, setCopied] = useState(false);

    const status = details?.status ?? null;

    const { kicker, friendlyTitle, friendlyMessage } = useMemo(() => {
        const base = { friendlyTitle: title, friendlyMessage: message, kicker: "Error" };

        if (status === 404) {
            return { kicker: "Error 404", friendlyTitle: "Not found", friendlyMessage: "We couldn’t find this data right now." };
        }
        if (status === 429) {
            return { kicker: "Error 429", friendlyTitle: "Rate limited", friendlyMessage: "Too many requests—please try again in a moment." };
        }
        if (typeof status === "number" && status >= 500) {
            return { kicker: "Error 5xx", friendlyTitle: "Service issue", friendlyMessage: "Our data service had a hiccup—try again shortly." };
        }
        return base;
    }, [status, title, message]);

    const canCopy = Boolean(errorId && details);
    const showDevDetails = isDev && details;
    const showFigure = Boolean(img) || showDevDetails;

    const copy = async () => {
        if (!canCopy) return;
        try {
            const payload = JSON.stringify({ errorId, ...details }, null, 2);
            await navigator.clipboard.writeText(payload);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            // ignore
        }
    };

    return (
        <div className="error-page">
            <div className="error-page__inner">
                <header className="error-header">
                    <p className="error-kicker">{kicker}</p>
                    <h1 className="error-title">{friendlyTitle}</h1>
                    <p className="error-subtitle">{friendlyMessage}</p>

                    <div className="error-actions">
                        {onRetry && (
                            <button type="button" className="btn" onClick={onRetry}>
                                Try again
                            </button>
                        )}
                        <a className="btn btn--ghost" href={homeHref}>
                            Go home
                        </a>
                    </div>

                    {errorId && (
                        <div className="error-meta">
                            <span className="error-meta__label">Error ID</span>
                            <code className="error-meta__code">{errorId}</code>
                            {canCopy && (
                                <button type="button" className="error-meta__copy" onClick={copy}>
                                    {copied ? "Copied" : "Copy details"}
                                </button>
                            )}
                        </div>
                    )}
                </header>

                <section className="error-layout">
                    <div className="error-copy-secondary">
                        <h2 className="error-secondary-title">What you can do</h2>
                        <ul className="error-links">
                            {onRetry && (
                                <li>
                                    <button type="button" className="error-linklike" onClick={onRetry}>
                                        Retry this request
                                    </button>
                                </li>
                            )}
                            <li>
                                <a href={homeHref}>Return to the homepage</a>
                            </li>
                            <li>
                                <a href="/members">Browse members</a>
                            </li>
                            <li>
                                <a href="/bills">Explore bills</a>
                            </li>
                        </ul>

                        {!isDev && (
                            <p className="error-hint">If this keeps happening, try again later.</p>
                        )}
                    </div>

                    {showFigure && (
                        <figure className="error-figure" data-anim="fade-up" style={{ "--i": 1 }}>
                            {img ? (
                                <img
                                    src={img}
                                    alt=""
                                    className="error-figure__img"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="error-devbox">
                                    <p className="error-devbox__title">Developer details</p>
                                    <pre className="error-devbox__pre">
                                        {JSON.stringify(details ?? {}, null, 2)}
                                    </pre>
                                    {details?.stack && (
                                        <pre className="error-devbox__pre">{details.stack}</pre>
                                    )}
                                </div>
                            )}
                        </figure>
                    )}
                </section>

                {/* If you prefer the <details> style instead of the right-side devbox,
            remove the devbox above and keep this section. */}
              {showDevDetails && (
          <details className="error-details">
            <summary className="error-details__summary">Developer details</summary>
            <pre className="error-details__pre">{JSON.stringify(details, null, 2)}</pre>
            {details?.stack && <pre className="error-details__pre">{details.stack}</pre>}
          </details>
        )}    {/**/}
            </div>
        </div>
    );
}
