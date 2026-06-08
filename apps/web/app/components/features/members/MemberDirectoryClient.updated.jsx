"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import MemberDirectoryRow from "@/app/components/features/members/MemberDirectoryRow.updated";
import ExplorerSidePanel from "@/app/components/shared/explorer/ExplorerSidePanel";

const HOUSE_PREVIEW_COUNT = 6;

const STATE_NAMES = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DC: "District of Columbia",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  IA: "Iowa",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  MA: "Massachusetts",
  MD: "Maryland",
  ME: "Maine",
  MI: "Michigan",
  MN: "Minnesota",
  MO: "Missouri",
  MS: "Mississippi",
  MT: "Montana",
  NC: "North Carolina",
  ND: "North Dakota",
  NE: "Nebraska",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NV: "Nevada",
  NY: "New York",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VA: "Virginia",
  VT: "Vermont",
  WA: "Washington",
  WI: "Wisconsin",
  WV: "West Virginia",
  WY: "Wyoming",
};

function normalizeChamber(chamber) {
  const value = String(chamber || "").trim();
  if (value === "Senate") return "Senate";
  if (value === "House" || value === "House of Representatives") return "House";
  return value;
}

function normalizeParty(party) {
  return String(party || "").toUpperCase();
}

function normalizeMember(member, fallbackState = {}) {
  const isVacant = Boolean(
    member?.isVacant || member?.is_vacant || member?.seatStatus === "vacant"
  );

  return {
    ...member,
    directoryRowId: member?.directoryRowId || member?.directory_row_id || null,
    rowKind: member?.rowKind || member?.row_kind || (isVacant ? "seat" : "member"),
    districtId: member?.districtId || member?.district_id || null,
    bioguideId: member?.bioguideId || member?.bioguide_id || null,
    name: member?.name || (isVacant ? "Vacant seat" : ""),
    party: member?.party || null,
    partyName: member?.partyName || member?.party_name || null,
    state: member?.state || fallbackState?.state || "",
    stateCode: String(
      member?.stateCode || member?.state_code || fallbackState?.stateCode || ""
    ).toUpperCase(),
    district: member?.district == null ? null : Number(member.district),
    chamber: normalizeChamber(member?.chamber),
    isVacant,
    seatStatus: member?.seatStatus || member?.seat_status || (isVacant ? "vacant" : "filled"),
    imageUrl: member?.imageUrl || member?.image_url || null,
    url: member?.url || null,
    updateDate: member?.updateDate || member?.update_date || null,
  };
}

function memberKey(m) {
  return (
    m?.directoryRowId ||
    m?.bioguideId ||
    m?.districtId ||
    `${m?.stateCode}-${m?.chamber}-${m?.district}-${m?.name}`
  );
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
    if (a?.isVacant && !b?.isVacant) return 1;
    if (!a?.isVacant && b?.isVacant) return -1;

    return String(a?.name || "").localeCompare(String(b?.name || ""));
  });
}

function normalizeStateGroup(state) {
  const stateCode = String(state?.stateCode || state?.state_code || "").toUpperCase();
  const stateName = STATE_NAMES[stateCode] || state?.state || stateCode;

  const normalizedState = {
    ...state,
    state: stateName,
    stateCode,
  };

  return {
    state: stateName,
    stateCode,
    senators: sortMembers((state?.senators || []).map((m) => normalizeMember(m, normalizedState))),
    representatives: sortMembers(
      (state?.representatives || []).map((m) => normalizeMember(m, normalizedState))
    ),
  };
}

