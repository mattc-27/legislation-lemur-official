"use client";

import { useEffect, useMemo, useState } from "react";

const PRIMARY_ACTIONS = [
  ["register", "Register to vote", "Start or continue voter registration."],
  ["update", "Update registration", "Update your registration details."],
  ["check", "Check registration", "Confirm your voter registration status."],
  ["track", "Track ballot", "Check ballot status where available."],
];

const SUPPORT_ACTIONS = [
  ["electionOffice", "State election office", "Official state election website."],
  ["military", "Military voters", "Voting guidance for military voters."],
  ["overseas", "Overseas voters", "Voting guidance for overseas citizens."],
];

const STATE_NAMES = new Set([
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "American Samoa", "Guam", "Northern Mariana Islands", "Puerto Rico", "U.S. Virgin Islands"
]);

const URL_KEYS = {
  register: ["register", "register_url", "registerUrl", "registration", "registration_url", "registrationUrl", "voter_registration", "voterRegistrationUrl", "voter_registration_url"],
  update: ["update", "update_url", "updateUrl", "update_registration", "updateRegistration", "updateRegistrationUrl", "update_registration_url"],
  check: ["check", "check_url", "checkUrl", "check_registration", "checkRegistration", "checkRegistrationUrl", "registration_status", "registrationStatusUrl", "registration_status_url"],
  track: ["track", "track_url", "trackUrl", "track_ballot", "trackBallot", "trackBallotUrl", "ballot_status", "ballotStatusUrl", "ballot_status_url"],
  electionOffice: ["electionOffice", "election_office", "electionOfficeUrl", "stateElectionOffice", "state_election_office", "stateElectionOfficeUrl", "office", "officeUrl", "website", "website_url"],
  military: ["military", "military_url", "militaryUrl", "militaryVoters", "military_voters", "militaryVotersUrl", "military_voters_url"],
  overseas: ["overseas", "overseas_url", "overseasUrl", "overseasVoters", "overseas_voters", "overseasVotersUrl", "overseas_voters_url"],
  source: ["source", "source_url", "sourceUrl", "eacSource", "eac_source", "eacSourceUrl", "url"],
};

