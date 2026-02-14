"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation"; // ✅ add

function useDebounced(value, ms = 180) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function submitClosestForm(el) {
  const form = el?.closest?.("form");
  if (!form) return;
  if (form.requestSubmit) form.requestSubmit();
  else form.submit();
}

function labelFor(mode, item) {
  if (mode === "subject") return `${item.subject} (${item.bill_count})`;
  if (mode === "committee") return `${item.committee_name} (${item.bill_count})`;
  const title = (item.display_title || "").trim();
  const code = `${String(item.bill_type || "").toUpperCase()} ${item.bill_number}`;
  const action = (item.latest_action_text || "").trim();
  return action ? `${code} — ${title} · ${action}` : `${code} — ${title}`;
}

function valueFor(mode, item, fallbackTyped = "") {
  if (mode === "subject") return item.subject || "";
  if (mode === "committee") return item.committee_name || "";
  // mode === "q" → prefer keyword-ish value
  return (item.display_title || "").trim() || fallbackTyped;
}

export default function AutocompleteInputClient({
  id,
  name,
  defaultValue = "",
  placeholder = "",
  endpoint,
  mode = "q",
  minChars = 2,

  autoSubmitOnSelect = true,
  autoSubmitOnType = false,
  submitDebounceMs = 250,
}) {
  const searchParams = useSearchParams(); // ✅ add

  const [val, setVal] = useState(defaultValue || "");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const debounced = useDebounced(val, 180);
  const submitDebounced = useDebounced(val, submitDebounceMs);

  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const lastSubmittedRef = useRef("");

  // fetch suggestions
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const q = debounced.trim();
      if (!q || q.length < minChars) {
        setItems([]);
        setOpen(false);
        return;
      }

      const res = await fetch(`${endpoint}?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      });

      const json = await res.json();
      if (cancelled) return;

      setItems(json.items || []);
      setOpen(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced, endpoint, minChars]);

  // click outside closes menu
  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // ✅ auto-submit while typing (debounced) — with URL equality guard
  useEffect(() => {
    if (!autoSubmitOnType) return;

    const q = (submitDebounced || "").trim();
    if (!q || q.length < minChars) return;

    // ✅ STOP LOOP: if URL already has this exact value, do nothing
    const current = (searchParams?.get(name) || "").trim();
    if (current === q) return;

    // optional spam guard (still useful if user types back/forth quickly)
    if (q === lastSubmittedRef.current) return;
    lastSubmittedRef.current = q;

    submitClosestForm(inputRef.current);
  }, [autoSubmitOnType, submitDebounced, minChars, name, searchParams]);

  const list = useMemo(() => (items || []).slice(0, 12), [items]);

  return (
    <div ref={boxRef} className="ll3-auto">
      <input
        ref={inputRef}
        id={id}
        name={name}
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          lastSubmittedRef.current = "";
        }}
        className="ll3-input"
        placeholder={placeholder}
        autoComplete="off"
      />

      {open && list.length ? (
        <div className="ll3-auto__menu" role="listbox" aria-label="Suggestions">
          {list.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="ll3-auto__item"
              onClick={() => {
                const nextVal = valueFor(mode, item, val).trim();

                setVal(nextVal);
                setOpen(false);

                if (autoSubmitOnSelect) {
                  // avoid submitting if already at that value in URL
                  const current = (searchParams?.get(name) || "").trim();
                  if (current === nextVal) return;

                  lastSubmittedRef.current = nextVal;
                  requestAnimationFrame(() => submitClosestForm(inputRef.current));
                }
              }}
            >
              {labelFor(mode, item)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
