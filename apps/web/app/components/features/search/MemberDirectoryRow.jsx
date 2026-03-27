import Link from "next/link";

function partyLabel(party) {
    const p = String(party || "").toUpperCase();
    if (p === "D") return "Democrat";
    if (p === "R") return "Republican";
    if (p === "I") return "Independent";
    return party || "Unknown";
}

function partyClass(party) {
    const p = String(party || "").toUpperCase();
    if (p === "D") return "is-dem";
    if (p === "R") return "is-rep";
    return "is-ind";
}

function districtLabel(m) {
    if (m?.chamber === "Senate") {
        return m?.state || m?.stateCode || "";
    }

    const district = Number(m?.district);
    if (Number.isFinite(district)) {
        if (district === 0) return `${m?.stateCode || m?.state || ""}-AL`;
        return `${m?.stateCode || m?.state || ""}-${district}`;
    }

    return m?.state || m?.stateCode || "";
}

export default function MemberDirectoryRow({ m }) {
    const href = `/member/${m.bioguideId || m.id}`;

    return (
        <div className="ll3-memberRow">
            <div className="ll3-memberRow__nameCell">
                <Link href={href} className="ll3-memberRow__nameLink">
                    {m.name}
                </Link>

                <span
                    className={`ll3-memberRow__partyDot ${partyClass(m.party)}`}
                    aria-label={partyLabel(m.party)}
                    title={partyLabel(m.party)}
                />
            </div>

            <div className={`ll3-memberRow__party ${partyClass(m.party)}`}>
                {partyLabel(m.party)}
            </div>

            <div className="ll3-memberRow__district">{districtLabel(m)}</div>

            <div className="ll3-memberRow__actionCell">
                <Link href={href} className="ll3-memberRow__action">
                    View profile <span aria-hidden="true">→</span>
                </Link>
            </div>
        </div>
    );
}