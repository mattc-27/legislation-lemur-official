// components/search/InfoStatCard.jsx
"use client";

import * as React from "react";

export default function InfoStatCard({
  title,
  primary,
  meta = [],
  footnote,
  icon,
  accent = "slate", // 'blue' | 'red' | 'green' | 'slate'
}) {
  const accentClass = {
    blue: "isc--blue",
    red: "isc--red",
    green: "isc--green",
    slate: "isc--slate",
  }[accent] || "isc--slate";

  return (
    <section className={`isc ${accentClass}`} aria-label={title}>
      <header className="isc__head">
        <div className="isc__icon" aria-hidden="true">
          {icon}
        </div>
        <h3 className="isc__title">{title}</h3>
      </header>

      <div className="isc__primary" data-testid="primary">
        {Number(primary).toLocaleString()}
      </div>

      {meta?.length > 0 && (
        <div className="isc__meta">
          {meta.map((m) => (
            <span key={m.label} className={`isc__chip ${m.tone ? `tone-${m.tone}` : ""}`}>
              <b>{m.value}</b>
              <span>{m.label}</span>
            </span>
          ))}
        </div>
      )}

      {footnote && <footer className="isc__foot">{footnote}</footer>}
    </section>
  );
}
