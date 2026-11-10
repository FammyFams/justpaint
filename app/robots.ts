import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

// SEO tools that map the web for their own customers. They send no visitors,
// and walking every old post rebuilds pages nobody else is looking at: about
// a quarter of the server work in the week of 2026-11-04. Search engines and
// link previews aren't listed.
const SEO_TOOL_CRAWLERS = ["AhrefsBot", "SemrushBot", "SERankingBacklinksBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/auth/"] },
      { userAgent: SEO_TOOL_CRAWLERS, disallow: "/" },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
