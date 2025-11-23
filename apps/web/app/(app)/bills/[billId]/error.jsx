"use client";
import { useEffect, useState } from "react";
import ErrorView from "@/app/components/ui/system/ErrorView";
import { reportError, buildErrorViewProps } from "@/lib/utils/errors";

export default function MemberError({ error, reset }) {
    const [props, setProps] = useState(null);

    useEffect(() => {
        (async () => {
            const { errorId, info } = await reportError(error, { where: "member/segment" });
            setProps(buildErrorViewProps({ errorId, info }));
        })();
    }, [error]);

    if (!props) return null;
    return <ErrorView {...props} onRetry={() => reset()} />;
}
