// apps/web/lib/server/search/inferSearchIntent.js

const MEMBER_TERMS = [
    "senator",
    "senators",
    "representative",
    "representatives",
    "rep",
    "member",
    "members",
    "congressman",
    "congresswoman",
];

const COMMITTEE_TERMS = [
    "committee",
    "committees",
    "subcommittee",
    "subcommittees",
    "judiciary",
    "finance committee",
    "armed services",
    "appropriations",
    "ways and means",
];

export function inferSearchIntent(q = "") {
    const text = String(q || "").toLowerCase();

    if (MEMBER_TERMS.some((x) => text.includes(x))) {
        return { preferredEntityTypes: ["member"] };
    }

    if (COMMITTEE_TERMS.some((x) => text.includes(x))) {
        return { preferredEntityTypes: ["committee"] };
    }

    return { preferredEntityTypes: ["bill"] };
}