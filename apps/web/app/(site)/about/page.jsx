import Link from "next/link";
import { BarChart3, BookOpenText, Database, Layers3, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { ABOUT_CONTENT } from "@/lib/content/aboutContent";

import "@/app/styles/active/core/ll3.tokens.css";
import "@/app/styles/active/core/ll3.type.css";
import "@/app/styles/active/core/ll3.buttons.css";
import "@/app/styles/active/core/ll3.forms.css";
import "@/app/styles/active/core/ll3.cards.css";
import "@/app/styles/active/core/ll3.filters.css";
import "@/app/styles/active/core/ll3.layout.css";
//import "@/app/styles/active/core/ll3.ui.css";
import "@/app/styles/active/site/ll3.about.css";

export const metadata = {
    title: "About • Legislation Lemur",
    description: "What Legislation Lemur is, why it exists, how it works, and where it is headed.",
};

const featureIcons = [Search, Layers3, BookOpenText, BarChart3, Database, ShieldCheck, RefreshCw];
const processIcons = [Database, Layers3, RefreshCw, BarChart3, BookOpenText];

function Paragraphs({ items, className = "ll3-type-body about__copy" }) {
    return (
        <div className={className}>
            {items.map((text) => (
                <p key={text}>{text}</p>
            ))}
        </div>
    );
}

function IconList({ items, icons = [] }) {
    return (
        <ul className="about__iconList">
            {items.map((item, index) => {
                const Icon = icons[index] || ShieldCheck;
                return (
                    <li key={item} className="about__iconListItem">
                        <span className="about__iconListMark" aria-hidden="true">
                            <Icon size={18} strokeWidth={2.25} />
                        </span>
                        <span>{item}</span>
                    </li>
                );
            })}
        </ul>
    );
}

function TextPanel({ eyebrow, title, paragraphs, children, note }) {
    return (
        <section className="ll3-card about__panel">
            <div className="ll3-eyebrow">{eyebrow}</div>
            <h2 className="ll3-sectionTitle about__sectionTitle">{title}</h2>
            {paragraphs?.length ? <Paragraphs items={paragraphs} /> : null}
            {children}
            {note ? <p className="ll3-type-small about__note">{note}</p> : null}
        </section>
    );
}

export default function AboutPage() {
    const { hero, why, features, summaries, how, roadmap, lastUpdated } = ABOUT_CONTENT;

    return (
        <main className="about">
            <section className="about__hero">
                <div className="ll3-pageShell about__heroGrid">
                    <div className="about__heroCopy">
                        <div className="ll3-eyebrow">{hero.eyebrow}</div>
                        <h1 className="ll3-pageTitle about__heroTitle">{hero.title}</h1>
                        <Paragraphs items={hero.paragraphs} className="ll3-type-lede about__heroText" />
                    </div>

                    <aside className="ll3-card about__heroCard" aria-label="Platform principles">
                        <div className="about__principle">
                            <span className="about__principleDot" />
                            <div>
                                <h2>Clarity</h2>
                                <p>Readable interfaces for dense congressional information.</p>
                            </div>
                        </div>
                        <div className="about__principle">
                            <span className="about__principleDot" />
                            <div>
                                <h2>Neutrality</h2>
                                <p>Fact-first presentation without partisan framing.</p>
                            </div>
                        </div>
                        <div className="about__principle">
                            <span className="about__principleDot" />
                            <div>
                                <h2>Traceability</h2>
                                <p>Built around official sources and structured public data.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            <div className="ll3-pageShell about__stack">
                <TextPanel eyebrow={why.eyebrow} title={why.title} paragraphs={why.paragraphs} />

                <section className="about__split">
                    <div className="ll3-card about__panel about__panel--featureLead">
                        <div className="ll3-eyebrow">{features.eyebrow}</div>
                        <h2 className="ll3-sectionTitle about__sectionTitle">{features.title}</h2>
                        <IconList items={features.items} icons={featureIcons} />
                    </div>

                    <aside className="ll3-card about__callout">
                        <h3>Feature note</h3>
                        <p>{features.note}</p>
                        <Link href="/references" className="ll3-btn ll3-btn--secondary about__calloutLink">
                            Open Reference / Wiki
                        </Link>
                    </aside>
                </section>

                <section className="about__twoCol">
                    <TextPanel eyebrow={summaries.eyebrow} title={summaries.title} paragraphs={summaries.paragraphs} />

                    <TextPanel eyebrow={how.eyebrow} title={how.title} note={how.note}>
                        <IconList items={how.items} icons={processIcons} />
                    </TextPanel>
                </section>

                <section className="ll3-card about__panel about__roadmap">
                    <div className="about__roadmapIntro">
                        <div className="ll3-eyebrow">{roadmap.eyebrow}</div>
                        <h2 className="ll3-sectionTitle about__sectionTitle">{roadmap.title}</h2>
                        <Paragraphs items={roadmap.paragraphs} />
                    </div>

                    <ul className="about__roadmapGrid">
                        {roadmap.items.map((item) => (
                            <li key={item} className="about__roadmapItem">
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                <p className="ll3-type-small about__updated">{lastUpdated}</p>
            </div>
        </main>
    );
}
