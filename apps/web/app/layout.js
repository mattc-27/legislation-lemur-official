import Script from "next/script";
import { Roboto, Roboto_Slab } from "next/font/google";
import GAListener from "@/app/components/ui/system/GAListener";

// import '../lib/stylesheets/layout.css';
// import '../lib/stylesheets/home-styles.css';
// import '../lib/stylesheets/refactored/ui-tokens.css';
// import '../lib/stylesheets/refactored/layout.refactored.css';
// import '../lib/stylesheets/refactored/home-styles.refactored.css';

import '@/app/styles/active/error-pages.ll3.css';
import '@/app/styles/active/layout.ll3.css';
import '@/app/styles/active/home.ll3.css';


import SiteHeader from "@/app/components/layouts/SiteHeader";
import SiteFooter from "@/app/components/layouts/SiteFooter";
import QuoteLogger from "@/app/components/ui/system/QuoteLogger";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;


const sans = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

const serif = Roboto_Slab({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-roboto-slab",
  display: "swap",
});

export const metadata = {
  title: "Legislation Lemur",
  description: "Stay informed without overwhelm. Legislation Lemur makes it easy to find your reps, track bills, and see who’s shaping the issues that matter most to you.",
};

export default function RootLayout({ children }) {
  return (

    <html lang="en" className={`ll3 ${sans.variable} ${serif.variable}`}>
      <head>
        {/* GA script loader */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body>
        <QuoteLogger /> {/* Logs once on client load */}
        <SiteHeader />
        <main className="site-main">
          {children}
        </main>
        <SiteFooter />
        {/* Listener for route changes */}
        <GAListener gaId={GA_MEASUREMENT_ID} />
      </body>
    </html>
  );
}
