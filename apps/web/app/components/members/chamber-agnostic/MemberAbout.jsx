// components/member/MemberAbout.jsx
"use client";
import React from "react";

export default function MemberAbout({ profile }) {
  if (!profile) return null;
  const {
    name,
    party,
    partyName,
    chamber,
    state,
    stateCode,
    district,
    imageUrl,
    about,
    servingSince,
  } = profile;

  const stateLabel = state || stateCode;
  const distText =
    chamber === "House"
      ? district == null || district === 0 || district === "AL"
        ? "at-large district"
        : `${ordinal(+district)} district`
      : null;

  const fallback =
    chamber === "House"
      ? `${name} is a ${partyName} member of the U.S. House representing ${stateLabel}’s ${distText}${servingSince ? ` since ${servingSince}` : ""
      }.`
      : `${name} is a ${partyName} U.S. senator for ${stateLabel}${servingSince ? ` since ${servingSince}` : ""
      }.`;

  const bio = about || fallback;

  const partyClass =
    party === "D" ? "chip chip--party-D" : party === "R" ? "chip chip--party-R" : "chip chip--party-I";

  return (
    <section className="member-section">
      <div style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: "1rem", alignItems: "center" }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            width={72}
            height={72}
            style={{ borderRadius: "12px", objectFit: "cover", boxShadow: "0 1px 2px rgba(0,0,0,.08)" }}
          />
        ) : (
          <div
            aria-hidden
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              background: "#f3f4f6",
              display: "grid",
              placeItems: "center",
              color: "#9ca3af",
              fontWeight: 700,
            }}
          >
            {initials(name)}
          </div>
        )}

        <div>
          <h1 className="text-xl font-semibold leading-tight">{name}</h1>
          <div className="kv" style={{ marginTop: ".35rem" }}>
            <span className={partyClass}>{partyName}</span>
            <span className="kv__item"><span className="kv__label">Chamber:</span>{chamber}</span>
            <span className="kv__item"><span className="kv__label">State:</span>{stateLabel}</span>
            {chamber === "House" && (
              <span className="kv__item">
                <span className="kv__label">District:</span>
                {district}
              </span>
            )}
            {servingSince && (
              <span className="kv__item"><span className="kv__label">Serving since:</span>{servingSince}</span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-700">{bio}</p>
    </section>
  );
}

function ordinal(n) {
  if (Number.isNaN(n)) return `${n}`;
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function initials(name = "") {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
