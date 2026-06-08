// app/lib/content/homeContent.js

export const HOME_CONTENT = {
    hero: {
        eyebrow: "Transparency first",
        title: "Civic data, made more human.",
        subtitle:
            "Explore Congress through readable bill summaries, member profiles, voting activity, and legislative context—all presented through a neutral, fact-first experience.",
        searchPlaceholder:
            "Search bills, members, committees, topics, or legislation...",
        browseActions: [
            { label: "Find Representatives", href: "/search?entity=members" },
            { label: "Browse Bills", href: "/bills" },
            { label: "Browse Committees", href: "/committees" },
        ],
        popularSearches: [],
    },

    recentActivity: {
        eyebrow: "Live activity",
        title: "Recent Congressional Activity",
        description:
            "Follow the latest actions from Congress, including newly introduced legislation, committee activity, votes, and major legislative developments.",
        cta: {
            label: "View All Activity",
            href: "/bills",
        },
    },

    why: {
        eyebrow: "Why Legislation Lemur?",
        title: "Why Legislation Lemur?",
        description:
            "Legislation Lemur helps make congressional information easier to explore without adding commentary, opinion, or partisan framing. The goal is simple: reduce complexity while preserving the underlying facts.",
        cards: [
            {
                title: "Representative Profiles",
                desc: "Browse representatives and senators through clear profiles that combine service history, committee assignments, legislative activity, and voting context.",
                href: "/search?entity=members",
                cta: "Explore profiles",
            },
            {
                title: "Bill Tracking",
                desc: "Understand proposed legislation faster with readable bill summaries, sponsors, recent actions, and key legislative milestones.",
                href: "/bills",
                cta: "Explore bills",
            },
            {
                title: "Committee Explorer",
                desc: "Navigate congressional committees, jurisdictions, and leadership without digging through scattered government directories.",
                href: "/committees",
                cta: "Explore committees",
            },
        ],
    },
};

export const HOME_HERO = HOME_CONTENT.hero;
export const HOME_RECENT_ACTIVITY = HOME_CONTENT.recentActivity;
export const HOME_WHY = HOME_CONTENT.why;

// Compatibility exports for older homepage imports.
export const HOME_HERO_EYEBROW = HOME_HERO.eyebrow;
export const HOME_HERO_TITLE = HOME_HERO.title;
export const HOME_HERO_SUB = HOME_HERO.subtitle;
export const HOME_HERO_PRIMARY_CTA = HOME_HERO.browseActions[0];
export const HOME_HERO_SECONDARY_CTA = HOME_HERO.browseActions[1];
