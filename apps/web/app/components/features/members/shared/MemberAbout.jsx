"use client";

import React from "react";
import { BadgeCheck, History, Landmark, MapPin } from "lucide-react";

function isHouse(chamber) {
  return chamber === "House" || chamber === "House of Representatives";
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MemberAbout({ profile, mode = "page" }) {
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
    isCurrent,
    serviceEndDate,
    serviceEndDateBasis,
    serviceEndYear,
    seatCurrentlyVacant,
  } = profile;

  const stateLabel = state || stateCode;
  const houseMember = isHouse(chamber);
  const districtLabel = houseMember
    ? district == null || district === 0 || district === "AL"
      ? "At-large"
      : `District ${district}`
    : null;
  const partyTone = party === "D" ? "D" : party === "R" ? "R" : "I";
  const serviceEndIsAuthoritative = String(serviceEndDateBasis || "").startsWith(
    "house_districts_",
  );
  const endLabel = serviceEndIsAuthoritative
    ? formatDate(serviceEndDate) || serviceEndYear || null
    : serviceEndYear || null;
  const departureRecordedLabel =
    !serviceEndIsAuthoritative && serviceEndDate
      ? formatDate(serviceEndDate)
      : null;

  return (
    <section className={`llmp3-card llmp3-card--hero llmp3-aboutCard llmp3-aboutCard--${mode}`} data-view-mode={mode}>
      <div className="llmp3-aboutCard__top">
        <div className="llmp3-head__avatar llmp3-aboutCard__avatar">
          {imageUrl ? (
            <img src={imageUrl} alt={name} width={88} height={88} />
          ) : (
            <div className="llmp3-head__ph" aria-hidden="true">{initials(name)}</div>
          )}
        </div>

        <div className="llmp3-aboutCard__main">
          <div className="llmp3-aboutCard__identity">
            <h1 className="llmp3-aboutCard__name">{name}</h1>
            <span className={`llmp3-badge llmp3-badge--party-${partyTone}`}>
              <BadgeCheck size={14} aria-hidden="true" />
              {partyName}
            </span>
            {!isCurrent ? (
              <span className="llmp3-badge llmp3-badge--former">
                <History size={14} aria-hidden="true" />
                Former member
              </span>
            ) : null}
          </div>

          <div className="llmp3-aboutCard__meta">
            <span className="llmp3-kv">
              <Landmark size={14} aria-hidden="true" />
              <span className="llmp3-kv__label">Chamber</span>
              <span className="llmp3-kv__value">{houseMember ? "House of Representatives" : chamber}</span>
            </span>
            <span className="llmp3-kv">
              <MapPin size={14} aria-hidden="true" />
              <span className="llmp3-kv__label">State</span>
              <span className="llmp3-kv__value">{stateLabel}</span>
            </span>
            {districtLabel ? (
              <span className="llmp3-kv">
                <span className="llmp3-kv__label">District</span>
                <span className="llmp3-kv__value">{districtLabel}</span>
              </span>
            ) : null}
            {servingSince ? (
              <span className="llmp3-kv">
                <span className="llmp3-kv__label">{isCurrent ? "Serving since" : "Service began"}</span>
                <span className="llmp3-kv__value">{servingSince}</span>
              </span>
            ) : null}
            {!isCurrent ? (
              <span className="llmp3-kv">
                <span className="llmp3-kv__label">Status</span>
                <span className="llmp3-kv__value">No longer serving</span>
              </span>
            ) : null}
            {!isCurrent && endLabel ? (
              <span className="llmp3-kv">
                <span className="llmp3-kv__label">Service ended</span>
                <span className="llmp3-kv__value">{endLabel}</span>
              </span>
            ) : null}
            {!isCurrent && departureRecordedLabel ? (
              <span className="llmp3-kv">
                <span className="llmp3-kv__label">Departure recorded</span>
                <span className="llmp3-kv__value">{departureRecordedLabel}</span>
              </span>
            ) : null}
            {!isCurrent && houseMember && seatCurrentlyVacant ? (
              <span className="llmp3-kv llmp3-kv--vacant">
                <span className="llmp3-kv__label">Seat status</span>
                <span className="llmp3-kv__value">Currently vacant</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <p className="llmp3-aboutCard__blurb">{about}</p>
    </section>
  );
}

function initials(name = "") {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
