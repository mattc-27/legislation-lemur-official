"use client";

import { useMemo } from "react";

const PARTY_LABELS = {
    D: "Democratic",
    R: "Republican",
    I: "Independent",
    vacant: "Vacant",
    unknown: "Unknown",
};

function getParty(seat) {
    if (seat?.isVacant || seat?.is_vacant) return "vacant";

    return String(
        seat?.partyCode ||
        seat?.party_code ||
        seat?.party ||
        "unknown"
    ).toUpperCase();
}

function getDistrictLabel(seat) {
    if (seat?.districtLabel) return seat.districtLabel;
    if (seat?.district_label) return seat.district_label;

    const state = seat?.stateCode || seat?.state_code || "";
    const district = seat?.district;

    if (district === 0 || district === "0") return `${state}-AL`;
    if (state && district != null) return `${state}-${district}`;

    return "House seat";
}

function getMemberName(seat) {
    return seat?.memberName || seat?.member_name || seat?.name || null;
}

function seatClass(party) {
    if (party === "D") return "is-dem";
    if (party === "R") return "is-rep";
    if (party === "I") return "is-ind";
    if (party === "vacant") return "is-vacant";
    return "is-unknown";
}

function buildHemicycleSeats(seats) {
    const ordered = [
        ...seats.filter((s) => getParty(s) === "D"),
        ...seats.filter((s) => getParty(s) === "I"),
        ...seats.filter((s) => getParty(s) === "vacant"),
        ...seats.filter((s) => getParty(s) === "R"),
        ...seats.filter((s) => !["D", "R", "I", "vacant"].includes(getParty(s))),
    ];

    const rows = [
        { count: 70, radius: 120 },
        { count: 88, radius: 160 },
        { count: 106, radius: 200 },
        { count: 171, radius: 240 },
    ];

    const points = [];
    let cursor = 0;

    rows.forEach((row) => {
        const rowSeats = ordered.slice(cursor, cursor + row.count);
        cursor += row.count;

        rowSeats.forEach((seat, index) => {
            const angle = Math.PI - (index / Math.max(rowSeats.length - 1, 1)) * Math.PI;
            const x = 300 + Math.cos(angle) * row.radius;
            const y = 285 - Math.sin(angle) * row.radius;

            points.push({
                ...seat,
                x,
                y,
                party: getParty(seat),
                districtLabel: getDistrictLabel(seat),
                memberName: getMemberName(seat),
            });
        });
    });

    return points;
}

export default function HouseCompositionHemicycle({ house = {}, states = [] }) {
    const seats = useMemo(() => {
        return buildHemicycleSeats(house?.seats || []);
    }, [house]);

    const counts = useMemo(() => {
        const result = { D: 0, R: 0, I: 0, vacant: 0, unknown: 0 };

        seats.forEach((seat) => {
            result[seat.party] = (result[seat.party] || 0) + 1;
        });

        return result;
    }, [seats]);

    const senateCounts = useMemo(() => {
        return states.reduce(
            (acc, row) => {
                acc.D += Number(row.senate_d || 0);
                acc.R += Number(row.senate_r || 0);
                acc.I += Number(row.senate_i || 0);
                return acc;
            },
            { D: 0, R: 0, I: 0 }
        );
    }, [states]);

    return (
        <div className="ll3-compositionPanel ll3-compositionPanel--house">
            <div className="ll3-compositionPanel__meta">
                <div>
                    <h3>House seat breakdown</h3>
                    <p>Each dot represents one active House seat in the current Congress.</p>
                </div>

                <div className="ll3-houseStats">
                    <span className="is-dem">{counts.D} D</span>
                    <span className="is-rep">{counts.R} R</span>
                    <span className="is-ind">{counts.I} I</span>
                    <span className="is-vacant">{counts.vacant} vacant</span>
                </div>
            </div>

            <div className="ll3-hemiShell">
                <svg
                    className="ll3-hemiSvg"
                    viewBox="0 0 600 330"
                    role="img"
                    aria-label="House composition semi-circle visualization"
                >
                    <path className="ll3-hemiGuide" d="M60 285 A240 240 0 0 1 540 285" />
                    <path className="ll3-hemiGuide" d="M100 285 A200 200 0 0 1 500 285" />
                    <path className="ll3-hemiGuide" d="M140 285 A160 160 0 0 1 460 285" />
                    <path className="ll3-hemiGuide" d="M180 285 A120 120 0 0 1 420 285" />

                    {seats.map((seat, index) => (
                        <circle
                            key={`${seat.districtId || seat.district_id || index}`}
                            className={`ll3-hemiSeat ${seatClass(seat.party)}`}
                            cx={seat.x}
                            cy={seat.y}
                            r="4.25"
                        >
                            <title>
                                {seat.districtLabel}
                                {seat.memberName ? ` — ${seat.memberName}` : ""} —{" "}
                                {PARTY_LABELS[seat.party] || "Unknown"}
                            </title>
                        </circle>
                    ))}
                </svg>
            </div>

            <div className="ll3-senateInset">
                <div>
                    <p className="ll3-eyebrow">Senate balance</p>
                    <h4>Current Senate delegation totals</h4>
                </div>

                <div className="ll3-senatePills">
                    <span className="is-dem">{senateCounts.D} Democratic</span>
                    <span className="is-rep">{senateCounts.R} Republican</span>
                    <span className="is-ind">{senateCounts.I} Independent</span>
                </div>
            </div>
        </div>
    );
}