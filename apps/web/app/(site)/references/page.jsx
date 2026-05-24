import StateVotingLookup from "@/app/components/features/reference/StateVotingLookup";
import stateVotingLinks from "@/lib/utils/eac-state-voting-links.json";
import ReferenceHubHero from "@/app/components/features/reference/ReferenceHubHero";
import ReferenceResourceExplorer from "@/app/components/features/reference/ReferenceResourceExplorer";
import BillPrefixTable from "@/app/components/features/reference/BillPrefixTable";
import ReferenceTermGroup from "@/app/components/features/reference/ReferenceTermGroup";
import { TERM_GROUPS } from "@/app/components/features/reference/referenceContent";

import "@/app/styles/active/site/ll3.reference.css";
import "@/app/styles/active/site/ll3.reference.cards.css";
import "@/app/styles/active/site/ll3.reference.voting.css";

const TOC_LINKS = [
  ["state-voting-lookup", "State voting resources"],
  ["bill-prefixes", "Bill prefixes"],
  ["committee-types", "Committee types"],
  ["congress-basics", "Congress basics"],
  ["procedure-terms", "Procedure terms"],
  ["bill-signals", "Impact & trending signals"],
];

export default function ReferencePage() {
  return (
    <main className="ll3-ref" id="top">
      <ReferenceHubHero />

      <div className="ll3-refPageShell">
        <section className="ll3-refFeatured" aria-labelledby="state-voting-title">
          <StateVotingLookup states={stateVotingLinks} />
        </section>

        <ReferenceResourceExplorer />

        <section className="ll3-refLibrary" id="reference-library" aria-labelledby="reference-library-title">
          <div className="ll3-refLibrary__intro">
            <p className="ll3-ref__eyebrow">Congressional reference</p>
            <h2 id="reference-library-title">Reference library</h2>
            <p>Plain-language notes for common congressional terms you’ll see in bill listings, committee pages, and legislative timelines.</p>
          </div>

          <div className="ll3-refLibrary__layout">
            <aside className="ll3-refLibrary__toc" aria-label="Reference library sections">
              <div>On this page</div>
              {TOC_LINKS.map(([href, label]) => <a href={`#${href}`} key={href}>{label}</a>)}
              <a href="#top" className="ll3-refLibrary__top">Back to top ↑</a>
            </aside>

            <div className="ll3-refLibrary__content">
              <BillPrefixTable />
              {TERM_GROUPS.map((group) => <ReferenceTermGroup group={group} key={group.id} />)}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
