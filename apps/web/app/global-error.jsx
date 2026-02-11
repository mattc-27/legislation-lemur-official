// apps/web/app/global-error.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import ErrorView from "./components/ui/system/ErrorView";
import { reportError, buildErrorViewProps, extractErrorInfo } from "@/lib/shared/errors/errors";

export default function GlobalError({ error, reset }) {
    // Always have something to render immediately
    const fallbackProps = useMemo(() => {
        const info = extractErrorInfo(error);
        return buildErrorViewProps({ errorId: null, info });
    }, [error]);

    const [props, setProps] = useState(fallbackProps);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const { errorId, info } = await reportError(error, { where: "global-error" });
                if (!cancelled) setProps(buildErrorViewProps({ errorId, info }));
            } catch {
                // keep fallback
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [error, fallbackProps]);

    return (
        <html lang="en">
            <body>
                <ErrorView
                    title="This page failed to load"
                    message="You can try again, or come back later."
                    {...props}
                    onRetry={reset}
                />
            </body>
        </html>
    );
}
