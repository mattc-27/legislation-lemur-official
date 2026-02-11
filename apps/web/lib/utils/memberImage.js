export function normalizeMemberImageUrl(value) {
    if (!value) return null;

    // already a URL string
    if (typeof value === "string" && /^https?:\/\//i.test(value.trim())) {
        return value.trim();
    }

    // object case (if you later fix the source)
    if (typeof value === "object" && value.imageUrl) {
        return String(value.imageUrl);
    }

    // pseudo-json string case: "{'imageUrl': 'https://...'}"
    if (typeof value === "string") {
        const m = value.match(/'imageUrl'\s*:\s*'([^']+)'/);
        return m ? m[1] : null;
    }

    return null;
}
