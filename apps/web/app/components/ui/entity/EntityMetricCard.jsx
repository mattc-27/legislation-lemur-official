import clsx from "clsx";

/**
 * Shared stat/metric card.
 *
 * Useful for:
 * - bill impact/momentum cards
 * - vote alignment stat cards
 * - member summary facts
 */
export default function EntityMetricCard({
  icon = null,
  label,
  value,
  hint = null,
  tone = "neutral",
  orientation = "horizontal",
  className = "",
  children,
  ...props
}) {
  return (
    <div
      className={clsx(
        "ll3-entityMetricCard",
        `ll3-entityMetricCard--${tone}`,
        orientation === "vertical" && "ll3-entityMetricCard--vertical",
        className
      )}
      title={typeof hint === "string" ? hint : undefined}
      {...props}
    >
      {icon ? <div className="ll3-entityMetricCard__icon" aria-hidden="true">{icon}</div> : null}

      <div className="ll3-entityMetricCard__body">
        {label ? <div className="ll3-entityMetricCard__label">{label}</div> : null}
        {value != null ? <div className="ll3-entityMetricCard__value">{value}</div> : null}
        {hint && typeof hint !== "string" ? (
          <div className="ll3-entityMetricCard__hint">{hint}</div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
