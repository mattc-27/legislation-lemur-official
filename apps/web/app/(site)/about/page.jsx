import {
    Search,
    LayoutGrid,
    ScrollText,
    Mail,
    Sparkles,
    ArrowRight,
} from "lucide-react";

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
} from "../../../lib/content/aboutContent";

export const metadata = {
    title: "About • Legislation Lemur",
    description: "What Legislation Lemur is, why it exists, and where it’s headed.",
};

export default function AboutPage() {
    return (
        <div className="container about">
            <div className="about__stack">
                <section className="section about__hero">
                    <div className="about__hero-grid">
                        <div className="about__hero-copy" data-anim="fade-up" style={{ "--i": 0 }}>
                            <div className="section__eyebrow">About the platform</div>
                            <h1 className="section__title about__hero-title">{ABOUT_TITLE}</h1>

                            <div className="about__hero-body">
                                {ABOUT_INTRO_PARAS.map((text, i) => (
                                    <p key={i} className="section__sub about__lede reg">
                                        {text}
                                    </p>
                                ))}
                            </div>
                        </div>

                        <div className="about__hero-visual" data-anim="fade-up" style={{ "--i": 1 }}>
                            <img
                                src="https://storage.googleapis.com/legislation-lemur-images/lemur_illustration.png"
                                alt="Legislation Lemur brand illustration"
                                className="about__hero-img"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </section>

                <section className="section about__feature-band" aria-label="Current features">
                    <div className="about__feature-band-grid">
                        <div className="panel about__feature-lead" data-anim="fade-up" style={{ "--i": 0 }}>
                            <div className="section__eyebrow">Current capabilities</div>
                            <h2 className="section__title about__section-title">{ABOUT_FEATURES_TITLE}</h2>

                            <ul className="icon-list">
                                <li className="icon-list__item">
                                    <Search className="icon-list__icon" size={19} />
                                    <span>{ABOUT_FEATURES_ITEMS[0]}</span>
                                </li>
                                <li className="icon-list__item">
                                    <LayoutGrid className="icon-list__icon" size={19} />
                                    <span>{ABOUT_FEATURES_ITEMS[1]}</span>
                                </li>
                                <li className="icon-list__item">
                                    <ScrollText className="icon-list__icon" size={19} />
                                    <span>{ABOUT_FEATURES_ITEMS[2]}</span>
                                </li>
                            </ul>

                            {ABOUT_FEATURES_NOTE ? (
                                <p className="text-dim about__small">{ABOUT_FEATURES_NOTE}</p>
                            ) : null}
                        </div>

                        <div className="about__feature-cards" data-anim="fade-up" style={{ "--i": 1 }}>
                            <article className="about-tile about-tile--primary">
                                <div className="about-tile__inner">
                                    <h3 className="about-tile__title">Clean exploration</h3>
                                    <p className="about-tile__desc">
                                        Browse people, bills, and activity in a more readable interface built
                                        around scanning, context, and clarity.
                                    </p>
                                    <span className="about-tile__cta">Explore the platform</span>
                                </div>
                            </article>

                            <article className="about-tile">
                                <div className="about-tile__inner">
                                    <h3 className="about-tile__title">Source-aware structure</h3>
                                    <p className="about-tile__desc">
                                        Legislative data is organized into views and summaries that are easier
                                        to revisit than raw government pages and PDFs.
                                    </p>
                                </div>
                            </article>

                            <article className="about-tile">
                                <div className="about-tile__inner">
                                    <h3 className="about-tile__title">Neutral presentation</h3>
                                    <p className="about-tile__desc">
                                        The goal is not spin, persuasion, or outrage — just clearer access to
                                        what is happening and where it comes from.
                                    </p>
                                </div>
                            </article>

                            <article className="about-tile">
                                <div className="about-tile__inner">
                                    <h3 className="about-tile__title">Iterative by design</h3>
                                    <p className="about-tile__desc">
                                        The platform is still evolving, with refinements to readability,
                                        navigation, and data coverage happening over time.
                                    </p>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="section">
                    <div className="panel about__panel" data-anim="fade-up" style={{ "--i": 0 }}>
                        <div className="about__recent-head">
                            <span className="badge badge--new">{ABOUT_RECENT_BADGE}</span>
                            <h2 className="section__title about__section-title">{ABOUT_RECENT_TITLE}</h2>
                        </div>

                        {ABOUT_RECENT_SUB ? (
                            <p className="about__lede reg">
                                {ABOUT_RECENT_SUB}
                            </p>
                        ) : null}

                        <ul className="checklist about__lede">
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

                <section className="section">
                    <div className="panel about__panel" data-anim="fade-up" style={{ "--i": 0 }}>
                        <div className="section__eyebrow">Why it exists</div>
                        <h2 className="section__title about__section-title">{ABOUT_WHY_TITLE}</h2>

                        <div className="about__copy">
                            {ABOUT_WHY_PARAS.map((text, i) => (
                                <p key={i} className="about__lede reg">
                                    {text}
                                </p>
                            ))}
                        </div>

                        <p className="about__small">{ABOUT_LAST_UPDATED}</p>
                    </div>
                </section>

                <section className="section">
                    <div className="panel about__panel" data-anim="fade-up" style={{ "--i": 0 }}>
                        <div className="section__eyebrow">How it works</div>
                        <h2 className="section__title about__section-title">{ABOUT_HOW_TITLE}</h2>

                        <ol className="about__steps">
                            {ABOUT_HOW_ITEMS.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ol>

                        {ABOUT_STACK_NOTE ? <p className="text-dim about__small">{ABOUT_STACK_NOTE}</p> : null}
                    </div>
                </section>

                <section className="section">
                    <div className="panel about__panel" data-anim="fade-up" style={{ "--i": 0 }}>
                        <div className="section__eyebrow">Roadmap</div>
                        <h2 className="section__title about__section-title">{ABOUT_ROADMAP_TITLE}</h2>

                        {ABOUT_ROADMAP_PARAS?.map((text, i) => (
                            <p key={i} className="about__lede reg">
                                {text}
                            </p>
                        ))}

                        <div className="about-roadmap">
                            <div className="about-roadmap__col">
                                <div className="about-roadmap__head">
                                    <div className="about-roadmap__kicker">Now</div>
                                    <div className="about-roadmap__hint">Core pages + clarity</div>
                                </div>
                                <ul className="about-roadmap__list">
                                    {ABOUT_ROADMAP_ITEMS.slice(0, 2).map((item) => (
                                        <li key={item} className="about-roadmap__item">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="about-roadmap__col">
                                <div className="about-roadmap__head">
                                    <div className="about-roadmap__kicker">Next</div>
                                    <div className="about-roadmap__hint">Comparisons + dashboards</div>
                                </div>
                                <ul className="about-roadmap__list">
                                    {ABOUT_ROADMAP_ITEMS.slice(2, 4).map((item) => (
                                        <li key={item} className="about-roadmap__item">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="about-roadmap__col">
                                <div className="about-roadmap__head">
                                    <div className="about-roadmap__kicker">Later</div>
                                    <div className="about-roadmap__hint">Personalization + elections</div>
                                </div>
                                <ul className="about-roadmap__list">
                                    {ABOUT_ROADMAP_ITEMS.slice(4).map((item) => (
                                        <li key={item} className="about-roadmap__item">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="about__roadmap-icons" aria-hidden="true">
                            <span className="about__roadmap-icon"><Mail size={16} /></span>
                            <span className="about__roadmap-icon"><Sparkles size={16} /></span>
                        </div>
                    </div>
                </section>

                <section className="section">
                    <div className="panel about__panel about__contact" data-anim="fade-up" style={{ "--i": 0 }}>
                        <div>
                            <div className="section__eyebrow">Contact</div>
                            <h2 className="section__title about__section-title">Questions or corrections</h2>
                            <p className="section__sub about__contact-copy">
                                Questions, corrections, or data issues? Send a message and I’ll take a look.
                            </p>
                        </div>

                        <a className="about__contact-link" href="mailto:a.dev@gmail.com">
                            Send me a message
                            <ArrowRight size={15} strokeWidth={2} />
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}