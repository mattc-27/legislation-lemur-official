"use client";
import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";

const TopicDonut = dynamic(() => import("./TopicDonut"), { ssr: false });
const BillTable = dynamic(() => import("./BillTable"), {
    ssr: false,
    loading: () => <div className="llm3-muted">Loading bills…</div>,
});

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
    freshnessAsOf = null,
    freshnessPerView = null,
    showPerViewFreshness = false,
}) {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [subjectKind, setSubjectKind] = useState("policy_area");

    const sponsoredGroups =
        groupsSponsored?.groups?.[subjectKind] ?? groupsSponsored?.legacy ?? [];
    const cosponsoredGroups =
        groupsCosponsored?.groups?.[subjectKind] ?? groupsCosponsored?.legacy ?? [];

    useEffect(() => {
        setSelectedTopic(null);
    }, [subjectKind]);

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

                const next = [...prev.items, ...withKind];
                const dedup = new Map();
                for (const it of next) {
                    const id = it.id || it.url || it.href || it.title;
                    if (!dedup.has(id)) dedup.set(id, { ...it });
                    else {
                        const cur = dedup.get(id);
                        const union = Array.from(
                            new Set([...(cur?.kinds || []), ...(it?.kinds || [])])
                        );
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
    }, [sponsoredGroups, cosponsoredGroups]);

    if (!mergedGroups.length && !(Array.isArray(monthly) && monthly.length)) return null;

    const freshnessLine = fmtFreshness(freshnessAsOf);

    return (
        <section className="llmp3-card llm3-tabs">
            <div className="llm3-tabs__sectionHead">
                <div className="llm3-tabs__sectionTitleBlock">
                    <h2 className="llmp3-h2 llm3-tabs__sectionTitle">
                        Sponsored and cosponsored legislation
                    </h2>
                    <div className="llm3-tabs__sectionDesc">
                        Explore the policy areas and legislative topics that appear most often across this member’s sponsored and cosponsored bills.
                    </div>
                </div>

                <div className="llm3-tabs__sectionMeta">
                    <div className="llm3-tabs__subline">
                        <span>{sourceLabel}</span>
                        {freshnessLine ? <span> • Updated {freshnessLine}</span> : null}
                    </div>
                </div>
            </div>


            <div className="llm3-tabs__topbar">
                <div className="llm3-tabs__modeTabs" role="tablist" aria-label="Topic mode">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={subjectKind === "policy_area"}
                        className={`llm3-tabs__modeTab ${subjectKind === "policy_area" ? "is-active" : ""}`}
                        onClick={() => setSubjectKind("policy_area")}
                    >
                        Policy Areas
                    </button>

                    <button
                        type="button"
                        role="tab"
                        aria-selected={subjectKind === "legislative"}
                        className={`llm3-tabs__modeTab ${subjectKind === "legislative" ? "is-active" : ""}`}
                        onClick={() => setSubjectKind("legislative")}
                    >
                        Legislative Topics
                    </button>
                </div>
            </div>

            {showPerViewFreshness && freshnessPerView && (
                <div className="llm3-muted llm3-tabs__perView">
                    {Object.entries(freshnessPerView).map(([name, ts]) => (
                        <div key={name}>
                            {name}: {fmtFreshness(ts) ?? "—"}
                        </div>
                    ))}
                </div>
            )}

            <div className="llm3-tabsRow">
                <div className="llm3-tabsViz">
                    <div className="llm3-tabsViz__frame">
                        <TopicDonut
                            groups={mergedGroups}
                            onSelectTopic={setSelectedTopic}
                        />
                    </div>
                </div>

                {mergedGroups.length > 0 && (
                    <div className="llm3-tabsTable">
                        <BillTable
                            groups={mergedGroups}
                            maxHeight={420}
                            selectedTopic={selectedTopic}
                        />
                    </div>
                )}
            </div>
        </section>
    );
}