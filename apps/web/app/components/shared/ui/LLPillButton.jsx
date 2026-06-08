export default function LLPillButton({ as: As = "button", active = false, className = "", children, ...props }) {
  return <As className={["ll3-pillBtn", active ? "is-active" : "", className].filter(Boolean).join(" ")} {...props}>{children}</As>;
}
