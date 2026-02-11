"use client";

import { useEffect, useMemo, useState } from "react";

const LS_KEY = "ll3_saved_bills_v1";
import { Bookmark, BookmarkCheck } from "lucide-react";
/**
 * Saved record shape:
 * {
 *   id: string,
 *   href: string,
 *   label: string,
 *   savedAt: string (ISO),
 *   meta?: any
 * }
 */

function safeParse(json) {
    try {
        const v = JSON.parse(json);
        return v && typeof v === "object" ? v : null;
    } catch {
        return null;
    }
}

function readSavedSet() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return new Set();
        const arr = JSON.parse(raw);
        return new Set(Array.isArray(arr) ? arr : []);
    } catch {
        return new Set();
    }
}

function writeSavedSet(set) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(Array.from(set)));
    } catch {
        // ignore
    }
}
export default function SaveBillButtonClient({
    billId,
    href,
    label,
    meta,
    size = "sm",
}) {
    const key = useMemo(() => String(billId || href || label || ""), [billId, href, label]);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const set = readSavedSet();
        setSaved(set.has(key));
    }, [key]);

    const toggle = () => {
        const set = readSavedSet();
        const next = !set.has(key);
        if (next) set.add(key);
        else set.delete(key);
        writeSavedSet(set);
        setSaved(next);

        // optional: stash metadata separately if you want later
        // (keep minimal for now)
    };

    return (
        <button
            type="button"
            className={`ll3-btn ll3-btn--ghost ll3-btn--sm ${saved ? "ll3-btn--saved" : ""}`}
            onClick={toggle}
            aria-pressed={saved}
            title={saved ? "Saved" : "Save"}
        >
            {saved ? <BookmarkCheck size={16} aria-hidden="true" /> : <Bookmark size={16} aria-hidden="true" />}
            <span>{saved ? "Saved" : "Save"}</span>
        </button>
    );
}