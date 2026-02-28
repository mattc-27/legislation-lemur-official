// app/(site)/about/page.jsx

import { Search, BarChart2, ScrollText, LayoutGrid, Mail, Sparkles } from "lucide-react";
// import "../../../lib/stylesheets/legacy_refactor/home-styles.refactored.css";

import "@/app/styles/active/site/ll3.about.css";

import {
    ABOUT_TITLE,
    ABOUT_INTRO_PARAS,
    ABOUT_WHY_TITLE,
    ABOUT_WHY_PARAS,
    ABOUT_FEATURES_TITLE,
    ABOUT_FEATURES_ITEMS,
    ABOUT_FEATURES_NOTE,
    ABOUT_RECENT_TITLE,
    ABOUT_RECENT_SUB,
    ABOUT_RECENT_BADGE,
    ABOUT_RECENT_ITEMS,
    ABOUT_HOW_TITLE,
    ABOUT_HOW_ITEMS,
    ABOUT_STACK_NOTE,
    ABOUT_ROADMAP_TITLE,
    ABOUT_ROADMAP_PARAS,
    ABOUT_ROADMAP_ITEMS,
    ABOUT_LAST_UPDATED,
} from "../../../lib/content/aboutContent"; // adjust path if needed


export const metadata = {
    title: "About • Legislation Lemur",
    description: "What Legislation Lemur is, why it exists, and where it’s headed.",
};

export default function AboutPage() {
    return (
        <div className="container about stack-24">
            {/* Intro */}
            <section className="section">
                <div className="panel about__intro" data-anim="fade-up" style={{ "--i": 0 }}>
                    <h1 className="section__title">{ABOUT_TITLE}</h1>

                    {ABOUT_INTRO_PARAS.map((text, i) => (
                        <p key={i} className="section__sub about__lede reg">
                            {text}
                        </p>
                    ))}
                </div>
            </section>

            {/* Media block A: Current features + image */}
            <section className="section about__media about__media--a">
                <div className="panel about__media-inner">
                    <div className="about__media-text" data-anim="fade-up" style={{ "--i": 0 }}>
                        <h2 className="section__title">{ABOUT_FEATURES_TITLE}</h2>

                        <ul className="icon-list">
                            <li className="icon-list__item">
                                <Search className="icon-list__icon" size={20} />
                                <span>{ABOUT_FEATURES_ITEMS[0]}</span>
                            </li>
                            <li className="icon-list__item">
                                <LayoutGrid className="icon-list__icon" size={20} />
                                <span>{ABOUT_FEATURES_ITEMS[1]}</span>
                            </li>
                            <li className="icon-list__item">
                                <ScrollText className="icon-list__icon" size={20} />
                                <span>{ABOUT_FEATURES_ITEMS[2]}</span>
                            </li>
                        </ul>

                        {ABOUT_FEATURES_NOTE ? (
                            <p className="text-dim about__small">{ABOUT_FEATURES_NOTE}</p>
                        ) : null}
                    </div>

                    <figure className="about__media-art" data-anim="fade-up" style={{ "--i": 1 }}>
                        <img
                            src="https://storage.googleapis.com/legislation-lemur-images/lemur_illustration.png"
                            alt="Legislation Lemur in the stacks—brand illustration"
                            className="about__img"
                            loading="lazy"
                        />
                    </figure>
                </div>
            </section>

            {/* Recently added */}
            <section className="section">
                <div className="panel card--p-24" data-anim="fade-up" style={{ "--i": 0 }}>
                    <div className="about__recent-head">
                        <span className="badge badge--new">{ABOUT_RECENT_BADGE}</span>
                        <h2 className="section__title">{ABOUT_RECENT_TITLE}</h2>
                    </div>

                    {ABOUT_RECENT_SUB ? (
                        <p className="about__lede reg" style={{ maxWidth: "98%" }}>
                            {ABOUT_RECENT_SUB}
                        </p>
                    ) : null}

                    <ul className="checklist about__lede" style={{ maxWidth: "98%" }}>
                        {ABOUT_RECENT_ITEMS.map((item) => (
                            <li key={item.label}>
                                {item.href ? (
                                    <a className="about-inline-link" href={item.href}>
                                        {item.label}
                                    </a>
                                ) : (
                                    item.label
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Media block B: Why it exists */}
            <section className="section about__media about__media--b">
                <div className="panel about__media-inner">
                    <div className="about__media-text" data-anim="fade-up" style={{ "--i": 0 }}>
                        <h2 className="section__title">{ABOUT_WHY_TITLE}</h2>

                        {ABOUT_WHY_PARAS.map((text, i) => (
                            <p key={i} className="about__lede reg" style={{ maxWidth: "98%" }}>
                                {text}
                            </p>
                        ))}

                        <p className="about__small">{ABOUT_LAST_UPDATED}</p>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="section">
                <div className="panel card--p-24" data-anim="fade-up" style={{ "--i": 0 }}>
                    <h2 className="section__title">{ABOUT_HOW_TITLE}</h2>

                    <ol className="about__steps about__lede reg" style={{ maxWidth: "98%" }}>
                        {ABOUT_HOW_ITEMS.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ol>

                    {ABOUT_STACK_NOTE ? <p className="text-dim about__small">{ABOUT_STACK_NOTE}</p> : null}
                </div>
            </section>

            {/* Roadmap (aligned w/ Home) */}
            <section className="section">
                <div className="panel card--p-24" data-anim="fade-up" style={{ "--i": 0 }}>
                    <h2 className="section__title">{ABOUT_ROADMAP_TITLE}</h2>

                    {ABOUT_ROADMAP_PARAS?.map((text, i) => (
                        <p key={i} className="about__lede reg" style={{ maxWidth: "98%" }}>
                            {text}
                        </p>
                    ))}

                    <div className="roadmap">
                        <div className="roadmap__col">
                            <div className="roadmap__head">
                                <div className="roadmap__kicker">Now</div>
                                <div className="roadmap__hint">Core pages + clarity</div>
                            </div>
                            <ul className="roadmap__list">
                                {ABOUT_ROADMAP_ITEMS.slice(0, 2).map((item) => (
                                    <li key={item} className="roadmap__item">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="roadmap__col">
                            <div className="roadmap__head">
                                <div className="roadmap__kicker">Next</div>
                                <div className="roadmap__hint">Comparisons + dashboards</div>
                            </div>
                            <ul className="roadmap__list">
                                {ABOUT_ROADMAP_ITEMS.slice(2, 4).map((item) => (
                                    <li key={item} className="roadmap__item">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="roadmap__col">
                            <div className="roadmap__head">
                                <div className="roadmap__kicker">Later</div>
                                <div className="roadmap__hint">Personalization + elections</div>
                            </div>
                            <ul className="roadmap__list">
                                {ABOUT_ROADMAP_ITEMS.slice(4).map((item) => (
                                    <li key={item} className="roadmap__item">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Tiny “what’s coming” cue icons (subtle) */}
                    <div className="about__roadmap-icons" aria-hidden="true">
                        <span className="about__roadmap-icon"><Mail size={16} /></span>
                        <span className="about__roadmap-icon"><Sparkles size={16} /></span>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="section">
                <div className="panel card--p-24" data-anim="fade-up" style={{ "--i": 0 }}>
                    <h2 className="section__title">Contact</h2>
                    <p className="reg">
                        Questions, corrections, or data issues?{" "}
                        <a className="link" href="mailto:a.dev@gmail.com">
                            Send me a message
                        </a>
                        .
                    </p>
                </div>
            </section>
        </div>
    );
}