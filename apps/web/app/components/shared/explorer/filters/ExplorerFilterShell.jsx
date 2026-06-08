import ExplorerSidePanel from "@/app/components/shared/explorer/ExplorerSidePanel";

export default function ExplorerFilterShell({
  variant = "sidebar",
  title = "Filters",
  description = "Narrow results using the options below.",
  sectionLabel,
  children,
  id,
  className = "",
}) {
  if (variant === "sidebar") {
    return (
      <ExplorerSidePanel
        id={id}
        title={title}
        description={description}
        sectionLabel={sectionLabel}
        className={["ll3-filterShell", "ll3-filterShell--sidebar", className]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="ll3-filterPanel">{children}</div>
      </ExplorerSidePanel>
    );
  }

  return (
    <div
      id={id}
      className={["ll3-filterShell", `ll3-filterShell--${variant}`, className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="ll3-filterPanel">
        {(title || description) ? (
          <div className="ll3-filterPanel__head">
            {title ? <h2 className="ll3-filterPanel__title">{title}</h2> : null}
            {description ? (
              <p className="ll3-filterPanel__description">{description}</p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}