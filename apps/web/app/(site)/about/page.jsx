// app/(site)/about/page.jsx
import { Search, BarChart2, GitBranch, ScrollText } from "lucide-react";
import "../../../lib/stylesheets/refactored/home-styles.refactored.css";
import "../../../lib/stylesheets/refactored/about-styles.refactored.css";

export const metadata = {
    title: "About • Legislation Lemur",
    description:
        "What Legislation Lemur is, why it exists, and where it’s headed.",
};

export default function AboutPage() {
    const today = new Date().toLocaleDateString();

    return (
        <div className="container about stack-24">
            {/* Intro */}
            <section className="section">
                <div
                    className="panel about__intro"
                    data-anim="fade-up"
                    style={{ "--i": 0 }}
                >
                    <h1 className="section__title">About Legislation Lemur</h1>
                    <p className="section__sub about__lede reg">
                        Legislation Lemur is a lightweight, in-progress civic data project built around clarity and trust. Today, it focuses on a few core things: helping you look up current members of Congress, view a clean profile with essential details, explore recent sponsored and co-sponsored bills, and see a neutral snapshot of how Congress is composed this session.
                    </p>
                    <p className="section__sub about__lede reg" >
                        This early version intentionally keeps the surface small while the data infrastructure matures. Now that the pipeline for members, bills, and votes is in place, new views and visualizations will be added gradually on top of the same fact-first foundation.
                    </p>
                </div>
            </section>

            {/* Media block A: What it is (text) + library lemur (image) */}
            <section className="section about__media about__media--a">
                <div className="panel about__media-inner">
                    <div
                        className="about__media-text"
                        data-anim="fade-up"
                        style={{ "--i": 0 }}
                    >
                        <h2 className="section__title">Current Features (more in coming soon!)</h2>
                        <ul className="icon-list">
                            <li className="icon-list__item">
                                <Search className="icon-list__icon00" size={20} />
                                <span>
                                    Search current members of Congress by name or browse by state.
                                </span>
                            </li>
                            <li className="icon-list__item">
                                <BarChart2 className="icon-list__icon" size={20} />
                                <span>
                                    View a high-level snapshot of Congress composition, demographics, and chamber structure.
                                </span>
                            </li>
                            <li className="icon-list__item">
                                <ScrollText className="icon-list__icon" size={20} />
                                <span>
                                    Open a member profile with core details, recent bills, and voting activity.
                                </span>
                            </li>
                        </ul>

                    </div>

                    <figure
                        className="about__media-art"
                        data-anim="fade-up"
                        style={{ "--i": 1 }}
                    >
                        <img
                            // src="/lemur-images/lemur_illustration.png"
                            src="https://storage.googleapis.com/legislation-lemur-images/lemur_illustration.png"
                            alt="Legislation Lemur in the stacks—brand illustration"
                            className="about__img"
                            loading="lazy"
                        />
                    </figure>
                </div>
            </section>

            {/* Media block B: Why it exists */}
            <section className="section about__media about__media--b">
                <div className="panel about__media-inner">
                    <div
                        className="about__media-text"
                        data-anim="fade-up"
                        style={{ "--i": 1 }}
                    >
                        <h2 className="section__title">Why it exists</h2>
                        <p className="about__lede reg" style={{ maxWidth: '98%' }}>
                            Legislation Lemur began as a way to practice real-world data engineering, interface design, and civic visualization—while contributing something practical: a quieter, cleaner path to understanding how Congress works. No commentary, no outrage cycles. Just accessible facts: who represents you, what they’ve sponsored, and how the institution is structured this session.
                        </p>
                        <p className="about__lede reg" style={{ maxWidth: '98%' }}>
                            “Lemur” stuck for its symbolism—curiosity and persistence—which fits both the data work behind the scenes and the broader civic goal: participation is easier when information is accessible, neutral, and well-designed.
                        </p>
                        <p className="about__small">Last updated: {today}</p>
                    </div>
                </div>
            </section>

            {/* How it works (today’s pipeline) */}
            <section className="section">
                <div
                    className="panel card--p-24"
                    data-anim="fade-up"
                    style={{ "--i": 0 }}
                >
                    <h2 className="section__title">How it works (at a high level)</h2>
                    <ol className="about__steps about__lede reg" style={{ maxWidth: '98%' }}>
                        <li>
                            <strong>Collect</strong> data from official congressional sources and structured APIs.
                        </li>
                        <li>
                            <strong>Normalize</strong> members, bills, votes, and session data into consistent, query-friendly shapes.
                        </li>
                        <li>
                            <strong>Cache</strong> frequently accessed pages for fast, stable performance.
                        </li>
                        <li>
                            <strong>Surface</strong> clear, minimal UIs that prioritize comprehension over noise.
                        </li>
                    </ol>
                    <p className="text-dim about__small">
                        Built with Next.js (App Router), server-rendered React, and a growing ingestion pipeline powered by mirrored databases, scheduled updates, and data validation.
                    </p>
                </div>
            </section>

            {/* Roadmap: where it’s headed */}
            <section className="section">
                <div
                    className="panel card--p-24"
                    data-anim="fade-up"
                    style={{ "--i": 0 }}
                >
                    <h2 className="section__title">Roadmap</h2>
                    <p className="about__lede reg" style={{ maxWidth: '98%' }}>
                        This early version keeps the feature set focused. As the foundation solidifies, Legislation Lemur will grow into a clearer, more complete window into the legislative landscape.
                    </p>
                    <ul className="list list--bullets">
                        <li>
                            Richer member pages: committees, voting patterns, issue clusters, and timelines
                        </li>
                        <li>
                            Expanded Congress composition: deeper filters, demographic trends, longitudinal views
                        </li>
                        <li>
                            Interactive bill timelines: progress through committees and floor actions
                        </li>
                        <li>
                            Compare view: side-by-side member metrics, votes, and sponsored bill patterns
                        </li>
                        <li>
                            Saved members & states for quick access
                        </li>
                        <li>
                            Email digests (opt-in): weekly summaries of your representatives, key votes, and new bills
                        </li>
                        <li>
                            Election resources for 2026: judicial reviews, proposition summaries, and data-driven voter guides
                        </li>
                        <li>Expanded coverage for Session 2 of the 119th Congress, starting January 7, 2026</li>
                    </ul>
                </div>
            </section>

            {/* Contact */}
            <section className="section">
                <div
                    className="panel card--p-24"
                    data-anim="fade-up"
                    style={{ "--i": 0 }}
                >
                    <h2 className="section__title">Contact</h2>
                    <p>
                        Questions, corrections, or data issues?{" "}
                        <a
                            className="link"
                            href="mailto:mattc27.dev@gmail.com"
                        >
                            Send me a message
                        </a>
                        .
                    </p>
                </div>
            </section>
        </div>
    );
}
