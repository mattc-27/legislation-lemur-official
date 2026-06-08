export default function ExplorerContentGrid({ children, wideSidebar = false, className = "" }) {
  return <section className={["ll3-explorerContentGrid", wideSidebar ? "ll3-explorerContentGrid--wideSidebar" : "", className].filter(Boolean).join(" ")}>{children}</section>;
}
