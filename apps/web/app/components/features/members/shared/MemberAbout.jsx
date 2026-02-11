// components/member/MemberAbout.jsx
"use client";
import React from "react";
import { MapPin, Landmark, Flag, BadgeCheck } from "lucide-react";
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

  const partyTone = party === "D" ? "D" : party === "R" ? "R" : "I";
  return (
    <section className="llmp3-card llmp3-card--hero">
      <div className="llmp3-head">
        <div className="llmp3-head__avatar">
          {imageUrl ? (
            <img src={imageUrl} alt={name} width={84} height={84} />
          ) : (
            <div className="llmp3-head__ph" aria-hidden="true">
              {initials(name)}
            </div>
          )}
        </div>

        <div className="llmp3-head__main">
          <h1 className="llmp3-h1">{name}</h1>

          <div className="llmp3-meta">
            <span className={`llmp3-badge llmp3-badge--party-${partyTone}`}>
              <BadgeCheck size={14} aria-hidden="true" />
              {partyName}
            </span>

            <span className="llmp3-kv">
              <Landmark size={14} aria-hidden="true" />
              <span className="llmp3-kv__label">Chamber</span>
              <span className="llmp3-kv__value">{chamber}</span>
            </span>

            <span className="llmp3-kv">
              <MapPin size={14} aria-hidden="true" />
              <span className="llmp3-kv__label">State</span>
              <span className="llmp3-kv__value">{stateLabel}</span>
            </span>

            {chamber === "House" && (
              <span className="llmp3-kv">
                <Flag size={14} aria-hidden="true" />
                <span className="llmp3-kv__label">District</span>
                <span className="llmp3-kv__value">{district}</span>
              </span>
            )}

            {servingSince && (
              <span className="llmp3-kv">
                <span className="llmp3-kv__label">Serving since</span>
                <span className="llmp3-kv__value">{servingSince}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="llmp3-blurb">{bio}</p>
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
