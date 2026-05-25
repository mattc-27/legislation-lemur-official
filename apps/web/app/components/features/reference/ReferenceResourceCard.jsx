export default function ReferenceResourceCard({ item }) {
  return (
    <article className="ll3-refResourceCard" id={item.id}>
      <div className="ll3-refResourceCard__topline">
        <span>{item.label}</span>
        {item.category ? <em>{item.category}</em> : null}
      </div>
      <h3>{item.title}</h3>
      <p>{item.desc}</p>
      <a href={item.href} target="_blank" rel="noreferrer">{item.cta}</a>
    </article>
  );
}
