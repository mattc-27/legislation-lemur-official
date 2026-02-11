"use client";
import { useEffect, useMemo, useState } from "react";
import { getCongressBillUrl } from "@/lib/utils/getCongressBillUrl";

const PALETTE = ["#6366F1", "#22C55E", "#F59E0B", "#06B6D4", "#F43F5E", "#10B981", "#A78BFA", "#FB7185"];

const normSubject = (s) => (typeof s === "string" ? s : s?.name || s?.title || s?.subject || "Uncategorized");
const pick = (obj, keys) => keys.map((k) => obj?.[k]).find((v) => v != null);

export default function BillTable({ groups = [], maxHeight = 420, selectedTopic }) {
    // ---------- derive rows from groups ----------
    const rows = useMemo(() => {
        const out = [];
        for (const g of groups || []) {
            const subject = normSubject(g?.subject);
            for (const it of g?.items || []) {
                const id = pick(it, ["id", "bill_id", "href", "url", "title"]) || cryptoRandomId();
                const title = pick(it, ["title", "displayTitle", "displayyTitle", "id"]) || String(id);
                const type = (it?.type ? String(it.type).toUpperCase() : "") || "";
                // accept introducedAt, introduced_date, or last action date
                const introducedAt = pick(it, ["introducedAt", "introduced_date", "latest_action_date"]);
                const date = introducedAt ? new Date(introducedAt) : null;
                const kinds = Array.isArray(it?.kinds) ? it.kinds : [it?.kind ?? it?.__kind].filter(Boolean);
                const href = resolveLink(it);
                out.push({ subject, id, title, type, date, dateRaw: introducedAt ?? it?.date, kinds, href });
            }
        }
        return out;
    }, [groups]);

    const colorMap = useMemo(() => buildColorMap(groups), [groups]);

    // ---------- controls ----------
    const [subject, setSubject] = useState("All");
    const [sortKey, setSortKey] = useState("date");
    const [sortDir, setSortDir] = useState("desc");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    useEffect(() => {
        if (selectedTopic) setSubject(selectedTopic);
    }, [selectedTopic]);

    const allSubjects = useMemo(
        () => ["All", ...Array.from(new Set((groups || []).map((g) => normSubject(g.subject)).filter(Boolean))).sort()],
        [groups]
    );

    const filtered = useMemo(() => {
        const fFrom = from ? new Date(from) : null;
        const fTo = to ? new Date(to) : null;
        return rows
            .filter((r) => (subject === "All" ? true : r.subject === subject))
            .filter((r) => (fFrom ? (r.date ? r.date >= fFrom : false) : true))
            .filter((r) => (fTo ? (r.date ? r.date <= endOfDay(fTo) : false) : true))
            .sort((a, b) => {
                if (sortKey === "subject") {
                    const cmp = a.subject.localeCompare(b.subject);
                    return sortDir === "asc" ? cmp : -cmp;
                } else {
                    const ta = a.date ? a.date.getTime() : -Infinity;
                    const tb = b.date ? b.date.getTime() : -Infinity;
                    const cmp = ta - tb;
                    return sortDir === "asc" ? cmp : -cmp;
                }
            });
    }, [rows, subject, sortKey, sortDir, from, to]);

    const flipDir = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));

    return (
        <section className="billtable">
            {/* Controls */}
            <div className="billtable__controls" role="toolbar" aria-label="Bill table filters">
                <select className="field field--sm" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Topic">
                    {allSubjects.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>

                <div className="dategroup">
                    <label className="sr-only" htmlFor="from">From</label>
                    <input id="from" className="field field--sm" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                    <span className="dash">–</span>
                    <label className="sr-only" htmlFor="to">To</label>
                    <input id="to" className="field field--sm" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>

                <div className="sortgroup">
                    <select className="field field--sm" value={sortKey} onChange={(e) => setSortKey(e.target.value)} aria-label="Sort by">
                        <option value="date">Date</option>
                        <option value="subject">Topic</option>
                    </select>
                    <button className="btn btn--ghost btn--sm" type="button" onClick={flipDir} aria-label="Toggle sort direction">
                        {sortDir === "asc" ? "↑" : "↓"}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="billtable__scroller" style={{ maxHeight, overflow: "auto" }}>
                <table className="billtable__table">
                    <thead>
                        <tr>
                            <th style={{ width: "34%" }}>Title</th>
                            <th style={{ width: "28%" }}>Topic</th>
                            <th style={{ width: "10%" }}>Type</th>
                            <th style={{ width: "16%" }}>Intro. date</th>
                            <th style={{ width: "6%" }} aria-label="Sponsorship badge">S/C</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((r) => {
                            const badge = computeBadge({ kinds: r.kinds });
                            const swatch = colorMap.get(r.subject);
                            return (
                                <tr key={r.id} className="billtable__row">
                                    <td className="billtable__cell--title">
                                        {r.href ? (
                                            <a
                                                href={r.href.url}
                                                target={r.href.isExternal ? "_blank" : undefined}
                                                rel={r.href.isExternal ? "noopener noreferrer" : undefined}
                                                className="billlink"
                                                title={r.title}
                                            >
                                                {r.title}
                                            </a>
                                        ) : (
                                            r.title
                                        )}
                                    </td>
                                    <td className="billtable__cell--topic">
                                        <i className="swatch" style={{ background: swatch }} />
                                        {r.subject}
                                    </td>
                                    <td>{r.type}</td>
                                    <td>{r.date ? r.date.toLocaleDateString() : r.dateRaw || "—"}</td>
                                    <td>{badge && <span className={`chip ${badge.className}`} title={badge.title}>{badge.text}</span>}</td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="billtable__empty">No bills match your filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
  .billtable { display: flex; flex-direction: column; gap: 8px; }
  .billtable__controls {
    display: grid;
    grid-auto-flow: column;
    gap: 6px;
    align-items: center;
    justify-content: start;
    overflow-x: auto;
    padding-bottom: 2px;
  }
  .ctl {
    font: inherit;
    line-height: 1.2;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid var(--line-1, #e5e7eb);
    background: var(--surface-1, #fff);
    min-width: 110px;
  }
  .ctl--sm { padding: 6px 8px; border-radius: 8px; min-width: 100px; }
  .dategroup { display: inline-flex; align-items: center; gap: 6px; }
  .dash { opacity: .6; }
  .sortgroup { display: inline-flex; align-items: center; gap: 6px; }
  .btn--sm { padding: 4px 8px; border-radius: 8px; }
  .billtable__scroller {
    border: 1px solid var(--line-1, #e5e7eb);
    border-radius: 12px;
    background: #fff;
  }
  .billtable__table { width: 100%; border-collapse: separate; border-spacing: 0; }
  thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #f8fafc;
    text-align: left;
    font-weight: 600;
    padding: 10px 12px;
    border-bottom: 1px solid #e5e7eb;
    letter-spacing: .02em;
    text-transform: uppercase;
    font-size: 12px;
  }
  tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }
  .billtable__row:hover td { background: #fafafa; }
  .billtable__cell--title { font-weight: 600; }
  .billtable__cell--topic { display: inline-flex; align-items: center; gap: 8px; }
  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    display: inline-block;
    box-shadow: 0 0 0 1px #e5e7eb inset;
  }
  .billlink { text-decoration: none; }
  .billtable__empty { text-align: center; color: #64748b; padding: 24px; }
  .chip {
    padding: 2px 6px;
    border-radius: 999px;
    font-size: 12px;
    line-height: 1.25;
  }
  .chip--s { background: #EEF0FF; color: #3730A3; border: 1px solid #C7D2FE; }
  .chip--c { background: #F1F5F9; color: #334155; border: 1px solid #E2E8F0; }
  .chip--mix { background: #ECFEFF; color: #155E75; border: 1px solid #BAE6FD; }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    border: 0;
  }

  /* ---------- mobile tweaks ---------- */
  @media (max-width: 640px) {
    .billtable__controls {
      grid-auto-flow: row;
      grid-template-columns: 1fr;
      align-items: stretch;
    }

    .ctl,
    .ctl--sm {
      min-width: 0;
      width: 100%;
    }

    .dategroup,
    .sortgroup {
      width: 100%;
      justify-content: flex-start;
    }

    thead th {
      font-size: 11px;
      padding: 8px 10px;
    }

    tbody td {
      padding: 8px 10px;
      font-size: 13px;
    }

    .billtable__cell--topic {
      max-width: 140px;
    }
  }
`}</style>

        </section>
    );
}

// ---------- helpers ----------
function resolveLink(it) {
    const raw = it?.href || it?.url || ""; // same precedence as BillList
    const publicUrl = getCongressBillUrl(raw);
    const url = publicUrl ?? it?.appHref ?? it?.href ?? it?.url ?? "#";
    const isExternal = Boolean(publicUrl);
    return { url, isExternal };
}
function computeBadge(it = {}) {
    const kinds = Array.isArray(it.kinds) ? it.kinds : [it?.kind ?? it?.__kind].filter(Boolean);
    const set = new Set(kinds.map((k) => String(k).toLowerCase()));
    const isS = set.has("s") || set.has("sponsored");
    const isC = set.has("c") || set.has("cosponsored") || set.has("co-sponsored") || set.has("co_sponsored");
    if (isS && isC) return { text: "S+C", className: "chip--mix", title: "Sponsored and co-sponsored" };
    if (isS) return { text: "S", className: "chip--s", title: "Sponsored" };
    if (isC) return { text: "C", className: "chip--c", title: "Co-sponsored" };
    return null;
}
function endOfDay(d) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; }
function buildColorMap(groups = []) {
    const counts = new Map();
    for (const g of groups) {
        const key = normSubject(g?.subject);
        const inc = Array.isArray(g?.items) ? g.items.length : Number(g?.count) || 0;
        counts.set(key, (counts.get(key) || 0) + inc);
    }
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const map = new Map();
    sorted.forEach(([label], i) => map.set(label, PALETTE[i % PALETTE.length]));
    return map;
}
function cryptoRandomId() {
    try { return crypto.randomUUID(); } catch { return Math.random().toString(36).slice(2); }
}
