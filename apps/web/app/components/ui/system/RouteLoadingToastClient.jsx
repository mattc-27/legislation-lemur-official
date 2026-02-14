// app/components/ui/system/RouteLoadingToastClient.jsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function RouteLoadingToastClient() {
    const pathname = usePathname();
    const sp = useSearchParams();

    useEffect(() => {
        // On any completed navigation, dismiss the tracked loading toast (if any)
        const id = window.__LL_NAV_LOADING_TOAST_ID__;
        if (id) {
            toast.dismiss(id);
            window.__LL_NAV_LOADING_TOAST_ID__ = null;
        }
    }, [pathname, sp]);

    return null;
}
