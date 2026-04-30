import Link from "next/link";

function partyLabel(party, isVacant = false) {
    if (isVacant) return "Vacant";

    const p = String(party || "").toUpperCase();
    if (p === "D") return "Democrat";
    if (p === "R") return "Republican";
    if (p === "I") return "Independent";
    return party || "Unknown";
}

function partyClass(party, isVacant = false) {
    if (isVacant) return "is-vacant";

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
    const isVacant = Boolean(m?.isVacant || m?.seatStatus === "vacant");
    const href = !isVacant && (m?.bioguideId || m?.id) ? `/member/${m.bioguideId || m.id}` : null;
    const label = partyLabel(m?.party, isVacant);
    const className = partyClass(m?.party, isVacant);

    return (
        <div className={`ll3-memberRow ${isVacant ? "is-vacant" : ""}`}>
            <div className="ll3-memberRow__nameCell">
                {href ? (
                    <Link href={href} className="ll3-memberRow__nameLink">
                        {m.name}
                    </Link>
                ) : (
                    <span className="ll3-memberRow__nameLink ll3-memberRow__nameLink--disabled">
                        Vacant seat
                    </span>
                )}

                <span
                    className={`ll3-memberRow__partyDot ${className}`}
                    aria-label={label}
                    title={label}
                />
            </div>

            <div className={`ll3-memberRow__party ${className}`}>
                {label}
            </div>

            <div className="ll3-memberRow__district">{districtLabel(m)}</div>

            <div className="ll3-memberRow__actionCell">
                {href ? (
                    <Link href={href} className="ll3-memberRow__action">
                        View profile <span aria-hidden="true">→</span>
                    </Link>
                ) : (
                    <span className="ll3-memberRow__action ll3-memberRow__action--disabled">
                        Seat vacant
                    </span>
                )}
            </div>
        </div>
    );
}