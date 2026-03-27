"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/app/components/ui/system/ThemeToggle";

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

    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const dropdownId = useId();
    const dropdownWrapRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 6);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setOpen(false);
        setSearchOpen(false);
    }, [pathname]);

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

    const ROUTES = {
        home: "/",
        members: "/search",
        bills: "/bills",
        committees: "/committees",
        wiki: "/references",
        about: "/about",
    };

    const membersActive = isActive(pathname, ROUTES.members);
    const billsActive = isActive(pathname, ROUTES.bills);
    const committeesActive = isActive(pathname, ROUTES.committees);
    const wikiActive = isActive(pathname, ROUTES.wiki);
    const aboutActive = isActive(pathname, ROUTES.about);
    const searchSectionActive = membersActive || billsActive;

    return (
        <header className={headerClass} role="banner">
            <div className="container site-header__inner">
                <Link
                    href={ROUTES.home}
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

                <nav
                    className="site-header__nav site-header__nav--desktop"
                    aria-label="Main navigation"
                >
                    <div className="site-header__dd" ref={dropdownWrapRef}>
                        <button
                            type="button"
                            className={cx(
                                "site-header__link",
                                "site-header__dd-trigger",
                                searchOpen && "is-active"
                            )}
                            aria-haspopup="menu"
                            aria-expanded={searchOpen}
                            aria-controls={dropdownId}
                            onClick={() => setSearchOpen((v) => !v)}
                        >
                            <span>Explore</span>
                            <ChevronDown
                                size={16}
                                strokeWidth={2.2}
                                className={cx("site-header__dd-icon", searchOpen && "is-open")}
                                aria-hidden="true"
                            />
                        </button>

                        <div
                            id={dropdownId}
                            className={cx("site-header__dd-menu", searchOpen && "is-open")}
                            role="menu"
                            aria-label="Explore menu"
                        >
                            <Link
                                href={ROUTES.members}
                                className={cx("site-header__dd-item", membersActive && "is-active")}
                                role="menuitem"
                                onClick={() => setSearchOpen(false)}
                            >
                                Representatives
                            </Link>

                            <Link
                                href={ROUTES.bills}
                                className={cx("site-header__dd-item", billsActive && "is-active")}
                                role="menuitem"
                                onClick={() => setSearchOpen(false)}
                            >
                                Bills
                            </Link>
                        </div>
                    </div>

                    <Link
                        href={ROUTES.committees}
                        className={cx("site-header__link", committeesActive && "is-active")}
                        aria-current={committeesActive ? "page" : undefined}
                    >
                        Committees
                    </Link>

                    <Link
                        href={ROUTES.wiki}
                        className={cx("site-header__link", wikiActive && "is-active")}
                        aria-current={wikiActive ? "page" : undefined}
                    >
                        Reference
                    </Link>

                    <Link
                        href={ROUTES.about}
                        className={cx("site-header__link", aboutActive && "is-active")}
                        aria-current={aboutActive ? "page" : undefined}
                    >
                        About
                    </Link>
                </nav>

                <div className="site-header__actions">
                    <ThemeToggle />

                    <button
                        className="site-header__toggle"
                        aria-label="Toggle menu"
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        onClick={() => setOpen((v) => !v)}
                        type="button"
                    >
                        {open ? <X size={22} strokeWidth={2.25} /> : <Menu size={22} strokeWidth={2.25} />}
                    </button>
                </div>
            </div>

            <nav
                id="mobile-menu"
                className={cx("site-header__nav", "site-header__nav--mobile", open && "is-open")}
                aria-label="Mobile navigation"
            >
                <div className="site-header__mobileThemeRow">
                    <ThemeToggle />
                </div>

                <Link
                    href={ROUTES.members}
                    className={cx("site-header__link", membersActive && "is-active")}
                    aria-current={membersActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                >
                    Representatives
                </Link>

                <Link
                    href={ROUTES.bills}
                    className={cx("site-header__link", billsActive && "is-active")}
                    aria-current={billsActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                >
                    Bills
                </Link>

                <Link
                    href={ROUTES.committees}
                    className={cx("site-header__link", committeesActive && "is-active")}
                    aria-current={committeesActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                >
                    Committees
                </Link>

                <Link
                    href={ROUTES.wiki}
                    className={cx("site-header__link", wikiActive && "is-active")}
                    aria-current={wikiActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                >
                    Reference
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