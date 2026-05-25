import ReferenceResourceCard from "./ReferenceResourceCard";
import { RESOURCE_LINKS } from "./referenceContent";

const RESOURCE_GUIDE = [
    { label: "Start here", text: "Use vote.gov or USA.gov for basic voter guidance." },
    { label: "State-specific", text: "Use Can I Vote and the state lookup above for official state links." },
    { label: "Congressional", text: "Use Congress.gov for bill text, actions, sponsors, and committees." },
];

const QUICK_JUMPS = [
    ["#resource-vote-gov", "vote.gov"],
    ["#resource-can-i-vote", "Can I Vote"],
    ["#resource-congress-gov", "Congress.gov"],
    ["#reference-library", "Reference library"],
];

function slugify(value) {
    return `resource-${String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

export default function ReferenceResourceExplorer() {
    return (
        <section className="ll3-refExplorer" id="resources" aria-labelledby="resources-title">
            <div className="ll3-refExplorer__head">
                <p className="ll3-ref__eyebrow">Official source directory</p>
                <h2 id="resources-title">Explore official resources</h2>
                <p>Useful public sources that are worth keeping handy after you check state-specific voting links.</p>
            </div>

            <div className="ll3-refExplorer__layout">
                <aside className="ll3-refExplorer__rail" aria-label="Resource guide">
                    <div className="ll3-refExplorer__count">{RESOURCE_LINKS.length} official links</div>

                    <div className="ll3-refExplorer__guide">
                        {RESOURCE_GUIDE.map((item) => (
                            <div className="ll3-refExplorer__guideItem" key={item.label}>
                                <strong>{item.label}</strong>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>

                    <nav className="ll3-refExplorer__jumpNav" aria-label="Quick resource jumps">
                        <div className="ll3-refExplorer__filterTitle">Quick jump</div>
                        {QUICK_JUMPS.map(([href, label]) => <a href={href} key={href}>{label}</a>)}
                    </nav>
                </aside>

                <div className="ll3-refExplorer__grid">
                    {RESOURCE_LINKS.map((item) => <ReferenceResourceCard item={{ ...item, id: slugify(item.title) }} key={item.href} />)}
                </div>
            </div>
        </section>
    );
}
