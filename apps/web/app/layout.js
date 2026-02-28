import { Suspense } from "react";
import Script from "next/script";
import { Roboto, Roboto_Slab } from "next/font/google";
import GAListener from "@/app/components/ui/system/GAListener";
// import { Toaster } from "react-hot-toast";
// import '../lib/stylesheets/layout.css';
// import '../lib/stylesheets/home-styles.css';
// import '../lib/stylesheets/refactored/ui-tokens.css';
// import '../lib/stylesheets/refactored/layout.refactored.css';
// import '../lib/stylesheets/refactored/home-styles.refactored.css';

import SiteHeader from "@/app/components/layouts/SiteHeader";
import SiteFooter from "@/app/components/layouts/SiteFooter";
import QuoteLogger from "@/app/components/ui/system/QuoteLogger";


import '@/app/styles/active/core/ll3.tokens.css';
import '@/app/styles/active/core/ll3.base.css';
import '@/app/styles/active/core/ll3.layout.css';
import '@/app/styles/active/core/ll3.primitives.css';
import '@/app/styles/active/core/ll3.utilities.css';
import '@/app/styles/active/core/ll3.shell.css';

import '@/app/styles/active/error-pages.ll3.css';




// import RouteLoadingToastClient from "@/app/components/ui/system/RouteLoadingToastClient";
// import RouteToastClient from "@/app/components/ui/system/RouteToastClient";
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

  const gaId = GA_MEASUREMENT_ID;
  return (

    <html lang="en" className={`ll3 ${sans.variable} ${serif.variable}`}>
      <body>
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { send_page_view: false });
              `}
            </Script>

            <Suspense fallback={null}>
              <GAListener gaId={gaId} />
            </Suspense>
          </>
        ) : null}
        <QuoteLogger />

        <SiteHeader />
        <main className="site-main">{children}</main>
        <SiteFooter />

        {/*   <RouteLoadingToastClient />
      <RouteToastClient /> 

        <Toaster
          position="bottom-center"
          gutter={10}
          toastOptions={{
            duration: 2800,
            style: { background: "transparent", boxShadow: "none", padding: 0 },
          }}
        />*/}
      </body>
    </html>
  );
}
