//

import {
    Vote,
    FileText,
    Landmark,
    Sparkles,
} from "lucide-react";

const CATEGORIES = [
    {
        icon: Vote,
        title: "Voting resources",
        desc: "Registration, status checks, absentee voting, and election office links.",
        href: "#state-voting-lookup",
    },
    {
        icon: FileText,
        title: "Bill basics",
        desc: "Prefixes, statuses, actions, and timeline language.",
        href: "#reference-library",
    },
    {
        icon: Landmark,
        title: "Committees",
        desc: "Standing, select, special, joint, and conference committees.",
        href: "#committee-types",
    },
    {
        icon: Sparkles,
        title: "Signals",
        desc: "How to read LL impact and trending notes without over-interpreting them.",
        href: "#bill-signals",
    },
];
export default function ReferenceHubHero() {
    return (
        <section className="ll3-refHubHero" aria-labelledby="reference-title">
            <div className="ll3-refHubHero__inner">
                <div className="ll3-refHubHero__topline">Voting resources & civic reference</div>
                <h1 id="reference-title">Reference Center</h1>
                <p>Official links, civic shortcuts, and plain-language explanations for understanding Congress and voting resources.</p>
                <a className="ll3-refHubHero__button" href="#state-voting-lookup">
                    <span>Find state voting links</span>
                    <small aria-hidden="true">↓</small>
                </a>

                <div className="ll3-refHubHero__divider" />

                <div
                    className="ll3-refHubHero__categories"
                    aria-label="Reference categories"
                >
                    {CATEGORIES.map((item) => {
                        const Icon = item.icon;

                        return (
                            <a
                                href={item.href}
                                className="ll3-refHubHero__category"
                                key={item.title}
                            >
                                <span
                                    className="ll3-refHubHero__categoryIcon"
                                    aria-hidden="true"
                                >
                                    <Icon strokeWidth={1.8} />
                                </span>

                                <strong>{item.title}</strong>
                                <em>{item.desc}</em>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
