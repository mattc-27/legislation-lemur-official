// apps/web/app/components/features/insights/InsightsHeroNew.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import InsightsHeroBackground from "./InsightsHeroBackground";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function scrollToId(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;

  // Use smooth scroll unless user prefers reduced motion.
  const behavior = prefersReducedMotion() ? "auto" : "smooth";

  // If your page uses scroll-margin-top on sections, this “just works”.
  // Otherwise, this still scrolls reasonably well.
  el.scrollIntoView({ behavior, block: "start" });

  // Update URL hash without jumping
  try {
    const next = `#${encodeURIComponent(id)}`;
    if (window.location.hash !== next) history.replaceState(null, "", next);
  } catch {
    // ignore
  }
}

function RotatingQuestionCard({ items, intervalMs = 5200, onPick }) {
  const reduced = prefersReducedMotion();
  const safeInterval = Math.max(2500, intervalMs);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("in"); // "in" | "out"
  const timerRef = useRef(null);
  const fadeRef = useRef(null);

  const current = items?.[idx] ?? null;

  useEffect(() => {
    if (!items?.length) return;

    // If reduced motion, do not auto-rotate.
    if (reduced) return;

    const tick = () => {
      setPhase("out");
      // small fade-out, then swap, then fade-in
      fadeRef.current = window.setTimeout(() => {
        setIdx((v) => (v + 1) % items.length);
        setPhase("in");
      }, 220);
    };

    timerRef.current = window.setInterval(tick, safeInterval);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (fadeRef.current) window.clearTimeout(fadeRef.current);
    };
  }, [items, safeInterval, reduced]);

  if (!items?.length) return null;

  return (
    <button
      type="button"
      className="insights-hero__qcard"
      onClick={() => current?.targetId && onPick?.(current.targetId)}
      aria-label={
        current?.targetId
          ? "Jump to the section that answers this question"
          : "Question prompt"
      }
    >
      <div className="insights-hero__qcard-top">
        <div className="insights-hero__qcard-kicker">Try a question</div>

        {/* tiny hint badge */}
        {current?.targetLabel ? (
          <div className="insights-hero__qcard-tag" aria-hidden="true">
            ↳ {current.targetLabel}
          </div>
        ) : null}
      </div>

      <div
        className={`insights-hero__qcard-question ${reduced ? "is-static" : phase === "out" ? "is-fadeout" : "is-fadein"
          }`}
      >
        {current?.text ?? ""}
      </div>

      <div className="insights-hero__qcard-cta">
        <span>Jump to answer</span>
        <span className="insights-hero__qcard-arrow" aria-hidden="true">
          →
        </span>
      </div>
    </button>
  );
}

function HeroMiniNav({ items, onPick }) {
  if (!items?.length) return null;

  return (
    <nav className="insights-hero__mininav" aria-label="Insights quick navigation">
      <div className="insights-hero__mininav-title">Navigate</div>
      <ul className="insights-hero__mininav-list">
        {items.map((it) => (
          <li key={it.id} className="insights-hero__mininav-item">
            <button
              type="button"
              className="insights-hero__mininav-link"
              onClick={() => onPick?.(it.id)}
            >
              <span className="insights-hero__mininav-dot" aria-hidden="true" />
              <span className="insights-hero__mininav-text">{it.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function InsightsHeroNew({
  title = "Congressional Activity Briefing",
  subtitle = "Clear, structured analysis of what Congress is doing — and where activity is shifting.",
  micro = "Data refreshed daily • February 2026",

  /**
   * If you already have stable section IDs, wire them here.
   * If not, you can keep these defaults and add matching ids in the page sections:
   *   <section id="insights-activity">...</section>
   *   <section id="insights-progress">...</section>
   *   <section id="insights-focus">...</section>
   *   <section id="insights-cta">...</section>
   */
  questionItems,
  navItems,
}) {
  const questions = useMemo(() => {
    return (
      questionItems ?? [
        {
          text: "Is Congress moving faster or slower than last month?",
          targetId: "insights-activity",
          targetLabel: "Legislative Activity",
        },
        {
          text: "Which topics are getting the most attention right now?",
          targetId: "insights-focus",
          targetLabel: "Topic Focus",
        },
        {
          text: "How often do introduced bills actually become law?",
          targetId: "insights-progress",
          targetLabel: "Progress",
        },
        {
          text: "Is the House or Senate driving most of the activity?",
          targetId: "insights-activity",
          targetLabel: "Activity • Chamber View",
        },
      ]
    );
  }, [questionItems]);

  const nav = useMemo(() => {
    return (
      navItems ?? [
        { id: "insights-activity", label: "Activity" },
        { id: "insights-progress", label: "Progress" },
        { id: "insights-focus", label: "Topic focus" },
        { id: "insights-cta", label: "Explore" },
      ]
    );
  }, [navItems]);

  return (
    <section className="insights-hero" aria-label="Insights hero">
      <div className="insights-hero__wash" aria-hidden="true" />
      <div className="insights-hero__sweep" aria-hidden="true" />

      <div className="insights-hero__bg" aria-hidden="true">
        <InsightsHeroBackground />
      </div>

      <div className="insights-story__container insights-hero__inner">
        <div className="insights-hero__grid">
          <div className="insights-hero__content">
            <div className="insights-hero__eyebrow">Welcome to your monthly briefing</div>

            <h1 className="insights-hero__title">{title}</h1>
            <p className="insights-hero__subtitle">{subtitle}</p>
            <div className="insights-hero__micro">{micro}</div>

            <div className="insights-hero__actions">
              <button
                type="button"
                className="insights-hero__primary"
                onClick={() => scrollToId(nav?.[0]?.id || "insights-activity")}
              >
                Start the briefing <span aria-hidden="true">↓</span>
              </button>

              <button
                type="button"
                className="insights-hero__secondary"
                onClick={() => scrollToId("insights-cta")}
              >
                Skip to explore
              </button>
            </div>

            <div className="insights-hero__cue">
              <span className="insights-hero__cue-line" aria-hidden="true" />
              <span className="insights-hero__cue-text">Scroll to begin</span>
            </div>
          </div>

          <aside className="insights-hero__aside" aria-label="Hero helpers">
            <RotatingQuestionCard
              items={questions}
              intervalMs={5200}
              onPick={(id) => scrollToId(id)}
            />
            <HeroMiniNav items={nav} onPick={(id) => scrollToId(id)} />
          </aside>
        </div>
      </div>
    </section>
  );
}