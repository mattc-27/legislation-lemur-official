// components/layout/SiteFooter.jsx
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__brand">© {new Date().getFullYear()} Legislation Lemur</p>
        <nav className="site-footer__nav" aria-label="Footer links">
          <Link href="/privacy" className="site-footer__link">Privacy</Link>
          <Link href="/about" className="site-footer__link">About</Link>
        </nav>
      </div>
    </footer>
  );
}
