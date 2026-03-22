"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";

import { STATES } from "@/lib/shared/constants/constants";

const SEARCH_INDEX_URL = "/data/search_index.json";
const STATES_GROUPED_URL = "/data/states_grouped.json";

const norm = (s) => (s || "").toLowerCase().trim();
const isEmpty = (s) => !s || !s.trim();
const atLarge = (d) => (d === 0 || d === "0" ? "At-Large" : `District ${d}`);
const metaFor = (m) =>
  `${m.chamber === "Senate" ? "Senate" : `House, ${atLarge(m.district)}`} | ${m.party || ""}`;

export default function SearchFilters({ initial = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const inputRef = useRef(null);

  const [qLocal, setQLocal] = useState(initial.q || "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState([]);
  const [statesList, setStatesList] = useState([]);

  useEffect(() => {
    let live = true;

    (async () => {
      try {
        const [idxRes, statesRes] = await Promise.all([
          fetch(SEARCH_INDEX_URL, { cache: "force-cache" }),
          fetch(STATES_GROUPED_URL, { cache: "force-cache" }),
        ]);

        const idxJson = idxRes.ok ? await idxRes.json() : { members: [] };
        const statesJson = statesRes.ok ? await statesRes.json() : { states: [] };

        if (!live) return;

        setIndex(idxJson?.members || idxJson || []);
        setStatesList(statesJson?.states || []);
      } finally {
        if (live) setLoading(false);
      }
    })();

    return () => {
      live = false;
    };
  }, []);

  const current = useMemo(
    () => ({
      q: params.get("q") ?? initial.q ?? "",
      chamber: params.get("chamber") ?? initial.chamber ?? "",
      party: params.get("party") ?? initial.party ?? "",
      state: (params.get("state") ?? initial.state ?? "").toUpperCase(),
    }),
    [params, initial.q, initial.chamber, initial.party, initial.state]
  );

  useEffect(() => {
    setQLocal(current.q || "");
  }, [current.q]);

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(params.toString());
      if (value == null || value === "") next.delete(key);
      else next.set(key, value);
      next.delete("page");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  const clearFilters = useCallback(() => {
    const next = new URLSearchParams(params.toString());
    ["q", "chamber", "party", "state", "page"].forEach((k) => next.delete(k));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [params, pathname, router]);

  const onSubmit = (e) => {
    e.preventDefault();
    setParam("q", qLocal.trim());
  };

  const q = norm(qLocal);

  const allMembers = useMemo(() => {
    const arr = [];
    for (const s of statesList) {
      if (Array.isArray(s.senators)) arr.push(...s.senators.map((m) => ({ ...m, _state: s })));
      if (Array.isArray(s.representatives)) {
        arr.push(...s.representatives.map((m) => ({ ...m, _state: s })));
      }
    }
    return arr;
  }, [statesList]);

  const memberPool = index?.length ? index : allMembers;

  const stateMatches = useMemo(() => {
    if (isEmpty(q)) return [];
    return statesList.filter((s) => {
      const name = norm(s.state);
      const code = norm(s.stateCode);
      return name.includes(q) || code.includes(q);
    });
  }, [q, statesList]);

  const memberMatches = useMemo(() => {
    if (isEmpty(q)) return [];
    return memberPool.filter((m) => norm(m.name).includes(q)).slice(0, 30);
  }, [q, memberPool]);

  useEffect(() => {
    if (!qLocal.trim()) setOpen(false);
  }, [qLocal]);

  useEffect(() => {
    function onDocClick(e) {
      if (!inputRef.current) return;
      const root = inputRef.current.closest(".ll3-searchbox");
      if (root && !root.contains(e.target)) setOpen(false);
    }

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="ll3-membersFilters" aria-label="Search filters">
      <div className="ll3-control__header">
        <div className="ll3-control__heading">
          <h2 className="ll3-h2">Refine</h2>
          <p className="ll3-muted">
            Search and filter members by name, chamber, party, or state.
          </p>
        </div>
      </div>

      <div className="ll3-membersFilters__grid">
        <div className="ll3-field ll3-field--span2">
          <label className="ll3-label" htmlFor="member-search">
            Name
          </label>

          <form onSubmit={onSubmit}>
            <div className="ll3-searchbox">
              <input
                id="member-search"
                ref={inputRef}
                className="ll3-input ll3-searchbox__input"
                type="search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls="searchbox-listbox"
                placeholder="Search by state or member…"
                autoComplete="off"
                value={qLocal}
                onChange={(e) => {
                  const val = e.target.value;
                  setQLocal(val);
                  setOpen(val.trim().length > 0);
                }}
                onFocus={() => setOpen(qLocal.trim().length > 0)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                }}
              />

              {open && !loading && (stateMatches.length || memberMatches.length) ? (
                <div
                  id="searchbox-listbox"
                  className="ll3-searchbox__dropdown"
                  role="listbox"
                >
                  {stateMatches.length > 0 && (
                    <div className="ll3-sbSection">
                      <div className="ll3-sbSection__label">State</div>

                      {stateMatches.map((s) => (
                        <div key={s.stateCode || s.state} className="ll3-sbState">
                          <div className="ll3-sbState__head">
                            {s.state}
                            {s.stateCode ? (
                              <span className="ll3-sbState__code">
                                ({s.stateCode})
                              </span>
                            ) : null}
                          </div>

                          <ul className="ll3-sbList">
                            {[...(s.senators || []), ...(s.representatives || [])].map(
                              (m) => (
                                <li
                                  key={m.bioguideId}
                                  className="ll3-sbItem"
                                  role="option"
                                >
                                  <Link
                                    href={`/member/${m.bioguideId}`}
                                    className="ll3-sbLink"
                                    onClick={() => setOpen(false)}
                                  >
                                    {m.name}
                                  </Link>
                                  <span className="ll3-sbMeta">
                                    {metaFor(m)}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {stateMatches.length > 0 && memberMatches.length > 0 && (
                    <hr className="ll3-sbDivider" />
                  )}

                  {memberMatches.length > 0 && (
                    <div className="ll3-sbSection">
                      <div className="ll3-sbSection__label">Members</div>
                      <ul className="ll3-sbList">
                        {memberMatches.map((m) => (
                          <li key={m.bioguideId} className="ll3-sbItem" role="option">
                            <Link
                              href={`/member/${m.bioguideId}`}
                              className="ll3-sbLink"
                              onClick={() => setOpen(false)}
                            >
                              {m.name}
                            </Link>
                            <span className="ll3-sbMeta">{metaFor(m)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}

              {open &&
                !loading &&
                stateMatches.length === 0 &&
                memberMatches.length === 0 && (
                  <div className="ll3-searchbox__dropdown ll3-searchbox__empty">
                    No matches.
                  </div>
                )}

              {open && loading && (
                <div className="ll3-searchbox__dropdown ll3-searchbox__empty">
                  Loading…
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="ll3-field">
          <label className="ll3-label" htmlFor="member-chamber">
            Chamber
          </label>
          <select
            id="member-chamber"
            className="ll3-input"
            value={current.chamber}
            onChange={(e) => setParam("chamber", e.target.value)}
          >
            <option value="">All Chambers</option>
            <option value="House">House</option>
            <option value="Senate">Senate</option>
          </select>
        </div>

        <div className="ll3-field">
          <label className="ll3-label" htmlFor="member-party">
            Party
          </label>
          <select
            id="member-party"
            className="ll3-input"
            value={current.party}
            onChange={(e) => setParam("party", e.target.value)}
          >
            <option value="">All Parties</option>
            <option value="D">Democrat</option>
            <option value="R">Republican</option>
            <option value="I">Independent</option>
          </select>
        </div>

        <div className="ll3-field">
          <label className="ll3-label" htmlFor="member-state">
            State
          </label>
          <select
            id="member-state"
            className="ll3-input"
            value={current.state}
            onChange={(e) => setParam("state", e.target.value.toUpperCase())}
          >
            <option value="">All States</option>
            {STATES.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="ll3-membersFilters__actions">
          <button
            type="button"
            className="ll3-btn ll3-btn--ghost ll3-btn--full"
            onClick={clearFilters}
          >
            Clear
          </button>

          <button
            type="button"
            className="ll3-btn ll3-btn--primary ll3-btn--full"
            onClick={() => setParam("q", qLocal.trim())}
          >
            Apply filters
          </button>
        </div>
      </div>

      <div className="ll3-filterChips" role="status" aria-live="polite">
        {current.q && <Chip label={`Name: ${current.q}`} onClear={() => setParam("q", "")} />}

        {current.chamber && (
          <Chip label={`Chamber: ${current.chamber}`} onClear={() => setParam("chamber", "")} />
        )}

        {current.party && (
          <Chip
            label={`Party: ${partyLabel(current.party)}`}
            onClear={() => setParam("party", "")}
          />
        )}

        {current.state && (
          <Chip label={`State: ${current.state}`} onClear={() => setParam("state", "")} />
        )}

        {!current.q && !current.chamber && !current.party && !current.state && (
          <span className="ll3-muted ll3-filterHint">No filters applied</span>
        )}
      </div>
    </div>
  );
}

function Chip({ label, onClear }) {
  return (
    <span className="chip chip--pill">
      <span className="chip__label">{label}</span>
      <button type="button" className="chip__x" onClick={onClear} aria-label={`Remove ${label}`}>
        <span className="ll3-pill__sep" aria-hidden="true" />
        <span className="ll3-pill__icon" aria-hidden="true">
          <X size={14} />
        </span>
      </button>
    </span>
  );
}

function partyLabel(p) {
  return p === "D" ? "Democrat" : p === "R" ? "Republican" : "Independent";
}