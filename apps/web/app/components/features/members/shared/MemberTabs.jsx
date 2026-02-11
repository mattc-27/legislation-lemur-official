// components/member/MemberTabs.jsx
"use client";
import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";

// const BillList = dynamic(() => import("./BillList"), { ssr: false, loading: () => <div className="muted">Loading bills…</div> });
const TopicDonut = dynamic(() => import("./TopicDonut"), { ssr: false });
// const ActivityTimeline = dynamic(() => import("./ActivityTimeline"), { ssr: false });
const BillTable = dynamic(() => import("./BillTable"), { ssr: false, loading: () => <div className="muted">Loading bills…</div> });

const labelFromSubject = (subj) =>
    typeof subj === "string"
        ? subj
        : subj && typeof subj === "object" && (subj.name || subj.title)
            ? String(subj.name || subj.title)
            : "Uncategorized";

function fmtFreshness(ts) {
    if (!ts) return null;
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Denver",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
    }).format(d);
}

export default function MemberTabs({
    title = "Recent bills by topic",
    groups,
    groupsSponsored,
    groupsCosponsored,
    monthly = [],
    sourceLabel = "Includes sponsored + co-sponsored bills",

    // NEW: pass freshness in from the server (recommended)
    freshnessAsOf = null,          // e.g. min(last_success_at) across the views used by this section
    freshnessPerView = null,       // optional: { member_legislation_v1: "...", member_monthly_activity_v1: "..." }
    showPerViewFreshness = false,  // optional UI toggle

}) {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [subjectKind, setSubjectKind] = useState("policy_area"); // ← toggle state

    // pick the set for this kind
    const sponsoredGroups =
        groupsSponsored?.groups?.[subjectKind] ?? groupsSponsored?.legacy ?? [];
    const cosponsoredGroups =
        groupsCosponsored?.groups?.[subjectKind] ?? groupsCosponsored?.legacy ?? [];

    // clear selection when switching kind (prevents empty table due to stale filter)
    useEffect(() => {
        setSelectedTopic(null);
    }, [subjectKind]);


    // merge & dedupe by subject, preserve kinds for badges
    const mergedGroups = useMemo(() => {
        const sets = [
            { set: sponsoredGroups, kind: "sponsored" },
            { set: cosponsoredGroups, kind: "cosponsored" },
        ].filter((s) => Array.isArray(s.set) && s.set.length);

        if (!sets.length) return [];

        const bySubject = new Map();
        for (const { set, kind } of sets) {
            for (const g of set) {
                const key = labelFromSubject(g?.subject);
                const prev = bySubject.get(key) || { subject: key, items: [] };

                const withKind = (g.items || []).map((it) => {
                    const kinds = Array.isArray(it.kinds)
                        ? it.kinds.slice()
                        : it.kind
                            ? [it.kind]
                            : it.__kind
                                ? [it.__kind]
                                : [];
                    if (!kinds.includes(kind)) kinds.push(kind);
                    return { ...it, kinds };
                });

                // dedupe by id/url/title
                const next = [...prev.items, ...withKind];
                const dedup = new Map();
                for (const it of next) {
                    const id = it.id || it.url || it.href || it.title;
                    if (!dedup.has(id)) dedup.set(id, { ...it });
                    else {
                        const cur = dedup.get(id);
                        const union = Array.from(new Set([...(cur?.kinds || []), ...(it?.kinds || [])]));
                        dedup.set(id, { ...cur, kinds: union });
                    }
                }
                bySubject.set(key, { subject: key, items: Array.from(dedup.values()) });
            }
        }

        return Array.from(bySubject.values()).map((g) => ({
            ...g,
            count: g.items.length,
        }));
    }, [sponsoredGroups, cosponsoredGroups]); // <-- use derived arrays, not parent objects

    if (!mergedGroups.length && !(Array.isArray(monthly) && monthly.length)) return null;

    const freshnessLine = fmtFreshness(freshnessAsOf);

    return (
        <section className="card card--p-24">
            <h3 className="section-title" style={{ marginBottom: 4 }}>
                {title}
            </h3>
            <div className="muted" style={{ fontSize: 12, marginBottom: 16 }}>
                {sourceLabel}
                {freshnessLine ? (
                    <>
                        {" "}
                        • Updated {freshnessLine}
                    </>
                ) : null}
            </div>

            {showPerViewFreshness && freshnessPerView && (
                <div className="muted" style={{ fontSize: 11, marginBottom: 16 }}>
                    {Object.entries(freshnessPerView).map(([name, ts]) => (
                        <div key={name}>
                            {name}: {fmtFreshness(ts) ?? "—"}
                        </div>
                    ))}
                </div>
            )}

            {/* subject-kind toggle */}
            <div className="segmented" role="tablist" aria-label="Topic mode">
                <button
                    type="button"
                    role="tab"
                    aria-pressed={subjectKind === "policy_area"}
                    aria-selected={subjectKind === "policy_area"}
                    className={
                        "segmented__btn" +
                        (subjectKind === "policy_area" ? " segmented__btn--active" : "")
                    }
                    onClick={() => setSubjectKind("policy_area")}
                >
                    Policy Areas
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-pressed={subjectKind === "legislative"}
                    aria-selected={subjectKind === "legislative"}
                    className={
                        "segmented__btn" +
                        (subjectKind === "legislative" ? " segmented__btn--active" : "")
                    }
                    onClick={() => setSubjectKind("legislative")}
                >
                    Legislative Topics
                </button>
            </div>

            {/* donut + table */}
            <div className="member_tabs-row">
                <div className="tabs-topviz__donut">
                    <TopicDonut groups={mergedGroups} onSelectTopic={setSelectedTopic} />
                </div>

                {mergedGroups.length > 0 && (
                    <div className="stack-16 tabs-topviz__list">
                        <BillTable groups={mergedGroups} maxHeight={420} selectedTopic={selectedTopic} />
                    </div>
                )}
            </div>
        </section>
    );
}
