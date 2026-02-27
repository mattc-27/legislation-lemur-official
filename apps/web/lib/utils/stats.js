// lib/stats.js

const Z_95 = 1.959963984540054; // 95% two-sided

function clamp01(x) {
    if (x < 0) return 0;
    if (x > 1) return 1;
    return x;
}

/**
 * Wilson score interval for a proportion.
 * Returns { p, ciLow, ciHigh, n, x }
 */
function wilsonCI(x, n, z = Z_95) {
    if (!Number.isFinite(x) || !Number.isFinite(n) || n <= 0) {
        return { p: null, ciLow: null, ciHigh: null, n, x, state: "insufficient_data" };
    }
    const pHat = x / n;
    const z2 = z * z;
    const den = 1 + z2 / n;
    const center = (pHat + z2 / (2 * n)) / den;
    const half =
        (z * Math.sqrt((pHat * (1 - pHat) + z2 / (4 * n)) / n)) / den;

    const ciLow = clamp01(center - half);
    const ciHigh = clamp01(center + half);

    return { p: pHat, ciLow, ciHigh, n, x };
}

/**
 * Log CI for rate ratio of counts (Poisson-ish).
 * Returns { rr, ciLow, ciHigh, kCur, kBase, state, flags }
 */
function rrCI(kCur, kBase, z = Z_95, continuity = 0) {
    if (!Number.isFinite(kCur) || !Number.isFinite(kBase) || kCur < 0 || kBase < 0) {
        return { rr: null, ciLow: null, ciHigh: null, kCur, kBase, state: "insufficient_data" };
    }

    // Optional continuity correction for zeros; default is 0 (strict).
    const a = kCur + continuity;
    const b = kBase + continuity;

    if (a <= 0 || b <= 0) {
        return { rr: null, ciLow: null, ciHigh: null, kCur, kBase, state: "insufficient_data" };
    }

    const rr = a / b;
    const seLog = Math.sqrt(1 / a + 1 / b);
    const logRR = Math.log(rr);

    const ciLow = Math.exp(logRR - z * seLog);
    const ciHigh = Math.exp(logRR + z * seLog);

    const flags = [];
    const minN = Math.min(kCur, kBase);
    if (minN < 5) flags.push("low_n");

    const state = stateFromCI({
        kind: "rr",
        ciLow,
        ciHigh,
        minN,
    });

    return { rr, ciLow, ciHigh, kCur, kBase, state, flags };
}

/**
 * Two-proportion difference + pooled z-test p-value.
 * CI uses unpooled Wald (v1). If you later want Newcombe, we can swap.
 */
function diffProportions(x1, n1, x0, n0, z = Z_95) {
    if ([x1, n1, x0, n0].some(v => !Number.isFinite(v)) || n1 <= 0 || n0 <= 0) {
        return {
            diff: null,
            ciLow: null,
            ciHigh: null,
            pValue: null,
            state: "insufficient_data",
        };
    }

    const p1 = x1 / n1;
    const p0 = x0 / n0;
    const diff = p1 - p0;

    const seUnpooled = Math.sqrt((p1 * (1 - p1)) / n1 + (p0 * (1 - p0)) / n0);
    const ciLow = diff - z * seUnpooled;
    const ciHigh = diff + z * seUnpooled;

    // pooled z-test
    const pPool = (x1 + x0) / (n1 + n0);
    const sePooled = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n0));
    const zStat = sePooled > 0 ? diff / sePooled : Infinity;

    // normal CDF approximation (Abramowitz-Stegun-ish via erf)
    const pValue = 2 * (1 - normalCdf(Math.abs(zStat)));

    const state = stateFromCI({ kind: "diff", ciLow, ciHigh });

    return {
        p1: { x: x1, n: n1, p: p1 },
        p0: { x: x0, n: n0, p: p0 },
        diff,
        ciLow,
        ciHigh,
        pValue,
        state,
    };
}

