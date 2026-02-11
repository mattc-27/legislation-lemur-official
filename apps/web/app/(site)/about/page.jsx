// app/(site)/about/page.jsx
import { Search, BarChart2, ScrollText } from "lucide-react";
// import "../../../lib/stylesheets/legacy_refactor/home-styles.refactored.css";

import "@/app/styles/active/about.ll3.css";

import {
    ABOUT_TITLE,
    ABOUT_INTRO_PARAS,
    ABOUT_WHY_TITLE,
    ABOUT_WHY_PARAS,
    ABOUT_FEATURES_TITLE,
    ABOUT_FEATURES_ITEMS,
    ABOUT_FEATURES_NOTE,
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

            {/* Media block A: Current features + library lemur image */}
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
                                <BarChart2 className="icon-list__icon" size={20} />
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

            {/* Roadmap */}
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
                                <div className="roadmap__hint">Core pages + stability</div>
                            </div>
                            <ul className="roadmap__list">
                                {ABOUT_ROADMAP_ITEMS.slice(0, 3).map((item) => (
                                    <li key={item} className="roadmap__item">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="roadmap__col">
                            <div className="roadmap__head">
                                <div className="roadmap__kicker">Next</div>
                                <div className="roadmap__hint">Comparison + personalization</div>
                            </div>
                            <ul className="roadmap__list">
                                {ABOUT_ROADMAP_ITEMS.slice(3, 6).map((item) => (
                                    <li key={item} className="roadmap__item">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="roadmap__col">
                            <div className="roadmap__head">
                                <div className="roadmap__kicker">Later</div>
                                <div className="roadmap__hint">Broader coverage</div>
                            </div>
                            <ul className="roadmap__list">
                                {ABOUT_ROADMAP_ITEMS.slice(6).map((item) => (
                                    <li key={item} className="roadmap__item">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
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
