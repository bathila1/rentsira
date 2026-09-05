import type { NextConfig } from "next";

/**
 * Content Security Policy.
 *
 * `script-src` keeps 'unsafe-inline'/'unsafe-eval' because Next.js injects
 * inline bootstrap scripts. Locking those down properly needs a per-request
 * nonce, which forces every page to render dynamically and would undo the
 * caching work elsewhere in this app. Restricting the *hosts* scripts may load
 * from still blocks the main injection routes, so this is the useful trade.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // fonts.googleapis.com serves the Syne + DM Sans stylesheet, and the font
  // files themselves come from fonts.gstatic.com. Both must be allowed or the
  // brand typography silently falls back to the system sans-serif.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Vehicle photos live in Supabase storage; placehold.co and jsdelivr are used
  // for fallback/OG artwork.
  "img-src 'self' data: blob: https://*.supabase.co https://placehold.co https://cdn.jsdelivr.net",
  // Supabase REST + realtime.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  // The vehicle detail page embeds a Google Maps preview.
  "frame-src https://maps.google.com https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Belt and braces with frame-ancestors above, for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // Geolocation stays enabled for the "Nearby Vehicles" feature.
    value:
      "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // Do not advertise the framework version to attackers.
  poweredByHeader: false,
  compress: true,

  images: {
    // Uploaded SVGs could otherwise carry scripts; the per-image CSP below is
    // the documented mitigation and sandboxes them.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
    // Vehicle photos never change once uploaded, so cache the optimised
    // derivatives hard (30 days) instead of re-encoding them constantly.
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        port: "",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
