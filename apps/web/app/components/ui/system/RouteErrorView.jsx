"use client";

import { useEffect, useMemo, useState } from "react";
import ErrorView from "./ErrorView";
import { reportError, buildErrorViewProps, extractErrorInfo } from "@/lib/shared/errors/errors";


export default function ErrorBoundary({ error, reset }) {
    const fallbackProps = useMemo(() => {
        const info = extractErrorInfo(error);
        return buildErrorViewProps({ errorId: null, info });
    }, [error]);

    const [props, setProps] = useState(fallbackProps);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { errorId, info } = await reportError(error, { where: "(app)" });
                if (!cancelled) setProps(buildErrorViewProps({ errorId, info }));
            } catch { }
        })();
        return () => { cancelled = true; };
    }, [error, fallbackProps]);

    return <ErrorView {...props} img="https://storage.googleapis.com/legislation-lemur-images/not-found-lemur.png" onRetry={reset} />;
}
