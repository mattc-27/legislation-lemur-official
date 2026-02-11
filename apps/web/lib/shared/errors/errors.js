export function genErrorId(prefix = "ERR") {
    const t = Date.now().toString(36);
    const r = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${t}-${r}`;
}

export function extractErrorInfo(err) {
    return {
        name: err?.name || "Error",
        message: err?.message || "Unknown error",
        status: err?.status || err?.statusCode || err?.cause?.status || null,
        stack: typeof err?.stack === "string" ? err.stack : null,

        // ✅ pg error code (e.g. 42P01)
        code: err?.code || null,

        cause: err?.cause
            ? {
                name: err.cause?.name || "Error",
                message: err.cause?.message || String(err.cause),
                status: err.cause?.status || err.cause?.statusCode || null,
            }
            : undefined,
    };
}

export async function reportError(err, context = {}) {
    const errorId = genErrorId();
    const info = extractErrorInfo(err);

    // Server / client safe logging
    try {
        console.error("[AppError]", errorId, { ...info, context });
    } catch {
        // ignore
    }

    // If you later add a POST to your own API route, do it here.
    // Keep it non-blocking and best-effort.

    return { errorId, info };
}

export function classifyError(info = {}) {
    const msg = `${info.message || ""} ${info.stack || ""}`.toLowerCase();
    const has = (s) => msg.includes(s);
    const code = /(^|\D)(4\d\d|5\d\d|526)(\D|$)/.exec(msg)?.[2] || info.status;

    const pgCode = info.code; // ✅ now exists

    if (code === "526" || has("invalid ssl certificate") || has("cloudflare ray id")) {
        return {
            kind: "upstream-ssl",
            title: "Upstream service is having an issue",
            message:
                "Congress.gov is returning an SSL error. This is on their side and usually clears up shortly. You can try again now or check back in a bit.",
        };
    }

    if ((code && String(code).startsWith("5")) || has("502 ") || has("503 ") || has("504 ")) {
        return {
            kind: "upstream-5xx",
            title: "Service is temporarily unavailable",
            message: "An upstream data service returned an error. It’s usually transient—please try again.",
        };
    }

    if (has("<!doctype html") || has("text/html") || has("failed to fetch") || has("network")) {
        return {
            kind: "network",
            title: "Network hiccup",
            message: "We couldn’t fetch data just now. Check your connection and try again.",
        };
    }

    if (code === 404 || has("not found")) {
        return {
            kind: "not-found",
            title: "Not found",
            message: "We couldn’t find that resource.",
        };
    }

    if (code === 429 || has("too many requests") || has("rate limit")) {
        return {
            kind: "rate-limit",
            title: "We’re being rate-limited",
            message: "We’ve made too many requests too quickly. Give it a moment and try again.",
        };
    }

    if (code && String(code).startsWith("4")) {
        return {
            kind: "client",
            title: "Request issue",
            message: "There was a problem with the request. Try again or change your filters.",
        };
    }

    if (pgCode === "42P01" || (has("relation") && has("does not exist"))) {
        return {
            kind: "db-missing-relation",
            title: "Data view is missing",
            message:
                "The data source behind this page isn’t available right now. This is usually a deployment or migration mismatch. Try again later.",
            img: "https://storage.googleapis.com/legislation-lemur-images/not-found-lemur.png",
        };
    }


    return {
        kind: "unknown",
        title: "We hit a snag",
        message: "Something went wrong. Please try again.",
    };
}

export function buildErrorViewProps({ errorId, info }) {
    const c = classifyError(info);
    return {
        title: c.title,
        message: c.message,
        img: c.img,
        errorId,
        details: info,
    };
}
