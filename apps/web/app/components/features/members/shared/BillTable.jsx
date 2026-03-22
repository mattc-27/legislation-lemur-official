"use client";
import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Banknote,
    BookOpen,
    Briefcase,
    Building2,
    Car,
    DollarSign,
    Feather,
    Flag,
    Gavel,
    Globe,
    GraduationCap,
    HandHeart,
    HeartPulse,
    Landmark,
    Leaf,
    Megaphone,
    PawPrint,
    Scale,
    Shield,
    Sprout,
    Tractor,
    Trees,
    Users,
    Waves,
} from "lucide-react";
import { getCongressBillUrl } from "@/lib/utils/getCongressBillUrl";

const PALETTE = ["#6366F1", "#22C55E", "#F59E0B", "#06B6D4", "#F43F5E", "#10B981", "#A78BFA", "#FB7185"];

const TOPIC_META = {
    "Agriculture and Food": { short: "Ag & food", icon: Tractor },
    Animals: { short: "Animals", icon: PawPrint },
    "Armed Forces and National Security": { short: "Defense", icon: Shield },
    "Arts, Culture, Religion": { short: "Arts & culture", icon: Feather },
    "Civil Rights and Liberties, Minority Issues": { short: "Civil rights", icon: Scale },
    Commerce: { short: "Commerce", icon: Briefcase },
    Congress: { short: "Congress", icon: Landmark },
    "Crime and Law Enforcement": { short: "Crime", icon: Gavel },
    "Economics and Public Finance": { short: "Econ & finance", icon: DollarSign },
    Education: { short: "Education", icon: GraduationCap },
    Energy: { short: "Energy", icon: AlertTriangle },
    "Environmental Protection": { short: "Environment", icon: Leaf },
    Families: { short: "Families", icon: Users },
    "Finance and Financial Sector": { short: "Finance", icon: Banknote },
    "Foreign Trade and International Finance": { short: "Trade", icon: Globe },
    "Government Operations and Politics": { short: "Gov ops", icon: Building2 },
    Health: { short: "Health", icon: HeartPulse },
    Immigration: { short: "Immigration", icon: Flag },
    "International Affairs": { short: "Intl affairs", icon: Globe },
    "Labor and Employment": { short: "Labor", icon: Briefcase },
    "Native Americans": { short: "Native affairs", icon: Sprout },
    "Public Lands and Natural Resources": { short: "Public lands", icon: Trees },
    "Science, Technology, Communications": { short: "Sci / tech", icon: Megaphone },
    "Social Welfare": { short: "Social welfare", icon: HandHeart },
    Taxation: { short: "Taxation", icon: BookOpen },
    "Transportation and Public Works": { short: "Transport", icon: Car },
    Uncategorized: { short: "Other", icon: Waves },
};

const normSubject = (s) => (typeof s === "string" ? s : s?.name || s?.title || s?.subject || "Uncategorized");
const pick = (obj, keys) => keys.map((k) => obj?.[k]).find((v) => v != null);

function getTopicMeta(label = "") {
    return TOPIC_META[label] || { short: label || "Other", icon: BookOpen };
}

