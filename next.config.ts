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
    ];
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
    // Vercel's free plan includes 5,000 image resizes a month, and a resize is
    // redone whenever its cached copy expires. A painting's image never
    // changes (each upload gets a new file name), so keep resized copies for
    // 31 days instead of the default 4 hours.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    // Every width here is one more resize per painting (each screen asks for
    // the closest width, and each new width is a resize), so keep the list
    // short. Paintings use 1600 as the stored file itself (PaintingImage's
    // loader), so Vercel only resizes them to 256 and 640.
    deviceSizes: [640, 1600],
    imageSizes: [256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ptiwywmprtiardksjgad.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
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
