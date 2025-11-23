// components/search/SearchFilters.jsx
"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { STATES } from "@/lib/utils/constants";

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

  // Keep local input in sync with URL
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

  // ---------- Dropdown matching ----------
  const q = norm(qLocal);

  const allMembers = useMemo(() => {
    const arr = [];
    for (const s of statesList) {
      if (Array.isArray(s.senators)) arr.push(...s.senators.map((m) => ({ ...m, _state: s })));
      if (Array.isArray(s.representatives))
        arr.push(...s.representatives.map((m) => ({ ...m, _state: s })));
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
      const root = inputRef.current.closest(".lemur-searchbox");
      if (root && !root.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="filters" aria-label="Search filters">
      <div className="filters__row">
        {/* NAME */}
        <div className="filters__field field--grow">
          <label className="filters__label" htmlFor="member-search">
            Name
          </label>

          <form onSubmit={onSubmit}>
            <div className="lemur-searchbox">
              <input
                id="member-search"
                ref={inputRef}
                className="sb-input"
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
                <div id="searchbox-listbox" className="sb-dropdown" role="listbox">
                  {stateMatches.length > 0 && (
                    <div className="sb-section">
                      <div className="sb-section-label">
                        <p>State</p>
                      </div>

                      {stateMatches.map((s) => (
                        <div key={s.stateCode || s.state} className="sb-state-block">
                          <div className="sb-state-heading">
                            {s.state}
                            {s.stateCode ? <span className="sb-state-code">({s.stateCode})</span> : null}
                          </div>

                          <ul className="sb-list">
                            {[...(s.senators || []), ...(s.representatives || [])].map((m) => (
                              <li key={m.bioguideId} className="sb-list-item" role="option">
                                <Link
                                  href={`/member/${m.bioguideId}`}
                                  className="sb-member-link"
                                  onClick={() => setOpen(false)}
                                >
                                  {m.name}
                                </Link>
                                <span className="sb-member-meta">{metaFor(m)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {stateMatches.length > 0 && memberMatches.length > 0 && <hr className="sb-divider" />}

                  {memberMatches.length > 0 && (
                    <div className="sb-section">
                      <div className="sb-section-label">
                        <p>Members</p>
                      </div>
                      <ul className="sb-list">
                        {memberMatches.map((m) => (
                          <li key={m.bioguideId} className="sb-list-item" role="option">
                            <Link
                              href={`/member/${m.bioguideId}`}
                              className="sb-member-link"
                              onClick={() => setOpen(false)}
                            >
                              {m.name}
                            </Link>
                            <span className="sb-member-meta">{metaFor(m)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}

              {open && !loading && stateMatches.length === 0 && memberMatches.length === 0 && (
                <div className="sb-dropdown">No matches.</div>
              )}
              {open && loading && <div className="sb-dropdown">Loading…</div>}
            </div>
          </form>
        </div>

        {/* CHAMBER */}
        <label className="filters__field">
          <span className="filters__label">Chamber</span>
          <select
            className="field sb-select"
            value={current.chamber}
            onChange={(e) => setParam("chamber", e.target.value)}
          >
            <option value="">All</option>
            <option value="House">House</option>
            <option value="Senate">Senate</option>
          </select>
        </label>

        {/* PARTY */}
        <label className="filters__field">
          <span className="filters__label">Party</span>
          <select
            className="field sb-select"
            value={current.party}
            onChange={(e) => setParam("party", e.target.value)}
          >
            <option value="">All</option>
            <option value="D">Democrat</option>
            <option value="R">Republican</option>
            <option value="I">Independent</option>
          </select>
        </label>

        {/* STATE */}
        <label className="filters__field">
          <span className="filters__label">State</span>
          <select
            className="field sb-select"
            value={current.state}
            onChange={(e) => setParam("state", e.target.value.toUpperCase())}
          >
            <option value="">All</option>
            {STATES.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <div className="filters__actions">
          <button type="button" className="btn btn--ghost" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      {/* Active chips */}
      <div className="filters__chips" role="status" aria-live="polite">
        {current.q && <Chip label={`Name: ${current.q}`} onClear={() => setParam("q", "")} />}
        {current.chamber && (
          <Chip label={`Chamber: ${current.chamber}`} onClear={() => setParam("chamber", "")} />
        )}
        {current.party && (
          <Chip label={`Party: ${partyLabel(current.party)}`} onClear={() => setParam("party", "")} />
        )}
        {current.state && (
          <Chip label={`State: ${current.state}`} onClear={() => setParam("state", "")} />
        )}
        {!current.q && !current.chamber && !current.party && !current.state && (
          <span className="filters__hint">No filters applied</span>
        )}
      </div>
    </div>
  );
}

function Chip({ label, onClear }) {
  return (
    <span className="chip chip--pill">
      {label}
      <button type="button" className="chip__x" onClick={onClear} aria-label={`Remove ${label}`}>
        ×
      </button>
    </span>
  );
}

function partyLabel(p) {
  return p === "D" ? "Democrat" : p === "R" ? "Republican" : "Independent";
}
