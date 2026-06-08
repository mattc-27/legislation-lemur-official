"use client";

import Link from "next/link";
import { Bookmark, Flame, Scale, Search } from "lucide-react";

const ITEMS = [
    { key: "bills", label: "Bills", href: "/bills", Icon: Scale },
    { key: "trending", label: "Trending", href: "/bills?sort=trending", Icon: Flame },
    { key: "impact", label: "Impact", href: "/bills?sort=impact", Icon: Search },
    { key: "saved", label: "Saved", href: "/saved", Icon: Bookmark },
];

export default function BillsMobileBottomNavClient({ active = "bills" }) {
    return (
        <nav className="ll3-mobileTabs" aria-label="Bills mobile navigation">
            <div className="ll3-mobileTabs__inner">
                {ITEMS.map(({ key, label, href, Icon }) => {
                    const isActive = active === key;

                    return (
                        <Link
                            key={key}
                            href={href}
                            className={`ll3-mobileTabs__item ${isActive ? "is-active" : ""}`}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <Icon size={18} aria-hidden="true" />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}