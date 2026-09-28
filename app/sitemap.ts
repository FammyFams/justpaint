import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { getSitemapPaintings } from "@/lib/paintings";

// Rebuilt at most once an hour, so new paintings show up without a redeploy.
export const revalidate = 3600;

// The public pages worth finding from a search engine, plus every painting,
// so search engines find all of them even though the feed loads in batches.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const pages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/october-challenge`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/upload`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // If Supabase is down, still serve the pages above rather than an error.
  const paintings = await getSitemapPaintings().catch((error) => {
    console.error("sitemap paintings failed", error);
    return [];
  });
  return [
    ...pages,
    ...paintings.map((p) => ({
      url: `${base}/painting/${p.id}`,
      lastModified: p.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
