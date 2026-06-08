import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__outer">
        <div className="site-footer__top">
          <div className="site-footer__brandblock">
            <div className="site-footer__brandmark">Legislation Lemur</div>
            <p className="site-footer__tagline">
              Neutral, readable civic data for exploring Congress with more clarity.
            </p>
          </div>

          <div className="site-footer__grid">
            <div className="site-footer__col">
              <h3 className="site-footer__heading">Explore</h3>
              <nav className="site-footer__links" aria-label="Explore footer links">
                <Link href="/search" className="site-footer__link">
                  Representatives
                </Link>
                <Link href="/bills" className="site-footer__link">
                  Bills
                </Link>
                <Link href="/committees" className="site-footer__link">
                  Committees
                </Link>
              </nav>
            </div>

            <div className="site-footer__col">
              <h3 className="site-footer__heading">Resources</h3>
              <nav className="site-footer__links" aria-label="Resource footer links">
                <Link href="/references" className="site-footer__link">
                  Reference / Wiki
                </Link>
                <Link href="/about" className="site-footer__link">
                  About
                </Link>
                <Link href="/privacy" className="site-footer__link">
                  Privacy
                </Link>
              </nav>
            </div>

            <div className="site-footer__col">
              <h3 className="site-footer__heading">Platform</h3>
              <div className="site-footer__links">
                <span className="site-footer__text">Weekly data refresh cadence</span>
                <span className="site-footer__text">Readable congressional profiles</span>
                <span className="site-footer__text">Neutral, source-aware presentation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__copyright">
            © {year} Legislation Lemur. All rights reserved.
          </p>

          <nav className="site-footer__legal" aria-label="Legal footer links">
            <Link href="/privacy" className="site-footer__link">
              Privacy Policy
            </Link>
            <Link href="/about" className="site-footer__link">
              About
            </Link>
          </nav>
        </div>
      </div>
    </footer >
  );
}