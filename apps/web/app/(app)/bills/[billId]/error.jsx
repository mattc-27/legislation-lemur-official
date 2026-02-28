"use client";

import { useEffect, useMemo, useState } from "react";
import ErrorView from "@/app/components/ui/system/ErrorView";
import { reportError, buildErrorViewProps, extractErrorInfo } from "@/lib/shared/errors/errors";

export default function BillError({ error, reset }) {
    const fallbackProps = useMemo(() => {
        const info = extractErrorInfo(error);
        return buildErrorViewProps({ errorId: null, info });
    }, [error]);

    const [props, setProps] = useState(fallbackProps);

    useEffect(() => {
        if (!error) return; // ✅ guard
        let cancelled = false;

        (async () => {
            try {
                const { errorId, info } = await reportError(error, { where: "bills/[billId]" });
                if (!cancelled) setProps(buildErrorViewProps({ errorId, info }));
            } catch { }
        })();

        return () => { cancelled = true; };
    }, [error]); // ✅ deps tight

    return <ErrorView {...props} onRetry={reset} />;
}