/**
 * Direct standardization: weighted average of chamber rates.
 * Input: [{x, n, w}] where weights sum ~ 1.
 * Returns { pAdj, ciLow, ciHigh, state }
 */
function adjustedRate(parts, z = Z_95) {
    if (!Array.isArray(parts) || parts.length === 0) {
        return { pAdj: null, ciLow: null, ciHigh: null, state: "insufficient_data" };
    }

    let pAdj = 0;
    let varAdj = 0;
    let anyBad = false;

    for (const { x, n, w } of parts) {
        if (![x, n, w].every(Number.isFinite) || n <= 0 || w < 0) {
            anyBad = true;
            continue;
        }
        const p = x / n;
        pAdj += w * p;

        // Conservative binomial variance
        const v = (p * (1 - p)) / n;
        varAdj += (w * w) * v;
    }

    if (anyBad && varAdj === 0) {
        return { pAdj: null, ciLow: null, ciHigh: null, state: "insufficient_data" };
    }

    const se = Math.sqrt(varAdj);
    const ciLow = clamp01(pAdj - z * se);
    const ciHigh = clamp01(pAdj + z * se);

    const state = stateFromCI({ kind: "prop", ciLow, ciHigh, neutral: null });

    return { pAdj, ciLow, ciHigh, state };
}

/**
 * Unified narrative state from CIs.
 * - kind "rr": neutral is 1
 * - kind "diff": neutral is 0
 * - kind "prop": no baseline comparison; return "consistent" unless insufficient handled upstream
 */
function stateFromCI({ kind, ciLow, ciHigh, minN }) {
    if (!Number.isFinite(ciLow) || !Number.isFinite(ciHigh)) return "insufficient_data";
    if (kind === "rr") {
        if (minN != null && minN < 5) return "low_n";
        if (ciLow > 1) return "above_baseline";
        if (ciHigh < 1) return "below_baseline";
        return "consistent";
    }
    if (kind === "diff") {
        if (ciLow > 0) return "above_baseline";
        if (ciHigh < 0) return "below_baseline";
        return "consistent";
    }
    // proportions without a comparator
    return "consistent";
}

// --- helpers ---

function normalCdf(x) {
    return 0.5 * (1 + erf(x / Math.SQRT2));
}

// Abramowitz-Stegun erf approximation
function erf(x) {
    const sign = x >= 0 ? 1 : -1;
    const ax = Math.abs(x);

    // constants
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const t = 1 / (1 + p * ax);
    const y =
        1 -
        (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) *
        Math.exp(-ax * ax);

    return sign * y;
}

/**
 * Equal weighting: treats House and Senate as peers.
 * Returns { house, senate }
 */
function weightsEqual() {
    return { house: 0.5, senate: 0.5 };
}

/**
 * Seat-based weighting: weights by chamber seat count.
 * Defaults: House 435, Senate 100.
 * Returns { house, senate }
 */
function weightsSeats(houseSeats = 435, senateSeats = 100) {
    const total = houseSeats + senateSeats;
    if (total <= 0) return { house: 0.5, senate: 0.5 };
    return { house: houseSeats / total, senate: senateSeats / total };
}

/**
 * Baseline intro-mix weighting: weights by baseline introductions volume.
 * Input: baseline intro counts (or averages) for each chamber.
 * Returns { house, senate }
 */
function weightsFromIntroMix(introHouse, introSenate) {
    const h = Number(introHouse);
    const s = Number(introSenate);
    const total = h + s;

    if (!Number.isFinite(h) || !Number.isFinite(s) || total <= 0) {
        return { house: 0.5, senate: 0.5 };
    }
    return { house: h / total, senate: s / total };
}


module.exports = {
    wilsonCI,
    rrCI,
    diffProportions,
    adjustedRate,
    stateFromCI,
    // new weight helpers
    weightsEqual,
    weightsSeats,
    weightsFromIntroMix,
};
