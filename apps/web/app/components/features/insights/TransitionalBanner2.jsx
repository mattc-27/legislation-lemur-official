// apps/web/app/components/features/insights/TransitionalBanner2.jsx
"use client";

export default function TransitionalBanner2() {
  return (
    <section className="insights-banner insights-banner--topics">
      <div className="insights-banner__bg">
        <div className="insights-banner__vlines" />
        <div className="insights-banner__glow" />
      </div>

      <div className="insights-banner__inner">
        <div className="insights-banner__copy">
          <div className="insights-banner__kicker">Topic focus</div>
          <h2 className="insights-banner__headline">Where are bills clustering right now?</h2>
          <p className="insights-banner__sub">
            We highlight the highest-volume policy areas and how their shares are shifting against a baseline.
          </p>
        </div>
      </div>
    </section>
  );
}