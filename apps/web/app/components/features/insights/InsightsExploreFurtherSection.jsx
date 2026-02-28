// apps/web/app/components/features/insights/InsightsExploreFurtherSection.jsx
"use client";

export default function InsightsExploreFurtherSection() {
    return (
        <section className="insights-explore" aria-label="Explore further">
            <div className="insights-explore__bg" aria-hidden="true">
                <div className="insights-explore__lines" />
            </div>

            <div className="insights-explore__inner">
                <h2 className="insights-explore__headline">Explore the data in more detail.</h2>
                <p className="insights-explore__sub">
                    View full interactive charts, browse bills, or compare chambers and timeframes.
                </p>

                <div className="insights-explore__actions">
                    <a className="insights-cta" href="/bills">Explore Bills</a>
                    <a className="insights-cta insights-cta--ghost" href="/topics">Topic Explorer</a>
                    <a className="insights-cta insights-cta--ghost" href="/archive">Historical Archive</a>
                    <button className="insights-cta insights-cta--ghost" type="button">
                        Download Monthly Snapshot (PDF/CSV)
                    </button>
                </div>
            </div>
        </section>
    );
}