"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search as SearchIcon, X } from "lucide-react";
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
    const desktopExploreRef = useRef(null);
    const mobileExploreRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [exploreOpen, setExploreOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const ROUTES = {
        home: "/",
        search: "/search",
        members: "/member",
        bills: "/bills",
        committees: "/committees",
        wiki: "/references",
        about: "/about",
    };

    const exploreItems = [
        ["Representatives", ROUTES.members],
        ["Bills", ROUTES.bills],
        ["Committees", ROUTES.committees],
    ];

    const secondaryItems = [
        ["Reference", ROUTES.wiki],
        ["About", ROUTES.about],
    ];

    const exploreActive = exploreItems.some(([, href]) => isActive(pathname, href));

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setOpen(false);
        setExploreOpen(false);
    }, [pathname]);

    useEffect(() => {
        const onPointerDown = (event) => {
            const clickedDesktopExplore = desktopExploreRef.current?.contains(event.target);
            const clickedMobileExplore = mobileExploreRef.current?.contains(event.target);

            if (!clickedDesktopExplore && !clickedMobileExplore) {
                setExploreOpen(false);
            }
        };

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setExploreOpen(false);
            }
        };

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    return (
        <header className={cx("site-header", scrolled && "site-header--scrolled", open && "site-header--menu-open")}>
            <div className="site-header__inner">
                <Link href={ROUTES.home} className="site-header__logo" aria-label="Legislation Lemur — Home">
                    <img
                        src="https://storage.googleapis.com/legislation-lemur-images/logo_updated_b.png"
                        alt=""
                        className="site-header__logo-img"
                        aria-hidden="true"
                    />
                    <span className="site-header__logo-text">Legislation Lemur</span>
                </Link>

                <nav className="site-header__nav site-header__nav--desktop" aria-label="Main navigation">
                    <Link
                        href={ROUTES.search}
                        className={cx(
                            "site-header__link",
                            "site-header__link--search",
                            isActive(pathname, ROUTES.search) && "is-active",
                        )}
                        aria-current={isActive(pathname, ROUTES.search) ? "page" : undefined}
                    >
                        <SearchIcon className="site-header__linkIcon" size={17} strokeWidth={2.25} aria-hidden="true" />
                        <span>Search</span>
                    </Link>

                    <div ref={desktopExploreRef} className="site-header__dd">
                        <button
                            className={cx("site-header__link", "site-header__dd-trigger", exploreActive && "is-active")}
                            type="button"
                            aria-expanded={exploreOpen}
                            aria-controls="desktop-explore-menu"
                            aria-haspopup="true"
                            onClick={() => setExploreOpen((value) => !value)}
                        >
                            <span>Explore</span>
                            <ChevronDown
                                className={cx("site-header__dd-icon", exploreOpen && "is-open")}
                                size={16}
                                strokeWidth={2.25}
                                aria-hidden="true"
                            />
                        </button>

                        <div id="desktop-explore-menu" className={cx("site-header__dd-menu", exploreOpen && "is-open")}>
                            {exploreItems.map(([label, href]) => {
                                const active = isActive(pathname, href);
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={cx("site-header__dd-item", active && "is-active")}
                                        aria-current={active ? "page" : undefined}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {secondaryItems.map(([label, href]) => {
                        const active = isActive(pathname, href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cx("site-header__link", active && "is-active")}
                                aria-current={active ? "page" : undefined}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="site-header__actions">
                    <ThemeToggle />

                    <button
                        className="site-header__toggle"
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        onClick={() => setOpen((value) => !value)}
                        type="button"
                    >
                        {open ? <X size={22} strokeWidth={2.25} /> : <Menu size={22} strokeWidth={2.25} />}
                    </button>
                </div>
            </div>

            <nav
                id="mobile-menu"
                className={cx("site-header__nav site-header__nav--mobile", open && "is-open")}
                aria-label="Mobile navigation"
            >
                <Link
                    href={ROUTES.search}
                    className={cx(
                        "site-header__link",
                        "site-header__link--search",
                        isActive(pathname, ROUTES.search) && "is-active",
                    )}
                    aria-current={isActive(pathname, ROUTES.search) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                >
                    <SearchIcon className="site-header__linkIcon" size={17} strokeWidth={2.25} aria-hidden="true" />
                    <span>Search</span>
                </Link>

                <div ref={mobileExploreRef} className="site-header__mobileGroup">
                    <button
                        className={cx("site-header__link", "site-header__mobileGroupTrigger", exploreActive && "is-active")}
                        type="button"
                        aria-expanded={exploreOpen}
                        aria-controls="mobile-explore-menu"
                        onClick={() => setExploreOpen((value) => !value)}
                    >
                        <span>Explore</span>
                        <ChevronDown
                            className={cx("site-header__dd-icon", exploreOpen && "is-open")}
                            size={17}
                            strokeWidth={2.25}
                            aria-hidden="true"
                        />
                    </button>

                    <div id="mobile-explore-menu" className={cx("site-header__mobileSubnav", exploreOpen && "is-open")}>
                        {exploreItems.map(([label, href]) => {
                            const active = isActive(pathname, href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cx("site-header__mobileSubnavLink", active && "is-active")}
                                    aria-current={active ? "page" : undefined}
                                    onClick={() => setOpen(false)}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {secondaryItems.map(([label, href]) => {
                    const active = isActive(pathname, href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cx("site-header__link", active && "is-active")}
                            aria-current={active ? "page" : undefined}
                            onClick={() => setOpen(false)}
                        >
                            {label}
                        </Link>
                    );
                })}

                <div className="site-header__mobileThemeRow">
                    <ThemeToggle />
                </div>
            </nav>
        </header>
    );
}
