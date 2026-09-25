import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
      // Uploads allow images up to 10MB (see lib/validations/painting.ts);
      // the framework default of 1MB silently rejects the request before it
      // ever reaches our Server Action, which is exactly big enough to bite
      // real phone-camera photos. Leave headroom for multipart overhead.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
