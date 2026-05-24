export const RESOURCE_CATEGORIES = [
  {
    label: "Voting",
    title: "Voting resources",
    desc: "Registration, status checks, absentee voting, and state election office links.",
    href: "#state-voting-lookup",
  },
  {
    label: "Bills",
    title: "Bill tracking basics",
    desc: "Prefixes, procedural status labels, and the terms that appear in bill timelines.",
    href: "#bill-prefixes",
  },
  {
    label: "Committees",
    title: "Committee reference",
    desc: "Standing, select, special, joint, and conference committee language.",
    href: "#committee-types",
  },
  {
    label: "Signals",
    title: "LL methodology notes",
    desc: "How to read experimental signals like Impact and Trending without over-interpreting them.",
    href: "#bill-signals",
  },
];

export const QUICK_LINKS = [
  {
    eyebrow: "Step 1",
    title: "Register or check status",
    desc: "Use the official federal portal to start registration or confirm state-specific options.",
    href: "https://vote.gov/",
    cta: "Open vote.gov",
  },
  {
    eyebrow: "Step 2",
    title: "Review deadlines and rules",
    desc: "Find your state election office, ID rules, early voting, and mail voting details.",
    href: "https://www.nass.org/can-I-vote",
    cta: "Open Can I Vote",
  },
  {
    eyebrow: "Step 3",
    title: "Preview ballots and elections",
    desc: "Check upcoming elections, ballot measures, and candidate information before election day.",
    href: "https://ballotpedia.org/",
    cta: "Open Ballotpedia",
  },
];

export const RESOURCE_LINKS = [
  {
    category: "Voting",
    label: "Federal registration portal",
    title: "vote.gov",
    desc: "Start registration, check registration options, and find official state-specific voting guidance.",
    href: "https://vote.gov/",
    cta: "Open vote.gov",
  },
  {
    category: "Voting",
    label: "Federal voting hub",
    title: "USA.gov Voting & Elections",
    desc: "Plain-language federal guidance for registration, voting, election process basics, and voter rights.",
    href: "https://www.usa.gov/voting-and-elections",
    cta: "Open USA.gov",
  },
  {
    category: "Voting",
    label: "Mail and absentee voting",
    title: "USA.gov Absentee Voting",
    desc: "Dedicated federal resource for absentee and mail voting basics, with links to state instructions.",
    href: "https://www.usa.gov/absentee-voting",
    cta: "Open absentee guide",
  },
  {
    category: "Voting",
    label: "State election offices",
    title: "Can I Vote",
    desc: "A state-by-state directory from the National Association of Secretaries of State.",
    href: "https://www.nass.org/can-I-vote",
    cta: "Open Can I Vote",
  },
  {
    category: "Election law",
    label: "State law comparisons",
    title: "NCSL Elections & Campaigns",
    desc: "State-by-state voting law resources, election administration explainers, and policy comparisons.",
    href: "https://www.ncsl.org/elections-and-campaigns",
    cta: "Open NCSL",
  },
  {
    category: "Congress",
    label: "Federal legislation",
    title: "Congress.gov",
    desc: "The authoritative federal source for bill text, actions, sponsors, committees, and legislative status.",
    href: "https://www.congress.gov/",
    cta: "Open Congress.gov",
  },
];

export const BILL_PREFIXES = [
  { prefix: "H.R.", meaning: "House bill", notes: "A bill introduced in the House of Representatives." },
  { prefix: "S.", meaning: "Senate bill", notes: "A bill introduced in the Senate." },
  { prefix: "H.Res.", meaning: "House simple resolution", notes: "Affects House rules or expresses House sentiment; does not go to the President." },
  { prefix: "S.Res.", meaning: "Senate simple resolution", notes: "Affects Senate rules or expresses Senate sentiment; does not go to the President." },
  { prefix: "H.Con.Res.", meaning: "House concurrent resolution", notes: "Involves both chambers; generally does not go to the President." },
  { prefix: "S.Con.Res.", meaning: "Senate concurrent resolution", notes: "Involves both chambers; generally does not go to the President." },
  { prefix: "H.J.Res.", meaning: "House joint resolution", notes: "If passed by both chambers, typically goes to the President, or can propose constitutional amendments." },
  { prefix: "S.J.Res.", meaning: "Senate joint resolution", notes: "Same idea as H.J.Res., introduced in the Senate." },
];

