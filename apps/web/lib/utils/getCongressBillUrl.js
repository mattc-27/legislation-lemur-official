// lib/utils/getCongressBillUrl.js
export function getCongressBillUrl(apiUrl) {
    try {
        const url = new URL(apiUrl);
        // If it's already a public Congress.gov bill URL, just return it.
        if (url.hostname.includes("congress.gov") && url.pathname.startsWith("/bill/")) {
            return url.toString();
        }

        // Expecting: https://api.congress.gov/v3/bill/{congress}/{billType}/{billNumber}
        const seg = url.pathname.split("/");
        // ['', 'v3', 'bill', '119', 'hr', '2042'] -> idx 3..5
        const congress = seg[3];           // e.g., '119'
        const billTypeRaw = seg[4];        // e.g., 'hr', 's', 'hres', ...
        const billNumber = seg[5];         // e.g., '2042'

        if (!congress || !billTypeRaw || !billNumber) return null;

        const map = {
            hr: "house-bill",
            hres: "house-resolution",
            hjres: "house-joint-resolution",
            hconres: "house-concurrent-resolution",
            s: "senate-bill",
            sres: "senate-resolution",
            sjres: "senate-joint-resolution",
            sconres: "senate-concurrent-resolution",
        };

        const readable = map[billTypeRaw.toLowerCase()] || billTypeRaw.toLowerCase();
        return `https://www.congress.gov/bill/${congress}th-congress/${readable}/${billNumber}`;
    } catch {
        return null;
    }
}
