// components/search/SearchBox.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// const SEARCH_INDEX_URL = "../../data/search_index.json"
//const STATES_GROUPED_URL = "../../data/states_grouped.json";
const SEARCH_INDEX_URL = "@/apps/web/public/data/search_index.json";
const STATES_GROUPED_URL = "@/apps/web/public/data/states_grouped.json";

// import '../../../../app/modules/stylesheets/home-styles.css';

// Helpers
const norm = (s) => (s || "").toLowerCase().trim();
const isEmpty = (s) => !s || !s.trim();
const atLarge = (d) => (d === 0 || d === "0" ? "At-Large" : `District ${d}`);
const metaFor = (m) =>
  `${m.chamber === "Senate" ? "Senate" : `House, ${atLarge(m.district)}`} | ${m.party || ""}`;


export default function SearchBox({ className = "" }) {
  const inputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    if (!hasQuery) setOpen(false);
  }, [hasQuery]);

  const [index, setIndex] = useState([]);   // flat index of members
  const [states, setStates] = useState([]); // states_grouped.json → states[]

  // Load data once
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
        setStates(statesJson?.states || []);
      } catch {
        setIndex([]);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  // Flattened list of all members from states_grouped
  const allMembers = useMemo(() => {
    const arr = [];
    for (const s of states) {
      if (Array.isArray(s.senators)) arr.push(...s.senators.map((m) => ({ ...m, _state: s })));
      if (Array.isArray(s.representatives))
        arr.push(...s.representatives.map((m) => ({ ...m, _state: s })));
    }
    return arr;
  }, [states]);

  const q = norm(query);

  // State matches
  const stateMatches = useMemo(() => {
    if (isEmpty(q)) return [];
    return states.filter((s) => {
      const name = norm(s.state);
      const code = norm(s.stateCode);
      return name.includes(q) || code.includes(q);
    });
  }, [q, states]);

  // Member matches
  const memberPool = index?.length ? index : allMembers;
  const memberMatches = useMemo(() => {
    if (isEmpty(q)) return [];
    return memberPool.filter((m) => norm(m.name).includes(q)).slice(0, 30);
  }, [q, memberPool]);

  // Close dropdown on outside click
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
    <div className={`lemur-searchbox ${className}`}>
      <input
        ref={inputRef}
        className="sb-input"
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="searchbox-listbox"
        placeholder="Search by state or member…"
        autoComplete="off"
        value={query}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          setOpen(val.trim().length > 0);
        }}
        onFocus={() => setOpen(hasQuery)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />

      {open && !loading && (stateMatches.length > 0 || memberMatches.length > 0) && (
        <div id="searchbox-listbox" className="sb-dropdown" role="listbox">
          {/* STATE SECTION */}
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
                          href={`/member/${m.bioguideId}`} // ✅ consistent route
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

          {/* MEMBERS SECTION */}
          {memberMatches.length > 0 && (
            <div className="sb-section">
              <div className="sb-section-label">
                <p>Members</p>
              </div>
              <ul className="sb-list">
                {memberMatches.map((m) => (
                  <li key={m.bioguideId} className="sb-list-item" role="option">
                    <Link
                      href={`/member/${m.bioguideId}`} // ✅ fixed (was /members/)
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
      )}

      {open && !loading && stateMatches.length === 0 && memberMatches.length === 0 && (
        <div className="sb-dropdown">No matches.</div>
      )}
      {open && loading && <div className="sb-dropdown">Loading…</div>}
    </div>
  );
}
