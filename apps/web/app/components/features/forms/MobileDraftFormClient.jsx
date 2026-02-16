"use client";

import { useEffect, useRef } from "react";

export default function MobileDraftFormClient({ children, debug = false }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const form = wrap.querySelector("form");
    if (!form) return;

    const onSubmit = (e) => {
      // ✅ SubmitEvent.submitter (NOT nativeEvent)
      const submitter = e.submitter;

      const isApply =
        submitter?.dataset?.apply === "true" ||
        submitter?.name === "applyFilters" ||
        submitter?.id === "ll3-apply-filters";

      if (debug) {
        // eslint-disable-next-line no-console
        console.log("[MobileDraftFormClient] submit", { submitter, isApply });
      }

      if (!isApply) e.preventDefault();
    };

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [debug]);

  return <div ref={wrapRef}>{children}</div>;
}
