"use client";

import Link from "next/link";
import { useEffect } from "react";

function getStateCode(state) {
    return String(state?.state_code || state?.state || "").toUpperCase();
}

function getCounts(state, chamber) {
    const key = chamber === "house" ? "house_counts" : "senate_counts";
    const camelKey = chamber === "house" ? "houseCounts" : "senateCounts";
    const counts = state?.[key] || state?.[camelKey] || {};

    return {
        D: Number(counts.D ?? state?.[`${chamber}_d`] ?? 0),
        R: Number(counts.R ?? state?.[`${chamber}_r`] ?? 0),
        I: Number(counts.I ?? state?.[`${chamber}_i`] ?? 0),
        total: Number(counts.total ?? state?.[`${chamber}_total`] ?? 0),
    };
}

export default function StateCompositionModal({ state, onClose }) {
    const stateCode = getStateCode(state);
    const house = getCounts(state, "house");
    const senate = getCounts(state, "senate");

    useEffect(() => {
        if (!state) return;

        function onKeyDown(event) {
            if (event.key === "Escape") onClose?.();
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [state, onClose]);

    if (!state) return null;

    return (
        <div className="ll3-modalBackdrop" role="presentation" onClick={onClose}>
            <div
                className="ll3-stateModal"
                role="dialog"
                aria-modal="true"
                aria-label={`${stateCode} congressional composition`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="ll3-stateModal__head">
                    <div>
                        <p className="ll3-eyebrow">State delegation</p>
                        <h3>{stateCode}</h3>
                    </div>

                    <button
                        type="button"
                        className="ll3-modalClose"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <div className="ll3-stateModal__grid">
                    <CompositionCard title="House" counts={house} />
                    <CompositionCard title="Senate" counts={senate} />
                </div>

                <div className="ll3-stateModal__footer">
                    <Link
                        className="ll3-stateModal__link"
                        href={`/member/#${stateCode.toLowerCase()}`}
                    >
                        View {stateCode} members
                    </Link>
                </div>
            </div>
        </div>
    );
}

function CompositionCard({ title, counts }) {
    const seatLabel = counts.total === 1 ? "seat" : "seats";

    return (
        <div className="ll3-compositionMiniCard">
            <h4>{title}</h4>

            <div className="ll3-miniBars">
                <MiniBar label="D" value={counts.D} total={counts.total} className="is-dem" />
                <MiniBar label="R" value={counts.R} total={counts.total} className="is-rep" />
                <MiniBar label="I" value={counts.I} total={counts.total} className="is-ind" />
            </div>

            <p>{counts.total} total {seatLabel}</p>
        </div>
    );
}

function MiniBar({ label, value, total, className }) {
    const width = total > 0 ? `${Math.round((value / total) * 100)}%` : "0%";

    return (
        <div className="ll3-miniBar">
            <span>{label}</span>
            <div>
                <i className={className} style={{ width }} />
            </div>
            <strong>{value}</strong>
        </div>
    );
}