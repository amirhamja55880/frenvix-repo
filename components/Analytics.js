"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useSite } from "./SiteProvider";
import { track } from "@/lib/track";

// Loads Google Analytics 4 and the Meta Pixel. Never runs inside the admin panel.
export default function Analytics() {
  const { gaId, pixelId } = useSite();
  const path = usePathname() || "/";
  const admin = path.startsWith("/admin");
  const first = useRef(true);

  useEffect(() => {
    if (admin || (!gaId && !pixelId)) return;
    // The first page view is sent after the scripts load (see below); later page changes are sent here.
    if (first.current) { first.current = false; return; }
    track.pageView(window.location.href);
  }, [path, admin, gaId, pixelId]);

  if (admin) return null;
  return (
    <>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(){dataLayer.push(arguments);};
            gtag('js', new Date());
            gtag('config', '${gaId}', { send_page_view: false });
            gtag('event', 'page_view', { page_location: window.location.href });
          `}</Script>
        </>
      )}
      {pixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}</Script>
      )}
    </>
  );
}
