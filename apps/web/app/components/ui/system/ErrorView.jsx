"use client";
import { useMemo, useState } from "react";
import '../../../../lib/stylesheets/refactored/error-pages.refactored.css';

export default function ErrorView({
    title = "We hit a snag",
    message = "Something went wrong while loading this page.",
    errorId,
    details,         // { name, message, stack, status, cause?, ... }
    onRetry,         // optional fn
    homeHref = "/",
    img
}) {
    const isDev = process.env.NODE_ENV !== "production";
    const [copied, setCopied] = useState(false);

    const friendly = useMemo(() => {
        const status = details?.status;
        if (status === 404) return { title: "Not found", message: "We couldn’t find this data right now." };
        if (status === 429) return { title: "Rate limited", message: "Too many requests—please try again in a moment." };
        if (status >= 500) return { title: "Service issue", message: "Our data service had a hiccup—try again shortly." };
        return { title, message };
    }, [details, title, message]);

    const copy = async () => {
        try {
            const payload = JSON.stringify({ errorId, ...details }, null, 2);
            await navigator.clipboard.writeText(payload);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch { }
    };

    return (
        <div className="container mx-auto max-w-3xl py-10">
            <div className="card card--p-24" style={{ borderLeft: "4px solid #ef4444" }}>
                <h1 className="text-2xl font-semibold mb-2">{friendly.title}</h1>
                <p className="text-gray-700 mb-4">{friendly.message}</p>

                {img && <img src={img} alt="" className="mb-4 w-32 h-32 object-contain" />}

                {errorId && (
                    <div className="text-sm text-gray-600 mb-4">
                        Error ID: <code className="px-1 py-0.5 bg-gray-100 rounded">{errorId}</code>
                        <button onClick={copy} className="ml-2 underline">
                            {copied ? "Copied" : "Copy details"}
                        </button>
                    </div>
                )}

                <div className="flex gap-3 mb-6">
                    {onRetry && (
                        <button onClick={onRetry} className="btn btn-primary">Try again</button>
                    )}
                    <a href={homeHref} className="btn">Go home</a>
                </div>

                {isDev && details && (
                    <details open className="mt-4">
                        <summary className="cursor-pointer text-sm text-gray-700">Developer details</summary>
                        <pre className="mt-3 text-xs overflow-x-auto bg-gray-50 p-3 rounded border">
                            {JSON.stringify(details, null, 2)}
                        </pre>
                        {details?.stack && (
                            <pre className="mt-3 text-xs overflow-x-auto bg-gray-50 p-3 rounded border">
                                {details.stack}
                            </pre>
                        )}
                    </details>
                )}
            </div>
        </div>
    );
}
