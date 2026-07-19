"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Clock3, ListMinus, ListPlus } from "lucide-react";

const DESKTOP_INITIAL_VISIBLE_COUNT = 3;

function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function keyFor(change, index) {
    return [
        change.kind,
        change.id || change.stateCode,
        change.occurredAt,
        change.headline,
        index,
    ]
        .filter((value) => value != null && value !== "")
        .join(":");
}

function badgeClassFor(badge) {
    const modifier = String(badge || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return modifier ? `ll3-badge ll3-badge--${modifier}` : "ll3-badge";
}

function districtLabel(change) {
    if (!change.stateCode) return "";

    if (change.district == null) {
        return change.stateCode;
    }

    return `${change.stateCode}-${change.district === 0 ? "AL" : change.district}`;
}

function MemberUpdateCard({ change }) {
    const locationLabel = districtLabel(change);

    return (
        <article className="ll3-memberUpdateCard">
            <div className="ll3-memberUpdateCard__body">
                <div className="ll3-memberUpdateCard__top">
                    <h3 className="ll3-memberUpdateCard__headline">{change.headline}</h3>

                    {change.badge ? (
                        <span className={badgeClassFor(change.badge)}>{change.badge}</span>
                    ) : null}
                </div>

                {change.subheadline ? (
                    <p className="ll3-memberUpdateCard__sub">{change.subheadline}</p>
                ) : null}

                <div className="ll3-memberUpdateCard__meta">
                    {locationLabel ? <span>{locationLabel}</span> : null}

                    {locationLabel && change.occurredAt ? (
                        <span className="ll3-metaSep" aria-hidden="true">
                            •
                        </span>
                    ) : null}

                    {change.occurredAt ? (
                        <>
                            <Clock3 size={13} aria-hidden="true" />
                            <span>{formatDate(change.occurredAt)}</span>
                        </>
                    ) : null}
                </div>

                {change.target || change.secondaryTarget ? (
                    <div className="ll3-memberUpdateCard__links">
                        {change.target ? (
                            <Link
                                href={change.target.href}
                                className="ll3-memberUpdateCard__link"
                            >
                                {change.target.label} →
                            </Link>
                        ) : null}

                        {change.secondaryTarget ? (
                            <Link
                                href={change.secondaryTarget.href}
                                className="ll3-memberUpdateCard__link ll3-memberUpdateCard__link--secondary"
                            >
                                {change.secondaryTarget.label} →
                            </Link>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </article>
    );
}

export default function MemberUpdatesPanel({ changes = [] }) {
    const [showAllDesktop, setShowAllDesktop] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const desktopListId = useId();
    const mobileListId = useId();

    const safeChanges = Array.isArray(changes) ? changes : [];

    if (!safeChanges.length) return null;

    const hiddenDesktopCount = Math.max(
        safeChanges.length - DESKTOP_INITIAL_VISIBLE_COUNT,
        0,
    );

    const desktopChanges = showAllDesktop
        ? safeChanges
        : safeChanges.slice(0, DESKTOP_INITIAL_VISIBLE_COUNT);

    const updateCountLabel = `${safeChanges.length} update${safeChanges.length === 1 ? "" : "s"
        }`;

    return (
        <section className="ll3-memberUpdates" aria-label="Recent member changes">
            <div className="ll3-memberUpdates__desktop">
                <header className="ll3-memberUpdates__header">
                    <div className="ll3-memberUpdates__headerText">
                        <h2 className="ll3-memberUpdates__title">Recent Changes</h2>
                        <p className="ll3-memberUpdates__sub">
                            Live updates on House vacancies and member activity.
                        </p>
                    </div>

                    <span className="ll3-memberUpdates__summaryPill">
                        {updateCountLabel}
                    </span>
                </header>

                <div id={desktopListId} className="ll3-memberUpdates__list">
                    {desktopChanges.map((change, index) => (
                        <MemberUpdateCard key={keyFor(change, index)} change={change} />
                    ))}
                </div>

                {hiddenDesktopCount > 0 ? (
                    <div className="ll3-memberUpdates__footer">
                        <button
                            type="button"
                            className="ll3-memberUpdates__moreButton"
                            aria-expanded={showAllDesktop}
                            aria-controls={desktopListId}
                            onClick={() => setShowAllDesktop((current) => !current)}
                        >
                            <span>
                                {showAllDesktop
                                    ? "Show fewer"
                                    : `View ${hiddenDesktopCount} more update${hiddenDesktopCount === 1 ? "" : "s"
                                    }`}
                            </span>

                            {showAllDesktop ? (
                                <ListMinus
                                    className="ll3-memberUpdates__moreIcon"
                                    size={16}
                                    strokeWidth={2.2}
                                    aria-hidden="true"
                                />
                            ) : (
                                <ListPlus
                                    className="ll3-memberUpdates__moreIcon"
                                    size={16}
                                    strokeWidth={2.2}
                                    aria-hidden="true"
                                />
                            )}
                        </button>
                    </div>
                ) : null}
            </div>

            <div className="ll3-memberUpdates__mobile">
                <div className="ll3-memberUpdates__mobileHeader">
                    <div className="ll3-memberUpdates__mobileHeaderTop">
                        <div className="ll3-memberUpdates__headerText">
                            <h2 className="ll3-memberUpdates__title">Recent Changes</h2>
                            <p className="ll3-memberUpdates__sub">
                                Live updates on vacancies and member activity.
                            </p>
                        </div>

                        <span className="ll3-memberUpdates__summaryPill">
                            {updateCountLabel}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="ll3-memberUpdates__mobileToggle"
                        aria-expanded={mobileOpen}
                        aria-controls={mobileListId}
                        onClick={() => setMobileOpen((current) => !current)}
                    >
                        <span className="ll3-memberUpdates__mobileToggleIconWrap">
                            {mobileOpen ? (
                                <ListMinus
                                    className="ll3-memberUpdates__mobileToggleIcon"
                                    size={19}
                                    strokeWidth={2.2}
                                    aria-hidden="true"
                                />
                            ) : (
                                <ListPlus
                                    className="ll3-memberUpdates__mobileToggleIcon"
                                    size={19}
                                    strokeWidth={2.2}
                                    aria-hidden="true"
                                />
                            )}
                        </span>

                        <span className="ll3-memberUpdates__mobileToggleCopy">
                            <span className="ll3-memberUpdates__mobileToggleLabel">
                                {mobileOpen ? "Hide recent changes" : "Browse recent changes"}
                            </span>
                            <span className="ll3-memberUpdates__mobileToggleMeta">
                                {mobileOpen
                                    ? "Collapse this section"
                                    : `${updateCountLabel} · swipe or scroll to browse`}
                            </span>
                        </span>
                    </button>
                </div>

                <div
                    id={mobileListId}
                    className="ll3-memberUpdates__mobileContent"
                    hidden={!mobileOpen}
                >
                    <p className="ll3-memberUpdates__mobileHint">
                        Swipe or scroll to browse.
                    </p>

                    <div
                        className="ll3-memberUpdates__scroller"
                        role="region"
                        aria-label="Recent member change cards"
                        tabIndex={0}
                    >
                        {safeChanges.map((change, index) => (
                            <MemberUpdateCard key={keyFor(change, index)} change={change} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
