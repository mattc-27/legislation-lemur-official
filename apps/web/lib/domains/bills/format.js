// lib/ui/bills/format.js
export function fmtDate(v) {
    if (!v) return "—";
    try {
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return String(v);
        return d.toISOString().slice(0, 10);
    } catch {
        return String(v);
    }
}
