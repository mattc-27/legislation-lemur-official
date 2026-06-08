"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";

function cx(...parts) {
    return parts.filter(Boolean).join(" ");
}

/**
 * Shared intercepted-route panel shell.
 *
 * Owns the drawer/scrim/body wrapper. Feature detail components should render
 * inside the body without their own direct-page EntityDetailShell.
 */
export default function RoutePanelShell({
    children,
    ariaLabel = "Details panel",
    closeLabel,
    backLabel,
    fallbackHref = "/search",
    showBack = true,
    entity = "generic",
    mode = "panel",
    className,
    panelClassName,
    barClassName,
    bodyClassName,
}) {
    const router = useRouter();
    const resolvedCloseLabel = closeLabel || `Close ${ariaLabel}`;

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
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
        }

        router.push(fallbackHref);
    }

    return (
        <div
            className={cx("ll3-routePanel", mode && `ll3-routePanel--${mode}`, entity && `ll3-routePanel--${entity}`, className)}
            data-view-mode={mode}
            data-entity={entity}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
        >
            <button type="button" className="ll3-routePanel__scrim" aria-label={resolvedCloseLabel} onClick={closePanel} />

            <aside className={cx("ll3-routePanel__panel", panelClassName)}>
                <div className={cx("ll3-routePanel__bar", barClassName)}>
                    {showBack && backLabel ? (
                        <button type="button" className="ll3-routePanel__back" onClick={closePanel}>
                            <ArrowLeft size={16} aria-hidden="true" />
                            <span>{backLabel}</span>
                        </button>
                    ) : (
                        <span aria-hidden="true" />
                    )}

                    <button type="button" className="ll3-routePanel__close" onClick={closePanel} aria-label={resolvedCloseLabel}>
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                <div className={cx("ll3-panelWrap", "ll3-routePanel__body", bodyClassName)}>{children}</div>
            </aside>
        </div>
    );
}
