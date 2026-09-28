import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

// The public pages worth finding from a search engine. Individual paintings
// aren't listed; crawlers reach them from the feed.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/october-challenge`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/upload`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
