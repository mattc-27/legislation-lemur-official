"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MemberDirectoryRow from "@/app/components/features/search/MemberDirectoryRow";

const HOUSE_PREVIEW_COUNT = 6;

function normalizeParty(party) {
    return String(party || "").toUpperCase();
}

function normalizeChamber(chamber) {
    const value = String(chamber || "").trim();

    if (value === "Senate") return "Senate";
    if (value === "House" || value === "House of Representatives") return "House";

    return value;
}

function normalizeMember(member, fallbackState = {}) {
    return {
        ...member,
        bioguideId: member?.bioguideId || member?.bioguide_id || null,
        party: member?.party || null,
        partyName: member?.partyName || member?.party_name || null,
        state: member?.state || fallbackState?.state || "",
        stateCode: String(member?.stateCode || member?.state_code || fallbackState?.stateCode || "").toUpperCase(),
        district: member?.district == null ? null : Number(member.district),
        chamber: normalizeChamber(member?.chamber),
        imageUrl: member?.imageUrl || member?.image_url || null,
        url: member?.url || null,
        updateDate: member?.updateDate || member?.update_date || null,
    };
}

function sortMembers(list) {
    return [...list].sort((a, b) => {
        const chamberA = normalizeChamber(a?.chamber);
        const chamberB = normalizeChamber(b?.chamber);

        if (chamberA !== chamberB) {
            if (chamberA === "Senate") return -1;
            if (chamberB === "Senate") return 1;
            return chamberA.localeCompare(chamberB);
        }

        const districtA = Number(a?.district);
        const districtB = Number(b?.district);

        if (Number.isFinite(districtA) && Number.isFinite(districtB) && districtA !== districtB) {
            return districtA - districtB;
        }

        if (Number.isFinite(districtA) && !Number.isFinite(districtB)) return -1;
        if (!Number.isFinite(districtA) && Number.isFinite(districtB)) return 1;

        return String(a?.name || "").localeCompare(String(b?.name || ""));
    });
}

function normalizeStateGroup(state) {
    const normalizedState = {
        state: state?.state || "",
        stateCode: String(state?.stateCode || state?.state_code || "").toUpperCase(),
        senators: sortMembers((state?.senators || []).map((m) => normalizeMember(m, state))),
        representatives: sortMembers((state?.representatives || []).map((m) => normalizeMember(m, state))),
    };

    return normalizedState;
}

function filterMembers(members, { q, chamber, party }) {
    const query = String(q || "").trim().toLowerCase();

    return members.filter((m) => {
        const normalizedChamberValue = normalizeChamber(m?.chamber);

        const matchesQuery =
            !query ||
            String(m?.name || "").toLowerCase().includes(query) ||
            String(m?.state || "").toLowerCase().includes(query) ||
            String(m?.stateCode || "").toLowerCase().includes(query) ||
            String(m?.district || "").toLowerCase().includes(query);

        const matchesChamber = !chamber || normalizedChamberValue === chamber;
        const matchesParty = !party || normalizeParty(m?.party) === normalizeParty(party);

        return matchesQuery && matchesChamber && matchesParty;
    });
}

function compositionForMembers(members) {
    const result = { D: 0, R: 0, I: 0, total: members.length };

    members.forEach((m) => {
        const p = normalizeParty(m?.party);
        if (p === "D") result.D += 1;
        else if (p === "R") result.R += 1;
        else result.I += 1;
    });

    return result;
}

function CompositionLine({ stateCode, totalVisible, composition }) {
    if (!composition) return null;

    return (
        <p className="ll3-compositionLine">
            <span className="ll3-compositionLine__state">{stateCode}</span>
            <span className="ll3-metaSep">•</span>
            {composition.D > 0 ? <span className="is-dem">{composition.D} D</span> : null}
            {composition.R > 0 ? <span className="is-rep">{composition.R} R</span> : null}
            {composition.I > 0 ? <span className="is-ind">{composition.I} I</span> : null}
            <span className="ll3-metaSep">•</span>
            <span>{totalVisible} shown</span>
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

            {shouldCollapse ? (
                <details className="ll3-chamberExpand">
                    <summary className="ll3-chamberExpand__summary">
                        <span className="ll3-chamberExpand__text ll3-chamberExpand__text--closed">
                            Show all {members.length} House members
                        </span>
                        <span className="ll3-chamberExpand__text ll3-chamberExpand__text--open">
                            Collapse House members
                        </span>
                    </summary>

                    <div className="ll3-chamberExpand__body">
                        <div className="ll3-memberTable">
                            <div className="ll3-memberTable__body">
                                {remainder.map((m) => (
                                    <MemberDirectoryRow key={m.bioguideId || m.id} m={m} />
                                ))}
                            </div>
                        </div>
                    </div>
                </details>
            ) : null}
        </div>
    );
}

export default function MemberDirectoryClient({ initialData }) {
    const [loading, setLoading] = useState(false);
    const [statesList, setStatesList] = useState(() =>
        (initialData?.states || []).map(normalizeStateGroup)
    );

    const [q, setQ] = useState("");
    const [chamber, setChamber] = useState("");
    const [party, setParty] = useState("");
    const [activeState, setActiveState] = useState(() => {
        const firstState = (initialData?.states || [])[0];
        return String(firstState?.stateCode || firstState?.state_code || "");
    });

    const sectionRefs = useRef({});
    const topRef = useRef(null);

    useEffect(() => {
        const nextStates = (initialData?.states || []).map(normalizeStateGroup);
        setStatesList(nextStates);
        setActiveState((prev) => prev || nextStates?.[0]?.stateCode || "");
    }, [initialData]);

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

                const totalVisible = senators.length + representatives.length;

                return {
                    ...state,
                    senators,
                    representatives,
                    totalVisible,
                    composition: compositionForMembers([...senators, ...representatives]),
                };
            })
            .filter((state) => state.totalVisible > 0);
    }, [statesList, q, chamber, party]);

    useEffect(() => {
        if (!filteredStates.length) return;
        if (!filteredStates.find((s) => s.stateCode === activeState)) {
            setActiveState(filteredStates[0].stateCode);
        }
    }, [filteredStates, activeState]);

    useEffect(() => {
        if (!filteredStates.length) return;

        const nodes = filteredStates
            .map((s) => sectionRefs.current[s.stateCode])
            .filter(Boolean);

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
                            {!loading ? (
                                <span className="ll3-directoryCount">
                                    {totalVisibleMembers} member{totalVisibleMembers === 1 ? "" : "s"} shown
                                </span>
                            ) : null}
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
                                onChange={(e) => setChamber(normalizeChamber(e.target.value))}
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
                        {!loading ? (
                            <span>
                                {totalVisibleMembers} member{totalVisibleMembers === 1 ? "" : "s"} shown
                            </span>
                        ) : null}
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
                    {loading ? <p className="search-empty">Loading directory…</p> : null}

                    {!loading && filteredStates.length === 0 ? (
                        <p className="search-empty">No members match the current filters.</p>
                    ) : null}

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

                                {state.senators.length > 0 ? (
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
                                ) : null}

                                {state.representatives.length > 0 ? (
                                    <HouseGroup members={state.representatives} />
                                ) : null}
                            </section>
                        ))}
                </div>
            </div>
        </section>
    );
}