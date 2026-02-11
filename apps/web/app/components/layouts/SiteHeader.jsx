// components/layout/SiteHeader.jsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";


export default function SiteHeader() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 4);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`site-header ${scrolled ? "site-header--scrolled" : ""} ${open ? "site-header--menu-open" : ""
                }`}
            role="banner"
        >
            <div className="container site-header__inner">
                <Link
                    href="/"
                    className="site-header__logo"
                    aria-label="Legislation Lemur — Home"
                    onClick={() => setOpen(false)}
                >
                    <img
                        src="https://storage.googleapis.com/legislation-lemur-images/logo_updated_b.png"
                        alt=""
                        className="site-header__logo-img"
                        aria-hidden="true"
                    />
                    <span className="site-header__logo-text">Legislation Lemur</span>
                </Link>

                <nav className="site-header__nav site-header__nav--desktop" aria-label="Main navigation">
                    <Link href="/search" className="site-header__link">Search | Members</Link>
                    <Link href="/bills" className="site-header__link">Bills</Link>
                    <Link href="/vote" className="site-header__link">Voting Resources</Link>
                    <Link href="/about" className="site-header__link">About</Link>
                </nav>

                <button
                    className="site-header__toggle"
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    onClick={() => setOpen(v => !v)}
                    type="button"
                >
                    {open ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
                </button>
            </div>

            <nav
                id="mobile-menu"
                className={`site-header__nav site-header__nav--mobile ${open ? "is-open" : ""}`}
                aria-label="Mobile navigation"
            >
                <Link href="/search" className="site-header__link" onClick={() => setOpen(false)}>Search</Link>
                <Link href="/bills" className="site-header__link" onClick={() => setOpen(false)}>Bills</Link>
                <Link href="/vote" className="site-header__link" onClick={() => setOpen(false)}>Voting Resources</Link>
                <Link href="/about" className="site-header__link" onClick={() => setOpen(false)}>About</Link>
            </nav>
        </header>
    );
}