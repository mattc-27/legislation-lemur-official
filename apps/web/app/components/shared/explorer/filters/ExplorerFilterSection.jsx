export default function ExplorerFilterSection({ icon: Icon, title, hint, defaultOpen = true, children }) {
  return (
    <details className="ll3-filterSection" open={defaultOpen}>
      <summary>
        <span className="ll3-filterSection__titleWrap">{Icon ? <span className="ll3-filterSection__icon"><Icon size={14} aria-hidden="true" /></span> : null}<span className="ll3-filterSection__title">{title}</span></span>
        {hint ? <span className="ll3-filterSection__hint">{hint}</span> : null}
      </summary>
      <div className="ll3-filterSection__body">{children}</div>
    </details>
  );
}
