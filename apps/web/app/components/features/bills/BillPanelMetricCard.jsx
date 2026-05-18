// /app/components/features/bills/BillPanelMetricCard.jsx

import { TrendingUp, Zap } from "lucide-react";

function toFiniteNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function getImpactDescriptor(value) {
    const n = toFiniteNumber(value);
    if (n == null) return "Insufficient signal";
    if (n >= 90) return "High priority";
    if (n >= 80) return "Major signal";
    if (n >= 70) return "Substantial";
    if (n >= 55) return "Moderate";
    return "Limited";
}

function getMomentumDescriptor(value) {
    const n = toFiniteNumber(value);
    if (n == null) return "Insufficient signal";
    if (n >= 80) return "Accelerating";
    if (n >= 65) return "Gaining";
    if (n >= 45) return "Active";
    return "Stable";
}

export default function BillPanelMetricCard({ type = "impact", label, value, hint }) {
    const isMomentum = type === "momentum";
    const Icon = isMomentum ? TrendingUp : Zap;
    const safeValue = toFiniteNumber(value);

    const displayHint =
        hint || (isMomentum ? getMomentumDescriptor(safeValue) : getImpactDescriptor(safeValue));

    return (
        <div className={`llbp-score llbp-score--${type}`}>
            <div className="llbp-score__label">
                <Icon size={13} aria-hidden="true" />
                <span>{label || (isMomentum ? "Momentum" : "Impact Score")}</span>
            </div>

            <div className="llbp-score__value">{safeValue == null ? "—" : safeValue}</div>
            <div className="llbp-score__hint">{displayHint}</div>
        </div>
    );
}