"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
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

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    const ROUTES = {
        home: "/",
        members: "/member",
        bills: "/bills",
        committees: "/committees",
        wiki: "/references",
        about: "/about",
    };

    const navItems = [
        ["Representatives", ROUTES.members],
        ["Bills", ROUTES.bills],
        ["Committees", ROUTES.committees],
        ["Reference", ROUTES.wiki],
        ["About", ROUTES.about],
    ];

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
                    {navItems.map(([label, href]) => {
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

            <nav id="mobile-menu" className={cx("site-header__nav site-header__nav--mobile", open && "is-open")} aria-label="Mobile navigation">
                {navItems.map(([label, href]) => {
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