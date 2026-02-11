// lib/ui/bills/billMeta.js
// (server-safe: no hooks, no window)

export const STATUS_META = {
    introduced: {
        label: "Introduced",
        desc: "Bill introduced in its chamber of origin.",
        tone: "introduced",
    },
    committee: {
        label: "Committee",
        desc: "Referred to or considered in committee.",
        tone: "committee",
    },
    reported: {
        label: "Reported",
        desc: "Reported out of committee.",
        tone: "reported",
    },
    passed_house: {
        label: "Passed House",
        desc: "Passed in the House.",
        tone: "passed",
    },
    passed_senate: {
        label: "Passed Senate",
        desc: "Passed in the Senate.",
        tone: "passed",
    },
    to_president: {
        label: "To President",
        desc: "Sent to the President for action.",
        tone: "final",
    },
    became_law: {
        label: "Became Law",
        desc: "Enacted into law.",
        tone: "law",
    },
    vetoed: {
        label: "Vetoed",
        desc: "Vetoed by the President.",
        tone: "veto",
    },
};

// map raw status_code -> a key above (fallback to introduced)
export function normalizeStatusKey(statusCode) {
    if (!statusCode) return "introduced";
    const s = String(statusCode).toLowerCase();
    if (STATUS_META[s]) return s;

    if (s.includes("committee")) return "committee";
    if (s.includes("introduced")) return "introduced";
    if (s.includes("reported")) return "reported";
    if (s.includes("passed") && s.includes("house")) return "passed_house";
    if (s.includes("passed") && s.includes("senate")) return "passed_senate";
    if (s.includes("president")) return "to_president";
    if (s.includes("law") || s.includes("enacted")) return "became_law";
    if (s.includes("veto")) return "vetoed";

    return "introduced";
}

// Subjects (server-safe) — keep simple now; ready for icons later
const SUBJECT_GROUPS = {
    "International Affairs": { label: "International Affairs" },
    Health: { label: "Health" },
    Energy: { label: "Energy" },
    "National Security": { label: "National Security" },
    Immigration: { label: "Immigration" },
    Judiciary: { label: "Judiciary" },
    Transportation: { label: "Transportation" },
    Agriculture: { label: "Agriculture" },
};

export function subjectToGroup(s) {
    const key = typeof s === "string" ? s : String(s);
    return SUBJECT_GROUPS[key]?.label || key;
}
