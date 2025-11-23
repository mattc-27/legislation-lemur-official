// components/search/CongressPicker.jsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function CongressPicker({ value = 119, options = [], label = "Congress" }) {
  const router = useRouter();
  const sp = useSearchParams();

  const handleChange = (e) => {
    const v = e.target.value;
    const params = new URLSearchParams(sp?.toString() || "");
    params.set("congress", v);
    router.push(`?${params.toString()}`);
  };

  return (
    <label className="congress-picker">
      <span className="sr-only">{label}</span>
      <select
        className="field sb-select"
        value={String(value)}
        onChange={handleChange}
      >
        {options
          .slice() // keep original safe
          .sort((a, b) => b - a) // show newest first
          .map((c) => (
            <option key={c} value={c}>
              {c}th Congress
            </option>
          ))}
      </select>
    </label>

  );
}