function asUrl(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

function firstValue(source, keys) {
  if (!source || typeof source !== "object") return null;
  for (const key of keys) {
    const value = asUrl(source[key]);
    if (value) return value;
  }
  return null;
}

function getNestedValue(source, group) {
  const keys = URL_KEYS[group];
  const nestedGroups = [source, source?.links, source?.urls, source?.resources, source?.actions, source?.voting, source?.eac];
  for (const groupSource of nestedGroups) {
    const value = firstValue(groupSource, keys);
    if (value) return value;
  }
  if (source?.[group] && typeof source[group] === "object") return firstValue(source[group], ["href", "url", "link"]);
  return null;
}

function findCode(source, fallbackKey = "") {
  return source?.code || source?.stateCode || source?.state_code || source?.abbr || source?.abbreviation || source?.postal || source?.state_abbr || source?.stateAbbr || fallbackKey;
}

function findName(source, code = "") {
  return source?.name || source?.state || source?.label || source?.stateName || source?.state_name || source?.jurisdiction || source?.territory || code;
}

function looksLikeStateRecord(value, key = "") {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const code = String(findCode(value, key) || "").toUpperCase();
  const name = String(findName(value, code) || "");
  const hasUrl = Object.values(URL_KEYS).some((keys) => firstValue(value, keys)) || [value.links, value.urls, value.resources, value.actions, value.voting, value.eac].some(Boolean);
  return (code.length >= 2 && code.length <= 3 && (hasUrl || STATE_NAMES.has(name))) || STATE_NAMES.has(name);
}

function collectStateRecords(input, found = [], seen = new WeakSet()) {
  if (!input || typeof input !== "object") return found;
  if (seen.has(input)) return found;
  seen.add(input);

  if (Array.isArray(input)) {
    input.forEach((item) => collectStateRecords(item, found, seen));
    return found;
  }

  if (looksLikeStateRecord(input)) found.push(input);

  Object.entries(input).forEach(([key, value]) => {
    if (looksLikeStateRecord(value, key)) found.push({ ...value, code: findCode(value, key) });
    else if (value && typeof value === "object") collectStateRecords(value, found, seen);
  });

  return found;
}

function normalizeStateRecord(record, fallbackKey) {
  const code = String(findCode(record, fallbackKey) || "").toUpperCase();
  const name = String(findName(record, code) || "");
  return {
    code,
    name,
    register: getNestedValue(record, "register"),
    update: getNestedValue(record, "update"),
    check: getNestedValue(record, "check"),
    track: getNestedValue(record, "track"),
    electionOffice: getNestedValue(record, "electionOffice"),
    military: getNestedValue(record, "military"),
    overseas: getNestedValue(record, "overseas"),
    source: getNestedValue(record, "source"),
  };
}

function normalizeStates(states) {
  const direct = Array.isArray(states) ? states : Object.entries(states || {}).map(([key, value]) => ({ ...(typeof value === "object" ? value : {}), code: findCode(value, key) }));
  const records = direct.length ? direct : collectStateRecords(states);
  const fallbackRecords = collectStateRecords(states);
  const allRecords = [...records, ...fallbackRecords];
  const deduped = new Map();

  allRecords.forEach((record) => {
    const normalized = normalizeStateRecord(record);
    if (!normalized.code || !normalized.name) return;
    if (!deduped.has(normalized.code)) deduped.set(normalized.code, normalized);
  });

  return [...deduped.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function ActionLink({ href, title, desc, variant = "primary" }) {
  if (!href) return null;
  return (
    <a className={`ll3-voteLookup__action ll3-voteLookup__action--${variant}`} href={href} target="_blank" rel="noreferrer">
      <span>
        <strong>{title}</strong>
        <em>{desc}</em>
      </span>
      <small aria-hidden="true">→</small>
    </a>
  );
}

export default function StateVotingLookup({ states = [] }) {
  const normalizedStates = useMemo(() => normalizeStates(states), [states]);
  const [selectedCode, setSelectedCode] = useState("");

  const selectedState =
    normalizedStates.find((state) => state.code === selectedCode) || null;
  const primaryLinks = PRIMARY_ACTIONS.map(([key, title, desc]) => ({ key, title, desc, href: selectedState?.[key] })).filter((item) => item.href);
  const supportLinks = SUPPORT_ACTIONS.map(([key, title, desc]) => ({ key, title, desc, href: selectedState?.[key] })).filter((item) => item.href);


  return (
    <section className="ll3-voteLookup" id="state-voting-lookup" aria-labelledby="state-voting-title">
      <div className="ll3-voteLookup__copy">
        <div className="ll3-ref__eyebrow">State voting resources</div>

        <h2 className="ll3-voteLookup__title" id="state-voting-title">
          Find official voting links by state
        </h2>

        <p className="ll3-voteLookup__lead">
          Choose a state or territory to jump into official registration, ballot, and
          election-office resources.
        </p>

        <div className="ll3-voteLookup__hintList" aria-label="Available resource types">
          <span>Registration</span>
          <span>Status checks</span>
          <span>Ballot tracking</span>
          <span>Election offices</span>
        </div>

        <label className="ll3-voteLookup__label" htmlFor="state-voting-select">
          Choose your state or territory
        </label>

        <select
          className="ll3-voteLookup__select"
          id="state-voting-select"
          value={selectedCode}
          onChange={(event) => setSelectedCode(event.target.value)}
        >
          <option value="">Select a state or territory…</option>
          {normalizedStates.map((state) => (
            <option value={state.code} key={state.code}>
              {state.name}
            </option>
          ))}
        </select>

        <p className="ll3-voteLookup__note">
          Only links available from the official source data are shown.
        </p>
      </div>


      <div className="ll3-voteLookup__panel" aria-live="polite">
        {selectedState ? (
          <>
            <div className="ll3-voteLookup__panelHead">
              <div>
                <div className="ll3-ref__eyebrow">Selected state</div>
                <h3>{selectedState.name} <span>{selectedState.code}</span></h3>
              </div>
              {selectedState.source ? <a className="ll3-voteLookup__source" href={selectedState.source} target="_blank" rel="noreferrer">EAC source</a> : null}
            </div>
            {primaryLinks.length ? <div className="ll3-voteLookup__grid">{primaryLinks.map((item) => <ActionLink {...item} key={item.key} />)}</div> : <div className="ll3-voteLookup__empty">No primary action links are currently available for this selection.</div>}
            {supportLinks.length ? <div className="ll3-voteLookup__support"><div className="ll3-ref__eyebrow">Additional official resources</div><div className="ll3-voteLookup__supportGrid">{supportLinks.map((item) => <ActionLink {...item} variant="support" key={item.key} />)}</div></div> : null}
          </>
        ) : (
          <div className="ll3-voteLookup__empty">
            <div className="ll3-ref__eyebrow">No state selected</div>
            <h3>Choose a state to view official links.</h3>
            <p>
              Available registration, ballot, election office, military, and overseas
              voter links will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
