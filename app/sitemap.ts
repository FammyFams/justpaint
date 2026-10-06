import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { getSitemapPaintings } from "@/lib/paintings";
import { artistHref } from "@/lib/artist-url";

// Rebuilt at most once an hour, so new paintings show up without a redeploy.
export const revalidate = 3600;

// The public pages worth finding from a search engine, plus every painting
// and every artist who has posted, so search engines find all of them even
// though the feed loads in batches.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const pages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/october-challenge`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/upload`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/accessibility`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // If Supabase is down, still serve the pages above rather than an error.
  const paintings = await getSitemapPaintings().catch((error) => {
    console.error("sitemap paintings failed", error);
    return [];
  });

  // Paintings come newest first, so an artist's first one is their latest
  // post. Profiles with no posts are left out: an empty page isn't worth
  // indexing.
  const artists = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const p of paintings) {
    if (!p.artist || artists.has(p.artist.id)) continue;
    artists.set(p.artist.id, {
      url: `${base}${artistHref(p.artist)}`,
      lastModified: p.createdAt,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  return [
    ...pages,
    ...paintings.map((p) => ({
      url: `${base}/painting/${p.id}`,
      lastModified: p.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...artists.values(),
  ];
}
