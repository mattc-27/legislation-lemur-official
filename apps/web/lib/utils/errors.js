import * as Sentry from "@sentry/nextjs";


export function genErrorId(prefix = "ERR") {
    const t = Date.now().toString(36);
    const r = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${t}-${r}`;
}

export function extractErrorInfo(err) {
    const safe = (x) => (typeof x === "string" ? x : JSON.stringify(x));
    const info = {
        name: err?.name || "Error",
        message: err?.message || "Unknown error",
        status: err?.status || err?.statusCode || err?.cause?.status || null,
        stack: typeof err?.stack === "string" ? err.stack : null,
    };
    // Shallow cause chain (avoid cycles)
    if (err?.cause) {
        const c = err.cause;
        info.cause = {
            name: c?.name || "Error",
            message: c?.message || String(c),
            status: c?.status || c?.statusCode || null,
        };
    }
    return info;
}

export async function reportError(err, context = {}) {
    const errorId = genErrorId();
    const info = extractErrorInfo(err);

    console.error("[AppError]", errorId, { ...info, context });

    Sentry.captureException(err, {
        tags: {
            errorId,
            kind: classifyError(info).kind,
        },
        extra: {
            ...info,
            context,
        },
    });

    return { errorId, info };
}


export function classifyError(info = {}) {
    const msg = `${info.message || ""} ${info.stack || ""}`.toLowerCase();

    // quick detectors
    const has = (s) => msg.includes(s);
    const code = /(^|\D)(4\d\d|5\d\d|526)(\D|$)/.exec(msg)?.[2] || info.status;

    // Congress.gov / Cloudflare SSL (your example)
    if (code === "526" || has("invalid ssl certificate") || has("cloudflare ray id")) {
        return {
            kind: "upstream-ssl",
            title: "Upstream service is having an issue",
            message:
                "Congress.gov is returning an SSL error. This is on their side and usually clears up shortly. You can try again now or check back in a bit.",
        };
    }

    // Generic upstream 5xx
    if ((code && String(code).startsWith("5")) || has("502 ") || has("503 ") || has("504 ")) {
        return {
            kind: "upstream-5xx",
            title: "Service is temporarily unavailable",
            message: "An upstream data service returned an error. It’s usually transient—please try again.",
        };
    }

    // Network / HTML instead of JSON
    if (has("<!doctype html") || has("text/html") || has("failed to fetch") || has("network")) {
        return {
            kind: "network",
            title: "Network hiccup",
            message: "We couldn’t fetch data just now. Check your connection and try again.",
        };
    }

    // 404 / not found
    if (code === 404 || has("not found")) {
        return {
            kind: "not-found",
            title: "Not found",
            message: "We couldn’t find that resource.",
            img: '/767bc289-6ee5-46ca-ae86-5a33154091d3.png'
        };
    }

    // Rate limiting
    if (code === 429 || has("too many requests") || has("rate limit")) {
        return {
            kind: "rate-limit",
            title: "We’re being rate-limited",
            message: "We’ve made too many requests too quickly. Give it a moment and try again.",
        };
    }

    // Validation / 4xx generic
    if (code && String(code).startsWith("4")) {
        return {
            kind: "client",
            title: "Request issue",
            message: "There was a problem with the request. Try again or change your filters.",
        };
    }

    // Fallback
    return {
        kind: "unknown",
        title: "We hit a snag",
        message: "Something went wrong. Please try again.",
    };
}

// Build props for ErrorView from an error/info
export function buildErrorViewProps({ errorId, info }) {
    const c = classifyError(info);
    return {
        title: c.title,
        message: c.message,
        errorId,
        details: info,
    };
}
