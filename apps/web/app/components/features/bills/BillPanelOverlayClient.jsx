// /app/components/features/bills/BillPanelMetricCard.jsx

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function BillPanelOverlayClient({ children }) {
    const router = useRouter();

    useEffect(() => {
        const prevHtmlOverflow = document.documentElement.style.overflow;
        const prevBodyOverflow = document.body.style.overflow;

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        return () => {
            document.documentElement.style.overflow = prevHtmlOverflow;
            document.body.style.overflow = prevBodyOverflow;
        };
    }, []);

    function closePanel() {
        router.back();
    }

    return (
        <div className="llbpOverlay" role="dialog" aria-modal="true" aria-label="Bill details">
            <button
                type="button"
                className="llbpOverlay__scrim"
                aria-label="Close bill details"
                onClick={closePanel}
            />

            <section className="llbpOverlay__panel">
                <button
                    type="button"
                    className="llbpOverlay__close"
                    aria-label="Close bill details"
                    onClick={closePanel}
                >
                    <X size={18} aria-hidden="true" />
                </button>

                {children}
            </section>
        </div>
    );
}