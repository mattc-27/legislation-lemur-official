// apps/web/app/global-error.jsx
"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import ErrorView from "./components/ui/system/ErrorView";
import { reportError } from "@/lib/utils/errors";
import { extractErrorInfo } from "@/lib/utils/errors";

export default function GlobalError({ error, reset }) {
    const [state, setState] = useState({
        errorId: null,
        details: null,
    });
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);
    /*  useEffect(() => {
          // Report once when the error changes
          (async () => {
              const { errorId, info } = await reportError(error, {
                  where: "global-error",
              });
              setState({ errorId, details: info });
          })();
      }, [error]);
      */

    return (
        <ErrorView
            title="This page failed to load"
            message="You can try again, or come back later."
            errorId={state.errorId}
            details={state.details}
            onRetry={reset}   // Next passes reset() to re-render the route
        />
    );
}
