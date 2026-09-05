import type { Metadata, Viewport } from "next";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, organizationJsonLd, websiteJsonLd } from "@/utils/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Do not block zoom — pinch-zoom is an accessibility requirement.
  maximumScale: 5,
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  // Required so relative Open Graph / canonical URLs resolve to absolute ones.
  metadataBase: new URL(SITE_URL),

  /**
   * Titles are written for how people actually search ("rent a car in
   * colombo"), not to promote the brand. The template deliberately carries no
   * brand suffix: on a title Google truncates around 60 characters, and for a
   * site nobody is searching by name yet, those characters are worth far more
   * spent on the query itself.
   */
  title: {
    default:
      "Rent a Car in Sri Lanka — Cars, Vans & SUVs With or Without Driver",
    template: "%s",
  },

  description:
    "Rent a car, van, SUV or bus anywhere in Sri Lanka. Compare daily rates from local owners in all 25 districts, with or without a driver. Call the owner directly — no booking fee.",

  applicationName: "Renta.lk",

  alternates: {
    canonical: "/",
  },

  // Meta keywords carry no weight with Google, so this is kept short rather
  // than the several-hundred-entry list it replaced (which shipped on every
  // single response). Real keyword targeting happens in the titles, headings
  // and body copy of each page.
  keywords: [
    "rent a car Sri Lanka",
    "vehicle rental Sri Lanka",
    "car hire Sri Lanka",
    "van for rent Sri Lanka",
    "wedding car hire Sri Lanka",
    "rent a car with driver",
    "self drive car rental Sri Lanka",
  ],

  openGraph: {
    siteName: "Renta.lk",
    locale: "en_LK",
    type: "website",
    url: SITE_URL,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  formatDetection: {
    // Phone numbers are the primary call-to-action, so let mobile browsers
    // linkify them.
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-LK">
      <head>
        {/*
          Syne + DM Sans, exactly as the original design loaded them.

          These are the brand faces, so they stay on Google Fonts rather than
          going through next/font, which renders them slightly differently.
          Loading them as a <link> here instead of an @import inside
          globals.css still avoids the extra chained request an @import costs:
          the browser can start fetching the CSS immediately rather than
          waiting to parse our stylesheet first.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap"
        />

        {/* Warm up the connection to Supabase before the first image request. */}
        <link rel="preconnect" href="https://rnycdhqmupnarzoduoul.supabase.co" />

        {/*
          Scroll-reveal blocks start at opacity:0 and are shown by JavaScript.
          Without this fallback, a visitor whose JS fails to load would see a
          blank page rather than an unanimated one.
        */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        {children}
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}
