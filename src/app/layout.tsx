import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import "/public/assets/styles/index.scss";
import { Providers } from "@/utils/providers";
import { ModalContextController } from "../features/modals/ModalContextController";
import { ModalController } from "../features/modals/ModalController";
import { ToastContainer } from "react-toastify";
import { MainLayout } from "@/layout/MainLayout";
import Script from "next/script";
import CommonEvent from "@/components/common-event";

export const metadata: Metadata = {
  title: "Invictus",
  description: "Invictus — allocation infrastructure for stablecoin balances"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const showAnalytics = process.env.NEXT_PUBLIC_NEED_ANALYTICS === "true";

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {showAnalytics && (
          <>
            <Script
              strategy="afterInteractive"
              // G-2098CC33P7
              // src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
              src={`https://www.googletagmanager.com/gtag/js?id=G-3F7178H2MV`}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-3F7178H2MV', {
                    page_path: window.location.pathname,
                    });
                  `
              }}
            />
          </>
        )}
        {/* <Script
          id="gtm-head"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PTPS7F67');
          `
          }}
        /> */}
      </head>
      <body id="App_visited">
        {/* Apply the saved colour mode before paint (same storage key Chakra uses). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var m=localStorage.getItem('chakra-ui-color-mode');if(m!=='light'&&m!=='dark')m='dark';var d=document.documentElement;d.dataset.theme=m;d.style.colorScheme=m;}catch(e){}"
          }}
        />
        {/* <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PTPS7F67"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript> */}

        <Providers>
          {showAnalytics && <CommonEvent />}
          <MainLayout>{children}</MainLayout>
          <ModalContextController />
          <ModalController />
          <ToastContainer
            position="top-right"
            autoClose={false}
            hideProgressBar
            closeOnClick
            pauseOnHover={false}
            draggable={false}
          />
        </Providers>
      </body>
    </html>
  );
}
