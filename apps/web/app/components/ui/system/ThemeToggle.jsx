"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

function getPreferredTheme() {
    if (typeof window === "undefined") return "light";

    const saved = window.localStorage.getItem("ll3-theme");
    if (saved === "light" || saved === "dark") return saved;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const next = getPreferredTheme();
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
        setMounted(true);
    }, []);

    function toggleTheme() {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
        window.localStorage.setItem("ll3-theme", next);
    }

    if (!mounted) {
        return (
            <button
                type="button"
                className="site-header__themeToggle"
                aria-label="Toggle color theme"
                title="Toggle color theme"
            >
                <Sun size={17} strokeWidth={2.2} />
            </button>
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            type="button"
            className="site-header__themeToggle"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <Sun size={17} strokeWidth={2.2} />
            ) : (
                <Moon size={17} strokeWidth={2.2} />
            )}
            <span className="site-header__themeToggleText">
                {isDark ? "Light" : "Dark"}
            </span>
        </button>
    );
}