import type { Metadata } from "next";
import { getAllTags, getFeed } from "@/lib/paintings";
import { getSessionUserId } from "@/lib/current-user";
import { getHeartedIds } from "@/lib/hearts";
import Link from "next/link";
import { PaintingGrid } from "@/components/painting-grid";
import { LoadMoreLink } from "@/components/load-more-link";
import { FEED_MAX, FEED_PAGE_SIZE, feedShown } from "@/lib/feed";
import { FeedFilter } from "@/components/feed-filter";
import { getSiteUrl } from "@/lib/site-url";
import { SITE_DESCRIPTION } from "@/lib/seo";

export const metadata: Metadata = {
  title: "justpaint | A Painting Community for Beginners",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

// Names the site for search engines, so results can show "justpaint".
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "justpaint",
  alternateName: "just paint",
  url: getSiteUrl(),
  description: SITE_DESCRIPTION,
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; challenge?: string; shown?: string }>;
}) {
  const { tag, challenge, shown: shownParam } = await searchParams;
  const inChallenge = challenge === "october";
  // Load more links to the same feed with one more batch (?shown=12, 18...),
  // so every post is reachable by following links.
  const shown = feedShown(shownParam);
  const moreParams = new URLSearchParams();
  if (tag) moreParams.set("tag", tag);
  if (inChallenge) moreParams.set("challenge", "october");
  moreParams.set("shown", String(shown + FEED_PAGE_SIZE));
  const moreHref = `/?${moreParams}`;

  const [{ paintings, hasMore, total }, tags, userId] = await Promise.all([
    getFeed({ tag, octoberChallenge: inChallenge, limit: shown, withCount: Boolean(tag) }),
    getAllTags(),
    getSessionUserId(),
  ]);
  const heartedIds = userId
    ? await getHeartedIds(userId, paintings.map((p) => p.id))
    : undefined;
  const activeTag = tag ? tags.find((t) => t.slug === tag) : undefined;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mb-8 max-w-2xl sm:mb-10">
        <h1 className="font-heading text-4xl italic leading-none tracking-tight sm:text-5xl">
          JUST PAINT
        </h1>
        <p className="mt-3 text-muted-foreground">what did you paint today?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          a painting community for beginners.
        </p>
        <Link
          href="/october-challenge"
          className="mt-3 inline-block text-sm font-medium text-primary underline underline-offset-2 hover:decoration-2"
        >
          October Painting Challenge: rules and prompts &rarr;
        </Link>
      </div>

      <div className="mb-6">
        <FeedFilter challenge={inChallenge} tag={tag} />
      </div>

      {activeTag && (
        <p className="mb-5 text-sm text-muted-foreground">
          Showing <span className="text-foreground">{activeTag.name}</span>:{" "}
          {total} {total === 1 ? "piece" : "pieces"}
        </p>
      )}

      <PaintingGrid
        paintings={paintings}
        heartedIds={heartedIds}
        emptyHint={
          inChallenge
            ? "No October Painting Challenge entries yet. Post one and be the first."
            : undefined
        }
      />

      {hasMore && shown < FEED_MAX && (
        <div className="mt-10 flex justify-center">
          <LoadMoreLink href={moreHref} />
        </div>
      )}
    </main>
  );
}
