import clsx from "clsx";

/**
 * Shared header row for cards/sections.
 *
 * Supports either simple string title or custom title node.
 */
export default function EntityCardHeader({
  eyebrow = null,
  title = null,
  description = null,
  meta = null,
  action = null,
  icon = null,
  headingLevel = 3,
  className = "",
  titleClassName = "",
  children,
}) {
  const Heading = `h${headingLevel}`;

  return (
    <header className={clsx("ll3-entityCardHeader", className)}>
      <div className="ll3-entityCardHeader__main">
        {eyebrow ? <div className="ll3-entityCardHeader__eyebrow">{eyebrow}</div> : null}

        {title ? (
          <div className="ll3-entityCardHeader__titleRow">
            {icon ? <span className="ll3-entityCardHeader__icon" aria-hidden="true">{icon}</span> : null}
            {typeof title === "string" ? (
              <Heading className={clsx("ll3-entityCardHeader__title", titleClassName)}>
                {title}
              </Heading>
            ) : (
              title
            )}
          </div>
        ) : null}

        {description ? (
          <p className="ll3-entityCardHeader__description">{description}</p>
        ) : null}

        {children}
      </div>

      {(meta || action) ? (
        <div className="ll3-entityCardHeader__aside">
          {meta ? <div className="ll3-entityCardHeader__meta">{meta}</div> : null}
          {action ? <div className="ll3-entityCardHeader__action">{action}</div> : null}
        </div>
      ) : null}
    </header>
  );
}
