// components/search/CongressPicker.jsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function CongressPicker({ value = 119, options = [], label = "Congress" }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const current = sp.get("congress") ?? "";

  return (
    <label className="ll3-field" style={{ gap: 6 }}>
      <span className="ll3-label">Congress</span>
      <select
        className="ll3-input ll3-congressSelect"
        value={current}
        onChange={(e) => {
          const next = new URLSearchParams(sp.toString());
          const val = e.target.value;
          if (!val) next.delete("congress");
          else next.set("congress", val);
          next.delete("page");
          router.replace(`${pathname}?${next.toString()}`, { scroll: false });
        }}
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
