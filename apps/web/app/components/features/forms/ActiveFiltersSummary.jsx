function ActiveFiltersSummary({ filters }) {
    const parts = [];

    if (filters.q) parts.push(`"${filters.q}"`);
    if (filters.chamber) parts.push(filters.chamber);
    if (filters.policyAreaName) parts.push(filters.policyAreaName);

    if (!parts.length) return null;

    return (
        <div className="ll3-active-summary">
            Showing results for: {parts.join(" • ")}
        </div>
    );
}
