"use client";

import { useEffect, useRef } from "react";

export default function MobileDraftFormClient({ children, debug = false }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const form = wrap.querySelector("form");
    if (!form) return;

    const onSubmit = (event) => {
      const submitter = event.submitter;

      const isApply =
        submitter?.dataset?.apply === "true" ||
        submitter?.name === "applyFilters" ||
        submitter?.id === "ll3-apply-filters";

      if (debug) {
        console.log("[MobileDraftFormClient] submit", { submitter, isApply });
      }

      if (!isApply) {
        event.preventDefault();
      }
    };

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [debug]);

  return <div ref={wrapRef}>{children}</div>;
}