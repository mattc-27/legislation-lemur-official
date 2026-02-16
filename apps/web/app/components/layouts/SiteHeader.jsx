// components/layout/SiteHeader.jsx
"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

function cx(...parts) {
    return parts.filter(Boolean).join(" ");
}

function isActive(pathname, href) {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
}

export default function SiteHeader() {
    const pathname = usePathname();

    const [open, setOpen] = useState(false); // mobile menu
    const [scrolled, setScrolled] = useState(false);

    const [searchOpen, setSearchOpen] = useState(false); // desktop dropdown
    const dropdownId = useId();
    const dropdownWrapRef = useRef(null);

    // Sticky header shadow
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 4);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setOpen(false);
        setSearchOpen(false);
    }, [pathname]);

    // Close desktop dropdown on outside click / escape
    useEffect(() => {
        if (!searchOpen) return;

        const onDown = (e) => {
            const el = dropdownWrapRef.current;
            if (el && !el.contains(e.target)) setSearchOpen(false);
        };

        const onKey = (e) => {
            if (e.key === "Escape") setSearchOpen(false);
        };

        window.addEventListener("pointerdown", onDown);
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener("keydown", onKey);
        };
    }, [searchOpen]);

    const headerClass = cx(
        "site-header",
        scrolled && "site-header--scrolled",
        open && "site-header--menu-open"
    );

    // ---- Routes (keep your current URLs; rename labels in UI) ----
    const ROUTES = {
        members: "/search", // you can switch to /members later
        bills: "/bills",
        insights: "/insights",
        wiki: "/references",
        about: "/about",
    };

    const membersActive = isActive(pathname, ROUTES.members);
    const billsActive = isActive(pathname, ROUTES.bills);
    const insightsActive = isActive(pathname, ROUTES.insights);
    const wikiActive = isActive(pathname, ROUTES.wiki);
    const aboutActive = isActive(pathname, ROUTES.about);

    const searchSectionActive = membersActive || billsActive;

    return (
        <header className={headerClass} role="banner">
            <div className="container site-header__inner">
                <Link
                    href="/"
                    className="site-header__logo"
                    aria-label="Legislation Lemur — Home"
                >
                    <img
                        src="https://storage.googleapis.com/legislation-lemur-images/logo_updated_b.png"
                        alt=""
                        className="site-header__logo-img"
                        aria-hidden="true"
                    />
                    <span className="site-header__logo-text">Legislation Lemur</span>
                </Link>

                {/* Desktop */}
                <nav className="site-header__nav site-header__nav--desktop" aria-label="Main navigation">
                    {/* Search dropdown */}
                    <div className="site-header__dd" ref={dropdownWrapRef}>
                        <button
                            type="button"
                            className={cx(
                                "site-header__link",
                                "site-header__dd-trigger",
                                searchSectionActive && "is-active"
                            )}
                            aria-haspopup="menu"
                            aria-expanded={searchOpen}
                            aria-controls={dropdownId}
                            onClick={() => setSearchOpen((v) => !v)}
                        >
                            <span>Search</span>
                            <ChevronDown
                                size={16}
                                strokeWidth={2.5}
                                className={cx("site-header__dd-icon", searchOpen && "is-open")}
                                aria-hidden="true"
                            />
                        </button>

                        <div
                            id={dropdownId}
                            className={cx("site-header__dd-menu", searchOpen && "is-open")}
                            role="menu"
                            aria-label="Search menu"
                        >
                            <Link
                                href={ROUTES.bills}
                                className={cx("site-header__dd-item", billsActive && "is-active")}
                                role="menuitem"
                                onClick={() => setSearchOpen(false)}
                            >
                                Bills
                            </Link>

                            <Link
                                href={ROUTES.members}
                                className={cx("site-header__dd-item", membersActive && "is-active")}
                                role="menuitem"
                                onClick={() => setSearchOpen(false)}
                            >
                                Members
                            </Link>
                        </div>
                    </div>


                    <Link
                        href={ROUTES.insights}
                        className={cx("site-header__link", insightsActive && "is-active")}
                        aria-current={insightsActive ? "page" : undefined}
                    >
                        Insights
                    </Link>

                    <Link
                        href={ROUTES.wiki}
                        className={cx("site-header__link", wikiActive && "is-active")}
                        aria-current={wikiActive ? "page" : undefined}
                    >
                        Wiki
                    </Link>

                    <Link
                        href={ROUTES.about}
                        className={cx("site-header__link", aboutActive && "is-active")}
                        aria-current={aboutActive ? "page" : undefined}
                    >
                        About
                    </Link>
                </nav>

                {/* Mobile toggle */}
                <button
                    className="site-header__toggle"
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    onClick={() => setOpen((v) => !v)}
                    type="button"
                >
                    {open ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
                </button>
            </div>

            {/* Mobile (flat list; no dropdown drama) */}
            <nav
                id="mobile-menu"
                className={cx("site-header__nav", "site-header__nav--mobile", open && "is-open")}
                aria-label="Mobile navigation"
            >
                <Link
                    href={ROUTES.bills}
                    className={cx("site-header__link", billsActive && "is-active")}
                    aria-current={billsActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                >
                    Bills
                </Link>

                <Link
                    href={ROUTES.members}
                    className={cx("site-header__link", membersActive && "is-active")}
                    aria-current={membersActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                >
                    Members
                </Link>

                <Link
                    href={ROUTES.insights}
                    className={cx("site-header__link", insightsActive && "is-active")}
                    aria-current={insightsActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                >
                    Insights
                </Link>

                <Link
                    href={ROUTES.wiki}
                    className={cx("site-header__link", wikiActive && "is-active")}
                    aria-current={wikiActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                >
                    Wiki
                </Link>

                <Link
                    href={ROUTES.about}
                    className={cx("site-header__link", aboutActive && "is-active")}
                    aria-current={aboutActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                >
                    About
                </Link>
            </nav>
        </header>
    );
}
