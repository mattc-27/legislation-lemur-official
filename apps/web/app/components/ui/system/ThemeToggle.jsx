"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "ll3-theme";

function getPreferredTheme() {
    if (typeof window === "undefined") return "light";

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
    const root = document.documentElement;

    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(STORAGE_KEY, theme);
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState(null);

    useEffect(() => {
        const next = getPreferredTheme();
        applyTheme(next);
        setTheme(next);
    }, []);

    function toggleTheme() {
        const current =
            theme ||
            document.documentElement.getAttribute("data-theme") ||
            getPreferredTheme();

        const next = current === "dark" ? "light" : "dark";

        applyTheme(next);
        setTheme(next);
    }

    const currentTheme = theme || "light";
    const isDark = currentTheme === "dark";

    const nextLabel = isDark ? "Light" : "Dark";
    const nextIcon = isDark ? Sun : Moon;
    const Icon = nextIcon;

    return (
        <button
            type="button"
            className="site-header__themeToggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${nextLabel.toLowerCase()} mode`}
            title={`Switch to ${nextLabel.toLowerCase()} mode`}
            suppressHydrationWarning
        >
            <span className="site-header__themeTrack" aria-hidden="true">
                <span className="site-header__themeThumb">
                    <Icon size={15} strokeWidth={2.2} />
                </span>
            </span>

            <span className="site-header__themeToggleText">
                {nextLabel}
            </span>
        </button>
    );
}