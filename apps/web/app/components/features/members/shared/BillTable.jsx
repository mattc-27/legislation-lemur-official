"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { getCongressBillUrl } from "@/lib/utils/getCongressBillUrl";
import {
    getTopicMeta,
    getTopicColor,
    normalizeTopicLabel,
} from "@/lib/utils/member-info-topics";

const pick = (obj, keys) => keys.map((k) => obj?.[k]).find((v) => v != null);

export default function BillTable({
    groups = [],
    maxHeight = 520,
    selectedTopic,
    mode = "page",
    initialLimit = 8,
    pageSize = 8,
}) {
    const rows = useMemo(() => {
        const out = [];

        for (const g of groups || []) {
            const subject = normalizeTopicLabel(g?.subject);

            for (const it of g?.items || []) {
                const billId = pick(it, ["bill_id", "id"]);
                const id = billId || pick(it, ["href", "url", "title"]) || cryptoRandomId();
                const title = pick(it, ["displayTitle", "display_title", "title", "displayyTitle", "id"]) || String(id);
                const type = (pick(it, ["type", "bill_type"]) ? String(pick(it, ["type", "bill_type"])).toUpperCase() : "") || "";
                const sortDateRaw = pick(it, ["latestActionDate", "latest_action_date", "introducedAt", "introduced_date", "date"]);
                const date = sortDateRaw ? new Date(sortDateRaw) : null;
                const introducedRaw = pick(it, ["introducedAt", "introduced_date"]);
                const kinds = normalizeKinds(it);

                const links = resolveLinks(it, billId);

                const keyActions = normalizeKeyActions(pick(it, ["keyActions", "key_actions"]));

                out.push({
                    subject,
                    id,
                    billId,
                    title,
                    type,
                    number: pick(it, ["number", "bill_number"]),
                    statusLabel: pick(it, ["statusLabel", "status_label", "statusKey", "status_key"]),
                    latestActionText: pick(it, ["latestActionText", "latest_action_text"]),
                    date,
                    dateRaw: sortDateRaw,
                    introducedRaw,
                    kinds,
                    links,
                    summaryShort: pick(it, ["summaryShort", "summary_short"]),
                    summaryTextPlain: pick(it, ["summaryTextPlain", "summary_text_plain"]),
                    keyActions,
                    hasAiSummary: Boolean(pick(it, ["hasAiSummary", "has_ai_summary"])),
                    cosponsorsTotal: pick(it, ["cosponsorsTotal", "cosponsors_total", "cosponsorCount", "cosponsor_count"]),
                });
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
    const [visibleLimit, setVisibleLimit] = useState(initialLimit);
    useEffect(() => {
        if (selectedTopic) setSubject(selectedTopic);
    }, [selectedTopic]);

    const allSubjects = useMemo(
        () => [
            "All",
            ...Array.from(new Set((groups || []).map((g) => normalizeTopicLabel(g?.subject)).filter(Boolean))).sort(),
        ],
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


    useEffect(() => {
        setVisibleLimit(initialLimit);
    }, [initialLimit, subject, from, to, sortKey, sortDir, selectedTopic]);

    function toggleSort(nextKey) {
        if (sortKey === nextKey) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
            return;
        }
        setSortKey(nextKey);
        setSortDir(nextKey === "subject" ? "asc" : "desc");
    }

    const isPanel = mode === "panel";

    const visibleRows = isPanel ? filtered.slice(0, visibleLimit) : filtered;
    const hasMore = isPanel && filtered.length > visibleLimit;

    function showMore() {
        setVisibleLimit((n) => Math.min(filtered.length, n + pageSize));
    }

    function showFewer() {
        setVisibleLimit(initialLimit);
    }

    return (
        <section className={`billtable billtable--enriched ${isPanel ? "billtable--panel" : ""}`}>
            <div className="billtable__sectionHead">
                <h3 className="billtable__sectionTitle">Recent bill activity</h3>
                <p className="billtable__sectionSub">Open bills inside Legislation Lemur, with Congress.gov available as the source link.</p>
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

                {isPanel ? (
                    <>
                        <div className="billtable__cards" aria-label="Filtered bills">
                            {visibleRows.map((r) => {
                                const badge = computeBadge({ kinds: r.kinds });
                                const swatch = colorMap.get(r.subject);
                                const topicMeta = getTopicMeta(r.subject);
                                const Icon = topicMeta.icon;
                                const summary = r.summaryShort || r.summaryTextPlain;

                                return (
                                    <article key={`${r.id}-${r.kinds.join("-")}`} className="billtableCard">
                                        <div className="billtableCard__top">
                                            <div className="billtableCard__titleWrap">
                                                {r.links.appUrl ? (
                                                    <Link href={r.links.appUrl} className="billtableCard__title" title={r.title}>
                                                        {r.title}
                                                    </Link>
                                                ) : (
                                                    <div className="billtableCard__title" title={r.title}>{r.title}</div>
                                                )}
                                                <div className="billtableCard__metaLine">
                                                    <span>{formatBillCode(r)}</span>
                                                    <span aria-hidden="true">•</span>
                                                    <span>{r.date ? r.date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : r.dateRaw || "—"}</span>
                                                    {r.statusLabel ? <><span aria-hidden="true">•</span><span>{r.statusLabel}</span></> : null}
                                                </div>
                                            </div>
                                            <div className="billtableCard__actions">
                                                {badge && <span className={`chip ${badge.className}`} title={badge.title}>{badge.text}</span>}
                                                {r.links.externalUrl ? (
                                                    <a href={r.links.externalUrl} target="_blank" rel="noopener noreferrer" className="billtable__external" title="Open this bill on Congress.gov" aria-label="Open this bill on Congress.gov">
                                                        <ExternalLink size={14} aria-hidden="true" />
                                                    </a>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="billtableCard__topic" title={r.subject}>
                                            <Icon className="billtable__topicIcon" size={15} strokeWidth={2} aria-hidden="true" style={{ color: swatch }} />
                                            <span>{topicMeta.short || r.subject}</span>
                                        </div>
                                        {summary ? (
                                            <p className="billtableCard__summary">
                                                {r.hasAiSummary ? <Sparkles size={13} aria-hidden="true" /> : null}
                                                <span>{summary}</span>
                                            </p>
                                        ) : (
                                            r.latestActionText ? <p className="billtableCard__summary billtableCard__summary--muted">{r.latestActionText}</p> : null
                                        )}
                                        {r.keyActions.length ? (
                                            <ul className="billtableCard__actionsList" aria-label="Key actions">
                                                {r.keyActions.slice(0, 2).map((action, idx) => (
                                                    <li key={`${r.id}-action-${idx}`}>{action}</li>
                                                ))}
                                            </ul>
                                        ) : null}
                                    </article>
                                );
                            })}
                            {filtered.length === 0 && (
                                <div className="billtable__empty">No bills match your filters.</div>
                            )}
                        </div>
                        {filtered.length > initialLimit ? (
                            <div className="billtable__footerActions">
                                {hasMore ? (
                                    <button type="button" className="ll3-disclosureBtn billtable__showMore" onClick={showMore}>
                                        Show {Math.min(pageSize, filtered.length - visibleLimit)} more
                                    </button>
                                ) : (
                                    <button type="button" className="ll3-disclosureBtn billtable__showMore" onClick={showFewer}>
                                        Show fewer
                                    </button>
                                )}

                                <span className="billtable__visibleCount">
                                    Showing {visibleRows.length} of {filtered.length}
                                </span>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div className="billtable__scroller" style={{ maxHeight, overflow: "auto" }}>
                        <table className="billtable__table billtable__table--enriched">
                            <thead>
                                <tr>
                                    <th style={{ width: "62%" }}>Bill</th>
                                    <th className="sortable" style={{ width: "13%" }}>
                                        <button
                                            type="button"
                                            className="billtable__sortBtn"
                                            onClick={() => toggleSort("subject")}
                                            aria-label={`Sort by topic ${sortKey === "subject" && sortDir === "asc" ? "descending" : "ascending"}`}
                                        >
                                            <span>Topic</span>
                                            <span className="billtable__sortIcon">
                                                {sortKey === "subject" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                                            </span>
                                        </button>
                                    </th>
                                    <th className="sortable" style={{ width: "25%" }}>
                                        <button
                                            type="button"
                                            className="billtable__sortBtn"
                                            onClick={() => toggleSort("date")}
                                            aria-label={`Sort by date ${sortKey === "date" && sortDir === "desc" ? "ascending" : "descending"}`}
                                        >
                                            <span>Details</span>
                                            <span className="billtable__sortIcon">
                                                {sortKey === "date" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                                            </span>
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
                                    const summary = r.summaryShort || r.summaryTextPlain;

                                    return (
                                        <tr key={`${r.id}-${r.kinds.join("-")}`} className="billtable__row billtable__row--enriched">
                                            <td className="billtable__cell--title">
                                                <div className="billtable__billStack">
                                                    <div className="billtable__titleLine">
                                                        {r.links.appUrl ? (
                                                            <Link href={r.links.appUrl} className="billlink" title={r.title}>
                                                                {r.title}
                                                            </Link>
                                                        ) : (
                                                            <span title={r.title}>{r.title}</span>
                                                        )}

                                                        {r.links.externalUrl ? (
                                                            <a
                                                                href={r.links.externalUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="billtable__external"
                                                                title="Open this bill on Congress.gov"
                                                                aria-label="Open this bill on Congress.gov"
                                                            >
                                                                <ExternalLink size={14} aria-hidden="true" />
                                                            </a>
                                                        ) : null}
                                                    </div>

                                                    {summary ? (
                                                        <p className="billtable__summary">
                                                            {r.hasAiSummary ? <Sparkles size={13} aria-hidden="true" /> : null}
                                                            <span>{summary}</span>
                                                        </p>
                                                    ) : (
                                                        r.latestActionText ? <p className="billtable__summary billtable__summary--muted">{r.latestActionText}</p> : null
                                                    )}

                                                    {r.keyActions.length ? (
                                                        <ul className="billtable__actions" aria-label="Key actions">
                                                            {r.keyActions.slice(0, 2).map((action, idx) => (
                                                                <li key={`${r.id}-action-${idx}`}>{action}</li>
                                                            ))}
                                                        </ul>
                                                    ) : null}
                                                </div>
                                            </td>

                                            <td className="billtable__cell--topic" title={r.subject}>
                                                <Icon
                                                    className="billtable__topicIcon"
                                                    size={16}
                                                    strokeWidth={2}
                                                    aria-hidden="true"
                                                    style={{ color: swatch }}
                                                />
                                                <span className="billtable__topicText">{topicMeta.short || r.subject}</span>
                                            </td>

                                            <td className="billtable__cell--details">
                                                <div className="billtable__detailsStack">
                                                    <div className="billtable__detailsMain">
                                                        <div className="billtable__detailsType">{formatBillCode(r)}</div>
                                                        <div className="billtable__detailsDate">
                                                            {r.date
                                                                ? r.date.toLocaleDateString(undefined, {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric",
                                                                })
                                                                : r.dateRaw || "—"}
                                                        </div>
                                                        {r.statusLabel ? <div className="billtable__status">{r.statusLabel}</div> : null}
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
                                        <td colSpan={3} className="billtable__empty">
                                            No bills match your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section >
    );
}

function resolveLinks(it, billId) {
    const memberId = pick(it, ["bioguideId", "bioguide_id"]);
    const memberName = pick(it, ["memberName", "member_name", "name"]);

    const params = new URLSearchParams();
    if (memberId) params.set("fromMember", memberId);
    if (memberName) params.set("fromMemberName", memberName);

    const suffix = params.toString() ? `?${params.toString()}` : "";

    const appUrl = billId ? `/bills/${billId}${suffix}` : null;

    const rawExternal = pick(it, ["congressUrl", "congress_url", "url", "href"]);
    const externalUrl = getCongressBillUrl(rawExternal) || null;

    return { appUrl, externalUrl };
}

function normalizeKinds(it = {}) {
    const raw = Array.isArray(it?.kinds) ? it.kinds : [it?.kind ?? it?.__kind ?? it?.memberRole ?? it?.member_role].filter(Boolean);
    return Array.from(new Set(raw.map((k) => String(k).toLowerCase())));
}

function normalizeKeyActions(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(actionText).filter(Boolean);
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed.map(actionText).filter(Boolean);
        } catch {
            return [value].filter(Boolean);
        }
    }
    return [];
}

function actionText(value) {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") return value.text || value.title || value.label || value.action || null;
    return String(value);
}

function formatBillCode(r) {
    const type = r.type || "—";
    return r.number ? `${type} ${r.number}` : type;
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
        const key = normalizeTopicLabel(g?.subject);
        const inc = Array.isArray(g?.items) ? g.items.length : Number(g?.count) || 0;
        counts.set(key, (counts.get(key) || 0) + inc);
    }

    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const map = new Map();

    sorted.forEach(([label], i) => {
        map.set(label, getTopicColor(i));
    });

    return map;
}

function cryptoRandomId() {
    try {
        return crypto.randomUUID();
    } catch {
        return Math.random().toString(36).slice(2);
    }
}
