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
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Vercel's free plan includes 5,000 image resizes a month, and a resize is
    // redone whenever its cached copy expires. A painting's image never
    // changes (each upload gets a new file name), so keep resized copies for
    // 31 days instead of the default 4 hours.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    // Fewer widths means fewer resizes per painting. Stored images are at
    // most 1600px, so the default 1920-3840 widths would only repeat 1600.
    deviceSizes: [640, 828, 1080, 1200, 1600],
    imageSizes: [48, 96, 256],
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
