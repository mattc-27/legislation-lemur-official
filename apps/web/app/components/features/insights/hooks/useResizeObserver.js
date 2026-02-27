// apps/web/app/components/features/insights/client/useResizeObserver.js
"use client";

import { useEffect, useState } from "react";

export function useResizeObserver(ref) {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const ro = new ResizeObserver((entries) => {
            const cr = entries?.[0]?.contentRect;
            if (!cr) return;
            setSize({ width: Math.round(cr.width), height: Math.round(cr.height) });
        });

        ro.observe(el);
        return () => ro.disconnect();
    }, [ref]);

    return size;
}