export const TERM_GROUPS = [
  {
    id: "committee-types",
    eyebrow: "Committees",
    title: "Committee types",
    intro: "Committees are usually grouped into a few core categories. These labels explain how a committee is formed and the type of work it handles.",
    terms: [
      { title: "Standing", body: "Permanent committees with legislative jurisdiction, hearings, oversight responsibilities, and bill development work." },
      { title: "Select / Special", body: "Often created to investigate, study, or focus on issues that cross jurisdictions or do not fit neatly into a standing committee." },
      { title: "Joint", body: "Committees made up of Members from both chambers, often focused on studies or administrative and oversight work." },
      { title: "Conference", body: "Temporary committees usually formed to reconcile House and Senate versions of a measure." },
    ],
  },
  {
    id: "congress-basics",
    eyebrow: "Congress basics",
    title: "Congress numbers and sessions",
    intro: "A Congress number groups time in the federal legislature. Each new Congress begins after a federal election cycle.",
    terms: [
      { title: "Congress number", body: "Example: H.R. 1234 (119th) means the bill was introduced during the 119th Congress." },
      { title: "How long it lasts", body: "A Congress lasts two years and is typically divided into two annual sessions. Bills usually do not carry over after a Congress ends." },
    ],
  },
  {
    id: "procedure-terms",
    eyebrow: "Procedure terms",
    title: "Common bill timeline terms",
    intro: "These are terms you’ll often see in actions, committee updates, and status timelines.",
    terms: [
      { title: "Reported", body: "A committee has finished considering a bill and sent it back to the full chamber with a recommendation." },
      { title: "Markup", body: "A committee session where members debate, amend, and revise legislation before deciding whether to advance it." },
      { title: "Cloture", body: "The Senate process used to end debate and move toward a vote. Bills can stall if cloture cannot be invoked." },
      { title: "Laid on the table", body: "A parliamentary action that sets aside a measure or motion without further debate." },
    ],
  },
  {
    id: "resolution-types",
    eyebrow: "Measures",
    title: "Resolutions and bill versions",
    intro: "Different measure types have different paths and legal effects.",
    terms: [
      { title: "Simple resolution", body: "Applies to one chamber and does not go to the President. Usually styled H.Res. or S.Res." },
      { title: "Concurrent resolution", body: "Involves both chambers and generally does not go to the President." },
      { title: "Joint resolution", body: "Functions more like a bill and typically goes to the President, or proposes constitutional amendments." },
      { title: "Engrossed vs. enrolled", body: "Engrossed includes amendments passed by one chamber. Enrolled is the final version passed by both chambers and sent to the President." },
    ],
  },
  {
    id: "presidential-actions",
    eyebrow: "Final actions",
    title: "Vetoes and reconciliation",
    intro: "Some process terms matter most near the end of a bill’s path or during budget-related packages.",
    terms: [
      { title: "Pocket veto", body: "Occurs when the President does not sign a bill and Congress adjourns before the bill can automatically become law." },
      { title: "Reconciliation", body: "A special budget-related process often used for major tax and spending legislation with clear budget impacts." },
    ],
  },
  {
    id: "bill-signals",
    eyebrow: "LL signals",
    title: "Impact and Trending",
    intro: "These are experimental indicators for scanning and sorting. They are not value judgments.",
    terms: [
      { title: "Impact", body: "A heuristic estimate of potential significance from 0 to 100." },
      { title: "Trending", body: "A heuristic estimate of current momentum or attention from 0 to 100." },
      { title: "How to use them", body: "Higher scores mean more signal, not good or bad. Always read the details and latest actions." },
    ],
  },
];

export const TOC_LINKS = [
  ["state-voting-lookup", "State voting resources"],
  ["official-resources", "Official links"],
  ["bill-prefixes", "Bill prefixes"],
  ["committee-types", "Committee types"],
  ["congress-basics", "Congress basics"],
  ["procedure-terms", "Procedure terms"],
  ["resolution-types", "Resolution types"],
  ["presidential-actions", "Final actions"],
  ["bill-signals", "Impact & Trending"],
];
