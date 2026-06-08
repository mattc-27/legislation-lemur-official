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
  if (m?.chamber === "Senate") return m?.stateCode || m?.state || "";

  const district = Number(m?.district);
  const stateCode = m?.stateCode || m?.state || "";
  if (Number.isFinite(district)) {
    if (district === 0) return `${stateCode}-AL`;
    return `${stateCode}-${district}`;
  }

  return stateCode;
}

export default function MemberDirectoryRow({ m }) {
  const isVacant = Boolean(m?.isVacant || m?.seatStatus === "vacant");
  const href = !isVacant && (m?.bioguideId || m?.id) ? `/member/${m.bioguideId || m.id}` : null;
  const label = partyLabel(m?.party, isVacant);
  const className = partyClass(m?.party, isVacant);
  const district = districtLabel(m);

  return (
    <div className={`ll3-memberRow ${isVacant ? "is-vacant" : ""}`}>
      <div className="ll3-memberRow__nameCell">
        <span className={`ll3-memberRow__partyDot ${className}`} aria-label={label} title={label} />

        <div className="ll3-memberRow__identity">
          {href ? (
            <Link href={href} className="ll3-memberRow__nameLink">
              {m.name}
            </Link>
          ) : (
            <span className="ll3-memberRow__nameLink ll3-memberRow__nameLink--disabled">Vacant seat</span>
          )}

          <div className="ll3-memberRow__mobileMeta">
            <span className={className}>{label}</span>
            <span className="ll3-metaSep">•</span>
            <span>{district}</span>
          </div>
        </div>
      </div>

      <div className={`ll3-memberRow__party ${className}`}>{label}</div>
      <div className="ll3-memberRow__district">{district}</div>

      <div className="ll3-memberRow__actionCell">
        {href ? (
          <Link href={href} className="ll3-memberRow__action" aria-label={`View profile for ${m.name}`}>
            <span className="ll3-memberRow__actionText">View profile</span>
            <span aria-hidden="true" className="ll3-memberRow__actionArrow">→</span>
          </Link>
        ) : (
          <span className="ll3-memberRow__action ll3-memberRow__action--disabled">Seat vacant</span>
        )}
      </div>
    </div>
  );
}
