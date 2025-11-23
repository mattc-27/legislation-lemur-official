// components/member/MemberHeader.jsx
export default function MemberHeader({ m }) {
  // Prefer any image key the JSON may provide
  const photo =
    m.photoUrl ||
    m.imageUrl ||
    m.depiction?.imageUrl ||
    null;

  const partyText =
    m.partyLabel ||
    m.partyName ||
    (m.party === "D" ? "Democrat" : m.party === "R" ? "Republican" : "Independent");

  const loc = `${m.state || m.stateCode || ""}${m.district ? `-${m.district}` : ""}`;

  return (
    <header className="member-h card card--p-24">
      <div className="member-h__grid">
        <div className="member-h__avatar">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={`${m.name} portrait`} />
          ) : (
            <div className="member-h__avatar--ph" aria-hidden>
              👤
            </div>
          )}
        </div>

        <div className="member-h__main">
          <h1 className="member-h__name">{m.name}</h1>
          <div className="member-h__meta">
            <span className={`badge ${badgeForParty(m.party)}`}>{partyText}</span>
            {m.chamber && <span className="badge badge--muted">{m.chamber}</span>}
            {loc && <span className="member-h__loc">{loc}</span>}
          </div>

          {m.committees?.length ? (
            <div className="member-h__committees">
              {m.committees.slice(0, 3).map((c) => (
                <span key={c.code || c.name} className="chip">
                  {c.name}
                </span>
              ))}
              {m.committees.length > 3 && (
                <span className="chip">+{m.committees.length - 3} more</span>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function badgeForParty(p) {
  if (p === "D") return "badge--blue";
  if (p === "R") return "badge--red";
  return "badge--slate";
}
