"use client";
import '../../../lib/stylesheets/vote-styles.css'
import React, { useMemo, useState } from "react";

const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
    "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

function slugifyStateForVoteGov(name) {
    return name.toLowerCase().replaceAll(" ", "-");
}



export default function StateLookup() {
    const [selectedState, setSelectedState] = useState("");

    const stateLinks = useMemo(() => {
        if (!selectedState) return null;
        const slug = slugifyStateForVoteGov(selectedState);
        return {
            voteGov: `https://www.vote.gov/state/${slug}/`,
            // CanIVote is generalized; many state-specific flows start from here:
            canIVote: "https://www.nass.org/can-I-vote",
        };
    }, [selectedState]);


    return (

        <section className="state-lookup" aria-label="Find state-specific links">
            <div className="state-lookup__header">
                <h2 className="state-lookup__title">Quick State Lookup</h2>
                <p className="state-lookup__hint">
                    Choose a state to jump straight to its page on vote.gov. You’ll finish your registration or
                    lookup on the official site.
                </p>
            </div>

            <div className="state-lookup__controls">
                <label className="state-lookup__label" htmlFor="stateSelect">
                    Choose your state or territory
                </label>
                <select
                    id="stateSelect"
                    className="state-lookup__select"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                >
                    <option value="">— Select —</option>
                    {states.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>

                {selectedState && (
                    <p className="state-lookup__selected">
                        Selected: <span className="state-pill">{selectedState}</span>
                    </p>
                )}
            </div>

            <div className="state-lookup__cards">
                <article className="election-card election-card--compact" aria-live="polite">
                    <h3 className="election-card__title">vote.gov • Registration</h3>
                    <p className="election-card__body">
                        Official federal portal with your state’s registration and voting info.
                    </p>
                    <a
                        className={`btn btn--primary ${!stateLinks ? "btn--disabled" : ""}`}
                        href={stateLinks ? stateLinks.voteGov : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-disabled={!stateLinks}
                        onClick={(e) => {
                            if (!stateLinks) e.preventDefault();
                        }}
                    >
                        {stateLinks ? `Open ${selectedState} page →` : "Select a state"}
                    </a>
                </article>

                <article className="election-card election-card--compact">
                    <h3 className="election-card__title">Can I Vote • State Info</h3>
                    <p className="election-card__body">
                        Find your state election office, official FAQs, and more details.
                    </p>
                    <a
                        className="btn btn--ghost"
                        href="https://www.nass.org/can-I-vote"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Open Can I Vote →
                    </a>
                </article>
            </div>
        </section>
    )
}