export default function BillTable({ groups = [], maxHeight = 420, selectedTopic }) {
    const rows = useMemo(() => {
        const out = [];
        for (const g of groups || []) {
            const subject = normSubject(g?.subject);
            for (const it of g?.items || []) {
                const id = pick(it, ["id", "bill_id", "href", "url", "title"]) || cryptoRandomId();
                const title = pick(it, ["title", "displayTitle", "displayyTitle", "id"]) || String(id);
                const type = (it?.type ? String(it.type).toUpperCase() : "") || "";
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
                }
                const ta = a.date ? a.date.getTime() : -Infinity;
                const tb = b.date ? b.date.getTime() : -Infinity;
                const cmp = ta - tb;
                return sortDir === "asc" ? cmp : -cmp;
            });
    }, [rows, subject, sortKey, sortDir, from, to]);

    function toggleSort(nextKey) {
        if (sortKey === nextKey) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
            return;
        }
        setSortKey(nextKey);
        setSortDir(nextKey === "subject" ? "asc" : "desc");
    }

    return (
        <section className="billtable">
            <div className="billtable__sectionHead">
                <h3 className="billtable__sectionTitle">Recently cosponsored bills</h3>
            </div>

            <div className="billtable__block">
                <p className="billtable__eyebrow">Bill list</p>

                <div className="billtable__controls" role="toolbar" aria-label="Bill table filters">
                    <div className="billtable__control">
                        <label className="billtable__label" htmlFor="billtable-topic">Topic</label>
                        <select
                            id="billtable-topic"
                            className="field"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            aria-label="Topic"
                        >
                            {allSubjects.map((s) => (
                                <option key={s} value={s}>
                                    {s === "All" ? "All topics" : s}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="billtable__control">
                        <label className="billtable__label" htmlFor="billtable-from">From</label>
                        <input
                            id="billtable-from"
                            className="field"
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>

                    <div className="billtable__control">
                        <label className="billtable__label" htmlFor="billtable-to">To</label>
                        <input
                            id="billtable-to"
                            className="field"
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                </div>

                <div className="billtable__scroller" style={{ maxHeight, overflow: "auto" }}>
                    <table className="billtable__table">
                        <thead>
                            <tr>
                                <th style={{ width: "56%" }}>Title</th>
                                <th
                                    className="sortable"
                                    style={{ width: "12%" }}
                                >
                                    <button
                                        type="button"
                                        className="billtable__sortBtn"
                                        onClick={() => toggleSort("subject")}
                                        aria-label={`Sort by topic ${sortKey === "subject" && sortDir === "asc" ? "descending" : "ascending"}`}
                                    >
                                        <span>Topic</span>
                                        <span className="billtable__sortIcon">{sortKey === "subject" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</span>
                                    </button>
                                </th>
                                <th
                                    className="sortable"
                                    style={{ width: "32%" }}
                                >
                                    <button
                                        type="button"
                                        className="billtable__sortBtn"
                                        onClick={() => toggleSort("date")}
                                        aria-label={`Sort by date ${sortKey === "date" && sortDir === "desc" ? "ascending" : "descending"}`}
                                    >
                                        <span>Details</span>
                                        <span className="billtable__sortIcon">{sortKey === "date" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</span>
                                    </button>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((r) => {
                                const badge = computeBadge({ kinds: r.kinds });
                                const swatch = colorMap.get(r.subject);
                                const topicMeta = getTopicMeta(r.subject);
                                const Icon = topicMeta.icon;

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
                                                <span title={r.title}>{r.title}</span>
                                            )}
                                        </td>

                                        <td className="billtable__cell--topic" title={r.subject}>
                                            <Icon
                                                className="billtable__topicIcon"
                                                size={16}
                                                strokeWidth={2}
                                                aria-hidden="true"
                                                style={{ color: swatch }}
                                            />
                                        </td>

                                        <td className="billtable__cell--details">
                                            <div className="billtable__detailsStack">
                                                <div className="billtable__detailsMain">
                                                    <div className="billtable__detailsType">{r.type || "—"}</div>
                                                    <div className="billtable__detailsDate">
                                                        {r.date ? r.date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : r.dateRaw || "—"}
                                                    </div>
                                                </div>

                                                <div className="billtable__detailsBadge">
                                                    {badge && (
                                                        <span className={`chip ${badge.className}`} title={badge.title}>
                                                            {badge.text}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="billtable__empty">No bills match your filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

function resolveLink(it) {
    const raw = it?.href || it?.url || "";
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
function endOfDay(d) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
}
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
    try {
        return crypto.randomUUID();
    } catch {
        return Math.random().toString(36).slice(2);
    }
}