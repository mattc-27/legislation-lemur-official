import ReferenceTermCard from "./ReferenceTermCard";

export default function ReferenceTermGroup({ group }) {
  return (
    <article className="ll3-refPanel" id={group.id}>
      <div className="ll3-ref__eyebrow">{group.eyebrow}</div>
      <h3 className="ll3-refPanel__title">{group.title}</h3>
      {group.intro ? <p className="ll3-refPanel__copy">{group.intro}</p> : null}
      <div className="ll3-refTermGrid">
        {group.terms.map((term) => (
          <ReferenceTermCard title={term.title} body={term.body} key={term.title} />
        ))}
      </div>
    </article>
  );
}
