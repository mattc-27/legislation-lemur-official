// src/content/aboutContent.ts
// (or .js if you’re not using TS)

export const ABOUT_TITLE = "About Legislation Lemur";

export const ABOUT_INTRO_PARAS = [
    `Legislation Lemur is a civic data project built around clarity, trust, and restraint. It provides a clean, factual way to explore the U.S. Congress—without commentary, framing, or noise.`,
    `Today, the platform focuses on a small set of core capabilities: looking up current members of Congress, opening concise profiles with essential details, exploring recently sponsored and co-sponsored bills, and viewing a neutral snapshot of how Congress is composed during the current session.`,
    `The scope is intentionally focused. With reliable pipelines now in place for members, bills, and votes, new views and visualizations are added gradually—layered on top of the same fact-first foundation.`,
];

export const ABOUT_WHY_TITLE = "Why it exists";

export const ABOUT_WHY_PARAS = [
    `Legislation Lemur began as a way to practice real-world data engineering, interface design, and civic visualization—while producing something genuinely useful.`,
    `The goal is simple: make it easier to understand how Congress works without requiring expertise, patience for dense tables, or exposure to opinion-driven cycles. No commentary. No outrage. Just accessible facts: who represents you, what they’ve sponsored, how they vote, and how the institution is structured in a given session.`,
    `The name “Lemur” reflects curiosity and persistence—traits shared by both the data work behind the scenes and the broader civic goal. Participation is easier when information is neutral, understandable, and well-designed.`,
];

export const ABOUT_FEATURES_TITLE = "Current features";

export const ABOUT_FEATURES_ITEMS = [
    "Search current members of Congress by name or browse by state",
    "View a high-level snapshot of Congress composition, demographics, and chamber structure",
    "Open a member profile with core details, recent bills, and voting activity",
];

export const ABOUT_FEATURES_NOTE = "Data is updated on a regular weekly cadence.";

export const ABOUT_HOW_TITLE = "How it works (high level)";

export const ABOUT_HOW_ITEMS = [
    "Collect data from official congressional sources and structured public APIs",
    "Normalize members, bills, votes, and session data into consistent, query-friendly models",
    "Cache frequently accessed views for fast, stable performance",
    "Present minimal interfaces that prioritize comprehension over density",
];

export const ABOUT_STACK_NOTE =
    "Legislation Lemur is built with Next.js (App Router), server-rendered React, and a growing ingestion pipeline powered by mirrored databases, scheduled updates, and data validation.";

export const ABOUT_ROADMAP_TITLE = "Roadmap";

export const ABOUT_ROADMAP_PARAS = [
    `This version keeps the feature set intentionally focused. As the foundation continues to solidify, Legislation Lemur will expand into a clearer and more complete view of the legislative landscape.`,
];

export const ABOUT_ROADMAP_ITEMS = [
    "Richer member pages: committees, voting patterns, issue clusters, and timelines",
    "Expanded Congress-wide views with deeper filters, demographic trends, and longitudinal comparisons",
    "Interactive bill timelines showing committee progress and floor actions",
    "Compare views for side-by-side member metrics, votes, and sponsorship patterns",
    "Saved members and states for quick access",
    "Opt-in email digests with weekly summaries, key votes, and new bills",
    "Election resources for 2026, including proposition summaries and data-driven voter guides",
    "Expanded coverage for Session 2 of the 119th Congress, beginning January 7, 2026",
];

export const ABOUT_LAST_UPDATED = "Last updated: February 8, 2026";
