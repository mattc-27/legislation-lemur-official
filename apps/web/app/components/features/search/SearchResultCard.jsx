import Link from "next/link";
import { ArrowUpRight, Landmark, MapPin } from "lucide-react";

function partyClass(party) {
    const p = String(party || "").toUpperCase();
    if (p === "D") return "chip chip--blue";
    if (p === "R") return "chip chip--red";
    return "chip chip--neutral";
}

function partyLabel(party) {
    const p = String(party || "").toUpperCase();
    if (p === "D") return "Democrat";
    if (p === "R") return "Republican";
    if (p === "I") return "Independent";
    return party || "Unknown";
}

function chamberLabel(m) {
    return m?.chamber === "Senate" ? "Senate" : "House";
}

function stateDistrictLabel(m) {
    if (m?.chamber === "Senate") {
        return m?.state || m?.stateCode || "";
    }

    const district = Number(m?.district);
    if (Number.isFinite(district)) {
        if (district === 0) return `${m?.state || m?.stateCode}-AL`;
        return `${m?.state || m?.stateCode}-${district}`;
    }

    return m?.state || m?.stateCode || "";
}

export default function SearchResultCard({ m }) {
    const href = `/member/${m.bioguideId || m.id}`;

    return (
        <article className="membercard">
            <div className="membercard__body">
                <h3 className="membercard__title">
                    <Link href={href} className="membercard__titleLink">
                        {m.name}
                    </Link>
                </h3>

                <div className="membercard__metaRow">
                    <span className={partyClass(m.party)}>{partyLabel(m.party)}</span>

                    <span className="chip chip--subtle">
                        <Landmark size={13} />
                        {chamberLabel(m)}
                    </span>

                    <span className="chip chip--subtle">
                        <MapPin size={13} />
                        {stateDistrictLabel(m)}
                    </span>
                </div>
            </div>

            <div className="membercard__actions">
                <Link href={href} className="ll3-btn ll3-btn--open ll3-btn--openSubtle">
                    <ArrowUpRight size={15} />
                    <span>View profile</span>
                </Link>
            </div>
        </article>
    );
}