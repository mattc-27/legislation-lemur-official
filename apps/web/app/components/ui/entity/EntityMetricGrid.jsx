import clsx from "clsx";

/**
 * Shared responsive metric-card grid.
 */
export default function EntityMetricGrid({
  columns = "auto",
  className = "",
  children,
  ...props
}) {
  return (
    <div
      className={clsx(
        "ll3-entityMetricGrid",
        columns !== "auto" && `ll3-entityMetricGrid--${columns}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
