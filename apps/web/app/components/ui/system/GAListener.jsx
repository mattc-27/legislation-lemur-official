"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function GAListener({ gaId }) {
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window.gtag === "function") {
            window.gtag("config", gaId, { page_path: pathname });
        }
    }, [pathname, gaId]);

    return null;
}
