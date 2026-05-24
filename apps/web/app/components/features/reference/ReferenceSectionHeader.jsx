export default function ReferenceSectionHeader({ eyebrow, title, children, id }) {
  return (
    <div className="ll3-ref__sectionHead">
      {eyebrow ? <div className="ll3-ref__eyebrow">{eyebrow}</div> : null}
      <h2 className="ll3-ref__sectionTitle" id={id}>{title}</h2>
      {children ? <p className="ll3-ref__sectionSub">{children}</p> : null}
    </div>
  );
}
