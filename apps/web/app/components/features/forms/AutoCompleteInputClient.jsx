"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function useDebounced(value, ms = 180) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function labelFor(mode, item) {
  if (mode === "subject") return `${item.subject} (${item.bill_count})`;
  if (mode === "committee") return `${item.committee_name} (${item.bill_count})`;
  // mode === "q"
  const title = (item.display_title || "").trim();
  const code = `${String(item.bill_type || "").toUpperCase()} ${item.bill_number}`;
  const action = (item.latest_action_text || "").trim();
  return action ? `${code} — ${title} · ${action}` : `${code} — ${title}`;
}

function valueFor(mode, item) {
  if (mode === "subject") return item.subject || "";
  if (mode === "committee") return item.committee_name || "";
  // mode === "q"
  // choose what populates the input:
  // return (item.display_title || "").trim();
  return `${String(item.bill_type || "").toUpperCase()} ${item.bill_number}`;
}

export default function AutocompleteInputClient({
  id,
  name,
  defaultValue = "",
  placeholder = "",
  endpoint,
  mode = "q",          // ✅ "q" | "subject" | "committee"
  minChars = 2,
}) {
  const [val, setVal] = useState(defaultValue || "");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const debounced = useDebounced(val, 180);
  const boxRef = useRef(null);

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

      const next = json.items || [];
      setItems(next);
      setOpen(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced, endpoint, minChars]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const list = useMemo(() => (items || []).slice(0, 12), [items]);

  return (
    <div ref={boxRef} className="ll3-auto">
      <input
        id={id}
        name={name}
        value={val}
        onChange={(e) => setVal(e.target.value)}
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
                setVal(valueFor(mode, item));
                setOpen(false);
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
