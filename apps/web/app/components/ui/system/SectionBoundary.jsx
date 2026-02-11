// app/components/ui/system/SectionBoundary.jsx
"use client";
import { ErrorBoundary as Reb } from "react-error-boundary";
import ErrorView from "@/app/components/ui/system/ErrorView";
import { reportError, extractErrorInfo, buildErrorViewProps } from "@/lib/shared/errors/errors";

export default function SectionBoundary({ children, where = "section" }) {
    return (
        <Reb
            onError={(error, info) => {
                reportError(error, { where, componentStack: info?.componentStack ?? null });
            }}
            fallbackRender={({ error, resetErrorBoundary }) => {
                const info = extractErrorInfo(error);
                const props = buildErrorViewProps({ errorId: null, info });
                return <ErrorView {...props} onRetry={resetErrorBoundary} />;
            }}
        >
            {children}
        </Reb>
    );
}
