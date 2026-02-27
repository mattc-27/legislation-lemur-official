"use client";

import { createContext, useContext, useMemo, useState } from "react";

const InsightsControlsCtx = createContext(null);

export function InsightsControlsProvider({ initialChamber = "all", children }) {
    const [chamber, setChamber] = useState(initialChamber);

    const value = useMemo(() => ({ chamber, setChamber }), [chamber]);
    return <InsightsControlsCtx.Provider value={value}>{children}</InsightsControlsCtx.Provider>;
}

export function useInsightsControls() {
    const v = useContext(InsightsControlsCtx);
    if (!v) throw new Error("useInsightsControls must be used within InsightsControlsProvider");
    return v;
}
