// apps/web/lib/server/search/inferSearchIntent.js

const MEMBER_TERMS = [
    "senator",
    "senators",
    "representative",
    "representatives",
    "represenative",
    "represenatives",
    "rep",
    "reps",
    "member",
    "members",
    "congressman",
    "congresswoman",
    "delegation",
    "district",
    "congressional district",
    "cd",
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

export const STATE_OPTIONS = [
    ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
    ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
    ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"],
    ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"],
    ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"],
    ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
    ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"],
    ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"],
    ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"],
    ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"],
    ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"],
    ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"],
    ["WI", "Wisconsin"], ["WY", "Wyoming"], ["DC", "District of Columbia"],
];

export const STATE_NAME_BY_CODE = Object.fromEntries(STATE_OPTIONS);

const STATE_CODE_BY_NAME = new Map(
    STATE_OPTIONS.flatMap(([code, name]) => [
        [name.toLowerCase(), code],
        [code.toLowerCase(), code],
    ])
);

const ORDINAL_WORDS = new Map([
    ["one", 1], ["first", 1],
    ["two", 2], ["second", 2],
    ["three", 3], ["third", 3],
    ["four", 4], ["fourth", 4],
    ["five", 5], ["fifth", 5],
    ["six", 6], ["sixth", 6],
    ["seven", 7], ["seventh", 7],
    ["eight", 8], ["eighth", 8],
    ["nine", 9], ["ninth", 9],
    ["ten", 10], ["tenth", 10],
    ["eleven", 11], ["eleventh", 11],
    ["twelve", 12], ["twelfth", 12],
    ["thirteen", 13], ["thirteenth", 13],
    ["fourteen", 14], ["fourteenth", 14],
    ["fifteen", 15], ["fifteenth", 15],
    ["sixteen", 16], ["sixteenth", 16],
    ["seventeen", 17], ["seventeenth", 17],
    ["eighteen", 18], ["eighteenth", 18],
    ["nineteen", 19], ["nineteenth", 19],
    ["twenty", 20], ["twentieth", 20],
    ["at large", 0], ["at-large", 0], ["al", 0],
]);

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(q = "") {
    return String(q || "")
        .toLowerCase()
        .replace(/[’']/g, "")
        .replace(/\bhouse of representatives\b/g, "house")
        .replace(/\brepresenatives\b/g, "representatives")
        .replace(/\brepresenative\b/g, "representative")
        .replace(/\s+/g, " ")
        .trim();
}

export function detectStateFromQuery(q = "") {
    const text = normalizeText(q);
    if (!text) return null;

    for (const [code, name] of STATE_OPTIONS) {
        const namePattern = new RegExp(`(^|\\b)${escapeRegex(name.toLowerCase())}(\\b|$)`);
        const codePattern = new RegExp(`(^|\\b)${escapeRegex(code.toLowerCase())}(\\b|$)`);

        if (namePattern.test(text) || codePattern.test(text)) {
            return { stateCode: code, stateName: name };
        }
    }

    return null;
}

export function detectDistrictFromQuery(q = "") {
    const text = normalizeText(q);
    if (!text) return null;

    const numericPatterns = [
        /\b(?:district|dist|cd|congressional district)\s*[-#:]?\s*(\d{1,2})\b/,
        /\b(?:district|dist|cd|congressional district)\s*[-#:]?\s*(at[- ]large)\b/,
        /\b[a-z]{2}\s*[- ]?\s*(\d{1,2})\b/,
    ];

    for (const pattern of numericPatterns) {
        const match = text.match(pattern);
        if (!match) continue;
        if (/at[- ]large/.test(match[1])) return 0;
        const district = Number(match[1]);
        if (Number.isInteger(district) && district >= 0 && district <= 99) return district;
    }

    for (const [word, value] of ORDINAL_WORDS) {
        const pattern = new RegExp(`\\b(?:district|dist|cd|congressional district)\\s+${escapeRegex(word)}\\b`);
        if (pattern.test(text)) return value;
    }

    return null;
}

export function detectStateIntent(q = "") {
    const text = normalizeText(q);
    const state = detectStateFromQuery(text);
    if (!state) return null;

    const district = detectDistrictFromQuery(text);
    const wantsSenators = /\b(senator|senators|senate)\b/.test(text);
    const wantsHouse = /\b(house|representative|representatives|rep|reps|congressman|congresswoman|congressional district|district|cd)\b/.test(text);
    const wantsDelegation = /\b(member|members|delegation|congress)\b/.test(text);

    if (district !== null) {
        return {
            kind: "state_district",
            stateCode: state.stateCode,
            stateName: state.stateName,
            chamber: "House",
            district,
            preferredEntityTypes: ["member", "seat"],
        };
    }

    if (wantsSenators) {
        return {
            kind: "state_senators",
            stateCode: state.stateCode,
            stateName: state.stateName,
            chamber: "Senate",
            preferredEntityTypes: ["member", "seat"],
        };
    }

    if (wantsHouse) {
        return {
            kind: "state_house",
            stateCode: state.stateCode,
            stateName: state.stateName,
            chamber: "House",
            preferredEntityTypes: ["member", "seat"],
        };
    }

    return {
        kind: wantsDelegation ? "state_members" : "state",
        stateCode: state.stateCode,
        stateName: state.stateName,
        preferredEntityTypes: ["member", "seat", "bill"],
    };
}

export function inferSearchIntent(q = "") {
    const text = normalizeText(q);
    const stateIntent = detectStateIntent(text);

    if (stateIntent?.kind === "state_district" || stateIntent?.kind === "state_senators") {
        return stateIntent;
    }

    if (stateIntent?.kind === "state_house" || stateIntent?.kind === "state_members") {
        return stateIntent;
    }

    if (MEMBER_TERMS.some((x) => text.includes(x))) {
        return { preferredEntityTypes: ["member", "seat"] };
    }

    if (COMMITTEE_TERMS.some((x) => text.includes(x))) {
        return { preferredEntityTypes: ["committee"] };
    }

    if (stateIntent) {
        return stateIntent;
    }

    return { preferredEntityTypes: ["bill"] };
}