function compositionForMembers(members) {
  const result = { D: 0, R: 0, I: 0, vacant: 0, filled: 0, total: members.length };

  members.forEach((m) => {
    const isVacant = Boolean(m?.isVacant || m?.seatStatus === "vacant");

    if (isVacant) {
      result.vacant += 1;
      return;
    }

    result.filled += 1;

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
      {composition.vacant > 0 ? <span>{composition.vacant} vacant</span> : null}
      <span className="ll3-metaSep">•</span>
      <span>{totalVisible} seats</span>
    </p>
  );
}

function HouseGroup({ members }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!members?.length) return null;

  const filledCount = members.filter((m) => !m.isVacant).length;
  const vacantCount = members.filter((m) => m.isVacant).length;
  const shouldCollapse = members.length > HOUSE_PREVIEW_COUNT;
  const visibleMembers = isExpanded || !shouldCollapse ? members : members.slice(0, HOUSE_PREVIEW_COUNT);

  return (
    <div className="ll3-chamberBlock">
      <div className="ll3-chamberBlock__head">
        <h3 className="ll3-chamberBlock__title">House</h3>
        <span className="ll3-chamberBlock__meta">
          {filledCount} filled{vacantCount ? ` / ${vacantCount} vacant` : ""}
        </span>
      </div>

      <div className="ll3-memberTable">
        <div className="ll3-memberTable__head">
          <div>Name</div>
          <div>Party</div>
          <div>District</div>
          <div>Profile</div>
        </div>

        <div className="ll3-memberTable__body">
          {visibleMembers.map((m) => (
            <MemberDirectoryRow key={memberKey(m)} m={m} />
          ))}
        </div>
      </div>

      {shouldCollapse ? (
        <button
          type="button"
          className="ll3-disclosureBtn ll3-chamberExpand__summary"
          onClick={() => setIsExpanded((value) => !value)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Collapse House seats" : `Show all ${members.length} House seats`}
        </button>
      ) : null}
    </div>
  );
}

export default function MemberDirectoryClient({ initialData }) {
  const [statesList, setStatesList] = useState(() =>
    (initialData?.states || []).map(normalizeStateGroup)
  );

  const [activeState, setActiveState] = useState(() =>
    String(initialData?.states?.[0]?.stateCode || initialData?.states?.[0]?.state_code || "").toUpperCase()
  );

  const sectionRefs = useRef({});
  const topRef = useRef(null);

  useEffect(() => {
    const nextStates = (initialData?.states || []).map(normalizeStateGroup);
    setStatesList(nextStates);
    setActiveState((prev) => prev || nextStates?.[0]?.stateCode || "");
  }, [initialData]);

  const states = useMemo(() => {
    return statesList.map((state) => {
      const senators = state.senators || [];
      const representatives = state.representatives || [];

      return {
        ...state,
        senators,
        representatives,
        totalVisible: senators.length + representatives.length,
        composition: compositionForMembers([...senators, ...representatives]),
      };
    });
  }, [statesList]);

  useEffect(() => {
    if (!states.length) return;

    const hash = String(window.location.hash || "").replace("#", "").toUpperCase();
    if (hash) requestAnimationFrame(() => scrollToState(hash, { updateHash: false }));
  }, [states.length]);

  useEffect(() => {
    const nodes = states.map((s) => sectionRefs.current[s.stateCode]).filter(Boolean);
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
      { rootMargin: "-18% 0px -62% 0px", threshold: [0.12, 0.2, 0.35, 0.5] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [states]);

  function scrollToState(code, { updateHash = true } = {}) {
    const normalized = String(code || "").toUpperCase();
    const node = sectionRefs.current[normalized];
    if (!node) return;

    node.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveState(normalized);

    if (updateHash) {
      window.history.replaceState(null, "", `#${normalized.toLowerCase()}`);
    }
  }

  function scrollToTop() {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <section className="ll3-membersDirectory" ref={topRef}>
      <div className="ll3-mobileStateBarWrap">
        <div className="ll3-mobileStateBar" aria-label="Mobile state navigation">
          <div className="ll3-mobileStateBar__left">
            <label className="ll3-mobileStateBar__label" htmlFor="members-directory-jump">
              Browse by state
            </label>

            <select
              id="members-directory-jump"
              className="ll3-input ll3-mobileStateBar__select"
              value={activeState}
              onChange={(e) => scrollToState(e.target.value)}
            >
              {states.map((state) => (
                <option key={state.stateCode} value={state.stateCode}>
                  {state.state}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="ll3-directoryFloatingTop"
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ArrowUp size={15} strokeWidth={2.5} />
        <span>Top</span>
      </button>

      <div className="ll3-directoryShell">
        <ExplorerSidePanel
          title="Browse by state"
          description="Use the state rail to explore each delegation. For member names, topics, or cross-entity discovery, use Smart Search."
          sectionLabel="State delegation"
          ariaLabel="Browse by state"
          className="ll3-directorySidebar"
        >
          <nav className="ll3-directorySidebar__nav" aria-label="State delegation">
            {states.map((state) => {
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
                </button>
              );
            })}
          </nav>
        </ExplorerSidePanel>

        <div className="ll3-directoryMain">
          {states.map((state) => (
            <section
              key={state.stateCode}
              ref={(node) => {
                sectionRefs.current[state.stateCode] = node;
              }}
              data-state-code={state.stateCode}
              id={state.stateCode.toLowerCase()}
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
                    {state.senators.some((m) => m.isVacant) ? (
                      <span className="ll3-chamberBlock__meta">Vacancy noted</span>
                    ) : null}
                  </div>

                  <div className="ll3-memberTable">
                    <div className="ll3-memberTable__head">
                      <div>Name</div>
                      <div>Party</div>
                      <div>District</div>
                      <div>Profile</div>
                    </div>

                    <div className="ll3-memberTable__body">
                      {state.senators.map((m) => (
                        <MemberDirectoryRow key={memberKey(m)} m={m} />
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