// src/content/aboutContent.ts
// (or .js/.ts in your existing lib/content folder)

export const ABOUT_TITLE = "About Legislation Lemur";

export const ABOUT_INTRO_PARAS = [
    `Legislation Lemur is a civic data project built around clarity, trust, and restraint. It provides a clean, factual way to explore the U.S. Congress—without commentary, framing, or noise.`,
    `The platform focuses on core navigation and “fact-first” views: member profiles, bill activity, votes, committees, and a readable snapshot of what’s changing this session.`,
    `Coverage expands gradually. New dashboards and comparison views are layered on top of the same stable foundation—so the product stays fast, understandable, and neutral.`,
];

export const ABOUT_WHY_TITLE = "Why it exists";

export const ABOUT_WHY_PARAS = [
    `Legislation Lemur began as a way to practice real-world data engineering, interface design, and civic visualization—while producing something genuinely useful.`,
    `The goal is simple: make it easier to understand how Congress works without requiring expertise, patience for dense tables, or exposure to opinion-driven cycles. No commentary. No outrage. Just accessible facts: who represents you, what they sponsor, how they vote, and how the institution is structured.`,
    `The name “Lemur” reflects curiosity and persistence—traits shared by both the data work behind the scenes and the broader civic goal. Participation is easier when information is neutral, understandable, and well-designed.`,
];

export const ABOUT_FEATURES_TITLE = "Current features";




export const ABOUT_RECENT_BADGE = "Recently added";

export const ABOUT_RECENT_TITLE = "Recently added";

export const ABOUT_RECENT_SUB =
    "New tools and views now live across the site.";

export const ABOUT_RECENT_ITEMS = [
    {
        label: "Member vote alignment insights (issue-level patterns and context)",
    },
    {
        label: "Committees directory + overview page (types, counts, and navigation)",
        href: "/committees",
    },
    {
        label: "Reference / Wiki pages for congressional concepts and sources",
        href: "/references",
    },
    {
        label: "Layout and readability improvements across core pages",
    },
];

export const ABOUT_HOW_TITLE = "How it works (high level)";

export const ABOUT_HOW_ITEMS = [
    "Collect data from official congressional sources and structured public APIs",
    "Normalize members, bills, votes, and session activity into consistent models",
    "Cache and precompute common views for fast, stable performance",
    "Present minimal interfaces that prioritize comprehension over density",
];

export const ABOUT_STACK_NOTE =
    "Legislation Lemur is built with Next.js (App Router), server-rendered React, and an ingestion pipeline powered by scheduled updates and data validation.";

export const ABOUT_ROADMAP_TITLE = "Roadmap";

export const ABOUT_FEATURES_ITEMS = [
    "Find members by name or state, with clear factual profiles, including current status and vacancies",
    "Explore bills, sponsors, and recent actions in a readable format",
    "TL;DR summaries that simplify complex legislative text",
    "Vote activity and alignment signals focused on clarity, not spin",
];

export const ABOUT_FEATURES_NOTE =
    "Core legislative data is refreshed regularly. Summaries and derived insights are based on official sources, with an emphasis on clarity, traceability, and restraint.";

export const ABOUT_ROADMAP_PARAS = [
    `Legislation Lemur expands through “change-first” views and comparisons—helping users understand what happened, what changed, and why it matters, without added interpretation or opinion.`,
    `New features are introduced with care to maintain speed, readability, and trust in the underlying data.`,
];

export const ABOUT_SUMMARIES_TITLE = "About bill summaries";

export const ABOUT_SUMMARIES_PARAS = [
    `Legislation Lemur includes simplified summaries to make complex legislative text easier to follow.`,
    `Summaries are generated from official bill text and structured data, then shaped into short, consistent formats that highlight purpose, scope, and key changes.`,
    `The goal is not to interpret or persuade—but to reduce friction so more people can engage with primary legislative information.`,
];

/**
 * Roadmap aligned with HOME_ROADMAP_ITEMS, grouped into:
 * - Now (0..1)
 * - Next (2..3)
 * - Later (4..end)
 */
export const ABOUT_ROADMAP_ITEMS = [
    // Now (core + clarity)
    "Strengthen core Explore flows across members, bills, and committees",
    "Expand “what changed” surfaces and session snapshots while keeping interfaces lightweight",

    // Next (dashboards + interpretation aids)
    "Insights & Explore dashboards — Congress-wide views, filters, and change-over-time comparisons (bills, votes, committees)",
    "Improved bill understanding — better summaries, topic extraction, and sentiment/stance signals with clear sourcing and confidence",

    // Later (personalization + elections)
    "Email updates — weekly summaries by saved locations and tracked members, with activity highlights and “what changed” comparisons",
    "Election tools — neutral voter guides and proposition breakdowns (where data is available)",
];

export const ABOUT_LAST_UPDATED = "Last updated: February 27, 2026";