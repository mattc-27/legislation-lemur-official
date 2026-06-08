"use client";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import LLButton from "@/app/components/shared/ui/LLButton";
const LS_KEY = "ll3_saved_bills_v1";
function safeParse(json) { try { const v = JSON.parse(json); return v && typeof v === "object" ? v : null } catch { return null } }
function readSavedSet() { try { const raw = localStorage.getItem(LS_KEY); if (!raw) return new Set(); const arr = JSON.parse(raw); return new Set(Array.isArray(arr) ? arr : []) } catch { return new Set() } }
function writeSavedSet(set) { try { localStorage.setItem(LS_KEY, JSON.stringify(Array.from(set))) } catch { } }
function readSavedRecords() { try { const raw = localStorage.getItem(`${LS_KEY}__records`); if (!raw) return {}; return safeParse(raw) || {} } catch { return {} } }
function writeSavedRecords(records) { try { localStorage.setItem(`${LS_KEY}__records`, JSON.stringify(records)) } catch { } }
export default function SaveBillButtonClient({ billId, href, label, meta, size = "sm", iconOnly = false, savedIcon = null, unsavedIcon = null, className = "" }) {
    const key = useMemo(() => String(billId || href || label || ""), [billId, href, label]); const [saved, setSaved] = useState(false);
    useEffect(() => { setSaved(readSavedSet().has(key)) }, [key]);
    const toggle = () => { const set = readSavedSet(); const records = readSavedRecords(); const next = !set.has(key); if (next) { set.add(key); records[key] = { id: key, href: href || "", label: label || "", savedAt: new Date().toISOString(), meta: meta ?? null }; } else { set.delete(key); delete records[key]; } writeSavedSet(set); writeSavedRecords(records); setSaved(next); };
    const icon = saved ? savedIcon || <BookmarkCheck size={16} aria-hidden="true" /> : unsavedIcon || <Bookmark size={16} aria-hidden="true" />; const title = saved ? "Saved" : "Save";
    return <LLButton as="button" type="button" variant={saved ? "saved" : "ghost"} size={size} className={[iconOnly ? "ll3-btn--iconOnly" : "", className].filter(Boolean).join(" ")} onClick={toggle} aria-pressed={saved} aria-label={title} title={title}>{icon}{!iconOnly ? <span>{title}</span> : null}</LLButton>;
}
