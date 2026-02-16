// components/search/SearchResultCard.jsx
"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
// import { startNavLoadingToast } from "@/lib/navLoadingToast";
export default function SearchResultCard({ m }) {

    const href = `/member/${m.bioguideId || m.id}`;
    const party = (m.party || "").toUpperCase(); // "D" | "R" | "I" | ""
    const districtLabel =
        m.district != null && m.district !== ""
            ? `${m.state || m.stateCode || ""}-${m.district}`
            : m.state || m.stateCode || "";

    return (
        <article className="membercard" data-party={party}>
            <div className="membercard__body">
                <h3 className="membercard__title">{m.name}</h3>
                <div className="membercard__chips">
                    {party && (
                        <span className={`chip ${chipForParty(party)}`}>{partyLabel(party)}</span>
                    )}
                    {m.chamber && <span className="chip chip--muted">{m.chamber}</span>}
                    {districtLabel && <span className="chip chip--muted">{districtLabel}</span>}
                </div>
            </div>

            <div className="membercard__actions">
                {/* <a className="btn btn--accent" href={href} aria-label={`View ${m.name} profile`}>
                    View profile
                </a> */}
                <Link className="ll3-btn ll3-btn--primary ll3-btn--sm ll3-btn--open" href={href} /* onClick={() => startNavLoadingToast("Opening profile…")}*/ >
                    <ArrowUpRight size={16} aria-hidden="true" />
                    View profile
                </Link>
            </div>
        </article>
    );
}

function partyLabel(p) {
    return p === "D" ? "Democrat" : p === "R" ? "Republican" : "Independent";
}
function chipForParty(p) {
    if (p === "D") return "chip--blue";
    if (p === "R") return "chip--red";
    if (p === "I") return "chip--purple";
    return "chip--muted";
}