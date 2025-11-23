// components/member/BillList.jsx
"use client";
import { useState } from "react";
import { getCongressBillUrl } from "@/lib/utils/getCongressBillUrl";

export default function BillList({ groups = [] }) {
    const [open, setOpen] = useState(() => new Set());
    const toggle = (key) => {
        const next = new Set(open);
        next.has(key) ? next.delete(key) : next.add(key);
        setOpen(next);
    };
    const expandAll = () => setOpen(new Set(groups.map((g) => g.subject || "")));
    const collapseAll = () => setOpen(new Set());

    return (
        <section>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <button className="btn btn--ghost" type="button" onClick={expandAll}>Expand all</button>
                <button className="btn btn--ghost" type="button" onClick={collapseAll}>Collapse all</button>
            </div>

            {groups.map((g, i) => {
                const key = g.subject || `group-${i}`;
                const isOpen = open.has(key);

                return (
                    <div key={key} className="billlist__group" style={{ marginBottom: 8 }}>
                        <div
                            className="billlist__summary"
                            role="button"
                            tabIndex={0}
                            aria-expanded={isOpen}
                            aria-controls={`billlist-panel-${i}`}
                            onClick={() => toggle(key)}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle(key)}
                        >
                            <span className="billlist__subject">{g.subject}</span>
                            <span className="chip">{g.count}</span>
                        </div>

                        {isOpen && (
                            <ul id={`billlist-panel-${i}`} className="billlist__items">
                                {g.items.map((it) => {
                                    const badge = computeBadge(it);

                                    const raw = it.href || it.url || "";
                                    const publicUrl = getCongressBillUrl(raw);
                                    const link = publicUrl ?? it.appHref ?? it.href ?? it.url ?? "#";
                                    return (
                                        <li key={it.id || it.href || it.title} className="billlist__item billcard">
                                            <div className="billcard__top">
                                                <a
                                                    className="billlist__link"
                                                    href={link}
                                                    target={publicUrl ? "_blank" : undefined}
                                                    rel={publicUrl ? "noopener noreferrer" : undefined}
                                                >

                                                    {it.title || it.displayyTitle || it.id}
                                                </a>
                                                {badge && (
                                                    <span className={`chip ${badge.className}`} title={badge.title} aria-label={badge.title}>
                                                        {badge.text}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="billlist__meta">
                                                {it.type ? it.type.toUpperCase() : ""}{it.type && it.introducedAt ? " • " : ""}
                                                {it.introducedAt ? `Introduced ${fmtDate(it.introducedAt)}` : ""}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                );
            })}

            <style jsx>{`
        .billlist__summary {
          display:flex; align-items:center; justify-content:space-between;
          padding:10px 12px; border-radius:10px; cursor:pointer;
          background: var(--surface-2, #f8fafc);
          border: 1px solid var(--line-1, #e5e7eb);
        }
        .billlist__subject { font-weight:600; }
        .billlist__items { list-style:none; padding:0; margin:10px 0 0; display:grid; gap:8px; }
        .billcard {
          border:1px solid var(--line-1, #e5e7eb);
          border-radius:12px; padding:12px; background:#fff;
          transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
        }
        .billcard:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,.06); border-color: #d1d5db; }
        .billcard__top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
        .billlist__link { font-weight:600; text-decoration:none; }
        .billlist__meta { color:#64748b; font-size: 12px; margin-top:6px; }

        .chip { padding:2px 6px; border-radius:999px; font-size:12px; line-height:1.25; }
        .chip--s { background:#EEF0FF; color:#3730A3; border:1px solid #C7D2FE; }
        .chip--c { background:#F1F5F9; color:#334155; border:1px solid #E2E8F0; }
        .chip--mix { background:#ECFEFF; color:#155E75; border:1px solid #BAE6FD; }
      `}</style>
        </section>
    );
}

function computeBadge(it = {}) {
    // normalize; support `kinds` (array), `kind` (string), or `__kind` (string)
    const kinds = Array.isArray(it.kinds)
        ? it.kinds
        : it.kind
            ? [it.kind]
            : it.__kind
                ? [it.__kind]
                : [];

    const set = new Set(kinds.map(k => String(k).toLowerCase()));
    const isS = set.has("s") || set.has("sponsored");
    const isC = set.has("c") || set.has("cosponsored") || set.has("co-sponsored") || set.has("co_sponsored");

    if (isS && isC) return { text: "S+C", className: "chip--mix", title: "Sponsored and co-sponsored" };
    if (isS) return { text: "S", className: "chip--s", title: "Sponsored" };
    if (isC) return { text: "C", className: "chip--c", title: "Co-sponsored" };
    return null;
}

function fmtDate(d) {
    try { return new Date(d).toLocaleDateString(); } catch { return d; }
}
