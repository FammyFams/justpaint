import type { NextConfig } from "next";

// Sent with every page. The CSP here only covers what can't break the site
// (framing, plugins, <base>, form targets); a full script CSP would need
// nonces for Next's inline scripts and Google Analytics.
const securityHeaders = [
  // Nobody can load the site inside a frame, which blocks clickjacking of
  // the login, delete and admin buttons.
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The logo and tab icons were sent with "max-age=0", so every page
      // load asked Vercel again whether they'd changed (about 950 requests
      // a day). Browsers now keep them for a week; a new logo can take
      // that long to reach everyone.
      ...["/logo.jpg", "/icon.png", "/apple-icon.png", "/favicon.ico"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      })),
      // Tells iPhones which justpaint.art links open the justPaint Art app,
      // and lets them offer passwords saved for the site in the app. A static
      // file; Apple wants it served as JSON (it has no file extension).
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ];
  },
  async rewrites() {
    // The home feed is cached at / (all posts) and /feed/october (the
    // October tab), and built per request at /feed for a tag or a longer
    // list. Visitors keep seeing / with its query in the address bar.
    // Link to these with a plain <a>, never <Link>: Next's router treats any
    // /?query as the home page it already has and never asks the server, so
    // the rewrite doesn't run (the October tab click did nothing).
    return {
      beforeFiles: [
        { source: "/", has: [{ type: "query", key: "tag" }], destination: "/feed" },
        { source: "/", has: [{ type: "query", key: "shown" }], destination: "/feed" },
        {
          source: "/",
          has: [{ type: "query", key: "challenge", value: "october" }],
          destination: "/feed/october",
        },
      ],
    };
  },
  async redirects() {
    // www served a second copy of every page; send it to the one address
    // search engines should index.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.justpaint.art" }],
        destination: "https://justpaint.art/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    // Paintings are stored at exactly these widths (lib/painting-sizes.ts)
    // and PaintingImage loads them straight from Supabase. Vercel's resizer
    // isn't used: its free plan counts every view of a resized copy. Supabase
    // isn't in remotePatterns on purpose, so a painting shown with a plain
    // <Image> fails loudly instead of quietly going through the resizer.
    deviceSizes: [640, 1600],
    imageSizes: [256],
  },
  experimental: {
    serverActions: {
      // Photos can be up to 4 MB (MAX_IMAGE_BYTES in lib/validations/painting.ts);
      // the framework default of 1MB would silently reject bigger ones before
      // they reach our Server Action. Matches Vercel's own 4.5 MB request cap,
      // so anything larger fails the same way locally as it does in production.
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
