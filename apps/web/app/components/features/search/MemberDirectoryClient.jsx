"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MemberDirectoryRow from "@/app/components/features/search/MemberDirectoryRow";

const STATES_GROUPED_URL = "/data/states_grouped.json";
const HOUSE_PREVIEW_COUNT = 6;

const norm = (s) => (s || "").toLowerCase().trim();

function matchesParty(member, party) {
    if (!party) return true;
    return String(member.party || "").toUpperCase() === String(party).toUpperCase();
}

function matchesChamber(member, chamber) {
    if (!chamber) return true;
    return String(member.chamber || "") === chamber;
}

function matchesQuery(member, q) {
    if (!q) return true;

    const qn = norm(q);
    const hay = [
        member.name,
        member.state,
        member.stateCode,
        member.party,
        member.chamber,
        member.district === 0 || member.district === "0" ? "at-large" : `district ${member.district}`,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return hay.includes(qn);
}

function sortMembers(members = []) {
    return [...members].sort((a, b) => {
        const aDistrict = Number(a.district ?? 9999);
        const bDistrict = Number(b.district ?? 9999);

        if ((a.chamber || "") !== (b.chamber || "")) {
            return String(a.chamber || "").localeCompare(String(b.chamber || ""));
        }

        if ((a.chamber || "") === "House" && aDistrict !== bDistrict) {
            return aDistrict - bDistrict;
        }

        return String(a.name || "").localeCompare(String(b.name || ""));
    });
}

function filterMembers(members = [], { q, chamber, party }) {
    return sortMembers(
        members.filter(
            (m) => matchesQuery(m, q) && matchesChamber(m, chamber) && matchesParty(m, party)
        )
    );
}

function compositionFromMembers(senators = [], representatives = []) {
    const all = [...senators, ...representatives];

    let d = 0;
    let r = 0;
    let i = 0;

    for (const m of all) {
        const p = String(m.party || "").toUpperCase();
        if (p === "D") d += 1;
        else if (p === "R") r += 1;
        else if (p === "I") i += 1;
    }

    return {
        d,
        r,
        i,
        total: all.length,
        senate: senators.length,
        house: representatives.length,
    };
}

function CompositionLine({ stateCode, totalVisible, composition }) {
    return (
        <p className="ll3-stateSection__meta">
            <span>{stateCode}</span>
            <span className="ll3-metaSep">·</span>
            <span>{totalVisible} visible members</span>
            <span className="ll3-metaSep">|</span>
            <span>Senate {composition.senate}</span>
            <span className="ll3-metaSep">·</span>
            <span>House {composition.house}</span>
            <span className="ll3-metaSep">|</span>
            <span>D {composition.d}</span>
            <span className="ll3-metaSep">·</span>
            <span>R {composition.r}</span>
            {composition.i > 0 && (
                <>
                    <span className="ll3-metaSep">·</span>
                    <span>I {composition.i}</span>
                </>
            )}
            <span className="ll3-metaSep">|</span>
            <span>{composition.total} total</span>
        </p>
    );
}

function HouseGroup({ members }) {
    if (!members?.length) return null;

    const shouldCollapse = members.length > HOUSE_PREVIEW_COUNT;
    const preview = members.slice(0, HOUSE_PREVIEW_COUNT);
    const remainder = members.slice(HOUSE_PREVIEW_COUNT);

    return (
        <div className="ll3-chamberBlock">
            <div className="ll3-chamberBlock__head">
                <h3 className="ll3-chamberBlock__title">House</h3>
                <span className="ll3-chamberBlock__meta">{members.length} members</span>
            </div>

            <div className="ll3-memberTable">
                <div className="ll3-memberTable__head">
                    <div>Name</div>
                    <div>Party</div>
                    <div>District</div>
                    <div>View Profile</div>
                </div>

                <div className="ll3-memberTable__body">
                    {preview.map((m) => (
                        <MemberDirectoryRow key={m.bioguideId || m.id} m={m} />
                    ))}
                </div>
            </div>

            {shouldCollapse && (
                <details className="ll3-chamberExpand">
                    <div className="ll3-chamberExpand__body">
                        <div className="ll3-memberTable">
                            <div className="ll3-memberTable__body">
                                {remainder.map((m) => (
                                    <MemberDirectoryRow key={m.bioguideId || m.id} m={m} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <summary className="ll3-chamberExpand__summary">
                        <span className="ll3-chamberExpand__text ll3-chamberExpand__text--closed">
                            Show all {members.length} House members
                        </span>
                        <span className="ll3-chamberExpand__text ll3-chamberExpand__text--open">
                            Collapse House members
                        </span>
                    </summary>
                </details>
            )}
        </div>
    );
}

export default function MemberDirectoryClient() {
    const [loading, setLoading] = useState(true);
    const [statesList, setStatesList] = useState([]);

    const [q, setQ] = useState("");
    const [chamber, setChamber] = useState("");
    const [party, setParty] = useState("");
    const [activeState, setActiveState] = useState("");

    const sectionRefs = useRef({});
    const topRef = useRef(null);

    useEffect(() => {
        let live = true;

        (async () => {
            try {
                const res = await fetch(STATES_GROUPED_URL, { cache: "force-cache" });
                const json = res.ok ? await res.json() : { states: [] };
                if (!live) return;

                const states = (json?.states || []).map((s) => ({
                    ...s,
                    senators: sortMembers(s.senators || []),
                    representatives: sortMembers(s.representatives || []),
                }));

                setStatesList(states);
                setActiveState(states?.[0]?.stateCode || "");
            } finally {
                if (live) setLoading(false);
            }
        })();

        return () => {
            live = false;
        };
    }, []);

    const filteredStates = useMemo(() => {
        return statesList
            .map((state) => {
                const senators = filterMembers(state.senators || [], {
                    q,
                    chamber: chamber === "House" ? "__none__" : chamber,
                    party,
                });

                const representatives = filterMembers(state.representatives || [], {
                    q,
                    chamber: chamber === "Senate" ? "__none__" : chamber,
                    party,
                });

                return {
                    ...state,
                    senators,
                    representatives,
                    totalVisible: senators.length + representatives.length,
                    composition: compositionFromMembers(senators, representatives),
                };
            })
            .filter((state) => state.totalVisible > 0);
    }, [statesList, q, chamber, party]);

    useEffect(() => {
        if (!filteredStates.length) return;

        const ids = filteredStates.map((s) => s.stateCode).filter(Boolean);
        const nodes = ids.map((id) => sectionRefs.current[id]).filter(Boolean);

        if (!nodes.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible[0]) {
                    const code = visible[0].target.getAttribute("data-state-code");
                    if (code) setActiveState(code);
                }
            },
            {
                rootMargin: "-18% 0px -62% 0px",
                threshold: [0.12, 0.2, 0.35, 0.5],
            }
        );

        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [filteredStates]);

    function scrollToState(code) {
        const node = sectionRefs.current[code];
        if (!node) return;
        node.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveState(code);
    }

    function scrollToTop() {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function clearFilters() {
        setQ("");
        setChamber("");
        setParty("");
    }

    const totalVisibleMembers = filteredStates.reduce((sum, s) => sum + s.totalVisible, 0);
    const activeStateLabel =
        filteredStates.find((s) => s.stateCode === activeState)?.state || activeState;

    return (
        <section className="ll3-membersDirectory" ref={topRef}>
            <div className="ll3-membersDirectory__top">
                <div className="ll3-directoryFilters" aria-label="Directory filters">
                    <div className="ll3-directoryFilters__header">
                        <div className="ll3-directoryFilters__intro">
                            <h2 className="ll3-h2">Browse and filter</h2>
                            <p className="ll3-muted">
                                Start with the full directory, then narrow by name, chamber, or party.
                            </p>
                        </div>

                        <div className="ll3-directoryFilters__summary">
                            {!loading && (
                                <span className="ll3-directoryCount">
                                    {totalVisibleMembers} member{totalVisibleMembers === 1 ? "" : "s"} shown
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="ll3-directoryFilters__grid">
                        <div className="ll3-field ll3-directoryFilters__search">
                            <label className="ll3-label" htmlFor="members-directory-search">
                                Search
                            </label>
                            <input
                                id="members-directory-search"
                                className="ll3-input"
                                type="search"
                                placeholder="Search by member, state, or district…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </div>

                        <div className="ll3-field">
                            <label className="ll3-label" htmlFor="members-directory-chamber">
                                Chamber
                            </label>
                            <select
                                id="members-directory-chamber"
                                className="ll3-input"
                                value={chamber}
                                onChange={(e) => setChamber(e.target.value)}
                            >
                                <option value="">All Chambers</option>
                                <option value="House">House</option>
                                <option value="Senate">Senate</option>
                            </select>
                        </div>

                        <div className="ll3-field">
                            <label className="ll3-label" htmlFor="members-directory-party">
                                Party
                            </label>
                            <select
                                id="members-directory-party"
                                className="ll3-input"
                                value={party}
                                onChange={(e) => setParty(e.target.value)}
                            >
                                <option value="">All Parties</option>
                                <option value="D">Democrat</option>
                                <option value="R">Republican</option>
                                <option value="I">Independent</option>
                            </select>
                        </div>

                        <div className="ll3-directoryFilters__actions">
                            <button
                                type="button"
                                className="ll3-btn ll3-btn--ghost ll3-btn--full"
                                onClick={clearFilters}
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>

                    <div className="ll3-directoryFilters__mobileCount">
                        {!loading && (
                            <span>
                                {totalVisibleMembers} member{totalVisibleMembers === 1 ? "" : "s"} shown
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="ll3-mobileStateBarWrap">
                <div className="ll3-mobileStateBar" aria-label="Mobile state navigation">
                    <div className="ll3-mobileStateBar__left">
                        <label className="ll3-mobileStateBar__label" htmlFor="members-directory-jump">
                            Jump to state
                        </label>
                        <select
                            id="members-directory-jump"
                            className="ll3-input ll3-mobileStateBar__select"
                            value={activeState}
                            onChange={(e) => scrollToState(e.target.value)}
                        >
                            {filteredStates.map((state) => (
                                <option key={state.stateCode} value={state.stateCode}>
                                    {state.state} ({state.totalVisible})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        className="ll3-mobileStateBar__topBtn"
                        onClick={scrollToTop}
                    >
                        Top
                    </button>
                </div>
            </div>

            <div className="ll3-directoryShell">
                <aside className="ll3-directorySidebar" aria-label="States">
                    <div className="ll3-directorySidebar__inner">
                        <div className="ll3-directorySidebar__title">States</div>

                        <nav className="ll3-directorySidebar__nav">
                            {filteredStates.map((state) => {
                                const isActive = activeState === state.stateCode;
                                return (
                                    <button
                                        key={state.stateCode}
                                        type="button"
                                        className={`ll3-stateJump ${isActive ? "is-active" : ""}`}
                                        onClick={() => scrollToState(state.stateCode)}
                                        aria-current={isActive ? "true" : undefined}
                                    >
                                        <span className="ll3-stateJump__code">{state.stateCode}</span>
                                        <span className="ll3-stateJump__name">{state.state}</span>
                                        <span className="ll3-stateJump__count">{state.totalVisible}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <div className="ll3-directoryMain">
                    {loading && <p className="search-empty">Loading directory…</p>}

                    {!loading && filteredStates.length === 0 && (
                        <p className="search-empty">No members match the current filters.</p>
                    )}

                    {!loading &&
                        filteredStates.map((state) => (
                            <section
                                key={state.stateCode}
                                ref={(node) => {
                                    sectionRefs.current[state.stateCode] = node;
                                }}
                                data-state-code={state.stateCode}
                                id={`state-${state.stateCode}`}
                                className="ll3-stateSection"
                            >
                                <div className="ll3-stateSection__head">
                                    <div className="ll3-stateSection__heading">
                                        <h2 className="ll3-stateSection__title">{state.state}</h2>
                                        <CompositionLine
                                            stateCode={state.stateCode}
                                            totalVisible={state.totalVisible}
                                            composition={state.composition}
                                        />
                                    </div>
                                </div>

                                {state.senators.length > 0 && (
                                    <div className="ll3-chamberBlock">
                                        <div className="ll3-chamberBlock__head">
                                            <h3 className="ll3-chamberBlock__title">Senate</h3>
                                            <span className="ll3-chamberBlock__meta">
                                                {state.senators.length} members
                                            </span>
                                        </div>

                                        <div className="ll3-memberTable">
                                            <div className="ll3-memberTable__head">
                                                <div>Name</div>
                                                <div>Party</div>
                                                <div>District</div>
                                                <div>View Profile</div>
                                            </div>

                                            <div className="ll3-memberTable__body">
                                                {state.senators.map((m) => (
                                                    <MemberDirectoryRow key={m.bioguideId || m.id} m={m} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {state.representatives.length > 0 && (
                                    <HouseGroup members={state.representatives} />
                                )}
                            </section>
                        ))}
                </div>
            </div>
        </section>
    );
}