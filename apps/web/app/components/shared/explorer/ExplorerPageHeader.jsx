import ExplorerToolLinks from "@/app/components/shared/navigation/ExplorerToolLinks";

export default function ExplorerPageHeader({ eyebrow, title, titleMeta, description, activeTool, asOfText, actions = null, children, className = "" }) {
  return (
    <header className={["ll3-explorerHeader", className].filter(Boolean).join(" ")}>
      <div className="ll3-explorerHeader__top">
        <div className="ll3-explorerHeader__copy">
          {eyebrow ? <div className="ll3-explorerHeader__eyebrow">{eyebrow}</div> : null}
          <div className="ll3-explorerHeader__titleRow">
            <h1 className="ll3-explorerHeader__title">{title}</h1>
            {titleMeta ? <><span className="ll3-explorerHeader__sep" aria-hidden="true">|</span><span className="ll3-explorerHeader__titleMeta">{titleMeta}</span></> : null}
          </div>
          {description ? <p className="ll3-explorerHeader__description">{description}</p> : null}
          {activeTool ? <ExplorerToolLinks active={activeTool} /> : null}
          {children}
        </div>
        <div className="ll3-explorerHeader__meta">
          {asOfText ? <span className="ll3-explorerHeader__freshness">Data current as of <strong className="ll3-strong">{asOfText}</strong></span> : null}
          {actions}
        </div>
      </div>
    </header>
  );
}
