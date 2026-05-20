"use client";

import { useMemo, useState } from "react";

const PRIMARY_ACTIONS = [
    ["register_to_vote_url", "Register to vote", "Start or continue voter registration."],
    ["update_registration_url", "Update registration", "Update your registration details."],
    ["check_registration_url", "Check registration", "Confirm your voter registration status."],
    ["absentee_mail_early_voting_url", "Absentee / mail / early voting", "Find mail, absentee, or early voting options."],
    ["track_ballot_url", "Track ballot", "Check ballot status where available."],
    ["polling_place_lookup_url", "Polling place lookup", "Find in-person voting locations where available."],
];

const SUPPORT_ACTIONS = [
    ["state_election_office_url", "State election office", "Official state election website."],
    ["local_election_office_url", "Local election office", "County or local election office directory."],
    ["military_voters_url", "Military voters", "Voting guidance for military voters."],
    ["overseas_voters_url", "Overseas voters", "Voting guidance for overseas citizens."],
];

function cleanStates(states = []) {
    return states
        .filter((state) => state?.state_name && state?.state_code)
        .slice()
        .sort((a, b) => a.state_name.localeCompare(b.state_name));
}

function hasUrl(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function ActionLink({ record, item, variant = "default" }) {
    const [key, label, desc] = item;
    const href = record?.[key];

    if (!hasUrl(href)) return null;

    return (
        <a
            className={`ll3-voteLookup__action ll3-voteLookup__action--${variant}`}
            href={href}
            target="_blank"
            rel="noreferrer"
        >
            <span className="ll3-voteLookup__actionLabel">{label}</span>
            <span className="ll3-voteLookup__actionDesc">{desc}</span>
        </a>
    );
}

export default function StateVotingLookup({ states = [] }) {
    const normalizedStates = useMemo(() => cleanStates(states), [states]);
    const [selectedCode, setSelectedCode] = useState("");

    const selectedState = useMemo(
        () => normalizedStates.find((state) => state.state_code === selectedCode) || null,
        [normalizedStates, selectedCode]
    );

    const primaryAvailable = selectedState
        ? PRIMARY_ACTIONS.filter(([key]) => hasUrl(selectedState[key]))
        : [];

    const supportAvailable = selectedState
        ? SUPPORT_ACTIONS.filter(([key]) => hasUrl(selectedState[key]))
        : [];

    return (
        <section className="ll3-voteLookup" aria-labelledby="state-voting-lookup">
            <div className="ll3-voteLookup__grid">
                <div className="ll3-voteLookup__copy">
                    <div className="ll3-ref__eyebrow">State voting resources</div>

                    <h2 className="ll3-ref__section-title" id="state-voting-lookup">
                        Find official voting links by state
                    </h2>

                    <p className="ll3-ref__section-sub">
                        Choose a state or territory to view available official voting resources sourced from
                        the U.S. Election Assistance Commission directory.
                    </p>

                    <div className="ll3-voteLookup__field">
                        <label className="ll3-voteLookup__label" htmlFor="ll3-state-voting-select">
                            Choose your state or territory
                        </label>

                        <select
                            id="ll3-state-voting-select"
                            className="ll3-voteLookup__select"
                            value={selectedCode}
                            onChange={(event) => setSelectedCode(event.target.value)}
                        >
                            <option value="">Select a state or territory</option>
                            {normalizedStates.map((state) => (
                                <option value={state.state_code} key={state.state_code}>
                                    {state.state_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <p className="ll3-voteLookup__note">
                        Available actions vary by state. Missing links are hidden rather than shown as disabled buttons.
                    </p>
                </div>

                <div className="ll3-voteLookup__panel">
                    {!selectedState ? (
                        <div className="ll3-voteLookup__empty">
                            <div className="ll3-voteLookup__emptyKicker">Ready when you are</div>
                            <h3 className="ll3-voteLookup__emptyTitle">Select a state to show links</h3>
                            <p className="ll3-voteLookup__emptyCopy">
                                You’ll see registration, status lookup, ballot tracking, and election office links
                                when they are available in the EAC source data.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="ll3-voteLookup__resultHead">
                                <div>
                                    <div className="ll3-voteLookup__resultKicker">Selected state</div>
                                    <h3 className="ll3-voteLookup__resultTitle">
                                        {selectedState.state_name}
                                        <span>{selectedState.state_code}</span>
                                    </h3>
                                </div>

                                {hasUrl(selectedState.source_url) ? (
                                    <a
                                        className="ll3-voteLookup__source"
                                        href={selectedState.source_url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        EAC source
                                    </a>
                                ) : null}
                            </div>

                            {primaryAvailable.length ? (
                                <div className="ll3-voteLookup__actions">
                                    {primaryAvailable.map((item) => (
                                        <ActionLink record={selectedState} item={item} variant="primary" key={item[0]} />
                                    ))}
                                </div>
                            ) : (
                                <div className="ll3-voteLookup__missing">
                                    No primary voting action links were available for this state in the EAC dataset.
                                </div>
                            )}

                            {supportAvailable.length ? (
                                <div className="ll3-voteLookup__support">
                                    <div className="ll3-voteLookup__supportTitle">Additional official resources</div>
                                    <div className="ll3-voteLookup__supportGrid">
                                        {supportAvailable.map((item) => (
                                            <ActionLink record={selectedState} item={item} variant="support" key={item[0]} />
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}