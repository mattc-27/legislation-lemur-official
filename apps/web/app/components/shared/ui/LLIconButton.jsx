export default function LLIconButton({ as: As = "button", label, size = "md", variant = "secondary", className = "", children, ...props }) {
  return (
    <As className={["ll3-iconBtn", `ll3-iconBtn--${variant}`, size === "sm" ? "ll3-iconBtn--sm" : "", className].filter(Boolean).join(" ")} aria-label={label} title={label} {...props}>
      {children}
    </As>
  );
}
