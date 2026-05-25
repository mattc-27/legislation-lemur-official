"use client";

import { useEffect } from "react";

export default function ScrollLockDebug() {
    useEffect(() => {
        console.log("[ScrollDebug] mounted");

        const originalScrollTo = window.scrollTo;
        window.scrollTo = function patchedScrollTo(...args) {
            console.warn("[ScrollDebug] window.scrollTo called", {
                args,
                stack: new Error().stack,
            });

            return originalScrollTo.apply(window, args);
        };

        const originalScrollIntoView = Element.prototype.scrollIntoView;
        Element.prototype.scrollIntoView = function patchedScrollIntoView(...args) {
            console.warn("[ScrollDebug] scrollIntoView called", {
                element: this,
                className: this.className,
                id: this.id,
                args,
                stack: new Error().stack,
            });

            return originalScrollIntoView.apply(this, args);
        };

        const originalPreventDefault = Event.prototype.preventDefault;

        Event.prototype.preventDefault = function patchedPreventDefault() {
            if (this.type === "wheel" || this.type === "touchmove") {
                console.warn("[ScrollDebug] preventDefault called on", this.type, {
                    target: this.target,
                    currentTarget: this.currentTarget,
                    defaultPrevented: this.defaultPrevented,
                    stack: new Error().stack,
                });
            }

            return originalPreventDefault.apply(this, arguments);
        };

        function snapshot(label) {
            const html = getComputedStyle(document.documentElement);
            const body = getComputedStyle(document.body);
            const main = document.querySelector(".ll3-ref");
            const mainStyle = main ? getComputedStyle(main) : null;

            console.log(`[ScrollDebug] ${label}`, {
                scrollY: window.scrollY,
                docScrollTop: document.documentElement.scrollTop,
                bodyScrollTop: document.body.scrollTop,
                scrollingElement: document.scrollingElement,
                centerElement: document.elementFromPoint(
                    window.innerWidth / 2,
                    window.innerHeight / 2
                ),
                html: {
                    overflow: html.overflow,
                    overflowY: html.overflowY,
                    height: html.height,
                    position: html.position,
                    touchAction: html.touchAction,
                    overscrollBehavior: html.overscrollBehavior,
                    scrollSnapType: html.scrollSnapType,
                },
                body: {
                    overflow: body.overflow,
                    overflowY: body.overflowY,
                    height: body.height,
                    position: body.position,
                    touchAction: body.touchAction,
                    overscrollBehavior: body.overscrollBehavior,
                    scrollSnapType: body.scrollSnapType,
                },
                main: mainStyle
                    ? {
                        overflow: mainStyle.overflow,
                        overflowY: mainStyle.overflowY,
                        height: mainStyle.height,
                        position: mainStyle.position,
                        touchAction: mainStyle.touchAction,
                        overscrollBehavior: mainStyle.overscrollBehavior,
                        scrollSnapType: mainStyle.scrollSnapType,
                    }
                    : null,
            });
        }

        function onWheelCapture(e) {
            console.log("[ScrollDebug] wheel CAPTURE", {
                deltaY: e.deltaY,
                target: e.target,
                defaultPrevented: e.defaultPrevented,
                cancelable: e.cancelable,
                scrollY: window.scrollY,
            });

            requestAnimationFrame(() => snapshot("after wheel RAF"));
        }

        function onWheelBubble(e) {
            console.log("[ScrollDebug] wheel BUBBLE", {
                deltaY: e.deltaY,
                target: e.target,
                defaultPrevented: e.defaultPrevented,
                cancelable: e.cancelable,
                scrollY: window.scrollY,
            });
        }

        function onScroll() {
            console.log("[ScrollDebug] scroll", {
                scrollY: window.scrollY,
            });
        }

        snapshot("initial");

        window.addEventListener("wheel", onWheelCapture, {
            capture: true,
            passive: false,
        });

        window.addEventListener("wheel", onWheelBubble, {
            capture: false,
            passive: false,
        });

        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            Event.prototype.preventDefault = originalPreventDefault;
            window.scrollTo = originalScrollTo;
            Element.prototype.scrollIntoView = originalScrollIntoView;

            window.removeEventListener("wheel", onWheelCapture, { capture: true });
            window.removeEventListener("wheel", onWheelBubble, { capture: false });
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    return null;
}