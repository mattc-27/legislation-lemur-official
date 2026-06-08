export default function ExplorerPageShell({ as: As = "main", variant = "", className = "", children }) {
  return <As className={["ll3-explorerPage", variant ? `ll3-explorerPage--${variant}` : "", className].filter(Boolean).join(" ")}>{children}</As>;
}
