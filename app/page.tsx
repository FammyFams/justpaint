import type { Metadata } from "next";
import { getAllTags, getFeed } from "@/lib/paintings";
import { getSessionUserId } from "@/lib/current-user";
import { getHeartedIds } from "@/lib/hearts";
import Link from "next/link";
import { HomeFeed } from "@/components/home-feed";
import { feedShown } from "@/lib/feed";
import { FeedFilter } from "@/components/feed-filter";
import { getSiteUrl } from "@/lib/site-url";
import { SITE_DESCRIPTION } from "@/lib/seo";
import { CHALLENGE_NAME } from "@/lib/october-challenge";

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
  // ?shown=N is what the Load more link points search engines at; visitors
  // load more in place and keep the plain address.
  const shown = feedShown(shownParam);

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
          {CHALLENGE_NAME}: rules and prompts &rarr;
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

      <HomeFeed
        // Start over when the filter changes.
        key={`${tag ?? ""}|${inChallenge}`}
        initialPaintings={paintings}
        initialHeartedIds={heartedIds}
        initialHasMore={hasMore}
        tag={tag}
        octoberChallenge={inChallenge}
        emptyHint={
          inChallenge
            ? `No ${CHALLENGE_NAME} entries yet. Post one and be the first.`
            : undefined
        }
      />
    </main>
  );
}
