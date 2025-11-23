// apps/web/app/(app)/member/error.jsx
"use client";

import { useEffect, useState } from "react";
import ErrorView from "@/app/components/ui/system/ErrorView";
import { reportError } from "@/lib/utils/errors";

export default function MemberError({ error, reset }) {
    const [state, setState] = useState({ errorId: null, details: null });

    useEffect(() => {
        (async () => {
            const { errorId, info } = await reportError(error, {
                where: "member-route",
            });
            setState({ errorId, details: info });
        })();
    }, [error]);

    return (
        <ErrorView
            title="Member page failed to load"
            message="We couldn’t load this member’s data. Try again?"
            errorId={state.errorId}
            details={state.details}
            onRetry={reset}
        />
    );
}
