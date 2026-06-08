import clsx from "clsx";

export default function EntityEmptyState({
  icon = null,
  title = "Nothing to show",
  description = null,
  action = null,
  className = "",
}) {
  return (
    <div className={clsx("ll3-entityEmptyState", className)}>
      {icon ? <div className="ll3-entityEmptyState__icon" aria-hidden="true">{icon}</div> : null}
      <div className="ll3-entityEmptyState__body">
        {title ? <div className="ll3-entityEmptyState__title">{title}</div> : null}
        {description ? <p className="ll3-entityEmptyState__description">{description}</p> : null}
      </div>
      {action ? <div className="ll3-entityEmptyState__action">{action}</div> : null}
    </div>
  );
}
