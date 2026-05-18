// lib/server/debug/perf.js
export const PERF_LOGS =
    process.env.NODE_ENV !== "production" ||
    process.env.LL_PERF_LOGS === "true";

export function perfLog(label, data = {}) {
    if (!PERF_LOGS) return;
    console.log(`[perf] ${label}`, data);
}