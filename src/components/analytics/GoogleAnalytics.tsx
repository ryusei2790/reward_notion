"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") {
      return;
    }

    const trackPageView = () => {
      window.gtag("event", "page_view", {
        page_path: `${window.location.pathname}${window.location.search}`,
        page_location: window.location.href,
        page_title: document.title,
      });
    };

    trackPageView();

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    const dispatchLocationChange = () => {
      window.dispatchEvent(new Event("locationchange"));
    };

    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      dispatchLocationChange();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(window.history, args);
      dispatchLocationChange();
    };

    window.addEventListener("popstate", dispatchLocationChange);
    window.addEventListener("locationchange", trackPageView);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", dispatchLocationChange);
      window.removeEventListener("locationchange", trackPageView);
    };
  }, []);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: false
          });
        `}
      </Script>
    </>
  );
}
