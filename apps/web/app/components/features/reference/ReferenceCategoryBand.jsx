const CATEGORIES = [
  ["Voting", "Voting resources", "Registration, status checks, absentee voting, and election office links."],
  ["Bills", "Bill tracking basics", "Prefixes, status labels, and terms that appear in bill timelines."],
  ["Committees", "Committee reference", "Standing, select, special, joint, and conference committee language."],
  ["Signals", "LL methodology notes", "How to read experimental signals like impact and trending without over-interpreting them."],
];

export default function ReferenceCategoryBand() {
  return (
    <section className="ll3-refCategories" aria-label="Reference categories">
      {CATEGORIES.map(([label, title, desc]) => (
        <article className="ll3-refCategories__card" key={title}>
          <div>{label}</div>
          <h2>{title}</h2>
          <p>{desc}</p>
        </article>
      ))}
    </section>
  );
}
