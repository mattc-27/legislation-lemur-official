import ReferenceSectionHeader from "./ReferenceSectionHeader";
import ReferenceResourceCard from "./ReferenceResourceCard";

const RESOURCE_LINKS = [
  { label: "Federal registration portal", category: "Voting", title: "vote.gov", desc: "Start registration, check registration options, and find official state-specific voting guidance.", href: "https://vote.gov/", cta: "Open vote.gov" },
  { label: "Federal voting hub", category: "Voting", title: "USA.gov Voting & Elections", desc: "Plain-language federal guidance for registration, voting, election process basics, and voter rights.", href: "https://www.usa.gov/voting-and-elections", cta: "Open USA.gov" },
  { label: "Mail and absentee voting", category: "Voting", title: "USA.gov Absentee Voting", desc: "Dedicated federal resource for absentee and mail voting basics, with links to state instructions.", href: "https://www.usa.gov/absentee-voting", cta: "Open absentee guide" },
  { label: "State election offices", category: "Voting", title: "Can I Vote", desc: "A state-by-state directory from the National Association of Secretaries of State.", href: "https://www.nass.org/can-I-vote", cta: "Open Can I Vote" },
  { label: "State law comparisons", category: "Election law", title: "NCSL Elections & Campaigns", desc: "State-by-state voting law resources, election administration explainers, and policy comparisons.", href: "https://www.ncsl.org/elections-and-campaigns", cta: "Open NCSL" },
  { label: "Federal legislation", category: "Congress", title: "Congress.gov", desc: "The authoritative federal source for bill text, actions, sponsors, committees, and legislative status.", href: "https://www.congress.gov/", cta: "Open Congress.gov" },
];

export default function ReferenceResourceGrid() {
  return (
    <section className="ll3-refResources" aria-labelledby="official-links-title">
      <ReferenceSectionHeader eyebrow="Practical resources" title="Official links worth keeping handy" id="official-links-title">
        Useful links that do not depend on state-level scraper data. State-specific routing can expand as the EAC link dataset grows.
      </ReferenceSectionHeader>
      <div className="ll3-refResources__grid">
        {RESOURCE_LINKS.map((item) => <ReferenceResourceCard item={item} key={item.href} />)}
      </div>
    </section>
  );
}
